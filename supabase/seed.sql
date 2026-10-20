-- =============================================================================
-- DIGITAL FAMILY TREE HUB — SEED DATA (4 THẾ HỆ CHUẨN VĂN HÓA VIỆT NAM)
-- =============================================================================

-- 1. Tài khoản Admin mẫu
INSERT INTO public.profiles (id, email, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'anhthuphan0102@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', email = 'anhthuphan0102@gmail.com';

-- 2. Dòng họ mẫu
INSERT INTO public.clans (
    id,
    name,
    origin_location,
    slug,
    couplet1,
    couplet2,
    ancestral_hall,
    history_summary,
    creator_id,
    invite_code
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Gia phả dòng họ Phan',
    'Nga Sơn, Thanh Hóa & Thừa Thiên Huế',
    'gia-pha-dong-ho-phan',
    'Tổ Tiên Công Đức Thiên Niên Thịnh',
    'Tử Hiếu Tôn Hiền Vạn Đại Vinh',
    'Từ Đường Dòng Họ Phan, Thôn Phúc Thịnh, Xã Nga Điền, Huyện Nga Sơn, Thanh Hóa',
    'Dòng họ có bề dày truyền thống văn hóa hiếu học, cần cù, đoàn kết và tương thân tương ái. Trải qua các thế hệ, con cháu luôn giữ vững gia phong, đùm bọc gắn kết và đóng góp tích cực cho quê hương.',
    '00000000-0000-0000-0000-000000000001',
    'GPDH-PHANTOC'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Thành viên 4 thế hệ chuẩn
-- ĐỜI I: KHỞI TỔ PHỤ & CỤ BÀ
INSERT INTO public.members (
    id, clan_id, full_name, nickname, courtesy_name, gender, generation_level, order_in_family,
    birth_order_title, branch_name, is_alive, birth_date_solar, death_date_solar,
    birth_date_lunar, death_date_lunar, death_date_lunar_day, death_date_lunar_month,
    burial_location, bio, achievements, status
)
VALUES
(
    '22222222-0001-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Thạnh',
    'Cụ Cố Ba',
    'Cụ Khởi Tổ (Hiệu Phúc Thiện)',
    'male',
    1,
    1,
    'Khởi tổ phụ',
    'Chi 1 - Trưởng Chi',
    false,
    '1910-04-12',
    '1985-05-04',
    '03/03/Canh Tuất',
    '15/03/Ất Sửu',
    15,
    3,
    'Khu lăng mộ tổ thôn Phúc Thịnh, Nga Sơn',
    'Cụ Khởi Tổ mở mang gia nghiệp, tính tình cương trực, đức độ, cả đời một lòng phụng dưỡng gia tộc và mở lớp dạy chữ Nho cho con em quanh vùng.',
    ARRAY['Đỗ Cử nhân thi Hương khoa Mậu Thìn 1928', 'Thầy đồ dạy chữ Nho và bốc thuốc Nam cứu tế dân nghèo', 'Khai hoang lập ấp, khởi tạo từ đường dòng họ'],
    'approved'
),
(
    '22222222-0001-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Trần Thị Hoàng',
    'Cụ Bà Từ Tâm',
    'Chính thất Khởi tổ mẫu',
    'female',
    1,
    1,
    'Khởi tổ mẫu',
    'Chi 1 - Trưởng Chi',
    false,
    '1914-09-20',
    '1990-10-06',
    '01/08/Giáp Dần',
    '18/08/Canh Ngọ',
    18,
    8,
    'Khu lăng mộ tổ thôn Phúc Thịnh, Nga Sơn',
    'Cụ Bà hiền thục nết na, tần tảo quán xuyến nếp nhà gia phong, luôn khuyên răn con cháu giữ trọn đạo hiếu và tương trợ xóm giềng.',
    ARRAY['Gìn giữ gia phong thuần hậu, nuôi dạy các con thành đạt', 'Công đức xây dựng chùa làng và cầu nông thôn'],
    'approved'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Cập nhật phối ngẫu Đời I
UPDATE public.members SET spouse_id = '22222222-0001-0001-0001-000000000002' WHERE id = '22222222-0001-0001-0001-000000000001';
UPDATE public.members SET spouse_id = '22222222-0001-0001-0001-000000000001' WHERE id = '22222222-0001-0001-0001-000000000002';

-- ĐỜI II: 3 NHÁNH TRƯỞNG, THỨ VÀ NỮ PHÁI
INSERT INTO public.members (
    id, clan_id, full_name, nickname, courtesy_name, gender, generation_level, order_in_family,
    birth_order_title, branch_name, is_alive, birth_date_solar, death_date_solar,
    birth_date_lunar, death_date_lunar, death_date_lunar_day, death_date_lunar_month,
    father_id, mother_id, burial_location, bio, achievements, status
)
VALUES
(
    '22222222-0002-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Tấn Thìn',
    'Bác Hai Trí',
    'Hiệu Trí Dũng',
    'male',
    2,
    1,
    'Trưởng nam',
    'Chi 1 - Trưởng Chi',
    false,
    '1938-03-10',
    '2018-06-25',
    '09/02/Mậu Dần',
    '12/05/Mậu Tuất',
    12,
    5,
    '22222222-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000002',
    'Nghĩa trang dòng họ, đồi An Lạc',
    'Cựu giáo chức ưu tú, có công gây dựng phong trào hiếu học của dòng họ và quê hương, chủ trì các việc tế lễ họ tộc chu đáo.',
    ARRAY['Cựu Hiệu trưởng Trường Tiểu học quê hương (1965 - 1985)', 'Sáng lập Quỹ khuyến học Phan Tộc', 'Chủ biên cuốn Gia Phả chép tay lưu truyền'],
    'approved'
),
(
    '22222222-0002-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Nguyễn Thị Diệu',
    'Bác Dâu Trưởng',
    NULL,
    'female',
    2,
    1,
    'Dâu trưởng',
    'Chi 1 - Trưởng Chi',
    true,
    '1942-08-15',
    NULL,
    '05/07/Nhâm Ngọ',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Hiện cư ngụ tại tổ quán, người gìn giữ từ đường trang nghiêm ấm cúng.',
    ARRAY['Nghệ nhân thêu tay truyền thống', 'Gia đình văn hóa tiêu biểu 30 năm liền'],
    'approved'
),
(
    '22222222-0002-0002-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Tấn Thích',
    'Chú Ba Hưng',
    'Hiệu Minh Hưng',
    'male',
    2,
    2,
    'Con thứ 2',
    'Chi 2 - Chi Giáp',
    true,
    '1946-11-20',
    NULL,
    '27/10/Bính Tuất',
    NULL,
    NULL,
    NULL,
    '22222222-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000002',
    NULL,
    'Kỹ sư nông nghiệp hưu trí, thường xuyên hỗ trợ học bổng cho các cháu nhỏ vượt khó học giỏi trong tộc họ.',
    ARRAY['Kỹ sư Nông nghiệp tiên phong phát triển kinh tế sinh thái', 'Ủng hộ kinh phí tu bổ nhà thờ họ tộc'],
    'approved'
),
(
    '22222222-0002-0002-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Lê Thị Lan',
    'Cô Ba Lan',
    NULL,
    'female',
    2,
    2,
    'Dâu thứ',
    'Chi 2 - Chi Giáp',
    true,
    '1950-02-14',
    NULL,
    '28/12/Kỷ Sửu',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Thầy thuốc ưu tú, tận tâm chăm sóc sức khỏe cho bà con họ tộc và xóm giềng.',
    ARRAY['Bác sĩ Trưởng trạm Y tế xã về hưu', 'Thầy thuốc ưu tú tận tụy với nhân dân'],
    'approved'
),
(
    '22222222-0002-0003-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Thị Ánh Tuyết',
    'Cô Út Tuyết',
    NULL,
    'female',
    2,
    3,
    'Con gái út',
    'Chi 3 - Chi Nữ Phái',
    true,
    '1955-06-08',
    NULL,
    '19/04/Ất Mùi',
    NULL,
    NULL,
    NULL,
    '22222222-0001-0001-0001-000000000001',
    '22222222-0001-0001-0001-000000000002',
    NULL,
    'Gia đình định cư tại Huế, tâm huyết với nghề thủ công gốm sứ truyền thống.',
    ARRAY['Nghệ nhân gốm sứ mỹ nghệ truyền thống', 'Tích cực hoạt động thiện nguyện xã hội'],
    'approved'
),
(
    '22222222-0002-0003-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Hoàng Trọng Tùng',
    'Dượng Tùng',
    NULL,
    'male',
    2,
    3,
    'Rể quý',
    'Chi 3 - Chi Nữ Phái',
    true,
    '1952-10-18',
    NULL,
    '30/08/Nhâm Thìn',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Kiến trúc sư tâm huyết, tham gia tư vấn thiết kế trùng tu công trình nhà thờ họ.',
    ARRAY['Kiến trúc sư thiết kế công trình văn hóa làng quê'],
    'approved'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Cập nhật phối ngẫu Đời II
UPDATE public.members SET spouse_id = '22222222-0002-0001-0001-000000000002' WHERE id = '22222222-0002-0001-0001-000000000001';
UPDATE public.members SET spouse_id = '22222222-0002-0001-0001-000000000001' WHERE id = '22222222-0002-0001-0001-000000000002';
UPDATE public.members SET spouse_id = '22222222-0002-0002-0001-000000000002' WHERE id = '22222222-0002-0002-0001-000000000001';
UPDATE public.members SET spouse_id = '22222222-0002-0002-0001-000000000001' WHERE id = '22222222-0002-0002-0001-000000000002';
UPDATE public.members SET spouse_id = '22222222-0002-0003-0001-000000000002' WHERE id = '22222222-0002-0003-0001-000000000001';
UPDATE public.members SET spouse_id = '22222222-0002-0003-0001-000000000001' WHERE id = '22222222-0002-0003-0001-000000000002';

-- ĐỜI III: HẬU DUỆ TIẾP NỐI
INSERT INTO public.members (
    id, clan_id, full_name, nickname, courtesy_name, gender, generation_level, order_in_family,
    birth_order_title, branch_name, is_alive, birth_date_solar, death_date_solar,
    father_id, mother_id, bio, achievements, status
)
VALUES
(
    '22222222-0003-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Quốc Bảo',
    'Bảo Béo',
    NULL,
    'male',
    3,
    1,
    'Cháu đích tôn',
    'Chi 1 - Trưởng Chi',
    true,
    '1972-04-18',
    NULL,
    '22222222-0002-0001-0001-000000000001',
    '22222222-0002-0001-0001-000000000002',
    'Bác sĩ phẫu thuật tim mạch công tác tại Hà Nội, trưởng ban quản trị phả hệ số.',
    ARRAY['Tiến sĩ Y khoa - Bác sĩ phẫu thuật Bệnh viện Bạch Mai', 'Tác giả 15 bài báo nghiên cứu Y học quốc tế', 'Trưởng ban Liên lạc thế hệ trẻ họ tộc'],
    'approved'
),
(
    '22222222-0003-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Đặng Thùy Dương',
    'Bác sĩ Dương',
    NULL,
    'female',
    3,
    1,
    'Dâu trưởng đời 3',
    'Chi 1 - Trưởng Chi',
    true,
    '1975-09-12',
    NULL,
    NULL,
    NULL,
    'Bác sĩ chuyên khoa Nhi, luôn hỗ trợ tư vấn y tế cho bà con trong họ.',
    ARRAY['Bác sĩ Chuyên khoa Nhi Bệnh viện Nhi Trung ương'],
    'approved'
),
(
    '22222222-0003-0002-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Tuấn Kiệt',
    'Kiệt Cận',
    NULL,
    'male',
    3,
    1,
    'Cháu nội thứ',
    'Chi 2 - Chi Giáp',
    true,
    '1980-11-28',
    NULL,
    '22222222-0002-0002-0001-000000000001',
    '22222222-0002-0002-0001-000000000002',
    'Kỹ sư phần mềm công nghệ thông tin, trực tiếp phát triển ứng dụng Gia Phả Số.',
    ARRAY['Kỹ sư phần mềm cao cấp tập đoàn công nghệ', 'Xây dựng website số hóa dữ liệu gia tộc'],
    'approved'
),
(
    '22222222-0003-0002-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Phan Thị Ngọc Mai',
    'Bé Mai',
    NULL,
    'female',
    3,
    2,
    'Cháu gái nội',
    'Chi 2 - Chi Giáp',
    true,
    '1985-03-22',
    NULL,
    '22222222-0002-0002-0001-000000000001',
    '22222222-0002-0002-0001-000000000002',
    'Chuyên gia tài chính doanh nghiệp, thủ quỹ ban khuyến học dòng họ.',
    ARRAY['Thạc sĩ Kinh tế Đại học Quốc gia', 'Giám đốc tài chính chuỗi bán lẻ'],
    'approved'
),
(
    '22222222-0003-0003-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Hoàng Anh Khoa',
    'Khoa Tí',
    NULL,
    'male',
    3,
    1,
    'Cháu ngoại',
    'Chi 3 - Chi Nữ Phái',
    true,
    '1990-07-15',
    NULL,
    '22222222-0002-0003-0001-000000000002',
    '22222222-0002-0003-0001-000000000001',
    'Doanh nhân trẻ khởi nghiệp công nghệ xanh, tích cực tham gia kết nối dòng tộc.',
    ARRAY['Sáng lập doanh nghiệp kinh tế tuần hoàn xanh', 'Thanh niên tiêu biểu cấp thành phố'],
    'approved'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Cập nhật phối ngẫu Đời III
UPDATE public.members SET spouse_id = '22222222-0003-0001-0001-000000000002' WHERE id = '22222222-0003-0001-0001-000000000001';
UPDATE public.members SET spouse_id = '22222222-0003-0001-0001-000000000001' WHERE id = '22222222-0003-0001-0001-000000000002';

-- ĐỜI IV: MẦM NON TƯƠNG LAI
INSERT INTO public.members (
    id, clan_id, full_name, nickname, courtesy_name, gender, generation_level, order_in_family,
    birth_order_title, branch_name, is_alive, birth_date_solar, death_date_solar,
    father_id, mother_id, bio, achievements, status
)
VALUES
(
    '22222222-0004-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Gia Khiêm',
    'Bé Mít',
    NULL,
    'male',
    4,
    1,
    'Chắt đích tôn',
    'Chi 1 - Trưởng Chi',
    true,
    '2010-06-18',
    NULL,
    '22222222-0003-0001-0001-000000000001',
    '22222222-0003-0001-0001-000000000002',
    'Cháu đang học lớp 9, chăm ngoan hiếu thảo và có năng khiếu toán học.',
    ARRAY['Học sinh giỏi xuất sắc 5 năm liền', 'Huy chương Vàng cờ vua trẻ cấp Quận', 'Thủ khoa Olympic Toán cấp trường 2024'],
    'approved'
),
(
    '22222222-0004-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Phan Thùy An',
    'Bé Bông',
    NULL,
    'female',
    4,
    2,
    'Chắt gái',
    'Chi 1 - Trưởng Chi',
    true,
    '2018-09-05',
    NULL,
    '22222222-0003-0001-0001-000000000001',
    '22222222-0003-0001-0001-000000000002',
    'Cháu đang học tiểu học, hoạt bát, thích học vẽ và đàn piano.',
    ARRAY['Bé khỏe bé ngoan - Đạt giải Nhất hội thi vẽ tranh thiếu nhi'],
    'approved'
),
(
    '22222222-0004-0002-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Phan Minh Khang',
    'Cu Bon',
    NULL,
    'male',
    4,
    1,
    'Chắt nội',
    'Chi 2 - Chi Giáp',
    true,
    '2021-12-10',
    NULL,
    '22222222-0003-0002-0001-000000000001',
    NULL,
    'Thành viên mầm non kháu khỉnh, thế hệ tương lai đầy hứa hẹn của dòng họ.',
    ARRAY['Bé khỏe bé ngoan thế hệ mầm non'],
    'approved'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 4. Bảng Lễ Giỗ & Sự Kiện Dòng Họ
INSERT INTO public.family_events (clan_id, member_id, title, event_type, lunar_day, lunar_month, note, status)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '22222222-0001-0001-0001-000000000001',
    'Lễ Giỗ Cụ Khởi Tổ Phan Thạnh (Cụ Cố Ba)',
    'DEATH_ANNIVERSARY',
    15,
    3,
    'Ngày lễ trọng đại nhất của dòng họ, con cháu khắp nơi về tề tựu tại từ đường dâng hương.',
    'approved'
),
(
    '11111111-1111-1111-1111-111111111111',
    '22222222-0001-0001-0001-000000000002',
    'Lễ Giỗ Cụ Khởi Tổ Mẫu Trần Thị Hoàng (Cụ Bà Từ Tâm)',
    'DEATH_ANNIVERSARY',
    18,
    8,
    'Lễ cúng giỗ truyền thống tưởng nhớ công đức Cụ Bà.',
    'approved'
),
(
    '11111111-1111-1111-1111-111111111111',
    '22222222-0002-0001-0001-000000000001',
    'Lễ Kỵ Nhật Bác Hai Trí (Phan Tấn Thìn)',
    'DEATH_ANNIVERSARY',
    12,
    5,
    'Tưởng niệm công đức cựu hiệu trưởng, người sáng lập quỹ khuyến học.',
    'approved'
),
(
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'Hội Thảo & Họp Mặt Dòng Họ Đầu Xuân',
    'CLAN_MEETING',
    10,
    1,
    'Gặp mặt đầu năm, mừng thọ các cụ cao niên và trao giải thưởng khuyến học cho con cháu.',
    'approved'
);
