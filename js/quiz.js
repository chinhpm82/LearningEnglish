// --- DYNAMIC QUIZ SYSTEM (Backend-powered) ---

// Map frontend category to backend difficulty
function quizCategoryToDifficulty(category) {
    if (category === 'easy' || category === 'oxford' || category === 'basic') return 'easy';
    if (category === 'hard' || category === 'advanced' || category === 'idioms') return 'hard';
    return 'normal'; // 'all', 'assessment', 'custom', 'academic', etc.
}

async function initQuizSession(category = 'all') {
    quizSelectedCategory = category;

    const activeState = document.getElementById('quiz-active-state');
    const introState = document.getElementById('quiz-intro-state');
    const resultState = document.getElementById('quiz-result-state');

    if (introState) introState.classList.add('hidden');
    if (resultState) resultState.classList.add('hidden');
    if (activeState) activeState.classList.remove('hidden');

    const quizCounter = document.getElementById('quiz-counter');
    const quizQuestionWord = document.getElementById('quiz-question-word');
    const optionsContainer = document.getElementById('quiz-options-container');

    if (quizCounter) quizCounter.textContent = "Đang chuẩn bị câu hỏi...";
    if (quizQuestionWord) quizQuestionWord.textContent = "Đang tải dữ liệu...";
    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <div class="loading-spinner-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; width: 100%;">
                <div class="spinner"></div>
            </div>`;
    }

    // Assessment mode: use local vocabulary quiz (no backend)
    if (category === 'assessment') {
        await initAssessmentQuiz();
        return;
    }

    // Backend-powered quiz (requires login)
    if (!window.ApiClient || !window.ApiClient.isLoggedIn()) {
        alert('Vui lòng đăng nhập để làm trắc nghiệm!');
        if (introState) introState.classList.remove('hidden');
        if (activeState) activeState.classList.add('hidden');
        return;
    }

    try {
        const difficulty = quizCategoryToDifficulty(category);
        const data = await window.ApiClient.generateQuiz(difficulty, 10);
        const questions = data.data || [];

        if (questions.length === 0) {
            alert('Không có câu hỏi phù hợp. Vui lòng thử lại!');
            if (introState) introState.classList.remove('hidden');
            if (activeState) activeState.classList.add('hidden');
            return;
        }

        // Transform backend questions to frontend format
        quizQuestions = questions.map(q => ({
            id: q.id,
            questionText: q.question,
            options: q.options,
            correctIndex: q.answer,
            explanation: q.explanation || ''
        }));

        currentQuestionIndex = 0;
        quizScore = 0;
        quizTimer.start = Date.now();

        renderQuizQuestion();
    } catch (err) {
        console.error('Failed to generate quiz:', err);
        alert('Lỗi tải câu hỏi. Vui lòng thử lại!');
        if (introState) introState.classList.remove('hidden');
        if (activeState) activeState.classList.add('hidden');
    }
}

// Assessment mode: local vocabulary quiz (backward compatible)
async function initAssessmentQuiz() {
    const allWords = [...(state.vocabulary || []), ...(state.customWords || [])];

    const oxfordPool = shuffleArray(allWords.filter(w => w.category === 'oxford'));
    const academicPool = shuffleArray(allWords.filter(w => w.category === 'academic'));
    const idiomsPool = shuffleArray(allWords.filter(w => w.category === 'idioms'));

    const sourcePool = shuffleArray([
        ...oxfordPool.slice(0, 4),
        ...academicPool.slice(0, 3),
        ...idiomsPool.slice(0, 3)
    ]);

    if (sourcePool.length < 4) {
        alert('⚠️ Kho từ vựng hiện tại cần ít nhất 4 từ để có thể bắt đầu đánh giá.');
        const introState = document.getElementById('quiz-intro-state');
        const activeState = document.getElementById('quiz-active-state');
        if (introState) introState.classList.remove('hidden');
        if (activeState) activeState.classList.add('hidden');
        return;
    }

    const shuffled = shuffleArray([...sourcePool]);
    const selectedIndexWords = shuffled.slice(0, 10);

    const correctWordsPromises = selectedIndexWords.map(async (w) => {
        const fullData = await LearningDB.getFullWordData(w.id);
        return fullData ? fullData : { ...w, meaning: w.word, example: '' };
    });
    const correctWords = await Promise.all(correctWordsPromises);

    const distractorIndexWords = allWords
        .filter(w => !selectedIndexWords.some(sw => sw.id === w.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 25);

    const distractorWordsPromises = distractorIndexWords.map(async (w) => {
        return await LearningDB.getFullWordData(w.id);
    });
    const distractorWordsRaw = await Promise.all(distractorWordsPromises);
    const distractorWords = distractorWordsRaw.filter(Boolean);

    quizQuestions = correctWords.map(word => {
        const otherMeanings = distractorWords
            .filter(w => w.id !== word.id && w.meaning !== word.meaning)
            .map(w => w.meaning);

        const distractors = shuffleArray([...otherMeanings]).slice(0, 3);
        const options = shuffleArray([word.meaning, ...distractors]);
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

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const isAssessment = quizSelectedCategory === 'assessment' && question.wordObj;

    // Header Info
    document.getElementById('quiz-counter').textContent = `Câu hỏi ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quiz-score-correct').textContent = quizScore;

    // Progress Bar
    const progressPct = Math.round(((currentQuestionIndex) / quizQuestions.length) * 100);
    document.getElementById('quiz-progress-bar').style.width = `${progressPct}%`;

    // Question Text
    const qWordEl = document.getElementById('quiz-question-word');
    if (isAssessment) {
        qWordEl.textContent = question.wordObj.word;
        qWordEl.style.fontSize = '';
    } else {
        qWordEl.textContent = question.questionText;
        qWordEl.style.fontSize = '16px';
    }

    // Speech Trigger (assessment mode only)
    const speakBtn = document.getElementById('quiz-speak-question-btn');
    if (speakBtn) {
        if (isAssessment) {
            speakBtn.classList.remove('hidden');
            const newBtn = speakBtn.cloneNode(true);
            speakBtn.parentNode.replaceChild(newBtn, speakBtn);
            newBtn.addEventListener('click', () => speakEnglish(question.wordObj.word));
        } else {
            speakBtn.classList.add('hidden');
        }
    }

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
        btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
        optionsContainer.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex, clickedButton) {
    const question = quizQuestions[currentQuestionIndex];
    const optionsContainer = document.getElementById('quiz-options-container');
    const optionCards = optionsContainer.querySelectorAll('.option-card');

    checkAndUpdateStreak();
    renderDashboard();

    optionCards.forEach(card => card.classList.add('disabled'));

    const correctIndex = question.correctIndex;
    const isCorrect = selectedIndex === correctIndex;

    // Stat Track (local for instant UI feedback)
    state.quizStats.totalAnswered += 1;
    if (isCorrect) {
        state.quizStats.correctAnswers += 1;
        quizScore += 1;
        clickedButton.classList.add('correct');
    } else {
        clickedButton.classList.add('incorrect');
        optionCards[correctIndex].classList.add('correct');
    }
    saveStatsToStorage();

    // Store answer for backend submission
    if (!quizAnswers) quizAnswers = [];
    quizAnswers.push({
        questionId: question.id || null,
        selected: selectedIndex,
        correct: isCorrect
    });

    // Auto-pronounce (assessment mode)
    const isAssessment = quizSelectedCategory === 'assessment' && question.wordObj;
    if (isAssessment) {
        speakEnglish(question.wordObj.word);
    }

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

    if (isAssessment) {
        feedbackDetail.textContent = `Ví dụ: "${question.wordObj.example || ''}"`;
    } else {
        feedbackDetail.textContent = question.explanation || '';
    }
}

function handleQuizNext() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
    } else {
        quizTimer.end = Date.now();
        submitAndShowResults();
    }
}

async function submitAndShowResults() {
    const isAssessment = quizSelectedCategory === 'assessment';

    // Submit to backend (non-assessment mode)
    if (!isAssessment && window.ApiClient && window.ApiClient.isLoggedIn() && quizAnswers && quizAnswers.length > 0) {
        try {
            const difficulty = quizCategoryToDifficulty(quizSelectedCategory);
            const backendAnswers = quizAnswers
                .filter(a => a.questionId != null)
                .map(a => ({ questionId: a.questionId, selected: a.selected }));

            if (backendAnswers.length > 0) {
                await window.ApiClient.submitQuiz(difficulty, backendAnswers);
            }
        } catch (err) {
            console.error('Failed to submit quiz to backend:', err);
        }
    }

    showQuizResults();
}

function showQuizResults() {
    document.getElementById('quiz-active-state').classList.add('hidden');
    document.getElementById('quiz-result-state').classList.remove('hidden');

    const durationSec = Math.round((quizTimer.end - quizTimer.start) / 1000);
    const pct = Math.round((quizScore / quizQuestions.length) * 100);

    document.getElementById('result-score-val').textContent = `${quizScore} / ${quizQuestions.length}`;

    const baseStars = 5;
    const accuracyStars = quizScore * 1;
    const totalStarsEarned = baseStars + accuracyStars;
    awardStars(totalStarsEarned, `Hoàn thành trắc nghiệm (${quizScore}/${quizQuestions.length} câu đúng)`);
    document.getElementById('result-time').textContent = `${durationSec} giây`;
    document.getElementById('result-accuracy').textContent = `${pct}%`;

    const activeCategory = quizSelectedCategory;
    trackDailyActivity('quiz', { correct: quizScore, total: quizQuestions.length, category: activeCategory });

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

        if (quizScore >= 8) {
            if (durationSec < 60) {
                level = 'C1';
                levelName = 'Cao cấp (C1)';
            } else {
                level = 'B1';
                levelName = 'Trung cấp (B1)';
            }
        } else if (quizScore >= 5) {
            if (durationSec < 95) {
                level = 'B1';
                levelName = 'Trung cấp (B1)';
            } else {
                level = 'A1';
                levelName = 'Sơ cấp (A1)';
            }
        } else {
            level = 'A1';
            levelName = 'Sơ cấp (A1)';
        }

        state.lastTestScore = quizScore * 1.6;
        state.roadmapTasks = generateRoadmapTasks(level);
        saveStatsToStorage();

        let badgeStyleClass = 'beginner';
        if (level.startsWith('B')) badgeStyleClass = 'intermediate';
        else if (level.startsWith('C')) badgeStyleClass = 'advanced';

        msgEl.innerHTML = `
            🎓 <b>KẾT QUẢ ĐÁNH GIÁ PHẢN XẠ & TRÌNH ĐỘ:</b><br>
            • Độ chính xác: <b>${quizScore}/${quizQuestions.length} câu đúng</b> (${pct}%)<br>
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

    renderDashboard();
}
