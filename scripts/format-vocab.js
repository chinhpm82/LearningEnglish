const fs = require('fs');

const content = fs.readFileSync('data/vocabulary-data.js', 'utf8');
const match = content.match(/const INITIAL_VOCABULARY = (\[[\s\S]*\]);/);
if (match) {
    const vocab = eval(match[1]); // Safe since it's local JS
    
    let newContent = `/* ==========================================================================
   LearningEnglish - Unified Curated Essential & Specialized Vocabulary Dataset
   ========================================================================== */

const INITIAL_VOCABULARY = [\n`;

    const lines = vocab.map(item => "    " + JSON.stringify(item));
    newContent += lines.join(",\n");
    newContent += "\n];\n";

    fs.writeFileSync('data/vocabulary-data.js', newContent);
    console.log("Successfully reformatted data/vocabulary-data.js to 1 line per word.");
} else {
    console.log("Failed to match INITIAL_VOCABULARY");
}
