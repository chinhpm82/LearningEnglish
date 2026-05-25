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

