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
const DB_VERSION = 3; // Nâng version để reset DB cũ và thêm cached_words
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

            // Bảng lưu dữ liệu chi tiết của từng từ (On-demand cache)
            if (!db.objectStoreNames.contains('cached_words')) {
                db.createObjectStore('cached_words', { keyPath: 'id' });
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

    // 1. Lấy dữ liệu siêu tốc từ bộ nhớ đệm cục bộ (Cache Offline-First) cho Index
    let baseVocab = await getLocalCache('cached_academic_vocab_index');

    // 2. Nếu Cache rỗng, nạp từ biến toàn cục window.ACADEMIC_INDEX (đã tải ở state.js)
    if ((!baseVocab || baseVocab.length === 0) && window.ACADEMIC_INDEX && window.ACADEMIC_INDEX.vocabulary) {
        baseVocab = window.ACADEMIC_INDEX.vocabulary;
        if (baseVocab.length > 0) {
            await setLocalCache('cached_academic_vocab_index', baseVocab);
        }
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

/**
 * Lấy chi tiết đầy đủ của một từ vựng theo ID (On-demand Cache-first)
 */
async function getFullWordData(id) {
    await initDB();
    
    // 1. Kiểm tra trong cache IndexedDB cục bộ trước
    const cached = await new Promise((resolve) => {
        const tx = dbInstance.transaction(['cached_words'], 'readonly');
        const store = tx.objectStore('cached_words');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    
    if (cached) {
        return cached;
    }
    
    // 2. Không có trong cache IndexedDB. Lấy payload.
    let payload = null;
    
    // Gọi Firestore nếu có cấu hình
    if (window.FirebaseSync && window.FirebaseSync.isConfigured) {
        try {
            payload = await window.FirebaseSync.fetchDocumentById("academic_vocabulary", id);
        } catch (e) {
            console.error("Lỗi fetch Firestore cho id:", id, e);
        }
    }
    
    // 3. Fallback: Đọc từ file JSON cục bộ (oxford_5000.json) nếu offline hoặc không có Firestore
    if (!payload) {
        try {
            if (!window.LOCAL_OXFORD_5000) {
                console.log("Đang nạp file oxford_5000.json dự phòng...");
                const response = await fetch('json/oxford_5000.json');
                window.LOCAL_OXFORD_5000 = await response.json();
            }
            if (window.LOCAL_OXFORD_5000) {
                payload = window.LOCAL_OXFORD_5000.find(w => w.id === id);
            }
        } catch (e) {
            console.error("Lỗi fetch JSON dự phòng cho id:", id, e);
        }
    }
    
    // 4. Lưu lại vào cache IndexedDB để lần sau không cần tải lại nữa
    if (payload) {
        try {
            await new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['cached_words'], 'readwrite');
                const store = tx.objectStore('cached_words');
                store.put(payload);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.warn("Không thể lưu cache IndexedDB cho từ:", id, e);
        }
    }
    
    return payload;
}

/**
 * Lấy chi tiết câu dịch ngắn (On-demand Cache-first)
 */
async function getTranslationPayload(id) {
    await initDB();
    
    const cached = await new Promise((resolve) => {
        const tx = dbInstance.transaction(['cached_words'], 'readonly');
        const store = tx.objectStore('cached_words');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    
    if (cached) {
        return cached;
    }
    
    let payload = null;
    
    // Gọi Firestore nếu có cấu hình
    if (window.FirebaseSync && window.FirebaseSync.isConfigured) {
        try {
            payload = await window.FirebaseSync.fetchDocumentById("academic_translation", id);
        } catch (e) {
            console.error("Firestore translation fetch error for id:", id, e);
        }
    }
    
    // Fallback cục bộ
    if (!payload) {
        try {
            if (!window.LOCAL_TRANSLATION) {
                console.log("Đang nạp file translation-data.json dự phòng...");
                const response = await fetch('json/translation-data.json');
                window.LOCAL_TRANSLATION = await response.json();
            }
            if (window.LOCAL_TRANSLATION) {
                payload = window.LOCAL_TRANSLATION.find(t => t.id === id);
            }
        } catch (e) {
            console.error("Local fallback translation fetch error for id:", id, e);
        }
    }
    
    // Cache IndexedDB
    if (payload) {
        try {
            await new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['cached_words'], 'readwrite');
                const store = tx.objectStore('cached_words');
                store.put(payload);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.warn("Failed to cache translation in IndexedDB:", e);
        }
    }
    
    return payload;
}

/**
 * Lấy chi tiết đoạn văn dịch dài (On-demand Cache-first)
 */
async function getLongTranslationPayload(id) {
    await initDB();
    
    const cached = await new Promise((resolve) => {
        const tx = dbInstance.transaction(['cached_words'], 'readonly');
        const store = tx.objectStore('cached_words');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    
    if (cached) {
        return cached;
    }
    
    let payload = null;
    
    // Gọi Firestore nếu có cấu hình
    if (window.FirebaseSync && window.FirebaseSync.isConfigured) {
        try {
            payload = await window.FirebaseSync.fetchDocumentById("academic_long_translation", id);
        } catch (e) {
            console.error("Firestore long translation fetch error for id:", id, e);
        }
    }
    
    // Fallback cục bộ
    if (!payload) {
        try {
            if (!window.LOCAL_LONG_TRANSLATION) {
                console.log("Đang nạp file long-translation-data.json dự phòng...");
                const response = await fetch('json/long-translation-data.json');
                window.LOCAL_LONG_TRANSLATION = await response.json();
            }
            if (window.LOCAL_LONG_TRANSLATION) {
                payload = window.LOCAL_LONG_TRANSLATION.find(lt => lt.id === id);
            }
        } catch (e) {
            console.error("Local fallback long translation fetch error for id:", id, e);
        }
    }
    
    // Cache IndexedDB
    if (payload) {
        try {
            await new Promise((resolve, reject) => {
                const tx = dbInstance.transaction(['cached_words'], 'readwrite');
                const store = tx.objectStore('cached_words');
                store.put(payload);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.warn("Failed to cache long translation in IndexedDB:", e);
        }
    }
    
    return payload;
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
    getVocabCount,
    getFullWordData,
    getTranslationPayload,
    getLongTranslationPayload
};
