import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.clanEvent.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Events GET error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy sự kiện." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category = "NEWS", content, eventDate, location, isPublic = true } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Tiêu đề và nội dung là bắt buộc." }, { status: 400 });
    }

    const clan = await prisma.clan.findFirst();
    if (!clan) return NextResponse.json({ error: "Chưa có dòng họ." }, { status: 400 });

    const newEvent = await prisma.clanEvent.create({
      data: {
        clanId: clan.id,
        title: title.trim(),
        category,
        content: content.trim(),
        eventDate: eventDate ? new Date(eventDate) : null,
        location: location?.trim() || null,
        isPublic: Boolean(isPublic),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo tin tức / sự kiện thành công!",
      event: newEvent,
    });
  } catch (error: any) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Lỗi khi tạo sự kiện." }, { status: 500 });
  }
}
