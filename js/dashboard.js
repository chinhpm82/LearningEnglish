// --- RENDERING & UI SYNC ---
function getCEFRLevelDisplayName(level) {
    const map = {
        'A1': 'Sơ cấp (A1)',
        'A2': 'Sơ cấp (A2)',
        'B1': 'Trung cấp (B1)',
        'B2': 'Trung cấp (B2)',
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
    } else if (level === 'B1') {
        return allWords.filter(w => w.category === 'oxford' || w.category === 'idioms' || w.category === 'custom');
    } else if (level === 'B2') {
        return allWords.filter(w => w.category === 'academic' || w.category === 'custom');
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
    const baseVocabSeed = Math.round((stats.vocab / 4) * 100); // Sửa bug chia cho 8 thành chia cho 4 (vì stats.vocab tối đa là 4)
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
    // Áp dụng bộ lọc volume-weight để tránh việc mới làm 1 câu đúng đã nhảy vọt lên 100%
    const basePlacementSeed = Math.round((score / 16) * 100) || 15;
    const quizAccuracy = state.quizStats.totalAnswered > 0 ? (state.quizStats.correctAnswers / state.quizStats.totalAnswered * 100) : 0;
    // Cần trả lời tối thiểu 30 câu quiz đúng để đạt trọng số tối đa của phần trắc nghiệm
    const quizWeight = Math.min(1, state.quizStats.totalAnswered / 30);
    const quizFactor = quizAccuracy * quizWeight;
    
    // Kết hợp kết quả viết luận trung bình từ state.writingHighScores
    const essayScores = Object.values(state.writingHighScores || {});
    const averageEssayScore = essayScores.length > 0 ? Math.round(essayScores.reduce((a, b) => a + b, 0) / essayScores.length) : 0;
    
    // Tính toán điểm hỗn hợp: 60% từ quiz (có trọng số volume) + 40% từ trung bình viết luận
    const combinedFactor = Math.round(quizFactor * 0.6 + averageEssayScore * 0.4);
    const writingPct = Math.min(100, Math.max(basePlacementSeed, combinedFactor));

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

    // Bảng từ vựng hiển thị thống kê: Bao gồm tất cả các từ thuộc level hiện tại VÀ các từ đã học (box > 1) từ mọi trình độ trước đó!
    // Điều này giúp giữ vững lịch sử học tập (Lịch sử học từ vựng vẫn đếm dựa trên các từ cũ)
    const activeDashboardPoolMap = new Map();
    levelWords.forEach(w => activeDashboardPoolMap.set(w.id, w));
    allWords.forEach(w => {
        if (w.box > 1) {
            activeDashboardPoolMap.set(w.id, w);
        }
    });
    const activeDashboardPool = Array.from(activeDashboardPoolMap.values());

    // TỐI ƯU HÓA HIỆU NĂNG: Duyệt mảng 1 lần duy nhất để đếm các hộp Leitner và số lượng từ cần ôn tập
    const now = Date.now();
    const poolSize = activeDashboardPool.length;
    const displayTotalWordsCount = (poolSize < 500 && window.ACADEMIC_TOTAL) ? window.ACADEMIC_TOTAL : poolSize;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;
    let reviewCount = 0;

    for (let i = 0; i < poolSize; i++) {
        const w = activeDashboardPool[i];
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
    document.getElementById('stats-total-words').textContent = displayTotalWordsCount;
    document.getElementById('stats-learned').textContent = masteredCount;
    document.getElementById('stats-review').textContent = reviewCount;
    document.getElementById('streak-count-val').textContent = state.streak;

    // Calculate Quiz accuracy
    let accuracyText = '0%';
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
    if (displayTotalWordsCount > 0) {
        const weightedSum = (masteredCount * 100) + (learningCount * 50);
        progressPct = Math.round(weightedSum / displayTotalWordsCount);
    }

    pctText.textContent = `${progressPct}%`;
    
    // Circle radius is 54, circumference is 2 * Math.PI * 54 = ~339.3
    const circumference = 2 * Math.PI * 54;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (progressPct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // --- UPDATE CEFR SKILL RADAR BARS ---
    updateCEFRSkillsRadarBars(score, masteredCount, displayTotalWordsCount);

    // Render "Word of the Day"
    renderWordOfTheDay();

    // Render Dynamic Learning Roadmap
    renderRoadmap();
}

// Generate random "Word of the Day"
async function renderWordOfTheDay(forceRefresh = false) {
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

    const wotdIndex = state.currentWotd;
    if (!wotdIndex) return;

    // Fetch full word details on-demand
    const wotd = await LearningDB.getFullWordData(wotdIndex.id);
    if (!wotd) {
        console.warn("Could not load details for Word of the Day:", wotdIndex);
        return;
    }

    document.getElementById('wotd-word').textContent = wotd.word;
    document.getElementById('wotd-type').textContent = wotd.type || '';
    document.getElementById('wotd-ipa').textContent = wotd.ipa || '';
    document.getElementById('wotd-meaning').textContent = wotd.meaning || '';
    document.getElementById('wotd-example-en').textContent = wotd.example ? `"${wotd.example}"` : '';
    document.getElementById('wotd-example-vi').textContent = wotd.example_vi ? `"${wotd.example_vi}"` : '';

    // Attach click to voice
    const voiceBtn = document.getElementById('wotd-speak-btn');
    if (voiceBtn) {
        // Remove old listeners
        const newBtn = voiceBtn.cloneNode(true);
        voiceBtn.parentNode.replaceChild(newBtn, voiceBtn);
        newBtn.addEventListener('click', () => speakEnglish(wotd.word));
    }
}

