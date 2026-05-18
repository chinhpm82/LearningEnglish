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
        title: "Thì Hiện tại Hoàn thành (Present Perfect)",
        category: "tenses",
        description: "Diễn tả hành động đã xảy ra trong quá khứ kéo dài đến hiện tại và có thể tiếp diễn trong tương lai.",
        formula: "S + have/has + V3/ed + O",
        usage: [
            "Diễn tả một hành động vừa mới xảy ra (thường đi với 'just', 'already', 'yet').",
            "Diễn tả kinh nghiệm hoặc trải nghiệm cho tới thời điểm hiện tại (đi với 'ever', 'never').",
            "Diễn tả hành động bắt đầu ở quá khứ, kéo dài đến hiện tại và tiếp tục ở tương lai (đi với 'since', 'for')."
        ],
        examples: [
            { en: "I have lived in Hanoi for five years.", vi: "Tôi đã sống ở Hà Nội được năm năm rồi." },
            { en: "She has just finished her English homework.", vi: "Cô ấy vừa mới hoàn thành xong bài tập tiếng Anh." },
            { en: "Have you ever traveled to the United States?", vi: "Bạn đã từng đi du lịch tới nước Mỹ bao giờ chưa?" }
        ],
        practice: [
            {
                q: "I ___ this beautiful movie three times.",
                options: ["see", "saw", "have seen", "am seeing"],
                answer: 2,
                explanation: "Diễn tả trải nghiệm lặp đi lặp lại nhiều lần tính đến hiện tại, ta dùng hiện tại hoàn thành."
            },
            {
                q: "She has studied English ___ she was a child.",
                options: ["for", "since", "in", "from"],
                answer: 1,
                explanation: "Dùng 'since' trước mốc thời gian xác định trong quá khứ ('she was a child')."
            },
            {
                q: "They ___ each other for over ten years.",
                options: ["know", "knew", "have known", "are knowing"],
                answer: 2,
                explanation: "Động từ 'know' không chia ở tiếp diễn, kết hợp khoảng thời gian 'for over ten years' ta dùng hiện tại hoàn thành."
            }
        ]
    },
    {
        id: "gr-4",
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
        id: "gr-5",
        title: "Thì Quá khứ Tiếp diễn (Past Continuous)",
        category: "tenses",
        description: "Diễn tả hành động đang diễn ra tại một thời điểm cụ thể hoặc bị xen ngang trong quá khứ.",
        formula: "S + was/were + V-ing + O",
        usage: [
            "Diễn tả hành động đang xảy ra tại một thời điểm cụ thể trong quá khứ.",
            "Diễn tả một hành động đang diễn ra trong quá khứ thì một hành động khác xen ngang (hành động đang diễn ra chia tiếp diễn, hành động xen ngang chia quá khứ đơn)."
        ],
        examples: [
            { en: "I was watching TV at 9 PM yesterday.", vi: "Tôi đang xem TV vào lúc 9 giờ tối ngày hôm qua." },
            { en: "They were playing tennis when it started to rain.", vi: "Họ đang chơi tennis thì trời bắt đầu mưa." },
            { en: "While my mother was cooking, my father was reading books.", vi: "Trong lúc mẹ tôi đang nấu ăn thì bố tôi đang đọc sách." }
        ],
        practice: [
            {
                q: "What ___ you ___ when the earthquake occurred?",
                options: ["are/doing", "do/do", "were/doing", "was/doing"],
                answer: 2,
                explanation: "Hành động đang xảy ra bị hành động khác xen ngang ('earthquake occurred'), dùng 'were/doing' vì chủ ngữ là 'you'."
            },
            {
                q: "She ___ her homework while we were listening to music.",
                options: ["does", "was doing", "did", "doing"],
                answer: 1,
                explanation: "Diễn tả hai hành động song song đồng thời xảy ra trong quá khứ, đều dùng quá khứ tiếp diễn."
            },
            {
                q: "At this time yesterday, I ___ on the beach.",
                options: ["am lying", "lay", "was lying", "have lain"],
                answer: 2,
                explanation: "'At this time yesterday' là thời điểm cụ thể trong quá khứ, ta dùng quá khứ tiếp diễn."
            }
        ]
    },
    {
        id: "gr-6",
        title: "Thì Quá khứ Hoàn thành (Past Perfect)",
        category: "tenses",
        description: "Diễn tả hành động xảy ra và hoàn thành trước một hành động khác hoặc một mốc thời gian trong quá khứ.",
        formula: "S + had + V3/ed + O",
        usage: [
            "Diễn tả hành động xảy ra trước một hành động khác trong quá khứ (hành động trước chia quá khứ hoàn thành, hành động sau chia quá khứ đơn)."
        ],
        examples: [
            { en: "The train had left before we arrived at the station.", vi: "Đoàn tàu đã khởi hành trước khi chúng tôi tới nhà ga." },
            { en: "She had cleaned the house when her guests came.", vi: "Cô ấy đã dọn sạch nhà cửa xong khi khách đến." },
            { en: "He had studied English before he moved to London.", vi: "Anh ấy đã học tiếng Anh trước khi chuyển tới London." }
        ],
        practice: [
            {
                q: "By the time we arrived at the cinema, the movie ___.",
                options: ["started", "has started", "had started", "was starting"],
                answer: 2,
                explanation: "Hành động bộ phim bắt đầu xảy ra trước hành động chúng tôi đến, nên chia quá khứ hoàn thành 'had started'."
            },
            {
                q: "She said she ___ that man somewhere before.",
                options: ["met", "has met", "had met", "meets"],
                answer: 2,
                explanation: "Hành động gặp người đàn ông xảy ra trước lời nói trong quá khứ, dùng quá khứ hoàn thành."
            },
            {
                q: "He didn't have money because he ___ his wallet.",
                options: ["lost", "has lost", "had lost", "was losing"],
                answer: 2,
                explanation: "Việc mất ví xảy ra trước việc không có tiền, dùng quá khứ hoàn thành."
            }
        ]
    },
    {
        id: "gr-7",
        title: "Thì Tương lai Đơn (Future Simple)",
        category: "tenses",
        description: "Diễn tả quyết định tức thời, dự đoán không căn cứ hoặc lời hứa hẹn.",
        formula: "S + will + V(nguyên mẫu) + O",
        usage: [
            "Diễn tả quyết định được đưa ra ngay tại thời điểm nói.",
            "Diễn tả dự đoán mang tính chủ quan, không có căn cứ thực tế (đi với 'think', 'believe', 'hope').",
            "Đưa ra lời hứa, lời đề nghị giúp đỡ hoặc đe dọa."
        ],
        examples: [
            { en: "I think it will rain tomorrow.", vi: "Tôi nghĩ ngày mai trời sẽ mưa." },
            { en: "Wait! I will help you carry these heavy bags.", vi: "Chờ chút! Tôi sẽ giúp bạn mang những chiếc túi nặng này." },
            { en: "I promise I will not tell anyone your secret.", vi: "Tôi hứa tôi sẽ không kể với bất kỳ ai bí mật của bạn." }
        ],
        practice: [
            {
                q: "A: 'The phone is ringing.' - B: 'Don't worry, I ___ answer it.'",
                options: ["will", "am going to", "do", "shall"],
                answer: 0,
                explanation: "Quyết định tức thời đưa ra ngay lúc nói, ta dùng 'will'."
            },
            {
                q: "I hope you ___ your English exam next week.",
                options: ["pass", "will pass", "are passing", "passed"],
                answer: 1,
                explanation: "Sau động từ chỉ hy vọng 'hope', ta thường dùng thì tương lai đơn 'will pass'."
            },
            {
                q: "We ___ probably get there around 6 PM.",
                options: ["will", "are going to", "does", "would"],
                answer: 0,
                explanation: "Phỏng đoán có khả năng xảy ra, đi kèm phó từ 'probably', dùng tương lai đơn."
            }
        ]
    },
    {
        id: "gr-8",
        title: "Thì Tương lai Gần (Near Future - Be Going To)",
        category: "tenses",
        description: "Diễn tả kế hoạch đã định trước hoặc dự đoán có căn cứ ở hiện tại.",
        formula: "S + am/is/are + going to + V(nguyên mẫu) + O",
        usage: [
            "Diễn tả kế hoạch, dự định đã được chuẩn bị hoặc quyết định từ trước thời điểm nói.",
            "Diễn tả dự đoán về tương lai dựa trên các dấu hiệu, bằng chứng rõ ràng ở hiện tại."
        ],
        examples: [
            { en: "Look at those dark clouds! It is going to rain.", vi: "Nhìn những đám mây đen kia kìa! Trời sắp sửa mưa rồi đấy." },
            { en: "We are going to buy a new house next month.", vi: "Chúng tôi dự định sẽ mua một ngôi nhà mới vào tháng sau." },
            { en: "She has bought the tickets. She is going to fly to Paris tomorrow.", vi: "Cô ấy đã mua vé. Cô ấy sẽ bay sang Paris vào ngày mai." }
        ],
        practice: [
            {
                q: "Look at that boy running too fast! He ___ fall.",
                options: ["will", "is going to", "falls", "fell"],
                answer: 1,
                explanation: "Có bằng chứng rõ ràng ở hiện tại ('boy running too fast') báo hiệu sự việc chắc chắn xảy ra, dùng 'is going to'."
            },
            {
                q: "I ___ study abroad because I've already passed the IELTS exam.",
                options: ["will", "am going to", "shall", "study"],
                answer: 1,
                explanation: "Dự định đã được quyết định và chuẩn bị sẵn từ trước, dùng 'am going to'."
            },
            {
                q: "What ___ you ___ wear to the wedding party next Saturday?",
                options: ["will/wear", "are/going to", "are/going to wear", "do/wear"],
                answer: 2,
                explanation: "Câu hỏi về dự định tương lai dùng cấu trúc 'Are you going to wear'."
            }
        ]
    },
    {
        id: "gr-9",
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
        id: "gr-10",
        title: "Câu Điều kiện Loại 2 (Conditional Type 2)",
        category: "sentences",
        description: "Diễn tả giả định không có thật ở hiện tại hoặc tương lai.",
        formula: "If + S + V2/ed (To-be dùng WERE cho mọi ngôi), S + would/could + V(nguyên mẫu)",
        usage: [
            "Diễn tả giả định trái ngược hoàn toàn với sự thật khách quan ở hiện tại.",
            "Dùng để đưa ra lời khuyên (thường bắt đầu bằng 'If I were you')."
        ],
        examples: [
            { en: "If I had a million dollars, I would buy a yacht.", vi: "Nếu tôi có một triệu đô la, tôi sẽ mua một chiếc du thuyền (thực tế tôi không có)." },
            { en: "If I were you, I would take that English course.", vi: "Nếu tôi là bạn, tôi sẽ tham gia khóa học tiếng Anh đó." },
            { en: "If she spoke French, she could apply for that job.", vi: "Nếu cô ấy nói tiếng Pháp, cô ấy đã có thể nộp đơn cho công việc đó." }
        ],
        practice: [
            {
                q: "If I ___ you, I would tell the truth.",
                options: ["am", "was", "were", "be"],
                answer: 2,
                explanation: "Trong mệnh đề If câu điều kiện loại 2, động từ to-be luôn chia là 'were' đối với mọi ngôi."
            },
            {
                q: "If he had a laptop, he ___ learn programming online.",
                options: ["will", "would", "shall", "can"],
                answer: 1,
                explanation: "Mệnh đề chính của câu điều kiện loại 2 dùng cấu trúc 'would + V-infinitive'."
            },
            {
                q: "She would go to the party if she ___ busy today.",
                options: ["isn't", "weren't", "wasn't", "won't be"],
                answer: 1,
                explanation: "Mệnh đề chứa If chia quá khứ giả định, to-be số ít phủ định dùng 'weren't' để tăng tính học thuật trang trọng."
            }
        ]
    },
    {
        id: "gr-11",
        title: "Câu Điều kiện Loại 3 (Conditional Type 3)",
        category: "sentences",
        description: "Diễn tả sự tiếc nuối về một điều kiện trái ngược hoàn toàn với thực tế quá khứ.",
        formula: "If + S + had + V3/ed, S + would/could + have + V3/ed",
        usage: [
            "Diễn tả giả định hoàn toàn trái ngược với sự thật đã xảy ra trong quá khứ.",
            "Dùng để bày tỏ sự tiếc nuối hoặc trách móc về một hành động đã qua."
        ],
        examples: [
            { en: "If I had studied harder, I would have passed the exam.", vi: "Nếu trước đây tôi học chăm hơn, tôi đã thi đỗ rồi (thực tế tôi không học chăm và đã trượt)." },
            { en: "If she had left earlier, she wouldn't have missed the flight.", vi: "Nếu cô ấy rời đi sớm hơn, cô ấy đã không lỡ chuyến bay." },
            { en: "We would have won the game if we had practiced more.", vi: "Chúng tôi đã có thể thắng trận đấu nếu chúng tôi luyện tập nhiều hơn." }
        ],
        practice: [
            {
                q: "If they ___ harder, they would have got a gold star.",
                options: ["study", "studied", "had studied", "would study"],
                answer: 2,
                explanation: "Căn cứ vào mệnh đề chính có dạng 'would have V3', mệnh đề If chia quá khứ hoàn thành 'had studied'."
            },
            {
                q: "If you had told me about the schedule, I ___ you up.",
                options: ["would pick", "will pick", "would have picked", "picked"],
                answer: 2,
                explanation: "Mệnh đề If chia quá khứ hoàn thành ('had told'), mệnh đề chính câu điều kiện loại 3 dùng 'would have picked'."
            },
            {
                q: "We ___ the train if we had caught a taxi.",
                options: ["wouldn't miss", "hadn't missed", "wouldn't have missed", "missed"],
                answer: 2,
                explanation: "Cấu trúc điều kiện loại 3, mệnh đề chính phủ định chia ở dạng 'wouldn't have V3' ('wouldn't have missed')."
            }
        ]
    },
    {
        id: "gr-12",
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
        id: "gr-13",
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
    },
    {
        id: "gr-14",
        title: "So sánh Hơn và So sánh Nhất (Comparatives & Superlatives)",
        category: "sentences",
        description: "So sánh các tính chất của một hoặc nhiều đối tượng sự vật.",
        formula: "So sánh hơn: Short Adj + er + than / more + Long Adj + than  |  So sánh nhất: the + Short Adj-est / the most + Long Adj",
        usage: [
            "So sánh hơn: Dùng để so sánh tính chất giữa hai đối tượng sự vật/người với nhau.",
            "So sánh nhất: Dùng để so sánh một đối tượng nổi bật nhất trong một tập thể (từ 3 đối tượng trở lên)."
        ],
        examples: [
            { en: "This blue book is cheaper than that red one.", vi: "Cuốn sách màu xanh này rẻ hơn cuốn sách màu đỏ kia." },
            { en: "She is the most intelligent student in my class.", vi: "Cô ấy là học sinh thông minh nhất trong lớp học của tôi." },
            { en: "Learning vocabulary is more important than memorizing grammar formulas.", vi: "Học từ vựng quan trọng hơn việc học vẹt công thức ngữ pháp." }
        ],
        practice: [
            {
                q: "This new laptop is ___ than my old computer.",
                options: ["expensive", "more expensive", "most expensive", "expensiver"],
                answer: 1,
                explanation: "Tính từ dài 'expensive' ở thể so sánh hơn đi với cấu trúc 'more + Adj + than'."
            },
            {
                q: "Russia is the ___ country in the world.",
                options: ["large", "larger", "largest", "most large"],
                answer: 2,
                explanation: "Tính từ ngắn 'large', trước có 'the' chỉ thể so sánh nhất, thêm đuôi 'st' thành 'largest'."
            },
            {
                q: "His English pronunciation is getting ___ and ___.",
                options: ["good/good", "better/better", "best/best", "well/well"],
                answer: 1,
                explanation: "So sánh kép tăng tiến của tính từ đặc biệt 'good' -> 'better and better' (ngày càng tốt hơn)."
            }
        ]
    },
    {
        id: "gr-15",
        title: "Câu Gián tiếp (Reported Speech)",
        category: "sentences",
        description: "Thuật lại lời nói của người khác gián tiếp qua việc lùi thì động từ.",
        formula: "S + said (that) + S + V(lùi thì)  |  S + told + O (that) + S + V(lùi thì)",
        usage: [
            "Dùng thuật lại một lời phát biểu, câu hỏi hoặc yêu cầu của người khác.",
            "Nguyên tắc lùi thì: Hiện tại đơn -> Quá khứ đơn, Hiện tại tiếp diễn -> Quá khứ tiếp diễn, Hiện tại hoàn thành & Quá khứ đơn -> Quá khứ hoàn thành, Will -> Would."
        ],
        examples: [
            { en: "He said, 'I am learning English' -> He said that he was learning English.", vi: "Anh ấy nói: 'Tôi đang học tiếng Anh' -> Anh ấy nói rằng anh ấy đang học tiếng Anh." },
            { en: "She said, 'I bought a house' -> She said she had bought a house.", vi: "Cô ấy nói: 'Tôi đã mua một ngôi nhà' -> Cô ấy nói cô ấy đã mua một ngôi nhà." },
            { en: "They asked, 'Where do you live?' -> They asked me where I lived.", vi: "Họ hỏi: 'Bạn sống ở đâu?' -> Họ hỏi tôi sống ở đâu." }
        ],
        practice: [
            {
                q: "He said, 'I am very tired today.' -> He said that he ___ very tired that day.",
                options: ["is", "was", "has been", "would be"],
                answer: 1,
                explanation: "Lời nói gián tiếp phải lùi thì hiện tại đơn 'am' thành quá khứ đơn 'was'."
            },
            {
                q: "She told me that she ___ soccer the day before.",
                options: ["plays", "played", "had played", "has played"],
                answer: 2,
                explanation: "Dấu hiệu 'the day before' (gốc là yesterday), động từ gốc chia quá khứ đơn lùi về quá khứ hoàn thành 'had played'."
            },
            {
                q: "My mother asked me where I ___.",
                options: ["go", "going", "was going", "will go"],
                answer: 2,
                explanation: "Câu hỏi gián tiếp lùi thì tiếp diễn: 'where are you going' -> 'where I was going'."
            }
        ]
    },
    {
        id: "gr-16",
        title: "Động từ Khuyết thiếu (Modal Verbs)",
        category: "sentences",
        description: "Bổ nghĩa thái độ, khả năng, sự cấm đoán, nghĩa vụ hoặc lời khuyên.",
        formula: "S + Modal Verb (can/could/must/should/may...) + V(nguyên mẫu)",
        usage: [
            "Sử dụng 'can/could' chỉ khả năng, năng lực ở hiện tại/quá khứ.",
            "Sử dụng 'should' để đưa ra lời khuyên hay ý kiến.",
            "Sử dụng 'must' chỉ nghĩa vụ bắt buộc, 'must not' chỉ sự cấm đoán.",
            "Sử dụng 'may/might' chỉ khả năng sự việc có thể xảy ra nhưng không chắc chắn."
        ],
        examples: [
            { en: "You should study vocabulary daily to prepare for the IELTS exam.", vi: "Bạn nên học từ vựng mỗi ngày để chuẩn bị cho kỳ thi IELTS." },
            { en: "You must not park your car in this area.", vi: "Bạn không được phép đỗ xe ô tô của mình ở khu vực này." },
            { en: "She can speak English and Vietnamese fluently.", vi: "Cô ấy có thể nói trôi chảy cả tiếng Anh và tiếng Việt." }
        ],
        practice: [
            {
                q: "It is a forbidden zone. You ___ enter this room.",
                options: ["must not", "don't have to", "should", "need not"],
                answer: 0,
                explanation: "Cấm đoán tuyệt đối ('forbidden zone'), ta phải sử dụng động từ khuyết thiếu 'must not'."
            },
            {
                q: "If you want to pass the test, you ___ study harder.",
                options: ["can", "should", "might", "may"],
                answer: 1,
                explanation: "Đưa ra lời khuyên khích lệ người học nên làm gì, dùng trợ động từ khuyết thiếu 'should'."
            },
            {
                q: "She isn't at home. She ___ be working at the office.",
                options: ["must to", "might", "can to", "should to"],
                answer: 1,
                explanation: "Khả năng suy đoán không chắc chắn, động từ khuyết thiếu 'might' đi trực tiếp với động từ nguyên mẫu 'be'."
            }
        ]
    },
    {
        id: "gr-17",
        title: "Danh động từ & Động từ Nguyên mẫu (Gerunds & Infinitives)",
        category: "sentences",
        description: "Quy tắc sử dụng dạng V-ing hay to-V đi sau các động từ khác.",
        formula: "S + V + V-ing (Gerund)  |  S + V + to-V (Infinitive)",
        usage: [
            "Danh động từ (V-ing): Theo sau các động từ như 'avoid', 'mind', 'enjoy', 'suggest', 'keep', 'admit', hoặc sau giới từ.",
            "Động từ nguyên mẫu có to (to-V): Theo sau các động từ như 'want', 'decide', 'hope', 'agree', 'promise', 'refuse', 'plan'."
        ],
        examples: [
            { en: "She decided to study English online with LearningEnglish.", vi: "Cô ấy quyết định học tiếng Anh trực tuyến với ứng dụng LearningEnglish." },
            { en: "We enjoy learning vocabulary using 3D flashcards.", vi: "Chúng tôi thích học từ vựng bằng cách lướt thẻ flashcard 3D." },
            { en: "I promise to call you as soon as I arrive at the hotel.", vi: "Tôi hứa sẽ gọi cho bạn ngay khi tôi tới khách sạn." }
        ],
        practice: [
            {
                q: "He avoided ___ junk food to protect his health.",
                options: ["eat", "eating", "to eat", "eaten"],
                answer: 1,
                explanation: "Động từ 'avoid' (tránh) bắt buộc phải đi kèm với danh động từ dạng V-ing ('eating')."
            },
            {
                q: "They agreed ___ us build a new web application.",
                options: ["help", "to help", "helping", "helped"],
                answer: 1,
                explanation: "Động từ 'agree' (đồng ý) bắt buộc đi với động từ nguyên mẫu có to ('to help')."
            },
            {
                q: "Thank you for ___ me with my English homework.",
                options: ["help", "to help", "helping", "helped"],
                answer: 2,
                explanation: "Sau giới từ 'for', động từ chính phải thêm đuôi '-ing' đóng vai trò danh động từ ('helping')."
            }
        ]
    },
    {
        id: "gr-18",
        title: "Giới từ chỉ Thời gian và Nơi chốn (Prepositions of Time & Place)",
        category: "sentences",
        description: "Quy tắc sử dụng các giới từ thiết yếu IN, ON, AT.",
        formula: "AT + giờ / địa điểm cụ thể  |  ON + ngày / bề mặt  |  IN + tháng, năm, mùa / bên trong không gian",
        usage: [
            "Giới từ thời gian: 'at' + giờ cụ thể, 'on' + ngày trong tuần/ngày tháng, 'in' + tháng/năm/thập kỷ.",
            "Giới từ địa điểm: 'at' + địa chỉ cụ thể/nơi chốn nhỏ, 'on' + tên đường/bề mặt, 'in' + thành phố/quốc gia/bên trong không gian khép kín."
        ],
        examples: [
            { en: "The English class starts at 8:00 AM in the morning.", vi: "Lớp học tiếng Anh bắt đầu vào lúc 8:00 sáng." },
            { en: "I was born on September 24th, 1995 in Hanoi city.", vi: "Tôi sinh ngày 24 tháng 9 năm 1995 tại thành phố Hà Nội." },
            { en: "There is a beautiful picture on the wall in my room.", vi: "Có một bức tranh xinh đẹp treo trên tường ở trong phòng tôi." }
        ],
        practice: [
            {
                q: "Our graduation ceremony will take place ___ 8:00 AM ___ Monday.",
                options: ["at/on", "in/on", "at/in", "on/at"],
                answer: 0,
                explanation: "Giới từ chỉ giờ cụ thể dùng 'at' ('at 8:00 AM'), chỉ thứ trong tuần dùng 'on' ('on Monday')."
            },
            {
                q: "He lived ___ London ___ many years before moving to Vietnam.",
                options: ["at/in", "in/for", "on/for", "in/since"],
                answer: 1,
                explanation: "Trước tên thành phố lớn dùng 'in' ('in London'), chỉ khoảng thời gian kéo dài dùng 'for' ('for many years')."
            },
            {
                q: "The keys are ___ the table ___ the kitchen.",
                options: ["in/on", "on/in", "at/in", "on/at"],
                answer: 1,
                explanation: "Chỉ bề mặt bàn dùng 'on' ('on the table'), không gian phòng bếp dùng 'in' ('in the kitchen')."
            }
        ]
    },
    {
        id: "gr-19",
        title: "Câu hỏi Đuôi (Tag Questions)",
        category: "sentences",
        description: "Câu hỏi ngắn gắn vào cuối câu trần thuật để xác nhận thông tin.",
        formula: "Mệnh đề khẳng định , Trợ động từ phủ định + Đại từ?  |  Mệnh đề phủ định , Trợ động từ khẳng định + Đại từ?",
        usage: [
            "Nếu mệnh đề chính ở dạng khẳng định, câu hỏi đuôi phải ở dạng phủ định (viết tắt) và ngược lại.",
            "Thì của trợ động từ ở câu hỏi đuôi phải trùng khớp với thì ở mệnh đề chính."
        ],
        examples: [
            { en: "You are a software engineer, aren't you?", vi: "Bạn là một kỹ sư phần mềm, có phải không?" },
            { en: "He doesn't like spicy food, does he?", vi: "Anh ấy không thích ăn đồ ăn cay nóng, đúng chứ?" },
            { en: "She won a gold star yesterday, didn't she?", vi: "Cô ấy đã giành được một ngôi sao vàng vào ngày hôm qua, phải không?" }
        ],
        practice: [
            {
                q: "Your brother speaks English fluently, ___ he?",
                options: ["does", "doesn't", "is", "isn't"],
                answer: 1,
                explanation: "Mệnh đề chính ở khẳng định hiện tại đơn với động từ thường, câu hỏi đuôi dùng trợ động từ phủ định 'doesn't'."
            },
            {
                q: "They haven't finished their project yet, ___ they?",
                options: ["have", "has", "haven't", "did"],
                answer: 0,
                explanation: "Mệnh đề chính dùng phủ định hiện tại hoàn thành 'haven't', câu hỏi đuôi dùng khẳng định 'have'."
            },
            {
                q: "We won't go camping if it rains, ___ we?",
                options: ["will", "won't", "do", "don't"],
                answer: 0,
                explanation: "Mệnh đề chính phủ định tương lai đơn 'won't', câu hỏi đuôi tương ứng dùng khẳng định 'will'."
            }
        ]
    },
    {
        id: "gr-20",
        title: "Câu Ước (Wish Clauses)",
        category: "sentences",
        description: "Bày tỏ mong muốn, giả định trái ngược với thực tế ở hiện tại, tương lai hoặc quá khứ.",
        formula: "Ước hiện tại: S + wish + S + V2/ed (were)  |  Ước quá khứ: S + wish + S + had + V3/ed  |  Ước tương lai: S + wish + S + would + V(nguyên mẫu)",
        usage: [
            "Ước hiện tại: Diễn tả mong ước trái ngược với sự thật khách quan ở hiện tại.",
            "Ước quá khứ: Diễn tả sự hối tiếc về một việc đã xảy ra hoặc không xảy ra trong quá khứ.",
            "Ước tương lai: Diễn tả ước muốn thay đổi hành vi hoặc sự việc sẽ xảy ra tốt hơn trong tương lai."
        ],
        examples: [
            { en: "I wish I could fly like a bird.", vi: "Tôi ước tôi có thể bay lượn như một chú chim (thực tế hiện tại tôi không thể)." },
            { en: "I wish I hadn't eaten so much chocolate yesterday.", vi: "Tôi ước ngày hôm qua tôi đã không ăn quá nhiều sô-cô-la (thực tế tôi đã ăn rất nhiều và thấy hối tiếc)." },
            { en: "I wish the rain would stop tomorrow.", vi: "Tôi ước trời sẽ ngừng mưa vào ngày mai." }
        ],
        practice: [
            {
                q: "I don't have enough money. I wish I ___ a millionaire.",
                options: ["am", "was", "were", "been"],
                answer: 2,
                explanation: "Câu ước hiện tại trái ngược thực tế, động từ to-be lùi về quá khứ giả định 'were' cho mọi ngôi."
            },
            {
                q: "He regrets going to bed late. He wishes he ___ to bed earlier last night.",
                options: ["went", "had gone", "would go", "goes"],
                answer: 1,
                explanation: "Ước cho một sự việc xảy ra trái thực tế quá khứ ('last night'), lùi về quá khứ hoàn thành 'had gone'."
            },
            {
                q: "It keeps raining. I wish it ___ stop soon.",
                options: ["will", "would", "can", "should"],
                answer: 1,
                explanation: "Ước một thay đổi tích cực trong tương lai, dùng cấu trúc 'would + V-infinitive' ('would stop')."
            }
        ]
    }
];
