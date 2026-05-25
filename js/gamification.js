// --- GLOBAL GAMIFICATION & STARS CORE FUNCTIONS ---
async function awardStars(amount, reason) {
    state.stars += amount;
    await saveStatsToStorage();
    renderDashboard();
    
    // Auto re-render leaderboard if current user is active on leaderboard tab
    const activeTab = document.querySelector('.sidebar-menu li.active');
    if (activeTab && activeTab.getAttribute('data-target') === 'leaderboard-tab') {
        renderLeaderboard();
    }
    
    // Show premium sliding star toast
    showStarToast(amount, reason);
}

function showStarToast(amount, reason) {
    let container = document.getElementById('star-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'star-toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '24px';
        container.style.right = '24px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.border = '1px solid #fbbf24';
    toast.style.borderRadius = '12px';
    toast.style.padding = '12px 20px';
    toast.style.color = '#fff';
    toast.style.boxShadow = '0 10px 25px rgba(251, 191, 36, 0.2)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transform = 'translateY(50px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    toast.innerHTML = `
        <span style="font-size:20px; filter: drop-shadow(0 0 4px #fbbf24);">⭐</span>
        <div>
            <div style="font-weight:800; color:#fbbf24; font-size:14px;">+${amount} Gold Stars!</div>
            <div style="font-size:11px; color:#94a3b8;">${reason}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// --- GLOBAL LEADERBOARD UI RENDERER ---
async function renderLeaderboard() {
    const listContainer = document.getElementById('leaderboard-users-list');
    if (!listContainer) return;

    if (!isCloudMode || !window.FirebaseSync) {
        listContainer.innerHTML = `
            <div class="leaderboard-empty-state">
                <h3 style="color:#fff; margin-bottom: 8px;">🔒 Đua Top Bảng Xếp Hạng</h3>
                <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px;">
                    Tính năng Bảng xếp hạng yêu cầu kết nối mạng và tài khoản. Hãy Đăng nhập bằng Google để tranh tài cùng các học viên khác!
                </p>
                <button class="btn-primary animate-glow" id="btn-leaderboard-login" style="padding: 10px 20px; font-size:13px; border-radius:30px; cursor:pointer;">
                    Đăng nhập ngay
                </button>
            </div>
        `;
        document.getElementById('btn-leaderboard-login').addEventListener('click', showAuthOverlay);
        return;
    }

    listContainer.innerHTML = `
        <div class="roadmap-loading">
            <span class="pulse-dot"></span>
            <span>Đang tải bảng xếp hạng trực tuyến...</span>
        </div>
    `;

    const leaderboard = await window.FirebaseSync.loadLeaderboard();
    if (!leaderboard || leaderboard.length === 0) {
        listContainer.innerHTML = `
            <div class="leaderboard-empty-state">
                <p>Chưa có dữ liệu bảng xếp hạng. Hãy hoàn thành các bài học để trở thành người dẫn đầu!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';
    
    leaderboard.forEach((user, idx) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row ${user.email === state.currentUserEmail ? 'current-user' : ''}`;
        
        let rankDisplay = idx + 1;
        if (idx === 0) rankDisplay = '<span class="medal-icon">🥇</span>';
        else if (idx === 1) rankDisplay = '<span class="medal-icon">🥈</span>';
        else if (idx === 2) rankDisplay = '<span class="medal-icon">🥉</span>';
        
        const avatarUrl = user.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
        const displayName = user.name || 'Học viên ẩn danh';
        const userStreak = user.streak || 0;
        const userStars = user.stars || 0;

        // Self-healing synchronization: two-way sync between local state and cloud leaderboard data
        if (user.email && state.currentUserEmail && user.email.toLowerCase().trim() === state.currentUserEmail.toLowerCase().trim()) {
            let needSave = false;
            let needPush = false;
            
            // 1. Check for pulling higher values from cloud
            if (userStreak > state.streak) {
                state.streak = userStreak;
                needSave = true;
            } else if (state.streak > userStreak) {
                needPush = true;
            }
            
            if (userStars > state.stars) {
                state.stars = userStars;
                needSave = true;
            } else if (state.stars > userStars) {
                needPush = true;
            }

            // 2. Check if custom profile changes are missing from the public leaderboard node
            if (user.name !== state.displayName && state.displayName) {
                needPush = true;
            }
            if (user.photoURL !== state.photoURL && state.photoURL) {
                needPush = true;
            }

            // Execute the appropriate action
            if (needSave) {
                saveStatsToStorage();
                updateSidebarStreakUI();
                const starsCountEl = document.getElementById('dashboard-stars-count');
                if (starsCountEl) {
                    starsCountEl.textContent = state.stars;
                }
            } else if (needPush) {
                console.log("🔄 Self-Healing: Pushing superior local achievements to RTDB Leaderboard...");
                window.FirebaseSync.saveStreak(
                    state.streak, 
                    state.lastStudyDate, 
                    state.quizStats, 
                    state.userLevel, 
                    state.roadmapTasks, 
                    state.stars, 
                    state.photoURL, 
                    state.displayName
                );
            }
        }

        let avatarHtml = `<img src="${avatarUrl}" alt="Avatar" class="leaderboard-avatar">`;
        if (avatarUrl && avatarUrl.startsWith('emoji:')) {
            const emoji = avatarUrl.split(':')[1];
            avatarHtml = `<div class="leaderboard-avatar-emoji">${emoji}</div>`;
        }

        row.innerHTML = `
            <span class="col-rank">${rankDisplay}</span>
            <div class="col-avatar">
                ${avatarHtml}
            </div>
            <span class="col-name">${displayName}</span>
            <span class="col-streak">${userStreak} 🔥</span>
            <span class="col-stars">${userStars} ⭐</span>
        `;
        
        listContainer.appendChild(row);
    });
}

// --- CUTE ANIMAL AVATARS SELECTION SYSTEM ---
const ANIMAL_AVATARS = [
    { emoji: '🐱', label: 'Mèo con' },
    { emoji: '🐶', label: 'Cún con' },
    { emoji: '🐼', label: 'Gấu trúc' },
    { emoji: '🦊', label: 'Cáo nhỏ' },
    { emoji: '🐨', label: 'Koala' },
    { emoji: '🦁', label: 'Sư tử' },
    { emoji: '🐰', label: 'Thỏ con' },
    { emoji: '🐧', label: 'Cánh cụt' },
    { emoji: '🐻', label: 'Gấu nâu' },
    { emoji: '🐸', label: 'Ếch xanh' },
    { emoji: '🐵', label: 'Khỉ con' },
    { emoji: '🦄', label: 'Kỳ lân' }
];

function renderUserAvatar(avatarUrl) {
    const imgEl = document.getElementById('user-avatar-img');
    if (!imgEl) return;

    // Check if there is already an emoji badge in the container
    const container = document.getElementById('btn-open-avatar-modal');
    const existingEmoji = container.querySelector('.user-avatar-emoji');
    if (existingEmoji) existingEmoji.remove();

    if (avatarUrl && avatarUrl.startsWith('emoji:')) {
        const emoji = avatarUrl.split(':')[1];
        imgEl.style.display = 'none';
        
        const emojiEl = document.createElement('div');
        emojiEl.className = 'user-avatar-emoji';
        emojiEl.textContent = emoji;
        container.insertBefore(emojiEl, imgEl); // Insert before edit overlay
    } else {
        imgEl.style.display = 'block';
        imgEl.src = avatarUrl || 'https://www.gravatar.com/avatar/?d=mp';
    }
}

let tempSelectedAvatar = '';

function renderAvatarModalChoices() {
    const grid = document.getElementById('avatar-emoji-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    tempSelectedAvatar = state.photoURL || '';

    ANIMAL_AVATARS.forEach(item => {
        const choice = document.createElement('div');
        const isSelected = tempSelectedAvatar === 'emoji:' + item.emoji;
        choice.className = `avatar-choice-item ${isSelected ? 'selected' : ''}`;
        
        choice.innerHTML = `
            <span class="avatar-choice-emoji">${item.emoji}</span>
            <span class="avatar-choice-label">${item.label}</span>
        `;
        
        choice.addEventListener('click', () => {
            document.querySelectorAll('.avatar-choice-item').forEach(c => c.classList.remove('selected'));
            choice.classList.add('selected');
            tempSelectedAvatar = 'emoji:' + item.emoji;
        });
        
        grid.appendChild(choice);
    });
}

// Click handler for specialized learning deck cards
function selectSpecializedCategory(category) {
    const selectEl = document.getElementById('flashcard-category');
    if (selectEl) {
        selectEl.value = category;
        // Start the flashcard session with the selected specialized category
        initFlashcardSession(category);
        
        // Smooth scroll back up to the flashcard stage
        const stage = document.getElementById('flashcard-element');
        if (stage) {
            stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Display a high-fidelity visual toast feedback
        showToastNotification(`📚 Đã nạp từ chuyên đề! Chúc bạn học tốt! ⚡`);
    }
}

// ==========================================================================
// STORIES MODULE
// ==========================================================================
const storiesState = { completedStories: [] };

function renderStoriesGrid(filter = 'all') {
    const grid = document.getElementById('stories-grid');
    if (!grid) return;
    const stories = typeof STORIES_DATA !== 'undefined' ? STORIES_DATA : [];
    const filtered = filter === 'all' ? stories : stories.filter(s => s.level === filter);
    grid.innerHTML = '';
    if (filtered.length === 0) { grid.innerHTML = '<p style="color:var(--text-secondary)">Không có truyện nào phù hợp.</p>'; return; }
    filtered.forEach(story => {
        const done = storiesState.completedStories.includes(story.id);
        const card = document.createElement('div');
        card.className = 'story-card';
        card.innerHTML = `
            <span class="story-card-emoji">${story.emoji}</span>
            <div class="story-card-info">
                <h4>${story.title}</h4>
                <p>${story.paragraphs[0].substring(0, 80)}...</p>
                <span class="story-card-level" data-level="${story.level}">${story.level}</span>
                ${done ? '<span class="story-card-status">✅ Đã đọc</span>' : ''}
            </div>`;
        card.addEventListener('click', () => openStory(story));
        grid.appendChild(card);
    });
}

function openStory(story) {
    const grid = document.getElementById('stories-grid');
    const reader = document.getElementById('story-reader');
    grid.classList.add('hidden');
    reader.classList.remove('hidden');
    document.getElementById('story-reader-emoji').textContent = story.emoji;
    document.getElementById('story-reader-title').textContent = story.title;
    document.getElementById('story-reader-level').textContent = story.level;
    const body = document.getElementById('story-reader-body');
    body.innerHTML = story.paragraphs.map(p => `<p>${p}</p>`).join('');
    const vocabList = document.getElementById('story-vocab-list');
    vocabList.innerHTML = story.vocab.map(v => `<span class="vocab-tag">${v}</span>`).join('');
    const originalQuizContainer = document.getElementById('story-quiz-container');
    const quizContainer = originalQuizContainer.cloneNode(false);
    originalQuizContainer.parentNode.replaceChild(quizContainer, originalQuizContainer);
    const resultEl = document.getElementById('story-result');
    resultEl.classList.add('hidden');
    let answered = 0;
    let correct = 0;
    story.questions.forEach((q, qi) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'story-quiz-q';
        qDiv.innerHTML = `<p>${qi + 1}. ${q.q}</p><div class="quiz-opts">${q.opts.map((o, oi) =>
            `<button class="quiz-opt-btn" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div>`;
        quizContainer.appendChild(qDiv);
    });
    quizContainer.addEventListener('click', function handler(e) {
        const btn = e.target.closest('.quiz-opt-btn');
        if (!btn) return;
        const qi = parseInt(btn.dataset.qi);
        const oi = parseInt(btn.dataset.oi);
        const qBtns = quizContainer.querySelectorAll(`.quiz-opt-btn[data-qi="${qi}"]`);
        if (qBtns[0].classList.contains('disabled')) return;
        qBtns.forEach(b => b.classList.add('disabled'));
        if (oi === story.questions[qi].ans) { btn.classList.add('correct'); correct++; }
        else { btn.classList.add('wrong'); qBtns[story.questions[qi].ans].classList.add('correct'); }
        answered++;
        if (answered === story.questions.length) {
            resultEl.classList.remove('hidden');
            document.getElementById('story-result-text').textContent =
                `🎉 Bạn đúng ${correct}/${story.questions.length} câu!`;
            if (!storiesState.completedStories.includes(story.id)) {
                storiesState.completedStories.push(story.id);
                state.stories_done = storiesState.completedStories;
                saveStatsToStorage();
            }
        }
    });
}

// ==========================================================================
// TRANSLATION MODULE
// ==========================================================================
const transState = { deck: [], idx: 0, score: 0, hintsShown: 0 };

function initTranslation() {
    const data = typeof TRANSLATION_DATA !== 'undefined' ? TRANSLATION_DATA : [];
    const dirFilter = document.getElementById('trans-dir-filter')?.value || 'all';
    const lvlFilter = document.getElementById('trans-level-filter')?.value || 'all';
    let filtered = data;
    if (dirFilter !== 'all') filtered = filtered.filter(t => t.dir === dirFilter);
    if (lvlFilter !== 'all') filtered = filtered.filter(t => t.level === lvlFilter);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [filtered[i], filtered[j]] = [filtered[j], filtered[i]]; }
    transState.deck = filtered;
    transState.idx = 0;
    transState.score = 0;
    transState.hintsShown = 0;
    document.getElementById('trans-score').textContent = '0';
    document.getElementById('trans-total').textContent = filtered.length;
    renderTranslationCard();
}

function renderTranslationCard() {
    const card = document.getElementById('translation-card');
    if (!card) return;
    if (transState.deck.length === 0) {
        card.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Không có đoạn dịch nào phù hợp. Hãy chọn bộ lọc khác.</p>';
        return;
    }
    const item = transState.deck[transState.idx];
    document.getElementById('trans-dir-badge').textContent = item.dir === 'en-vi' ? 'Anh → Việt' : 'Việt → Anh';
    document.getElementById('trans-level-badge').textContent = item.level;
    document.getElementById('trans-source').textContent = item.source;
    document.getElementById('trans-hints').innerHTML = '';
    document.getElementById('trans-input').value = '';
    document.getElementById('trans-feedback').classList.add('hidden');
    document.getElementById('trans-feedback').className = 'trans-feedback hidden';
    document.getElementById('btn-trans-check').classList.remove('hidden');
    document.getElementById('btn-trans-next').classList.add('hidden');
    const progress = ((transState.idx) / transState.deck.length) * 100;
    document.getElementById('trans-progress-fill').style.width = progress + '%';
}

function checkTranslation() {
    const item = transState.deck[transState.idx];
    const userInput = document.getElementById('trans-input').value.trim();
    if (!userInput) { showToastNotification('⚠️ Vui lòng nhập bản dịch!'); return; }
    const feedback = document.getElementById('trans-feedback');
    feedback.classList.remove('hidden');
    // Simple similarity check (normalize and compare)
    const normalize = s => s.toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ').trim();
    const userNorm = normalize(userInput);
    const ansNorm = normalize(item.answer);
    // Calculate word overlap
    const userWords = new Set(userNorm.split(' '));
    const ansWords = new Set(ansNorm.split(' '));
    let overlap = 0;
    ansWords.forEach(w => { if (userWords.has(w)) overlap++; });
    const similarity = overlap / Math.max(ansWords.size, 1);
    if (similarity >= 0.6 || userNorm === ansNorm) {
        feedback.className = 'trans-feedback correct';
        document.getElementById('trans-feedback-text').textContent = '✅ Tuyệt vời! Bản dịch của bạn rất tốt!';
        transState.score++;
    } else {
        feedback.className = 'trans-feedback wrong';
        document.getElementById('trans-feedback-text').textContent = '❌ Chưa chính xác lắm. Hãy xem đáp án gợi ý:';
    }
    document.getElementById('trans-answer').textContent = '💡 Đáp án: ' + item.answer;
    document.getElementById('trans-score').textContent = transState.score;
    document.getElementById('btn-trans-check').classList.add('hidden');
    document.getElementById('btn-trans-next').classList.remove('hidden');
}

function nextTranslation() {
    transState.idx++;
    if (transState.idx >= transState.deck.length) {
        showToastNotification(`🎉 Hoàn thành! Điểm: ${transState.score}/${transState.deck.length}`);
        transState.idx = 0;
        initTranslation();
        return;
    }
    renderTranslationCard();
}
function showTransHint() {
    const item = transState.deck[transState.idx];
    if (!item || !item.hints) return;
    const container = document.getElementById('trans-hints');
    transState.hintsShown++;
    const hintIdx = Math.min(transState.hintsShown - 1, item.hints.length - 1);
    if (hintIdx < item.hints.length) {
        container.innerHTML += `<span class="hint-item">${item.hints[hintIdx]}</span> `;
    }
}
