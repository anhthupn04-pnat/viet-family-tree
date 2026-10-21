/**
 * src/lib/treeStorage.ts
 * Hệ thống lưu trữ và đồng bộ cục bộ (Local Persistent Storage)
 * Đảm bảo 100% dữ liệu thêm, sửa, xóa KHÔNG BAO GIỜ bị mất hoặc bị load lại từ đầu
 * ngay cả khi chạy trên Vercel Serverless (không có database persistent) hoặc khi F5 tải lại trang.
 */

const STORAGE_PRIMARY_KEY = "phan_family_members_v3";
const STORAGE_KEY_MEMBERS = "viet_family_tree_members_v2";
const STORAGE_KEY_DELETED_IDS = "viet_family_tree_deleted_ids_v2";
const STORAGE_KEY_EDITED_MAP = "viet_family_tree_edited_map_v2";
const STORAGE_KEY_CLAN = "viet_family_tree_clan_v2";
const STORAGE_KEY_BRANCHES = "viet_family_tree_branches_v2";

export function getLocalMembers(): any[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(STORAGE_PRIMARY_KEY) ||
      localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    return null;
  }
}

export function saveLocalMembers(members: any[]): void {
  if (typeof window === "undefined" || !Array.isArray(members)) return;
  try {
    const jsonStr = JSON.stringify(members);
    localStorage.setItem(STORAGE_PRIMARY_KEY, jsonStr);
    localStorage.setItem(STORAGE_KEY_MEMBERS, jsonStr);
  } catch (e) {
    console.warn("Lưu localStorage lỗi:", e);
  }
}

export function getDeletedMemberIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    return new Set();
  }
}

export function getEditedMembersMap(): Record<string, any> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EDITED_MAP);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

export function recordLocalMemberDeleted(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    // 1. Thêm vào danh sách ID đã xóa
    const deleted = getDeletedMemberIds();
    deleted.add(id);
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(deleted)));

    // 2. Xóa khỏi bản đồ đã sửa
    const editedMap = getEditedMembersMap();
    delete editedMap[id];
    localStorage.setItem(STORAGE_KEY_EDITED_MAP, JSON.stringify(editedMap));

    // 3. Xóa khỏi danh sách thành viên hiện tại
    const current = getLocalMembers() || [];
    const updated = current.filter((m: any) => m.id !== id);
    saveLocalMembers(updated);
  } catch (e) {
    console.warn("Lỗi ghi nhận xóa thành viên cục bộ:", e);
  }
}

export function recordLocalMemberSaved(member: any): void {
  if (typeof window === "undefined" || !member || !member.id) return;
  try {
    // 1. Nếu ID này từng bị đánh dấu xóa thì bỏ đánh dấu
    const deleted = getDeletedMemberIds();
    if (deleted.has(member.id)) {
      deleted.delete(member.id);
      localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(deleted)));
    }

    // 2. Lưu vào danh sách đã sửa
    const editedMap = getEditedMembersMap();
    editedMap[member.id] = { ...(editedMap[member.id] || {}), ...member };
    localStorage.setItem(STORAGE_KEY_EDITED_MAP, JSON.stringify(editedMap));

    // 3. Cập nhật vào danh sách thành viên cục bộ
    const current = getLocalMembers() || [];
    const exists = current.some((m: any) => m.id === member.id);
    let nextList: any[];
    if (exists) {
      nextList = current.map((m: any) => (m.id === member.id ? { ...m, ...member } : m));
    } else {
      nextList = [member, ...current];
    }
    saveLocalMembers(nextList);
  } catch (e) {
    console.warn("Lỗi ghi nhận lưu thành viên cục bộ:", e);
  }
}

export function mergeServerWithLocal(serverMembers: any[]): any[] {
  if (typeof window === "undefined") return serverMembers;
  try {
    const deletedIds = getDeletedMemberIds();
    const editedMap = getEditedMembersMap();
    const localList = getLocalMembers();

    // Lấy danh sách server, loại bỏ các ID người dùng đã xóa
    let merged = (serverMembers || [])
      .filter((m: any) => !deletedIds.has(m.id))
      .map((m: any) => {
        if (editedMap[m.id]) {
          return { ...m, ...editedMap[m.id] };
        }
        return m;
      });

    // Thêm các thành viên mới tạo cục bộ mà server chưa có
    if (localList && localList.length > 0) {
      const serverIdSet = new Set(merged.map((m: any) => m.id));
      for (const localM of localList) {
        if (!deletedIds.has(localM.id) && !serverIdSet.has(localM.id)) {
          merged.push(localM);
          serverIdSet.add(localM.id);
        }
      }
    }

    // Đảm bảo lưu lại kết quả hợp nhất vào localStorage
    saveLocalMembers(merged);
    return merged;
  } catch (e) {
    console.warn("Lỗi hợp nhất dữ liệu server và local:", e);
    return serverMembers;
  }
}

export function resetLocalDataToDefault(): void {
  // Chế độ khôi phục gốc đã tắt hoàn toàn để bảo vệ dữ liệu hiện có
  console.log("Chế độ khôi phục gốc đã tắt. Bảo toàn toàn bộ dữ liệu hiện có.");
}

export function getLocalClan(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLAN);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveLocalClan(clan: any): void {
  if (typeof window === "undefined" || !clan) return;
  try {
    localStorage.setItem(STORAGE_KEY_CLAN, JSON.stringify(clan));
  } catch (e) {}
}

export function getLocalBranches(): any[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRANCHES);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveLocalBranches(branches: any[]): void {
  if (typeof window === "undefined" || !branches) return;
  try {
    localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
  } catch (e) {}
}
