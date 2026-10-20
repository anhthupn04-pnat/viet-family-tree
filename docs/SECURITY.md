# Mô Hình Bảo Mật & Phân Quyền (RBAC) — VietFamilyTree

## 1. Các Vai Trò Trong Hệ Thống (Role-Based Access Control)

| Vai trò | Phạm vi quyền hạn | Giao diện tương ứng |
|---|---|---|
| **Khách Thăm Quan (GUEST)** | Xem thông tin công khai, cây gia phả, lịch giỗ, báo cáo quỹ. Được gửi đề xuất cập nhật kèm nguồn tư liệu. | Giao diện Khách (Chế độ xem an toàn, bảo vệ quyền riêng tư) |
| **Thành viên Dòng họ (MEMBER)** | Xem danh bạ liên lạc nội bộ, xem chi tiết lịch sử và sự kiện. | Giao diện Thành viên |
| **Trưởng Chi (BRANCH_MANAGER)** | Quản lý hồ sơ thành viên thuộc chi nhánh phụ trách. | Giao diện Quản lý Chi |
| **Tổng Quản Trị (ADMIN)** | Toàn quyền tạo chi nhánh (ngay từ đầu có 1-4 chi mẫu), thêm/sửa/xóa thành viên, phê duyệt đề xuất, quản lý quỹ, xem nhật ký Audit Logs. | Giao diện Quản Trị Viên (Toàn quyền) |

## 2. Bảo Vệ Dữ Liệu Cá Nhân Người Còn Sống
- Đối với người còn sống (`isAlive: true`), số điện thoại và thông tin nơi cư trú chi tiết được ẩn hoặc chỉ hiển thị khi có thẩm quyền.
- Khách không thể thu thập hàng loạt (scrape) dữ liệu liên lạc cá nhân.

## 3. Thuật Toán Chống Chu Trình Huyết Thống (Cycle Detection)
Gia phả là đồ thị có hướng không chu trình (DAG - Directed Acyclic Graph). Một người không thể là tổ tiên hoặc cha/mẹ của chính mình hay của bậc tiền bối sinh ra mình.
API `/api/members` thực hiện duyệt đệ quy ngược lên dòng phụ hệ/mẫu hệ:
```typescript
async function wouldCreateCycle(memberId: string, potentialParentId: string): Promise<boolean> {
  if (memberId === potentialParentId) return true;
  let currentId: string | null = potentialParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) return true;
    visited.add(currentId);
    if (currentId === memberId) return true; // Phát hiện chu trình vi phạm!

    const parent = await prisma.memberProfile.findUnique({
      where: { id: currentId },
      select: { fatherId: true, motherId: true },
    });
    if (!parent) break;
    currentId = parent.fatherId || parent.motherId || null;
  }
  return false;
}
```

## 4. Bảo Vệ Thao Tác Xóa Thành Viên (Integrity Guard)
Khi xóa một hồ sơ thành viên, hệ thống đếm số lượng bản ghi con cái phụ thuộc (`childrenAsFather` và `childrenAsMother`). Nếu thành viên đang có con cái kết nối trong cây, hệ thống chặn thao tác xóa và yêu cầu điều chuyển cha mẹ trước nhằm tránh làm đứt gãy phả hệ.

## 5. Xác Thực Mật Khẩu & Bảo Mật Session
- Mật khẩu lưu trữ bắt buộc băm bằng `bcryptjs` với salt 10 rounds.
- Tài khoản quản trị khởi tạo an toàn: `anhthuphan0102@gmail.com` / `010204`.
- Mọi thao tác quan trọng (thêm chi nhánh, sửa thành viên, duyệt thay đổi) đều được ghi nhận vào bảng `AuditLog`.
