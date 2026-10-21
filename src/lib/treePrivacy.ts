import { Member } from "@/types/family";

/**
 * Hàm làm mờ (Mask) thông tin nhạy cảm của các thành viên còn sống:
 * - Áp dụng cho người dùng xem qua Public Share Link hoặc role VIEWER / MEMBER.
 * - Thành viên đã mất (isAlive: false) không bị mask (vì thông tin mộ phần, ngày kỵ giỗ cần hiển thị rõ).
 * - Thành viên còn sống (isAlive: true):
 *   + SĐT: 0912345601 -> 091****601
 *   + Địa chỉ chi tiết: Số 88 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM -> TP. Hồ Chí Minh
 */
export function maskMemberForPrivacy<T extends Partial<Member>>(
  member: T,
  isPrivileged: boolean = false
): T {
  if (isPrivileged || !member.isAlive) {
    return member;
  }

  // 1. Mask Phone
  let maskedPhone = member.phone;
  if (maskedPhone && maskedPhone.trim()) {
    const clean = maskedPhone.trim();
    if (clean.length >= 7) {
      maskedPhone = `${clean.slice(0, 3)}****${clean.slice(-3)}`;
    } else {
      maskedPhone = "******";
    }
  }

  // 2. Mask Address: chỉ giữ tỉnh/thành phố cuối cùng
  let maskedAddress = member.address;
  if (maskedAddress && maskedAddress.trim()) {
    const raw = maskedAddress.trim();
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      // Giữ lại tỉnh/thành phố ở đuôi
      maskedAddress = parts[parts.length - 1];
    } else {
      // Nếu chỉ có 1 cụm, kiểm tra nếu có số nhà thì che bớt
      maskedAddress = raw.replace(/^\d+[^,]*\s*/i, "");
      if (!maskedAddress.trim()) {
        maskedAddress = "Việt Nam";
      }
    }
  }

  return {
    ...member,
    phone: maskedPhone || undefined,
    address: maskedAddress || undefined,
  };
}

/**
 * Mask danh sách thành viên hàng loạt
 */
export function maskMemberListForPrivacy(
  members: Member[],
  isPrivileged: boolean = false
): Member[] {
  if (isPrivileged) return members;
  return members.map((m) => maskMemberForPrivacy(m, false));
}
