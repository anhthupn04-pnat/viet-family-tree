import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateKinship } from "@/lib/kinship";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberAId, memberBId } = body;

    if (!memberAId || !memberBId) {
      return NextResponse.json(
        { error: "Vui lòng chọn đủ 2 thành viên để tra cứu quan hệ." },
        { status: 400 }
      );
    }

    const members = await prisma.memberProfile.findMany({
      select: {
        id: true,
        fullName: true,
        gender: true,
        generation: true,
        fatherId: true,
        motherId: true,
        branchId: true,
        birthSolar: true,
        branch: { select: { branchName: true } },
      },
    });

    const mapped = members.map((m) => ({
      ...m,
      branchName: m.branch?.branchName || null,
    }));

    const result = calculateKinship(memberAId, memberBId, mapped);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Kinship POST error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi tính toán quan hệ xưng hô." },
      { status: 500 }
    );
  }
}
