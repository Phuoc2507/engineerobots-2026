// Văn bản dài mặc định (thể lệ chi tiết, tab thể lệ trang chủ, chính sách riêng tư) — BTC sửa ở /admin/content.
// Cú pháp xem DOC_HINT trong components/content/Doc.tsx.
import { SITE, STUDENT_DOMAIN } from "@/lib/site";

export const RULES_SECTIONS = [
  {
    id: "doi-tuong", title: "I. Đối tượng tham gia",
    body: `- Tân sinh viên khóa 2026 hệ chính quy **đang theo học tại khoa Cơ khí**, Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh (HCM-UTE).
- Tham gia theo đội thi, mỗi đội gồm **tối đa 05 thành viên**.
- Mỗi đội bắt buộc cử 01 Đội trưởng đại diện để liên hệ, bốc thăm và xác nhận các biên bản kết quả với Ban tổ chức.
- Mỗi sinh viên chỉ được đăng ký trong danh sách của đúng 01 đội thi duy nhất.`,
  },
  {
    id: "chu-de", title: "II. Chủ đề “Hành trình Kỹ sư Cơ khí”",
    body: `Đấu trường được tái hiện như “Hành trình trưởng thành của một người Kỹ sư Cơ khí”: mỗi robot là hiện thân cho tâm huyết, bản lĩnh, sự sáng tạo và trí tuệ của người điều khiển; mỗi chặng thi là một cột mốc của kỹ sư tương lai. Các thử thách tăng dần từ dễ đến khó:

## [đỏ] Chặng 1 – “Thích nghi”
Làm quen môi trường đại học. Robot tự động hoàn toàn (dò line, không can thiệp điều khiển): xuất phát từ Trạm khởi hành, qua Đường Danh vọng, vượt Checkpoint và xử lý các khúc cua của Đường Thách thức để về đích tại vạch ngang chữ T.

## Chặng 2 – “Bứt phá”
Học tập, tích lũy kiến thức và nắm bắt cơ hội. Đội điều khiển robot bằng tay cầm, dùng bất cứ cơ chế nào đưa các cấu kiện Kiến thức về Trạm thành tựu để mở khóa quyền tranh chấp cấu kiện Cơ hội vàng tại bục trung tâm.

## [xanh] Chặng 3 – “Thành công”
Thực hiện và bảo vệ Đồ án tốt nghiệp. Hai robot thi đấu độc lập trên sân của đội mình: vượt Cầu Bản lĩnh, vượt Đường Thử thách, đưa cấu kiện Đồ án từ Trạm Thực nghiệm vượt Dốc Kiên trì vào Ô Bảo vệ Đồ án trên Đài Bảo vệ, rồi leo Dốc Thăng hoa vào Bục Vinh Quang nhấn nút thắp sáng Đèn Vinh Quang của đội mình.`,
  },
  {
    id: "robot", title: "III. Quy chuẩn kỹ thuật robot",
    body: `[[thong-so-robot]]

## 1. Kích thước
- Toàn bộ thân robot khi đã bung toàn bộ cơ cấu phải nằm gọn trong **300 (Dài) × 250 (Rộng) × 200 (Cao) mm** suốt trận đấu, dung sai +10 mm; không chi tiết nào được tràn ra ngoài.
- **Cơ chế tự do:** càng đẩy, trục cuộn bóng / con lăn cuốn, tay gắp, ngàm kẹp… để thu thập, dẫn hướng hoặc đưa bóng về vị trí quy định (Trạm thành tựu, Ô Bảo vệ Đồ án) và nhấn nút Đèn Vinh Quang.

## 2. Khối lượng
- Tổng khối lượng (tính cả pin) tối đa **2,5 kg**, dung sai +100 g. Được dùng khung xe, kit robot mua sẵn.

## 3. Nguồn điện
- Pin DC (Lithium-Polymer, Li-Ion, Ni-MH, 18650), tối đa **12 V DC**, dung sai +0,6 V. Nghiêm cấm điện lưới AC.

## 4. Kiểm định
- Kiểm tra kích thước, khối lượng, điện áp tại bàn kỹ thuật trước **mỗi trận đấu**, không tính vào thời gian chuẩn bị (trận Bo3 chỉ kiểm định trước ván đầu). Không đạt bị **xử thua trận đó** (vòng loại tính 0 điểm), không có thời gian sửa chữa.
- Được dùng robot dự phòng; robot dự phòng phải qua kiểm định trước trận đấu sử dụng.

## 5. Chế độ điều khiển & tự hành
- **Chặng 1:** chạy hoàn toàn tự động (dò line), chỉ ấn nút khởi động một lần duy nhất. **Nghiêm cấm mọi can thiệp sóng không dây, tay cầm điều khiển hoặc tác động cơ học** trong Chặng 1.
- **Chặng 2 và 3:** điều khiển từ xa (RF, Bluetooth, Wifi, Gamepad không dây…).
- **Chuyển chế độ:** sau khi về đích Chặng 1, robot phải tự chuyển sang điều khiển từ xa; không chạm tay để đổi chế độ. Chỉ chạm tay khi Trọng tài chấp nhận retry hoặc khi đưa robot lên khu vực đích Chặng 1 sau 60 giây (TIMEOUT).
- **Thiết bị điều khiển:** tay cầm được kết nối sẵn nhưng phải đặt xuống đất suốt Chặng 1; **chỉ được cầm lên khi robot đã về đích Chặng 1 hoặc đã hết 60 giây**.
- **Khu vực điều khiển:** tối đa 02 thành viên mỗi đội.

## 6. Quy định an toàn
- Cấm vũ khí hủy diệt, vật sắc nhọn, mũi khoan, lưỡi cắt kim loại, keo dán dính sàn, nam châm điện cường độ lớn gây kẹt sàn, chất lỏng, khói, lửa, chất ăn mòn.
- Cấm thiết bị gây nhiễu sóng vô tuyến nhằm vô hiệu hóa tay điều khiển của đối phương: **truất quyền thi đấu ngay lập tức và hủy bỏ toàn bộ kết quả** trong cuộc thi.
- Bề mặt chi tiết tiếp xúc với bóng cấu kiện (Kiến thức, Cơ hội vàng, Đồ án) và nút Đèn Vinh Quang phải phẳng, nhẵn hoặc bọc mút xốp, cao su, silicon, vật liệu mềm; không có cạnh sắc làm móp, trầy, thủng hay biến dạng bóng và thiết bị của BTC.`,
  },
  {
    id: "sa-ban", title: "IV. Sa bàn và chi tiết sân thi đấu",
    body: `Sa bàn 4800 × 4800 mm gia công theo bộ bản vẽ kỹ thuật 2D/3D chính thức của BTC, bao quanh bởi dây giăng cảnh báo. **Bản vẽ chi tiết sa bàn và đường line được công bố bên dưới** để các đội tự làm sa bàn tập luyện.

[[so-do-sa-ban]]

## [đỏ] 1. Chặng 1 · Thích nghi
- Nền trắng, line đen. 2 làn biên độc lập 4800 (Dài) × 900 (Rộng) mm: Đội Đỏ cánh trái, Đội Xanh cánh phải.
- **Trạm khởi hành (1.1 – 1.2):** ô 310 × 260 mm ở góc trên cùng mỗi làn; ô màu Đỏ (1.1) cho đội Đỏ, ô màu Xanh (1.2) cho đội Xanh.
- Vạch dẫn hướng màu đen rộng 20 mm. **Đường Danh vọng:** đoạn thẳng 1800 mm nối từ Trạm khởi hành. **Đường Thách thức:** ziczac dài 2040 mm, khúc cua 45°, kết thúc ở vạch ngang chữ T dài 300 mm.
- **Checkpoint:** cuối Đường Danh vọng (mốc 1800 mm, trước khi vào Đường Thách thức).

## 2. Chặng 2 · Bứt phá
- Khu vực rộng 3000 mm, dài 1850 mm.
- **Khu vực retry (2.1 – 2.2):** 310 × 260 mm ở 2 góc dưới (2.1 trái cho Đỏ, 2.2 phải cho Xanh), họa tiết gạch chéo 45°.
- **Trạm thành tựu (2.3 – 2.4):** 300 × 300 mm phía trên sân (Đỏ trái, Xanh phải), họa tiết lưới ô vuông màu đội; gờ chặn hãm bóng cao 10 mm quanh chu vi.
- **Bục Cơ hội (2.5):** bục dốc nghiêng 4 mặt đối xứng ở tâm Chặng 2, đáy 400 × 400 mm, đỉnh phẳng 300 × 300 mm, cao 50 mm; trên tâm đặt 01 bóng pickleball Ø74 mm màu vàng (Cơ hội vàng). **Chỉ xuất hiện ở Vòng Chung kết xếp hạng.**
- **Cấu kiện Kiến thức (2.6):** 04 bóng pickleball Ø74 mm (02 Đỏ ở cụm bên sân Đỏ, 02 Xanh ở cụm bên sân Xanh), ở hai bên phía dưới sân.

## [xanh] 3. Chặng 3 · Thành công
- Khu vực rộng 3000 mm, dài 2400 mm, chia 2 sân độc lập đối xứng (Đỏ trái, Xanh phải) bởi **đường nét đứt màu xanh dương** ở giữa.
- **Khu vực retry (3.1 – 3.2):** 310 × 260 mm sát hai mép vách biên ngoài, họa tiết gạch chéo 45°.
- **Đường Thử thách (3.3 – 3.4):** mỗi khu 600 (Dài) × 400 (Rộng) mm, gồm 05 thanh gờ ống PVC cao 15 mm đặt ngang liên tiếp, **mỗi thanh cách nhau 100 mm**.
- **Trạm Thực nghiệm (3.5 – 3.6):** ngay sau Đường Thử thách; tâm trạm đặt 01 bóng Đồ án Ø74 mm (Đỏ bên sân Đỏ, Xanh bên sân Xanh).
- **Tổ hợp Bục Vinh Quang (3.7)**, 2 bậc liên hoàn: *Dốc Kiên trì* 550 × 450 mm, nghiêng 10°, thẳng hàng phía trên Trạm Thực nghiệm, lên *Đài Bảo vệ* (Bậc 1, cao 100 mm, sát mép trên sa bàn); 02 *Dốc Thăng hoa* 500 × 450 mm, nghiêng 10°, đặt ngang hai bên (Đỏ leo trái sang phải, Xanh leo phải sang trái) lên *Bục Vinh Quang* (Bậc 2) 400 × 450 mm, cao 200 mm ở trung tâm; vách ngăn giữa bục gắn 02 nút nhấn Đèn Vinh Quang độc lập, vuông góc với hướng robot leo tới.
- **Cầu Bản lĩnh (3.8):** cầu gỗ có dây treo nối Chặng 2 sang Chặng 3, 600 (Dài) × 550 (Rộng) × 100 (Cao) mm.
- **Ô Bảo vệ Đồ án & Đế (3.9 – 3.10):** ô vuông 120 × 120 mm ở góc trên phía ngoài Đài Bảo vệ (3.9 Đỏ, 3.10 Xanh), **viền ô có gờ chặn hãm bóng cao 10 mm**; bên trong có 01 đế nhỏ để đặt cấu kiện Đồ án.

## 4. Thuật ngữ và định nghĩa
| STT | Thuật ngữ | Ký hiệu trên sa bàn | Định nghĩa |
| 1 | **Trạm khởi hành** | 1.1 – 1.2 | Vị trí đặt robot trước khi trận đấu bắt đầu |
| 2 | **Chặng 1** | Chặng 1 | Khu vực thực hiện nhiệm vụ “Thích nghi” |
| 3 | **Chặng 2** | Chặng 2 | Khu vực thực hiện nhiệm vụ “Bứt phá” |
| 4 | **Chặng 3** | Chặng 3 | Khu vực thực hiện nhiệm vụ “Thành công” |
| 5 | **Vạch giới hạn** | Đường kẻ màu đen bao quanh các khu vực trong sân thi đấu | Vạch giới hạn phạm vi của robot hoạt động trong sân thi đấu |
| 6 | **Vị trí Checkpoint** | Khung được ký hiệu “Checkpoint” | Vị trí đánh dấu trên đoạn đường dò line; robot đi qua vạch sẽ được lưu vị trí retry tại đó ở Chặng 1 |
| 7 | **Khu vực retry** | 2.1 – 2.2 – 3.1 – 3.2 | Khu vực robot được đưa về khi đội thi yêu cầu quyền retry |
| 8 | **Trạm thành tựu** | 2.3 – 2.4 | Khu vực ghi điểm bằng cấu kiện Kiến thức |
| 9 | **Cấu kiện Cơ hội vàng** | 2.5 | Quả bóng pickleball (đường kính 74 mm) màu vàng đặt trên đỉnh Bục Cơ hội |
| 10 | **Bục Cơ hội** | 2.5 | Khu vực đặt cấu kiện Cơ hội vàng |
| 11 | **Cấu kiện Kiến thức** | 2.6 | Quả bóng pickleball (đường kính 74 mm) gồm 02 quả Đỏ ở cụm bên sân đội Đỏ và 02 quả Xanh ở cụm bên sân đội Xanh |
| 12 | **Đường Thử thách** | 3.3 – 3.4 | Dải địa hình gồ ghề của đội Đỏ (3.3) và đội Xanh (3.4) |
| 13 | **Cấu kiện Đồ án** | 3.5 – 3.6 | Quả bóng pickleball (đường kính 74 mm) |
| 14 | **Trạm Thực nghiệm** | 3.5 – 3.6 | Khu vực đặt cấu kiện Đồ án (3.5 đội Đỏ, 3.6 đội Xanh) |
| 15 | **Bục Vinh Quang** | 3.7 | Khu vực để 2 robot nhấn nút thắp sáng Đèn Vinh Quang |
| 16 | **Đèn Vinh Quang** | 3.7 | Khi robot nhấn nút, ngọn đèn sẽ sáng rực rỡ |
| 17 | **Cầu Bản lĩnh** | 3.8 | Cầu gỗ với hệ thống dây treo nối giữa Chặng 2 và Chặng 3 |
| 18 | **Ô Bảo vệ Đồ án & Đế đặt cấu kiện** | 3.9 – 3.10 | Khu vực đặt cấu kiện Đồ án để ghi điểm |`,
  },
  {
    id: "vong-dau", title: "V. Các vòng đấu",
    body: `## 1. Vòng loại – xếp hạng theo điểm số
- Mỗi trận **03:00** (180 giây); **01 phút chuẩn bị** để đưa robot vào vị trí và xác nhận sẵn sàng với Trọng tài chính.
- Đội được gọi tên **03 lần** mà không có mặt bị xử thua trận đó (vòng loại tính 0 điểm); áp dụng cả Vòng Chung kết xếp hạng.
- Đồng hồ chạy liên tục, chỉ dừng khi Trọng tài chính ra lệnh dừng khẩn cấp do sự cố bất khả kháng (sa bàn hư hỏng cơ khí, chập điện nguy hiểm).
- 2 robot chạy cùng lúc nhưng thực hiện nhiệm vụ độc lập. Nội dung: hoàn thành Chặng 1 và 2 cấu kiện Kiến thức ở Chặng 2.
- Mỗi đội thi **01 trận**, xếp hạng theo tổng điểm trận đó. Trận chỉ kết thúc sớm khi cả hai đội hoàn thành toàn bộ nội dung trước 180 giây.
- **16 đội** xếp hạng cao nhất vào Vòng Chung kết xếp hạng.

## 2. Vòng Chung kết xếp hạng – đối kháng loại trực tiếp
- Mỗi trận **05:00** (300 giây); **02 phút chuẩn bị**.
- 2 robot đối kháng 1 vs 1 trên toàn bộ sa bàn; đội thắng vào vòng sau. Tranh Hạng 3 thi đấu 1 trận; **trận Chung kết Best of 3** (thắng 2 trận trước là Quán quân).
- Cặp đấu xác định bằng bốc thăm. Màu sân (Đỏ/Xanh) bốc thăm ở trận/ván đầu; trận Bo3 đổi màu sân sau mỗi ván.
- Giữa các ván Bo3 trận chung kết, mỗi đội có **02 phút nghỉ** để thay pin, sửa robot.`,
  },
  {
    id: "luat", title: "VI. Luật thi đấu",
    body: `## [đỏ] 1. Chặng 1 · Thích nghi
- Khi có hiệu lệnh “BẮT ĐẦU”, thành viên điều khiển chỉ được ấn duy nhất 01 nút trên thân robot để kích hoạt dò line, rồi **lập tức lùi về vị trí quy định** cho người điều khiển và không can thiệp thêm.
- Robot tự động hoàn toàn, bám line đen 20 mm qua Đường Danh vọng, Checkpoint và các khúc cua của Đường Thách thức. Bắt buộc bám line suốt Chặng 1; đi tắt hoặc rời line rồi bắt lại line ở vị trí khác bị xử như mất line (−5 điểm/lần và retry).
- Hoàn thành Chặng 1 khi **ít nhất 02 bánh xe** cán ngang vạch chữ T cuối đường line, mở khóa Chặng 2.
- Tối đa **60 giây** tính từ lúc bắt đầu trận. Quá 60 giây chưa hoàn thành (TIMEOUT): chỉ 01 thành viên được nhấc robot đưa lên khu vực đích Chặng 1 để thi Chặng 2; không được điểm về đích, **điểm Checkpoint giữ nguyên**. Khi xét hòa, thời gian Chặng 1 của đội chưa về đích tính là 60 giây.
- **Điểm:** qua hoàn toàn Checkpoint **+10**; cán đích vạch chữ T **+20**; tối đa 30 điểm. Thời gian hoàn thành Chặng 1 được bấm giờ làm chỉ số phụ khi hòa.
- **Mất line:** tất cả bánh xe ra khỏi line mà không tự phục hồi trong 05 giây: **−5 điểm/lần**. Khi đội yêu cầu retry (tính 01 lần): chưa qua Checkpoint thì về khu vực xuất phát; đã qua thì đặt lại tại Checkpoint.
- **Va chạm vách biên:** chạm hoặc đâm rào chắn / vách biên làn đua: **−5 điểm/lần**.

## 2. Chặng 2 · Bứt phá
- Vượt qua Chặng 1, đội dùng tay cầm điều khiển thủ công vào Chặng 2. Gặp sự cố chuyển chế độ điều khiển: được retry (tính 01 lần) ngay tại vạch đích Chặng 1.
- Dùng bất cứ cơ chế nào đưa bóng Kiến thức màu đội mình lên Trạm thành tựu (2.3 – 2.4): **+15 điểm/cấu kiện**. Được bắn hoặc ném bóng vào trạm, miễn nằm trọn trong trạm; không giới hạn số bóng mang cùng lúc.
- Khi bóng (Kiến thức, Cơ hội vàng) còn ngoài trạm, hai robot **được phép** tì đè chiến thuật, che chắn và tranh chấp trực tiếp. Bóng chỉ được công nhận và bất khả xâm phạm khi đã vượt gờ chặn, nằm trọn trong Trạm thành tựu.
- **Vòng Chung kết:** phải tích lũy đủ 02 Kiến thức trong trạm để mở khóa quyền thu thập Cơ hội vàng **và** quyền đi qua Cầu Bản lĩnh lên Chặng 3. Đưa Cơ hội vàng nằm trọn trong trạm: **+30 điểm**, đồng thời là chỉ số phụ ưu tiên khi hòa điểm.
- Robot gặp sự cố trước khi được xác nhận vào Chặng 3 phải retry tại ô Chặng 2; không được đặt vào ô retry Chặng 3 để thay nhiệm vụ vượt cầu.
- Cố ý lấy đà đâm húc tốc độ cao phá hủy xe đối phương, hoặc ép khóa cứng robot đối phương **vào vách sân quá 05 giây khi không tranh chấp cấu kiện**: **−10 điểm/lần**.
- Robot hoàn toàn ra khỏi khu vực Chặng 2: **−10 điểm/lần** (Cầu Bản lĩnh là vùng chuyển tiếp: đi qua cầu khi đã đủ điều kiện mở khóa Chặng 3 không bị tính lỗi).
- Cố ý đẩy / húc văng bóng Kiến thức của đối phương ra ngoài biên Chặng 2: **−10 điểm/lần**, Trọng tài đặt lại bóng về vị trí ban đầu. Tự làm văng bóng của đội mình: **−5 điểm/lần**, bóng đặt lại vị trí ban đầu.
- Cố ý tác động cấu kiện trong Trạm thành tựu của đối phương: **−20 điểm/lần**, phục hồi nguyên trạng.
- **Vòng loại:** hai robot thi đấu độc lập, không được sang nửa sân đối phương (**tính từ trục giữa sa bàn**) hoặc cản phá nhau: **−15 điểm/lần** và buộc retry về ô 2.1 – 2.2.
- **Vòng Chung kết:** chưa đủ 2 Kiến thức trong trạm mà chạm vào Cơ hội vàng: **−10 điểm/lần**, Trọng tài đặt lại về Bục Cơ hội. Bị đối phương đẩy vào bóng vàng không bị phạt (Trọng tài xem xét). Bóng vàng văng ra ngoài biên được đặt lại trên Bục Cơ hội.
- Được chặn đường đối phương nhưng không được cầm, giữ hoặc mang bóng Kiến thức của đối phương: **−10 điểm/lần**, Trọng tài đặt lại bóng về vị trí ban đầu.

## [xanh] 3. Chặng 3 · Thành công
- Robot được xác nhận vào Chặng 3 khi đã đủ điều kiện ở Chặng 2, đi qua Cầu Bản lĩnh theo lộ trình và toàn bộ robot vượt qua vạch hết cầu phía Chặng 3. Hai robot thi đấu độc lập trên sân của đội mình; nghiêm cấm sang sân đối phương hoặc cản phá nhau.
- Vượt Cầu Bản lĩnh (3.8): **+10 điểm**.
- **Nhiệm vụ 1 – Đường Thử thách (3.3 / 3.4):** toàn bộ thân xe và bánh xe đi qua khỏi thanh gờ thứ 5, không đi vòng ra ngoài: **+20 điểm**. Chạm vạch giới hạn đoạn Đường Thử thách: **−5 điểm/lần**.
- **Nhiệm vụ 2 – Bảo vệ Đồ án:** chỉ sau khi vượt hoàn toàn Đường Thử thách, robot vào Trạm Thực nghiệm (3.5 / 3.6), dùng cơ chế của mình đưa cấu kiện Đồ án vượt Dốc Kiên trì lên Đài Bảo vệ, đặt nằm vững trên đế nhỏ trong Ô Bảo vệ Đồ án (3.9 / 3.10): **+25 điểm**. Làm rơi khỏi dốc hoặc Đài: **−5 điểm/lần**, bóng về Trạm Thực nghiệm và robot phải đưa lại.
- **Nhiệm vụ 3 – Đèn Vinh Quang (3.7):** chỉ sau khi Đồ án đã nằm vững trên đế, robot di chuyển trên Đài Bảo vệ, leo Dốc Thăng hoa vào Bục Vinh Quang và ấn trực diện nút của đội mình trên vách ngăn làm đèn sáng: đội nhấn trước **+40 điểm**, đội nhấn sau **+25 điểm**.
- Lộ trình bắt buộc: Cầu Bản lĩnh (3.8) ➔ Đường Thử thách (3.3 – 3.4) ➔ Trạm Thực nghiệm, đưa Đồ án vượt Dốc Kiên trì đặt lên đế trong Ô Bảo vệ Đồ án ➔ leo Dốc Thăng hoa vào Bục Vinh Quang nhấn nút Đèn Vinh Quang. Chưa đặt Đồ án lên đúng đế mà đã nhấn đèn thì kết quả nhấn không được công nhận.
- **CHIẾN THẮNG TUYỆT ĐỐI (Chung kết):** hoàn thành theo trình tự đủ điều kiện Chặng 2 (02 Kiến thức và 01 Cơ hội vàng) ➔ vượt Cầu Bản lĩnh ➔ vượt Đường Thử thách ➔ đưa Đồ án vượt Dốc Kiên trì đặt lên đế trong Ô Bảo vệ Đồ án ➔ leo Dốc Thăng hoa vào Bục Vinh Quang ➔ nhấn sáng Đèn Vinh Quang của đội mình: trận đấu kết thúc ngay với chiến thắng tuyệt đối cho đội đó, bất chấp điểm số. Nhấn đèn trước mà chưa đủ trình tự thì không tạo ra chiến thắng tuyệt đối.
- Ra khỏi khu vực thi đấu Chặng 3: **−10 điểm/lần**. Lấn sang sân đối phương: **−15 điểm/lần** và buộc retry về ô 3.1 – 3.2.

## 4. Bảng tổng hợp cơ cấu điểm số
### Điểm cộng
| Chặng | Nhiệm vụ thực hiện | Điểm số / lợi thế | Điều kiện công nhận |
| Chặng 1 · Thích nghi | Dò line tự động qua vị trí Checkpoint | **+10** | Toàn bộ xe đi qua hoàn toàn vị trí Checkpoint |
| Chặng 1 · Thích nghi | Dò line tự động hoàn thành quãng đường | **+20** | 2 bánh xe cắt ngang vạch chữ T ở cuối đường line |
| Chặng 2 · Bứt phá | Thu thập 1 cấu kiện Kiến thức (màu đội mình) vào Trạm thành tựu | **+15 / khối** | Quả bóng được đưa vào nằm trọn trong Trạm thành tựu |
| Chặng 2 · Bứt phá | Tranh chấp và đưa cấu kiện Cơ hội vàng vào Trạm thành tựu | **+30 · chỉ số ưu tiên khi hòa điểm** | Quả bóng vàng được đưa vào nằm trọn trong Trạm thành tựu (chỉ Vòng Chung kết xếp hạng) |
| Chặng 3 · Thành công | Vượt Cầu Bản lĩnh | **+10** | Toàn bộ thân xe đi qua được cầu (khi đã có 02 cấu kiện hợp lệ tại Chặng 2) |
| Chặng 3 · Thành công | Vượt Đường Thử thách | **+20** | Toàn bộ thân xe và bánh xe vượt qua hoàn toàn 5 thanh gờ của Đường Thử thách thuộc phần sân đội mình |
| Chặng 3 · Thành công | Đưa cấu kiện Đồ án vượt Dốc Kiên trì đặt lên đế nhỏ trong Ô Bảo vệ Đồ án trên Đài Bảo vệ (dùng càng đẩy, cuộn bóng, tay gắp…) | **+25** | Bóng Đồ án được đưa từ Trạm Thực nghiệm vượt qua Dốc Kiên trì lên Đài Bảo vệ và được đặt vững chắc lên chiếc đế nhỏ của Ô Bảo vệ Đồ án (3.9 Đỏ – 3.10 Xanh) tại góc trên của bậc |
| Chặng 3 · Thành công | Leo Dốc Thăng hoa lên Bục Vinh Quang và thắp sáng Đèn Vinh Quang | **+40 (nhấn trước) / +25 (nhấn sau)** | Cấu kiện Đồ án đã được đặt thành công lên đế nhỏ trong Ô Bảo vệ Đồ án; robot di chuyển từ Đài Bảo vệ leo Dốc Thăng hoa tiến vào Bục Vinh Quang ở trung tâm và nhấn vào nút trên vách ngăn làm Đèn Vinh Quang phát sáng |
| Chặng 3 · Thành công | Chiến thắng tuyệt đối (Tốt nghiệp Xuất sắc) | **Thắng ngay lập tức (theo đủ điều kiện tại Mục VI.3.2)** | Hoàn thành theo trình tự ở Mục VI.3.2 (nếu nhấn đèn trước mà chưa đủ điều kiện theo trình tự thì không đủ điều kiện để tạo ra chiến thắng tuyệt đối) |

### Điểm trừ
| Chặng | Lỗi | Điểm trừ | Điều kiện tính lỗi |
| Chặng 1 · Thích nghi | Mất line | **−5 / lần** | Tất cả bánh xe của robot hoàn toàn ra khỏi đường line đen mà không thể tự phục hồi lộ trình |
| Chặng 1 · Thích nghi | Đâm rào | **−5 / lần** | Robot di chuyển chạm / đâm vào rào chắn trên sân thi đấu |
| Chặng 2 · Bứt phá | Đâm húc phá hoại / Ép khóa cứng robot đối phương | **−10 / lần** | Cố ý lấy đà đâm húc tốc độ cao gây hư hại hoặc dùng cơ chế ép khóa cứng robot đối phương vào vách sân quá 05 giây khi không tranh chấp cấu kiện |
| Chặng 2 · Bứt phá | Rời khỏi khu vực | **−10 / lần** | Robot hoàn toàn ra khỏi khu vực thi đấu của Chặng 2 |
| Chặng 2 · Bứt phá | Húc văng cấu kiện Kiến thức của đối phương ra ngoài sân | **−10 / lần (đặt lại cấu kiện cho đối phương)** | Cố ý đẩy / húc hoặc làm văng cấu kiện Kiến thức của đối phương ra ngoài biên Chặng 2 |
| Chặng 2 · Bứt phá | Tự làm văng cấu kiện | **−5 / lần (cấu kiện được đặt lại vị trí ban đầu)** | Tự làm văng cấu kiện đội mình ra ngoài biên |
| Chặng 2 · Bứt phá | Cố ý tác động cấu kiện trong Trạm thành tựu đối phương | **−20 / lần (phục hồi nguyên trạng cho đối phương)** | Cố ý tác động cấu kiện trong Trạm thành tựu đối phương |
| Chặng 2 · Bứt phá | Cố ý thu thập cấu kiện Cơ hội vàng khi chưa đủ 2 Kiến thức (Chung kết) | **−10 / lần (đặt lại cấu kiện về Bục Cơ hội)** | Chỉ được tranh chấp Cơ hội vàng sau khi có đủ 2 cấu kiện Kiến thức trong Trạm thành tựu |
| Chặng 2 · Bứt phá | Giữ cấu kiện Kiến thức của đối phương | **−10 / lần (đặt lại cấu kiện về vị trí ban đầu)** | Cầm, giữ hoặc mang cấu kiện Kiến thức của đối phương |
| Chặng 2 · Bứt phá | Sang nửa sân đối phương (Vòng loại) | **−15 / lần (bắt buộc retry)** | Ở vòng loại, robot sang nửa sân của đối phương hoặc cản phá đối phương tại Chặng 2 |
| Chặng 3 · Thành công | Chạm vạch giới hạn đoạn đường (Nhiệm vụ 1) | **−5 / lần** | Robot di chuyển chạm vào cạnh giới hạn của đoạn Đường Thử thách |
| Chặng 3 · Thành công | Làm rơi cấu kiện Đồ án (Nhiệm vụ 2) | **−5 / lần (cấu kiện Đồ án được đưa về vị trí ban đầu)** | Mỗi lần làm rơi cấu kiện Đồ án khỏi dốc hoặc khỏi Đài Bảo vệ |
| Chặng 3 · Thành công | Rời khỏi khu vực | **−10 / lần** | Robot ra khỏi khu vực Chặng 3 |
| Chặng 3 · Thành công | Lấn sang sân đối phương | **−15 / lần (bắt buộc retry)** | Robot di chuyển sang phần sân của đối phương tại Chặng 3 |

> Điểm tối đa không tính Chiến thắng tuyệt đối: Chặng 1 30 + Chặng 2 (2 Kiến thức 30 + Cơ hội vàng 30) + Chặng 3 (10 + 20 + 25 + 40 nếu nhấn đèn trước, 25 nếu nhấn sau) = 185 điểm. Vòng loại tối đa 30 + 30 = 60 điểm. Tổng điểm có thể âm.`,
  },
  {
    id: "retry", title: "VII. Quy chế khởi động lại robot (Retry)",
    body: `## 1. Số lần và người gọi retry
- **Không giới hạn** số lần retry trong trận.
- Chỉ người điều khiển chính được hô “RETRY”; **Trọng tài bàn giơ cờ xác nhận** và ghi nhận số lần retry.
- Đồng hồ vẫn chạy khi retry; trong thời gian retry đội được sửa chữa robot.

## 2. Vị trí đặt lại robot
- Gặp sự cố ở chặng nào chỉ được retry ở ô retry của chặng đó hoặc lùi về chặng trước.
- Chặng 1: về khu vực xuất phát, hoặc Checkpoint nếu đã qua. Chặng 2: ô retry Chặng 2 của đội hoặc lùi về Trạm khởi hành chạy lại Chặng 1. Chặng 3: ô retry Chặng 3 của đội.
- Khi retry phải đặt robot đúng vào vị trí ô retry.

## 3. Xử lý cấu kiện và tiến độ
- Chặng 2: bóng đang được giữ hoặc thao tác khi gọi retry bị coi là chưa hoàn thành, Trọng tài đặt lại vị trí ban đầu; **không được mang bóng về ô retry**.
- Chặng 3: đã được ghi điểm Đường Thử thách (+20) rồi gặp sự cố khi đang đẩy Đồ án lên Dốc Kiên trì, retry về ô 3.1 – 3.2 thì điểm Đường Thử thách giữ nguyên; Đồ án đặt lại tại Trạm Thực nghiệm và robot phải vượt lại Đường Thử thách để tiếp tục. Retry khi đang mang Đồ án không bị phạt.
- Mỗi mục điểm cộng chỉ tính **01 lần** trong trận (Kiến thức tính theo từng cấu kiện); đi lại lộ trình sau retry không được cộng thêm.`,
  },
  {
    id: "phat", title: "VIII. Các lỗi vi phạm khác",
    body: `## 1. Lỗi khác trong thi đấu
| Lỗi | Phạt |
| Chạm tay trái phép vào robot khi chưa có hiệu lệnh đồng ý retry của Trọng tài (trừ khi đưa robot lên khu vực đích Chặng 1 sau TIMEOUT) | **−10 / lần** |
| Xuất phát sớm: bật robot trước hiệu lệnh “Bắt đầu” (dừng robot, trả về vị trí ban đầu) | **−5** |
| Cản trở bất hợp pháp tại Cầu Bản lĩnh: cố tình dừng đỗ chiếm giữ cầu quá 10 giây mà không thực hiện thao tác nào, nhằm câu giờ / ngăn chặn đối phương (Trọng tài cưỡng chế lùi xe) | **−15** |
| Xâm phạm Trạm thành tựu: tác động đến cấu kiện bên trong Trạm thành tựu của đối phương (phục hồi nguyên trạng) | **−20** |
| Cố ý đẩy / húc văng cấu kiện Kiến thức của đối phương ra ngoài biên Chặng 2 (Trọng tài đặt lại về vị trí ban đầu) | **−10 / lần** |

## 2. Tước quyền thi đấu trận
- **Cố ý đâm húc phá hủy robot đối phương:** dùng tốc độ cao đâm trực diện làm gãy vỡ linh kiện, đứt dây điện hoặc cháy nổ robot đối phương.
- **Làm hư hỏng nặng kết cấu sa bàn:** đứt gãy rào chắn, sập các bục hoặc xé rách sàn thi đấu.
- **Sử dụng thiết bị cấm:** vũ khí sắc nhọn, keo dính, thiết bị phá sóng vô tuyến.
- Có những hành vi trên nhận **01 lần cảnh cáo** lỗi hành vi; tiếp tục vi phạm sẽ bị Tước quyền thi đấu. Tùy lỗi và mức độ, BTC có thể Tước quyền thi đấu trực tiếp mà không cảnh cáo.`,
  },
  {
    id: "ket-qua", title: "IX. Kết quả trận đấu & khiếu nại",
    body: `### Tiêu chí xác định đội thắng · Vòng loại
1. Ưu tiên 1: Tổng điểm thi đấu cao hơn (cộng tất cả các chặng và trừ điểm phạt).
2. Ưu tiên 2: Thời gian hoàn thành Chặng 1 nhanh hơn (chỉ so 2 đội hoàn thành hợp lệ Chặng 1; đội bị TIMEOUT không được xét tiêu chí này).
3. Ưu tiên 3: Thời gian hoàn thành toàn bộ nội dung vòng loại nhanh hơn.
4. Ưu tiên 4: Số lần retry ít hơn.
5. Biện pháp cuối cùng: nếu tất cả 4 tiêu chí trên hoàn toàn trùng khớp, hai đội bốc thăm trước sự chứng kiến của BTC.

### Tiêu chí xác định đội thắng · Vòng Chung kết xếp hạng
1. Ưu tiên 1: Đội giành chiến thắng tuyệt đối (theo điều kiện ở Mục VI.3.2).
2. Ưu tiên 2: Tổng điểm thi đấu cao hơn (cộng tất cả các chặng và trừ điểm phạt).
3. Ưu tiên 3: Thời gian hoàn thành Chặng 1 nhanh hơn (chỉ so 2 đội hoàn thành hợp lệ Chặng 1; đội bị TIMEOUT không được xét tiêu chí này).
4. Ưu tiên 4: Tiến độ hoàn thành thử thách tại Chặng 3 cao hơn (Đèn Vinh Quang > Dốc Thăng hoa > hoàn thành Bảo vệ Đồ án > Dốc Kiên trì > Trạm Thực nghiệm > Đường Thử thách > Cầu Bản lĩnh).
5. Ưu tiên 5: Đội lấy được cấu kiện Cơ hội vàng về Trạm thành tựu.
6. Ưu tiên 6: Số lần retry ít hơn trong trận đấu.
7. Biện pháp cuối cùng: nếu tất cả 6 tiêu chí trên hoàn toàn trùng khớp, hai đội bốc thăm trước sự chứng kiến của BTC.
> Tổng điểm của đội trong trận đấu có thể là số âm.

## Điều khoản khiếu nại
- Chỉ tiếp nhận **trong vòng 03 phút** kể từ khi có kết quả và trước khi ký biên bản; sau đó mọi khiếu nại vô giá trị.
- Chỉ 01 người đại diện được khiếu nại với Tổ trọng tài; thành viên khác, phụ huynh, khóa trên, cổ động viên không được can thiệp. Gây áp lực tập thể bị xử thua ngay.
- BTC chỉ dùng camera giám sát sa bàn do BTC đặt; video điện thoại của khán giả chỉ để tham khảo.
- Quyết định cuối cùng thuộc về BTC và Tổ trọng tài; các đội bắt buộc chấp hành.`,
  },
  {
    id: "tap-huan", title: "X. Tập huấn kỹ thuật",
    body: `Giúp Tân sinh viên chưa nhiều kinh nghiệm lập trình và chế tạo tự tin hoàn thiện robot đạt chuẩn. Đối tượng: **tất cả sinh viên đã đăng ký tham dự cuộc thi**.

[[tap-huan]]

### Quyền lợi khi tham gia
- Được BTC hỗ trợ kỹ thuật xuyên suốt quá trình làm robot.
- Được gặp gỡ và giải đáp thắc mắc trực tiếp từ BTC.

!! Lưu ý: mỗi đội có ít nhất 01 sinh viên tham gia tập huấn.`,
  },
  {
    id: "giai", title: "Giải thưởng & chạy thử sa bàn",
    body: `[[bang-giai-thuong]]

Tất cả thành viên của 16 đội lọt vào Chung kết xếp hạng được cấp Giấy chứng nhận.

**Chạy thử sa bàn:** trên sa bàn thật trước ngày thi 1 tuần; mỗi khung giờ chỉ 1 đội — [đăng ký lịch chạy thử](/team/practice).`,
  },
];

// Các tab Thể lệ trên trang chủ (tab Quy chuẩn robot dùng thêm bảng thông số ở mục Thể lệ & tài liệu)
export const HOME_RULE_TABS = [
  {
    label: "Chặng 1 · Thích nghi", title: "Thích nghi – Dò line tự hành",
    body: `Mỗi đội một làn line riêng rộng 900 mm dọc hai mép sa bàn. Robot xuất phát từ Trạm khởi hành 310 × 260 mm, bám line đen rộng 20 mm qua Đường Danh vọng thẳng 1800 mm tới Checkpoint, rồi vượt Đường Thách thức ziczac 45° dài 2040 mm về vạch chữ T.

- **Tự hành 100%:** chỉ ấn nút khởi động một lần, tay cầm đặt xuống đất suốt Chặng 1; về đích xong robot tự chuyển sang điều khiển từ xa.
- **Mất line / chạm rào chắn:** −5đ mỗi lần. Xuất phát sớm: −5đ.
- **Retry:** chưa qua Checkpoint thì về Trạm khởi hành; đã qua Checkpoint thì đặt lại tại Checkpoint.
- **Giới hạn 60 giây (TIMEOUT):** chưa về đích thì 01 thành viên nhấc robot đưa tới khu vực đích Chặng 1 để thi Chặng 2 (mất +20 về đích, giữ +10 Checkpoint nếu đã qua).
- **Thời gian về đích** được ghi lại để xét phụ khi hòa điểm (đội TIMEOUT không được xét tiêu chí này).`,
    facts: "Checkpoint | +10đ\nVề đích | +20đ",
  },
  {
    label: "Chặng 2 · Bứt phá", title: "Bứt phá – Tranh chấp cấu kiện",
    body: `Được điều khiển từ xa. Mỗi đội có 2 Cấu kiện Kiến thức là bóng pickleball Ø74 mm màu đội mình; robot dùng cơ cấu tự chọn (càng đẩy, con lăn, tay gắp…) đưa bóng vượt gờ vào Trạm thành tựu 300 × 300 mm.

- **Tranh chấp:** bóng ngoài trạm được tranh chấp; bóng nằm trọn trong trạm là bất khả xâm phạm.
- **Cơ hội vàng:** chỉ ở Vòng Chung kết xếp hạng, sau khi đủ 2 Kiến thức, đội mới được đưa bóng Cơ hội vàng trên Bục Cơ hội về trạm.
- **Sang Chặng 3:** cần ≥ 2 Kiến thức trong trạm.

### Lỗi phạt
- Đâm húc phá hoại hoặc ép khóa cứng robot đối phương vào vách sân quá 5 giây khi không tranh chấp cấu kiện: **−10đ**/lần.
- Ra khỏi khu vực Chặng 2: **−10đ** (đi qua Cầu khi đã đủ điều kiện lên Chặng 3 không tính).
- Cố ý húc văng bóng Kiến thức của đối phương ra ngoài sân: **−10đ**/lần (đặt lại bóng); tự làm văng bóng đội mình: **−5đ**/lần (đặt lại bóng).
- Tác động bóng trong trạm đối thủ: **−20đ**/lần.
- Cố ý thu thập bóng vàng khi chưa đủ 2 Kiến thức: **−10đ**/lần.
- Được chặn đường, nhưng cầm/giữ bóng Kiến thức của đối phương: **−10đ**/lần.
- Vòng loại sang nửa sân đối phương: **−15đ** và Retry.`,
    facts: "Kiến thức | +15đ / bóng\nCơ hội vàng | +30đ",
  },
  {
    label: "Chặng 3 · Thành công", title: "Thành công – Bảo vệ Đồ án",
    body: `Qua Cầu Bản lĩnh, mỗi đội thi trên nửa sân riêng và hoàn thành lần lượt các thử thách:

- **Đường Thử thách:** vượt 5 thanh gờ ống PVC cao 15 mm.
- **Bảo vệ Đồ án:** đưa bóng Đồ án Ø74 mm từ Trạm Thực nghiệm lên Dốc Kiên trì (10°), đặt vững trên đế nhỏ trong Ô Bảo vệ 120 × 120 mm trên Đài cao 100 mm.
- **Đèn Vinh Quang:** leo Dốc Thăng hoa lên Bục Vinh Quang 200 mm, nhấn nút Đèn trên vách ngăn (đội nhấn trước +40đ, nhấn sau +25đ).
- **Lỗi phạt:** chạm vạch giới hạn Đường Thử thách hoặc làm rơi Đồ án: −5đ/lần; ra khỏi khu vực: −10đ; lấn sang sân đối phương: −15đ và Retry.

**CHIẾN THẮNG TUYỆT ĐỐI (Chung kết):** hoàn thành đúng trình tự 2 Kiến thức + Cơ hội vàng → Cầu → Đường Thử thách → Đồ án trên đế → Dốc Thăng hoa → nhấn sáng Đèn Vinh Quang thì thắng ngay, trận kết thúc. Nhấn đèn khi chưa đủ trình tự không tạo ra Chiến thắng tuyệt đối.`,
    facts: "Cầu Bản lĩnh | +10đ\nĐường Thử thách | +20đ\nBảo vệ Đồ án | +25đ\nĐèn Vinh Quang | +40đ / +25đ",
  },
];

export const HOME_SPECS_TAB = {
  label: "Quy chuẩn robot", title: "Quy chuẩn kỹ thuật robot",
  body: `- **Kiểm định:** tại bàn kỹ thuật (quét QR đội) trước mỗi trận, không tính vào thời gian chuẩn bị (Bo3 chỉ kiểm định ván đầu).
- **Không đạt:** thua trận, không có thời gian sửa.
- **Robot dự phòng:** được dùng nếu robot đó cũng đạt kiểm định.
- **Cấm:** vũ khí, thiết bị gây nhiễu, chất lỏng.
- **Cơ cấu thu thập:** tự do (càng đẩy, con lăn, tay gắp, ngàm kẹp…); bề mặt tiếp xúc bóng và nút đèn phải mềm.`,
};

export const PRIVACY_DOC = `## Dữ liệu chúng tôi thu thập
- Từ tài khoản Google @${STUDENT_DOMAIN}: địa chỉ email, họ tên và ảnh đại diện — chỉ để xác thực bạn là sinh viên HCMUTE.
- Thông tin đội do đội trưởng khai báo: tên đội, ngành; họ tên, MSSV, email trường và số điện thoại (không bắt buộc) của các thành viên.
- Ảnh chân dung rõ mặt của từng thành viên do đội trưởng tải lên — chỉ thành viên trong đội và BTC xem được, dùng để đối chiếu khi điểm danh.
- Kết quả thi đấu, lịch thử sa bàn và khiếu nại phát sinh trong giải.

## Mục đích sử dụng
- Xác thực người dùng, xét duyệt hồ sơ, cấp mã QR check-in và liên hệ các đội về lịch thi.
- Hiển thị công khai tên đội, ngành và kết quả thi đấu trên website, màn hình sân khấu và livestream.
- Chúng tôi không bán, không chia sẻ dữ liệu cá nhân cho bên thứ ba và không dùng cho mục đích quảng cáo.

## Lưu trữ & bảo mật
- Dữ liệu lưu trên Supabase (PostgreSQL) với chính sách phân quyền theo từng dòng: bạn chỉ xem được đội của mình; chỉ BTC xem toàn bộ hồ sơ.
- Dữ liệu được giữ đến hết mùa giải và xóa hoặc ẩn danh hóa trong vòng 6 tháng sau khi giải kết thúc.

## Quyền của bạn
- Đội trưởng có thể sửa hoặc rút hồ sơ khi đội chưa được duyệt; thành viên có thể rời đội ngay trên trang Đội của tôi.
- Bạn có thể yêu cầu BTC xóa dữ liệu của mình bất kỳ lúc nào qua kênh liên hệ của Khoa Cơ khí.`;

export const PRIVACY_FOOTER = `Cập nhật lần cuối: 24/10/2026 · ${SITE.faculty}`;
