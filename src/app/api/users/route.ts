import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * GET /api/users
 * Lấy danh sách toàn bộ người dùng và vai trò quản lý gia phả của họ.
 * BẢO MẬT: CHỈ SUPER_ADMIN.
 */
export async function GET(request: Request) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const users = await prisma.user.findMany({
      include: {
        treeRoles: {
          include: {
            tree: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      assignedTrees: u.treeRoles.map((r) => ({
        treeId: r.treeId,
        treeName: r.tree.name,
        treeSlug: r.tree.slug,
        role: r.role,
        assignedAt: r.assignedAt.toISOString(),
      })),
    }));

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách người dùng: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Tạo tài khoản mới (Username, Email, Mật khẩu tạm, Họ tên, Vai trò).
 * BẢO MẬT: CHỈ SUPER_ADMIN.
 */
export async function POST(request: Request) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const body = await request.json();
    const { email, username, name, password, role = "TREE_MANAGER", assignedTreeIds = [] } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ Email, Họ tên và Mật khẩu tạm thời." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? username.trim().toLowerCase() : null;

    // Kiểm tra trùng lặp email
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: `Email '${cleanEmail}' đã tồn tại trong hệ thống.` },
        { status: 400 }
      );
    }

    if (cleanUsername) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: `Tên đăng nhập '${cleanUsername}' đã được sử dụng.` },
          { status: 400 }
        );
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        name: name.trim(),
        passwordHash,
        role: role.toUpperCase(),
        status: "ACTIVE",
      },
    });

    // Nếu có danh sách cây được gán quyền TREE_MANAGER ngay từ đầu
    if (Array.isArray(assignedTreeIds) && assignedTreeIds.length > 0) {
      for (const treeId of assignedTreeIds) {
        await prisma.userTreeRole.create({
          data: {
            userId: newUser.id,
            treeId,
            role: "TREE_MANAGER",
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản cho '${newUser.name}' thành công!`,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo tài khoản: " + error.message },
      { status: 500 }
    );
  }
}
