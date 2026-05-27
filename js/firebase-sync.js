/* ==========================================================================
   LearningEnglish - Firebase Cloud Sync & Authentication Module
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
    limit,
    onSnapshot,
    where,
    deleteField,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getDatabase,
    ref as rtdbRef,
    set as rtdbSet,
    get as rtdbGet,
    child as rtdbChild
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- FIREBASE CONFIGURATION (CẤU HÌNH HỆ THỐNG) ---
// Bạn chỉ cần thay thế các chuỗi dưới đây bằng khóa thực tế lấy từ Firebase Console của bạn.
const firebaseConfig = {
  apiKey: "AIzaSyDr58jereWx6QVt6OXpD6RydU95T1xAaZ4",
  authDomain: "learningenglish-5b83c.firebaseapp.com",
  databaseURL: "https://learningenglish-5b83c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "learningenglish-5b83c",
  storageBucket: "learningenglish-5b83c.firebasestorage.app",
  messagingSenderId: "1034946550291",
  appId: "1:1034946550291:web:7d0230635c047ed1c17de6",
  measurementId: "G-0YSGPWF7VM"
};

// Check if user has set real Firebase credentials
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_PLACEHOLDER";

let app, auth, db, rtdb, googleProvider;
let currentUser = null;

if (isConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        rtdb = getDatabase(app);
        googleProvider = new GoogleAuthProvider();
        
        // Bật Offline Persistence cho Firestore
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
            } else if (err.code == 'unimplemented') {
                console.warn('The current browser does not support all of the features required to enable persistence');
            }
        });
        
        console.log("☁️ Firebase initialized in Cloud Sync mode with Offline Persistence.");
    } catch (error) {
        console.error("❌ Firebase failed to initialize:", error);
    }
} else {
    console.log("📂 Firebase running in Guest Mode (Offline localStorage fallback).");
}

// --- GLOBAL BRIDGE TO APP.JS ---
window.FirebaseSync = {
    isConfigured: isConfigured,
    db: db,
    getCurrentUser: () => currentUser,
    
    // Login with Google Popup
    login: async () => {
        if (!isConfigured) {
            console.warn("Firebase not configured. Redirecting to Guest session.");
            return null;
        }
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    },

    // Logout
    logout: async () => {
        if (!isConfigured) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign-Out Error:", error);
        }
    },

    // Auth state changed listener
    onStateChanged: (callback) => {
        if (!isConfigured) {
            // Instantly callback with null (Guest Mode)
            callback(null);
            return;
        }
        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            callback(user);
        });
    },

    // Save/Update progress of a built-in word in Firestore
    saveProgress: async (wordId, box, nextReview) => {
        if (!isConfigured || !currentUser) return;
        try {
            const progressRef = doc(db, "users", currentUser.uid, "progress", wordId);
            await setDoc(progressRef, {
                box: box,
                nextReview: nextReview,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (e) {
            console.error("Error saving progress to Firestore:", e);
        }
    },

    // Save custom added word in Firestore
    saveCustomWord: async (wordObj) => {
        if (!isConfigured || !currentUser) return;
        try {
            const wordRef = doc(db, "users", currentUser.uid, "customWords", wordObj.id);
            await setDoc(wordRef, {
                ...wordObj,
                updatedAt: Date.now()
            });
        } catch (e) {
            console.error("Error saving custom word to Firestore:", e);
        }
    },

    // Delete custom word from Firestore
    deleteCustomWord: async (wordId) => {
        if (!isConfigured || !currentUser) return;
        try {
            const wordRef = doc(db, "users", currentUser.uid, "customWords", wordId);
            await deleteDoc(wordRef);
        } catch (e) {
            console.error("Error deleting custom word from Firestore:", e);
        }
    },

    // Save user profile stats (Streak, LastStudyDate, QuizStats, UserLevel, RoadmapTasks, Stars, CustomPhotoURL, CustomDisplayName)
    saveStreak: async (streak, lastStudyDate, quizStats, userLevel = '', roadmapTasks = [], stars = 0, customPhotoURL = '', customDisplayName = '') => {
        if (!isConfigured || !currentUser) return;
        
        // 1. Save to private Firestore profile document
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, {
                name: customDisplayName || currentUser.displayName,
                email: currentUser.email,
                photoURL: customPhotoURL || currentUser.photoURL,
                streak: streak,
                lastStudyDate: lastStudyDate,
                quizStats: quizStats,
                userLevel: userLevel,
                roadmapTasks: roadmapTasks,
                stars: stars,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (e) {
            console.error("Error saving streak and roadmap statistics to Firestore:", e);
        }

        // 2. Also sync public leaderboard data to Realtime Database independently
        try {
            if (rtdb) {
                const leaderboardNodeRef = rtdbRef(rtdb, `leaderboard/${currentUser.uid}`);
                await rtdbSet(leaderboardNodeRef, {
                    name: customDisplayName || currentUser.displayName || '',
                    email: currentUser.email || '',
                    photoURL: customPhotoURL || currentUser.photoURL || '',
                    streak: streak,
                    stars: stars,
                    updatedAt: Date.now()
                });
                console.log("✅ Synced user stats to RTDB Leaderboard.");
            }
        } catch (e) {
            console.warn("RTDB leaderboard sync error:", e);
        }
    },

    // Ensure a minimal user profile exists in Realtime Database leaderboard node (called on every login)
    // Writes to /leaderboard/{uid} - public data readable by all authenticated users
    ensureUserProfile: async (stars = 0, streak = 0, customPhotoURL = '', customDisplayName = '') => {
        if (!isConfigured || !currentUser || !rtdb) return;
        try {
            const leaderboardNodeRef = rtdbRef(rtdb, `leaderboard/${currentUser.uid}`);
            const snapshot = await rtdbGet(leaderboardNodeRef);
            if (!snapshot.exists() || snapshot.val().stars === undefined) {
                await rtdbSet(leaderboardNodeRef, {
                    name: customDisplayName || currentUser.displayName || '',
                    email: currentUser.email || '',
                    photoURL: customPhotoURL || currentUser.photoURL || '',
                    streak: streak,
                    stars: stars,
                    updatedAt: Date.now()
                });
                console.log("✅ Ensured user profile exists in RTDB leaderboard with local stats.");
            }
        } catch (e) {
            console.error("Error ensuring user profile in RTDB leaderboard:", e);
        }
    },

    // Update leaderboard entry in Realtime Database (called when stats change)
    updateLeaderboardEntry: async (stars = 0, streak = 0, customPhotoURL = '', customDisplayName = '') => {
        if (!isConfigured || !currentUser || !rtdb) return;
        try {
            const leaderboardNodeRef = rtdbRef(rtdb, `leaderboard/${currentUser.uid}`);
            await rtdbSet(leaderboardNodeRef, {
                name: customDisplayName || currentUser.displayName || '',
                email: currentUser.email || '',
                photoURL: customPhotoURL || currentUser.photoURL || '',
                streak: streak,
                stars: stars,
                updatedAt: Date.now()
            });
        } catch (e) {
            console.error("Error updating RTDB leaderboard entry:", e);
        }
    },

    // Fetch global student leaderboard from Realtime Database (sorted by stars desc)
    loadLeaderboard: async () => {
        if (!isConfigured || !rtdb) return null;
        try {
            const leaderboardRef = rtdbRef(rtdb, 'leaderboard');
            const snapshot = await rtdbGet(leaderboardRef);
            if (!snapshot.exists()) return [];
            
            const data = snapshot.val();
            const leaderboard = Object.values(data);
            // Sort by stars descending, then by streak descending
            leaderboard.sort((a, b) => (b.stars || 0) - (a.stars || 0) || (b.streak || 0) - (a.streak || 0));
            return leaderboard.slice(0, 15);
        } catch (e) {
            console.error("Error loading leaderboard from RTDB:", e);
            return null;
        }
    },

    // Pull entire profile dataset from Firestore for the logged-in user
    loadUserData: async () => {
        if (!isConfigured || !currentUser) return null;
        try {
            const uid = currentUser.uid;
            
            // 1. Fetch profile document
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            let profileData = {};
            if (userSnap.exists()) {
                profileData = userSnap.data();
            }

            // 2. Fetch custom vocabulary
            const customWordsRef = collection(db, "users", uid, "customWords");
            const customSnap = await getDocs(customWordsRef);
            const customWords = [];
            customSnap.forEach(doc => {
                customWords.push(doc.data());
            });

            // 3. Fetch built-in word progress
            const progressRef = collection(db, "users", uid, "progress");
            const progressSnap = await getDocs(progressRef);
            const progressList = [];
            progressSnap.forEach(doc => {
                progressList.push({ id: doc.id, ...doc.data() });
            });

            return {
                profile: profileData,
                customWords: customWords,
                progress: progressList
            };
        } catch (e) {
            console.error("Error loading user profile dataset from Firestore:", e);
            return null;
        }
    },

    // --- ACADEMIC DATA FETCHING (PHÂN HỆ A) ---
    fetchAllAcademicVocabulary: async () => {
        if (!isConfigured) return [];
        try {
            const snap = await getDocs(collection(db, "academic_vocabulary"));
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (e) {
            console.error("Error fetching academic vocabulary:", e);
            return [];
        }
    },
    
    fetchAcademicGrammar: async () => {
        if (!isConfigured) return [];
        try {
            const snap = await getDocs(collection(db, "academic_grammar"));
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (e) {
            console.error("Error fetching grammar lessons:", e);
            return [];
        }
    },

    fetchAcademicStories: async () => {
        if (!isConfigured) return [];
        try {
            const snap = await getDocs(collection(db, "academic_stories"));
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (e) {
            console.error("Error fetching stories:", e);
            return [];
        }
    },

    fetchAcademicQuizzes: async () => {
        if (!isConfigured) return [];
        try {
            const snap = await getDocs(collection(db, "academic_quizzes"));
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (e) {
            console.error("Error fetching quizzes:", e);
            return [];
        }
    },

    fetchAcademicSentences: async () => {
        if (!isConfigured) return [];
        try {
            const snap = await getDocs(collection(db, "academic_sentences"));
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (e) {
            console.error("Error fetching sentences:", e);
            return [];
        }
    },
    
    fetchAcademicPodcasts: async () => {
        if (!isConfigured) return [];
        try {
            const snap = await getDocs(collection(db, "academic_podcasts"));
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (e) {
            console.error("Error fetching podcasts:", e);
            return [];
        }
    },

    // --- REAL-TIME MULTIPLAYER (ENGLISH CHALLENGE) ---
    // Create a new multiplayer room document
    createRoom: async (roomId, topic, questions, playerInfo) => {
        if (!isConfigured || !currentUser) return null;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const roomData = {
                id: roomId,
                topic: topic,
                questions: questions,
                status: "waiting",
                creatorId: playerInfo.uid,
                createdAt: Date.now(),
                players: {
                    [playerInfo.uid]: {
                        uid: playerInfo.uid,
                        name: playerInfo.name,
                        photoURL: playerInfo.photoURL,
                        isReady: true, // Host is ready by default
                        score: 0,
                        finished: false
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

    // Join an existing multiplayer room
    joinRoom: async (roomId, playerInfo) => {
        if (!isConfigured || !currentUser) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData[`players.${playerInfo.uid}`] = {
                uid: playerInfo.uid,
                name: playerInfo.name,
                photoURL: playerInfo.photoURL,
                isReady: false,
                score: 0,
                finished: false
            };
            await updateDoc(roomRef, updateData);
        } catch (e) {
            console.error("Error joining room:", e);
            throw e;
        }
    },

    // Update ready state of a player in a room
    updatePlayerReady: async (roomId, uid, isReady) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData[`players.${uid}.isReady`] = isReady;
            await updateDoc(roomRef, updateData);
        } catch (e) {
            console.error("Error updating ready state:", e);
        }
    },

    // Update real-time gameplay score and answer choices
    updatePlayerScore: async (roomId, uid, score, qIndex, selectedIndex, isCorrect) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData[`players.${uid}.score`] = score;
            updateData[`players.${uid}.answers.${qIndex}`] = {
                selectedIndex: selectedIndex,
                isCorrect: isCorrect
            };
            await updateDoc(roomRef, updateData);
        } catch (e) {
            console.error("Error updating player score:", e);
        }
    },

    // Mark player as finished
    updatePlayerFinished: async (roomId, uid) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            const updateData = {};
            updateData[`players.${uid}.finished`] = true;
            await updateDoc(roomRef, updateData);
        } catch (e) {
            console.error("Error setting player finished:", e);
        }
    },

    // Creator starts the multiplayer challenge
    startGame: async (roomId) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            await updateDoc(roomRef, {
                status: "playing",
                startedAt: Date.now()
            });
        } catch (e) {
            console.error("Error starting game:", e);
        }
    },

    // Leave multiplayer room
    leaveRoom: async (roomId, uid, isLast) => {
        if (!isConfigured) return;
        try {
            const roomRef = doc(db, "challenge_rooms", roomId);
            if (isLast) {
                await deleteDoc(roomRef);
            } else {
                const updateData = {};
                updateData[`players.${uid}`] = deleteField();
                await updateDoc(roomRef, updateData);
            }
        } catch (e) {
            console.error("Error leaving room:", e);
        }
    },

    // Listen to real-time changes in a single active room
    listenRoom: (roomId, callback) => {
        if (!isConfigured) return () => {};
        const roomRef = doc(db, "challenge_rooms", roomId);
        return onSnapshot(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data());
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Error listening to room:", error);
            // Only show alert for permission issues, but do NOT call callback(null)
            // because that would falsely trigger "room dissolved" and kick user back to lobby
            if (error.code === 'permission-denied') {
                alert("⚠️ Lỗi kết nối Firestore!\n\nCloud Firestore API có thể chưa được bật. Vui lòng:\n1. Truy cập: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=learningenglish-5b83c\n2. Bật API\n3. Kiểm tra Firestore Security Rules");
            }
        });
    },

    // Listen to all active waiting rooms for lobby room listing
    listenRoomsList: (callback) => {
        if (!isConfigured) return () => {};
        const roomsRef = collection(db, "challenge_rooms");
        const q = query(
            roomsRef,
            where("status", "==", "waiting")
        );
        return onSnapshot(q, (snapshot) => {
            const rooms = [];
            snapshot.forEach((doc) => {
                rooms.push(doc.data());
            });
            // Sort by createdAt descending in-memory to bypass the requirement of a composite index
            rooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(rooms);
        }, (error) => {
            console.error("Error listening to rooms list:", error);
            if (error.code === 'permission-denied') {
                alert("⚠️ Lỗi quyền truy cập Firestore!\n\nKhông thể tải danh sách phòng. Vui lòng kiểm tra Firestore Security Rules.");
            }
            callback([]);
        });
    }
};

// Dispatch ready event to notify app.js that FirebaseSync module is fully loaded
window.dispatchEvent(new CustomEvent('FirebaseSyncReady'));

