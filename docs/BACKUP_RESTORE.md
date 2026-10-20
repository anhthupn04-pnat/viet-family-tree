# Kế Hoạch Sao Lưu & Phục Hồi Dữ Liệu (Backup & Restore) — VietFamilyTree

## 1. Tầm Quan Trọng Của Dữ Liệu Gia Phả
Gia phả là tài sản phi vật thể thiêng liêng và trường tồn của dòng họ qua nhiều thế hệ. Dữ liệu gia phả cần được sao lưu định kỳ, độc lập với mã nguồn website và máy chủ triển khai.

## 2. Chiến Lược Sao Lưu (Backup Strategy)

### A. Môi Trường Local (SQLite)
Tệp cơ sở dữ liệu nằm tại `prisma/dev.db`.
- **Sao lưu nhanh**:
  ```bash
  # Windows PowerShell
  Copy-Item prisma/dev.db "backups/dev_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
  ```

### B. Môi Trường Production (PostgreSQL trên Supabase / Neon)
1. **Tính năng Point-In-Time Recovery (PITR) & Automated Daily Backup**:
   - Supabase và Neon tự động chụp snapshot hàng ngày và hỗ trợ khôi phục về từng thời điểm trong quá khứ.
2. **Sao lưu thủ công bằng `pg_dump`**:
   Người quản trị có thể chủ động tải toàn bộ database về lưu trữ ngoại tuyến (Cold Storage):
   ```bash
   pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -F c -b -v -f "giaphaviet_backup_$(date +%Y%m%d).dump"
   ```
3. **Sao lưu ảnh và tư liệu số hóa**:
   - Ảnh đại diện, ảnh nhà thờ họ và tài liệu scan văn bia được lưu trữ trên Object Storage (Supabase Storage / Cloudflare R2 / AWS S3) với cấu hình phiên bản (Versioning) chống ghi đè hoặc vô tình xóa nhầm.

## 3. Quy Trình Phục Hồi Dữ Liệu (Restore Procedure)

### Phục hồi vào môi trường thử nghiệm (Staging)
Trước khi ghi đè vào hệ thống chính, luôn phục hồi file backup vào database thử nghiệm để xác minh tính toàn vẹn:
```bash
pg_restore -d "postgresql://postgres:[PASSWORD]@[STAGING-HOST]:5432/postgres" -v "giaphaviet_backup.dump"
```

### Kiểm tra tính toàn vẹn sau khi khôi phục:
1. Số lượng thành viên có khớp với thống kê gần nhất không (`SELECT COUNT(*) FROM "MemberProfile"`).
2. Các quan hệ cha mẹ, hôn phối và chi nhánh có đầy đủ không.
3. Tài khoản quản trị `anhthuphan0102@gmail.com` có đăng nhập bình thường không.
