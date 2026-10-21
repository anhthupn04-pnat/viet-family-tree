import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ treeId: string; eventId: string }> }
) {
  try {
    const { treeId, eventId } = await params;
    const authCheck = await ensureTreeManagerAccess(request, treeId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const existing = await prisma.treeEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing || existing.treeId !== treeId) {
      return NextResponse.json(
        { error: "Sự kiện không tồn tại." },
        { status: 404 }
      );
    }

    await prisma.treeEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa sự kiện thành công.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + error.message },
      { status: 500 }
    );
  }
}
