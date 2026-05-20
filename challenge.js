/* ==========================================================================
   LearningEnglish - EnglishChallenge Multiplayer Arena Logic
   ========================================================================== */

(function () {
    // Challenge-specific local states
    let activeRoomId = null;
    let roomsListUnsubscribe = null;
    let activeRoomUnsubscribe = null;
    let currentQuestionIndex = 0;
    let localScore = 0;
    let timerInterval = null;
    let roomCountdownInterval = null;
    let questions = [];
    let countdownActive = false;
    let currentRoomCountdownVal = 5;

    // --- DOM EVENT LISTENERS ON START ---
    document.addEventListener("DOMContentLoaded", () => {
        initChallengeHooks();
    });

    // Setup hooks for tab navigation and login sequences
    function initChallengeHooks() {
        // Tab Nav click interception
        const btnChallenge = document.getElementById("btn-challenge");
        if (btnChallenge) {
            btnChallenge.addEventListener("click", () => {
                initChallengeTab();
            });
        }

        // Guest Screen Login Trigger
        const btnChallengeLogin = document.getElementById("btn-challenge-login");
        if (btnChallengeLogin) {
            btnChallengeLogin.addEventListener("click", async () => {
                if (window.FirebaseSync) {
                    try {
                        btnChallengeLogin.textContent = "🔄 Đang đăng nhập...";
                        await window.FirebaseSync.login();
                    } catch (e) {
                        alert("Đăng nhập thất bại. Vui lòng thử lại!");
                        btnChallengeLogin.textContent = "Đăng nhập bằng Google để chơi";
                    }
                }
            });
        }

        // Room Creation Modal Triggers
        const btnLobbyCreateTrigger = document.getElementById("btn-lobby-create-trigger");
        const createRoomModal = document.getElementById("create-room-modal");
        const btnCreateRoomCancel = document.getElementById("btn-create-room-cancel");
        const btnCreateRoomConfirm = document.getElementById("btn-create-room-confirm");

        if (btnLobbyCreateTrigger) {
            btnLobbyCreateTrigger.addEventListener("click", () => {
                createRoomModal.classList.remove("hidden");
            });
        }

        if (btnCreateRoomCancel) {
            btnCreateRoomCancel.addEventListener("click", () => {
                createRoomModal.classList.add("hidden");
            });
        }

        if (btnCreateRoomConfirm) {
            btnCreateRoomConfirm.addEventListener("click", async () => {
                createRoomModal.classList.add("hidden");
                await createMultiplayerRoom();
            });
        }

        // Room View Triggers
        const btnRoomLeave = document.getElementById("btn-room-leave");
        const btnRoomReady = document.getElementById("btn-room-ready");

        if (btnRoomLeave) {
            btnRoomLeave.addEventListener("click", async () => {
                await leaveCurrentRoom();
            });
        }

        if (btnRoomReady) {
            btnRoomReady.addEventListener("click", async () => {
                await togglePlayerReady();
            });
        }

        // Final Results View Triggers
        const btnReturnLobby = document.getElementById("btn-challenge-return-lobby");
        const btnGoDashboard = document.getElementById("btn-challenge-go-dashboard");

        if (btnReturnLobby) {
            btnReturnLobby.addEventListener("click", async () => {
                await leaveCurrentRoom();
            });
        }

        if (btnGoDashboard) {
            btnGoDashboard.addEventListener("click", async () => {
                await leaveCurrentRoom();
                const btnDashboard = document.getElementById("btn-dashboard");
                if (btnDashboard) btnDashboard.click();
            });
        }

        // Listen to Auth State Changes dynamically from FirebaseSync
        if (window.FirebaseSync) {
            window.FirebaseSync.onStateChanged((user) => {
                if (user) {
                    // Reset login button texts
                    if (btnChallengeLogin) btnChallengeLogin.textContent = "Đăng nhập bằng Google để chơi";
                    
                    // Only transition to Lobby if challenge tab is active AND user is NOT currently in a room
                    const challengeTab = document.getElementById("challenge-tab");
                    if (challengeTab && challengeTab.classList.contains("active") && !activeRoomId) {
                        initChallengeTab();
                    }
                }
            });
        }
    }

    // Initialize challenge views based on Auth State
    function initChallengeTab() {
        if (typeof isCloudMode !== "undefined" && isCloudMode && window.FirebaseSync?.getCurrentUser()) {
            switchChallengeSubView("challenge-lobby-view");
            startRoomsListListener();
        } else {
            switchChallengeSubView("challenge-guest-view");
            cleanupAllSubscriptions();
        }
    }

    // Switch active challenge display panel
    function switchChallengeSubView(viewId) {
        const subviews = [
            "challenge-guest-view",
            "challenge-lobby-view",
            "challenge-room-view",
            "challenge-play-view",
            "challenge-results-view"
        ];
        subviews.forEach(v => {
            const el = document.getElementById(v);
            if (el) {
                if (v === viewId) el.classList.remove("hidden");
                else el.classList.add("hidden");
            }
        });
    }

    // Cleanup all active Firebase observers and intervals
    function cleanupAllSubscriptions() {
        if (roomsListUnsubscribe) {
            roomsListUnsubscribe();
            roomsListUnsubscribe = null;
        }
        if (activeRoomUnsubscribe) {
            activeRoomUnsubscribe();
            activeRoomUnsubscribe = null;
        }
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (roomCountdownInterval) {
            clearInterval(roomCountdownInterval);
            roomCountdownInterval = null;
        }
        countdownActive = false;
    }

    // Helper to render responsive player avatars (support image URL or animal emoji text)
    function getAvatarHTML(photoURL) {
        if (!photoURL) return `<div class="player-avatar-emoji">🐱</div>`;
        if (photoURL.startsWith("http") || photoURL.startsWith("/") || photoURL.startsWith("data:")) {
            return `<img src="${photoURL}" class="player-avatar-img" alt="Avatar">`;
        } else {
            return `<div class="player-avatar-emoji">${photoURL}</div>`;
        }
    }

    // --- PHASE 3: GAME LOGIC & ORCHESTRATION ---

    // Generate random 10 MCQs based on selected topic
    function generateChallengeQuestions(topic) {
        let generated = [];
        if (topic === "vocabulary") {
            if (typeof INITIAL_VOCABULARY === "undefined" || !INITIAL_VOCABULARY.length) {
                console.error("INITIAL_VOCABULARY is empty or not loaded");
                return [];
            }
            // Shuffle and pick 10 words
            const words = [...INITIAL_VOCABULARY].sort(() => 0.5 - Math.random()).slice(0, 10);
            words.forEach(word => {
                // Find 3 distractors from vocabulary
                const distractors = [];
                const otherWords = INITIAL_VOCABULARY.filter(w => w.word !== word.word);
                const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
                for (let w of shuffledOthers) {
                    if (distractors.length >= 3) break;
                    if (!distractors.includes(w.meaning) && w.meaning !== word.meaning) {
                        distractors.push(w.meaning);
                    }
                }
                while (distractors.length < 3) {
                    distractors.push(`Nghĩa khác ${distractors.length + 1}`);
                }
                const options = [word.meaning, ...distractors].sort(() => 0.5 - Math.random());
                const correctIndex = options.indexOf(word.meaning);

                generated.push({
                    q: `Chọn nghĩa đúng của từ "${word.word}" (${word.type}):`,
                    options: options,
                    answer: correctIndex,
                    explanation: `Từ "${word.word}" (${word.type}) có phiên âm ${word.ipa || ""}. Nghĩa là: ${word.meaning}.\n\nVí dụ: ${word.example || ""}\nDịch ví dụ: ${word.example_vi || ""}`,
                    en: word.word,
                    vi: word.meaning
                });
            });
        } else if (topic === "grammar") {
            if (typeof GRAMMAR_LESSONS === "undefined" || !GRAMMAR_LESSONS.length) {
                console.error("GRAMMAR_LESSONS is empty or not loaded");
                return [];
            }
            // Gather all practice items
            let allPractice = [];
            GRAMMAR_LESSONS.forEach(lesson => {
                if (lesson.practice && lesson.practice.length) {
                    lesson.practice.forEach(p => {
                        allPractice.push({
                            q: p.q,
                            options: p.options,
                            answer: p.answer,
                            explanation: p.explanation || "Không có giải thích thêm.",
                            en: p.q,
                            vi: ""
                        });
                    });
                }
            });
            if (allPractice.length === 0) {
                allPractice = [
                    { q: "I ___ a student.", options: ["am", "is", "are", "be"], answer: 0, explanation: "I đi với am ở hiện tại đơn." },
                    { q: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1, explanation: "Chủ ngữ ngôi thứ ba số ít thêm es." }
                ];
            }
            generated = allPractice.sort(() => 0.5 - Math.random()).slice(0, 10);
        } else if (topic === "sentences") {
            if (typeof COMMUNICATIVE_SENTENCES === "undefined" || !COMMUNICATIVE_SENTENCES.length) {
                console.error("COMMUNICATIVE_SENTENCES is not loaded");
                return [];
            }
            const selected = [...COMMUNICATIVE_SENTENCES].sort(() => 0.5 - Math.random()).slice(0, 10);
            selected.forEach(item => {
                const distractors = [];
                const otherSentences = COMMUNICATIVE_SENTENCES.filter(s => s.english !== item.english);
                const shuffledOthers = [...otherSentences].sort(() => 0.5 - Math.random());
                for (let s of shuffledOthers) {
                    if (distractors.length >= 3) break;
                    if (!distractors.includes(s.vietnamese) && s.vietnamese !== item.vietnamese) {
                        distractors.push(s.vietnamese);
                    }
                }
                while (distractors.length < 3) {
                    distractors.push(`Bản dịch khác ${distractors.length + 1}`);
                }
                const options = [item.vietnamese, ...distractors].sort(() => 0.5 - Math.random());
                const correctIndex = options.indexOf(item.vietnamese);

                generated.push({
                    q: `Dịch câu giao tiếp sau sang tiếng Việt: "${item.english}"`,
                    options: options,
                    answer: correctIndex,
                    explanation: `Câu "${item.english}" dịch nghĩa tương đương là: "${item.vietnamese}".\n\nChủ đề: ${item.category || "Giao tiếp thông thường"}.`,
                    en: item.english,
                    vi: item.vietnamese
                });
            });
        }
        return generated;
    }

    // Start listening to the multiplayer lobby
    function startRoomsListListener() {
        if (!window.FirebaseSync) return;
        
        cleanupAllSubscriptions();

        const lobbyRoomsList = document.getElementById("lobby-rooms-list");
        const lobbyRoomsCount = document.getElementById("lobby-rooms-count");

        lobbyRoomsList.innerHTML = `
            <div class="roadmap-loading" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
                <span class="pulse-dot"></span>
                <span>Đang tải danh sách phòng thi đấu...</span>
            </div>
        `;

        roomsListUnsubscribe = window.FirebaseSync.listenRoomsList((rooms) => {
            lobbyRoomsCount.textContent = rooms.length;
            if (rooms.length === 0) {
                lobbyRoomsList.innerHTML = `
                    <div class="empty-state-list text-center" style="grid-column: 1 / -1; padding: 40px 20px;">
                        <div class="empty-icon" style="font-size: 40px; margin-bottom: 12px;">🎮</div>
                        <h4 style="margin-bottom: 6px; color: #fff;">Chưa có phòng thi đấu nào đang chờ</h4>
                        <p style="color: var(--text-muted); font-size: 13px;">Hãy nhấn nút "Tạo Phòng Thi Đấu" để làm chủ phòng đấu đầu tiên!</p>
                    </div>
                `;
                return;
            }

            lobbyRoomsList.innerHTML = "";
            rooms.forEach(room => {
                const players = Object.values(room.players || {});
                const playersCount = players.length;
                if (playersCount >= 5) return; // Full room
                
                const host = room.players[room.creatorId] || { name: "Chủ phòng", photoURL: "🐶" };
                
                let topicText = "🧩 Từ vựng thiết yếu";
                if (room.topic === "grammar") topicText = "📚 Ngữ pháp";
                else if (room.topic === "sentences") topicText = "🗣️ Giao tiếp phản xạ";

                const card = document.createElement("div");
                card.className = "room-lobby-card animate-glow";
                card.innerHTML = `
                    <div class="room-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span class="room-card-code" style="font-family: monospace; font-size: 16px; font-weight: 700; color: var(--primary); letter-spacing: 1px;">#${room.id}</span>
                        <span class="room-card-slots" style="font-size: 12px; font-weight: 600; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 20px;">${playersCount}/5 người</span>
                    </div>
                    <div class="room-card-body" style="margin-bottom: 16px;">
                        <div class="room-card-topic" style="font-weight: 700; color: #fff; font-size: 14.5px; margin-bottom: 8px;">${topicText}</div>
                        <div class="room-card-host" style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-muted);">
                            <div class="host-avatar-mini" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 50%;">
                                ${getAvatarHTML(host.photoURL)}
                            </div>
                            <span>Chủ phòng: <strong>${host.name}</strong></span>
                        </div>
                    </div>
                    <button class="btn-secondary btn-join-room" data-room-id="${room.id}" style="width: 100%; padding: 8px 12px; font-size: 13px; border-radius: 10px; font-weight: 600; text-align: center; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.2s ease;">
                        Tham gia ⚔️
                    </button>
                `;

                card.querySelector(".btn-join-room").addEventListener("click", async () => {
                    await joinMultiplayerRoom(room.id);
                });

                lobbyRoomsList.appendChild(card);
            });
        });
    }

    // Host creates a room document
    async function createMultiplayerRoom() {
        if (!window.FirebaseSync || typeof state === "undefined") {
            console.error("[Challenge] createRoom blocked: FirebaseSync or state not available");
            return;
        }

        const user = window.FirebaseSync.getCurrentUser();
        if (!user) {
            console.error("[Challenge] createRoom blocked: no authenticated user");
            return;
        }

        // Enforce 1 room per user: if already in a room, block creation
        if (activeRoomId) {
            alert("Bạn đang ở trong phòng #" + activeRoomId + ". Vui lòng thoát phòng hiện tại trước khi tạo phòng mới!");
            return;
        }

        const topic = document.getElementById("create-room-topic").value;
        const roomId = Math.floor(100000 + Math.random() * 900000).toString();

        const playerInfo = {
            uid: user.uid,
            name: state.displayName || user.displayName || "Chủ phòng",
            photoURL: state.photoURL || user.photoURL || "🐶"
        };

        const generatedQuestions = generateChallengeQuestions(topic);
        if (!generatedQuestions || generatedQuestions.length === 0) {
            alert("Lỗi tạo bộ câu hỏi. Vui lòng thử lại!");
            return;
        }

        console.log("[Challenge] Creating room", roomId, "topic:", topic);

        try {
            await window.FirebaseSync.createRoom(roomId, topic, generatedQuestions, playerInfo);
            console.log("[Challenge] Room created successfully, switching to room view");
            activeRoomId = roomId;

            if (roomsListUnsubscribe) {
                roomsListUnsubscribe();
                roomsListUnsubscribe = null;
            }

            switchChallengeSubView("challenge-room-view");
            listenActiveRoom(roomId);
        } catch (e) {
            console.error("[Challenge] Error creating room:", e);
            alert("Lỗi tạo phòng thi đấu: " + (e.message || "Vui lòng thử lại!") + "\n\nNếu lỗi liên quan đến permission, hãy kiểm tra Firestore Security Rules.");
        }
    }

    // Join a multiplayer room
    async function joinMultiplayerRoom(roomId) {
        if (!window.FirebaseSync || typeof state === "undefined") {
            console.error("[Challenge] joinRoom blocked: FirebaseSync or state not available");
            return;
        }

        const user = window.FirebaseSync.getCurrentUser();
        if (!user) {
            console.error("[Challenge] joinRoom blocked: no authenticated user");
            return;
        }

        // Enforce 1 room per user
        if (activeRoomId) {
            alert("Bạn đang ở trong phòng #" + activeRoomId + ". Vui lòng thoát phòng hiện tại trước!");
            return;
        }

        const playerInfo = {
            uid: user.uid,
            name: state.displayName || user.displayName || "Người chơi",
            photoURL: state.photoURL || user.photoURL || "🐱"
        };

        console.log("[Challenge] Joining room", roomId);

        try {
            await window.FirebaseSync.joinRoom(roomId, playerInfo);
            console.log("[Challenge] Joined room successfully, switching to room view");
            activeRoomId = roomId;

            if (roomsListUnsubscribe) {
                roomsListUnsubscribe();
                roomsListUnsubscribe = null;
            }

            switchChallengeSubView("challenge-room-view");
            listenActiveRoom(roomId);
        } catch (e) {
            console.error("[Challenge] Error joining room:", e);
            alert("Không thể tham gia phòng: " + (e.message || "Phòng đấu đã đầy hoặc không còn tồn tại!") + "\n\nNếu lỗi liên quan đến permission, hãy kiểm tra Firestore Security Rules.");
            startRoomsListListener();
        }
    }

    // Synchronize current room lobby changes
    function listenActiveRoom(roomId) {
        if (!window.FirebaseSync) return;

        if (activeRoomUnsubscribe) {
            activeRoomUnsubscribe();
        }

        const roomCountdownBanner = document.getElementById("room-countdown-banner");
        const roomCountdownSec = document.getElementById("room-countdown-sec");
        const roomPlayersCount = document.getElementById("room-players-count");
        const roomPlayersList = document.getElementById("room-players-list");
        const roomCodeDisplay = document.getElementById("room-code-display");
        const roomTopicDisplay = document.getElementById("room-topic-display");
        const btnRoomReady = document.getElementById("btn-room-ready");
        const btnRoomLeave = document.getElementById("btn-room-leave");

        roomCodeDisplay.textContent = roomId;

        activeRoomUnsubscribe = window.FirebaseSync.listenRoom(roomId, (roomData) => {
            const user = window.FirebaseSync.getCurrentUser();
            if (!user) return;

            if (!roomData) {
                // Room dissolved
                cleanupActiveRoomState();
                alert("Phòng thi đấu đã bị giải tán.");
                switchChallengeSubView("challenge-lobby-view");
                startRoomsListListener();
                return;
            }

            // Check if current user has been kicked by the host
            const isKicked = !roomData.players || !roomData.players[user.uid];
            if (isKicked) {
                cleanupActiveRoomState();
                alert("Bạn đã bị chủ phòng mời ra khỏi phòng (Kicked)!");
                switchChallengeSubView("challenge-lobby-view");
                startRoomsListListener();
                return;
            }

            // Sync topic details
            let topicText = "Từ vựng thiết yếu";
            if (roomData.topic === "grammar") topicText = "Ngữ pháp";
            else if (roomData.topic === "sentences") topicText = "Giao tiếp phản xạ";
            roomTopicDisplay.textContent = topicText;

            // Render active players list
            const players = Object.values(roomData.players || {});
            roomPlayersCount.textContent = players.length;
            roomPlayersList.innerHTML = "";

            let isMeHost = roomData.creatorId === user.uid;

            // Update Leave button styles and texts dynamically based on user identity
            if (btnRoomLeave) {
                if (isMeHost) {
                    btnRoomLeave.textContent = "🗑️ Hủy phòng";
                    btnRoomLeave.className = "btn-action btn-incorrect animate-glow";
                } else {
                    btnRoomLeave.textContent = "🚪 Rời phòng";
                    btnRoomLeave.className = "btn-action btn-incorrect";
                }
            }

            // Render player cards
            players.forEach(p => {
                const isMe = p.uid === user.uid;
                const isHost = p.uid === roomData.creatorId;

                let badgeText = "Chờ... ⌛";
                let badgeClass = "badge-waiting";
                if (isHost) {
                    badgeText = "Chủ phòng 👑";
                    badgeClass = "badge-host";
                } else if (p.isReady) {
                    badgeText = "Sẵn sàng 👍";
                    badgeClass = "badge-ready";
                }

                // Show Kick Button only to Host on other player cards
                let kickBtnHTML = "";
                if (isMeHost && !isHost) {
                    kickBtnHTML = `
                        <button class="btn-kick-player animate-glow" data-uid="${p.uid}" style="
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            background: rgba(239, 68, 68, 0.15);
                            border: 1px solid rgba(239, 68, 68, 0.4);
                            color: var(--danger);
                            padding: 2px 6px;
                            font-size: 10px;
                            font-weight: 700;
                            border-radius: 6px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            z-index: 10;
                        " title="Mời người chơi này ra khỏi phòng">
                            Kick ❌
                        </button>
                    `;
                }

                const card = document.createElement("div");
                card.className = `player-lobby-card animate-glow ${isMe ? "player-card-me" : ""} ${p.isReady ? "player-ready-card" : ""}`;
                card.style.position = "relative"; // Ensure relative for kick button positioning
                card.innerHTML = `
                    ${kickBtnHTML}
                    <div class="player-card-avatar-wrapper">
                        ${getAvatarHTML(p.photoURL)}
                    </div>
                    <div class="player-card-name" title="${p.name}">
                        ${p.name} ${isMe ? '<span style="color: var(--primary); font-size:11px;">(Bạn)</span>' : ""}
                    </div>
                    <span class="player-status-badge ${badgeClass}">
                        ${badgeText}
                    </span>
                `;
                roomPlayersList.appendChild(card);
            });

            // Bind click events to Kick buttons
            if (isMeHost) {
                roomPlayersList.querySelectorAll(".btn-kick-player").forEach(btn => {
                    btn.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        const targetUid = btn.getAttribute("data-uid");
                        const targetPlayer = roomData.players[targetUid];
                        if (confirm(`Bạn có chắc chắn muốn kick người chơi "${targetPlayer.name}" khỏi phòng?`)) {
                            await window.FirebaseSync.leaveRoom(roomId, targetUid, false);
                        }
                    });
                });
            }

            // Sync players ready status
            // Allow solo play: if only 1 player (host), always ready.
            // If 2+ players, all guests must be ready.
            const allGuestsReady = players.length === 1 || (players.length >= 2 && players.every(p => p.isReady || p.uid === roomData.creatorId));

            // Configure Active / Ready button behaviors dynamically
            if (isMeHost) {
                btnRoomReady.style.display = "block";
                btnRoomReady.style.cssText = "opacity: 1; pointer-events: auto; padding: 10px 24px; border-radius: 12px; font-weight: 700; border: none;";
                
                if (players.length === 1) {
                    // Solo mode: host can start immediately for practice
                    btnRoomReady.textContent = "🎯 Luyện Tập 1 Mình";
                    btnRoomReady.className = "btn-action btn-correct animate-glow";
                    btnRoomReady.style.cssText += "cursor: pointer; background: var(--success); box-shadow: 0 0 15px var(--success-glow);";
                } else if (!allGuestsReady) {
                    btnRoomReady.textContent = "Chờ người chơi Sẵn sàng... ⌛";
                    btnRoomReady.className = "btn-action btn-correct disabled";
                    btnRoomReady.style.cssText += "opacity: 0.6; cursor: not-allowed; pointer-events: none;";
                } else {
                    btnRoomReady.textContent = "Bắt Đầu Trận Đấu ⚔️";
                    btnRoomReady.className = "btn-action btn-correct animate-glow";
                    btnRoomReady.style.cssText += "cursor: pointer; background: var(--success); box-shadow: 0 0 15px var(--success-glow);";
                }
            } else {
                btnRoomReady.style.display = "block";
                btnRoomReady.style.cssText = "opacity: 1; cursor: pointer; pointer-events: auto; padding: 10px 24px; border-radius: 12px; font-weight: 700; border: none;";
                
                const myPlayer = roomData.players[user.uid];
                if (myPlayer && myPlayer.isReady) {
                    btnRoomReady.textContent = "Bỏ Sẵn Sàng ❌";
                    btnRoomReady.className = "btn-action btn-incorrect animate-glow";
                } else {
                    btnRoomReady.textContent = "Sẵn Sàng 👍";
                    btnRoomReady.className = "btn-action btn-correct animate-glow";
                }
            }

            // Action checking: status playing transition
            if (roomData.status === "playing") {
                if (roomCountdownInterval) {
                    clearInterval(roomCountdownInterval);
                    roomCountdownInterval = null;
                }
                countdownActive = false;
                roomCountdownBanner.classList.add("hidden");

                // Jump directly to gameplay loop
                startGameplay(roomData);
                return;
            }

            // Auto Countdown triggers if all players are ready (2+ players only, solo starts manually)
            const allPlayersReady = players.length >= 2 && players.every(p => p.isReady || p.uid === roomData.creatorId);

            if (allPlayersReady) {
                if (!countdownActive) {
                    countdownActive = true;
                    currentRoomCountdownVal = 5;
                    roomCountdownSec.textContent = currentRoomCountdownVal;
                    roomCountdownBanner.classList.remove("hidden");

                    roomCountdownInterval = setInterval(async () => {
                        currentRoomCountdownVal--;
                        roomCountdownSec.textContent = currentRoomCountdownVal;

                        if (currentRoomCountdownVal <= 0) {
                            clearInterval(roomCountdownInterval);
                            roomCountdownInterval = null;
                            countdownActive = false;
                            roomCountdownBanner.classList.add("hidden");

                            if (isMeHost) {
                                await window.FirebaseSync.startGame(roomId);
                            }
                        }
                    }, 1000);
                }
            } else {
                if (countdownActive) {
                    clearInterval(roomCountdownInterval);
                    roomCountdownInterval = null;
                    countdownActive = false;
                    roomCountdownBanner.classList.add("hidden");
                }
            }
        });
    }

    // Toggle ready status of a player or Start the match if Host
    async function togglePlayerReady() {
        if (!window.FirebaseSync || !activeRoomId) return;
        const user = window.FirebaseSync.getCurrentUser();
        if (!user) return;

        const btnRoomReady = document.getElementById("btn-room-ready");
        
        // Host Action Trigger: Starts the match immediately (includes solo "Luyện Tập" button)
        if (btnRoomReady.textContent.includes("Bắt Đầu") || btnRoomReady.textContent.includes("Luyện Tập")) {
            await window.FirebaseSync.startGame(activeRoomId);
            return;
        }

        // Guest Action Trigger: Toggles ready state
        const currentReadyState = btnRoomReady.classList.contains("btn-incorrect");
        await window.FirebaseSync.updatePlayerReady(activeRoomId, user.uid, !currentReadyState);
    }

    // Leave or Dissolve the active room
    async function leaveCurrentRoom() {
        if (!window.FirebaseSync || !activeRoomId) {
            cleanupActiveRoomState();
            switchChallengeSubView("challenge-lobby-view");
            startRoomsListListener();
            return;
        }

        const user = window.FirebaseSync.getCurrentUser();
        if (!user) {
            cleanupActiveRoomState();
            switchChallengeSubView("challenge-lobby-view");
            startRoomsListListener();
            return;
        }

        const btnRoomLeave = document.getElementById("btn-room-leave");
        const isHost = btnRoomLeave && btnRoomLeave.textContent.includes("Hủy");

        try {
            const roomIdToLeave = activeRoomId;
            cleanupActiveRoomState();

            // Host leaves dissolves the room document (isLast = true), Guests just remove their keys (isLast = false)
            await window.FirebaseSync.leaveRoom(roomIdToLeave, user.uid, isHost);
            
            switchChallengeSubView("challenge-lobby-view");
            startRoomsListListener();
        } catch (e) {
            console.error("Error leaving room:", e);
            cleanupActiveRoomState();
            switchChallengeSubView("challenge-lobby-view");
            startRoomsListListener();
        }
    }

    // Reset local state of the room
    function cleanupActiveRoomState() {
        cleanupAllSubscriptions();
        activeRoomId = null;
        questions = [];
        currentQuestionIndex = 0;
        localScore = 0;
    }

    // --- GAMEPLAY LOOP ORCHESTRATION ---

    function gameplayListener(roomId) {
        if (activeRoomUnsubscribe) activeRoomUnsubscribe();

        activeRoomUnsubscribe = window.FirebaseSync.listenRoom(roomId, (roomData) => {
            if (!roomData) return;

            updateLiveScoreboard(roomData.players);

            const players = Object.values(roomData.players || {});
            const allFinished = players.every(p => p.finished);

            if (allFinished) {
                showFinalResults(roomData);
            }
        });
    }

    function startGameplay(roomData) {
        questions = roomData.questions || [];
        currentQuestionIndex = 0;
        localScore = 0;

        switchChallengeSubView("challenge-play-view");
        
        gameplayListener(roomData.id);
        showQuestion(0);
    }

    function showQuestion(index) {
        if (timerInterval) clearInterval(timerInterval);

        const user = window.FirebaseSync.getCurrentUser();
        if (!user) return;

        if (index >= questions.length) {
            window.FirebaseSync.updatePlayerFinished(activeRoomId, user.uid);

            const optionsContainer = document.getElementById("challenge-options-container");
            optionsContainer.innerHTML = "";

            const qText = document.getElementById("challenge-question-text");
            qText.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="empty-icon" style="font-size: 48px; margin-bottom: 12px; animation: pulse 1.5s infinite;">⌛</div>
                    <h4 style="margin-bottom: 8px;">Bạn đã hoàn thành 10 câu hỏi!</h4>
                    <p style="color: var(--text-muted); font-size: 13px;">Đang chờ các đối thủ khác hoàn thành nốt...</p>
                </div>
            `;
            document.getElementById("challenge-question-counter").textContent = "Hoàn thành!";
            document.getElementById("challenge-timer-text").textContent = "Done";
            return;
        }

        currentQuestionIndex = index;
        const qObj = questions[index];

        document.getElementById("challenge-question-counter").textContent = `Câu hỏi ${index + 1} / ${questions.length}`;
        document.getElementById("challenge-question-text").textContent = qObj.q;

        const optionsContainer = document.getElementById("challenge-options-container");
        optionsContainer.innerHTML = "";

        let optionSelected = false;

        qObj.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "option-card animate-glow";
            btn.innerHTML = `
                <span class="option-prefix">${["A", "B", "C", "D"][idx]}.</span>
                <span class="option-text">${opt}</span>
            `;

            btn.addEventListener("click", async () => {
                if (optionSelected) return;
                optionSelected = true;

                if (timerInterval) clearInterval(timerInterval);

                const isCorrect = (idx === qObj.answer);

                Array.from(optionsContainer.children).forEach((child, cIdx) => {
                    child.classList.add("disabled");
                    if (cIdx === qObj.answer) {
                        child.classList.add("correct");
                    } else if (cIdx === idx) {
                        child.classList.add("incorrect");
                    }
                });

                if (isCorrect) {
                    localScore += 10;
                }

                if (qObj.en && typeof speakEnglish !== "undefined") {
                    speakEnglish(qObj.en);
                }

                await window.FirebaseSync.updatePlayerScore(activeRoomId, user.uid, localScore, index, idx, isCorrect);

                setTimeout(() => {
                    showQuestion(index + 1);
                }, 2000);
            });

            optionsContainer.appendChild(btn);
        });

        let timeLeft = 15;
        const timerFg = document.getElementById("challenge-timer-fg");
        const timerText = document.getElementById("challenge-timer-text");

        timerFg.style.strokeDashoffset = 0;
        timerText.textContent = timeLeft;

        timerInterval = setInterval(async () => {
            timeLeft--;
            timerText.textContent = timeLeft;

            const offset = 113.1 * (1 - timeLeft / 15);
            timerFg.style.strokeDashoffset = offset;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                optionSelected = true;

                Array.from(optionsContainer.children).forEach((child, cIdx) => {
                    child.classList.add("disabled");
                    if (cIdx === qObj.answer) {
                        child.classList.add("correct");
                    }
                });

                await window.FirebaseSync.updatePlayerScore(activeRoomId, user.uid, localScore, index, -1, false);

                setTimeout(() => {
                    showQuestion(index + 1);
                }, 2000);
            }
        }, 1000);
    }

    function updateLiveScoreboard(players) {
        const listContainer = document.getElementById("challenge-live-scoreboard");
        if (!listContainer) return;
        
        listContainer.innerHTML = "";

        const sorted = Object.values(players).sort((a, b) => b.score - a.score);

        sorted.forEach((p, idx) => {
            const answersCount = p.answers ? Object.keys(p.answers).length : 0;
            let progressText = `Câu ${answersCount}/10`;
            if (p.finished) progressText = `Hoàn thành ✨`;

            const row = document.createElement("div");
            row.className = `live-score-item ${p.uid === window.FirebaseSync?.getCurrentUser()?.uid ? "live-score-me" : ""}`;
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; max-width: 70%; overflow: hidden;">
                    <span style="font-weight: 800; color: var(--text-muted); font-size: 13px; width: 14px;">${idx + 1}</span>
                    <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 50%;">
                        ${getAvatarHTML(p.photoURL)}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 700; color: #fff; font-size: 13px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.name}</span>
                        <span style="font-size: 10px; color: var(--text-muted);">${progressText}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: var(--primary);">${p.score}</span>
                    <span style="font-size: 10px; color: var(--text-muted); display: block;">điểm</span>
                </div>
            `;
            listContainer.appendChild(row);
        });
    }

    // --- RESULTS & PRIZE DISTRIBUTIONS ---

    function showFinalResults(roomData) {
        cleanupAllSubscriptions();

        switchChallengeSubView("challenge-results-view");

        const user = window.FirebaseSync.getCurrentUser();
        if (!user) return;

        const players = Object.values(roomData.players || {});
        const sorted = [...players].sort((a, b) => b.score - a.score);

        const maxScore = sorted[0].score;
        const myScore = roomData.players[user.uid]?.score || 0;

        let reward = 2; // Participation reward
        if (myScore === maxScore && maxScore > 0) {
            reward = 15; // Winner reward
        } else if (players.length > 1 && myScore > 0) {
            const scores = players.map(p => p.score);
            const duplicates = scores.filter((item, index) => scores.indexOf(item) !== index);
            if (duplicates.includes(myScore)) {
                reward = 8; // Tie reward
            }
        }

        if (typeof state !== "undefined") {
            const currentStars = state.stars || 0;
            state.stars = currentStars + reward;

            if (typeof saveStatsToStorage === "function") {
                saveStatsToStorage();
            }
            
            const dbStarsCount = document.getElementById("dashboard-stars-count");
            if (dbStarsCount) dbStarsCount.textContent = state.stars;
        }

        let bannerText = `Trận đấu đã kết thúc! Bạn nhận được <strong style="color: var(--warning); font-size: 18px; text-shadow: 0 0 10px var(--warning-glow);">+${reward} ⭐ Gold Stars</strong>!`;
        if (reward === 15) {
            bannerText = `👑 CHIẾN THẮNG TUYỆT VỜI! Bạn giành giải Nhất và nhận <strong style="color: var(--warning); font-size: 19px; text-shadow: 0 0 10px var(--warning-glow);">+15 ⭐ Gold Stars</strong>!`;
        } else if (reward === 8) {
            bannerText = `🤝 ĐỒNG HẠNG / HÒA ĐIỂM! Bạn nhận phần thưởng chia đều <strong style="color: var(--warning); font-size: 19px; text-shadow: 0 0 10px var(--warning-glow);">+8 ⭐ Gold Stars</strong>!`;
        }
        document.getElementById("challenge-result-banner").innerHTML = bannerText;

        const finalScoreboard = document.getElementById("challenge-final-scoreboard");
        finalScoreboard.innerHTML = "";

        sorted.forEach((p, idx) => {
            let rankEmoji = "🏆";
            if (idx === 0) rankEmoji = "🥇";
            else if (idx === 1) rankEmoji = "🥈";
            else if (idx === 2) rankEmoji = "🥉";
            else rankEmoji = `<span style="font-weight: 700; color: var(--text-muted);">${idx + 1}</span>`;

            let starPrize = "+2 ⭐";
            if (p.score === maxScore && maxScore > 0) {
                starPrize = "+10 ⭐";
            } else if (players.length > 1 && p.score > 0) {
                const scores = players.map(pl => pl.score);
                const dupes = scores.filter((item, index) => scores.indexOf(item) !== index);
                if (dupes.includes(p.score)) {
                    starPrize = "+5 ⭐";
                }
            }

            const row = document.createElement("div");
            row.className = `final-score-item ${p.uid === user.uid ? "final-score-me" : ""}`;
            row.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
                padding: 12px 18px;
                border-radius: 14px;
                transition: all 0.3s ease;
            `;
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 18px; display: flex; align-items: center; justify-content: center; width: 24px;">${rankEmoji}</div>
                    <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 50%;">
                        ${getAvatarHTML(p.photoURL)}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 700; color: #fff; font-size: 14px;">${p.name} ${p.uid === user.uid ? '<span style="color: var(--primary); font-size:11px;">(Bạn)</span>' : ""}</span>
                        <span style="font-size: 11px; color: var(--text-muted);">${p.score} điểm</span>
                    </div>
                </div>
                <div style="text-align: right; font-weight: 800; color: var(--warning); font-size: 14.5px;">
                    ${starPrize}
                </div>
            `;
            finalScoreboard.appendChild(row);
        });

        const reviewList = document.getElementById("challenge-review-list");
        reviewList.innerHTML = "";

        questions.forEach((q, qIdx) => {
            const playerAnswer = roomData.players[user.uid]?.answers?.[qIdx];
            const mySelectedIdx = playerAnswer ? playerAnswer.selectedIndex : -1;
            const isMyCorrect = playerAnswer ? playerAnswer.isCorrect : false;

            const item = document.createElement("div");
            item.className = `review-question-card ${isMyCorrect ? "review-correct" : mySelectedIdx === -1 ? "review-unanswered" : "review-incorrect"}`;
            
            item.innerHTML = `
                <div class="review-header" style="padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <div style="max-width: 85%;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">CÂU HỎI ${qIdx + 1}</span>
                        <strong style="color: #fff; font-size: 14px; line-height: 1.5;">${q.q}</strong>
                    </div>
                    <span class="review-toggle-icon" style="font-size: 14px; color: var(--text-muted); transition: transform 0.3s;">▼</span>
                </div>
                <div class="review-body hidden" style="padding: 0 16px 16px 16px; border-top: 1px solid rgba(255,255,255,0.03); margin-top: 4px;">
                    <div class="review-options-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
                        ${q.options.map((opt, oIdx) => {
                            let optClass = "opt-normal";
                            let badge = "";
                            if (oIdx === q.answer) {
                                optClass = "opt-correct";
                                badge = " ✅ (Đúng)";
                            } else if (oIdx === mySelectedIdx) {
                                optClass = "opt-incorrect";
                                badge = " ❌ (Lựa chọn của bạn)";
                            }
                            return `
                                <div class="review-opt ${optClass}">
                                    ${opt}${badge}
                                </div>
                            `;
                        }).join("")}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: flex-start; margin-top: 12px; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02);">
                        ${q.en ? `
                            <button class="btn-speak-mini" style="background: var(--primary-glow); border: 1px solid rgba(99,102,241,0.2); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;" title="Nghe phát âm">
                                🔊
                            </button>
                        ` : ""}
                        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; white-space: pre-wrap; flex: 1;">
                            ${q.explanation}
                        </div>
                    </div>
                </div>
            `;

            const speakBtn = item.querySelector(".btn-speak-mini");
            if (speakBtn && q.en) {
                speakBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (typeof speakEnglish !== "undefined") speakEnglish(q.en);
                });
            }

            const header = item.querySelector(".review-header");
            const body = item.querySelector(".review-body");
            const icon = item.querySelector(".review-toggle-icon");

            header.addEventListener("click", () => {
                const isHidden = body.classList.contains("hidden");
                if (isHidden) {
                    body.classList.remove("hidden");
                    icon.style.transform = "rotate(180deg)";
                } else {
                    body.classList.add("hidden");
                    icon.style.transform = "rotate(0deg)";
                }
            });

            reviewList.appendChild(item);
        });
    }
})();
