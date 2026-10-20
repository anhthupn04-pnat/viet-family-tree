import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.changeRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Change requests GET error:", error);
    return NextResponse.json({ error: "Lỗi khi tải danh sách đề xuất." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      memberId,
      requesterName,
      requesterEmail,
      changeType = "UPDATE_PROFILE",
      proposedData,
      reason,
      evidenceSource,
    } = body;

    if (!requesterName || !reason || !evidenceSource) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên người đề xuất, lý do và nguồn tư liệu chứng minh." },
        { status: 400 }
      );
    }

    const clan = await prisma.clan.findFirst();
    if (!clan) {
      return NextResponse.json({ error: "Chưa có dòng họ." }, { status: 400 });
    }

    const newReq = await prisma.changeRequest.create({
      data: {
        clanId: clan.id,
        memberId: memberId || null,
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail?.trim() || null,
        changeType,
        proposedData: typeof proposedData === "string" ? proposedData : JSON.stringify(proposedData || {}),
        reason: reason.trim(),
        evidenceSource: evidenceSource.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đề xuất chỉnh sửa đã được gửi tới Ban Quản Trị dòng họ để xác minh!",
      request: newReq,
    });
  } catch (error: any) {
    console.error("Change requests POST error:", error);
    return NextResponse.json({ error: "Lỗi khi gửi đề xuất." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, reviewerNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Thiếu ID hoặc trạng thái duyệt." }, { status: 400 });
    }

    const updated = await prisma.changeRequest.update({
      where: { id },
      data: {
        status, // APPROVED, REJECTED
        reviewerNote: reviewerNote?.trim() || null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: status === "APPROVED" ? "Đã phê duyệt đề xuất!" : "Đã từ chối đề xuất.",
      request: updated,
    });
  } catch (error: any) {
    console.error("Change requests PUT error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật trạng thái đề xuất." }, { status: 500 });
  }
}
