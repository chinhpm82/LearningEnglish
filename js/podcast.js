// --- Podcast Room Logic ---
let activePodcast = null;
let lastActiveLineEl = null;
let customPodcasts = []; // Store custom uploaded podcasts in session memory
let podcastList = []; // Global catalog list
let currentPodcastMode = 'list'; // 'list' | 'loop' | 'single'

function parseSRT(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    const transcript = [];
    let currentItem = null;
    
    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.trim().replace(',', '.').split(':');
        if (parts.length === 3) {
            return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        if (line.match(/^\d+$/)) {
            if (currentItem) {
                transcript.push(currentItem);
            }
            currentItem = { start: 0, end: 0, text: "" };
        } else if (line.includes('-->')) {
            const times = line.split('-->');
            if (times.length === 2) {
                if (!currentItem) {
                    currentItem = { start: 0, end: 0, text: "" };
                }
                currentItem.start = parseTime(times[0]);
                currentItem.end = parseTime(times[1]);
            }
        } else if (currentItem) {
            currentItem.text = currentItem.text ? currentItem.text + " " + line : line;
        }
    }
    if (currentItem) {
        transcript.push(currentItem);
    }
    return transcript;
}

function initPodcastRoom() {
    const defaultList = typeof PODCAST_DATA !== 'undefined' ? PODCAST_DATA : [];
    podcastList = [...defaultList, ...customPodcasts];
    const container = document.getElementById('podcast-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    podcastList.forEach(pod => {
        const item = document.createElement('div');
        item.className = 'roadmap-task-item';
        item.style = 'cursor: pointer; padding: 12px; margin-bottom: 5px;';
        item.innerHTML = `
            <div style="font-size:24px;">${pod.image}</div>
            <div style="flex:1; min-width:0;">
                <div style="font-weight: 600; color: #fff; font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pod.title}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); display:flex; justify-content:space-between; margin-top:3px;">
                    <span>🎙️ ${pod.speaker}</span>
                    <span style="color:var(--accent); font-weight:500;">⏱️ ${pod.duration}</span>
                </div>
            </div>
        `;
        item.onclick = () => selectPodcast(pod, false);
        container.appendChild(item);
    });

    // Setup Custom Upload Trigger Buttons
    const uploadTrigger = document.getElementById('btn-podcast-upload-trigger');
    const uploadForm = document.getElementById('podcast-upload-form');
    const btnCancel = document.getElementById('btn-pod-cancel-upload');
    const btnSubmit = document.getElementById('btn-pod-submit-upload');
    
    if (uploadTrigger && uploadForm) {
        uploadTrigger.onclick = () => {
            uploadForm.classList.remove('hidden');
        };
    }
    
    if (btnCancel && uploadForm) {
        btnCancel.onclick = () => {
            uploadForm.classList.add('hidden');
        };
    }
    
    if (btnSubmit) {
        btnSubmit.onclick = () => {
            const titleInput = document.getElementById('upload-pod-title');
            const audioInput = document.getElementById('upload-pod-audio');
            const srtInput = document.getElementById('upload-pod-srt');
            
            if (!titleInput.value.trim() || !audioInput.files[0] || !srtInput.files[0]) {
                showToastNotification("⚠️ Vui lòng nhập đầy đủ tiêu đề, chọn tệp MP3 và phụ đề SRT!");
                return;
            }
            
            const audioFile = audioInput.files[0];
            const srtFile = srtInput.files[0];
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const srtText = e.target.result;
                const transcript = parseSRT(srtText);
                
                if (transcript.length === 0) {
                    showToastNotification("⚠️ Định dạng tệp SRT không hợp lệ hoặc rỗng!");
                    return;
                }
                
                // Create temporary Blob URL for local audio file
                const audioUrl = URL.createObjectURL(audioFile);
                
                const newPod = {
                    id: `custom-${Date.now()}`,
                    title: titleInput.value.trim(),
                    speaker: "Tệp tải lên (User)",
                    level: "Custom",
                    desc: "Bài nghe tải lên tự chọn từ thiết bị của học viên.",
                    audioUrl: audioUrl,
                    image: "📁",
                    duration: "Tự chọn",
                    transcript: transcript
                };
                
                customPodcasts.push(newPod);
                
                // Refresh catalog list display
                initPodcastRoom();
                
                // Load/Select the new custom podcast instantly
                selectPodcast(newPod, false);
                
                // Reset form inputs
                titleInput.value = '';
                audioInput.value = '';
                srtInput.value = '';
                uploadForm.classList.add('hidden');
                
                showToastNotification("🎉 Tải lên bài nghe mới thành công! Sẵn sàng luyện tập.");
            };
            reader.readAsText(srtFile);
        };
    }
    
    // Setup Audio Player Event Listeners once
    const audio = document.getElementById('podcast-audio-element');
    const playBtn = document.getElementById('btn-player-play');
    const prevBtn = document.getElementById('btn-player-prev');
    const nextBtn = document.getElementById('btn-player-next');
    const skipBack = document.getElementById('btn-player-skip-back');
    const skipForward = document.getElementById('btn-player-skip-forward');
    const seekbar = document.getElementById('player-seekbar');
    const speedBtn = document.getElementById('btn-player-speed');
    const modeBtn = document.getElementById('btn-player-mode');
    const modeIcon = document.getElementById('player-mode-icon');
    const modeText = document.getElementById('player-mode-text');
    const volumeRange = document.getElementById('player-volume');
    
    if (audio) {
        audio.ontimeupdate = handlePodcastTimeUpdate;
        
        // Unified native play event binding (ensures 100% sync from any source)
        audio.onplay = () => {
            if (playBtn) {
                playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            }
            checkAndUpdateStreak();
        };
        
        // Unified native pause event binding
        audio.onpause = () => {
            if (playBtn) {
                playBtn.innerHTML = `<svg id="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff; margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
            }
        };
        
        // Unified native ended event binding
        audio.onended = handlePodcastEnded;
    }
    
    if (playBtn) {
        playBtn.onclick = () => {
            if (!activePodcast) {
                showToastNotification('⚠️ Vui lòng chọn một bài nghe từ danh sách bên trái!');
                return;
            }
            if (audio.paused) {
                // Fix for Mobile Web playback resume issue:
                // If it has ended or reached near the end, reset currentTime to 0 so play() starts fresh and cleanly.
                if (audio.ended || audio.currentTime >= audio.duration - 0.5) {
                    audio.currentTime = 0;
                }
                audio.play().catch(err => {
                    console.error("Audio playback error:", err);
                });
            } else {
                audio.pause();
            }
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (!activePodcast) {
                showToastNotification('⚠️ Vui lòng chọn một bài nghe từ danh sách bên trái!');
                return;
            }
            playPrevPodcast();
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (!activePodcast) {
                showToastNotification('⚠️ Vui lòng chọn một bài nghe từ danh sách bên trái!');
                return;
            }
            playNextPodcast();
        };
    }
    
    if (skipBack) {
        skipBack.onclick = () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        };
    }
    
    if (skipForward) {
        skipForward.onclick = () => {
            audio.currentTime = Math.min(audio.duration || 1000, audio.currentTime + 10);
        };
    }
    
    if (seekbar) {
        seekbar.oninput = () => {
            if (!audio.duration) return;
            const targetTime = (seekbar.value / 100) * audio.duration;
            audio.currentTime = targetTime;
        };
    }
    
    if (speedBtn) {
        const speeds = [1.0, 1.25, 1.5, 0.75];
        let currentSpeedIdx = 0;
        speedBtn.onclick = () => {
            currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
            const newSpeed = speeds[currentSpeedIdx];
            audio.playbackRate = newSpeed;
            speedBtn.textContent = newSpeed + 'x';
        };
    }
    
    // Playback Mode initialization & logic
    if (modeIcon && modeText && modeBtn) {
        if (currentPodcastMode === 'list') {
            modeIcon.textContent = '➡️';
            modeText.textContent = 'Liên tiếp';
            modeBtn.title = "Phát liên tiếp đến hết danh sách";
        } else if (currentPodcastMode === 'loop') {
            modeIcon.textContent = '🔁';
            modeText.textContent = 'Vòng lặp';
            modeBtn.title = "Phát vòng lặp danh sách (vô tận)";
        } else {
            modeIcon.textContent = '🔂';
            modeText.textContent = 'Phát 1 lần';
            modeBtn.title = "Phát hết bài hiện tại rồi dừng";
        }
    }
    
    if (modeBtn) {
        modeBtn.onclick = () => {
            if (currentPodcastMode === 'list') {
                currentPodcastMode = 'loop';
                if (modeIcon) modeIcon.textContent = '🔁';
                if (modeText) modeText.textContent = 'Vòng lặp';
                modeBtn.title = "Phát vòng lặp danh sách (vô tận)";
                showToastNotification("🔁 Chế độ phát: Vòng lặp danh sách");
            } else if (currentPodcastMode === 'loop') {
                currentPodcastMode = 'single';
                if (modeIcon) modeIcon.textContent = '🔂';
                if (modeText) modeText.textContent = 'Phát 1 lần';
                modeBtn.title = "Phát hết bài hiện tại rồi dừng";
                showToastNotification("🔂 Chế độ phát: Phát 1 lần");
            } else {
                currentPodcastMode = 'list';
                if (modeIcon) modeIcon.textContent = '➡️';
                if (modeText) modeText.textContent = 'Liên tiếp';
                modeBtn.title = "Phát liên tiếp đến hết danh sách";
                showToastNotification("➡️ Chế độ phát: Liên tiếp đến hết");
            }
        };
    }
    
    if (volumeRange) {
        volumeRange.oninput = () => {
            audio.volume = volumeRange.value / 100;
        };
    }
    
    if (podcastList.length > 0) {
        selectPodcast(podcastList[0], false);
    }
}

// Navigation Helper Functions
function playNextPodcast() {
    if (podcastList.length === 0) return;
    const currentIndex = podcastList.findIndex(p => p.id === activePodcast.id);
    if (currentIndex !== -1) {
        let nextIndex = currentIndex + 1;
        if (nextIndex < podcastList.length) {
            selectPodcast(podcastList[nextIndex], true);
        } else {
            // End of list reached, loop back to first
            selectPodcast(podcastList[0], true);
        }
    }
}

function playPrevPodcast() {
    if (podcastList.length === 0) return;
    const currentIndex = podcastList.findIndex(p => p.id === activePodcast.id);
    if (currentIndex !== -1) {
        let prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            selectPodcast(podcastList[prevIndex], true);
        } else {
            // Beginning of list, wrap to last
            selectPodcast(podcastList[podcastList.length - 1], true);
        }
    }
}

function handlePodcastEnded() {
    if (currentPodcastMode === 'single') {
        // 'single' mode: native onpause has already sync'd play/pause icon, so do nothing.
        return;
    }
    
    if (podcastList.length === 0) return;
    const currentIndex = podcastList.findIndex(p => p.id === activePodcast.id);
    
    if (currentIndex !== -1) {
        let nextIndex = currentIndex + 1;
        if (nextIndex < podcastList.length) {
            selectPodcast(podcastList[nextIndex], true);
        } else {
            // End of list reached
            if (currentPodcastMode === 'loop') {
                // Loop back to the first one
                selectPodcast(podcastList[0], true);
            } else {
                // 'list' mode: stop at the end.
                // Just keep play icon (native onended/onpause handles resetting icon)
            }
        }
    }
}

function selectPodcast(podcast, shouldPlay = false) {
    activePodcast = podcast;
    lastActiveLineEl = null;
    
    document.getElementById('player-art').textContent = podcast.image;
    document.getElementById('player-title').textContent = podcast.title;
    document.getElementById('player-speaker').textContent = `🎙️ ${podcast.speaker} (${podcast.level})`;
    
    const audio = document.getElementById('podcast-audio-element');
    audio.src = podcast.audioUrl;
    audio.load();
    
    // Reset Seekbar
    document.getElementById('player-seekbar').value = 0;
    document.getElementById('player-time-current').textContent = '0:00';
    document.getElementById('player-time-duration').textContent = podcast.duration;
    
    // Play Button reset
    document.getElementById('btn-player-play').innerHTML = `<svg id="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff; margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    
    if (shouldPlay) {
        audio.play().catch(err => {
            console.error("Autoplay/Gesture restriction blocked playback:", err);
            // In case of error, sync play button to standard state
            const playBtn = document.getElementById('btn-player-play');
            if (playBtn) {
                playBtn.innerHTML = `<svg id="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; color:#fff; margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
            }
        });
    }
    
    // RENDER TIMED TRANSCRIPT
    const transcriptBox = document.getElementById('transcript-scroll-box');
    if (!transcriptBox) return;
    transcriptBox.innerHTML = '';
    
    podcast.transcript.forEach((line, idx) => {
        const div = document.createElement('div');
        div.className = 'transcript-line';
        div.style = 'padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.25s ease; color: var(--text-light); font-size: 14px; line-height: 1.6; border: 1px solid transparent; display: flex; gap: 10px; align-items: flex-start; background: rgba(255,255,255,0.01);';
        div.setAttribute('data-start', line.start);
        div.setAttribute('data-end', line.end);
        div.setAttribute('data-index', idx);
        
        div.innerHTML = `
            <span style="font-size:11px; color:var(--text-muted); background:rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 5px; margin-top:2px;">${formatTimeStr(line.start)}</span>
            <div style="flex:1; user-select: text;">${line.text}</div>
            <span style="font-size:12px; color:var(--accent); font-weight:bold;">🔊</span>
        `;
        
        // Hover effects in JS
        div.onmouseenter = () => {
            if (!div.classList.contains('active')) {
                div.style.background = 'rgba(255,255,255,0.04)';
            }
        };
        div.onmouseleave = () => {
            if (!div.classList.contains('active')) {
                div.style.background = 'rgba(255,255,255,0.01)';
            }
        };
        
        div.onclick = () => {
            audio.currentTime = parseFloat(line.start);
            if (audio.paused) {
                document.getElementById('btn-player-play').click();
            }
        };
        
        transcriptBox.appendChild(div);
    });
}

function handlePodcastTimeUpdate() {
    const audio = document.getElementById('podcast-audio-element');
    const seekbar = document.getElementById('player-seekbar');
    const timeCurrent = document.getElementById('player-time-current');
    const timeDuration = document.getElementById('player-time-duration');
    
    if (!audio || !audio.duration) return;
    
    // Update seekbar
    const pct = (audio.currentTime / audio.duration) * 100;
    if (seekbar) seekbar.value = pct;
    
    if (timeCurrent) timeCurrent.textContent = formatTimeStr(audio.currentTime);
    if (timeDuration) timeDuration.textContent = formatTimeStr(audio.duration);
    
    // TIMING HIGHLIGHT & AUTO-SCROLL KARAOKE
    const currentTime = audio.currentTime;
    const lines = document.querySelectorAll('.transcript-line');
    let activeLine = null;
    
    lines.forEach(line => {
        const start = parseFloat(line.getAttribute('data-start'));
        const end = parseFloat(line.getAttribute('data-end'));
        
        if (currentTime >= start && currentTime <= end) {
            activeLine = line;
        }
    });
    
    if (activeLine && activeLine !== lastActiveLineEl) {
        if (lastActiveLineEl) {
            lastActiveLineEl.classList.remove('active');
            lastActiveLineEl.style.background = 'rgba(255,255,255,0.01)';
            lastActiveLineEl.style.borderColor = 'transparent';
            lastActiveLineEl.style.color = 'var(--text-light)';
            lastActiveLineEl.style.fontWeight = 'normal';
        }
        
        activeLine.classList.add('active');
        activeLine.style.background = 'linear-gradient(90deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(var(--accent-rgb), 0.03) 100%)';
        activeLine.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
        activeLine.style.color = '#fff';
        activeLine.style.fontWeight = 'bold';
        
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        lastActiveLineEl = activeLine;
    }
}

function formatTimeStr(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ==========================================================================
// INIT & EVENT LISTENERS FOR NEW MODULES
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Stories tab
    const storyFilter = document.getElementById('story-level-filter');
    if (storyFilter) {
        storyFilter.addEventListener('change', () => renderStoriesGrid(storyFilter.value));
    }
    const btnBackStories = document.getElementById('btn-back-stories');
    if (btnBackStories) {
        btnBackStories.addEventListener('click', () => {
            document.getElementById('stories-grid').classList.remove('hidden');
            document.getElementById('story-reader').classList.add('hidden');
            renderStoriesGrid(document.getElementById('story-level-filter')?.value || 'all');
        });
    }
    // Render stories when tab becomes visible
    const btnStories = document.getElementById('btn-stories');
    if (btnStories) {
        btnStories.addEventListener('click', () => renderStoriesGrid(document.getElementById('story-level-filter')?.value || 'all'));
    }

    // Translation tab
    const btnTransCheck = document.getElementById('btn-trans-check');
    if (btnTransCheck) btnTransCheck.addEventListener('click', checkTranslation);
    const btnTransNext = document.getElementById('btn-trans-next');
    if (btnTransNext) btnTransNext.addEventListener('click', nextTranslation);
    const btnTransHint = document.getElementById('btn-trans-hint');
    if (btnTransHint) btnTransHint.addEventListener('click', showTransHint);
    const transDirFilter = document.getElementById('trans-dir-filter');
    if (transDirFilter) transDirFilter.addEventListener('change', initTranslation);
    const transLvlFilter = document.getElementById('trans-level-filter');
    if (transLvlFilter) transLvlFilter.addEventListener('change', initTranslation);
    const btnTranslation = document.getElementById('btn-translation');
    if (btnTranslation) btnTranslation.addEventListener('click', initTranslation);

    // Long translation tab
    const btnTransLongCheck = document.getElementById('btn-trans-long-check');
    if (btnTransLongCheck) btnTransLongCheck.addEventListener('click', checkLongTranslation);
    const btnTransLongNext = document.getElementById('btn-trans-long-next');
    if (btnTransLongNext) btnTransLongNext.addEventListener('click', nextLongTranslation);
    const btnTransLongHint = document.getElementById('btn-trans-long-hint');
    if (btnTransLongHint) btnTransLongHint.addEventListener('click', showLongTransHint);
    const transLongDirFilter = document.getElementById('trans-long-dir-filter');
    if (transLongDirFilter) transLongDirFilter.addEventListener('change', initLongTranslation);

    // Live counter for long translation
    const transLongInput = document.getElementById('trans-long-input');
    if (transLongInput) {
        transLongInput.addEventListener('input', () => {
            const text = transLongInput.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const cntEl = document.getElementById('trans-long-word-count');
            if (cntEl) cntEl.textContent = `${words} từ`;
        });
    }
});
