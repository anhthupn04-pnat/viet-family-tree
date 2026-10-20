import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Tải ảnh đại diện thành viên lên Supabase Storage bucket 'family-tree-media'
 * và trả về đường dẫn publicUrl để lưu vào database.
 */
export async function uploadMemberAvatar(file: File): Promise<UploadResult> {
  if (!file) {
    return { success: false, error: "Chưa chọn tệp ảnh." };
  }

  // Kiểm tra định dạng ảnh hợp lệ
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Định dạng tệp không hợp lệ. Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP)." };
  }

  // Giới hạn dung lượng 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Dung lượng ảnh vượt quá giới hạn 5MB." };
  }

  // Nếu Supabase chưa được cấu hình, chuyển đổi sang base64 data URL để xem trước ngay lập tức
  if (!isSupabaseConfigured()) {
    console.warn("Supabase chưa được cấu hình, sử dụng Base64 Data URL thay thế.");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          success: true,
          publicUrl: reader.result as string,
        });
      };
      reader.onerror = () => {
        resolve({ success: false, error: "Không thể đọc dữ liệu ảnh." });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `avatars/${Date.now()}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("family-tree-media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Lỗi upload Supabase Storage:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("family-tree-media")
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error("Supabase storage error:", err);
    return {
      success: false,
      error: err.message || "Đã xảy ra lỗi khi tải ảnh lên máy chủ.",
    };
  }
}
