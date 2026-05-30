/* ==========================================================================
   Learning English - Application Engine (JavaScript Core)
   ========================================================================== */



// --- GLOBAL APPLICATION STATE ---
let state = {
    vocabulary: [],
    customWords: [],
    streak: 0,
    lastStudyDate: '',
    quizStats: {
        totalAnswered: 0,
        correctAnswers: 0
    },
    userLevel: 'A1',  // Default is 'A1' (lowest level)
    lastTestScore: 0,       // Default placement test score is 0
    placementStats: { grammar: 0, reading: 0, vocab: 0, listening: 0 }, // Sectional scores
    roadmapTasks: [],    // Daily checklist tasks { text, completed }
    stars: 0,            // Gamification Gold Stars ⭐
    currentUserEmail: '', // Authenticated user email
    displayName: '',      // Authenticated user displayName
    photoURL: '',         // Selected profile photoURL or custom animal emoji
    googlePhotoURL: '',   // Google authenticating user photoURL
    completedLessons: [], // Completed grammar lesson IDs
    completedSentences: [], // Completed communicative sentence english string IDs
    stories_done: [],      // Completed reading stories
    writingHighScores: {}, // Store highest score reached on each writing topic permanently!
    currentWotd: null      // Selected Word of the Day
};

// Flashcard Deck study state
let flashcardDeck = [];
let currentCardIndex = 0;
let isCardFlipped = false;

// Quiz state
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let quizTimer = { start: 0, end: 0 };
let quizSelectedCategory = 'all';

// Grammar state
let currentGrammarLesson = null;
let grammarPracticeIndex = 0;
let grammarPracticeScore = 0;

// Cloud synchronization state
let isCloudMode = false;
let authSkip = false;

// --- CORE UTILITY FUNCTIONS ---
// Load data from IndexedDB & Firestore
async function loadStateAsync() {
    try {
        console.log('Initializing App Data...');
        await LearningDB.initDB();

        // --- ------------------------------------------------------- ---
        // LAZY MIGRATION: Initialize all massive academic lists to [] on start
        // These will be loaded on demand when the user clicks each section.
        // --- ------------------------------------------------------- ---
        window.PLACEMENT_QUESTIONS = [];
        window.GRAMMAR_LESSONS = [];
        window.STORIES_DATA = [];
        window.COMMUNICATIVE_SENTENCES = [];
        window.PODCAST_DATA = [];
        window.TRANSLATION_DATA = [];
        window.LONG_TRANSLATION_DATA = [];

        // 1. Migrate old localStorage data if present
        await LearningDB.migrateFromLocalStorage();

        // 2. Load global academic index
        if (window.FirebaseSync) {
            window.ACADEMIC_INDEX = await window.FirebaseSync.fetchAcademicIndex();
        }

        // 3. Load vocabulary asynchronously in the background so it doesn't block the initial page render
        state.vocabulary = [];
        state.isVocabLoaded = false;
        (async () => {
            try {
                console.log("Loading vocabulary database in the background...");
                state.vocabulary = await LearningDB.getAllVocab();
                state.isVocabLoaded = true;
                console.log(`Background loaded ${state.vocabulary.length} unique words successfully.`);
                
                // If the user is currently on the dashboard, re-render the dashboard to populate vocabulary numbers
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab && activeTab.id === 'dashboard-tab') {
                    renderDashboard();
                }
            } catch (e) {
                console.error("Failed to load vocabulary in the background:", e);
            }
        })();

        // 4. Load other progress variables from progress store
        state.customWords = await LearningDB.getProgress('custom_words', []);
        state.streak = await LearningDB.getProgress('streak', 0);
        state.lastStudyDate = await LearningDB.getProgress('last_study_date', '');
        state.quizStats = await LearningDB.getProgress('quiz_stats', { totalAnswered: 0, correctAnswers: 0 });
        state.userLevel = await LearningDB.getProgress('user_level', 'A1');
        if (state.userLevel === 'Beginner' || !state.userLevel) {
            state.userLevel = 'A1';
        } else if (state.userLevel === 'Intermediate') {
            state.userLevel = 'B1';
        } else if (state.userLevel === 'Advanced') {
            state.userLevel = 'C1';
        }
        state.lastTestScore = await LearningDB.getProgress('last_test_score', 0);
        state.placementStats = await LearningDB.getProgress('placement_stats', { grammar: 0, reading: 0, vocab: 0, listening: 0 });
        state.stars = await LearningDB.getProgress('stars', 0);
        state.photoURL = await LearningDB.getProgress('photo_url', '');
        state.displayName = await LearningDB.getProgress('display_name', '');
        state.completedLessons = await LearningDB.getProgress('completed_lessons', []);
        state.completedSentences = await LearningDB.getProgress('completed_sentences', []);
        state.stories_done = await LearningDB.getProgress('stories_done', []);
        state.writingHighScores = await LearningDB.getProgress('writing_high_scores', {});
        storiesState.completedStories = state.stories_done;
        
        const storedRoadmap = await LearningDB.getProgress('roadmap_tasks', null);
        if (storedRoadmap) {
            state.roadmapTasks = storedRoadmap;
        } else {
            state.roadmapTasks = generateRoadmapTasks(state.userLevel);
            await saveStatsToStorage();
        }

        // Keep localStorage for legacy or PWA basic indicators only
        localStorage.setItem('vocabflow_user_level', state.userLevel);
        localStorage.setItem('vocabflow_stars', state.stars.toString());
        localStorage.setItem('vocabflow_display_name', state.displayName);
        localStorage.setItem('vocabflow_photo_url', state.photoURL);
        
        // Immediately update sidebar UI on load
        updateSidebarStreakUI();
        trackDailyActivity('init', 0);

    } catch (e) {
        console.error('Error reading IndexedDB database, falling back to LocalStorage', e);
        // Fallback in case of absolute failure
        state.vocabulary = [];
        state.customWords = [];
        state.completedLessons = [];
        state.completedSentences = [];
        state.userLevel = 'Beginner';
        state.lastTestScore = 0;
        state.roadmapTasks = typeof generateRoadmapTasks === 'function' ? generateRoadmapTasks('Beginner') : [];
    }
}

// Save helpers
async function saveVocabToStorage() {
    // Only bulk save in IndexedDB if really needed. 
    // Usually we update single words on-the-fly, but keeping this helper for global sync
    await LearningDB.bulkUpdateVocab(state.vocabulary);
}

// Update single word in DB
async function updateWordInDB(wordObj) {
    try {
        await LearningDB.updateVocabWord(wordObj);
    } catch (e) {
        console.error('Failed to update word in IndexedDB', e);
    }
}

// Save custom words
async function saveCustomWordsToStorage() {
    await LearningDB.setProgress('custom_words', state.customWords);
}

async function saveStatsToStorage() {
    await LearningDB.setProgress('streak', state.streak);
    await LearningDB.setProgress('last_study_date', state.lastStudyDate);
    await LearningDB.setProgress('quiz_stats', state.quizStats);
    await LearningDB.setProgress('user_level', state.userLevel);
    await LearningDB.setProgress('last_test_score', state.lastTestScore);
    await LearningDB.setProgress('placement_stats', state.placementStats);
    await LearningDB.setProgress('roadmap_tasks', state.roadmapTasks);
    await LearningDB.setProgress('stars', state.stars);
    await LearningDB.setProgress('photo_url', state.photoURL);
    await LearningDB.setProgress('display_name', state.displayName);
    await LearningDB.setProgress('completed_lessons', state.completedLessons);
    await LearningDB.setProgress('completed_sentences', state.completedSentences);
    await LearningDB.setProgress('stories_done', state.stories_done);
    await LearningDB.setProgress('writing_high_scores', state.writingHighScores);

    // Keep localStorage in sync for basic visual items
    localStorage.setItem('vocabflow_user_level', state.userLevel);
    localStorage.setItem('vocabflow_stars', state.stars.toString());
    localStorage.setItem('vocabflow_display_name', state.displayName);
    localStorage.setItem('vocabflow_photo_url', state.photoURL);
    
    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        await window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL, state.displayName);
    }
}

// Browser Text-To-Speech Pronunciation Engine
function speakEnglish(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any currently speaking voice
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85; // Slightly slower for language learners
        utterance.pitch = 1.0;

        // Try to pick a natural-sounding English voice
        const voices = window.speechSynthesis.getVoices();
        const idealVoice = voices.find(voice => voice.lang.includes('en-US') && voice.name.toLowerCase().includes('google'));
        if (idealVoice) {
            utterance.voice = idealVoice;
        }

        window.speechSynthesis.speak(utterance);
    } else {
        alert('Trình duyệt của bạn không hỗ trợ công cụ phát âm tự động.');
    }
}

// Streak UI Update Helper (Ensures sidebar streak is always accurate across tabs)
function updateSidebarStreakUI() {
    const el = document.getElementById('streak-count-val');
    if (el) {
        el.textContent = state.streak;
    }

    // Đồng bộ chỉ số streak trên thanh tiêu đề di động (Mobile Top Bar)
    const mobileEl = document.getElementById('mobile-streak-val');
    if (mobileEl) {
        mobileEl.textContent = state.streak;
    }
}

// Streak Calculation Logic
function checkAndUpdateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (state.lastStudyDate === today) {
        // Already studied today, streak remains same
        updateSidebarStreakUI();
        return;
    } else if (state.lastStudyDate === yesterday) {
        // Studied yesterday, consecutive day study!
        state.streak += 1;
        state.lastStudyDate = today;
        saveStatsToStorage();
        updateSidebarStreakUI();
    } else {
        // Broke the streak (gap > 1 day) or brand new user
        if (state.lastStudyDate === '') {
            state.streak = 1; // Brand new study starting today
        } else {
            state.streak = 1; // Reset streak
        }
        state.lastStudyDate = today;
        saveStatsToStorage();
        updateSidebarStreakUI();
    }
}

