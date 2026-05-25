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

