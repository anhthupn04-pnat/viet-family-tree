# Kế Hoạch & Tiến Độ Dự Án — VietFamilyTree

## 1. Mục Tiêu Dự Án
Xây dựng nền tảng website quản lý gia phả dòng họ toàn diện cho người Việt, bảo đảm khả năng mở rộng hàng trăm nghìn hồ sơ, tương tác cây gia phả mượt mà, phân quyền chặt chẽ giữa khách tham quan và ban quản trị dòng họ.

## 2. Các Giai Đoạn Triển Khai (Roadmap)

### Giai Đoạn 1: Khởi Tạo Nền Tảng & Thiết Kế Kiến Trúc
- [x] Thiết lập cấu trúc dự án Next.js 15 App Router, TypeScript, Tailwind CSS.
- [x] Thiết kế mô hình dữ liệu quan hệ chuẩn hóa đa dòng họ, đa chi nhánh trên Prisma ORM.
- [x] Tạo cơ chế phòng chống chu trình huyết thống (Cycle Detection Algorithm).
- [x] Cấu hình môi trường `.env`, `.env.example`, `.gitignore`.

### Giai Đoạn 2: MVP Hoạt Động Thực Tế & Tài Khoản Quản Trị
- [x] Khởi tạo tài khoản quản trị tối cao: `anhthuphan0102@gmail.com` (mật khẩu: `010204`).
- [x] Khởi tạo **1 - 4 chi nhánh mẫu ban đầu**:
  - Chi 1: Chi Trưởng (Tiền Giang) — trông coi từ đường
  - Chi 2: Chi Giáp (Hậu Giang) — phát triển kinh thương
  - Chi 3: Chi Ất (Tây Đô) — tập trung khoa cử, học vấn
  - Chi 4: Chi Bính (Thăng Long) — đóng góp quỹ dòng tộc
- [x] Xây dựng giao diện chuyển đổi linh hoạt: **Giao diện Khách ⇄ Giao diện Admin**.
- [x] Quản lý cây gia phả tương tác kết nối dữ liệu thật (5 thế hệ liên kết cha mẹ, con cái, hôn phối).
- [x] Bộ lọc thông minh theo chi họ, thế hệ (đời thứ), giới tính và tình trạng sinh/tử.
- [x] Seed dữ liệu mẫu chân thực mang đậm bản sắc văn hóa gia đình Việt Nam.

### Giai Đoạn 3: Nghiệp Vụ Mở Rộng
- [x] Lịch Âm truyền thống & Lịch Giỗ tổ tiên: Chuyển đổi thiên văn Dương lịch sang Âm lịch kèm đếm ngược ngày giỗ.
- [x] Thư viện tư liệu văn bia: Số hóa gia phả chữ Nôm, văn bia, sắc phong, hình ảnh nhà thờ họ.
- [x] Quỹ dòng họ & Quỹ khuyến học: Thu chi minh bạch theo thời gian thực.
- [x] Quy trình xác minh & thẩm định: Thành viên và Khách có thể gửi đề xuất thay đổi kèm bằng chứng; Admin xét duyệt trực tiếp.
- [x] Nhật ký hệ thống (Audit Logs): Ghi nhận toàn bộ thao tác thêm, sửa, xóa, duyệt.

### Giai Đoạn 4: Chức Năng Nâng Cao
- [x] Tra cứu xưng hô họ hàng chuẩn mực: Thuật toán tìm tổ tiên chung gần nhất (LCA), tính toán bậc quan hệ và danh xưng gọi nhau theo vai vế chi phái.
- [x] Cơ chế ngăn chặn chu trình huyết thống và bảo vệ quan hệ gia phả không để xảy ra trường hợp con làm cha hoặc xóa hồ sơ còn con cái phụ thuộc.

### Giai Đoạn 5: Kiểm Thử, Git & Đóng Gói Triển Khai
- [x] Typecheck với TypeScript không lỗi (`npx tsc --noEmit`).
- [x] Build production Next.js thành công 100% (`npm run build`).
- [x] Khởi tạo Git repository và chuẩn bị tài liệu triển khai Vercel & Supabase/Neon.
