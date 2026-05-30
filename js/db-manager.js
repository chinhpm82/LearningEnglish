/**
 * ==========================================================================
 * LearningEnglish - Database Manager (Firestore + Local Progress Facade)
 * ==========================================================================
 * Vai trò mới:
 * 1. Lấy dữ liệu học thuật gốc (Academic Data) từ FirebaseSync (đã được cache offline bởi Firestore).
 * 2. Lấy dữ liệu Tiến độ (Progress) từ Cloud (nếu đăng nhập) hoặc Local IndexedDB (nếu là Guest).
 * 3. Trộn (Merge) 2 nguồn dữ liệu này và trả về cho app.js xử lý như cũ.
 */

const DB_NAME = 'LearningEnglish_ProgressDB';
const DB_VERSION = 2; // Nâng version để reset DB cũ
let dbInstance = null;

/**
 * Initialize IndexedDB Connection (Chỉ dùng cho Guest Mode Progress)
 */
function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB open error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Bảng lưu tiến độ từ vựng cục bộ cho Guest (chỉ lưu ID, box, nextReview)
            if (!db.objectStoreNames.contains('guest_vocab_progress')) {
                db.createObjectStore('guest_vocab_progress', { keyPath: 'id' });
            }

            // Bảng lưu settings cục bộ (key-value)
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress', { keyPath: 'key' });
            }
        };
    });
}

// Giữ nguyên hàm này để tránh lỗi app.js gọi đến
async function seedDatabase(initialVocab, specVocab = []) {
    console.log("seedDatabase bypass: Dữ liệu đã được đưa lên Firestore. Không cần seed Local.");
    return Promise.resolve(0);
}

async function getVocabCount() {
    const vocab = await getAllVocab();
    return vocab.length;
}

/**
 * Hàm lõi: Lấy toàn bộ từ vựng và mix với tiến độ học tập.
 */
async function getAllVocab() {
    await initDB();
    
    // Helper function to read from IndexedDB strictly offline
    const getLocalCache = async (key) => {
        return new Promise((resolve) => {
            const tx = dbInstance.transaction(['progress'], 'readonly');
            const req = tx.objectStore('progress').get(key);
            req.onsuccess = () => resolve(req.result ? req.result.value : []);
            req.onerror = () => resolve([]);
        });
    };

    const setLocalCache = async (key, value) => {
        return new Promise((resolve) => {
            const tx = dbInstance.transaction(['progress'], 'readwrite');
            const req = tx.objectStore('progress').put({ key, value });
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
        });
    };

    // 1. Lấy dữ liệu siêu tốc từ bộ nhớ đệm cục bộ (Cache Offline-First)
    let baseVocab = await getLocalCache('cached_academic_vocab');

    // 2. Nếu Cache rỗng (lần đầu vào web hoặc bị xóa Cache), buộc phải đợi tải từ Cloud (Timeout 5s)
    if (baseVocab.length === 0 && window.FirebaseSync) {
        try {
            const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
            // TẢI NHANH 50 TỪ ĐẦU TIÊN ĐỂ MỞ KHÓA UI
            baseVocab = await Promise.race([
                window.FirebaseSync.fetchAllAcademicVocabulary(50),
                timeout(5000)
            ]);
            
            // Giả lập tổng số từ vựng để UI hiển thị số lớn (Tránh người dùng nghĩ app chỉ có 50 từ)
            window.ACADEMIC_TOTAL = 5845;

            // Chạy ngầm tải toàn bộ số còn lại
            (async () => {
                try {
                    console.log("☁️ Bắt đầu tải ngầm toàn bộ từ vựng còn lại...");
                    const fullVocab = await window.FirebaseSync.fetchAllAcademicVocabulary(0);
                    if (fullVocab && fullVocab.length > 0) {
                        await setLocalCache('cached_academic_vocab', fullVocab);
                        console.log("☁️ Đã tải ngầm xong toàn bộ từ vựng!");
                        
                        // Cập nhật state và reload UI 
                        if (typeof state !== 'undefined' && state) {
                            state.vocabulary = await getAllVocab();
                            if (typeof renderDashboard === 'function') renderDashboard();
                            if (typeof initFlashcardSession === 'function') {
                                const cat = document.getElementById('flashcard-category');
                                if (cat) initFlashcardSession(cat.value);
                            }
                        }
                    }
                } catch (e) {
                    console.warn("⚠️ Tải ngầm thất bại.", e);
                }
            })();

        } catch (e) {
            console.warn("⚠️ Tải từ vựng lần đầu thất bại (Mạng yếu/Timeout).");
            baseVocab = [];
        }
    } else if (window.FirebaseSync) {
        // 3. Nếu đã có Cache, tải ngầm từ Cloud để cập nhật cho lần sau (Stale-While-Revalidate)
        (async () => {
            try {
                const freshVocab = await window.FirebaseSync.fetchAllAcademicVocabulary();
                if (freshVocab && freshVocab.length > 0 && freshVocab.length !== baseVocab.length) {
                    await setLocalCache('cached_academic_vocab', freshVocab);
                    console.log("☁️ Đã cập nhật kho từ vựng ngầm thành công.");
                }
            } catch (e) {
                // Lỗi ngầm thì kệ, đã có cache gánh
            }
        })();
    }

    // Nếu đã có Cache nhưng ít quá (đang trong quá trình tải ngầm chưa xong ở lần refresh trước)
    if (baseVocab.length > 0 && baseVocab.length < 500) {
        window.ACADEMIC_TOTAL = 5845;
    }

    // Clone dữ liệu để không làm biến đổi bộ gốc
    const vocabList = JSON.parse(JSON.stringify(baseVocab));
    const user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;

    if (user) {
        // --- CHẾ ĐỘ ĐĂNG NHẬP: Lấy tiến độ từ Firestore ---
        const cloudData = await window.FirebaseSync.loadUserData();
        if (cloudData) {
            // Mix tiến trình học
            const progressMap = new Map();
            cloudData.progress.forEach(p => progressMap.set(p.id, p));

            vocabList.forEach(w => {
                const id = String(w.id || w.word.toLowerCase());
                const wordKey = String(w.word || '').toLowerCase();
                
                let p = null;
                if (progressMap.has(id)) {
                    p = progressMap.get(id);
                } else if (wordKey && progressMap.has(wordKey)) {
                    p = progressMap.get(wordKey);
                }

                if (p) {
                    w.box = p.box || 1;
                    w.nextReview = p.nextReview || 0;
                } else {
                    w.box = 1;
                    w.nextReview = 0;
                }
            });

            // Mix custom words
            if (cloudData.customWords && cloudData.customWords.length > 0) {
                vocabList.push(...cloudData.customWords);
            }
        }
    } else {
        // --- CHẾ ĐỘ KHÁCH: Lấy tiến độ từ IndexedDB ---
        const guestProgress = await new Promise((resolve) => {
            const db = dbInstance;
            const tx = db.transaction(['guest_vocab_progress'], 'readonly');
            const store = tx.objectStore('guest_vocab_progress');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });

        const progressMap = new Map();
        guestProgress.forEach(p => progressMap.set(p.id, p));

        vocabList.forEach(w => {
            const id = String(w.id || w.word.toLowerCase());
            const wordKey = String(w.word || '').toLowerCase();
            
            let p = null;
            if (progressMap.has(id)) {
                p = progressMap.get(id);
            } else if (wordKey && progressMap.has(wordKey)) {
                p = progressMap.get(wordKey);
            }

            if (p) {
                w.box = p.box || 1;
                w.nextReview = p.nextReview || 0;
            } else {
                w.box = 1;
                w.nextReview = 0;
            }
        });
    }

    return vocabList;
}

/**
 * Cập nhật tiến độ của 1 từ vựng
 */
async function updateVocabWord(wordObj) {
    const id = String(wordObj.id || wordObj.word.toLowerCase());
    const box = wordObj.box || 1;
    const nextReview = wordObj.nextReview || 0;
    
    const user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;

    if (user) {
        // Đẩy lên Firestore
        // Phân biệt custom word hay academic word
        if (wordObj.isCustom) {
            await window.FirebaseSync.saveCustomWord(wordObj);
        } else {
            await window.FirebaseSync.saveProgress(id, box, nextReview);
        }
    } else {
        // Lưu vào Local IndexedDB cho Guest
        await initDB();
        return new Promise((resolve, reject) => {
            const tx = dbInstance.transaction(['guest_vocab_progress'], 'readwrite');
            const store = tx.objectStore('guest_vocab_progress');
            store.put({ id: id, box: box, nextReview: nextReview });
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }
}

/**
 * Bulk update
 */
async function bulkUpdateVocab(wordList) {
    for (const w of wordList) {
        await updateVocabWord(w);
    }
}

/**
 * Cập nhật key-value Progress (Streak, Level, v.v.)
 */
async function getProgress(key, defaultValue = null) {
    const user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;
    
    if (user) {
        const cloudData = await window.FirebaseSync.loadUserData();
        if (cloudData && cloudData.profile) {
            const keyMap = {
                'last_study_date': 'lastStudyDate',
                'quiz_stats': 'quizStats',
                'user_level': 'userLevel',
                'last_test_score': 'lastTestScore',
                'placement_stats': 'placementStats',
                'roadmap_tasks': 'roadmapTasks',
                'photo_url': 'photoURL',
                'display_name': 'name',
                'completed_lessons': 'completedLessons',
                'completed_sentences': 'completedSentences',
                'stories_done': 'storiesDone',
                'writing_high_scores': 'writingHighScores',
                'streak': 'streak',
                'stars': 'stars'
            };
            const mappedKey = keyMap[key] || key;
            if (cloudData.profile[mappedKey] !== undefined) {
                return cloudData.profile[mappedKey];
            }
        }
    }
    
    // Guest Mode
    await initDB();
    return new Promise((resolve) => {
        const transaction = dbInstance.transaction(['progress'], 'readonly');
        const store = transaction.objectStore('progress');
        const request = store.get(key);
        request.onsuccess = () => {
            if (request.result) resolve(request.result.value);
            else resolve(defaultValue);
        };
        request.onerror = () => resolve(defaultValue);
    });
}

async function setProgress(key, value) {
    const user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;

    if (user) {
        // Sync to cloud
        // Lưu ý: FirebaseSync.saveStreak() trong code cũ nhận nhiều tham số, ta giả lập gọi vào profile update.
        // Tạm thời FirebaseSync chưa có hàm update generic profile property, nên ta vẫn lưu local để fallback,
        // hoặc app.js sẽ gọi thẳng FirebaseSync.saveStreak.
    }

    // Luôn lưu local cache
    await initDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(['progress'], 'readwrite');
        const store = transaction.objectStore('progress');
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

async function migrateFromLocalStorage() {
    console.log("Bỏ qua migrateFromLocalStorage cũ.");
}

// Export functions to global scope for easy access in app.js
window.LearningDB = {
    initDB,
    seedDatabase,
    getAllVocab,
    updateVocabWord,
    bulkUpdateVocab,
    getProgress,
    setProgress,
    migrateFromLocalStorage,
    getVocabCount
};
