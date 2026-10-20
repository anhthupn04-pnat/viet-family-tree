export interface Member {
  id: string;
  fullName: string;
  nickname?: string; // Biệt danh, tên thường gọi
  gender: 'male' | 'female';
  generation: number; // 1, 2, 3, 4, 5...
  birthDate?: string; // dd/mm/yyyy
  isAlive: boolean;
  deathDate?: string; // dd/mm/yyyy
  avatarUrl?: string;
  spouseId?: string; // ID người phối ngẫu (Vợ/Chồng)
  fatherId?: string; // ID cha
  motherId?: string; // ID mẹ
  orderInFamily?: number; // Thứ tự con trong nhà (1, 2, 3... 9)
  phone?: string; // Hiển thị công khai cho mọi role xem
  address?: string; // Hiển thị công khai cho mọi role xem
  notes?: string;
}

export interface PendingSubmission {
  id: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ADD_EVENT';
  targetMemberId?: string; // ID người cần sửa hoặc xóa (nếu là UPDATE/DELETE)
  data: any; // Dữ liệu mới đề xuất
  oldData?: any; // Dữ liệu cũ (dùng để Admin đối chiếu khi UPDATE)
  submitterName: string;
  submitterPhone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: 'death_anniversary' | 'feast' | 'gathering';
  lunarDate?: string;
  solarDate: string;
  location?: string;
  description?: string;
  status: 'approved' | 'pending';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  password?: string;
}
