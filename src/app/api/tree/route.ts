import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    const where: any = {};
    if (branchId && branchId !== "ALL") {
      // Nếu lọc theo chi nhánh, lấy cả Khởi Tổ (đời 1) và các thành viên của chi đó
      where.OR = [{ branchId }, { generation: 1 }];
    }

    const members = await prisma.memberProfile.findMany({
      where,
      orderBy: [{ generation: "asc" }, { memberCode: "asc" }],
      include: {
        branch: { select: { id: true, branchName: true } },
        husbandMarriages: {
          include: {
            wife: {
              select: {
                id: true,
                fullName: true,
                memberCode: true,
                gender: true,
                generation: true,
                isAlive: true,
                birthSolar: true,
                deathSolar: true,
                avatarUrl: true,
              },
            },
          },
        },
        wifeMarriages: {
          include: {
            husband: {
              select: {
                id: true,
                fullName: true,
                memberCode: true,
                gender: true,
                generation: true,
                isAlive: true,
                birthSolar: true,
                deathSolar: true,
                avatarUrl: true,
              },
            },
          },
        },
        childrenAsFather: { select: { id: true } },
        childrenAsMother: { select: { id: true } },
      },
    });

    // Gom nhóm theo thế hệ (Generations)
    const generationsMap: Record<number, any[]> = {};
    const maxGen = members.reduce((m, item) => Math.max(m, item.generation), 1);

    for (let g = 1; g <= maxGen; g++) {
      generationsMap[g] = [];
    }

    members.forEach((m) => {
      const spouseList = [
        ...m.husbandMarriages.map((rel) => ({ ...rel.wife, relation: "WIFE" })),
        ...m.wifeMarriages.map((rel) => ({ ...rel.husband, relation: "HUSBAND" })),
      ];

      const childrenIds = [
        ...m.childrenAsFather.map((c) => c.id),
        ...m.childrenAsMother.map((c) => c.id),
      ];

      const formatted = {
        id: m.id,
        memberCode: m.memberCode,
        fullName: m.fullName,
        courtesyName: m.courtesyName,
        gender: m.gender,
        generation: m.generation,
        isAlive: m.isAlive,
        birthSolar: m.birthSolar,
        deathSolar: m.deathSolar,
        birthLunar: m.birthLunar,
        deathLunar: m.deathLunar,
        avatarUrl: m.avatarUrl,
        burialPlace: m.burialPlace,
        hometown: m.hometown,
        currentResidence: m.currentResidence,
        biography: m.biography,
        branchId: m.branchId,
        branchName: m.branch?.branchName || "Chưa phân chi",
        fatherId: m.fatherId,
        motherId: m.motherId,
        spouses: spouseList,
        childrenIds: Array.from(new Set(childrenIds)),
      };

      if (!generationsMap[m.generation]) {
        generationsMap[m.generation] = [];
      }
      generationsMap[m.generation].push(formatted);
    });

    return NextResponse.json({
      members,
      generations: generationsMap,
      totalMembers: members.length,
      maxGeneration: maxGen,
    });
  } catch (error: any) {
    console.error("Tree GET error:", error);
    return NextResponse.json({ error: "Lỗi khi tải dữ liệu cây gia phả." }, { status: 500 });
  }
}
