-- =============================================================================
-- KHỞI TẠO DỮ LIỆU MẪU GIA PHẢ DÒNG HỌ TRÊN SUPABASE (SEED DATA SCRIPT)
-- =============================================================================

DO $$
DECLARE
    v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
    v_genealogy_id UUID := 'b0000000-0000-0000-0000-000000000001'::uuid;
    
    -- Đời I
    v_ong_id UUID := 'c0000000-0000-0000-0000-000000000001'::uuid; -- Cụ Ông Trần Đăng Quýnh
    v_ba_id UUID  := 'c0000000-0000-0000-0000-000000000002'::uuid; -- Cụ Bà Nguyễn Thị Mai
    
    -- Đời II
    v_ich_id UUID   := 'c0000000-0000-0000-0000-000000000003'::uuid; -- Trần Đăng Ích (Liệt sĩ)
    v_thich_id UUID := 'c0000000-0000-0000-0000-000000000004'::uuid; -- Trần Đăng Thích
    v_tuyet_id UUID := 'c0000000-0000-0000-0000-000000000005'::uuid; -- Trần Thị Ánh Tuyết
BEGIN
    -- 1. Tạo tài khoản Admin mặc định trong auth.users (nếu chưa có) và public.profiles
    -- Lưu ý: Trong môi trường Supabase Auth, auth.users quản lý mật khẩu. Ta tạo profile tương ứng.
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_admin_id, 'anhthuphan0102@gmail.com', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', email = 'anhthuphan0102@gmail.com';

    -- 2. Khởi tạo 1 cây gia phả mẫu ("Gia phả dòng họ")
    INSERT INTO public.genealogies (id, name, creator_id, invite_code)
    VALUES (v_genealogy_id, 'Gia phả dòng họ', v_admin_id, 'GPDH-2026')
    ON CONFLICT (id) DO UPDATE SET name = 'Gia phả dòng họ';

    -- 3. Xóa dữ liệu cũ nếu chạy lại seed
    DELETE FROM public.events WHERE genealogy_id = v_genealogy_id;
    DELETE FROM public.members WHERE genealogy_id = v_genealogy_id;

    -- =========================================================================
    -- ĐỜI I: TIÊN TỔ / KHỞI TỔ TRỰC HỆ
    -- =========================================================================
    -- Cụ Ông: Trần Đăng Quýnh
    INSERT INTO public.members (
        id, genealogy_id, full_name, gender, generation_level, order_in_family,
        birth_order_title, is_alive, is_martyr, birth_date_solar, death_date_solar,
        birth_date_lunar, death_date_lunar, burial_location, bio, achievements,
        status, created_by, approved_by
    ) VALUES (
        v_ong_id, v_genealogy_id, 'Trần Đăng Quýnh', 'male', 1, 1,
        'Khởi tổ', FALSE, FALSE, '1910-01-15'::date, '1985-05-04'::date,
        '15/12/Kỷ Dậu', '15 tháng 3 Âm lịch', 'Khu nghĩa trang lăng mộ dòng họ',
        'Cụ Khởi tổ dòng họ, đức độ uy nghiêm, lập nghiệp tạo dựng cơ đồ tông tộc.',
        'Khai canh lập họ, từ đường phụng thờ ngàn thu.',
        'approved', v_admin_id, v_admin_id
    );

    -- Cụ Bà: Nguyễn Thị Mai (Phối ngẫu của Cụ Ông)
    INSERT INTO public.members (
        id, genealogy_id, full_name, gender, generation_level, order_in_family,
        birth_order_title, is_alive, is_martyr, birth_date_solar, death_date_solar,
        birth_date_lunar, death_date_lunar, spouse_id, burial_location, bio,
        status, created_by, approved_by
    ) VALUES (
        v_ba_id, v_genealogy_id, 'Nguyễn Thị Mai', 'female', 1, 1,
        'Chính thất', FALSE, FALSE, '1914-04-10'::date, '1990-09-20'::date,
        '15/03/Giáp Dần', '02 tháng 8 Âm lịch', v_ong_id, 'An táng cạnh cụ ông tại nghĩa trang dòng họ',
        'Cụ Bà hiền thục nết na, tần tảo nuôi dạy con cháu thành danh hiển vinh.',
        'approved', v_admin_id, v_admin_id
    );

    -- Cập nhật ngược lại spouse_id cho cụ ông
    UPDATE public.members SET spouse_id = v_ba_id WHERE id = v_ong_id;

    -- =========================================================================
    -- ĐỜI II: HẬU DUỆ NỐI DÕI
    -- =========================================================================
    -- 1. Con trưởng: Trần Đăng Ích (Liệt sĩ Quân đội Nhân dân Việt Nam)
    INSERT INTO public.members (
        id, genealogy_id, full_name, gender, generation_level, order_in_family,
        birth_order_title, is_alive, is_martyr, birth_date_solar, death_date_solar,
        birth_date_lunar, death_date_lunar, father_id, mother_id, burial_location,
        bio, achievements, status, created_by, approved_by
    ) VALUES (
        v_ich_id, v_genealogy_id, 'Trần Đăng Ích', 'male', 2, 1,
        'Con trưởng', FALSE, TRUE, '1938-03-12'::date, '1968-04-30'::date,
        '12/02/Mậu Dần', '04 tháng 4 Âm lịch', v_ong_id, v_ba_id, 'Nghĩa trang Liệt sĩ Trường Sơn',
        'Chiến sĩ anh dũng hy sinh vì sự nghiệp bảo vệ Tổ quốc trong kháng chiến.',
        'Huân chương Chiến công Hạng Nhất, Bằng Tổ quốc Ghi công',
        'approved', v_admin_id, v_admin_id
    );

    -- 2. Con thứ 2: Trần Đăng Thích
    INSERT INTO public.members (
        id, genealogy_id, full_name, gender, generation_level, order_in_family,
        birth_order_title, is_alive, is_martyr, birth_date_solar, death_date_solar,
        birth_date_lunar, death_date_lunar, father_id, mother_id, burial_location,
        bio, achievements, status, created_by, approved_by
    ) VALUES (
        v_thich_id, v_genealogy_id, 'Trần Đăng Thích', 'male', 2, 2,
        'Con thứ 2', TRUE, FALSE, '1942-08-20'::date, NULL,
        '09/07/Nhâm Ngọ', NULL, v_ong_id, v_ba_id, NULL,
        'Trưởng ban liên lạc dòng tộc, tích cực đóng góp phụng dựng nhà thờ tổ.',
        'Huy hiệu 50 năm tuổi Đảng',
        'approved', v_admin_id, v_admin_id
    );

    -- 3. Con gái: Trần Thị Ánh Tuyết
    INSERT INTO public.members (
        id, genealogy_id, full_name, gender, generation_level, order_in_family,
        birth_order_title, is_alive, is_martyr, birth_date_solar, death_date_solar,
        birth_date_lunar, death_date_lunar, father_id, mother_id, burial_location,
        bio, achievements, status, created_by, approved_by
    ) VALUES (
        v_tuyet_id, v_genealogy_id, 'Trần Thị Ánh Tuyết', 'female', 2, 3,
        'Con gái thứ 3', TRUE, FALSE, '1948-11-05'::date, NULL,
        '05/10/Mậu Tý', NULL, v_ong_id, v_ba_id, NULL,
        'Nhà giáo ưu tú hưu trí, hết lòng chăm lo khuyến học khuyến tài dòng họ.',
        'Nhà giáo Ưu tú',
        'approved', v_admin_id, v_admin_id
    );

    -- =========================================================================
    -- SỰ KIỆN / LỄ GIỖ DÒNG HỌ
    -- =========================================================================
    INSERT INTO public.events (genealogy_id, member_id, title, lunar_day, lunar_month, description, status, created_by)
    VALUES
        (v_genealogy_id, v_ong_id, 'Lễ Giỗ Cụ Khởi Tổ Trần Đăng Quýnh', 15, 3, 'Lễ dâng hương tế tổ tại Từ đường dòng họ, con cháu hội tụ đông đủ.', 'approved', v_admin_id),
        (v_genealogy_id, v_ba_id, 'Lễ Kỵ Nhật Cụ Bà Nguyễn Thị Mai', 2, 8, 'Lễ cúng giỗ mẹ tại từ đường gia tộc.', 'approved', v_admin_id),
        (v_genealogy_id, v_ich_id, 'Lễ Tưởng Niệm Liệt Sĩ Trần Đăng Ích', 4, 4, 'Ngày giỗ liệt sĩ hy sinh vì Tổ quốc.', 'approved', v_admin_id);

    RAISE NOTICE 'Seed dữ liệu Supabase hoàn tất thành công!';
END $$;
