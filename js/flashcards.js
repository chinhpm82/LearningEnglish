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

// Function to generate an adaptive, weighted multi-level flashcard pool based on CEFR levels
function getWeightedFlashcardPool(allWords, level) {
    const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const curIdx = CEFR_LEVELS.indexOf(level);
    
    // Default fallback if level not found in array
    if (curIdx === -1) {
        const pool = filterWordsByLevel(allWords, level);
        return {
            dueReviews: pool.filter(w => w.nextReview <= Date.now() && w.box < 3),
            practice: pool.filter(w => w.nextReview > Date.now() || w.box === 3)
        };
    }

    // 1. Get base pools for previous, current, and next levels
    const currentPool = filterWordsByLevel(allWords, level);
    const prevPool = curIdx > 0 ? filterWordsByLevel(allWords, CEFR_LEVELS[curIdx - 1]) : [];
    const nextPool = curIdx < CEFR_LEVELS.length - 1 ? filterWordsByLevel(allWords, CEFR_LEVELS[curIdx + 1]) : [];

    const now = Date.now();
    
    // We also want to keep ALL studied words in other levels (box > 1) reviewable when they are due!
    const studiedWords = allWords.filter(w => w.box > 1);

    // 2. Gather due reviews from all related and studied words (Always prioritize due reviews!)
    const allActiveWordsMap = new Map();
    [...currentPool, ...prevPool, ...nextPool, ...studiedWords].forEach(w => {
        allActiveWordsMap.set(w.id, w);
    });
    const allActiveWords = Array.from(allActiveWordsMap.values());
    const dueReviews = allActiveWords.filter(w => w.nextReview <= now && w.box < 3);

    // 3. For new/regular practice words, we sample in proportions: 70% current, 20% prev, 10% next
    const regularCurrent = currentPool.filter(w => w.nextReview > now || w.box === 3);
    const regularPrev = prevPool.filter(w => w.nextReview > now || w.box === 3);
    const regularNext = nextPool.filter(w => w.nextReview > now || w.box === 3);

    // Shuffle regular pools using Fisher-Yates
    const shufCurrent = shuffleArray(regularCurrent);
    const shufPrev = shuffleArray(regularPrev);
    const shufNext = shuffleArray(regularNext);

    // Determine target sample counts (e.g. target total 60 practice words in the session to keep it light)
    let currentCount = 42; // 70%
    let prevCount = 12;    // 20%
    let nextCount = 6;     // 10%

    if (prevPool.length === 0) {
        // Level is A1 (no prev level)
        currentCount = 48; // 80%
        nextCount = 12;    // 20%
        prevCount = 0;
    } else if (nextPool.length === 0) {
        // Level is C2 (no next level)
        currentCount = 48; // 80%
        prevCount = 12;    // 20%
        nextCount = 0;
    }

    const sampledCurrent = shufCurrent.slice(0, currentCount);
    const sampledPrev = shufPrev.slice(0, prevCount);
    const sampledNext = shufNext.slice(0, nextCount);

    // Combine all elements without duplicates
    const combinedPractice = [...sampledCurrent, ...sampledPrev, ...sampledNext];
    const finalPracticeMap = new Map();
    combinedPractice.forEach(w => finalPracticeMap.set(w.id, w));
    
    // Remove due reviews from practice map to avoid duplicates
    dueReviews.forEach(w => finalPracticeMap.delete(w.id));

    const finalPractice = Array.from(finalPracticeMap.values());

    return {
        dueReviews,
        practice: finalPractice
    };
}

function initFlashcardSession(category = 'all') {
    const now = Date.now();
    const allWords = [...state.vocabulary, ...state.customWords];
    const level = state.userLevel || 'Beginner';

    let reviewQueue = [];
    let regularQueue = [];

    // Filter deck based on category and level
    if (category === 'all') {
        // Automatically suggest random words using our adaptive weighted multi-level pool!
        const pool = getWeightedFlashcardPool(allWords, level);
        reviewQueue = pool.dueReviews;
        regularQueue = pool.practice;
    } else {
        let filtered = [];
        if (category === 'custom') {
            filtered = [...state.customWords];
        } else {
            // If they select a specific category, show words of that category
            filtered = allWords.filter(w => w.category === category);
        }
        reviewQueue = filtered.filter(w => w.nextReview <= now && w.box < 3);
        regularQueue = filtered.filter(w => w.nextReview > now || w.box === 3);
    }

    if (reviewQueue.length === 0 && regularQueue.length === 0) {
        flashcardDeck = [];
        renderEmptyFlashcardDeck();
        return;
    }

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

    // Update nav buttons disabled state
    const prevBtn = document.getElementById('btn-card-prev');
    const nextBtn = document.getElementById('btn-card-next');
    if (prevBtn) prevBtn.disabled = currentCardIndex === 0;
    if (nextBtn) nextBtn.disabled = currentCardIndex === flashcardDeck.length - 1;
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

    // Disable navigation buttons since deck is empty
    const prevBtn = document.getElementById('btn-card-prev');
    const nextBtn = document.getElementById('btn-card-next');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
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
            if (lvl === 'A1' || lvl === 'A2' || lvl === 'Beginner') {
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

    // Render dashboard instantly to update counts
    renderDashboard();

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

