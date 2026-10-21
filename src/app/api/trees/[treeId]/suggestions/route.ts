import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTreePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId/suggestions
 * Lấy danh sách hàng đợi đề xuất thông tin của cây gia phả.
 * BẢO MẬT: SUPER_ADMIN hoặc TREE_MANAGER phụ trách treeId.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;
    const authCheck = await requireTreePermission(request, treeId, "TREE_MANAGER");
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const suggestions = await prisma.memberSuggestion.findMany({
      where: { treeId },
      orderBy: { createdAt: "desc" },
    });

    const parsed = suggestions.map((s) => {
      let parsedData = s.proposedData;
      try {
        parsedData = JSON.parse(s.proposedData);
      } catch (e) {}

      return {
        id: s.id,
        treeId: s.treeId,
        targetMemberId: s.targetMemberId,
        senderName: s.senderName,
        senderPhone: s.senderPhone,
        suggestionType: s.suggestionType,
        proposedData: parsedData,
        status: s.status,
        reviewNote: s.reviewNote,
        reviewedBy: s.reviewedBy,
        reviewedAt: s.reviewedAt?.toISOString() || null,
        createdAt: s.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ suggestions: parsed });
  } catch (error: any) {
    console.error("GET /api/trees/:treeId/suggestions error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách đề xuất: " + error.message },
      { status: 500 }
    );
  }
}
