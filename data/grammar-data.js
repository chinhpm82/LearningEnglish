/* ==========================================================================
   LearningEnglish - Interactive Grammar Database (Decoupled Module)
   ========================================================================== */

const GRAMMAR_LESSONS = [
    {
        id: "gr-1",
        title: "Thì Hiện tại Đơn (Present Simple)",
        category: "tenses",
        description: "Diễn tả một hành động lặp đi lặp lại hoặc một sự thật hiển nhiên.",
        formula: "S + V(s/es) + O  |  S + am/is/are + Adj/Noun",
        usage: [
            "Diễn tả thói quen hàng ngày hoặc hành động lặp đi lặp lại ở hiện tại.",
            "Diễn tả chân lý, quy luật tự nhiên hoặc sự thật hiển nhiên.",
            "Diễn tả lịch trình, thời gian biểu cố định (tàu xe, giờ học...)."
        ],
        examples: [
            { en: "The sun rises in the east.", vi: "Mặt trời mọc ở hướng đông." },
            { en: "She drinks green tea every morning.", vi: "Cô ấy uống trà xanh mỗi sáng." },
            { en: "The train leaves at 8:00 AM tomorrow.", vi: "Tàu hỏa khởi hành lúc 8:00 sáng mai." }
        ],
        practice: [
            {
                q: "Choose the correct sentence: She ___ English very well.",
                options: ["speak", "speaks", "speaking", "spoken"],
                answer: 1,
                explanation: "Chủ ngữ là ngôi thứ ba số ít 'She', động từ 'speak' phải thêm 's'."
            },
            {
                q: "They ___ soccer on Sunday afternoons.",
                options: ["play", "plays", "playing", "played"],
                answer: 0,
                explanation: "Chủ ngữ là ngôi số nhiều 'They', động từ giữ nguyên mẫu ở hiện tại đơn."
            },
            {
                q: "Water ___ at 100 degrees Celsius.",
                options: ["boil", "boils", "boiling", "boiled"],
                answer: 1,
                explanation: "Đây là một sự thật hiển nhiên, chủ ngữ 'Water' không đếm được nên chia động từ thêm 's'."
            }
        ]
    },
    {
        id: "gr-2",
        title: "Thì Hiện tại Tiếp diễn (Present Continuous)",
        category: "tenses",
        description: "Diễn tả hành động đang diễn ra tại thời điểm nói hoặc xung quanh thời điểm nói.",
        formula: "S + am/is/are + V-ing + O",
        usage: [
            "Diễn tả hành động đang diễn ra ngay tại thời điểm nói.",
            "Diễn tả hành động hoặc sự việc đang diễn ra xung quanh thời điểm nói nhưng không nhất thiết xảy ra ngay lúc nói.",
            "Diễn tả một kế hoạch, lịch trình đã được sắp xếp chắc chắn trong tương lai gần."
        ],
        examples: [
            { en: "Please be quiet, the baby is sleeping.", vi: "Làm ơn hãy giữ yên lặng, em bé đang ngủ." },
            { en: "I am studying for my IELTS exam these days.", vi: "Dạo này tôi đang ôn thi chứng chỉ IELTS." },
            { en: "We are meeting the teacher tomorrow afternoon.", vi: "Chúng tôi sẽ gặp giáo viên vào chiều mai." }
        ],
        practice: [
            {
                q: "Look! It ___ outside.",
                options: ["rain", "rains", "is raining", "rained"],
                answer: 2,
                explanation: "Có từ cảm thán 'Look!' báo hiệu hành động đang xảy ra tại thời điểm nói."
            },
            {
                q: "I ___ a very interesting book right now.",
                options: ["read", "am reading", "reads", "reading"],
                answer: 1,
                explanation: "Cụm từ 'right now' là dấu hiệu nhận biết của thì hiện tại tiếp diễn."
            },
            {
                q: "What ___ you ___ at the moment?",
                options: ["are/doing", "do/do", "is/doing", "are/does"],
                answer: 0,
                explanation: "Chủ ngữ 'you' đi với to-be 'are', câu hỏi tiếp diễn có cấu trúc 'Are you V-ing'."
            }
        ]
    },
    {
        id: "gr-3",
        title: "Thì Quá khứ Đơn (Past Simple)",
        category: "tenses",
        description: "Diễn tả hành động đã xảy ra và chấm dứt hoàn toàn trong quá khứ.",
        formula: "S + V2/ed + O  |  S + was/were + Adj/Noun",
        usage: [
            "Diễn tả một hành động đã xảy ra và kết thúc hoàn toàn tại một thời điểm xác định trong quá khứ.",
            "Diễn tả chuỗi các hành động xảy ra liên tiếp nhau trong quá khứ."
        ],
        examples: [
            { en: "I bought a new computer yesterday.", vi: "Tôi đã mua một chiếc máy tính mới vào ngày hôm qua." },
            { en: "She visited Paris last summer with her family.", vi: "Cô ấy đã ghé thăm Paris vào mùa hè năm ngoái cùng gia đình." },
            { en: "He closed the door, turned off the lights, and went to bed.", vi: "Anh ấy đóng cửa, tắt đèn và đi ngủ." }
        ],
        practice: [
            {
                q: "She ___ to the cinema last night.",
                options: ["go", "goes", "went", "going"],
                answer: 2,
                explanation: "'Last night' chỉ thời điểm xác định trong quá khứ, ta dùng động từ V2 của 'go' là 'went'."
            },
            {
                q: "Where ___ you ___ your vacation in 2025?",
                options: ["did/spend", "do/spend", "did/spent", "have/spent"],
                answer: 0,
                explanation: "Câu hỏi thì quá khứ đơn mượn trợ động từ 'did', động từ chính quay về nguyên mẫu 'spend'."
            },
            {
                q: "They ___ very happy at the party yesterday.",
                options: ["are", "was", "were", "been"],
                answer: 2,
                explanation: "Chủ ngữ 'They' số nhiều đi với động từ to-be quá khứ là 'were'."
            }
        ]
    },
    {
        id: "gr-4",
        title: "Câu Điều kiện Loại 1 (Conditional Type 1)",
        category: "sentences",
        description: "Diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai nếu có một điều kiện nhất định.",
        formula: "If + S + V(hiện tại đơn), S + will/can/must + V(nguyên mẫu)",
        usage: [
            "Diễn tả một giả định có thật ở hiện tại hoặc tương lai.",
            "Dùng để đưa ra lời hứa, lời đe dọa hoặc lời khuyên."
        ],
        examples: [
            { en: "If it rains tomorrow, we will stay at home.", vi: "Nếu ngày mai trời mưa, chúng tôi sẽ ở nhà." },
            { en: "If you study hard, you can pass the IELTS exam.", vi: "Nếu bạn học tập chăm chỉ, bạn có thể đỗ kỳ thi IELTS." },
            { en: "If you eat too much sugar, you will gain weight.", vi: "Nếu bạn ăn quá nhiều đường, bạn sẽ bị tăng cân." }
        ],
        practice: [
            {
                q: "If I ___ time tomorrow, I will help you.",
                options: ["have", "has", "will have", "had"],
                answer: 0,
                explanation: "Mệnh đề chứa 'If' chia ở hiện tại đơn (chủ ngữ 'I' đi với 'have')."
            },
            {
                q: "We will get lost if we ___ follow the map.",
                options: ["will not", "do not", "did not", "not"],
                answer: 1,
                explanation: "Mệnh đề 'if' ở hiện tại đơn dạng phủ định mượn trợ động từ 'do not' cho chủ ngữ 'we'."
            },
            {
                q: "If you practice every day, your speaking ___ improve.",
                options: ["will", "would", "is", "must to"],
                answer: 0,
                explanation: "Mệnh đề chính của câu điều kiện loại 1 dùng cấu trúc 'will + V-infinitive'."
            }
        ]
    },
    {
        id: "gr-5",
        title: "Câu Bị động (Passive Voice)",
        category: "sentences",
        description: "Nhấn mạnh vào đối tượng chịu tác động của hành động thay vì người thực hiện hành động.",
        formula: "S + be + V3/ed + (by + O)",
        usage: [
            "Khi không biết người thực hiện hành động là ai hoặc việc đó không quan trọng.",
            "Khi muốn nhấn mạnh vào bản thân hành động hoặc đối tượng chịu tác động của hành động."
        ],
        examples: [
            { en: "This house was built in 1990 by my grandfather.", vi: "Ngôi nhà này được xây dựng vào năm 1990 bởi ông tôi." },
            { en: "All vocabulary cards are stored in the database.", vi: "Tất cả các thẻ từ vựng đều được lưu trữ trong cơ sở dữ liệu." },
            { en: "English is spoken all over the world.", vi: "Tiếng Anh được nói trên toàn thế giới." }
        ],
        practice: [
            {
                q: "A new road ___ in our town next month.",
                options: ["builds", "will be built", "is building", "was built"],
                answer: 1,
                explanation: "Có từ chỉ tương lai 'next month' và hành động bị động (con đường được xây), dùng 'will be V3'."
            },
            {
                q: "The window ___ by the storm yesterday.",
                options: ["broke", "is broken", "was broken", "has broken"],
                answer: 2,
                explanation: "Mốc thời gian 'yesterday' kết hợp thể bị động quá khứ đơn, ta chia to-be 'was/were' + V3."
            },
            {
                q: "Active: 'He wrote the report.' -> Passive: 'The report ___ by him.'",
                options: ["is written", "was wrote", "was written", "has been written"],
                answer: 2,
                explanation: "Câu chủ động chia quá khứ đơn 'wrote' -> bị động quá khứ đơn 'was written'."
            }
        ]
    },
    {
        id: "gr-6",
        title: "Mệnh đề quan hệ (Relative Clauses)",
        category: "sentences",
        description: "Dùng để bổ nghĩa cho danh từ đứng trước nó, giúp nối câu mà không cần lặp từ.",
        formula: "N(người) + who/whom + V/S-V | N(vật) + which + V/S-V | N + that",
        usage: [
            "Sử dụng 'who' làm chủ ngữ thay thế cho người.",
            "Sử dụng 'whom' làm tân ngữ thay thế cho người.",
            "Sử dụng 'which' làm chủ ngữ/tân ngữ thay thế cho sự vật, con vật.",
            "Sử dụng 'that' thay thế cho cả 'who' và 'which' trong mệnh đề xác định."
        ],
        examples: [
            { en: "The student who won the gold star is very smart.", vi: "Người học sinh giành được ngôi sao vàng rất thông minh." },
            { en: "This is the computer which I bought yesterday.", vi: "Đây là chiếc máy tính mà tôi đã mua vào ngày hôm qua." },
            { en: "The teacher whom we met this morning was very friendly.", vi: "Giáo viên mà chúng tôi gặp sáng nay rất thân thiện." }
        ],
        practice: [
            {
                q: "The man ___ lives next door is a famous English teacher.",
                options: ["who", "whom", "which", "whose"],
                answer: 0,
                explanation: "Thay thế cho danh từ chỉ người 'The man' làm chủ ngữ của động từ 'lives', dùng đại từ 'who'."
            },
            {
                q: "I lost the watch ___ my father gave me on my birthday.",
                options: ["who", "which", "whom", "whose"],
                answer: 1,
                explanation: "Thay thế cho danh từ chỉ vật 'the watch', ta dùng đại từ quan hệ 'which'."
            },
            {
                q: "The building ___ was destroyed in the fire has been rebuilt.",
                options: ["who", "which", "whom", "where"],
                answer: 1,
                explanation: "Thay thế cho danh từ chỉ vật 'The building' làm chủ ngữ của động từ 'was destroyed', dùng 'which'."
            }
        ]
    }
];
