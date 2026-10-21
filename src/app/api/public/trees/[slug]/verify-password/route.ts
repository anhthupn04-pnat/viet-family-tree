import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/public/trees/:slug/verify-password
 * Xác thực mật khẩu truy cập (Passcode) của cây gia phả công khai.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu truy cập gia phả." },
        { status: 400 }
      );
    }

    const tree = await prisma.tree.findFirst({
      where: {
        OR: [
          { shareSlug: cleanSlug },
          { slug: cleanSlug },
          { id: cleanSlug },
          ...(cleanSlug === "gia-pha-toc-phan" ? [{ id: "tree-phan-family" }] : []),
          ...(cleanSlug === "gia-pha-toc-tran-hue" ? [{ id: "tree-tran-family" }] : []),
          ...(cleanSlug === "gia-pha-toc-le-thanh-hoa" ? [{ id: "tree-le-family" }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        accessPassword: true,
        isPublic: true,
        status: true,
      },
    });

    if (!tree) {
      return NextResponse.json(
        { error: "Không tìm thấy cây gia phả tương ứng." },
        { status: 404 }
      );
    }

    if (!tree.isPublic) {
      return NextResponse.json(
        { error: "Cây gia phả chưa mở quyền xem công khai." },
        { status: 403 }
      );
    }

    if (!tree.accessPassword || tree.accessPassword.trim() === "") {
      return NextResponse.json({
        success: true,
        message: "Cây gia phả này không cài mật khẩu, cho phép xem tự do.",
      });
    }

    if (password.trim() !== tree.accessPassword.trim()) {
      return NextResponse.json(
        { error: "Mật khẩu truy cập không chính xác. Vui lòng kiểm tra lại!" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Xác thực thành công! Chào mừng bạn đến với ${tree.name}.`,
    });
  } catch (error: any) {
    console.error("POST verify-password error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xác thực mật khẩu: " + error.message },
      { status: 500 }
    );
  }
}
