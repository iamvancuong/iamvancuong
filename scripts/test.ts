/**
 * Bộ kiểm cho phần logic thuần: day · period · stats · money.
 *
 *     npm run test
 *
 * KHÔNG dùng framework test. Dự án này có 0 dependency giao diện vì cùng một
 * lý do (PLAN §3): thêm vitest/jest kéo theo cấu hình, transform, và một cách
 * chạy thứ hai cho TypeScript — trong khi thứ cần kiểm ở đây là bốn file hàm
 * thuần, không mock gì, không chạm database, không render component.
 *
 * Vì sao kiểm ĐÚNG bốn file này: chúng là chỗ sai **âm thầm** nhất. Sai một
 * phép cộng ngày thì không có lỗi nào hiện ra — chỉ có một con số trông hợp lý
 * mà sai, và vài tháng sau mới phát hiện thì đã không lần ngược được nữa.
 */
import { CostCycle, GoalStatus, Horizon } from "@prisma/client";
import {
  addDaysISO,
  dayUTC,
  daysBetweenISO,
  fmtH,
  isoUTC,
  todayISO,
  weekdayShortVN,
} from "../lib/os/day";
import {
  mondayISO,
  monthStartISO,
  nextPeriodStartISO,
  periodDays,
  periodEndISO,
  periodState,
} from "../lib/os/period";
import {
  buildingTooMuch,
  dayLevel,
  keystoneStreak,
  longestStreak,
  periodStats,
  trend,
  weekDates,
  weekStats,
} from "../lib/os/stats";
import {
  costActiveIn,
  fixedTotal,
  monthKey,
  monthLabelVN,
  monthMoney,
  perMonth,
  recentMonths,
} from "../lib/os/money";

let ran = 0;
let failed = 0;
let group = "";

const describe = (name: string) => {
  group = name;
  console.log(`\n${name}`);
};

const eq = (name: string, got: unknown, want: unknown) => {
  ran++;
  const good = JSON.stringify(got) === JSON.stringify(want);
  if (good) {
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`      nhận  ${JSON.stringify(got)}`);
    console.log(`      đợi   ${JSON.stringify(want)}`);
  }
};

/* ------------------------------------------------------------------ day */

describe("day.ts — quy ước nửa đêm UTC");

eq("dayUTC dựng đúng nửa đêm UTC", dayUTC("2026-08-06").toISOString(), "2026-08-06T00:00:00.000Z");
eq("isoUTC là phép ngược của dayUTC", isoUTC(dayUTC("2026-08-06")), "2026-08-06");
// Đây là luật #2 của dự án: thiếu hậu tố Z là lệch một ngày vì JST = UTC+9.
eq("không lệch ngày dù máy ở JST", isoUTC(new Date("2026-08-06T00:00:00.000Z")), "2026-08-06");
// ⚠️ `todayISO` nay CỐ ĐỊNH giờ Nhật (Asia/Tokyo, UTC+9), không đọc giờ máy.
// Dùng mốc UTC rõ ràng để phép kiểm tất định, không đổi theo múi giờ máy chạy.
// 15:00Z = 00:00 JST ngày HÔM SAU — ranh giới ngày của JST.
eq("todayISO theo giờ Nhật", todayISO(new Date("2026-08-06T03:00:00Z")), "2026-08-06");
eq("trước nửa đêm JST vẫn là ngày đó", todayISO(new Date("2026-08-06T14:59:00Z")), "2026-08-06");
eq("qua nửa đêm JST sang ngày mới", todayISO(new Date("2026-08-06T15:00:00Z")), "2026-08-07");

eq("cộng ngày qua cuối tháng", addDaysISO("2026-01-31", 1), "2026-02-01");
eq("trừ ngày qua đầu năm", addDaysISO("2026-01-01", -1), "2025-12-31");
eq("năm nhuận 2028 có 29/02", addDaysISO("2028-02-28", 1), "2028-02-29");
eq("2026 không nhuận", addDaysISO("2026-02-28", 1), "2026-03-01");

eq("khoảng cách ngày", daysBetweenISO("2026-08-01", "2026-08-06"), 5);
eq("khoảng cách qua năm", daysBetweenISO("2025-12-31", "2026-01-01"), 1);

eq("06/08/2026 là Thứ Năm", weekdayShortVN("2026-08-06"), "T5");
eq("fmtH dưới một giờ", fmtH(45), "45p");
eq("fmtH tròn giờ", fmtH(120), "2h");

/* --------------------------------------------------------------- period */

describe("period.ts — tuần bắt đầu THỨ HAI");

// Luật #3 của dự án. Sai chỗ này thì lịch nhiệt và cam kết tuần lệch nhau.
eq("thứ Năm lùi về thứ Hai", mondayISO("2026-08-06"), "2026-08-03");
eq("chính thứ Hai giữ nguyên", mondayISO("2026-08-03"), "2026-08-03");
eq("CHỦ NHẬT thuộc tuần TRƯỚC", mondayISO("2026-08-09"), "2026-08-03");
eq("thứ Hai kế tiếp là tuần mới", mondayISO("2026-08-10"), "2026-08-10");

eq("tháng nắn về ngày 1", monthStartISO("2026-08-27"), "2026-08-01");
eq("tuần đủ 7 ngày", periodDays(Horizon.WEEK, "2026-08-03").length, 7);
eq("tháng 2/2026 có 28 ngày", periodDays(Horizon.MONTH, "2026-02-01").length, 28);
eq("cuối tuần là Chủ nhật", periodEndISO(Horizon.WEEK, "2026-08-03"), "2026-08-09");
eq("cuối tháng 2/2026", periodEndISO(Horizon.MONTH, "2026-02-01"), "2026-02-28");
eq("kỳ sau của tuần", nextPeriodStartISO(Horizon.WEEK, "2026-08-03"), "2026-08-10");
eq("kỳ sau của tháng 12 sang năm mới", nextPeriodStartISO(Horizon.MONTH, "2026-12-01"), "2027-01-01");

eq("kỳ đang diễn ra", periodState(Horizon.WEEK, "2026-08-03", "2026-08-06"), "current");
eq("kỳ đã qua", periodState(Horizon.WEEK, "2026-07-27", "2026-08-06"), "past");
eq("kỳ sắp tới", periodState(Horizon.WEEK, "2026-08-10", "2026-08-06"), "future");
eq("ngày cuối kỳ vẫn là current", periodState(Horizon.WEEK, "2026-08-03", "2026-08-09"), "current");

/* ---------------------------------------------------------------- stats */

describe("stats.ts — chuỗi ngày và cảm biến");

const log = (iso: string, o: Record<string, unknown> = {}) =>
  ({
    id: iso, date: dayUTC(iso),
    kSleep: false, kJapanese: false, kEat: false, workout: false,
    jpMin: 0, itMin: 0, webMin: 0, spend: null, ...o,
  }) as never;

const full = (iso: string, o: Record<string, unknown> = {}) =>
  log(iso, { kSleep: true, kJapanese: true, kEat: true, ...o });

eq("ngày trống là mức 0", dayLevel(undefined), 0);
eq("đủ ba việc là mức 3", dayLevel(full("2026-08-06")), 3);
eq("hai trong ba là mức 2", dayLevel(log("2026-08-06", { kSleep: true, kEat: true })), 2);

// keystoneStreak đo TỪ HÔM NAY, nên dựng ngày tương đối theo hôm nay — không
// hardcode (hardcode sẽ hỏng khi thời gian trôi qua mốc đó).
const t0 = todayISO();
const streak = [full(addDaysISO(t0, -2)), full(addDaysISO(t0, -1)), full(t0)];
eq("chuỗi ba ngày liên tiếp", keystoneStreak(streak), 3);
// Chuỗi không được coi là đứt chỉ vì buổi tối hôm nay chưa tới.
eq(
  "hôm nay chưa ghi thì tính từ hôm qua",
  keystoneStreak([full(addDaysISO(t0, -2)), full(addDaysISO(t0, -1))]),
  2,
);
eq("kỷ lục dài nhất", longestStreak([full("2026-01-01"), full("2026-01-02"), full("2026-06-01")]), 2);
eq("chưa ngày nào đủ thì kỷ lục 0", longestStreak([log("2026-01-01")]), 0);

eq("tuần có đúng 7 ngày", weekDates(0, "2026-08-06").length, 7);
eq("tuần kết thúc hôm nay", weekDates(0, "2026-08-06").at(-1), "2026-08-06");
eq("offset 1 là tuần trước", weekDates(1, "2026-08-06").at(-1), "2026-07-30");

const w = weekStats([log("2026-08-05", { jpMin: 60, webMin: 30, spend: 1000 }), log("2026-08-06", { jpMin: 30, webMin: 200 })], 0);
eq("cộng phút tiếng Nhật trong tuần", w.jpMin, 90);
eq("cộng phút xây web", w.webMin, 230);
eq("cộng chi tiêu tuần", w.spend, 1000);

// Cảm biến quan trọng nhất: phải so web với tiếng Nhật, KHÔNG so IT.
eq("báo động khi xây web > tiếng Nhật", buildingTooMuch({ jpMin: 60, itMin: 0, webMin: 300, workouts: 0, daysLogged: 0, keystoneDays: 0, spend: 0 }), true);
eq("KHÔNG báo động vì học IT nhiều", buildingTooMuch({ jpMin: 60, itMin: 900, webMin: 0, workouts: 0, daysLogged: 0, keystoneDays: 0, spend: 0 }), false);
eq("một tối sửa vặt không bật báo động", buildingTooMuch({ jpMin: 0, itMin: 0, webMin: 90, workouts: 0, daysLogged: 0, keystoneDays: 0, spend: 0 }), false);

eq("trend đi lên", trend(120, 100), "up");
eq("trend đi xuống", trend(80, 100), "down");
eq("trend trong dung sai là phẳng", trend(105, 100), "flat");
eq("từ 0 lên có là up", trend(5, 0), "up");
eq("0 sang 0 là phẳng", trend(0, 0), "flat");

const ps = periodStats([full("2026-08-01"), full("2026-08-02"), log("2026-08-03")], "month", "2026-08-06");
eq("đếm ngày đủ ba việc trong tháng", ps.full, 2);
eq("số ngày đã trôi qua trong tháng", ps.elapsed, 6);

/* ---------------------------------------------------------------- money */

describe("money.ts — chi phí cố định và tổng kết tháng");

const D = (iso: string) => dayUTC(iso);
const cost = (o: Record<string, unknown>) =>
  ({
    id: "x", name: "x", amount: 0, cycle: CostCycle.MONTH, note: null,
    startedAt: null, endedAt: null, order: 0,
    createdAt: new Date(), updatedAt: new Date(), ...o,
  }) as never;

eq("khoản năm chia đều 12 tháng", perMonth(cost({ amount: 60000, cycle: CostCycle.YEAR })), 5000);
eq("khoản tháng giữ nguyên", perMonth(cost({ amount: 60000 })), 60000);

const c = cost({ amount: 100, startedAt: D("2026-03-15"), endedAt: D("2026-06-10") });
// So bằng chuỗi "YYYY-MM": khoản bắt đầu giữa tháng vẫn bị trừ tiền tháng đó.
eq("tháng bắt đầu giữa chừng vẫn tính", costActiveIn(c, "2026-03-01"), true);
eq("tháng dừng giữa chừng vẫn tính", costActiveIn(c, "2026-06-01"), true);
eq("trước khi bắt đầu thì không", costActiveIn(c, "2026-02-01"), false);
eq("sau khi dừng thì không", costActiveIn(c, "2026-07-01"), false);
eq("không khai ngày = luôn hiệu lực", costActiveIn(cost({}), "1999-01-01"), true);

eq("sàn = khoản tháng + khoản năm/12", fixedTotal([cost({ amount: 55000 }), cost({ amount: 24000, cycle: CostCycle.YEAR })], "2026-08-01"), 57000);

const logs = [log("2026-08-03", { spend: 1200 }), log("2026-08-04", { spend: 800 }), log("2026-07-31", { spend: 9999 }), log("2026-08-05")];
const m = monthMoney("2026-08-01", logs, [cost({ amount: 60000 })], [{ month: D("2026-08-01"), income: 200000 } as never], "2026-08-06");
eq("chi hằng ngày chỉ lấy trong tháng", m.daily, 2000);
eq("cộng chi cố định", m.fixed, 60000);
eq("tổng chi", m.total, 62000);
eq("còn lại", m.saved, 138000);
eq("tỷ lệ tiết kiệm 69%", Math.round((m.savedRate ?? 0) * 100), 69);
eq("đếm ngày đã ghi, bỏ ngày null", m.daysWithSpend, 2);
eq("tháng hiện tại là partial", m.partial, true);

const m2 = monthMoney("2026-07-01", logs, [], [], "2026-08-06");
eq("chưa khai thu nhập -> còn lại null", m2.saved, null);
eq("chưa khai thu nhập -> tỷ lệ null", m2.savedRate, null);
eq("tháng cũ không partial", m2.partial, false);

const m3 = monthMoney("2026-08-01", [], [], [{ month: D("2026-08-01"), income: 0 } as never], "2026-08-06");
eq("thu nhập 0 không bị chia cho 0", m3.savedRate, null);

// Lùi tháng bằng số học trên (năm×12 + tháng), không trừ 30 ngày.
eq("lùi qua ranh giới năm", recentMonths(3, "2026-01-15"), ["2026-01-01", "2025-12-01", "2025-11-01"]);
eq("lùi qua tháng 2", recentMonths(2, "2026-03-31"), ["2026-03-01", "2026-02-01"]);
eq("12 tháng ra đủ 12", recentMonths(12, "2026-08-06").length, 12);
eq("monthKey cắt đúng", monthKey("2026-08-01"), "2026-08");
eq("nhãn tháng tiếng Việt", monthLabelVN("2026-08-01"), "Tháng 8/2026");

/* ---------------------------------------------------------------- tổng */

console.log(
  failed === 0
    ? `\n✓ ${ran} phép kiểm, tất cả đều đúng.\n`
    : `\n✗ ${failed}/${ran} phép kiểm SAI.\n`,
);

if (failed > 0) process.exit(1);

// Dùng để TypeScript không kêu import thừa khi tạm bỏ bớt phép kiểm.
void GoalStatus;
void group;
