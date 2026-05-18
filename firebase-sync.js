/* ==========================================================================
   VocabFlow - Firebase Cloud Sync & Authentication Module
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
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- FIREBASE CONFIGURATION (CẤU HÌNH HỆ THỐNG) ---
// Bạn chỉ cần thay thế các chuỗi dưới đây bằng khóa thực tế lấy từ Firebase Console của bạn.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_PLACEHOLDER",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if user has set real Firebase credentials
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_PLACEHOLDER" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app, auth, db, googleProvider;
let currentUser = null;

if (isConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        console.log("☁️ Firebase initialized in Cloud Sync mode.");
    } catch (error) {
        console.error("❌ Firebase failed to initialize:", error);
    }
} else {
    console.log("📂 Firebase running in Guest Mode (Offline localStorage fallback).");
}

// --- GLOBAL BRIDGE TO APP.JS ---
window.FirebaseSync = {
    isConfigured: isConfigured,
    
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

    // Save user profile stats (Streak, LastStudyDate, QuizStats)
    saveStreak: async (streak, lastStudyDate, quizStats) => {
        if (!isConfigured || !currentUser) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, {
                name: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                streak: streak,
                lastStudyDate: lastStudyDate,
                quizStats: quizStats,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (e) {
            console.error("Error saving streak statistics to Firestore:", e);
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
    }
};
