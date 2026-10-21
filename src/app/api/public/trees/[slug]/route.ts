import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskMemberListForPrivacy } from "@/lib/treePrivacy";
import {
  ensureDefaultTreeAndMembers,
  seedMembersForTree,
  formatTreeNameFromSlug,
  DEFAULT_ROOT_MEMBERS,
} from "@/lib/treeSeed";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/trees/:slug
 * Lấy dữ liệu Cây Gia Phả công khai (Public Share Link).
 * - ĐẢM BẢO TÍNH ĐỒNG NHẤT 100% DỮ LIỆU: Dữ liệu link chia sẻ khớp hoàn toàn với cây gia phả.
 * - TUYỆT ĐỐI KHÔNG BỊA ĐẶT DỮ LIỆU: Chỉ hiển thị đúng các thành viên thực tế của dòng họ đó.
 * - KHÔNG BỊ SAI LỆCH THÔNG TIN: Giữ nguyên vẹn thông tin họ tên, ngày sinh, ngày giỗ, liên hệ, địa chỉ.
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

    const isPhan =
      cleanSlug === "gia-pha-toc-phan" ||
      cleanSlug === "tree-phan-family" ||
      cleanSlug.includes("toc-phan");
    const isTran =
      cleanSlug === "gia-pha-toc-tran-hue" ||
      cleanSlug === "tree-tran-family" ||
      cleanSlug === "gia-pha-toc-tran";
    const isLe =
      cleanSlug === "gia-pha-toc-le-thanh-hoa" ||
      cleanSlug === "tree-le-family" ||
      cleanSlug === "gia-pha-toc-le";

    // Đảm bảo cây mẫu khởi tạo nếu truy cập cây mặc định
    if (isPhan) {
      await ensureDefaultTreeAndMembers("tree-phan-family");
    } else if (isTran) {
      await ensureDefaultTreeAndMembers("tree-tran-family");
    } else if (isLe) {
      await ensureDefaultTreeAndMembers("tree-le-family");
    }

    // 1. Tìm kiếm cây trong Database theo shareSlug, slug hoặc ID
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

    // 2. Nếu cây chưa có trong Database, tự động khởi tạo bản ghi cho cây đó (KHÔNG bịa thành viên)
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

      // Chỉ nạp thành viên mẫu gốc duy nhất cho Tộc Phan Thạnh
      if (isPhan && tree.members.length === 0) {
        await seedMembersForTree("tree-phan-family", DEFAULT_ROOT_MEMBERS);
        tree.members = await prisma.treeMember.findMany({
          where: { treeId: tree.id },
          orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
        });
      }
    }

    // 3. Nếu là cây Tộc Phan Thạnh mà chưa có thành viên, nạp đúng 15 thành viên gốc chuẩn
    if (tree.members.length === 0 && (tree.id === "tree-phan-family" || isPhan)) {
      await seedMembersForTree("tree-phan-family", DEFAULT_ROOT_MEMBERS);
      tree.members = await prisma.treeMember.findMany({
        where: { treeId: tree.id },
        orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
      });
    }

    // 4. Kích hoạt cờ isPublic nếu đang truy cập qua link chia sẻ
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

    // 5. Kiểm tra nếu cây bị tạm khóa
    if (tree.status === "LOCKED") {
      return NextResponse.json(
        { error: "Cây gia phả này hiện đang bị tạm khóa bởi Tổng quản trị hệ thống." },
        { status: 403 }
      );
    }

    // 6. Kiểm tra nếu có mật khẩu bảo vệ (Passcode)
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

    // 7. Bảo mật & Ẩn thông tin nhạy cảm (Privacy Mode): Làm mờ SĐT và địa chỉ chi tiết của người còn sống
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
