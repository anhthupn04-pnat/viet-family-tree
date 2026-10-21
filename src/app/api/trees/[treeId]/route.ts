import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, requireTreePermission, ensureTreeManagerAccess, getAuthUserFromRequest } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId
 * Lấy chi tiết cây gia phả và danh sách thành viên của cây đó.
 * BẢO MẬT: Chặn tuyệt đối can thiệp chéo giữa các gia phả cho vai trò TREE_MANAGER.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    // Kiểm tra nếu là TREE_MANAGER thì phải có quyền trên treeId này
    const authUser = await getAuthUserFromRequest(request);
    if (authUser && authUser.role === "TREE_MANAGER") {
      const accessCheck = await ensureTreeManagerAccess(request, treeId);
      if (accessCheck instanceof NextResponse) {
        return accessCheck;
      }
    }


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
        isPublic: tree.isPublic,
        shareSlug: tree.shareSlug,
        hasPassword: Boolean(tree.accessPassword),
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
 * Cập nhật thông tin cây gia phả (Đổi tên, Đóng/Mở, Sửa mô tả, Cấu hình chia sẻ công khai).
 * BẢO MẬT: SUPER_ADMIN hoặc TREE_MANAGER phụ trách treeId.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;
    const authCheck = await requireTreePermission(request, treeId, "TREE_MANAGER");
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const body = await request.json();
    const { name, originLocation, description, status, isPublic, shareSlug, accessPassword } = body;

    const existing = await prisma.tree.findUnique({
      where: { id: treeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cây gia phả không tồn tại." },
        { status: 404 }
      );
    }

    // Check shareSlug uniqueness if changed
    if (shareSlug && shareSlug.trim() && shareSlug.trim() !== existing.shareSlug) {
      const cleanShareSlug = shareSlug.trim().toLowerCase();
      const conflict = await prisma.tree.findUnique({
        where: { shareSlug: cleanShareSlug },
      });
      if (conflict && conflict.id !== treeId) {
        return NextResponse.json(
          { error: `Đường dẫn chia sẻ (slug) '${cleanShareSlug}' đã được sử dụng bởi một gia phả khác.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.tree.update({
      where: { id: treeId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        originLocation: originLocation !== undefined ? originLocation?.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        status: status !== undefined ? status : undefined,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : undefined,
        shareSlug: shareSlug !== undefined ? (shareSlug ? shareSlug.trim().toLowerCase() : null) : undefined,
        accessPassword: accessPassword !== undefined ? (accessPassword ? accessPassword.trim() : null) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật cấu hình cây gia phả '${updated.name}' thành công!`,
      tree: {
        ...updated,
        hasPassword: Boolean(updated.accessPassword),
        accessPassword: undefined, // Không lộ mật khẩu trong response
      },
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
