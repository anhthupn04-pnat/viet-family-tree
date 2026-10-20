/**
 * TIỆN ÍCH XUẤT DỮ LIỆU PHẢ HỆ (EXPORT UTILITIES)
 * Hỗ trợ 3 định dạng theo đặc tả:
 * 1. Excel (.csv / .xlsx với UTF-8 BOM hiển thị chuẩn tiếng Việt)
 * 2. GEDCOM 5.5.1 (.ged - Tiêu chuẩn quốc tế phả hệ học)
 * 3. In ấn khổ lớn A0 / PDF Vector
 */

export function exportFamilyToExcel(members: any[], clanName = "Gia phả dòng họ") {
  if (!members || members.length === 0) {
    alert("Không có dữ liệu thành viên để xuất!");
    return;
  }

  const headers = [
    "Mã thành viên",
    "Họ và tên",
    "Tên tự / Hiệu",
    "Thứ bậc",
    "Giới tính",
    "Đời thứ",
    "Chi họ",
    "Năm sinh (Dương)",
    "Năm mất (Dương)",
    "Ngày giỗ (Âm lịch)",
    "Tình trạng",
    "Liệt sĩ",
    "Nơi an táng / Mộ phần",
    "Quê quán",
    "Nơi cư trú",
    "Số điện thoại",
    "Tiểu sử & Công trạng",
  ];

  const rows = members.map((m) => [
    m.memberCode || "",
    m.fullName || "",
    m.courtesyName || "",
    m.birthOrder || "",
    m.gender === "MALE" ? "Nam" : "Nữ",
    `Đời thứ ${m.generation}`,
    m.branchName || "Chưa phân chi",
    m.birthSolar || "",
    m.deathSolar || "",
    m.deathLunar || "",
    m.isAlive ? "Còn sống" : "Đã mất",
    m.isMartyr ? "Liệt sĩ" : "Không",
    `"${(m.burialPlace || "").replace(/"/g, '""')}"`,
    `"${(m.hometown || "").replace(/"/g, '""')}"`,
    `"${(m.currentResidence || "").replace(/"/g, '""')}"`,
    m.phone || "",
    `"${(m.biography || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = `${clanName.replace(/\s+/g, "_")}_Danh_sach_thanh_vien_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFamilyToGedcom(members: any[], clanName = "Gia phả dòng họ") {
  if (!members || members.length === 0) {
    alert("Không có dữ liệu để xuất GEDCOM!");
    return;
  }

  const lines: string[] = [
    "0 HEAD",
    "1 SOUR VIET_FAMILY_TREE",
    "2 VERS 1.0",
    "2 NAME Gia Phả Dòng Họ Việt Nam",
    "1 DEST ANY",
    `1 DATE ${new Date().toLocaleDateString("en-GB")}`,
    "1 CHAR UTF-8",
    "1 GEDC",
    "2 VERS 5.5.1",
    "2 FORM LINEAGE-LINKED",
  ];

  // Families mapping: "husbandId_wifeId" -> childrenIds
  const familiesMap = new Map<string, { husbandId?: string; wifeId?: string; children: string[] }>();

  // 1. INDI records
  members.forEach((m, idx) => {
    const indiId = `@I${idx + 1}@`;
    lines.push(`0 ${indiId} INDI`);

    // Name: Surname + Given Name
    const nameParts = m.fullName.trim().split(" ");
    const surname = nameParts[0] || "";
    const givenName = nameParts.slice(1).join(" ") || "";
    lines.push(`1 NAME ${givenName} /${surname}/`);
    lines.push(`2 GIVN ${givenName}`);
    lines.push(`2 SURN ${surname}`);
    if (m.courtesyName) {
      lines.push(`1 NICK ${m.courtesyName}`);
    }

    // Sex
    lines.push(`1 SEX ${m.gender === "FEMALE" ? "F" : "M"}`);

    // Birth
    if (m.birthSolar) {
      lines.push("1 BIRT");
      lines.push(`2 DATE ${m.birthSolar}`);
      if (m.hometown) lines.push(`2 PLAC ${m.hometown}`);
    }

    // Death
    if (!m.isAlive) {
      lines.push("1 DEAT");
      if (m.deathSolar) lines.push(`2 DATE ${m.deathSolar}`);
      if (m.burialPlace) {
        lines.push("1 BURI");
        lines.push(`2 PLAC ${m.burialPlace}`);
      }
    }

    // Note / Biography
    if (m.biography) {
      lines.push(`1 NOTE ${m.biography.slice(0, 200)}`);
    }

    // Map parent relationships into families
    if (m.fatherId || m.motherId) {
      const famKey = `${m.fatherId || "UNKNOWN"}_${m.motherId || "UNKNOWN"}`;
      if (!familiesMap.has(famKey)) {
        familiesMap.set(famKey, {
          husbandId: m.fatherId || undefined,
          wifeId: m.motherId || undefined,
          children: [],
        });
      }
      familiesMap.get(famKey)!.children.push(m.id);
    }
  });

  // 2. FAM records
  let famIndex = 1;
  familiesMap.forEach((fam) => {
    const famId = `@F${famIndex++}@`;
    lines.push(`0 ${famId} FAM`);

    if (fam.husbandId) {
      const hIdx = members.findIndex((m) => m.id === fam.husbandId);
      if (hIdx >= 0) lines.push(`1 HUSB @I${hIdx + 1}@`);
    }

    if (fam.wifeId) {
      const wIdx = members.findIndex((m) => m.id === fam.wifeId);
      if (wIdx >= 0) lines.push(`1 WIFE @I${wIdx + 1}@`);
    }

    fam.children.forEach((cId) => {
      const cIdx = members.findIndex((m) => m.id === cId);
      if (cIdx >= 0) lines.push(`1 CHIL @I${cIdx + 1}@`);
    });
  });

  lines.push("0 TRLR");

  const gedContent = lines.join("\r\n");
  const blob = new Blob([gedContent], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = `${clanName.replace(/\s+/g, "_")}_Gedcom_${new Date().toISOString().slice(0, 10)}.ged`;
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printOrExportA0() {
  window.print();
}
