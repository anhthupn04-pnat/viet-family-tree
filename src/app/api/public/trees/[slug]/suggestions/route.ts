import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/public/trees/:slug/suggestions
 * Gửi đề xuất đóng góp thông tin phả hệ từ thành viên/khách vãng lai (Crowdsourcing).
 * Hỗ trợ tham số :slug là ID, shareSlug hoặc slug của cây gia phả.
 * - Lưu vào hàng đợi MemberSuggestion với trạng thái PENDING.
 * - Không ảnh hưởng trực tiếp đến cây gia phả cho đến khi Ban Trị Sự duyệt.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    // Kiểm tra cây tồn tại qua id, shareSlug hoặc slug
    const tree = await prisma.tree.findFirst({
      where: {
        OR: [
          { id: slug },
          { shareSlug: cleanSlug },
          { slug: cleanSlug },
        ],
      },
    });

    if (!tree) {
      return NextResponse.json(
        { error: "Cây gia phả không tồn tại trong hệ thống." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { targetMemberId, senderName, senderPhone, suggestionType, proposedData } = body;

    if (!senderName || !senderName.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập Họ và tên của bạn để Ban trị sự liên hệ đối chiếu." },
        { status: 400 }
      );
    }

    if (!suggestionType || !["EDIT_INFO", "ADD_CHILD", "REPORT_ERROR"].includes(suggestionType)) {
      return NextResponse.json(
        { error: "Loại đề xuất không hợp lệ (EDIT_INFO, ADD_CHILD hoặc REPORT_ERROR)." },
        { status: 400 }
      );
    }

    if (!proposedData) {
      return NextResponse.json(
        { error: "Dữ liệu đề xuất không được để trống." },
        { status: 400 }
      );
    }

    // Tạo bản ghi đề xuất
    const suggestion = await prisma.memberSuggestion.create({
      data: {
        treeId: tree.id,
        targetMemberId: targetMemberId ? String(targetMemberId).trim() : null,
        senderName: senderName.trim(),
        senderPhone: senderPhone ? String(senderPhone).trim() : null,
        suggestionType,
        proposedData: typeof proposedData === "string" ? proposedData : JSON.stringify(proposedData),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đề xuất của bạn đã được gửi thành công đến Ban Trị Sự để kiểm duyệt.",
      suggestionId: suggestion.id,
    });
  } catch (error: any) {
    console.error("POST /api/public/trees/:slug/suggestions error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi gửi đề xuất: " + error.message },
      { status: 500 }
    );
  }
}
