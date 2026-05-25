const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('app.js', 'utf8');

// Define sections using a regex that splits at the header comments.
// We'll capture the header comment so we know which section it is.
const sections = content.split(/\/\/\s*---\s*([A-Za-z0-9 _&()\-]+)\s*---\s*\n/i);

const files = {
    'state.js': ['GLOBAL APPLICATION STATE', 'CORE UTILITY FUNCTIONS'],
    'dashboard.js': ['RENDERING & UI SYNC', 'ADAPTIVE PLACEMENT TEST STATE'],
    'flashcards.js': ['FLASHCARD ENGINE (LEITNER SRS SYSTEM)'],
    'quiz.js': ['DYNAMIC QUIZ SYSTEM'],
    'roadmap.js': ['DYNAMIC LEARNING ROADMAP RENDERER & ALGORITHM', 'AUTO-CHECK DAILY ROADMAP TASKS SYSTEM'],
    'wordbook.js': ['PERSONAL WORDBOOK MANAGEMENT'],
    'grammar.js': ['INTERACTIVE GRAMMAR LEARNING CONTROLLER'],
    'reading.js': ['COMMUNICATIVE SENTENCES RENDERER'],
    'navigation.js': ['TABS ROUTER & MENU NAVIGATION', 'MOBILE RESPONSIVE DRAWER CORE FUNCTIONS'],
    'main.js': ['EVENT LISTENERS INITIALIZATION'],
    'gamification.js': ['GLOBAL GAMIFICATION & STARS CORE FUNCTIONS', 'GLOBAL LEADERBOARD UI RENDERER', 'CUTE ANIMAL AVATARS SELECTION SYSTEM'],
    'translation.js': ['Sub-tabs translation switching logic', 'Long Translation Mode'],
    'writing.js': ['AI Writing Room', 'ADAPTIVE CEFR EVALUATION ADJUSTMENTS', 'PEDAGOGICAL SAFETY & ANTI-EXPLOIT VALIDATION', 'ACADEMIC INTEGRITY MONITORING SYSTEM (Copy-Paste & AI Detection)', 'GRAMMAR & SPELLING HEURISTICS ENGINE'],
    'podcast.js': ['Podcast Room Logic']
};

if (!fs.existsSync('js')) fs.mkdirSync('js');

// `sections` will be: [ preamble, header1, body1, header2, body2, ... ]
let currentFile = 'state.js'; // Default for the very first un-headered chunk
let fileContents = {};
for (let key in files) {
    fileContents[key] = '';
}

fileContents['state.js'] += sections[0]; // The preamble

for (let i = 1; i < sections.length; i += 2) {
    let headerName = sections[i].trim();
    let body = sections[i+1];
    
    // Find which file this header belongs to
    let found = false;
    for (let file in files) {
        if (files[file].includes(headerName)) {
            currentFile = file;
            found = true;
            break;
        }
    }
    if (!found) {
        console.warn('Unknown header, appending to ' + currentFile + ':', headerName);
    }
    
    fileContents[currentFile] += '// --- ' + headerName + ' ---\n' + body;
}

// Write the files
let scriptTags = [];
for (let file in fileContents) {
    if (fileContents[file].trim() !== '') {
        fs.writeFileSync(path.join('js', file), fileContents[file]);
        console.log(`Wrote js/${file}`);
        scriptTags.push(`<script src="js/${file}" defer></script>`);
    }
}

// Empty app.js
fs.writeFileSync('app.js', '// app.js has been split into multiple files in the js/ directory.\n');

console.log('\nAll split done. Add the following to index.html:\n' + scriptTags.join('\n'));
