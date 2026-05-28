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
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const FILE_PATH_LE = path.join(__dirname, '..', 'json', 'oxford_5000.json');
const FILE_PATH_ED = path.join(__dirname, '..', '..', 'EnglishDictionary', 'vocab', 'oxford_5000.json');

// Bản đồ ánh xạ tĩnh các topic cũ của Oxford sang nhóm mục tiêu
const categoryMap = {
    // spec-tech
    'Computers': 'spec-tech',
    'Engineering': 'spec-tech',
    'Phones, email and the internet': 'spec-tech',

    // spec-science
    'Physics and chemistry': 'spec-science',
    'Geography': 'spec-science',
    'Health problems': 'spec-science',
    'Healthcare': 'spec-science',
    'Maths and measurement': 'spec-science',
    'Scientific research': 'spec-science',
    'Space': 'spec-science',
    'The environment': 'spec-science',
    'Animals': 'spec-science',
    'Birds': 'spec-science',
    'Fish and shellfish': 'spec-science',
    'Insects, worms, etc.': 'spec-science',
    'Plants and trees': 'spec-science',
    'Disability': 'spec-science',
    'Mental health': 'spec-science',
    'Weather': 'spec-science',
    'Body': 'spec-science',

    // spec-social
    'Politics': 'spec-social',
    'Crime and punishment': 'spec-social',
    'Law and justice': 'spec-social',
    'Social issues': 'spec-social',
    'Religion and festivals': 'spec-social',
    'History': 'spec-social',
    'Business': 'spec-social',
    'Money': 'spec-social',
    'Working life': 'spec-social',
    'People in society': 'spec-social',
    'War and conflict': 'spec-social',
    'Farming': 'spec-social',
    'Jobs': 'spec-social',
    'TV, radio and news': 'spec-social',
    'Art': 'spec-social',
    'Literature and writing': 'spec-social',
    'Film and theatre': 'spec-social',
    'Music': 'spec-social',
    'Sports: ball and racket sports': 'spec-social',
    'Sports: other sports': 'spec-social',
    'Sports: water sports': 'spec-social',
    'Clothes and Fashion': 'spec-social',
    'Colours and Shapes': 'spec-social',
    'Food': 'spec-social',
    'Drinks': 'spec-social',
    'Shopping': 'spec-social',
    'Holidays': 'spec-social',
    'Gardens': 'spec-social',
    'Hobbies': 'spec-social',
    'Appearance': 'spec-social',
    'Family and relationships': 'spec-social',
    'Life stages': 'spec-social',
    'Transport by air': 'spec-social',
    'Transport by bus and train': 'spec-social',
    'Transport by car or lorry': 'spec-social',
    'Transport by water': 'spec-social',
    
    // academic
    'Opinion and argument': 'academic',
    'Discussion and agreement': 'academic',
    'Doubt, guessing and certainty': 'academic',
    'Education': 'academic',
    'Language': 'academic',
    'Permission and obligation': 'academic',
    'Suggestions and advice': 'academic',
    'Preferences and decisions': 'academic',
    'Change, cause and effect': 'academic',
    'Difficulty and failure': 'academic',
    'Success': 'academic',
    'Personal qualities': 'academic',
    'Feelings': 'academic',
    'Time': 'academic',
    'Houses and homes': 'academic',
    'Buildings': 'academic',
    'Danger': 'academic'
};

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function classifyBatch(batch) {
    const promptInput = batch.map(item => ({
        word: item.word,
        type: item.type,
        meaning: item.meaning,
        example: item.example,
        level: item.level || ""
    }));

    const prompt = `
You are an expert lexicographer and CEFR English teacher.
Classify the following list of English words into one of these target categories:
- If level is "c1", you MUST choose from: 'spec-tech', 'spec-science', 'spec-social'.
- If level is empty "", you can choose from: 'spec-tech', 'spec-science', 'spec-social', 'academic'.

Categories explanation:
- 'spec-tech': Advanced or specialized terminology related to technology, IT, software engineering, hardware, computers, networking, engineering.
- 'spec-science': Advanced or specialized terminology related to natural sciences, physics, chemistry, biology, medicine, healthcare, anatomy, astronomy, geology, geography, math, environmental science.
- 'spec-social': Advanced or specialized terminology related to social sciences, business, economics, finance, law, politics, psychology, history, media, arts, music, literature, sports, daily social life, language.
- 'academic': General academic, formal, or research vocabulary used across multiple disciplines (e.g., analyze, hypothesis, evaluate, abundant, constraint, derive, modify, assume, concept, perspective, dynamic).

Input JSON:
${JSON.stringify(promptInput, null, 2)}

Return ONLY a valid JSON object matching exactly this schema:
{
  "word1": "category",
  "word2": "category"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
}

async function run() {
    console.log("📖 Đang đọc file oxford_5000.json...");
    if (!fs.existsSync(FILE_PATH_LE)) {
        console.error(`❌ Không tìm thấy file tại: ${FILE_PATH_LE}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(FILE_PATH_LE, 'utf8'));
    console.log(`✅ Đã đọc thành công ${data.length} từ.`);

    const toClassify = [];
    let oxfordCount = 0;
    let academicCount = 0;
    let preMappedC1Count = 0;
    let preMappedEmptyCount = 0;

    // Phân luồng bước 1: Luật cứng & Ánh xạ tĩnh
    for (const item of data) {
        const level = (item.level || '').toLowerCase();
        const originalCat = (item.category || '').trim();

        if (['a1', 'a2', 'b1'].includes(level)) {
            item.category = 'oxford';
            oxfordCount++;
        } else if (level === 'b2') {
            item.category = 'academic';
            academicCount++;
        } else if (level === 'c1') {
            const mapped = categoryMap[originalCat];
            if (mapped && mapped.startsWith('spec-')) {
                item.category = mapped;
                preMappedC1Count++;
            } else {
                toClassify.push(item);
            }
        } else {
            // level trống ""
            const mapped = categoryMap[originalCat];
            if (mapped) {
                item.category = mapped;
                preMappedEmptyCount++;
            } else {
                toClassify.push(item);
            }
        }
    }

    console.log(`\n📊 THỐNG KÊ BƯỚC 1 (Luật cứng & Ánh xạ tĩnh):`);
    console.log(` - Phổ thông (A1-B1) -> 'oxford': ${oxfordCount} từ`);
    console.log(` - Học thuật (B2) -> 'academic': ${academicCount} từ`);
    console.log(` - C1 tự động khớp chuyên ngành -> 'spec-*': ${preMappedC1Count} từ`);
    console.log(` - Level trống tự động khớp -> 'spec-*'/'academic': ${preMappedEmptyCount} từ`);
    console.log(` - Cần phân loại thông minh bằng Gemini API: ${toClassify.length} từ`);

    if (toClassify.length === 0) {
        console.log("🎉 Không có từ nào cần phân loại qua Gemini!");
        saveResults(data);
        return;
    }

    // Phân luồng bước 2: Phân loại bằng Gemini API theo đợt (batch)
    const BATCH_SIZE = 50;
    let processed = 0;
    
    console.log(`\n🤖 Bắt đầu gọi Gemini API phân loại ${toClassify.length} từ (Batch size: ${BATCH_SIZE})...`);

    for (let i = 0; i < toClassify.length; i += BATCH_SIZE) {
        const batch = toClassify.slice(i, i + BATCH_SIZE);
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
            try {
                console.log(`⏳ Đang xử lý đợt ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toClassify.length / BATCH_SIZE)} (Từ ${i + 1} đến ${Math.min(i + BATCH_SIZE, toClassify.length)})...`);
                
                const results = await classifyBatch(batch);
                
                // Gán lại category cho từ trong data chính
                for (const item of batch) {
                    const assignedCat = results[item.word] || results[item.word.toLowerCase()] || results[Object.keys(results).find(k => k.toLowerCase() === item.word.toLowerCase())];
                    
                    if (assignedCat) {
                        item.category = assignedCat;
                    } else {
                        // Fallback an toàn nếu AI bỏ sót từ
                        item.category = item.level === 'c1' ? 'spec-social' : 'academic';
                    }
                }
                
                success = true;
                processed += batch.length;
                console.log(`   ✅ Hoàn tất đợt! Đã xử lý tổng cộng: ${processed}/${toClassify.length} từ.`);
            } catch (error) {
                retries--;
                console.error(`   ❌ Lỗi đợt này: ${error.message}. Còn ${retries} lần thử lại...`);
                await delay(3000);
            }
        }

        if (!success) {
            console.error("❌ Thất bại quá số lần quy định, bỏ qua đợt này và gán giá trị mặc định...");
            for (const item of batch) {
                item.category = item.level === 'c1' ? 'spec-social' : 'academic';
            }
        }

        // Delay nhẹ để tránh rate limits
        if (i + BATCH_SIZE < toClassify.length) {
            await delay(1500);
        }
    }

    saveResults(data);
}

function saveResults(data) {
    console.log("\n💾 Đang ghi kết quả vào các file dữ liệu...");
    const jsonStr = JSON.stringify(data, null, 2);

    try {
        fs.writeFileSync(FILE_PATH_LE, jsonStr, 'utf8');
        console.log(`✅ Đã lưu thành công tại LearningEnglish: ${FILE_PATH_LE}`);
    } catch (e) {
        console.error(`❌ Lỗi ghi file tại LearningEnglish: ${e.message}`);
    }

    try {
        // Đảm bảo thư mục cha của dự án kia tồn tại
        const parentDir = path.dirname(FILE_PATH_ED);
        if (fs.existsSync(parentDir)) {
            fs.writeFileSync(FILE_PATH_ED, jsonStr, 'utf8');
            console.log(`✅ Đã lưu và đồng bộ thành công tại EnglishDictionary: ${FILE_PATH_ED}`);
        } else {
            console.warn(`⚠️ Cảnh báo: Thư mục ${parentDir} không tồn tại, không thể đồng bộ sang EnglishDictionary.`);
        }
    } catch (e) {
        console.error(`❌ Lỗi ghi file đồng bộ tại EnglishDictionary: ${e.message}`);
    }

    // In thống kê cuối cùng
    const finalCounts = {};
    for (const item of data) {
        const cat = item.category || 'Trống';
        finalCounts[cat] = (finalCounts[cat] || 0) + 1;
    }
    console.log("\n📊 THỐNG KÊ DANH MỤC CUỐI CÙNG:");
    Object.keys(finalCounts).forEach(cat => {
        console.log(` - ${cat.padEnd(15)} : ${finalCounts[cat]} từ`);
    });
    console.log("\n🎉 Phân loại và đồng bộ từ vựng thành công tốt đẹp!");
}

run();
