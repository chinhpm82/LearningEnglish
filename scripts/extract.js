const fs = require('fs');

// Read existing placement questions
const content = fs.readFileSync('data/placement-questions.js', 'utf8');
const match = content.match(/const PLACEMENT_QUESTIONS = (\[[\s\S]*\]);/);
if (match) {
    const questions = eval(match[1]); // Safe since it's just local JS data
    
    let a1a2 = [];
    let b1b2 = [];
    let c1c2 = [];

    questions.forEach(q => {
        if (q.level.includes('A1') || q.level.includes('A2')) a1a2.push(q);
        else if (q.level.includes('B1') || q.level.includes('B2') || q.level.includes('A3') || q.level.includes('B3')) b1b2.push(q);
        else if (q.level.includes('C1') || q.level.includes('C2')) c1c2.push(q);
    });

    const addToFile = (filename, newItems) => {
        let existing = [];
        try {
            existing = JSON.parse(fs.readFileSync(filename, 'utf8'));
        } catch(e) {}
        
        // merge, avoiding duplicate IDs
        newItems.forEach(item => {
            if (!existing.find(e => e.id === item.id)) {
                existing.push(item);
            }
        });
        fs.writeFileSync(filename, JSON.stringify(existing, null, 2));
    }

    addToFile('data/json/questions-A1-A2.json', a1a2);
    addToFile('data/json/questions-B1-B2.json', b1b2);
    addToFile('data/json/questions-C1-C2.json', c1c2);
    
    console.log(`Extracted ${questions.length} questions into JSON files.`);
} else {
    console.log('Could not parse placement-questions.js');
}
