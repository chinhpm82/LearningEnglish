// --- INTERACTIVE GRAMMAR LEARNING CONTROLLER ---
let activeGrammarCategory = 'all';

async function renderGrammarLessons(category = 'all') {
    activeGrammarCategory = category;
    const listContainer = document.getElementById('grammar-lessons-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Lazy load GRAMMAR_LESSONS if empty
    if (!window.GRAMMAR_LESSONS || window.GRAMMAR_LESSONS.length === 0) {
        listContainer.innerHTML = `
            <div class="loading-spinner-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--text-muted); width: 100%;">
                <div class="spinner"></div>
                <p style="font-size:13px; margin-top:10px;">Đang tải danh sách bài học ngữ pháp...</p>
            </div>`;
        if (window.FirebaseSync) {
            window.GRAMMAR_LESSONS = await window.FirebaseSync.fetchAcademicGrammar() || [];
        }
        if (!window.GRAMMAR_LESSONS || window.GRAMMAR_LESSONS.length === 0) {
            listContainer.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align: center;">Không thể tải bài học ngữ pháp. Vui lòng kiểm tra mạng!</p>';
            return;
        }
        listContainer.innerHTML = '';
    }

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
            awardStars(10, `Hoàn thành bài học "${lesson.title}"`);
            if (successTitleEl) successTitleEl.textContent = `🎉 Tuyệt vời! Hoàn thành bài học!`;
            if (successMsgEl) {
                successMsgEl.innerHTML = `Chúc mừng bạn đã học thành công chủ điểm <strong>"${lesson.title}"</strong> lần đầu tiên! Bạn nhận được <strong>+10 Ngôi sao vàng ⭐</strong>.<br><br>💡 <em>Mẹo nhỏ: Học đi học lại nhiều lần sẽ giúp biến kiến thức ngữ pháp thành phản xạ tự nhiên của bạn!</em>`;
            }
        } else {
            awardStars(4, `Ôn tập thành công bài "${lesson.title}" (Lần ${totalTimes})`);
            if (successTitleEl) successTitleEl.textContent = `🔥 Xuất sắc! Ôn tập liên tục!`;
            if (successMsgEl) {
                successMsgEl.innerHTML = `Bạn vừa xuất sắc ôn tập thành công chủ điểm <strong>"${lesson.title}"</strong> (Lần thứ <strong>${totalTimes}</strong>)! Bạn nhận được thêm <strong>+4 Ngôi sao vàng ⭐</strong>.<br><br>🚀 <em>Tuyệt vời! Bạn đang củng cố trí nhớ dài hạn cực kỳ tốt. Hãy duy trì phong độ và tiếp tục ôn tập nhé!</em>`;
            }
        }

        // Re-render sidebar list to update "Đã xong ✅" status badge
        renderGrammarLessons(activeGrammarCategory);
    }
}

