import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * POST /api/users/:userId/roles
 * Phân quyền quản lý gia phả (Gán/Hủy quyền TREE_MANAGER cho các cây gia phả).
 * BẢO MẬT: CHỈ SUPER_ADMIN.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { userId } = await params;
    const body = await request.json();
    const { treeIds, role = "TREE_MANAGER" } = body;

    if (!Array.isArray(treeIds)) {
      return NextResponse.json(
        { error: "Tham số 'treeIds' phải là một danh sách ID cây gia phả." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `Không tìm thấy người dùng với ID '${userId}'.` },
        { status: 404 }
      );
    }

    // Xóa các phân quyền cũ
    await prisma.userTreeRole.deleteMany({
      where: { userId },
    });

    // Thêm các phân quyền mới
    if (treeIds.length > 0) {
      const createData = treeIds.map((treeId) => ({
        userId,
        treeId,
        role,
      }));

      await prisma.userTreeRole.createMany({
        data: createData,
      });

      // Cập nhật vai trò hệ thống của User thành TREE_MANAGER nếu đang là VIEWER
      if (targetUser.role === "VIEWER") {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "TREE_MANAGER" },
        });
      }
    }

    const updatedRoles = await prisma.userTreeRole.findMany({
      where: { userId },
      include: { tree: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật phân quyền quản lý ${treeIds.length} cây gia phả cho '${targetUser.name}'.`,
      roles: updatedRoles,
    });
  } catch (error: any) {
    console.error("POST /api/users/:userId/roles error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi phân quyền người dùng: " + error.message },
      { status: 500 }
    );
  }
}
