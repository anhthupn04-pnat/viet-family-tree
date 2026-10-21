import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess, getAuthUserFromRequest } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId/members
 * Lấy danh sách thành viên của một cây gia phả cụ thể.
 * Chặn can thiệp chéo: TREE_MANAGER chỉ xem được cây của mình.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    const user = await getAuthUserFromRequest(request);
    if (user && user.role === "TREE_MANAGER") {
      const accessCheck = await ensureTreeManagerAccess(request, treeId);
      if (accessCheck instanceof NextResponse) {
        return accessCheck;
      }
    }

    const members = await prisma.treeMember.findMany({
      where: { treeId },
      orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
    });

    return NextResponse.json({
      success: true,
      treeId,
      members,
    });
  } catch (error: any) {
    console.error("GET /api/trees/:treeId/members error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải thành viên gia phả: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees/:treeId/members
 * Thêm mới một thành viên vào cây gia phả tại vị trí bất kỳ (Gốc, Nhánh, Con, Vợ/Chồng).
 * BẢO MẬT: CHỈ SUPER_ADMIN HOẶC TREE_MANAGER ĐƯỢC PHÂN CÔNG CÂY NÀY.
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
    const {
      id,
      fullName,
      nickname,
      gender = "male",
      generation = 1,
      orderInFamily,
      birthDate,
      birthLunar,
      deathDate,
      deathLunar,
      isAlive = true,
      avatarUrl,
      fatherId,
      motherId,
      spouseId,
      phone,
      address,
      burialPlace,
      titles,
      bio,
      notes,
    } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { error: "Họ và tên thành viên không được để trống." },
        { status: 400 }
      );
    }

    // Sinh ID duy nhất nếu không cung cấp
    const memberId =
      id && String(id).trim()
        ? String(id).trim()
        : `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    // Kiểm tra xem ID đã tồn tại trong cây chưa
    const existing = await prisma.treeMember.findUnique({
      where: { id: memberId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Mã thành viên '${memberId}' đã tồn tại trong hệ thống.` },
        { status: 400 }
      );
    }

    // Kiểm tra tính hợp lệ của fatherId, motherId, spouseId để tránh Foreign Key Violation
    let validFatherId: string | null = null;
    let validMotherId: string | null = null;
    let validSpouseId: string | null = null;

    if (fatherId && String(fatherId).trim()) {
      const f = await prisma.treeMember.findUnique({ where: { id: String(fatherId).trim() } });
      if (f && f.treeId === treeId) validFatherId = f.id;
    }
    if (motherId && String(motherId).trim()) {
      const m = await prisma.treeMember.findUnique({ where: { id: String(motherId).trim() } });
      if (m && m.treeId === treeId) validMotherId = m.id;
    }
    if (spouseId && String(spouseId).trim()) {
      const s = await prisma.treeMember.findUnique({ where: { id: String(spouseId).trim() } });
      if (s && s.treeId === treeId) validSpouseId = s.id;
    }

    // Sử dụng transaction để tạo thành viên và ghép nối quan hệ hai chiều
    const newMember = await prisma.$transaction(async (tx) => {
      const created = await tx.treeMember.create({
        data: {
          id: memberId,
          treeId,
          fullName: fullName.trim(),
          nickname: nickname ? nickname.trim() : null,
          gender: gender === "female" ? "female" : "male",
          generation: Number(generation) || 1,
          orderInFamily: orderInFamily ? Number(orderInFamily) : null,
          birthDate: birthDate ? String(birthDate).trim() : null,
          birthLunar: birthLunar ? String(birthLunar).trim() : null,
          deathDate: deathDate ? String(deathDate).trim() : null,
          deathLunar: deathLunar ? String(deathLunar).trim() : null,
          isAlive: Boolean(isAlive),
          avatarUrl: avatarUrl ? String(avatarUrl).trim() : null,
          fatherId: validFatherId,
          motherId: validMotherId,
          spouseId: validSpouseId,
          phone: phone ? String(phone).trim() : null,
          address: address ? String(address).trim() : null,
          burialPlace: burialPlace ? String(burialPlace).trim() : null,
          titles: titles ? String(titles).trim() : null,
          bio: bio ? String(bio).trim() : null,
          notes: notes ? String(notes).trim() : null,
        },
      });

      // Tự động đối xứng hôn phối spouseId
      if (spouseId && spouseId.trim()) {
        const spouse = await tx.treeMember.findUnique({
          where: { id: spouseId.trim() },
        });
        if (spouse && spouse.treeId === treeId) {
          await tx.treeMember.update({
            where: { id: spouseId.trim() },
            data: { spouseId: memberId },
          });
        }
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm thành viên '${newMember.fullName}' vào phả hệ thành công!`,
      member: newMember,
    });
  } catch (error: any) {
    console.error("POST /api/trees/:treeId/members error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi thêm thành viên: " + error.message },
      { status: 500 }
    );
  }
}
