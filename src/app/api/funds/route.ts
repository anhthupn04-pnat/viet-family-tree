import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fundType = searchParams.get("fundType");

    const where: any = {};
    if (fundType && fundType !== "ALL") {
      where.fundType = fundType;
    }

    const transactions = await prisma.clanFund.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Tính toán tổng hợp số dư
    let totalIncome = 0;
    let totalExpense = 0;
    const byType: Record<string, { income: number; expense: number }> = {
      CONSTRUCTION: { income: 0, expense: 0 },
      SCHOLARSHIP: { income: 0, expense: 0 },
      CHARITY: { income: 0, expense: 0 },
      GENERAL: { income: 0, expense: 0 },
    };

    transactions.forEach((tx) => {
      if (tx.transactionType === "INCOME") {
        totalIncome += tx.amount;
        if (byType[tx.fundType]) byType[tx.fundType].income += tx.amount;
      } else {
        totalExpense += tx.amount;
        if (byType[tx.fundType]) byType[tx.fundType].expense += tx.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        byType,
      },
    });
  } catch (error: any) {
    console.error("Funds GET error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy thông tin quỹ dòng họ." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fundType = "GENERAL",
      transactionType = "INCOME",
      amount,
      title,
      contributorOrRecipient,
      date,
      notes,
    } = body;

    if (!title || !amount || !contributorOrRecipient) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên khoản, số tiền và người đóng góp / người nhận." },
        { status: 400 }
      );
    }

    const clan = await prisma.clan.findFirst();
    if (!clan) {
      return NextResponse.json({ error: "Chưa có dòng họ." }, { status: 400 });
    }

    const tx = await prisma.clanFund.create({
      data: {
        clanId: clan.id,
        fundType,
        transactionType,
        amount: Number(amount),
        title: title.trim(),
        contributorOrRecipient: contributorOrRecipient.trim(),
        date: date ? new Date(date) : new Date(),
        status: "APPROVED",
        approvedBy: "Phan Anh Thư (Admin)",
        notes: notes?.trim() || null,
      },
    });

    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        clanId: clan.id,
        userName: "Quản trị viên",
        userEmail: "anhthuphan0102@gmail.com",
        action: transactionType === "INCOME" ? "GHI NHẬN THU QUỸ" : "GHI NHẬN CHI QUỸ",
        target: tx.title,
        details: `Số tiền: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tx.amount)}, Người: ${tx.contributorOrRecipient}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ghi nhận giao dịch quỹ thành công!",
      transaction: tx,
    });
  } catch (error: any) {
    console.error("Funds POST error:", error);
    return NextResponse.json({ error: "Lỗi khi ghi nhận quỹ." }, { status: 500 });
  }
}
