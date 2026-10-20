# Hướng Dẫn Thiết Lập Git & Đẩy Lên GitHub — VietFamilyTree

## 1. Trạng Thái Git Cục Bộ
Repository cục bộ đã được khởi tạo và cấu hình `.gitignore` an toàn, loại trừ hoàn toàn các tệp nhạy cảm (`.env`, `dev.db`, `node_modules`, `.next`, `build output`).

## 2. Quy Trình Commit & Đẩy Lên GitHub

### Bước 1: Kiểm tra trạng thái Git
```bash
git status
```

### Bước 2: Thêm các tệp và tạo commit ban đầu
```bash
git add .
git commit -m "feat: Khoi tao du an Gia Pha Viet - VietFamilyTree v1.0 voi phan quyen Admin/Khach va 4 chi ho mau"
```

### Bước 3: Đặt nhánh chính là `main`
```bash
git branch -M main
```

### Bước 4: Tạo Repository trên GitHub
1. Đăng nhập [github.com](https://github.com).
2. Tạo repository mới đặt tên là `viet-family-tree` (Khuyến nghị để chế độ **Private** trong giai đoạn đầu).
3. Không chọn "Initialize this repository with a README" vì dự án đã có sẵn README.

### Bước 5: Thêm Remote và Push
```bash
# Thay thế USERNAME bằng tên tài khoản GitHub của bạn
git remote add origin https://github.com/USERNAME/viet-family-tree.git
git push -u origin main
```

## 3. Nếu Sử Dụng GitHub CLI (`gh`)
Nếu máy tính của bạn đã cài đặt `gh` và đăng nhập:
```bash
gh repo create viet-family-tree --private --source=. --remote=origin --push
```
Lệnh trên sẽ tự động tạo repository private trên GitHub và đẩy toàn bộ mã nguồn lên branch `main`.
