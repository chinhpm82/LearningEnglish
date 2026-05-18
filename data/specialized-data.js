/* ==========================================================================
   LearningEnglish - Specialized & Academic STEM/Social Vocabulary Dataset
   ========================================================================== */

const SPECIALIZED_VOCABULARY = [
    // --- 💻 CÔNG NGHỆ THÔNG TIN (IT) ---
    {
        "id": "spec-it-1",
        "word": "Algorithm",
        "type": "noun",
        "ipa": "/ˈæl.ɡə.rɪ.ðəm/",
        "meaning": "Thuật toán",
        "example": "This sorting algorithm is highly optimized for large datasets.",
        "example_vi": "Thuật toán sắp xếp này được tối ưu hóa rất tốt cho các tập dữ liệu lớn.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-2",
        "word": "Asynchronous",
        "type": "adjective",
        "ipa": "/eɪˈsɪŋ.krə.nəs/",
        "meaning": "Bất đồng bộ",
        "example": "Javascript handles asynchronous operations using Promises and async/await.",
        "example_vi": "Javascript xử lý các thao tác bất đồng bộ bằng cách sử dụng Promises và async/await.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-3",
        "word": "Compilation",
        "type": "noun",
        "ipa": "/ˌkɒm.pɪˈleɪ.ʃən/",
        "meaning": "Sự biên dịch",
        "example": "The compilation process converts high-level code into machine code.",
        "example_vi": "Quá trình biên dịch chuyển đổi mã nguồn bậc cao thành mã máy.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-4",
        "word": "Database",
        "type": "noun",
        "ipa": "/ˈdeɪ.tə.beɪs/",
        "meaning": "Cơ sở dữ liệu",
        "example": "We store all our student registration profiles in a secure SQL database.",
        "example_vi": "Chúng tôi lưu trữ tất cả hồ sơ đăng ký của học viên trong một cơ sở dữ liệu SQL bảo mật.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-5",
        "word": "Encryption",
        "type": "noun",
        "ipa": "/ɪnˈkrɪp.ʃən/",
        "meaning": "Sự mã hóa dữ liệu",
        "example": "Data encryption prevents unauthorized access during network transmission.",
        "example_vi": "Mã hóa dữ liệu ngăn chặn việc truy cập trái phép trong quá trình truyền tải mạng.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-6",
        "word": "Repository",
        "type": "noun",
        "ipa": "/rɪˈpɒz.ɪ.tər.i/",
        "meaning": "Kho lưu trữ (mã nguồn)",
        "example": "I pushed my latest code changes to the remote GitHub repository.",
        "example_vi": "Tôi đã đẩy các thay đổi mã nguồn mới nhất của mình lên kho lưu trữ GitHub từ xa.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-7",
        "word": "Recursion",
        "type": "noun",
        "ipa": "/rɪˈkɜː.ʃən/",
        "meaning": "Đệ quy",
        "example": "Recursion is a programming technique where a function calls itself.",
        "example_vi": "Đệ quy là một kỹ thuật lập trình nơi một hàm tự gọi lại chính nó.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-8",
        "word": "Polymorphism",
        "type": "noun",
        "ipa": "/ˌpɒl.iˈmɔː.fɪ.zəm/",
        "meaning": "Tính đa hình (OOP)",
        "example": "Polymorphism allows different objects to respond to the same method call.",
        "example_vi": "Tính đa hình cho phép các đối tượng khác nhau phản hồi cùng một lời gọi phương thức.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-9",
        "word": "Middleware",
        "type": "noun",
        "ipa": "/ˈmɪd.əl.weər/",
        "meaning": "Phần mềm trung gian",
        "example": "The authentication middleware checks client credentials before routing.",
        "example_vi": "Phần mềm trung gian xác thực kiểm tra thông tin đăng nhập của máy khách trước khi định tuyến.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-it-10",
        "word": "Debugging",
        "type": "noun",
        "ipa": "/diːˈbʌɡ.ɪŋ/",
        "meaning": "Quá trình tìm và sửa lỗi",
        "example": "He spent three hours debugging the database memory leak.",
        "example_vi": "Anh ấy đã dành ba giờ để tìm và sửa lỗi rò rỉ bộ nhớ của cơ sở dữ liệu.",
        "category": "spec-it",
        "box": 1,
        "nextReview": 0
    },

    // --- 🌍 ĐỊA LÝ PHỔ THÔNG (GEOGRAPHY) ---
    {
        "id": "spec-geo-1",
        "word": "Atmosphere",
        "type": "noun",
        "ipa": "/ˈæt.məs.fɪər/",
        "meaning": "Khí quyển",
        "example": "The Earth's atmosphere protects us from harmful solar radiation.",
        "example_vi": "Khí quyển của Trái Đất bảo vệ chúng ta khỏi bức xạ mặt trời có hại.",
        "category": "spec-geography",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-geo-2",
        "word": "Hemisphere",
        "type": "noun",
        "ipa": "/ˈhem.ɪ.sfɪər/",
        "meaning": "Bán cầu",
        "example": "Vietnam is located entirely within the Northern Hemisphere.",
        "example_vi": "Việt Nam nằm hoàn toàn ở khu vực Bắc Bán Cầu.",
        "category": "spec-geography",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-geo-3",
        "word": "Topography",
        "type": "noun",
        "ipa": "/təˈpɒɡ.rə.fi/",
        "meaning": "Địa hình, địa thế",
        "example": "The topography of northern Vietnam features dramatic mountain ranges.",
        "example_vi": "Địa hình miền bắc Việt Nam nổi bật với các dãy núi hùng vĩ.",
        "category": "spec-geography",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-geo-4",
        "word": "Precipitation",
        "type": "noun",
        "ipa": "/prɪˌsɪp.ɪˈteɪ.ʃən/",
        "meaning": "Lượng mưa",
        "example": "Tropical rainforests experience extremely high annual precipitation.",
        "example_vi": "Rừng mưa nhiệt đới trải qua lượng mưa hàng năm vô cùng lớn.",
        "category": "spec-geography",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-geo-5",
        "word": "Erosion",
        "type": "noun",
        "ipa": "/ɪˈrəʊ.ʒən/",
        "meaning": "Sự xói mòn, bào mòn đất",
        "example": "Soil erosion can be prevented by planting trees on hillsides.",
        "example_vi": "Sự xói mòn đất có thể được ngăn chặn bằng cách trồng cây trên sườn đồi.",
        "category": "spec-geography",
        "box": 1,
        "nextReview": 0
    },

    // --- 🌿 SINH HỌC PHỔ THÔNG (BIOLOGY) ---
    {
        "id": "spec-bio-1",
        "word": "Photosynthesis",
        "type": "noun",
        "ipa": "/ˌfəʊ.təʊˈsɪn.θə.sɪs/",
        "meaning": "Quá trình quang hợp",
        "example": "Photosynthesis produces oxygen and glucose from water and carbon dioxide.",
        "example_vi": "Quá trình quang hợp tạo ra khí oxy và đường glucose từ nước và khí các-bô-níc.",
        "category": "spec-biology",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-bio-2",
        "word": "Respiration",
        "type": "noun",
        "ipa": "/ˌres.pɪˈreɪ.ʃən/",
        "meaning": "Quá trình hô hấp (tế bào)",
        "example": "Cellular respiration converts glucose into energy for biological work.",
        "example_vi": "Hô hấp tế bào chuyển đổi đường glucose thành năng lượng cho các hoạt động sinh học.",
        "category": "spec-biology",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-bio-3",
        "word": "Evolution",
        "type": "noun",
        "ipa": "/ˌiː.vəˈluː.ʃən/",
        "meaning": "Sự tiến hóa",
        "example": "Natural selection is the primary driving force behind biological evolution.",
        "example_vi": "Chọn lọc tự nhiên là động lực thúc đẩy chính đằng sau sự tiến hóa sinh học.",
        "category": "spec-biology",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-bio-4",
        "word": "Chromosome",
        "type": "noun",
        "ipa": "/ˈkrəʊ.mə.səʊm/",
        "meaning": "Nhiễm sắc thể",
        "example": "Humans typically carry 23 pairs of chromosomes in each cell.",
        "example_vi": "Con người thường mang 23 cặp nhiễm sắc thể trong mỗi tế bào.",
        "category": "spec-biology",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-bio-5",
        "word": "Ecosystem",
        "type": "noun",
        "ipa": "/ˈeɪ.kəʊˌsɪs.təm/",
        "meaning": "Hệ sinh thái",
        "example": "A coral reef is one of the most diverse marine ecosystems in the world.",
        "example_vi": "Rạn san hô là một trong những hệ sinh thái biển đa dạng nhất trên thế giới.",
        "category": "spec-biology",
        "box": 1,
        "nextReview": 0
    },

    // --- 🧪 HÓA HỌC PHỔ THÔNG (CHEMISTRY) ---
    {
        "id": "spec-chem-1",
        "word": "Oxidation",
        "type": "noun",
        "ipa": "/ˌɒk.sɪˈdeɪ.ʃən/",
        "meaning": "Sự oxy hóa",
        "example": "The rusting of iron is a common example of slow oxidation.",
        "example_vi": "Sự rỉ sét của sắt là một ví dụ phổ biến của quá trình oxy hóa chậm.",
        "category": "spec-chemistry",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-chem-2",
        "word": "Catalyst",
        "type": "noun",
        "ipa": "/ˈkæt.əl.ɪst/",
        "meaning": "Chất xúc tác",
        "example": "Enzymes act as biological catalysts to speed up metabolic reactions.",
        "example_vi": "Enzyme hoạt động như những chất xúc tác sinh học để đẩy nhanh các phản ứng trao đổi chất.",
        "category": "spec-chemistry",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-chem-3",
        "word": "Molecule",
        "type": "noun",
        "ipa": "/ˈmɒl.ɪ.kjuːl/",
        "meaning": "Phân tử",
        "example": "A water molecule consists of two hydrogen atoms and one oxygen atom.",
        "example_vi": "Một phân tử nước bao gồm hai nguyên tử hydro và một nguyên tử oxy.",
        "category": "spec-chemistry",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-chem-4",
        "word": "Solubility",
        "type": "noun",
        "ipa": "/ˌsɒl.jəˈbɪl.ə.ti/",
        "meaning": "Độ hòa tan",
        "example": "Sugar has a much higher solubility in hot water than in cold water.",
        "example_vi": "Đường có độ hòa tan trong nước nóng cao hơn nhiều so với trong nước lạnh.",
        "category": "spec-chemistry",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-chem-5",
        "word": "Covalent",
        "type": "adjective",
        "ipa": "/kəʊˈveɪ.lənt/",
        "meaning": "(Liên kết) Cộng hóa trị",
        "example": "Oxygen and hydrogen are held together by strong covalent bonds in water.",
        "example_vi": "Oxy và hydro được gắn kết với nhau bằng các liên kết cộng hóa trị bền vững trong nước.",
        "category": "spec-chemistry",
        "box": 1,
        "nextReview": 0
    },

    // --- 🌌 VẬT LÝ PHỔ THÔNG (PHYSICS) ---
    {
        "id": "spec-phy-1",
        "word": "Gravity",
        "type": "noun",
        "ipa": "/ˈɡræv.ə.ti/",
        "meaning": "Trọng lực, lực hấp dẫn",
        "example": "Gravity is the fundamental force that keeps planets orbiting the sun.",
        "example_vi": "Trọng lực là lực cơ bản giữ các hành tinh quay quanh mặt trời.",
        "category": "spec-physics",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-phy-2",
        "word": "Velocity",
        "type": "noun",
        "ipa": "/vəˈlɒs.ə.ti/",
        "meaning": "Vận tốc (tốc độ có hướng)",
        "example": "Velocity measures both the speed and the direction of an object's motion.",
        "example_vi": "Vận tốc đo lường cả tốc độ và hướng chuyển động của một vật thể.",
        "category": "spec-physics",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-phy-3",
        "word": "Acceleration",
        "type": "noun",
        "ipa": "/əkˌsel.əˈreɪ.ʃən/",
        "meaning": "Gia tốc",
        "example": "The free-fall acceleration due to gravity on Earth is roughly 9.8 m/s².",
        "example_vi": "Gia tốc rơi tự do do trọng lực trên Trái Đất xấp xỉ khoảng 9,8 m/s².",
        "category": "spec-physics",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-phy-4",
        "word": "Inertia",
        "type": "noun",
        "ipa": "/ɪˈnɜː.ʃə/",
        "meaning": "Quán tính",
        "example": "An object in motion stays in motion due to the physical property of inertia.",
        "example_vi": "Một vật đang chuyển động sẽ tiếp tục chuyển động nhờ vào đặc tính vật lý của quán tính.",
        "category": "spec-physics",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-phy-5",
        "word": "Refraction",
        "type": "noun",
        "ipa": "/rɪˈfræk.ʃən/",
        "meaning": "Sự khúc xạ ánh sáng",
        "example": "The refraction of light makes a straw placed in water appear bent.",
        "example_vi": "Sự khúc xạ ánh sáng làm cho một ống hút đặt trong nước trông giống như bị bẻ cong.",
        "category": "spec-physics",
        "box": 1,
        "nextReview": 0
    },

    // --- 📜 LỊCH SỬ PHỔ THÔNG (HISTORY) ---
    {
        "id": "spec-hist-1",
        "word": "Dynasty",
        "type": "noun",
        "ipa": "/ˈdɪn.ə.sti/",
        "meaning": "Triều đại",
        "example": "The Tran Dynasty successfully repelled three Mongol invasions in Vietnam.",
        "example_vi": "Triều đại nhà Trần đã đẩy lùi thành công ba cuộc xâm lược của quân Mông Cổ tại Việt Nam.",
        "category": "spec-history",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-hist-2",
        "word": "Chronology",
        "type": "noun",
        "ipa": "/krəˈnɒl.ə.dʒi/",
        "meaning": "Niên biểu, thứ tự thời gian",
        "example": "Historians reconstructed the chronology of ancient Southeast Asian civilizations.",
        "example_vi": "Các nhà sử học đã tái dựng lại thứ tự thời gian của các nền văn minh Đông Nam Á cổ đại.",
        "category": "spec-history",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-hist-3",
        "word": "Feudalism",
        "type": "noun",
        "ipa": "/ˈfjuː.dəl.ɪ.zəm/",
        "meaning": "Chế độ phong kiến",
        "example": "Feudalism was the dominant social system in medieval Europe and Asia.",
        "example_vi": "Chế độ phong kiến là hệ thống xã hội thống trị ở châu Âu và châu Á thời trung cổ.",
        "category": "spec-history",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-hist-4",
        "word": "Sovereignty",
        "type": "noun",
        "ipa": "/ˈsɒv.rɪn.ti/",
        "meaning": "Chủ quyền quốc gia",
        "example": "The declaration affirmed the sovereignty and territorial integrity of the nation.",
        "example_vi": "Bản tuyên ngôn khẳng định chủ quyền và sự toàn vẹn lãnh thổ của quốc gia.",
        "category": "spec-history",
        "box": 1,
        "nextReview": 0
    },
    {
        "id": "spec-hist-5",
        "word": "Revolution",
        "type": "noun",
        "ipa": "/ˌrev.əˈluː.ʃən/",
        "meaning": "Cuộc cách mạng",
        "example": "The Industrial Revolution dramatically transformed farming and manufacturing.",
        "example_vi": "Cuộc Cách mạng Công nghiệp đã thay đổi hoàn toàn nền nông nghiệp và sản xuất chế tạo.",
        "category": "spec-history",
        "box": 1,
        "nextReview": 0
    }
];
