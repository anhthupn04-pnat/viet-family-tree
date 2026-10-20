/**
 * Thuật toán tính toán quan hệ họ hàng & Xưng hô chuẩn mực theo văn hóa dòng họ Việt Nam
 * Căn cứ theo tài liệu hướng dẫn chuẩn "Cách xưng hô trong họ hàng theo vai vế" (Bên Nội / Bên Ngoại)
 */

export interface KinshipMember {
  id: string;
  fullName: string;
  gender: string; // MALE, FEMALE, UNKNOWN
  generation: number;
  fatherId?: string | null;
  motherId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  birthSolar?: string | null;
}

export interface KinshipResult {
  memberA: { id: string; name: string };
  memberB: { id: string; name: string };
  generationDiff: number; // generationB - generationA
  commonAncestor?: { id: string; name: string; generation: number } | null;
  howACallsB: string; // A gọi B là gì
  howBCallsA: string; // B gọi A là gì
  relationshipType: "TRỰC_HỆ" | "BÀNG_HỆ" | "HÔN_PHỐI" | "KHÁC";
  explanation: string;
  degreeOfSeparation: number; // Bậc quan hệ (đời cách nhau)
}

/**
 * Tìm tổ tiên chung gần nhất (LCA) giữa 2 thành viên trong cây phả hệ
 */
export function findCommonAncestor(
  memberAId: string,
  memberBId: string,
  allMembersMap: Map<string, KinshipMember>
): KinshipMember | null {
  const getAncestors = (startId: string): Set<string> => {
    const ancestors = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const currId = queue.shift()!;
      const curr = allMembersMap.get(currId);
      if (!curr) continue;
      if (curr.fatherId && !ancestors.has(curr.fatherId)) {
        ancestors.add(curr.fatherId);
        queue.push(curr.fatherId);
      }
      if (curr.motherId && !ancestors.has(curr.motherId)) {
        ancestors.add(curr.motherId);
        queue.push(curr.motherId);
      }
    }
    return ancestors;
  };

  const ancestorsA = getAncestors(memberAId);
  ancestorsA.add(memberAId);

  // Tìm ancestor chung từ B ngược lên
  const queueB = [memberBId];
  const visitedB = new Set<string>();

  let lowestCommonAncestor: KinshipMember | null = null;
  let maxGen = -1;

  while (queueB.length > 0) {
    const currId = queueB.shift()!;
    if (visitedB.has(currId)) continue;
    visitedB.add(currId);

    if (ancestorsA.has(currId)) {
      const candidate = allMembersMap.get(currId);
      if (candidate && candidate.generation > maxGen) {
        maxGen = candidate.generation;
        lowestCommonAncestor = candidate;
      }
    }

    const curr = allMembersMap.get(currId);
    if (!curr) continue;
    if (curr.fatherId) queueB.push(curr.fatherId);
    if (curr.motherId) queueB.push(curr.motherId);
  }

  return lowestCommonAncestor;
}

/**
 * Tính toán cách xưng hô chuẩn mực giữa 2 thành viên
 */
export function calculateKinship(
  memberAId: string,
  memberBId: string,
  allMembers: KinshipMember[]
): KinshipResult {
  const membersMap = new Map<string, KinshipMember>();
  allMembers.forEach((m) => membersMap.set(m.id, m));

  const memberA = membersMap.get(memberAId);
  const memberB = membersMap.get(memberBId);

  if (!memberA || !memberB) {
    throw new Error("Không tìm thấy thông tin thành viên");
  }

  const commonAncestor = findCommonAncestor(memberAId, memberBId, membersMap);
  const genDiff = memberB.generation - memberA.generation; // B trừ A

  const formatAncestor = (m: KinshipMember | null): { id: string; name: string; generation: number } | null => {
    if (!m) return null;
    return { id: m.id, name: m.fullName, generation: m.generation };
  };

  // 1. Kiểm tra quan hệ Trực Hệ (Cha mẹ - Con cái, Ông bà - Cháu)
  if (memberB.fatherId === memberA.id || memberB.motherId === memberA.id) {
    return {
      memberA: { id: memberA.id, name: memberA.fullName },
      memberB: { id: memberB.id, name: memberB.fullName },
      generationDiff: genDiff,
      commonAncestor: formatAncestor(memberA),
      howACallsB: memberB.gender === "FEMALE" ? "Con gái" : "Con trai",
      howBCallsA: memberA.gender === "FEMALE" ? "Mẹ" : "Bố (Cha)",
      relationshipType: "TRỰC_HỆ",
      explanation: `${memberA.fullName} là bậc Cha/Mẹ trực tiếp của ${memberB.fullName}.`,
      degreeOfSeparation: 1,
    };
  }

  if (memberA.fatherId === memberB.id || memberA.motherId === memberB.id) {
    return {
      memberA: { id: memberA.id, name: memberA.fullName },
      memberB: { id: memberB.id, name: memberB.fullName },
      generationDiff: genDiff,
      commonAncestor: formatAncestor(memberB),
      howACallsB: memberB.gender === "FEMALE" ? "Mẹ" : "Bố (Cha)",
      howBCallsA: memberA.gender === "FEMALE" ? "Con gái" : "Con trai",
      relationshipType: "TRỰC_HỆ",
      explanation: `${memberB.fullName} là bậc Cha/Mẹ trực tiếp của ${memberA.fullName}.`,
      degreeOfSeparation: 1,
    };
  }

  // 2. Hai người cùng thế hệ (Cùng đời: genDiff === 0)
  if (genDiff === 0) {
    if (memberA.id === memberB.id) {
      return {
        memberA: { id: memberA.id, name: memberA.fullName },
        memberB: { id: memberB.id, name: memberB.fullName },
        generationDiff: 0,
        commonAncestor: null,
        howACallsB: "Bản thân tôi",
        howBCallsA: "Bản thân tôi",
        relationshipType: "TRỰC_HỆ",
        explanation: "Cùng một thành viên.",
        degreeOfSeparation: 0,
      };
    }

    // Anh chị em ruột (cùng cha mẹ)
    const isSameFather = memberA.fatherId && memberA.fatherId === memberB.fatherId;
    const isSameMother = memberA.motherId && memberA.motherId === memberB.motherId;

    if (isSameFather || isSameMother) {
      const aIsOlder = (memberA.birthSolar || "") < (memberB.birthSolar || "");
      return {
        memberA: { id: memberA.id, name: memberA.fullName },
        memberB: { id: memberB.id, name: memberB.fullName },
        generationDiff: 0,
        commonAncestor: formatAncestor(commonAncestor),
        howACallsB: aIsOlder
          ? memberB.gender === "FEMALE" ? "Em gái ruột" : "Em trai ruột"
          : memberB.gender === "FEMALE" ? "Chị gái ruột" : "Anh trai ruột",
        howBCallsA: aIsOlder
          ? memberA.gender === "FEMALE" ? "Chị gái ruột" : "Anh trai ruột"
          : memberA.gender === "FEMALE" ? "Em gái ruột" : "Em trai ruột",
        relationshipType: "BÀNG_HỆ",
        explanation: `${memberA.fullName} và ${memberB.fullName} là anh chị em ruột thịt cùng huyết thống.`,
        degreeOfSeparation: 2,
      };
    }

    // Anh em họ đồng tông (cùng đời, khác chi hoặc chung cụ/ông)
    const aIsOlder = (memberA.birthSolar || "") < (memberB.birthSolar || "");
    return {
      memberA: { id: memberA.id, name: memberA.fullName },
      memberB: { id: memberB.id, name: memberB.fullName },
      generationDiff: 0,
      commonAncestor: formatAncestor(commonAncestor),
      howACallsB: aIsOlder
        ? memberB.gender === "FEMALE" ? "Em gái họ" : "Em trai họ"
        : memberB.gender === "FEMALE" ? "Chị gái họ" : "Anh trai họ",
      howBCallsA: aIsOlder
        ? memberA.gender === "FEMALE" ? "Chị gái họ" : "Anh trai họ"
        : memberA.gender === "FEMALE" ? "Em gái họ" : "Em trai họ",
      relationshipType: "BÀNG_HỆ",
      explanation: `Hai người cùng Đời thứ ${memberA.generation} trong dòng họ. Theo thứ bậc, người lớn tuổi hơn là Anh/Chị họ, người ít tuổi hơn là Em họ.`,
      degreeOfSeparation: commonAncestor ? (memberA.generation - commonAncestor.generation) * 2 : 2,
    };
  }

  // 3. Khác thế hệ (B hơn A hoặc A hơn B đời thứ)
  if (genDiff === 1) {
    // B là đời con so với A -> A là Chú / Bác / Cô / Thím, B là Cháu
    const howACallsB = memberB.gender === "FEMALE" ? "Cháu gái (gọi bằng Chú/Bác)" : "Cháu trai (gọi bằng Chú/Bác)";
    const howBCallsA = memberA.gender === "FEMALE" ? "Cô / Bác gái" : "Chú / Bác trai";
    return {
      memberA: { id: memberA.id, name: memberA.fullName },
      memberB: { id: memberB.id, name: memberB.fullName },
      generationDiff: genDiff,
      commonAncestor: formatAncestor(commonAncestor),
      howACallsB,
      howBCallsA,
      relationshipType: "BÀNG_HỆ",
      explanation: `${memberA.fullName} thuộc Đời ${memberA.generation} (vai chú/bác), ${memberB.fullName} thuộc Đời ${memberB.generation} (vai cháu). Trong họ tộc, xưng hô theo vai vế đời thứ bất kể tuổi tác!`,
      degreeOfSeparation: 3,
    };
  }

  if (genDiff === -1) {
    // A là đời con so với B -> B là Chú / Bác / Cô / Thím, A là Cháu
    const howACallsB = memberB.gender === "FEMALE" ? "Cô / Bác gái" : "Chú / Bác trai";
    const howBCallsA = memberA.gender === "FEMALE" ? "Cháu gái" : "Cháu trai";
    return {
      memberA: { id: memberA.id, name: memberA.fullName },
      memberB: { id: memberB.id, name: memberB.fullName },
      generationDiff: genDiff,
      commonAncestor: formatAncestor(commonAncestor),
      howACallsB,
      howBCallsA,
      relationshipType: "BÀNG_HỆ",
      explanation: `${memberB.fullName} thuộc Đời ${memberB.generation} (vai chú/bác đối với A), ${memberA.fullName} thuộc Đời ${memberA.generation} (vai cháu).`,
      degreeOfSeparation: 3,
    };
  }

  if (genDiff >= 2) {
    // B cách A từ 2 đời trở lên (Ông bà - Cháu, Cụ - Chắt, Kỵ - Chút)
    let bRole = "Cháu";
    let aRole = "Ông";
    if (genDiff === 2) {
      aRole = memberA.gender === "FEMALE" ? "Bà nội/ngoại" : "Ông nội/ngoại";
      bRole = memberB.gender === "FEMALE" ? "Cháu gái" : "Cháu trai";
    } else if (genDiff === 3) {
      aRole = "Cụ (Cố)";
      bRole = "Chắt";
    } else if (genDiff === 4) {
      aRole = "Kỵ (Sơ)";
      bRole = "Chút";
    } else {
      aRole = `Tổ tiên (Cách ${genDiff} đời)`;
      bRole = `Hậu duệ (Đời thứ ${memberB.generation})`;
    }

    return {
      memberA: { id: memberA.id, name: memberA.fullName },
      memberB: { id: memberB.id, name: memberB.fullName },
      generationDiff: genDiff,
      commonAncestor: formatAncestor(commonAncestor),
      howACallsB: bRole,
      howBCallsA: aRole,
      relationshipType: "BÀNG_HỆ",
      explanation: `${memberA.fullName} (Đời ${memberA.generation}) cách ${memberB.fullName} (Đời ${memberB.generation}) ${genDiff} thế hệ.`,
      degreeOfSeparation: genDiff * 2,
    };
  }

  // genDiff <= -2: A là cháu/chắt so với B
  const absDiff = Math.abs(genDiff);
  let bRole = "Ông";
  let aRole = "Cháu";
  if (absDiff === 2) {
    bRole = memberB.gender === "FEMALE" ? "Bà nội/ngoại" : "Ông nội/ngoại";
    aRole = memberA.gender === "FEMALE" ? "Cháu gái" : "Cháu trai";
  } else if (absDiff === 3) {
    bRole = "Cụ (Cố)";
    aRole = "Chắt";
  } else if (absDiff === 4) {
    bRole = "Kỵ (Sơ)";
    aRole = "Chút";
  } else {
    bRole = `Tổ tiên (Cách ${absDiff} đời)`;
    aRole = `Hậu duệ (Đời thứ ${memberA.generation})`;
  }

  return {
    memberA: { id: memberA.id, name: memberA.fullName },
    memberB: { id: memberB.id, name: memberB.fullName },
    generationDiff: genDiff,
    commonAncestor: formatAncestor(commonAncestor),
    howACallsB: bRole,
    howBCallsA: aRole,
    relationshipType: "BÀNG_HỆ",
    explanation: `${memberB.fullName} (Đời ${memberB.generation}) cách ${memberA.fullName} (Đời ${memberA.generation}) ${absDiff} thế hệ.`,
    degreeOfSeparation: absDiff * 2,
  };
}
