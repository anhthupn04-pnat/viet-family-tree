import { prisma } from "@/lib/prisma";

// 1. DỮ LIỆU THÀNH VIÊN GỐC TỘC PHAN (QUẢNG NAM) - ĐẦY ĐỦ 3 ĐỜI (15 THÀNH VIÊN)
export const DEFAULT_ROOT_MEMBERS = [
  // Đời 1: Cụ Ông & Cụ Bà
  {
    id: "phan-thanh",
    treeId: "tree-phan-family",
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
    treeId: "tree-phan-family",
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
  // Đời 2: Các nhánh con & dâu rể
  {
    id: "phan-van-thu-1",
    treeId: "tree-phan-family",
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
    spouseId: "tran-thi-my",
    phone: "0912345601",
    address: "Chi 1 - Trưởng Chi, Quảng Nam",
    notes: "Trưởng nam đời 2 tộc Phan, nguyên chi trưởng.",
  },
  {
    id: "tran-thi-my",
    treeId: "tree-phan-family",
    fullName: "Trần Thị Mỹ",
    nickname: "Dâu Chi 1",
    gender: "female",
    generation: 2,
    orderInFamily: 1,
    birthDate: "05/04/1960",
    isAlive: true,
    spouseId: "phan-van-thu-1",
    phone: "0912345604",
    address: "Chi 1 - Trưởng Chi, Hà Nội",
    notes: "Dâu Chi 1",
  },
  {
    id: "tran-dang-thich",
    treeId: "tree-phan-family",
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
    treeId: "tree-phan-family",
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
    treeId: "tree-phan-family",
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
    id: "phan-van-thu-4",
    treeId: "tree-phan-family",
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
    address: "Điện Bàn, Quảng Nam",
    notes: "Con thứ 4 tộc Phan.",
  },
  {
    id: "phan-van-thu-5",
    treeId: "tree-phan-family",
    fullName: "Phan Văn Thứ 5",
    nickname: "Chú Năm",
    gender: "male",
    generation: 2,
    orderInFamily: 5,
    birthDate: "14/06/1946",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345606",
    address: "Quận 1, TP. Hồ Chí Minh",
    notes: "Con thứ 5 tộc Phan, bác sĩ.",
  },
  {
    id: "phan-van-thu-6",
    treeId: "tree-phan-family",
    fullName: "Phan Văn Thứ 6",
    nickname: "Cô Sáu",
    gender: "female",
    generation: 2,
    orderInFamily: 6,
    birthDate: "08/01/1949",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345607",
    address: "Quận 3, TP. Hồ Chí Minh",
    notes: "Con thứ 6 tộc Phan.",
  },
  {
    id: "phan-van-thu-7",
    treeId: "tree-phan-family",
    fullName: "Phan Văn Thứ 7",
    nickname: "Chú Bảy",
    gender: "male",
    generation: 2,
    orderInFamily: 7,
    birthDate: "30/04/1952",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345608",
    address: "Cầu Giấy, Hà Nội",
    notes: "Con thứ 7 tộc Phan, giảng viên đại học.",
  },
  {
    id: "phan-van-thu-8",
    treeId: "tree-phan-family",
    fullName: "Phan Văn Thứ 8",
    nickname: "Cô Tám",
    gender: "female",
    generation: 2,
    orderInFamily: 8,
    birthDate: "19/10/1955",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345609",
    address: "Cẩm Lệ, Đà Nẵng",
    notes: "Con thứ 8 tộc Phan.",
  },
  {
    id: "phan-van-thu-9",
    treeId: "tree-phan-family",
    fullName: "Phan Văn Thứ 9",
    nickname: "Chú Út",
    gender: "male",
    generation: 2,
    orderInFamily: 9,
    birthDate: "25/12/1958",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    phone: "0912345610",
    address: "Điện Bàn, Quảng Nam",
    notes: "Con thứ 9 tộc Phan, phụ trách hương hỏa nhà thờ tộc.",
  },
  // Đời 3: Hậu duệ Chi 2
  {
    id: "tran-dang-khoa",
    treeId: "tree-phan-family",
    fullName: "Trần Đăng Khoa",
    nickname: "Cháu đích tôn Chi 2",
    gender: "male",
    generation: 3,
    orderInFamily: 1,
    birthDate: "18/04/1970",
    isAlive: true,
    fatherId: "tran-dang-thich",
    motherId: "le-thi-lan",
    phone: "0988112233",
    address: "Chi 2 - Chi Giáp, Đà Nẵng",
    notes: "Cháu đích tôn Chi 2",
  },
  {
    id: "tran-thi-mai",
    treeId: "tree-phan-family",
    fullName: "Trần Thị Mai",
    nickname: "Cháu gái Chi 2",
    gender: "female",
    generation: 3,
    orderInFamily: 2,
    birthDate: "22/03/1975",
    isAlive: true,
    fatherId: "tran-dang-thich",
    motherId: "le-thi-lan",
    phone: "0988112244",
    address: "Chi 2 - Chi Giáp, Đà Nẵng",
    notes: "Cháu gái Chi 2",
  },
];

// 2. DỮ LIỆU THÀNH VIÊN TỘC TRẦN (HUẾ) - 4 THÀNH VIÊN
export const DEFAULT_TRAN_MEMBERS = [
  {
    id: "tran-dang-thich-tran",
    treeId: "tree-tran-family",
    fullName: "Trần Đăng Thích",
    nickname: "Cụ Khởi Nhánh Huế",
    gender: "male",
    generation: 1,
    orderInFamily: 1,
    birthDate: "15/06/1942",
    deathDate: "09 tháng 10 Âm lịch (2015)",
    isAlive: false,
    spouseId: "le-thi-lan-tran",
    phone: "0912345602",
    address: "Hương Thủy, Thừa Thiên Huế",
    notes: "Khởi lập nhánh gia phả Tộc Trần (Huế)",
  },
  {
    id: "le-thi-lan-tran",
    treeId: "tree-tran-family",
    fullName: "Lê Thị Lan",
    nickname: "Bà Chính Thất",
    gender: "female",
    generation: 1,
    orderInFamily: 1,
    birthDate: "12/09/1945",
    isAlive: true,
    spouseId: "tran-dang-thich-tran",
    phone: "0912345678",
    address: "Đà Nẵng & Huế",
    notes: "Hiền thê Cụ Trần Đăng Thích",
  },
  {
    id: "tran-dang-khoa-tran",
    treeId: "tree-tran-family",
    fullName: "Trần Đăng Khoa",
    nickname: "Trưởng nam đời 2",
    gender: "male",
    generation: 2,
    orderInFamily: 1,
    birthDate: "10/05/1972",
    isAlive: true,
    fatherId: "tran-dang-thich-tran",
    motherId: "le-thi-lan-tran",
    phone: "0905123456",
    address: "TP. Huế",
    notes: "Trưởng nam đời thứ hai nhánh Tộc Trần",
  },
  {
    id: "tran-thi-mai-tran",
    treeId: "tree-tran-family",
    fullName: "Trần Thị Ngọc Mai",
    nickname: "Ái nữ đời 2",
    gender: "female",
    generation: 2,
    orderInFamily: 2,
    birthDate: "18/11/1976",
    isAlive: true,
    fatherId: "tran-dang-thich-tran",
    motherId: "le-thi-lan-tran",
    phone: "0905987654",
    address: "Đà Nẵng",
    notes: "Con gái thứ hai",
  },
];

// 3. DỮ LIỆU THÀNH VIÊN TỘC LÊ (THANH HÓA) - 4 THÀNH VIÊN
export const DEFAULT_LE_MEMBERS = [
  {
    id: "le-van-khoi-le",
    treeId: "tree-le-family",
    fullName: "Lê Văn Khởi",
    nickname: "Cụ Khởi Tổ Tộc Lê",
    gender: "male",
    generation: 1,
    orderInFamily: 1,
    birthDate: "08/03/1915",
    deathDate: "20/12/1992",
    isAlive: false,
    spouseId: "nguyen-thi-mai-le",
    phone: "0903889901",
    address: "Nga Sơn, Thanh Hóa",
    notes: "Cụ Khởi Tổ chi nhánh Tộc Lê phát tích Thanh Hóa",
  },
  {
    id: "nguyen-thi-mai-le",
    treeId: "tree-le-family",
    fullName: "Nguyễn Thị Mai",
    nickname: "Cụ Bà Chính Thất",
    gender: "female",
    generation: 1,
    orderInFamily: 1,
    birthDate: "14/07/1919",
    deathDate: "11/04/1998",
    isAlive: false,
    spouseId: "le-van-khoi-le",
    phone: "0903889902",
    address: "Nga Sơn, Thanh Hóa",
    notes: "Cụ Bà Chính Thất Tộc Lê",
  },
  {
    id: "le-van-thanh-le",
    treeId: "tree-le-family",
    fullName: "Lê Văn Thành",
    nickname: "Trưởng Chi 1",
    gender: "male",
    generation: 2,
    orderInFamily: 1,
    birthDate: "25/08/1945",
    isAlive: true,
    fatherId: "le-van-khoi-le",
    motherId: "nguyen-thi-mai-le",
    phone: "0913556677",
    address: "Thanh Hóa & Hà Nội",
    notes: "Trưởng chi nhánh đời 2",
  },
  {
    id: "le-thi-hoa-le",
    treeId: "tree-le-family",
    fullName: "Lê Thị Hoa",
    nickname: "Cô Hai",
    gender: "female",
    generation: 2,
    orderInFamily: 2,
    birthDate: "02/10/1950",
    isAlive: true,
    fatherId: "le-van-khoi-le",
    motherId: "nguyen-thi-mai-le",
    phone: "0913998877",
    address: "Hà Nội",
    notes: "Con gái thứ đời 2",
  },
];

/**
 * Chuyển đổi slug thành tên hiển thị tiếng Việt đẹp mắt
 */
export function formatTreeNameFromSlug(slug: string): string {
  const clean = slug.toLowerCase().trim();
  if (clean === "gia-pha-toc-phan" || clean === "tree-phan-family") {
    return "Gia Phả Tộc Phan (Quảng Nam)";
  }
  if (clean === "gia-pha-toc-tran-hue" || clean === "tree-tran-family" || clean === "gia-pha-toc-tran") {
    return "Gia Phả Tộc Trần (Huế)";
  }
  if (clean === "gia-pha-toc-le-thanh-hoa" || clean === "tree-le-family" || clean === "gia-pha-toc-le") {
    return "Gia Phả Tộc Lê (Thanh Hóa)";
  }

  // Tự động chuyển ký tự gạch nối thành khoảng trắng và viết hoa từng từ
  return clean
    .replace(/^tree-/, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Nạp danh sách thành viên an toàn vào database (Quy trình 2 bước không bao giờ lỗi Foreign Key)
 */
export async function seedMembersForTree(treeId: string, membersData: any[]) {
  if (!Array.isArray(membersData) || membersData.length === 0) return;

  try {
    // BƯỚC 1: Khởi tạo lý lịch cá nhân, gán quan hệ phụ thuộc = null để không vi phạm ràng buộc khóa ngoại
    for (const mData of membersData) {
      const { fatherId, motherId, spouseId, ...baseData } = mData;
      await prisma.treeMember.upsert({
        where: { id: mData.id },
        create: {
          ...baseData,
          treeId,
          fatherId: null,
          motherId: null,
          spouseId: null,
        },
        update: {
          ...baseData,
          treeId,
          fatherId: null,
          motherId: null,
          spouseId: null,
        },
      });
    }

    // BƯỚC 2: Cập nhật quan hệ phụ hệ, mẫu hệ, hôn phối khi ID đã chắc chắn tồn tại trong cây
    for (const mData of membersData) {
      const updateData: {
        fatherId?: string | null;
        motherId?: string | null;
        spouseId?: string | null;
      } = {};

      if (mData.fatherId) {
        const f = await prisma.treeMember.findUnique({ where: { id: mData.fatherId } });
        if (f && f.treeId === treeId) updateData.fatherId = mData.fatherId;
      }
      if (mData.motherId) {
        const m = await prisma.treeMember.findUnique({ where: { id: mData.motherId } });
        if (m && m.treeId === treeId) updateData.motherId = mData.motherId;
      }
      if (mData.spouseId) {
        const s = await prisma.treeMember.findUnique({ where: { id: mData.spouseId } });
        if (s && s.treeId === treeId) updateData.spouseId = mData.spouseId;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.treeMember.update({
          where: { id: mData.id },
          data: updateData,
        });
      }
    }
  } catch (err) {
    console.warn(`Lỗi nạp thành viên cho cây ${treeId}:`, err);
  }
}

/**
 * Đảm bảo cả 3 cây gia phả mặc định và thành viên đều sẵn sàng trong database
 */
export async function ensureDefaultTreeAndMembers(targetTreeId: string = "tree-phan-family") {
  try {
    // 1. CÂY TỘC PHAN
    const treePhan = await prisma.tree.upsert({
      where: { id: "tree-phan-family" },
      create: {
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
      update: {
        slug: "gia-pha-toc-phan",
        shareSlug: "gia-pha-toc-phan",
        isPublic: true,
        status: "ACTIVE",
      },
      include: { members: true },
    });
    if (treePhan.members.length === 0) {
      await seedMembersForTree("tree-phan-family", DEFAULT_ROOT_MEMBERS);
    }

    // 2. CÂY TỘC TRẦN (HUẾ)
    const treeTran = await prisma.tree.upsert({
      where: { id: "tree-tran-family" },
      create: {
        id: "tree-tran-family",
        name: "Gia Phả Tộc Trần (Huế)",
        slug: "gia-pha-toc-tran-hue",
        shareSlug: "gia-pha-toc-tran-hue",
        originLocation: "Hương Thủy, Thừa Thiên Huế",
        description: "Nhánh gia phả bên ngoại Tộc Trần",
        status: "ACTIVE",
        creatorId: "admin-super",
        isPublic: true,
      },
      update: {
        slug: "gia-pha-toc-tran-hue",
        shareSlug: "gia-pha-toc-tran-hue",
        isPublic: true,
        status: "ACTIVE",
      },
      include: { members: true },
    });
    if (treeTran.members.length === 0) {
      await seedMembersForTree("tree-tran-family", DEFAULT_TRAN_MEMBERS);
    }

    // 3. CÂY TỘC LÊ (THANH HÓA)
    const treeLe = await prisma.tree.upsert({
      where: { id: "tree-le-family" },
      create: {
        id: "tree-le-family",
        name: "Gia Phả Tộc Lê (Thanh Hóa)",
        slug: "gia-pha-toc-le-thanh-hoa",
        shareSlug: "gia-pha-toc-le-thanh-hoa",
        originLocation: "Nga Sơn, Thanh Hóa",
        description: "Cây phả hệ Tộc Lê phát tích miền Bắc",
        status: "ACTIVE",
        creatorId: "admin-super",
        isPublic: true,
      },
      update: {
        slug: "gia-pha-toc-le-thanh-hoa",
        shareSlug: "gia-pha-toc-le-thanh-hoa",
        isPublic: true,
        status: "ACTIVE",
      },
      include: { members: true },
    });
    if (treeLe.members.length === 0) {
      await seedMembersForTree("tree-le-family", DEFAULT_LE_MEMBERS);
    }

    if (targetTreeId === "tree-tran-family") return treeTran;
    if (targetTreeId === "tree-le-family") return treeLe;
    return treePhan;
  } catch (err) {
    console.warn("Lỗi an toàn trong ensureDefaultTreeAndMembers:", err);
    return null;
  }
}
