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

    const statusParam = searchParams.get("status");

    const where: any = {};

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    } else if (!statusParam) {
      where.status = { notIn: ["pending", "rejected"] };
    }

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

    let members: any[] = [];
    try {
      members = await prisma.memberProfile.findMany({
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
    } catch (dbErr) {
      console.warn("DB members findMany warning, using mock fallback:", dbErr);
      members = [];
    }

    if (!members || members.length === 0) {
      const { MOCK_MEMBERS } = await import("@/lib/mockData");
      let filtered = [...MOCK_MEMBERS];
      if (branchId && branchId !== "ALL") filtered = filtered.filter((m) => m.branchId === branchId);
      if (generation && generation !== "ALL") filtered = filtered.filter((m) => m.generation === parseInt(generation, 10));
      if (gender && gender !== "ALL") filtered = filtered.filter((m) => m.gender === gender);
      if (isAlive !== null && isAlive !== undefined && isAlive !== "ALL") {
        const aliveBool = isAlive === "true";
        filtered = filtered.filter((m) => m.isAlive === aliveBool);
      }
      if (statusParam === "pending") filtered = [];
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.fullName.toLowerCase().includes(q) ||
            (m.courtesyName && m.courtesyName.toLowerCase().includes(q))
        );
      }
      return NextResponse.json({ members: filtered, total: filtered.length });
    }

    const formattedMembers = members.map((m: any) => {
      const spouses = [
        ...(m.husbandMarriages || []).map((rel: any) => ({ ...rel.wife, relation: "WIFE" })),
        ...(m.wifeMarriages || []).map((rel: any) => ({ ...rel.husband, relation: "HUSBAND" })),
      ];
      return {
        ...m,
        spouses,
        spouseId: spouses.length > 0 ? spouses[0].id : null,
      };
    });

    return NextResponse.json({ members: formattedMembers, total: formattedMembers.length });
  } catch (error: any) {
    console.error("Members GET error:", error);
    const { MOCK_MEMBERS } = await import("@/lib/mockData");
    return NextResponse.json({ members: MOCK_MEMBERS, total: MOCK_MEMBERS.length });
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
      birthOrder,
      isMartyr = false,
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
      status,
      submitterName,
      submitterNote,
      isAdmin,
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

    // Phân quyền: Nếu không phải Admin thì mặc định ở trạng thái 'pending'
    const memberStatus = isAdmin ? (status || "approved") : "pending";
    const isVerified = memberStatus === "approved";

    const newMember = await prisma.memberProfile.create({
      data: {
        clanId: clan.id,
        memberCode,
        fullName: fullName.trim(),
        courtesyName: courtesyName?.trim() || null,
        gender,
        generation: genNum,
        birthOrder: birthOrder?.trim() || null,
        isMartyr: Boolean(isMartyr),
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
        isVerified,
        status: memberStatus,
        submitterName: submitterName?.trim() || (isAdmin ? "Ban Quản Trị" : "Cộng đồng đề xuất"),
        submitterNote: submitterNote?.trim() || null,
      } as any,
    });

    // Nếu có chọn vợ/chồng
    if (spouseId) {
      const isMale = gender === "MALE";
      const husbandId = isMale ? newMember.id : spouseId;
      const wifeId = isMale ? spouseId : newMember.id;

      const existingMarriage = await prisma.marriage.findFirst({
        where: { husbandId, wifeId },
      });

      if (!existingMarriage) {
        await prisma.marriage.create({
          data: {
            husbandId,
            wifeId,
            marriageOrder: 1,
          },
        });
      }
    }

    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        clanId: clan.id,
        userName: isAdmin ? "Quản trị viên" : (submitterName || "Người dùng phổ thông"),
        userEmail: isAdmin ? "anhthuphan0102@gmail.com" : "guest@giaphaviet.vn",
        action: isAdmin ? "THÊM THÀNH VIÊN" : "ĐỀ XUẤT THÀNH VIÊN",
        target: newMember.fullName,
        details: `${isAdmin ? "Thêm thành viên" : "Đề xuất thành viên mới"}: ${newMember.fullName} (Mã: ${newMember.memberCode}, Đời ${newMember.generation}, Trạng thái: ${memberStatus})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: isAdmin
        ? "Thêm thành viên mới thành công!"
        : "Đề xuất thêm thành viên mới đã được gửi thành công và đang chờ Ban Quản Trị phê duyệt trước khi hiển thị lên cây gia phả!",
      member: newMember,
    });
  } catch (error: any) {
    console.error("Members POST error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm thành viên mới: " + (error?.message || "") }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      action, // 'APPROVE' | 'REJECT'
      fullName,
      courtesyName,
      gender,
      generation,
      birthOrder,
      isMartyr,
      birthSolar,
      birthLunar,
      deathSolar,
      deathLunar,
      isAlive,
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
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thành viên." }, { status: 400 });
    }

    // Xử lý phê duyệt / từ chối nhanh từ Admin
    if (action === "APPROVE") {
      const approved = await prisma.memberProfile.update({
        where: { id },
        data: { status: "approved", isVerified: true } as any,
      });
      return NextResponse.json({
        success: true,
        message: `Đã phê duyệt thành viên "${approved.fullName}" lên cây gia phả chính!`,
        member: approved,
      });
    }

    if (action === "REJECT") {
      const rejected = await prisma.memberProfile.update({
        where: { id },
        data: { status: "rejected" } as any,
      });
      return NextResponse.json({
        success: true,
        message: `Đã từ chối đề xuất thành viên "${rejected.fullName}".`,
        member: rejected,
      });
    }

    if (!fullName) {
      return NextResponse.json({ error: "Thiếu thông tin họ và tên thành viên." }, { status: 400 });
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
        birthOrder: birthOrder !== undefined ? (birthOrder?.trim() || null) : undefined,
        isMartyr: isMartyr !== undefined ? Boolean(isMartyr) : undefined,
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

    // Đồng bộ mối quan hệ vợ/chồng nếu có gửi spouseId
    if (spouseId !== undefined) {
      const memberGender = gender || updated.gender;
      const isMale = memberGender === "MALE";

      if (spouseId) {
        const husbandId = isMale ? id : spouseId;
        const wifeId = isMale ? spouseId : id;

        // Xóa liên kết hôn nhân cũ khác với spouseId mới (nếu có)
        await prisma.marriage.deleteMany({
          where: {
            OR: [
              { husbandId: id, wifeId: { not: spouseId } },
              { wifeId: id, husbandId: { not: spouseId } },
            ],
          },
        });

        const existingMarriage = await prisma.marriage.findFirst({
          where: { husbandId, wifeId },
        });

        if (!existingMarriage) {
          await prisma.marriage.create({
            data: {
              husbandId,
              wifeId,
              marriageOrder: 1,
            },
          });
        }
      } else {
        // Nếu spouseId là rỗng/null, xóa liên kết hôn phối hiện tại
        await prisma.marriage.deleteMany({
          where: {
            OR: [{ husbandId: id }, { wifeId: id }],
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ thành viên thành công!",
      member: updated,
    });
  } catch (error: any) {
    console.error("Members PUT error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật thành viên: " + (error?.message || "") }, { status: 500 });
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

    // Xóa các liên kết quan hệ trước để đảm bảo tính toàn vẹn khóa ngoại trong SQLite
    await prisma.marriage.deleteMany({
      where: {
        OR: [{ husbandId: id }, { wifeId: id }],
      },
    });

    await prisma.ancestorAnniversary.deleteMany({
      where: { memberId: id },
    });

    await prisma.changeRequest.deleteMany({
      where: { memberId: id },
    });

    await prisma.memberProfile.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa hồ sơ thành viên thành công.",
    });
  } catch (error: any) {
    console.error("Members DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa thành viên: " + (error?.message || "") }, { status: 500 });
  }
}
