// --- COMMUNICATIVE SENTENCES RENDERER ---
async function renderSentences(category = 'all') {
    const container = document.getElementById('sentences-list-container');
    if (!container) return;
    
    // Lazy load COMMUNICATIVE_SENTENCES if empty
    if (!window.COMMUNICATIVE_SENTENCES || window.COMMUNICATIVE_SENTENCES.length === 0) {
        container.innerHTML = `
            <div class="loading-spinner-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--text-muted); width: 100%;">
                <div class="spinner"></div>
                <p style="font-size:13px; margin-top:10px;">Đang tải danh sách mẫu câu giao tiếp...</p>
            </div>`;
        if (window.FirebaseSync) {
            window.COMMUNICATIVE_SENTENCES = await window.FirebaseSync.fetchAcademicSentences() || [];
        }
        if (!window.COMMUNICATIVE_SENTENCES || window.COMMUNICATIVE_SENTENCES.length === 0) {
            container.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align: center;">Không thể tải mẫu câu giao tiếp. Vui lòng kiểm tra mạng!</p>';
            return;
        }
        container.innerHTML = '';
    }

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
                trackDailyActivity('sentence', 1);
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

