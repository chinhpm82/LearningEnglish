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
// Load data from IndexedDB
async function loadStateAsync() {
    try {
        console.log('Initializing IndexedDB...');
        await LearningDB.initDB();

        // 1. Migrate old localStorage data if present
        await LearningDB.migrateFromLocalStorage();

        // 2. Ensure Database is seeded with seed files (Deduplicates automatically inside db-manager)
        const initialVoc = typeof INITIAL_VOCABULARY !== 'undefined' ? INITIAL_VOCABULARY : [];
        await LearningDB.seedDatabase(initialVoc, []);

        // 3. Load vocabulary into global state
        state.vocabulary = await LearningDB.getAllVocab();
        console.log(`Loaded ${state.vocabulary.length} unique words from IndexedDB.`);

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
        state.vocabulary = [...(typeof INITIAL_VOCABULARY !== 'undefined' ? INITIAL_VOCABULARY : [])];
        state.customWords = [];
        state.completedLessons = [];
        state.completedSentences = [];
        state.userLevel = 'Beginner';
        state.lastTestScore = 0;
        state.roadmapTasks = generateRoadmapTasks('Beginner');
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
        window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL, state.displayName);
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

// --- RENDERING & UI SYNC ---

function getCEFRLevelDisplayName(level) {
    const map = {
        'A1': 'Sơ cấp (A1)',
        'A2': 'Sơ cấp (A2)',
        'A3': 'Tiền trung cấp (A3)',
        'B1': 'Trung cấp (B1)',
        'B2': 'Trung cấp (B2)',
        'B3': 'Tiền cao cấp (B3)',
        'C1': 'Cao cấp (C1)',
        'C2': 'Thành thạo (C2)'
    };
    return map[level] || 'Sơ cấp (A1)';
}

function filterWordsByLevel(allWords, level) {
    if (level === 'A1') {
        return allWords.filter(w => (w.category === 'oxford' && w.word.length < 6) || w.category === 'custom');
    } else if (level === 'A2') {
        return allWords.filter(w => (w.category === 'oxford' && w.word.length >= 6 && w.word.length <= 8) || w.category === 'custom');
    } else if (level === 'A3') {
        return allWords.filter(w => (w.category === 'oxford' && w.word.length > 8) || w.category === 'custom');
    } else if (level === 'B1') {
        return allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'custom');
    } else if (level === 'B2') {
        return allWords.filter(w => w.category === 'academic' || w.category === 'custom');
    } else if (level === 'B3') {
        return allWords.filter(w => w.category === 'academic' || w.category === 'idioms' || w.category === 'custom');
    } else if (level === 'C1') {
        return allWords.filter(w => (w.category && w.category.startsWith('spec-')) || w.category === 'custom');
    } else {
        return allWords;
    }
}

function updateCEFRSkillsRadarBars(score, masteredVocab, totalVocab) {
    const stats = state.placementStats || { grammar: 0, reading: 0, vocab: 0, listening: 0 };
    
    // 1. Vocabulary Skill formula
    const rawVocabPct = totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 0;
    const baseVocabSeed = Math.round((stats.vocab / 8) * 100);
    const vocabPct = Math.min(100, Math.max(rawVocabPct, baseVocabSeed || 15));

    // 2. Grammar Skill formula
    const completedGrammarLessons = state.completedLessons ? state.completedLessons.length : 0;
    const rawGrammarPct = Math.round((completedGrammarLessons / 12) * 100);
    const baseGrammarSeed = Math.round((stats.grammar / 4) * 100);
    const grammarPct = Math.min(100, Math.max(rawGrammarPct, baseGrammarSeed || 15));

    // 3. Reading Skill formula
    const completedStories = state.stories_done ? state.stories_done.length : 0;
    const rawReadingPct = completedStories * 20; // 5 stories = 100%
    const baseReadingSeed = Math.round((stats.reading / 4) * 100);
    const readingPct = Math.min(100, Math.max(rawReadingPct, baseReadingSeed || 15));

    // 4. Listening Skill formula
    const completedSentences = state.completedSentences ? state.completedSentences.length : 0;
    const rawListeningPct = Math.round((completedSentences / 20) * 100);
    const baseListeningSeed = Math.round((stats.listening / 4) * 100);
    const listeningPct = Math.min(100, Math.max(rawListeningPct, baseListeningSeed || 15));

    // 5. Spoken & AI Essay formula
    const quizAccPct = state.quizStats.totalAnswered > 0 ? Math.round((state.quizStats.correctAnswers / state.quizStats.totalAnswered) * 100) : 0;
    const writingPct = Math.min(100, Math.max(quizAccPct || 10, Math.round((score / 16) * 100) || 15));

    // Render bars in DOM
    const barElements = {
        'vocab': { bar: 'dashboard-skill-bar-vocab', txt: 'dashboard-skill-vocab', val: vocabPct },
        'grammar': { bar: 'dashboard-skill-bar-grammar', txt: 'dashboard-skill-grammar', val: grammarPct },
        'reading': { bar: 'dashboard-skill-bar-reading', txt: 'dashboard-skill-reading', val: readingPct },
        'listening': { bar: 'dashboard-skill-bar-listening', txt: 'dashboard-skill-listening', val: listeningPct },
        'writing': { bar: 'dashboard-skill-bar-writing', txt: 'dashboard-skill-writing', val: writingPct }
    };

    Object.keys(barElements).forEach(key => {
        const item = barElements[key];
        const barEl = document.getElementById(item.bar);
        const txtEl = document.getElementById(item.txt);
        if (barEl) barEl.style.width = `${item.val}%`;
        if (txtEl) txtEl.textContent = `${item.val}%`;
    });
}

let isPlacementQuizRunning = false;
let currentPlacementQuestionIndex = 0;
let placementUserAnswers = [];

function triggerCEFRPlacementTestIfNew() {
    if (state.lastTestScore === 0) {
        const modal = document.getElementById('placement-test-modal');
        if (modal) modal.classList.remove('hidden');
    }
}

function startPlacementTestQuiz() {
    document.getElementById('placement-intro-screen').classList.add('hidden');
    document.getElementById('placement-quiz-screen').classList.remove('hidden');
    document.getElementById('placement-result-screen').classList.add('hidden');

    isPlacementQuizRunning = true;
    currentPlacementQuestionIndex = 0;
    placementUserAnswers = [];
    showPlacementQuestion();
}

function skipPlacementTestQuiz() {
    state.userLevel = 'A1';
    state.lastTestScore = 1; // Seed a small score so it doesn't pop up again
    state.placementStats = { grammar: 0, reading: 0, vocab: 0, listening: 0 };
    
    saveStatsToStorage();
    const modal = document.getElementById('placement-test-modal');
    if (modal) modal.classList.add('hidden');
    renderDashboard();
}

function showPlacementQuestion() {
    if (typeof PLACEMENT_QUESTIONS === 'undefined') return;
    const q = PLACEMENT_QUESTIONS[currentPlacementQuestionIndex];
    if (!q) return;

    // Update section indicator and progress bar
    const secIndicator = document.getElementById('placement-section-indicator');
    const progText = document.getElementById('placement-progress-text');
    const progBar = document.getElementById('placement-progress-bar');

    const totalQs = PLACEMENT_QUESTIONS.length;
    const progressPct = ((currentPlacementQuestionIndex) / totalQs) * 100;
    if (progBar) progBar.style.width = `${progressPct}%`;
    if (progText) progText.textContent = `Câu ${currentPlacementQuestionIndex + 1} / ${totalQs}`;

    const sectionNames = {
        'grammar': '📚 NGỮ PHÁP (GRAMMAR)',
        'vocabulary': '🧩 TỪ VỰNG (VOCABULARY)',
        'reading': '📖 ĐỌC HIỂU (READING COMPREHENSION)',
        'listening': '🗣️ PHẢN XẠ & NGHE (REFLEX & LISTENING)'
    };
    if (secIndicator) secIndicator.textContent = sectionNames[q.section] || q.section.toUpperCase();

    // Show question text
    const qTextEl = document.getElementById('placement-question-text');
    if (qTextEl) qTextEl.textContent = q.question;

    // Build options
    const optionsContainer = document.getElementById('placement-options-container');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option'; // Uses legacy beautiful quiz styling
            btn.style.cssText = 'width: 100%; text-align: left; padding: 14px 18px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: var(--text-main); font-size: 14px; cursor: pointer; transition: all 0.2s ease;';
            
            // Add hover triggers programmatically for rich feeling
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255,255,255,0.06)';
                btn.style.borderColor = 'var(--primary)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,255,255,0.03)';
                btn.style.borderColor = 'rgba(255,255,255,0.08)';
            });

            btn.textContent = opt;
            btn.addEventListener('click', () => submitPlacementAnswer(idx));
            optionsContainer.appendChild(btn);
        });
    }
}

function submitPlacementAnswer(selectedIdx) {
    placementUserAnswers.push(selectedIdx);
    
    currentPlacementQuestionIndex++;
    if (currentPlacementQuestionIndex < PLACEMENT_QUESTIONS.length) {
        showPlacementQuestion();
    } else {
        finishPlacementTest();
    }
}

function finishPlacementTest() {
    isPlacementQuizRunning = false;

    // Calculate score
    let totalCorrect = 0;
    let grammarCorrect = 0;
    let readingCorrect = 0;
    let vocabCorrect = 0;
    let listeningCorrect = 0;

    PLACEMENT_QUESTIONS.forEach((q, idx) => {
        const userAns = placementUserAnswers[idx];
        if (userAns === q.answer) {
            totalCorrect++;
            if (q.section === 'grammar') grammarCorrect++;
            else if (q.section === 'reading') readingCorrect++;
            else if (q.section === 'vocabulary') vocabCorrect++;
            else if (q.section === 'listening') listeningCorrect++;
        }
    });

    // Save sectional scores
    state.placementStats = {
        grammar: grammarCorrect,
        reading: readingCorrect,
        vocab: vocabCorrect,
        listening: listeningCorrect
    };

    // Classify Level (A1 - C2)
    let finalLevel = 'A1';
    if (totalCorrect <= 2) finalLevel = 'A1';
    else if (totalCorrect <= 4) finalLevel = 'A2';
    else if (totalCorrect <= 6) finalLevel = 'A3';
    else if (totalCorrect <= 8) finalLevel = 'B1';
    else if (totalCorrect <= 10) finalLevel = 'B2';
    else if (totalCorrect <= 12) finalLevel = 'B3';
    else if (totalCorrect <= 14) finalLevel = 'C1';
    else finalLevel = 'C2';

    state.userLevel = finalLevel;
    state.lastTestScore = totalCorrect;

    // Update database & sync
    saveStatsToStorage();

    // Show Results Screen
    document.getElementById('placement-intro-screen').classList.add('hidden');
    document.getElementById('placement-quiz-screen').classList.add('hidden');
    document.getElementById('placement-result-screen').classList.remove('hidden');

    // Populate score visualizers
    document.getElementById('placement-score-result').textContent = `${totalCorrect} / 16`;
    document.getElementById('placement-level-result').textContent = finalLevel;

    // Section breakdown numbers
    document.getElementById('breakdown-grammar').textContent = `${grammarCorrect} / 4`;
    document.getElementById('breakdown-reading').textContent = `${readingCorrect} / 4`;
    document.getElementById('breakdown-vocab').textContent = `${vocabCorrect + listeningCorrect} / 8`;

    // Section breakdown bars width
    document.getElementById('bar-grammar').style.width = `${(grammarCorrect / 4) * 100}%`;
    document.getElementById('bar-reading').style.width = `${(readingCorrect / 4) * 100}%`;
    document.getElementById('bar-vocab').style.width = `${((vocabCorrect + listeningCorrect) / 8) * 100}%`;
}

function closePlacementTestModal() {
    const modal = document.getElementById('placement-test-modal');
    if (modal) modal.classList.add('hidden');
    renderDashboard();
}

function renderDashboard() {
    // Proactively check if placement test needs to be triggered
    triggerCEFRPlacementTestIfNew();

    // Update Gold Stars counter
    const starsCountEl = document.getElementById('dashboard-stars-count');
    if (starsCountEl) {
        starsCountEl.textContent = state.stars;
    }

    // Update dynamic welcome greeting
    const welcomeUserEl = document.getElementById('welcome-username');
    if (welcomeUserEl) {
        if (isCloudMode) {
            welcomeUserEl.textContent = state.displayName ? state.displayName.split(' ')[0] : 'Học viên';
        } else {
            welcomeUserEl.textContent = 'Khách';
        }
    }

    // Update Private Assessment & Level (Confidential display for current student only)
    const level = state.userLevel || 'A1';
    const score = state.lastTestScore !== undefined ? state.lastTestScore : 0;
    
    const levelNameShort = getCEFRLevelDisplayName(level);
    
    const assessmentValEl = document.getElementById('dashboard-assessment-val');
    const assessmentLevelEl = document.getElementById('dashboard-assessment-level');
    if (assessmentValEl) assessmentValEl.textContent = `${score}/16`;
    if (assessmentLevelEl) assessmentLevelEl.textContent = `Trình độ: ${levelNameShort}`;
    
    const profileLevelText = document.getElementById('user-private-level-text');
    if (profileLevelText) {
        profileLevelText.textContent = `${levelNameShort} (${score}/16)`;
    }

    // Group all words (built-in + custom)
    const allWords = [...state.vocabulary, ...state.customWords];
    
    // Filter syllabus words based on student's current level
    const levelWords = filterWordsByLevel(allWords, level);

    // TỐI ƯU HÓA HIỆU NĂNG: Duyệt mảng 1 lần duy nhất để đếm các hộp Leitner và số lượng từ cần ôn tập
    const now = Date.now();
    const totalWordsCount = levelWords.length;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;
    let reviewCount = 0;

    for (let i = 0; i < totalWordsCount; i++) {
        const w = levelWords[i];
        if (w.box === 3) {
            masteredCount++;
        } else {
            if (w.box === 2) learningCount++;
            else if (w.box === 1) newCount++;
            
            if (w.nextReview <= now) {
                reviewCount++;
            }
        }
    }

    // Update Text Elements
    document.getElementById('stats-total-words').textContent = totalWordsCount;
    document.getElementById('stats-learned').textContent = masteredCount;
    document.getElementById('stats-review').textContent = reviewCount;
    document.getElementById('streak-count-val').textContent = state.streak;

    // Calculate Quiz accuracy
    let accuracyText = '100%';
    if (state.quizStats.totalAnswered > 0) {
        const accPct = Math.round((state.quizStats.correctAnswers / state.quizStats.totalAnswered) * 100);
        accuracyText = `${accPct}%`;
    }
    document.getElementById('stats-accuracy').textContent = accuracyText;

    // Update Progress Circle Dashoffset
    const circle = document.getElementById('progress-circle-fg');
    const pctText = document.getElementById('progress-percentage-val');
    const legendMastered = document.getElementById('legend-mastered');
    const legendLearning = document.getElementById('legend-learning');
    const legendNew = document.getElementById('legend-new');

    legendMastered.textContent = masteredCount;
    legendLearning.textContent = learningCount;
    legendNew.textContent = newCount;

    // Compute progress based on weights: Box 3 = 100%, Box 2 = 50%, Box 1 = 0%
    let progressPct = 0;
    if (totalWordsCount > 0) {
        const weightedSum = (masteredCount * 100) + (learningCount * 50);
        progressPct = Math.round(weightedSum / totalWordsCount);
    }

    pctText.textContent = `${progressPct}%`;
    
    // Circle radius is 54, circumference is 2 * Math.PI * 54 = ~339.3
    const circumference = 2 * Math.PI * 54;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (progressPct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // --- UPDATE CEFR SKILL RADAR BARS ---
    updateCEFRSkillsRadarBars(score, masteredCount, totalWordsCount);

    // Render "Word of the Day"
    renderWordOfTheDay();

    // Render Dynamic Learning Roadmap
    renderRoadmap();
}

// Generate random "Word of the Day"
function renderWordOfTheDay(forceRefresh = false) {
    const allWords = [...state.vocabulary, ...state.customWords];
    if (allWords.length === 0) return;

    const level = state.userLevel || 'A1';
    let levelWords = filterWordsByLevel(allWords, level);

    if (levelWords.length === 0) levelWords = allWords; // Fallback

    const todayStr = new Date().toLocaleDateString('en-US');
    let storedWotdData = null;
    try {
        storedWotdData = JSON.parse(localStorage.getItem('le_wotd_data') || 'null');
    } catch (e) {
        storedWotdData = null;
    }

    if (forceRefresh || !state.currentWotd || !storedWotdData || storedWotdData.date !== todayStr) {
        const randomIndex = Math.floor(Math.random() * levelWords.length);
        state.currentWotd = levelWords[randomIndex];
        localStorage.setItem('le_wotd_data', JSON.stringify({
            date: todayStr,
            wordId: state.currentWotd.id
        }));
    } else if (storedWotdData && storedWotdData.date === todayStr && !state.currentWotd) {
        const foundWord = allWords.find(w => w.id === storedWotdData.wordId);
        state.currentWotd = foundWord || levelWords[Math.floor(Math.random() * levelWords.length)];
    }

    const wotd = state.currentWotd;

    document.getElementById('wotd-word').textContent = wotd.word;
    document.getElementById('wotd-type').textContent = wotd.type;
    document.getElementById('wotd-ipa').textContent = wotd.ipa || '';
    document.getElementById('wotd-meaning').textContent = wotd.meaning;
    document.getElementById('wotd-example-en').textContent = `"${wotd.example || ''}"`;
    document.getElementById('wotd-example-vi').textContent = `"${wotd.example_vi || ''}"`;

    // Attach click to voice
    const voiceBtn = document.getElementById('wotd-speak-btn');
    if (voiceBtn) {
        // Remove old listeners
        const newBtn = voiceBtn.cloneNode(true);
        voiceBtn.parentNode.replaceChild(newBtn, voiceBtn);
        newBtn.addEventListener('click', () => speakEnglish(wotd.word));
    }
}

// --- FLASHCARD ENGINE (LEITNER SRS SYSTEM) ---

// Helper function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initFlashcardSession(category = 'all') {
    const now = Date.now();
    const allWords = [...state.vocabulary, ...state.customWords];
    const level = state.userLevel || 'Beginner';

    // Filter deck based on category and level
    let filtered = [];
    if (category === 'all') {
        // Automatically suggest random words appropriate for the student's level
        filtered = filterWordsByLevel(allWords, level);
    } else if (category === 'custom') {
        filtered = [...state.customWords];
    } else {
        // If they select a specific category, show words of that category
        filtered = allWords.filter(w => w.category === category);
    }

    if (filtered.length === 0) {
        flashcardDeck = [];
        renderEmptyFlashcardDeck();
        return;
    }

    // Sort words: Priority to words whose nextReview time has arrived
    // box < 3 means they are not fully mastered yet
    const reviewQueue = filtered.filter(w => w.nextReview <= now && w.box < 3);
    const regularQueue = filtered.filter(w => w.nextReview > now || w.box === 3);

    // Shuffle the review items and the practice items to keep learning completely fresh and random!
    const shuffledReview = shuffleArray(reviewQueue);
    const shuffledPractice = shuffleArray(regularQueue);

    // Prioritize due reviews, filled with random practices
    flashcardDeck = [...shuffledReview, ...shuffledPractice];
    currentCardIndex = 0;
    isCardFlipped = false;

    renderFlashcard();
}

function renderFlashcard() {
    const container = document.getElementById('flashcard-element');
    container.classList.remove('flipped');
    isCardFlipped = false;

    if (flashcardDeck.length === 0) {
        renderEmptyFlashcardDeck();
        return;
    }

    const card = flashcardDeck[currentCardIndex];

    // Card Front
    document.getElementById('card-front-word').textContent = card.word;
    document.getElementById('card-front-type').textContent = card.type;
    document.getElementById('card-front-ipa').textContent = card.ipa || '';
    
    const boxBadge = document.getElementById('card-box-badge');
    if (card.box === 1) {
        boxBadge.textContent = 'Từ mới';
        boxBadge.style.color = 'var(--warning)';
    } else if (card.box === 2) {
        boxBadge.textContent = 'Đang học';
        boxBadge.style.color = 'var(--primary-light)';
    } else {
        boxBadge.textContent = 'Đã thuộc';
        boxBadge.style.color = 'var(--success)';
    }

    // Card Back
    document.getElementById('card-back-meaning').textContent = card.meaning;
    document.getElementById('card-back-example-en').textContent = `"${card.example || ''}"`;
    document.getElementById('card-back-example-vi').textContent = `"${card.example_vi || ''}"`;

    // Deck Bar
    const progressFill = document.getElementById('flashcard-progress-bar');
    const deckCount = document.getElementById('flashcard-deck-count');
    const progressPct = Math.round((currentCardIndex / flashcardDeck.length) * 100);
    
    progressFill.style.width = `${progressPct}%`;
    deckCount.textContent = `Thẻ ${currentCardIndex + 1} / ${flashcardDeck.length}`;

    // Enable normal button deck states
    document.getElementById('btn-card-incorrect').style.opacity = '1';
    document.getElementById('btn-card-correct').style.opacity = '1';
    document.getElementById('btn-card-incorrect').pointerEvents = 'auto';
    document.getElementById('btn-card-correct').pointerEvents = 'auto';
}

function renderEmptyFlashcardDeck() {
    document.getElementById('card-front-word').textContent = 'Trống Rỗng 📂';
    document.getElementById('card-front-type').textContent = '';
    document.getElementById('card-front-ipa').textContent = 'Không có từ nào trong deck này';
    document.getElementById('card-box-badge').textContent = '-';
    document.getElementById('card-back-meaning').textContent = 'Chưa có từ nào phù hợp';
    document.getElementById('card-back-example-en').textContent = 'Hãy thêm từ mới hoặc đổi chủ đề.';
    document.getElementById('card-back-example-vi').textContent = '';

    document.getElementById('flashcard-progress-bar').style.width = '0%';
    document.getElementById('flashcard-deck-count').textContent = 'Thẻ 0 / 0';

    // Disable incorrect/correct actions since deck is empty
    document.getElementById('btn-card-incorrect').style.opacity = '0.4';
    document.getElementById('btn-card-correct').style.opacity = '0.4';
    document.getElementById('btn-card-incorrect').pointerEvents = 'none';
    document.getElementById('btn-card-correct').pointerEvents = 'none';
}

function toggleCardFlip() {
    if (flashcardDeck.length === 0) return;
    const container = document.getElementById('flashcard-element');
    container.classList.toggle('flipped');
    isCardFlipped = !isCardFlipped;
}

// Leitner SRS Scheduling Logic
async function handleFlashcardAction(isCorrect) {
    if (flashcardDeck.length === 0) return;
    
    // Register study activity for Streak
    checkAndUpdateStreak();
    trackDailyActivity('flashcard', 1);
    renderDashboard();

    const word = flashcardDeck[currentCardIndex];
    const now = Date.now();

    // Find vocabulary source list (built-in or custom)
    let sourceList = state.vocabulary;
    let isCustom = false;
    let originalIdx = state.vocabulary.findIndex(w => w.id === word.id);

    if (originalIdx === -1) {
        originalIdx = state.customWords.findIndex(w => w.id === word.id);
        sourceList = state.customWords;
        isCustom = true;
    }

    if (originalIdx !== -1) {
        if (isCorrect) {
            // Upgrade Box (Max Box is 3)
            if (word.box < 3) {
                sourceList[originalIdx].box += 1;
            }
            // Schedule next review based on Box weight & Adaptive student level (CEFR)
            // Spaced Retrieval adapts dynamically to combat the forgetting curve:
            // - Beginner: Needs faster recall (Box 2: 1.5 days, Box 3: 4 days)
            // - Intermediate: Standard spacing (Box 2: 3 days, Box 3: 7 days)
            // - Advanced: Stronger retention, wider spacing (Box 2: 5 days, Box 3: 12 days)
            let daysMultiplier = sourceList[originalIdx].box === 2 ? 3 : 7;
            const lvl = state.userLevel || 'A1';
            if (lvl === 'A1' || lvl === 'A2' || lvl === 'A3' || lvl === 'Beginner') {
                daysMultiplier = sourceList[originalIdx].box === 2 ? 1.5 : 4;
            } else if (lvl === 'C1' || lvl === 'C2' || lvl === 'Advanced') {
                daysMultiplier = sourceList[originalIdx].box === 2 ? 5 : 12;
            }
            
            sourceList[originalIdx].nextReview = now + (daysMultiplier * 24 * 60 * 60 * 1000);
        } else {
            // Downgrade to Box 1 (New) and schedule review immediately
            sourceList[originalIdx].box = 1;
            sourceList[originalIdx].nextReview = now; // Ready immediately
        }

        // Save asynchronously
        if (isCustom) {
            await saveCustomWordsToStorage();
        } else {
            await updateWordInDB(sourceList[originalIdx]);
        }

        // Sync to Firebase if in Cloud Mode
        if (isCloudMode && window.FirebaseSync) {
            const updatedWord = sourceList[originalIdx];
            if (isCustom) {
                window.FirebaseSync.saveCustomWord(updatedWord);
            } else {
                window.FirebaseSync.saveProgress(updatedWord.id, updatedWord.box, updatedWord.nextReview);
            }
        }
    }

    // Go to next card in session
    if (currentCardIndex < flashcardDeck.length - 1) {
        currentCardIndex++;
        renderFlashcard();
    } else {
        // Session ended
        alert('🎉 Chúc mừng! Bạn đã hoàn thành tất cả thẻ trong lượt này.');
        awardStars(10, "Hoàn thành lượt học Flashcard");
        initFlashcardSession(document.getElementById('flashcard-category').value);
    }
}

// --- DYNAMIC QUIZ SYSTEM ---

function initQuizSession(category = 'all') {
    const allWords = [...state.vocabulary, ...state.customWords];
    let sourcePool = [];

    if (category === 'assessment') {
        // Balanced sample of questions: 4 from oxford, 3 from academic, 3 from idioms
        const oxfordPool = allWords.filter(w => w.category === 'oxford').sort(() => 0.5 - Math.random());
        const academicPool = allWords.filter(w => w.category === 'academic').sort(() => 0.5 - Math.random());
        const idiomsPool = allWords.filter(w => w.category === 'idioms').sort(() => 0.5 - Math.random());
        
        sourcePool = [
            ...oxfordPool.slice(0, 4),
            ...academicPool.slice(0, 3),
            ...idiomsPool.slice(0, 3)
        ].sort(() => 0.5 - Math.random());
    } else if (category === 'all') {
        sourcePool = [...allWords];
    } else if (category === 'custom') {
        sourcePool = [...state.customWords];
    } else {
        sourcePool = allWords.filter(w => w.category === category);
    }

    if (sourcePool.length < 4) {
        alert('⚠️ Kho từ vựng chủ đề này cần ít nhất 4 từ để có thể bắt đầu làm Trắc nghiệm.');
        return;
    }

    // Pick 10 random words (or fewer if total vocabulary is small)
    const quizLength = Math.min(10, sourcePool.length);
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());
    
    quizQuestions = shuffled.slice(0, quizLength).map(word => {
        // Find 3 incorrect answers from the global pool
        const otherWords = allWords.filter(w => w.id !== word.id);
        const shuffledOthers = otherWords.sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map(w => w.meaning);
        
        // Combine correct answer & distractors, then shuffle options
        const options = [word.meaning, ...distractors].sort(() => 0.5 - Math.random());
        const correctIndex = options.indexOf(word.meaning);

        return {
            wordObj: word,
            questionText: word.word,
            options: options,
            correctIndex: correctIndex
        };
    });

    currentQuestionIndex = 0;
    quizScore = 0;
    quizTimer.start = Date.now();

    // Toggle States
    document.getElementById('quiz-intro-state').classList.add('hidden');
    document.getElementById('quiz-result-state').classList.add('hidden');
    document.getElementById('quiz-active-state').classList.remove('hidden');

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    // Header Info
    document.getElementById('quiz-counter').textContent = `Câu hỏi ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quiz-score-correct').textContent = quizScore;
    
    // Progress Bar
    const progressPct = Math.round(((currentQuestionIndex) / quizQuestions.length) * 100);
    document.getElementById('quiz-progress-bar').style.width = `${progressPct}%`;

    // Word Question Text
    document.getElementById('quiz-question-word').textContent = question.wordObj.word;

    // Speech Trigger for Question
    const speakBtn = document.getElementById('quiz-speak-question-btn');
    const newBtn = speakBtn.cloneNode(true);
    speakBtn.parentNode.replaceChild(newBtn, speakBtn);
    newBtn.addEventListener('click', () => speakEnglish(question.wordObj.word));

    // Hide Feedback Panel
    document.getElementById('quiz-feedback').classList.add('hidden');

    // Generate Option Buttons
    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    question.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-card';
        btn.textContent = opt;
        btn.dataset.index = idx;
        btn.addEventListener('click', () => handleQuizAnswer(idx, question.correctIndex, btn));
        optionsContainer.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex, correctIndex, clickedButton) {
    const question = quizQuestions[currentQuestionIndex];
    const optionsContainer = document.getElementById('quiz-options-container');
    const optionCards = optionsContainer.querySelectorAll('.option-card');

    // Register active study date for Streak
    checkAndUpdateStreak();
    renderDashboard();

    // Disable all options click immediately
    optionCards.forEach(card => card.classList.add('disabled'));

    const isCorrect = selectedIndex === correctIndex;

    // Stat Track
    state.quizStats.totalAnswered += 1;
    if (isCorrect) {
        state.quizStats.correctAnswers += 1;
        quizScore += 1;
        clickedButton.classList.add('correct');
    } else {
        clickedButton.classList.add('incorrect');
        // highlight correct one
        optionCards[correctIndex].classList.add('correct');
    }

    saveStatsToStorage();

    // Auto-pronounce when answered
    speakEnglish(question.wordObj.word);

    // Show Feedback Box
    const feedbackBox = document.getElementById('quiz-feedback');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackDetail = document.getElementById('feedback-detail');
    const feedbackIcon = document.getElementById('feedback-icon-svg');

    feedbackBox.classList.remove('hidden');

    if (isCorrect) {
        feedbackTitle.textContent = 'Chính xác! 🎉';
        feedbackTitle.style.color = 'var(--success)';
        feedbackIcon.className = 'feedback-icon feedback-icon-success';
        feedbackIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
        feedbackTitle.textContent = 'Chưa đúng rồi 🥺';
        feedbackTitle.style.color = 'var(--danger)';
        feedbackIcon.className = 'feedback-icon feedback-icon-danger';
        feedbackIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    }

    feedbackDetail.textContent = `Ví dụ: "${question.wordObj.example || ''}"`;
}

function handleQuizNext() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
    } else {
        // Quiz completed
        quizTimer.end = Date.now();
        showQuizResults();
    }
}

function showQuizResults() {
    document.getElementById('quiz-active-state').classList.add('hidden');
    document.getElementById('quiz-result-state').classList.remove('hidden');

    const durationSec = Math.round((quizTimer.end - quizTimer.start) / 1000);
    const pct = Math.round((quizScore / quizQuestions.length) * 100);

    document.getElementById('result-score-val').textContent = `${quizScore} / ${quizQuestions.length}`;
    
    // Award Gold Stars for Quiz completion & accuracy!
    const baseStars = 15;
    const accuracyStars = quizScore * 2;
    const totalStarsEarned = baseStars + accuracyStars;
    awardStars(totalStarsEarned, `Hoàn thành trắc nghiệm (${quizScore}/10 câu đúng)`);
    document.getElementById('result-time').textContent = `${durationSec} giây`;
    document.getElementById('result-accuracy').textContent = `${pct}%`;

    const activeCategory = document.getElementById('quiz-category-select').value;
    trackDailyActivity('quiz', { correct: quizScore, total: quizQuestions.length, category: activeCategory });

    // Dynamic result message
    const msgEl = document.getElementById('quiz-result-message');
    if (activeCategory === 'assessment') {
        let level = 'Beginner';
        let levelName = 'Sơ cấp (A1-A2)';
        let speedRating = 'Cần cải thiện phản xạ 🐢';

        if (durationSec < 50) {
            speedRating = 'Phản xạ chớp nhoáng ⚡';
        } else if (durationSec < 90) {
            speedRating = 'Phản xạ tiêu chuẩn ⏱️';
        }

        // Timed Assessment Rating Matrix (Độ chính xác + Tốc độ phản xạ)
        if (quizScore >= 8) {
            if (durationSec < 60) {
                level = 'C1';
                levelName = 'Cao cấp (C1)';
            } else {
                level = 'B1';
                levelName = 'Trung cấp (B1)'; // Slower recall, downgraded to Intermediate
            }
        } else if (quizScore >= 5) {
            if (durationSec < 95) {
                level = 'B1';
                levelName = 'Trung cấp (B1)';
            } else {
                level = 'A1';
                levelName = 'Sơ cấp (A1)'; // Too slow, downgraded to Beginner
            }
        } else {
            level = 'A1';
            levelName = 'Sơ cấp (A1)';
        }
        
        state.userLevel = level;
        state.lastTestScore = quizScore * 1.6; // Scale 10-based score to 16-based score
        state.roadmapTasks = generateRoadmapTasks(level);
        saveStatsToStorage();
        
        let badgeStyleClass = 'beginner';
        if (level.startsWith('B')) badgeStyleClass = 'intermediate';
        else if (level.startsWith('C')) badgeStyleClass = 'advanced';

        msgEl.innerHTML = `
            🎓 <b>KẾT QUẢ ĐÁNH GIÁ PHẢN XẠ & TRÌNH ĐỘ:</b><br>
            • Độ chính xác: <b>${quizScore}/10 câu đúng</b> (${pct}%)<br>
            • Thời gian hoàn thành: <b>${durationSec} giây</b> (${speedRating})<br>
            • Xếp hạng trình độ: <span class="level-badge ${badgeStyleClass}" style="font-size:12px; padding: 4px 10px; box-shadow:none; line-height:1.2; display:inline-block; margin: 6px 0;">${levelName}</span><br>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">Hệ thống đã phân tích tốc độ phản xạ và độ chính xác của bạn để tự động thiết lập Lộ trình học tập phù hợp nhất tại trang Tổng quan!</p>
        `;
    } else {
        if (pct >= 90) msgEl.textContent = '🌟 Xuất sắc! Kỷ lục gia ghi nhớ từ vựng!';
        else if (pct >= 70) msgEl.textContent = '👍 Rất tốt! Tiếp tục phát huy nhé!';
        else if (pct >= 50) msgEl.textContent = '📚 Khá tốt! Hãy ôn flashcard thêm một chút nữa.';
        else msgEl.textContent = '💪 Cố lên! Chăm chỉ luyện tập để cải thiện điểm số.';
    }

    // Synchronize overall stats wheel on dashboard
    renderDashboard();
}

// --- DYNAMIC LEARNING ROADMAP RENDERER & ALGORITHM ---

function generateRoadmapTasks(level) {
    if (level === 'A1' || level === 'A2' || level === 'A3' || level === 'Beginner') {
        return [
            { text: "Luyện 10 thẻ Flashcard bộ Oxford Essential thiết yếu", completed: false },
            { text: "Làm đúng từ 5/10 câu trắc nghiệm Oxford", completed: false },
            { text: "Luyện phát âm 3 câu giao tiếp hàng ngày", completed: false }
        ];
    } else if (level === 'B1' || level === 'B2' || level === 'B3' || level === 'Intermediate') {
        return [
            { text: "Ôn tập 15 từ vựng đang học cần xem lại", completed: false },
            { text: "Đạt từ 7/10 điểm trắc nghiệm Thành ngữ & Cụm từ", completed: false },
            { text: "Học 5 mẫu câu đàm thoại tiếng Anh thường nhật", completed: false }
        ];
    } else {
        return [
            { text: "Chinh phục 15 từ vựng học thuật IELTS nâng cao", completed: false },
            { text: "Đạt điểm tối đa 10/10 Quiz học thuật nâng cao", completed: false },
            { text: "Luyện đọc hiểu 4 mẫu câu giao tiếp công sở phức tạp", completed: false }
        ];
    }
}

// --- AUTO-CHECK DAILY ROADMAP TASKS SYSTEM ---
function trackDailyActivity(activityType, value = 1) {
    const todayStr = new Date().toLocaleDateString('en-US');
    let progress = JSON.parse(localStorage.getItem('le_daily_progress') || '{}');
    if (progress.date !== todayStr) {
        progress = {
            date: todayStr,
            flashcards: 0,
            quizCorrect: 0,
            quizCategory: '',
            sentences: 0
        };
    }
    
    if (activityType === 'flashcard') {
        progress.flashcards += value;
    } else if (activityType === 'quiz') {
        if (value.correct > progress.quizCorrect) {
            progress.quizCorrect = value.correct;
            progress.quizCategory = value.category;
        }
    } else if (activityType === 'sentence') {
        progress.sentences += value;
    }
    
    localStorage.setItem('le_daily_progress', JSON.stringify(progress));
    autoCheckRoadmapTasks(progress);
}

function autoCheckRoadmapTasks(progress) {
    if (!state.roadmapTasks || state.roadmapTasks.length < 3) {
        state.roadmapTasks = generateRoadmapTasks(state.userLevel || 'A1');
    }
    
    let changed = false;
    
    const lvl = state.userLevel || 'A1';

    if (lvl === 'A1' || lvl === 'A2' || lvl === 'A3' || lvl === 'Beginner') {
        // Task 0: Luyện 10 thẻ Flashcard...
        if (progress.flashcards >= 10 && !state.roadmapTasks[0].completed) {
            state.roadmapTasks[0].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Luyện 10 thẻ Flashcard!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Luyện 10 thẻ Flashcard! +5 ⭐");
        }
        // Task 1: Làm đúng từ 5/10 câu trắc nghiệm Oxford
        if (progress.quizCorrect >= 5 && progress.quizCategory === 'oxford' && !state.roadmapTasks[1].completed) {
            state.roadmapTasks[1].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Đạt 5/10 trắc nghiệm Oxford!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Đạt 5/10 trắc nghiệm Oxford! +5 ⭐");
        }
        // Task 2: Luyện phát âm 3 câu giao tiếp hàng ngày
        if (progress.sentences >= 3 && !state.roadmapTasks[2].completed) {
            state.roadmapTasks[2].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Luyện phát âm 3 câu giao tiếp!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Luyện phát âm 3 câu giao tiếp! +5 ⭐");
        }
    } else if (lvl === 'B1' || lvl === 'B2' || lvl === 'B3' || lvl === 'Intermediate') {
        // Task 0: Ôn tập 15 thẻ Hộp Leitner...
        if (progress.flashcards >= 15 && !state.roadmapTasks[0].completed) {
            state.roadmapTasks[0].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Ôn tập 15 thẻ Flashcard!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Ôn tập 15 thẻ Flashcard! +5 ⭐");
        }
        // Task 1: Đạt từ 7/10 điểm trắc nghiệm Thành ngữ & Cụm từ
        if (progress.quizCorrect >= 7 && progress.quizCategory === 'idioms' && !state.roadmapTasks[1].completed) {
            state.roadmapTasks[1].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Đạt 7/10 trắc nghiệm Thành ngữ!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Đạt 7/10 trắc nghiệm Thành ngữ! +5 ⭐");
        }
        // Task 2: Học 5 mẫu câu đàm thoại...
        if (progress.sentences >= 5 && !state.roadmapTasks[2].completed) {
            state.roadmapTasks[2].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Học 5 mẫu câu đàm thoại!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Học 5 mẫu câu đàm thoại! +5 ⭐");
        }
    } else { // Advanced
        // Task 0: Chinh phục 15 từ vựng học thuật IELTS nâng cao
        if (progress.flashcards >= 15 && !state.roadmapTasks[0].completed) {
            state.roadmapTasks[0].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Chinh phục 15 từ học thuật!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Chinh phục 15 từ học thuật! +5 ⭐");
        }
        // Task 1: Đạt điểm tối đa 10/10 Quiz học thuật nâng cao
        if (progress.quizCorrect === 10 && progress.quizCategory === 'academic' && !state.roadmapTasks[1].completed) {
            state.roadmapTasks[1].completed = true;
            changed = true;
            awardStars(10, "Hoàn thành: Đạt 10/10 Quiz học thuật!");
            showToastNotification("🏆 Hoàn thành nhiệm vụ: Đạt 10/10 Quiz học thuật! +10 ⭐");
        }
        // Task 2: Luyện đọc hiểu 4 mẫu câu giao tiếp công sở phức tạp
        if (progress.sentences >= 4 && !state.roadmapTasks[2].completed) {
            state.roadmapTasks[2].completed = true;
            changed = true;
            awardStars(5, "Hoàn thành: Luyện đọc hiểu 4 câu giao tiếp!");
            showToastNotification("🎉 Hoàn thành nhiệm vụ: Luyện đọc hiểu 4 câu giao tiếp! +5 ⭐");
        }
    }
    
    if (changed) {
        saveStatsToStorage();
        renderRoadmap();
    }
}

function renderRoadmap() {
    const container = document.getElementById('dashboard-roadmap-panel');
    if (!container) return;

    if (!state.userLevel) {
        // Unassessed State
        container.innerHTML = `
            <div class="roadmap-unassessed">
                <h3>📈 Khởi tạo Lộ trình Học tập Cá nhân hóa</h3>
                <p>Bạn chưa thực hiện bài đánh giá trình độ năng lực ban đầu. Hãy hoàn thành một lượt trắc nghiệm xếp lớp gồm 10 câu hỏi để khám phá thế mạnh, điểm yếu và nhận lộ trình học tối ưu riêng biệt!</p>
                <button class="btn-primary animate-glow" id="btn-roadmap-start-quiz" style="padding: 10px 20px; font-size:13px; border-radius:30px;">Làm bài đánh giá ngay</button>
            </div>
        `;
        document.getElementById('btn-roadmap-start-quiz').addEventListener('click', () => {
            // Switch to Quiz tab
            document.getElementById('btn-quiz').click();
            // Select assessment category
            document.getElementById('quiz-category-select').value = 'assessment';
            // Trigger start quiz
            document.getElementById('btn-start-quiz').click();
        });
        return;
    }

    if (!state.roadmapTasks || state.roadmapTasks.length < 3) {
        state.roadmapTasks = generateRoadmapTasks(state.userLevel || 'A1');
    }

    // Assessed State - Render dynamic roadmap!
    let badgeClass = 'beginner';
    let levelVN = 'Sơ cấp (A1-A2)';
    let analysisVN = 'Bạn đang ở trình độ sơ cấp. Lộ trình tối ưu: Tập trung 100% học bộ từ vựng giao tiếp thiết yếu <b>Oxford Essential</b> và thực hành thẻ ghi nhớ Leitner mỗi ngày để củng cố nền tảng.';
    let recommendations = [
        { cat: 'Oxford Essential', action: 'Học ngay', key: 'oxford' },
        { cat: 'Giao tiếp hàng ngày', action: 'Xem mẫu câu', key: 'communicative' }
    ];

    const currentLvl = state.userLevel || 'A1';

    if (currentLvl === 'A1' || currentLvl === 'A2' || currentLvl === 'A3') {
        badgeClass = 'beginner';
        levelVN = `Sơ cấp (${currentLvl})`;
        analysisVN = `Bạn đang ở trình độ ${getCEFRLevelDisplayName(currentLvl)}. Lộ trình tối ưu: Tập trung 100% học bộ từ vựng giao tiếp thiết yếu <b>Oxford Essential</b> và thực hành thẻ ghi nhớ Leitner mỗi ngày để củng cố nền tảng.`;
        recommendations = [
            { cat: 'Oxford Essential', action: 'Học ngay', key: 'oxford' },
            { cat: 'Giao tiếp hàng ngày', action: 'Xem mẫu câu', key: 'communicative' }
        ];
    } else if (currentLvl === 'B1' || currentLvl === 'B2' || currentLvl === 'B3') {
        badgeClass = 'intermediate';
        levelVN = `Trung cấp (${currentLvl})`;
        analysisVN = `Bạn đã có phản xạ từ vựng khá vững vàng ở trình độ ${getCEFRLevelDisplayName(currentLvl)}. Lộ trình tối ưu: Luyện tập xen kẽ bộ từ <b>Oxford Essential</b> kết hợp với <b>Thành ngữ giao tiếp (Idioms)</b> để tự tin giao tiếp tự nhiên hơn.`;
        recommendations = [
            { cat: 'Idioms & Phrases', action: 'Luyện tập', key: 'idioms' },
            { cat: 'Giao tiếp hàng ngày', action: 'Học mẫu câu', key: 'communicative' }
        ];
    } else if (currentLvl === 'C1' || currentLvl === 'C2') {
        badgeClass = 'advanced';
        levelVN = `Cao cấp (${currentLvl})`;
        analysisVN = `Tuyệt vời! Vốn từ và khả năng hiểu của bạn rất rộng ở trình độ ${getCEFRLevelDisplayName(currentLvl)}. Lộ trình tối ưu: Tập trung chinh phục bộ từ <b>Academic & IELTS</b> nâng cao và làm quen các mẫu câu đàm phán, thuyết trình tại công sở.`;
        recommendations = [
            { cat: 'Academic & IELTS', action: 'Chinh phục', key: 'academic' },
            { cat: 'Giao tiếp công sở', action: 'Xem mẫu câu', key: 'communicative' }
        ];
    }

    // Build milestones checklist HTML
    let tasksHTML = '';
    state.roadmapTasks.forEach((task, idx) => {
        tasksHTML += `
            <div class="roadmap-task-item ${task.completed ? 'completed' : ''}" data-index="${idx}">
                <div class="roadmap-task-checkbox">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="roadmap-task-text">${task.text}</div>
            </div>
        `;
    });

    // Build recommendations HTML
    let recsHTML = '';
    recommendations.forEach(rec => {
        recsHTML += `
            <div class="rec-item">
                <span class="rec-category">${rec.cat}</span>
                <span class="rec-action" data-key="${rec.key}">${rec.action} →</span>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="roadmap-grid">
            <!-- Left Column: Competency Badge & Analysis -->
            <div class="roadmap-left-col">
                <div class="roadmap-level-header">
                    <span class="roadmap-level-title">Trình độ của bạn</span>
                    <div class="level-badge ${badgeClass}">${levelVN}</div>
                </div>
                <div class="roadmap-analysis">
                    <h4>🎯 Nhận định lộ trình học</h4>
                    <p>${analysisVN}</p>
                </div>
            </div>

            <!-- Right Column: Interactive Checklist & Rec Decks -->
            <div class="roadmap-right-col">
                <h3>📝 Nhiệm vụ ngày của bạn</h3>
                <div class="roadmap-tasks-list">
                    ${tasksHTML}
                </div>
                
                <h3 style="margin-top: 16px;">💡 Tài liệu gợi ý học</h3>
                <div class="roadmap-rec-list">
                    ${recsHTML}
                </div>
            </div>
        </div>
    `;

    // Bind event listeners for dynamic items
    // 1. Checklist toggling is now fully automated via trackDailyActivity!

    // 2. Recommendation links navigation
    container.querySelectorAll('.rec-action').forEach(action => {
        action.addEventListener('click', () => {
            const key = action.getAttribute('data-key');
            if (key === 'communicative') {
                document.getElementById('btn-sentences').click();
            } else {
                document.getElementById('btn-flashcard').click();
                document.getElementById('flashcard-category').value = key;
                initFlashcardSession(key);
            }
        });
    });
}

// --- PERSONAL WORDBOOK MANAGEMENT ---

function renderWordbook(searchTerm = '') {
    const listContainer = document.getElementById('custom-words-list');
    const wordCountBadge = document.getElementById('custom-word-count');

    // Filter by search
    const filtered = state.customWords.filter(w => 
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    wordCountBadge.textContent = state.customWords.length;

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state-list text-center">
                <div class="empty-icon">📂</div>
                <h4>Không tìm thấy từ nào phù hợp</h4>
                <p>Hãy thử tìm bằng từ khác hoặc thêm từ mới bên cạnh.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'custom-vocab-card';
        card.innerHTML = `
            <div class="vocab-card-header">
                <h4 class="vocab-card-title">${item.word}</h4>
                <span class="vocab-card-type">${item.type}</span>
            </div>
            <p class="vocab-card-ipa">${item.ipa || ''}</p>
            <p class="vocab-card-meaning">${item.meaning}</p>
            <div class="vocab-card-example">
                <p class="example-en" style="font-size:11px; margin-bottom: 2px;">"${item.example || ''}"</p>
                <p class="example-vi" style="font-size:10px;">"${item.example_vi || ''}"</p>
            </div>
            <div class="vocab-card-actions">
                <button class="btn-voice-small btn-speak" title="Phát âm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <button class="btn-card-delete btn-delete">Xóa bỏ</button>
            </div>
        `;

        // Event listener voice
        card.querySelector('.btn-speak').addEventListener('click', () => speakEnglish(item.word));
        // Event listener delete
        card.querySelector('.btn-delete').addEventListener('click', () => deleteWordFromWordbook(item.id));

        listContainer.appendChild(card);
    });
}

async function handleAddWordForm(e) {
    e.preventDefault();

    const wordVal = document.getElementById('form-word').value.trim();
    const typeVal = document.getElementById('form-type').value;
    const ipaVal = document.getElementById('form-ipa').value.trim();
    const meaningVal = document.getElementById('form-meaning').value.trim();
    const exEnVal = document.getElementById('form-example-en').value.trim();
    const exViVal = document.getElementById('form-example-vi').value.trim();

    if (!wordVal || !meaningVal) return;

    // Check duplicate
    const exists = state.customWords.some(w => w.word.toLowerCase() === wordVal.toLowerCase());
    if (exists) {
        alert('Từ này đã có trong Sổ tay của bạn.');
        return;
    }

    const newWord = {
        id: 'cust-' + Date.now(),
        word: wordVal,
        type: typeVal,
        ipa: ipaVal,
        meaning: meaningVal,
        example: exEnVal,
        example_vi: exViVal,
        category: 'custom',
        box: 1,
        nextReview: 0 // review immediately
    };

    state.customWords.push(newWord);
    await saveCustomWordsToStorage();
    awardStars(5, `Thêm từ mới "${wordVal}" vào Sổ tay`);

    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        window.FirebaseSync.saveCustomWord(newWord);
    }

    // Reset Form
    document.getElementById('add-word-form').reset();

    // Sync
    renderWordbook();
    renderDashboard();
    
    alert(`🎉 Đã thêm thành công từ "${wordVal}" vào Sổ tay của bạn!`);
}

async function deleteWordFromWordbook(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa từ này khỏi Sổ tay?')) return;

    state.customWords = state.customWords.filter(w => w.id !== id);
    await saveCustomWordsToStorage();

    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        window.FirebaseSync.deleteCustomWord(id);
    }

    // Sync
    renderWordbook();
    renderDashboard();
}

// --- INTERACTIVE GRAMMAR LEARNING CONTROLLER ---

let activeGrammarCategory = 'all';

function renderGrammarLessons(category = 'all') {
    activeGrammarCategory = category;
    const listContainer = document.getElementById('grammar-lessons-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const filtered = category === 'all'
        ? [...GRAMMAR_LESSONS]
        : GRAMMAR_LESSONS.filter(l => l.category === category);

    // Deterministic daily grammar recommendation based on current date
    const dateNum = new Date().getDate();
    const recommendedIndex = dateNum % GRAMMAR_LESSONS.length;
    const recommendedId = GRAMMAR_LESSONS[recommendedIndex].id;

    // Place today's recommended lesson at the very top of the list
    filtered.sort((a, b) => {
        if (a.id === recommendedId) return -1;
        if (b.id === recommendedId) return 1;
        return 0;
    });

    filtered.forEach(lesson => {
        const card = document.createElement('div');
        const isActive = currentGrammarLesson && currentGrammarLesson.id === lesson.id;
        const studyCount = state.completedLessons.filter(id => id === lesson.id).length;
        const isCompleted = studyCount > 0;
        const isRecommended = lesson.id === recommendedId;

        card.className = `grammar-lesson-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isRecommended ? 'recommended' : ''}`;
        
        let catBadgeText = lesson.category === 'tenses' ? 'Thì câu' : 'Cấu trúc';
        let statusText = isCompleted ? `Đã học ${studyCount} lần ⚡` : 'Chưa học 📖';
        let recBadge = isRecommended ? `<span class="badge badge-recommend">Gợi ý hôm nay 🎯</span>` : '';

        card.innerHTML = `
            <div class="card-title-row">
                <h4>${lesson.title}</h4>
                ${recBadge}
            </div>
            <p>${lesson.description}</p>
            <div class="card-meta">
                <span class="badge badge-${lesson.category}">${catBadgeText}</span>
                <span class="status-indicator">${statusText}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            // Remove active from others
            document.querySelectorAll('.grammar-lesson-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            loadGrammarLesson(lesson.id);
        });

        listContainer.appendChild(card);
    });
}

function loadGrammarLesson(lessonId) {
    const lesson = GRAMMAR_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;

    currentGrammarLesson = lesson;
    
    // Hide empty state, show viewer
    document.getElementById('grammar-empty-state').classList.add('hidden');
    const viewer = document.getElementById('grammar-lesson-viewer');
    viewer.classList.remove('hidden');

    // Populate data
    document.getElementById('lesson-view-title').textContent = lesson.title;
    
    const catBadge = document.getElementById('lesson-view-category');
    catBadge.textContent = lesson.category === 'tenses' ? 'Thì trong tiếng Anh' : 'Cấu trúc câu';
    catBadge.className = `badge badge-${lesson.category}`;

    // Study frequency badge
    const studyCount = state.completedLessons.filter(id => id === lesson.id).length;
    const countBadge = document.getElementById('lesson-view-count');
    if (countBadge) {
        if (studyCount === 0) {
            countBadge.innerHTML = `🌱 Chưa học lần nào`;
            countBadge.style.background = 'rgba(239, 68, 68, 0.15)';
            countBadge.style.color = '#f87171';
            countBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        } else {
            countBadge.innerHTML = `⚡ Đã học: ${studyCount} lần`;
            countBadge.style.background = 'rgba(16, 185, 129, 0.15)';
            countBadge.style.color = '#34d399';
            countBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        }
    }

    document.getElementById('lesson-view-description').textContent = lesson.description;
    document.getElementById('lesson-view-formula').textContent = lesson.formula;

    // Render usages
    const usageUl = document.getElementById('lesson-view-usage');
    usageUl.innerHTML = lesson.usage.map(u => `<li>${u}</li>`).join('');

    // Render examples
    const examplesDiv = document.getElementById('lesson-view-examples');
    examplesDiv.innerHTML = '';

    lesson.examples.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'grammar-example-item';
        item.innerHTML = `
            <div class="example-texts">
                <span class="example-en">${ex.en}</span>
                <span class="example-vi">${ex.vi}</span>
            </div>
            <div class="play-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </div>
        `;

        item.addEventListener('click', () => {
            speakEnglish(ex.en);
        });

        examplesDiv.appendChild(item);
    });

    // Reset practice panels
    document.getElementById('grammar-practice-entry').classList.remove('hidden');
    document.getElementById('grammar-practice-panel').classList.add('hidden');
    document.getElementById('grammar-success-panel').classList.add('hidden');
    
    // Streak check on studying lesson
    checkAndUpdateStreak();
    renderDashboard();
}

function initGrammarPractice() {
    if (!currentGrammarLesson) return;

    grammarPracticeIndex = 0;
    grammarPracticeScore = 0;

    // Hide entry block & success, show quiz panel
    document.getElementById('grammar-practice-entry').classList.add('hidden');
    document.getElementById('grammar-success-panel').classList.add('hidden');
    document.getElementById('grammar-practice-panel').classList.remove('hidden');

    loadGrammarPracticeQuestion();
}

function loadGrammarPracticeQuestion() {
    const lesson = currentGrammarLesson;
    const question = lesson.practice[grammarPracticeIndex];

    // Update progress numbers
    document.getElementById('grammar-practice-step').textContent = `Câu ${grammarPracticeIndex + 1} / ${lesson.practice.length}`;
    const pct = ((grammarPracticeIndex) / lesson.practice.length) * 100;
    document.getElementById('grammar-practice-progress').style.width = `${pct}%`;

    // Clear explanation
    document.getElementById('grammar-explanation-box').classList.add('hidden');

    // Populate question
    document.getElementById('grammar-practice-question').textContent = question.q;

    // Populate options
    const optionsDiv = document.getElementById('grammar-practice-options');
    optionsDiv.innerHTML = '';

    question.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'practice-opt-btn';
        btn.textContent = opt;

        btn.addEventListener('click', () => {
            answerGrammarPracticeQuestion(idx);
        });

        optionsDiv.appendChild(btn);
    });
}

function answerGrammarPracticeQuestion(selectedIndex) {
    const lesson = currentGrammarLesson;
    const question = lesson.practice[grammarPracticeIndex];
    const optionBtns = document.querySelectorAll('.practice-opt-btn');

    // Disable all options
    optionBtns.forEach(btn => btn.disabled = true);

    const isCorrect = selectedIndex === question.answer;

    // Highlight
    if (isCorrect) {
        optionBtns[selectedIndex].classList.add('correct');
        grammarPracticeScore++;
        speakEnglish("Excellent");
    } else {
        optionBtns[selectedIndex].classList.add('incorrect');
        optionBtns[question.answer].classList.add('correct');
        speakEnglish("Incorrect");
    }

    // Explanation details
    const explanationBox = document.getElementById('grammar-explanation-box');
    const badge = document.getElementById('grammar-result-badge');
    const text = document.getElementById('grammar-explanation-text');

    if (isCorrect) {
        badge.textContent = 'Chính xác! 🎉';
        badge.className = 'result-badge correct-badge';
    } else {
        badge.textContent = 'Chưa chính xác ❌';
        badge.className = 'result-badge incorrect-badge';
    }

    text.textContent = question.explanation;
    explanationBox.classList.remove('hidden');
}

function nextGrammarPracticeQuestion() {
    const lesson = currentGrammarLesson;
    grammarPracticeIndex++;

    if (grammarPracticeIndex < lesson.practice.length) {
        loadGrammarPracticeQuestion();
    } else {
        // End of practice! Show Success Panel
        document.getElementById('grammar-practice-panel').classList.add('hidden');
        document.getElementById('grammar-success-panel').classList.remove('hidden');

        // Count how many times completed before this attempt
        const studyCountBefore = state.completedLessons.filter(id => id === lesson.id).length;
        
        state.completedLessons.push(lesson.id);
        saveStatsToStorage();

        const totalTimes = studyCountBefore + 1;
        const successTitleEl = document.getElementById('grammar-success-title');
        const successMsgEl = document.getElementById('grammar-success-msg');

        if (studyCountBefore === 0) {
            awardStars(5, `Hoàn thành bài học "${lesson.title}"`);
            if (successTitleEl) successTitleEl.textContent = `🎉 Tuyệt vời! Hoàn thành bài học!`;
            if (successMsgEl) {
                successMsgEl.innerHTML = `Chúc mừng bạn đã học thành công chủ điểm <strong>"${lesson.title}"</strong> lần đầu tiên! Bạn nhận được <strong>+5 Ngôi sao vàng ⭐</strong>.<br><br>💡 <em>Mẹo nhỏ: Học đi học lại nhiều lần sẽ giúp biến kiến thức ngữ pháp thành phản xạ tự nhiên của bạn!</em>`;
            }
        } else {
            awardStars(2, `Ôn tập thành công bài "${lesson.title}" (Lần ${totalTimes})`);
            if (successTitleEl) successTitleEl.textContent = `🔥 Xuất sắc! Ôn tập liên tục!`;
            if (successMsgEl) {
                successMsgEl.innerHTML = `Bạn vừa xuất sắc ôn tập thành công chủ điểm <strong>"${lesson.title}"</strong> (Lần thứ <strong>${totalTimes}</strong>)! Bạn nhận được thêm <strong>+2 Ngôi sao vàng ⭐</strong>.<br><br>🚀 <em>Tuyệt vời! Bạn đang củng cố trí nhớ dài hạn cực kỳ tốt. Hãy duy trì phong độ và tiếp tục ôn tập nhé!</em>`;
            }
        }

        // Re-render sidebar list to update "Đã xong ✅" status badge
        renderGrammarLessons(activeGrammarCategory);
    }
}

// --- COMMUNICATIVE SENTENCES RENDERER ---

function renderSentences(category = 'all') {
    const container = document.getElementById('sentences-list-container');
    if (!container) return;
    
    // Filter sentences by category
    const baseFiltered = category === 'all' 
        ? [...COMMUNICATIVE_SENTENCES] 
        : COMMUNICATIVE_SENTENCES.filter(s => s.category === category);

    // Safeguard completedSentences array
    if (!state.completedSentences) {
        state.completedSentences = [];
    }

    const learned = [];
    const unlearned = [];

    baseFiltered.forEach(s => {
        if (state.completedSentences.includes(s.english)) {
            learned.push(s);
        } else {
            unlearned.push(s);
        }
    });

    // Shuffle only the uncompleted (unlearned) sentences to make each practice deck random and dynamic!
    const shuffledUnlearned = unlearned.sort(() => Math.random() - 0.5);

    // Combine: active randomized learning first, completed achievements at the bottom
    const finalSentences = [...shuffledUnlearned, ...learned];

    container.innerHTML = '';

    finalSentences.forEach(item => {
        const card = document.createElement('div');
        const isLearned = state.completedSentences.includes(item.english);
        
        card.className = `sentence-card ${isLearned ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="sentence-card-content">
                <div class="sentence-header-row">
                    <span class="sentence-tag">${item.category}</span>
                    ${isLearned ? '<span class="sentence-learned-badge">Đã thuộc ✅</span>' : ''}
                </div>
                <p class="sentence-en">${item.english}</p>
                <p class="sentence-vi">${item.vietnamese}</p>
            </div>
            <div class="sentence-actions">
                <button class="sentence-action-btn btn-speak" title="Phát âm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <button class="sentence-action-btn btn-check ${isLearned ? 'active' : ''}" title="${isLearned ? 'Học lại' : 'Đánh dấu đã thuộc'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
            </div>
        `;

        // Click on the text area triggers speech pronunciation
        card.querySelector('.sentence-card-content').addEventListener('click', () => {
            speakEnglish(item.english);
            checkAndUpdateStreak();
            renderDashboard();
        });

        // Click on specific speak button
        card.querySelector('.btn-speak').addEventListener('click', (e) => {
            e.stopPropagation();
            speakEnglish(item.english);
            checkAndUpdateStreak();
            renderDashboard();
        });

        // Click on checkmark button to mark/unmark as learned
        card.querySelector('.btn-check').addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isLearned) {
                state.completedSentences.push(item.english);
                saveStatsToStorage();
                trackDailyActivity('sentence', 1);
                awardStars(1, `Đã thuộc câu giao tiếp: "${item.english.substring(0, 20)}..."`);
            } else {
                state.completedSentences = state.completedSentences.filter(s => s !== item.english);
                saveStatsToStorage();
            }
            // Trigger a re-render which shuffles the remaining uncompleted deck and pushes this one down
            renderSentences(category);
        });

        container.appendChild(card);
    });
}

// --- TABS ROUTER & MENU NAVIGATION ---

function setUpTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Tự động đóng sidebar drawer di động sau khi chuyển mục học tập
            closeMobileMenu();
            
            // Toggle active menu states
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Hide/Show correct panels
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Special tab trigger initializations
            if (targetId === 'flashcard-tab') {
                const category = document.getElementById('flashcard-category').value;
                initFlashcardSession(category);
            } else if (targetId === 'wordbook-tab') {
                renderWordbook();
            } else if (targetId === 'sentences-tab') {
                renderSentences();
            } else if (targetId === 'grammar-tab') {
                renderGrammarLessons();
            } else if (targetId === 'dashboard-tab') {
                renderDashboard();
            } else if (targetId === 'leaderboard-tab') {
                renderLeaderboard();
            } else if (targetId === 'translation-tab') {
                initTranslation();
                initLongTranslation();
            } else if (targetId === 'writing-tab') {
                initWritingRoom();
            } else if (targetId === 'podcast-tab') {
                initPodcastRoom();
            }
        });
    });
}

// --- MOBILE RESPONSIVE DRAWER CORE FUNCTIONS ---

function openMobileMenu() {
    const hamburger = document.getElementById('btn-hamburger');
    const appHeader = document.getElementById('app-header');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (hamburger && appHeader && overlay) {
        hamburger.classList.add('open');
        appHeader.classList.add('menu-active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang nền
    }
}

function closeMobileMenu() {
    const hamburger = document.getElementById('btn-hamburger');
    const appHeader = document.getElementById('app-header');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (hamburger && appHeader && overlay) {
        hamburger.classList.remove('open');
        appHeader.classList.remove('menu-active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Mở khóa cuộn trang nền
    }
}

function initMobileMenuListeners() {
    const hamburger = document.getElementById('btn-hamburger');
    const closeBtn = document.getElementById('btn-close-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = hamburger.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}

// --- EVENT LISTENERS INITIALIZATION ---

function initApp() {
    // Load local state and render dashboard immediately on startup (Offline-First!)
    (async () => {
        try {
            await loadStateAsync();
            renderDashboard();

            // Setup Firebase Sync sequentially AFTER local DB load completes (No more race conditions!)
            if (window.FirebaseSync) {
                setupAuthAndSync();
            } else {
                window.addEventListener('FirebaseSyncReady', setupAuthAndSync);
            }

            // Safety timeout fallback (3 seconds) to ensure Guest Mode works if network is down or sync hangs
            setTimeout(() => {
                if (!isCloudMode && !window.hasBoundAuthListener) {
                    console.warn("⚠️ Firebase sync load timed out. Running in guest fallback.");
                    const authOverlay = document.getElementById('auth-overlay');
                    const guestBanner = document.getElementById('guest-mode-banner');
                    if (authSkip) {
                        if (authOverlay) authOverlay.classList.add('hidden');
                        if (guestBanner) guestBanner.classList.remove('hidden');
                    }
                }
            }, 3000);
        } catch (err) {
            console.error("Error loading initial local state:", err);
            
            // Fast failover to Firebase sync setup even if IndexedDB fails
            if (window.FirebaseSync) {
                setupAuthAndSync();
            } else {
                window.addEventListener('FirebaseSyncReady', setupAuthAndSync);
            }
        }
    })();

    // 0. Setup mobile navigation drawer triggers
    initMobileMenuListeners();

    // 1. Tab Routing Setup
    setUpTabNavigation();

    // 1b. Grammar UI Event Listeners Setup
    const grammarCatButtons = document.querySelectorAll('.grammar-cat-btn');
    grammarCatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            grammarCatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGrammarLessons(btn.getAttribute('data-cat'));
        });
    });

    document.getElementById('btn-start-grammar-practice').addEventListener('click', initGrammarPractice);
    document.getElementById('btn-grammar-next').addEventListener('click', nextGrammarPracticeQuestion);
    document.getElementById('btn-grammar-back-lesson').addEventListener('click', () => {
        if (currentGrammarLesson) {
            loadGrammarLesson(currentGrammarLesson.id);
        }
    });

    // 2. Bind Auth UI buttons
    document.getElementById('btn-google-login').addEventListener('click', handleGoogleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleGoogleLogout);
    document.getElementById('btn-auth-skip').addEventListener('click', skipAuthOverlay);
    document.getElementById('btn-trigger-login').addEventListener('click', showAuthOverlay);

    // CEFR Entrance Placement Test Event Listeners
    const btnStartPlacement = document.getElementById('btn-start-placement');
    const btnSkipPlacement = document.getElementById('btn-skip-placement');
    const btnEnterRoadmap = document.getElementById('btn-enter-roadmap');

    if (btnStartPlacement) btnStartPlacement.addEventListener('click', startPlacementTestQuiz);
    if (btnSkipPlacement) btnSkipPlacement.addEventListener('click', skipPlacementTestQuiz);
    if (btnEnterRoadmap) btnEnterRoadmap.addEventListener('click', closePlacementTestModal);

    // 3. Setup Firebase Auth & Data Sync Listener
    function setupAuthAndSync() {
        if (!window.FirebaseSync) return;
        
        // Prevent double binding
        if (window.hasBoundAuthListener) return;
        window.hasBoundAuthListener = true;
        
        console.log("🔥 FirebaseSync loaded, setting up Auth state listener...");
        
        window.FirebaseSync.onStateChanged(async (user) => {
            const authOverlay = document.getElementById('auth-overlay');
            const profileCard = document.getElementById('user-profile-card');
            const guestBanner = document.getElementById('guest-mode-banner');

            if (user) {
                // Cloud Mode Activated!
                isCloudMode = true;
                if (authOverlay) authOverlay.classList.add('hidden');
                if (profileCard) profileCard.classList.remove('hidden');
                if (guestBanner) guestBanner.classList.add('hidden');

                // Save email, display name and Google Photo to state
                state.currentUserEmail = user.email || '';
                state.displayName = state.displayName || user.displayName || '';
                state.googlePhotoURL = user.photoURL || '';

                // Render User Profile Card
                renderUserAvatar(state.photoURL || user.photoURL);
                const userNameEl = document.getElementById('user-display-name');
                if (userNameEl) userNameEl.textContent = state.displayName || 'Học viên';

                // Allow edit pointer and show edit badge
                const avatarBtn = document.getElementById('btn-open-avatar-modal');
                if (avatarBtn) avatarBtn.style.cursor = 'pointer';
                const editOverlay = document.querySelector('.avatar-edit-overlay');
                if (editOverlay) editOverlay.style.display = 'flex';

                // Render local dashboard immediately to prevent "loading user data forever" visual hang
                renderDashboard();

                console.log("☁️ Syncing database progress with Firebase...");
                
                try {
                    // 5-second timeout promise for cloud loading
                    const timeout = (ms) => new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Timeout")), ms)
                    );
                    
                    const cloudData = await Promise.race([
                        window.FirebaseSync.loadUserData(),
                        timeout(5000)
                    ]);

                    if (cloudData) {
                        // Update local state with cloud data
                        if (cloudData.profile) {
                            state.streak = cloudData.profile.streak || 0;
                            state.lastStudyDate = cloudData.profile.lastStudyDate || '';
                            state.quizStats = cloudData.profile.quizStats || { totalAnswered: 0, correctAnswers: 0 };
                            state.userLevel = cloudData.profile.userLevel || '';
                            state.roadmapTasks = cloudData.profile.roadmapTasks || [];
                            if (!state.roadmapTasks || state.roadmapTasks.length < 3) {
                                state.roadmapTasks = generateRoadmapTasks(state.userLevel || 'A1');
                            }
                            state.stars = cloudData.profile.stars || 0;
                            state.photoURL = cloudData.profile.photoURL || '';
                            state.displayName = cloudData.profile.name || state.displayName || user.displayName || '';
                            renderUserAvatar(state.photoURL || user.photoURL);
                            const userNameEl2 = document.getElementById('user-display-name');
                            if (userNameEl2) userNameEl2.textContent = state.displayName || 'Học viên';
                            updateSidebarStreakUI();
                        }
                        if (cloudData.customWords) {
                            state.customWords = cloudData.customWords;
                        }
                        if (cloudData.progress && cloudData.progress.length > 0) {
                            // Merge box progress back into default vocabulary list
                            cloudData.progress.forEach(progress => {
                                const idx = state.vocabulary.findIndex(w => w.id === progress.id);
                                if (idx !== -1) {
                                    state.vocabulary[idx].box = progress.box;
                                    state.vocabulary[idx].nextReview = progress.nextReview;
                                }
                            });
                        }

                        // Sync local backup
                        await saveVocabToStorage();
                        await saveCustomWordsToStorage();
                        await saveStatsToStorage();
                    } else {
                        // Brand new Firebase user, write current state (initial deck) up to cloud
                        await syncCurrentStateToCloud();
                    }
                } catch (error) {
                    console.warn("⚠️ Firebase sync delayed or timed out. Operating in offline-fallback mode.", error);
                    showToastNotification("⚠️ Kết nối mạng không ổn định. Đang tải dữ liệu từ bộ nhớ cục bộ!");
                }

                // Re-render views with up-to-date user specific data
                renderDashboard();
            } else {
                // Not authenticated (either Firebase is not configured, or user signed out, or skipped)
                isCloudMode = false;
                if (profileCard) profileCard.classList.remove('hidden');

                // Cleanse Cached Profile Details on Logout
                state.displayName = "";
                state.photoURL = "";
                state.googlePhotoURL = "";
                state.currentUserEmail = "";

                // Clear in storage
                await LearningDB.setProgress('display_name', '');
                await LearningDB.setProgress('photo_url', '');
                await LearningDB.setProgress('google_photo_url', '');
                await LearningDB.setProgress('user_email', '');
                localStorage.removeItem('vocabflow_display_name');
                localStorage.removeItem('vocabflow_photo_url');

                // Render Guest profile values (force default guest avatar and name)
                renderUserAvatar('emoji:🦊');
                const userNameEl = document.getElementById('user-display-name');
                if (userNameEl) userNameEl.textContent = 'Học viên (Khách)';

                // Disable edit pointer and hide edit badge
                const avatarBtn = document.getElementById('btn-open-avatar-modal');
                if (avatarBtn) avatarBtn.style.cursor = 'default';
                const editOverlay = document.querySelector('.avatar-edit-overlay');
                if (editOverlay) editOverlay.style.display = 'none';

                const logoutBtn = document.getElementById('btn-logout');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Đăng nhập';
                    logoutBtn.title = 'Đăng nhập tài khoản Google';
                }

                // Hide avatar modal if open
                const avatarModal = document.getElementById('avatar-modal');
                if (avatarModal) avatarModal.classList.add('hidden');

                if (window.FirebaseSync.isConfigured) {
                    // Firebase is configured, but no user is signed in
                    if (authSkip) {
                        // User clicked skip, let them work in Guest mode
                        if (authOverlay) authOverlay.classList.add('hidden');
                        if (guestBanner) guestBanner.classList.remove('hidden');
                    } else {
                        // Force login overlay
                        if (authOverlay) authOverlay.classList.remove('hidden');
                        if (guestBanner) guestBanner.classList.add('hidden');
                    }
                } else {
                    // Firebase is not configured at all (default app out of the box)
                    if (authOverlay) authOverlay.classList.add('hidden');
                    if (guestBanner) guestBanner.classList.remove('hidden');
                    const bannerText = guestBanner ? guestBanner.querySelector('.banner-text') : null;
                    if (bannerText) bannerText.textContent = 'Chế độ Khách (Offline)';
                }

                // Re-render dashboard for Guest
                renderDashboard();
            }
        });
    }



    // 4. Wordbook Submit Action
    document.getElementById('add-word-form').addEventListener('submit', handleAddWordForm);

    // Avatar Selector Dialog bindings
    const avatarOpenBtn = document.getElementById('btn-open-avatar-modal');
    if (avatarOpenBtn) {
        avatarOpenBtn.addEventListener('click', (e) => {
            if (e) e.stopPropagation();
            if (!isCloudMode || !state.currentUserEmail) {
                alert("Vui lòng đăng nhập bằng Google để đổi tên và ảnh đại diện!");
                return;
            }
            document.getElementById('avatar-modal').classList.remove('hidden');
            const nameInput = document.getElementById('input-profile-name');
            if (nameInput) {
                nameInput.value = state.displayName || '';
            }
            
            // Dynamically show/hide Google avatar sync button based on cloud status
            const googleBtn = document.getElementById('btn-avatar-use-google');
            if (googleBtn) {
                googleBtn.style.display = isCloudMode ? 'block' : 'none';
            }
            
            renderAvatarModalChoices();
        });
    }
    
    const avatarCancelBtn = document.getElementById('btn-avatar-cancel');
    if (avatarCancelBtn) {
        avatarCancelBtn.addEventListener('click', () => {
            document.getElementById('avatar-modal').classList.add('hidden');
        });
    }

    const avatarSaveBtn = document.getElementById('btn-avatar-save');
    if (avatarSaveBtn) {
        avatarSaveBtn.addEventListener('click', async () => {
            const nameInput = document.getElementById('input-profile-name');
            const newName = nameInput ? nameInput.value.trim() : '';
            if (newName) {
                state.displayName = newName;
                document.getElementById('user-display-name').textContent = newName;
            }
            
            if (typeof tempSelectedAvatar !== 'undefined' && tempSelectedAvatar) {
                state.photoURL = tempSelectedAvatar;
                renderUserAvatar(tempSelectedAvatar);
            }
            
            // Save locally & Sync to Firebase Firestore
            await saveStatsToStorage();
            
            document.getElementById('avatar-modal').classList.add('hidden');
            showToastNotification("👤 Đã cập nhật hồ sơ cá nhân thành công!");
            awardStars(5, "Cập nhật hồ sơ cá nhân");
        });
    }
    
    const avatarGoogleBtn = document.getElementById('btn-avatar-use-google');
    if (avatarGoogleBtn) {
        avatarGoogleBtn.addEventListener('click', () => {
            state.photoURL = '';
            renderUserAvatar(state.googlePhotoURL);
            saveStatsToStorage();
            document.getElementById('avatar-modal').classList.add('hidden');
            awardStars(2, "Đồng bộ lại ảnh đại diện Google");
        });
    }

    // 5. Wordbook Search Filter
    document.getElementById('search-wordbook').addEventListener('input', (e) => {
        renderWordbook(e.target.value);
    });

    // 6. Flashcards Interactions
    const flashcardEl = document.getElementById('flashcard-element');
    flashcardEl.addEventListener('click', toggleCardFlip);

    document.getElementById('btn-card-flip').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCardFlip();
    });

    document.getElementById('card-speak-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (flashcardDeck.length > 0) {
            speakEnglish(flashcardDeck[currentCardIndex].word);
        }
    });

    document.getElementById('btn-card-correct').addEventListener('click', (e) => {
        e.stopPropagation();
        handleFlashcardAction(true);
    });

    document.getElementById('btn-card-incorrect').addEventListener('click', (e) => {
        e.stopPropagation();
        handleFlashcardAction(false);
    });

    document.getElementById('flashcard-category').addEventListener('change', (e) => {
        initFlashcardSession(e.target.value);
    });

    // Keyboard Shortcuts for Flashcards
    document.addEventListener('keydown', (e) => {
        // Only run shortcuts if Flashcard tab is active and not writing in inputs
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'flashcard-tab' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                toggleCardFlip();
            } else if (e.key === 'ArrowLeft') {
                handleFlashcardAction(false);
            } else if (e.key === 'ArrowRight') {
                handleFlashcardAction(true);
            } else if (e.key === 'Enter' || e.key.toLowerCase() === 'v') {
                if (flashcardDeck.length > 0) {
                    speakEnglish(flashcardDeck[currentCardIndex].word);
                }
            }
        }
    });

    // 7. Quiz Interactions
    document.getElementById('btn-start-quiz').addEventListener('click', () => {
        const cat = document.getElementById('quiz-category-select').value;
        if (cat === 'assessment') {
            const modal = document.getElementById('placement-test-modal');
            if (modal) {
                modal.classList.remove('hidden');
                document.getElementById('placement-intro-screen').classList.remove('hidden');
                document.getElementById('placement-quiz-screen').classList.add('hidden');
                document.getElementById('placement-result-screen').classList.add('hidden');
            }
        } else {
            initQuizSession(cat);
        }
    });

    document.getElementById('btn-quiz-next').addEventListener('click', handleQuizNext);
    
    document.getElementById('btn-quiz-restart').addEventListener('click', () => {
        const cat = document.getElementById('quiz-category-select').value;
        initQuizSession(cat);
    });

    document.getElementById('btn-quiz-go-dashboard').addEventListener('click', () => {
        document.getElementById('btn-dashboard').click();
    });

    // 8. Sentence category filtering
    document.getElementById('sentence-category-filter').addEventListener('change', (e) => {
        renderSentences(e.target.value);
    });

    // Asynchronously load SpeechSynthesis voices list
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            renderWordOfTheDay();
        };
    }

    // Refresh WOTD event listener
    const refreshWotdBtn = document.getElementById('wotd-refresh-btn');
    if (refreshWotdBtn) {
        refreshWotdBtn.addEventListener('click', () => {
            renderWordOfTheDay(true);
        });
    }
}

// Firebase Auth Actions
async function handleGoogleLogin() {
    try {
        await window.FirebaseSync.login();
    } catch (error) {
        alert('Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng và thử lại!');
    }
}

async function handleGoogleLogout(e) {
    if (e) e.stopPropagation();
    if (!isCloudMode) {
        showAuthOverlay();
        return;
    }
    if (confirm('Bạn có chắc chắn muốn đăng xuất? Dữ liệu của bạn đã được lưu an toàn trên Cloud.')) {
        authSkip = false;
        await window.FirebaseSync.logout();
    }
}

async function skipAuthOverlay() {
    authSkip = true;
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('guest-mode-banner').classList.remove('hidden');
    await loadStateAsync();
    renderDashboard();
}

function showAuthOverlay() {
    authSkip = false;
    document.getElementById('auth-overlay').classList.remove('hidden');
    document.getElementById('guest-mode-banner').classList.add('hidden');
}

// Push all local state up to newly created Firebase profile
async function syncCurrentStateToCloud() {
    if (!window.FirebaseSync || !isCloudMode) return;
    
    // Save streak stats
    await window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL, state.displayName);
    
    // Save custom words
    for (const word of state.customWords) {
        await window.FirebaseSync.saveCustomWord(word);
    }
    
    // Save progress of vocabulary words that are active (box > 1 or reviewed)
    const activeWords = state.vocabulary.filter(w => w.box > 1 || w.nextReview > 0);
    for (const word of activeWords) {
        await window.FirebaseSync.saveProgress(word.id, word.box, word.nextReview);
    }
    
    console.log("Current state successfully synced up to Cloud!");
}

// Start application when DOM loads & Register Service Worker
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Register PWA Service Worker for offline support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('LearningEnglish Service Worker registered successfully:', reg.scope);
                    
                    // Check if there is an update waiting
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        console.log('New content is available; auto-reloading page to apply...');
                                        window.location.reload();
                                    }
                                }
                            };
                        }
                    };
                })
                .catch(err => console.log('LearningEnglish Service Worker registration failed:', err));
        });
        
        // Reload page when new service worker takes over control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
});

// --- GLOBAL GAMIFICATION & STARS CORE FUNCTIONS ---

function awardStars(amount, reason) {
    state.stars += amount;
    saveStatsToStorage();
    renderDashboard();
    
    // Show premium sliding star toast
    showStarToast(amount, reason);
}

function showStarToast(amount, reason) {
    let container = document.getElementById('star-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'star-toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '24px';
        container.style.right = '24px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.border = '1px solid #fbbf24';
    toast.style.borderRadius = '12px';
    toast.style.padding = '12px 20px';
    toast.style.color = '#fff';
    toast.style.boxShadow = '0 10px 25px rgba(251, 191, 36, 0.2)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transform = 'translateY(50px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    toast.innerHTML = `
        <span style="font-size:20px; filter: drop-shadow(0 0 4px #fbbf24);">⭐</span>
        <div>
            <div style="font-weight:800; color:#fbbf24; font-size:14px;">+${amount} Gold Stars!</div>
            <div style="font-size:11px; color:#94a3b8;">${reason}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// --- GLOBAL LEADERBOARD UI RENDERER ---

async function renderLeaderboard() {
    const listContainer = document.getElementById('leaderboard-users-list');
    if (!listContainer) return;

    if (!isCloudMode || !window.FirebaseSync) {
        listContainer.innerHTML = `
            <div class="leaderboard-empty-state">
                <h3 style="color:#fff; margin-bottom: 8px;">🔒 Đua Top Bảng Xếp Hạng</h3>
                <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px;">
                    Tính năng Bảng xếp hạng yêu cầu kết nối mạng và tài khoản. Hãy Đăng nhập bằng Google để tranh tài cùng các học viên khác!
                </p>
                <button class="btn-primary animate-glow" id="btn-leaderboard-login" style="padding: 10px 20px; font-size:13px; border-radius:30px; cursor:pointer;">
                    Đăng nhập ngay
                </button>
            </div>
        `;
        document.getElementById('btn-leaderboard-login').addEventListener('click', showAuthOverlay);
        return;
    }

    listContainer.innerHTML = `
        <div class="roadmap-loading">
            <span class="pulse-dot"></span>
            <span>Đang tải bảng xếp hạng trực tuyến...</span>
        </div>
    `;

    const leaderboard = await window.FirebaseSync.loadLeaderboard();
    if (!leaderboard || leaderboard.length === 0) {
        listContainer.innerHTML = `
            <div class="leaderboard-empty-state">
                <p>Chưa có dữ liệu bảng xếp hạng. Hãy hoàn thành các bài học để trở thành người dẫn đầu!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';
    
    leaderboard.forEach((user, idx) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row ${user.email === state.currentUserEmail ? 'current-user' : ''}`;
        
        let rankDisplay = idx + 1;
        if (idx === 0) rankDisplay = '<span class="medal-icon">🥇</span>';
        else if (idx === 1) rankDisplay = '<span class="medal-icon">🥈</span>';
        else if (idx === 2) rankDisplay = '<span class="medal-icon">🥉</span>';
        
        const avatarUrl = user.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
        const displayName = user.name || 'Học viên ẩn danh';
        const userStreak = user.streak || 0;
        const userStars = user.stars || 0;

        // Self-healing synchronization: if the cloud leaderboard data is higher than local state, update local state
        if (user.email && state.currentUserEmail && user.email.toLowerCase().trim() === state.currentUserEmail.toLowerCase().trim()) {
            let needSave = false;
            if (userStreak > state.streak) {
                state.streak = userStreak;
                needSave = true;
            }
            if (userStars > state.stars) {
                state.stars = userStars;
                needSave = true;
            }
            if (needSave) {
                saveStatsToStorage();
                updateSidebarStreakUI();
                const starsCountEl = document.getElementById('dashboard-stars-count');
                if (starsCountEl) {
                    starsCountEl.textContent = state.stars;
                }
            }
        }

        let avatarHtml = `<img src="${avatarUrl}" alt="Avatar" class="leaderboard-avatar">`;
        if (avatarUrl && avatarUrl.startsWith('emoji:')) {
            const emoji = avatarUrl.split(':')[1];
            avatarHtml = `<div class="leaderboard-avatar-emoji">${emoji}</div>`;
        }

        row.innerHTML = `
            <span class="col-rank">${rankDisplay}</span>
            <div class="col-avatar">
                ${avatarHtml}
            </div>
            <span class="col-name">${displayName}</span>
            <span class="col-streak">${userStreak} 🔥</span>
            <span class="col-stars">${userStars} ⭐</span>
        `;
        
        listContainer.appendChild(row);
    });
}

// --- CUTE ANIMAL AVATARS SELECTION SYSTEM ---

const ANIMAL_AVATARS = [
    { emoji: '🐱', label: 'Mèo con' },
    { emoji: '🐶', label: 'Cún con' },
    { emoji: '🐼', label: 'Gấu trúc' },
    { emoji: '🦊', label: 'Cáo nhỏ' },
    { emoji: '🐨', label: 'Koala' },
    { emoji: '🦁', label: 'Sư tử' },
    { emoji: '🐰', label: 'Thỏ con' },
    { emoji: '🐧', label: 'Cánh cụt' },
    { emoji: '🐻', label: 'Gấu nâu' },
    { emoji: '🐸', label: 'Ếch xanh' },
    { emoji: '🐵', label: 'Khỉ con' },
    { emoji: '🦄', label: 'Kỳ lân' }
];

function renderUserAvatar(avatarUrl) {
    const imgEl = document.getElementById('user-avatar-img');
    if (!imgEl) return;

    // Check if there is already an emoji badge in the container
    const container = document.getElementById('btn-open-avatar-modal');
    const existingEmoji = container.querySelector('.user-avatar-emoji');
    if (existingEmoji) existingEmoji.remove();

    if (avatarUrl && avatarUrl.startsWith('emoji:')) {
        const emoji = avatarUrl.split(':')[1];
        imgEl.style.display = 'none';
        
        const emojiEl = document.createElement('div');
        emojiEl.className = 'user-avatar-emoji';
        emojiEl.textContent = emoji;
        container.insertBefore(emojiEl, imgEl); // Insert before edit overlay
    } else {
        imgEl.style.display = 'block';
        imgEl.src = avatarUrl || 'https://www.gravatar.com/avatar/?d=mp';
    }
}

let tempSelectedAvatar = '';

function renderAvatarModalChoices() {
    const grid = document.getElementById('avatar-emoji-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    tempSelectedAvatar = state.photoURL || '';

    ANIMAL_AVATARS.forEach(item => {
        const choice = document.createElement('div');
        const isSelected = tempSelectedAvatar === 'emoji:' + item.emoji;
        choice.className = `avatar-choice-item ${isSelected ? 'selected' : ''}`;
        
        choice.innerHTML = `
            <span class="avatar-choice-emoji">${item.emoji}</span>
            <span class="avatar-choice-label">${item.label}</span>
        `;
        
        choice.addEventListener('click', () => {
            document.querySelectorAll('.avatar-choice-item').forEach(c => c.classList.remove('selected'));
            choice.classList.add('selected');
            tempSelectedAvatar = 'emoji:' + item.emoji;
        });
        
        grid.appendChild(choice);
    });
}

// Click handler for specialized learning deck cards
function selectSpecializedCategory(category) {
    const selectEl = document.getElementById('flashcard-category');
    if (selectEl) {
        selectEl.value = category;
        // Start the flashcard session with the selected specialized category
        initFlashcardSession(category);
        
        // Smooth scroll back up to the flashcard stage
        const stage = document.getElementById('flashcard-element');
        if (stage) {
            stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Display a high-fidelity visual toast feedback
        showToastNotification(`📚 Đã nạp từ chuyên đề! Chúc bạn học tốt! ⚡`);
    }
}

// ==========================================================================
// STORIES MODULE
// ==========================================================================
const storiesState = { completedStories: [] };

function renderStoriesGrid(filter = 'all') {
    const grid = document.getElementById('stories-grid');
    if (!grid) return;
    const stories = typeof STORIES_DATA !== 'undefined' ? STORIES_DATA : [];
    const filtered = filter === 'all' ? stories : stories.filter(s => s.level === filter);
    grid.innerHTML = '';
    if (filtered.length === 0) { grid.innerHTML = '<p style="color:var(--text-secondary)">Không có truyện nào phù hợp.</p>'; return; }
    filtered.forEach(story => {
        const done = storiesState.completedStories.includes(story.id);
        const card = document.createElement('div');
        card.className = 'story-card';
        card.innerHTML = `
            <span class="story-card-emoji">${story.emoji}</span>
            <div class="story-card-info">
                <h4>${story.title}</h4>
                <p>${story.paragraphs[0].substring(0, 80)}...</p>
                <span class="story-card-level" data-level="${story.level}">${story.level}</span>
                ${done ? '<span class="story-card-status">✅ Đã đọc</span>' : ''}
            </div>`;
        card.addEventListener('click', () => openStory(story));
        grid.appendChild(card);
    });
}

function openStory(story) {
    const grid = document.getElementById('stories-grid');
    const reader = document.getElementById('story-reader');
    grid.classList.add('hidden');
    reader.classList.remove('hidden');
    document.getElementById('story-reader-emoji').textContent = story.emoji;
    document.getElementById('story-reader-title').textContent = story.title;
    document.getElementById('story-reader-level').textContent = story.level;
    const body = document.getElementById('story-reader-body');
    body.innerHTML = story.paragraphs.map(p => `<p>${p}</p>`).join('');
    const vocabList = document.getElementById('story-vocab-list');
    vocabList.innerHTML = story.vocab.map(v => `<span class="vocab-tag">${v}</span>`).join('');
    const originalQuizContainer = document.getElementById('story-quiz-container');
    const quizContainer = originalQuizContainer.cloneNode(false);
    originalQuizContainer.parentNode.replaceChild(quizContainer, originalQuizContainer);
    const resultEl = document.getElementById('story-result');
    resultEl.classList.add('hidden');
    let answered = 0;
    let correct = 0;
    story.questions.forEach((q, qi) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'story-quiz-q';
        qDiv.innerHTML = `<p>${qi + 1}. ${q.q}</p><div class="quiz-opts">${q.opts.map((o, oi) =>
            `<button class="quiz-opt-btn" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div>`;
        quizContainer.appendChild(qDiv);
    });
    quizContainer.addEventListener('click', function handler(e) {
        const btn = e.target.closest('.quiz-opt-btn');
        if (!btn) return;
        const qi = parseInt(btn.dataset.qi);
        const oi = parseInt(btn.dataset.oi);
        const qBtns = quizContainer.querySelectorAll(`.quiz-opt-btn[data-qi="${qi}"]`);
        if (qBtns[0].classList.contains('disabled')) return;
        qBtns.forEach(b => b.classList.add('disabled'));
        if (oi === story.questions[qi].ans) { btn.classList.add('correct'); correct++; }
        else { btn.classList.add('wrong'); qBtns[story.questions[qi].ans].classList.add('correct'); }
        answered++;
        if (answered === story.questions.length) {
            resultEl.classList.remove('hidden');
            document.getElementById('story-result-text').textContent =
                `🎉 Bạn đúng ${correct}/${story.questions.length} câu!`;
            if (!storiesState.completedStories.includes(story.id)) {
                storiesState.completedStories.push(story.id);
                state.stories_done = storiesState.completedStories;
                saveStatsToStorage();
            }
        }
    });
}

// ==========================================================================
// TRANSLATION MODULE
// ==========================================================================
const transState = { deck: [], idx: 0, score: 0, hintsShown: 0 };

function initTranslation() {
    const data = typeof TRANSLATION_DATA !== 'undefined' ? TRANSLATION_DATA : [];
    const dirFilter = document.getElementById('trans-dir-filter')?.value || 'all';
    const lvlFilter = document.getElementById('trans-level-filter')?.value || 'all';
    let filtered = data;
    if (dirFilter !== 'all') filtered = filtered.filter(t => t.dir === dirFilter);
    if (lvlFilter !== 'all') filtered = filtered.filter(t => t.level === lvlFilter);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [filtered[i], filtered[j]] = [filtered[j], filtered[i]]; }
    transState.deck = filtered;
    transState.idx = 0;
    transState.score = 0;
    transState.hintsShown = 0;
    document.getElementById('trans-score').textContent = '0';
    document.getElementById('trans-total').textContent = filtered.length;
    renderTranslationCard();
}

function renderTranslationCard() {
    const card = document.getElementById('translation-card');
    if (!card) return;
    if (transState.deck.length === 0) {
        card.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Không có đoạn dịch nào phù hợp. Hãy chọn bộ lọc khác.</p>';
        return;
    }
    const item = transState.deck[transState.idx];
    document.getElementById('trans-dir-badge').textContent = item.dir === 'en-vi' ? 'Anh → Việt' : 'Việt → Anh';
    document.getElementById('trans-level-badge').textContent = item.level;
    document.getElementById('trans-source').textContent = item.source;
    document.getElementById('trans-hints').innerHTML = '';
    document.getElementById('trans-input').value = '';
    document.getElementById('trans-feedback').classList.add('hidden');
    document.getElementById('trans-feedback').className = 'trans-feedback hidden';
    document.getElementById('btn-trans-check').classList.remove('hidden');
    document.getElementById('btn-trans-next').classList.add('hidden');
    const progress = ((transState.idx) / transState.deck.length) * 100;
    document.getElementById('trans-progress-fill').style.width = progress + '%';
}

function checkTranslation() {
    const item = transState.deck[transState.idx];
    const userInput = document.getElementById('trans-input').value.trim();
    if (!userInput) { showToastNotification('⚠️ Vui lòng nhập bản dịch!'); return; }
    const feedback = document.getElementById('trans-feedback');
    feedback.classList.remove('hidden');
    // Simple similarity check (normalize and compare)
    const normalize = s => s.toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ').trim();
    const userNorm = normalize(userInput);
    const ansNorm = normalize(item.answer);
    // Calculate word overlap
    const userWords = new Set(userNorm.split(' '));
    const ansWords = new Set(ansNorm.split(' '));
    let overlap = 0;
    ansWords.forEach(w => { if (userWords.has(w)) overlap++; });
    const similarity = overlap / Math.max(ansWords.size, 1);
    if (similarity >= 0.6 || userNorm === ansNorm) {
        feedback.className = 'trans-feedback correct';
        document.getElementById('trans-feedback-text').textContent = '✅ Tuyệt vời! Bản dịch của bạn rất tốt!';
        transState.score++;
    } else {
        feedback.className = 'trans-feedback wrong';
        document.getElementById('trans-feedback-text').textContent = '❌ Chưa chính xác lắm. Hãy xem đáp án gợi ý:';
    }
    document.getElementById('trans-answer').textContent = '💡 Đáp án: ' + item.answer;
    document.getElementById('trans-score').textContent = transState.score;
    document.getElementById('btn-trans-check').classList.add('hidden');
    document.getElementById('btn-trans-next').classList.remove('hidden');
}

function nextTranslation() {
    transState.idx++;
    if (transState.idx >= transState.deck.length) {
        showToastNotification(`🎉 Hoàn thành! Điểm: ${transState.score}/${transState.deck.length}`);
        transState.idx = 0;
        initTranslation();
        return;
    }
    renderTranslationCard();
}
function showTransHint() {
    const item = transState.deck[transState.idx];
    if (!item || !item.hints) return;
    const container = document.getElementById('trans-hints');
    transState.hintsShown++;
    const hintIdx = Math.min(transState.hintsShown - 1, item.hints.length - 1);
    if (hintIdx < item.hints.length) {
        container.innerHTML += `<span class="hint-item">${item.hints[hintIdx]}</span> `;
    }
}
// --- Sub-tabs translation switching logic ---
document.getElementById('btn-sub-trans-short')?.addEventListener('click', () => {
    const btnShort = document.getElementById('btn-sub-trans-short');
    const btnLong = document.getElementById('btn-sub-trans-long');
    if (btnShort && btnLong) {
        btnShort.classList.add('active');
        btnShort.style.background = 'var(--accent)';
        btnShort.style.color = '#fff';
        btnShort.style.boxShadow = '0 4px 12px var(--shadow-color)';
        btnShort.style.fontWeight = '600';

        btnLong.classList.remove('active');
        btnLong.style.background = 'none';
        btnLong.style.color = 'var(--text-muted)';
        btnLong.style.boxShadow = 'none';
        btnLong.style.fontWeight = '500';
    }

    document.getElementById('trans-short-panel')?.classList.remove('hidden');
    document.getElementById('trans-long-panel')?.classList.add('hidden');
});

document.getElementById('btn-sub-trans-long')?.addEventListener('click', () => {
    const btnShort = document.getElementById('btn-sub-trans-short');
    const btnLong = document.getElementById('btn-sub-trans-long');
    if (btnShort && btnLong) {
        btnLong.classList.add('active');
        btnLong.style.background = 'var(--accent)';
        btnLong.style.color = '#fff';
        btnLong.style.boxShadow = '0 4px 12px var(--shadow-color)';
        btnLong.style.fontWeight = '600';

        btnShort.classList.remove('active');
        btnShort.style.background = 'none';
        btnShort.style.color = 'var(--text-muted)';
        btnShort.style.boxShadow = 'none';
        btnShort.style.fontWeight = '500';
    }

    document.getElementById('trans-long-panel')?.classList.remove('hidden');
    document.getElementById('trans-short-panel')?.classList.add('hidden');
    initLongTranslation();
});

// --- Long Translation Mode ---
const longTransState = { deck: [], idx: 0, hintsShown: 0 };

function initLongTranslation() {
    const data = typeof LONG_TRANSLATION_DATA !== 'undefined' ? LONG_TRANSLATION_DATA : [];
    const dirFilter = document.getElementById('trans-long-dir-filter')?.value || 'all';
    let filtered = data;
    if (dirFilter !== 'all') filtered = filtered.filter(t => t.dir === dirFilter);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]]; 
    }
    longTransState.deck = filtered;
    longTransState.idx = 0;
    longTransState.hintsShown = 0;
    renderLongTranslationCard();
}

function renderLongTranslationCard() {
    const card = document.getElementById('trans-long-card');
    if (!card) return;
    if (longTransState.deck.length === 0) {
        card.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Không có đoạn văn nào phù hợp. Hãy chọn bộ lọc khác.</p>';
        return;
    }
    const item = longTransState.deck[longTransState.idx];
    document.getElementById('trans-long-dir-badge').textContent = item.dir === 'en-vi' ? 'Anh → Việt' : 'Việt → Anh';
    document.getElementById('trans-long-level-badge').textContent = item.level;
    document.getElementById('trans-long-title').textContent = item.title;
    document.getElementById('trans-long-source').textContent = item.source;
    document.getElementById('trans-long-hints').innerHTML = '';
    document.getElementById('trans-long-input').value = '';
    document.getElementById('trans-long-feedback').classList.add('hidden');
    document.getElementById('btn-trans-long-check').classList.remove('hidden');
    document.getElementById('btn-trans-long-next').classList.add('hidden');
    document.getElementById('trans-long-word-count').textContent = '0 từ';
    longTransState.hintsShown = 0;
}

function checkLongTranslation() {
    const item = longTransState.deck[longTransState.idx];
    const userInput = document.getElementById('trans-long-input').value.trim();
    if (!userInput) { showToastNotification('⚠️ Vui lòng nhập bản dịch!'); return; }
    
    const feedback = document.getElementById('trans-long-feedback');
    feedback.classList.remove('hidden');
    
    // Smart Jaccard Similarity Checker for long paragraphs
    const normalize = s => s.toLowerCase().replace(/[.,!?;:'"()\-–]/g, '').replace(/\s+/g, ' ').trim();
    const userNorm = normalize(userInput);
    const ansNorm = normalize(item.answer);
    
    const userWords = userNorm.split(' ').filter(w => w.length > 1);
    const ansWords = ansNorm.split(' ').filter(w => w.length > 1);
    
    const userSet = new Set(userWords);
    const ansSet = new Set(ansWords);
    
    let intersection = 0;
    ansSet.forEach(w => { if (userSet.has(w)) intersection++; });
    
    let scorePct = Math.round((intersection / Math.max(ansSet.size, 1)) * 100);
    if (scorePct > 100) scorePct = 100;
    
    const scorePctEl = document.getElementById('trans-long-score-pct');
    scorePctEl.textContent = scorePct + '%';
    
    const feedbackTextEl = document.getElementById('trans-long-feedback-text');
    if (scorePct >= 80) {
        scorePctEl.style.color = '#4ade80';
        feedbackTextEl.textContent = '🌟 Xuất sắc! Bản dịch của bạn cực kỳ chính xác và lưu loát so với bản dịch chuẩn. Cấu trúc câu và từ vựng đều được sử dụng rất tự nhiên.';
        awardStars(15, "Hoàn thành dịch đoạn văn xuất sắc!");
    } else if (scorePct >= 50) {
        scorePctEl.style.color = '#60a5fa';
        feedbackTextEl.textContent = '👍 Tốt! Bạn đã truyền đạt chính xác các ý chính của đoạn văn. Hãy xem thêm bản dịch mẫu để cải thiện cách diễn đạt tự nhiên hơn.';
        awardStars(8, "Hoàn thành dịch đoạn văn khá tốt!");
    } else {
        scorePctEl.style.color = '#f87171';
        feedbackTextEl.textContent = '✍️ Hãy cố gắng lên! Bản dịch của bạn chưa sát với ý nghĩa của đoạn văn. Vui lòng đối chiếu với bản dịch mẫu bên dưới để học hỏi thêm các cấu trúc câu.';
    }
    
    document.getElementById('trans-long-answer').textContent = item.answer;
    document.getElementById('btn-trans-long-check').classList.add('hidden');
    document.getElementById('btn-trans-long-next').classList.remove('hidden');
}

function nextLongTranslation() {
    longTransState.idx++;
    if (longTransState.idx >= longTransState.deck.length) {
        showToastNotification(`🎉 Bạn đã dịch hết tất cả các đoạn văn dài trong bộ lọc này!`);
        longTransState.idx = 0;
    }
    renderLongTranslationCard();
}

function showLongTransHint() {
    const item = longTransState.deck[longTransState.idx];
    if (!item || !item.hints) return;
    const container = document.getElementById('trans-long-hints');
    longTransState.hintsShown++;
    const hintIdx = Math.min(longTransState.hintsShown - 1, item.hints.length - 1);
    if (hintIdx < item.hints.length) {
        container.innerHTML += `<span class="hint-item">${item.hints[hintIdx]}</span> `;
    }
}

// --- AI Writing Room ---
let currentWritingTopic = null;
let writingTelemetry = {
    startTime: null,
    pasteCount: 0,
    totalPastedChars: 0,
    tabSwitches: 0,
    hasPastedLargeBlock: false,
    bestScore: 0
};

// Listen for tab switching / application defocus
window.addEventListener('blur', () => {
    if (writingTelemetry.startTime && currentWritingTopic) {
        writingTelemetry.tabSwitches++;
    }
});

function getDifficultyFromUserLevel(level) {
    if (!level) return 'Beginner';
    const l = level.toUpperCase();
    if (l === 'A1' || l === 'A2') return 'Beginner';
    if (l === 'B1' || l === 'B2') return 'Intermediate';
    if (l === 'C1' || l === 'C2') return 'Advanced';
    return 'Intermediate';
}

function initWritingRoom() {
    const topics = typeof WRITING_DATA !== 'undefined' ? WRITING_DATA : [];
    
    // Bind Surprise Initializer button
    const btnRandom = document.getElementById('btn-writing-random');
    const diffSelect = document.getElementById('writing-difficulty-select');
    
    if (btnRandom) {
        btnRandom.onclick = () => {
            const selectedDiff = diffSelect ? diffSelect.value : 'auto';
            let targetDiff = selectedDiff;
            
            if (selectedDiff === 'auto') {
                targetDiff = getDifficultyFromUserLevel(state.userLevel);
            }
            
            let pool = topics.filter(t => t.level === targetDiff);
            if (pool.length === 0) pool = topics;
            
            // Try to avoid repeating the current topic if possible
            let filteredPool = pool;
            if (currentWritingTopic) {
                filteredPool = pool.filter(t => t.id !== currentWritingTopic.id);
                if (filteredPool.length === 0) filteredPool = pool;
            }
            
            const randomTopic = filteredPool[Math.floor(Math.random() * filteredPool.length)];
            if (randomTopic) {
                updateWritingTopic(randomTopic);
                
                const label = selectedDiff === 'auto' 
                    ? `Phù hợp với trình độ hiện tại ${state.userLevel} (${randomTopic.level})`
                    : `Trình độ ${randomTopic.level}`;
                
                showToastNotification(`🎲 Đã khởi tạo chủ đề: "${randomTopic.topic}" (${label})!`);
            }
        };
    }
    
    const textarea = document.getElementById('writing-textarea');
    if (textarea) {
        textarea.value = '';
        textarea.oninput = handleWritingTextChange;
        
        // Listen for copy-paste to detect cheating
        textarea.addEventListener('paste', (e) => {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            writingTelemetry.pasteCount++;
            writingTelemetry.totalPastedChars += pastedText.length;
            if (pastedText.trim().length > 25) {
                writingTelemetry.hasPastedLargeBlock = true;
            }
        });
    }
    
    const btnGrade = document.getElementById('btn-writing-grade');
    if (btnGrade) {
        btnGrade.onclick = gradeWritingEssay;
    }
    
    const toggleSample = document.getElementById('btn-toggle-writing-sample');
    if (toggleSample) {
        toggleSample.onclick = () => {
            const el = document.getElementById('writing-sample-answer');
            el?.classList.toggle('hidden');
        };
    }
    
    // Start with placeholder locked state
    updateWritingTopic(null);
}

function updateWritingTopic(topic) {
    const textarea = document.getElementById('writing-textarea');
    
    // Reset telemetry
    writingTelemetry = {
        startTime: null,
        pasteCount: 0,
        totalPastedChars: 0,
        tabSwitches: 0,
        hasPastedLargeBlock: false,
        bestScore: 0
    };
    
    if (!topic) {
        currentWritingTopic = null;
        const badge = document.getElementById('writing-level-badge');
        if (badge) {
            badge.textContent = 'Chưa khởi tạo';
            badge.style.background = 'var(--text-muted)';
        }
        
        document.getElementById('writing-prompt-text').textContent = 'Vui lòng chọn mức độ khó và nhấn nút "🎲 Khởi tạo chủ đề" ở trên để bắt đầu thử thách!';
        document.getElementById('writing-prompt-en').textContent = 'Please select a difficulty level and click "🎲 Generate Topic" above to begin your writing challenge!';
        
        const outlineUl = document.getElementById('writing-outline-list');
        if (outlineUl) {
            outlineUl.innerHTML = '<li style="color: var(--text-muted); font-style: italic;">Chưa có dàn ý (Nhấp Khởi tạo chủ đề)</li>';
        }
        
        const vocabDiv = document.getElementById('writing-vocab-checklist');
        if (vocabDiv) {
            vocabDiv.innerHTML = '<div style="color: var(--text-muted); font-style: italic; font-size: 13px;">Chưa có từ vựng gợi ý</div>';
        }
        
        if (textarea) {
            textarea.value = '';
            textarea.disabled = true;
            textarea.placeholder = '🔒 Khung viết đang khóa. Vui lòng bấm "🎲 Khởi tạo chủ đề" để mở khóa...';
        }
        document.getElementById('writing-word-counter').textContent = '0 từ';
        document.getElementById('writing-result-panel')?.classList.add('hidden');
        document.getElementById('writing-sample-answer')?.classList.add('hidden');
        return;
    }
    
    currentWritingTopic = topic;
    
    // Set level badge background color based on level
    const badge = document.getElementById('writing-level-badge');
    if (badge) {
        badge.textContent = topic.level;
        if (topic.level === 'Beginner') badge.style.background = '#4ade80';
        else if (topic.level === 'Intermediate') badge.style.background = '#facc15';
        else if (topic.level === 'Advanced') badge.style.background = '#f87171';
    }
    
    document.getElementById('writing-prompt-text').textContent = topic.prompt;
    document.getElementById('writing-prompt-en').textContent = topic.englishPrompt;
    
    // Outline
    const outlineUl = document.getElementById('writing-outline-list');
    if (outlineUl) {
        outlineUl.innerHTML = '';
        topic.outline.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            outlineUl.appendChild(li);
        });
    }
    
    // Vocab Checklist
    const vocabDiv = document.getElementById('writing-vocab-checklist');
    if (vocabDiv) {
        vocabDiv.innerHTML = '';
        topic.suggestedWords.forEach(wordObj => {
            const div = document.createElement('div');
            div.className = 'vocab-check-item';
            div.style = 'display: flex; align-items: center; gap: 8px; font-size: 13.5px; padding: 6px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text-light); transition: all 0.2s;';
            div.setAttribute('data-word', wordObj.word.toLowerCase());
            div.innerHTML = `
                <span class="bullet" style="color: var(--text-muted);">⬜</span>
                <span style="font-weight: 500; color: #fff;">${wordObj.word}</span>
                <span style="font-size:12px; color:var(--text-muted);">(${wordObj.vi})</span>
            `;
            vocabDiv.appendChild(div);
        });
    }
    
    // Reset inputs
    if (textarea) {
        textarea.value = '';
        textarea.disabled = false;
        textarea.placeholder = 'Nhấp vào đây và bắt đầu viết đoạn văn của bạn bằng tiếng Anh...';
    }
    document.getElementById('writing-word-counter').textContent = '0 từ';
    document.getElementById('writing-result-panel')?.classList.add('hidden');
    document.getElementById('writing-sample-answer')?.classList.add('hidden');
    
    const sampleAnswerEl = document.getElementById('writing-sample-answer');
    if (sampleAnswerEl) {
        sampleAnswerEl.textContent = topic.sampleAnswer;
    }
}

function handleWritingTextChange() {
    const text = document.getElementById('writing-textarea').value;
    
    // Set writing start time on first keystroke
    if (text.trim().length > 0 && !writingTelemetry.startTime) {
        writingTelemetry.startTime = Date.now();
    }
    
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    document.getElementById('writing-word-counter').textContent = `${words.length} từ`;
    
    const normalizedText = text.toLowerCase();
    
    // Live update vocabulary checklist
    const checklistItems = document.querySelectorAll('.vocab-check-item');
    checklistItems.forEach(item => {
        const word = item.getAttribute('data-word');
        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b' + escapedWord, 'i');
        const isFound = regex.test(normalizedText);
        
        const bullet = item.querySelector('.bullet');
        if (isFound) {
            item.style.background = 'rgba(74, 222, 128, 0.08)';
            item.style.borderColor = 'rgba(74, 222, 128, 0.2)';
            if (bullet) {
                bullet.textContent = '✅';
                bullet.style.color = '#4ade80';
            }
        } else {
            item.style.background = 'rgba(255,255,255,0.02)';
            item.style.borderColor = 'rgba(255,255,255,0.04)';
            if (bullet) {
                bullet.textContent = '⬜';
                bullet.style.color = 'var(--text-muted)';
            }
        }
    });
}

function gradeWritingEssay() {
    if (!currentWritingTopic) return;
    const essay = document.getElementById('writing-textarea').value.trim();
    if (!essay) {
        showToastNotification('⚠️ Vui lòng viết nội dung trước khi chấm điểm!');
        return;
    }
    
    const words = essay.split(/\s+/).filter(w => w.length > 0);
    const essayLen = words.length;
    
    // 1. Length Score (25 points max)
    let lengthScore = 0;
    let targetMin = 50;
    let targetMax = 80;
    if (currentWritingTopic.level === 'Intermediate') { targetMin = 80; targetMax = 120; }
    else if (currentWritingTopic.level === 'Advanced') { targetMin = 100; targetMax = 150; }
    
    // --- ADAPTIVE CEFR EVALUATION ADJUSTMENTS ---
    const userDiff = getDifficultyFromUserLevel(state.userLevel);
    let levelMismatchComment = "";

    // Adjust requirements if topic is more difficult than user's current level (be lenient)
    if (currentWritingTopic.level === 'Advanced' && userDiff === 'Beginner') {
        targetMin = Math.round(targetMin * 0.7); // 30% leniency
        levelMismatchComment = `\n*(Lưu ý sư phạm: Do bạn thuộc trình độ Sơ cấp (${state.userLevel}) đang thử thách chủ đề Cao cấp (Advanced), hệ thống đã giảm 30% yêu cầu độ dài tối thiểu xuống còn **${targetMin} từ** để động viên bạn!)*\n`;
    } else if (currentWritingTopic.level === 'Advanced' && userDiff === 'Intermediate') {
        targetMin = Math.round(targetMin * 0.85); // 15% leniency
        levelMismatchComment = `\n*(Lưu ý sư phạm: Bạn thuộc trình độ Trung cấp (${state.userLevel}) thử thách chủ đề Cao cấp (Advanced), hệ thống đã giảm 15% yêu cầu độ dài tối thiểu xuống còn **${targetMin} từ**!)*\n`;
    } else if (currentWritingTopic.level === 'Intermediate' && userDiff === 'Beginner') {
        targetMin = Math.round(targetMin * 0.8); // 20% leniency
        levelMismatchComment = `\n*(Lưu ý sư phạm: Trình độ Sơ cấp (${state.userLevel}) thử thách chủ đề Trung cấp (Intermediate), yêu cầu độ dài tối thiểu đã được giảm xuống còn **${targetMin} từ**!)*\n`;
    } else if (currentWritingTopic.level === 'Beginner' && userDiff === 'Advanced') {
        // Strictness: raise min length slightly for advanced user writing beginner topic
        targetMin = Math.round(targetMin * 1.2); 
        levelMismatchComment = `\n*(Lưu ý sư phạm: Bạn thuộc trình độ Cao cấp (${state.userLevel}) đang viết chủ đề Sơ cấp (Beginner), hệ thống yêu cầu độ dài tối thiểu cao hơn một chút (**${targetMin} từ**) để đánh giá đầy đủ thực lực của bạn!)*\n`;
    }
    
    if (essayLen >= targetMin && essayLen <= targetMax) {
        lengthScore = 25;
    } else if (essayLen < targetMin) {
        const ratio = essayLen / targetMin;
        lengthScore = Math.round(ratio * 20);
    } else {
        lengthScore = Math.max(15, 25 - Math.round((essayLen - targetMax) / 10));
    }
    
    // 2. Vocabulary Score (25 points max - 5 points per suggested word)
    let usedVocabCount = 0;
    const usedWordsList = [];
    const normalizedEssay = essay.toLowerCase();
    currentWritingTopic.suggestedWords.forEach(wordObj => {
        const escaped = wordObj.word.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b' + escaped, 'i');
        if (regex.test(normalizedEssay)) {
            usedVocabCount++;
            usedWordsList.push(wordObj.word);
        }
    });
    let vocabScore = Math.min(25, usedVocabCount * 5);
    
    // 3. Lexical Diversity (TTR) (20 points max)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[.,!?;:'"()]/g, '')));
    const ttr = uniqueWords.size / Math.max(1, essayLen);
    let diversityScore = Math.round(ttr * 20);
    
    // 4. Structural Connectors Score (15 points max)
    const connectors = ['firstly', 'secondly', 'thirdly', 'furthermore', 'moreover', 'additionally', 'however', 'on the other hand', 'in addition', 'therefore', 'ultimately', 'in conclusion', 'to sum up', 'first of all', 'last but not least'];
    const foundConnectors = [];
    connectors.forEach(c => {
        if (normalizedEssay.includes(c)) {
            foundConnectors.push(c);
        }
    });
    let connectorScore = Math.min(15, foundConnectors.length * 5);
    
    // 5. Basic Syntax / Capitalization (15 points max)
    let syntaxScore = 15;
    const sentences = essay.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    let capErrors = 0;
    sentences.forEach(s => {
        const firstChar = s.charAt(0);
        if (firstChar && firstChar !== firstChar.toUpperCase()) {
            capErrors++;
        }
    });
    syntaxScore = Math.max(5, 15 - (capErrors * 3));
    
    // --- PEDAGOGICAL SAFETY & ANTI-EXPLOIT VALIDATION ---
    let shortLengthPenalty = false;
    let spamPenalty = false;
    let nonEnglishPenalty = false;

    // Count real English alphabetic tokens
    const englishWordRegex = /[a-zA-Z]{2,}/g;
    const englishWordsCount = (normalizedEssay.match(englishWordRegex) || []).length;

    if (englishWordsCount < 5) {
        nonEnglishPenalty = true;
    } else if (essayLen < 15) {
        shortLengthPenalty = true;
    } else if (essayLen > 15 && ttr < 0.28) {
        spamPenalty = true;
    }

    // Adaptively apply scores or penalties
    if (nonEnglishPenalty) {
        lengthScore = 0;
        vocabScore = 0;
        diversityScore = 0;
        connectorScore = 0;
        syntaxScore = 0;
    } else if (shortLengthPenalty) {
        lengthScore = Math.round((essayLen / 15) * 3); // Max 3 pts
        vocabScore = Math.min(2, vocabScore);
        diversityScore = Math.min(2, diversityScore); // 2 words shouldn't get 20 pts for TTR!
        connectorScore = 0;
        syntaxScore = Math.min(3, syntaxScore);
    } else if (spamPenalty) {
        lengthScore = Math.round(lengthScore * 0.1);
        vocabScore = Math.round(vocabScore * 0.1);
        diversityScore = 1;
        connectorScore = Math.round(connectorScore * 0.1);
        syntaxScore = Math.min(3, syntaxScore);
    }

    // --- ACADEMIC INTEGRITY MONITORING SYSTEM (Copy-Paste & AI Detection) ---
    const elapsedMs = Date.now() - (writingTelemetry.startTime || Date.now());
    const elapsedMinutes = elapsedMs / 60000;
    const wpm = elapsedMinutes > 0.05 ? essayLen / elapsedMinutes : 999;
    
    let integrityScore = 100;
    let integrityReasons = [];
    
    if (writingTelemetry.hasPastedLargeBlock) {
        integrityScore -= 70;
        integrityReasons.push("Phát hiện dán một khối lượng lớn ký tự (Copy-paste block)");
    } else if (writingTelemetry.pasteCount > 0) {
        integrityScore -= (writingTelemetry.pasteCount * 15);
        integrityReasons.push(`Phát hiện hành vi dán văn bản (${writingTelemetry.pasteCount} lần)`);
    }
    
    if (wpm > 130 && essayLen > 25) {
        integrityScore -= 45;
        integrityReasons.push(`Tốc độ nhập liệu nhanh đến mức bất khả thi (${Math.round(wpm)} từ/phút)`);
    } else if (wpm > 70 && essayLen > 25) {
        integrityScore -= 20;
        integrityReasons.push(`Tốc độ viết nhanh bất thường (${Math.round(wpm)} từ/phút)`);
    }
    
    if (writingTelemetry.tabSwitches > 1) {
        integrityScore -= Math.min(25, writingTelemetry.tabSwitches * 10);
        integrityReasons.push(`Thoát tab/đổi ứng dụng khi đang làm bài (${writingTelemetry.tabSwitches} lần)`);
    }
    
    // ChatGPT stylistic phrasing templates checks
    const aiPhrases = [
        "in today's fast-paced world", 
        "in the modern era", 
        "double-edged sword", 
        "plays a crucial role", 
        "vital role", 
        "in conclusion", 
        "essential tool", 
        "not only", 
        "digital era"
    ];
    let aiStyleMatches = 0;
    aiPhrases.forEach(p => {
        if (normalizedEssay.includes(p)) aiStyleMatches++;
    });
    
    if (aiStyleMatches >= 3) {
        integrityScore -= 20;
        integrityReasons.push("Sử dụng văn phong khuôn mẫu kinh điển đặc trưng của ChatGPT/AI");
    }
    
    integrityScore = Math.max(0, integrityScore);

    // Final Overall Score
    let totalScore = lengthScore + vocabScore + diversityScore + connectorScore + syntaxScore;
    
    // Integrity deduction penalty
    let finalScore = totalScore;
    if (integrityScore < 95) {
        finalScore = Math.round(totalScore * (integrityScore / 100));
    }
    
    if (nonEnglishPenalty) finalScore = 0;
    else if (spamPenalty) finalScore = Math.min(10, finalScore);
    else if (shortLengthPenalty) finalScore = Math.min(12, finalScore);
    
    // Generate feedback comments
    let aiComment = `**Đánh giá tổng quan:** Bài viết đạt **${finalScore}/100 điểm**. `;
    if (levelMismatchComment) {
        aiComment += levelMismatchComment + " ";
    }
    
    if (nonEnglishPenalty) {
        aiComment += `\n\n⚠️ **CẢNH BÁO NỘI DUNG KHÔNG HỢP LỆ:** Bài viết của bạn không chứa đủ số lượng từ tiếng Anh hợp lệ hoặc toàn ký tự rác. Vui lòng nhập một đoạn văn tiếng Anh thực tế có nghĩa!`;
    } else if (shortLengthPenalty) {
        aiComment += `\n\n⚠️ **BÀI VIẾT QUÁ NGẮN:** Bài viết của bạn cực kỳ ngắn (chỉ có ${essayLen} từ, dưới ngưỡng tối thiểu 15 từ). Ở độ dài này, hệ thống áp dụng khung phạt độ dài nghiêm khắc để đảm bảo tính công bằng (điểm tối đa 12/100). Hãy viết ít nhất một đoạn văn hoàn chỉnh!`;
    } else if (spamPenalty) {
        aiComment += `\n\n⚠️ **CẢNH BÁO LẶP TỪ RÁC (SPAM):** Chỉ số đa dạng từ vựng của bạn quá thấp (chỉ ${Math.round(ttr*100)}% từ duy nhất), phát hiện hành vi lặp lại từ hoặc sao chép vô nghĩa. Hệ thống đã áp dụng khung phạt lặp từ tối đa 10/100. Vui lòng viết các câu đa dạng và đầy đủ ý kiến!`;
    } else {
        if (finalScore >= 85) {
            aiComment += `Một bài viết tuyệt vời! Cấu trúc logic mạch lạc, hành văn tự nhiên và đáp ứng rất tốt yêu cầu đề bài. `;
        } else if (finalScore >= 70) {
            aiComment += `Bài viết khá tốt. Diễn đạt tương đối trôi chảy, tuy nhiên cần chú ý thêm cấu trúc câu hoặc từ vựng gợi ý để lập luận sắc sảo hơn. `;
        } else {
            aiComment += `Bài viết ở mức trung bình. Hãy tập trung cải thiện ngữ pháp cơ bản, cách viết hoa đầu câu và tăng cường độ dài bài viết. `;
        }
    }
    
    if (integrityScore < 90 && !nonEnglishPenalty && !shortLengthPenalty && !spamPenalty) {
        aiComment += `\n\n⚠️ **CẢNH BÁO GIÁM SÁT LIÊM CHÍNH HỌC THUẬT (${integrityScore}%):** Hệ thống phát hiện bạn có khả năng đã sao chép hoặc nhờ sự trợ giúp của AI ngoài vì các lý do:\n`;
        integrityReasons.forEach(r => {
            aiComment += `• ${r}\n`;
        });
        aiComment += `*(Lưu ý: Để nâng cao kỹ năng tiếng Anh thực chất, bạn nên tự tay gõ từng từ thay vì copy-paste từ các nguồn dịch thuật/AI. Điểm số của bạn đã bị khấu trừ tự động tương ứng.)*\n`;
    }
    
    aiComment += `\n\n**Ưu điểm:**\n`;
    aiComment += `• Độ dài thực tế: **${essayLen} từ** (Mục tiêu: ${targetMin}-${targetMax} từ).\n`;
    if (usedVocabCount > 0) {
        aiComment += `• Bạn đã lồng ghép thành công các từ gợi ý: *${usedWordsList.join(', ')}* vào ngữ cảnh rất phù hợp.\n`;
    } else {
        aiComment += `• Bài viết có sự phong phú về từ vựng (đạt ${Math.round(ttr*100)}% chỉ số từ duy nhất).\n`;
    }
    if (foundConnectors.length > 0) {
        aiComment += `• Cấu trúc liên kết ý tốt nhờ các từ nối: *${foundConnectors.join(', ')}*.\n`;
    }
    
    aiComment += `\n**Điểm cần khắc phục:**\n`;
    if (essayLen < targetMin) {
        aiComment += `• Bài viết hơi ngắn. Hãy cố gắng triển khai thêm các ý trong phần Gợi ý cấu trúc (Outline) ở cột bên phải.\n`;
    } else if (essayLen > targetMax) {
        aiComment += `• Bài viết hơi dài hơn mục tiêu. Cố gắng cô đọng ý tư để câu văn súc tích hơn.\n`;
    }
    const missedWords = currentWritingTopic.suggestedWords.filter(w => !usedWordsList.includes(w.word));
    if (missedWords.length > 0) {
        aiComment += `• Nên bổ sung thêm các từ vựng cốt lõi còn thiếu: *${missedWords.map(w => w.word).join(', ')}* để nâng cao chiều sâu học thuật.\n`;
    }
    if (capErrors > 0) {
        aiComment += `• Chú ý sửa lỗi chính tả: Có **${capErrors} lỗi** chưa viết hoa ký tự đầu tiên của câu sau dấu chấm.\n`;
    } else {
        aiComment += `• Chúc mừng bạn đã trình bày cú pháp và quy tắc viết hoa cực kỳ chính xác!\n`;
    }
    
    // Reward Stars (Persistent High Score Delta system)
    const topicId = currentWritingTopic.id || currentWritingTopic.topic;
    const currentBest = state.writingHighScores[topicId] || 0;
    
    const newStars = Math.round(finalScore / 5);
    const prevStars = Math.round(currentBest / 5);
    const starsToAward = Math.max(0, newStars - prevStars);
    
    if (starsToAward > 0) {
        awardStars(starsToAward, `Kỷ lục luyện viết chủ đề "${currentWritingTopic.topic}" đạt ${finalScore} điểm`);
        aiComment += `\n🎁 **Phần thưởng:** Bạn đạt kỷ lục mới **${finalScore} điểm** và nhận được **+${starsToAward} ⭐** học tập!`;
    } else {
        aiComment += `\n🎁 **Phần thưởng:** +0 ⭐ (Điểm số ${finalScore}/100 chưa vượt qua kỷ lục trước đó là ${currentBest}/100 của chủ đề này).`;
    }
    
    // Save new best score permanently to database
    state.writingHighScores[topicId] = Math.max(currentBest, finalScore);
    saveStatsToStorage();
    
    // Display results in UI
    document.getElementById('writing-result-panel').classList.remove('hidden');
    document.getElementById('writing-score-val').textContent = finalScore;
    document.getElementById('writing-res-length').textContent = `${essayLen} từ (${essayLen >= targetMin && essayLen <= targetMax ? 'Đạt' : 'Cần điều chỉnh'})`;
    document.getElementById('writing-res-vocab').textContent = `${usedVocabCount} / ${currentWritingTopic.suggestedWords.length} từ`;
    document.getElementById('writing-res-ttr').textContent = `${Math.round(ttr * 100)}% (${ttr > 0.7 ? 'Rất phong phú' : 'Tương đối ổn'})`;
    
    const integritySpan = document.getElementById('writing-res-integrity');
    if (integritySpan) {
        if (integrityScore >= 90) {
            integritySpan.textContent = `${integrityScore}% (Trung thực)`;
            integritySpan.style.color = '#4ade80';
        } else if (integrityScore >= 60) {
            integritySpan.textContent = `${integrityScore}% (Cảnh báo)`;
            integritySpan.style.color = '#facc15';
        } else {
            integritySpan.textContent = `⚠️ ${integrityScore}% (Nghi vấn Sao chép/AI)`;
            integritySpan.style.color = '#f87171';
        }
    }
    
    const feedbackBox = document.getElementById('writing-ai-feedback');
    if (feedbackBox) {
        feedbackBox.innerHTML = aiComment.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    // --- GRAMMAR & SPELLING HEURISTICS ENGINE ---
    const grammarErrors = analyzeGrammarErrors(essay);
    const grammarPanel = document.getElementById('writing-grammar-panel');
    const grammarCount = document.getElementById('writing-grammar-count');
    const grammarList = document.getElementById('writing-grammar-list');
    
    if (grammarPanel && grammarCount && grammarList) {
        grammarList.innerHTML = '';
        
        if (grammarErrors.length > 0) {
            grammarPanel.style.display = 'block';
            grammarCount.textContent = `${grammarErrors.length} lỗi`;
            
            grammarErrors.forEach(err => {
                const item = document.createElement('div');
                item.className = 'dashboard-card';
                item.style = 'padding: 12px 15px; border-left: 4px solid #f87171; background: rgba(248, 113, 113, 0.03); display: flex; flex-direction: column; gap: 8px; margin-bottom: 5px;';
                
                // Escape quotes for safe HTML attributes binding
                const escapedOriginal = err.original.replace(/'/g, "\\'");
                const escapedSuggested = err.suggested.replace(/'/g, "\\'");
                
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div style="font-size: 14px; font-weight: 500;">
                            <span style="color: #f87171; text-decoration: line-through; margin-right: 8px;">${err.original}</span>
                            <span style="color: #4ade80; font-weight: 600;">➔ ${err.suggested}</span>
                        </div>
                        <button class="btn-primary" style="padding: 4px 10px; font-size: 11px; background: #4ade80; border: none; box-shadow: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="applyGrammarFix('${err.id}', '${escapedOriginal}', '${escapedSuggested}')">
                            <span>💡 Tự động sửa</span>
                        </button>
                    </div>
                    <div style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
                        ${err.explanation}
                    </div>
                `;
                grammarList.appendChild(item);
            });
        } else {
            grammarPanel.style.display = 'none';
        }
    }
    
    document.getElementById('writing-result-panel').scrollIntoView({ behavior: 'smooth' });
}

function analyzeGrammarErrors(essay) {
    const errors = [];
    const normalized = essay.toLowerCase();
    
    const rules = [
        // Subject-Verb Agreement: He/She/It go/want/like/have
        {
            regex: /\b(he|she|it)\s+(go)\b/gi,
            replace: "$1 goes",
            explanation: "Chủ ngữ ngôi thứ ba số ít (he, she, it) yêu cầu động từ thêm đuôi '-es'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(want)\b/gi,
            replace: "$1 wants",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ thêm đuôi '-s'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(like)\b/gi,
            replace: "$1 likes",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ thêm đuôi '-s'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(have)\b/gi,
            replace: "$1 has",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ chia thành dạng số ít 'has'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(do)\b/gi,
            replace: "$1 does",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ chia thành 'does'.",
            type: "grammar"
        },
        
        // Consonant-Vowel Article Mismatch
        {
            regex: /\b(a)\s+(apple|orange|egg|elephant|idea|hour|umbrella|actor|artist|honest)\b/gi,
            replace: "an $2",
            explanation: "Sử dụng mạo từ 'an' trước các từ bắt đầu bằng một nguyên âm (hoặc âm câm như 'h' trong 'hour').",
            type: "grammar"
        },
        {
            regex: /\b(an)\s+(book|car|house|university|uniform|man|woman|cat|dog|table)\b/gi,
            replace: "a $2",
            explanation: "Sử dụng mạo từ 'a' trước danh từ bắt đầu bằng phụ âm (hoặc âm 'u' phát âm như /ju:/ như 'university').",
            type: "grammar"
        },
        
        // Modal Verb mismatch
        {
            regex: /\b(can|could|should|must|will|would|shall|might|may)\s+to\s+([a-z]+)\b/gi,
            replace: "$1 $2",
            explanation: "Sau các động từ khuyết thiếu (modal verbs) phải là động từ nguyên mẫu không 'to' (bare infinitive).",
            type: "grammar"
        },
        {
            regex: /\b(should|would|could|must|can)\s+going\b/gi,
            replace: "$1 go",
            explanation: "Sau động từ khuyết thiếu phải là động từ nguyên mẫu dạng bare infinitive.",
            type: "grammar"
        },
        
        // Double Comparison
        {
            regex: /\bmore\s+(better|worse|easier|faster|harder|taller|shorter|bigger|smaller)\b/gi,
            replace: "$1",
            explanation: "Tránh sử dụng từ so sánh kép 'more' cùng với tính từ so sánh ngắn đã thêm đuôi '-er'.",
            type: "style"
        },
        
        // Typical Preposition Mistakes
        {
            regex: /\b(discuss)\s+about\b/gi,
            replace: "$1",
            explanation: "'Discuss' là ngoại động từ trực tiếp, không đi kèm giới từ 'about'. (Ví dụ: 'discuss the plan').",
            type: "style"
        },
        {
            regex: /\b(marry)\s+with\b/gi,
            replace: "$1",
            explanation: "'Marry' đi trực tiếp với tân ngữ danh từ chỉ người, không sử dụng với giới từ 'with'.",
            type: "grammar"
        },
        {
            regex: /\b(depend)\s+of\b/gi,
            replace: "$1 on",
            explanation: "Cụm động từ chính xác là 'depend on' (phụ thuộc vào), không dùng 'depend of'.",
            type: "grammar"
        },
        {
            regex: /\b(listen)\s+music\b/gi,
            replace: "$1 to music",
            explanation: "Động từ 'listen' cần đi kèm giới từ 'to' khi có tân ngữ theo sau ('listen to music').",
            type: "grammar"
        },
        {
            regex: /\b(good)\s+in\s+(english|math|science|sports|art|music)\b/gi,
            replace: "$1 at $2",
            explanation: "Để diễn tả giỏi một lĩnh vực nào đó, hãy dùng giới từ 'at' ('good at English').",
            type: "grammar"
        },
        {
            regex: /\b(interested)\s+on\b/gi,
            replace: "$1 in",
            explanation: "Cấu trúc đúng để thể hiện sự quan tâm là 'be interested in', không đi kèm 'on'.",
            type: "grammar"
        },
        
        // Double Negatives
        {
            regex: /\b(don't|doesn't|didn't|can't|cannot|won't)\s+have\s+nothing\b/gi,
            replace: "$1 have anything",
            explanation: "Sử dụng phủ định kép là sai ngữ pháp trong tiếng Anh chuẩn. Hãy đổi 'nothing' thành 'anything'.",
            type: "grammar"
        },
        {
            regex: /\b(don't|doesn't|didn't|can't|cannot|won't)\s+see\s+nobody\b/gi,
            replace: "$1 see anybody",
            explanation: "Sử dụng phủ định kép là sai ngữ pháp trong tiếng Anh chuẩn. Hãy đổi 'nobody' thành 'anybody'.",
            type: "grammar"
        },
        
        // Singular Plural mismatch (Quantifier mismatch)
        {
            regex: /\bmany\s+(person|book|day|year|friend|student|teacher|child)\b/gi,
            explanation: "Từ định lượng 'many' bắt buộc phải đi kèm danh từ số nhiều tương ứng.",
            type: "grammar",
            customReplace: (match) => {
                const map = {
                    "many person": "many people",
                    "many book": "many books",
                    "many day": "many days",
                    "many year": "many years",
                    "many friend": "many friends",
                    "many student": "many students",
                    "many teacher": "many teachers",
                    "many child": "many children"
                };
                return map[match.toLowerCase()] || match;
            }
        }
    ];
    
    rules.forEach((rule, idx) => {
        // Reset last index
        rule.regex.lastIndex = 0;
        const matches = [...essay.matchAll(rule.regex)];
        
        matches.forEach(m => {
            const originalText = m[0];
            let suggestedText = "";
            if (rule.customReplace) {
                suggestedText = rule.customReplace(originalText);
            } else {
                suggestedText = originalText.replace(rule.regex, rule.replace);
            }
            
            // Avoid duplicate error logs
            if (!errors.some(e => e.original === originalText && e.index === m.index)) {
                errors.push({
                    id: `err-${idx}-${m.index}`,
                    original: originalText,
                    suggested: suggestedText,
                    explanation: rule.explanation,
                    type: rule.type,
                    index: m.index
                });
            }
        });
    });
    
    return errors;
}

function applyGrammarFix(errorId, originalText, suggestedText) {
    const textarea = document.getElementById('writing-textarea');
    if (!textarea) return;
    
    const currentVal = textarea.value;
    // Replace the exact matching original phrase
    const newVal = currentVal.replace(originalText, suggestedText);
    textarea.value = newVal;
    
    // Trigger word counter and updates
    handleWritingTextChange();
    
    // Animate a toast notification
    showToastNotification(`💡 Đã tự động sửa lỗi: "${originalText}" thành "${suggestedText}"!`);
    
    // Re-grade to reflect the perfect new score!
    gradeWritingEssay();
}

window.applyGrammarFix = applyGrammarFix;

// --- Podcast Room Logic ---
let activePodcast = null;
let lastActiveLineEl = null;
let customPodcasts = []; // Store custom uploaded podcasts in session memory

function parseSRT(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    const transcript = [];
    let currentItem = null;
    
    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.trim().replace(',', '.').split(':');
        if (parts.length === 3) {
            return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        if (line.match(/^\d+$/)) {
            if (currentItem) {
                transcript.push(currentItem);
            }
            currentItem = { start: 0, end: 0, text: "" };
        } else if (line.includes('-->')) {
            const times = line.split('-->');
            if (times.length === 2) {
                if (!currentItem) {
                    currentItem = { start: 0, end: 0, text: "" };
                }
                currentItem.start = parseTime(times[0]);
                currentItem.end = parseTime(times[1]);
            }
        } else if (currentItem) {
            currentItem.text = currentItem.text ? currentItem.text + " " + line : line;
        }
    }
    if (currentItem) {
        transcript.push(currentItem);
    }
    return transcript;
}

function initPodcastRoom() {
    const defaultList = typeof PODCAST_DATA !== 'undefined' ? PODCAST_DATA : [];
    const list = [...defaultList, ...customPodcasts];
    const container = document.getElementById('podcast-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    list.forEach(pod => {
        const item = document.createElement('div');
        item.className = 'roadmap-task-item';
        item.style = 'cursor: pointer; padding: 12px; margin-bottom: 5px;';
        item.innerHTML = `
            <div style="font-size:24px;">${pod.image}</div>
            <div style="flex:1; min-width:0;">
                <div style="font-weight: 600; color: #fff; font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pod.title}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); display:flex; justify-content:space-between; margin-top:3px;">
                    <span>🎙️ ${pod.speaker}</span>
                    <span style="color:var(--accent); font-weight:500;">⏱️ ${pod.duration}</span>
                </div>
            </div>
        `;
        item.onclick = () => selectPodcast(pod);
        container.appendChild(item);
    });

    // Setup Custom Upload Trigger Buttons
    const uploadTrigger = document.getElementById('btn-podcast-upload-trigger');
    const uploadForm = document.getElementById('podcast-upload-form');
    const btnCancel = document.getElementById('btn-pod-cancel-upload');
    const btnSubmit = document.getElementById('btn-pod-submit-upload');
    
    if (uploadTrigger && uploadForm) {
        uploadTrigger.onclick = () => {
            uploadForm.classList.remove('hidden');
        };
    }
    
    if (btnCancel && uploadForm) {
        btnCancel.onclick = () => {
            uploadForm.classList.add('hidden');
        };
    }
    
    if (btnSubmit) {
        btnSubmit.onclick = () => {
            const titleInput = document.getElementById('upload-pod-title');
            const audioInput = document.getElementById('upload-pod-audio');
            const srtInput = document.getElementById('upload-pod-srt');
            
            if (!titleInput.value.trim() || !audioInput.files[0] || !srtInput.files[0]) {
                showToastNotification("⚠️ Vui lòng nhập đầy đủ tiêu đề, chọn tệp MP3 và phụ đề SRT!");
                return;
            }
            
            const audioFile = audioInput.files[0];
            const srtFile = srtInput.files[0];
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const srtText = e.target.result;
                const transcript = parseSRT(srtText);
                
                if (transcript.length === 0) {
                    showToastNotification("⚠️ Định dạng tệp SRT không hợp lệ hoặc rỗng!");
                    return;
                }
                
                // Create temporary Blob URL for local audio file
                const audioUrl = URL.createObjectURL(audioFile);
                
                const newPod = {
                    id: `custom-${Date.now()}`,
                    title: titleInput.value.trim(),
                    speaker: "Tệp tải lên (User)",
                    level: "Custom",
                    desc: "Bài nghe tải lên tự chọn từ thiết bị của học viên.",
                    audioUrl: audioUrl,
                    image: "📁",
                    duration: "Tự chọn",
                    transcript: transcript
                };
                
                customPodcasts.push(newPod);
                
                // Refresh catalog list display
                initPodcastRoom();
                
                // Load/Select the new custom podcast instantly
                selectPodcast(newPod);
                
                // Reset form inputs
                titleInput.value = '';
                audioInput.value = '';
                srtInput.value = '';
                uploadForm.classList.add('hidden');
                
                showToastNotification("🎉 Tải lên bài nghe mới thành công! Sẵn sàng luyện tập.");
            };
            reader.readAsText(srtFile);
        };
    }
    
    // Setup Audio Player Event Listeners once
    const audio = document.getElementById('podcast-audio-element');
    const playBtn = document.getElementById('btn-player-play');
    const skipBack = document.getElementById('btn-player-skip-back');
    const skipForward = document.getElementById('btn-player-skip-forward');
    const seekbar = document.getElementById('player-seekbar');
    const speedBtn = document.getElementById('btn-player-speed');
    const volumeRange = document.getElementById('player-volume');
    
    if (audio) {
        audio.ontimeupdate = handlePodcastTimeUpdate;
        audio.onended = () => {
            if (playBtn) playBtn.innerHTML = `<svg id="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff; margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        };
    }
    
    if (playBtn) {
        playBtn.onclick = () => {
            if (!activePodcast) {
                showToastNotification('⚠️ Vui lòng chọn một bài nghe từ danh sách bên trái!');
                return;
            }
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
                checkAndUpdateStreak();
            } else {
                audio.pause();
                playBtn.innerHTML = `<svg id="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff; margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
            }
        };
    }
    
    if (skipBack) {
        skipBack.onclick = () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        };
    }
    
    if (skipForward) {
        skipForward.onclick = () => {
            audio.currentTime = Math.min(audio.duration || 1000, audio.currentTime + 10);
        };
    }
    
    if (seekbar) {
        seekbar.oninput = () => {
            if (!audio.duration) return;
            const targetTime = (seekbar.value / 100) * audio.duration;
            audio.currentTime = targetTime;
        };
    }
    
    if (speedBtn) {
        const speeds = [1.0, 1.25, 1.5, 0.75];
        let currentSpeedIdx = 0;
        speedBtn.onclick = () => {
            currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
            const newSpeed = speeds[currentSpeedIdx];
            audio.playbackRate = newSpeed;
            speedBtn.textContent = newSpeed + 'x';
        };
    }
    
    if (volumeRange) {
        volumeRange.oninput = () => {
            audio.volume = volumeRange.value / 100;
        };
    }
    
    if (list.length > 0) {
        selectPodcast(list[0]);
    }
}

function selectPodcast(podcast) {
    activePodcast = podcast;
    lastActiveLineEl = null;
    
    document.getElementById('player-art').textContent = podcast.image;
    document.getElementById('player-title').textContent = podcast.title;
    document.getElementById('player-speaker').textContent = `🎙️ ${podcast.speaker} (${podcast.level})`;
    
    const audio = document.getElementById('podcast-audio-element');
    audio.src = podcast.audioUrl;
    audio.load();
    
    // Reset Seekbar
    document.getElementById('player-seekbar').value = 0;
    document.getElementById('player-time-current').textContent = '0:00';
    document.getElementById('player-time-duration').textContent = podcast.duration;
    
    // Play Button reset
    document.getElementById('btn-player-play').innerHTML = `<svg id="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff; margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    
    // RENDER TIMED TRANSCRIPT
    const transcriptBox = document.getElementById('transcript-scroll-box');
    if (!transcriptBox) return;
    transcriptBox.innerHTML = '';
    
    podcast.transcript.forEach((line, idx) => {
        const div = document.createElement('div');
        div.className = 'transcript-line';
        div.style = 'padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.25s ease; color: var(--text-light); font-size: 14px; line-height: 1.6; border: 1px solid transparent; display: flex; gap: 10px; align-items: flex-start; background: rgba(255,255,255,0.01);';
        div.setAttribute('data-start', line.start);
        div.setAttribute('data-end', line.end);
        div.setAttribute('data-index', idx);
        
        div.innerHTML = `
            <span style="font-size:11px; color:var(--text-muted); background:rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 5px; margin-top:2px;">${formatTimeStr(line.start)}</span>
            <div style="flex:1; user-select: text;">${line.text}</div>
            <span style="font-size:12px; color:var(--accent); font-weight:bold;">🔊</span>
        `;
        
        // Hover effects in JS
        div.onmouseenter = () => {
            if (!div.classList.contains('active')) {
                div.style.background = 'rgba(255,255,255,0.04)';
            }
        };
        div.onmouseleave = () => {
            if (!div.classList.contains('active')) {
                div.style.background = 'rgba(255,255,255,0.01)';
            }
        };
        
        div.onclick = () => {
            audio.currentTime = parseFloat(line.start);
            if (audio.paused) {
                document.getElementById('btn-player-play').click();
            }
        };
        
        transcriptBox.appendChild(div);
    });
}

function handlePodcastTimeUpdate() {
    const audio = document.getElementById('podcast-audio-element');
    const seekbar = document.getElementById('player-seekbar');
    const timeCurrent = document.getElementById('player-time-current');
    const timeDuration = document.getElementById('player-time-duration');
    
    if (!audio || !audio.duration) return;
    
    // Update seekbar
    const pct = (audio.currentTime / audio.duration) * 100;
    if (seekbar) seekbar.value = pct;
    
    if (timeCurrent) timeCurrent.textContent = formatTimeStr(audio.currentTime);
    if (timeDuration) timeDuration.textContent = formatTimeStr(audio.duration);
    
    // TIMING HIGHLIGHT & AUTO-SCROLL KARAOKE
    const currentTime = audio.currentTime;
    const lines = document.querySelectorAll('.transcript-line');
    let activeLine = null;
    
    lines.forEach(line => {
        const start = parseFloat(line.getAttribute('data-start'));
        const end = parseFloat(line.getAttribute('data-end'));
        
        if (currentTime >= start && currentTime <= end) {
            activeLine = line;
        }
    });
    
    if (activeLine && activeLine !== lastActiveLineEl) {
        if (lastActiveLineEl) {
            lastActiveLineEl.classList.remove('active');
            lastActiveLineEl.style.background = 'rgba(255,255,255,0.01)';
            lastActiveLineEl.style.borderColor = 'transparent';
            lastActiveLineEl.style.color = 'var(--text-light)';
            lastActiveLineEl.style.fontWeight = 'normal';
        }
        
        activeLine.classList.add('active');
        activeLine.style.background = 'linear-gradient(90deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(var(--accent-rgb), 0.03) 100%)';
        activeLine.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
        activeLine.style.color = '#fff';
        activeLine.style.fontWeight = 'bold';
        
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        lastActiveLineEl = activeLine;
    }
}

function formatTimeStr(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ==========================================================================
// INIT & EVENT LISTENERS FOR NEW MODULES
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Stories tab
    const storyFilter = document.getElementById('story-level-filter');
    if (storyFilter) {
        storyFilter.addEventListener('change', () => renderStoriesGrid(storyFilter.value));
    }
    const btnBackStories = document.getElementById('btn-back-stories');
    if (btnBackStories) {
        btnBackStories.addEventListener('click', () => {
            document.getElementById('stories-grid').classList.remove('hidden');
            document.getElementById('story-reader').classList.add('hidden');
            renderStoriesGrid(document.getElementById('story-level-filter')?.value || 'all');
        });
    }
    // Render stories when tab becomes visible
    const btnStories = document.getElementById('btn-stories');
    if (btnStories) {
        btnStories.addEventListener('click', () => renderStoriesGrid(document.getElementById('story-level-filter')?.value || 'all'));
    }

    // Translation tab
    const btnTransCheck = document.getElementById('btn-trans-check');
    if (btnTransCheck) btnTransCheck.addEventListener('click', checkTranslation);
    const btnTransNext = document.getElementById('btn-trans-next');
    if (btnTransNext) btnTransNext.addEventListener('click', nextTranslation);
    const btnTransHint = document.getElementById('btn-trans-hint');
    if (btnTransHint) btnTransHint.addEventListener('click', showTransHint);
    const transDirFilter = document.getElementById('trans-dir-filter');
    if (transDirFilter) transDirFilter.addEventListener('change', initTranslation);
    const transLvlFilter = document.getElementById('trans-level-filter');
    if (transLvlFilter) transLvlFilter.addEventListener('change', initTranslation);
    const btnTranslation = document.getElementById('btn-translation');
    if (btnTranslation) btnTranslation.addEventListener('click', initTranslation);

    // Long translation tab
    const btnTransLongCheck = document.getElementById('btn-trans-long-check');
    if (btnTransLongCheck) btnTransLongCheck.addEventListener('click', checkLongTranslation);
    const btnTransLongNext = document.getElementById('btn-trans-long-next');
    if (btnTransLongNext) btnTransLongNext.addEventListener('click', nextLongTranslation);
    const btnTransLongHint = document.getElementById('btn-trans-long-hint');
    if (btnTransLongHint) btnTransLongHint.addEventListener('click', showLongTransHint);
    const transLongDirFilter = document.getElementById('trans-long-dir-filter');
    if (transLongDirFilter) transLongDirFilter.addEventListener('change', initLongTranslation);

    // Live counter for long translation
    const transLongInput = document.getElementById('trans-long-input');
    if (transLongInput) {
        transLongInput.addEventListener('input', () => {
            const text = transLongInput.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const cntEl = document.getElementById('trans-long-word-count');
            if (cntEl) cntEl.textContent = `${words} từ`;
        });
    }
});
