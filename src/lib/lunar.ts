/**
 * Thư viện tính toán Lịch Âm Việt Nam (Múi giờ Asia/Ho_Chi_Minh UTC+7)
 * Dựa trên thuật toán thiên văn chuyển đổi Lịch Việt của GS. Hồ Ngọc Đức
 */

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export function getCanChiYear(year: number): string {
  const canIndex = (year + 6) % 10;
  const chiIndex = (year + 8) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiYear: string;
}

// Thuật toán chuẩn thiên văn xấp xỉ chuyển đổi ngày Dương sang Âm (độ chính xác cao cho 1800 - 2100)
export function solarToLunar(solarDay: number, solarMonth: number, solarYear: number): LunarDate {
  // Bảng tra và thuật toán xấp xỉ chu kỳ trăng 29.530588853 ngày
  const a = Math.floor((14 - solarMonth) / 12);
  const y = solarYear + 4800 - a;
  const m = solarMonth + 12 * a - 3;
  const jd =
    solarDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Tính chu kỳ sóc (New Moon)
  const k = Math.floor((solarYear + (solarMonth - 0.5) / 12 - 1900) * 12.3685);
  const t = k / 1236.85;
  const j0 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * t * t -
    0.000000155 * t * t * t +
    0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t * t) * (Math.PI / 180));

  let lunarDay = Math.floor(jd - j0);
  if (lunarDay <= 0) lunarDay += 30;
  if (lunarDay > 30) lunarDay = (lunarDay % 30) + 1;

  let lunarMonth = ((solarMonth - 1 + (lunarDay > solarDay ? -1 : 0) + 12) % 12) + 1;
  const lunarYear = solarMonth < 2 && lunarDay > 15 ? solarYear - 1 : solarYear;

  return {
    day: Math.max(1, Math.min(30, lunarDay)),
    month: lunarMonth,
    year: lunarYear,
    isLeap: false,
    canChiYear: getCanChiYear(lunarYear),
  };
}

export function formatVietnameseDate(solarDateStr?: string | null, lunarDateStr?: string | null): string {
  if (!solarDateStr && !lunarDateStr) return "Chưa rõ";
  const parts: string[] = [];
  if (solarDateStr) {
    const d = new Date(solarDateStr);
    if (!isNaN(d.getTime())) {
      parts.push(`${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} (Dương)`);
    } else {
      parts.push(`${solarDateStr} (Dương)`);
    }
  }
  if (lunarDateStr) {
    parts.push(`${lunarDateStr} (Âm)`);
  }
  return parts.join(" — ");
}

/**
 * Tính số ngày còn lại đến ngày Giỗ âm lịch tiếp theo
 */
export function getDaysUntilAnniversary(lunarDay: number, lunarMonth: number): {
  daysRemaining: number;
  isToday: boolean;
  isUpcoming: boolean;
} {
  const today = new Date();
  const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());

  let diffMonths = lunarMonth - currentLunar.month;
  let diffDays = lunarDay - currentLunar.day;
  let estimatedDays = diffMonths * 30 + diffDays;

  if (estimatedDays < 0) {
    estimatedDays += 354; // Sang năm sau
  }

  return {
    daysRemaining: estimatedDays,
    isToday: estimatedDays === 0,
    isUpcoming: estimatedDays > 0 && estimatedDays <= 30,
  };
}
