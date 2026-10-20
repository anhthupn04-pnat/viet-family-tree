-- =============================================================================
-- HỆ THỐNG GIA PHẢ DÒNG HỌ - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- =============================================================================

-- Kích hoạt extension pgcrypto để tạo UUID ngẫu nhiên
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. BẢNG PROFILES (Liên kết tài khoản Supabase Auth users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'member', 'guest')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index tra cứu email & role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =============================================================================
-- 2. BẢNG GENEALOGIES (Thông tin Cây Gia Phả Dòng Họ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.genealogies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Gia phả dòng họ',
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE NOT NULL DEFAULT ('GPDH-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 6))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. BẢNG MEMBERS (Thành viên hiển thị trên Cây Sơ Đồ Phả Hệ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    genealogy_id UUID NOT NULL REFERENCES public.genealogies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
    generation_level INTEGER NOT NULL DEFAULT 1, -- Thế hệ (Đời 1, 2, 3...)
    order_in_family INTEGER,                     -- Thứ bậc (1: Con trưởng, 2: Con thứ 2...)
    birth_order_title TEXT,                      -- Tên danh vị: Khởi tổ, Con trưởng, Dâu trưởng...
    is_alive BOOLEAN NOT NULL DEFAULT TRUE,
    is_martyr BOOLEAN NOT NULL DEFAULT FALSE,    -- Liệt sĩ / Người có công với Tổ quốc
    birth_date_solar DATE,
    death_date_solar DATE,
    birth_date_lunar TEXT,                       -- Ngày sinh âm lịch
    death_date_lunar TEXT,                       -- Ngày mất âm lịch (Ngày kỵ nhật / giỗ họ)
    father_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    mother_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    spouse_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    burial_location TEXT,                        -- Mộ phần / nơi an táng
    burial_map_url TEXT,                         -- Liên kết Google Maps
    bio TEXT,                                    -- Tiểu sử, công danh sự nghiệp
    achievements TEXT,                           -- Học vị, huân chương, công đức
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes tối ưu truy vấn sơ đồ cây và quan hệ huyết thống
CREATE INDEX IF NOT EXISTS idx_members_genealogy ON public.members(genealogy_id);
CREATE INDEX IF NOT EXISTS idx_members_generation ON public.members(generation_level);
CREATE INDEX IF NOT EXISTS idx_members_parents ON public.members(father_id, mother_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);

-- =============================================================================
-- 4. BẢNG EVENTS (Lịch giỗ họ, lễ kỵ nhật, họp họ thường niên)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    genealogy_id UUID NOT NULL REFERENCES public.genealogies(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lunar_day INTEGER CHECK (lunar_day BETWEEN 1 AND 30),
    lunar_month INTEGER CHECK (lunar_month BETWEEN 1 AND 12),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_lunar ON public.events(lunar_month, lunar_day);

-- =============================================================================
-- 5. BẢNG AUDIT_LOGS (Lịch sử cập nhật & Phê duyệt của Ban Quản Trị)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE, APPROVE, REJECT
    target_table TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- =============================================================================
-- HÀM TIỆN ÍCH KIỂM TRA QUYỀN ADMIN (Helper Function)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tự động đồng bộ profile khi có user mới tạo trong auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        new.id,
        new.email,
        CASE
            WHEN new.email = 'anhthuphan0102@gmail.com' THEN 'admin'
            ELSE 'guest'
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger tạo profile khi người dùng đăng ký auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. CHÍNH SÁCH BẢO MẬT DÒNG DỮ LIỆU (ROW LEVEL SECURITY - RLS)
-- =============================================================================

-- Kích hoạt RLS cho toàn bộ các bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genealogies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- RLS: BẢNG PROFILES
--------------------------------------------------------------------------------
-- Ai cũng được xem danh sách profile công khai
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Người dùng chỉ được sửa profile của chính mình
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

--------------------------------------------------------------------------------
-- RLS: BẢNG GENEALOGIES
--------------------------------------------------------------------------------
-- Mọi người đều có thể xem cây gia phả công khai
CREATE POLICY "Genealogies viewable by everyone"
    ON public.genealogies FOR SELECT
    USING (true);

-- Chỉ Admin mới được tạo hoặc sửa đổi thông tin Gia phả
CREATE POLICY "Only admin can insert genealogy"
    ON public.genealogies FOR INSERT
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Only admin can update genealogy"
    ON public.genealogies FOR UPDATE
    USING (public.is_admin() OR auth.role() = 'service_role');

--------------------------------------------------------------------------------
-- RLS: BẢNG MEMBERS (Quy tắc hiển thị và thêm mới thành viên)
--------------------------------------------------------------------------------
-- 1. SELECT: Khách & thành viên chỉ xem các bản ghi đã duyệt ('approved').
--            Admin xem được toàn bộ gồm 'pending', 'approved', 'rejected'.
CREATE POLICY "Members select policy"
    ON public.members FOR SELECT
    USING (
        status = 'approved'
        OR public.is_admin()
        OR auth.role() = 'service_role'
        OR created_by = auth.uid()
    );

-- 2. INSERT:
--    - Khách / Thành viên chỉ được phép đề xuất với status = 'pending'.
--    - Admin hoặc Service Role được thêm trực tiếp bất kỳ trạng thái nào (approved).
CREATE POLICY "Members insert policy"
    ON public.members FOR INSERT
    WITH CHECK (
        (public.is_admin() OR auth.role() = 'service_role')
        OR (status = 'pending')
    );

-- 3. UPDATE: Chỉ Admin và Service Role mới có quyền sửa đổi hoặc duyệt ('approved'/'rejected')
CREATE POLICY "Members update policy"
    ON public.members FOR UPDATE
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 4. DELETE: Chỉ Admin và Service Role mới có quyền xóa thành viên khỏi gia phả
CREATE POLICY "Members delete policy"
    ON public.members FOR DELETE
    USING (public.is_admin() OR auth.role() = 'service_role');

--------------------------------------------------------------------------------
-- RLS: BẢNG EVENTS
--------------------------------------------------------------------------------
CREATE POLICY "Events select policy"
    ON public.events FOR SELECT
    USING (
        status = 'approved'
        OR public.is_admin()
        OR auth.role() = 'service_role'
        OR created_by = auth.uid()
    );

CREATE POLICY "Events insert policy"
    ON public.events FOR INSERT
    WITH CHECK (
        public.is_admin()
        OR auth.role() = 'service_role'
        OR status = 'pending'
    );

CREATE POLICY "Events update policy"
    ON public.events FOR UPDATE
    USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Events delete policy"
    ON public.events FOR DELETE
    USING (public.is_admin() OR auth.role() = 'service_role');

--------------------------------------------------------------------------------
-- RLS: BẢNG AUDIT_LOGS
--------------------------------------------------------------------------------
-- Chỉ Admin được xem nhật ký thao tác
CREATE POLICY "Audit logs select policy"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Audit logs insert policy"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- =============================================================================
-- 7. THIẾT LẬP SUPABASE STORAGE BUCKET (family-tree-media)
-- =============================================================================
-- Tạo bucket public 'family-tree-media' để lưu avatar và ảnh mộ phần
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-tree-media', 'family-tree-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép mọi người đọc ảnh công khai từ bucket family-tree-media
CREATE POLICY "Public media read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'family-tree-media');

-- Cho phép upload ảnh đại diện (Authenticated hoặc Admin)
CREATE POLICY "Media upload access"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'family-tree-media'
        AND (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.role() = 'anon')
    );

-- Cho phép cập nhật hoặc xóa ảnh media nếu là Admin
CREATE POLICY "Media delete access"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'family-tree-media' AND (public.is_admin() OR auth.role() = 'service_role'));
