import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      // Admin query: list all invites
      const invites = await (prisma as any).invite.findMany({
        orderBy: { createdAt: "desc" },
        include: { clan: { select: { id: true, name: true } } },
      });
      return NextResponse.json({ invites });
    }

    const invite = await (prisma as any).invite.findUnique({
      where: { token },
      include: { clan: { select: { id: true, name: true, couplet1: true, couplet2: true } } },
    });

    if (!invite) {
      return NextResponse.json({ error: "Mã liên kết mời không tồn tại hoặc đã hết hạn." }, { status: 404 });
    }

    if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
      return NextResponse.json({ error: "Liên kết mời đã hết hạn hiệu lực." }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        role: invite.role,
        clanName: invite.clan.name,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("Invites GET error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi kiểm tra liên kết mời." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role = "MEMBER", email, creatorEmail = "anhthuphan0102@gmail.com" } = body;

    const clan = await prisma.clan.findFirst();
    if (!clan) {
      return NextResponse.json({ error: "Chưa khởi tạo gia phả dòng họ." }, { status: 400 });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    const newInvite = await (prisma as any).invite.create({
      data: {
        clanId: clan.id,
        token,
        role,
        email: email?.trim() || null,
        expiresAt,
        createdBy: creatorEmail,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: "Tạo liên kết mời tham gia gia phả thành công!",
      invite: newInvite,
      token,
    });
  } catch (error: any) {
    console.error("Invites POST error:", error);
    return NextResponse.json({ error: "Lỗi khi tạo liên kết mời." }, { status: 500 });
  }
}
