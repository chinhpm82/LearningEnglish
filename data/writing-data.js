const WRITING_DATA = [
    {
        id: "w1",
        topic: "Introduce Yourself",
        level: "Beginner",
        prompt: "Viết một đoạn văn ngắn (50-80 từ) giới thiệu về bản thân bạn, bao gồm tên, tuổi, nghề nghiệp, sở thích và lý do bạn muốn học tiếng Anh.",
        englishPrompt: "Write a short paragraph (50-80 words) introducing yourself, including your name, age, job, hobbies, and the reason why you want to learn English.",
        suggestedWords: [
            { word: "introduce", vi: "giới thiệu" },
            { word: "passion", vi: "niềm đam mê" },
            { word: "hobby", vi: "sở thích" },
            { word: "improve", vi: "cải thiện" },
            { word: "opportunity", vi: "cơ hội" }
        ],
        outline: [
            "Start with a friendly greeting and state your name and age.",
            "Describe your current profession or study subject.",
            "Talk about one or two hobbies that you enjoy in your free time.",
            "Explain why learning English is important for your future or career.",
            "End with a positive concluding statement."
        ],
        sampleAnswer: "Hello everyone, let me introduce myself. My name is Nam, and I am a twenty-five-year-old software developer. In my spare time, my favorite hobby is playing football because it helps me relax. I have a strong passion for technology and want to improve my English. Mastering this language will open up better career opportunities and allow me to connect with global tech communities. I am excited to embark on this learning journey."
    },
    {
        id: "w2",
        topic: "My Daily Routine",
        level: "Beginner",
        prompt: "Miêu tả các hoạt động thường ngày của bạn (60-90 từ). Bạn thức dậy lúc mấy giờ, làm những việc gì vào buổi sáng, chiều và tối để duy trì lối sống khoa học?",
        englishPrompt: "Describe your typical daily routine (60-90 words). What time do you wake up, and what activities do you do in the morning, afternoon, and evening to maintain a balanced lifestyle?",
        suggestedWords: [
            { word: "routine", vi: "thói quen hàng ngày" },
            { word: "exercise", vi: "tập thể dục" },
            { word: "healthy", vi: "lành mạnh" },
            { word: "prepare", vi: "chuẩn bị" },
            { word: "productive", vi: "năng suất, hiệu quả" }
        ],
        outline: [
            "Mention your waking up time and your first morning activity.",
            "Explain what you usually eat for breakfast and how you commute to work or school.",
            "Describe your main daytime activities (study, work, focus).",
            "Discuss how you unwind in the evening (exercise, reading, family time).",
            "Conclude with your usual bedtime."
        ],
        sampleAnswer: "My daily routine is simple but structured to keep me healthy and productive. I wake up at six o'clock every morning and immediately do light exercises for fifteen minutes. After eating a nutritious breakfast, I prepare my work schedule and start studying at eight AM. In the afternoon, I stay focused on my tasks and take short breaks to rest my eyes. In the evening, I enjoy cooking a balanced dinner and reading books to unwind. Finally, I go to bed at ten PM to ensure a good night's sleep."
    },
    {
        id: "w3",
        topic: "Advantages of Learning English",
        level: "Intermediate",
        prompt: "Viết một đoạn nghị luận ngắn (80-120 từ) nêu bật những lợi ích quan trọng nhất của việc thành thạo tiếng Anh trong thế giới toàn cầu hóa ngày nay.",
        englishPrompt: "Write a short opinion paragraph (80-120 words) highlighting the most significant advantages of mastering the English language in today's globalized world.",
        suggestedWords: [
            { word: "global language", vi: "ngôn ngữ toàn cầu" },
            { word: "access", vi: "tiếp cận, truy cập" },
            { word: "broaden", vi: "mở rộng (kiến thức/tầm nhìn)" },
            { word: "horizon", vi: "chân trời, tầm mắt" },
            { word: "career advancement", vi: "sự thăng tiến sự nghiệp" },
            { word: "communicate", vi: "giao tiếp" }
        ],
        outline: [
            "Begin with a strong topic sentence stating that English is a powerful global tool.",
            "Explain the academic benefits (access to vast resources, scientific papers, online courses).",
            "Describe the career benefits (high-paying jobs, multinational companies, career advancement).",
            "Discuss the travel and cultural advantages (broaden horizons, communicate easily abroad).",
            "Conclude with a summary of how English changes lives."
        ],
        sampleAnswer: "Mastering English, the leading global language, offers numerous remarkable advantages in today's interconnected world. Firstly, it serves as a gateway to academic excellence, providing access to a vast treasury of online educational resources and scientific publications. Secondly, English proficiency is a vital driver for career advancement. It enables job seekers to secure lucrative positions in multinational corporations and communicate effectively with global clients. Furthermore, learning English broadens our horizons, allowing us to travel confidently and understand diverse cultures. Ultimately, becoming fluent in English is not just an academic milestone, but a life-changing investment."
    },
    {
        id: "w4",
        topic: "The Impact of Technology",
        level: "Advanced",
        prompt: "Bàn luận về tác động hai mặt của công nghệ hiện đại đối với các mối quan hệ gia đình và xã hội (100-150 từ). Đưa ra các gợi ý để giữ cân bằng.",
        englishPrompt: "Discuss the double-edged sword of modern technology on family and social relationships (100-150 words). Provide suggestions on how to maintain a healthy balance.",
        suggestedWords: [
            { word: "double-edged sword", vi: "con dao hai lưỡi" },
            { word: "revolutionize", vi: "cách mạng hóa" },
            { word: "distraction", vi: "sự xao nhãng" },
            { word: "face-to-face", vi: "trực tiếp, mặt đối mặt" },
            { word: "disconnect", vi: "sự mất kết nối, rời rạc" },
            { word: "digital detox", vi: "cai nghiện kỹ thuật số" },
            { word: "meaningful", vi: "ý nghĩa" }
        ],
        outline: [
            "Introduce the topic by stating that technology is a double-edged sword for relationships.",
            "Acknowledge the positive impact (instant connection over long distances, easy coordination).",
            "Analyze the negative side (addiction to screen time, distraction during family gatherings, emotional disconnect).",
            "Suggest practical solutions (implementing phone-free zones, digital detox during meals).",
            "Provide a memorable concluding thought on keeping technology as a tool, not a replacement for human warmth."
        ],
        sampleAnswer: "Modern technology is undeniably a double-edged sword that has revolutionized human interaction. On one hand, digital platforms facilitate seamless communication, allowing family members separated by vast geographical distances to stay instantly connected. On the other hand, the excessive usage of smartphones poses a severe threat to genuine relationships. Virtual distractions often lead to a reduction in meaningful, face-to-face conversations, fostering emotional disconnect even when sitting in the same room. During family gatherings, screen addiction replaces warm human interaction. To combat this growing social issue, households must actively establish device-free zones and schedule periodic digital detoxes. Technology should remain a convenient tool to enhance our lives, rather than a barrier that isolates us from our loved ones."
    }
];
