require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_api_key_here') {
    console.error("❌ ERROR: Bạn chưa cấu hình GEMINI_API_KEY trong file .env!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("🛠 CÁCH SỬ DỤNG SCRAPER TỪ VỰNG OXFORD 5000:");
    console.log("-------------------------------");
    console.log("node scripts/scrape-vocab.js <level> <count>");
    console.log("  - level: 'A1-A2', 'B1-B2', hoặc 'C1-C2'");
    console.log("  - count: Số lượng từ muốn tải & dịch (VD: 100)");
    console.log("\nVí dụ: node scripts/scrape-vocab.js B1-B2 100");
    process.exit(1);
}

const targetLevel = args[0];
const count = parseInt(args[1]);

const levelMap = {
    'A1-A2': ['a1', 'a2'],
    'B1-B2': ['b1', 'b2'],
    'C1-C2': ['c1', 'c2']
};

if (!levelMap[targetLevel]) {
    console.error("❌ ERROR: Level phải là 'A1-A2', 'B1-B2', hoặc 'C1-C2'");
    process.exit(1);
}

const OXFORD_DATA_URL = 'https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/main/data/oxford_5000.json';
const BATCH_SIZE = 25; // Dịch 25 từ mỗi lần qua API

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function getFilePath() {
    return path.join(__dirname, '..', 'data', 'json', `vocab-${targetLevel}.json`);
}

function loadExistingData() {
    let currentJSON = [];
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
        try { currentJSON = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch(e) {}
    }
    
    // Đọc thêm từ vựng từ data/vocabulary-data.js cũ để tránh trùng lặp
    let legacyWords = [];
    const legacyPath = path.join(__dirname, '..', 'data', 'vocabulary-data.js');
    if (fs.existsSync(legacyPath)) {
        try {
            const content = fs.readFileSync(legacyPath, 'utf8');
            // Dùng Regex lấy tất cả "word": "..."
            const matches = content.match(/"word"\s*:\s*"([^"]+)"/g);
            if (matches) {
                legacyWords = matches.map(m => m.split('"')[3].toLowerCase());
            }
        } catch(e) {}
    }
    
    return { currentJSON, legacyWords };
}

function saveData(data) {
    fs.writeFileSync(getFilePath(), JSON.stringify(data, null, 2), 'utf8');
}

async function fetchOxfordDataset() {
    console.log("📥 Đang tải bộ dữ liệu Oxford 5000 gốc từ Github...");
    const response = await axios.get(OXFORD_DATA_URL);
    const dataObj = response.data;
    
    // Chuyển object thành array
    const allWords = Object.values(dataObj);
    
    // Lọc theo CEFR level
    const validLevels = levelMap[targetLevel];
    const filtered = allWords.filter(w => validLevels.includes(w.cefr?.toLowerCase()));
    
    console.log(`✅ Tải xong. Tìm thấy ${filtered.length} từ vựng chuẩn mức ${targetLevel}.`);
    return filtered;
}

async function translateBatch(wordsToTranslate) {
    const prompt = `
I have a list of English words from the Oxford 5000 dictionary. 
Translate their meanings into Vietnamese. Ensure the context fits the provided English definition.
Format the output EXACTLY as a JSON array matching this schema:
{
  "word": "string (the english word)",
  "type": "string (part of speech)",
  "ipa": "string (phonetic transcription, e.g. /əˈbændən/)",
  "meaning": "string (Vietnamese meaning)",
  "example": "string (A complete English sentence)",
  "example_vi": "string (Vietnamese translation of the example sentence)",
  "level": "string (e.g. A1, B2)"
}

Here are the words to translate:
${JSON.stringify(wordsToTranslate.map(w => ({
    word: w.word,
    type: w.type,
    phon_br: w.phon_br,
    definition: w.definition,
    example: w.example || `Make a short example sentence for the word '${w.word}'.`,
    level: w.cefr.toUpperCase()
})))}

Return ONLY a valid JSON array.
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

async function run() {
    console.log(`\n🚀 KHỞI ĐỘNG OXFORD SCRAPER...`);
    
    // 1. Tải và lọc dataset
    const oxfordDataset = await fetchOxfordDataset();
    let { currentJSON: existingData, legacyWords } = loadExistingData();
    const existingWords = existingData.map(d => d.word.toLowerCase()).concat(legacyWords);
    
    // 2. Tìm các từ chưa có trong file JSON của mình VÀ chưa có trong file legacy
    const pendingWords = oxfordDataset.filter(w => !existingWords.includes(w.word.toLowerCase()));
    
    if (pendingWords.length === 0) {
        console.log("🎉 Không còn từ mới nào mức này trong kho Oxford 5000 nữa. Bạn đã sưu tập đủ!");
        return;
    }
    
    const wordsToProcess = pendingWords.slice(0, count);
    console.log(`Tiến hành dịch và import ${wordsToProcess.length} từ...`);
    
    let processedCount = 0;
    
    while (processedCount < wordsToProcess.length) {
        const batch = wordsToProcess.slice(processedCount, processedCount + BATCH_SIZE);
        try {
            console.log(`⏳ Đang dịch qua Google API (Batch ${processedCount + 1} -> ${processedCount + batch.length})...`);
            
            let translatedItems = await translateBatch(batch);
            
            // Bổ sung các trường dữ liệu hệ thống yêu cầu
            translatedItems = translatedItems.map(item => {
                item.id = `voc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}`;
                item.box = 1;
                item.nextReview = 0;
                item.category = "oxford";
                return item;
            });
            
            existingData = existingData.concat(translatedItems);
            saveData(existingData);
            
            processedCount += batch.length;
            console.log(`✅ Thành công! Đã lưu thêm ${translatedItems.length} từ. Tổng file: ${existingData.length} từ.`);
            
            if (processedCount < wordsToProcess.length) {
                await delay(2000); // Tránh rate limit
            }
        } catch (error) {
            console.error("❌ Lỗi API khi dịch:", error.message);
            console.log("   Thử lại sau 5 giây...");
            await delay(5000);
        }
    }
    console.log(`\n🎉 HOÀN TẤT SCRAPE!`);
}

run();
