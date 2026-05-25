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
    const baseStars = 5;
    const accuracyStars = quizScore * 1;
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

