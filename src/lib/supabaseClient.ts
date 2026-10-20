import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Kiểm tra xem Supabase đã được cấu hình đầy đủ biến môi trường hay chưa.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== "your_supabase_project_url" &&
    supabaseAnonKey !== "your_supabase_anon_key"
  );
}

// Fallback dummy URL to prevent createClient constructor from crashing at build-time if unconfigured
const validUrl = isSupabaseConfigured()
  ? supabaseUrl
  : "https://placeholder-project.supabase.co";
const validKey = isSupabaseConfigured()
  ? supabaseAnonKey
  : "placeholder-anon-key";

/**
 * Supabase Client dùng chung cho Browser / Client Components
 */
export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Supabase Client đặc quyền (Admin / Service Role) dùng cho API Routes & Server Actions
 */
export function getSupabaseAdmin(): SupabaseClient {
  const secretKey = supabaseServiceRoleKey || validKey;
  return createClient(validUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
