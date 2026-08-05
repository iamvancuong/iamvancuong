import { site } from "@/lib/site";

/**
 * Mốc mục tiêu tính theo TUỔI thấy thật hơn theo năm.
 * "Năm 25 tuổi tôi muốn đang đi làm IT ở Nhật" — và hệ thống nói thẳng
 * còn bao nhiêu lâu.
 */

const BIRTH = new Date(site.birthDate);

export function ageNow(at: Date = new Date()): { years: number; months: number } {
  let years = at.getFullYear() - BIRTH.getFullYear();
  let months = at.getMonth() - BIRTH.getMonth();
  if (at.getDate() < BIRTH.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months };
}

/** Ngày sinh nhật tuổi thứ `age`. */
export function dateAtAge(age: number): Date {
  const d = new Date(BIRTH);
  d.setFullYear(BIRTH.getFullYear() + age);
  return d;
}

/** "còn 1 năm 11 tháng" · "đã qua 2 năm" */
export function timeUntilAge(age: number, at: Date = new Date()): string {
  const target = dateAtAge(age);
  const past = target.getTime() < at.getTime();
  const [a, b] = past ? [target, at] : [at, target];

  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  if (b.getDate() < a.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (parts.length === 0) return past ? "vừa qua" : "trong tháng này";

  return `${past ? "đã qua" : "còn"} ${parts.join(" ")}`;
}

export function fmtDateVN(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

export type AgeMilestone = {
  age: number;
  year: number;
  /** "06/07/2028" */
  dateVN: string;
  /** "còn 1 năm 11 tháng" */
  until: string;
};

/**
 * Các mốc tuổi để chọn — TÍNH RA từ ngày sinh, không phải gõ tay.
 *
 * Hệ thống đã biết bạn sinh 06/07/2003 thì không có lý do gì bắt bạn tự nghĩ
 * ra con số rồi tự tra xem nó rơi vào năm nào. Chọn "25 tuổi" phải thấy ngay
 * "06/07/2028 · còn 1 năm 11 tháng" — đó mới là thứ làm mốc tuổi thật hơn mốc
 * năm (OS-DESIGN §3①).
 *
 * Dải mốc: bảy năm tới liên tiếp (khoảng nhìn thấy được), cộng các mốc tròn
 * xa hơn. Quá khứ bị loại — đặt mục tiêu cho tuổi đã qua thì vô nghĩa.
 */
export function ageMilestones(at: Date = new Date()): AgeMilestone[] {
  const now = ageNow(at).years;

  const near = Array.from({ length: 7 }, (_, i) => now + 1 + i);
  const round = [25, 30, 35, 40, 45, 50, 60, 70, 80];

  const ages = [...new Set([...near, ...round])]
    .filter((a) => a > now)
    .sort((a, b) => a - b);

  return ages.map((age) => {
    const date = dateAtAge(age);
    return {
      age,
      year: date.getFullYear(),
      dateVN: fmtDateVN(date),
      until: timeUntilAge(age, at),
    };
  });
}
