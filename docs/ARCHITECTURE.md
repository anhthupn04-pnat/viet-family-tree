# Kiến Trúc Hệ Thống — VietFamilyTree

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

VietFamilyTree được xây dựng theo mô hình kiến trúc phân tầng hiện đại (Clean Layered Architecture) trên nền tảng Next.js Fullstack (App Router):

```
+------------------------------------------------------------------+
|                    TRÌNH DUYỆT NGƯỜI DÙNG                        |
|  [Giao Diện Khách (Public)]   <---->   [Giao Diện Quản Trị (Admin)]|
+------------------------------------------------------------------+
                                  |
                                  v
+------------------------------------------------------------------+
|               PRESENTATION LAYER (Next.js React 19)              |
|  - FamilyTreeCanvas (Đồ thị tương tác, Pan/Zoom, Lọc chi nhánh)   |
|  - BranchManagementView (Quản lý 1-4 chi mẫu & tạo chi mới)       |
|  - KinshipCalculatorModal (Tra cứu xưng hô theo vai vế họ hàng)   |
|  - AnniversariesView (Lịch âm, nhắc giỗ, sự kiện dòng tộc)       |
|  - FundsView (Minh bạch quỹ dòng họ & quỹ khuyến học)            |
|  - AdminView (Duyệt đề xuất xác minh, Xem audit logs)            |
+------------------------------------------------------------------+
                                  |
                                  v
+------------------------------------------------------------------+
|            SERVER & API LAYER (Next.js Route Handlers)           |
|  - /api/auth/login        : Xác thực đăng nhập Bcrypt            |
|  - /api/branches          : CRUD chi nhánh & kiểm tra số thứ tự  |
|  - /api/members           : CRUD hồ sơ, Cycle Prevention logic   |
|  - /api/tree              : Thuật toán nạp cây phả hệ đa thế hệ  |
|  - /api/kinship           : Thuật toán LCA tìm tổ tiên chung      |
|  - /api/change-requests   : Quy trình đề xuất & duyệt gia phả    |
|  - /api/audit-logs        : Ghi vết bảo mật & hoạt động          |
+------------------------------------------------------------------+
                                  |
                                  v
+------------------------------------------------------------------+
|             BUSINESS LOGIC & DOMAIN ENGINES (lib/)               |
|  - lib/kinship.ts : Thuật toán Lowest Common Ancestor & Danh xưng |
|  - lib/lunar.ts   : Thuật toán thiên văn chuyển đổi Lịch Âm      |
|  - lib/auth.ts    : Quản lý session, role ADMIN / GUEST          |
+------------------------------------------------------------------+
                                  |
                                  v
+------------------------------------------------------------------+
|                     DATA ACCESS LAYER (Prisma)                   |
|  - Prisma Client ORM v6 (Type-safe query builder)                |
|  - Ràng buộc quan hệ: Father, Mother, Marriages, Cascade delete   |
+------------------------------------------------------------------+
                                  |
                                  v
+------------------------------------------------------------------+
|                    DATABASE STORAGE LAYER                        |
|  - Development: SQLite (dev.db) - zero setup                     |
|  - Production: PostgreSQL (Supabase / Neon)                      |
+------------------------------------------------------------------+
```

## 2. Các Quyết Định Kiến Trúc Trọng Tâm

1. **Tách biệt Tài khoản người dùng (`User`) và Hồ sơ phả hệ (`MemberProfile`)**:
   - Không bắt buộc mọi thành viên quá vãng hoặc con cháu nhỏ tuổi phải có tài khoản đăng nhập.
   - Một tài khoản quản trị có thể quản lý hàng nghìn hồ sơ mà không tạo rác dữ liệu đăng nhập.

2. **Cơ chế Phân quyền & Chuyển đổi Giao diện**:
   - Khách vãng lai truy cập chế độ xem công khai (`GUEST`), không thể xóa hoặc sửa trực tiếp mà phải thông qua quy trình đề xuất kèm bằng chứng.
   - Tài khoản `anhthuphan0102@gmail.com` giữ quyền `ADMIN`, kiểm soát toàn quyền hệ thống.

3. **Thiết kế Cây Phả Hệ Tải Theo Nhánh (Scalable Tree Rendering)**:
   - Thay vì tải 100.000 bản ghi cùng lúc làm nghẽn DOM, API `/api/tree` hỗ trợ lọc theo từng `branchId` (kèm đời Khởi Tổ) giúp render mượt mà ngay cả trên thiết bị di động.
