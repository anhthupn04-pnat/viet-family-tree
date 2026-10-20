import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MEMBERS } from "@/lib/mockData";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    // 1. Kiểm tra nếu có cấu hình Supabase thì ưu tiên truy vấn Supabase Postgres
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from("members")
          .select("*")
          .eq("status", "approved")
          .order("generation_level", { ascending: true })
          .order("order_in_family", { ascending: true, nullsFirst: false });

        const { data: sbMembers, error: sbErr } = await query;

        if (!sbErr && sbMembers && sbMembers.length > 0) {
          const formattedList = sbMembers.map((m: any) => ({
            id: m.id,
            memberCode: `GP-G${m.generation_level}-${m.id.slice(0, 4)}`,
            fullName: m.full_name,
            gender: (m.gender || "male").toUpperCase(),
            generation: m.generation_level,
            birthOrder: m.birth_order_title || (m.order_in_family ? `Con thứ ${m.order_in_family}` : null),
            isAlive: m.is_alive,
            isMartyr: Boolean(m.is_martyr),
            birthSolar: m.birth_date_solar,
            deathSolar: m.death_date_solar,
            birthLunar: m.birth_date_lunar,
            deathLunar: m.death_date_lunar,
            avatarUrl: m.avatar_url,
            burialPlace: m.burial_location,
            biography: m.bio,
            fatherId: m.father_id,
            motherId: m.mother_id,
            spouseId: m.spouse_id,
            spouses: m.spouse_id
              ? [{ id: m.spouse_id, fullName: "Phối ngẫu", relation: "SPOUSE" }]
              : [],
            childrenIds: sbMembers
              .filter((c: any) => c.father_id === m.id || c.mother_id === m.id)
              .map((c: any) => c.id),
          }));

          const maxGen = formattedList.reduce((acc: number, item: any) => Math.max(acc, item.generation), 1);
          const generationsMap: Record<number, any[]> = {};
          for (let g = 1; g <= maxGen; g++) generationsMap[g] = [];
          formattedList.forEach((m: any) => generationsMap[m.generation].push(m));

          return NextResponse.json(
            {
              members: formattedList,
              generations: generationsMap,
              totalMembers: formattedList.length,
              maxGeneration: maxGen,
              source: "supabase",
            },
            { headers: NO_CACHE_HEADERS }
          );
        }
      } catch (sbEx) {
        console.warn("Supabase fetch error, fallback to Prisma:", sbEx);
      }
    }

    // 2. Truy vấn từ Prisma SQLite (local hoặc fallback)
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

    return NextResponse.json(
      {
        members: formattedList,
        generations: generationsMap,
        totalMembers: formattedList.length,
        maxGeneration: maxGen,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("Tree GET error:", error);
    // Ultimate fallback to MOCK_MEMBERS
    return NextResponse.json(
      {
        members: MOCK_MEMBERS,
        totalMembers: MOCK_MEMBERS.length,
        maxGeneration: 3,
      },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
