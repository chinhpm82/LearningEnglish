/* ==========================================================================
   LearningEnglish - Random Quiz Game Logic
   ========================================================================== */

let rqTimerInterval = null;
let rqTimeRemaining = 300; // 5 phút = 300 giây
let rqLives = 3;
let rqScore = 0;
let rqCurrentDifficulty = 'easy'; // 'easy', 'normal', 'hardcore'
let rqCurrentLevelIndex = 0;
let rqQuestions = [];
let rqCurrentQuestionIndex = 0;
let rqQuizIndex = [];
let rqCorrectInARow = 0;
let rqRewardMultiplier = 1;
let rqIsGameOver = false;

const LEVEL_PROGRESSION = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

async function initRandomQuizSession(difficulty) {
    rqCurrentDifficulty = difficulty;
    rqLives = 3;
    rqScore = 0;
    rqTimeRemaining = 300;
    rqQuestions = [];
    rqCurrentQuestionIndex = 0;
    rqCorrectInARow = 0;
    rqIsGameOver = false;

    // Thiết lập độ khó ban đầu và hệ số nhân điểm
    if (difficulty === 'easy') {
        rqCurrentLevelIndex = 0; // A1
        rqRewardMultiplier = 1;
    } else if (difficulty === 'normal') {
        rqCurrentLevelIndex = 2; // B1
        rqRewardMultiplier = 2;
    } else if (difficulty === 'hardcore') {
        rqCurrentLevelIndex = 4; // C1
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
            const response = await fetch('json/quiz-index.json');
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
    const currentLevel = LEVEL_PROGRESSION[rqCurrentLevelIndex];
    document.getElementById('rq-question-direction').textContent = `Đang tải câu hỏi Level ${currentLevel}...`;
    
    // Lọc các ID thuộc level hiện tại
    const availableIds = rqQuizIndex.filter(q => q.level === currentLevel).map(q => q.id);
    
    // Nếu không có câu nào, tự động tăng level nếu có thể
    if (availableIds.length === 0) {
        if (rqCurrentLevelIndex < LEVEL_PROGRESSION.length - 1) {
            rqCurrentLevelIndex++;
            return await fetchNextBatch();
        } else {
            return; // Đã hết câu hỏi
        }
    }

    // Trộn mảng ID và lấy 10 câu (nếu là hardcore lấy nhiều hơn, hoặc lấy hết)
    const shuffledIds = availableIds.sort(() => 0.5 - Math.random());
    const batchIds = shuffledIds.slice(0, 10); // Mỗi đợt tải 10 câu

    // Gọi Firestore qua firebase-sync.js
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
        // Hết câu hỏi trong hàng đợi, tải thêm
        document.getElementById('rq-question-text').textContent = "Đang tải thêm câu hỏi...";
        document.getElementById('rq-options-container').innerHTML = '';
        fetchNextBatch().then(() => {
            if (rqCurrentQuestionIndex < rqQuestions.length) {
                renderRQQuestion();
            } else {
                endRandomQuiz("Chúc mừng! Bạn đã hoàn thành toàn bộ ngân hàng câu hỏi! 🏆");
            }
        });
        return;
    }

    const q = rqQuestions[rqCurrentQuestionIndex];
    document.getElementById('rq-feedback').classList.add('hidden');
    
    // Hiển thị Level hiện tại
    const levelText = LEVEL_PROGRESSION[rqCurrentLevelIndex];
    document.getElementById('rq-question-direction').textContent = `Câu ${rqScore + 1} - Mức độ: ${levelText}`;
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

    // Cập nhật Progress Bar
    const progress = Math.min(100, (rqCorrectInARow / 10) * 100);
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
        rqCorrectInARow++;
        rqLives = 3; // Sai liên tiếp 3 câu mới thua, nên nếu đúng thì reset lại mạng
        updateRQLivesUI();
        updateRQScoreUI();
        
        // Auto-Scale Difficulty
        if (rqCorrectInARow >= 10) {
            rqCorrectInARow = 0; // Reset đếm chuỗi
            if (rqCurrentLevelIndex < LEVEL_PROGRESSION.length - 1) {
                rqCurrentLevelIndex++; // Nâng cấp level
                showToastNotification(`🔥 Tăng cấp độ khó lên ${LEVEL_PROGRESSION[rqCurrentLevelIndex]}!`);
                // Kích hoạt fetch ngầm (background)
                fetchNextBatch();
            }
        }
        
        showRQFeedback(true, "Chính xác!", q.explanation);
    } else {
        btnElement.classList.add('wrong');
        options[q.answer].classList.add('correct'); // Hiện đáp án đúng
        rqLives--;
        rqCorrectInARow = 0; // Đứt chuỗi
        updateRQLivesUI();
        
        if (rqLives <= 0) {
            showRQFeedback(false, "Sai rồi!", q.explanation);
            setTimeout(() => {
                endRandomQuiz("Hết mạng! 💔");
            }, 1500);
            return;
        } else {
            showRQFeedback(false, "Sai rồi!", q.explanation);
        }
    }

    // Cập nhật Progress Bar cho chặng tăng cấp
    const progress = Math.min(100, (rqCorrectInARow / 10) * 100);
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
    rqCurrentQuestionIndex++;
    renderRQQuestion();
});

async function endRandomQuiz(reasonText) {
    rqIsGameOver = true;
    clearInterval(rqTimerInterval);
    
    const finalStars = rqScore * rqRewardMultiplier;
    
    const html = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">${rqLives > 0 ? '🏆' : '💀'}</div>
            <h2 style="color: var(--accent); margin-bottom: 10px;">${reasonText}</h2>
            <div style="font-size: 20px; margin-bottom: 20px;">
                Số câu đúng: <strong style="color: #4ade80; font-size: 28px;">${rqScore}</strong>
            </div>
            <div style="background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 12px; padding: 15px; display: inline-block;">
                <div style="font-size: 14px; color: var(--text-muted);">Phần thưởng (x${rqRewardMultiplier})</div>
                <div style="font-size: 24px; font-weight: bold; color: #facc15;">+${finalStars} ⭐</div>
            </div>
            <div style="margin-top: 30px;">
                <button class="btn-primary" onclick="document.getElementById('rq-end-screen').remove(); document.getElementById('btn-quiz-go-home').click();" style="width: 100%;">Nhận phần thưởng & Thoát</button>
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
        await awardStars(finalStars, `Thắng Random Quiz (${rqCurrentDifficulty})`);
    }
}
