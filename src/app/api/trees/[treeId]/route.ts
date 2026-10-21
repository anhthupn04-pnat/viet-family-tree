import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, requireTreePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId
 * Lấy chi tiết cây gia phả và danh sách thành viên của cây đó.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        members: {
          orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
        },
        userRoles: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!tree) {
      return NextResponse.json(
        { error: `Không tìm thấy cây gia phả với mã ID '${treeId}'.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tree: {
        id: tree.id,
        name: tree.name,
        slug: tree.slug,
        originLocation: tree.originLocation,
        description: tree.description,
        status: tree.status,
        creatorId: tree.creatorId,
        createdAt: tree.createdAt.toISOString(),
        updatedAt: tree.updatedAt.toISOString(),
        memberCount: tree.members.length,
        managers: tree.userRoles.map((r) => ({
          userId: r.userId,
          name: r.user?.name,
          email: r.user?.email,
          role: r.role,
        })),
        members: tree.members,
      },
    });
  } catch (error: any) {
    console.error("GET /api/trees/:treeId error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải chi tiết cây gia phả: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trees/:treeId
 * Cập nhật thông tin cây gia phả (Đổi tên, Đóng/Mở, Khóa, Sửa mô tả).
 * BẢO MẬT: CHỈ SUPER_ADMIN MỚI CÓ QUYỀN THỰC HIỆN.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { treeId } = await params;
    const body = await request.json();
    const { name, originLocation, description, status } = body;

    const existing = await prisma.tree.findUnique({
      where: { id: treeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cây gia phả không tồn tại." },
        { status: 404 }
      );
    }

    const updated = await prisma.tree.update({
      where: { id: treeId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        originLocation: originLocation !== undefined ? originLocation?.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật cây gia phả '${updated.name}' thành công!`,
      tree: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/trees/:treeId error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật cây gia phả: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trees/:treeId
 * Xóa hoàn toàn một cây gia phả cùng các thành viên liên quan (Cascade).
 * BẢO MẬT: CHỈ SUPER_ADMIN MỚI CÓ QUYỀN XÓA CÂY GIA PHẢ.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { treeId } = await params;

    const existing = await prisma.tree.findUnique({
      where: { id: treeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cây gia phả cần xóa không tồn tại." },
        { status: 404 }
      );
    }

    await prisma.tree.delete({
      where: { id: treeId },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa hoàn toàn cây gia phả '${existing.name}'.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/trees/:treeId error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa cây gia phả: " + error.message },
      { status: 500 }
    );
  }
}
