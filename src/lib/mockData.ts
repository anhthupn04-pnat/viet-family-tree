/**
 * DỮ LIỆU MẪU CHUẨN DÒNG HỌ (MOCK DATA SEEDING - 1 ĐẾN 2 ĐỜI + ĐỜI 3)
 * Đáp ứng đặc tả kỹ thuật văn hóa dòng họ Việt Nam:
 * - Đời I: Cụ Ông "Phan Thạnh" & Cụ Bà "Trần Thị Hoàng"
 * - Đời II:
 *   + Con trưởng: "Phan Tấn Thìn" (Liệt sĩ, sao đỏ, hy sinh vì Tổ quốc)
 *   + Con thứ 2: "Trần Đăng Thích" (Vợ: Lê Thị Lan, 2 con Đời III: Trần Đăng Khoa & Trần Thị Mai)
 *   + Con gái thứ 3: "Trần Thị Ánh Tuyết" (Còn sống)
 * - Đời III: "Trần Đăng Khoa" (Nam) & "Trần Thị Mai" (Nữ)
 */

export interface MockMember {
  id: string;
  memberCode: string;
  fullName: string;
  courtesyName?: string | null;
  gender: "MALE" | "FEMALE";
  generation: number;
  birthOrder?: string | null;
  isAlive: boolean;
  isMartyr?: boolean;
  birthSolar?: string | null;
  birthLunar?: string | null;
  deathSolar?: string | null;
  deathLunar?: string | null;
  burialPlace?: string | null;
  hometown?: string | null;
  currentResidence?: string | null;
  avatarUrl?: string | null;
  biography?: string | null;
  phone?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouses?: any[];
  childrenIds?: string[];
  status?: string;
}

export const MOCK_CLAN = {
  id: "clan-phan-toc-main",
  name: "Gia phả dòng họ",
  couplet1: "Tổ Tiên Công Đức Thiên Niên Thịnh",
  couplet2: "Tử Hiếu Tôn Hiền Vạn Đại Vinh",
  originLocation: "Nga Sơn, Thanh Hóa & Thừa Thiên Huế, Việt Nam",
  mainRegion: "Bắc - Trung - Nam",
  slug: "gia-pha-dong-ho",
  ancestralHall: "Từ Đường Dòng Họ, Xã Nga Điền, Huyện Nga Sơn, Tỉnh Thanh Hóa",
  historySummary:
    "Dòng họ có cội nguồn truyền thống lâu đời, đời đời truyền thừa tinh thần cần cù, hiếu học và phụng sự quê hương đất nước. Trải qua các biến cố lịch sử, con cháu luôn giữ vững gia phong, gắn kết tình tự huyết thống và đùm bọc lẫn nhau.",
  isPublic: true,
  allowMemberInvite: true,
  inviteCode: "GPDH-2026",
};

export const MOCK_BRANCHES = [
  {
    id: "branch-1",
    clanId: "clan-phan-toc-main",
    branchName: "Chi 1 - Trưởng Chi",
    branchOrder: 1,
    leaderName: "Phan Tấn Thìn (Liệt sĩ - Trưởng chi)",
    description: "Nhánh con trưởng Cụ Khởi Tổ Phan Thạnh, trông coi tổ quán.",
    residenceArea: "Thanh Hóa & Hà Nội",
  },
  {
    id: "branch-2",
    clanId: "clan-phan-toc-main",
    branchName: "Chi 2 - Chi Giáp",
    branchOrder: 2,
    leaderName: "Trần Đăng Thích",
    description: "Nhánh con thứ 2, phát triển kinh thương và hậu duệ đời III.",
    residenceArea: "Đà Nẵng & TP. Hồ Chí Minh",
  },
  {
    id: "branch-3",
    clanId: "clan-phan-toc-main",
    branchName: "Chi 3 - Chi Nữ Phái",
    branchOrder: 3,
    leaderName: "Trần Thị Ánh Tuyết",
    description: "Nhánh con gái thứ 3, gìn giữ nếp nhà truyền thống.",
    residenceArea: "Huế & TP. Hồ Chí Minh",
  },
];

export const MOCK_MEMBERS: MockMember[] = [
  // =========================================================================
  // ĐỜI I: KHỞI TỔ PHỤ & CỤ BÀ
  // =========================================================================
  {
    id: "mem-g1-01",
    memberCode: "PT-G1-01",
    fullName: "Phan Thạnh",
    courtesyName: "Cụ Khởi Tổ (Hiệu Phúc Thiện)",
    gender: "MALE",
    generation: 1,
    birthOrder: "Khởi tổ",
    isAlive: false,
    isMartyr: false,
    birthSolar: "1910-02-15",
    birthLunar: "06/01/Canh Tuất",
    deathSolar: "1985-05-04",
    deathLunar: "15 tháng 3 Âm lịch",
    burialPlace: "Khu nghĩa trang dòng họ (Đồi hoa sen, xã Nga Điền, Nga Sơn)",
    hometown: "Nga Sơn, Thanh Hóa",
    currentResidence: "Từ đường dòng họ",
    avatarUrl: "",
    biography:
      "Cụ Khởi tổ dòng họ, đức độ uy nghiêm, tinh thông nho y, có công khai hoang lập ấp và tạo dựng cơ đồ dòng họ từ những năm đầu thế kỷ 20.",
    phone: "",
    branchId: "branch-1",
    branchName: "Chi 1 - Trưởng Chi",
    fatherId: null,
    motherId: null,
    status: "approved",
    childrenIds: ["mem-g2-01", "mem-g2-02", "mem-g2-04"],
    spouses: [
      {
        id: "mem-g1-02",
        fullName: "Trần Thị Hoàng",
        gender: "FEMALE",
        generation: 1,
        relation: "WIFE",
        isAlive: false,
        birthSolar: "1914-08-20",
        deathSolar: "1990-10-25",
        deathLunar: "mùng 8 tháng 9 Âm lịch",
      },
    ],
  },
  {
    id: "mem-g1-02",
    memberCode: "PT-G1-02",
    fullName: "Trần Thị Hoàng",
    courtesyName: "Cụ Bà Chính Thất (Hiệu Từ Tâm)",
    gender: "FEMALE",
    generation: 1,
    birthOrder: "Cụ Bà Chính Thất",
    isAlive: false,
    isMartyr: false,
    birthSolar: "1914-08-20",
    birthLunar: "30/06/Giáp Dần",
    deathSolar: "1990-10-25",
    deathLunar: "mùng 8 tháng 9 Âm lịch",
    burialPlace: "Khu nghĩa trang dòng họ, an táng bên tả mộ Cụ Ông",
    hometown: "Thừa Thiên Huế",
    currentResidence: "Từ đường dòng họ",
    avatarUrl: "",
    biography:
      "Phu nhân Cụ Khởi tổ, một đời tần tảo đảm đang, nuôi dưỡng con cái ăn học thành tài, đức hạnh vẹn toàn nức tiếng gần xa.",
    phone: "",
    branchId: "branch-1",
    branchName: "Chi 1 - Trưởng Chi",
    fatherId: null,
    motherId: null,
    status: "approved",
    childrenIds: ["mem-g2-01", "mem-g2-02", "mem-g2-04"],
    spouses: [
      {
        id: "mem-g1-01",
        fullName: "Phan Thạnh",
        gender: "MALE",
        generation: 1,
        relation: "HUSBAND",
        isAlive: false,
        birthSolar: "1910-02-15",
        deathSolar: "1985-05-04",
      },
    ],
  },

  // =========================================================================
  // ĐỜI II: CÁC CON TRỰC HỆ CỦA ĐỜI I
  // =========================================================================
  // 1. Con trưởng: Phan Tấn Thìn - Liệt sĩ
  {
    id: "mem-g2-01",
    memberCode: "PT-G2-01",
    fullName: "Phan Tấn Thìn",
    courtesyName: "Liệt sĩ Quân đội Nhân dân Việt Nam",
    gender: "MALE",
    generation: 2,
    birthOrder: "Con trưởng",
    isAlive: false,
    isMartyr: true,
    birthSolar: "1938-04-10",
    birthLunar: "10/03/Mậu Dần",
    deathSolar: "1968-02-12",
    deathLunar: "14 tháng 1 Âm lịch (Xuân Mậu Thân)",
    burialPlace: "Nghĩa trang Liệt sĩ Huyện & Đài tưởng niệm Dòng họ",
    hometown: "Nga Sơn, Thanh Hóa",
    currentResidence: "Tổ quốc ghi công",
    avatarUrl: "",
    biography:
      "Người con trưởng của Cụ Phan Thạnh. Tham gia chiến đấu dũng cảm trong cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968, anh dũng hy sinh vì độc lập tự do của Tổ quốc. Được Nhà nước truy tặng Huân chương Chiến công và Tổ quốc ghi công.",
    phone: "",
    branchId: "branch-1",
    branchName: "Chi 1 - Trưởng Chi",
    fatherId: "mem-g1-01",
    motherId: "mem-g1-02",
    status: "approved",
    childrenIds: [],
    spouses: [],
  },

  // 2. Con thứ hai: Trần Đăng Thích (Vợ: Lê Thị Lan)
  {
    id: "mem-g2-02",
    memberCode: "PT-G2-02",
    fullName: "Trần Đăng Thích",
    courtesyName: "Trưởng nhánh Chi 2",
    gender: "MALE",
    generation: 2,
    birthOrder: "Con thứ 2",
    isAlive: false,
    isMartyr: false,
    birthSolar: "1942-06-15",
    birthLunar: "02/05/Nhâm Ngọ",
    deathSolar: "2015-11-20",
    deathLunar: "09 tháng 10 Âm lịch",
    burialPlace: "Khu nghĩa trang dòng họ, Hàng thứ 2 khu Tây",
    hometown: "Nga Sơn, Thanh Hóa",
    currentResidence: "Đà Nẵng",
    avatarUrl: "",
    biography:
      "Kỹ sư xây dựng tài hoa, đóng góp công sức xây dựng nhiều công trình trọng điểm tại miền Trung. Luôn hướng về cội nguồn, khởi xướng quỹ khuyến học dòng họ.",
    phone: "",
    branchId: "branch-2",
    branchName: "Chi 2 - Chi Giáp",
    fatherId: "mem-g1-01",
    motherId: "mem-g1-02",
    status: "approved",
    childrenIds: ["mem-g3-01", "mem-g3-02"],
    spouses: [
      {
        id: "mem-g2-03",
        fullName: "Lê Thị Lan",
        gender: "FEMALE",
        generation: 2,
        relation: "WIFE",
        isAlive: true,
        birthSolar: "1945-09-12",
      },
    ],
  },
  // Vợ con thứ 2: Lê Thị Lan
  {
    id: "mem-g2-03",
    memberCode: "PT-G2-03",
    fullName: "Lê Thị Lan",
    courtesyName: "Dâu hiền Chi 2",
    gender: "FEMALE",
    generation: 2,
    birthOrder: "Dâu thứ 2",
    isAlive: true,
    isMartyr: false,
    birthSolar: "1945-09-12",
    birthLunar: "07/08/Ất Dậu",
    deathSolar: null,
    deathLunar: null,
    burialPlace: null,
    hometown: "Quảng Nam",
    currentResidence: "Đà Nẵng",
    avatarUrl: "",
    biography:
      "Cựu giáo viên nhân dân, phụ trách gìn giữ nề nếp gia phong Chi 2 và nuôi dạy các con cháu thành đạt.",
    phone: "0912345678",
    branchId: "branch-2",
    branchName: "Chi 2 - Chi Giáp",
    fatherId: null,
    motherId: null,
    status: "approved",
    childrenIds: ["mem-g3-01", "mem-g3-02"],
    spouses: [
      {
        id: "mem-g2-02",
        fullName: "Trần Đăng Thích",
        gender: "MALE",
        generation: 2,
        relation: "HUSBAND",
        isAlive: false,
        birthSolar: "1942-06-15",
        deathSolar: "2015-11-20",
      },
    ],
  },

  // 3. Con gái thứ 3: Trần Thị Ánh Tuyết
  {
    id: "mem-g2-04",
    memberCode: "PT-G2-04",
    fullName: "Trần Thị Ánh Tuyết",
    courtesyName: "Cô Ba",
    gender: "FEMALE",
    generation: 2,
    birthOrder: "Con gái thứ 3",
    isAlive: true,
    isMartyr: false,
    birthSolar: "1948-11-05",
    birthLunar: "05/10/Mậu Tý",
    deathSolar: null,
    deathLunar: null,
    burialPlace: null,
    hometown: "Nga Sơn, Thanh Hóa",
    currentResidence: "TP. Hồ Chí Minh",
    avatarUrl: "",
    biography:
      "Nghệ nhân thêu truyền thống, hiện đang sinh sống cùng con cháu tại TP. Hồ Chí Minh, luôn tích cực tài trợ cho các sự kiện họp họ hàng năm.",
    phone: "0908765432",
    branchId: "branch-3",
    branchName: "Chi 3 - Chi Nữ Phái",
    fatherId: "mem-g1-01",
    motherId: "mem-g1-02",
    status: "approved",
    childrenIds: [],
    spouses: [],
  },

  // =========================================================================
  // ĐỜI III: PHÂN NHÁNH HẬU DUỆ CHI 2 (MINH HỌA TIẾP NỐI)
  // =========================================================================
  // 1. Cháu đích tôn: Trần Đăng Khoa
  {
    id: "mem-g3-01",
    memberCode: "PT-G3-01",
    fullName: "Trần Đăng Khoa",
    courtesyName: "Cháu đích tôn Chi 2",
    gender: "MALE",
    generation: 3,
    birthOrder: "Con trai cả Chi 2",
    isAlive: true,
    isMartyr: false,
    birthSolar: "1970-03-24",
    birthLunar: "17/02/Canh Tuất",
    deathSolar: null,
    deathLunar: null,
    burialPlace: null,
    hometown: "Nga Sơn, Thanh Hóa",
    currentResidence: "Hà Nội",
    avatarUrl: "",
    biography:
      "Thạc sĩ Công nghệ Thông tin, phụ trách việc số hóa gia phả và kết nối các thế hệ kiều bào của dòng tộc.",
    phone: "0987654321",
    branchId: "branch-2",
    branchName: "Chi 2 - Chi Giáp",
    fatherId: "mem-g2-02",
    motherId: "mem-g2-03",
    status: "approved",
    childrenIds: [],
    spouses: [],
  },
  // 2. Cháu gái: Trần Thị Mai
  {
    id: "mem-g3-02",
    memberCode: "PT-G3-02",
    fullName: "Trần Thị Mai",
    courtesyName: "Cháu gái Chi 2",
    gender: "FEMALE",
    generation: 3,
    birthOrder: "Con gái thứ Chi 2",
    isAlive: true,
    isMartyr: false,
    birthSolar: "1975-09-18",
    birthLunar: "13/08/Ất Mão",
    deathSolar: null,
    deathLunar: null,
    burialPlace: null,
    hometown: "Nga Sơn, Thanh Hóa",
    currentResidence: "Đà Nẵng",
    avatarUrl: "",
    biography:
      "Bác sĩ chuyên khoa tại Bệnh viện Đa khoa Đà Nẵng, thường xuyên tham gia các chương trình khám bệnh từ thiện của dòng họ.",
    phone: "0934567890",
    branchId: "branch-2",
    branchName: "Chi 2 - Chi Giáp",
    fatherId: "mem-g2-02",
    motherId: "mem-g2-03",
    status: "approved",
    childrenIds: [],
    spouses: [],
  },
];

export const MOCK_ANNIVERSARIES = [
  {
    id: "ann-01",
    clanId: "clan-phan-toc-main",
    memberId: "mem-g1-01",
    title: "Lễ Giỗ Cụ Khởi Tổ Phan Thạnh",
    lunarDay: 15,
    lunarMonth: 3,
    location: "Từ Đường Dòng Họ (Nga Sơn, Thanh Hóa)",
    description: "Ngày kỵ nhật trọng thể của Cụ Khởi tổ dòng họ. Toàn thể con cháu các chi tập trung bái tổ.",
    reminderDaysBefore: 10,
    status: "approved",
    member: {
      id: "mem-g1-01",
      fullName: "Phan Thạnh",
      generation: 1,
      branch: { branchName: "Chi 1 - Trưởng Chi" },
    },
  },
  {
    id: "ann-02",
    clanId: "clan-phan-toc-main",
    memberId: "mem-g1-02",
    title: "Lễ Giỗ Cụ Bà Trần Thị Hoàng",
    lunarDay: 8,
    lunarMonth: 9,
    location: "Từ Đường Dòng Họ",
    description: "Kỵ nhật Cụ Bà Chính Thất, dâng hương tri ân công đức dưỡng dục sinh thành.",
    reminderDaysBefore: 7,
    status: "approved",
    member: {
      id: "mem-g1-02",
      fullName: "Trần Thị Hoàng",
      generation: 1,
      branch: { branchName: "Chi 1 - Trưởng Chi" },
    },
  },
  {
    id: "ann-03",
    clanId: "clan-phan-toc-main",
    memberId: "mem-g2-01",
    title: "Lễ Giỗ Liệt Sĩ Phan Tấn Thìn",
    lunarDay: 14,
    lunarMonth: 1,
    location: "Khu tưởng niệm Liệt sĩ Từ Đường & Nghĩa trang Liệt sĩ",
    description: "Lễ giỗ kỵ nhật Liệt sĩ Phan Tấn Thìn hy sinh trong chiến dịch Mậu Thân 1968.",
    reminderDaysBefore: 5,
    status: "approved",
    member: {
      id: "mem-g2-01",
      fullName: "Phan Tấn Thìn",
      generation: 2,
      branch: { branchName: "Chi 1 - Trưởng Chi" },
    },
  },
  {
    id: "ann-04",
    clanId: "clan-phan-toc-main",
    memberId: "mem-g2-02",
    title: "Lễ Giỗ Cụ Trần Đăng Thích",
    lunarDay: 9,
    lunarMonth: 10,
    location: "Nhà thờ Chi 2 (Đà Nẵng)",
    description: "Lễ giỗ Cụ Trần Đăng Thích do Chi 2 chủ trì tổ chức.",
    reminderDaysBefore: 7,
    status: "approved",
    member: {
      id: "mem-g2-02",
      fullName: "Trần Đăng Thích",
      generation: 2,
      branch: { branchName: "Chi 2 - Chi Giáp" },
    },
  },
];

export const MOCK_EVENTS = [
  {
    id: "ev-01",
    clanId: "clan-phan-toc-main",
    title: "Đại Lễ Chạp Họ & Bái Tổ Đầu Xuân 2026",
    category: "CEREMONY",
    content: "Đại hội dòng họ tổ chức vào Rằm tháng Giêng âm lịch hàng năm tại Từ Đường dòng họ.",
    eventDate: "2026-03-03T08:00:00Z",
    location: "Từ Đường Dòng Họ, Nga Sơn, Thanh Hóa",
    isPublic: true,
  },
  {
    id: "ev-02",
    clanId: "clan-phan-toc-main",
    title: "Tiết Thanh Minh & Tảo Mộ Dòng Họ",
    category: "MEETING",
    content: "Con cháu tập trung viếng mộ Cụ Khởi Tổ và khu nghĩa trang dòng tộc nhân tiết Thanh minh.",
    eventDate: "2026-04-05T07:30:00Z",
    location: "Nghĩa trang dòng họ Nga Sơn",
    isPublic: true,
  },
];
