/**
 * ==========================================================================
 * LearningEnglish - Database Manager (Backend API + Local IndexedDB Facade)
 * ==========================================================================
 * 1. Academic data: Backend API (with local IndexedDB cache)
 * 2. User progress: Backend API (if logged in) or Local IndexedDB (if Guest)
 */

const DB_NAME = 'LearningEnglish_ProgressDB';
const DB_VERSION = 3;
let dbInstance = null;

function initDB() {
    return new Promise(function (resolve, reject) {
        if (dbInstance) { resolve(dbInstance); return; }
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = function (e) { reject(e.target.error); };
        request.onsuccess = function (e) { dbInstance = e.target.result; resolve(dbInstance); };
        request.onupgradeneeded = function (e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains('guest_vocab_progress')) {
                db.createObjectStore('guest_vocab_progress', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('cached_words')) {
                db.createObjectStore('cached_words', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('api_cache')) {
                db.createObjectStore('api_cache', { keyPath: 'key' });
            }
        };
    });
}

async function seedDatabase() {
    console.log("seedDatabase bypass: Data managed by backend API.");
    return 0;
}

async function getVocabCount() {
    var vocab = await getAllVocab();
    return vocab.length;
}

function setCache(key, value) {
    return new Promise(function (resolve) {
        if (!dbInstance) { resolve(); return; }
        try {
            var tx = dbInstance.transaction(['api_cache'], 'readwrite');
            tx.objectStore('api_cache').put({ key: key, value: value, ts: Date.now() });
            tx.oncomplete = function () { resolve(); };
            tx.onerror = function () { resolve(); };
        } catch (e) { resolve(); }
    });
}

function getCache(key, maxAge) {
    return new Promise(function (resolve) {
        if (!dbInstance) { resolve(null); return; }
        try {
            var tx = dbInstance.transaction(['api_cache'], 'readonly');
            var req = tx.objectStore('api_cache').get(key);
            req.onsuccess = function () {
                var r = req.result;
                if (r && (!maxAge || (Date.now() - r.ts) < maxAge)) {
                    resolve(r.value);
                } else {
                    resolve(null);
                }
            };
            req.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
    });
}

async function getAllVocab() {
    await initDB();
    var baseVocab = null;

    // Try backend API first
    if (window.ApiClient && window.ApiClient.isLoggedIn()) {
        try {
            var apiData = await window.ApiClient.getVocab({ limit: 5000 });
            baseVocab = apiData.data || [];
            await setCache('vocab_all', baseVocab);
        } catch (e) {
            console.warn("Backend vocab fetch failed, trying cache:", e);
        }
    }

    // Fallback to local cache
    if (!baseVocab) {
        baseVocab = await getCache('vocab_all', 3600000);
    }

    // Fallback to backend API
    if (!baseVocab || baseVocab.length === 0) {
        try {
            if (window.ApiClient) {
                var data = await window.ApiClient.getVocab({ limit: 5000 });
                baseVocab = data.data || [];
                await setCache('vocab_all', baseVocab);
            }
        } catch (e) {
            console.error("Failed to load vocabulary:", e);
            baseVocab = [];
        }
    }

    var vocabList = JSON.parse(JSON.stringify(baseVocab));
    var user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;

    if (user) {
        // Logged in: get progress from backend
        try {
            var progressData = await window.ApiClient.getProgress();
            var progressMap = new Map();
            progressData.forEach(function (p) {
                var id = p.vocabId || p.id;
                progressMap.set(String(id), p);
            });

            vocabList.forEach(function (w) {
                var id = String(w.id || w.word.toLowerCase());
                var wordKey = String(w.word || '').toLowerCase();
                var p = progressMap.get(id) || progressMap.get(wordKey);
                if (p) {
                    w.box = p.box || 1;
                    w.nextReview = typeof p.nextReview === 'number' ? p.nextReview : (p.nextReview ? new Date(p.nextReview).getTime() : 0);
                }
            });
        } catch (e) {
            console.warn("Backend progress fetch failed:", e);
        }

        // Custom words from backend
        try {
            var customWords = await window.ApiClient.getCustomWords();
            if (customWords && customWords.length > 0) {
                vocabList.push.apply(vocabList, customWords);
            }
        } catch (e) {
            console.warn("Backend custom words fetch failed:", e);
        }
    } else {
        // Guest: get progress from IndexedDB
        var guestProgress = await new Promise(function (resolve) {
            var tx = dbInstance.transaction(['guest_vocab_progress'], 'readonly');
            var req = tx.objectStore('guest_vocab_progress').getAll();
            req.onsuccess = function () { resolve(req.result || []); };
            req.onerror = function () { resolve([]); };
        });

        var progressMap = new Map();
        guestProgress.forEach(function (p) { progressMap.set(p.id, p); });

        vocabList.forEach(function (w) {
            var id = String(w.id || w.word.toLowerCase());
            var wordKey = String(w.word || '').toLowerCase();
            var p = progressMap.get(id) || progressMap.get(wordKey);
            if (p) {
                w.box = p.box || 1;
                w.nextReview = p.nextReview || 0;
            }
        });
    }

    return vocabList;
}

async function updateVocabWord(wordObj) {
    var id = String(wordObj.id || wordObj.word.toLowerCase());
    var box = wordObj.box || 1;
    var nextReview = wordObj.nextReview || 0;
    var user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;

    if (user) {
        if (wordObj.isCustom) {
            await window.FirebaseSync.saveCustomWord(wordObj);
        } else {
            await window.ApiClient.saveProgress(id, box, nextReview);
        }
    } else {
        await initDB();
        return new Promise(function (resolve, reject) {
            var tx = dbInstance.transaction(['guest_vocab_progress'], 'readwrite');
            tx.objectStore('guest_vocab_progress').put({ id: id, box: box, nextReview: nextReview });
            tx.oncomplete = function () { resolve(); };
            tx.onerror = function (e) { reject(e.target.error); };
        });
    }
}

async function bulkUpdateVocab(wordList) {
    for (var i = 0; i < wordList.length; i++) {
        await updateVocabWord(wordList[i]);
    }
}

async function getProgress(key, defaultValue) {
    if (defaultValue === undefined) defaultValue = null;
    var user = window.FirebaseSync ? window.FirebaseSync.getCurrentUser() : null;

    if (user) {
        try {
            var profileData = await window.ApiClient.getProfile();
            if (profileData) {
                var keyMap = {
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
                    'stars': 'stars',
                    'activity_logs': 'activityLogs',
                    'placement_dismissed': 'placementDismissed'
                };
                var mappedKey = keyMap[key] || key;
                if (profileData[mappedKey] !== undefined) {
                    return profileData[mappedKey];
                }
            }
        } catch (e) {
            console.warn("Backend profile fetch failed for key:", key, e);
        }
    }

    // Guest: IndexedDB
    await initDB();
    return new Promise(function (resolve) {
        var tx = dbInstance.transaction(['progress'], 'readonly');
        var req = tx.objectStore('progress').get(key);
        req.onsuccess = function () {
            resolve(req.result ? req.result.value : defaultValue);
        };
        req.onerror = function () { resolve(defaultValue); };
    });
}

async function setProgress(key, value) {
    // Always save locally as backup
    await initDB();
    return new Promise(function (resolve, reject) {
        var tx = dbInstance.transaction(['progress'], 'readwrite');
        tx.objectStore('progress').put({ key: key, value: value });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function (e) { reject(e.target.error); };
    });
}

async function migrateFromLocalStorage() {
    console.log("migrateFromLocalStorage: skipped.");
}

async function getFullWordData(id) {
    await initDB();

    // 1. Check local IndexedDB cache
    var cached = await new Promise(function (resolve) {
        var tx = dbInstance.transaction(['cached_words'], 'readonly');
        var req = tx.objectStore('cached_words').get(id);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
    });
    if (cached) return cached;

    // 2. Fetch from backend API
    var payload = null;
    if (window.ApiClient) {
        try {
            payload = await window.ApiClient.getVocabById(id);
        } catch (e) {}
    }

    // 3. Fallback to backend API
    if (!payload) {
        try {
            payload = await window.ApiClient.getOxfordById(id);
        } catch (e) {}
    }

    // 4. Cache in IndexedDB
    if (payload) {
        try {
            await new Promise(function (resolve) {
                var tx = dbInstance.transaction(['cached_words'], 'readwrite');
                tx.objectStore('cached_words').put(payload);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { resolve(); };
            });
        } catch (e) {}
    }

    return payload;
}

async function getTranslationPayload(id) {
    await initDB();

    var cached = await new Promise(function (resolve) {
        var tx = dbInstance.transaction(['cached_words'], 'readonly');
        var req = tx.objectStore('cached_words').get(id);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
    });
    if (cached) return cached;

    var payload = null;
    if (window.ApiClient) {
        try {
            payload = await window.ApiClient.getTranslationById(id);
        } catch (e) {}
    }

    if (!payload) {
        try {
            payload = await window.ApiClient.getTranslationById(id);
        } catch (e) {}
    }

    if (payload) {
        try {
            await new Promise(function (resolve) {
                var tx = dbInstance.transaction(['cached_words'], 'readwrite');
                tx.objectStore('cached_words').put(payload);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { resolve(); };
            });
        } catch (e) {}
    }

    return payload;
}

async function getLongTranslationPayload(id) {
    await initDB();

    var cached = await new Promise(function (resolve) {
        var tx = dbInstance.transaction(['cached_words'], 'readonly');
        var req = tx.objectStore('cached_words').get(id);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
    });
    if (cached) return cached;

    var payload = null;
    if (window.ApiClient) {
        try {
            payload = await window.ApiClient.getLongTranslationById(id);
        } catch (e) {}
    }

    if (!payload) {
        try {
            payload = await window.ApiClient.getLongTranslationById(id);
        } catch (e) {}
    }

    if (payload) {
        try {
            await new Promise(function (resolve) {
                var tx = dbInstance.transaction(['cached_words'], 'readwrite');
                tx.objectStore('cached_words').put(payload);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { resolve(); };
            });
        } catch (e) {}
    }

    return payload;
}

window.LearningDB = {
    initDB: initDB,
    seedDatabase: seedDatabase,
    getAllVocab: getAllVocab,
    updateVocabWord: updateVocabWord,
    bulkUpdateVocab: bulkUpdateVocab,
    getProgress: getProgress,
    setProgress: setProgress,
    migrateFromLocalStorage: migrateFromLocalStorage,
    getVocabCount: getVocabCount,
    getFullWordData: getFullWordData,
    getTranslationPayload: getTranslationPayload,
    getLongTranslationPayload: getLongTranslationPayload
};
