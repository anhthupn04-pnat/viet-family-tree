import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const generation = searchParams.get("generation");
    const gender = searchParams.get("gender");
    const isAlive = searchParams.get("isAlive");
    const query = searchParams.get("q");

    const where: any = {};

    if (branchId && branchId !== "ALL") {
      where.branchId = branchId;
    }
    if (generation && generation !== "ALL") {
      where.generation = parseInt(generation, 10);
    }
    if (gender && gender !== "ALL") {
      where.gender = gender;
    }
    if (isAlive !== null && isAlive !== undefined && isAlive !== "ALL") {
      where.isAlive = isAlive === "true";
    }
    if (query) {
      where.OR = [
        { fullName: { contains: query } },
        { memberCode: { contains: query } },
        { courtesyName: { contains: query } },
        { hometown: { contains: query } },
      ];
    }

    const members = await prisma.memberProfile.findMany({
      where,
      orderBy: [{ generation: "asc" }, { memberCode: "asc" }],
      include: {
        branch: { select: { id: true, branchName: true } },
        father: { select: { id: true, fullName: true, memberCode: true } },
        mother: { select: { id: true, fullName: true, memberCode: true } },
        husbandMarriages: {
          include: { wife: { select: { id: true, fullName: true, memberCode: true } } },
        },
        wifeMarriages: {
          include: { husband: { select: { id: true, fullName: true, memberCode: true } } },
        },
        childrenAsFather: { select: { id: true, fullName: true, memberCode: true, generation: true } },
        childrenAsMother: { select: { id: true, fullName: true, memberCode: true, generation: true } },
      },
    });

    return NextResponse.json({ members, total: members.length });
  } catch (error: any) {
    console.error("Members GET error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách thành viên." }, { status: 500 });
  }
}

// Kiểm tra vòng lặp gia phả (Cycle detection)
async function wouldCreateCycle(memberId: string, potentialParentId: string): Promise<boolean> {
  if (memberId === potentialParentId) return true;

  let currentId: string | null = potentialParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) return true;
    visited.add(currentId);

    if (currentId === memberId) return true; // Chu trình!

    const parent: { fatherId: string | null; motherId: string | null } | null = await prisma.memberProfile.findUnique({
      where: { id: currentId },
      select: { fatherId: true, motherId: true },
    });

    if (!parent) break;
    currentId = parent.fatherId || parent.motherId || null;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      courtesyName,
      gender = "MALE",
      generation = 1,
      birthSolar,
      birthLunar,
      deathSolar,
      deathLunar,
      isAlive = true,
      branchId,
      fatherId,
      motherId,
      spouseId,
      burialPlace,
      hometown,
      currentResidence,
      avatarUrl,
      biography,
      phone,
    } = body;

    if (!fullName) {
      return NextResponse.json({ error: "Họ và tên thành viên là bắt buộc." }, { status: 400 });
    }

    // Lấy clan mặc định
    const clan = await prisma.clan.findFirst();
    if (!clan) {
      return NextResponse.json({ error: "Chưa có dòng họ nào trong hệ thống." }, { status: 400 });
    }

    // Tự sinh mã thành viên chuẩn
    const count = await prisma.memberProfile.count();
    const genNum = Number(generation) || 1;
    const memberCode = `PT-G${genNum}-${(count + 1).toString().padStart(2, "0")}`;

    const newMember = await prisma.memberProfile.create({
      data: {
        clanId: clan.id,
        memberCode,
        fullName: fullName.trim(),
        courtesyName: courtesyName?.trim() || null,
        gender,
        generation: genNum,
        birthSolar: birthSolar || null,
        birthLunar: birthLunar || null,
        deathSolar: deathSolar || null,
        deathLunar: deathLunar || null,
        isAlive: Boolean(isAlive),
        branchId: branchId || null,
        fatherId: fatherId || null,
        motherId: motherId || null,
        burialPlace: burialPlace?.trim() || null,
        hometown: hometown?.trim() || null,
        currentResidence: currentResidence?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        biography: biography?.trim() || null,
        phone: phone?.trim() || null,
        isVerified: true,
      },
    });

    // Nếu có chọn vợ/chồng
    if (spouseId) {
      const isMale = gender === "MALE";
      await prisma.marriage.create({
        data: {
          husbandId: isMale ? newMember.id : spouseId,
          wifeId: isMale ? spouseId : newMember.id,
          marriageOrder: 1,
        },
      });
    }

    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        clanId: clan.id,
        userName: "Quản trị viên",
        userEmail: "anhthuphan0102@gmail.com",
        action: "THÊM THÀNH VIÊN",
        target: newMember.fullName,
        details: `Thêm thành viên mới: ${newMember.fullName} (Mã: ${newMember.memberCode}, Đời ${newMember.generation})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thêm thành viên mới thành công!",
      member: newMember,
    });
  } catch (error: any) {
    console.error("Members POST error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm thành viên mới." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      fullName,
      courtesyName,
      gender,
      generation,
      birthSolar,
      birthLunar,
      deathSolar,
      deathLunar,
      isAlive,
      branchId,
      fatherId,
      motherId,
      burialPlace,
      hometown,
      currentResidence,
      avatarUrl,
      biography,
      phone,
    } = body;

    if (!id || !fullName) {
      return NextResponse.json({ error: "Thiếu thông tin thành viên cần sửa." }, { status: 400 });
    }

    // Kiểm tra chu trình huyết thống nếu có thay đổi cha/mẹ
    if (fatherId && (await wouldCreateCycle(id, fatherId))) {
      return NextResponse.json(
        { error: "Ràng buộc huyết thống vi phạm: Không thể chọn người là hậu duệ làm Cha!" },
        { status: 400 }
      );
    }
    if (motherId && (await wouldCreateCycle(id, motherId))) {
      return NextResponse.json(
        { error: "Ràng buộc huyết thống vi phạm: Không thể chọn người là hậu duệ làm Mẹ!" },
        { status: 400 }
      );
    }

    const updated = await prisma.memberProfile.update({
      where: { id },
      data: {
        fullName: fullName.trim(),
        courtesyName: courtesyName?.trim() || null,
        gender: gender || "MALE",
        generation: Number(generation) || 1,
        birthSolar: birthSolar || null,
        birthLunar: birthLunar || null,
        deathSolar: deathSolar || null,
        deathLunar: deathLunar || null,
        isAlive: isAlive !== undefined ? Boolean(isAlive) : true,
        branchId: branchId || null,
        fatherId: fatherId || null,
        motherId: motherId || null,
        burialPlace: burialPlace?.trim() || null,
        hometown: hometown?.trim() || null,
        currentResidence: currentResidence?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        biography: biography?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ thành viên thành công!",
      member: updated,
    });
  } catch (error: any) {
    console.error("Members PUT error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật thành viên." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thành viên cần xóa." }, { status: 400 });
    }

    // Kiểm tra xem thành viên có con cái hay không
    const childCount = await prisma.memberProfile.count({
      where: {
        OR: [{ fatherId: id }, { motherId: id }],
      },
    });

    if (childCount > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa thành viên này vì đang có ${childCount} người con phụ thuộc trong cây gia phả. Hãy điều chuyển liên kết con cái trước!`,
        },
        { status: 400 }
      );
    }

    await prisma.memberProfile.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa hồ sơ thành viên thành công.",
    });
  } catch (error: any) {
    console.error("Members DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa thành viên." }, { status: 500 });
  }
}
