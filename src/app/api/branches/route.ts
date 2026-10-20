import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clanId = searchParams.get("clanId");

    const where = clanId ? { clanId } : {};

    const branches = await prisma.clanBranch.findMany({
      where,
      orderBy: { branchOrder: "asc" },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json({ branches });
  } catch (error: any) {
    console.error("Branches GET error:", error);
    return NextResponse.json({ error: "Lỗi khi tải danh sách chi họ." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clanId, branchName, branchOrder, leaderName, description, residenceArea } = body;

    if (!branchName) {
      return NextResponse.json({ error: "Tên chi họ không được để trống." }, { status: 400 });
    }

    // Lấy clanId mặc định nếu chưa truyền
    let targetClanId = clanId;
    if (!targetClanId) {
      const defaultClan = await prisma.clan.findFirst();
      if (!defaultClan) {
        return NextResponse.json({ error: "Chưa có dòng họ." }, { status: 400 });
      }
      targetClanId = defaultClan.id;
    }

    const order = Number(branchOrder) || 1;

    const newBranch = await prisma.clanBranch.create({
      data: {
        clanId: targetClanId,
        branchName: branchName.trim(),
        branchOrder: order,
        leaderName: leaderName?.trim() || null,
        description: description?.trim() || null,
        residenceArea: residenceArea?.trim() || null,
      },
    });

    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        clanId: targetClanId,
        userName: "Quản trị viên",
        userEmail: "anhthuphan0102@gmail.com",
        action: "TẠO CHI NHÁNH MỚI",
        target: newBranch.branchName,
        details: `Thêm mới chi họ: ${newBranch.branchName}, Người đứng đầu: ${newBranch.leaderName || "Chưa rõ"}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo chi họ mới thành công!",
      branch: newBranch,
    });
  } catch (error: any) {
    console.error("Branches POST error:", error);
    return NextResponse.json({ error: "Lỗi khi tạo chi họ mới." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, branchName, branchOrder, leaderName, description, residenceArea } = body;

    if (!id || !branchName) {
      return NextResponse.json({ error: "Thiếu thông tin chi họ cần cập nhật." }, { status: 400 });
    }

    const updated = await prisma.clanBranch.update({
      where: { id },
      data: {
        branchName: branchName.trim(),
        branchOrder: Number(branchOrder) || 1,
        leaderName: leaderName?.trim() || null,
        description: description?.trim() || null,
        residenceArea: residenceArea?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật chi họ thành công!",
      branch: updated,
    });
  } catch (error: any) {
    console.error("Branches PUT error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật chi họ." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID chi họ cần xóa." }, { status: 400 });
    }

    await prisma.clanBranch.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa chi họ thành công.",
    });
  } catch (error: any) {
    console.error("Branches DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa chi họ." }, { status: 500 });
  }
}
