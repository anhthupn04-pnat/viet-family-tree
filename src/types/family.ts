export interface Member {
  id: string;
  fullName: string;
  nickname?: string; // Biệt danh, tên thường gọi (e.g. Cụ Tổ, Bác Ba)
  gender: 'male' | 'female' | 'other';
  generation: number; // 1, 2, 3, 4, 5...
  birthDate?: string; // dd/mm/yyyy hoặc chuỗi tự do/âm lịch
  deathDate?: string; // dd/mm/yyyy hoặc chuỗi tự do/âm lịch
  isAlive: boolean;
  avatarUrl?: string;
  spouseId?: string; // ID người phối ngẫu (Vợ/Chồng)
  fatherId?: string; // ID cha
  motherId?: string; // ID mẹ
  orderInFamily?: number; // Thứ tự con trong nhà (1, 2, 3... 9)
  phone?: string; // Hiển thị công khai cho mọi role xem
  address?: string; // Hiển thị công khai cho mọi role xem
  notes?: string;
  treeId?: string;
}

export type MemberImportItem = Member;

export interface ValidationErrorItem {
  row: number; // Chỉ mục dòng (1-based)
  id?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationSummary {
  total: number;
  valid: number;
  errorCount: number;
  duplicateCount: number;
  items: Array<{
    item: MemberImportItem;
    row: number;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    isDuplicateInFile: boolean;
    isExistingInDb: boolean;
  }>;
}

export type UserSystemRole = 'SUPER_ADMIN' | 'TREE_MANAGER' | 'VIEWER';

export interface Tree {
  id: string;
  name: string;
  slug: string;
  originLocation?: string;
  description?: string;
  status: 'ACTIVE' | 'CLOSED' | 'LOCKED';
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface UserAccount {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: UserSystemRole;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  assignedTrees?: string[]; // Danh sách Tree ID được phân quyền TREE_MANAGER
}

export interface UserTreeRole {
  id: string;
  userId: string;
  treeId: string;
  role: 'TREE_MANAGER' | 'VIEWER';
  assignedAt: string;
  tree?: Tree;
  user?: UserAccount;
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
  role: 'super_admin' | 'admin' | 'tree_manager';
  createdAt: string;
  password?: string;
  assignedTrees?: string[];
  assignedTreeIds?: string[];
}
