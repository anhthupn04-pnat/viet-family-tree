import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";
import { lunarToSolar } from "@/utils/lunar";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId/anniversaries
 * Lấy danh sách ngày giỗ (Lịch Kỵ Nhật) của cây gia phả.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    const anniversaries = await prisma.treeAnniversary.findMany({
      where: { treeId },
      orderBy: [{ lunarMonth: "asc" }, { lunarDay: "asc" }],
    });

    return NextResponse.json({ success: true, anniversaries });
  } catch (error: any) {
    console.error("GET anniversaries error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải lịch kỵ nhật: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees/:treeId/anniversaries
 * Thêm mới ngày giỗ vào Lịch Kỵ Nhật.
 * Tự động đồng bộ lịch Âm sang Dương lịch cho năm hiện tại.
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
    const { title, lunarDay, lunarMonth, isLeapMonth = false, location, notes, memberId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Tên ngày lễ giỗ (Kỵ nhật) không được để trống." },
        { status: 400 }
      );
    }

    const dayNum = parseInt(lunarDay, 10);
    const monthNum = parseInt(lunarMonth, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || dayNum < 1 || dayNum > 30 || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "Ngày âm (1-30) hoặc tháng âm (1-12) không hợp lệ." },
        { status: 400 }
      );
    }

    // Tự động đồng bộ ngày Dương lịch
    let solarDateStr = "";
    try {
      const currentYear = new Date().getFullYear();
      const solar = lunarToSolar(dayNum, monthNum, currentYear);
      if (solar) {
        solarDateStr = `${String(solar.day).padStart(2, "0")}/${String(solar.month).padStart(2, "0")}/${solar.year}`;
      }
    } catch (e) {}

    const newAnniversary = await prisma.treeAnniversary.create({
      data: {
        treeId,
        memberId: memberId || null,
        title: title.trim(),
        lunarDay: dayNum,
        lunarMonth: monthNum,
        isLeapMonth: Boolean(isLeapMonth),
        solarDate: solarDateStr || null,
        location: location ? location.trim() : null,
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm Lịch Kỵ Nhật "${newAnniversary.title}" thành công!`,
      anniversary: newAnniversary,
    });
  } catch (error: any) {
    console.error("POST anniversary error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi lưu lịch kỵ nhật: " + error.message },
      { status: 500 }
    );
  }
}
