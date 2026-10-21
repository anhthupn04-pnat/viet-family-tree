import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTreeManagerAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/trees/:treeId/members/:memberId
 * Lấy thông tin chi tiết của một thành viên trong cây.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string; memberId: string }> }
) {
  try {
    const { treeId, memberId } = await params;

    const member = await prisma.treeMember.findUnique({
      where: { id: memberId },
      include: {
        childrenAsFather: { select: { id: true, fullName: true, generation: true } },
        childrenAsMother: { select: { id: true, fullName: true, generation: true } },
        father: { select: { id: true, fullName: true } },
        mother: { select: { id: true, fullName: true } },
        spouse: { select: { id: true, fullName: true } },
      },
    });

    if (!member || member.treeId !== treeId) {
      return NextResponse.json(
        { error: "Không tìm thấy thành viên trong cây gia phả này." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error("GET member error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trees/:treeId/members/:memberId
 * Chỉnh sửa hồ sơ chi tiết thành viên:
 * - Tiểu sử, ngày sinh/ngày mất (Dương lịch & Âm lịch), nơi an táng (mộ phần), chức tước, học vị, thông tin liên lạc.
 * BẢO MẬT: SUPER_ADMIN hoặc TREE_MANAGER phụ trách treeId. Chặn can thiệp chéo!
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ treeId: string; memberId: string }> }
) {
  try {
    const { treeId, memberId } = await params;

    const authCheck = await ensureTreeManagerAccess(request, treeId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const member = await prisma.treeMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.treeId !== treeId) {
      return NextResponse.json(
        { error: "Thành viên không tồn tại hoặc không thuộc gia phả này." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      nickname,
      gender,
      generation,
      orderInFamily,
      birthDate,
      birthLunar,
      deathDate,
      deathLunar,
      isAlive,
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

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật hồ sơ
      const result = await tx.treeMember.update({
        where: { id: memberId },
        data: {
          fullName: fullName !== undefined ? String(fullName).trim() : undefined,
          nickname: nickname !== undefined ? (nickname ? String(nickname).trim() : null) : undefined,
          gender: gender !== undefined ? (gender === "female" ? "female" : "male") : undefined,
          generation: generation !== undefined ? Number(generation) : undefined,
          orderInFamily: orderInFamily !== undefined ? (orderInFamily ? Number(orderInFamily) : null) : undefined,
          birthDate: birthDate !== undefined ? (birthDate ? String(birthDate).trim() : null) : undefined,
          birthLunar: birthLunar !== undefined ? (birthLunar ? String(birthLunar).trim() : null) : undefined,
          deathDate: deathDate !== undefined ? (deathDate ? String(deathDate).trim() : null) : undefined,
          deathLunar: deathLunar !== undefined ? (deathLunar ? String(deathLunar).trim() : null) : undefined,
          isAlive: isAlive !== undefined ? Boolean(isAlive) : undefined,
          avatarUrl: avatarUrl !== undefined ? (avatarUrl ? String(avatarUrl).trim() : null) : undefined,
          fatherId: fatherId !== undefined ? (fatherId ? String(fatherId).trim() : null) : undefined,
          motherId: motherId !== undefined ? (motherId ? String(motherId).trim() : null) : undefined,
          spouseId: spouseId !== undefined ? (spouseId ? String(spouseId).trim() : null) : undefined,
          phone: phone !== undefined ? (phone ? String(phone).trim() : null) : undefined,
          address: address !== undefined ? (address ? String(address).trim() : null) : undefined,
          burialPlace: burialPlace !== undefined ? (burialPlace ? String(burialPlace).trim() : null) : undefined,
          titles: titles !== undefined ? (titles ? String(titles).trim() : null) : undefined,
          bio: bio !== undefined ? (bio ? String(bio).trim() : null) : undefined,
          notes: notes !== undefined ? (notes ? String(notes).trim() : null) : undefined,
        },
      });

      // 2. Nếu thay đổi spouseId, xử lý liên kết đối xứng
      if (spouseId !== undefined && spouseId !== member.spouseId) {
        if (member.spouseId) {
          // Gỡ phối ngẫu cũ
          await tx.treeMember.updateMany({
            where: { id: member.spouseId, spouseId: memberId },
            data: { spouseId: null },
          });
        }
        if (spouseId && spouseId.trim()) {
          // Gán phối ngẫu mới
          await tx.treeMember.update({
            where: { id: spouseId.trim() },
            data: { spouseId: memberId },
          });
        }
      }

      return result;
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật hồ sơ thành viên '${updated.fullName}' thành công!`,
      member: updated,
    });
  } catch (error: any) {
    console.error("PUT member error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật thành viên: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trees/:treeId/members/:memberId
 * Xóa thành viên khỏi cây gia phả.
 * - CƠ CHẾ CẢNH BÁO NÚT GỐC: Nếu thành viên có con cháu thế hệ sau, trả về cảnh báo (HTTP 409)
 *   yêu cầu người dùng xác nhận trước khi tiếp tục.
 * - Thêm tham số `?force=true` hoặc body `{ force: true }` để xác nhận xóa ép buộc.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ treeId: string; memberId: string }> }
) {
  try {
    const { treeId, memberId } = await params;

    const authCheck = await ensureTreeManagerAccess(request, treeId);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const member = await prisma.treeMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.treeId !== treeId) {
      return NextResponse.json(
        { error: "Thành viên cần xóa không tồn tại trong cây gia phả này." },
        { status: 404 }
      );
    }

    // Kiểm tra con cháu thế hệ sau
    const children = await prisma.treeMember.findMany({
      where: {
        treeId,
        OR: [{ fatherId: memberId }, { motherId: memberId }],
      },
      select: { id: true, fullName: true, generation: true },
    });

    const url = new URL(request.url);
    const forceParam = url.searchParams.get("force") === "true";

    let forceBody = false;
    try {
      const body = await request.json();
      if (body?.force === true) forceBody = true;
    } catch (e) {}

    const isConfirmedForce = forceParam || forceBody;

    // Nếu có con cháu mà chưa xác nhận ép buộc -> Trả về cảnh báo nghiêm trọng
    if (children.length > 0 && !isConfirmedForce) {
      const childNames = children.map((c) => c.fullName).join(", ");
      return NextResponse.json(
        {
          success: false,
          warning: true,
          hasDescendants: true,
          childrenCount: children.length,
          descendantNames: children.map((c) => c.fullName),
          error: `⚠️ CẢNH BÁO NÚT GỐC PHẢ HỆ: Thành viên "${member.fullName}" đang là nút gốc nối các thế hệ sau (${children.length} người con/cháu: ${childNames}). Việc xóa thành viên này sẽ làm mất liên kết cha/mẹ của các con cháu.`,
          requireConfirmation: true,
        },
        { status: 409 }
      );
    }

    // Thực hiện xóa an toàn
    await prisma.$transaction(async (tx) => {
      // 1. Gỡ liên kết cha/mẹ của con cái
      await tx.treeMember.updateMany({
        where: { treeId, fatherId: memberId },
        data: { fatherId: null },
      });

      await tx.treeMember.updateMany({
        where: { treeId, motherId: memberId },
        data: { motherId: null },
      });

      // 2. Gỡ liên kết phối ngẫu
      if (member.spouseId) {
        await tx.treeMember.updateMany({
          where: { id: member.spouseId, spouseId: memberId },
          data: { spouseId: null },
        });
      }

      // 3. Xóa thành viên
      await tx.treeMember.delete({
        where: { id: memberId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành viên '${member.fullName}' khỏi gia phả. Các liên kết con cháu đã được xử lý an toàn.`,
    });
  } catch (error: any) {
    console.error("DELETE member error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa thành viên: " + error.message },
      { status: 500 }
    );
  }
}
