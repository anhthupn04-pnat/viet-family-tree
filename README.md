# Gia Phả Việt — VietFamilyTree

Hệ thống quản lý gia phả dòng họ toàn diện bằng tiếng Việt, hỗ trợ cây gia phả tương tác đa thế hệ, tra cứu quan hệ họ hàng & danh xưng chuẩn mực, lịch âm và ngày giỗ truyền thống, quản lý quỹ dòng tộc minh bạch và bảo mật phân quyền.

---

## 🌟 Tính Năng Nổi Bật

1. **Phân Quyền Vai Trò Linh Hoạt & Chuyển Đổi Giao Diện Khách ⇄ Admin**:
   - **Giao diện Khách**: Xem thông tin phả hệ công khai, khám phá cây gia phả trực quan, tra cứu xưng hô, theo dõi lịch giỗ và gửi đề xuất cập nhật kèm nguồn tư liệu.
   - **Giao diện Quản Trị Viên (Admin)**: Toàn quyền quản trị, tạo và điều chỉnh các chi nhánh (hệ thống khởi tạo sẵn **1-4 chi mẫu ban đầu**), thêm/sửa/xóa hồ sơ thành viên, phê duyệt đề xuất thay đổi, quản lý quỹ và kiểm tra nhật ký hoạt động (Audit Logs).
   - **Tài khoản Quản trị mẫu**:
     - Email: `anhthuphan0102@gmail.com`
     - Mật khẩu: `010204`
     - Quyền: `ADMIN`
2. **Cây Gia Phả Tương Tác**:
   - Hỗ trợ phóng to, thu nhỏ, kéo thả, căn giữa, lọc theo chi nhánh/đời thứ/giới tính.
   - Phân biệt người còn sống và đã khuất, đời thứ, thông tin mộ phần.
   - Ngăn chặn triệt để chu trình huyết thống (Cycle Prevention).
3. **Tra Cứu Xưng Hô Họ Hàng Chuẩn Mực**:
   - Thuật toán tìm tổ tiên chung gần nhất (LCA - Lowest Common Ancestor).
   - Xác định vai vế bề trên/bề dưới theo thứ bậc thế hệ bất kể tuổi tác ("Bé bằng hạt kê nhưng vai vế bề trên vẫn là Anh/Chú").
4. **Lịch Âm & Ngày Giỗ Tổ**:
   - Chuyển đổi chính xác Dương lịch sang Âm lịch (Múi giờ `Asia/Ho_Chi_Minh` UTC+7).
   - Đếm ngược ngày giỗ sắp tới, nhắc nhở hiếu kính tổ tiên.
5. **Thư Viện Tư Liệu Cổ & Lịch Sử Dòng Họ**:
   - Số hóa gia phả chữ Hán - Nôm, văn bia từ đường, sắc phong triều Nguyễn.
6. **Quỹ Dòng Họ & Khuyến Học**:
   - Báo cáo thu/chi minh bạch theo thời gian thực (Quỹ xây dựng, Khuyến học, Tương trợ).
7. **Quy Trình Xác Minh & Thẩm Định**:
   - Cơ chế đề xuất chỉnh sửa yêu cầu ghi rõ lý do và nguồn tư liệu minh chứng để Admin phê duyệt.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Route Handlers (Server Actions/REST API).
- **Database & ORM**: SQLite (môi trường dev cục bộ zero-config) / PostgreSQL (Supabase/Neon cho production), Prisma ORM v6.
- **Bảo mật**: Bcrypt băm mật khẩu, Cycle-detection trên cây huyết thống, RLS-ready schema, Server-side role checks.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Yêu cầu môi trường
- Node.js version 18.18+ hoặc 20+
- Trình quản lý gói npm

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Khởi tạo Database & Seed Dữ Liệu
```bash
# Đẩy schema vào database
npm run db:push

# Khởi tạo dữ liệu mẫu (Clan, 4 chi họ mẫu, 5 thế hệ, tài khoản Admin)
npm run db:seed
```

### 4. Chạy môi trường phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 📋 Tài Khoản Thử Nghiệm

| Vai trò | Email | Mật khẩu | Chức năng chính |
|---|---|---|---|
| **Tổng Quản Trị (Admin)** | `anhthuphan0102@gmail.com` | `010204` | Toàn quyền tạo chi nhánh (khi ban đầu có 1-4 chi mẫu), thêm/sửa/xóa thành viên, duyệt đề xuất, quản lý quỹ |
| **Trưởng Chi 1** | `truongchi1@giaphaviet.vn` | `123456` | Quản lý chi nhánh phụ trách |
| **Thành viên Dòng họ** | `thanhvien@giaphaviet.vn` | `123456` | Xem chi tiết thông tin nội bộ, gửi đề xuất cập nhật |
| **Khách Thăm Quan** | `guest@giaphaviet.vn` | — | Xem thông tin công khai, gửi đề xuất thẩm định |

---

## 📂 Tài Liệu Chi Tiết Dự Án

- [Kế hoạch & Tiến độ dự án](docs/PROJECT_PLAN.md)
- [Kiến trúc hệ thống](docs/ARCHITECTURE.md)
- [Mô hình dữ liệu quan hệ (ERD)](docs/DATABASE_ERD.md)
- [Chi tiết Schema Database & Indexes](docs/DATABASE_SCHEMA.md)
- [Bảo mật & Phân quyền RBAC](docs/SECURITY.md)
- [Hướng dẫn triển khai Vercel](docs/DEPLOYMENT_VERCEL.md)
- [Hướng dẫn thiết lập GitHub](docs/GITHUB_SETUP.md)
- [Quy trình Sao lưu & Phục hồi](docs/BACKUP_RESTORE.md)
- [Báo cáo Kiểm thử](docs/TEST_REPORT.md)
