import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId/funds
 * Lấy danh sách giao dịch thu/chi và tổng hợp số dư quỹ của cây gia phả.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    const funds = await prisma.treeFund.findMany({
      where: { treeId },
      orderBy: { date: "desc" },
    });

    const totalIncome = funds
      .filter((f) => f.type === "INCOME")
      .reduce((sum, f) => sum + f.amount, 0);

    const totalExpense = funds
      .filter((f) => f.type === "EXPENSE")
      .reduce((sum, f) => sum + f.amount, 0);

    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      funds,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: funds.length,
      },
    });
  } catch (error: any) {
    console.error("GET tree funds error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải quỹ dòng họ: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees/:treeId/funds
 * Ghi nhận đóng góp thu quỹ hoặc chi phí tu sửa dòng họ.
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
    const { type = "INCOME", amount, title, contributorOrRecipient, date, notes } = body;

    if (!title || !title.trim() || !contributorOrRecipient || !contributorOrRecipient.trim()) {
      return NextResponse.json(
        { error: "Tiêu đề giao dịch và Người đóng góp/Người nhận không được để trống." },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Số tiền giao dịch phải lớn hơn 0." },
        { status: 400 }
      );
    }

    const newFund = await prisma.treeFund.create({
      data: {
        treeId,
        type: type === "EXPENSE" ? "EXPENSE" : "INCOME",
        amount: numericAmount,
        title: title.trim(),
        contributorOrRecipient: contributorOrRecipient.trim(),
        date: date ? String(date).trim() : new Date().toISOString().split("T")[0],
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã ghi nhận giao dịch "${newFund.title}" (${newFund.type === "INCOME" ? "Thu" : "Chi"}: ${newFund.amount.toLocaleString("vi-VN")} đ) thành công!`,
      fund: newFund,
    });
  } catch (error: any) {
    console.error("POST tree fund error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi ghi nhận quỹ: " + error.message },
      { status: 500 }
    );
  }
}
