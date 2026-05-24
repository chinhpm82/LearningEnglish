const fs = require('fs');

function formatJsonFile(filename) {
    if (!fs.existsSync(filename)) return;
    try {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        const lines = data.map(item => "  " + JSON.stringify(item));
        const newContent = "[\n" + lines.join(",\n") + "\n]\n";
        fs.writeFileSync(filename, newContent, 'utf8');
        console.log("Formatted " + filename);
    } catch (e) {
        console.error("Error formatting " + filename, e);
    }
}

formatJsonFile('data/json/vocab-A1-A2.json');
formatJsonFile('data/json/vocab-B1-B2.json');
formatJsonFile('data/json/vocab-C1-C2.json');
