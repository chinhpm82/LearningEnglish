// --- AI Writing Room ---
let currentWritingTopic = null;
let writingTelemetry = {
    startTime: null,
    pasteCount: 0,
    totalPastedChars: 0,
    tabSwitches: 0,
    hasPastedLargeBlock: false,
    bestScore: 0
};

// Listen for tab switching / application defocus
window.addEventListener('blur', () => {
    if (writingTelemetry.startTime && currentWritingTopic) {
        writingTelemetry.tabSwitches++;
    }
});

function getDifficultyFromUserLevel(level) {
    if (!level) return 'Beginner';
    const l = level.toUpperCase();
    if (l === 'A1' || l === 'A2') return 'Beginner';
    if (l === 'B1' || l === 'B2') return 'Intermediate';
    if (l === 'C1' || l === 'C2') return 'Advanced';
    return 'Intermediate';
}

function initWritingRoom() {
    const topics = typeof WRITING_DATA !== 'undefined' ? WRITING_DATA : [];
    
    // Bind Surprise Initializer button
    const btnRandom = document.getElementById('btn-writing-random');
    const diffSelect = document.getElementById('writing-difficulty-select');
    
    if (btnRandom) {
        btnRandom.onclick = () => {
            const selectedDiff = diffSelect ? diffSelect.value : 'auto';
            let targetDiff = selectedDiff;
            
            if (selectedDiff === 'auto') {
                targetDiff = getDifficultyFromUserLevel(state.userLevel);
            }
            
            let pool = topics.filter(t => t.level === targetDiff);
            if (pool.length === 0) pool = topics;
            
            // Try to avoid repeating the current topic if possible
            let filteredPool = pool;
            if (currentWritingTopic) {
                filteredPool = pool.filter(t => t.id !== currentWritingTopic.id);
                if (filteredPool.length === 0) filteredPool = pool;
            }
            
            const randomTopic = filteredPool[Math.floor(Math.random() * filteredPool.length)];
            if (randomTopic) {
                updateWritingTopic(randomTopic);
                
                const label = selectedDiff === 'auto' 
                    ? `Phù hợp với trình độ hiện tại ${state.userLevel} (${randomTopic.level})`
                    : `Trình độ ${randomTopic.level}`;
                
                showToastNotification(`🎲 Đã khởi tạo chủ đề: "${randomTopic.topic}" (${label})!`);
            }
        };
    }
    
    const textarea = document.getElementById('writing-textarea');
    if (textarea) {
        textarea.value = '';
        textarea.oninput = handleWritingTextChange;
        
        // Listen for copy-paste to detect cheating
        textarea.addEventListener('paste', (e) => {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            writingTelemetry.pasteCount++;
            writingTelemetry.totalPastedChars += pastedText.length;
            if (pastedText.trim().length > 25) {
                writingTelemetry.hasPastedLargeBlock = true;
            }
        });
    }
    
    const btnGrade = document.getElementById('btn-writing-grade');
    if (btnGrade) {
        btnGrade.onclick = gradeWritingEssay;
    }
    
    const toggleSample = document.getElementById('btn-toggle-writing-sample');
    if (toggleSample) {
        toggleSample.onclick = () => {
            const el = document.getElementById('writing-sample-answer');
            el?.classList.toggle('hidden');
        };
    }
    
    // Start with placeholder locked state
    updateWritingTopic(null);
}

function updateWritingTopic(topic) {
    const textarea = document.getElementById('writing-textarea');
    
    // Reset telemetry
    writingTelemetry = {
        startTime: null,
        pasteCount: 0,
        totalPastedChars: 0,
        tabSwitches: 0,
        hasPastedLargeBlock: false,
        bestScore: 0
    };
    
    if (!topic) {
        currentWritingTopic = null;
        const badge = document.getElementById('writing-level-badge');
        if (badge) {
            badge.textContent = 'Chưa khởi tạo';
            badge.style.background = 'var(--text-muted)';
        }
        
        document.getElementById('writing-prompt-text').textContent = 'Vui lòng chọn mức độ khó và nhấn nút "🎲 Khởi tạo chủ đề" ở trên để bắt đầu thử thách!';
        document.getElementById('writing-prompt-en').textContent = 'Please select a difficulty level and click "🎲 Generate Topic" above to begin your writing challenge!';
        
        const outlineUl = document.getElementById('writing-outline-list');
        if (outlineUl) {
            outlineUl.innerHTML = '<li style="color: var(--text-muted); font-style: italic;">Chưa có dàn ý (Nhấp Khởi tạo chủ đề)</li>';
        }
        
        const vocabDiv = document.getElementById('writing-vocab-checklist');
        if (vocabDiv) {
            vocabDiv.innerHTML = '<div style="color: var(--text-muted); font-style: italic; font-size: 13px;">Chưa có từ vựng gợi ý</div>';
        }
        
        if (textarea) {
            textarea.value = '';
            textarea.disabled = true;
            textarea.placeholder = '🔒 Khung viết đang khóa. Vui lòng bấm "🎲 Khởi tạo chủ đề" để mở khóa...';
        }
        document.getElementById('writing-word-counter').textContent = '0 từ';
        document.getElementById('writing-result-panel')?.classList.add('hidden');
        document.getElementById('writing-sample-answer')?.classList.add('hidden');
        return;
    }
    
    currentWritingTopic = topic;
    
    // Set level badge background color based on level
    const badge = document.getElementById('writing-level-badge');
    if (badge) {
        badge.textContent = topic.level;
        if (topic.level === 'Beginner') badge.style.background = '#4ade80';
        else if (topic.level === 'Intermediate') badge.style.background = '#facc15';
        else if (topic.level === 'Advanced') badge.style.background = '#f87171';
    }
    
    document.getElementById('writing-prompt-text').textContent = topic.prompt;
    document.getElementById('writing-prompt-en').textContent = topic.englishPrompt;
    
    // Outline
    const outlineUl = document.getElementById('writing-outline-list');
    if (outlineUl) {
        outlineUl.innerHTML = '';
        topic.outline.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            outlineUl.appendChild(li);
        });
    }
    
    // Vocab Checklist
    const vocabDiv = document.getElementById('writing-vocab-checklist');
    if (vocabDiv) {
        vocabDiv.innerHTML = '';
        topic.suggestedWords.forEach(wordObj => {
            const div = document.createElement('div');
            div.className = 'vocab-check-item';
            div.style = 'display: flex; align-items: center; gap: 8px; font-size: 13.5px; padding: 6px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); color: var(--text-light); transition: all 0.2s;';
            div.setAttribute('data-word', wordObj.word.toLowerCase());
            div.innerHTML = `
                <span class="bullet" style="color: var(--text-muted);">⬜</span>
                <span style="font-weight: 500; color: #fff;">${wordObj.word}</span>
                <span style="font-size:12px; color:var(--text-muted);">(${wordObj.vi})</span>
            `;
            vocabDiv.appendChild(div);
        });
    }
    
    // Reset inputs
    if (textarea) {
        textarea.value = '';
        textarea.disabled = false;
        textarea.placeholder = 'Nhấp vào đây và bắt đầu viết đoạn văn của bạn bằng tiếng Anh...';
    }
    document.getElementById('writing-word-counter').textContent = '0 từ';
    document.getElementById('writing-result-panel')?.classList.add('hidden');
    document.getElementById('writing-sample-answer')?.classList.add('hidden');
    
    const sampleAnswerEl = document.getElementById('writing-sample-answer');
    if (sampleAnswerEl) {
        sampleAnswerEl.textContent = topic.sampleAnswer;
    }
}

function handleWritingTextChange() {
    const text = document.getElementById('writing-textarea').value;
    
    // Set writing start time on first keystroke
    if (text.trim().length > 0 && !writingTelemetry.startTime) {
        writingTelemetry.startTime = Date.now();
    }
    
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    document.getElementById('writing-word-counter').textContent = `${words.length} từ`;
    
    const normalizedText = text.toLowerCase();
    
    // Live update vocabulary checklist
    const checklistItems = document.querySelectorAll('.vocab-check-item');
    checklistItems.forEach(item => {
        const word = item.getAttribute('data-word');
        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b' + escapedWord, 'i');
        const isFound = regex.test(normalizedText);
        
        const bullet = item.querySelector('.bullet');
        if (isFound) {
            item.style.background = 'rgba(74, 222, 128, 0.08)';
            item.style.borderColor = 'rgba(74, 222, 128, 0.2)';
            if (bullet) {
                bullet.textContent = '✅';
                bullet.style.color = '#4ade80';
            }
        } else {
            item.style.background = 'rgba(255,255,255,0.02)';
            item.style.borderColor = 'rgba(255,255,255,0.04)';
            if (bullet) {
                bullet.textContent = '⬜';
                bullet.style.color = 'var(--text-muted)';
            }
        }
    });
}

function gradeWritingEssay() {
    if (!currentWritingTopic) return;
    const essay = document.getElementById('writing-textarea').value.trim();
    if (!essay) {
        showToastNotification('⚠️ Vui lòng viết nội dung trước khi chấm điểm!');
        return;
    }
    
    // Streak check on grading essay
    checkAndUpdateStreak();
    renderDashboard();

    const words = essay.split(/\s+/).filter(w => w.length > 0);
    const essayLen = words.length;
    
    // 1. Length Score (25 points max)
    let lengthScore = 0;
    let targetMin = 50;
    let targetMax = 80;
    if (currentWritingTopic.level === 'Intermediate') { targetMin = 80; targetMax = 120; }
    else if (currentWritingTopic.level === 'Advanced') { targetMin = 100; targetMax = 150; }
    
    // --- ADAPTIVE CEFR EVALUATION ADJUSTMENTS ---
    const userDiff = getDifficultyFromUserLevel(state.userLevel);
    let levelMismatchComment = "";

    // Adjust requirements if topic is more difficult than user's current level (be lenient)
    if (currentWritingTopic.level === 'Advanced' && userDiff === 'Beginner') {
        targetMin = Math.round(targetMin * 0.7); // 30% leniency
        levelMismatchComment = `\n*(Lưu ý sư phạm: Do bạn thuộc trình độ Sơ cấp (${state.userLevel}) đang thử thách chủ đề Cao cấp (Advanced), hệ thống đã giảm 30% yêu cầu độ dài tối thiểu xuống còn **${targetMin} từ** để động viên bạn!)*\n`;
    } else if (currentWritingTopic.level === 'Advanced' && userDiff === 'Intermediate') {
        targetMin = Math.round(targetMin * 0.85); // 15% leniency
        levelMismatchComment = `\n*(Lưu ý sư phạm: Bạn thuộc trình độ Trung cấp (${state.userLevel}) thử thách chủ đề Cao cấp (Advanced), hệ thống đã giảm 15% yêu cầu độ dài tối thiểu xuống còn **${targetMin} từ**!)*\n`;
    } else if (currentWritingTopic.level === 'Intermediate' && userDiff === 'Beginner') {
        targetMin = Math.round(targetMin * 0.8); // 20% leniency
        levelMismatchComment = `\n*(Lưu ý sư phạm: Trình độ Sơ cấp (${state.userLevel}) thử thách chủ đề Trung cấp (Intermediate), yêu cầu độ dài tối thiểu đã được giảm xuống còn **${targetMin} từ**!)*\n`;
    } else if (currentWritingTopic.level === 'Beginner' && userDiff === 'Advanced') {
        // Strictness: raise min length slightly for advanced user writing beginner topic
        targetMin = Math.round(targetMin * 1.2); 
        levelMismatchComment = `\n*(Lưu ý sư phạm: Bạn thuộc trình độ Cao cấp (${state.userLevel}) đang viết chủ đề Sơ cấp (Beginner), hệ thống yêu cầu độ dài tối thiểu cao hơn một chút (**${targetMin} từ**) để đánh giá đầy đủ thực lực của bạn!)*\n`;
    }
    
    if (essayLen >= targetMin && essayLen <= targetMax) {
        lengthScore = 25;
    } else if (essayLen < targetMin) {
        const ratio = essayLen / targetMin;
        lengthScore = Math.round(ratio * 20);
    } else {
        lengthScore = Math.max(15, 25 - Math.round((essayLen - targetMax) / 10));
    }
    
    // 2. Vocabulary Score (25 points max - 5 points per suggested word)
    let usedVocabCount = 0;
    const usedWordsList = [];
    const normalizedEssay = essay.toLowerCase();
    currentWritingTopic.suggestedWords.forEach(wordObj => {
        const escaped = wordObj.word.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b' + escaped, 'i');
        if (regex.test(normalizedEssay)) {
            usedVocabCount++;
            usedWordsList.push(wordObj.word);
        }
    });
    let vocabScore = Math.min(25, usedVocabCount * 5);
    
    // 3. Lexical Diversity (TTR) (20 points max)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[.,!?;:'"()]/g, '')));
    const ttr = uniqueWords.size / Math.max(1, essayLen);
    let diversityScore = Math.round(ttr * 20);
    
    // 4. Structural Connectors Score (15 points max)
    const connectors = ['firstly', 'secondly', 'thirdly', 'furthermore', 'moreover', 'additionally', 'however', 'on the other hand', 'in addition', 'therefore', 'ultimately', 'in conclusion', 'to sum up', 'first of all', 'last but not least'];
    const foundConnectors = [];
    connectors.forEach(c => {
        if (normalizedEssay.includes(c)) {
            foundConnectors.push(c);
        }
    });
    let connectorScore = Math.min(15, foundConnectors.length * 5);
    
    // 5. Basic Syntax / Capitalization (15 points max)
    let syntaxScore = 15;
    const sentences = essay.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    let capErrors = 0;
    sentences.forEach(s => {
        const firstChar = s.charAt(0);
        if (firstChar && firstChar !== firstChar.toUpperCase()) {
            capErrors++;
        }
    });
    syntaxScore = Math.max(5, 15 - (capErrors * 3));
    
    // --- PEDAGOGICAL SAFETY & ANTI-EXPLOIT VALIDATION ---
    let shortLengthPenalty = false;
    let spamPenalty = false;
    let nonEnglishPenalty = false;

    // Count real English alphabetic tokens
    const englishWordRegex = /[a-zA-Z]{2,}/g;
    const englishWordsCount = (normalizedEssay.match(englishWordRegex) || []).length;

    if (englishWordsCount < 5) {
        nonEnglishPenalty = true;
    } else if (essayLen < 15) {
        shortLengthPenalty = true;
    } else if (essayLen > 15 && ttr < 0.28) {
        spamPenalty = true;
    }

    // Adaptively apply scores or penalties
    if (nonEnglishPenalty) {
        lengthScore = 0;
        vocabScore = 0;
        diversityScore = 0;
        connectorScore = 0;
        syntaxScore = 0;
    } else if (shortLengthPenalty) {
        lengthScore = Math.round((essayLen / 15) * 3); // Max 3 pts
        vocabScore = Math.min(2, vocabScore);
        diversityScore = Math.min(2, diversityScore); // 2 words shouldn't get 20 pts for TTR!
        connectorScore = 0;
        syntaxScore = Math.min(3, syntaxScore);
    } else if (spamPenalty) {
        lengthScore = Math.round(lengthScore * 0.1);
        vocabScore = Math.round(vocabScore * 0.1);
        diversityScore = 1;
        connectorScore = Math.round(connectorScore * 0.1);
        syntaxScore = Math.min(3, syntaxScore);
    }

    // --- ACADEMIC INTEGRITY MONITORING SYSTEM (Copy-Paste & AI Detection) ---
    const elapsedMs = Date.now() - (writingTelemetry.startTime || Date.now());
    const elapsedMinutes = elapsedMs / 60000;
    const wpm = elapsedMinutes > 0.05 ? essayLen / elapsedMinutes : 999;
    
    let integrityScore = 100;
    let integrityReasons = [];
    
    if (writingTelemetry.hasPastedLargeBlock) {
        integrityScore -= 70;
        integrityReasons.push("Phát hiện dán một khối lượng lớn ký tự (Copy-paste block)");
    } else if (writingTelemetry.pasteCount > 0) {
        integrityScore -= (writingTelemetry.pasteCount * 15);
        integrityReasons.push(`Phát hiện hành vi dán văn bản (${writingTelemetry.pasteCount} lần)`);
    }
    
    if (wpm > 130 && essayLen > 25) {
        integrityScore -= 45;
        integrityReasons.push(`Tốc độ nhập liệu nhanh đến mức bất khả thi (${Math.round(wpm)} từ/phút)`);
    } else if (wpm > 70 && essayLen > 25) {
        integrityScore -= 20;
        integrityReasons.push(`Tốc độ viết nhanh bất thường (${Math.round(wpm)} từ/phút)`);
    }
    
    if (writingTelemetry.tabSwitches > 1) {
        integrityScore -= Math.min(25, writingTelemetry.tabSwitches * 10);
        integrityReasons.push(`Thoát tab/đổi ứng dụng khi đang làm bài (${writingTelemetry.tabSwitches} lần)`);
    }
    
    // ChatGPT stylistic phrasing templates checks
    const aiPhrases = [
        "in today's fast-paced world", 
        "in the modern era", 
        "double-edged sword", 
        "plays a crucial role", 
        "vital role", 
        "in conclusion", 
        "essential tool", 
        "not only", 
        "digital era"
    ];
    let aiStyleMatches = 0;
    aiPhrases.forEach(p => {
        if (normalizedEssay.includes(p)) aiStyleMatches++;
    });
    
    if (aiStyleMatches >= 3) {
        integrityScore -= 20;
        integrityReasons.push("Sử dụng văn phong khuôn mẫu kinh điển đặc trưng của ChatGPT/AI");
    }
    
    integrityScore = Math.max(0, integrityScore);

    // Final Overall Score
    let totalScore = lengthScore + vocabScore + diversityScore + connectorScore + syntaxScore;
    
    // Integrity deduction penalty
    let finalScore = totalScore;
    if (integrityScore < 95) {
        finalScore = Math.round(totalScore * (integrityScore / 100));
    }
    
    if (nonEnglishPenalty) finalScore = 0;
    else if (spamPenalty) finalScore = Math.min(10, finalScore);
    else if (shortLengthPenalty) finalScore = Math.min(12, finalScore);
    
    // Generate feedback comments
    let aiComment = `**Đánh giá tổng quan:** Bài viết đạt **${finalScore}/100 điểm**. `;
    if (levelMismatchComment) {
        aiComment += levelMismatchComment + " ";
    }
    
    if (nonEnglishPenalty) {
        aiComment += `\n\n⚠️ **CẢNH BÁO NỘI DUNG KHÔNG HỢP LỆ:** Bài viết của bạn không chứa đủ số lượng từ tiếng Anh hợp lệ hoặc toàn ký tự rác. Vui lòng nhập một đoạn văn tiếng Anh thực tế có nghĩa!`;
    } else if (shortLengthPenalty) {
        aiComment += `\n\n⚠️ **BÀI VIẾT QUÁ NGẮN:** Bài viết của bạn cực kỳ ngắn (chỉ có ${essayLen} từ, dưới ngưỡng tối thiểu 15 từ). Ở độ dài này, hệ thống áp dụng khung phạt độ dài nghiêm khắc để đảm bảo tính công bằng (điểm tối đa 12/100). Hãy viết ít nhất một đoạn văn hoàn chỉnh!`;
    } else if (spamPenalty) {
        aiComment += `\n\n⚠️ **CẢNH BÁO LẶP TỪ RÁC (SPAM):** Chỉ số đa dạng từ vựng của bạn quá thấp (chỉ ${Math.round(ttr*100)}% từ duy nhất), phát hiện hành vi lặp lại từ hoặc sao chép vô nghĩa. Hệ thống đã áp dụng khung phạt lặp từ tối đa 10/100. Vui lòng viết các câu đa dạng và đầy đủ ý kiến!`;
    } else {
        if (finalScore >= 85) {
            aiComment += `Một bài viết tuyệt vời! Cấu trúc logic mạch lạc, hành văn tự nhiên và đáp ứng rất tốt yêu cầu đề bài. `;
        } else if (finalScore >= 70) {
            aiComment += `Bài viết khá tốt. Diễn đạt tương đối trôi chảy, tuy nhiên cần chú ý thêm cấu trúc câu hoặc từ vựng gợi ý để lập luận sắc sảo hơn. `;
        } else {
            aiComment += `Bài viết ở mức trung bình. Hãy tập trung cải thiện ngữ pháp cơ bản, cách viết hoa đầu câu và tăng cường độ dài bài viết. `;
        }
    }
    
    if (integrityScore < 90 && !nonEnglishPenalty && !shortLengthPenalty && !spamPenalty) {
        aiComment += `\n\n⚠️ **CẢNH BÁO GIÁM SÁT LIÊM CHÍNH HỌC THUẬT (${integrityScore}%):** Hệ thống phát hiện bạn có khả năng đã sao chép hoặc nhờ sự trợ giúp của AI ngoài vì các lý do:\n`;
        integrityReasons.forEach(r => {
            aiComment += `• ${r}\n`;
        });
        aiComment += `*(Lưu ý: Để nâng cao kỹ năng tiếng Anh thực chất, bạn nên tự tay gõ từng từ thay vì copy-paste từ các nguồn dịch thuật/AI. Điểm số của bạn đã bị khấu trừ tự động tương ứng.)*\n`;
    }
    
    aiComment += `\n\n**Ưu điểm:**\n`;
    aiComment += `• Độ dài thực tế: **${essayLen} từ** (Mục tiêu: ${targetMin}-${targetMax} từ).\n`;
    if (usedVocabCount > 0) {
        aiComment += `• Bạn đã lồng ghép thành công các từ gợi ý: *${usedWordsList.join(', ')}* vào ngữ cảnh rất phù hợp.\n`;
    } else {
        aiComment += `• Bài viết có sự phong phú về từ vựng (đạt ${Math.round(ttr*100)}% chỉ số từ duy nhất).\n`;
    }
    if (foundConnectors.length > 0) {
        aiComment += `• Cấu trúc liên kết ý tốt nhờ các từ nối: *${foundConnectors.join(', ')}*.\n`;
    }
    
    aiComment += `\n**Điểm cần khắc phục:**\n`;
    if (essayLen < targetMin) {
        aiComment += `• Bài viết hơi ngắn. Hãy cố gắng triển khai thêm các ý trong phần Gợi ý cấu trúc (Outline) ở cột bên phải.\n`;
    } else if (essayLen > targetMax) {
        aiComment += `• Bài viết hơi dài hơn mục tiêu. Cố gắng cô đọng ý tư để câu văn súc tích hơn.\n`;
    }
    const missedWords = currentWritingTopic.suggestedWords.filter(w => !usedWordsList.includes(w.word));
    if (missedWords.length > 0) {
        aiComment += `• Nên bổ sung thêm các từ vựng cốt lõi còn thiếu: *${missedWords.map(w => w.word).join(', ')}* để nâng cao chiều sâu học thuật.\n`;
    }
    if (capErrors > 0) {
        aiComment += `• Chú ý sửa lỗi chính tả: Có **${capErrors} lỗi** chưa viết hoa ký tự đầu tiên của câu sau dấu chấm.\n`;
    } else {
        aiComment += `• Chúc mừng bạn đã trình bày cú pháp và quy tắc viết hoa cực kỳ chính xác!\n`;
    }
    
    // Reward Stars (Persistent High Score Delta system)
    const topicId = currentWritingTopic.id || currentWritingTopic.topic;
    const currentBest = state.writingHighScores[topicId] || 0;
    
    const newStars = Math.round(finalScore / 2);
    const prevStars = Math.round(currentBest / 2);
    const starsToAward = Math.max(0, newStars - prevStars);
    
    if (starsToAward > 0) {
        awardStars(starsToAward, `Kỷ lục luyện viết chủ đề "${currentWritingTopic.topic}" đạt ${finalScore} điểm`);
        aiComment += `\n🎁 **Phần thưởng:** Bạn đạt kỷ lục mới **${finalScore} điểm** và nhận được **+${starsToAward} ⭐** học tập!`;
    } else {
        aiComment += `\n🎁 **Phần thưởng:** +0 ⭐ (Điểm số ${finalScore}/100 chưa vượt qua kỷ lục trước đó là ${currentBest}/100 của chủ đề này).`;
    }
    
    // Save new best score permanently to database
    state.writingHighScores[topicId] = Math.max(currentBest, finalScore);
    saveStatsToStorage();
    
    // Display results in UI
    document.getElementById('writing-result-panel').classList.remove('hidden');
    document.getElementById('writing-score-val').textContent = finalScore;
    document.getElementById('writing-res-length').textContent = `${essayLen} từ (${essayLen >= targetMin && essayLen <= targetMax ? 'Đạt' : 'Cần điều chỉnh'})`;
    document.getElementById('writing-res-vocab').textContent = `${usedVocabCount} / ${currentWritingTopic.suggestedWords.length} từ`;
    document.getElementById('writing-res-ttr').textContent = `${Math.round(ttr * 100)}% (${ttr > 0.7 ? 'Rất phong phú' : 'Tương đối ổn'})`;
    
    const integritySpan = document.getElementById('writing-res-integrity');
    if (integritySpan) {
        if (integrityScore >= 90) {
            integritySpan.textContent = `${integrityScore}% (Trung thực)`;
            integritySpan.style.color = '#4ade80';
        } else if (integrityScore >= 60) {
            integritySpan.textContent = `${integrityScore}% (Cảnh báo)`;
            integritySpan.style.color = '#facc15';
        } else {
            integritySpan.textContent = `⚠️ ${integrityScore}% (Nghi vấn Sao chép/AI)`;
            integritySpan.style.color = '#f87171';
        }
    }
    
    const feedbackBox = document.getElementById('writing-ai-feedback');
    if (feedbackBox) {
        feedbackBox.innerHTML = aiComment.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    // --- GRAMMAR & SPELLING HEURISTICS ENGINE ---
    const grammarErrors = analyzeGrammarErrors(essay);
    const grammarPanel = document.getElementById('writing-grammar-panel');
    const grammarCount = document.getElementById('writing-grammar-count');
    const grammarList = document.getElementById('writing-grammar-list');
    
    if (grammarPanel && grammarCount && grammarList) {
        grammarList.innerHTML = '';
        
        if (grammarErrors.length > 0) {
            grammarPanel.style.display = 'block';
            grammarCount.textContent = `${grammarErrors.length} lỗi`;
            
            grammarErrors.forEach(err => {
                const item = document.createElement('div');
                item.className = 'dashboard-card';
                item.style = 'padding: 12px 15px; border-left: 4px solid #f87171; background: rgba(248, 113, 113, 0.03); display: flex; flex-direction: column; gap: 8px; margin-bottom: 5px;';
                
                // Escape quotes for safe HTML attributes binding
                const escapedOriginal = err.original.replace(/'/g, "\\'");
                const escapedSuggested = err.suggested.replace(/'/g, "\\'");
                
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div style="font-size: 14px; font-weight: 500;">
                            <span style="color: #f87171; text-decoration: line-through; margin-right: 8px;">${err.original}</span>
                            <span style="color: #4ade80; font-weight: 600;">➔ ${err.suggested}</span>
                        </div>
                        <button class="btn-primary" style="padding: 4px 10px; font-size: 11px; background: #4ade80; border: none; box-shadow: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="applyGrammarFix('${err.id}', '${escapedOriginal}', '${escapedSuggested}')">
                            <span>💡 Tự động sửa</span>
                        </button>
                    </div>
                    <div style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
                        ${err.explanation}
                    </div>
                `;
                grammarList.appendChild(item);
            });
        } else {
            grammarPanel.style.display = 'none';
        }
    }
    
    document.getElementById('writing-result-panel').scrollIntoView({ behavior: 'smooth' });
}

function analyzeGrammarErrors(essay) {
    const errors = [];
    const normalized = essay.toLowerCase();
    
    const rules = [
        // Subject-Verb Agreement: He/She/It go/want/like/have
        {
            regex: /\b(he|she|it)\s+(go)\b/gi,
            replace: "$1 goes",
            explanation: "Chủ ngữ ngôi thứ ba số ít (he, she, it) yêu cầu động từ thêm đuôi '-es'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(want)\b/gi,
            replace: "$1 wants",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ thêm đuôi '-s'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(like)\b/gi,
            replace: "$1 likes",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ thêm đuôi '-s'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(have)\b/gi,
            replace: "$1 has",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ chia thành dạng số ít 'has'.",
            type: "grammar"
        },
        {
            regex: /\b(he|she|it)\s+(do)\b/gi,
            replace: "$1 does",
            explanation: "Chủ ngữ ngôi thứ ba số ít yêu cầu động từ chia thành 'does'.",
            type: "grammar"
        },
        
        // Consonant-Vowel Article Mismatch
        {
            regex: /\b(a)\s+(apple|orange|egg|elephant|idea|hour|umbrella|actor|artist|honest)\b/gi,
            replace: "an $2",
            explanation: "Sử dụng mạo từ 'an' trước các từ bắt đầu bằng một nguyên âm (hoặc âm câm như 'h' trong 'hour').",
            type: "grammar"
        },
        {
            regex: /\b(an)\s+(book|car|house|university|uniform|man|woman|cat|dog|table)\b/gi,
            replace: "a $2",
            explanation: "Sử dụng mạo từ 'a' trước danh từ bắt đầu bằng phụ âm (hoặc âm 'u' phát âm như /ju:/ như 'university').",
            type: "grammar"
        },
        
        // Modal Verb mismatch
        {
            regex: /\b(can|could|should|must|will|would|shall|might|may)\s+to\s+([a-z]+)\b/gi,
            replace: "$1 $2",
            explanation: "Sau các động từ khuyết thiếu (modal verbs) phải là động từ nguyên mẫu không 'to' (bare infinitive).",
            type: "grammar"
        },
        {
            regex: /\b(should|would|could|must|can)\s+going\b/gi,
            replace: "$1 go",
            explanation: "Sau động từ khuyết thiếu phải là động từ nguyên mẫu dạng bare infinitive.",
            type: "grammar"
        },
        
        // Double Comparison
        {
            regex: /\bmore\s+(better|worse|easier|faster|harder|taller|shorter|bigger|smaller)\b/gi,
            replace: "$1",
            explanation: "Tránh sử dụng từ so sánh kép 'more' cùng với tính từ so sánh ngắn đã thêm đuôi '-er'.",
            type: "style"
        },
        
        // Typical Preposition Mistakes
        {
            regex: /\b(discuss)\s+about\b/gi,
            replace: "$1",
            explanation: "'Discuss' là ngoại động từ trực tiếp, không đi kèm giới từ 'about'. (Ví dụ: 'discuss the plan').",
            type: "style"
        },
        {
            regex: /\b(marry)\s+with\b/gi,
            replace: "$1",
            explanation: "'Marry' đi trực tiếp với tân ngữ danh từ chỉ người, không sử dụng với giới từ 'with'.",
            type: "grammar"
        },
        {
            regex: /\b(depend)\s+of\b/gi,
            replace: "$1 on",
            explanation: "Cụm động từ chính xác là 'depend on' (phụ thuộc vào), không dùng 'depend of'.",
            type: "grammar"
        },
        {
            regex: /\b(listen)\s+music\b/gi,
            replace: "$1 to music",
            explanation: "Động từ 'listen' cần đi kèm giới từ 'to' khi có tân ngữ theo sau ('listen to music').",
            type: "grammar"
        },
        {
            regex: /\b(good)\s+in\s+(english|math|science|sports|art|music)\b/gi,
            replace: "$1 at $2",
            explanation: "Để diễn tả giỏi một lĩnh vực nào đó, hãy dùng giới từ 'at' ('good at English').",
            type: "grammar"
        },
        {
            regex: /\b(interested)\s+on\b/gi,
            replace: "$1 in",
            explanation: "Cấu trúc đúng để thể hiện sự quan tâm là 'be interested in', không đi kèm 'on'.",
            type: "grammar"
        },
        
        // Double Negatives
        {
            regex: /\b(don't|doesn't|didn't|can't|cannot|won't)\s+have\s+nothing\b/gi,
            replace: "$1 have anything",
            explanation: "Sử dụng phủ định kép là sai ngữ pháp trong tiếng Anh chuẩn. Hãy đổi 'nothing' thành 'anything'.",
            type: "grammar"
        },
        {
            regex: /\b(don't|doesn't|didn't|can't|cannot|won't)\s+see\s+nobody\b/gi,
            replace: "$1 see anybody",
            explanation: "Sử dụng phủ định kép là sai ngữ pháp trong tiếng Anh chuẩn. Hãy đổi 'nobody' thành 'anybody'.",
            type: "grammar"
        },
        
        // Singular Plural mismatch (Quantifier mismatch)
        {
            regex: /\bmany\s+(person|book|day|year|friend|student|teacher|child)\b/gi,
            explanation: "Từ định lượng 'many' bắt buộc phải đi kèm danh từ số nhiều tương ứng.",
            type: "grammar",
            customReplace: (match) => {
                const map = {
                    "many person": "many people",
                    "many book": "many books",
                    "many day": "many days",
                    "many year": "many years",
                    "many friend": "many friends",
                    "many student": "many students",
                    "many teacher": "many teachers",
                    "many child": "many children"
                };
                return map[match.toLowerCase()] || match;
            }
        }
    ];
    
    rules.forEach((rule, idx) => {
        // Reset last index
        rule.regex.lastIndex = 0;
        const matches = [...essay.matchAll(rule.regex)];
        
        matches.forEach(m => {
            const originalText = m[0];
            let suggestedText = "";
            if (rule.customReplace) {
                suggestedText = rule.customReplace(originalText);
            } else {
                suggestedText = originalText.replace(rule.regex, rule.replace);
            }
            
            // Avoid duplicate error logs
            if (!errors.some(e => e.original === originalText && e.index === m.index)) {
                errors.push({
                    id: `err-${idx}-${m.index}`,
                    original: originalText,
                    suggested: suggestedText,
                    explanation: rule.explanation,
                    type: rule.type,
                    index: m.index
                });
            }
        });
    });
    
    return errors;
}

function applyGrammarFix(errorId, originalText, suggestedText) {
    const textarea = document.getElementById('writing-textarea');
    if (!textarea) return;
    
    const currentVal = textarea.value;
    // Replace the exact matching original phrase
    const newVal = currentVal.replace(originalText, suggestedText);
    textarea.value = newVal;
    
    // Trigger word counter and updates
    handleWritingTextChange();
    
    // Animate a toast notification
    showToastNotification(`💡 Đã tự động sửa lỗi: "${originalText}" thành "${suggestedText}"!`);
    
    // Re-grade to reflect the perfect new score!
    gradeWritingEssay();
}

window.applyGrammarFix = applyGrammarFix;

