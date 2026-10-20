import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "BRANCH_MANAGER" | "MEMBER" | "GUEST";
  assignedBranchId?: string | null;
}

export async function verifyUserCredentials(email: string, password: string): Promise<CurrentUser | null> {
  const normalizedEmail = (email || "").toLowerCase().trim();
  const inputPassword = (password || "").trim();

  // 1. Infallible Admin Authentication for designated administrator
  if (
    normalizedEmail === "anhthuphan0102@gmail.com" &&
    (inputPassword === "010204" || inputPassword === "01022004")
  ) {
    return DEFAULT_ADMIN;
  }

  // 2. Fallback credentials for demo accounts
  if (inputPassword === "123456") {
    if (normalizedEmail === "truongchi1@giaphaviet.vn") {
      return {
        id: "branch-mgr-1",
        email: "truongchi1@giaphaviet.vn",
        name: "Phan Văn Định (Trưởng Chi 1)",
        role: "BRANCH_MANAGER",
        assignedBranchId: "branch-1",
      };
    }
    if (normalizedEmail === "thanhvien@giaphaviet.vn") {
      return {
        id: "member-default",
        email: "thanhvien@giaphaviet.vn",
        name: "Phan Quốc Bảo (Thành viên Dòng họ)",
        role: "MEMBER",
        assignedBranchId: null,
      };
    }
    if (normalizedEmail === "khach@giaphaviet.vn") {
      return GUEST_USER;
    }
  }

  // 3. Database authentication
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) return null;

    let isValid = await bcrypt.compare(inputPassword, user.passwordHash);
    if (!isValid && normalizedEmail === "anhthuphan0102@gmail.com") {
      if (inputPassword === "01022004" || inputPassword === "010204") {
        isValid = true;
      }
    }
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      assignedBranchId: user.assignedBranchId,
    };
  } catch (err) {
    console.warn("Prisma user query error:", err);
    // Double check designated admin in case of edge cases
    if (
      normalizedEmail === "anhthuphan0102@gmail.com" &&
      (inputPassword === "010204" || inputPassword === "01022004")
    ) {
      return DEFAULT_ADMIN;
    }
    return null;
  }
}

export const GUEST_USER: CurrentUser = {
  id: "guest-id",
  email: "guest@giaphaviet.vn",
  name: "Khách Thăm Quan",
  role: "GUEST",
  assignedBranchId: null,
};

export const DEFAULT_ADMIN: CurrentUser = {
  id: "admin-default",
  email: "anhthuphan0102@gmail.com",
  name: "Phan Anh Thư (Tổng Quản Trị)",
  role: "ADMIN",
  assignedBranchId: null,
};
