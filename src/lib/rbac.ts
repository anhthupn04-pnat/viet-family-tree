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
 * Middleware Guard: Logic kiểm tra quyền hạn nghiêm ngặt theo từng Request cho vai trò TREE_MANAGER.
 * Đảm bảo quản lý theo từng cây gia phả cụ thể và CHẶN TUYỆT ĐỐI việc can thiệp chéo giữa các gia phả.
 * - Super Admin: Toàn quyền truy cập mọi cây.
 * - TREE_MANAGER: Bắt buộc phải có bản ghi UserTreeRole với role 'TREE_MANAGER' trên treeId này.
 * - 403 Forbidden nếu không có quyền.
 */
export async function ensureTreeManagerAccess(
  request: Request,
  treeId: string
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Yêu cầu xác thực tài khoản. Vui lòng đăng nhập.",
      },
      { status: 401 }
    );
  }

  // 1. Super Admin luôn có toàn quyền
  if (user.role === "SUPER_ADMIN" || user.assignedTrees.includes("*")) {
    return { user };
  }

  // 2. Tra cứu cơ sở dữ liệu UserTreeRole
  try {
    const permission = await prisma.userTreeRole.findFirst({
      where: {
        userId: user.id,
        treeId: treeId,
        role: "TREE_MANAGER",
      },
    });

    if (permission || user.assignedTrees.includes(treeId)) {
      return { user };
    }
  } catch (err) {
    console.warn("Lỗi kiểm tra quyền UserTreeRole:", err);
    if (user.assignedTrees.includes(treeId)) {
      return { user };
    }
  }

  // 3. Tuyệt đối cấm can thiệp chéo
  return NextResponse.json(
    {
      success: false,
      error: "Truy cập bị từ chối: Bạn không có quyền quản lý gia phả này.",
    },
    { status: 403 }
  );
}

/**
 * Express / Node.js style Middleware: ensureTreeManagerAccess
 */
export async function ensureTreeManagerAccessExpress(req: any, res: any, next: any) {
  const treeId = req.params?.treeId || req.query?.treeId;
  const userId = req.user?.id;

  if (req.user?.isSuperAdmin || req.user?.role === "SUPER_ADMIN") return next();

  if (!userId || !treeId) {
    return res.status(403).json({
      success: false,
      error: "Truy cập bị từ chối: Bạn không có quyền quản lý gia phả này.",
    });
  }

  try {
    const permission = await prisma.userTreeRole.findFirst({
      where: {
        userId: userId,
        treeId: treeId,
        role: "TREE_MANAGER",
      },
    });

    if (!permission) {
      return res.status(403).json({
        success: false,
        error: "Truy cập bị từ chối: Bạn không có quyền quản lý gia phả này.",
      });
    }
    next();
  } catch (e: any) {
    return res.status(500).json({
      success: false,
      error: "Lỗi xác thực quyền: " + e.message,
    });
  }
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
  if (minRole === "TREE_MANAGER") {
    return ensureTreeManagerAccess(request, treeId);
  }

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

  // 2. VIEWER
  return { user };
}

