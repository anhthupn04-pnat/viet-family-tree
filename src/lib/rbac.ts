import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserSystemRole } from "@/types/family";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserSystemRole;
  assignedTrees: string[]; // List of tree IDs where user is TREE_MANAGER
}

/**
 * Lấy thông tin người dùng gửi yêu cầu thông qua Headers, Token hoặc Session.
 * Hỗ trợ linh hoạt cho cả môi trường REST API Client lẫn Next.js Server Components.
 */
export async function getAuthUserFromRequest(
  request: Request
): Promise<AuthenticatedUser | null> {
  // 1. Kiểm tra header Authorization hoặc custom user header
  const authHeader = request.headers.get("authorization") || request.headers.get("x-user-auth");
  const userEmailHeader = request.headers.get("x-user-email");

  // Fallback nhanh cho Super Admin mặc định
  if (userEmailHeader === "anhthuphan0102@gmail.com") {
    return {
      id: "admin-super",
      email: "anhthuphan0102@gmail.com",
      name: "Phan Anh Thư (Super Admin)",
      role: "SUPER_ADMIN",
      assignedTrees: ["*"], // Quyền trên mọi cây
    };
  }

  let userEmail: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    // Hỗ trợ token email hoặc JWT payload decode
    if (token.includes("@")) {
      userEmail = token.toLowerCase();
    } else {
      try {
        // Simple base64 token decode nếu có
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);
        if (parsed.email) userEmail = parsed.email.toLowerCase();
      } catch (e) {
        // Fallback kiểm tra token = id hoặc email
        userEmail = token;
      }
    }
  } else if (userEmailHeader) {
    userEmail = userEmailHeader.toLowerCase();
  }

  if (!userEmail) {
    return null;
  }

  // Super Admin mặc định
  if (userEmail === "anhthuphan0102@gmail.com") {
    return {
      id: "admin-super",
      email: "anhthuphan0102@gmail.com",
      name: "Phan Anh Thư (Super Admin)",
      role: "SUPER_ADMIN",
      assignedTrees: ["*"],
    };
  }

  // Tra cứu trong cơ sở dữ liệu
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        treeRoles: {
          select: {
            treeId: true,
            role: true,
          },
        },
      },
    });

    if (!dbUser) {
      return null;
    }

    const assignedTrees = dbUser.treeRoles
      .filter((r) => r.role === "TREE_MANAGER")
      .map((r) => r.treeId);

    let systemRole: UserSystemRole = "VIEWER";
    if (dbUser.role === "SUPER_ADMIN" || dbUser.role === "ADMIN") {
      systemRole = "SUPER_ADMIN";
    } else if (dbUser.role === "TREE_MANAGER" || assignedTrees.length > 0) {
      systemRole = "TREE_MANAGER";
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: systemRole,
      assignedTrees: systemRole === "SUPER_ADMIN" ? ["*"] : assignedTrees,
    };
  } catch (err) {
    console.warn("Lỗi tra cứu auth user:", err);
    return null;
  }
}

/**
 * Middleware Guard: Chỉ cho phép SUPER_ADMIN
 */
export async function requireSuperAdmin(
  request: Request
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Yêu cầu xác thực tài khoản. Vui lòng đăng nhập." },
      { status: 401 }
    );
  }

  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        error:
          "Từ chối truy cập: Chỉ có SUPER_ADMIN mới có quyền thực hiện chức năng này.",
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware Guard: Kiểm tra quyền trên Cây Gia Phả cụ thể
 * - SUPER_ADMIN: Toàn quyền trên mọi cây
 * - TREE_MANAGER: Phải được phân quyền rõ ràng trên treeId này
 * - VIEWER: Chỉ có quyền đọc (khi minRole = 'VIEWER')
 */
export async function requireTreePermission(
  request: Request,
  treeId: string,
  minRole: "VIEWER" | "TREE_MANAGER" = "TREE_MANAGER"
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Yêu cầu xác thực tài khoản. Vui lòng đăng nhập." },
      { status: 401 }
    );
  }

  // 1. Super Admin luôn có toàn quyền
  if (user.role === "SUPER_ADMIN") {
    return { user };
  }

  // 2. Kiểm tra nếu chỉ cần quyền xem (VIEWER)
  if (minRole === "VIEWER") {
    return { user };
  }

  // 3. Kiểm tra quyền TREE_MANAGER trên cây được giao
  const hasTreeRole =
    user.assignedTrees.includes("*") || user.assignedTrees.includes(treeId);

  if (!hasTreeRole) {
    return NextResponse.json(
      {
        error: `Từ chối truy cập: Bạn không có quyền TREE_MANAGER trên cây gia phả này (ID: ${treeId}).`,
      },
      { status: 403 }
    );
  }

  return { user };
}
