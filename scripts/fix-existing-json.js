const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'));
        data = data.map(item => {
            if (!item.id) item.id = `voc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}`;
            if (!item.box) item.box = 1;
            if (item.nextReview === undefined) item.nextReview = 0;
            if (!item.category) item.category = "oxford";
            if (!item.ipa) item.ipa = "/.../";
            if (!item.example_vi) item.example_vi = "(bản dịch ví dụ)";
            return item;
        });
        const lines = data.map(item => "  " + JSON.stringify(item));
        const newContent = "[\n" + lines.join(",\n") + "\n]\n";
        fs.writeFileSync(file, newContent, 'utf8');
        console.log("Fixed", file);
    } catch(e) {}
}

fixFile('data/json/vocab-A1-A2.json');
fixFile('data/json/vocab-B1-B2.json');
fixFile('data/json/vocab-C1-C2.json');
