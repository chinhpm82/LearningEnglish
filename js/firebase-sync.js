/* ==========================================================================
   LearningEnglish - Firebase Auth + Backend API Bridge
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs, 
    deleteDoc, 
    updateDoc,
    query,
    orderBy,
    limit as fbLimit,
    onSnapshot,
    where,
    deleteField,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDr58jereWx6QVt6OXpD6RydU95T1xAaZ4",
  authDomain: "learningenglish-5b83c.firebaseapp.com",
  projectId: "learningenglish-5b83c",
  storageBucket: "learningenglish-5b83c.firebasestorage.app",
  messagingSenderId: "1034946550291",
  appId: "1:1034946550291:web:7d0230635c047ed1c17de6"
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_PLACEHOLDER";

let app, auth, db, googleProvider;
let currentUser = null;

if (isConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();

        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open, persistence limited.');
            }
        });

        console.log("Firebase initialized (Auth-only mode with Backend API).");
    } catch (error) {
        console.error("Firebase init failed:", error);
    }
} else {
    console.log("Firebase not configured. Guest mode only.");
}

window.FirebaseSync = {
    isConfigured: isConfigured,
    db: db,
    getCurrentUser: () => currentUser,

    login: async () => {
        if (!isConfigured) return null;
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            try {
                const apiResult = await window.ApiClient.login(idToken);
                console.log("Backend login OK. JWT stored.");
                return result.user;
            } catch (apiErr) {
                console.warn("Backend login failed, using Firebase-only:", apiErr);
                return result.user;
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    },

    logout: async () => {
        if (!isConfigured) return;
        try {
            await signOut(auth);
            window.ApiClient.clearToken();
        } catch (error) {
            console.error("Sign-Out Error:", error);
        }
    },

    onStateChanged: (callback) => {
        if (!isConfigured) {
            callback(null);
            return;
        }
        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    await window.ApiClient.login(idToken);
                } catch (e) {
                    console.warn("Auto-login to backend failed:", e);
                }
            }
            callback(user);
        });
    },

    saveProgress: async (wordId, box, nextReview) => {
        if (!currentUser) return;
        try {
            await window.ApiClient.saveProgress(wordId, box, nextReview);
        } catch (e) {
            console.error("Error saving progress to backend:", e);
        }
    },

    saveCustomWord: async (wordObj) => {
        if (!currentUser) return;
        try {
            await window.ApiClient.addCustomWord(wordObj);
        } catch (e) {
            console.error("Error saving custom word:", e);
        }
    },

    deleteCustomWord: async (wordId) => {
        if (!currentUser) return;
        try {
            await window.ApiClient.deleteCustomWord(wordId);
        } catch (e) {
            console.error("Error deleting custom word:", e);
        }
    },

    saveStreak: async (streak, lastStudyDate, quizStats, userLevel, roadmapTasks, stars, photoURL, displayName, activityLogs) => {
        if (!currentUser) return;
        try {
            await window.ApiClient.updateProfile({
                streak: streak,
                lastStudyDate: lastStudyDate,
                quizStats: quizStats,
                userLevel: userLevel,
                roadmapTasks: roadmapTasks,
                stars: stars,
                photoURL: photoURL,
                name: displayName,
                activityLogs: activityLogs
            });
        } catch (e) {
            console.error("Error saving profile:", e);
        }
    },

    ensureUserProfile: async (stars, streak, photoURL, displayName) => {
        if (!currentUser) return;
        try {
            await window.ApiClient.updateProfile({
                stars: stars || 0,
                streak: streak || 0,
                photoURL: photoURL || '',
                name: displayName || ''
            });
        } catch (e) {
            console.error("Error ensuring profile:", e);
        }
    },

    updateLeaderboardEntry: async (stars, streak, photoURL, displayName) => {
        if (!currentUser) return;
        try {
            await window.ApiClient.updateProfile({
                stars: stars || 0,
                streak: streak || 0,
                photoURL: photoURL || '',
                name: displayName || ''
            });
        } catch (e) {
            console.error("Error updating leaderboard entry:", e);
        }
    },

    loadLeaderboard: async () => {
        try {
            return await window.ApiClient.getLeaderboard();
        } catch (e) {
            console.error("Error loading leaderboard:", e);
            return [];
        }
    },

    loadUserData: async () => {
        if (!currentUser) return null;
        try {
            const [profileData, customWords, progressData] = await Promise.all([
                window.ApiClient.getProfile().catch(() => null),
                window.ApiClient.getCustomWords().catch(() => []),
                window.ApiClient.getProgress().catch(() => [])
            ]);

            return {
                profile: profileData || {},
                customWords: customWords || [],
                progress: progressData || []
            };
        } catch (e) {
            console.error("Error loading user data:", e);
            return null;
        }
    },

    fetchCategoryIndex: async (category) => {
        try {
            let result = [];
            if (category === 'translation') {
                const data = await window.ApiClient.getTranslations({ limit: 500 });
                result = (data.data || []).map(function(t) {
                    return { id: t.id, dir: t.dir, level: t.level, source: t.source, title: t.source ? t.source.substring(0, 50) : '' };
                });
            } else if (category === 'long_translation') {
                const data = await window.ApiClient.getLongTranslations({ limit: 500 });
                result = (data.data || []).map(function(t) {
                    return { id: t.id, dir: t.dir, level: t.level, source: t.source ? t.source.substring(0, 80) : '', title: t.source ? t.source.substring(0, 50) : '' };
                });
            }
            return result;
        } catch (e) {
            console.error("Error fetching category index:", category, e);
            return [];
        }
    },

    fetchDocumentById: async (collectionName, id) => {
        try {
            if (collectionName === 'academic_vocabulary') {
                return await window.ApiClient.getVocabById(id);
            } else if (collectionName === 'academic_translation') {
                return await window.ApiClient.getTranslationById(id);
            } else if (collectionName === 'academic_long_translation') {
                return await window.ApiClient.getLongTranslationById(id);
            }
            return null;
        } catch (e) {
            console.error("Error fetching doc:", collectionName, id, e);
            return null;
        }
    },

    fetchAcademicQuizzes: async () => {
        // Quiz questions now generated on-demand via POST /api/quiz/generate
        return [];
    },

    fetchQuizBatch: async (ids) => {
        // Quiz questions now generated on-demand via POST /api/quiz/generate
        return [];
    },

    fetchAcademicGrammar: async () => {
        try {
            const data = await window.ApiClient.getGrammar({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching grammar:", e);
            return [];
        }
    },

    fetchAcademicGrammarPractice: async () => {
        // Grammar practice now generated on-demand via POST /api/grammar-practice/generate
        return {};
    },

    fetchAcademicStories: async () => {
        try {
            const data = await window.ApiClient.getStories({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching stories:", e);
            return [];
        }
    },

    fetchAcademicSentences: async () => {
        try {
            const data = await window.ApiClient.getSentences({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching sentences:", e);
            return [];
        }
    },

    fetchAcademicPodcasts: async () => {
        try {
            const data = await window.ApiClient.getPodcasts({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching podcasts:", e);
            return [];
        }
    },

    fetchAcademicTranslation: async () => {
        try {
            const data = await window.ApiClient.getTranslations({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching translations:", e);
            return [];
        }
    },

    fetchAcademicLongTranslation: async () => {
        try {
            const data = await window.ApiClient.getLongTranslations({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching long translations:", e);
            return [];
        }
    },

    fetchAcademicWriting: async () => {
        try {
            const data = await window.ApiClient.getWriting({ limit: 500 });
            return data.data || [];
        } catch (e) {
            console.error("Error fetching writing topics:", e);
            return [];
        }
    },

    createRoom: async (roomId, topic, questions, playerInfo) => {
        if (!isConfigured || !currentUser) return null;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const roomData = {
                id: roomId, topic: topic, questions: questions,
                status: "waiting", creatorId: playerInfo.uid, createdAt: Date.now(),
                players: {
                    [playerInfo.uid]: {
                        uid: playerInfo.uid, name: playerInfo.name,
                        photoURL: playerInfo.photoURL, isReady: true, score: 0, finished: false
                    }
                }
            };
            await setDoc(roomRef, roomData);
            return roomData;
        } catch (e) {
            console.error("Error creating room:", e);
            throw e;
        }
    },

    joinRoom: async (roomId, playerInfo) => {
        if (!isConfigured || !currentUser) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData['players.' + playerInfo.uid] = {
                uid: playerInfo.uid, name: playerInfo.name,
                photoURL: playerInfo.photoURL, isReady: false, score: 0, finished: false
            };
            await updateDoc(roomRef, updateData);
        } catch (e) { throw e; }
    },

    updatePlayerReady: async (roomId, uid, isReady) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData['players.' + uid + '.isReady'] = isReady;
            await updateDoc(roomRef, updateData);
        } catch (e) {}
    },

    updatePlayerScore: async (roomId, uid, score, qIndex, selectedIndex, isCorrect) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData['players.' + uid + '.score'] = score;
            updateData['players.' + uid + '.answers.' + qIndex] = { selectedIndex: selectedIndex, isCorrect: isCorrect };
            await updateDoc(roomRef, updateData);
        } catch (e) {}
    },

    updatePlayerFinished: async (roomId, uid) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData['players.' + uid + '.finished'] = true;
            await updateDoc(roomRef, updateData);
        } catch (e) {}
    },

    startGame: async (roomId) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            await updateDoc(roomRef, { status: "playing", startedAt: Date.now() });
        } catch (e) {}
    },

    leaveRoom: async (roomId, uid, isLast) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            if (isLast) {
                await deleteDoc(roomRef);
            } else {
                const updateData = {};
                updateData['players.' + uid] = deleteField();
                await updateDoc(roomRef, updateData);
            }
        } catch (e) {}
    },

    listenRoom: (roomId, callback) => {
        if (!isConfigured) return function() {};
        const roomRef = doc(db, "challenge_rooms", roomId);
        return onSnapshot(roomRef, (snapshot) => {
            callback(snapshot.exists() ? snapshot.data() : null);
        }, (error) => {
            console.error("Error listening to room:", error);
        });
    },

    listenRoomsList: (callback) => {
        if (!isConfigured) return function() {};
        const roomsRef = collection(db, "challenge_rooms");
        const q = query(roomsRef, where("status", "==", "waiting"));
        return onSnapshot(q, (snapshot) => {
            const rooms = [];
            snapshot.forEach((d) => rooms.push(d.data()));
            rooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(rooms);
        }, (error) => {
            console.error("Error listening rooms:", error);
            callback([]);
        });
    }
};

window.dispatchEvent(new CustomEvent('FirebaseSyncReady'));
