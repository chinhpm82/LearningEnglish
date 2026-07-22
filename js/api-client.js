/* ==========================================================================
   LearningEnglish - Backend API Client
   ========================================================================== */

const ApiClient = (function () {
    const BASE_URL = 'https://117.4.241.150:30781';
    const JWT_KEY = 'le_jwt';

    function getToken() {
        return localStorage.getItem(JWT_KEY);
    }

    function setToken(token) {
        localStorage.setItem(JWT_KEY, token);
    }

    function clearToken() {
        localStorage.removeItem(JWT_KEY);
    }

    function isLoggedIn() {
        return !!getToken();
    }

    async function request(method, path, body, requireAuth) {
        const headers = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        let res;
        try {
            res = await fetch(BASE_URL + path, opts);
        } catch (e) {
            console.error('[API] Network error:', path, e);
            throw e;
        }

        if (res.status === 401 && requireAuth) {
            clearToken();
            window.dispatchEvent(new CustomEvent('AuthExpired'));
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error('API ' + res.status + ': ' + text);
        }

        return res.json();
    }

    function transformVocab(item) {
        if (!item) return item;
        const out = Object.assign({}, item);
        if (out.exampleVi !== undefined) {
            out.example_vi = out.exampleVi;
            delete out.exampleVi;
        }
        if (out.nextReview !== undefined) {
            out.nextReview = typeof out.nextReview === 'number' ? out.nextReview : (out.nextReview ? new Date(out.nextReview).getTime() : 0);
        }
        return out;
    }

    function transformVocabList(items) {
        if (!items || !Array.isArray(items)) return [];
        return items.map(transformVocab);
    }

    // --- Auth ---
    async function login(firebaseToken) {
        const data = await request('POST', '/api/auth/login', { firebaseToken }, false);
        setToken(data.token);
        return data;
    }

    async function getMe() {
        return request('GET', '/api/auth/me', null, true);
    }

    // --- Academic Data (all public, no auth needed) ---
    async function getVocab(params) {
        const qs = buildQuery(Object.assign({ limit: 5000 }, params));
        const data = await request('GET', '/api/vocab?' + qs, null, false);
        data.data = transformVocabList(data.data);
        return data;
    }

    async function getVocabById(id) {
        const item = await request('GET', '/api/vocab/' + encodeURIComponent(id), null, false);
        return transformVocab(item);
    }

    async function searchVocab(q, limit) {
        const qs = buildQuery({ q: q, limit: limit || 20 });
        const data = await request('GET', '/api/vocab/search?' + qs, null, false);
        data.data = transformVocabList(data.data);
        return data;
    }

    async function getGrammar(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/grammar?' + qs, null, false);
    }

    async function getGrammarById(id) {
        return request('GET', '/api/grammar/' + encodeURIComponent(id), null, false);
    }

    async function getSentences(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/sentences?' + qs, null, false);
    }

    async function getStories(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/stories?' + qs, null, false);
    }

    async function getStoryById(id) {
        return request('GET', '/api/stories/' + encodeURIComponent(id), null, false);
    }

    async function getPodcasts(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/podcasts?' + qs, null, false);
    }

    async function getPodcastById(id) {
        return request('GET', '/api/podcasts/' + encodeURIComponent(id), null, false);
    }

    async function getTranslations(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/translations?' + qs, null, false);
    }

    async function getTranslationById(id) {
        return request('GET', '/api/translations/' + encodeURIComponent(id), null, false);
    }

    async function getLongTranslations(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/long-translations?' + qs, null, false);
    }

    async function getLongTranslationById(id) {
        return request('GET', '/api/long-translations/' + encodeURIComponent(id), null, false);
    }

    async function getWriting(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/writing?' + qs, null, false);
    }

    async function getPlacement(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/placement-questions?' + qs, null, false);
    }

    async function getPlacementById(id) {
        return request('GET', '/api/placement-questions/' + encodeURIComponent(id), null, false);
    }

    async function getQuiz(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/quiz-questions?' + qs, null, false);
    }

    async function getGrammarPractice(params) {
        const qs = buildQuery(Object.assign({ limit: 500 }, params));
        return request('GET', '/api/grammar-questions?' + qs, null, false);
    }

    // --- Quiz Generate/Submit (auth required) ---
    async function generateQuiz(difficulty, count) {
        return request('POST', '/api/quiz/generate', { difficulty: difficulty, count: count || 10 }, true);
    }

    async function submitQuiz(difficulty, answers) {
        return request('POST', '/api/quiz/submit', { difficulty: difficulty, answers: answers }, true);
    }

    async function getQuizSessions(limit) {
        const qs = buildQuery({ limit: limit || 20 });
        return request('GET', '/api/quiz/sessions?' + qs, null, true);
    }

    // --- Placement Generate/Submit (auth required) ---
    async function generatePlacement(type, count) {
        return request('POST', '/api/placement/generate', { type: type, count: count || 20 }, true);
    }

    async function submitPlacement(type, answers, currentLevel) {
        return request('POST', '/api/placement/submit', { type: type, answers: answers, currentLevel: currentLevel }, true);
    }

    async function getPlacementSessions(limit) {
        const qs = buildQuery({ limit: limit || 20 });
        return request('GET', '/api/placement/sessions?' + qs, null, true);
    }

    // --- Grammar Practice Generate/Submit (auth required) ---
    async function generateGrammarPractice(grammarId, count) {
        return request('POST', '/api/grammar-practice/generate', { grammarId: grammarId, count: count || 10 }, true);
    }

    async function submitGrammarPractice(grammarId, answers) {
        return request('POST', '/api/grammar-practice/submit', { grammarId: grammarId, answers: answers }, true);
    }

    async function getGrammarSessions(limit) {
        const qs = buildQuery({ limit: limit || 20 });
        return request('GET', '/api/grammar-practice/sessions?' + qs, null, true);
    }

    async function getVocabRandom(level, exclude, category) {
        const params = {};
        if (level) params.level = level;
        if (exclude && exclude.length > 0) params.exclude = exclude.join(',');
        if (category) params.category = category;
        const qs = buildQuery(params);
        return request('GET', '/api/vocab/random?' + qs, null, false);
    }

    async function getVocabRandomBatch(level, count, exclude, category) {
        const params = { count: count || 10 };
        if (level) params.level = level;
        if (exclude && exclude.length > 0) params.exclude = exclude.join(',');
        if (category) params.category = category;
        const qs = buildQuery(params);
        return request('GET', '/api/vocab/random-batch?' + qs, null, false);
    }

    // --- User Progress (auth required) ---
    async function getProgress() {
        const data = await request('GET', '/api/user/progress', null, true);
        return data.data || [];
    }

    async function saveProgress(vocabId, box, nextReview) {
        return request('POST', '/api/user/progress', { vocabId: String(vocabId), box: box, nextReview: nextReview }, true);
    }

    async function getProgressSummary() {
        return request('GET', '/api/user/progress/summary', null, true);
    }

    // --- User Profile (auth required) ---
    async function getProfile() {
        return request('GET', '/api/user/profile', null, true);
    }

    async function updateProfile(profileData) {
        return request('PUT', '/api/user/profile', profileData, true);
    }

    // --- Custom Words (auth required) ---
    async function getCustomWords() {
        const data = await request('GET', '/api/user/custom-words', null, true);
        return data.data || [];
    }

    async function addCustomWord(wordObj) {
        return request('POST', '/api/user/custom-words', wordObj, true);
    }

    async function deleteCustomWord(id) {
        return request('DELETE', '/api/user/custom-words/' + encodeURIComponent(id), null, true);
    }

    // --- Leaderboard ---
    async function getLeaderboard() {
        const data = await request('GET', '/api/user/leaderboard', null, false);
        return data.data || [];
    }

    // --- Utility ---
    function buildQuery(params) {
        const entries = Object.entries(params).filter(function (e) { return e[1] !== undefined && e[1] !== null && e[1] !== ''; });
        return new URLSearchParams(entries).toString();
    }

    // --- Expose ---
    return {
        getToken: getToken,
        setToken: setToken,
        clearToken: clearToken,
        isLoggedIn: isLoggedIn,
        login: login,
        getMe: getMe,
        getVocab: getVocab,
        getVocabById: getVocabById,
        getVocabRandom: getVocabRandom,
        getVocabRandomBatch: getVocabRandomBatch,
        searchVocab: searchVocab,
        getGrammar: getGrammar,
        getGrammarById: getGrammarById,
        getSentences: getSentences,
        getStories: getStories,
        getStoryById: getStoryById,
        getPodcasts: getPodcasts,
        getPodcastById: getPodcastById,
        getTranslations: getTranslations,
        getTranslationById: getTranslationById,
        getLongTranslations: getLongTranslations,
        getLongTranslationById: getLongTranslationById,
        getWriting: getWriting,
        getPlacement: getPlacement,
        getPlacementById: getPlacementById,
        getQuiz: getQuiz,
        generateQuiz: generateQuiz,
        submitQuiz: submitQuiz,
        getQuizSessions: getQuizSessions,
        generatePlacement: generatePlacement,
        submitPlacement: submitPlacement,
        getPlacementSessions: getPlacementSessions,
        generateGrammarPractice: generateGrammarPractice,
        submitGrammarPractice: submitGrammarPractice,
        getGrammarSessions: getGrammarSessions,
        getGrammarPractice: getGrammarPractice,
        getProgress: getProgress,
        saveProgress: saveProgress,
        getProgressSummary: getProgressSummary,
        getProfile: getProfile,
        updateProfile: updateProfile,
        getCustomWords: getCustomWords,
        addCustomWord: addCustomWord,
        deleteCustomWord: deleteCustomWord,
        getLeaderboard: getLeaderboard
    };
})();

window.ApiClient = ApiClient;
