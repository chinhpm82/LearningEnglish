// --- FLASHCARD ENGINE (Backend-powered, one word at a time) ---

// Flashcard session state
let flashcardCurrentWord = null;
let flashcardSeenIds = [];
let flashcardCategory = 'all';
let flashcardSessionCount = 0;

async function initFlashcardSession(category) {
    flashcardCategory = category || 'all';
    flashcardSeenIds = [];
    flashcardSessionCount = 0;
    flashcardCurrentWord = null;

    await loadNextFlashcardWord();
}

async function loadNextFlashcardWord() {
    const container = document.getElementById('flashcard-element');
    if (!container) return;

    // Show loading
    container.classList.remove('flipped');
    isCardFlipped = false;
    document.getElementById('card-front-word').textContent = '...';
    document.getElementById('card-front-type').textContent = '';
    document.getElementById('card-front-ipa').textContent = 'Đang tải từ tiếp theo...';
    document.getElementById('card-back-meaning').textContent = '';
    document.getElementById('card-back-example-en').textContent = '';
    document.getElementById('card-back-example-vi').textContent = '';
    document.getElementById('card-box-badge').textContent = '-';

    const level = state.userLevel || 'A1';
    const exclude = flashcardSeenIds.join(',');

    try {
        let word = null;

        if (flashcardCategory === 'custom') {
            // Custom words: pick from local state
            const customs = state.customWords || [];
            const unseen = customs.filter(w => !flashcardSeenIds.includes(w.id));
            if (unseen.length > 0) {
                word = unseen[Math.floor(Math.random() * unseen.length)];
            }
        } else if (window.ApiClient) {
            // Backend: random word by level (and category if specified)
            const res = await window.ApiClient.getVocabRandom(level, flashcardSeenIds, flashcardCategory !== 'all' ? flashcardCategory : undefined);
            word = res.data || null;
        }

        if (!word) {
            // No more words available or API failed
            if (flashcardSeenIds.length > 0) {
                // Reset seen list and try again
                flashcardSeenIds = [];
                await loadNextFlashcardWord();
                return;
            }
            renderEmptyFlashcardDeck();
            return;
        }

        flashcardCurrentWord = word;
        flashcardSeenIds.push(word.id);
        flashcardSessionCount++;

        renderFlashcardWord(word);
    } catch (e) {
        console.error("Failed to load flashcard word:", e);
        document.getElementById('card-front-ipa').textContent = 'Lỗi tải dữ liệu. Thử lại!';
    }
}

function renderFlashcardWord(word) {
    const container = document.getElementById('flashcard-element');
    container.classList.remove('flipped');
    isCardFlipped = false;

    document.getElementById('card-front-word').textContent = word.word;
    document.getElementById('card-front-type').textContent = word.type || '';
    document.getElementById('card-front-ipa').textContent = word.ipa || '';
    document.getElementById('card-box-badge').textContent = 'Từ mới';
    document.getElementById('card-box-badge').style.color = 'var(--warning)';

    document.getElementById('card-back-meaning').textContent = word.meaning || '';
    document.getElementById('card-back-example-en').textContent = word.example ? `"${word.example}"` : '';
    document.getElementById('card-back-example-vi').textContent = (word.example_vi || word.exampleVi) ? `"${word.example_vi || word.exampleVi}"` : '';

    // Progress bar (incremental)
    const progressFill = document.getElementById('flashcard-progress-bar');
    const deckCount = document.getElementById('flashcard-deck-count');
    const pct = Math.min(100, Math.round((flashcardSessionCount / 20) * 100));
    progressFill.style.width = `${pct}%`;
    deckCount.textContent = `Thẻ ${flashcardSessionCount}`;

    // Enable buttons
    document.getElementById('btn-card-incorrect').style.opacity = '1';
    document.getElementById('btn-card-correct').style.opacity = '1';
    document.getElementById('btn-card-incorrect').pointerEvents = 'auto';
    document.getElementById('btn-card-correct').pointerEvents = 'auto';
}

function renderEmptyFlashcardDeck() {
    document.getElementById('card-front-word').textContent = 'Trống Rỗng 📂';
    document.getElementById('card-front-type').textContent = '';
    document.getElementById('card-front-ipa').textContent = 'Không có từ nào phù hợp';
    document.getElementById('card-box-badge').textContent = '-';
    document.getElementById('card-back-meaning').textContent = 'Chưa có từ nào';
    document.getElementById('card-back-example-en').textContent = 'Hãy đổi chủ đề hoặc thử lại.';
    document.getElementById('card-back-example-vi').textContent = '';

    document.getElementById('flashcard-progress-bar').style.width = '0%';
    document.getElementById('flashcard-deck-count').textContent = 'Thẻ 0';

    document.getElementById('btn-card-incorrect').style.opacity = '0.4';
    document.getElementById('btn-card-correct').style.opacity = '0.4';
    document.getElementById('btn-card-incorrect').pointerEvents = 'none';
    document.getElementById('btn-card-correct').pointerEvents = 'none';

    const prevBtn = document.getElementById('btn-card-prev');
    const nextBtn = document.getElementById('btn-card-next');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
}

function toggleCardFlip() {
    const container = document.getElementById('flashcard-element');
    container.classList.toggle('flipped');
    isCardFlipped = !isCardFlipped;
}

async function handleFlashcardAction(isCorrect, isMastered = false) {
    if (!flashcardCurrentWord) return;

    checkAndUpdateStreak();
    trackDailyActivity('flashcard', 1);

    const word = flashcardCurrentWord;

    // Save progress if logged in
    if (isCloudMode && window.FirebaseSync && window.ApiClient && window.ApiClient.isLoggedIn()) {
        try {
            const box = isMastered ? 3 : (isCorrect ? 2 : 1);
            const nextReview = isMastered
                ? Date.now() + (30 * 24 * 60 * 60 * 1000)
                : isCorrect
                    ? Date.now() + (3 * 24 * 60 * 60 * 1000)
                    : Date.now();
            await window.ApiClient.saveProgress(word.id, box, nextReview);
        } catch (e) {
            console.warn("Failed to save flashcard progress:", e);
        }
    }

    // Update local state for dashboard
    const vocabIdx = state.vocabulary.findIndex(w => w.id === word.id);
    if (vocabIdx !== -1) {
        if (isMastered) {
            state.vocabulary[vocabIdx].box = 3;
        } else if (isCorrect) {
            if (state.vocabulary[vocabIdx].box < 3) state.vocabulary[vocabIdx].box++;
        } else {
            state.vocabulary[vocabIdx].box = 1;
        }
    }

    renderDashboard();

    // Load next word
    await loadNextFlashcardWord();
}
