import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.clanDocument.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy tài liệu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type = "IMAGE", fileUrl, era, author, description } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: "Tiêu đề và đường dẫn tài liệu là bắt buộc." }, { status: 400 });
    }

    const clan = await prisma.clan.findFirst();
    if (!clan) return NextResponse.json({ error: "Chưa có dòng họ." }, { status: 400 });

    const doc = await prisma.clanDocument.create({
      data: {
        clanId: clan.id,
        title: title.trim(),
        type,
        fileUrl: fileUrl.trim(),
        era: era?.trim() || null,
        author: author?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lưu trữ tư liệu thành công!",
      document: doc,
    });
  } catch (error: any) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu tư liệu." }, { status: 500 });
  }
}
