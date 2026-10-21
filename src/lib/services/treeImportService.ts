import { Member, MemberImportItem, ValidationSummary } from "@/types/family";
import { prisma } from "@/lib/prisma";
import { validateImportBatch, normalizeAndLinkSpouses } from "@/lib/treeValidation";

export { validateImportBatch, normalizeAndLinkSpouses };

export interface ImportOptions {
  upsertMode: "overwrite" | "skip";
}

export interface ImportResult {
  success: boolean;
  total: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  message: string;
  members: Member[];
}


/**
 * 3. HÀM THỰC THI TRANSACTION NHẬP LIỆU (Database ACID Transaction)
 * Chạy trong Prisma $transaction. Nếu có bất kỳ lỗi không mong muốn nào phát sinh,
 * toàn bộ tác vụ sẽ rollback 100% để bảo toàn tính toàn vẹn của cơ sở dữ liệu.
 */
export async function executeTreeImportTransaction(
  treeId: string,
  rawItems: any[],
  options: ImportOptions = { upsertMode: "overwrite" }
): Promise<ImportResult> {
  // Lấy các thành viên hiện tại của cây để đối soát
  const currentMembersInDb = await prisma.treeMember.findMany({
    where: { treeId },
  });

  const currentMembers: Member[] = currentMembersInDb.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    nickname: m.nickname || undefined,
    gender: (m.gender as any) || "male",
    generation: m.generation,
    orderInFamily: m.orderInFamily || undefined,
    birthDate: m.birthDate || undefined,
    birthLunar: m.birthLunar || undefined,
    deathDate: m.deathDate || undefined,
    deathLunar: m.deathLunar || undefined,
    isAlive: m.isAlive,
    avatarUrl: m.avatarUrl || undefined,
    fatherId: m.fatherId || undefined,
    motherId: m.motherId || undefined,
    spouseId: m.spouseId || undefined,
    phone: m.phone || undefined,
    address: m.address || undefined,
    burialPlace: m.burialPlace || undefined,
    titles: m.titles || undefined,
    bio: m.bio || undefined,
    notes: m.notes || undefined,
  }));

  // Bước 1: Kiểm định toàn bộ batch
  const validation = validateImportBatch(rawItems, currentMembers);
  if (validation.errorCount > 0) {
    const errorDetails = validation.items
      .filter((i) => !i.isValid)
      .map((i) => `[Dòng ${i.row} - ID: ${i.item.id || "N/A"}]: ${i.errors.join("; ")}`)
      .slice(0, 10)
      .join("\n");

    throw new Error(
      `Dữ liệu nhập không hợp lệ (${validation.errorCount} lỗi phát hiện):\n${errorDetails}`
    );
  }

  const validItems = validation.items.map((i) => i.item);

  // Bước 2: Chuẩn hóa quan hệ 2 chiều
  const { normalizedItems, existingUpdates } = normalizeAndLinkSpouses(
    validItems,
    currentMembers
  );

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Bước 3: Chạy trong Prisma $transaction đảm bảo tính chất ACID
  await prisma.$transaction(
    async (tx) => {
      // 3.1. Kiểm tra Cây tồn tại
      const targetTree = await tx.tree.findUnique({
        where: { id: treeId },
      });
      if (!targetTree) {
        throw new Error(`Cây gia phả với mã ID '${treeId}' không tồn tại trong hệ thống.`);
      }
      if (targetTree.status === "LOCKED") {
        throw new Error(`Cây gia phả '${targetTree.name}' đang bị KHÓA. Không thể nhập dữ liệu.`);
      }

      const existingIdSet = new Set(currentMembersInDb.map((m) => m.id));

      // 3.2. Chèn/Cập nhật từng thành viên theo cấu hình Upsert
      for (const item of normalizedItems) {
        const isExists = existingIdSet.has(item.id);

        if (isExists) {
          if (options.upsertMode === "skip") {
            skippedCount++;
            continue;
          }

          // Chế độ 'overwrite': Cập nhật thông tin
          await tx.treeMember.update({
            where: { id: item.id },
            data: {
              fullName: item.fullName,
              nickname: item.nickname || null,
              gender: item.gender,
              generation: item.generation,
              orderInFamily: item.orderInFamily !== undefined ? item.orderInFamily : null,
              birthDate: item.birthDate || null,
              birthLunar: item.birthLunar || null,
              deathDate: item.deathDate || null,
              deathLunar: item.deathLunar || null,
              isAlive: item.isAlive,
              avatarUrl: item.avatarUrl || null,
              fatherId: item.fatherId || null,
              motherId: item.motherId || null,
              spouseId: item.spouseId || null,
              phone: item.phone || null,
              address: item.address || null,
              burialPlace: item.burialPlace || null,
              titles: item.titles || null,
              bio: item.bio || null,
              notes: item.notes || null,
            },
          });
          updatedCount++;
        } else {
          // Tạo mới
          await tx.treeMember.create({
            data: {
              id: item.id,
              treeId,
              fullName: item.fullName,
              nickname: item.nickname || null,
              gender: item.gender,
              generation: item.generation,
              orderInFamily: item.orderInFamily !== undefined ? item.orderInFamily : null,
              birthDate: item.birthDate || null,
              birthLunar: item.birthLunar || null,
              deathDate: item.deathDate || null,
              deathLunar: item.deathLunar || null,
              isAlive: item.isAlive,
              avatarUrl: item.avatarUrl || null,
              fatherId: item.fatherId || null,
              motherId: item.motherId || null,
              spouseId: item.spouseId || null,
              phone: item.phone || null,
              address: item.address || null,
              burialPlace: item.burialPlace || null,
              titles: item.titles || null,
              bio: item.bio || null,
              notes: item.notes || null,
            },
          });
          createdCount++;
        }
      }

      // 3.3. Cập nhật các liên kết đối xứng của thành viên cũ (nếu có)
      for (const [existingId, updates] of existingUpdates.entries()) {
        await tx.treeMember.update({
          where: { id: existingId },
          data: {
            spouseId: updates.spouseId || null,
          },
        });
      }
    },
    {
      timeout: 30000, // 30s timeout cho các file import lớn
    }
  );

  // Lấy danh sách thành viên sau khi nhập xong
  const updatedAll = await prisma.treeMember.findMany({
    where: { treeId },
    orderBy: [{ generation: "asc" }, { orderInFamily: "asc" }],
  });

  const finalMembers: Member[] = updatedAll.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    nickname: m.nickname || undefined,
    gender: (m.gender as any) || "male",
    generation: m.generation,
    orderInFamily: m.orderInFamily || undefined,
    birthDate: m.birthDate || undefined,
    deathDate: m.deathDate || undefined,
    isAlive: m.isAlive,
    avatarUrl: m.avatarUrl || undefined,
    fatherId: m.fatherId || undefined,
    motherId: m.motherId || undefined,
    spouseId: m.spouseId || undefined,
    phone: m.phone || undefined,
    address: m.address || undefined,
    notes: m.notes || undefined,
  }));

  return {
    success: true,
    total: normalizedItems.length,
    createdCount,
    updatedCount,
    skippedCount,
    message: `Nhập dữ liệu thành công! Thêm mới: ${createdCount}, Cập nhật: ${updatedCount}, Bỏ qua: ${skippedCount}.`,
    members: finalMembers,
  };
}
