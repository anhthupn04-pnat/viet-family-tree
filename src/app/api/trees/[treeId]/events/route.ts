import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId/events
 * Lấy danh sách sự kiện / thông báo của gia phả.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    const events = await prisma.treeEvent.findMany({
      where: { treeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("GET tree events error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải sự kiện gia phả: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees/:treeId/events
 * Đăng tin sự kiện dòng họ mới (Chạp họ, Tảo mộ, Họp họ, Khánh thành từ đường).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;
    const authCheck = await ensureTreeManagerAccess(request, treeId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const body = await request.json();
    const { title, category = "NEWS", content, eventDate, location, isPublic = true } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Tiêu đề và nội dung sự kiện không được để trống." },
        { status: 400 }
      );
    }

    const newEvent = await prisma.treeEvent.create({
      data: {
        treeId,
        title: title.trim(),
        category,
        content: content.trim(),
        eventDate: eventDate ? String(eventDate).trim() : null,
        location: location ? String(location).trim() : null,
        isPublic: Boolean(isPublic),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã đăng sự kiện "${newEvent.title}" thành công!`,
      event: newEvent,
    });
  } catch (error: any) {
    console.error("POST tree event error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi lưu sự kiện: " + error.message },
      { status: 500 }
    );
  }
}
