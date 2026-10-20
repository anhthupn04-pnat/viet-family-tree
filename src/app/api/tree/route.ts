import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MEMBERS } from "@/lib/mockData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    const where: any = {
      status: { notIn: ["pending", "rejected"] },
    };
    if (branchId && branchId !== "ALL") {
      where.AND = [
        { status: { notIn: ["pending", "rejected"] } },
        { OR: [{ branchId }, { generation: 1 }] },
      ];
      delete where.status;
    }

    let members: any[] = [];
    try {
      members = await prisma.memberProfile.findMany({
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
                  isMartyr: true,
                  birthOrder: true,
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
                  isMartyr: true,
                  birthOrder: true,
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
    } catch (dbErr) {
      console.warn("Tree DB fetch warning, using mock data:", dbErr);
      members = [];
    }

    // Fallback to MOCK_MEMBERS if DB has no members or fails
    if (!members || members.length === 0) {
      let filtered = [...MOCK_MEMBERS];
      if (branchId && branchId !== "ALL") {
        filtered = filtered.filter(
          (m) => m.branchId === branchId || m.generation === 1
        );
      }

      const generationsMap: Record<number, any[]> = {};
      const maxGen = filtered.reduce((m, item) => Math.max(m, item.generation), 1);
      for (let g = 1; g <= maxGen; g++) {
        generationsMap[g] = [];
      }
      filtered.forEach((m) => {
        if (!generationsMap[m.generation]) generationsMap[m.generation] = [];
        generationsMap[m.generation].push(m);
      });

      return NextResponse.json({
        members: filtered,
        generations: generationsMap,
        totalMembers: filtered.length,
        maxGeneration: maxGen,
      });
    }

    // Process from DB records
    const generationsMap: Record<number, any[]> = {};
    const maxGen = members.reduce((m, item) => Math.max(m, item.generation), 1);

    for (let g = 1; g <= maxGen; g++) {
      generationsMap[g] = [];
    }

    const formattedList: any[] = [];

    members.forEach((m) => {
      const spouseList = [
        ...m.husbandMarriages.map((rel: any) => ({ ...rel.wife, relation: "WIFE" })),
        ...m.wifeMarriages.map((rel: any) => ({ ...rel.husband, relation: "HUSBAND" })),
      ];

      const childrenIds = [
        ...m.childrenAsFather.map((c: any) => c.id),
        ...m.childrenAsMother.map((c: any) => c.id),
      ];

      const formatted = {
        id: m.id,
        memberCode: m.memberCode,
        fullName: m.fullName,
        courtesyName: m.courtesyName,
        gender: m.gender,
        generation: m.generation,
        birthOrder: m.birthOrder || null,
        isAlive: m.isAlive,
        isMartyr: Boolean(m.isMartyr),
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

      formattedList.push(formatted);

      if (!generationsMap[m.generation]) {
        generationsMap[m.generation] = [];
      }
      generationsMap[m.generation].push(formatted);
    });

    return NextResponse.json({
      members: formattedList,
      generations: generationsMap,
      totalMembers: formattedList.length,
      maxGeneration: maxGen,
    });
  } catch (error: any) {
    console.error("Tree GET error:", error);
    // Ultimate fallback to MOCK_MEMBERS
    return NextResponse.json({
      members: MOCK_MEMBERS,
      totalMembers: MOCK_MEMBERS.length,
      maxGeneration: 3,
    });
  }
}
