/**
 * ==========================================================================
 * LearningEnglish - IndexedDB Storage Manager Module
 * ==========================================================================
 */

const DB_NAME = 'LearningEnglishDB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initialize IndexedDB Connection
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
            
            // 1. Store vocabulary
            if (!db.objectStoreNames.contains('vocabulary')) {
                const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
                vocabStore.createIndex('category', 'category', { unique: false });
                vocabStore.createIndex('box', 'box', { unique: false });
                vocabStore.createIndex('nextReview', 'nextReview', { unique: false });
                vocabStore.createIndex('word', 'word', { unique: false });
            }

            // 2. Store user progress/settings (key-value)
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress', { keyPath: 'key' });
            }
        };
    });
}

/**
 * Populate database with seed data if empty
 * Combines INITIAL_VOCABULARY and SPECIALIZED_VOCABULARY, deduplicates by word.toLowerCase()
 */
async function seedDatabase(initialVocab, specVocab) {
    const db = await initDB();
    
    // Check if vocabulary store is empty
    const currentCount = await getVocabCount();
    if (currentCount > 0) {
        // Database already initialized. Perform incremental syncing for any new seed words.
        console.log(`IndexedDB already has ${currentCount} words. Checking for updates...`);
        await syncNewSeedWords(initialVocab, specVocab);
        return;
    }

    console.log('Seeding IndexedDB for the first time...');
    
    const combined = [...initialVocab, ...specVocab];
    const uniqueMap = new Map();

    // Deduplicate by lowercase word, preferring fully populated objects
    combined.forEach(item => {
        if (!item || !item.word) return;
        const key = item.word.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        } else {
            // Keep the one with better specification (e.g. specialized category or details)
            const existing = uniqueMap.get(key);
            const isExistingSpecialized = existing.category.startsWith('spec-');
            const isNewSpecialized = item.category.startsWith('spec-');
            if (isNewSpecialized && !isExistingSpecialized) {
                uniqueMap.set(key, item);
            }
        }
    });

    const dedupedList = Array.from(uniqueMap.values());
    console.log(`Deduplication: Reduced ${combined.length} words to ${dedupedList.length} unique words.`);

    // Perform bulk insertion in a single transaction
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vocabulary'], 'readwrite');
        const store = transaction.objectStore('vocabulary');

        dedupedList.forEach(item => {
            // Clean up old numbers from words if any slipped in
            item.word = item.word.replace(/\s\d+$/, '');
            store.put(item);
        });

        transaction.oncomplete = () => {
            console.log('Successfully seeded database with', dedupedList.length, 'unique words!');
            resolve(dedupedList.length);
        };

        transaction.onerror = (e) => {
            console.error('Transaction error during seeding:', e.target.error);
            reject(e.target.error);
        };
    });
}

/**
 * Synchronize any newly added seed words from JS files without losing existing user progress
 */
async function syncNewSeedWords(initialVocab, specVocab) {
    const db = await initDB();
    const allWords = await getAllVocab();
    const existingWordSet = new Set(allWords.map(w => w.word.toLowerCase().trim()));
    
    const combined = [...initialVocab, ...specVocab];
    const newWords = [];

    combined.forEach(item => {
        if (!item || !item.word) return;
        const key = item.word.toLowerCase().trim();
        if (!existingWordSet.has(key)) {
            newWords.push(item);
            existingWordSet.add(key); // prevent duplicates within seed list
        }
    });

    if (newWords.length > 0) {
        console.log(`Sync: Found ${newWords.length} new words in seed files. Adding to database...`);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['vocabulary'], 'readwrite');
            const store = transaction.objectStore('vocabulary');
            newWords.forEach(item => {
                item.word = item.word.replace(/\s\d+$/, '');
                store.put(item);
            });
            transaction.oncomplete = () => {
                console.log(`Sync complete! Added ${newWords.length} new words.`);
                resolve();
            };
            transaction.onerror = (e) => {
                reject(e.target.error);
            };
        });
    } else {
        console.log('Sync: No new words found in seed files.');
    }
}

/**
 * Get count of vocabulary items
 */
async function getVocabCount() {
    const db = await initDB();
    return new Promise((resolve) => {
        const transaction = db.transaction(['vocabulary'], 'readonly');
        const store = transaction.objectStore('vocabulary');
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
    });
}

/**
 * Get all vocabulary items
 */
async function getAllVocab() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vocabulary'], 'readonly');
        const store = transaction.objectStore('vocabulary');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Update a single word (e.g., box state or review timestamp)
 */
async function updateVocabWord(wordObj) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vocabulary'], 'readwrite');
        const store = transaction.objectStore('vocabulary');
        const request = store.put(wordObj);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Bulk update vocabulary (useful for cloud sync or large updates)
 */
async function bulkUpdateVocab(wordList) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vocabulary'], 'readwrite');
        const store = transaction.objectStore('vocabulary');
        wordList.forEach(item => store.put(item));
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Progress & State Storage Helpers (Key-Value)
 */
async function getProgress(key, defaultValue = null) {
    const db = await initDB();
    return new Promise((resolve) => {
        const transaction = db.transaction(['progress'], 'readonly');
        const store = transaction.objectStore('progress');
        const request = store.get(key);
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.value);
            } else {
                resolve(defaultValue);
            }
        };
        request.onerror = () => resolve(defaultValue);
    });
}

async function setProgress(key, value) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['progress'], 'readwrite');
        const store = transaction.objectStore('progress');
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Migration Bridge: Moves data from LocalStorage to IndexedDB
 */
async function migrateFromLocalStorage() {
    console.log('Checking for old localStorage data to migrate...');
    const migrationKeys = [
        { lsKey: 'vocabflow_vocab', dbKey: 'vocabulary_data' },
        { lsKey: 'vocabflow_custom', dbKey: 'custom_words' },
        { lsKey: 'vocabflow_streak', dbKey: 'streak' },
        { lsKey: 'vocabflow_last_date', dbKey: 'last_study_date' },
        { lsKey: 'vocabflow_quiz_stats', dbKey: 'quiz_stats' },
        { lsKey: 'vocabflow_user_level', dbKey: 'user_level' },
        { lsKey: 'vocabflow_last_test_score', dbKey: 'last_test_score' },
        { lsKey: 'vocabflow_roadmap_tasks', dbKey: 'roadmap_tasks' },
        { lsKey: 'vocabflow_stars', dbKey: 'stars' },
        { lsKey: 'vocabflow_photo_url', dbKey: 'photo_url' },
        { lsKey: 'vocabflow_display_name', dbKey: 'display_name' },
        { lsKey: 'vocabflow_completed_lessons', dbKey: 'completed_lessons' },
        { lsKey: 'vocabflow_completed_sentences', dbKey: 'completed_sentences' },
        { lsKey: 'le_stories_done', dbKey: 'stories_done' }
    ];

    let migratedAny = false;

    // 1. Migrate small progress variables
    for (const key of migrationKeys) {
        const val = localStorage.getItem(key.lsKey);
        if (val !== null) {
            try {
                let parsedVal = val;
                // Parse numbers and JSON objects appropriately
                if (val.startsWith('{') || val.startsWith('[')) {
                    parsedVal = JSON.parse(val);
                } else if (/^\d+$/.test(val)) {
                    parsedVal = parseInt(val, 10);
                }
                
                if (key.lsKey !== 'vocabflow_vocab') {
                    await setProgress(key.dbKey, parsedVal);
                    migratedAny = true;
                    // Delete old key after migrating
                    localStorage.removeItem(key.lsKey);
                }
            } catch (e) {
                console.error(`Migration error for key ${key.lsKey}:`, e);
            }
        }
    }

    // 2. Migrate vocabulary review state ( Leitner Box, nextReview ) from localStorage if present
    const storedVocabRaw = localStorage.getItem('vocabflow_vocab');
    if (storedVocabRaw) {
        try {
            const storedVocab = JSON.parse(storedVocabRaw);
            if (Array.isArray(storedVocab) && storedVocab.length > 0) {
                console.log(`Migrating ${storedVocab.length} active word states from localStorage...`);
                const db = await initDB();
                
                // Get current seeded vocab to merge review status
                const currentVocab = await getAllVocab();
                const wordStateMap = new Map();
                storedVocab.forEach(w => {
                    if (w && w.word) {
                        wordStateMap.set(w.word.toLowerCase().trim(), { box: w.box, nextReview: w.nextReview });
                    }
                });

                // Update review statuses
                let updatedCount = 0;
                const transaction = db.transaction(['vocabulary'], 'readwrite');
                const store = transaction.objectStore('vocabulary');
                
                currentVocab.forEach(w => {
                    const key = w.word.toLowerCase().trim();
                    if (wordStateMap.has(key)) {
                        const state = wordStateMap.get(key);
                        w.box = state.box || 1;
                        w.nextReview = state.nextReview || 0;
                        w.word = w.word.replace(/\s\d+$/, '');
                        store.put(w);
                        updatedCount++;
                    }
                });

                transaction.oncomplete = () => {
                    console.log(`Successfully merged Leitner states for ${updatedCount} words from localStorage!`);
                    localStorage.removeItem('vocabflow_vocab');
                };
            }
        } catch (e) {
            console.error('Error migrating vocabulary states:', e);
        }
    }

    if (migratedAny) {
        console.log('Migration complete! All local storage items moved to IndexedDB.');
    }
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
