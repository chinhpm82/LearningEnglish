const { JSDOM } = require("jsdom");
const dom = new JSDOM(`
    <div id="random-quiz-active"></div>
    <div id="rq-question-direction"></div>
    <div id="rq-question-text"></div>
    <div id="rq-options-container"></div>
    <div id="rq-feedback"></div>
    <div><div id="rq-progress-bar"></div></div>
`);
global.document = dom.window.document;

let rqIsGameOver = false;
let rqTimerInterval = null;
let rqScore = 10;
let rqRewardMultiplier = 1;
let rqLives = 2;
let rqHistory = [{q: {question: 'foo', explanation: 'bar'}, isCorrect: true}];
let rqCurrentDifficulty = 'easy';

async function endRandomQuiz(reasonText) {
    rqIsGameOver = true;
    clearInterval(rqTimerInterval);
    
    const finalStars = rqScore * rqRewardMultiplier;
    
    // Render History Lists
    let correctListHTML = rqHistory.filter(h => h.isCorrect).map(h => `<div style="font-size: 14px; margin-bottom: 8px; color: #4ade80;">✔️ ${h.q.question}</div>`).join('');
    let wrongListHTML = rqHistory.filter(h => !h.isCorrect).map(h => `<div style="font-size: 14px; margin-bottom: 8px; color: #f87171; border-bottom: 1px solid rgba(248, 113, 113, 0.2); padding-bottom: 8px;">❌ ${h.q.question}<div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">💡 <em>${h.q.explanation || 'Không có giải thích'}</em></div></div>`).join('');
    
    if (!correctListHTML) correctListHTML = "<div style='color: var(--text-muted); font-size: 14px; text-align: center;'>Chưa có câu trả lời đúng nào.</div>";
    if (!wrongListHTML) wrongListHTML = "<div style='color: var(--text-muted); font-size: 14px; text-align: center;'>Tuyệt vời! Không có câu sai.</div>";

    const html = `...`;
    
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
    
    console.log("SUCCESS!");
}
endRandomQuiz("test");
