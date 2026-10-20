import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDaysUntilAnniversary } from "@/lib/lunar";

export async function GET() {
  try {
    const anniversaries = await prisma.ancestorAnniversary.findMany({
      orderBy: [{ lunarMonth: "asc" }, { lunarDay: "asc" }],
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            generation: true,
            branch: { select: { branchName: true } },
          },
        },
      },
    });

    const enriched = anniversaries.map((ann) => {
      const { daysRemaining, isToday, isUpcoming } = getDaysUntilAnniversary(
        ann.lunarDay,
        ann.lunarMonth
      );
      return {
        ...ann,
        daysRemaining,
        isToday,
        isUpcoming,
      };
    });

    // Sắp xếp ngày sắp tới gần nhất lên đầu
    enriched.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return NextResponse.json({ anniversaries: enriched });
  } catch (error: any) {
    console.error("Anniversaries GET error:", error);
    return NextResponse.json({ error: "Lỗi khi tải lịch giỗ." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, lunarDay, lunarMonth, location, description, memberId, reminderDaysBefore } = body;

    if (!title || !lunarDay || !lunarMonth) {
      return NextResponse.json(
        { error: "Tên lễ giỗ, ngày âm và tháng âm là bắt buộc." },
        { status: 400 }
      );
    }

    const clan = await prisma.clan.findFirst();
    if (!clan) {
      return NextResponse.json({ error: "Chưa có dòng họ." }, { status: 400 });
    }

    const newAnn = await prisma.ancestorAnniversary.create({
      data: {
        clanId: clan.id,
        memberId: memberId || null,
        title: title.trim(),
        lunarDay: Number(lunarDay),
        lunarMonth: Number(lunarMonth),
        location: location?.trim() || null,
        description: description?.trim() || null,
        reminderDaysBefore: Number(reminderDaysBefore) || 7,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thêm lịch giỗ thành công!",
      anniversary: newAnn,
    });
  } catch (error: any) {
    console.error("Anniversaries POST error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm ngày giỗ." }, { status: 500 });
  }
}
