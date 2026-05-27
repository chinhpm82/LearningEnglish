import { collection, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Tab Switching Logic ---
window.switchTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    // Remove active class
    document.querySelectorAll('.admin-tab-btn').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    
    // Set active button (finding the right one based on onclick)
    const btns = document.querySelectorAll('.admin-tab-btn');
    if (tabName === 'analyzer') btns[0].classList.add('active');
    if (tabName === 'uploader') btns[1].classList.add('active');
};

// --- READABILITY ANALYZER (Flesch-Kincaid) ---
window.analyzeText = function() {
    const text = document.getElementById('analyzer-input').value.trim();
    if (!text) {
        alert("Vui lòng nhập văn bản cần phân tích!");
        return;
    }
    
    // 1. Calculate Sentences
    // Split by ., !, ? followed by space or end of string
    const sentenceRegex = /[.!?]+(?=\s|$)/g;
    const sentencesArr = text.split(sentenceRegex).filter(s => s.trim().length > 0);
    const totalSentences = Math.max(1, sentencesArr.length);
    
    // 2. Calculate Words
    // Remove punctuation, split by spaces
    const cleanText = text.replace(/[^\w\s-]/g, '');
    const wordsArr = cleanText.split(/\s+/).filter(w => w.trim().length > 0);
    const totalWords = Math.max(1, wordsArr.length);
    
    // 3. Calculate Syllables
    let totalSyllables = 0;
    wordsArr.forEach(word => {
        totalSyllables += countSyllables(word);
    });
    
    // 4. Flesch-Kincaid Grade Level Formula
    // 0.39 x (words/sentences) + 11.8 x (syllables/words) - 15.59
    const asl = totalWords / totalSentences;
    const asw = totalSyllables / totalWords;
    const fkGrade = (0.39 * asl) + (11.8 * asw) - 15.59;
    
    // Update UI
    document.getElementById('stat-words').textContent = totalWords;
    document.getElementById('stat-sentences').textContent = totalSentences;
    document.getElementById('stat-asl').textContent = asl.toFixed(1);
    document.getElementById('stat-fk').textContent = fkGrade.toFixed(1);
    
    // Determine CEFR Level
    const badge = document.getElementById('result-badge');
    badge.className = 'level-badge'; // Reset
    
    if (fkGrade < 5) {
        // Grade 1-4: Beginner
        badge.textContent = "Beginner (A1 - A2)";
        badge.classList.add('lvl-beginner');
    } else if (fkGrade >= 5 && fkGrade < 9) {
        // Grade 5-8: Intermediate
        badge.textContent = "Intermediate (B1 - B2)";
        badge.classList.add('lvl-intermediate');
    } else {
        // Grade 9+: Advanced
        badge.textContent = "Advanced (C1 - C2)";
        badge.classList.add('lvl-advanced');
    }
    
    document.getElementById('analyzer-result').style.display = 'block';
};

// Heuristic function to count syllables in an English word
function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    // Remove ending e, es, ed
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

// --- FIRESTORE BATCH UPLOADER ---
window.uploadJsonData = async function() {
    const btn = document.getElementById('btn-do-upload');
    const collectionName = document.getElementById('upload-collection').value;
    const jsonStr = document.getElementById('upload-json').value.trim();
    const logBox = document.getElementById('upload-log');
    
    if (!jsonStr) {
        alert("Vui lòng dán JSON dữ liệu vào ô trống!");
        return;
    }
    
    let dataArray = [];
    try {
        dataArray = JSON.parse(jsonStr);
        if (!Array.isArray(dataArray)) {
            throw new Error("Dữ liệu phải là một Mảng (Array) JSON!");
        }
    } catch (e) {
        alert("Lỗi cú pháp JSON: " + e.message);
        return;
    }
    
    if (!window.FirebaseSync || !window.FirebaseSync.db) {
        alert("Chưa kết nối được với Firebase. Bạn đã cấu hình firebase-sync.js chưa?");
        return;
    }
    
    btn.disabled = true;
    btn.textContent = "⏳ Đang upload...";
    logBox.textContent = "Bắt đầu tiến trình upload...\n";
    
    try {
        // Lọc trùng lặp ID (nếu có)
        const uniqueItems = new Map();
        dataArray.forEach((item, index) => {
            const id = item.id ? String(item.id) : (item.word ? item.word.toLowerCase() : `auto-${Date.now()}-${index}`);
            uniqueItems.set(id, { ...item, id: id });
        });

        const items = Array.from(uniqueItems.values());
        const total = items.length;
        let batchCount = 0;
        
        // Firestore batch limit is 500
        const CHUNK_SIZE = 450; 

        for (let i = 0; i < total; i += CHUNK_SIZE) {
            const chunk = items.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(window.FirebaseSync.db);

            chunk.forEach(item => {
                const docRef = doc(collection(window.FirebaseSync.db, collectionName), String(item.id));
                batch.set(docRef, item);
            });

            await batch.commit();
            batchCount++;
            logBox.textContent += `✅ Đã upload chunk ${batchCount} (${chunk.length} items) lên ${collectionName}\n`;
        }
        
        logBox.textContent += `\n🎉 HOÀN TẤT! Đã tải lên tổng cộng ${total} mục thành công.`;
        alert("Upload thành công rực rỡ!");
        document.getElementById('upload-json').value = ''; // Clear after success
    } catch (error) {
        console.error("Lỗi Upload:", error);
        logBox.textContent += `\n❌ LỖI: ${error.message}\n(Lưu ý: Nếu bị Permission Denied, hãy vào Rules của Firestore để mở quyền tạm thời: allow read, write: if true;)`;
    } finally {
        btn.disabled = false;
        btn.textContent = "🚀 Đẩy dữ liệu lên Firebase";
    }
};

// Add event listener for file upload
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('upload-file');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('upload-json').value = event.target.result;
            };
            reader.readAsText(file);
        });
    }
});
