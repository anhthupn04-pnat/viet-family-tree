import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, getAuthUserFromRequest } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees
 * Lấy danh sách toàn bộ cây gia phả.
 * - SUPER_ADMIN: Thấy toàn bộ cây gia phả trong hệ thống.
 * - TREE_MANAGER / VIEWER: Thấy các cây đang hoạt động hoặc được phân công.
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);

    let whereClause: any = {};
    if (!user || (user.role !== "SUPER_ADMIN" && !user.assignedTrees.includes("*"))) {
      // Người dùng thường hoặc khách chỉ xem cây ACTIVE hoặc cây được phân quyền
      if (user && user.assignedTrees.length > 0) {
        whereClause = {
          OR: [{ status: "ACTIVE" }, { id: { in: user.assignedTrees } }],
        };
      } else {
        whereClause = { status: "ACTIVE" };
      }
    }

    let trees = await prisma.tree.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: true },
        },
        userRoles: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Nếu chưa có cây nào trong database, tự động seed Cây gốc Tộc Phan để hệ thống luôn có dữ liệu
    if (trees.length === 0) {
      const defaultTree = await prisma.tree.create({
        data: {
          id: "tree-phan-family",
          name: "Gia Phả Tộc Phan (Quảng Nam)",
          slug: "gia-pha-toc-phan",
          originLocation: "Điện Bàn, Quảng Nam",
          description: "Cây gia phả chính thống của dòng tộc Phan Thạnh",
          status: "ACTIVE",
          creatorId: "admin-super",
        },
      });

      trees = [
        {
          ...defaultTree,
          _count: { members: 0 },
          userRoles: [],
        } as any,
      ];
    }

    const formatted = trees.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      originLocation: t.originLocation,
      description: t.description,
      status: t.status,
      creatorId: t.creatorId,
      isPublic: t.isPublic,
      shareSlug: t.shareSlug,
      hasPassword: Boolean(t.accessPassword),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      memberCount: t._count?.members || 0,
      managers: (t.userRoles || []).map((r) => ({
        userId: r.userId,
        name: r.user?.name,
        email: r.user?.email,
        role: r.role,
      })),
    }));

    return NextResponse.json({ trees: formatted });
  } catch (error: any) {
    console.error("GET /api/trees error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách cây gia phả: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees
 * Tạo cây gia phả mới trong hệ thống.
 * BẢO MẬT: CHỈ DUY NHẤT SUPER_ADMIN MỚI CÓ QUYỀN GỌI ENDPOINT NÀY.
 */
export async function POST(request: Request) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }
    const { user } = authCheck;

    const body = await request.json();
    const { name, originLocation, description, slug } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Tên cây gia phả không được để trống." },
        { status: 400 }
      );
    }

    // Tự sinh slug nếu không truyền
    const generatedSlug =
      (slug && String(slug).trim()) ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    // Kiểm tra slug trùng lặp
    const existing = await prisma.tree.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Đường dẫn (slug) '${generatedSlug}' đã tồn tại. Vui lòng chọn đường dẫn khác.` },
        { status: 400 }
      );
    }

    const newTree = await prisma.tree.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        originLocation: originLocation?.trim() || null,
        description: description?.trim() || null,
        status: "ACTIVE",
        creatorId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo cây gia phả '${newTree.name}' thành công!`,
      tree: {
        ...newTree,
        memberCount: 0,
      },
    });
  } catch (error: any) {
    console.error("POST /api/trees error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo cây gia phả: " + error.message },
      { status: 500 }
    );
  }
}
