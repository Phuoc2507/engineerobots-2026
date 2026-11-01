# BÀN GIAO — Web FME JOURNEY 2026 (01/11/2026)

Tài liệu dành cho người và Claude trên máy mới. Đọc hết trước khi làm tiếp.
Bàn giao phần video/CAD xem `E:\erobot\BAN_GIAO_VIDEO_2026-10-31.md` (file đó không nằm trong git, phải chép tay).

---

## 1. Hệ thống đang chạy (không phụ thuộc máy)

| Thành phần | Địa chỉ |
|---|---|
| Web công khai | https://fme-journey-2026.vercel.app |
| Mã nguồn | GitHub `Phuoc2507/engineerobots-2026`, nhánh `main` (Vercel tự deploy mỗi lần push) |
| Cơ sở dữ liệu | Supabase project `vtfwdksfdphcpsdxanhr`; migration mới nhất `0030_member_id_constraint` |
| Biến môi trường máy chủ (Google, email, service account…) | Nằm trên Vercel → Project Settings → Environment Variables, **không** ở máy |

Tất cả nằm trên mây, nên máy mới chỉ cần clone repo là làm tiếp được.

---

## 2. Đã làm trong đợt này (đã push)

| Commit | Nội dung |
|---|---|
| `ad00c9a`, `1562c57` | Nhóm Zalo cuộc thi (`CONTACT.zaloGroup`, QR `public/images/zalo-group.png`). **Chỉ** hiện ở trang đội và email duyệt, không có ở chân trang công khai. |
| `42353d5` | Đoạn giới thiệu mới; chia Chặng 2, Chặng 3 và Quy chuẩn robot thành gạch đầu dòng (`RulesTabs.tsx`). |
| `3197b86` | Nhận diện trình duyệt trong Zalo/Facebook (Google chặn đăng nhập ở đó): hiện nút "Mở bằng Chrome" và "Sao chép link" (`GoogleSignIn.tsx`). |
| `22517b2` | Hướng dẫn mở tab ẩn danh khi Android báo "Không thiết lập được thiết bị" (do chính sách quản lý thiết bị của Workspace trường). |
| `73e12ea` | Tài khoản thử nghiệm BTC; ô vàng "Khuyến khích dùng laptop" ở trang đăng ký. |
| `1b3f077` | Nới ràng buộc bảng `team_members`: MSSV chỉ cần 8 số (luật K26 vẫn do `_validate_team` kiểm tra). |

### Tài khoản thử nghiệm
- `25134107@student.hcmute.edu.vn` được đăng ký và quản lý đội dù không phải K26. Thành viên trong đội đó được dùng MSSV/email khóa khác.
- Danh sách nằm ở **hai nơi, phải sửa cùng lúc**: `TEST_ACCOUNTS` trong `src/lib/site.ts` và hàm `public.is_test_account()` (migration `0029_test_account.sql`).
- **Trước ngày thi:** xóa đội thử nghiệm ở `/admin`.

### Quyết định đã chốt với người dùng
- Hồ sơ vẫn **chờ BTC duyệt** (đã bỏ ý "gửi là duyệt luôn").
- **Giữ QR check-in**: BTC quét để mở hồ sơ đội ở trang check-in admin và kiểm tra robot ở bàn kỹ thuật.
- Nhóm Zalo không công khai, chỉ cho đội đã đăng ký.

---

## 3. Chưa kiểm tra / còn mở
- Chưa đăng nhập thật bằng điện thoại để thử luồng Zalo/Facebook → Chrome và tab ẩn danh.
- Đội của tài khoản thử nghiệm chưa được lưu. Người dùng cần bấm "Gửi đăng ký" lại sau bản sửa `1b3f077`.

---

## 4. Chuyển gì sang máy mới

**Không cần chép** (đã có trên GitHub, Supabase hoặc Vercel): toàn bộ mã web, migration, ảnh trong `public/`.

**Cần làm trên máy mới:**
1. `git clone https://github.com/Phuoc2507/engineerobots-2026.git web`, rồi `npm install`.
2. Tạo `web/.env.local` gồm 2 biến `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Có thể chép file cũ, hoặc lấy ở Supabase → Project Settings → API. Đây là khóa công khai, nhưng vẫn không đưa lên git.
3. Đăng nhập lại GitHub (để push), Vercel và Supabase (kết nối MCP trong Claude) nếu muốn Claude thao tác trực tiếp.
4. Tạo `.claude/launch.json` với cấu hình `web` (`npm run dev`, cổng 3000) nếu muốn xem trước trong app.

**Nên chép tay từ `E:\erobot\`** (không nằm trong git):
- `BAN_GIAO_VIDEO_2026-10-31.md`, `00_HUONG_DAN_CHO_AI_TIEP_NHAN.md`
- `thele/` (thể lệ chính thức), `cad/`, `01_…` đến `05_…`: nhỏ, nên chép.
- `blender/` (~600 MB), `video_thele/` (~8 GB): chỉ chép nếu làm tiếp video hoặc 3D.
- Bộ nhớ của Claude: `C:\Users\Admin\.claude\projects\E--erobot\memory\` (chép sang thư mục tương ứng trên máy mới nếu đường dẫn dự án giống nhau) và `C:\Users\Admin\.claude\CLAUDE.md` (quy tắc trả lời tiếng Việt kèm dòng 🔊).

---

## 5. Quy tắc làm việc với Claude (giữ nguyên)
- Trả lời tiếng Việt; cuối mỗi câu trả lời có dòng 🔊 tóm tắt thuần Việt (xem `CLAUDE.md`).
- Không hỏi hay in Google Client Secret, token GitHub; khi push thì lọc dòng chứa token.
- Không đọc `GOOGLE_SERVICE_ACCOUNT_JSON`; không đổi cài đặt bảo mật hay đăng nhập của Supabase.
- Người dùng tự mua hàng; hỏi trước khi cài skill hoặc repo ngoài.
- Commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Sửa schema thì vừa áp dụng lên Supabase, vừa lưu file `supabase/migrations/00NN_*.sql` (số tiếp theo là `0031`).
