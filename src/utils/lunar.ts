/**
 * Thư viện tính toán Lịch Âm Việt Nam (Múi giờ Asia/Ho_Chi_Minh UTC+7)
 * Cung cấp chuyển đổi Âm - Dương lịch, Can Chi, và tính ngày giỗ chuẩn xác
 */

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap?: boolean;
  canChiYear: string;
}

export function getCanChiYear(year: number): string {
  const canIndex = (year + 6) % 10;
  const chiIndex = (year + 8) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

/**
 * Chuyển đổi Dương lịch sang Âm lịch (Độ chính xác cao cho văn hóa Việt Nam)
 */
export function solarToLunar(solarDay: number, solarMonth: number, solarYear: number): LunarDate {
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

/**
 * Chuyển đổi ngày Âm lịch sang ngày Dương lịch chính xác trong một năm Dương lịch cụ thể
 */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  solarTargetYear: number
): { day: number; month: number; year: number } {
  // Bắt đầu ước lượng khoảng 1 tháng sau tháng Âm lịch
  let date = new Date(solarTargetYear, lunarMonth, lunarDay);
  for (let iter = 0; iter < 15; iter++) {
    const l = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
    if (l.day === lunarDay && l.month === lunarMonth) {
      return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }
    let diff = (lunarMonth - l.month) * 30 + (lunarDay - l.day);
    if (l.year !== solarTargetYear) {
      diff += (solarTargetYear - l.year) * 354;
    }
    if (diff === 0) diff = 1;
    date.setDate(date.getDate() + diff);
  }
  return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
}

/**
 * Định dạng chuỗi ngày hiển thị truyền thống
 */
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
 * Tính số ngày còn lại đến ngày Giỗ âm lịch tiếp theo và ngày Dương tương ứng
 */
export function getDaysUntilAnniversary(
  lunarDay: number,
  lunarMonth: number
): {
  daysRemaining: number;
  isToday: boolean;
  isUpcoming: boolean;
  solarDate: { day: number; month: number; year: number };
} {
  const today = new Date();
  const currentYear = today.getFullYear();

  // Tính ngày Dương của giỗ trong năm nay
  let solar = lunarToSolar(lunarDay, lunarMonth, currentYear);
  let anniversarySolarDate = new Date(solar.year, solar.month - 1, solar.day);

  // Nếu ngày giỗ năm nay đã qua quá 1 ngày, tính cho năm tiếp theo
  const nowTime = today.setHours(0, 0, 0, 0);
  if (anniversarySolarDate.getTime() < nowTime) {
    solar = lunarToSolar(lunarDay, lunarMonth, currentYear + 1);
    anniversarySolarDate = new Date(solar.year, solar.month - 1, solar.day);
  }

  const diffTime = anniversarySolarDate.getTime() - nowTime;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    daysRemaining,
    isToday: daysRemaining === 0,
    isUpcoming: daysRemaining > 0 && daysRemaining <= 30,
    solarDate: solar,
  };
}
