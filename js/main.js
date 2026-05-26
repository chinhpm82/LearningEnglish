// --- EVENT LISTENERS INITIALIZATION ---
function initApp() {
    // Load local state and render dashboard immediately on startup (Offline-First!)
    (async () => {
        try {
            await loadStateAsync();
            renderDashboard();

            // Setup Firebase Sync sequentially AFTER local DB load completes (No more race conditions!)
            if (window.FirebaseSync) {
                setupAuthAndSync();
            } else {
                window.addEventListener('FirebaseSyncReady', setupAuthAndSync);
            }

            // Safety timeout fallback (3 seconds) to ensure Guest Mode works if network is down or sync hangs
            setTimeout(() => {
                if (!isCloudMode && !window.hasBoundAuthListener) {
                    console.warn("⚠️ Firebase sync load timed out. Running in guest fallback.");
                    const authOverlay = document.getElementById('auth-overlay');
                    const guestBanner = document.getElementById('guest-mode-banner');
                    if (authSkip) {
                        if (authOverlay) authOverlay.classList.add('hidden');
                        if (guestBanner) guestBanner.classList.remove('hidden');
                    }
                }
            }, 3000);
        } catch (err) {
            console.error("Error loading initial local state:", err);
            
            // Fast failover to Firebase sync setup even if IndexedDB fails
            if (window.FirebaseSync) {
                setupAuthAndSync();
            } else {
                window.addEventListener('FirebaseSyncReady', setupAuthAndSync);
            }
        }
    })();

    // 0. Setup mobile navigation drawer triggers
    initMobileMenuListeners();

    // 1. Tab Routing Setup
    setUpTabNavigation();

    // 1b. Grammar UI Event Listeners Setup
    const grammarCatButtons = document.querySelectorAll('.grammar-cat-btn');
    grammarCatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            grammarCatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGrammarLessons(btn.getAttribute('data-cat'));
        });
    });

    document.getElementById('btn-start-grammar-practice').addEventListener('click', initGrammarPractice);
    document.getElementById('btn-grammar-next').addEventListener('click', nextGrammarPracticeQuestion);
    document.getElementById('btn-grammar-back-lesson').addEventListener('click', () => {
        if (currentGrammarLesson) {
            loadGrammarLesson(currentGrammarLesson.id);
        }
    });

    // 2. Bind Auth UI buttons
    document.getElementById('btn-google-login').addEventListener('click', handleGoogleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleGoogleLogout);
    document.getElementById('btn-auth-skip').addEventListener('click', skipAuthOverlay);
    document.getElementById('btn-trigger-login').addEventListener('click', showAuthOverlay);

    // CEFR Entrance Placement Test Event Listeners
    const btnStartPlacement = document.getElementById('btn-start-placement');
    const btnSkipPlacement = document.getElementById('btn-skip-placement');
    const btnEnterRoadmap = document.getElementById('btn-enter-roadmap');

    if (btnStartPlacement) btnStartPlacement.addEventListener('click', startPlacementTestQuiz);
    if (btnSkipPlacement) btnSkipPlacement.addEventListener('click', skipPlacementTestQuiz);
    if (btnEnterRoadmap) btnEnterRoadmap.addEventListener('click', closePlacementTestModal);

    // 3. Setup Firebase Auth & Data Sync Listener
    function setupAuthAndSync() {
        if (!window.FirebaseSync) return;
        
        // Prevent double binding
        if (window.hasBoundAuthListener) return;
        window.hasBoundAuthListener = true;
        
        console.log("🔥 FirebaseSync loaded, setting up Auth state listener...");
        
        window.FirebaseSync.onStateChanged(async (user) => {
            const authOverlay = document.getElementById('auth-overlay');
            const profileCard = document.getElementById('user-profile-card');
            const guestBanner = document.getElementById('guest-mode-banner');

            if (user) {
                // Cloud Mode Activated!
                isCloudMode = true;
                if (authOverlay) authOverlay.classList.add('hidden');
                if (profileCard) {
                    profileCard.classList.remove('hidden');
                    profileCard.style.cursor = 'pointer';
                }
                if (guestBanner) guestBanner.classList.add('hidden');

                // Save email, display name and Google Photo to state
                state.currentUserEmail = user.email || '';
                state.displayName = state.displayName || user.displayName || '';
                state.googlePhotoURL = user.photoURL || '';

                // Render User Profile Card
                renderUserAvatar(state.photoURL || user.photoURL);
                const userNameEl = document.getElementById('user-display-name');
                if (userNameEl) userNameEl.textContent = state.displayName || 'Học viên';

                // Allow edit pointer and show edit badge
                const avatarBtn = document.getElementById('btn-open-avatar-modal');
                if (avatarBtn) avatarBtn.style.cursor = 'pointer';
                const editOverlay = document.querySelector('.avatar-edit-overlay');
                if (editOverlay) editOverlay.style.display = 'flex';

                // Reset logout button text to "Đăng xuất" (may have been changed to "Đăng nhập" during guest mode)
                const logoutBtnLogin = document.getElementById('btn-logout');
                if (logoutBtnLogin) {
                    logoutBtnLogin.textContent = 'Đăng xuất';
                    logoutBtnLogin.title = 'Đăng xuất tài khoản Google';
                }

                // Render local dashboard immediately to prevent "loading user data forever" visual hang
                renderDashboard();

                // Ensure user has a Firestore document with at least stars field (for leaderboard visibility)
                window.FirebaseSync.ensureUserProfile(state.stars, state.streak, state.photoURL, state.displayName);

                console.log("☁️ Syncing database progress with Firebase...");
                
                try {
                    // 5-second timeout promise for cloud loading
                    const timeout = (ms) => new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Timeout")), ms)
                    );
                    
                    const cloudData = await Promise.race([
                        window.FirebaseSync.loadUserData(),
                        timeout(5000)
                    ]);

                    if (cloudData) {
                        // Update local state with cloud data
                        if (cloudData.profile) {
                            // SELF-HEALING / RACE CONDITION PREVENTION:
                            // Only pull streak and stars from cloud if the cloud has a strictly superior value.
                            // If local state is more advanced (e.g. they just studied and incremented streak/stars),
                            // we keep our local values and sync it back up.
                            const cloudStreak = cloudData.profile.streak || 0;
                            const cloudStars = cloudData.profile.stars || 0;
                            let needPushBack = false;

                            if (cloudStreak > state.streak) {
                                state.streak = cloudStreak;
                                state.lastStudyDate = cloudData.profile.lastStudyDate || '';
                            } else if (state.streak > cloudStreak) {
                                needPushBack = true;
                            }

                            if (cloudStars > state.stars) {
                                state.stars = cloudStars;
                            } else if (state.stars > cloudStars) {
                                needPushBack = true;
                            }

                            if (!state.lastStudyDate) {
                                state.lastStudyDate = cloudData.profile.lastStudyDate || '';
                            }

                            state.quizStats = cloudData.profile.quizStats || { totalAnswered: 0, correctAnswers: 0 };
                            state.userLevel = cloudData.profile.userLevel || '';
                            state.roadmapTasks = cloudData.profile.roadmapTasks || [];
                            if (!state.roadmapTasks || state.roadmapTasks.length < 3) {
                                state.roadmapTasks = generateRoadmapTasks(state.userLevel || 'A1');
                            }
                            state.photoURL = cloudData.profile.photoURL || '';
                            state.displayName = cloudData.profile.name || state.displayName || user.displayName || '';
                            renderUserAvatar(state.photoURL || user.photoURL);
                            const userNameEl2 = document.getElementById('user-display-name');
                            if (userNameEl2) userNameEl2.textContent = state.displayName || 'Học viên';
                            updateSidebarStreakUI();

                            if (needPushBack) {
                                console.log("🔄 Race Condition Resolved: Local state is superior. Syncing local progress up to cloud...");
                                window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL, state.displayName);
                            }
                        }
                        if (cloudData.customWords) {
                            state.customWords = cloudData.customWords;
                        }
                        if (cloudData.progress && cloudData.progress.length > 0) {
                            // Merge box progress back into default vocabulary list
                            cloudData.progress.forEach(progress => {
                                const idx = state.vocabulary.findIndex(w => w.id === progress.id);
                                if (idx !== -1) {
                                    state.vocabulary[idx].box = progress.box;
                                    state.vocabulary[idx].nextReview = progress.nextReview;
                                }
                            });
                        }

                        // Sync local backup
                        await saveVocabToStorage();
                        await saveCustomWordsToStorage();
                        await saveStatsToStorage();
                    } else {
                        // Brand new Firebase user, write current state (initial deck) up to cloud
                        await syncCurrentStateToCloud();
                    }
                } catch (error) {
                    console.warn("⚠️ Firebase sync delayed or timed out. Operating in offline-fallback mode.", error);
                    showToastNotification("⚠️ Kết nối mạng không ổn định. Đang tải dữ liệu từ bộ nhớ cục bộ!");
                }

                // Re-render views with up-to-date user specific data
                renderDashboard();
            } else {
                // Not authenticated (either Firebase is not configured, or user signed out, or skipped)
                isCloudMode = false;
                if (profileCard) {
                    profileCard.classList.remove('hidden');
                    profileCard.style.cursor = 'default';
                }

                // Cleanse Cached Profile Details on Logout
                state.displayName = "";
                state.photoURL = "";
                state.googlePhotoURL = "";
                state.currentUserEmail = "";

                // Clear in storage
                await LearningDB.setProgress('display_name', '');
                await LearningDB.setProgress('photo_url', '');
                await LearningDB.setProgress('google_photo_url', '');
                await LearningDB.setProgress('user_email', '');
                localStorage.removeItem('vocabflow_display_name');
                localStorage.removeItem('vocabflow_photo_url');

                // Render Guest profile values (force default guest avatar and name)
                renderUserAvatar('emoji:🦊');
                const userNameEl = document.getElementById('user-display-name');
                if (userNameEl) userNameEl.textContent = 'Học viên (Khách)';

                // Disable edit pointer and hide edit badge
                const avatarBtn = document.getElementById('btn-open-avatar-modal');
                if (avatarBtn) avatarBtn.style.cursor = 'default';
                const editOverlay = document.querySelector('.avatar-edit-overlay');
                if (editOverlay) editOverlay.style.display = 'none';

                const logoutBtn = document.getElementById('btn-logout');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Đăng nhập';
                    logoutBtn.title = 'Đăng nhập tài khoản Google';
                }

                // Hide avatar modal if open
                const avatarModal = document.getElementById('avatar-modal');
                if (avatarModal) avatarModal.classList.add('hidden');

                if (window.FirebaseSync.isConfigured) {
                    // Firebase is configured, but no user is signed in
                    if (authSkip) {
                        // User clicked skip, let them work in Guest mode
                        if (authOverlay) authOverlay.classList.add('hidden');
                        if (guestBanner) guestBanner.classList.remove('hidden');
                    } else {
                        // Force login overlay
                        if (authOverlay) authOverlay.classList.remove('hidden');
                        if (guestBanner) guestBanner.classList.add('hidden');
                    }
                } else {
                    // Firebase is not configured at all (default app out of the box)
                    if (authOverlay) authOverlay.classList.add('hidden');
                    if (guestBanner) guestBanner.classList.remove('hidden');
                    const bannerText = guestBanner ? guestBanner.querySelector('.banner-text') : null;
                    if (bannerText) bannerText.textContent = 'Chế độ Khách (Offline)';
                }

                // Re-render dashboard for Guest
                renderDashboard();
            }
        });
    }



    // 4. Wordbook Submit Action
    document.getElementById('add-word-form').addEventListener('submit', handleAddWordForm);

    // Avatar Selector Dialog bindings — bind on the entire profile card for larger clickable area
    const profileCardClickable = document.getElementById('user-profile-card');
    if (profileCardClickable) {
        profileCardClickable.addEventListener('click', (e) => {
            // Ignore clicks on the logout button itself (let its own handler run)
            if (e.target.closest('#btn-logout')) {
                return;
            }
            e.stopPropagation();
            if (!isCloudMode || !state.currentUserEmail) {
                alert("Vui lòng đăng nhập bằng Google để đổi tên và ảnh đại diện!");
                return;
            }
            document.getElementById('avatar-modal').classList.remove('hidden');
            const nameInput = document.getElementById('input-profile-name');
            if (nameInput) {
                nameInput.value = state.displayName || '';
            }
            
            // Dynamically show/hide Google avatar sync button based on cloud status
            const googleBtn = document.getElementById('btn-avatar-use-google');
            if (googleBtn) {
                googleBtn.style.display = isCloudMode ? 'block' : 'none';
            }
            
            renderAvatarModalChoices();
        });
    }
    
    const avatarCancelBtn = document.getElementById('btn-avatar-cancel');
    if (avatarCancelBtn) {
        avatarCancelBtn.addEventListener('click', () => {
            document.getElementById('avatar-modal').classList.add('hidden');
        });
    }

    const avatarSaveBtn = document.getElementById('btn-avatar-save');
    if (avatarSaveBtn) {
        avatarSaveBtn.addEventListener('click', async () => {
            const nameInput = document.getElementById('input-profile-name');
            const newName = nameInput ? nameInput.value.trim() : '';
            if (newName) {
                state.displayName = newName;
                document.getElementById('user-display-name').textContent = newName;
            }
            
            if (typeof tempSelectedAvatar !== 'undefined' && tempSelectedAvatar) {
                state.photoURL = tempSelectedAvatar;
                renderUserAvatar(tempSelectedAvatar);
            }
            
            // Save locally & Sync to Firebase Firestore
            await saveStatsToStorage();
            
            document.getElementById('avatar-modal').classList.add('hidden');
            showToastNotification("👤 Đã cập nhật hồ sơ cá nhân thành công!");
            await awardStars(5, "Cập nhật hồ sơ cá nhân");
        });
    }
    
    const avatarGoogleBtn = document.getElementById('btn-avatar-use-google');
    if (avatarGoogleBtn) {
        avatarGoogleBtn.addEventListener('click', async () => {
            state.photoURL = '';
            renderUserAvatar(state.googlePhotoURL);
            await saveStatsToStorage();
            document.getElementById('avatar-modal').classList.add('hidden');
            await awardStars(2, "Đồng bộ lại ảnh đại diện Google");
        });
    }

    // 5. Wordbook Search Filter
    document.getElementById('search-wordbook').addEventListener('input', (e) => {
        renderWordbook(e.target.value);
    });

    // 6. Flashcards Interactions
    const flashcardEl = document.getElementById('flashcard-element');
    flashcardEl.addEventListener('click', toggleCardFlip);

    document.getElementById('btn-card-flip').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCardFlip();
    });

    document.getElementById('card-speak-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (flashcardDeck.length > 0) {
            speakEnglish(flashcardDeck[currentCardIndex].word);
        }
    });

    document.getElementById('btn-card-correct').addEventListener('click', (e) => {
        e.stopPropagation();
        handleFlashcardAction(true);
    });

    document.getElementById('btn-card-incorrect').addEventListener('click', (e) => {
        e.stopPropagation();
        handleFlashcardAction(false);
    });

    // Previous and Next Navigation Buttons
    const cardPrevBtn = document.getElementById('btn-card-prev');
    if (cardPrevBtn) {
        cardPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentCardIndex > 0) {
                currentCardIndex--;
                renderFlashcard();
            }
        });
    }

    const cardNextBtn = document.getElementById('btn-card-next');
    if (cardNextBtn) {
        cardNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentCardIndex < flashcardDeck.length - 1) {
                currentCardIndex++;
                renderFlashcard();
            }
        });
    }

    document.getElementById('flashcard-category').addEventListener('change', (e) => {
        initFlashcardSession(e.target.value);
    });

    // Keyboard Shortcuts for Flashcards
    document.addEventListener('keydown', (e) => {
        // Only run shortcuts if Flashcard tab is active and not writing in inputs
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'flashcard-tab' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                toggleCardFlip();
            } else if (e.key === 'ArrowLeft') {
                handleFlashcardAction(false);
            } else if (e.key === 'ArrowRight') {
                handleFlashcardAction(true);
            } else if (e.key === 'Enter' || e.key.toLowerCase() === 'v') {
                if (flashcardDeck.length > 0) {
                    speakEnglish(flashcardDeck[currentCardIndex].word);
                }
            }
        }
    });

    // 7. Quiz Interactions
    document.getElementById('btn-start-quiz').addEventListener('click', () => {
        const cat = document.getElementById('quiz-category-select').value;
        if (cat === 'assessment') {
            const modal = document.getElementById('placement-test-modal');
            if (modal) {
                modal.classList.remove('hidden');
                document.getElementById('placement-intro-screen').classList.remove('hidden');
                document.getElementById('placement-quiz-screen').classList.add('hidden');
                document.getElementById('placement-result-screen').classList.add('hidden');
            }
        } else {
            initQuizSession(cat);
        }
    });

    document.getElementById('btn-quiz-next').addEventListener('click', handleQuizNext);
    
    document.getElementById('btn-quiz-restart').addEventListener('click', () => {
        const cat = document.getElementById('quiz-category-select').value;
        initQuizSession(cat);
    });

    document.getElementById('btn-quiz-go-dashboard').addEventListener('click', () => {
        document.getElementById('btn-dashboard').click();
    });

    // 8. Sentence category filtering
    document.getElementById('sentence-category-filter').addEventListener('change', (e) => {
        renderSentences(e.target.value);
    });

    // Asynchronously load SpeechSynthesis voices list
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            renderWordOfTheDay();
        };
    }

    // Refresh WOTD event listener
    const refreshWotdBtn = document.getElementById('wotd-refresh-btn');
    if (refreshWotdBtn) {
        refreshWotdBtn.addEventListener('click', () => {
            renderWordOfTheDay(true);
        });
    }
}

// Firebase Auth Actions
async function handleGoogleLogin() {
    try {
        await window.FirebaseSync.login();
    } catch (error) {
        alert('Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng và thử lại!');
    }
}

async function handleGoogleLogout(e) {
    if (e) e.stopPropagation();
    if (!isCloudMode) {
        showAuthOverlay();
        return;
    }
    if (confirm('Bạn có chắc chắn muốn đăng xuất? Dữ liệu của bạn đã được lưu an toàn trên Cloud.')) {
        authSkip = false;
        await window.FirebaseSync.logout();
    }
}

async function skipAuthOverlay() {
    authSkip = true;
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('guest-mode-banner').classList.remove('hidden');
    await loadStateAsync();
    renderDashboard();
}

function showAuthOverlay() {
    authSkip = false;
    document.getElementById('auth-overlay').classList.remove('hidden');
    document.getElementById('guest-mode-banner').classList.add('hidden');
}

// Push all local state up to newly created Firebase profile
async function syncCurrentStateToCloud() {
    if (!window.FirebaseSync || !isCloudMode) return;
    
    // Save streak stats
    await window.FirebaseSync.saveStreak(state.streak, state.lastStudyDate, state.quizStats, state.userLevel, state.roadmapTasks, state.stars, state.photoURL, state.displayName);
    
    // Save custom words
    for (const word of state.customWords) {
        await window.FirebaseSync.saveCustomWord(word);
    }
    
    // Save progress of vocabulary words that are active (box > 1 or reviewed)
    const activeWords = state.vocabulary.filter(w => w.box > 1 || w.nextReview > 0);
    for (const word of activeWords) {
        await window.FirebaseSync.saveProgress(word.id, word.box, word.nextReview);
    }
    
    console.log("Current state successfully synced up to Cloud!");
}

// Start application when DOM loads & Register Service Worker
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Register PWA Service Worker for offline support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('LearningEnglish Service Worker registered successfully:', reg.scope);
                    
                    // Check if there is an update waiting
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        console.log('New content is available; auto-reloading page to apply...');
                                        window.location.reload();
                                    }
                                }
                            };
                        }
                    };
                })
                .catch(err => console.log('LearningEnglish Service Worker registration failed:', err));
        });
        
        // Reload page when new service worker takes over control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
});

