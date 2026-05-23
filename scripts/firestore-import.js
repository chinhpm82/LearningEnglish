import { collection, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Script để Import dữ liệu học thuật lên Firestore
 * Sẽ được gắn vào một nút ẩn trên giao diện admin để bạn tự bấm
 */
window.importDataToFirestore = async function() {
    console.log("🚀 Bắt đầu quá trình Import dữ liệu lên Firestore...");
    const btn = document.getElementById('btn-admin-import');
    if (btn) btn.disabled = true;
    
    const db = window.FirebaseSync.db;
    if (!db) {
        alert("Firebase chưa được khởi tạo đúng cách. Hãy đợi một chút và thử lại.");
        if (btn) btn.disabled = false;
        return;
    }

    try {
        if (typeof INITIAL_VOCABULARY !== 'undefined') {
            console.log("Đang import Từ vựng...");
            await uploadCollectionBatch('academic_vocabulary', INITIAL_VOCABULARY);
        }
        
        if (typeof GRAMMAR_LESSONS !== 'undefined') {
            console.log("Đang import Ngữ pháp...");
            await uploadCollectionBatch('academic_grammar', GRAMMAR_LESSONS);
        }

        if (typeof STORIES_DATA !== 'undefined') {
            console.log("Đang import Truyện đọc...");
            await uploadCollectionBatch('academic_stories', STORIES_DATA);
        }

        if (typeof PLACEMENT_QUESTIONS !== 'undefined') {
            console.log("Đang import Câu hỏi Placement...");
            await uploadCollectionBatch('academic_quizzes', PLACEMENT_QUESTIONS);
        }

        if (typeof COMMUNICATIVE_SENTENCES !== 'undefined') {
            console.log("Đang import Câu giao tiếp...");
            await uploadCollectionBatch('academic_sentences', COMMUNICATIVE_SENTENCES);
        }
        
        if (typeof PODCAST_DATA !== 'undefined') {
            console.log("Đang import Podcasts...");
            await uploadCollectionBatch('academic_podcasts', PODCAST_DATA);
        }

        console.log("✅ IMPORT HOÀN TẤT!");
        alert("Đã import toàn bộ dữ liệu lên Firestore thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi Import:", error);
        alert("Lỗi khi import! Vui lòng kiểm tra Console. Bạn nhớ mở quyền Security Rules trên Firebase chưa?");
    } finally {
        if (btn) btn.disabled = false;
    }
};

/**
 * Upload mảng dữ liệu lên Firestore dùng Batched Writes (500 doc / batch max)
 */
async function uploadCollectionBatch(collectionName, dataArray) {
    if (!dataArray || dataArray.length === 0) return;

    // Lọc trùng lặp ID (nếu có)
    const uniqueItems = new Map();
    dataArray.forEach(item => {
        const id = item.id ? String(item.id) : (item.word ? item.word.toLowerCase() : Math.random().toString(36).substring(7));
        uniqueItems.set(id, { ...item, id: id });
    });

    const items = Array.from(uniqueItems.values());
    const total = items.length;
    let batchCount = 0;
    
    // Firestore batch limit is 500
    const CHUNK_SIZE = 450; 

    for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(window.FirebaseSync.db);

        chunk.forEach(item => {
            const docRef = doc(collection(window.FirebaseSync.db, collectionName), String(item.id));
            batch.set(docRef, item);
        });

        await batch.commit();
        batchCount++;
        console.log(`- ${collectionName}: Đã upload chunk ${batchCount} (${chunk.length} items)`);
    }
}
