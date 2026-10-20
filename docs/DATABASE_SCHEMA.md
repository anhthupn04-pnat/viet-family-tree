# Chi Tiết Database Schema & Indexes — VietFamilyTree

## 1. Bảng `User`
Lưu trữ thông tin tài khoản đăng nhập quản trị và quản lý chi họ.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | String (UUID) | PK, default uuid | Khóa chính |
| `email` | String | Unique, Indexed | Email đăng nhập duy nhất (Admin: `anhthuphan0102@gmail.com`) |
| `passwordHash` | String | Not Null | Mật khẩu băm Bcrypt 10 salt rounds |
| `name` | String | Not Null | Họ tên người dùng |
| `role` | String | Default "MEMBER" | `ADMIN`, `BRANCH_MANAGER`, `MEMBER`, `GUEST` |
| `assignedBranchId` | String? | Nullable | ID chi họ phụ trách (nếu là BRANCH_MANAGER) |
| `createdAt` | DateTime | Default now | Ngày tạo tài khoản |
| `updatedAt` | DateTime | Auto update | Ngày cập nhật |

## 2. Bảng `Clan`
Lưu trữ thông tin các dòng họ trong hệ thống (Hỗ trợ kiến trúc đa dòng tộc).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | String (UUID) | PK | Khóa chính |
| `name` | String | Not Null | Tên dòng họ (Ví dụ: Gia Phả Phan Tộc Đại Tông) |
| `couplet1` | String? | Nullable | Câu đối 1: Tổ Tiên Công Đức Thiên Niên Thịnh |
| `couplet2` | String? | Nullable | Câu đối 2: Tử Hiếu Tôn Hiền Vạn Đại Vinh |
| `originLocation` | String | Not Null | Quê hương phát tích (Ví dụ: Nga Sơn, Thanh Hóa) |
| `mainRegion` | String | Default "Miền Bắc" | Miền Bắc, Miền Trung, Miền Nam |
| `slug` | String | Unique | Định danh URL (ví dụ: `phan-toc-dai-tong`) |
| `ancestralHall` | String? | Nullable | Từ đường / Nhà thờ họ |
| `historySummary` | String? | Nullable | Tóm tắt lịch sử khởi nguồn |
| `isPublic` | Boolean | Default true | Cho phép khách xem công khai |

## 3. Bảng `ClanBranch`
Lưu trữ các chi họ và nhánh họ. Ban đầu được tạo sẵn **1-4 chi họ mẫu ban đầu**, Admin có toàn quyền tạo thêm chi mới.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | String (UUID) | PK | Khóa chính |
| `clanId` | String | FK -> Clan.id, Cascade | Dòng họ trực thuộc |
| `branchName` | String | Not Null | Tên chi (Chi 1 - Trưởng Chi, Chi 2 - Chi Giáp, ...) |
| `branchOrder` | Int | Default 1, Indexed | Thứ tự của chi trong dòng họ |
| `leaderName` | String? | Nullable | Tên cụ/ông Trưởng chi |
| `description` | String? | Nullable | Mô tả đặc điểm, nhiệm vụ của chi |
| `residenceArea` | String? | Nullable | Địa bàn cư trú chủ yếu của con cháu chi này |

## 4. Bảng `MemberProfile`
Lưu trữ hồ sơ cá nhân và thế thứ của từng thành viên trong gia phả.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | String (UUID) | PK | Khóa chính |
| `clanId` | String | FK -> Clan.id, Cascade | Dòng họ trực thuộc |
| `branchId` | String? | FK -> ClanBranch.id, SetNull | Chi họ trực thuộc |
| `memberCode` | String | Unique, Indexed | Mã định danh gia phả (Ví dụ: PT-G1-01, PT-G2-01) |
| `fullName` | String | Indexed | Họ tên đầy đủ |
| `courtesyName` | String? | Nullable | Tên húy, tên tự, pháp danh |
| `gender` | String | Default "MALE" | `MALE` (Nam), `FEMALE` (Nữ), `UNKNOWN` |
| `generation` | Int | Default 1, Indexed | Đời thứ mấy trong dòng họ (Đời 1 = Khởi tổ) |
| `birthSolar` | String? | Nullable | Ngày sinh Dương lịch (YYYY-MM-DD) |
| `birthLunar` | String? | Nullable | Ngày sinh Âm lịch (Ngày/Tháng/Năm Can Chi) |
| `deathSolar` | String? | Nullable | Ngày mất Dương lịch |
| `deathLunar` | String? | Nullable | Ngày mất Âm lịch (Dùng tính ngày giỗ) |
| `isAlive` | Boolean | Default true, Indexed | Còn sống hay đã khuất |
| `burialPlace` | String? | Nullable | Mộ phần / Nơi an táng |
| `hometown` | String? | Nullable | Quê quán |
| `currentResidence` | String? | Nullable | Nơi cư trú hiện nay |
| `avatarUrl` | String? | Nullable | Ảnh chân dung |
| `biography` | String? | Nullable | Tiểu sử, công danh, sự nghiệp |
| `phone` | String? | Nullable | Số điện thoại (chỉ hiển thị theo quyền bảo mật) |
| `fatherId` | String? | FK -> MemberProfile.id, SetNull | Liên kết Cha ruột |
| `motherId` | String? | FK -> MemberProfile.id, SetNull | Liên kết Mẹ ruột |

## 5. Bảng `Marriage`
Lưu trữ quan hệ hôn phối, dâu rể giữa các thành viên.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | String (UUID) | PK | Khóa chính |
| `husbandId` | String | FK -> MemberProfile.id | Chồng |
| `wifeId` | String | FK -> MemberProfile.id | Vợ |
| `marriageDate` | String? | Nullable | Ngày cưới |
| `status` | String | Default "MARRIED" | Tình trạng hôn nhân |

## 6. Các Bảng Nghiệp Vụ Mở Rộng
- `AncestorAnniversary`: Ngày giỗ (lunarDay, lunarMonth, solarDateFixed, location, description).
- `ClanFund`: Quỹ dòng họ (fundType, transactionType: INCOME/EXPENSE, amount, contributor).
- `ClanDocument`: Tư liệu cổ số hóa (type: IMAGE, MANUSCRIPT, STELE, ROYAL_DECREE).
- `ChangeRequest`: Đề xuất sửa đổi thông tin (requesterName, reason, evidenceSource, status: PENDING/APPROVED/REJECTED).
- `AuditLog`: Nhật ký kiểm toán hệ thống (action, target, details, userName, userEmail).
