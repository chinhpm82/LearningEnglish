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
/**
 * Populate database with seed data if empty
 * Combines INITIAL_VOCABULARY, deduplicates by word.toLowerCase()
 * If database already exists, performs automated self-healing to clean duplicate words and numbers
 */
async function seedDatabase(initialVocab, specVocab = []) {
    const db = await initDB();
    
    // Check if vocabulary store is empty
    const currentCount = await getVocabCount();
    if (currentCount > 0) {
        console.log(`IndexedDB already has ${currentCount} words. Running Self-Healing & Sync...`);
        await selfHealAndSyncDatabase(initialVocab);
        return;
    }

    console.log('Seeding IndexedDB for the first time...');
    
    const uniqueMap = new Map();

    initialVocab.forEach(item => {
        if (!item || !item.word) return;
        const key = item.word.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        }
    });

    const dedupedList = Array.from(uniqueMap.values());
    console.log(`Deduplication: Reduced seed to ${dedupedList.length} unique words.`);

    // Perform bulk insertion in a single transaction
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vocabulary'], 'readwrite');
        const store = transaction.objectStore('vocabulary');

        dedupedList.forEach(item => {
            // Clean up old numbers from words if any slipped in
            item.word = cleanFieldName(item.word);
            item.ipa = cleanFieldName(item.ipa);
            item.example = cleanFieldName(item.example);
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
 * Clean field names from any digit suffix (e.g. "Notable90" -> "Notable", "/ˈnoʊtəbəl-90/" -> "/ˈnoʊtəbəl/")
 */
function cleanFieldName(val) {
    if (typeof val !== 'string') return val;
    let cleaned = val.replace(/[- ]?\d+$/, '');
    cleaned = cleaned.replace(/([a-zA-Z])\d+$/, '$1');
    return cleaned.strip ? cleaned.strip() : cleaned.trim();
}

/**
 * Automated Database Self-Healing: Reads the entire IndexedDB vocabulary,
 * cleans any word/ipa/example of numeric suffixes, deduplicates while preserving progress (Leitner Box),
 * and syncs any new words from the seed file.
 */
async function selfHealAndSyncDatabase(seedVocab) {
    const db = await initDB();
    const currentVocab = await getAllVocab();
    
    const uniqueMap = new Map();
    const idsToDelete = [];
    let modifiedCount = 0;

    currentVocab.forEach(item => {
        if (!item || !item.word) return;

        const origWord = item.word;
        const cleanWord = cleanFieldName(item.word);
        const cleanIpa = cleanFieldName(item.ipa);
        const cleanExample = cleanFieldName(item.example);

        if (origWord !== cleanWord || item.ipa !== cleanIpa || item.example !== cleanExample) {
            item.word = cleanWord;
            item.ipa = cleanIpa;
            item.example = cleanExample;
            modifiedCount++;
        }

        const key = cleanWord.toLowerCase().trim();

        if (uniqueMap.has(key)) {
            // Duplicate found! Merge progress
            const existing = uniqueMap.get(key);
            // Preserve the higher Box level or nextReview progress
            if ((item.box || 1) > (existing.box || 1)) {
                existing.box = item.box;
                existing.nextReview = item.nextReview;
            }
            // Mark duplicate item's ID for deletion
            idsToDelete.push(item.id);
        } else {
            uniqueMap.set(key, item);
        }
    });

    // Also check for any brand-new words in the seedVocab not present in uniqueMap
    let newWordsAdded = 0;
    seedVocab.forEach(seedItem => {
        if (!seedItem || !seedItem.word) return;
        const key = cleanFieldName(seedItem.word).toLowerCase().trim();
        if (!uniqueMap.has(key)) {
            seedItem.word = cleanFieldName(seedItem.word);
            seedItem.ipa = cleanFieldName(seedItem.ipa);
            seedItem.example = cleanFieldName(seedItem.example);
            uniqueMap.set(key, seedItem);
            newWordsAdded++;
        }
    });

    // Write all cleaned/new words and delete duplicates in a transaction
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vocabulary'], 'readwrite');
        const store = transaction.objectStore('vocabulary');

        // 1. Put all cleaned unique words
        uniqueMap.forEach(item => {
            store.put(item);
        });

        // 2. Delete all duplicates
        idsToDelete.forEach(id => {
            store.delete(id);
        });

        transaction.oncomplete = () => {
            console.log('IndexedDB Self-Healing Complete:');
            console.log(`- Cleansed fields in ${modifiedCount} words.`);
            printDeletedLogs(idsToDelete, newWordsAdded, uniqueMap.size);
            resolve();
        };

        transaction.onerror = (e) => {
            console.error('Self-healing transaction error:', e.target.error);
            reject(e.target.error);
        };
    });
}

function printDeletedLogs(idsToDelete, newWordsAdded, totalSize) {
    if (idsToDelete.length > 0) {
        console.log(`- Deleted ${idsToDelete.length} duplicate/redundant word entries.`);
    }
    if (newWordsAdded > 0) {
        console.log(`- Seeded ${newWordsAdded} new vocabulary words.`);
    }
    console.log(`- Database size is now locked at a clean ${totalSize} words.`);
}

async function syncNewSeedWords(initialVocab, specVocab = []) {
    // Handled dynamically inside selfHealAndSyncDatabase
    return;
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
