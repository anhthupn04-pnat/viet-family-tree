import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    let clan: any = null;
    try {
      clan = await prisma.clan.findFirst({
        include: {
          branches: {
            orderBy: { branchOrder: "asc" },
          },
          _count: {
            select: {
              members: true,
              branches: true,
              events: true,
              funds: true,
              documents: true,
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn("DB clan query warning, fallback to mock:", dbErr);
    }

    if (!clan) {
      const { MOCK_CLAN, MOCK_BRANCHES, MOCK_MEMBERS } = await import("@/lib/mockData");
      return NextResponse.json(
        {
          clan: {
            ...MOCK_CLAN,
            branches: MOCK_BRANCHES,
          },
          stats: {
            totalMembers: MOCK_MEMBERS.length,
            totalBranches: MOCK_BRANCHES.length,
            totalGenerations: 3,
            aliveCount: MOCK_MEMBERS.filter((m) => m.isAlive).length,
            deceasedCount: MOCK_MEMBERS.filter((m) => !m.isAlive).length,
            maleCount: MOCK_MEMBERS.filter((m) => m.gender === "MALE").length,
            femaleCount: MOCK_MEMBERS.filter((m) => m.gender === "FEMALE").length,
          },
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Thống kê thành viên
    const members = await prisma.memberProfile.findMany({
      where: { clanId: clan.id },
      select: {
        generation: true,
        gender: true,
        isAlive: true,
      },
    });

    const maxGen = members.reduce((max, m) => Math.max(max, m.generation), 0);
    const aliveCount = members.filter((m) => m.isAlive).length;
    const deceasedCount = members.filter((m) => !m.isAlive).length;
    const maleCount = members.filter((m) => m.gender === "MALE").length;
    const femaleCount = members.filter((m) => m.gender === "FEMALE").length;

    return NextResponse.json(
      {
        clan,
        stats: {
          totalMembers: members.length,
          totalBranches: clan.branches.length,
          totalGenerations: maxGen,
          aliveCount,
          deceasedCount,
          maleCount,
          femaleCount,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("Clan GET error:", error);
    const { MOCK_CLAN, MOCK_BRANCHES, MOCK_MEMBERS } = await import("@/lib/mockData");
    return NextResponse.json(
      {
        clan: {
          ...MOCK_CLAN,
          branches: MOCK_BRANCHES,
        },
        stats: {
          totalMembers: MOCK_MEMBERS.length,
          totalBranches: MOCK_BRANCHES.length,
          totalGenerations: 3,
          aliveCount: MOCK_MEMBERS.filter((m) => m.isAlive).length,
          deceasedCount: MOCK_MEMBERS.filter((m) => !m.isAlive).length,
          maleCount: MOCK_MEMBERS.filter((m) => m.gender === "MALE").length,
          femaleCount: MOCK_MEMBERS.filter((m) => m.gender === "FEMALE").length,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      couplet1,
      couplet2,
      originLocation,
      mainRegion,
      slug,
      ancestralHall,
      historySummary,
      isPublic = true,
      allowMemberInvite = true,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Tên gia phả và Đường dẫn (slug) là bắt buộc." },
        { status: 400 }
      );
    }

    const existing = await prisma.clan.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Đường dẫn gia phả này đã được sử dụng. Vui lòng chọn đường dẫn khác." },
        { status: 400 }
      );
    }

    const newClan = await prisma.clan.create({
      data: {
        name: name.trim(),
        couplet1: couplet1?.trim() || null,
        couplet2: couplet2?.trim() || null,
        originLocation: originLocation?.trim() || "Chưa xác định",
        mainRegion: mainRegion?.trim() || "Miền Bắc",
        slug: slug.trim().toLowerCase(),
        ancestralHall: ancestralHall?.trim() || null,
        historySummary: historySummary?.trim() || null,
        isPublic: Boolean(isPublic),
        allowMemberInvite: Boolean(allowMemberInvite),
      },
    });

    // Tạo chi nhánh mặc định: Chi 1 - Trưởng Chi
    await prisma.clanBranch.create({
      data: {
        clanId: newClan.id,
        branchName: "Chi 1 - Trưởng Chi",
        branchOrder: 1,
        description: "Chi ngành trưởng trông coi từ đường",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Khởi tạo thông tin gia phả thành công!",
      clan: newClan,
    });
  } catch (error: any) {
    console.error("Clan POST error:", error);
    return NextResponse.json({ error: "Lỗi khi khởi tạo gia phả mới." }, { status: 500 });
  }
}
