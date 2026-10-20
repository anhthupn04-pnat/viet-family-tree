# Hướng Dẫn Triển Khai Vercel & Production Database — VietFamilyTree

## 1. Chuẩn Bị Database Production (Supabase hoặc Neon)

Hệ thống mã nguồn Prisma hỗ trợ chuyển đổi mượt mà từ SQLite sang PostgreSQL trên Supabase hoặc Neon:

### Bước 1: Tạo Database PostgreSQL trên Supabase / Neon
1. Đăng ký tài khoản miễn phí tại [supabase.com](https://supabase.com) hoặc [neon.tech](https://neon.tech).
2. Tạo project mới (ví dụ đặt tên: `viet-family-tree`).
3. Lấy chuỗi kết nối `DATABASE_URL` dạng:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
   ```
   Nếu dùng Supabase có Transaction Pooler, lấy thêm biến `DIRECT_URL`:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Bước 2: Cập Nhật `prisma/schema.prisma` cho Production
Chuyển provider sang `postgresql`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 2. Triển Khai Lên Vercel

### Bước 1: Đẩy mã nguồn lên GitHub Repository
Đảm bảo đã tạo repository trên GitHub và đẩy toàn bộ mã nguồn lên branch `main`.

### Bước 2: Nhập Project trên Vercel
1. Truy cập [vercel.com](https://vercel.com) và chọn **"Add New..."** -> **"Project"**.
2. Chọn repository `viet-family-tree` từ danh sách GitHub.
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.

### Bước 3: Cấu Hình Biến Môi Trường (Environment Variables)
Tại mục **Environment Variables** trên Vercel Dashboard, thêm các biến:
- `DATABASE_URL`: Đường dẫn kết nối PostgreSQL production.
- `DIRECT_URL`: Đường dẫn kết nối trực tiếp PostgreSQL (nếu dùng Supabase).
- `NEXTAUTH_SECRET`: Khóa bí mật sinh ngẫu nhiên cho JWT session.
- `NEXT_PUBLIC_APP_URL`: URL chính thức của Vercel (ví dụ: `https://viet-family-tree.vercel.app`).

### Bước 4: Chạy Migration & Seed trên Production
Sau khi Vercel Build thành công hoặc qua terminal cục bộ kết nối production:
```bash
npx prisma db push
node prisma/seed.js
```
Lệnh seed sẽ tự động tạo tài khoản quản trị `anhthuphan0102@gmail.com` (mật khẩu: `010204`) cùng 4 chi họ mẫu ban đầu và gia phả 5 thế hệ.

### Bước 5: Kiểm Tra URL Production
Mở trình duyệt truy cập:
`https://<ten-du-an>.vercel.app`
Kiểm tra đăng nhập Admin, xem cây phả hệ, đổi giao diện Khách ⇄ Admin và thêm chi nhánh mới.
