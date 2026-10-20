-- =============================================================================
-- DIGITAL FAMILY TREE HUB — SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. BẢNG PROFILES (Tài khoản người dùng Supabase Auth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'member', 'guest')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =============================================================================
-- 2. BẢNG CLANS (Thông tin Dòng họ / Chi nhánh tộc quán)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Gia phả dòng họ',
    origin_location TEXT DEFAULT 'Nga Sơn, Thanh Hóa & Thừa Thiên Huế',
    slug TEXT UNIQUE NOT NULL DEFAULT 'gia-pha-dong-ho',
    couplet1 TEXT DEFAULT 'Tổ Tiên Công Đức Thiên Niên Thịnh',
    couplet2 TEXT DEFAULT 'Tử Hiếu Tôn Hiền Vạn Đại Vinh',
    ancestral_hall TEXT DEFAULT 'Từ Đường Dòng Họ, Thôn Phúc Thịnh',
    history_summary TEXT DEFAULT 'Dòng họ truyền thừa tinh thần hiếu học, cần cù, đoàn kết và tương thân tương ái qua nhiều thế hệ.',
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE NOT NULL DEFAULT ('GPDH-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 6))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. BẢNG MEMBERS (Hồ sơ Thành viên trên Cây Phả Hệ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nickname TEXT,                              -- Biệt danh / Tên gọi ở nhà thân mật (ví dụ: Bác Ba Đước, Út Mập)
    courtesy_name TEXT,                         -- Tên tự, tên huý, pháp danh
    gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
    generation_level INTEGER NOT NULL DEFAULT 1,-- Đời thứ N: 1, 2, 3, 4,...
    order_in_family INTEGER,                    -- Thứ bậc: 1: Con trưởng, 2: Con thứ 2,...
    birth_order_title TEXT,                     -- Khởi tổ, Trưởng nam, Dâu trưởng, Rể quý,...
    branch_name TEXT DEFAULT 'Chi 1 - Trưởng Chi',
    is_alive BOOLEAN NOT NULL DEFAULT TRUE,
    birth_date_solar DATE,
    death_date_solar DATE,
    birth_date_lunar TEXT,
    death_date_lunar TEXT,
    death_date_lunar_day INTEGER CHECK (death_date_lunar_day BETWEEN 1 AND 30),
    death_date_lunar_month INTEGER CHECK (death_date_lunar_month BETWEEN 1 AND 12),
    father_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    mother_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    spouse_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    burial_location TEXT,                       -- Nơi an táng / Mộ phần
    burial_map_url TEXT,
    bio TEXT,                                   -- Tiểu sử vắn tắt
    achievements TEXT[] DEFAULT '{}',           -- Danh sách thành tích, học vấn, kinh doanh, đóng góp dòng họ
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_clan ON public.members(clan_id);
CREATE INDEX IF NOT EXISTS idx_members_generation ON public.members(generation_level);
CREATE INDEX IF NOT EXISTS idx_members_parents ON public.members(father_id, mother_id);
CREATE INDEX IF NOT EXISTS idx_members_spouse ON public.members(spouse_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_lunar_death ON public.members(death_date_lunar_month, death_date_lunar_day);

-- =============================================================================
-- 4. BẢNG RELATIONSHIPS (Liên kết quan hệ Huyết thống & Hôn phối đa chiều)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL DEFAULT 'biological' CHECK (relationship_type IN ('biological', 'adoptive', 'spouse')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_parent_child_rel UNIQUE (parent_id, child_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_rel_parent ON public.relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_rel_child ON public.relationships(child_id);

-- =============================================================================
-- 5. BẢNG FAMILY_EVENTS (Lịch Lễ Giỗ, Sự Kiện & Họp Mặt Dòng Họ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.family_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'DEATH_ANNIVERSARY' CHECK (event_type IN ('DEATH_ANNIVERSARY', 'CLAN_MEETING', 'LONGEVITY', 'BIRTHDAY', 'OTHER')),
    lunar_day INTEGER CHECK (lunar_day BETWEEN 1 AND 30),
    lunar_month INTEGER CHECK (lunar_month BETWEEN 1 AND 12),
    solar_date DATE,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_events_lunar ON public.family_events(lunar_month, lunar_day);
CREATE INDEX IF NOT EXISTS idx_family_events_clan ON public.family_events(clan_id);

-- =============================================================================
-- 6. BẢNG AUDIT_LOGS (Nhật ký Thay đổi & Thẩm định)
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

-- =============================================================================
-- 7. KÍCH HOẠT ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: Mọi người xem được hồ sơ người dùng
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policy Clans: Xem công khai
DROP POLICY IF EXISTS "Public clans read" ON public.clans;
CREATE POLICY "Public clans read" ON public.clans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin clans manage" ON public.clans;
CREATE POLICY "Admin clans manage" ON public.clans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy Members:
-- 1. Xem: Ai cũng được xem hồ sơ approved; Admin xem tất cả
DROP POLICY IF EXISTS "Members select policy" ON public.members;
CREATE POLICY "Members select policy" ON public.members FOR SELECT USING (
    status = 'approved' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Thêm: Cho phép thêm mới hồ sơ
DROP POLICY IF EXISTS "Members insert policy" ON public.members;
CREATE POLICY "Members insert policy" ON public.members FOR INSERT WITH CHECK (true);

-- 3. Cập nhật & Xóa: Admin toàn quyền hoặc tác giả
DROP POLICY IF EXISTS "Members update policy" ON public.members;
CREATE POLICY "Members update policy" ON public.members FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    auth.uid() = created_by
);

DROP POLICY IF EXISTS "Members delete policy" ON public.members;
CREATE POLICY "Members delete policy" ON public.members FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy Family Events:
DROP POLICY IF EXISTS "Events select policy" ON public.family_events;
CREATE POLICY "Events select policy" ON public.family_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events insert policy" ON public.family_events;
CREATE POLICY "Events insert policy" ON public.family_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Events manage policy" ON public.family_events;
CREATE POLICY "Events manage policy" ON public.family_events FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- 8. STORAGE BUCKET: family-tree-media (Public Avatar & Mộ phần)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'family-tree-media',
    'family-tree-media',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS:
DROP POLICY IF EXISTS "Public view family-tree-media" ON storage.objects;
CREATE POLICY "Public view family-tree-media" ON storage.objects
    FOR SELECT USING (bucket_id = 'family-tree-media');

DROP POLICY IF EXISTS "Allow upload family-tree-media" ON storage.objects;
CREATE POLICY "Allow upload family-tree-media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'family-tree-media');

DROP POLICY IF EXISTS "Allow manage family-tree-media" ON storage.objects;
CREATE POLICY "Allow manage family-tree-media" ON storage.objects
    FOR ALL USING (bucket_id = 'family-tree-media');
