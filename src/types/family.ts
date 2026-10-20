export interface Member {
  id: string;
  fullName: string;
  nickname?: string; // Biệt danh, tên thường gọi
  gender: "male" | "female";
  generation: number; // 1, 2, 3, 4, 5...
  birthDate?: string; // dd/mm/yyyy
  isAlive: boolean;
  deathDate?: string; // dd/mm/yyyy
  avatarUrl?: string;
  spouseId?: string; // ID người phối ngẫu (Vợ/Chồng)
  fatherId?: string; // ID cha
  motherId?: string; // ID mẹ
  orderInFamily?: number; // Thứ tự con trong nhà (1, 2, 3... 9)
  notes?: string;
}
