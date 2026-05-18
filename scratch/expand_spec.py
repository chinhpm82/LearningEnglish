import json
import codecs

it_words = [
    ("Variable", "noun", "/ˈveə.ri.ə.bəl/", "Biến số", "A variable stores data values.", "Biến số lưu trữ các giá trị dữ liệu."),
    ("Function", "noun", "/ˈfʌŋk.ʃən/", "Hàm", "A function is a block of code designed to perform a particular task.", "Hàm là một khối mã được thiết kế để thực hiện một tác vụ cụ thể."),
    ("Framework", "noun", "/ˈfreɪm.wɜːk/", "Khung làm việc", "React is a popular JavaScript framework.", "React là một khung làm việc JavaScript phổ biến."),
    ("API", "noun", "/ˌeɪ.piːˈaɪ/", "Giao diện lập trình ứng dụng", "The application fetches data from a REST API.", "Ứng dụng lấy dữ liệu từ một REST API."),
    ("Database", "noun", "/ˈdeɪ.tə.beɪs/", "Cơ sở dữ liệu", "We use PostgreSQL as our primary database.", "Chúng tôi sử dụng PostgreSQL làm cơ sở dữ liệu chính."),
    ("Server", "noun", "/ˈsɜː.vər/", "Máy chủ", "The server is currently down for maintenance.", "Máy chủ hiện đang ngừng hoạt động để bảo trì."),
    ("Client", "noun", "/ˈklaɪ.ənt/", "Máy khách", "The client sends a request to the server.", "Máy khách gửi một yêu cầu đến máy chủ."),
    ("Frontend", "noun", "/ˌfrʌntˈend/", "Giao diện người dùng", "Frontend development involves HTML, CSS, and JS.", "Phát triển giao diện người dùng liên quan đến HTML, CSS và JS."),
    ("Backend", "noun", "/ˌbækˈend/", "Máy chủ / Hệ thống xử lý", "The backend handles database connections and logic.", "Hệ thống xử lý xử lý các kết nối cơ sở dữ liệu và logic."),
    ("Syntax", "noun", "/ˈsɪn.tæks/", "Cú pháp", "A syntax error will prevent the code from compiling.", "Một lỗi cú pháp sẽ ngăn mã biên dịch."),
    ("Bug", "noun", "/bʌɡ/", "Lỗi phần mềm", "I found a critical bug in the login system.", "Tôi đã tìm thấy một lỗi nghiêm trọng trong hệ thống đăng nhập."),
    ("Debug", "verb", "/ˌdiːˈbʌɡ/", "Sửa lỗi", "It took hours to debug the application.", "Mất hàng giờ để sửa lỗi ứng dụng."),
    ("Compiler", "noun", "/kəmˈpaɪ.lər/", "Trình biên dịch", "The compiler converts source code into machine code.", "Trình biên dịch chuyển đổi mã nguồn thành mã máy."),
    ("Deploy", "verb", "/dɪˈplɔɪ/", "Triển khai", "We will deploy the new version tomorrow.", "Chúng tôi sẽ triển khai phiên bản mới vào ngày mai."),
    ("Version", "noun", "/ˈvɜː.ʃən/", "Phiên bản", "Please update to the latest version of the app.", "Vui lòng cập nhật lên phiên bản mới nhất của ứng dụng."),
    ("Repository", "noun", "/rɪˈpɒz.ɪ.tər.i/", "Kho lưu trữ", "Clone the repository to your local machine.", "Sao chép kho lưu trữ vào máy cục bộ của bạn."),
    ("Commit", "verb", "/kəˈmɪt/", "Ghi lại thay đổi", "Always write clear commit messages.", "Luôn viết các thông báo ghi lại thay đổi rõ ràng."),
    ("Branch", "noun", "/brɑːntʃ/", "Nhánh", "Create a new branch for your feature.", "Tạo một nhánh mới cho tính năng của bạn."),
    ("Merge", "verb", "/mɜːdʒ/", "Gộp", "Merge the feature branch into the main branch.", "Gộp nhánh tính năng vào nhánh chính."),
    ("Array", "noun", "/əˈreɪ/", "Mảng", "An array can hold multiple values in a single variable.", "Một mảng có thể chứa nhiều giá trị trong một biến duy nhất."),
    ("Object", "noun", "/ˈɒb.dʒɪkt/", "Đối tượng", "JavaScript is an object-oriented language.", "JavaScript là một ngôn ngữ hướng đối tượng."),
    ("String", "noun", "/strɪŋ/", "Chuỗi", "A string is a sequence of characters.", "Một chuỗi là một chuỗi các ký tự."),
    ("Integer", "noun", "/ˈɪn.tɪ.dʒər/", "Số nguyên", "The ID field must be an integer.", "Trường ID phải là một số nguyên."),
    ("Boolean", "noun", "/ˈbuː.li.ən/", "Kiểu logic (Đúng/Sai)", "A boolean variable can only be true or false.", "Một biến logic chỉ có thể đúng hoặc sai."),
    ("Loop", "noun", "/luːp/", "Vòng lặp", "Use a for loop to iterate over the array.", "Sử dụng vòng lặp for để lặp qua mảng."),
    ("Asynchronous", "adjective", "/eɪˈsɪŋ.krə.nəs/", "Bất đồng bộ", "AJAX stands for Asynchronous JavaScript and XML.", "AJAX là viết tắt của Asynchronous JavaScript và XML."),
    ("Promise", "noun", "/ˈprɒm.ɪs/", "Lời hứa (kỹ thuật lập trình)", "A Promise represents the eventual completion of an operation.", "Một Promise đại diện cho sự hoàn thành cuối cùng của một thao tác."),
    ("Callback", "noun", "/ˈkɔːl.bæk/", "Hàm gọi lại", "Pass a callback function to handle the response.", "Truyền một hàm gọi lại để xử lý phản hồi."),
    ("DOM", "noun", "/dɒm/", "Mô hình đối tượng tài liệu", "You can manipulate the DOM using JavaScript.", "Bạn có thể thao tác DOM bằng JavaScript."),
    ("Cache", "noun", "/kæʃ/", "Bộ nhớ đệm", "Clear your browser cache if the page doesn't load.", "Xóa bộ nhớ đệm trình duyệt của bạn nếu trang không tải."),
    ("Cookie", "noun", "/ˈkʊk.i/", "Tệp thông tin web", "Cookies are used to remember user sessions.", "Cookies được sử dụng để ghi nhớ các phiên làm việc của người dùng."),
    ("Session", "noun", "/ˈseʃ.ən/", "Phiên làm việc", "The user session expires after 30 minutes.", "Phiên làm việc của người dùng hết hạn sau 30 phút."),
    ("Token", "noun", "/ˈtəʊ.kən/", "Mã thông báo (xác thực)", "Send the JWT token in the authorization header.", "Gửi mã thông báo JWT trong tiêu đề xác thực."),
    ("Encryption", "noun", "/ɪnˈkrɪp.ʃən/", "Mã hóa", "End-to-end encryption secures your messages.", "Mã hóa đầu cuối bảo mật các tin nhắn của bạn."),
    ("Decryption", "noun", "/dɪˈkrɪp.ʃən/", "Giải mã", "Decryption requires a secret key.", "Giải mã yêu cầu một khóa bí mật."),
    ("Firewall", "noun", "/ˈfaɪə.wɔːl/", "Tường lửa", "The firewall blocks unauthorized network traffic.", "Tường lửa chặn lưu lượng mạng trái phép."),
    ("Malware", "noun", "/ˈmæl.weər/", "Phần mềm độc hại", "Use an antivirus to scan for malware.", "Sử dụng phần mềm diệt virus để quét phần mềm độc hại."),
    ("Phishing", "noun", "/ˈfɪʃ.ɪŋ/", "Lừa đảo qua mạng", "Be careful of phishing emails asking for passwords.", "Hãy cẩn thận với các email lừa đảo yêu cầu mật khẩu."),
    ("Bandwidth", "noun", "/ˈbænd.wɪtθ/", "Băng thông", "Streaming video requires high bandwidth.", "Truyền phát video yêu cầu băng thông cao."),
    ("Latency", "noun", "/ˈleɪ.tən.si/", "Độ trễ", "Low latency is crucial for online gaming.", "Độ trễ thấp là rất quan trọng đối với chơi game trực tuyến."),
    ("Scalability", "noun", "/ˌskeɪ.ləˈbɪl.ə.ti/", "Khả năng mở rộng", "Cloud computing provides high scalability.", "Điện toán đám mây cung cấp khả năng mở rộng cao."),
    ("Redundancy", "noun", "/rɪˈdʌn.dən.si/", "Sự dự phòng", "Data redundancy ensures files are not lost.", "Sự dự phòng dữ liệu đảm bảo các tệp không bị mất."),
    ("Virtualization", "noun", "/ˌvɜː.tʃu.ə.laɪˈzeɪ.ʃən/", "Ảo hóa", "Virtualization allows running multiple OS on one server.", "Ảo hóa cho phép chạy nhiều hệ điều hành trên một máy chủ."),
    ("Container", "noun", "/kənˈteɪ.nər/", "Bộ chứa (phần mềm)", "Docker is a popular container platform.", "Docker là một nền tảng bộ chứa phổ biến."),
    ("Microservices", "noun", "/ˈmaɪ.krəʊˌsɜː.vɪs.ɪz/", "Kiến trúc vi dịch vụ", "The app is built using microservices architecture.", "Ứng dụng được xây dựng bằng kiến trúc vi dịch vụ."),
    ("Algorithm", "noun", "/ˈæl.ɡə.rɪ.ðəm/", "Thuật toán", "Search engines use complex algorithms.", "Các công cụ tìm kiếm sử dụng các thuật toán phức tạp."),
    ("Heuristic", "adjective", "/hjʊəˈrɪs.tɪk/", "Chỉ đạo khám phá", "Antivirus software uses heuristic analysis to detect unknown threats.", "Phần mềm diệt virus sử dụng phân tích khám phá để phát hiện các mối đe dọa chưa biết."),
    ("Polymorphism", "noun", "/ˌpɒl.iˈmɔː.fɪ.zəm/", "Tính đa hình", "Polymorphism is a core concept of OOP.", "Tính đa hình là một khái niệm cốt lõi của OOP."),
    ("Inheritance", "noun", "/ɪnˈher.ɪ.təns/", "Tính kế thừa", "Classes can share code through inheritance.", "Các lớp có thể chia sẻ mã thông qua tính kế thừa."),
    ("Encapsulation", "noun", "/ɪnˌkæp.sjʊˈleɪ.ʃən/", "Tính đóng gói", "Encapsulation hides the internal state of an object.", "Tính đóng gói che giấu trạng thái bên trong của một đối tượng.")
]

geo_words = [
    ("Continent", "noun", "/ˈkɒn.tɪ.nənt/", "Lục địa", "Asia is the largest continent.", "Châu Á là lục địa lớn nhất."),
    ("Ocean", "noun", "/ˈəʊ.ʃən/", "Đại dương", "The Pacific Ocean is the deepest.", "Thái Bình Dương là đại dương sâu nhất."),
    ("Equator", "noun", "/ɪˈkweɪ.tər/", "Xích đạo", "The equator divides the Earth into two hemispheres.", "Xích đạo chia Trái Đất thành hai bán cầu."),
    ("Latitude", "noun", "/ˈlæt.ɪ.tʃuːd/", "Vĩ độ", "Lines of latitude run east-west.", "Các đường vĩ độ chạy theo hướng đông-tây."),
    ("Longitude", "noun", "/ˈlɒŋ.ɡɪ.tʃuːd/", "Kinh độ", "Lines of longitude run north-south.", "Các đường kinh độ chạy theo hướng bắc-nam."),
    ("Altitude", "noun", "/ˈæl.tɪ.tʃuːd/", "Độ cao", "The airplane cruised at a high altitude.", "Máy bay bay ở độ cao lớn."),
    ("Climate", "noun", "/ˈklaɪ.mət/", "Khí hậu", "Tropical regions have a hot climate.", "Các vùng nhiệt đới có khí hậu nóng."),
    ("Topography", "noun", "/təˈpɒɡ.rə.fi/", "Địa hình", "The map shows the topography of the island.", "Bản đồ hiển thị địa hình của hòn đảo."),
    ("Canyon", "noun", "/ˈkæn.jən/", "Hẻm núi", "The Grand Canyon is a famous tourist attraction.", "Hẻm núi Grand Canyon là một điểm thu hút khách du lịch nổi tiếng."),
    ("Peninsula", "noun", "/pəˈnɪn.sjə.lə/", "Bán đảo", "Florida is a large peninsula.", "Florida là một bán đảo lớn."),
    ("Archipelago", "noun", "/ˌɑː.kɪˈpel.ə.ɡəʊ/", "Quần đảo", "Indonesia is the world's largest archipelago.", "Indonesia là quần đảo lớn nhất thế giới."),
    ("Glacier", "noun", "/ˈɡlæs.i.ər/", "Sông băng", "Global warming is causing glaciers to melt.", "Sự nóng lên toàn cầu đang khiến các sông băng tan chảy."),
    ("Tundra", "noun", "/ˈtʌn.drə/", "Đài nguyên", "Few trees can survive in the harsh tundra.", "Rất ít cây cối có thể sống sót trong đài nguyên khắc nghiệt."),
    ("Desert", "noun", "/ˈdez.ət/", "Sa mạc", "The Sahara is a vast desert in Africa.", "Sahara là một sa mạc rộng lớn ở Châu Phi."),
    ("Oasis", "noun", "/əʊˈeɪ.sɪs/", "Ốc đảo", "They found water at an oasis in the desert.", "Họ tìm thấy nước tại một ốc đảo trong sa mạc.")
]

bio_words = [
    ("Cell", "noun", "/sel/", "Tế bào", "Cells are the basic building blocks of all living things.", "Tế bào là những khối cấu tạo cơ bản của mọi sinh vật sống."),
    ("Nucleus", "noun", "/ˈnjuː.kli.əs/", "Nhân tế bào", "The nucleus contains the cell's DNA.", "Nhân tế bào chứa DNA của tế bào."),
    ("Mitochondria", "noun", "/ˌmaɪ.təʊˈkɒn.dri.ə/", "Ti thể", "Mitochondria are the powerhouses of the cell.", "Ti thể là nhà máy năng lượng của tế bào."),
    ("Photosynthesis", "noun", "/ˌfəʊ.təʊˈsɪn.θə.sɪs/", "Quang hợp", "Plants use photosynthesis to make food.", "Thực vật sử dụng quá trình quang hợp để tạo ra thức ăn."),
    ("Evolution", "noun", "/ˌiː.vəˈluː.ʃən/", "Sự tiến hóa", "Darwin proposed the theory of evolution.", "Darwin đã đề xuất thuyết tiến hóa."),
    ("Species", "noun", "/ˈspiː.ʃiːz/", "Giống loài", "There are millions of different species on Earth.", "Có hàng triệu giống loài khác nhau trên Trái Đất."),
    ("Habitat", "noun", "/ˈhæb.ɪ.tæt/", "Môi trường sống", "Deforestation destroys the natural habitat of many animals.", "Nạn phá rừng phá hủy môi trường sống tự nhiên của nhiều loài động vật."),
    ("Ecosystem", "noun", "/ˈiː.kəʊˌsɪs.təm/", "Hệ sinh thái", "A coral reef is a complex marine ecosystem.", "Rạn san hô là một hệ sinh thái biển phức tạp."),
    ("Genetics", "noun", "/dʒəˈnet.ɪks/", "Di truyền học", "Genetics is the study of genes and heredity.", "Di truyền học là ngành nghiên cứu về gen và sự di truyền."),
    ("Mutation", "noun", "/mjuːˈteɪ.ʃən/", "Đột biến", "A genetic mutation can lead to new traits.", "Một đột biến di truyền có thể dẫn đến các đặc điểm mới."),
    ("Organism", "noun", "/ˈɔː.ɡən.ɪ.zəm/", "Sinh vật", "An amoeba is a single-celled organism.", "Amip là một sinh vật đơn bào."),
    ("Predator", "noun", "/ˈpred.ə.tər/", "Động vật ăn thịt", "Lions are apex predators in the savanna.", "Sư tử là loài động vật ăn thịt đầu bảng trên thảo nguyên."),
    ("Prey", "noun", "/preɪ/", "Con mồi", "The cheetah chased its prey.", "Báo đốm săn đuổi con mồi của nó."),
    ("Metabolism", "noun", "/məˈtæb.əl.ɪ.zəm/", "Sự trao đổi chất", "Exercise speeds up your metabolism.", "Tập thể dục tăng tốc độ trao đổi chất của bạn."),
    ("Enzyme", "noun", "/ˈen.zaɪm/", "Enzym", "Enzymes act as catalysts in biological reactions.", "Enzym hoạt động như chất xúc tác trong các phản ứng sinh học.")
]

chem_words = [
    ("Atom", "noun", "/ˈæt.əm/", "Nguyên tử", "An atom is the smallest unit of ordinary matter.", "Một nguyên tử là đơn vị nhỏ nhất của vật chất thông thường."),
    ("Molecule", "noun", "/ˈmɒl.ɪ.kjuːl/", "Phân tử", "A water molecule has two hydrogen atoms and one oxygen atom.", "Một phân tử nước có hai nguyên tử hydro và một nguyên tử oxy."),
    ("Element", "noun", "/ˈel.ɪ.mənt/", "Nguyên tố", "Gold is a chemical element.", "Vàng là một nguyên tố hóa học."),
    ("Compound", "noun", "/ˈkɒm.paʊnd/", "Hợp chất", "Salt is a compound of sodium and chlorine.", "Muối là một hợp chất của natri và clo."),
    ("Reaction", "noun", "/riˈæk.ʃən/", "Phản ứng", "Mixing acid and base causes a chemical reaction.", "Trộn axit và bazơ gây ra một phản ứng hóa học."),
    ("Catalyst", "noun", "/ˈkæt.əl.ɪst/", "Chất xúc tác", "A catalyst speeds up a chemical reaction.", "Một chất xúc tác đẩy nhanh một phản ứng hóa học."),
    ("Oxidation", "noun", "/ˌɒk.sɪˈdeɪ.ʃən/", "Sự oxy hóa", "Rust is a result of iron oxidation.", "Rỉ sét là kết quả của sự oxy hóa sắt."),
    ("Solvent", "noun", "/ˈsɒl.vənt/", "Dung môi", "Water is often called the universal solvent.", "Nước thường được gọi là dung môi vạn năng."),
    ("Solute", "noun", "/ˈsɒl.juːt/", "Chất tan", "Sugar is the solute when dissolved in water.", "Đường là chất tan khi được hòa tan trong nước."),
    ("Solution", "noun", "/səˈluː.ʃən/", "Dung dịch", "A solution is a homogeneous mixture.", "Một dung dịch là một hỗn hợp đồng nhất."),
    ("Acid", "noun", "/ˈæs.ɪd/", "Axit", "Lemon juice contains citric acid.", "Nước chanh chứa axit citric."),
    ("Base", "noun", "/beɪs/", "Bazơ", "Soap is a weak base.", "Xà phòng là một bazơ yếu."),
    ("pH", "noun", "/ˌpiːˈeɪtʃ/", "Độ pH", "Pure water has a pH of exactly 7.", "Nước tinh khiết có độ pH chính xác là 7."),
    ("Isotope", "noun", "/ˈaɪ.sə.təʊp/", "Đồng vị", "Carbon-14 is a radioactive isotope of carbon.", "Carbon-14 là một đồng vị phóng xạ của carbon."),
    ("Polymer", "noun", "/ˈpɒl.ɪ.mər/", "Polyme", "Plastics are common synthetic polymers.", "Nhựa là các polyme tổng hợp phổ biến.")
]

phy_words = [
    ("Force", "noun", "/fɔːs/", "Lực", "Gravity is a fundamental force of nature.", "Trọng lực là một lực cơ bản của tự nhiên."),
    ("Velocity", "noun", "/vəˈlɒs.ə.ti/", "Vận tốc", "Velocity includes both speed and direction.", "Vận tốc bao gồm cả tốc độ và hướng."),
    ("Acceleration", "noun", "/əkˌsel.əˈreɪ.ʃən/", "Gia tốc", "Acceleration is the rate of change of velocity.", "Gia tốc là tốc độ thay đổi của vận tốc."),
    ("Mass", "noun", "/mæs/", "Khối lượng", "Mass is a measure of the amount of matter in an object.", "Khối lượng là thước đo lượng vật chất trong một vật thể."),
    ("Momentum", "noun", "/məˈmen.təm/", "Động lượng", "A heavy truck has more momentum than a small car.", "Một chiếc xe tải nặng có nhiều động lượng hơn một chiếc xe hơi nhỏ."),
    ("Energy", "noun", "/ˈen.ə.dʒi/", "Năng lượng", "Energy cannot be created or destroyed.", "Năng lượng không thể tự sinh ra hay mất đi."),
    ("Friction", "noun", "/ˈfrɪk.ʃən/", "Lực ma sát", "Friction between the tires and the road stops the car.", "Lực ma sát giữa lốp xe và mặt đường làm xe dừng lại."),
    ("Gravity", "noun", "/ˈɡræv.ə.ti/", "Trọng lực", "Gravity pulls objects towards the center of the Earth.", "Trọng lực kéo các vật thể về phía tâm Trái Đất."),
    ("Inertia", "noun", "/ɪˈnɜː.ʃə/", "Quán tính", "Seatbelts protect passengers from the effects of inertia.", "Dây an toàn bảo vệ hành khách khỏi tác động của quán tính."),
    ("Wavelength", "noun", "/ˈweɪv.leŋθ/", "Bước sóng", "Different colors of light have different wavelengths.", "Các màu sắc ánh sáng khác nhau có các bước sóng khác nhau."),
    ("Frequency", "noun", "/ˈfriː.kwən.si/", "Tần số", "The frequency of the sound wave determines its pitch.", "Tần số của sóng âm quyết định độ cao của nó."),
    ("Radiation", "noun", "/ˌreɪ.diˈeɪ.ʃən/", "Bức xạ", "The sun emits ultraviolet radiation.", "Mặt trời phát ra bức xạ tia cực tím."),
    ("Thermodynamics", "noun", "/ˌθɜː.məʊ.daɪˈnæm.ɪks/", "Nhiệt động lực học", "Thermodynamics is the study of heat and energy.", "Nhiệt động lực học là ngành nghiên cứu về nhiệt và năng lượng."),
    ("Quantum", "noun", "/ˈkwɒn.təm/", "Lượng tử", "Quantum mechanics describes the behavior of subatomic particles.", "Cơ học lượng tử mô tả hành vi của các hạt hạ nguyên tử."),
    ("Relativity", "noun", "/ˌrel.əˈtɪv.ə.ti/", "Thuyết tương đối", "Einstein published the theory of relativity.", "Einstein đã công bố thuyết tương đối.")
]

hist_words = [
    ("Empire", "noun", "/ˈem.paɪər/", "Đế chế", "The Roman Empire was vast and powerful.", "Đế chế La Mã rộng lớn và hùng mạnh."),
    ("Dynasty", "noun", "/ˈdɪn.ə.sti/", "Triều đại", "The Ming Dynasty ruled China for nearly 300 years.", "Triều đại nhà Minh cai trị Trung Quốc trong gần 300 năm."),
    ("Revolution", "noun", "/ˌrev.əˈluː.ʃən/", "Cuộc cách mạng", "The French Revolution began in 1789.", "Cuộc Cách mạng Pháp bắt đầu vào năm 1789."),
    ("Treaty", "noun", "/ˈtriː.ti/", "Hiệp ước", "The two nations signed a peace treaty.", "Hai quốc gia đã ký một hiệp ước hòa bình."),
    ("Colony", "noun", "/ˈkɒl.ə.ni/", "Thuộc địa", "America was once a British colony.", "Nước Mỹ từng là một thuộc địa của Anh."),
    ("Monarchy", "noun", "/ˈmɒn.ə.ki/", "Chế độ quân chủ", "A monarchy is ruled by a king or queen.", "Một chế độ quân chủ được cai trị bởi một vị vua hoặc nữ hoàng."),
    ("Republic", "noun", "/rɪˈpʌb.lɪk/", "Chế độ cộng hòa", "In a republic, the power rests with elected representatives.", "Trong một chế độ cộng hòa, quyền lực thuộc về các đại diện được bầu cử."),
    ("Civilization", "noun", "/ˌsɪv.əl.aɪˈzeɪ.ʃən/", "Nền văn minh", "Ancient Egypt was a great civilization.", "Ai Cập cổ đại là một nền văn minh vĩ đại."),
    ("Chronology", "noun", "/krəˈnɒl.ə.dʒi/", "Niên biểu", "Understanding the chronology of events is crucial in history.", "Hiểu biết niên biểu của các sự kiện là rất quan trọng trong lịch sử."),
    ("Archaeology", "noun", "/ˌɑː.kiˈɒl.ə.dʒi/", "Khảo cổ học", "Archaeology helps us learn about ancient cultures.", "Khảo cổ học giúp chúng ta tìm hiểu về các nền văn hóa cổ đại."),
    ("Artifact", "noun", "/ˈɑː.tɪ.fækt/", "Đồ tạo tác", "The museum displays artifacts from the Bronze Age.", "Bảo tàng trưng bày các đồ tạo tác từ Thời đại Đồ đồng."),
    ("Sovereignty", "noun", "/ˈsɒv.rɪn.ti/", "Chủ quyền", "The country fought to maintain its sovereignty.", "Quốc gia đã chiến đấu để duy trì chủ quyền của mình."),
    ("Feudalism", "noun", "/ˈfjuː.dəl.ɪ.zəm/", "Chế độ phong kiến", "Feudalism was common in medieval Europe.", "Chế độ phong kiến rất phổ biến ở châu Âu thời trung cổ."),
    ("Rebellion", "noun", "/rɪˈbel.i.ən/", "Cuộc nổi loạn", "The peasants led a rebellion against the king.", "Những người nông dân đã dẫn đầu một cuộc nổi loạn chống lại nhà vua."),
    ("Constitution", "noun", "/ˌkɒn.stɪˈtʃuː.ʃən/", "Hiến pháp", "The US Constitution was adopted in 1787.", "Hiến pháp Hoa Kỳ được thông qua vào năm 1787.")
]


with codecs.open("data/specialized-data.js", "w", "utf-8") as f:
    f.write("/* ==========================================================================\n")
    f.write("   LearningEnglish - Massively Expanded Specialized Vocabulary Dataset\n")
    f.write("   ========================================================================== */\n\n")
    f.write("const SPECIALIZED_VOCABULARY = [\n")
    
    id_counter = 1
    
    # helper to write words
    def write_words(words, prefix, cat_name):
        global id_counter
        for w in words:
            f.write("    {\n")
            f.write(f'        "id": "spec-{prefix}-{id_counter}",\n')
            f.write(f'        "word": "{w[0]}",\n')
            f.write(f'        "type": "{w[1]}",\n')
            f.write(f'        "ipa": "{w[2]}",\n')
            f.write(f'        "meaning": "{w[3]}",\n')
            f.write(f'        "example": "{w[4]}",\n')
            f.write(f'        "example_vi": "{w[5]}",\n')
            f.write(f'        "category": "spec-{cat_name}",\n')
            f.write(f'        "box": 1,\n')
            f.write(f'        "nextReview": 0\n')
            f.write("    },\n")
            id_counter += 1

    write_words(it_words, "it", "it")
    write_words(geo_words, "geo", "geography")
    write_words(bio_words, "bio", "biology")
    write_words(chem_words, "chem", "chemistry")
    write_words(phy_words, "phy", "physics")
    write_words(hist_words, "hist", "history")

    f.write("];\n")
