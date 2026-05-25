// --- TABS ROUTER & MENU NAVIGATION ---
function setUpTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Tự động đóng sidebar drawer di động sau khi chuyển mục học tập
            closeMobileMenu();
            
            // Toggle active menu states
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Hide/Show correct panels
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Special tab trigger initializations
            if (targetId === 'flashcard-tab') {
                const category = document.getElementById('flashcard-category').value;
                initFlashcardSession(category);
            } else if (targetId === 'wordbook-tab') {
                renderWordbook();
            } else if (targetId === 'sentences-tab') {
                renderSentences();
            } else if (targetId === 'grammar-tab') {
                renderGrammarLessons();
            } else if (targetId === 'dashboard-tab') {
                renderDashboard();
            } else if (targetId === 'leaderboard-tab') {
                renderLeaderboard();
            } else if (targetId === 'translation-tab') {
                initTranslation();
                initLongTranslation();
            } else if (targetId === 'writing-tab') {
                initWritingRoom();
            } else if (targetId === 'podcast-tab') {
                initPodcastRoom();
            }
        });
    });
}

// --- MOBILE RESPONSIVE DRAWER CORE FUNCTIONS ---
function openMobileMenu() {
    const hamburger = document.getElementById('btn-hamburger');
    const appHeader = document.getElementById('app-header');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (hamburger && appHeader && overlay) {
        hamburger.classList.add('open');
        appHeader.classList.add('menu-active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang nền
    }
}

function closeMobileMenu() {
    const hamburger = document.getElementById('btn-hamburger');
    const appHeader = document.getElementById('app-header');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (hamburger && appHeader && overlay) {
        hamburger.classList.remove('open');
        appHeader.classList.remove('menu-active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Mở khóa cuộn trang nền
    }
}

function initMobileMenuListeners() {
    const hamburger = document.getElementById('btn-hamburger');
    const closeBtn = document.getElementById('btn-close-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = hamburger.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}

