/* ==========================================================================
   LearningEnglish - Smart Translation Accuracy Checker (Standalone Engine)
   Công cụ kiểm tra dịch thuật thông minh - không phụ thuộc API bên ngoài
   ========================================================================== */

window.TranslationChecker = (function () {
    'use strict';

    // =========================================================================
    // SYNONYM LOOKUP TABLE
    // =========================================================================
    const SYNONYM_GROUPS = [
        // Common adjectives
        ['happy', 'glad', 'pleased', 'delighted', 'joyful', 'cheerful'],
        ['sad', 'unhappy', 'upset', 'sorrowful', 'miserable'],
        ['big', 'large', 'huge', 'enormous', 'massive', 'giant'],
        ['small', 'little', 'tiny', 'miniature', 'compact'],
        ['good', 'great', 'excellent', 'wonderful', 'fine', 'nice', 'fantastic'],
        ['bad', 'terrible', 'awful', 'horrible', 'poor', 'dreadful'],
        ['beautiful', 'pretty', 'gorgeous', 'lovely', 'attractive', 'stunning'],
        ['ugly', 'unattractive', 'hideous', 'unsightly'],
        ['fast', 'quick', 'rapid', 'swift', 'speedy'],
        ['slow', 'sluggish', 'gradual', 'unhurried'],
        ['smart', 'intelligent', 'clever', 'brilliant', 'bright', 'wise'],
        ['stupid', 'dumb', 'foolish', 'silly', 'ignorant'],
        ['rich', 'wealthy', 'affluent', 'prosperous'],
        ['poor', 'impoverished', 'needy', 'destitute'],
        ['important', 'significant', 'crucial', 'essential', 'vital', 'critical'],
        ['easy', 'simple', 'straightforward', 'effortless'],
        ['hard', 'difficult', 'tough', 'challenging', 'demanding'],
        ['old', 'ancient', 'elderly', 'aged'],
        ['new', 'modern', 'recent', 'fresh', 'novel'],
        ['strong', 'powerful', 'mighty', 'robust', 'sturdy'],
        ['weak', 'feeble', 'frail', 'fragile', 'delicate'],
        ['hot', 'warm', 'boiling', 'scorching', 'burning'],
        ['cold', 'cool', 'freezing', 'chilly', 'icy'],
        ['afraid', 'scared', 'frightened', 'terrified', 'fearful'],
        ['angry', 'mad', 'furious', 'enraged', 'irritated', 'annoyed'],
        ['tired', 'exhausted', 'weary', 'fatigued', 'worn out'],
        
        // Common verbs
        ['start', 'begin', 'commence', 'initiate'],
        ['finish', 'end', 'complete', 'conclude', 'wrap up'],
        ['make', 'create', 'produce', 'build', 'construct'],
        ['break', 'destroy', 'shatter', 'smash', 'demolish'],
        ['help', 'assist', 'aid', 'support'],
        ['like', 'enjoy', 'love', 'adore', 'appreciate', 'fancy'],
        ['hate', 'detest', 'despise', 'loathe', 'dislike'],
        ['want', 'desire', 'wish', 'crave', 'long for'],
        ['need', 'require', 'demand', 'necessitate'],
        ['think', 'believe', 'consider', 'suppose', 'reckon', 'assume'],
        ['say', 'tell', 'state', 'mention', 'declare', 'announce'],
        ['see', 'observe', 'notice', 'spot', 'witness', 'view'],
        ['look', 'watch', 'gaze', 'stare', 'glance', 'peek'],
        ['walk', 'stroll', 'wander', 'march', 'stride', 'hike'],
        ['run', 'sprint', 'dash', 'rush', 'race', 'jog'],
        ['eat', 'consume', 'devour', 'dine', 'munch'],
        ['buy', 'purchase', 'acquire', 'obtain', 'get'],
        ['give', 'offer', 'provide', 'deliver', 'present', 'donate'],
        ['take', 'grab', 'seize', 'snatch', 'collect'],
        ['understand', 'comprehend', 'grasp', 'realize', 'get'],
        ['show', 'demonstrate', 'display', 'exhibit', 'reveal'],
        ['try', 'attempt', 'endeavor', 'strive'],
        
        // Common nouns
        ['house', 'home', 'residence', 'dwelling'],
        ['car', 'vehicle', 'automobile'],
        ['child', 'kid', 'youngster'],
        ['doctor', 'physician', 'medic'],
        ['teacher', 'instructor', 'educator', 'tutor'],
        ['student', 'pupil', 'learner'],
        ['friend', 'companion', 'buddy', 'pal', 'mate'],
        ['job', 'work', 'occupation', 'profession', 'career', 'employment'],
        ['money', 'cash', 'funds', 'currency'],
        ['food', 'meal', 'dish', 'cuisine'],
        ['place', 'location', 'spot', 'site', 'area', 'region'],
        ['problem', 'issue', 'trouble', 'difficulty', 'challenge'],
        ['answer', 'reply', 'response', 'solution'],
        ['question', 'query', 'inquiry'],
        ['idea', 'thought', 'concept', 'notion'],
        ['story', 'tale', 'narrative', 'account'],
        
        // Adverbs
        ['quickly', 'rapidly', 'swiftly', 'fast', 'speedily', 'promptly'],
        ['slowly', 'gradually', 'steadily'],
        ['very', 'extremely', 'really', 'highly', 'incredibly', 'remarkably'],
        ['often', 'frequently', 'regularly', 'commonly'],
        ['sometimes', 'occasionally', 'now and then', 'from time to time'],
        ['never', 'not ever'],
        ['always', 'forever', 'constantly', 'continuously', 'perpetually'],
        
        // Vietnamese synonym groups (for Anh→Việt)
        ['xin chào', 'chào', 'chào bạn', 'hello'],
        ['cảm ơn', 'cám ơn', 'xin cảm ơn', 'cảm ơn bạn'],
        ['vui', 'vui vẻ', 'hạnh phúc', 'sung sướng'],
        ['buồn', 'buồn bã', 'đau buồn', 'u sầu'],
        ['đẹp', 'xinh', 'xinh đẹp', 'đẹp đẽ', 'tuyệt đẹp'],
        ['lớn', 'to', 'to lớn', 'khổng lồ'],
        ['nhỏ', 'bé', 'nhỏ bé', 'tí hon'],
        ['nhanh', 'nhanh chóng', 'mau', 'mau chóng'],
        ['chậm', 'chậm rãi', 'từ từ'],
        ['tốt', 'giỏi', 'hay', 'tuyệt vời', 'xuất sắc'],
        ['xấu', 'tệ', 'kém', 'tồi'],
        ['thích', 'yêu thích', 'ưa thích', 'mến'],
        ['ghét', 'không thích', 'chán ghét'],
        ['hiểu', 'hiểu biết', 'nắm bắt', 'lĩnh hội'],
        ['làm việc', 'công tác', 'lao động'],
        ['học', 'học tập', 'học hành'],
        ['bạn bè', 'bạn', 'bạn thân', 'người bạn'],
        ['nhà', 'nhà cửa', 'ngôi nhà', 'căn nhà'],
        ['gia đình', 'gia đình', 'nhà'],
    ];

    // Build fast synonym lookup map
    const synonymMap = new Map();
    SYNONYM_GROUPS.forEach(group => {
        group.forEach(word => {
            const lower = word.toLowerCase();
            if (!synonymMap.has(lower)) {
                synonymMap.set(lower, new Set());
            }
            group.forEach(syn => {
                if (syn.toLowerCase() !== lower) {
                    synonymMap.get(lower).add(syn.toLowerCase());
                }
            });
        });
    });

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================

    /**
     * Normalize a string for comparison
     */
    function normalize(str) {
        return str.toLowerCase().replace(/[.,!?;:'"()\-–—…""''「」]/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Tokenize a string into words
     */
    function tokenize(str) {
        return normalize(str).split(' ').filter(w => w.length > 0);
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,  // substitution
                        matrix[i][j - 1] + 1,       // insertion
                        matrix[i - 1][j] + 1         // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    /**
     * Check if two words are synonyms
     */
    function areSynonyms(word1, word2) {
        const w1 = word1.toLowerCase();
        const w2 = word2.toLowerCase();
        if (w1 === w2) return true;
        const syns = synonymMap.get(w1);
        return syns ? syns.has(w2) : false;
    }

    /**
     * Get the stem of a word (very basic — strips common suffixes)
     */
    function basicStem(word) {
        const w = word.toLowerCase();
        if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
        if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
        if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
        if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) return w.slice(0, -1);
        if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);
        if (w.endsWith('tion') && w.length > 6) return w.slice(0, -4);
        if (w.endsWith('ment') && w.length > 6) return w.slice(0, -4);
        return w;
    }

    /**
     * Check if two words share the same stem (related forms)
     */
    function areSameRoot(word1, word2) {
        return basicStem(word1) === basicStem(word2);
    }

    /**
     * Longest Common Subsequence length (for word order checking)
     */
    function lcsLength(arr1, arr2) {
        const m = arr1.length;
        const n = arr2.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    }

    /**
     * Content words filter — remove articles, prepositions, common stop words
     */
    const STOP_WORDS = new Set([
        'a', 'an', 'the', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
        'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'shall', 'should',
        'can', 'could', 'may', 'might', 'must',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'its', 'our', 'their',
        'this', 'that', 'these', 'those',
        'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as',
        'and', 'but', 'or', 'not', 'no', 'so', 'if', 'than', 'too', 'very',
        'just', 'also', 'about', 'up', 'out', 'then'
    ]);

    function isContentWord(word) {
        return !STOP_WORDS.has(word.toLowerCase());
    }

    // =========================================================================
    // TIER 1: TOKEN-LEVEL EXACT MATCH & DIFF
    // =========================================================================
    function analyzeTokenMatch(userTokens, refTokens) {
        const matched = [];
        const wrong = [];
        const missing = [];
        const extra = [];
        const synonymMatches = [];

        const refUsed = new Array(refTokens.length).fill(false);
        const userMatched = new Array(userTokens.length).fill(false);

        // Pass 1: Exact matches (position-aware)
        for (let i = 0; i < userTokens.length; i++) {
            for (let j = 0; j < refTokens.length; j++) {
                if (!refUsed[j] && !userMatched[i] && userTokens[i] === refTokens[j]) {
                    matched.push({ userIdx: i, refIdx: j, word: userTokens[i] });
                    refUsed[j] = true;
                    userMatched[i] = true;
                    break;
                }
            }
        }

        // Pass 2: Synonym matches
        for (let i = 0; i < userTokens.length; i++) {
            if (userMatched[i]) continue;
            for (let j = 0; j < refTokens.length; j++) {
                if (!refUsed[j] && areSynonyms(userTokens[i], refTokens[j])) {
                    synonymMatches.push({
                        userIdx: i, refIdx: j,
                        userWord: userTokens[i], refWord: refTokens[j]
                    });
                    refUsed[j] = true;
                    userMatched[i] = true;
                    break;
                }
            }
        }

        // Pass 3: Same-root matches (e.g., "friends" ↔ "friend")
        const rootMatches = [];
        for (let i = 0; i < userTokens.length; i++) {
            if (userMatched[i]) continue;
            for (let j = 0; j < refTokens.length; j++) {
                if (!refUsed[j] && areSameRoot(userTokens[i], refTokens[j])) {
                    rootMatches.push({
                        userIdx: i, refIdx: j,
                        userWord: userTokens[i], refWord: refTokens[j]
                    });
                    refUsed[j] = true;
                    userMatched[i] = true;
                    break;
                }
            }
        }

        // Remaining: unmatched user words = extra, unmatched ref words = missing
        for (let i = 0; i < userTokens.length; i++) {
            if (!userMatched[i]) extra.push({ idx: i, word: userTokens[i] });
        }
        for (let j = 0; j < refTokens.length; j++) {
            if (!refUsed[j]) missing.push({ idx: j, word: refTokens[j] });
        }

        return { matched, synonymMatches, rootMatches, wrong, missing, extra };
    }

    // =========================================================================
    // TIER 2: LEVENSHTEIN FUZZY MATCH (Typo Detection)
    // =========================================================================
    function detectTypos(extraWords, missingWords) {
        const typos = [];
        const remainingExtra = [];
        const remainingMissing = [...missingWords];

        for (const ex of extraWords) {
            let bestMatch = null;
            let bestDist = Infinity;
            let bestIdx = -1;

            for (let i = 0; i < remainingMissing.length; i++) {
                const dist = levenshtein(ex.word, remainingMissing[i].word);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestMatch = remainingMissing[i];
                    bestIdx = i;
                }
            }

            if (bestMatch && bestDist <= 2 && bestDist > 0) {
                typos.push({
                    userWord: ex.word,
                    expected: bestMatch.word,
                    distance: bestDist,
                    userIdx: ex.idx,
                    refIdx: bestMatch.idx,
                    severity: bestDist === 1 ? 'minor' : 'moderate'
                });
                remainingMissing.splice(bestIdx, 1);
            } else {
                remainingExtra.push(ex);
            }
        }

        return { typos, remainingExtra, remainingMissing };
    }

    // =========================================================================
    // TIER 3: GRAMMAR ERROR DETECTION (Rule-based)
    // =========================================================================
    function detectGrammarErrors(userText, refText, userTokens, refTokens, rootMatches) {
        const errors = [];

        // 3a. Plural/Singular mismatch (from rootMatches)
        for (const rm of rootMatches) {
            const uWord = rm.userWord;
            const rWord = rm.refWord;

            // User wrote plural, ref is singular
            if (uWord.endsWith('s') && !rWord.endsWith('s') && basicStem(uWord) === basicStem(rWord)) {
                errors.push({
                    type: 'grammar',
                    rule: 'plural_mismatch',
                    word: uWord,
                    expected: rWord,
                    message: `⚠️ "${uWord}" → nên là "${rWord}" (số ít)`
                });
            }
            // User wrote singular, ref is plural
            else if (!uWord.endsWith('s') && rWord.endsWith('s') && basicStem(uWord) === basicStem(rWord)) {
                errors.push({
                    type: 'grammar',
                    rule: 'plural_mismatch',
                    word: uWord,
                    expected: rWord,
                    message: `⚠️ "${uWord}" → nên là "${rWord}" (số nhiều)`
                });
            }
            // Tense mismatch: -ed vs base form
            else if (uWord.endsWith('ed') && !rWord.endsWith('ed') && basicStem(uWord) === basicStem(rWord)) {
                errors.push({
                    type: 'grammar',
                    rule: 'tense_mismatch',
                    word: uWord,
                    expected: rWord,
                    message: `⚠️ "${uWord}" → nên là "${rWord}" (sai thì)`
                });
            }
            else if (!uWord.endsWith('ed') && rWord.endsWith('ed') && basicStem(uWord) === basicStem(rWord)) {
                errors.push({
                    type: 'grammar',
                    rule: 'tense_mismatch',
                    word: uWord,
                    expected: rWord,
                    message: `⚠️ "${uWord}" → nên là "${rWord}" (cần dùng thì quá khứ)`
                });
            }
            // -ing form mismatch
            else if (uWord.endsWith('ing') !== rWord.endsWith('ing') && basicStem(uWord) === basicStem(rWord)) {
                errors.push({
                    type: 'grammar',
                    rule: 'tense_mismatch',
                    word: uWord,
                    expected: rWord,
                    message: `⚠️ "${uWord}" → nên là "${rWord}" (sai dạng động từ)`
                });
            }
        }

        // 3b. Article errors (missing or extra a/an/the)
        const refArticles = refTokens.filter(t => ['a', 'an', 'the'].includes(t));
        const userArticles = userTokens.filter(t => ['a', 'an', 'the'].includes(t));

        if (refArticles.length > userArticles.length) {
            const missing = refArticles.filter(a => {
                const idx = userArticles.indexOf(a);
                if (idx >= 0) { userArticles.splice(idx, 1); return false; }
                return true;
            });
            missing.forEach(art => {
                errors.push({
                    type: 'grammar',
                    rule: 'missing_article',
                    word: '(thiếu)',
                    expected: art,
                    message: `⚠️ Thiếu mạo từ "${art}" trong câu`
                });
            });
        }

        // 3c. Capitalization check (first letter of sentence)
        const userTrimmed = userText.trim();
        if (userTrimmed.length > 0 && userTrimmed[0] !== userTrimmed[0].toUpperCase()) {
            const refTrimmed = refText.trim();
            if (refTrimmed.length > 0 && refTrimmed[0] === refTrimmed[0].toUpperCase()) {
                errors.push({
                    type: 'grammar',
                    rule: 'capitalization',
                    word: userTrimmed.split(' ')[0],
                    expected: userTrimmed.split(' ')[0].charAt(0).toUpperCase() + userTrimmed.split(' ')[0].slice(1),
                    message: `⚠️ Chữ cái đầu câu phải viết hoa: "${userTrimmed.split(' ')[0]}" → "${userTrimmed.split(' ')[0].charAt(0).toUpperCase() + userTrimmed.split(' ')[0].slice(1)}"`
                });
            }
        }

        return errors;
    }

    // =========================================================================
    // TIER 4: WORD ORDER CHECK (LCS-based)
    // =========================================================================
    function checkWordOrder(userTokens, refTokens) {
        // Use only content words for order checking
        const userContent = userTokens.filter(isContentWord);
        const refContent = refTokens.filter(isContentWord);

        if (refContent.length === 0) return { score: 1.0, issues: [] };

        const lcs = lcsLength(userContent, refContent);
        const orderScore = lcs / Math.max(refContent.length, 1);

        const issues = [];
        if (orderScore < 0.7) {
            issues.push({
                type: 'order',
                message: '🔀 Thứ tự từ trong câu chưa đúng. Hãy kiểm tra lại cấu trúc câu.'
            });
        }

        return { score: orderScore, issues };
    }

    // =========================================================================
    // TIER 5: SCORING & FEEDBACK GENERATION
    // =========================================================================
    function calculateScore(analysis, direction) {
        const {
            matched, synonymMatches, rootMatches, typos,
            remainingExtra, remainingMissing,
            grammarErrors, orderResult,
            refTokens
        } = analysis;

        const totalRef = Math.max(refTokens.length, 1);

        // Adjust strictness based on direction
        const isEnToVi = direction === 'en-vi';
        const strictnessFactor = isEnToVi ? 0.8 : 1.0; // Anh→Việt ít nghiêm khắc hơn

        // 1. Exact word match (40 pts)
        const exactCount = matched.length + synonymMatches.length;
        const partialCount = rootMatches.length * 0.7 + typos.length * 0.5;
        const matchScore = Math.min(40, Math.round(((exactCount + partialCount) / totalRef) * 40));

        // 2. Grammar accuracy (25 pts) - only for Việt→Anh
        let grammarScore = 25;
        if (!isEnToVi) {
            grammarErrors.forEach(err => {
                if (err.rule === 'capitalization') grammarScore -= 3;
                else if (err.rule === 'missing_article') grammarScore -= 4;
                else grammarScore -= 5;
            });
        } else {
            // Anh→Việt: less penalty for grammar
            grammarErrors.forEach(() => { grammarScore -= 2; });
        }
        grammarScore = Math.max(0, grammarScore);

        // 3. Word order (15 pts)
        const orderScore = Math.round(orderResult.score * 15);

        // 4. Completeness — no missing content words (10 pts)
        const missingContent = remainingMissing.filter(m => isContentWord(m.word));
        const completenessScore = Math.max(0, 10 - missingContent.length * 3);

        // 5. No extra words (10 pts)
        const extraPenalty = Math.min(10, remainingExtra.length * 2);
        const extraScore = Math.max(0, 10 - extraPenalty);

        let total = Math.round((matchScore + grammarScore + orderScore + completenessScore + extraScore) * strictnessFactor);
        // Boost: if strictnessFactor < 1 (en-vi), ensure we don't go below the proportional score
        if (isEnToVi) {
            total = Math.min(100, Math.round(total / strictnessFactor * 0.9));
            total = Math.max(total, matchScore + grammarScore + orderScore + completenessScore + extraScore - 10);
            total = Math.min(100, total);
        }
        total = Math.max(0, Math.min(100, total));

        // Determine grade
        let grade;
        if (total >= 90) grade = 'excellent';
        else if (total >= 70) grade = 'good';
        else if (total >= 45) grade = 'needs_work';
        else grade = 'incorrect';

        return {
            total,
            grade,
            breakdown: { matchScore, grammarScore, orderScore, completenessScore, extraScore }
        };
    }

    function generateFeedback(score, grade, errors, direction) {
        const isEnToVi = direction === 'en-vi';
        let feedback = '';

        if (grade === 'excellent') {
            feedback = '🌟 Xuất sắc! Bản dịch của bạn rất chính xác và tự nhiên.';
        } else if (grade === 'good') {
            feedback = '👍 Tốt! Bản dịch khá chính xác, chỉ cần chỉnh sửa vài chi tiết nhỏ.';
        } else if (grade === 'needs_work') {
            feedback = '✍️ Khá ổn! Bạn đã nắm được ý chính nhưng cần cải thiện ngữ pháp và từ vựng.';
        } else {
            feedback = '❌ Chưa chính xác. Hãy xem đáp án mẫu và thử lại nhé!';
        }

        if (errors.length > 0 && grade !== 'excellent') {
            feedback += ` Phát hiện ${errors.length} lỗi cần chú ý.`;
        }

        return feedback;
    }

    // =========================================================================
    // BUILD HIGHLIGHTS for UI rendering
    // =========================================================================
    function buildHighlights(userTokensRaw, analysis) {
        const { matched, synonymMatches, rootMatches, typos, remainingExtra, remainingMissing } = analysis;

        const highlights = {
            correct: [],    // { idx, word }
            synonym: [],    // { idx, word, refWord }
            wrong: [],      // { idx, word, expected, type }
            missing: [],    // { word }
            extra: []       // { idx, word }
        };

        // Correct (exact match)
        matched.forEach(m => {
            highlights.correct.push({ idx: m.userIdx, word: userTokensRaw[m.userIdx] || m.word });
        });

        // Synonym match
        synonymMatches.forEach(s => {
            highlights.synonym.push({ idx: s.userIdx, word: userTokensRaw[s.userIdx] || s.userWord, refWord: s.refWord });
        });

        // Root match (grammar difference) + Typos
        rootMatches.forEach(r => {
            highlights.wrong.push({ idx: r.userIdx, word: userTokensRaw[r.userIdx] || r.userWord, expected: r.refWord, type: 'grammar' });
        });
        typos.forEach(t => {
            highlights.wrong.push({ idx: t.userIdx, word: userTokensRaw[t.userIdx] || t.userWord, expected: t.expected, type: 'typo' });
        });

        // Extra words
        remainingExtra.forEach(e => {
            highlights.extra.push({ idx: e.idx, word: userTokensRaw[e.idx] || e.word });
        });

        // Missing words
        remainingMissing.forEach(m => {
            highlights.missing.push({ word: m.word });
        });

        return highlights;
    }

    // =========================================================================
    // MAIN CHECK FUNCTION
    // =========================================================================

    /**
     * Perform smart translation accuracy check
     * @param {string} userAnswer - User's translation attempt
     * @param {string} referenceAnswer - Correct reference answer
     * @param {string} direction - 'vi-en' or 'en-vi'
     * @returns {Object} Detailed analysis result
     */
    function check(userAnswer, referenceAnswer, direction = 'vi-en') {
        if (!userAnswer || !referenceAnswer) {
            return {
                score: 0,
                grade: 'incorrect',
                errors: [],
                highlights: { correct: [], synonym: [], wrong: [], missing: [], extra: [] },
                feedback: '⚠️ Vui lòng nhập bản dịch!',
                breakdown: { matchScore: 0, grammarScore: 0, orderScore: 0, completenessScore: 0, extraScore: 0 }
            };
        }

        // Preserve raw tokens for highlight display (before lowercasing)
        const userTokensRaw = userAnswer.replace(/[.,!?;:'"()\-–—…""''「」]/g, '').split(/\s+/).filter(w => w.length > 0);

        const userTokens = tokenize(userAnswer);
        const refTokens = tokenize(referenceAnswer);

        // Exact match shortcut
        if (normalize(userAnswer) === normalize(referenceAnswer)) {
            return {
                score: 100,
                grade: 'excellent',
                errors: [],
                highlights: {
                    correct: userTokensRaw.map((w, i) => ({ idx: i, word: w })),
                    synonym: [], wrong: [], missing: [], extra: []
                },
                feedback: '🌟 Hoàn hảo! Bản dịch chính xác 100%!',
                breakdown: { matchScore: 40, grammarScore: 25, orderScore: 15, completenessScore: 10, extraScore: 10 }
            };
        }

        // Tier 1: Token matching
        const tokenAnalysis = analyzeTokenMatch(userTokens, refTokens);

        // Tier 2: Typo detection on unmatched words
        const { typos, remainingExtra, remainingMissing } = detectTypos(tokenAnalysis.extra, tokenAnalysis.missing);

        // Tier 3: Grammar errors
        const grammarErrors = detectGrammarErrors(
            userAnswer, referenceAnswer,
            userTokens, refTokens,
            tokenAnalysis.rootMatches
        );

        // Combine typo errors into errors list
        const allErrors = [
            ...grammarErrors,
            ...typos.map(t => ({
                type: 'typo',
                word: t.userWord,
                expected: t.expected,
                distance: t.distance,
                message: `✏️ Lỗi chính tả: "${t.userWord}" → "${t.expected}"`
            })),
            ...remainingMissing.filter(m => isContentWord(m.word)).map(m => ({
                type: 'missing',
                word: m.word,
                expected: m.word,
                message: `📝 Thiếu từ quan trọng: "${m.word}"`
            })),
            ...remainingExtra.filter(e => isContentWord(e.word)).map(e => ({
                type: 'extra',
                word: e.word,
                expected: '',
                message: `🔸 Từ thừa: "${e.word}" không có trong đáp án mẫu`
            }))
        ];

        // Tier 4: Word order
        const orderResult = checkWordOrder(userTokens, refTokens);
        if (orderResult.issues.length > 0) {
            allErrors.push(...orderResult.issues);
        }

        // Tier 5: Calculate final score
        const fullAnalysis = {
            matched: tokenAnalysis.matched,
            synonymMatches: tokenAnalysis.synonymMatches,
            rootMatches: tokenAnalysis.rootMatches,
            typos,
            remainingExtra,
            remainingMissing,
            grammarErrors,
            orderResult,
            refTokens
        };

        const { total, grade, breakdown } = calculateScore(fullAnalysis, direction);

        // Build highlights
        const highlights = buildHighlights(userTokensRaw, {
            matched: tokenAnalysis.matched,
            synonymMatches: tokenAnalysis.synonymMatches,
            rootMatches: tokenAnalysis.rootMatches,
            typos,
            remainingExtra,
            remainingMissing
        });

        // Generate feedback
        const feedback = generateFeedback(total, grade, allErrors, direction);

        return {
            score: total,
            grade,
            errors: allErrors,
            highlights,
            feedback,
            breakdown
        };
    }

    /**
     * Check a long paragraph translation by splitting into sentences
     * @param {string} userAnswer - User's full paragraph
     * @param {string} referenceAnswer - Reference paragraph
     * @param {string} direction - 'vi-en' or 'en-vi'
     * @returns {Object} Aggregated analysis result
     */
    function checkParagraph(userAnswer, referenceAnswer, direction = 'vi-en') {
        // For long paragraphs, use the same engine but on the full text
        // This works well because the token-matching handles multi-sentence input
        const result = check(userAnswer, referenceAnswer, direction);

        // Additionally, provide per-sentence breakdown for detailed review
        const userSentences = userAnswer.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const refSentences = referenceAnswer.split(/[.!?]+/).filter(s => s.trim().length > 0);

        const sentenceResults = [];
        const maxLen = Math.max(userSentences.length, refSentences.length);

        for (let i = 0; i < maxLen; i++) {
            const uSent = (userSentences[i] || '').trim();
            const rSent = (refSentences[i] || '').trim();
            if (uSent && rSent) {
                sentenceResults.push(check(uSent, rSent, direction));
            }
        }

        return {
            ...result,
            sentenceBreakdown: sentenceResults
        };
    }

    /**
     * Render highlighted HTML for user's translation
     * @param {string} userAnswer - Original user input
     * @param {Object} highlights - From check() result
     * @returns {string} HTML with colored spans
     */
    function renderHighlightedHTML(userAnswer, highlights) {
        const tokens = userAnswer.replace(/[.,!?;:'"()\-–—…""''「」]/g, ' ').split(/\s+/).filter(w => w.length > 0);

        // Build index map
        const colorMap = {};
        highlights.correct.forEach(h => { colorMap[h.idx] = 'correct'; });
        highlights.synonym.forEach(h => { colorMap[h.idx] = 'synonym'; });
        highlights.wrong.forEach(h => { colorMap[h.idx] = h.type === 'typo' ? 'typo' : 'grammar'; });
        highlights.extra.forEach(h => { colorMap[h.idx] = 'extra'; });

        const styles = {
            correct: 'color: #4ade80; font-weight: 600;',
            synonym: 'color: #60a5fa; font-weight: 600; text-decoration: underline dotted;',
            grammar: 'color: #f87171; font-weight: 700; text-decoration: underline wavy #f87171;',
            typo: 'color: #fbbf24; font-weight: 600; text-decoration: underline wavy #fbbf24;',
            extra: 'color: #a78bfa; font-weight: 500; text-decoration: line-through;'
        };

        let html = '';
        tokens.forEach((token, i) => {
            const type = colorMap[i];
            if (type) {
                let title = '';
                if (type === 'synonym') {
                    const syn = highlights.synonym.find(h => h.idx === i);
                    title = syn ? `Đồng nghĩa với "${syn.refWord}"` : '';
                } else if (type === 'grammar' || type === 'typo') {
                    const wrong = highlights.wrong.find(h => h.idx === i);
                    title = wrong ? `Nên là "${wrong.expected}"` : '';
                } else if (type === 'extra') {
                    title = 'Từ thừa';
                }
                html += `<span style="${styles[type]}" title="${title}">${token}</span> `;
            } else {
                html += `<span style="color: var(--text-main);">${token}</span> `;
            }
        });

        // Show missing words
        if (highlights.missing.length > 0) {
            html += '<br><span style="font-size: 12px; color: var(--text-muted);">Thiếu: ';
            html += highlights.missing.map(m =>
                `<span style="color: #f87171; font-style: italic;">${m.word}</span>`
            ).join(', ');
            html += '</span>';
        }

        return html;
    }

    /**
     * Render error list as HTML
     */
    function renderErrorsHTML(errors) {
        if (errors.length === 0) return '';

        let html = '<div style="margin-top: 8px; padding: 8px 10px; background: rgba(0,0,0,0.15); border-radius: 8px; font-size: 13px;">';
        html += '<div style="font-weight: 600; margin-bottom: 6px; color: var(--text-main);">📋 Chi tiết lỗi:</div>';

        errors.forEach(err => {
            if (err.message) {
                html += `<div style="margin-bottom: 4px; color: var(--text-muted);">${err.message}</div>`;
            }
        });

        html += '</div>';
        return html;
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    return {
        check,
        checkParagraph,
        renderHighlightedHTML,
        renderErrorsHTML,
        // Expose utilities for testing
        levenshtein,
        areSynonyms,
        tokenize,
        normalize
    };
})();
