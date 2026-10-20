const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang khởi tạo dữ liệu mẫu cho Gia Phả Việt ---');

  // Xóa dữ liệu cũ nếu có
  await prisma.auditLog.deleteMany();
  await prisma.changeRequest.deleteMany();
  await prisma.clanFund.deleteMany();
  await prisma.clanDocument.deleteMany();
  await prisma.clanEvent.deleteMany();
  await prisma.ancestorAnniversary.deleteMany();
  await prisma.marriage.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.clanBranch.deleteMany();
  await prisma.clan.deleteMany();
  await prisma.user.deleteMany();

  // 1. Tạo tài khoản Admin bắt buộc theo yêu cầu:
  // email: anhthuphan0102@gmail.com, mk: 010204
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
        name: 'Phan Văn Định (Trưởng Chi 1)',
        role: 'BRANCH_MANAGER',
      },
      {
        email: 'thanhvien@giaphaviet.vn',
        passwordHash: demoPasswordHash,
        name: 'Phan Quốc Bảo (Thành viên Dòng họ)',
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

  // 2. Tạo Dòng Họ chính
  const clan = await prisma.clan.create({
    data: {
      name: 'Gia Phả Phan Tộc Đại Tông',
      couplet1: 'Tổ Tiên Công Đức Thiên Niên Thịnh',
      couplet2: 'Tử Hiếu Tôn Hiền Vạn Đại Vinh',
      originLocation: 'Nga Sơn, Thanh Hóa, Việt Nam',
      mainRegion: 'Miền Bắc & Miền Trung',
      slug: 'phan-toc-dai-tong',
      ancestralHall: 'Từ Đường Phan Tộc, Làng Nga Điền, Huyện Nga Sơn, Thanh Hóa',
      historySummary:
        'Dòng họ Phan tại Nga Sơn có cội nguồn từ thế kỷ 16. Khởi tổ Phan Công Diệu cùng phu nhân Nguyễn Thị Mai khai hoang lập ấp, đời đời truyền thừa tinh thần hiếu học, phụng sự quê hương đất nước. Trải qua 5 thế hệ sinh sôi, dòng họ đã hình thành 4 chi họ lớn vững mạnh.',
      isPublic: true,
      allowMemberInvite: true,
    },
  });
  console.log('✓ Đã tạo Clan:', clan.name);

  // 3. Tạo 1 - 4 Chi nhánh mẫu ban đầu theo yêu cầu
  const branch1 = await prisma.clanBranch.create({
    data: {
      clanId: clan.id,
      branchName: 'Chi 1 - Trưởng Chi (Tiền Giang)',
      branchOrder: 1,
      leaderName: 'Cụ Phan Văn Định',
      description: 'Nhánh con cháu Cụ Khởi Tổ chi thứ nhất, phụ trách trông coi Nhà thờ họ chính tại Thanh Hóa.',
      residenceArea: 'Nga Sơn, Thanh Hóa & Hà Nội',
    },
  });

  const branch2 = await prisma.clanBranch.create({
    data: {
      clanId: clan.id,
      branchName: 'Chi 2 - Chi Giáp (Hậu Giang)',
      branchOrder: 2,
      leaderName: 'Ông Phan Văn Tường',
      description: 'Nhánh con cháu phát triển mạnh về kinh thương và kỹ nghệ.',
      residenceArea: 'Nghệ An & Đà Nẵng',
    },
  });

  const branch3 = await prisma.clanBranch.create({
    data: {
      clanId: clan.id,
      branchName: 'Chi 3 - Chi Ất (Tây Đô)',
      branchOrder: 3,
      leaderName: 'Ông Phan Trọng Nghĩa',
      description: 'Nhánh con cháu tập trung vào học vấn, giáo dục và khoa cử.',
      residenceArea: 'Nam Định & Hà Nội',
    },
  });

  const branch4 = await prisma.clanBranch.create({
    data: {
      clanId: clan.id,
      branchName: 'Chi 4 - Chi Bính (Thăng Long)',
      branchOrder: 4,
      leaderName: 'Ông Phan Đình Bách',
      description: 'Nhánh lập nghiệp tại phương Nam và thủ đô, đóng góp nhiều cho quỹ dòng tộc.',
      residenceArea: 'Hà Nội & TP. Hồ Chí Minh',
    },
  });
  console.log('✓ Đã tạo 4 Chi họ mẫu ban đầu (Chi 1, Chi 2, Chi 3, Chi 4)');

  // 4. Tạo Hồ sơ thành viên qua các thế hệ
  // ĐỜI 1: Khởi Tổ Phụ & Khởi Tổ Mẫu
  const gen1_father = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      memberCode: 'PT-G1-01',
      fullName: 'Phan Công Diệu',
      courtesyName: 'Hiệu Thuần Chính, Pháp danh Phúc Thiện',
      gender: 'MALE',
      generation: 1,
      birthSolar: '1850-02-15',
      birthLunar: '05/01/Canh Tuất',
      deathSolar: '1925-08-20',
      deathLunar: '02/07/Ất Sửu',
      isAlive: false,
      burialPlace: 'Đồi Kim Quy, Nga Sơn, Thanh Hóa',
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Nga Sơn, Thanh Hóa',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60',
      biography: 'Đỗ tú tài thời Nguyễn, có công khai hoang 50 mẫu ruộng lập làng, để lại gia phong nhân nghĩa lễ trí tín.',
      isVerified: true,
    },
  });

  const gen1_mother = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      memberCode: 'PT-G1-02',
      fullName: 'Nguyễn Thị Mai',
      courtesyName: 'Hiệu Từ Hòa',
      gender: 'FEMALE',
      generation: 1,
      birthSolar: '1855-06-10',
      birthLunar: '26/04/Ất Mão',
      deathSolar: '1930-11-12',
      deathLunar: '22/10/Canh Ngọ',
      isAlive: false,
      burialPlace: 'Khu lăng mộ Phan Tộc, Nga Sơn',
      hometown: 'Vĩnh Lộc, Thanh Hóa',
      currentResidence: 'Nga Sơn, Thanh Hóa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60',
      biography: 'Hiền thục đoan trang, trợ giúp chồng gây dựng gia nghiệp, nuôi dạy 4 con trai đỗ đạt.',
      isVerified: true,
    },
  });

  await prisma.marriage.create({
    data: {
      husbandId: gen1_father.id,
      wifeId: gen1_mother.id,
      marriageOrder: 1,
      note: 'Chánh thất phu nhân',
    },
  });

  // ĐỜI 2: 4 người con trai đứng đầu 4 Chi
  const gen2_c1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G2-01',
      fullName: 'Phan Văn Khang',
      courtesyName: 'Bá Đạt',
      gender: 'MALE',
      generation: 2,
      birthSolar: '1880-03-12',
      birthLunar: '02/02/Canh Thìn',
      deathSolar: '1955-04-10',
      deathLunar: '18/03/Ất Mùi',
      isAlive: false,
      burialPlace: 'Nghĩa trang Phan Tộc, Nga Sơn',
      fatherId: gen1_father.id,
      motherId: gen1_mother.id,
      biography: 'Trưởng nam Đời 2, người sáng lập Chi 1 Trưởng Chi, kế thừa việc tế tự hương hỏa.',
      isVerified: true,
    },
  });

  const gen2_c1_wife = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G2-01W',
      fullName: 'Lê Thị Huệ',
      gender: 'FEMALE',
      generation: 2,
      birthSolar: '1884-07-15',
      birthLunar: '23/05/Giáp Thân',
      deathSolar: '1960-09-02',
      deathLunar: '12/08/Canh Tý',
      isAlive: false,
      biography: 'Phu nhân cụ Khang, chăm lo gia nội gương mẫu.',
      isVerified: true,
    },
  });

  await prisma.marriage.create({
    data: {
      husbandId: gen2_c1.id,
      wifeId: gen2_c1_wife.id,
      marriageOrder: 1,
    },
  });

  const gen2_c2 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch2.id,
      memberCode: 'PT-G2-02',
      fullName: 'Phan Văn Thịnh',
      courtesyName: 'Trọng Hưng',
      gender: 'MALE',
      generation: 2,
      birthSolar: '1883-09-05',
      birthLunar: '05/08/Quý Mùi',
      deathSolar: '1962-12-01',
      deathLunar: '05/11/Nhâm Dần',
      isAlive: false,
      fatherId: gen1_father.id,
      motherId: gen1_mother.id,
      biography: 'Thứ nam Đời 2, sáng lập Chi 2 Chi Giáp, mở mang giao thương vùng biển Nam Trung Bộ.',
      isVerified: true,
    },
  });

  const gen2_c3 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch3.id,
      memberCode: 'PT-G2-03',
      fullName: 'Phan Văn Hòa',
      courtesyName: 'Thúc Thuận',
      gender: 'MALE',
      generation: 2,
      birthSolar: '1887-11-20',
      birthLunar: '06/10/Đinh Hợi',
      deathSolar: '1968-05-14',
      deathLunar: '18/04/Mậu Thân',
      isAlive: false,
      fatherId: gen1_father.id,
      motherId: gen1_mother.id,
      biography: 'Tam nam Đời 2, sáng lập Chi 3 Chi Ất, dạy học tại thành Nam.',
      isVerified: true,
    },
  });

  const gen2_c4 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch4.id,
      memberCode: 'PT-G2-04',
      fullName: 'Phan Văn Kiệt',
      courtesyName: 'Quý Minh',
      gender: 'MALE',
      generation: 2,
      birthSolar: '1892-01-18',
      birthLunar: '19/12/Tân Mão',
      deathSolar: '1975-01-20',
      deathLunar: '09/12/Giáp Dần',
      isAlive: false,
      fatherId: gen1_father.id,
      motherId: gen1_mother.id,
      biography: 'Tứ nam Đời 2, sáng lập Chi 4 Chi Bính.',
      isVerified: true,
    },
  });

  // ĐỜI 3 (Chi 1 - Trưởng Chi)
  const gen3_c1_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G3-01',
      fullName: 'Phan Văn Định',
      gender: 'MALE',
      generation: 3,
      birthSolar: '1915-05-20',
      birthLunar: '07/04/Ất Mão',
      deathSolar: '1998-10-15',
      deathLunar: '25/08/Mậu Dần',
      isAlive: false,
      fatherId: gen2_c1.id,
      motherId: gen2_c1_wife.id,
      biography: 'Trưởng chi Đời 3, từng tham gia kháng chiến chống Pháp, giữ gìn gia phả dòng họ qua thời chiến.',
      isVerified: true,
    },
  });

  const gen3_c1_1_wife = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G3-01W',
      fullName: 'Trần Thị Lan',
      gender: 'FEMALE',
      generation: 3,
      birthSolar: '1920-02-14',
      isAlive: false,
      deathSolar: '2005-06-18',
      biography: 'Bà mẹ Việt Nam Anh Hùng.',
      isVerified: true,
    },
  });

  await prisma.marriage.create({
    data: {
      husbandId: gen3_c1_1.id,
      wifeId: gen3_c1_1_wife.id,
      marriageOrder: 1,
    },
  });

  // ĐỜI 4 (Chi 1)
  const gen4_c1_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G4-01',
      fullName: 'Phan Quốc Hưng',
      gender: 'MALE',
      generation: 4,
      birthSolar: '1952-08-10',
      birthLunar: '20/06/Nhâm Thìn',
      isAlive: true,
      fatherId: gen3_c1_1.id,
      motherId: gen3_c1_1_wife.id,
      hometown: 'Nga Sơn, Thanh Hóa',
      currentResidence: 'Quận Ba Đình, Hà Nội',
      phone: '0912345678',
      biography: 'Kỹ sư cầu đường cao cấp về hưu, hiện giữ chức Phó Ban liên lạc dòng họ.',
      isVerified: true,
    },
  });

  const gen4_c1_1_wife = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G4-01W',
      fullName: 'Vũ Thị Minh Nguyệt',
      gender: 'FEMALE',
      generation: 4,
      birthSolar: '1956-11-25',
      isAlive: true,
      currentResidence: 'Hà Nội',
      biography: 'Nguyên giáo viên cấp 3 chuyên Hà Nội.',
      isVerified: true,
    },
  });

  await prisma.marriage.create({
    data: {
      husbandId: gen4_c1_1.id,
      wifeId: gen4_c1_1_wife.id,
      marriageOrder: 1,
    },
  });

  const gen4_c1_2 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G4-02',
      fullName: 'Phan Thị Bích Thủy',
      gender: 'FEMALE',
      generation: 4,
      birthSolar: '1958-03-05',
      isAlive: true,
      fatherId: gen3_c1_1.id,
      motherId: gen3_c1_1_wife.id,
      currentResidence: 'TP. Hồ Chí Minh',
      isVerified: true,
    },
  });

  // ĐỜI 5 (Chi 1 - Trưởng Chi)
  const gen5_c1_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G5-01',
      fullName: 'Phan Quốc Bảo',
      gender: 'MALE',
      generation: 5,
      birthSolar: '1982-04-15',
      birthLunar: '21/03/Nhâm Tuất',
      isAlive: true,
      fatherId: gen4_c1_1.id,
      motherId: gen4_c1_1_wife.id,
      currentResidence: 'Hà Nội',
      phone: '0988776655',
      biography: 'Tiến sĩ Công nghệ Thông tin, Đại học Bách Khoa Hà Nội. Tích cực tham gia quản trị gia phả số.',
      isVerified: true,
    },
  });

  const gen5_c1_2 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch1.id,
      memberCode: 'PT-G5-02',
      fullName: 'Phan Anh Thư',
      courtesyName: 'Quản trị viên Hệ Thống',
      gender: 'FEMALE',
      generation: 5,
      birthSolar: '2004-02-01',
      birthLunar: '11/01/Giáp Thân',
      isAlive: true,
      fatherId: gen4_c1_1.id,
      motherId: gen4_c1_1_wife.id,
      currentResidence: 'Hà Nội',
      phone: '0901020404',
      biography: 'Sinh viên xuất sắc ngành Khoa học Máy tính. Quản trị viên điều hành Gia Phả Việt.',
      isVerified: true,
    },
  });

  // Đời 3 & 4 cho Chi 2 (Chi Giáp)
  const gen3_c2_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch2.id,
      memberCode: 'PT-G3-02',
      fullName: 'Phan Văn Tường',
      gender: 'MALE',
      generation: 3,
      birthSolar: '1925-06-18',
      deathSolar: '2010-01-05',
      isAlive: false,
      fatherId: gen2_c2.id,
      biography: 'Doanh nhân tiền bối ngành chế biến lâm sản Đà Nẵng.',
      isVerified: true,
    },
  });

  const gen4_c2_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch2.id,
      memberCode: 'PT-G4-03',
      fullName: 'Phan Hải Nam',
      gender: 'MALE',
      generation: 4,
      birthSolar: '1965-09-12',
      isAlive: true,
      fatherId: gen3_c2_1.id,
      currentResidence: 'Hải Châu, Đà Nẵng',
      phone: '0905123456',
      isVerified: true,
    },
  });

  // Đời 3 & 4 cho Chi 3 (Chi Ất)
  const gen3_c3_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch3.id,
      memberCode: 'PT-G3-03',
      fullName: 'Phan Trọng Nghĩa',
      gender: 'MALE',
      generation: 3,
      birthSolar: '1930-10-10',
      deathSolar: '2015-08-22',
      isAlive: false,
      fatherId: gen2_c3.id,
      biography: 'Nhà giáo ưu tú, hiệu trưởng trường chuyên Nam Định.',
      isVerified: true,
    },
  });

  // Đời 3 & 4 cho Chi 4 (Chi Bính)
  const gen3_c4_1 = await prisma.memberProfile.create({
    data: {
      clanId: clan.id,
      branchId: branch4.id,
      memberCode: 'PT-G3-04',
      fullName: 'Phan Đình Bách',
      gender: 'MALE',
      generation: 3,
      birthSolar: '1935-12-05',
      isAlive: true,
      fatherId: gen2_c4.id,
      currentResidence: 'Quận 1, TP. Hồ Chí Minh',
      biography: 'Chủ nhiệm CLB Doanh nhân họ Phan phía Nam.',
      isVerified: true,
    },
  });

  console.log('✓ Đã tạo thành viên 5 thế hệ liên kết cha mẹ, con cái và hôn phối');

  // 5. Tạo Ngày Giỗ & Quy tắc ngày giỗ âm lịch
  await prisma.ancestorAnniversary.createMany({
    data: [
      {
        clanId: clan.id,
        memberId: gen1_father.id,
        title: 'Đại Lễ Giỗ Cụ Khởi Tổ Phan Công Diệu',
        lunarDay: 2,
        lunarMonth: 7,
        location: 'Từ Đường Phan Tộc, Nga Sơn, Thanh Hóa',
        description: 'Ngày giỗ lớn nhất trong năm của toàn bộ 4 chi họ. Con cháu tề tựu cúng bái và họp họ.',
        reminderDaysBefore: 15,
      },
      {
        clanId: clan.id,
        memberId: gen1_mother.id,
        title: 'Lễ Giỗ Cụ Khởi Tổ Mẫu Nguyễn Thị Mai',
        lunarDay: 22,
        lunarMonth: 10,
        location: 'Từ Đường Phan Tộc, Nga Sơn, Thanh Hóa',
        description: 'Con cháu dâng lễ hoa quả chay, tri ân đức dưỡng dục của Cụ Khởi Tổ Mẫu.',
        reminderDaysBefore: 7,
      },
      {
        clanId: clan.id,
        memberId: gen2_c1.id,
        title: 'Giỗ Cụ Trưởng Chi Đời 2 Phan Văn Khang',
        lunarDay: 18,
        lunarMonth: 3,
        location: 'Nhà thờ Chi 1, Thanh Hóa',
        description: 'Chi 1 tổ chức giỗ tưởng niệm.',
        reminderDaysBefore: 7,
      },
    ],
  });
  console.log('✓ Đã tạo Lịch giỗ âm lịch truyền thống');

  // 6. Tạo Sự kiện dòng họ & Tin tức
  await prisma.clanEvent.createMany({
    data: [
      {
        clanId: clan.id,
        title: 'Thông báo Họp mặt Con Cháu Đầu Xuân Ất Tỵ 2026',
        category: 'MEETING',
        content:
          'Ban Quản lý dòng họ Phan trân trọng kính mời toàn thể con cháu nội ngoại bốn phương về dự Lễ Tế Tổ và Mừng Thọ các cụ cao niên vào sáng mùng 4 Tết tại Từ đường dòng họ.',
        eventDate: new Date('2026-02-20T08:00:00Z'),
        location: 'Từ Đường Phan Tộc, Nga Sơn, Thanh Hóa',
        isPublic: true,
      },
      {
        clanId: clan.id,
        title: 'Lễ Trao Thưởng Quỹ Khuyến Học Phan Tộc Mùa Thi 2025 - 2026',
        category: 'CEREMONY',
        content:
          'Năm học vừa qua, dòng họ có 12 cháu đỗ đại học và 25 cháu đạt giải thi học sinh giỏi cấp tỉnh, quốc gia. Ban Khuyến học sẽ vinh danh và trao học bổng.',
        eventDate: new Date('2026-03-15T09:00:00Z'),
        location: 'Hội trường Từ đường',
        isPublic: true,
      },
    ],
  });

  // 7. Tạo Quỹ dòng họ & Khuyến học
  await prisma.clanFund.createMany({
    data: [
      {
        clanId: clan.id,
        fundType: 'CONSTRUCTION',
        transactionType: 'INCOME',
        amount: 50000000,
        title: 'Đóng góp tu sửa mái ngói và hoành phi Từ đường',
        contributorOrRecipient: 'Chi 4 (Đại diện: Phan Đình Bách)',
        status: 'APPROVED',
        notes: 'Chuyển khoản quỹ dòng họ - Đã xác nhận chứng từ',
      },
      {
        clanId: clan.id,
        fundType: 'SCHOLARSHIP',
        transactionType: 'INCOME',
        amount: 30000000,
        title: 'Tài trợ Quỹ Khuyến học niên khóa 2025 - 2026',
        contributorOrRecipient: 'TS. Phan Quốc Bảo (Chi 1)',
        status: 'APPROVED',
        notes: 'Ủng hộ định kỳ hàng năm khuyến khích tân sinh viên',
      },
      {
        clanId: clan.id,
        fundType: 'SCHOLARSHIP',
        transactionType: 'EXPENSE',
        amount: 15000000,
        title: 'Chi thưởng 15 suất học bổng tân sinh viên',
        contributorOrRecipient: 'Ban Khuyến học trao cho 15 em học sinh',
        status: 'APPROVED',
        notes: 'Đã trao trực tiếp tại Lễ Khuyến học',
      },
      {
        clanId: clan.id,
        fundType: 'GENERAL',
        transactionType: 'INCOME',
        amount: 20000000,
        title: 'Đóng góp công đức đầu năm từ bà con kiều bào',
        contributorOrRecipient: 'Hội đồng hương Phan Tộc Hải Ngoại',
        status: 'APPROVED',
        notes: 'Bổ sung quỹ duy trì nhang khói và hoạt động thường niên',
      },
    ],
  });
  console.log('✓ Đã tạo Quỹ dòng họ & Quỹ khuyến học minh bạch');

  // 8. Tạo Thư viện tư liệu & văn bia số hóa
  await prisma.clanDocument.createMany({
    data: [
      {
        clanId: clan.id,
        title: 'Gia phả cổ bản chữ Hán thế kỷ 18',
        type: 'BOOK',
        fileUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        era: 'Niên hiệu Cảnh Hưng (Hậu Lê)',
        author: 'Cụ Phan Đức Tín tiên sinh',
        description: 'Tập gia phả chép tay trên giấy dó cổ truyền ghi chép thế thứ từ Cụ Khởi Tổ.',
      },
      {
        clanId: clan.id,
        title: 'Văn bia Công đức Từ đường Phan Tộc',
        type: 'EPITAPH',
        fileUrl: 'https://images.unsplash.com/photo-1599827056335-675e0170a4a8?w=800&auto=format&fit=crop&q=80',
        era: 'Năm 1912 (Duy Tân thứ 6)',
        description: 'Khắc trên đá xanh nguyên khối ghi danh các bậc tiền bối hưng công kiến thiết từ đường.',
      },
      {
        clanId: clan.id,
        title: 'Ảnh toàn cảnh Nhà thờ họ Phan tại Nga Sơn',
        type: 'IMAGE',
        fileUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
        era: 'Thời đại mới (2024)',
        description: 'Ảnh chụp kiến trúc 5 gian gỗ lim và cổng tam quan sau đợt đại trùng tu.',
      },
    ],
  });

  // 9. Tạo Yêu cầu đề xuất thay đổi & Duyệt dữ liệu mẫu
  await prisma.changeRequest.create({
    data: {
      clanId: clan.id,
      memberId: gen5_c1_2.id,
      requesterName: 'Phan Anh Thư',
      requesterEmail: 'anhthuphan0102@gmail.com',
      changeType: 'UPDATE_PROFILE',
      proposedData: JSON.stringify({
        field: 'biography',
        newValue: 'Tốt nghiệp thủ khoa Học viện Công nghệ, tích cực số hóa cây gia phả 4 chi họ.',
      }),
      reason: 'Cập nhật thành tích học tập mới nhất của thành viên Đời 5',
      evidenceSource: 'Bằng khen và biên bản họp Chi 1 năm 2026',
      status: 'APPROVED',
      reviewerNote: 'Đã xác minh đầy đủ giấy tờ chứng nhận.',
      reviewedAt: new Date(),
    },
  });

  // 10. Tạo Nhật ký kiểm toán hệ thống
  await prisma.auditLog.createMany({
    data: [
      {
        clanId: clan.id,
        userName: 'Phan Anh Thư (Admin)',
        userEmail: 'anhthuphan0102@gmail.com',
        action: 'KHỞI TẠO HỆ THỐNG',
        target: 'Gia Phả Phan Tộc Đại Tông',
        details: 'Khởi tạo dữ liệu ban đầu gồm 4 chi họ, 5 thế hệ, kết nối quan hệ và phân quyền quản trị.',
      },
      {
        clanId: clan.id,
        userName: 'Phan Anh Thư (Admin)',
        userEmail: 'anhthuphan0102@gmail.com',
        action: 'DUYỆT ĐỀ XUẤT',
        target: 'Hồ sơ thành viên Phan Anh Thư',
        details: 'Phê duyệt cập nhật tiểu sử và học vị.',
      },
    ],
  });

  console.log('--- KHỞI TẠO DỮ LIỆU THÀNH CÔNG ---');
  console.log('Tài khoản Quản trị:');
  console.log('  Email: anhthuphan0102@gmail.com');
  console.log('  Mật khẩu: 010204');
  console.log('  Vai trò: ADMIN');
  console.log('  Dòng họ: Gia Phả Phan Tộc Đại Tông (4 chi họ mẫu ban đầu)');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
