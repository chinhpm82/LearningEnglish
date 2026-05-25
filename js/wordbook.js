// --- PERSONAL WORDBOOK MANAGEMENT ---
function renderWordbook(searchTerm = '') {
    const listContainer = document.getElementById('custom-words-list');
    const wordCountBadge = document.getElementById('custom-word-count');

    // Filter by search
    const filtered = state.customWords.filter(w => 
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    wordCountBadge.textContent = state.customWords.length;

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state-list text-center">
                <div class="empty-icon">📂</div>
                <h4>Không tìm thấy từ nào phù hợp</h4>
                <p>Hãy thử tìm bằng từ khác hoặc thêm từ mới bên cạnh.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'custom-vocab-card';
        card.innerHTML = `
            <div class="vocab-card-header">
                <h4 class="vocab-card-title">${item.word}</h4>
                <span class="vocab-card-type">${item.type}</span>
            </div>
            <p class="vocab-card-ipa">${item.ipa || ''}</p>
            <p class="vocab-card-meaning">${item.meaning}</p>
            <div class="vocab-card-example">
                <p class="example-en" style="font-size:11px; margin-bottom: 2px;">"${item.example || ''}"</p>
                <p class="example-vi" style="font-size:10px;">"${item.example_vi || ''}"</p>
            </div>
            <div class="vocab-card-actions">
                <button class="btn-voice-small btn-speak" title="Phát âm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <button class="btn-card-delete btn-delete">Xóa bỏ</button>
            </div>
        `;

        // Event listener voice
        card.querySelector('.btn-speak').addEventListener('click', () => speakEnglish(item.word));
        // Event listener delete
        card.querySelector('.btn-delete').addEventListener('click', () => deleteWordFromWordbook(item.id));

        listContainer.appendChild(card);
    });
}

async function handleAddWordForm(e) {
    e.preventDefault();

    const wordVal = document.getElementById('form-word').value.trim();
    const typeVal = document.getElementById('form-type').value;
    const ipaVal = document.getElementById('form-ipa').value.trim();
    const meaningVal = document.getElementById('form-meaning').value.trim();
    const exEnVal = document.getElementById('form-example-en').value.trim();
    const exViVal = document.getElementById('form-example-vi').value.trim();

    if (!wordVal || !meaningVal) return;

    // Check duplicate
    const exists = state.customWords.some(w => w.word.toLowerCase() === wordVal.toLowerCase());
    if (exists) {
        alert('Từ này đã có trong Sổ tay của bạn.');
        return;
    }

    const newWord = {
        id: 'cust-' + Date.now(),
        word: wordVal,
        type: typeVal,
        ipa: ipaVal,
        meaning: meaningVal,
        example: exEnVal,
        example_vi: exViVal,
        category: 'custom',
        box: 1,
        nextReview: 0 // review immediately
    };

    state.customWords.push(newWord);
    await saveCustomWordsToStorage();
    awardStars(5, `Thêm từ mới "${wordVal}" vào Sổ tay`);

    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        window.FirebaseSync.saveCustomWord(newWord);
    }

    // Reset Form
    document.getElementById('add-word-form').reset();

    // Sync
    renderWordbook();
    renderDashboard();
    
    alert(`🎉 Đã thêm thành công từ "${wordVal}" vào Sổ tay của bạn!`);
}

async function deleteWordFromWordbook(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa từ này khỏi Sổ tay?')) return;

    state.customWords = state.customWords.filter(w => w.id !== id);
    await saveCustomWordsToStorage();

    // Sync to Firebase if in Cloud Mode
    if (isCloudMode && window.FirebaseSync) {
        window.FirebaseSync.deleteCustomWord(id);
    }

    // Sync
    renderWordbook();
    renderDashboard();
}

