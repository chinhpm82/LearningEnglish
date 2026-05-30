// --- Sub-tabs translation switching logic ---
document.getElementById('btn-sub-trans-short')?.addEventListener('click', () => {
    const btnShort = document.getElementById('btn-sub-trans-short');
    const btnLong = document.getElementById('btn-sub-trans-long');
    if (btnShort && btnLong) {
        btnShort.classList.add('active');
        btnShort.style.background = 'var(--accent)';
        btnShort.style.color = '#fff';
        btnShort.style.boxShadow = '0 4px 12px var(--shadow-color)';
        btnShort.style.fontWeight = '600';

        btnLong.classList.remove('active');
        btnLong.style.background = 'none';
        btnLong.style.color = 'var(--text-muted)';
        btnLong.style.boxShadow = 'none';
        btnLong.style.fontWeight = '500';
    }

    document.getElementById('trans-short-panel')?.classList.remove('hidden');
    document.getElementById('trans-long-panel')?.classList.add('hidden');
});

document.getElementById('btn-sub-trans-long')?.addEventListener('click', () => {
    const btnShort = document.getElementById('btn-sub-trans-short');
    const btnLong = document.getElementById('btn-sub-trans-long');
    if (btnShort && btnLong) {
        btnLong.classList.add('active');
        btnLong.style.background = 'var(--accent)';
        btnLong.style.color = '#fff';
        btnLong.style.boxShadow = '0 4px 12px var(--shadow-color)';
        btnLong.style.fontWeight = '600';

        btnShort.classList.remove('active');
        btnShort.style.background = 'none';
        btnShort.style.color = 'var(--text-muted)';
        btnShort.style.boxShadow = 'none';
        btnShort.style.fontWeight = '500';
    }

    document.getElementById('trans-long-panel')?.classList.remove('hidden');
    document.getElementById('trans-short-panel')?.classList.add('hidden');
    initLongTranslation();
});

// --- Long Translation Mode ---
const longTransState = { deck: [], idx: 0, hintsShown: 0 };

async function initLongTranslation() {
    const card = document.getElementById('trans-long-card');
    
    // Tải lười dữ liệu LONG_TRANSLATION_DATA nếu mảng rỗng
    if (!window.LONG_TRANSLATION_DATA || window.LONG_TRANSLATION_DATA.length === 0) {
        if (card) {
            card.innerHTML = `
                <div class="loading-spinner-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--text-muted); width: 100%;">
                    <div class="spinner"></div>
                    <p style="font-size:13px; margin-top:10px;">Đang tải dữ liệu dịch đoạn văn...</p>
                </div>`;
        }
        if (window.FirebaseSync) {
            window.LONG_TRANSLATION_DATA = await window.FirebaseSync.fetchAcademicLongTranslation() || [];
        }
        if (!window.LONG_TRANSLATION_DATA || window.LONG_TRANSLATION_DATA.length === 0) {
            if (card) {
                card.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align: center;">Không thể tải dữ liệu dịch đoạn văn. Vui lòng kiểm tra mạng!</p>';
            }
            return;
        }
    }

    const data = window.LONG_TRANSLATION_DATA;
    const dirFilter = document.getElementById('trans-long-dir-filter')?.value || 'all';
    let filtered = [...data];
    if (dirFilter !== 'all') filtered = filtered.filter(t => t.dir === dirFilter);
    
    // Trộn ngẫu nhiên đoạn văn dịch
    for (let i = filtered.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]]; 
    }
    
    longTransState.deck = filtered;
    longTransState.idx = 0;
    longTransState.hintsShown = 0;
    renderLongTranslationCard();
}

function renderLongTranslationCard() {
    const card = document.getElementById('trans-long-card');
    if (!card) return;
    if (longTransState.deck.length === 0) {
        card.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Không có đoạn văn nào phù hợp. Hãy chọn bộ lọc khác.</p>';
        return;
    }
    const item = longTransState.deck[longTransState.idx];
    document.getElementById('trans-long-dir-badge').textContent = item.dir === 'en-vi' ? 'Anh → Việt' : 'Việt → Anh';
    document.getElementById('trans-long-level-badge').textContent = item.level;
    document.getElementById('trans-long-title').textContent = item.title;
    document.getElementById('trans-long-source').textContent = item.source;
    document.getElementById('trans-long-hints').innerHTML = '';
    document.getElementById('trans-long-input').value = '';
    document.getElementById('trans-long-feedback').classList.add('hidden');
    document.getElementById('btn-trans-long-check').classList.remove('hidden');
    document.getElementById('btn-trans-long-next').classList.add('hidden');
    document.getElementById('trans-long-word-count').textContent = '0 từ';
    longTransState.hintsShown = 0;
}

function checkLongTranslation() {
    const item = longTransState.deck[longTransState.idx];
    const userInput = document.getElementById('trans-long-input').value.trim();
    if (!userInput) { showToastNotification('⚠️ Vui lòng nhập bản dịch!'); return; }
    
    // Streak check on long translation completion
    checkAndUpdateStreak();
    renderDashboard();

    const feedback = document.getElementById('trans-long-feedback');
    feedback.classList.remove('hidden');
    
    // Smart Jaccard Similarity Checker for long paragraphs
    const normalize = s => s.toLowerCase().replace(/[.,!?;:'"()\-–]/g, '').replace(/\s+/g, ' ').trim();
    const userNorm = normalize(userInput);
    const ansNorm = normalize(item.answer);
    
    const userWords = userNorm.split(' ').filter(w => w.length > 1);
    const ansWords = ansNorm.split(' ').filter(w => w.length > 1);
    
    const userSet = new Set(userWords);
    const ansSet = new Set(ansWords);
    
    let intersection = 0;
    ansSet.forEach(w => { if (userSet.has(w)) intersection++; });
    
    let scorePct = Math.round((intersection / Math.max(ansSet.size, 1)) * 100);
    if (scorePct > 100) scorePct = 100;
    
    const scorePctEl = document.getElementById('trans-long-score-pct');
    scorePctEl.textContent = scorePct + '%';
    
    const feedbackTextEl = document.getElementById('trans-long-feedback-text');
    if (scorePct >= 80) {
        scorePctEl.style.color = '#4ade80';
        feedbackTextEl.textContent = '🌟 Xuất sắc! Bản dịch của bạn cực kỳ chính xác và lưu loát so với bản dịch chuẩn. Cấu trúc câu và từ vựng đều được sử dụng rất tự nhiên.';
        awardStars(30, "Hoàn thành dịch đoạn văn xuất sắc!");
    } else if (scorePct >= 50) {
        scorePctEl.style.color = '#60a5fa';
        feedbackTextEl.textContent = '👍 Tốt! Bạn đã truyền đạt chính xác các ý chính của đoạn văn. Hãy xem thêm bản dịch mẫu để cải thiện cách diễn đạt tự nhiên hơn.';
        awardStars(15, "Hoàn thành dịch đoạn văn khá tốt!");
    } else {
        scorePctEl.style.color = '#f87171';
        feedbackTextEl.textContent = '✍️ Hãy cố gắng lên! Bản dịch của bạn chưa sát với ý nghĩa của đoạn văn. Vui lòng đối chiếu với bản dịch mẫu bên dưới để học hỏi thêm các cấu trúc câu.';
    }
    
    document.getElementById('trans-long-answer').textContent = item.answer;
    document.getElementById('btn-trans-long-check').classList.add('hidden');
    document.getElementById('btn-trans-long-next').classList.remove('hidden');
}

function nextLongTranslation() {
    longTransState.idx++;
    if (longTransState.idx >= longTransState.deck.length) {
        showToastNotification(`🎉 Bạn đã dịch hết tất cả các đoạn văn dài trong bộ lọc này!`);
        longTransState.idx = 0;
    }
    renderLongTranslationCard();
}

function showLongTransHint() {
    const item = longTransState.deck[longTransState.idx];
    if (!item || !item.hints) return;
    const container = document.getElementById('trans-long-hints');
    longTransState.hintsShown++;
    const hintIdx = Math.min(longTransState.hintsShown - 1, item.hints.length - 1);
    if (hintIdx < item.hints.length) {
        container.innerHTML += `<span class="hint-item">${item.hints[hintIdx]}</span> `;
    }
}

