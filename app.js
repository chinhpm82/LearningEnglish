/* ==========================================================================
   VocabFlow - Application Engine (JavaScript Core)
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
    userLevel: 'Beginner',  // Default is 'Beginner' (lowest level)
    lastTestScore: 0,       // Default placement test score is 0
    roadmapTasks: [],    // Daily checklist tasks { text, completed }
    stars: 0,            // Gamification Gold Stars ⭐
    currentUserEmail: '', // Authenticated user email
    displayName: '',      // Authenticated user displayName
    photoURL: '',         // Selected profile photoURL or custom animal emoji
    googlePhotoURL: '',   // Google authenticating user photoURL
    completedLessons: [], // Completed grammar lesson IDs
    completedSentences: [] // Completed communicative sentence english string IDs
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

// Load data from LocalStorage
function loadState() {
    try {
        const storedVocab = localStorage.getItem('vocabflow_vocab');
        const storedCustom = localStorage.getItem('vocabflow_custom');
        const storedStreak = localStorage.getItem('vocabflow_streak');
        const storedLastDate = localStorage.getItem('vocabflow_last_date');
        const storedQuizStats = localStorage.getItem('vocabflow_quiz_stats');

        // Ensure SPECIALIZED_VOCABULARY is defined (loaded from specialized-data.js)
        const specList = typeof SPECIALIZED_VOCABULARY !== 'undefined' ? SPECIALIZED_VOCABULARY : [];
        
        if (storedVocab) {
            state.vocabulary = JSON.parse(storedVocab);
            if (!Array.isArray(state.vocabulary) || state.vocabulary.length === 0) {
                state.vocabulary = [...INITIAL_VOCABULARY, ...specList];
                saveVocabToStorage();
            } else {
                // Self-healing merge: Add any missing specialized words to the existing state
                let merged = false;
                specList.forEach(specWord => {
                    if (!state.vocabulary.some(w => w.id === specWord.id)) {
                        state.vocabulary.push(specWord);
                        merged = true;
                    }
                });
                if (merged) {
                    saveVocabToStorage();
                }
            }
        } else {
            state.vocabulary = [...INITIAL_VOCABULARY, ...specList];
            saveVocabToStorage();
        }

        if (storedCustom) {
            state.customWords = JSON.parse(storedCustom);
        } else {
            state.customWords = [];
        }

        if (storedStreak) state.streak = parseInt(storedStreak, 10);
        if (storedLastDate) state.lastStudyDate = storedLastDate;
        
        if (storedQuizStats) {
            state.quizStats = JSON.parse(storedQuizStats);
        }

        const storedLevel = localStorage.getItem('vocabflow_user_level');
        const storedTestScore = localStorage.getItem('vocabflow_last_test_score');
        const storedRoadmap = localStorage.getItem('vocabflow_roadmap_tasks');
        const storedStars = localStorage.getItem('vocabflow_stars');
        const storedPhoto = localStorage.getItem('vocabflow_photo_url');
        const storedDisplayName = localStorage.getItem('vocabflow_display_name');
        const storedCompletedLessons = localStorage.getItem('vocabflow_completed_lessons');
        const storedCompletedSentences = localStorage.getItem('vocabflow_completed_sentences');
        
        if (storedLevel) {
            state.userLevel = storedLevel;
        } else {
            state.userLevel = 'Beginner';
        }
        
        if (storedTestScore) {
            state.lastTestScore = parseInt(storedTestScore, 10);
        } else {
            state.lastTestScore = 0;
        }

        if (storedRoadmap) {
            state.roadmapTasks = JSON.parse(storedRoadmap);
        } else {
            state.roadmapTasks = generateRoadmapTasks(state.userLevel);
        }
        
        if (storedStars) state.stars = parseInt(storedStars, 10);
        if (storedPhoto) state.photoURL = storedPhoto;
        if (storedDisplayName) state.displayName = storedDisplayName;
        if (storedCompletedLessons) state.completedLessons = JSON.parse(storedCompletedLessons);
        else state.completedLessons = [];
        
        if (storedCompletedSentences) state.completedSentences = JSON.parse(storedCompletedSentences);
        else state.completedSentences = [];
    } catch (e) {
        console.error('Error reading localStorage data', e);
        // Fallback
        state.vocabulary = [...INITIAL_VOCABULARY];
        state.customWords = [];
        state.completedLessons = [];
        state.completedSentences = [];
        state.userLevel = 'Beginner';
        state.lastTestScore = 0;
        state.roadmapTasks = generateRoadmapTasks('Beginner');
    }
}

// Save helpers
function saveVocabToStorage() {
    localStorage.setItem('vocabflow_vocab', JSON.stringify(state.vocabulary));
}

// Save custom words
function saveCustomWordsToStorage() {
    localStorage.setItem('vocabflow_custom', JSON.stringify(state.customWords));
}

function saveStatsToStorage() {
    localStorage.setItem('vocabflow_streak', state.streak.toString());
    localStorage.setItem('vocabflow_last_date', state.lastStudyDate);
    localStorage.setItem('vocabflow_quiz_stats', JSON.stringify(state.quizStats));
    localStorage.setItem('vocabflow_user_level', state.userLevel);
    localStorage.setItem('vocabflow_last_test_score', state.lastTestScore.toString());
    localStorage.setItem('vocabflow_roadmap_tasks', JSON.stringify(state.roadmapTasks));
    localStorage.setItem('vocabflow_stars', state.stars.toString());
    localStorage.setItem('vocabflow_photo_url', state.photoURL);
    localStorage.setItem('vocabflow_display_name', state.displayName);
    localStorage.setItem('vocabflow_completed_lessons', JSON.stringify(state.completedLessons));
    localStorage.setItem('vocabflow_completed_sentences', JSON.stringify(state.completedSentences));
    
    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL);
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

// Streak Calculation Logic
function checkAndUpdateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (state.lastStudyDate === today) {
        // Already studied today, streak remains same
        return;
    } else if (state.lastStudyDate === yesterday) {
        // Studied yesterday, consecutive day study!
        state.streak += 1;
        state.lastStudyDate = today;
        saveStatsToStorage();
    } else {
        // Broke the streak (gap > 1 day) or brand new user
        if (state.lastStudyDate === '') {
            state.streak = 1; // Brand new study starting today
        } else {
            state.streak = 1; // Reset streak
        }
        state.lastStudyDate = today;
        saveStatsToStorage();
    }
}

// --- RENDERING & UI SYNC ---

function renderDashboard() {
    // Update Gold Stars counter
    const starsCountEl = document.getElementById('dashboard-stars-count');
    if (starsCountEl) {
        starsCountEl.textContent = state.stars;
    }

    // Update dynamic welcome greeting
    const welcomeUserEl = document.getElementById('welcome-username');
    if (welcomeUserEl) {
        welcomeUserEl.textContent = state.displayName ? state.displayName.split(' ')[0] : 'Học viên';
    }

    // Update Private Assessment & Level (Confidential display for current student only)
    const level = state.userLevel || 'Beginner';
    const score = state.lastTestScore !== undefined ? state.lastTestScore : 0;
    
    let levelNameShort = 'Sơ cấp';
    if (level === 'Intermediate') {
        levelNameShort = 'Trung cấp';
    } else if (level === 'Advanced') {
        levelNameShort = 'Cao cấp';
    }
    
    const assessmentValEl = document.getElementById('dashboard-assessment-val');
    const assessmentLevelEl = document.getElementById('dashboard-assessment-level');
    if (assessmentValEl) assessmentValEl.textContent = `${score}/10`;
    if (assessmentLevelEl) assessmentLevelEl.textContent = `Trình độ: ${levelNameShort}`;
    
    const profileLevelText = document.getElementById('user-private-level-text');
    if (profileLevelText) {
        profileLevelText.textContent = `${levelNameShort} (${score}/10)`;
    }

    // Group all words (built-in + custom)
    const allWords = [...state.vocabulary, ...state.customWords];
    
    // Filter syllabus words based on student's current level
    let levelWords = allWords;
    if (level === 'Beginner') {
        levelWords = allWords.filter(w => w.category === 'oxford' || w.category === 'custom');
    } else if (level === 'Intermediate') {
        levelWords = allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'custom');
    } else {
        levelWords = allWords; // Advanced gets everything
    }

    const totalWordsCount = levelWords.length;
    const masteredCount = levelWords.filter(w => w.box === 3).length;
    const learningCount = levelWords.filter(w => w.box === 2).length;
    const newCount = levelWords.filter(w => w.box === 1).length;

    // Calculate how many words are due for review (nextReview <= now)
    const now = Date.now();
    const reviewCount = levelWords.filter(w => w.nextReview <= now && w.box < 3).length;

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

    // Render "Word of the Day"
    renderWordOfTheDay();

    // Render Dynamic Learning Roadmap
    renderRoadmap();
}

// Generate random "Word of the Day"
function renderWordOfTheDay() {
    const allWords = [...state.vocabulary, ...state.customWords];
    if (allWords.length === 0) return;

    const level = state.userLevel || 'Beginner';
    let levelWords = allWords;
    if (level === 'Beginner') {
        levelWords = allWords.filter(w => w.category === 'oxford' || w.category === 'custom');
    } else if (level === 'Intermediate') {
        levelWords = allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'custom');
    } else {
        levelWords = allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'academic' || w.category === 'custom');
    }

    if (levelWords.length === 0) levelWords = allWords; // Fallback

    // Pick a deterministic word of the day using the current date
    const dateNum = new Date().getDate();
    const index = dateNum % levelWords.length;
    const wotd = levelWords[index];

    document.getElementById('wotd-word').textContent = wotd.word;
    document.getElementById('wotd-type').textContent = wotd.type;
    document.getElementById('wotd-ipa').textContent = wotd.ipa || '';
    document.getElementById('wotd-meaning').textContent = wotd.meaning;
    document.getElementById('wotd-example-en').textContent = `"${wotd.example || ''}"`;
    document.getElementById('wotd-example-vi').textContent = `"${wotd.example_vi || ''}"`;

    // Attach click to voice
    const voiceBtn = document.getElementById('wotd-speak-btn');
    // Remove old listeners
    const newBtn = voiceBtn.cloneNode(true);
    voiceBtn.parentNode.replaceChild(newBtn, voiceBtn);
    newBtn.addEventListener('click', () => speakEnglish(wotd.word));
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
        if (level === 'Beginner') {
            filtered = allWords.filter(w => w.category === 'oxford' || w.category === 'custom');
        } else if (level === 'Intermediate') {
            filtered = allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'custom');
        } else {
            // Advanced
            filtered = allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'academic' || w.category === 'custom');
        }
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
    boxBadge.textContent = `Hộp ${card.box}`;
    if (card.box === 1) boxBadge.style.color = 'var(--warning)';
    else if (card.box === 2) boxBadge.style.color = 'var(--primary-light)';
    else boxBadge.style.color = 'var(--success)';

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
function handleFlashcardAction(isCorrect) {
    if (flashcardDeck.length === 0) return;
    
    // Register study activity for Streak
    checkAndUpdateStreak();
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
            if (state.userLevel === 'Beginner') {
                daysMultiplier = sourceList[originalIdx].box === 2 ? 1.5 : 4;
            } else if (state.userLevel === 'Advanced') {
                daysMultiplier = sourceList[originalIdx].box === 2 ? 5 : 12;
            }
            
            sourceList[originalIdx].nextReview = now + (daysMultiplier * 24 * 60 * 60 * 1000);
        } else {
            // Downgrade to Box 1 (New) and schedule review immediately
            sourceList[originalIdx].box = 1;
            sourceList[originalIdx].nextReview = now; // Ready immediately
        }

        // Save
        if (isCustom) saveCustomWordsToStorage();
        else saveVocabToStorage();

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
                level = 'Advanced';
                levelName = 'Cao cấp (C1-C2)';
            } else {
                level = 'Intermediate';
                levelName = 'Trung cấp (B1-B2)'; // Slower recall, downgraded to Intermediate
            }
        } else if (quizScore >= 5) {
            if (durationSec < 95) {
                level = 'Intermediate';
                levelName = 'Trung cấp (B1-B2)';
            } else {
                level = 'Beginner';
                levelName = 'Sơ cấp (A1-A2)'; // Too slow, downgraded to Beginner
            }
        } else {
            level = 'Beginner';
            levelName = 'Sơ cấp (A1-A2)';
        }
        
        state.userLevel = level;
        state.lastTestScore = quizScore;
        state.roadmapTasks = generateRoadmapTasks(level);
        saveStatsToStorage();
        
        msgEl.innerHTML = `
            🎓 <b>KẾT QUẢ ĐÁNH GIÁ PHẢN XẠ & TRÌNH ĐỘ:</b><br>
            • Độ chính xác: <b>${quizScore}/10 câu đúng</b> (${pct}%)<br>
            • Thời gian hoàn thành: <b>${durationSec} giây</b> (${speedRating})<br>
            • Xếp hạng trình độ: <span class="level-badge ${level.toLowerCase()}" style="font-size:12px; padding: 4px 10px; box-shadow:none; line-height:1.2; display:inline-block; margin: 6px 0;">${levelName}</span><br>
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
    if (level === 'Beginner') {
        return [
            { text: "Luyện 10 thẻ Flashcard bộ Oxford Essential thiết yếu", completed: false },
            { text: "Làm đúng từ 5/10 câu trắc nghiệm Oxford", completed: false },
            { text: "Luyện phát âm 3 câu giao tiếp hàng ngày", completed: false }
        ];
    } else if (level === 'Intermediate') {
        return [
            { text: "Ôn tập 15 thẻ Hộp Leitner (Hộp 2/3) cần xem lại", completed: false },
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

    // Assessed State - Render dynamic roadmap!
    let badgeClass = 'beginner';
    let levelVN = 'Sơ cấp (A1-A2)';
    let analysisVN = 'Bạn đang ở trình độ sơ cấp. Lộ trình tối ưu: Tập trung 100% học bộ từ vựng giao tiếp thiết yếu <b>Oxford Essential</b> và thực hành thẻ ghi nhớ Leitner mỗi ngày để củng cố nền tảng.';
    let recommendations = [
        { cat: 'Oxford Essential', action: 'Học ngay', key: 'oxford' },
        { cat: 'Giao tiếp hàng ngày', action: 'Xem mẫu câu', key: 'communicative' }
    ];

    if (state.userLevel === 'Intermediate') {
        badgeClass = 'intermediate';
        levelVN = 'Trung cấp (B1-B2)';
        analysisVN = 'Bạn đã có phản xạ từ vựng khá vững vàng. Lộ trình tối ưu: Luyện tập xen kẽ bộ từ <b>Oxford Essential</b> kết hợp với <b>Thành ngữ giao tiếp (Idioms)</b> để tự tin giao tiếp tự nhiên hơn.';
        recommendations = [
            { cat: 'Idioms & Phrases', action: 'Luyện tập', key: 'idioms' },
            { cat: 'Giao tiếp hàng ngày', action: 'Học mẫu câu', key: 'communicative' }
        ];
    } else if (state.userLevel === 'Advanced') {
        badgeClass = 'advanced';
        levelVN = 'Cao cấp (C1-C2)';
        analysisVN = 'Tuyệt vời! Vốn từ và khả năng hiểu của bạn rất rộng. Lộ trình tối ưu: Tập trung chinh phục bộ từ <b>Academic & IELTS</b> nâng cao và làm quen các mẫu câu đàm phán, thuyết trình tại công sở.';
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
    // 1. Checklist toggling
    container.querySelectorAll('.roadmap-task-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-index'), 10);
            state.roadmapTasks[idx].completed = !state.roadmapTasks[idx].completed;
            saveStatsToStorage();
            renderRoadmap();
        });
    });

    // 2. Recommendation links navigation
    container.querySelectorAll('.rec-action').forEach(action => {
        action.addEventListener('click', () => {
            const key = action.getAttribute('data-key');
            if (key === 'communicative') {
                document.getElementById('btn-sentences').click();
            } else {
                document.getElementById('btn-flashcards').click();
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

function handleAddWordForm(e) {
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
    saveCustomWordsToStorage();
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

function deleteWordFromWordbook(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa từ này khỏi Sổ tay?')) return;

    state.customWords = state.customWords.filter(w => w.id !== id);
    saveCustomWordsToStorage();

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
            }
        });
    });
}

// --- EVENT LISTENERS INITIALIZATION ---

function initApp() {
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

    // 3. Setup Firebase Auth & Data Sync Listener
    if (window.FirebaseSync) {
        window.FirebaseSync.onStateChanged(async (user) => {
            const authOverlay = document.getElementById('auth-overlay');
            const profileCard = document.getElementById('user-profile-card');
            const guestBanner = document.getElementById('guest-mode-banner');

            if (user) {
                // Cloud Mode Activated!
                isCloudMode = true;
                authOverlay.classList.add('hidden');
                profileCard.classList.remove('hidden');
                guestBanner.classList.add('hidden');

                // Save email, display name and Google Photo to state
                state.currentUserEmail = user.email || '';
                state.displayName = user.displayName || '';
                state.googlePhotoURL = user.photoURL || '';

                // Render User Profile Card
                renderUserAvatar(state.photoURL || user.photoURL);
                document.getElementById('user-display-name').textContent = user.displayName || 'Học viên';

                console.log("☁️ Syncing database progress with Firebase...");
                
                // Fetch progress from firestore
                const cloudData = await window.FirebaseSync.loadUserData();
                if (cloudData) {
                    // Update local state with cloud data
                    if (cloudData.profile) {
                        state.streak = cloudData.profile.streak || 0;
                        state.lastStudyDate = cloudData.profile.lastStudyDate || '';
                        state.quizStats = cloudData.profile.quizStats || { totalAnswered: 0, correctAnswers: 0 };
                        state.userLevel = cloudData.profile.userLevel || '';
                        state.roadmapTasks = cloudData.profile.roadmapTasks || [];
                        state.stars = cloudData.profile.stars || 0;
                        state.photoURL = cloudData.profile.photoURL || '';
                        renderUserAvatar(state.photoURL || user.photoURL);
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
                } else {
                    // Brand new Firebase user, write current state (initial deck) up to cloud
                    await syncCurrentStateToCloud();
                }

                // Sync local backup
                saveVocabToStorage();
                saveCustomWordsToStorage();
                saveStatsToStorage();

                // Re-render views with user specific data
                renderDashboard();
            } else {
                // Not authenticated (either Firebase is not configured, or user signed out, or skipped)
                isCloudMode = false;
                profileCard.classList.add('hidden');

                if (window.FirebaseSync.isConfigured) {
                    // Firebase is configured, but no user is signed in
                    if (authSkip) {
                        // User clicked skip, let them work in Guest mode
                        authOverlay.classList.add('hidden');
                        guestBanner.classList.remove('hidden');
                    } else {
                        // Force login overlay
                        authOverlay.classList.remove('hidden');
                        guestBanner.classList.add('hidden');
                    }
                } else {
                    // Firebase is not configured at all (default app out of the box)
                    authOverlay.classList.add('hidden');
                    guestBanner.classList.remove('hidden');
                    guestBanner.querySelector('.banner-text').textContent = 'Chế độ Khách (Offline)';
                }

                // Load offline local data
                loadState();
                renderDashboard();
            }
        });
    } else {
        // Fallback if script somehow not loaded, load offline local data
        loadState();
        renderDashboard();
    }

    // 4. Wordbook Submit Action
    document.getElementById('add-word-form').addEventListener('submit', handleAddWordForm);

    // Avatar Selector Dialog bindings
    const avatarOpenBtn = document.getElementById('btn-open-avatar-modal');
    if (avatarOpenBtn) {
        avatarOpenBtn.addEventListener('click', () => {
            if (isCloudMode) {
                document.getElementById('avatar-modal').classList.remove('hidden');
                renderAvatarModalChoices();
            } else {
                alert('Vui lòng đăng nhập để sử dụng tính năng đổi ảnh đại diện thú cưng ngộ nghĩnh!');
            }
        });
    }
    
    const avatarCancelBtn = document.getElementById('btn-avatar-cancel');
    if (avatarCancelBtn) {
        avatarCancelBtn.addEventListener('click', () => {
            document.getElementById('avatar-modal').classList.add('hidden');
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
        initQuizSession(cat);
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
}

// Firebase Auth Actions
async function handleGoogleLogin() {
    try {
        await window.FirebaseSync.login();
    } catch (error) {
        alert('Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng và thử lại!');
    }
}

async function handleGoogleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất? Dữ liệu của bạn đã được lưu an toàn trên Cloud.')) {
        authSkip = false;
        await window.FirebaseSync.logout();
    }
}

function skipAuthOverlay() {
    authSkip = true;
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('guest-mode-banner').classList.remove('hidden');
    loadState();
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
    await window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL);
    
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

function renderAvatarModalChoices() {
    const grid = document.getElementById('avatar-emoji-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const currentAvatar = state.photoURL || '';

    ANIMAL_AVATARS.forEach(item => {
        const choice = document.createElement('div');
        const isSelected = currentAvatar === 'emoji:' + item.emoji;
        choice.className = `avatar-choice-item ${isSelected ? 'selected' : ''}`;
        
        choice.innerHTML = `
            <span class="avatar-choice-emoji">${item.emoji}</span>
            <span class="avatar-choice-label">${item.label}</span>
        `;
        
        choice.addEventListener('click', () => {
            document.querySelectorAll('.avatar-choice-item').forEach(c => c.classList.remove('selected'));
            choice.classList.add('selected');
            
            const selectedAvatarString = 'emoji:' + item.emoji;
            state.photoURL = selectedAvatarString;
            
            // Apply locally
            renderUserAvatar(selectedAvatarString);
            
            // Save & Sync to Firebase Firestore
            saveStatsToStorage();
            
            // Close modal after selection
            setTimeout(() => {
                document.getElementById('avatar-modal').classList.add('hidden');
                awardStars(5, `Đổi sang đại diện ${item.label} ${item.emoji}`);
            }, 300);
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
const storiesState = { completedStories: JSON.parse(localStorage.getItem('le_stories_done') || '[]') };

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
    const quizContainer = document.getElementById('story-quiz-container');
    quizContainer.innerHTML = '';
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
                localStorage.setItem('le_stories_done', JSON.stringify(storiesState.completedStories));
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
});
