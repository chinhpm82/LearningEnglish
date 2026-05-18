/* ==========================================================================
   LearningEnglish - Expanded Interactive Grammar Database (240+ Scenarios)
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
                q: "Situation: Discussing English habits. 'She ___ English very well.'",
                options: ["speak", "speaks", "speaking", "spoken"],
                answer: 1,
                explanation: "Chủ ngữ là ngôi thứ ba số ít 'She', động từ 'speak' phải thêm 's' thành 'speaks'."
            },
            {
                q: "Situation: Weekend hobbies. 'They ___ soccer on Sunday afternoons.'",
                options: ["play", "plays", "playing", "played"],
                answer: 0,
                explanation: "Chủ ngữ là ngôi số nhiều 'They', động từ giữ nguyên mẫu ở hiện tại đơn."
            },
            {
                q: "Situation: Science facts. 'Water ___ at 100 degrees Celsius.'",
                options: ["boil", "boils", "boiling", "boiled"],
                answer: 1,
                explanation: "Đây là một sự thật hiển nhiên, chủ ngữ 'Water' không đếm được nên động từ thêm 's'."
            },
            {
                q: "Situation: Public transportation schedules. 'The last bus to Hanoi ___ at 9:30 PM every night.'",
                options: ["leave", "leaves", "leaving", "left"],
                answer: 1,
                explanation: "Lịch trình cố định lặp đi lặp lại hàng ngày, chủ ngữ 'The last bus' số ít nên động từ chia 'leaves'."
            },
            {
                q: "Situation: Career info. 'My father is a programmer. He ___ software for a living.'",
                options: ["write", "writes", "writing", "written"],
                answer: 1,
                explanation: "Nghề nghiệp cố định ổn định, chủ ngữ 'He' đi với động từ chia số ít thêm 's'."
            },
            {
                q: "Situation: Daily routines. 'I always ___ my teeth before going to sleep.'",
                options: ["brush", "brushes", "brushing", "brushed"],
                answer: 0,
                explanation: "Thói quen ở hiện tại, chủ ngữ 'I' đi với động từ dạng nguyên mẫu không chia."
            },
            {
                q: "Situation: IT facts. 'Modern computers ___ massive amounts of data in milliseconds.'",
                options: ["process", "processes", "processing", "processed"],
                answer: 0,
                explanation: "Sự thật hiển nhiên về máy tính, chủ ngữ số nhiều 'Modern computers' đi với động từ nguyên mẫu 'process'."
            },
            {
                q: "Situation: General truths. 'The Earth ___ around the Sun.'",
                options: ["revolve", "revolves", "revolving", "revolved"],
                answer: 1,
                explanation: "Chân lý khoa học bất biến, chủ ngữ 'The Earth' là duy nhất số ít nên động từ chia 'revolves'."
            },
            {
                q: "Situation: Class schedule. 'Our English lecture ___ at 8:00 AM next Monday.'",
                options: ["start", "starts", "starting", "started"],
                answer: 1,
                explanation: "Lịch trình học tập cố định, dùng hiện tại đơn diễn tả sự việc tương lai có thời gian biểu."
            },
            {
                q: "Situation: Preferences. 'My children ___ reading comic books in their free time.'",
                options: ["like", "likes", "liking", "liked"],
                answer: 0,
                explanation: "Sở thích lâu dài, chủ ngữ số nhiều 'My children' đi với động từ nguyên mẫu 'like'."
            },
            {
                q: "Situation: Family facts. 'She has a big family. Her parents ___ in a peaceful countryside.'",
                options: ["live", "lives", "living", "lived"],
                answer: 0,
                explanation: "Sự thật lâu dài, chủ ngữ 'Her parents' số nhiều đi với động từ nguyên mẫu 'live'."
            },
            {
                q: "Situation: Daily hygiene. 'He ___ his hands thoroughly before every meal.'",
                options: ["wash", "washes", "washing", "washed"],
                answer: 1,
                explanation: "Thói quen hàng ngày tốt, chủ ngữ 'He' số ít, động từ kết thúc bằng 'sh' chia thêm 'es' thành 'washes'."
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
                q: "Situation: Sudden weather change. 'Look! It ___ outside.'",
                options: ["rain", "rains", "is raining", "rained"],
                answer: 2,
                explanation: "Từ cảm thán 'Look!' báo hiệu hành động đang trực tiếp diễn ra trước mắt người nói."
            },
            {
                q: "Situation: Temporary action. 'I ___ a very interesting English novel right now.'",
                options: ["read", "am reading", "reads", "reading"],
                answer: 1,
                explanation: "Cụm từ chỉ thời gian 'right now' yêu cầu chia hiện tại tiếp diễn, chủ ngữ 'I' đi với 'am reading'."
            },
            {
                q: "Situation: Inquiring about current state. 'What ___ you ___ at the moment?'",
                options: ["are/doing", "do/do", "is/doing", "are/does"],
                answer: 0,
                explanation: "Dấu hiệu 'at the moment' yêu cầu chia hiện tại tiếp diễn, chủ ngữ 'you' đi với 'are V-ing'."
            },
            {
                q: "Situation: Temporary project. 'We ___ on a new IT website project this week.'",
                options: ["work", "works", "are working", "worked"],
                answer: 2,
                explanation: "Dấu hiệu 'this week' diễn tả một dự án tạm thời, dùng hiện tại tiếp diễn 'are working'."
            },
            {
                q: "Situation: Asking to be quiet. 'Listen! Someone ___ the piano upstairs.'",
                options: ["play", "plays", "is playing", "played"],
                answer: 2,
                explanation: "Từ cảm thán 'Listen!' báo hiệu hành động đang diễn ra ngay lúc nói."
            },
            {
                q: "Situation: Changing trends. 'The cost of living in big cities ___ higher and higher.'",
                options: ["get", "gets", "is getting", "got"],
                answer: 2,
                explanation: "Diễn tả xu hướng đang biến đổi dần dần, ta dùng thì hiện tại tiếp diễn 'is getting'."
            },
            {
                q: "Situation: Arranged future plan. 'They ___ to Tokyo tomorrow night.'",
                options: ["fly", "flies", "are flying", "flew"],
                answer: 2,
                explanation: "Kế hoạch đã được chuẩn bị mua vé chắc chắn trong tương lai gần, dùng tiếp diễn 'are flying'."
            },
            {
                q: "Situation: Phone call context. 'Sorry, I can't talk now. I ___ my homework.'",
                options: ["do", "am doing", "does", "doing"],
                answer: 1,
                explanation: "Hành động đang trực tiếp thực hiện làm người nói bận rộn tại thời điểm đàm thoại."
            },
            {
                q: "Situation: Temporary living. 'She usually lives in Hanoi, but she ___ in Da Nang this summer.'",
                options: ["stay", "stays", "is staying", "stayed"],
                answer: 2,
                explanation: "Diễn tả trạng thái tạm thời khác biệt thói quen hàng ngày, dùng tiếp diễn 'is staying'."
            },
            {
                q: "Situation: Asking for attention. 'Be quiet! The teacher ___ the assignment instructions.'",
                options: ["explain", "explains", "is explaining", "explained"],
                answer: 2,
                explanation: "Yêu cầu im lặng để nghe hành động đang tiếp diễn của giáo viên."
            },
            {
                q: "Situation: IT development. 'Tech giants ___ new artificial intelligence models these days.'",
                options: ["develop", "are developing", "develops", "developed"],
                answer: 1,
                explanation: "Hành động đang diễn ra xung quanh thời điểm nói ('these days'), dùng 'are developing'."
            },
            {
                q: "Situation: Finding lost things. 'Why ___ you ___ under the table? Did you lose something?'",
                options: ["do/look", "are/looking", "is/looking", "did/look"],
                answer: 1,
                explanation: "Hành động tò mò hỏi trực tiếp hành vi đang làm ở hiện tại, dùng 'are you looking'."
            }
        ]
    },
    {
        id: "gr-3",
        title: "Thì Hiện tại Hoàn thành (Present Perfect)",
        category: "tenses",
        description: "Diễn tả hành động đã xảy ra trong quá khứ kéo dài đến hiện tại và có thể tiếp diễn.",
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
                q: "Situation: Movie experiences. 'I ___ this beautiful movie three times.'",
                options: ["see", "saw", "have seen", "am seeing"],
                answer: 2,
                explanation: "Diễn tả trải nghiệm lặp đi lặp lại nhiều lần tính đến hiện tại, dùng 'have seen'."
            },
            {
                q: "Situation: Learning timeline. 'She has studied English ___ she was a child.'",
                options: ["for", "since", "in", "from"],
                answer: 1,
                explanation: "Dùng 'since' trước một mốc thời gian cụ thể trong quá khứ ('she was a child')."
            },
            {
                q: "Situation: Long-term friendship. 'They ___ each other for over ten years.'",
                options: ["know", "knew", "have known", "are knowing"],
                answer: 2,
                explanation: "Động từ trạng thái 'know' không chia ở tiếp diễn, kết hợp với 'for over ten years' dùng hiện tại hoàn thành."
            },
            {
                q: "Situation: Recent completion. 'He ___ his project proposal. The manager is reviewing it now.'",
                options: ["just finishes", "has just finished", "just finished", "is just finishing"],
                answer: 1,
                explanation: "Hành động vừa mới hoàn thành xong để lại kết quả ở hiện tại, dùng 'has just finished'."
            },
            {
                q: "Situation: Travel experience check. '___ you ever ___ to a European country?'",
                options: ["Did/travel", "Have/travel", "Have/traveled", "Are/traveling"],
                answer: 2,
                explanation: "Hỏi về trải nghiệm trong đời tính đến nay, dùng cấu trúc 'Have you ever + V3'."
            },
            {
                q: "Situation: Non-completed action yet. 'We ___ our lunch yet, we are still waiting for the food.'",
                options: ["haven't had", "didn't have", "don't have", "hadn't had"],
                answer: 0,
                explanation: "Dấu hiệu 'yet' ở cuối câu phủ định yêu cầu chia hiện tại hoàn thành phủ định 'haven't had'."
            },
            {
                q: "Situation: Changing jobs. 'She ___ three different companies since she graduated in 2022.'",
                options: ["joins", "joined", "has joined", "joining"],
                answer: 2,
                explanation: "Diễn tả chuỗi hành động tích lũy xảy ra từ mốc quá khứ 'since' đến hiện tại."
            },
            {
                q: "Situation: Career achievement. 'Our development team ___ the mobile app version 2.0 today.'",
                options: ["released", "releases", "has released", "releasing"],
                answer: 2,
                explanation: "Hành động đã hoàn thành trong khoảng thời gian chưa kết thúc ('today'), dùng 'has released'."
            },
            {
                q: "Situation: Lifetime reading. 'I ___ that massive book; it has over 1,000 pages!'",
                options: ["never read", "have never read", "never did read", "am never reading"],
                answer: 1,
                explanation: "Bày tỏ trải nghiệm chưa từng làm gì trong đời tính đến hiện tại, dùng 'have never read'."
            },
            {
                q: "Situation: Physical results. 'Look! The road is wet because it ___.'",
                options: ["rains", "rained", "has rained", "is raining"],
                answer: 2,
                explanation: "Hành động mưa đã chấm dứt nhưng để lại hậu quả rõ ràng ở hiện tại là đường ướt."
            },
            {
                q: "Situation: Length of residency. 'My family ___ in this apartment since 2015.'",
                options: ["lives", "lived", "has lived", "is living"],
                answer: 2,
                explanation: "Kéo dài liên tục từ mốc thời gian quá khứ 'since 2015' đến nay, dùng 'has lived'."
            },
            {
                q: "Situation: Recent news. 'Great news! Our company ___ the national start-up competition!'",
                options: ["wins", "has won", "won", "winning"],
                answer: 1,
                explanation: "Thông tin thông báo tin tức mới nhận được có sức ảnh hưởng hiện tại, dùng 'has won'."
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
                q: "Situation: Yesterday's trip. 'She ___ to the cinema last night.'",
                options: ["go", "goes", "went", "going"],
                answer: 2,
                explanation: "Có dấu hiệu chỉ thời gian xác định đã qua 'last night', chia động từ bất quy tắc V2 'went'."
            },
            {
                q: "Situation: Vacation details. 'Where ___ you ___ your summer vacation in 2025?'",
                options: ["did/spend", "do/spend", "did/spent", "have/spent"],
                answer: 0,
                explanation: "Câu hỏi quá khứ đơn mượn trợ động từ 'did', động từ chính đưa về nguyên mẫu 'spend'."
            },
            {
                q: "Situation: Party feelings. 'They ___ very happy at the party yesterday.'",
                options: ["are", "was", "were", "been"],
                answer: 2,
                explanation: "Động từ to-be chia ở quá khứ cho chủ ngữ số nhiều 'They' là 'were'."
            },
            {
                q: "Situation: Academic history. 'Shakespeare ___ Romeo and Juliet in the late 16th century.'",
                options: ["writes", "wrote", "has written", "was writing"],
                answer: 1,
                explanation: "Sự việc lịch sử đã xảy ra và kết thúc hoàn toàn trong quá khứ, chia V2 'wrote'."
            },
            {
                q: "Situation: Sequence of events. 'He stood up, ___ his coat, and walked out into the rain.'",
                options: ["take", "took", "taken", "was taking"],
                answer: 1,
                explanation: "Chuỗi các hành động liên tiếp nhau trong quá khứ, tất cả các động từ đều chia quá khứ đơn 'took'."
            },
            {
                q: "Situation: Childhood habits. 'When I was a little child, I ___ chocolate every day.'",
                options: ["love", "loved", "have loved", "loving"],
                answer: 1,
                explanation: "Một thói quen, sở thích trong quá khứ đã kết thúc ở hiện tại, dùng 'loved'."
            },
            {
                q: "Situation: Job duration. 'She ___ as a high-school teacher for five years, but now she is retired.'",
                options: ["works", "worked", "has worked", "working"],
                answer: 1,
                explanation: "Dù có khoảng thời gian nhưng sự việc đã kết thúc hoàn toàn (hiện tại đã nghỉ hưu), dùng 'worked'."
            },
            {
                q: "Situation: Date check. 'The first global computer network ___ launched in 1969.'",
                options: ["is", "was", "were", "been"],
                answer: 1,
                explanation: "Sự kiện lịch sử năm 1969, chủ ngữ 'The first global computer network' là số ít nên dùng 'was'."
            },
            {
                q: "Situation: Missing a class. 'I ___ attend the programming lecture yesterday because I was ill.'",
                options: ["don't", "didn't", "haven't", "wasn't"],
                answer: 1,
                explanation: "Phủ định quá khứ đơn mượn trợ động từ 'didn't' đi kèm động từ nguyên mẫu 'attend'."
            },
            {
                q: "Situation: Breaking news timeline. 'Two hours ago, the president ___ the new economy law.'",
                options: ["announces", "announced", "has announced", "announcing"],
                answer: 1,
                explanation: "Dấu hiệu 'two hours ago' yêu cầu chia quá khứ đơn 'announced'."
            },
            {
                q: "Situation: Finding items. 'Luckily, I ___ my lost keys under the living room sofa.'",
                options: ["find", "found", "have found", "finding"],
                answer: 1,
                explanation: "Hành động tìm thấy đã diễn ra xong, chia động từ bất quy tắc V2 của 'find' là 'found'."
            },
            {
                q: "Situation: Accident. 'He fell off his bicycle and ___ his arm last week.'",
                options: ["break", "broke", "broken", "was breaking"],
                answer: 1,
                explanation: "Tai nạn xảy ra tuần trước, chia động từ bất quy tắc V2 của 'break' là 'broke'."
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
                q: "Situation: Interrupted event. 'What ___ you ___ when the earthquake occurred?'",
                options: ["are/doing", "do/do", "were/doing", "was/doing"],
                answer: 2,
                explanation: "Hành động đang diễn ra bị hành động khác xen ngang trong quá khứ, chủ ngữ 'you' đi với 'were doing'."
            },
            {
                q: "Situation: Parallel events. 'She ___ her homework while we were listening to music.'",
                options: ["does", "was doing", "did", "doing"],
                answer: 1,
                explanation: "Hai hành động xảy ra song song đồng thời trong quá khứ, sử dụng liên từ 'while' kèm quá khứ tiếp diễn 'was doing'."
            },
            {
                q: "Situation: Specific past time. 'At this time yesterday, I ___ on the beach in Nha Trang.'",
                options: ["am lying", "lay", "was lying", "have lain"],
                answer: 2,
                explanation: "Có mốc thời gian cụ thể xác định trong quá khứ 'At this time yesterday', chia quá khứ tiếp diễn 'was lying'."
            },
            {
                q: "Situation: Phone call interruption. 'I ___ a shower when the telephone rang.'",
                options: ["take", "took", "was taking", "am taking"],
                answer: 2,
                explanation: "Hành động đang diễn ra là tắm ('was taking') thì bị hành động điện thoại reo xen ngang ('rang')."
            },
            {
                q: "Situation: Walking down the street. 'While she ___ to school, she met a famous pop singer.'",
                options: ["walks", "walked", "was walking", "is walking"],
                answer: 2,
                explanation: "Hành động đi bộ đang xảy ra trong quá khứ thì đột nhiên gặp ca sĩ, dùng 'was walking'."
            },
            {
                q: "Situation: Power cut. 'The lights went out while we ___ dinner.'",
                options: ["have", "had", "were having", "are having"],
                answer: 2,
                explanation: "Hành động mất điện xen ngang hành động đang ăn tối của cả nhà, dùng 'were having'."
            },
            {
                q: "Situation: Road observation. 'I saw a car accident while I ___ at the bus stop.'",
                options: ["wait", "waited", "was waiting", "waiting"],
                answer: 2,
                explanation: "Hành động đang đứng chờ ở trạm xe buýt chia quá khứ tiếp diễn 'was waiting'."
            },
            {
                q: "Situation: Studying in the library. 'She didn't hear the alarm because she ___ music on headphones.'",
                options: ["listens", "listened", "was listening", "is listening"],
                answer: 2,
                explanation: "Hành động đang nghe nhạc liên tục che lấp âm thanh báo thức tại thời điểm đó."
            },
            {
                q: "Situation: Midnight activity. 'At midnight last night, most people ___ in their warm beds.'",
                options: ["sleep", "slept", "were sleeping", "was sleeping"],
                answer: 2,
                explanation: "Mốc thời gian cực kỳ cụ thể 'At midnight last night', chủ ngữ số nhiều 'people' đi với 'were sleeping'."
            },
            {
                q: "Situation: Rainy drive. 'It ___ heavily when he left the office yesterday.'",
                options: ["rains", "rained", "was raining", "has rained"],
                answer: 2,
                explanation: "Mưa đang diễn ra liên tục tại thời điểm anh ấy rời văn phòng, dùng 'was raining'."
            },
            {
                q: "Situation: Cooking disaster. 'My sister burnt her finger while she ___ the vegetables.'",
                options: ["chop", "chopped", "was chopping", "chopping"],
                answer: 2,
                explanation: "Hành động thái rau đang diễn ra thì bị bỏng tay xen ngang, dùng 'was chopping'."
            },
            {
                q: "Situation: Walking the dog. 'They ___ their dog when a stray cat suddenly attacked.'",
                options: ["walk", "walked", "were walking", "are walking"],
                answer: 2,
                explanation: "Hành động đang dắt chó đi dạo bị mèo tấn công xen ngang, dùng 'were walking'."
            }
        ]
    },
    {
        id: "gr-6",
        title: "Thì Quá khứ Hoàn thành (Past Perfect)",
        category: "tenses",
        description: "Diễn tả hành động xảy ra trước một hành động khác hoặc một mốc thời gian trong quá khứ.",
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
                q: "Situation: Arriving too late. 'By the time we arrived at the cinema, the movie ___.'",
                options: ["started", "has started", "had started", "was starting"],
                answer: 2,
                explanation: "Hành động bộ phim bắt đầu xảy ra trước hành động chúng tôi đến, chia quá khứ hoàn thành 'had started'."
            },
            {
                q: "Situation: Recalling past faces. 'She said she ___ that man somewhere before.'",
                options: ["met", "has met", "had met", "meets"],
                answer: 2,
                explanation: "Hành động gặp người đàn ông xảy ra trước lời phát biểu trong quá khứ, dùng quá khứ hoàn thành 'had met'."
            },
            {
                q: "Situation: Lost wallet. 'He didn't have money because he ___ his wallet.'",
                options: ["lost", "has lost", "had lost", "was losing"],
                answer: 2,
                explanation: "Việc mất ví xảy ra trước việc không có tiền trong quá khứ, dùng quá khứ hoàn thành 'had lost'."
            },
            {
                q: "Situation: Completed training. 'She ___ the coding course before she applied for the developer job.'",
                options: ["finish", "finished", "had finished", "finishing"],
                answer: 2,
                explanation: "Hành động hoàn thành khóa học xảy ra trước hành động nộp đơn ứng tuyển, dùng 'had finished'."
            },
            {
                q: "Situation: Empty house. 'When we got home last night, we found that someone ___ our flat.'",
                options: ["breaks into", "broke into", "had broken into", "was breaking into"],
                answer: 2,
                explanation: "Kẻ trộm đột nhập vào nhà trước thời điểm chúng tôi trở về phát hiện, dùng 'had broken into'."
            },
            {
                q: "Situation: Exam prep feeling. 'I felt very confident during the test because I ___ so hard.'",
                options: ["study", "studied", "had studied", "have studied"],
                answer: 2,
                explanation: "Việc học bài diễn ra trước buổi thi trong quá khứ, dùng quá khứ hoàn thành 'had studied'."
            },
            {
                q: "Situation: Changing plans. 'They decided to buy the house that they ___ twice before.'",
                options: ["visit", "visited", "had visited", "visiting"],
                answer: 2,
                explanation: "Hành động ghé thăm nhà xảy ra trước quyết định mua trong quá khứ, dùng 'had visited'."
            },
            {
                q: "Situation: Homework check. 'The teacher was angry because the students ___ their homework.'",
                options: ["don't do", "didn't do", "hadn't done", "haven't done"],
                answer: 2,
                explanation: "Hành động lười không làm bài xảy ra trước sự giận dữ của giáo viên, dùng phủ định 'hadn't done'."
            },
            {
                q: "Situation: Travel logic. 'He didn't know the way around London because he ___ there before.'",
                options: ["isn't", "wasn't", "hadn't been", "hasn't been"],
                answer: 2,
                explanation: "Việc chưa từng đến đây xảy ra trước trạng thái bỡ ngỡ không biết đường, dùng 'hadn't been'."
            },
            {
                q: "Situation: Sold out. 'I wanted to buy the new smartphone, but the shop ___ out of stock.'",
                options: ["sell", "sold", "had sold", "has sold"],
                answer: 2,
                explanation: "Cửa hàng đã bán hết điện thoại trước lúc tôi đến hỏi mua, dùng 'had sold'."
            },
            {
                q: "Situation: Unread messages. 'When I turned on my laptop, I saw she ___ me three emails.'",
                options: ["sends", "sent", "had sent", "has sent"],
                answer: 2,
                explanation: "Việc gửi email xảy ra trước lúc tôi bật máy tính lên xem, dùng 'had sent'."
            },
            {
                q: "Situation: Language background. 'We ___ English for six years before we had our first conversation with a native speaker.'",
                options: ["learn", "learned", "had learned", "have learned"],
                answer: 2,
                explanation: "Quá trình học tiếng Anh diễn ra tích lũy trước cuộc hội thoại thực tế đầu tiên, dùng 'had learned'."
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
                q: "Situation: Instant decision. 'A: The phone is ringing. - B: Don't worry, I ___ answer it.'",
                options: ["will", "am going to", "do", "shall"],
                answer: 0,
                explanation: "Quyết định tức thời ngay tại lúc nói, dùng trợ động từ 'will'."
            },
            {
                q: "Situation: Hopeful future. 'I hope you ___ your English exam next week.'",
                options: ["pass", "will pass", "are passing", "passed"],
                answer: 1,
                explanation: "Sau các động từ chỉ hy vọng mong đợi như 'hope', ta dùng tương lai đơn 'will pass'."
            },
            {
                q: "Situation: Approximate arrival. 'We ___ probably get there around 6 PM.'",
                options: ["will", "are going to", "does", "would"],
                answer: 0,
                explanation: "Phỏng đoán tương lai có trạng từ chỉ xác suất 'probably', dùng tương lai đơn 'will'."
            },
            {
                q: "Situation: Offering assistance. 'These bags look very heavy. I ___ help you with them.'",
                options: ["am going to", "will", "do", "shall to"],
                answer: 1,
                explanation: "Lời đề nghị giúp đỡ tự nguyện ngay khi thấy tình huống khó khăn, dùng 'will'."
            },
            {
                q: "Situation: Sincere promise. 'I promise I ___ tell anyone what you said.'",
                options: ["won't", "don't", "am not going to", "haven't"],
                answer: 0,
                explanation: "Lời hứa giữ bí mật, phủ định của 'will' là 'will not' (viết tắt thành 'won't')."
            },
            {
                q: "Situation: Ordering at a restaurant. 'A: What would you like to drink? - B: I ___ have an orange juice, please.'",
                options: ["am going to", "will", "do", "would"],
                answer: 1,
                explanation: "Quyết định gọi món ăn uống đưa ra ngay lúc phục vụ hỏi, dùng 'will'."
            },
            {
                q: "Situation: Predicting tech futures. 'In 2030, I think artificial intelligence ___ drive most cars.'",
                options: ["is going to", "will", "drives", "will be going to"],
                answer: 1,
                explanation: "Dự đoán mang tính cá nhân, có động từ phỏng đoán 'I think', dùng tương lai đơn 'will'."
            },
            {
                q: "Situation: Sudden cold weather. 'It is a bit cold in this room. I ___ close the window.'",
                options: ["am going to", "will", "do", "am closing"],
                answer: 1,
                explanation: "Quyết định đóng cửa tức thời do thấy lạnh đột ngột, dùng 'will'."
            },
            {
                q: "Situation: Reassuring study results. 'Study hard, and you ___ definitely earn a gold star.'",
                options: ["are going to", "will", "do", "shall"],
                answer: 1,
                explanation: "Lời hứa hẹn, kết quả chắc chắn sẽ xảy ra nếu thực hiện điều kiện, dùng 'will'."
            },
            {
                q: "Situation: Warning a lazy employee. 'Work faster or the boss ___ fire you.'",
                options: ["is going to", "will", "does", "shall"],
                answer: 1,
                explanation: "Lời đe dọa cảnh báo kết quả tương lai, dùng tương lai đơn 'will'."
            },
            {
                q: "Situation: Repaying borrowed money. 'Thank you for the loan. I ___ pay you back next Monday.'",
                options: ["am going to", "will", "do", "shall"],
                answer: 1,
                explanation: "Lời hứa thanh toán hoàn trả tiền sòng phẳng, dùng 'will'."
            },
            {
                q: "Situation: Personal belief. 'I don't think she ___ agree to this layout design.'",
                options: ["is going to", "will", "does", "would"],
                answer: 1,
                explanation: "Dự đoán chủ quan, đi kèm cấu trúc 'I don't think', dùng tương lai đơn 'will'."
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
                q: "Situation: Physical evidence. 'Look at that boy running too fast! He ___ fall.'",
                options: ["will", "is going to", "falls", "fell"],
                answer: 1,
                explanation: "Có bằng chứng rõ ràng ở hiện tại ('boy running too fast') báo hiệu sự việc sắp xảy ra, dùng 'is going to'."
            },
            {
                q: "Situation: Academic goal prepared. 'I ___ study abroad because I've already passed the IELTS exam.'",
                options: ["will", "am going to", "shall", "study"],
                answer: 1,
                explanation: "Dự định đã được lên kế hoạch và có sự chuẩn bị kỹ càng từ trước, dùng 'am going to'."
            },
            {
                q: "Situation: Formal question about clothing. 'What ___ you ___ wear to the wedding party next Saturday?'",
                options: ["will/wear", "are/going to", "are/going to wear", "do/wear"],
                answer: 2,
                explanation: "Hỏi về kế hoạch lựa chọn trang phục đã định trước, cấu trúc 'Are you going to wear'."
            },
            {
                q: "Situation: Clear dark sky. 'Look at those heavy black clouds! It ___ rain cats and dogs.'",
                options: ["will", "is going to", "rains", "rained"],
                answer: 1,
                explanation: "Bằng chứng mây đen rõ rệt trên bầu trời báo hiệu trời sắp mưa to, dùng 'is going to'."
            },
            {
                q: "Situation: Saved up savings. 'We ___ buy a new hybrid car because we saved enough money.'",
                options: ["will", "are going to", "shall", "buy"],
                answer: 1,
                explanation: "Dự định mua xe đã chuẩn bị sẵn tiền tiết kiệm từ trước, dùng 'are going to'."
            },
            {
                q: "Situation: Weekend cinema plan. 'They ___ watch the new Marvel movie this Saturday evening; they booked the seats.'",
                options: ["will", "are going to", "watch", "shall"],
                answer: 1,
                explanation: "Kế hoạch đã mua vé đặt chỗ trước, dùng tương lai gần 'are going to'."
            },
            {
                q: "Situation: Career change. 'She ___ resign from her current job next month to start her own business.'",
                options: ["will", "is going to", "resigns", "resigned"],
                answer: 1,
                explanation: "Kế hoạch lớn đã được quyết định chuẩn bị kỹ, dùng 'is going to'."
            },
            {
                q: "Situation: Empty fridge solution. 'The fridge is completely empty. We ___ do some grocery shopping tonight.'",
                options: ["will", "are going to", "do", "shall"],
                answer: 1,
                explanation: "Nhận thấy sự thật tủ lạnh trống rỗng, quyết định đi mua sắm tối nay có căn cứ rõ ràng, dùng 'are going to'."
            },
            {
                q: "Situation: About to drop objects. 'Watch out! You ___ drop those expensive glasses!'",
                options: ["will", "are going to", "drop", "dropped"],
                answer: 1,
                explanation: "Lời cảnh báo tình huống nguy hiểm sắp diễn ra ngay trước mắt, dùng 'are going to'."
            },
            {
                q: "Situation: Summer holiday planning. 'Where ___ you ___ spend your summer holiday this year?'",
                options: ["will/spend", "are/going to spend", "do/spend", "are/spending"],
                answer: 1,
                explanation: "Hỏi về kế hoạch đi nghỉ hè đã lên lịch trình của đối phương, dùng 'are you going to spend'."
            },
            {
                q: "Situation: Starting a lecture. 'Ladies and gentlemen, the workshop ___ begin in five minutes.'",
                options: ["will", "is going to", "begins", "shall"],
                answer: 1,
                explanation: "Sự việc sắp sửa diễn ra theo đúng chương trình chuẩn bị sẵn, dùng 'is going to'."
            },
            {
                q: "Situation: Learning progress goal. 'This week, I ___ practice 50 new vocabulary cards every day.'",
                options: ["will", "am going to", "practice", "shall"],
                answer: 1,
                explanation: "Kế hoạch tự đặt ra có mục tiêu cụ thể ở tuần này, dùng 'am going to'."
            }
        ]
    },
    {
        id: "gr-9",
        title: "Câu Điều kiện Loại 1 (Conditional Type 1)",
        category: "sentences",
        description: "Diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai nếu có điều kiện.",
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
                q: "Situation: Time constraints. 'If I ___ time tomorrow, I will help you.'",
                options: ["have", "has", "will have", "had"],
                answer: 0,
                explanation: "Mệnh đề chứa 'If' của câu điều kiện loại 1 chia ở hiện tại đơn, chủ ngữ 'I' đi với 'have'."
            },
            {
                q: "Situation: Reading navigation. 'We will get lost if we ___ follow the map.'",
                options: ["will not", "do not", "did not", "not"],
                answer: 1,
                explanation: "Mệnh đề 'if' ở hiện tại đơn dạng phủ định mượn trợ động từ 'do not' cho chủ ngữ 'we'."
            },
            {
                q: "Situation: Speaking upgrade. 'If you practice speaking every day, your pronunciation ___ improve.'",
                options: ["will", "would", "is", "must to"],
                answer: 0,
                explanation: "Mệnh đề chính của câu điều kiện loại 1 dùng cấu trúc tương lai đơn 'will + V-infinitive'."
            },
            {
                q: "Situation: Financial caution. 'If she ___ too much money on clothes, she won't save enough for travel.'",
                options: ["spend", "spends", "spending", "spent"],
                answer: 1,
                explanation: "Mệnh đề 'if' chia ở hiện tại đơn, chủ ngữ 'she' số ít nên động từ thêm 's' thành 'spends'."
            },
            {
                q: "Situation: Late arrival threat. 'If they don't hurry up, they ___ miss the train.'",
                options: ["will", "would", "can to", "shall to"],
                answer: 0,
                explanation: "Mệnh đề chính chỉ kết quả tương lai không mong muốn, dùng trợ động từ 'will'."
            },
            {
                q: "Situation: Ice melt fact. 'If you heat ice, it ___ into water.'",
                options: ["melt", "melts", "will melt", "melted"],
                answer: 1,
                explanation: "Diễn tả sự thật khoa học hiển nhiên, mệnh đề chính có thể dùng hiện tại đơn 'melts' (hoặc điều kiện loại 0)."
            },
            {
                q: "Situation: Encouraging study. 'If you earn 10 gold stars, you ___ receive a special badge.'",
                options: ["will", "would", "are", "must to"],
                answer: 0,
                explanation: "Mệnh đề chính hứa hẹn phần thưởng tương lai dùng 'will'."
            },
            {
                q: "Situation: Weather warning. 'We won't go to the park if it ___.'",
                options: ["rains", "rain", "will rain", "rained"],
                answer: 0,
                explanation: "Mệnh đề 'if' chia ở hiện tại đơn, chủ ngữ 'it' số ít nên động từ chia 'rains'."
            },
            {
                q: "Situation: Health advice. 'If you ___ enough sleep, you will feel tired tomorrow.'",
                options: ["don't get", "won't get", "didn't get", "not get"],
                answer: 0,
                explanation: "Mệnh đề 'if' phủ định hiện tại đơn mượn trợ động từ 'don't get'."
            },
            {
                q: "Situation: Career opportunity. 'If he passes the coding interview, he ___ be hired by the IT firm.'",
                options: ["will", "would", "can to", "is"],
                answer: 0,
                explanation: "Kết quả có thể xảy ra ở tương lai của điều kiện loại 1, dùng 'will'."
            },
            {
                q: "Situation: Phone battery. 'If your phone battery dies, you ___ charge it in my room.'",
                options: ["can", "will can", "could have", "must to"],
                answer: 0,
                explanation: "Diễn tả sự cho phép, khả năng xảy ra, mệnh đề chính dùng động từ khuyết thiếu 'can'."
            },
            {
                q: "Situation: Prompt reply. 'If she sends me an email, I ___ reply immediately.'",
                options: ["will", "would", "reply", "am replying"],
                answer: 0,
                explanation: "Lời hứa hành động tương lai nhanh chóng, dùng 'will'."
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
                q: "Situation: Giving advice. 'If I ___ you, I would tell the truth.'",
                options: ["am", "was", "were", "be"],
                answer: 2,
                explanation: "Trong câu điều kiện loại 2 giả định, động từ to-be luôn chia là 'were' đối với mọi ngôi."
            },
            {
                q: "Situation: Hypothetical learning tool. 'If he had a laptop, he ___ learn programming online.'",
                options: ["will", "would", "shall", "can"],
                answer: 1,
                explanation: "Mệnh đề chính của câu điều kiện loại 2 dùng cấu trúc giả định 'would + V-infinitive'."
            },
            {
                q: "Situation: Busy day. 'She would go to the party if she ___ busy today.'",
                options: ["isn't", "weren't", "wasn't", "won't be"],
                answer: 1,
                explanation: "Giả định trái ngược với sự thật bận rộn ở hiện tại, to-be phủ định chia 'weren't' cho mọi ngôi."
            },
            {
                q: "Situation: Millionaire dream. 'If I ___ a million dollars, I would travel around the world.'",
                options: ["win", "won", "will win", "would win"],
                answer: 1,
                explanation: "Giả định trái ngược thực tế nghèo khó ở hiện tại, mệnh đề 'if' chia quá khứ đơn V2 'won'."
            },
            {
                q: "Situation: Animal dream. 'If she ___ wings, she could fly like a seagull.'",
                options: ["has", "had", "will have", "would have"],
                answer: 1,
                explanation: "Giả định không thể xảy ra ở hiện tại, mệnh đề 'if' chia quá khứ đơn 'had'."
            },
            {
                q: "Situation: Speaking capability. 'We could understand him easily if he ___ more slowly.'",
                options: ["speaks", "spoke", "will speak", "speaking"],
                answer: 1,
                explanation: "Giả định người đó nói chậm hơn (thực tế nói rất nhanh), mệnh đề 'if' chia quá khứ đơn 'spoke'."
            },
            {
                q: "Situation: Living in space. 'If humans ___ on Mars, they would need special spacesuits.'",
                options: ["live", "lived", "will live", "living"],
                answer: 1,
                explanation: "Giả định khoa học giả tưởng trái ngược hiện tại, chia quá khứ đơn 'lived'."
            },
            {
                q: "Situation: Recommending a library. 'If I were you, I ___ visit the central city library.'",
                options: ["will", "would", "can", "should to"],
                answer: 1,
                explanation: "Đưa ra lời khuyên khôn ngoan 'If I were you', mệnh đề chính dùng 'would'."
            },
            {
                q: "Situation: Missing keys. 'If I ___ where my keys were, I would open the door immediately.'",
                options: ["know", "knew", "known", "will know"],
                answer: 1,
                explanation: "Thực tế tôi không biết chìa khóa ở đâu, giả định trái ngược dùng quá khứ đơn 'knew'."
            },
            {
                q: "Situation: Rainy weather. 'They would play soccer outside if it ___ raining.'",
                options: ["stops", "stopped", "didn't stop", "weren't"],
                answer: 1,
                explanation: "Thực tế trời đang mưa to, giả định trái ngược chia quá khứ đơn 'stopped'."
            },
            {
                q: "Situation: Country living. 'If she lived in the countryside, she ___ have a big garden.'",
                options: ["will", "would", "shall", "can to"],
                answer: 1,
                explanation: "Thực tế cô ấy sống ở thành phố chật hẹp, giả định trái ngược dùng 'would + V-infinitive'."
            },
            {
                q: "Situation: Perfect grammar. 'If you ___ all grammar formulas, writing essays would be easy.'",
                options: ["master", "mastered", "will master", "mastering"],
                answer: 1,
                explanation: "Giả định trái ngược trình độ hiện tại, mệnh đề 'if' chia quá khứ đơn 'mastered'."
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
                q: "Situation: Missing a gold star. 'If they ___ harder, they would have got a gold star yesterday.'",
                options: ["study", "studied", "had studied", "would study"],
                answer: 2,
                explanation: "Mệnh đề chính chứa cấu trúc quá khứ tiếc nuối 'would have got', mệnh đề 'if' chia quá khứ hoàn thành 'had studied'."
            },
            {
                q: "Situation: Transport rescue. 'If you had told me about the schedule, I ___ you up at the station.'",
                options: ["would pick", "will pick", "would have picked", "picked"],
                answer: 2,
                explanation: "Giả định quá khứ tiếc nuối loại 3, mệnh đề chính chia cấu trúc 'would have + V3/ed' ('would have picked')."
            },
            {
                q: "Situation: Missed train. 'We ___ the train if we had caught a taxi in time.'",
                options: ["wouldn't miss", "hadn't missed", "wouldn't have missed", "missed"],
                answer: 2,
                explanation: "Mệnh đề chính phủ định chia ở dạng giả định loại 3 'wouldn't have missed'."
            },
            {
                q: "Situation: Coding bug. 'If the programmer ___ the code thoroughly, the software wouldn't have crashed.'",
                options: ["tests", "tested", "had tested", "would test"],
                answer: 2,
                explanation: "Sự thật quá khứ lập trình viên không test kỹ làm app crash, giả định trái ngược dùng 'had tested'."
            },
            {
                q: "Situation: Forgot umbrella. 'If she had checked the weather forecast, she ___ her umbrella.'",
                options: ["brought", "would bring", "would have brought", "had brought"],
                answer: 2,
                explanation: "Hành động đáng lẽ nên làm trong quá khứ, chia mệnh đề chính dạng 'would have brought'."
            },
            {
                q: "Situation: Dangerous driving. 'The driver wouldn't have hit the wall if he ___ so fast.'",
                options: ["doesn't drive", "didn't drive", "hadn't driven", "not driven"],
                answer: 2,
                explanation: "Giả định quá khứ trái ngược việc lái xe quá tốc độ thực tế, chia mệnh đề 'if' quá khứ hoàn thành phủ định 'hadn't driven'."
            },
            {
                q: "Situation: Expensive meal. 'If we ___ the menu prices before, we wouldn't have ordered such dishes.'",
                options: ["check", "checked", "had checked", "checking"],
                answer: 2,
                explanation: "Thực tế quá khứ không check giá trước, chia giả định mệnh đề 'if' quá khứ hoàn thành 'had checked'."
            },
            {
                q: "Situation: Friendly meeting. 'If I had met you last summer, my English ___ improved much faster.'",
                options: ["will have", "would have", "had", "would"],
                answer: 1,
                explanation: "Giả định trái ngược thực tế mùa hè năm ngoái, mệnh đề chính chia dạng 'would have V3' ('would have improved')."
            },
            {
                q: "Situation: Fire alarm. 'If the fire alarm had rung, everyone ___ the building immediately.'",
                options: ["evacuated", "would evacuate", "would have evacuated", "had evacuated"],
                answer: 2,
                explanation: "Thực tế chuông không kêu làm chậm trễ, giả định quá khứ chia 'would have evacuated'."
            },
            {
                q: "Situation: Forgotten password. 'If he had written down his password, he ___ his account locked.'",
                options: ["wouldn't have", "hadn't had", "wouldn't have had", "didn't have"],
                answer: 2,
                explanation: "Giả định quá khứ, mệnh đề chính chia phủ định cấu trúc 'wouldn't have had'."
            },
            {
                q: "Situation: Medical rescue. 'The doctor could have saved the patient if the ambulance ___ sooner.'",
                options: ["arrives", "arrived", "had arrived", "would arrive"],
                answer: 2,
                explanation: "Giả định quá khứ xe cứu thương không đến kịp, mệnh đề 'if' chia quá khứ hoàn thành 'had arrived'."
            },
            {
                q: "Situation: Successful sale. 'We ___ a big profit if the marketing campaign had been launched in December.'",
                options: ["made", "would make", "would have made", "had made"],
                answer: 2,
                explanation: "Giả định quá khứ về chiến dịch tiếp thị thành công hụt, mệnh đề chính chia 'would have made'."
            }
        ]
    },
    {
        id: "gr-12",
        title: "Câu Bị động (Passive Voice)",
        category: "sentences",
        description: "Nhấn mạnh vào đối tượng chịu tác động của hành động thay vì người thực hiện.",
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
                q: "Situation: New infrastructure. 'A new highway ___ in our province next month.'",
                options: ["builds", "will be built", "is building", "was built"],
                answer: 1,
                explanation: "Hành động bị động ở tương lai ('next month'), cấu trúc tương lai đơn bị động 'will be built'."
            },
            {
                q: "Situation: Natural disaster impact. 'The window ___ by the storm yesterday.'",
                options: ["broke", "is broken", "was broken", "has broken"],
                answer: 2,
                explanation: "Hành động bị động ở quá khứ đơn ('yesterday'), cấu trúc quá khứ đơn bị động 'was broken'."
            },
            {
                q: "Situation: Rewrite practice. 'Active: He wrote the report. -> Passive: The report ___ by him.'",
                options: ["is written", "was wrote", "was written", "has been written"],
                answer: 2,
                explanation: "Câu chủ động viết ở quá khứ đơn 'wrote' -> bị động tương ứng quá khứ đơn 'was written'."
            },
            {
                q: "Situation: Language dissemination. 'Spanish ___ in many South American countries as a primary language.'",
                options: ["speaks", "is spoken", "are spoken", "was speaking"],
                answer: 1,
                explanation: "Sự thật hiển nhiên ở hiện tại, chủ ngữ 'Spanish' số ít đi với bị động hiện tại đơn 'is spoken'."
            },
            {
                q: "Situation: Room service cleaning. 'All hotel rooms ___ every morning by the cleaning staff.'",
                options: ["clean", "are cleaned", "is cleaned", "were cleaning"],
                answer: 1,
                explanation: "Hành động lặp đi lặp lại ở hiện tại, chủ ngữ số nhiều 'All hotel rooms' đi với bị động 'are cleaned'."
            },
            {
                q: "Situation: Historical invention. 'The telephone ___ by Alexander Graham Bell in 1876.'",
                options: ["invents", "invented", "was invented", "has been invented"],
                answer: 2,
                explanation: "Sự kiện lịch sử trong quá khứ 1876, chủ ngữ 'The telephone' số ít đi với bị động quá khứ đơn 'was invented'."
            },
            {
                q: "Situation: App updates. 'Our mobile app ___ with new vocabularies next Monday.'",
                options: ["updates", "will update", "will be updated", "was updated"],
                answer: 2,
                explanation: "Bị động tương lai có mốc thời gian rõ ràng, dùng 'will be updated'."
            },
            {
                q: "Situation: Stolen items. 'My wallet ___ on the crowded bus this morning.'",
                options: ["stole", "was stolen", "is stolen", "has stolen"],
                answer: 1,
                explanation: "Hành động bị lấy trộm xảy ra sáng nay trong quá khứ, dùng bị động quá khứ đơn 'was stolen'."
            },
            {
                q: "Situation: Academic textbooks. 'These research papers ___ by top global professors.'",
                options: ["write", "wrote", "were written", "was written"],
                answer: 2,
                explanation: "Chủ ngữ số nhiều 'These research papers', hành động viết đã diễn ra trong quá khứ, chia 'were written'."
            },
            {
                q: "Situation: Mail delivery. 'The morning letters ___ already ___ by the postman.'",
                options: ["are/delivered", "have/been delivered", "did/deliver", "were/delivering"],
                answer: 1,
                explanation: "Hành động vừa mới hoàn thành có từ 'already', chia hiện tại hoàn thành bị động 'have been delivered'."
            },
            {
                q: "Situation: Storing data. 'All student profiles ___ securely in our SQL database.'",
                options: ["keep", "keeps", "are kept", "was kept"],
                answer: 2,
                explanation: "Sự thật hiển nhiên ở hiện tại, chủ ngữ số nhiều 'All student profiles' đi với bị động 'are kept'."
            },
            {
                q: "Situation: Lost at sea. 'Thousands of ancient coins ___ by deep-sea divers last year.'",
                options: ["find", "found", "were found", "was found"],
                answer: 2,
                explanation: "Hành động bị động ở quá khứ số nhiều ('Thousands of ancient coins'), dùng 'were found'."
            }
        ]
    },
    {
        id: "gr-13",
        title: "Mệnh đề quan hệ (Relative Clauses)",
        category: "sentences",
        description: "Dùng để bổ nghĩa cho danh từ đứng trước nó, giúp nối câu không lặp từ.",
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
                q: "Situation: Neighbour profession. 'The man ___ lives next door is a famous English teacher.'",
                options: ["who", "whom", "which", "whose"],
                answer: 0,
                explanation: "Thay thế danh từ chỉ người 'The man' đóng vai trò chủ ngữ của động từ 'lives', dùng đại từ 'who'."
            },
            {
                q: "Situation: Lost item context. 'I lost the watch ___ my father gave me on my birthday.'",
                options: ["who", "which", "whom", "whose"],
                answer: 1,
                explanation: "Thay thế danh từ chỉ vật 'the watch' làm tân ngữ, dùng đại từ quan hệ 'which'."
            },
            {
                q: "Situation: Rebuilt structures. 'The building ___ was destroyed in the fire has been rebuilt.'",
                options: ["who", "which", "whom", "where"],
                answer: 1,
                explanation: "Thay thế danh từ chỉ vật 'The building' đóng vai trò chủ ngữ của động từ 'was destroyed', dùng 'which'."
            },
            {
                q: "Situation: Meeting classmates. 'The girl ___ you were talking to at the library is in my coding class.'",
                options: ["who", "whom", "which", "whose"],
                answer: 1,
                explanation: "Thay thế danh từ chỉ người 'The girl' đóng vai trò tân ngữ của giới từ 'to', dùng đại từ 'whom' (hoặc 'who/that' trong văn nói)."
            },
            {
                q: "Situation: Book recommendation. 'This is the programming book ___ helped me master JavaScript.'",
                options: ["who", "whom", "which", "whose"],
                answer: 2,
                explanation: "Thay thế cho danh từ chỉ sự vật 'programming book' đóng vai trò chủ ngữ, dùng 'which'."
            },
            {
                q: "Situation: Ownership of house. 'The family ___ house was flooded in the storm had to evacuate.'",
                options: ["who", "whom", "whose", "which"],
                answer: 2,
                explanation: "Biểu đạt quan hệ sở hữu 'ngôi nhà của gia đình', dùng đại từ quan hệ sở hữu 'whose'."
            },
            {
                q: "Situation: Restaurant choice. 'We ate at a cozy restaurant ___ served delicious traditional Vietnamese food.'",
                options: ["who", "which", "whom", "where"],
                answer: 1,
                explanation: "Thay thế cho danh từ chỉ vật/nơi chốn làm chủ ngữ của động từ 'served', dùng 'which'."
            },
            {
                q: "Situation: Location query. 'This is the beautiful beach ___ we spent our summer holiday.'",
                options: ["which", "that", "where", "which in"],
                answer: 2,
                explanation: "Thay thế cho trạng ngữ chỉ nơi chốn ('we spent our holiday there'), dùng trạng từ quan hệ 'where'."
            },
            {
                q: "Situation: Timed events. 'I will never forget the day ___ I won the national gold medal.'",
                options: ["which", "when", "where", "that was"],
                answer: 1,
                explanation: "Thay thế cho danh từ chỉ thời gian 'the day', dùng trạng từ quan hệ 'when'."
            },
            {
                q: "Situation: Doctor gratitude. 'The doctor ___ treated my grandfather was exceptionally kind.'",
                options: ["who", "whom", "which", "whose"],
                answer: 0,
                explanation: "Thay thế danh từ chỉ người 'The doctor' làm chủ ngữ của động từ 'treated', dùng 'who'."
            },
            {
                q: "Situation: Lost pet. 'We found the puppy ___ leg was injured and brought it to the vet.'",
                options: ["who", "which", "whose", "whom"],
                answer: 2,
                explanation: "Biểu đạt quan hệ sở hữu 'cái chân của cún con', dùng đại từ quan hệ sở hữu 'whose'."
            },
            {
                q: "Situation: Defining coding syntax. 'An algorithm is a set of rules ___ solves a specific computer problem.'",
                options: ["who", "whom", "which", "where"],
                answer: 2,
                explanation: "Bổ nghĩa cho khái niệm chỉ vật 'set of rules' đóng vai trò chủ ngữ, dùng 'which'."
            }
        ]
    },
    {
        id: "gr-14",
        title: "So sánh Hơn và So sánh Nhất (Comparatives & Superlatives)",
        category: "sentences",
        description: "So sánh tính chất của một hoặc nhiều đối tượng sự vật.",
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
                q: "Situation: Laptop upgrade cost. 'This new laptop is ___ than my old computer.'",
                options: ["expensive", "more expensive", "most expensive", "expensiver"],
                answer: 1,
                explanation: "Tính từ dài 'expensive' ở thể so sánh hơn đi với cấu trúc 'more + Adj + than'."
            },
            {
                q: "Situation: Geographic scale. 'Russia is the ___ country in the world.'",
                options: ["large", "larger", "largest", "most large"],
                answer: 2,
                explanation: "Tính từ ngắn 'large', trước có 'the' biểu đạt so sánh nhất, thêm đuôi 'st' thành 'largest'."
            },
            {
                q: "Situation: Improving pronunciation. 'His English pronunciation is getting ___ and ___.'",
                options: ["good/good", "better/better", "best/best", "well/well"],
                answer: 1,
                explanation: "So sánh kép tăng tiến của tính từ đặc biệt 'good' là 'better and better' (ngày càng tốt hơn)."
            },
            {
                q: "Situation: Hard math test. 'This exam is much ___ than the one we took last week.'",
                options: ["difficult", "more difficult", "most difficult", "difficulter"],
                answer: 1,
                explanation: "Tính từ dài 'difficult' ở thể so sánh hơn đi với 'more... than'."
            },
            {
                q: "Situation: High mountain peak. 'Mount Everest is the ___ mountain peak on Earth.'",
                options: ["high", "higher", "highest", "most high"],
                answer: 2,
                explanation: "Tính từ ngắn 'high', trước có mạo từ 'the' chỉ so sánh nhất, thêm đuôi 'est' thành 'highest'."
            },
            {
                q: "Situation: Health choice. 'Eating fresh fruits is far ___ for your health than drinking soda.'",
                options: ["good", "better", "best", "well"],
                answer: 1,
                explanation: "Thực hiện so sánh hơn của tính từ bất quy tắc 'good' là 'better', đi kèm từ nhấn mạnh 'far'."
            },
            {
                q: "Situation: Heavy metal density. 'Gold is one of the ___ metals known to science.'",
                options: ["heavy", "heavier", "heaviest", "most heavy"],
                answer: 2,
                explanation: "Tính từ 2 âm tiết kết thúc bằng y 'heavy' biến thành 'i' thêm 'est' trong so sánh nhất thành 'heaviest'."
            },
            {
                q: "Situation: Short route. 'Taking the train is the ___ way to travel from London to Paris.'",
                options: ["fast", "faster", "fastest", "most fast"],
                answer: 2,
                explanation: "So sánh nhất của tính từ ngắn 'fast' đi kèm mạo từ 'the' thành 'fastest'."
            },
            {
                q: "Situation: Complex coding logic. 'This algorithm is the ___ part of the entire software development.'",
                options: ["complicated", "more complicated", "most complicated", "complicatedest"],
                answer: 2,
                explanation: "Tính từ dài 'complicated' ở thể so sánh nhất đi với cấu trúc 'the most complicated'."
            },
            {
                q: "Situation: Worst day scenario. 'Missing my flight was the ___ experience of my summer trip.'",
                options: ["bad", "worse", "worst", "most bad"],
                answer: 2,
                explanation: "Thể so sánh nhất của tính từ bất quy tắc 'bad' là 'worst' (tồi tệ nhất)."
            },
            {
                q: "Situation: Cheap shop. 'This boutique has the ___ clothing prices in town.'",
                options: ["low", "lower", "lowest", "most low"],
                answer: 2,
                explanation: "So sánh nhất của tính từ ngắn 'low' là 'lowest' (thấp nhất)."
            },
            {
                q: "Situation: Deep ocean fact. 'The Mariana Trench is the ___ known point in the world's oceans.'",
                options: ["deep", "deeper", "deepest", "most deep"],
                answer: 2,
                explanation: "So sánh nhất của tính từ ngắn 'deep' là 'deepest' (sâu nhất)."
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
                q: "Situation: Report immediate feelings. 'He said, \"I am very tired today.\" -> He said that he ___ very tired that day.'",
                options: ["is", "was", "has been", "would be"],
                answer: 1,
                explanation: "Lời nói gián tiếp lùi thì hiện tại đơn của to-be 'am' về quá khứ đơn 'was'."
            },
            {
                q: "Situation: Reporting yesterday's activity. 'She told me that she ___ soccer the day before.'",
                options: ["plays", "played", "had played", "has played"],
                answer: 2,
                explanation: "Dấu hiệu 'the day before' chỉ gốc từ quá khứ đơn 'yesterday', lùi về quá khứ hoàn thành 'had played'."
            },
            {
                q: "Situation: Curious parent. 'My mother asked me where I ___.'",
                options: ["go", "going", "was going", "will go"],
                answer: 2,
                explanation: "Câu hỏi gián tiếp lùi thì tiếp diễn: 'where are you going' -> 'where I was going'."
            },
            {
                q: "Situation: Future plan reported. 'He said, \"I will fly to Hanoi tomorrow.\" -> He said he ___ fly to Hanoi the following day.'",
                options: ["will", "would", "shall", "is going to"],
                answer: 1,
                explanation: "Lời nói gián tiếp lùi trợ động từ tương lai 'will' thành 'would'."
            },
            {
                q: "Situation: Travel check. 'She asked me if I ___ to the USA before.'",
                options: ["am", "was", "had been", "have been"],
                answer: 2,
                explanation: "Gốc câu hỏi hiện tại hoàn thành 'Have you been', lùi về quá khứ hoàn thành 'had been' trong câu hỏi gián tiếp Yes/No."
            },
            {
                q: "Situation: Strict boss statement. 'The manager told us that the project ___ finished by Friday.'",
                options: ["must", "has to", "had to be", "should to be"],
                answer: 2,
                explanation: "Trực tiếp dùng động từ bắt buộc 'must' lùi thì gián tiếp thành 'had to be'."
            },
            {
                q: "Situation: Request to buy milk. 'She asked me ___ her some milk from the supermarket.'",
                options: ["buy", "buying", "to buy", "bought"],
                answer: 2,
                explanation: "Câu mệnh lệnh yêu cầu gián tiếp dùng cấu trúc động từ nguyên mẫu 'asked someone + to-V' ('to buy')."
            },
            {
                q: "Situation: Confirming attendance. 'They asked us whether we ___ at the seminar next Monday.'",
                options: ["will be", "would be", "are", "were"],
                answer: 1,
                explanation: "Tương lai lùi thì 'will be' -> 'would be' trong câu gián tiếp."
            },
            {
                q: "Situation: Room cleanliness advice. 'My father told me ___ play computer games all night.'",
                options: ["not", "don't", "not to", "to not"],
                answer: 2,
                explanation: "Câu khuyên răn/yêu cầu phủ định gián tiếp dùng cấu trúc 'told someone + not to-V' ('not to')."
            },
            {
                q: "Situation: Scientific facts reporting. 'The teacher explained that water ___ at 100 degrees Celsius.'",
                options: ["boils", "boiled", "had boiled", "boiling"],
                answer: 0,
                explanation: "Khi thuật lại chân lý khoa học sự thật hiển nhiên, ta KHÔNG lùi thì động từ mà giữ nguyên hiện tại đơn 'boils'."
            },
            {
                q: "Situation: Presenting homework. 'He said that he ___ his vocabulary homework yet.'",
                options: ["doesn't finish", "didn't finish", "haven't finished", "hadn't finished"],
                answer: 3,
                explanation: "Dấu hiệu 'yet' lùi thì phủ định từ hiện tại hoàn thành 'haven't' về quá khứ hoàn thành 'hadn't finished'."
            },
            {
                q: "Situation: Location question. 'A stranger asked me where the post office ___.'",
                options: ["is", "was", "has been", "located"],
                answer: 1,
                explanation: "Câu hỏi gián tiếp lùi thì to-be ở cuối câu từ 'is' về quá khứ đơn 'was'."
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
                q: "Situation: Absolute prohibition. 'It is a forbidden zone. You ___ enter this room.'",
                options: ["must not", "don't have to", "should", "need not"],
                answer: 0,
                explanation: "Bày tỏ sự cấm đoán tuyệt đối ('forbidden zone'), ta sử dụng động từ khuyết thiếu 'must not'."
            },
            {
                q: "Situation: Encouraging advice. 'If you want to pass the test, you ___ study harder.'",
                options: ["can", "should", "might", "may"],
                answer: 1,
                explanation: "Đưa ra lời khuyên chân thành khích lệ nên làm gì, dùng trợ động từ khuyết thiếu 'should'."
            },
            {
                q: "Situation: Guessing work location. 'She isn't at home. She ___ be working at the office.'",
                options: ["must to", "might", "can to", "should to"],
                answer: 1,
                explanation: "Suy đoán không chắc chắn ở hiện tại, động từ khuyết thiếu 'might' đi với động từ nguyên mẫu không 'to'."
            },
            {
                q: "Situation: Past ability. 'When my grandfather was young, he ___ swim across this wide river.'",
                options: ["can", "could", "might", "should"],
                answer: 1,
                explanation: "Biểu đạt khả năng, năng lực thể chất trong quá khứ, dùng động từ khuyết thiếu 'could'."
            },
            {
                q: "Situation: Asking for polite permission. '___ I use your computer for a quick search, please?'",
                options: ["Must", "Should", "May", "Would"],
                answer: 2,
                explanation: "Hỏi xin phép một cách lịch sự, trang trọng, dùng động từ khuyết thiếu 'May'."
            },
            {
                q: "Situation: Lack of necessity. 'Tomorrow is a national holiday. We ___ wake up early.'",
                options: ["must not", "don't have to", "shouldn't", "cannot"],
                answer: 1,
                explanation: "Biểu đạt sự không cần thiết (không bắt buộc phải làm), dùng cấu trúc 'don't have to' (hoặc needn't)."
            },
            {
                q: "Situation: Hard rule obligations. 'In Vietnam, motorcyclists ___ wear helmets by law.'",
                options: ["can", "may", "must", "should"],
                answer: 2,
                explanation: "Biểu đạt nghĩa vụ bắt buộc theo luật pháp quy định quốc gia, dùng động từ khuyết thiếu 'must'."
            },
            {
                q: "Situation: Logical assumption. 'He has worked for 12 hours without a break. He ___ be exhausted.'",
                options: ["can't", "must", "should", "may"],
                answer: 1,
                explanation: "Suy luận logic có căn cứ cực kỳ chắc chắn ở hiện tại (làm 12 tiếng), dùng 'must' (chắc hẳn là)."
            },
            {
                q: "Situation: Advice on rain. 'The sky is getting dark. You ___ take an umbrella with you.'",
                options: ["could", "should", "must to", "may to"],
                answer: 1,
                explanation: "Lời khuyên nên làm để tránh bị ướt mưa, dùng 'should'."
            },
            {
                q: "Situation: Impossible deduction. 'She has lived in the USA for 20 years. She ___ speak English poorly.'",
                options: ["must", "can't", "should", "might not"],
                answer: 1,
                explanation: "Suy đoán phủ định mang tính chắc chắn cao (sống Mỹ 20 năm thì không thể nói tiếng Anh dở), dùng 'can't'."
            },
            {
                q: "Situation: Polite offer of help. '___ I help you carry this heavy box?'",
                options: ["Shall", "Must", "Will", "Would"],
                answer: 0,
                explanation: "Lời đề nghị lịch sự tự nguyện giúp đỡ người khác, dùng 'Shall' ở ngôi thứ nhất số ít 'I'."
            },
            {
                q: "Situation: Possibility of flight delay. 'The weather is bad, so the flight ___ be delayed.'",
                options: ["must", "could", "should to", "will can"],
                answer: 1,
                explanation: "Khả năng sự việc có thể xảy ra do thời tiết xấu, dùng động từ khuyết thiếu chỉ khả năng 'could' (hoặc may/might)."
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
                q: "Situation: Avoid junk food. 'He avoided ___ junk food to protect his health.'",
                options: ["eat", "eating", "to eat", "eaten"],
                answer: 1,
                explanation: "Động từ 'avoid' (tránh) bắt buộc phải đi kèm với danh động từ dạng V-ing 'eating'."
            },
            {
                q: "Situation: Collaborative agreement. 'They agreed ___ us build a new web application.'",
                options: ["help", "to help", "helping", "helped"],
                answer: 1,
                explanation: "Động từ 'agree' (đồng ý) bắt buộc đi với động từ nguyên mẫu có to 'to help'."
            },
            {
                q: "Situation: Expressing thanks. 'Thank you for ___ me with my English homework.'",
                options: ["help", "to help", "helping", "helped"],
                answer: 2,
                explanation: "Sau giới từ 'for', động từ chính phải thêm đuôi '-ing' đóng vai trò danh động từ 'helping'."
            },
            {
                q: "Situation: Goal planning. 'She hopes ___ a high score in the next academic IELTS test.'",
                options: ["get", "to get", "getting", "got"],
                answer: 1,
                explanation: "Động từ hy vọng 'hope' yêu cầu động từ nguyên mẫu có to 'to get'."
            },
            {
                q: "Situation: Love of programming. 'I really enjoy ___ algorithms using Python and JavaScript.'",
                options: ["write", "writing", "to write", "wrote"],
                answer: 1,
                explanation: "Động từ yêu thích 'enjoy' đi kèm với danh động từ dạng V-ing 'writing'."
            },
            {
                q: "Situation: Career decision. 'He decided ___ his current job to focus on mobile app development.'",
                options: ["quit", "quitting", "to quit", "quitted"],
                answer: 2,
                explanation: "Động từ quyết định 'decide' đi kèm động từ nguyên mẫu có to 'to quit'."
            },
            {
                q: "Situation: Mind helping. 'Would you mind ___ the window? It's a bit noisy outside.'",
                options: ["close", "closing", "to close", "closed"],
                answer: 1,
                explanation: "Cấu trúc lịch sự 'Would you mind + V-ing' ('closing')."
            },
            {
                q: "Situation: Refusal logic. 'The student refused ___ the answers to the classmates during the test.'",
                options: ["give", "giving", "to give", "gave"],
                answer: 2,
                explanation: "Động từ từ chối 'refuse' đi kèm động từ nguyên mẫu có to 'to give'."
            },
            {
                q: "Situation: Good at coding. 'She is very good at ___ clean code and debugging memory leaks.'",
                options: ["write", "writing", "to write", "written"],
                answer: 1,
                explanation: "Sau tính từ đi kèm giới từ 'good at', động từ phải chia V-ing 'writing'."
            },
            {
                q: "Situation: Suggesting coffee. 'He suggested ___ a hot coffee cup at the nearby local cafe.'",
                options: ["drink", "drinking", "to drink", "drank"],
                answer: 1,
                explanation: "Động từ gợi ý đề xuất 'suggest' đi kèm danh động từ dạng V-ing 'drinking'."
            },
            {
                q: "Situation: Promised silence. 'They promised ___ the secret to anyone else.'",
                options: ["not tell", "not telling", "not to tell", "don't tell"],
                answer: 2,
                explanation: "Cấu trúc hứa hẹn phủ định 'promise not to-V' ('not to tell')."
            },
            {
                q: "Situation: Keep practicing. 'You must keep ___ vocabulary every day to avoid forgetting.'",
                options: ["practice", "practicing", "to practice", "practiced"],
                answer: 1,
                explanation: "Động từ duy trì hành động 'keep' yêu cầu chia dạng V-ing 'practicing'."
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
                q: "Situation: Graduation schedules. 'Our graduation ceremony will take place ___ 8:00 AM ___ Monday.'",
                options: ["at/on", "in/on", "at/in", "on/at"],
                answer: 0,
                explanation: "Mốc giờ cụ thể dùng 'at' ('at 8:00 AM'), thứ trong tuần dùng 'on' ('on Monday')."
            },
            {
                q: "Situation: Geography of living. 'He lived ___ London ___ many years before moving to Vietnam.'",
                options: ["at/in", "in/for", "on/for", "in/since"],
                answer: 1,
                explanation: "Thành phố lớn dùng giới từ 'in' ('in London'), khoảng thời gian kéo dài dùng 'for' ('for many years')."
            },
            {
                q: "Situation: Finding keys. 'The keys are ___ the table ___ the kitchen.'",
                options: ["in/on", "on/in", "at/in", "on/at"],
                answer: 1,
                explanation: "Nằm trên bề mặt bàn dùng 'on' ('on the table'), vị trí trong gian bếp dùng 'in' ('in the kitchen')."
            },
            {
                q: "Situation: Birthday party. 'Her birthday party is ___ October 15th.'",
                options: ["in", "on", "at", "during"],
                answer: 1,
                explanation: "Có ngày tháng cụ thể rõ ràng trong năm, dùng giới từ 'on' ('on October 15th')."
            },
            {
                q: "Situation: Night sky. 'I love stargazing and looking at the moon ___ night.'",
                options: ["in", "on", "at", "during"],
                answer: 2,
                explanation: "Cụm từ cố định chỉ thời gian ban đêm dùng 'at' ('at night')."
            },
            {
                q: "Situation: Location of office. 'Our headquarters office is located ___ 125 Nguyen Trai Street.'",
                options: ["in", "on", "at", "above"],
                answer: 2,
                explanation: "Có số nhà địa chỉ chi tiết cụ thể, dùng giới từ 'at' ('at 125 Nguyen Trai Street')."
            },
            {
                q: "Situation: Season changes. 'It always snows heavily here ___ winter.'",
                options: ["in", "on", "at", "for"],
                answer: 0,
                explanation: "Trước các mùa trong năm (mùa đông), dùng giới từ 'in' ('in winter')."
            },
            {
                q: "Situation: Book location. 'The answers to the coding puzzles are ___ page 45.'",
                options: ["in", "on", "at", "inside"],
                answer: 1,
                explanation: "Vị trí trang sách cụ thể, dùng giới từ 'on' ('on page 45')."
            },
            {
                q: "Situation: Meeting at airport. 'We will meet you ___ the airport arrival hall.'",
                options: ["in", "on", "at", "inside of"],
                answer: 2,
                explanation: "Địa điểm nơi chốn công cộng làm điểm dừng chân, dùng giới từ 'at' ('at the airport')."
            },
            {
                q: "Situation: Century facts. 'Great historical changes occurred ___ the 20th century.'",
                options: ["in", "on", "at", "during on"],
                answer: 0,
                explanation: "Trước các thế kỷ dài, dùng giới từ 'in' ('in the 20th century')."
            },
            {
                q: "Situation: Laptop screen. 'Do not touch the dirt ___ the laptop screen.'",
                options: ["in", "on", "at", "inside"],
                answer: 1,
                explanation: "Trên bề mặt màn hình máy tính, dùng giới từ 'on' ('on the screen')."
            },
            {
                q: "Situation: Weekend plans. 'What are you doing ___ the weekend?'",
                options: ["in", "on", "at", "during"],
                answer: 2,
                explanation: "Cụm từ chỉ thời gian cuối tuần trong tiếng Anh Anh dùng 'at the weekend' (Anh Mỹ dùng 'on')."
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
                q: "Situation: Pronunciation fluency. 'Your brother speaks English fluently, ___ he?'",
                options: ["does", "doesn't", "is", "isn't"],
                answer: 1,
                explanation: "Mệnh đề chính khẳng định ở hiện tại đơn với động từ thường, câu hỏi đuôi dùng trợ động từ phủ định 'doesn't'."
            },
            {
                q: "Situation: Project completion. 'They haven't finished their project yet, ___ they?'",
                options: ["have", "has", "haven't", "did"],
                answer: 0,
                explanation: "Mệnh đề chính phủ định ở hiện tại hoàn thành 'haven't', câu hỏi đuôi dùng khẳng định 'have'."
            },
            {
                q: "Situation: Camping forecast. 'We won't go camping if it rains, ___ we?'",
                options: ["will", "won't", "do", "don't"],
                answer: 0,
                explanation: "Mệnh đề chính phủ định ở tương lai đơn 'won't', câu hỏi đuôi dùng khẳng định 'will'."
            },
            {
                q: "Situation: Professional coding. 'She is a junior web developer, ___ she?'",
                options: ["is she", "isn't she", "does she", "doesn't she"],
                answer: 1,
                explanation: "Mệnh đề chính khẳng định đi với to-be 'is', câu hỏi đuôi tương ứng phủ định 'isn't she'."
            },
            {
                q: "Situation: Past dinner. 'He bought a new car yesterday, ___ he?'",
                options: ["did he", "didn't he", "bought he", "wasn't he"],
                answer: 1,
                explanation: "Mệnh đề chính khẳng định quá khứ đơn, câu hỏi đuôi mượn trợ động từ phủ định 'didn't he'."
            },
            {
                q: "Situation: Homework checks. 'The students don't like homework, ___ they?'",
                options: ["do they", "don't they", "are they", "aren't they"],
                answer: 0,
                explanation: "Mệnh đề chính phủ định hiện tại đơn với động từ thường, câu hỏi đuôi dùng trợ động từ khẳng định 'do they'."
            },
            {
                q: "Situation: Unique case of 'I am'. 'I am late for the coding meeting, ___ I?'",
                options: ["am not I", "aren't I", "don't I", "isn't I"],
                answer: 1,
                explanation: "Trường hợp đặc biệt ngoại lệ: cấu trúc khẳng định 'I am' đi với câu hỏi đuôi phủ định là 'aren't I'."
            },
            {
                q: "Situation: Open the window request. 'Open the window, ___ you?'",
                options: ["will", "won't", "do", "don't"],
                answer: 0,
                explanation: "Với câu mệnh lệnh cầu khiến nhẹ nhàng, câu hỏi đuôi thường sử dụng trợ động từ tương lai 'will you'."
            },
            {
                q: "Situation: No one called. 'No one called my phone yesterday, ___ they?'",
                options: ["did they", "didn't they", "do they", "don't they"],
                answer: 0,
                explanation: "Từ phủ định 'No one' làm câu mang tính phủ định, đại từ thay thế số nhiều 'they', câu hỏi đuôi dùng khẳng định 'did they'."
            },
            {
                q: "Situation: Lost puppy. 'The cute puppy wasn't hurt, ___ it?'",
                options: ["was it", "wasn't it", "did it", "is it"],
                answer: 0,
                explanation: "Mệnh đề chính phủ định quá khứ to-be 'wasn't', câu hỏi đuôi dùng khẳng định 'was it'."
            },
            {
                q: "Situation: Let's study. 'Let's practice the 3D Leitner flashcards now, ___ we?'",
                options: ["will we", "shall we", "don't we", "do we"],
                answer: 1,
                explanation: "Trường hợp đặc biệt rủ rê bắt đầu bằng 'Let's', câu hỏi đuôi mặc định sử dụng 'shall we'."
            },
            {
                q: "Situation: Gold star count. 'He has already earned five gold stars, ___ he?'",
                options: ["has he", "hasn't he", "does he", "doesn't he"],
                answer: 1,
                explanation: "Mệnh đề khẳng định hiện tại hoàn thành 'has earned', câu hỏi đuôi tương ứng phủ định 'hasn't he'."
            }
        ]
    },
    {
        id: "gr-20",
        title: "Câu Ước (Wish Clauses)",
        category: "sentences",
        description: "Bày tỏ mong muốn, giả định trái ngược thực tế hiện tại, tương lai hoặc quá khứ.",
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
                q: "Situation: Financial regrets. 'I don't have enough money. I wish I ___ a millionaire.'",
                options: ["am", "was", "were", "been"],
                answer: 2,
                explanation: "Câu ước hiện tại trái ngược thực tế nghèo khó, động từ to-be lùi về quá khứ giả định 'were' cho mọi ngôi."
            },
            {
                q: "Situation: Regretting late sleep. 'He regrets going to bed late. He wishes he ___ to bed earlier last night.'",
                options: ["went", "had gone", "would go", "goes"],
                answer: 1,
                explanation: "Ước trái ngược thực tế quá khứ ('last night'), lùi động từ về quá khứ hoàn thành 'had gone'."
            },
            {
                q: "Situation: Endless rain. 'It keeps raining heavily. I wish it ___ stop soon.'",
                options: ["will", "would", "can", "should"],
                answer: 1,
                explanation: "Ước một thay đổi tích cực tốt đẹp trong tương lai gần, dùng cấu trúc 'would + V-infinitive' ('would stop')."
            },
            {
                q: "Situation: Speaking skills. 'I wish I ___ English fluently like a native speaker right now.'",
                options: ["speak", "spoke", "have spoken", "speaking"],
                answer: 1,
                explanation: "Ước trái ngược thực hành hiện tại (thực tế nói bập bẹ), chia động từ quá khứ đơn 'spoke'."
            },
            {
                q: "Situation: Exam regret. 'The student wishes she ___ harder for the final programming test last week.'",
                options: ["studied", "had studied", "would study", "studies"],
                answer: 1,
                explanation: "Ước tiếc nuối cho sự việc quá khứ 'last week', chia động từ quá khứ hoàn thành 'had studied'."
            },
            {
                q: "Situation: Missing a friend. 'I wish my best friend ___ here with me at this wonderful beach now.'",
                options: ["is", "was", "were", "been"],
                answer: 2,
                explanation: "Ước trái ngược hiện tại bạn đang ở xa, động từ to-be chia 'were' cho mọi ngôi."
            },
            {
                q: "Situation: Loud neighbor. 'I wish my neighbors ___ playing loud music. I have an interview tomorrow.'",
                options: ["stop", "stopped", "would stop", "will stop"],
                answer: 2,
                explanation: "Ước phàn nàn muốn thay đổi hành vi gây phiền hà của người khác ở tương lai, dùng 'would stop'."
            },
            {
                q: "Situation: Hot summer. 'The summer weather is extremely hot. I wish we ___ in a snowy city.'",
                options: ["live", "lived", "had lived", "living"],
                answer: 1,
                explanation: "Ước trái ngược thực tế thời tiết hiện tại nóng nực, lùi về quá khứ đơn 'lived'."
            },
            {
                q: "Situation: Lost map. 'They lost their way. They wish they ___ the map before leaving.'",
                options: ["bring", "brought", "had brought", "would bring"],
                answer: 2,
                explanation: "Ước tiếc nuối hành động quá khứ không mang bản đồ, chia quá khứ hoàn thành 'had brought'."
            },
            {
                q: "Situation: Missing flight. 'He wishes he ___ the morning flight yesterday.'",
                options: ["doesn't miss", "didn't miss", "hadn't missed", "wouldn't miss"],
                answer: 2,
                explanation: "Ước phủ định trái ngược sự việc lỡ chuyến bay hôm qua, chia quá khứ hoàn thành 'hadn't missed'."
            },
            {
                q: "Situation: Career opportunity. 'I wish I ___ how to code in Python; it would help my career.'",
                options: ["know", "knew", "have known", "knowing"],
                answer: 1,
                explanation: "Ước trái ngược sự thật hiện tại chưa biết code Python, chia quá khứ đơn 'knew'."
            },
            {
                q: "Situation: Heavy hybrid car cost. 'She wishes hybrid cars ___ cheaper so she could buy one.'",
                options: ["are", "were", "had been", "would be"],
                answer: 1,
                explanation: "Ước trái ngược sự thật xe đắt đỏ ở hiện tại, chia quá khứ giả định to-be 'were'."
            }
        ]
    },
    {
        id: "gr-21",
        title: "Động từ Bất quy tắc (Irregular Verbs)",
        category: "sentences",
        description: "Các động từ không tuân theo quy tắc thêm '-ed' khi chia ở thì Quá khứ và Phân từ hai.",
        formula: "Không có công thức chung. Phải học thuộc (V1 - Nguyên thể, V2 - Quá khứ đơn, V3 - Quá khứ phân từ).",
        usage: [
            "V2 được dùng trong câu khẳng định của thì Quá khứ đơn (Past Simple).",
            "V3 được dùng trong các thì Hoàn thành (Hiện tại/Quá khứ hoàn thành) và trong cấu trúc Câu bị động (Passive Voice)."
        ],
        examples: [
            { en: "He broke the window yesterday. (Break - Broke - Broken)", vi: "Anh ấy đã làm vỡ cửa sổ hôm qua." },
            { en: "I have known her for 5 years. (Know - Knew - Known)", vi: "Tôi đã biết cô ấy được 5 năm rồi." },
            { en: "The book was written by an AI. (Write - Wrote - Written)", vi: "Cuốn sách được viết bởi một AI." }
        ],
        practice: [
            {
                q: "Situation: Academic submission. 'I ___ my research paper to the professor last night.'",
                options: ["send", "sended", "sent", "sending"],
                answer: 2,
                explanation: "Thì quá khứ đơn (last night). Động từ 'send' bất quy tắc, quá khứ là 'sent'."
            },
            {
                q: "Situation: Travelling accident. 'She ___ her leg while skiing in Switzerland.'",
                options: ["breaked", "broke", "broken", "breaks"],
                answer: 1,
                explanation: "Hành động xảy ra trong quá khứ. 'break' -> V2 là 'broke'."
            },
            {
                q: "Situation: Technology lifespan. 'I have ___ this laptop since 2021.'",
                options: ["keep", "kept", "keeped", "keeping"],
                answer: 1,
                explanation: "Thì hiện tại hoàn thành (have + V3). V3 của 'keep' là 'kept'."
            },
            {
                q: "Situation: IT Bug fixing. 'The developer ___ a critical bug in the server code.'",
                options: ["finded", "found", "finds", "finding"],
                answer: 1,
                explanation: "Kể về một sự kiện đã xảy ra, V2 của 'find' là 'found'."
            },
            {
                q: "Situation: Science discovery. 'Newton ___ the law of universal gravitation.'",
                options: ["understood", "understand", "understanded", "understanding"],
                answer: 0,
                explanation: "Sự kiện lịch sử trong quá khứ. V2 của 'understand' là 'understood'."
            },
            {
                q: "Situation: Passive Voice in news. 'The new bridge was ___ in just six months.'",
                options: ["build", "builded", "built", "building"],
                answer: 2,
                explanation: "Câu bị động (was + V3). V3 của 'build' là 'built'."
            },
            {
                q: "Situation: Software Installation. 'I have already ___ the latest update on my phone.'",
                options: ["choose", "chose", "choosed", "chosen"],
                answer: 3,
                explanation: "Thì hiện tại hoàn thành (have already + V3). V3 của 'choose' là 'chosen'."
            },
            {
                q: "Situation: Daily routine change. 'Normally I wake up at 7, but today I ___ up at 6.'",
                options: ["waked", "woke", "waken", "wake"],
                answer: 1,
                explanation: "Kể về hành động sáng nay (quá khứ). V2 của 'wake' là 'woke'."
            },
            {
                q: "Situation: Missing items. 'Oh no! Someone has ___ my bicycle.'",
                options: ["steal", "stoled", "stole", "stolen"],
                answer: 3,
                explanation: "Thì hiện tại hoàn thành (has + V3). V1-steal, V2-stole, V3-stolen."
            },
            {
                q: "Situation: Teaching AI. 'We ___ the machine learning model with billions of parameters.'",
                options: ["teached", "taught", "teach", "teaching"],
                answer: 1,
                explanation: "Quá khứ đơn. Động từ 'teach' bất quy tắc, V2 là 'taught'."
            },
            {
                q: "Situation: Office meeting. 'Have you ___ to the project manager about the delay?'",
                options: ["speak", "spoke", "spoken", "speaked"],
                answer: 2,
                explanation: "Thì hiện tại hoàn thành nghi vấn (Have you + V3). V3 của 'speak' là 'spoken'."
            },
            {
                q: "Situation: Reading habit. 'He had ___ three chapters before he fell asleep.'",
                options: ["read", "readed", "reading", "reads"],
                answer: 0,
                explanation: "Thì quá khứ hoàn thành (had + V3). Động từ 'read' viết giống nhau cả 3 cột (V1, V2, V3 đều là read, nhưng phát âm khác)."
            }
        ]
    }
];
