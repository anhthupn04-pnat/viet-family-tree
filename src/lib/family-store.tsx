"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Member, PendingSubmission, EventItem, AdminUser } from "@/types/family";
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
  },
  {
    id: "admin-clan",
    email: "admin@tophan.vn",
    name: "Ban Trị Sự Tộc Phan",
    role: "admin",
    password: "admin123",
    createdAt: "2026-01-01",
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

const STORAGE_MEMBERS = "phan_family_members_v3";
const STORAGE_PENDING = "phan_family_pending_v2";
const STORAGE_EVENTS = "phan_family_events_v2";
const STORAGE_ADMINS = "phan_family_admins_v2";
const STORAGE_SESSION = "phan_family_admin_session";

interface FamilyStoreContextType {
  members: Member[];
  pendingSubmissions: PendingSubmission[];
  events: EventItem[];
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  pendingCount: number;

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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // 1. Members
      const storedMembers = localStorage.getItem(STORAGE_MEMBERS);
      if (storedMembers) {
        const parsed = JSON.parse(storedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(ROOT_SEED_MEMBERS));
      }

      // 2. Pending Submissions
      const storedPending = localStorage.getItem(STORAGE_PENDING);
      if (storedPending) {
        const parsed = JSON.parse(storedPending);
        if (Array.isArray(parsed)) {
          setPendingSubmissions(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_PENDING, JSON.stringify(ROOT_SEED_PENDING));
      }

      // 3. Events
      const storedEvents = localStorage.getItem(STORAGE_EVENTS);
      if (storedEvents) {
        const parsed = JSON.parse(storedEvents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_EVENTS, JSON.stringify(ROOT_SEED_EVENTS));
      }

      // 4. Admin Users
      const storedAdmins = localStorage.getItem(STORAGE_ADMINS);
      if (storedAdmins) {
        const parsed = JSON.parse(storedAdmins);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdminUsers(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_ADMINS, JSON.stringify(ROOT_SEED_ADMINS));
      }

      // 5. Admin Session
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

  const pendingCount = pendingSubmissions.filter((s) => s.status === "pending").length;
  const isAdmin = !!currentAdmin;
  const isSuperAdmin = currentAdmin?.role === "super_admin";

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
      return { success: true };
    },
    [adminUsers]
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
        localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(updated));
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
        localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(updated));
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
        localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(updated));
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

  // Reset to seed data
  const resetToSeedData = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(ROOT_SEED_MEMBERS));
      localStorage.setItem(STORAGE_PENDING, JSON.stringify(ROOT_SEED_PENDING));
      localStorage.setItem(STORAGE_EVENTS, JSON.stringify(ROOT_SEED_EVENTS));
      localStorage.setItem(STORAGE_ADMINS, JSON.stringify(ROOT_SEED_ADMINS));
    } catch (e) {
      console.error(e);
    }
    setMembers(ROOT_SEED_MEMBERS);
    setPendingSubmissions(ROOT_SEED_PENDING);
    setEvents(ROOT_SEED_EVENTS);
    setAdminUsers(ROOT_SEED_ADMINS);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
