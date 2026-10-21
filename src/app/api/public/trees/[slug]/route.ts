import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskMemberListForPrivacy } from "@/lib/treePrivacy";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/trees/:slug
 * Lấy dữ liệu Cây Gia Phả công khai (Public Share Link).
 * - Tự động đối chiếu slug hoặc shareSlug.
 * - Kiểm tra cờ isPublic và passcode bảo vệ nếu có cài đặt.
 * - TỰ ĐỘNG BẢO VỆ DỮ LIỆU CÁ NHÂN (Privacy Filter): Làm mờ SĐT và địa chỉ chi tiết của người còn sống.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    // Tìm kiếm theo shareSlug, slug hoặc ID
    const tree = await prisma.tree.findFirst({
      where: {
        OR: [
          { shareSlug: cleanSlug },
          { slug: cleanSlug },
          { id: cleanSlug },
        ],
      },
      include: {
        members: {
          orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
        },
      },
    });

    if (!tree) {
      return NextResponse.json(
        { error: "Không tìm thấy cây gia phả tương ứng với liên kết chia sẻ này." },
        { status: 404 }
      );
    }

    if (tree.status === "LOCKED") {
      return NextResponse.json(
        { error: "Cây gia phả này hiện đang bị tạm khóa bởi Tổng quản trị hệ thống." },
        { status: 403 }
      );
    }

    // Kiểm tra cờ cho phép công khai
    if (!tree.isPublic) {
      return NextResponse.json(
        { error: "Cây gia phả này chưa được Ban Quản Trị bật chế độ chia sẻ công khai." },
        { status: 403 }
      );
    }

    // Kiểm tra nếu có thiết lập Mật khẩu truy cập (Passcode)
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

    // Mask thông tin cá nhân của người còn sống (Public Privacy Filter)
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
