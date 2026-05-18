/* ==========================================================================
   VocabFlow - Application Engine (JavaScript Core)
   ========================================================================== */

// --- INITIAL VOCABULARY DATASET ---
const INITIAL_VOCABULARY = [
    // 1. Oxford Essential Words (oxford)
    { id: 'ox-1', word: 'Abandon', type: 'verb', ipa: '/əˈbændən/', meaning: 'Bỏ rơi, từ bỏ', example: 'The crew abandoned the sinking ship.', example_vi: 'Thủy thủ đoàn đã bỏ lại con tàu đang chìm.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-2', word: 'Benefit', type: 'noun', ipa: '/ˈbenɪfɪt/', meaning: 'Lợi ích, phúc lợi', example: 'There are many benefits to regular exercise.', example_vi: 'Có rất nhiều lợi ích từ việc tập thể dục đều đặn.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-3', word: 'Constant', type: 'adjective', ipa: '/ˈkɑːnstənt/', meaning: 'Không thay đổi, liên tục', example: 'The baby needs constant attention.', example_vi: 'Đứa bé cần được chú ý liên tục.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-4', word: 'Diverse', type: 'adjective', ipa: '/daɪˈvɜːrs/', meaning: 'Đa dạng, phong phú', example: 'London has a very diverse population.', example_vi: 'Luân Đôn có một dân số rất đa dạng.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-5', word: 'Emphasize', type: 'verb', ipa: '/ˈemfəsaɪz/', meaning: 'Nhấn mạnh, làm nổi bật', example: 'Our teacher emphasized the importance of grammar.', example_vi: 'Giáo viên của chúng tôi nhấn mạnh tầm quan trọng của ngữ pháp.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-6', word: 'Guarantee', type: 'verb', ipa: '/ˌɡærənˈtiː/', meaning: 'Bảo hành, cam đoan', example: 'We guarantee that our products are genuine.', example_vi: 'Chúng tôi cam đoan sản phẩm của chúng tôi là chính hãng.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-7', word: 'Hypothesis', type: 'noun', ipa: '/haɪˈpɑːθəsɪs/', meaning: 'Giả thuyết', example: 'Scientists proposed a new hypothesis.', example_vi: 'Các nhà khoa học đã đề xuất một giả thuyết mới.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-8', word: 'Illustrate', type: 'verb', ipa: '/ˈɪləstreɪt/', meaning: 'Minh họa, giải thích bằng tranh', example: 'This diagram illustrates how the machine works.', example_vi: 'Biểu đồ này minh họa cách thức hoạt động của máy.', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-9', word: 'Justify', type: 'verb', ipa: '/ˈdʒʌstɪfaɪ/', meaning: 'Bào chữa, biện minh', example: 'How can you justify your bad behavior?', example_vi: 'Làm sao bạn có thể biện minh cho hành vi xấu của mình?', category: 'oxford', box: 1, nextReview: 0 },
    { id: 'ox-10', word: 'Maintain', type: 'verb', ipa: '/meɪnˈteɪn/', meaning: 'Duy trì, bảo dưỡng', example: 'You must maintain a healthy lifestyle.', example_vi: 'Bạn phải duy trì một lối sống lành mạnh.', category: 'oxford', box: 1, nextReview: 0 },

    // 2. Academic & IELTS Words (academic)
    { id: 'ac-1', word: 'Acquire', type: 'verb', ipa: '/əˈkwaɪər/', meaning: 'Đạt được, thu hoạch được', example: 'She acquired a deep knowledge of art history.', example_vi: 'Cô ấy đã tích lũy được kiến thức sâu rộng về lịch sử nghệ thuật.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-2', word: 'Consequence', type: 'noun', ipa: '/ˈkɑːnsəkwens/', meaning: 'Hệ quả, hậu quả', example: 'Actions always have consequences.', example_vi: 'Hành động luôn luôn đi kèm với hậu quả.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-3', word: 'Equivalent', type: 'adjective', ipa: '/ɪˈkwɪvələnt/', meaning: 'Tương đương', example: 'Eight kilometers is equivalent to about five miles.', example_vi: 'Tám km tương đương với khoảng năm dặm.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-4', word: 'Fluctuate', type: 'verb', ipa: '/ˈflʌktʃueɪt/', meaning: 'Dao động, biến động', example: 'Gold prices fluctuate daily.', example_vi: 'Giá vàng biến động hàng ngày.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-5', word: 'Generate', type: 'verb', ipa: '/ˈdʒenəreɪt/', meaning: 'Tạo ra, phát sinh', example: 'Wind turbines generate clean electricity.', example_vi: 'Tua bin gió tạo ra điện năng sạch.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-6', word: 'Hinder', type: 'verb', ipa: '/ˈhɪndər/', meaning: 'Cản trở, kìm hãm', example: 'Bad weather hindered our search efforts.', example_vi: 'Thời tiết xấu đã cản trở nỗ lực tìm kiếm của chúng tôi.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-7', word: 'Inevitable', type: 'adjective', ipa: '/ɪnˈevɪtəbl/', meaning: 'Không thể tránh khỏi', example: 'Death is an inevitable part of life.', example_vi: 'Cái chết là một phần không thể tránh khỏi của cuộc sống.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-8', word: 'Methodical', type: 'adjective', ipa: '/məˈθɑːdɪkl/', meaning: 'Có phương pháp, ngăn nắp', example: 'He is a methodical student who plans everything.', example_vi: 'Cậu ấy là một học sinh có quy củ, luôn lên kế hoạch cho mọi việc.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-9', word: 'Obtain', type: 'verb', ipa: '/əbˈteɪn/', meaning: 'Đạt được, giành được', example: 'He obtained a visa after weeks of waiting.', example_vi: 'Anh ấy đã xin được visa sau nhiều tuần chờ đợi.', category: 'academic', box: 1, nextReview: 0 },
    { id: 'ac-10', word: 'Prevalent', type: 'adjective', ipa: '/ˈprevələnt/', meaning: 'Phổ biến, thịnh hành', example: 'Flu is prevalent during winter months.', example_vi: 'Bệnh cúm rất phổ biến trong những tháng mùa đông.', category: 'academic', box: 1, nextReview: 0 },

    // 3. Idioms & Phrasal Verbs (idioms)
    { id: 'id-1', word: 'Bite the bullet', type: 'phrase', ipa: '/baɪt ðə ˈbʊlɪt/', meaning: 'Cắn răng chịu đựng, đối mặt khó khăn', example: 'I hate dentists, but I had to bite the bullet and go.', example_vi: 'Tôi ghét nha sĩ, nhưng tôi phải cắn răng chịu đựng để đi khám.', category: 'idioms', box: 1, nextReview: 0 },
    { id: 'id-2', word: 'Break a leg', type: 'phrase', ipa: '/breɪk ə leɡ/', meaning: 'Chúc may mắn (thường dùng trong nghệ thuật)', example: 'Break a leg in your theater show tonight!', example_vi: 'Chúc buổi biểu diễn kịch tối nay của bạn thành công rực rỡ!', category: 'idioms', box: 1, nextReview: 0 },
    { id: 'id-3', word: 'Call it a day', type: 'phrase', ipa: '/kɔːl ɪt ə deɪ/', meaning: 'Nghỉ tay, kết thúc ngày làm việc', example: 'We are all tired, let’s call it a day.', example_vi: 'Chúng ta đều mệt rồi, nghỉ tay thôi.', category: 'idioms', box: 1, nextReview: 0 },
    { id: 'id-4', word: 'Under the weather', type: 'phrase', ipa: '/ˈʌndər ðə ˈweðər/', meaning: 'Mệt mỏi, không được khỏe', example: 'I will stay home because I feel under the weather.', example_vi: 'Tôi sẽ ở nhà vì cảm thấy người hơi mệt.', category: 'idioms', box: 1, nextReview: 0 },
    { id: 'id-5', word: 'Spill the beans', type: 'phrase', ipa: '/spɪl ðə biːnz/', meaning: 'Tiết lộ bí mật', example: 'Don’t spill the beans about the surprise party!', example_vi: 'Đừng làm lộ bí mật về bữa tiệc bất ngờ nhé!', category: 'idioms', box: 1, nextReview: 0 }
];

// --- INITIAL COMMUNICATIVE SENTENCES ---
const COMMUNICATIVE_SENTENCES = [
    // Greeting
    { english: 'How have you been lately?', vietnamese: 'Dạo này bạn thế nào?', category: 'greeting' },
    { english: 'Long time no see! What’s new?', vietnamese: 'Lâu rồi không gặp! Có gì mới không?', category: 'greeting' },
    { english: 'It’s a pleasure to meet you.', vietnamese: 'Rất hân hạnh được gặp bạn.', category: 'greeting' },
    { english: 'Have a wonderful day ahead!', vietnamese: 'Chúc bạn một ngày mới tuyệt vời!', category: 'greeting' },
    
    // Travel
    { english: 'Could you tell me how to get to the train station?', vietnamese: 'Bạn có thể chỉ cho tôi đường đến ga tàu hỏa được không?', category: 'travel' },
    { english: 'How much is a ticket to the airport?', vietnamese: 'Một vé đi sân bay giá bao nhiêu?', category: 'travel' },
    { english: 'Excuse me, is this seat taken?', vietnamese: 'Xin lỗi, chỗ này đã có ai ngồi chưa?', category: 'travel' },
    { english: 'Can you recommend a good local restaurant?', vietnamese: 'Bạn có thể gợi ý một nhà hàng địa phương ngon không?', category: 'travel' },

    // Dining & Shopping
    { english: 'Could we see the menu and the wine list, please?', vietnamese: 'Cho chúng tôi xem thực đơn và danh sách rượu với?', category: 'dining' },
    { english: 'I would like to order a medium-rare steak.', vietnamese: 'Tôi muốn đặt một phần bít tết chín vừa.', category: 'dining' },
    { english: 'Excuse me, could we have the bill, please?', vietnamese: 'Xin lỗi, cho chúng tôi xin hóa đơn tính tiền được không?', category: 'dining' },
    { english: 'Is there any discount on this item?', vietnamese: 'Mặt hàng này có được giảm giá không?', category: 'dining' },

    // Work
    { english: 'Let’s schedule a meeting to discuss the details.', vietnamese: 'Hãy lên lịch một cuộc họp để thảo luận chi tiết.', category: 'work' },
    { english: 'What is the absolute deadline for this project?', vietnamese: 'Hạn chót tuyệt đối của dự án này là khi nào?', category: 'work' },
    { english: 'I am currently working on this task and will finish soon.', vietnamese: 'Tôi đang làm nhiệm vụ này và sẽ sớm hoàn thành thôi.', category: 'work' },
    { english: 'Thank you for your valuable feedback.', vietnamese: 'Cảm ơn sự phản hồi quý giá của bạn.', category: 'work' }
];

// --- GLOBAL APPLICATION STATE ---
let state = {
    vocabulary: [],
    customWords: [],
    streak: 0,
    lastStudyDate: '',
    quizStats: {
        totalAnswered: 0,
        correctAnswers: 0
    }
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

        if (storedVocab) {
            state.vocabulary = JSON.parse(storedVocab);
        } else {
            state.vocabulary = [...INITIAL_VOCABULARY];
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
    } catch (e) {
        console.error('Error reading localStorage data', e);
        // Fallback
        state.vocabulary = [...INITIAL_VOCABULARY];
        state.customWords = [];
    }
}

// Save helpers
function saveVocabToStorage() {
    localStorage.setItem('vocabflow_vocab', JSON.stringify(state.vocabulary));
}

function saveCustomWordsToStorage() {
    localStorage.setItem('vocabflow_custom', JSON.stringify(state.customWords));
}

function saveStatsToStorage() {
    localStorage.setItem('vocabflow_streak', state.streak.toString());
    localStorage.setItem('vocabflow_last_date', state.lastStudyDate);
    localStorage.setItem('vocabflow_quiz_stats', JSON.stringify(state.quizStats));
    
    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats);
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

// 1. Dashboard UI Renderer
function renderDashboard() {
    const totalWordsCount = state.vocabulary.length + state.customWords.length;
    
    // Group all words (built-in + custom)
    const allWords = [...state.vocabulary, ...state.customWords];
    
    const masteredCount = allWords.filter(w => w.box === 3).length;
    const learningCount = allWords.filter(w => w.box === 2).length;
    const newCount = allWords.filter(w => w.box === 1).length;

    // Calculate how many words are due for review (nextReview <= now)
    const now = Date.now();
    const reviewCount = allWords.filter(w => w.nextReview <= now && w.box < 3).length;

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
}

// Generate random "Word of the Day"
function renderWordOfTheDay() {
    const allWords = [...state.vocabulary, ...state.customWords];
    if (allWords.length === 0) return;

    // Pick a deterministic word of the day using the current date
    const dateNum = new Date().getDate();
    const index = dateNum % allWords.length;
    const wotd = allWords[index];

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

function initFlashcardSession(category = 'all') {
    const now = Date.now();
    const allWords = [...state.vocabulary, ...state.customWords];

    // Filter deck by category
    let filtered = [];
    if (category === 'all') {
        filtered = [...allWords];
    } else if (category === 'custom') {
        filtered = [...state.customWords];
    } else {
        filtered = allWords.filter(w => w.category === category);
    }

    if (filtered.length === 0) {
        // Show empty deck state
        flashcardDeck = [];
        renderEmptyFlashcardDeck();
        return;
    }

    // Sort words: Priority to words whose nextReview time has arrived
    // box < 3 means they are not fully mastered yet
    const reviewQueue = filtered.filter(w => w.nextReview <= now && w.box < 3);
    const regularQueue = filtered.filter(w => w.nextReview > now || w.box === 3);

    // Dynamic session deck: prioritizes review, fills the rest with normal words for practice
    flashcardDeck = [...reviewQueue, ...regularQueue];
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
            // Schedule next review based on Box weight
            // Box 2: review in 3 days, Box 3: review in 7 days
            const daysMultiplier = sourceList[originalIdx].box === 2 ? 3 : 7;
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
        initFlashcardSession(document.getElementById('flashcard-category').value);
    }
}

// --- DYNAMIC QUIZ SYSTEM ---

function initQuizSession(category = 'all') {
    const allWords = [...state.vocabulary, ...state.customWords];
    let sourcePool = [];

    if (category === 'all') {
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
    document.getElementById('result-time').textContent = `${durationSec} giây`;
    document.getElementById('result-accuracy').textContent = `${pct}%`;

    // Dynamic result message
    const msgEl = document.getElementById('quiz-result-message');
    if (pct >= 90) msgEl.textContent = '🌟 Xuất sắc! Kỷ lục gia ghi nhớ từ vựng!';
    else if (pct >= 70) msgEl.textContent = '👍 Rất tốt! Tiếp tục phát huy nhé!';
    else if (pct >= 50) msgEl.textContent = '📚 Khá tốt! Hãy ôn flashcard thêm một chút nữa.';
    else msgEl.textContent = '💪 Cố lên! Chăm chỉ luyện tập để cải thiện điểm số.';

    // Synchronize overall stats wheel on dashboard
    renderDashboard();
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

// --- COMMUNICATIVE SENTENCES RENDERER ---

function renderSentences(category = 'all') {
    const container = document.getElementById('sentences-list-container');
    
    const filtered = category === 'all' 
        ? COMMUNICATIVE_SENTENCES 
        : COMMUNICATIVE_SENTENCES.filter(s => s.category === category);

    container.innerHTML = '';

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'sentence-card';
        card.innerHTML = `
            <div class="sentence-card-content">
                <span class="sentence-tag">${item.category}</span>
                <p class="sentence-en">${item.english}</p>
                <p class="sentence-vi">${item.vietnamese}</p>
            </div>
            <div class="sentence-speak-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </div>
        `;

        card.addEventListener('click', () => {
            speakEnglish(item.english);
            // register study streak for sentences as well
            checkAndUpdateStreak();
            renderDashboard();
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
            } else if (targetId === 'dashboard-tab') {
                renderDashboard();
            }
        });
    });
}

// --- EVENT LISTENERS INITIALIZATION ---

function initApp() {
    // 1. Tab Routing Setup
    setUpTabNavigation();

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

                // Render User Profile Card
                document.getElementById('user-avatar-img').src = user.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
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
    await window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats);
    
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
                .then(reg => console.log('VocabFlow Service Worker registered successfully:', reg.scope))
                .catch(err => console.log('VocabFlow Service Worker registration failed:', err));
        });
    }
});
