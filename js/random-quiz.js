/* ==========================================================================
   LearningEnglish - Random Quiz Game Logic
   ========================================================================== */

let rqTimerInterval = null;
let rqTimeRemaining = 300; // 5 phút = 300 giây
let rqLives = 3;
let rqScore = 0;
let rqCurrentDifficulty = 'easy'; // 'easy', 'normal', 'hardcore'
let rqAllowedLevels = [];
let rqQuestions = [];
let rqCurrentQuestionIndex = 0;
let rqQuizIndex = [];
let rqRewardMultiplier = 1;
let rqIsGameOver = false;
let rqHistory = []; // Lưu lại lịch sử trả lời: { q: questionObj, isCorrect: boolean }

async function initRandomQuizSession(difficulty) {
    rqCurrentDifficulty = difficulty;
    rqLives = 3;
    rqScore = 0;
    rqTimeRemaining = 300;
    rqQuestions = [];
    rqCurrentQuestionIndex = 0;
    rqIsGameOver = false;
    rqHistory = [];

    // Thiết lập độ khó ban đầu và hệ số nhân điểm
    if (difficulty === 'easy') {
        rqAllowedLevels = ['A1', 'A2', 'B1'];
        rqRewardMultiplier = 1;
    } else if (difficulty === 'normal') {
        rqAllowedLevels = ['B1', 'B2', 'C1'];
        rqRewardMultiplier = 2;
    } else if (difficulty === 'hardcore') {
        rqAllowedLevels = ['C1', 'C2'];
        rqRewardMultiplier = 4;
    }

    // Hiển thị loading và reset lại các style bị ẩn khi game over
    document.getElementById('random-quiz-intro').classList.add('hidden');
    document.getElementById('random-quiz-active').classList.remove('hidden');
    
    document.getElementById('rq-question-direction').style.display = '';
    document.getElementById('rq-question-text').style.display = '';
    document.getElementById('rq-options-container').style.display = '';
    document.getElementById('rq-progress-bar').parentElement.style.display = '';
    
    // Xóa end-screen nếu vẫn còn
    const existingEndScreen = document.getElementById('rq-end-screen');
    if (existingEndScreen) {
        existingEndScreen.remove();
    }

    document.getElementById('rq-question-direction').textContent = "Đang kết nối Đấu Trường...";
    document.getElementById('rq-question-text').textContent = "Đang tải dữ liệu...";
    document.getElementById('rq-options-container').innerHTML = '';
    document.getElementById('rq-feedback').classList.add('hidden');
    updateRQLivesUI();
    updateRQTimerUI();
    updateRQScoreUI();

    // Load Index
    if (rqQuizIndex.length === 0) {
        try {
            const response = await fetch('json/quiz-index.json?v=' + new Date().getTime());
            rqQuizIndex = await response.json();
        } catch (e) {
            console.error("Failed to load quiz-index.json", e);
            alert("Lỗi tải dữ liệu ngân hàng câu hỏi!");
            return;
        }
    }

    await fetchNextBatch();
    
    if (rqQuestions.length > 0) {
        startRQTimer();
        renderRQQuestion();
    } else {
        alert("Không tìm thấy câu hỏi phù hợp cho cấp độ này!");
    }
}

async function fetchNextBatch() {
    document.getElementById('rq-question-direction').textContent = `Đang tải câu hỏi...`;
    
    // Lọc các ID thuộc các level được phép
    const availableIds = rqQuizIndex.filter(q => rqAllowedLevels.includes(q.level)).map(q => q.id);
    
    if (availableIds.length === 0) {
        return; // Đã hết câu hỏi
    }

    // Trộn mảng ID và lấy tối đa 50 câu (đủ cho 5 phút)
    const shuffledIds = availableIds.sort(() => 0.5 - Math.random());
    const batchIds = shuffledIds.slice(0, 50);

    // Gọi Firestore (hoặc local fallback) qua firebase-sync.js
    if (window.FirebaseSync && window.FirebaseSync.fetchQuizBatch) {
        let fetchedData = await window.FirebaseSync.fetchQuizBatch(batchIds);
        
        // Trộn ngẫu nhiên câu hỏi trả về
        fetchedData = fetchedData.sort(() => 0.5 - Math.random());
        
        // Thêm vào hàng đợi câu hỏi
        rqQuestions = rqQuestions.concat(fetchedData);
    } else {
        console.warn("FirebaseSync not available, cannot fetch random quiz data");
    }
}

function startRQTimer() {
    clearInterval(rqTimerInterval);
    rqTimerInterval = setInterval(() => {
        if (rqIsGameOver) return;
        rqTimeRemaining--;
        updateRQTimerUI();
        
        if (rqTimeRemaining <= 0) {
            clearInterval(rqTimerInterval);
            endRandomQuiz("Hết giờ! ⏱️");
        }
    }, 1000);
}

function updateRQTimerUI() {
    const m = Math.floor(rqTimeRemaining / 60).toString().padStart(2, '0');
    const s = (rqTimeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('rq-timer').textContent = `${m}:${s}`;
    
    // Đổi màu khi sắp hết giờ
    if (rqTimeRemaining < 30) {
        document.getElementById('rq-timer').style.color = '#f87171';
    } else {
        document.getElementById('rq-timer').style.color = '';
    }
}

function updateRQLivesUI() {
    let hearts = "";
    for (let i = 0; i < 3; i++) {
        if (i < rqLives) {
            hearts += "❤️";
        } else {
            hearts += "🖤";
        }
    }
    document.getElementById('rq-lives').textContent = hearts;
}

function updateRQScoreUI() {
    document.getElementById('rq-score').textContent = rqScore;
}

function renderRQQuestion() {
    if (rqCurrentQuestionIndex >= rqQuestions.length) {
        endRandomQuiz("Chúc mừng! Bạn đã hoàn thành toàn bộ câu hỏi đợt này! 🏆");
        return;
    }

    const q = rqQuestions[rqCurrentQuestionIndex];
    document.getElementById('rq-feedback').classList.add('hidden');
    
    document.getElementById('rq-question-direction').textContent = `Câu ${rqCurrentQuestionIndex + 1}`;
    document.getElementById('rq-question-text').textContent = q.question;

    // Handle Audio button for listening questions
    const speakBtn = document.getElementById('rq-speak-btn');
    if (q.section === 'listening') {
        speakBtn.classList.remove('hidden');
        speakBtn.onclick = () => {
            const audioPath = `audio/listening/${q.id}.mp3`;
            const audio = new Audio(audioPath);
            audio.play().catch(e => {
                console.warn("Audio file not found, falling back to TTS", e);
                if (typeof speakEnglish === 'function') {
                    speakEnglish(q.question);
                }
            });
        };
    } else {
        speakBtn.classList.add('hidden');
    }

    const optionsContainer = document.getElementById('rq-options-container');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-card';
        btn.textContent = opt;
        btn.onclick = () => handleRQAnswer(idx, btn);
        optionsContainer.appendChild(btn);
    });

    // Cập nhật Progress Bar (trên tổng số câu hỏi đang nạp)
    const progress = Math.min(100, (rqCurrentQuestionIndex / rqQuestions.length) * 100);
    document.getElementById('rq-progress-bar').style.width = `${progress}%`;
}

function handleRQAnswer(selectedIndex, btnElement) {
    if (rqIsGameOver) return;
    const q = rqQuestions[rqCurrentQuestionIndex];
    const isCorrect = (selectedIndex === q.answer);
    const options = document.getElementById('rq-options-container').querySelectorAll('.option-card');
    
    // Khóa tất cả các nút
    options.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        btnElement.classList.add('correct');
        rqScore++;
        updateRQScoreUI();
        
        // Ghi lại lịch sử
        rqHistory.push({ q: q, isCorrect: true });
        
        // Hiển thị toast cộng sao
        if (typeof showToastNotification === 'function') {
            showToastNotification(`+${rqRewardMultiplier} ⭐`);
        }
        
        // Không hiện feedback, đợi 1s và chuyển câu
        setTimeout(() => {
            if (!rqIsGameOver) {
                rqCurrentQuestionIndex++;
                renderRQQuestion();
            }
        }, 1000);
        
    } else {
        btnElement.classList.add('wrong');
        options[q.answer].classList.add('correct'); // Hiện đáp án đúng
        rqLives--; // Trừ mạng vĩnh viễn
        updateRQLivesUI();
        
        // Ghi lại lịch sử
        rqHistory.push({ q: q, isCorrect: false });
        
        if (rqLives <= 0) {
            showRQFeedback(false, "Sai rồi!", q.explanation);
            setTimeout(() => {
                endRandomQuiz("Hết mạng! 💔");
            }, 2000);
            return;
        } else {
            showRQFeedback(false, "Sai rồi!", q.explanation);
        }
    }

    const progress = Math.min(100, (rqCurrentQuestionIndex / rqQuestions.length) * 100);
    document.getElementById('rq-progress-bar').style.width = `${progress}%`;
}

function showRQFeedback(isCorrect, title, detail) {
    const feedbackPanel = document.getElementById('rq-feedback');
    const feedbackTitle = document.getElementById('rq-feedback-title');
    const feedbackDetail = document.getElementById('rq-feedback-detail');
    const icon = document.getElementById('rq-feedback-icon');

    feedbackPanel.classList.remove('hidden');
    feedbackTitle.textContent = title;
    feedbackDetail.textContent = detail || (isCorrect ? "Tuyệt vời, tiếp tục phát huy nhé!" : "Hãy chú ý cấu trúc và ngữ cảnh của câu.");

    if (isCorrect) {
        feedbackPanel.style.background = 'rgba(74, 222, 128, 0.1)';
        feedbackPanel.style.border = '1px solid rgba(74, 222, 128, 0.3)';
        feedbackTitle.style.color = '#4ade80';
        icon.textContent = "✅";
    } else {
        feedbackPanel.style.background = 'rgba(248, 113, 113, 0.1)';
        feedbackPanel.style.border = '1px solid rgba(248, 113, 113, 0.3)';
        feedbackTitle.style.color = '#f87171';
        icon.textContent = "❌";
    }
}

document.getElementById('btn-rq-next')?.addEventListener('click', () => {
    if (rqIsGameOver) return;
    document.getElementById('rq-feedback').classList.add('hidden');
    rqCurrentQuestionIndex++;
    renderRQQuestion();
});

async function endRandomQuiz(reasonText) {
    rqIsGameOver = true;
    clearInterval(rqTimerInterval);
    
    const finalStars = rqScore * rqRewardMultiplier;
    
    // Render History Lists
    let correctListHTML = rqHistory.filter(h => h.isCorrect).map(h => `<div style="font-size: 14px; margin-bottom: 8px; color: #4ade80;">✔️ ${h.q.question}</div>`).join('');
    let wrongListHTML = rqHistory.filter(h => !h.isCorrect).map(h => `<div style="font-size: 14px; margin-bottom: 8px; color: #f87171; border-bottom: 1px solid rgba(248, 113, 113, 0.2); padding-bottom: 8px;">❌ ${h.q.question}<div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">💡 <em>${h.q.explanation || 'Không có giải thích'}</em></div></div>`).join('');
    
    if (!correctListHTML) correctListHTML = "<div style='color: var(--text-muted); font-size: 14px; text-align: center;'>Chưa có câu trả lời đúng nào.</div>";
    if (!wrongListHTML) wrongListHTML = "<div style='color: var(--text-muted); font-size: 14px; text-align: center;'>Tuyệt vời! Không có câu sai.</div>";

    const html = `
        <div style="text-align: left; padding: 10px;">
            <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">${rqLives > 0 ? '🏆' : '💀'}</div>
            <h2 style="color: var(--accent); margin-bottom: 10px; text-align: center;">${reasonText}</h2>
            
            <div style="background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 12px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 14px; color: var(--text-muted);">Tổng phần thưởng</div>
                    <div style="font-size: 24px; font-weight: bold; color: #facc15;">+${finalStars} ⭐</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; color: var(--text-muted);">Số câu đúng</div>
                    <div style="font-size: 24px; font-weight: bold; color: #4ade80;">${rqScore}</div>
                </div>
            </div>
            
            <h3 style="color: #4ade80; font-size: 16px; margin-top: 10px; margin-bottom: 10px;">✅ Câu đã trả lời đúng</h3>
            <div style="max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 20px;">
                ${correctListHTML}
            </div>

            <h3 style="color: #f87171; font-size: 16px; margin-top: 10px; margin-bottom: 10px;">❌ Câu đã làm sai</h3>
            <div style="max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 20px;">
                ${wrongListHTML}
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn-primary" onclick="document.getElementById('rq-end-screen').remove(); initRandomQuizSession('${rqCurrentDifficulty}');" style="flex: 1;">🔄 Chơi lại</button>
                <button class="btn-secondary" onclick="document.getElementById('rq-end-screen').remove(); document.getElementById('btn-quiz-go-home').click();" style="flex: 1;">Quay về</button>
            </div>
        </div>
    `;
    
    document.getElementById('rq-question-direction').style.display = 'none';
    document.getElementById('rq-question-text').style.display = 'none';
    document.getElementById('rq-options-container').style.display = 'none';
    document.getElementById('rq-feedback').style.display = 'none';
    document.getElementById('rq-progress-bar').parentElement.style.display = 'none';
    
    // Render HTML kết thúc vào thẳng khung màn hình
    const container = document.getElementById('random-quiz-active');
    const endDiv = document.createElement('div');
    endDiv.id = 'rq-end-screen';
    endDiv.innerHTML = html;
    container.appendChild(endDiv);
    
    if (finalStars > 0 && typeof awardStars === 'function') {
        await awardStars(finalStars, `Random Quiz (${rqCurrentDifficulty})`);
    }
}
