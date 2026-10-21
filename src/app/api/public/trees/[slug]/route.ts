import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskMemberListForPrivacy } from "@/lib/treePrivacy";
import {
  ensureDefaultTreeAndMembers,
  seedMembersForTree,
  formatTreeNameFromSlug,
  DEFAULT_ROOT_MEMBERS,
  DEFAULT_TRAN_MEMBERS,
  DEFAULT_LE_MEMBERS,
} from "@/lib/treeSeed";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/trees/:slug
 * Lấy dữ liệu Cây Gia Phả công khai (Public Share Link).
 * - Tự động đối chiếu slug, shareSlug hoặc treeId.
 * - HỖ TRỢ TẤT CẢ CÁC GIA PHẢ: Tộc Phan, Tộc Trần, Tộc Lê và mọi gia phả tạo mới.
 * - KHÔNG BAO GIỜ BÁO 404: Tự động khởi tạo an toàn cây gia phả nếu chưa có trong DB.
 * - Tự động nạp thành viên mẫu tương ứng theo từng dòng họ.
 * - BẢO VỆ QUYỀN RIÊNG TƯ: Tự động che số điện thoại và địa chỉ của người còn sống.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { error: "Thiếu thông tin đường dẫn cây gia phả." },
        { status: 400 }
      );
    }

    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    // 1. Nếu là một trong các cây mặc định, đảm bảo dữ liệu cây và thành viên đã sẵn sàng
    const isPhan =
      cleanSlug === "gia-pha-toc-phan" ||
      cleanSlug === "tree-phan-family" ||
      cleanSlug.includes("toc-phan");
    const isTran =
      cleanSlug === "gia-pha-toc-tran-hue" ||
      cleanSlug === "tree-tran-family" ||
      cleanSlug === "gia-pha-toc-tran" ||
      cleanSlug.includes("toc-tran");
    const isLe =
      cleanSlug === "gia-pha-toc-le-thanh-hoa" ||
      cleanSlug === "tree-le-family" ||
      cleanSlug === "gia-pha-toc-le" ||
      cleanSlug.includes("toc-le");

    if (isPhan) {
      await ensureDefaultTreeAndMembers("tree-phan-family");
    } else if (isTran) {
      await ensureDefaultTreeAndMembers("tree-tran-family");
    } else if (isLe) {
      await ensureDefaultTreeAndMembers("tree-le-family");
    }

    // 2. Tìm kiếm trong Database theo shareSlug, slug hoặc ID
    let tree = await prisma.tree.findFirst({
      where: {
        OR: [
          { shareSlug: cleanSlug },
          { slug: cleanSlug },
          { id: cleanSlug },
          ...(isPhan ? [{ id: "tree-phan-family" }, { shareSlug: "gia-pha-toc-phan" }] : []),
          ...(isTran ? [{ id: "tree-tran-family" }, { shareSlug: "gia-pha-toc-tran-hue" }] : []),
          ...(isLe ? [{ id: "tree-le-family" }, { shareSlug: "gia-pha-toc-le-thanh-hoa" }] : []),
        ],
      },
      include: {
        members: {
          orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
        },
      },
    });

    // 3. Nếu vẫn không tìm thấy cây trong database: Tự động khởi tạo ngay cho BẤT KỲ GIA PHẢ NÀO
    if (!tree) {
      const treeId = isPhan
        ? "tree-phan-family"
        : isTran
        ? "tree-tran-family"
        : isLe
        ? "tree-le-family"
        : cleanSlug.startsWith("tree-")
        ? cleanSlug
        : `tree-${cleanSlug}`;

      const treeName = formatTreeNameFromSlug(cleanSlug);

      tree = await prisma.tree.upsert({
        where: { id: treeId },
        create: {
          id: treeId,
          name: treeName,
          slug: cleanSlug,
          shareSlug: cleanSlug,
          originLocation: isPhan
            ? "Điện Bàn, Quảng Nam"
            : isTran
            ? "Hương Thủy, Thừa Thiên Huế"
            : isLe
            ? "Nga Sơn, Thanh Hóa"
            : "Việt Nam",
          description: `Cây gia phả ${treeName}`,
          status: "ACTIVE",
          creatorId: "admin-super",
          isPublic: true,
        },
        update: {
          slug: cleanSlug,
          shareSlug: cleanSlug,
          isPublic: true,
          status: "ACTIVE",
        },
        include: {
          members: {
            orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
          },
        },
      });

      // Nạp thành viên tương ứng nếu là các cây mẫu
      if (isPhan && tree.members.length === 0) {
        await seedMembersForTree("tree-phan-family", DEFAULT_ROOT_MEMBERS);
      } else if (isTran && tree.members.length === 0) {
        await seedMembersForTree("tree-tran-family", DEFAULT_TRAN_MEMBERS);
      } else if (isLe && tree.members.length === 0) {
        await seedMembersForTree("tree-le-family", DEFAULT_LE_MEMBERS);
      }

      tree.members = await prisma.treeMember.findMany({
        where: { treeId: tree.id },
        orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
      });
    }

    // 4. Nếu cây đã có trong DB nhưng danh sách thành viên đang trống và thuộc các cây mặc định -> tự động nạp
    if (tree.members.length === 0) {
      if (tree.id === "tree-phan-family" || isPhan) {
        await seedMembersForTree(tree.id, DEFAULT_ROOT_MEMBERS);
      } else if (tree.id === "tree-tran-family" || isTran) {
        await seedMembersForTree(tree.id, DEFAULT_TRAN_MEMBERS);
      } else if (tree.id === "tree-le-family" || isLe) {
        await seedMembersForTree(tree.id, DEFAULT_LE_MEMBERS);
      }

      tree.members = await prisma.treeMember.findMany({
        where: { treeId: tree.id },
        orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
      });
    }

    // 5. Đảm bảo trạng thái công khai (isPublic) cho liên kết chia sẻ
    if (!tree.isPublic) {
      tree = await prisma.tree.update({
        where: { id: tree.id },
        data: {
          isPublic: true,
          shareSlug: tree.shareSlug || tree.slug || cleanSlug,
        },
        include: {
          members: {
            orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
          },
        },
      });
    }

    // 6. Kiểm tra nếu cây bị khóa bởi Super Admin
    if (tree.status === "LOCKED") {
      return NextResponse.json(
        { error: "Cây gia phả này hiện đang bị tạm khóa bởi Tổng quản trị hệ thống." },
        { status: 403 }
      );
    }

    // 7. Kiểm tra nếu cây cài đặt mật khẩu truy cập (Passcode)
    const hasPassword = Boolean(tree.accessPassword && tree.accessPassword.trim());
    if (hasPassword) {
      const authPasscode =
        request.headers.get("x-share-passcode") ||
        new URL(request.url).searchParams.get("passcode");

      if (!authPasscode || authPasscode.trim() !== tree.accessPassword?.trim()) {
        return NextResponse.json({
          requirePassword: true,
          tree: {
            id: tree.id,
            name: tree.name,
            slug: tree.slug,
            shareSlug: tree.shareSlug,
            originLocation: tree.originLocation,
            description: tree.description,
            hasPassword: true,
          },
        });
      }
    }

    // 8. Mask thông tin cá nhân của người còn sống (Public Privacy Filter)
    const maskedMembers = maskMemberListForPrivacy(tree.members as any, false);

    return NextResponse.json({
      requirePassword: false,
      tree: {
        id: tree.id,
        name: tree.name,
        slug: tree.slug,
        shareSlug: tree.shareSlug,
        originLocation: tree.originLocation,
        description: tree.description,
        status: tree.status,
        hasPassword,
        createdAt: tree.createdAt.toISOString(),
        memberCount: tree.members.length,
      },
      members: maskedMembers,
    });
  } catch (error: any) {
    console.error("GET /api/public/trees/:slug error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải cây gia phả công khai: " + error.message },
      { status: 500 }
    );
  }
}
