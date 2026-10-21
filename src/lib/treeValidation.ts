import { Member, MemberImportItem, ValidationSummary } from "@/types/family";

/**
 * 1. HÀM VALIDATE DỮ LIỆU IMPORT (Client-side & Server-side validation)
 * Kiểm tra tính hợp lệ toàn diện của mảng JSON trước khi lưu:
 * - Kiểm tra thiếu trường thông tin bắt buộc (id, fullName, gender, generation, isAlive)
 * - Kiểm tra trùng lặp ID trong nội bộ file
 * - Kiểm tra tham chiếu cha/mẹ/vợ/chồng (phải tồn tại trong file hoặc trong DB hiện tại)
 * - Phát hiện ID đã tồn tại trong DB để kích hoạt cơ chế Upsert
 */
export function validateImportBatch(
  data: any,
  existingMembers: Member[] = []
): ValidationSummary {
  if (!Array.isArray(data)) {
    return {
      total: 0,
      valid: 0,
      errorCount: 1,
      duplicateCount: 0,
      items: [],
    };
  }

  const existingMap = new Map<string, Member>();
  existingMembers.forEach((m) => existingMap.set(m.id, m));

  const seenIdsInBatch = new Map<string, number>(); // id -> first seen row
  const duplicateIdsInBatch = new Set<string>();

  // Thu thập ID trong batch để đối soát tham chiếu chéo nội bộ
  const batchIdSet = new Set<string>();
  data.forEach((item, idx) => {
    if (item && typeof item === "object" && item.id) {
      const cleanId = String(item.id).trim();
      if (cleanId) {
        if (seenIdsInBatch.has(cleanId)) {
          duplicateIdsInBatch.add(cleanId);
        } else {
          seenIdsInBatch.set(cleanId, idx + 1);
        }
        batchIdSet.add(cleanId);
      }
    }
  });

  const validatedItems: ValidationSummary["items"] = [];
  let validCount = 0;
  let totalErrors = 0;

  data.forEach((raw, idx) => {
    const row = idx + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!raw || typeof raw !== "object") {
      errors.push(`Dòng ${row}: Bản ghi dữ liệu không hợp lệ (không phải là đối tượng JSON).`);
      totalErrors++;
      validatedItems.push({
        item: {} as MemberImportItem,
        row,
        isValid: false,
        errors,
        warnings,
        isDuplicateInFile: false,
        isExistingInDb: false,
      });
      return;
    }

    // 1. Kiểm tra ID
    const rawId = raw.id ? String(raw.id).trim() : "";
    if (!rawId) {
      errors.push(`Dòng ${row}: Thiếu trường 'id' (định danh duy nhất của thành viên).`);
    } else {
      // Kiểm tra trùng trong nội bộ file
      if (duplicateIdsInBatch.has(rawId)) {
        const firstRow = seenIdsInBatch.get(rawId);
        if (firstRow !== row) {
          errors.push(
            `Dòng ${row}: Mã ID '${rawId}' bị trùng lặp với dòng ${firstRow} trong cùng file.`
          );
        }
      }
    }

    // 2. Kiểm tra Họ và Tên
    const fullName = raw.fullName ? String(raw.fullName).trim() : "";
    if (!fullName) {
      errors.push(`Dòng ${row}: Thiếu trường 'fullName' (Họ và tên thành viên).`);
    }

    // 3. Kiểm tra Giới tính
    const rawGender = raw.gender ? String(raw.gender).trim().toLowerCase() : "";
    if (!rawGender) {
      errors.push(`Dòng ${row}: Thiếu trường 'gender' ('male' | 'female' | 'other').`);
    } else if (!["male", "female", "other"].includes(rawGender)) {
      errors.push(
        `Dòng ${row}: Giới tính '${raw.gender}' không hợp lệ. Chỉ chấp nhận: 'male', 'female', hoặc 'other'.`
      );
    }

    // 4. Kiểm tra Đời (generation)
    const gen = Number(raw.generation);
    if (isNaN(gen) || gen < 1 || !Number.isInteger(gen)) {
      errors.push(
        `Dòng ${row}: 'generation' (${raw.generation}) phải là số nguyên dương lớn hơn hoặc bằng 1.`
      );
    }

    // 5. Kiểm tra isAlive
    if (typeof raw.isAlive !== "boolean") {
      errors.push(
        `Dòng ${row}: Trường 'isAlive' bắt buộc phải là giá trị boolean (true hoặc false).`
      );
    }

    // 6. Kiểm tra tham chiếu Cha (fatherId)
    if (raw.fatherId) {
      const fId = String(raw.fatherId).trim();
      if (fId === rawId) {
        errors.push(`Dòng ${row}: 'fatherId' không thể tự tham chiếu đến chính mình.`);
      } else if (!batchIdSet.has(fId) && !existingMap.has(fId)) {
        errors.push(
          `Dòng ${row}: Tham chiếu Cha fatherId '${fId}' không tồn tại trong danh sách nạp hoặc trên cây gia phả hiện tại.`
        );
      }
    }

    // 7. Kiểm tra tham chiếu Mẹ (motherId)
    if (raw.motherId) {
      const mId = String(raw.motherId).trim();
      if (mId === rawId) {
        errors.push(`Dòng ${row}: 'motherId' không thể tự tham chiếu đến chính mình.`);
      } else if (!batchIdSet.has(mId) && !existingMap.has(mId)) {
        errors.push(
          `Dòng ${row}: Tham chiếu Mẹ motherId '${mId}' không tồn tại trong danh sách nạp hoặc trên cây gia phả hiện tại.`
        );
      }
    }

    // 8. Kiểm tra tham chiếu Phối ngẫu (spouseId)
    if (raw.spouseId) {
      const sId = String(raw.spouseId).trim();
      if (sId === rawId) {
        errors.push(`Dòng ${row}: 'spouseId' không thể tự kết hôn với chính mình.`);
      } else if (!batchIdSet.has(sId) && !existingMap.has(sId)) {
        warnings.push(
          `Dòng ${row}: spouseId '${sId}' chưa có trong hệ thống; liên kết sẽ được hoàn thiện khi thành viên đó được bổ sung.`
        );
      }
    }

    // Kiểm tra xung đột với dữ liệu hiện có trong Database
    const isExistingInDb = existingMap.has(rawId);
    if (isExistingInDb) {
      warnings.push(
        `ID '${rawId}' đã tồn tại trong gia phả. Sẽ áp dụng tùy chọn: Ghi đè (Update) hoặc Bỏ qua (Skip).`
      );
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      totalErrors++;
    }

    const item: MemberImportItem = {
      id: rawId,
      fullName: fullName,
      nickname: raw.nickname ? String(raw.nickname).trim() : undefined,
      gender: (rawGender as "male" | "female" | "other") || "male",
      generation: gen || 1,
      orderInFamily:
        raw.orderInFamily !== undefined && raw.orderInFamily !== null
          ? Number(raw.orderInFamily)
          : undefined,
      birthDate: raw.birthDate !== undefined ? String(raw.birthDate).trim() : undefined,
      deathDate: raw.deathDate !== undefined ? String(raw.deathDate).trim() : undefined,
      isAlive: Boolean(raw.isAlive),
      avatarUrl: raw.avatarUrl ? String(raw.avatarUrl).trim() : undefined,
      fatherId: raw.fatherId ? String(raw.fatherId).trim() : undefined,
      motherId: raw.motherId ? String(raw.motherId).trim() : undefined,
      spouseId: raw.spouseId ? String(raw.spouseId).trim() : undefined,
      phone: raw.phone ? String(raw.phone).trim() : undefined,
      address: raw.address ? String(raw.address).trim() : undefined,
      notes: raw.notes ? String(raw.notes).trim() : undefined,
    };

    validatedItems.push({
      item,
      row,
      isValid,
      errors,
      warnings,
      isDuplicateInFile: duplicateIdsInBatch.has(rawId),
      isExistingInDb,
    });
  });

  return {
    total: data.length,
    valid: validCount,
    errorCount: totalErrors,
    duplicateCount: duplicateIdsInBatch.size,
    items: validatedItems,
  };
}

/**
 * 2. TỰ ĐỘNG ĐỒNG BỘ QUAN HỆ 2 CHIỀU (Bi-directional Spouse Linking)
 * - Nếu A có spouseId: B nhưng B chưa có spouseId -> tự động gán B.spouseId = A.id
 * - Tự động đối xứng quan hệ vợ chồng cả trong batch lẫn liên kết với thành viên đã có
 */
export function normalizeAndLinkSpouses(
  items: MemberImportItem[],
  existingMembers: Member[] = []
): {
  normalizedItems: MemberImportItem[];
  existingUpdates: Map<string, Partial<Member>>;
} {
  const itemMap = new Map<string, MemberImportItem>();
  const existingMap = new Map<string, Member>();
  const existingUpdates = new Map<string, Partial<Member>>();

  existingMembers.forEach((m) => existingMap.set(m.id, m));
  items.forEach((m) => itemMap.set(m.id, { ...m }));

  // Duyệt qua tất cả các phần tử trong batch
  for (const [id, member] of itemMap.entries()) {
    if (member.spouseId) {
      const spouseId = member.spouseId;

      // Trường hợp 1: Phối ngẫu nằm trong cùng file import
      if (itemMap.has(spouseId)) {
        const spouseObj = itemMap.get(spouseId)!;
        if (!spouseObj.spouseId) {
          spouseObj.spouseId = id;
        }
      }
      // Trường hợp 2: Phối ngẫu đã tồn tại sẵn trong database
      else if (existingMap.has(spouseId)) {
        const existingSpouse = existingMap.get(spouseId)!;
        if (!existingSpouse.spouseId || existingSpouse.spouseId !== id) {
          existingUpdates.set(spouseId, { spouseId: id });
        }
      }
    }
  }

  return {
    normalizedItems: Array.from(itemMap.values()),
    existingUpdates,
  };
}
