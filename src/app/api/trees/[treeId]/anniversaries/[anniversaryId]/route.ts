import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ treeId: string; anniversaryId: string }> }
) {
  try {
    const { treeId, anniversaryId } = await params;
    const authCheck = await ensureTreeManagerAccess(request, treeId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const existing = await prisma.treeAnniversary.findUnique({
      where: { id: anniversaryId },
    });

    if (!existing || existing.treeId !== treeId) {
      return NextResponse.json(
        { error: "Lịch kỵ nhật không tồn tại." },
        { status: 404 }
      );
    }

    await prisma.treeAnniversary.delete({
      where: { id: anniversaryId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa ngày giỗ thành công.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + error.message },
      { status: 500 }
    );
  }
}
