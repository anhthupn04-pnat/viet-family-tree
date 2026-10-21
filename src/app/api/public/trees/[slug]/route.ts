import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskMemberListForPrivacy } from "@/lib/treePrivacy";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/trees/:slug
 * Lấy dữ liệu Cây Gia Phả công khai (Public Share Link).
 * - Tự động đối chiếu slug hoặc shareSlug.
 * - Kiểm tra cờ isPublic và passcode bảo vệ nếu có cài đặt.
 * - TỰ ĐỘNG BẢO VỆ DỮ LIỆU CÁ NHÂN (Privacy Filter): Làm mờ SĐT và địa chỉ chi tiết của người còn sống.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    // Tìm kiếm theo shareSlug, slug hoặc ID
    let tree = await prisma.tree.findFirst({
      where: {
        OR: [
          { shareSlug: cleanSlug },
          { slug: cleanSlug },
          { id: cleanSlug },
        ],
      },
      include: {
        members: {
          orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
        },
      },
    });

    // Nếu chưa có trong DB mà là cây mẫu Tộc Phan, tự động tạo để luôn mở được
    if (!tree && (cleanSlug === "gia-pha-toc-phan" || cleanSlug === "tree-phan-family")) {
      tree = await prisma.tree.create({
        data: {
          id: "tree-phan-family",
          name: "Gia Phả Tộc Phan (Quảng Nam)",
          slug: "gia-pha-toc-phan",
          shareSlug: "gia-pha-toc-phan",
          originLocation: "Điện Bàn, Quảng Nam",
          description: "Cây gia phả chính thống của dòng tộc Phan Thạnh",
          status: "ACTIVE",
          creatorId: "admin-super",
          isPublic: true,
        },
        include: {
          members: {
            orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
          },
        },
      });
    }

    if (!tree) {
      return NextResponse.json(
        { error: "Không tìm thấy cây gia phả tương ứng với liên kết chia sẻ này." },
        { status: 404 }
      );
    }

    // Đảm bảo cây mẫu gốc Tộc Phan luôn ở trạng thái công khai
    if (!tree.isPublic && (tree.id === "tree-phan-family" || cleanSlug === "gia-pha-toc-phan")) {
      tree = await prisma.tree.update({
        where: { id: tree.id },
        data: {
          isPublic: true,
          shareSlug: "gia-pha-toc-phan",
        },
        include: {
          members: {
            orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
          },
        },
      });
    }

    // Nếu cây chưa có thành viên nào trong database, nạp 8 thành viên gốc
    if (tree.members.length === 0 && (tree.id === "tree-phan-family" || cleanSlug === "gia-pha-toc-phan")) {
      const defaultMembersData = [
        {
          id: "phan-thanh",
          treeId: tree.id,
          fullName: "Phan Thạnh",
          nickname: "Cụ Khởi Tổ (Hiệu Phúc Thiện)",
          gender: "male",
          generation: 1,
          orderInFamily: 1,
          birthDate: "12/04/1910",
          deathDate: "16 tháng 3 Âm lịch (1985)",
          isAlive: false,
          spouseId: "tran-thi-hoang",
          phone: "0903112233",
          address: "Điện Bàn, Quảng Nam",
          notes: "Cụ Khởi Tổ (Hiệu Phúc Thiện)",
        },
        {
          id: "tran-thi-hoang",
          treeId: tree.id,
          fullName: "Trần Thị Hoàng",
          nickname: "Cụ Bà Chính Thất (Hiệu Từ Tâm)",
          gender: "female",
          generation: 1,
          orderInFamily: 1,
          birthDate: "18/08/1914",
          deathDate: "mùng 8 tháng 9 Âm lịch (1990)",
          isAlive: false,
          spouseId: "phan-thanh",
          phone: "0903112234",
          address: "Điện Bàn, Quảng Nam",
          notes: "Cụ Bà Chính Thất (Hiệu Từ Tâm)",
        },
        {
          id: "tran-dang-thich",
          treeId: tree.id,
          fullName: "Trần Đăng Thích",
          nickname: "Trưởng nhánh Chi 2",
          gender: "male",
          generation: 2,
          orderInFamily: 2,
          birthDate: "15/06/1942",
          deathDate: "09 tháng 10 Âm lịch (2015)",
          isAlive: false,
          fatherId: "phan-thanh",
          motherId: "tran-thi-hoang",
          spouseId: "le-thi-lan",
          phone: "0912345602",
          address: "Hương Thủy, Thừa Thiên Huế",
          notes: "Trưởng nhánh Chi 2",
        },
        {
          id: "le-thi-lan",
          treeId: tree.id,
          fullName: "Lê Thị Lan",
          nickname: "Dâu hiền Chi 2",
          gender: "female",
          generation: 2,
          orderInFamily: 2,
          birthDate: "12/09/1945",
          isAlive: true,
          spouseId: "tran-dang-thich",
          phone: "0912345678",
          address: "Chi 2 - Chi Giáp, Đà Nẵng",
          notes: "Dâu hiền Chi 2",
        },
        {
          id: "tran-thi-anh-tuyet",
          treeId: tree.id,
          fullName: "Trần Thị Ánh Tuyết",
          nickname: "Cô Ba",
          gender: "female",
          generation: 2,
          orderInFamily: 3,
          birthDate: "18/10/1948",
          isAlive: true,
          fatherId: "phan-thanh",
          motherId: "tran-thi-hoang",
          phone: "0912345603",
          address: "Chi 3 - Chi Nữ Phái, TP.HCM",
          notes: "Cô Ba",
        },
        {
          id: "tran-thi-my",
          treeId: tree.id,
          fullName: "Trần Thị Mỹ",
          nickname: "Dâu Chi 1",
          gender: "female",
          generation: 2,
          orderInFamily: 1,
          birthDate: "05/04/1960",
          isAlive: true,
          phone: "0912345604",
          address: "Chi 1 - Trưởng Chi, Hà Nội",
          notes: "Dâu Chi 1",
        },
        {
          id: "phan-van-thu-1",
          treeId: tree.id,
          fullName: "Phan Văn Thứ 1",
          nickname: "Bác Cả",
          gender: "male",
          generation: 2,
          orderInFamily: 1,
          birthDate: "05/02/1935",
          deathDate: "15/07/2010",
          isAlive: false,
          fatherId: "phan-thanh",
          motherId: "tran-thi-hoang",
          phone: "0912345601",
          address: "Chi 1 - Trưởng Chi, Quảng Nam",
          notes: "Trưởng nam đời 2 tộc Phan, nguyên chi trưởng.",
        },
        {
          id: "phan-van-thu-4",
          treeId: tree.id,
          fullName: "Phan Văn Thứ 4",
          nickname: "Chú Tư",
          gender: "male",
          generation: 2,
          orderInFamily: 4,
          birthDate: "22/09/1943",
          isAlive: true,
          fatherId: "phan-thanh",
          motherId: "tran-thi-hoang",
          phone: "0912345605",
          address: "Quảng Nam",
          notes: "Chú Tư",
        },
      ];

      for (const mData of defaultMembersData) {
        await prisma.treeMember.upsert({
          where: { id: mData.id },
          create: mData,
          update: mData,
        });
      }

      tree.members = await prisma.treeMember.findMany({
        where: { treeId: tree.id },
        orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
      });
    }

    if (tree.status === "LOCKED") {
      return NextResponse.json(
        { error: "Cây gia phả này hiện đang bị tạm khóa bởi Tổng quản trị hệ thống." },
        { status: 403 }
      );
    }

    // Kiểm tra cờ cho phép công khai
    if (!tree.isPublic) {
      return NextResponse.json(
        { error: "Cây gia phả này chưa được Ban Quản Trị bật chế độ chia sẻ công khai." },
        { status: 403 }
      );
    }

    // Kiểm tra nếu có thiết lập Mật khẩu truy cập (Passcode)
    const hasPassword = Boolean(tree.accessPassword && tree.accessPassword.trim());
    if (hasPassword) {
      const authPasscode =
        request.headers.get("x-share-passcode") ||
        new URL(request.url).searchParams.get("passcode");

      if (!authPasscode || authPasscode.trim() !== tree.accessPassword?.trim()) {
        return NextResponse.json({
          requirePassword: true,
          tree: {
            id: tree.id,
            name: tree.name,
            slug: tree.slug,
            shareSlug: tree.shareSlug,
            originLocation: tree.originLocation,
            description: tree.description,
            hasPassword: true,
          },
        });
      }
    }

    // Mask thông tin cá nhân của người còn sống (Public Privacy Filter)
    const maskedMembers = maskMemberListForPrivacy(tree.members as any, false);

    return NextResponse.json({
      requirePassword: false,
      tree: {
        id: tree.id,
        name: tree.name,
        slug: tree.slug,
        shareSlug: tree.shareSlug,
        originLocation: tree.originLocation,
        description: tree.description,
        status: tree.status,
        hasPassword,
        createdAt: tree.createdAt.toISOString(),
        memberCount: tree.members.length,
      },
      members: maskedMembers,
    });
  } catch (error: any) {
    console.error("GET /api/public/trees/:slug error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải cây gia phả công khai: " + error.message },
      { status: 500 }
    );
  }
}
