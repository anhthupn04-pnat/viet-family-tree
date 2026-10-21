const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Kiểm tra nếu đã có dữ liệu thì bảo toàn toàn bộ dữ liệu hiện có, không xóa
  const existingCount = await prisma.memberProfile.count();
  if (existingCount > 0) {
    console.log(`✓ Đã có ${existingCount} thành viên trong Database. Bảo lưu toàn bộ dữ liệu hiện có, không khôi phục gốc.`);
    return;
  }

  console.log('--- Chưa có dữ liệu, đang khởi tạo dữ liệu mẫu Gia phả dòng họ ban đầu ---');

  // 1. Tạo tài khoản Admin bắt buộc: anhthuphan0102@gmail.com / 010204
  const adminSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('010204', adminSalt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'anhthuphan0102@gmail.com',
      passwordHash: adminPasswordHash,
      name: 'Phan Anh Thư (Tổng Quản Trị)',
      role: 'ADMIN',
    },
  });
  console.log('✓ Đã tạo Admin user:', adminUser.email);

  // Tạo thêm tài khoản demo cho các vai trò khác
  const demoPasswordHash = await bcrypt.hash('123456', adminSalt);
  await prisma.user.createMany({
    data: [
      {
        email: 'truongchi1@giaphaviet.vn',
        passwordHash: demoPasswordHash,
        name: 'Phan Tấn Thìn (Trưởng Chi 1)',
        role: 'BRANCH_MANAGER',
      },
      {
        email: 'thanhvien@giaphaviet.vn',
        passwordHash: demoPasswordHash,
        name: 'Trần Đăng Khoa (Thành viên Dòng họ)',
        role: 'MEMBER',
      },
      {
        email: 'khach@giaphaviet.vn',
        passwordHash: demoPasswordHash,
        name: 'Khách Thăm Quan',
        role: 'GUEST',
      },
    ],
  });

  // 2. Tạo Dòng họ chính
  const clan = await prisma.clan.create({
    data: {
      id: 'clan-phan-toc-main',
      name: 'Gia phả dòng họ',
      couplet1: 'Tổ Tiên Công Đức Thiên Niên Thịnh',
      couplet2: 'Tử Hiếu Tôn Hiền Vạn Đại Vinh',
      originLocation: 'Nga Sơn, Thanh Hóa & Thừa Thiên Huế, Việt Nam',
      mainRegion: 'Bắc - Trung - Nam',
      slug: 'gia-pha-dong-ho',
      ancestralHall: 'Từ Đường Dòng Họ, Xã Nga Điền, Huyện Nga Sơn, Tỉnh Thanh Hóa',
      historySummary:
        'Dòng họ có cội nguồn truyền thống lâu đời, đời đời truyền thừa tinh thần cần cù, hiếu học và phụng sự quê hương đất nước. Trải qua các biến cố lịch sử, con cháu luôn giữ vững gia phong, gắn kết tình tự huyết thống và đùm bọc lẫn nhau.',
      isPublic: true,
      allowMemberInvite: true,
      inviteCode: 'GPDH-2026',
    },
  });
  console.log('✓ Đã tạo Clan:', clan.name);

  // 3. Tạo các Chi họ mẫu
  const branch1 = await prisma.clanBranch.create({
    data: {
      id: 'branch-1',
      clanId: clan.id,
      branchName: 'Chi 1 - Trưởng Chi',
      branchOrder: 1,
      leaderName: 'Phan Tấn Thìn (Liệt sĩ)',
      description: 'Nhánh con trưởng Cụ Khởi Tổ Phan Thạnh, trông coi tổ quán.',
      residenceArea: 'Thanh Hóa & Hà Nội',
    },
  });

  const branch2 = await prisma.clanBranch.create({
    data: {
      id: 'branch-2',
      clanId: clan.id,
      branchName: 'Chi 2 - Chi Giáp',
      branchOrder: 2,
      leaderName: 'Trần Đăng Thích',
      description: 'Nhánh con thứ 2, phát triển kinh thương và hậu duệ đời III.',
      residenceArea: 'Đà Nẵng & TP. Hồ Chí Minh',
    },
  });

  const branch3 = await prisma.clanBranch.create({
    data: {
      id: 'branch-3',
      clanId: clan.id,
      branchName: 'Chi 3 - Chi Nữ Phái',
      branchOrder: 3,
      leaderName: 'Trần Thị Ánh Tuyết',
      description: 'Nhánh con gái thứ 3, gìn giữ nếp nhà truyền thống.',
      residenceArea: 'Huế & TP. Hồ Chí Minh',
    },
  });
  console.log('✓ Đã tạo 3 Chi họ mẫu ban đầu');

  // 4. Khởi tạo Hồ sơ Thành viên (Đời I, Đời II, Đời III)
  // --- ĐỜI I ---
  // Cụ Ông: Phan Thạnh
  const g1_father = await prisma.memberProfile.create({
    data: {
      id: 'mem-g1-01',
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G1-01',
      fullName: 'Phan Thạnh',
      courtesyName: 'Cụ Khởi Tổ (Hiệu Phúc Thiện)',
      gender: 'MALE',
      generation: 1,
      birthOrder: 'Khởi tổ',
      birthSolar: '1910-02-15',
      birthLunar: '06/01/Canh Tuất',
      deathSolar: '1985-05-04',
      deathLunar: '15 tháng 3 Âm lịch',
      isAlive: false,
      isMartyr: false,
      burialPlace: 'Khu nghĩa trang dòng họ (Đồi hoa sen, xã Nga Điền, Nga Sơn)',
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Từ đường dòng họ',
      biography:
        'Cụ Khởi tổ dòng họ, đức độ uy nghiêm, tinh thông nho y, có công khai hoang lập ấp và tạo dựng cơ đồ dòng họ từ những năm đầu thế kỷ 20.',
      status: 'approved',
    },
  });

  // Cụ Bà: Trần Thị Hoàng
  const g1_mother = await prisma.memberProfile.create({
    data: {
      id: 'mem-g1-02',
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G1-02',
      fullName: 'Trần Thị Hoàng',
      courtesyName: 'Cụ Bà Chính Thất (Hiệu Từ Tâm)',
      gender: 'FEMALE',
      generation: 1,
      birthOrder: 'Cụ Bà Chính Thất',
      birthSolar: '1914-08-20',
      birthLunar: '30/06/Giáp Dần',
      deathSolar: '1990-10-25',
      deathLunar: 'mùng 8 tháng 9 Âm lịch',
      isAlive: false,
      isMartyr: false,
      burialPlace: 'Khu nghĩa trang dòng họ, an táng bên tả mộ Cụ Ông',
      hometown: 'Thừa Thiên Huế',
      currentResidence: 'Từ đường dòng họ',
      biography:
        'Phu nhân Cụ Khởi tổ, một đời tần tảo đảm đang, nuôi dưỡng con cái ăn học thành tài, đức hạnh vẹn toàn nức tiếng gần xa.',
      status: 'approved',
    },
  });

  // Hôn phối Đời I: Phan Thạnh & Trần Thị Hoàng
  await prisma.marriage.create({
    data: {
      husbandId: g1_father.id,
      wifeId: g1_mother.id,
      marriageOrder: 1,
      status: 'MARRIED',
      note: 'Phu thê tòng phụ mẫu, trọn đời sắc son đức hạnh',
    },
  });

  // --- ĐỜI II ---
  // 1. Con trưởng: Phan Tấn Thìn - Liệt sĩ
  const g2_son1 = await prisma.memberProfile.create({
    data: {
      id: 'mem-g2-01',
      clanId: clan.id,
      branchId: branch1.id,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      memberCode: 'PT-G2-01',
      fullName: 'Phan Tấn Thìn',
      courtesyName: 'Liệt sĩ Quân đội Nhân dân Việt Nam',
      gender: 'MALE',
      generation: 2,
      birthOrder: 'Con trưởng',
      birthSolar: '1938-04-10',
      birthLunar: '10/03/Mậu Dần',
      deathSolar: '1968-02-12',
      deathLunar: '14 tháng 1 Âm lịch (Xuân Mậu Thân)',
      isAlive: false,
      isMartyr: true,
      burialPlace: 'Nghĩa trang Liệt sĩ Huyện & Đài tưởng niệm Dòng họ',
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Tổ quốc ghi công',
      biography:
        'Người con trưởng của Cụ Phan Thạnh. Tham gia chiến đấu dũng cảm trong cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968, anh dũng hy sinh vì độc lập tự do của Tổ quốc. Được Nhà nước truy tặng Huân chương Chiến công và Bằng Tổ quốc ghi công.',
      status: 'approved',
    },
  });

  // 2. Con thứ hai: Trần Đăng Thích
  const g2_son2 = await prisma.memberProfile.create({
    data: {
      id: 'mem-g2-02',
      clanId: clan.id,
      branchId: branch2.id,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      memberCode: 'PT-G2-02',
      fullName: 'Trần Đăng Thích',
      courtesyName: 'Trưởng nhánh Chi 2',
      gender: 'MALE',
      generation: 2,
      birthOrder: 'Con thứ 2',
      birthSolar: '1942-06-15',
      birthLunar: '02/05/Nhâm Ngọ',
      deathSolar: '2015-11-20',
      deathLunar: '09 tháng 10 Âm lịch',
      isAlive: false,
      isMartyr: false,
      burialPlace: 'Khu nghĩa trang dòng họ, Hàng thứ 2 khu Tây',
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Đà Nẵng',
      biography:
        'Kỹ sư xây dựng tài hoa, đóng góp công sức xây dựng nhiều công trình trọng điểm tại miền Trung. Luôn hướng về cội nguồn, khởi xướng quỹ khuyến học dòng họ.',
      status: 'approved',
    },
  });

  // Vợ con thứ 2: Lê Thị Lan
  const g2_wife2 = await prisma.memberProfile.create({
    data: {
      id: 'mem-g2-03',
      clanId: clan.id,
      branchId: branch2.id,
      memberCode: 'PT-G2-03',
      fullName: 'Lê Thị Lan',
      courtesyName: 'Dâu hiền Chi 2',
      gender: 'FEMALE',
      generation: 2,
      birthOrder: 'Dâu thứ 2',
      birthSolar: '1945-09-12',
      birthLunar: '07/08/Ất Dậu',
      isAlive: true,
      isMartyr: false,
      hometown: 'Quảng Nam',
      currentResidence: 'Đà Nẵng',
      biography:
        'Cựu giáo viên nhân dân, phụ trách gìn giữ nề nếp gia phong Chi 2 và nuôi dạy các con cháu thành đạt.',
      phone: '0912345678',
      status: 'approved',
    },
  });

  // Hôn phối Đời II: Trần Đăng Thích & Lê Thị Lan
  await prisma.marriage.create({
    data: {
      husbandId: g2_son2.id,
      wifeId: g2_wife2.id,
      marriageOrder: 1,
      status: 'MARRIED',
      note: 'Hôn phối hòa thuận, tạo lập nhánh con cháu Chi 2 vững mạnh',
    },
  });

  // 3. Con gái thứ ba: Trần Thị Ánh Tuyết
  const g2_daughter3 = await prisma.memberProfile.create({
    data: {
      id: 'mem-g2-04',
      clanId: clan.id,
      branchId: branch3.id,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      memberCode: 'PT-G2-04',
      fullName: 'Trần Thị Ánh Tuyết',
      courtesyName: 'Cô Ba',
      gender: 'FEMALE',
      generation: 2,
      birthOrder: 'Con gái thứ 3',
      birthSolar: '1948-11-05',
      birthLunar: '05/10/Mậu Tý',
      isAlive: true,
      isMartyr: false,
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'TP. Hồ Chí Minh',
      biography:
        'Nghệ nhân thêu truyền thống, hiện đang sinh sống cùng con cháu tại TP. Hồ Chí Minh, luôn tích cực tài trợ cho các sự kiện họp họ hàng năm.',
      phone: '0908765432',
      status: 'approved',
    },
  });

  // --- ĐỜI III: 2 NGƯỜI CON CỦA TRẦN ĐĂNG THÍCH & LÊ THỊ LAN ---
  const g3_grandson = await prisma.memberProfile.create({
    data: {
      id: 'mem-g3-01',
      clanId: clan.id,
      branchId: branch2.id,
      fatherId: g2_son2.id,
      motherId: g2_wife2.id,
      memberCode: 'PT-G3-01',
      fullName: 'Trần Đăng Khoa',
      courtesyName: 'Cháu đích tôn Chi 2',
      gender: 'MALE',
      generation: 3,
      birthOrder: 'Con trai cả Chi 2',
      birthSolar: '1970-03-24',
      birthLunar: '17/02/Canh Tuất',
      isAlive: true,
      isMartyr: false,
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Hà Nội',
      biography:
        'Thạc sĩ Công nghệ Thông tin, phụ trách việc số hóa gia phả và kết nối các thế hệ kiều bào của dòng tộc.',
      phone: '0987654321',
      status: 'approved',
    },
  });

  const g3_granddaughter = await prisma.memberProfile.create({
    data: {
      id: 'mem-g3-02',
      clanId: clan.id,
      branchId: branch2.id,
      fatherId: g2_son2.id,
      motherId: g2_wife2.id,
      memberCode: 'PT-G3-02',
      fullName: 'Trần Thị Mai',
      courtesyName: 'Cháu gái Chi 2',
      gender: 'FEMALE',
      generation: 3,
      birthOrder: 'Con gái thứ Chi 2',
      birthSolar: '1975-09-18',
      birthLunar: '13/08/Ất Mão',
      isAlive: true,
      isMartyr: false,
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Đà Nẵng',
      biography:
        'Bác sĩ chuyên khoa tại Bệnh viện Đa khoa Đà Nẵng, thường xuyên tham gia các chương trình khám bệnh từ thiện của dòng họ.',
      phone: '0934567890',
      status: 'approved',
    },
  });
  console.log('✓ Đã tạo thành viên Đời I (Phan Thạnh, Trần Thị Hoàng), Đời II (Phan Tấn Thìn, Trần Đăng Thích, Lê Thị Lan, Trần Thị Ánh Tuyết) và Đời III (Trần Đăng Khoa, Trần Thị Mai)');

  // 5. Khởi tạo Lịch giỗ âm lịch truyền thống
  await prisma.ancestorAnniversary.createMany({
    data: [
      {
        id: 'ann-01',
        clanId: clan.id,
        memberId: g1_father.id,
        title: 'Lễ Giỗ Cụ Khởi Tổ Phan Thạnh',
        lunarDay: 15,
        lunarMonth: 3,
        location: 'Từ Đường Dòng Họ (Nga Sơn, Thanh Hóa)',
        description: 'Ngày kỵ nhật trọng thể của Cụ Khởi tổ dòng họ. Toàn thể con cháu các chi tập trung bái tổ.',
        reminderDaysBefore: 10,
        status: 'approved',
      },
      {
        id: 'ann-02',
        clanId: clan.id,
        memberId: g1_mother.id,
        title: 'Lễ Giỗ Cụ Bà Trần Thị Hoàng',
        lunarDay: 8,
        lunarMonth: 9,
        location: 'Từ Đường Dòng Họ',
        description: 'Kỵ nhật Cụ Bà Chính Thất, dâng hương tri ân công đức dưỡng dục sinh thành.',
        reminderDaysBefore: 7,
        status: 'approved',
      },
      {
        id: 'ann-03',
        clanId: clan.id,
        memberId: g2_son1.id,
        title: 'Lễ Giỗ Liệt Sĩ Phan Tấn Thìn',
        lunarDay: 14,
        lunarMonth: 1,
        location: 'Khu tưởng niệm Liệt sĩ Từ Đường & Nghĩa trang Liệt sĩ',
        description: 'Lễ giỗ kỵ nhật Liệt sĩ Phan Tấn Thìn hy sinh trong chiến dịch Mậu Thân 1968.',
        reminderDaysBefore: 5,
        status: 'approved',
      },
      {
        id: 'ann-04',
        clanId: clan.id,
        memberId: g2_son2.id,
        title: 'Lễ Giỗ Cụ Trần Đăng Thích',
        lunarDay: 9,
        lunarMonth: 10,
        location: 'Nhà thờ Chi 2 (Đà Nẵng)',
        description: 'Lễ giỗ Cụ Trần Đăng Thích do Chi 2 chủ trì tổ chức.',
        reminderDaysBefore: 7,
        status: 'approved',
      },
    ],
  });
  console.log('✓ Đã tạo 4 Ngày Giỗ âm lịch kỵ nhật truyền thống');

  // 6. Khởi tạo Sự kiện dòng họ
  await prisma.clanEvent.createMany({
    data: [
      {
        id: 'ev-01',
        clanId: clan.id,
        title: 'Đại Lễ Chạp Họ & Bái Tổ Đầu Xuân 2026',
        category: 'CEREMONY',
        content: 'Đại hội dòng họ tổ chức vào Rằm tháng Giêng âm lịch hàng năm tại Từ Đường dòng họ.',
        eventDate: new Date('2026-03-03T08:00:00Z'),
        location: 'Từ Đường Dòng Họ, Nga Sơn, Thanh Hóa',
        isPublic: true,
      },
      {
        id: 'ev-02',
        clanId: clan.id,
        title: 'Tiết Thanh Minh & Tảo Mộ Dòng Họ',
        category: 'MEETING',
        content: 'Con cháu tập trung viếng mộ Cụ Khởi Tổ và khu nghĩa trang dòng tộc nhân tiết Thanh minh.',
        eventDate: new Date('2026-04-05T07:30:00Z'),
        location: 'Nghĩa trang dòng họ Nga Sơn',
        isPublic: true,
      },
    ],
  });

  // 7. Khởi tạo Nhật ký thay đổi (Audit Log) ban đầu
  await prisma.auditLog.create({
    data: {
      clanId: clan.id,
      userName: 'Phan Anh Thư (Tổng Quản Trị)',
      userEmail: 'anhthuphan0102@gmail.com',
      action: 'KHỞI TẠO PHẢ HỆ',
      target: 'Gia phả dòng họ',
      details: 'Khởi tạo phả hệ 1-2 đời với Cụ Khởi Tổ Phan Thạnh và con cháu trực hệ',
    },
  });

  console.log('--- KHỞI TẠO DỮ LIỆU MẪU HOÀN TẤT THÀNH CÔNG ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
