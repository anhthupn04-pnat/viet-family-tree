import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ treeId: string; fundId: string }> }
) {
  try {
    const { treeId, fundId } = await params;
    const authCheck = await ensureTreeManagerAccess(request, treeId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const existing = await prisma.treeFund.findUnique({
      where: { id: fundId },
    });

    if (!existing || existing.treeId !== treeId) {
      return NextResponse.json(
        { error: "Bản ghi thu chi không tồn tại." },
        { status: 404 }
      );
    }

    await prisma.treeFund.delete({
      where: { id: fundId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa bản ghi thu chi thành công.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + error.message },
      { status: 500 }
    );
  }
}
