require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_api_key_here') {
    console.error("❌ ERROR: Bạn chưa cấu hình GEMINI_API_KEY trong file .env!");
    console.error("   Vui lòng lấy API Key tại: https://aistudio.google.com/app/apikey");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Dùng model gemini-2.5-flash siêu nhanh và tối ưu cho JSON
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log("🛠 CÁCH SỬ DỤNG AI GENERATOR:");
    console.log("-------------------------------");
    console.log("node scripts/ai-generator.js <type> <level> <count>");
    console.log("  - type: 'vocab' hoặc 'questions'");
    console.log("  - level: 'A1-A2', 'B1-B2', hoặc 'C1-C2'");
    console.log("  - count: Số lượng muốn sinh thêm (VD: 100)");
    console.log("\nVí dụ: node scripts/ai-generator.js vocab B1-B2 100");
    process.exit(1);
}

const type = args[0];
const level = args[1];
const count = parseInt(args[2]);

if (!['vocab', 'questions'].includes(type)) {
    console.error("❌ ERROR: Type chỉ được nhập 'vocab' hoặc 'questions'");
    process.exit(1);
}

// Giới hạn batch size để tránh AI bị quá tải và lỗi JSON
const BATCH_SIZE = type === 'vocab' ? 25 : 5; 

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function getFilePath() {
    return path.join(__dirname, '..', 'data', 'json', `${type}-${level}.json`);
}

function loadExistingData() {
    let currentJSON = [];
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
        try { currentJSON = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch(e) {}
    }
    
    // Đọc thêm từ vựng từ data/vocabulary-data.js cũ để tránh AI sinh trùng lặp
    let legacyWords = [];
    if (type === 'vocab') {
        const legacyPath = path.join(__dirname, '..', 'data', 'vocabulary-data.js');
        if (fs.existsSync(legacyPath)) {
            try {
                const content = fs.readFileSync(legacyPath, 'utf8');
                const matches = content.match(/"word"\s*:\s*"([^"]+)"/g);
                if (matches) {
                    legacyWords = matches.map(m => m.split('"')[3].toLowerCase());
                }
            } catch(e) {}
        }
    }
    
    return { currentJSON, legacyWords };
}

function saveData(data) {
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function generateVocabBatch(existingWords) {
    const recentWords = existingWords.slice(-100); // Tránh prompt quá dài
    const prompt = `
Generate a JSON array of ${BATCH_SIZE} unique English vocabulary words suitable for CEFR level ${level}.
DO NOT include any words from this list: ${JSON.stringify(recentWords)}.
Each object in the array must strictly match this schema:
{
  "word": "string (the english word)",
  "type": "string (noun, verb, adjective, adverb, etc.)",
  "meaning": "string (Vietnamese meaning)",
  "example": "string (A complete English sentence using the word)",
  "level": "${level.split('-')[0]}"
}
Return ONLY a valid JSON array.
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

async function generateQuestionsBatch(existingIds) {
    const prompt = `
Generate a JSON array of ${BATCH_SIZE} CEFR placement test questions for level ${level}. 
Divide them among 3 skills: listening, grammar, reading.
Each object must strictly match this schema:
{
  "id": "string (leave blank)",
  "section": "string (listening, grammar, or reading)",
  "level": "${level}",
  "question": "string (The question text. For listening, include a short conversation text. For reading, include a short text or cloze test)",
  "options": ["string", "string", "string", "string"] (Exactly 4 options),
  "answer": integer (0, 1, 2, or 3 representing the index of the correct option),
  "explanation": "string (Detailed explanation in Vietnamese of why the answer is correct)"
}
Ensure the questions are highly academic and tricky.
Return ONLY a valid JSON array.
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

async function run() {
    console.log(`\n🚀 KHỞI ĐỘNG AI GENERATOR...`);
    console.log(`Mục tiêu: Sinh ${count} items loại '${type}' cho trình độ '${level}'.\n`);
    
    let { currentJSON: data, legacyWords } = loadExistingData();
    let generatedCount = 0;

    while (generatedCount < count) {
        try {
            console.log(`⏳ Đang gọi Gemini API (Batch size: ${BATCH_SIZE})...`);
            let newItems = [];
            
            if (type === 'vocab') {
                const existingWords = data.map(d => d.word.toLowerCase()).concat(legacyWords);
                newItems = await generateVocabBatch(existingWords);
                
                // Lọc bỏ từ trùng
                const beforeFilter = newItems.length;
                newItems = newItems.filter(item => !existingWords.includes(item.word.toLowerCase()));
                if (beforeFilter > newItems.length) {
                    console.log(`   - AI sinh trùng ${beforeFilter - newItems.length} từ. Đã tự động loại bỏ.`);
                }
            } else {
                const existingIds = data.map(d => d.id);
                newItems = await generateQuestionsBatch(existingIds);
                
                // Tự động gán ID duy nhất
                newItems = newItems.map(item => {
                    item.id = `q-${level.replace('-','')}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
                    return item;
                });
            }

            if (newItems.length === 0) {
                console.log("⚠️ Cảnh báo: API trả về 0 kết quả hợp lệ. Thử lại sau 2 giây...");
                await delay(2000);
                continue;
            }

            data = data.concat(newItems);
            saveData(data);
            
            generatedCount += newItems.length;
            console.log(`✅ Thành công! Đã ghép thêm ${newItems.length} items. Tổng số hiện tại trong file: ${data.length}`);
            
            if (generatedCount < count) {
                console.log("   Nghỉ 3 giây để tránh Rate Limit của Google...\n");
                await delay(3000);
            }
        } catch (error) {
            console.error("❌ Lỗi API:", error.message);
            console.log("   Hệ thống sẽ thử kết nối lại sau 5 giây...\n");
            await delay(5000);
        }
    }
    
    console.log(`\n🎉 HOÀN TẤT! Đã sinh đủ số lượng yêu cầu.`);
}

run();
