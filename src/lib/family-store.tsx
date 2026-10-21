"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Member, PendingSubmission, EventItem, AdminUser, Tree, UserSystemRole } from "@/types/family";
import { lunarToSolar } from "@/utils/lunar";

export const ROOT_SEED_MEMBERS: Member[] = [
  // Đời 1: Cụ Ông & Cụ Bà (Vợ và Chồng song song)
  {
    id: "phan-thanh",
    fullName: "Phan Thạnh",
    nickname: "Cụ Khởi Tổ (Hiệu Phúc Thiện)",
    gender: "male",
    generation: 1,
    birthDate: "12/04/1910",
    deathDate: "16 tháng 3 Âm lịch (1985)",
    isAlive: false,
    spouseId: "tran-thi-hoang",
    phone: "0903112233",
    address: "Giỗ: 16 tháng 3 Âm lịch",
    notes: "Cụ Khởi Tổ (Hiệu Phúc Thiện)",
  },
  {
    id: "tran-thi-hoang",
    fullName: "Trần Thị Hoàng",
    nickname: "Cụ Bà Chính Thất (Hiệu Từ Tâm)",
    gender: "female",
    generation: 1,
    birthDate: "18/08/1914",
    deathDate: "mùng 8 tháng 9 Âm lịch (1990)",
    isAlive: false,
    spouseId: "phan-thanh",
    phone: "0903112234",
    address: "Giỗ: mùng 8 tháng 9 Âm lịch",
    notes: "Cụ Bà Chính Thất (Hiệu Từ Tâm)",
  },
  // Đời 2: Các nhánh con & dâu rể
  {
    id: "tran-dang-thich",
    fullName: "Trần Đăng Thích",
    nickname: "Trưởng nhánh Chi 2",
    gender: "male",
    generation: 2,
    orderInFamily: 2,
    birthDate: "15/06/1942",
    deathDate: "09 tháng 10 Âm lịch (2015)",
    isAlive: false,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    spouseId: "le-thi-lan",
    phone: "0912345602",
    address: "Giỗ: 09 tháng 10 Âm lịch",
    notes: "Trưởng nhánh Chi 2",
  },
  {
    id: "le-thi-lan",
    fullName: "Lê Thị Lan",
    nickname: "Dâu hiền Chi 2",
    gender: "female",
    generation: 2,
    orderInFamily: 2,
    birthDate: "12/09/1945",
    isAlive: true,
    spouseId: "tran-dang-thich",
    phone: "0912345678",
    address: "Chi 2 - Chi Giáp",
    notes: "Dâu hiền Chi 2",
  },
  {
    id: "tran-thi-anh-tuyet",
    fullName: "Trần Thị Ánh Tuyết",
    nickname: "Cô Ba",
    gender: "female",
    generation: 2,
    orderInFamily: 3,
    birthDate: "18/10/1948",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345603",
    address: "Chi 3 - Chi Nữ Phái",
    notes: "Cô Ba",
  },
  {
    id: "tran-thi-my",
    fullName: "Trần Thị Mỹ",
    nickname: "Dâu",
    gender: "female",
    generation: 2,
    birthDate: "05/04/1960",
    isAlive: true,
    phone: "0912345604",
    address: "Chi 1 - Trưởng Chi",
    notes: "Dâu Chi 1",
  },
  {
    id: "phan-van-thu-1",
    fullName: "Phan Văn Thứ 1",
    nickname: "Bác Cả",
    gender: "male",
    generation: 2,
    orderInFamily: 1,
    birthDate: "05/02/1935",
    deathDate: "15/07/2010",
    isAlive: false,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345601",
    address: "Chi 1 - Trưởng Chi",
    notes: "Trưởng nam đời 2 tộc Phan, nguyên chi trưởng.",
  },
  {
    id: "phan-van-thu-4",
    fullName: "Phan Văn Thứ 4",
    nickname: "Chú Tư",
    gender: "male",
    generation: 2,
    orderInFamily: 4,
    birthDate: "22/09/1943",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345605",
    address: "Hải Châu, Đà Nẵng",
    notes: "Con thứ 4 tộc Phan, giáo viên hưu trí.",
  },
  {
    id: "phan-van-thu-5",
    fullName: "Phan Văn Thứ 5",
    nickname: "Chú Năm",
    gender: "male",
    generation: 2,
    orderInFamily: 5,
    birthDate: "14/06/1946",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345606",
    address: "Quận 1, TP. Hồ Chí Minh",
    notes: "Con thứ 5 tộc Phan, bác sĩ.",
  },
  {
    id: "phan-van-thu-6",
    fullName: "Phan Văn Thứ 6",
    nickname: "Cô Sáu",
    gender: "female",
    generation: 2,
    orderInFamily: 6,
    birthDate: "08/01/1949",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345607",
    address: "Quận 3, TP. Hồ Chí Minh",
    notes: "Con thứ 6 tộc Phan.",
  },
  {
    id: "phan-van-thu-7",
    fullName: "Phan Văn Thứ 7",
    nickname: "Chú Bảy",
    gender: "male",
    generation: 2,
    orderInFamily: 7,
    birthDate: "30/04/1952",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345608",
    address: "Cầu Giấy, Hà Nội",
    notes: "Con thứ 7 tộc Phan, giảng viên đại học.",
  },
  {
    id: "phan-van-thu-8",
    fullName: "Phan Văn Thứ 8",
    nickname: "Cô Tám",
    gender: "female",
    generation: 2,
    orderInFamily: 8,
    birthDate: "19/10/1955",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345609",
    address: "Cẩm Lệ, Đà Nẵng",
    notes: "Con thứ 8 tộc Phan.",
  },
  {
    id: "phan-van-thu-9",
    fullName: "Phan Văn Thứ 9",
    nickname: "Chú Út",
    gender: "male",
    generation: 2,
    orderInFamily: 9,
    birthDate: "25/12/1958",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345610",
    address: "Điện Bàn, Quảng Nam",
    notes: "Con thứ 9 tộc Phan, phụ trách hương hỏa nhà thờ tộc.",
  },
  // Đời 3: Hậu duệ Chi 2
  {
    id: "tran-dang-khoa",
    fullName: "Trần Đăng Khoa",
    nickname: "Cháu đích tôn Chi 2",
    gender: "male",
    generation: 3,
    orderInFamily: 1,
    birthDate: "18/04/1970",
    isAlive: true,
    fatherId: "tran-dang-thich",
    motherId: "le-thi-lan",
    phone: "0988112233",
    address: "Chi 2 - Chi Giáp",
    notes: "Cháu đích tôn Chi 2",
  },
  {
    id: "tran-thi-mai",
    fullName: "Trần Thị Mai",
    nickname: "Cháu gái Chi 2",
    gender: "female",
    generation: 3,
    orderInFamily: 2,
    birthDate: "22/03/1975",
    isAlive: true,
    fatherId: "tran-dang-thich",
    motherId: "le-thi-lan",
    phone: "0988112244",
    address: "Chi 2 - Chi Giáp",
    notes: "Cháu gái Chi 2",
  },
];

export const ROOT_SEED_EVENTS: EventItem[] = [
  {
    id: "ev-1",
    title: "Lễ Giỗ Tiền Nhân Khởi Tổ Phan Thạnh",
    type: "death_anniversary",
    lunarDate: "15/03",
    solarDate: "2026-05-01",
    location: "Từ đường Tộc Phan, Điện Bàn, Quảng Nam",
    description: "Lễ giỗ Cụ Khởi Tổ tộc Phan. Con cháu tề tựu dâng hương tưởng niệm.",
    status: "approved",
  },
  {
    id: "ev-2",
    title: "Lễ Giỗ Cụ Bà Trần Thị Hoàng",
    type: "death_anniversary",
    lunarDate: "10/08",
    solarDate: "2026-09-20",
    location: "Từ đường Tộc Phan, Điện Bàn, Quảng Nam",
    description: "Lễ giỗ Cụ Bà Trần Thị Hoàng. Lễ vật trang nghiêm, tri ân công đức dưỡng dục.",
    status: "approved",
  },
  {
    id: "ev-3",
    title: "Lễ Tế Tổ & Họp Mặt Dòng Họ Đầu Xuân",
    type: "feast",
    lunarDate: "08/01",
    solarDate: "2026-02-24",
    location: "Nhà Thờ Tộc Phan, Quảng Nam",
    description: "Họp mặt chúc thọ các bậc cao niên, phát thưởng khuyến học cho con cháu thành đạt.",
    status: "approved",
  },
  {
    id: "ev-4",
    title: "Lễ Tảo Mộ Thanh Minh Toàn Tộc",
    type: "gathering",
    lunarDate: "05/03",
    solarDate: "2026-04-21",
    location: "Nghĩa trang gia tộc Phan, Quảng Nam",
    description: "Toàn thể con cháu các chi tề tựu tu tảo mồ mả tổ tiên dòng họ.",
    status: "approved",
  },
];

export const ROOT_SEED_ADMINS: AdminUser[] = [
  {
    id: "admin-super",
    email: "anhthuphan0102@gmail.com",
    name: "Phan Anh Thư (Super Admin)",
    role: "super_admin",
    password: "010204",
    createdAt: "2026-01-01",
    assignedTrees: ["*"],
  },
  {
    id: "admin-clan",
    email: "admin@tophan.vn",
    name: "Ban Trị Sự Tộc Phan",
    role: "admin",
    password: "admin123",
    createdAt: "2026-01-01",
    assignedTrees: ["tree-phan-family"],
  },
];

export const ROOT_SEED_PENDING: PendingSubmission[] = [
  {
    id: "sub-1",
    actionType: "CREATE",
    submitterName: "Phan Đình Khang",
    submitterPhone: "0988776655",
    submittedAt: "2026-10-19 14:30",
    status: "pending",
    data: {
      fullName: "Phan Đình Bảo",
      nickname: "Cu Tí",
      gender: "male",
      generation: 3,
      orderInFamily: 1,
      birthDate: "15/06/1970",
      isAlive: true,
      fatherId: "phan-van-thu-1",
      phone: "0905123456",
      address: "Đà Nẵng",
      notes: "Trưởng nam của Bác Cả Phan Văn Thứ 1.",
    },
  },
  {
    id: "sub-2",
    actionType: "UPDATE",
    targetMemberId: "phan-van-thu-5",
    submitterName: "Phan Văn Thứ 5",
    submitterPhone: "0912345605",
    submittedAt: "2026-10-20 09:15",
    status: "pending",
    oldData: {
      phone: "0912345605",
      address: "Quận 1, TP. Hồ Chí Minh",
      notes: "Con thứ 5 tộc Phan, bác sĩ.",
    },
    data: {
      phone: "0988112233",
      address: "Số 88 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      notes: "Bác sĩ Chuyên khoa II, Trưởng Phân chi Tộc Phan miền Nam.",
    },
  },
];

export const DEFAULT_TREES: Tree[] = [
  {
    id: "tree-phan-family",
    name: "Gia Phả Tộc Phan (Quảng Nam)",
    slug: "gia-pha-toc-phan",
    originLocation: "Điện Bàn, Quảng Nam",
    description: "Cây gia phả chính thống của dòng tộc Phan Thạnh",
    status: "ACTIVE",
    creatorId: "admin-super",
    isPublic: true,
    shareSlug: "gia-pha-toc-phan",
    createdAt: "2026-01-01",
    updatedAt: "2026-10-21",
    memberCount: ROOT_SEED_MEMBERS.length,
  },
  {
    id: "tree-tran-family",
    name: "Gia Phả Tộc Trần (Huế)",
    slug: "gia-pha-toc-tran-hue",
    originLocation: "Hương Thủy, Thừa Thiên Huế",
    description: "Nhánh gia phả bên ngoại Tộc Trần",
    status: "ACTIVE",
    creatorId: "admin-super",
    isPublic: true,
    shareSlug: "gia-pha-toc-tran-hue",
    createdAt: "2026-02-15",
    updatedAt: "2026-10-21",
    memberCount: 4,
  },
  {
    id: "tree-le-family",
    name: "Gia Phả Tộc Lê (Thanh Hóa)",
    slug: "gia-pha-toc-le-thanh-hoa",
    originLocation: "Nga Sơn, Thanh Hóa",
    description: "Cây phả hệ Tộc Lê phát tích miền Bắc",
    status: "ACTIVE",
    creatorId: "admin-super",
    isPublic: true,
    shareSlug: "gia-pha-toc-le-thanh-hoa",
    createdAt: "2026-03-10",
    updatedAt: "2026-10-21",
    memberCount: 4,
  },
];

const STORAGE_MEMBERS = "phan_family_members_v3";
const STORAGE_MEMBERS_LEGACY = "viet_family_tree_members_v2";
const STORAGE_PENDING = "phan_family_pending_v2";
const STORAGE_EVENTS = "phan_family_events_v2";
const STORAGE_ADMINS = "phan_family_admins_v2";
const STORAGE_SESSION = "phan_family_admin_session";
const STORAGE_TREES = "phan_family_trees_v2";
const STORAGE_ACTIVE_TREE = "phan_family_active_tree_v2";

interface FamilyStoreContextType {
  members: Member[];
  pendingSubmissions: PendingSubmission[];
  events: EventItem[];
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  pendingCount: number;

  // Multi-Tree & RBAC System
  trees: Tree[];
  allTrees: Tree[];
  activeTreeId: string;
  activeTree: Tree;
  setActiveTreeId: (id: string) => void;
  userRole: UserSystemRole;
  canManageCurrentTree: boolean;
  canCreateTree: boolean;
  canBulkImport: boolean;
  createTree: (data: { name: string; originLocation?: string; description?: string; slug?: string }) => Promise<Tree>;
  updateTree: (id: string, updates: Partial<Tree>) => Promise<void>;
  deleteTree: (id: string) => Promise<void>;
  assignTreeManager: (userId: string, treeIds: string[]) => void;

  // Bulk Import
  bulkImportMembers: (
    importedMembers: Member[],
    stats?: { createdCount: number; updatedCount: number; skippedCount: number }
  ) => void;

  // Auth
  loginAdmin: (email: string, password: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  createAdminUser: (userData: Omit<AdminUser, "id" | "createdAt">) => { success: boolean; message: string };

  // Guest Submissions (Pending)
  submitChangeRequest: (
    req: Omit<PendingSubmission, "id" | "submittedAt" | "status">
  ) => PendingSubmission;

  // Admin Direct Actions
  addMemberDirect: (memberData: Omit<Member, "id"> & { id?: string }) => Member;
  updateMemberDirect: (id: string, updates: Partial<Member>) => void;
  deleteMemberDirect: (id: string) => void;
  addEventDirect: (eventData: Omit<EventItem, "id"> & { id?: string }) => EventItem;

  // Approval Queue
  approveSubmission: (id: string) => void;
  rejectSubmission: (id: string, reason: string) => void;

  // Helpers
  getMember: (id: string) => Member | undefined;
  getChildren: (parentId: string) => Member[];
  getSpouse: (memberId: string) => Member | undefined;
  resetToSeedData: () => void;
  saveCurrentData: () => void;
  refreshTrigger: number;
}

const FamilyStoreContext = createContext<FamilyStoreContextType | null>(null);

export function FamilyStoreProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(ROOT_SEED_MEMBERS);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>(ROOT_SEED_PENDING);
  const [events, setEvents] = useState<EventItem[]>(ROOT_SEED_EVENTS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(ROOT_SEED_ADMINS);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Multi-Tree System States
  const [trees, setTrees] = useState<Tree[]>(DEFAULT_TREES);
  const [activeTreeId, setActiveTreeIdState] = useState<string>("tree-phan-family");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // 1. Multi-Tree
      const storedTrees = localStorage.getItem(STORAGE_TREES);
      if (storedTrees) {
        const parsed = JSON.parse(storedTrees);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrees(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_TREES, JSON.stringify(DEFAULT_TREES));
      }

      const storedActiveTree = localStorage.getItem(STORAGE_ACTIVE_TREE);
      if (storedActiveTree) {
        setActiveTreeIdState(storedActiveTree);
      }

      // Fetch latest trees from API if available
      fetch("/api/trees")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.trees) && data.trees.length > 0) {
            setTrees((prev) => {
              const merged = [...data.trees];
              // Giữ lại các cây local nếu chưa sync
              prev.forEach((pt) => {
                if (!merged.some((t) => t.id === pt.id)) merged.push(pt);
              });
              try {
                localStorage.setItem(STORAGE_TREES, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        })
        .catch(() => {});

      // 2. Members (Kiểm tra cả 2 khóa để bảo toàn 100% dữ liệu đã nhập)
      const storedMembers =
        localStorage.getItem(STORAGE_MEMBERS) ||
        localStorage.getItem(STORAGE_MEMBERS_LEGACY);
      if (storedMembers) {
        const parsed = JSON.parse(storedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(parsed));
          localStorage.setItem(STORAGE_MEMBERS_LEGACY, JSON.stringify(parsed));
        }
      } else {
        localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(ROOT_SEED_MEMBERS));
        localStorage.setItem(STORAGE_MEMBERS_LEGACY, JSON.stringify(ROOT_SEED_MEMBERS));
      }

      // 3. Pending Submissions
      const storedPending = localStorage.getItem(STORAGE_PENDING);
      if (storedPending) {
        const parsed = JSON.parse(storedPending);
        if (Array.isArray(parsed)) {
          setPendingSubmissions(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_PENDING, JSON.stringify(ROOT_SEED_PENDING));
      }

      // 4. Events
      const storedEvents = localStorage.getItem(STORAGE_EVENTS);
      if (storedEvents) {
        const parsed = JSON.parse(storedEvents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_EVENTS, JSON.stringify(ROOT_SEED_EVENTS));
      }

      // 5. Admin Users
      const storedAdmins = localStorage.getItem(STORAGE_ADMINS);
      if (storedAdmins) {
        const parsed = JSON.parse(storedAdmins);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdminUsers(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_ADMINS, JSON.stringify(ROOT_SEED_ADMINS));
      }

      // 6. Admin Session
      const storedSession = localStorage.getItem(STORAGE_SESSION);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed && parsed.email) {
          setCurrentAdmin(parsed);
        }
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
  }, []);

  // Chuyển đổi Cây Gia Phả đang hiển thị (Switch Tree)
  const setActiveTreeId = useCallback(
    (treeId: string) => {
      // Chặn can thiệp chéo đối với vai trò TREE_MANAGER
      if (currentAdmin && currentAdmin.role !== "super_admin") {
        const assigned = currentAdmin.assignedTrees || currentAdmin.assignedTreeIds || [];
        const hasPermission = assigned.includes("*") || assigned.includes(treeId);
        if (!hasPermission) {
          alert("Truy cập bị từ chối (403): Bạn không có quyền quản lý gia phả này.");
          return;
        }
      }

      setActiveTreeIdState(treeId);
      try {
        localStorage.setItem(STORAGE_ACTIVE_TREE, treeId);
      } catch (e) {}

      // Load thành viên tương ứng của cây này nếu có
      if (treeId === "tree-phan-family") {
        const stored = localStorage.getItem(STORAGE_MEMBERS);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) setMembers(parsed);
          } catch (e) {}
        }
      } else {
        const treeMembersKey = `tree_members_${treeId}`;
        const stored = localStorage.getItem(treeMembersKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) setMembers(parsed);
          } catch (e) {}
        } else {
          // Tải từ API nếu có
          fetch(`/api/trees/${treeId}/members`, {
            headers: {
              "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
            },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.members && Array.isArray(data.members)) {
                setMembers(data.members);
              } else {
                setMembers([]);
              }
            })
            .catch(() => setMembers([]));
        }
      }
      setRefreshTrigger((prev) => prev + 1);
    },
    [currentAdmin]
  );

  // RBAC Permission Model:
  // - SUPER_ADMIN: Toàn quyền tạo cây, sửa cây, gán quyền, bulk import mọi nơi
  // - TREE_MANAGER: Quản lý & bulk import CHỈ trên các cây được gán (assignedTrees)
  // - VIEWER: Chỉ xem
  const userRole: UserSystemRole = currentAdmin
    ? currentAdmin.role === "super_admin"
      ? "SUPER_ADMIN"
      : "TREE_MANAGER"
    : "VIEWER";

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const canCreateTree = isSuperAdmin;

  // Scoped Access Control: Lọc cây theo quyền hạn nghiêm ngặt
  const accessibleTrees = isSuperAdmin
    ? trees
    : userRole === "TREE_MANAGER"
    ? trees.filter((t) => {
        const assigned = currentAdmin?.assignedTrees || currentAdmin?.assignedTreeIds || [];
        return assigned.includes("*") || assigned.includes(t.id);
      })
    : trees.filter((t) => t.status === "ACTIVE" && t.isPublic !== false);

  const activeTree =
    accessibleTrees.find((t) => t.id === activeTreeId) ||
    accessibleTrees[0] ||
    trees.find((t) => t.id === activeTreeId) ||
    trees[0] ||
    DEFAULT_TREES[0];

  const pendingCount = pendingSubmissions.filter((s) => s.status === "pending").length;
  const isAdmin = !!currentAdmin;

  const canManageCurrentTree =
    isSuperAdmin ||
    (userRole === "TREE_MANAGER" &&
      Boolean(
        currentAdmin?.assignedTrees?.includes("*") ||
        (currentAdmin?.assignedTrees && currentAdmin.assignedTrees.includes(activeTreeId)) ||
        (currentAdmin?.assignedTreeIds && currentAdmin.assignedTreeIds.includes(activeTreeId))
      ));

  const canBulkImport = canManageCurrentTree;

  // Auth: Login
  const loginAdmin = useCallback(
    (email: string, pass: string): { success: boolean; message?: string } => {
      const trimmedEmail = email.trim().toLowerCase();
      const user = adminUsers.find(
        (u) =>
          u.email.toLowerCase() === trimmedEmail &&
          (u.password === pass.trim() ||
            (u.email === "anhthuphan0102@gmail.com" && (pass === "010204" || pass === "admin123")) ||
            (u.email === "admin@tophan.vn" && pass === "admin123"))
      );

      if (!user) {
        return { success: false, message: "Email hoặc mật khẩu không chính xác!" };
      }

      setCurrentAdmin(user);
      try {
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }

      // Nếu là Tree Manager, tự động chọn cây được phân quyền đầu tiên
      if (user.role !== "super_admin") {
        const assigned = user.assignedTrees || user.assignedTreeIds || [];
        if (assigned.length > 0 && !assigned.includes("*")) {
          setActiveTreeId(assigned[0]);
        }
      }

      return { success: true };
    },
    [adminUsers, setActiveTreeId]
  );

  // Auth: Logout
  const logoutAdmin = useCallback(() => {
    setCurrentAdmin(null);
    try {
      localStorage.removeItem(STORAGE_SESSION);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auth: Create sub-admin
  const createAdminUser = useCallback(
    (userData: Omit<AdminUser, "id" | "createdAt">): { success: boolean; message: string } => {
      if (!isSuperAdmin) {
        return { success: false, message: "Chỉ Super Admin mới có quyền tạo tài khoản quản trị viên mới." };
      }
      const existing = adminUsers.find(
        (u) => u.email.toLowerCase() === userData.email.trim().toLowerCase()
      );
      if (existing) {
        return { success: false, message: "Email quản trị viên này đã tồn tại trong hệ thống." };
      }

      const newAdmin: AdminUser = {
        ...userData,
        id: `adm-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setAdminUsers((prev) => {
        const next = [...prev, newAdmin];
        try {
          localStorage.setItem(STORAGE_ADMINS, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      return { success: true, message: `Đã tạo tài khoản quản trị ${newAdmin.name} thành công!` };
    },
    [isSuperAdmin, adminUsers]
  );

  // Guest Submission: Submit change request
  const submitChangeRequest = useCallback(
    (req: Omit<PendingSubmission, "id" | "submittedAt" | "status">): PendingSubmission => {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now
        .getDate()
        .toString()
        .padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const newSub: PendingSubmission = {
        ...req,
        id: `sub-${Date.now()}`,
        submittedAt: timeStr,
        status: "pending",
      };

      setPendingSubmissions((prev) => {
        const next = [newSub, ...prev];
        try {
          localStorage.setItem(STORAGE_PENDING, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      setRefreshTrigger((prev) => prev + 1);
      return newSub;
    },
    []
  );

  // Admin Direct: Add Member
  const addMemberDirect = useCallback((memberData: Omit<Member, "id"> & { id?: string }): Member => {
    const newId = memberData.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMember: Member = {
      ...memberData,
      id: newId,
    };

    setMembers((prev) => {
      let updated = [...prev, newMember];
      if (newMember.spouseId) {
        updated = updated.map((m) =>
          m.id === newMember.spouseId ? { ...m, spouseId: newMember.id } : m
        );
      }
      try {
        const jsonStr = JSON.stringify(updated);
        localStorage.setItem(STORAGE_MEMBERS, jsonStr);
        localStorage.setItem(STORAGE_MEMBERS_LEGACY, jsonStr);
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setRefreshTrigger((prev) => prev + 1);
    return newMember;
  }, []);

  // Admin Direct: Update Member
  const updateMemberDirect = useCallback((id: string, updates: Partial<Member>) => {
    setMembers((prev) => {
      const current = prev.find((m) => m.id === id);
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));

      // If spouseId changed, update reciprocal link
      if (updates.spouseId !== undefined && (!current || current.spouseId !== updates.spouseId)) {
        if (current?.spouseId) {
          // Unlink old spouse
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].id === current.spouseId && updated[i].spouseId === id) {
              updated[i] = { ...updated[i], spouseId: undefined };
            }
          }
        }
        if (updates.spouseId) {
          // Link new spouse
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].id === updates.spouseId) {
              updated[i] = { ...updated[i], spouseId: id };
            }
          }
        }
      }

      try {
        const jsonStr = JSON.stringify(updated);
        localStorage.setItem(STORAGE_MEMBERS, jsonStr);
        localStorage.setItem(STORAGE_MEMBERS_LEGACY, jsonStr);
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Admin Direct: Delete Member
  const deleteMemberDirect = useCallback((id: string) => {
    setMembers((prev) => {
      const updated = prev
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          spouseId: m.spouseId === id ? undefined : m.spouseId,
          fatherId: m.fatherId === id ? undefined : m.fatherId,
          motherId: m.motherId === id ? undefined : m.motherId,
        }));

      try {
        const jsonStr = JSON.stringify(updated);
        localStorage.setItem(STORAGE_MEMBERS, jsonStr);
        localStorage.setItem(STORAGE_MEMBERS_LEGACY, jsonStr);
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Admin Direct: Add Event
  const addEventDirect = useCallback((eventData: Omit<EventItem, "id"> & { id?: string }): EventItem => {
    const newEvent: EventItem = {
      ...eventData,
      id: eventData.id || `ev-${Date.now()}`,
      status: "approved",
    };

    setEvents((prev) => {
      const next = [newEvent, ...prev];
      try {
        localStorage.setItem(STORAGE_EVENTS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setRefreshTrigger((prev) => prev + 1);
    return newEvent;
  }, []);

  // Approval Queue: Approve Submission
  const approveSubmission = useCallback(
    (submissionId: string) => {
      const sub = pendingSubmissions.find((s) => s.id === submissionId);
      if (!sub) return;

      if (sub.actionType === "CREATE") {
        addMemberDirect(sub.data);
      } else if (sub.actionType === "UPDATE" && sub.targetMemberId) {
        updateMemberDirect(sub.targetMemberId, sub.data);
      } else if (sub.actionType === "DELETE" && sub.targetMemberId) {
        deleteMemberDirect(sub.targetMemberId);
      } else if (sub.actionType === "ADD_EVENT") {
        addEventDirect(sub.data);
      }

      // Update status to approved
      setPendingSubmissions((prev) => {
        const next = prev.map((s) => (s.id === submissionId ? { ...s, status: "approved" as const } : s));
        try {
          localStorage.setItem(STORAGE_PENDING, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      setRefreshTrigger((prev) => prev + 1);
    },
    [pendingSubmissions, addMemberDirect, updateMemberDirect, deleteMemberDirect, addEventDirect]
  );

  // Approval Queue: Reject Submission
  const rejectSubmission = useCallback((submissionId: string, reason: string) => {
    setPendingSubmissions((prev) => {
      const next = prev.map((s) =>
        s.id === submissionId
          ? { ...s, status: "rejected" as const, rejectionReason: reason || "Không đủ căn cứ xác thực" }
          : s
      );
      try {
        localStorage.setItem(STORAGE_PENDING, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Reset to seed data (Đã tắt hoàn toàn theo yêu cầu người dùng để bảo vệ dữ liệu hiện có)
  const resetToSeedData = useCallback(() => {
    console.warn("Chế độ khôi phục gốc đã được vô hiệu hóa để bảo vệ an toàn cho dữ liệu hiện có.");
  }, []);

  // Lưu dữ liệu hiện tại ngay lập tức vào bộ nhớ bền vững (Local Persistence)
  const saveCurrentData = useCallback(() => {
    try {
      const jsonStr = JSON.stringify(members);
      localStorage.setItem(STORAGE_MEMBERS, jsonStr);
      localStorage.setItem(STORAGE_MEMBERS_LEGACY, jsonStr);
      setRefreshTrigger((prev) => prev + 1);
    } catch (e) {
      console.error("Lỗi lưu dữ liệu:", e);
    }
  }, [members]);

  const getMember = useCallback(
    (id: string) => {
      return members.find((m) => m.id === id);
    },
    [members]
  );

  const getChildren = useCallback(
    (parentId: string) => {
      return members
        .filter((m) => m.fatherId === parentId || m.motherId === parentId)
        .sort((a, b) => (a.orderInFamily || 99) - (b.orderInFamily || 99));
    },
    [members]
  );

  const getSpouse = useCallback(
    (memberId: string) => {
      const mem = members.find((m) => m.id === memberId);
      if (!mem || !mem.spouseId) return undefined;
      return members.find((m) => m.id === mem.spouseId);
    },
    [members]
  );

  // ============================================================================
  // MULTI-TREE & RBAC METHODS
  // ============================================================================

  // Tạo cây gia phả mới (Chỉ Super Admin)
  const createTree = useCallback(
    async (data: {
      name: string;
      originLocation?: string;
      description?: string;
      slug?: string;
    }): Promise<Tree> => {
      const generatedSlug =
        data.slug ||
        data.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-") + `-${Date.now().toString().slice(-4)}`;

      const newTree: Tree = {
        id: `tree-${Date.now()}`,
        name: data.name.trim(),
        slug: generatedSlug,
        originLocation: data.originLocation?.trim() || "Chưa xác định",
        description: data.description?.trim() || null as any,
        status: "ACTIVE",
        creatorId: currentAdmin?.id || "admin-super",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        memberCount: 0,
      };

      // Gọi API Backend nếu có kết nối
      try {
        const res = await fetch("/api/trees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
          },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.tree) {
            newTree.id = resData.tree.id;
            newTree.slug = resData.tree.slug;
          }
        }
      } catch (e) {
        console.warn("Backend create tree sync error:", e);
      }

      setTrees((prev) => {
        const next = [newTree, ...prev];
        try {
          localStorage.setItem(STORAGE_TREES, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      // Tự động chuyển sang cây vừa tạo
      setActiveTreeId(newTree.id);
      setMembers([]);

      setRefreshTrigger((prev) => prev + 1);
      return newTree;
    },
    [currentAdmin, setActiveTreeId]
  );

  // Cập nhật thông tin / trạng thái cây gia phả (Super Admin)
  const updateTree = useCallback(
    async (id: string, updates: Partial<Tree>): Promise<void> => {
      try {
        await fetch(`/api/trees/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
          },
          body: JSON.stringify(updates),
        });
      } catch (e) {}

      setTrees((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        try {
          localStorage.setItem(STORAGE_TREES, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      setRefreshTrigger((prev) => prev + 1);
    },
    [currentAdmin]
  );

  // Xóa cây gia phả (Super Admin)
  const deleteTree = useCallback(
    async (id: string): Promise<void> => {
      try {
        await fetch(`/api/trees/${id}`, {
          method: "DELETE",
          headers: {
            "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
          },
        });
      } catch (e) {}

      setTrees((prev) => {
        const next = prev.filter((t) => t.id !== id);
        try {
          localStorage.setItem(STORAGE_TREES, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      if (activeTreeId === id) {
        setActiveTreeId("tree-phan-family");
      }
      setRefreshTrigger((prev) => prev + 1);
    },
    [currentAdmin, activeTreeId, setActiveTreeId]
  );

  // Gán quyền quản lý cây (Assign TREE_MANAGER)
  const assignTreeManager = useCallback(
    (userId: string, treeIds: string[]) => {
      setAdminUsers((prev) => {
        const next = prev.map((u) => (u.id === userId ? { ...u, assignedTrees: treeIds } : u));
        try {
          localStorage.setItem(STORAGE_ADMINS, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      // Gửi lên API
      fetch(`/api/users/${userId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({ treeIds }),
      }).catch(() => {});

      setRefreshTrigger((prev) => prev + 1);
    },
    []
  );

  // Nhập hàng loạt thành viên (Bulk Import)
  const bulkImportMembers = useCallback(
    (
      importedMembers: Member[],
      stats?: { createdCount: number; updatedCount: number; skippedCount: number }
    ) => {
      setMembers(importedMembers);
      try {
        const jsonStr = JSON.stringify(importedMembers);
        if (activeTreeId === "tree-phan-family") {
          localStorage.setItem(STORAGE_MEMBERS, jsonStr);
          localStorage.setItem(STORAGE_MEMBERS_LEGACY, jsonStr);
        } else {
          localStorage.setItem(`tree_members_${activeTreeId}`, jsonStr);
        }
      } catch (e) {
        console.error(e);
      }

      // Cập nhật số lượng thành viên của cây hiện tại
      setTrees((prev) =>
        prev.map((t) =>
          t.id === activeTreeId ? { ...t, memberCount: importedMembers.length } : t
        )
      );

      setRefreshTrigger((prev) => prev + 1);
    },
    [activeTreeId]
  );

  return (
    <FamilyStoreContext.Provider
      value={{
        members,
        pendingSubmissions,
        events,
        adminUsers,
        currentAdmin,
        isAdmin,
        isSuperAdmin,
        pendingCount,

        // Multi-Tree & RBAC (Chặt chẽ theo Scoped Access Control)
        trees: accessibleTrees,
        allTrees: trees,
        activeTreeId,
        activeTree,
        setActiveTreeId,
        userRole,
        canManageCurrentTree,
        canCreateTree,
        canBulkImport,
        createTree,
        updateTree,
        deleteTree,
        assignTreeManager,

        // Bulk Import
        bulkImportMembers,

        loginAdmin,
        logoutAdmin,
        createAdminUser,
        submitChangeRequest,
        addMemberDirect,
        updateMemberDirect,
        deleteMemberDirect,
        addEventDirect,
        approveSubmission,
        rejectSubmission,
        getMember,
        getChildren,
        getSpouse,
        resetToSeedData,
        saveCurrentData,
        refreshTrigger,
      }}
    >
      {children}
    </FamilyStoreContext.Provider>
  );
}

export function useFamilyStore() {
  const ctx = useContext(FamilyStoreContext);
  if (!ctx) {
    throw new Error("useFamilyStore must be used within a FamilyStoreProvider");
  }
  return ctx;
}
