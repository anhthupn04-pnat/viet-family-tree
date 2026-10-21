import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTreePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/trees/:treeId/suggestions/:id/approve
 * Phê duyệt (Approve) hoặc Từ chối (Reject) đề xuất đóng góp.
 * - Khi Approve: Tự động hợp nhất (Merge) dữ liệu vào bảng TreeMember.
 * BẢO MẬT: SUPER_ADMIN hoặc TREE_MANAGER phụ trách treeId.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ treeId: string; id: string }> }
) {
  try {
    const { treeId, id: suggestionId } = await params;
    const authCheck = await requireTreePermission(request, treeId, "TREE_MANAGER");
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }
    const { user } = authCheck;

    const body = await request.json();
    const { action = "approve", reviewNote } = body; // action: 'approve' | 'reject'

    const suggestion = await prisma.memberSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion || suggestion.treeId !== treeId) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu đề xuất này." },
        { status: 404 }
      );
    }

    if (suggestion.status !== "PENDING") {
      return NextResponse.json(
        { error: `Đề xuất này đã được xử lý trước đó (Trạng thái: ${suggestion.status}).` },
        { status: 400 }
      );
    }

    // Xử lý từ chối
    if (action === "reject") {
      const updated = await prisma.memberSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: "REJECTED",
          reviewNote: reviewNote?.trim() || "Ban quản trị từ chối đề xuất này.",
          reviewedBy: user.name,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Đã từ chối đề xuất.",
        suggestion: updated,
      });
    }

    // Xử lý chấp thuận (Approve) & Hợp nhất vào TreeMember
    let dataObj: any = {};
    try {
      dataObj = JSON.parse(suggestion.proposedData);
    } catch (e) {
      dataObj = suggestion.proposedData;
    }

    await prisma.$transaction(async (tx) => {
      if (suggestion.suggestionType === "EDIT_INFO" && suggestion.targetMemberId) {
        // Cập nhật thông tin thành viên hiện có
        await tx.treeMember.update({
          where: { id: suggestion.targetMemberId },
          data: {
            fullName: dataObj.fullName !== undefined ? dataObj.fullName : undefined,
            nickname: dataObj.nickname !== undefined ? dataObj.nickname : undefined,
            birthDate: dataObj.birthDate !== undefined ? dataObj.birthDate : undefined,
            deathDate: dataObj.deathDate !== undefined ? dataObj.deathDate : undefined,
            isAlive: dataObj.isAlive !== undefined ? Boolean(dataObj.isAlive) : undefined,
            phone: dataObj.phone !== undefined ? dataObj.phone : undefined,
            address: dataObj.address !== undefined ? dataObj.address : undefined,
            notes: dataObj.notes !== undefined ? dataObj.notes : undefined,
          },
        });
      } else if (suggestion.suggestionType === "ADD_CHILD") {
        // Thêm con cháu mới
        const parentId = suggestion.targetMemberId || dataObj.fatherId || dataObj.motherId;
        let parentGen = 1;
        let isFather = true;

        if (parentId) {
          const parent = await tx.treeMember.findUnique({ where: { id: parentId } });
          if (parent) {
            parentGen = parent.generation;
            isFather = parent.gender === "male";
          }
        }

        const newId =
          dataObj.id ||
          `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        await tx.treeMember.create({
          data: {
            id: newId,
            treeId,
            fullName: dataObj.fullName || "Thành viên mới",
            nickname: dataObj.nickname || null,
            gender: dataObj.gender || "male",
            generation: dataObj.generation || parentGen + 1,
            birthDate: dataObj.birthDate || null,
            deathDate: dataObj.deathDate || null,
            isAlive: dataObj.isAlive !== undefined ? Boolean(dataObj.isAlive) : true,
            fatherId: isFather ? parentId : dataObj.fatherId || null,
            motherId: !isFather ? parentId : dataObj.motherId || null,
            phone: dataObj.phone || null,
            address: dataObj.address || null,
            notes: dataObj.notes || `Được thêm từ đề xuất của ${suggestion.senderName}`,
          },
        });
      }

      // Cập nhật trạng thái đề xuất thành APPROVED
      await tx.memberSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: "APPROVED",
          reviewNote: reviewNote?.trim() || "Đã phê duyệt và hợp nhất tự động vào phả hệ.",
          reviewedBy: user.name,
          reviewedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Đã phê duyệt đề xuất và cập nhật cây gia phả thành công!",
    });
  } catch (error: any) {
    console.error("PATCH approve suggestion error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi phê duyệt đề xuất: " + error.message },
      { status: 500 }
    );
  }
}
