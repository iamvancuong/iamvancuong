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
  goalPace,
  jpPeriodTotal,
  jpStreak,
  jpSum,
  jpTotal,
  isStudyGoal,
  monthlyBuckets,
  childProgress,
  unassignedPomo,
} from "../lib/os/japanese";
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
    jpPomo: 0, jpMin: 0, itMin: 0, webMin: 0, spend: null, ...o,
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
eq("ngày trống (0 việc) không tính vào kỷ lục", longestStreak([log("2026-01-01")]), 0);

// Chuỗi mới: CÓ LÀM (≥1 việc) là tính — ngày 1/3 vẫn vào chuỗi, không cần đủ 3.
const partial = (iso: string) => log(iso, { kSleep: true }); // 1/3 việc
eq(
  "ngày làm 1/3 vẫn tính vào chuỗi",
  keystoneStreak([partial(addDaysISO(t0, -1)), partial(t0)]),
  2,
);
eq(
  "kỷ lục tính cả ngày 1/3",
  longestStreak([partial("2026-01-01"), partial("2026-01-02")]),
  2,
);

eq("tuần có đúng 7 ngày", weekDates(0, "2026-08-06").length, 7);
eq("tuần kết thúc hôm nay", weekDates(0, "2026-08-06").at(-1), "2026-08-06");
eq("offset 1 là tuần trước", weekDates(1, "2026-08-06").at(-1), "2026-07-30");

// ⚠️ Truyền `end` vào, đừng để hàm tự đọc đồng hồ: ngày ghim cứng + đồng hồ
// thật thì phép kiểm chạy được đúng một tuần rồi hỏng, mà lúc hỏng thì trông
// như logic sai chứ không như "hôm nay đã trôi qua tuần đó".
const w = weekStats([log("2026-08-05", { jpMin: 60, webMin: 30, spend: 1000 }), log("2026-08-06", { jpMin: 30, webMin: 200 })], 0, "2026-08-06");
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

const ps = periodStats([full("2026-08-01"), log("2026-08-02", { kEat: true }), log("2026-08-03")], "month", "2026-08-06");
eq("đếm ngày CÓ LÀM (≥1 việc) trong tháng", ps.full, 2);
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

/* ------------------------------------------------------------- japanese */

describe("japanese.ts — pomodoro, hành trình, mục tiêu con");

/** Bản ghi rút gọn: chỉ ba trường mà japanese.ts thật sự đọc. */
const jp = (iso: string, pomo: number, min = 0) => ({
  date: dayUTC(iso),
  jpPomo: pomo,
  jpMin: min,
});

// ⚠️ Luật quan trọng nhất: TỔNG = hiệp × 50 + phút lẻ. Đọc thẳng `jpMin` sẽ báo
// 0 phút cho một ngày học 5 tiếng mà không có lỗi nào hiện ra.
eq("tổng = hiệp × 50 + phút lẻ", jpTotal(jp("2026-08-11", 7, 20)), 370);
eq("không có bản ghi thì bằng 0", jpTotal(undefined), 0);

const week = [
  jp("2026-08-08", 3),
  jp("2026-08-09", 0, 30),
  jp("2026-08-10", 7),
  jp("2026-08-11", 5, 10),
];

eq("cộng theo khoảng, hai đầu đều tính", jpSum(week, "2026-08-09", "2026-08-10"), 380);
eq("tổng tháng", jpPeriodTotal(week, "month", "2026-08-11"), 790);
eq("tháng khác thì không tính", jpPeriodTotal(week, "month", "2026-09-01"), 0);

eq("chuỗi học liên tiếp", jpStreak(week, "2026-08-11"), 4);
// Hôm nay chưa học thì tính từ hôm qua — buổi tối chưa tới không phải đứt chuỗi.
eq("hôm nay chưa học thì tính từ hôm qua", jpStreak(week, "2026-08-12"), 4);
eq("nghỉ hẳn một ngày là đứt", jpStreak(week, "2026-08-13"), 0);

/*
 * ⭐ Kế hoạch thật của chủ nhân, và luật dễ hiểu sai nhất của cả file:
 *
 *   0h ────────────── 500h ────── 800h
 *      N5 + N4          N3
 *
 * `targetHours` = 800 là TỔNG TỪ SỐ 0, không phải "800 giờ nữa".
 * `priorHours`  = 500 là phần đã đi trước khi có hệ thống.
 * Phần còn phải học là 300h, và NHỊP phải rút ra từ 300h chứ không phải 800h.
 */
const n3 = {
  studyStart: dayUTC("2026-08-01"),
  studyEnd: dayUTC("2026-11-30"),
  targetHours: 800,
  priorHours: 500,
  dailyPomo: 7,
};

const day1 = goalPace(n3, [], "2026-08-01")!;
eq("đợt 4 tháng = 122 ngày", day1.daysTotal, 122);
eq("tổng là 800h, không phải 800 + 500", day1.totalMin, 48_000);
eq("500h đã học được tính sẵn", day1.doneMin, 30_000);
eq("còn đúng 300h phải học", day1.remainMin, 18_000);
// Ngày đầu KHÔNG được nợ gì: tính cả hôm nay vào `dueMin` thì 8 giờ sáng hệ
// thống đã báo nợ trong khi ngày còn chưa bắt đầu.
eq("ngày đầu chưa nợ thêm gì ngoài phần đã có", day1.dueMin, 30_000);
eq("ngày đầu không vượt không nợ", day1.aheadMin, 0);
// ⭐ Nhịp rút từ 300h/122 ngày = 2.95 → làm tròn LÊN. Nếu lỡ rút từ 800h thì ra
// ~7.9 và hệ thống sẽ đòi gấp gần ba lần mức thật sự cần.
eq("nhịp rút từ phần CÒN LẠI, không từ tổng", day1.pomoPerDayLeft, 3);
eq("phần trăm tính trên cả hành trình", day1.percent, 63);

const d11 = goalPace(n3, week, "2026-08-11")!;
eq("mười ngày đã đóng sổ", d11.daysClosed, 10);
eq("đã học = 500h + phần bấm được", d11.doneMin, 30_000 + 790);
eq("còn lại tụt đúng phần đã bấm", d11.remainMin, 48_000 - 30_790);
eq("đang nợ nhẹ so với nhịp", d11.aheadMin < 0, true);
eq("đang chạy", d11.state, "running");

// Không có tổng giờ thì không có nhịp nào để nói — trả null, KHÔNG trả một
// Pace toàn số 0 (số 0 trông như dữ liệu thật).
eq(
  "thiếu tổng giờ thì không phải mục tiêu học",
  goalPace({ ...n3, targetHours: null }, [], "2026-08-01"),
  null,
);
eq(
  "thiếu ngày cũng vậy",
  goalPace({ ...n3, studyEnd: null }, [], "2026-08-01"),
  null,
);
eq("nhận ra mục tiêu học", isStudyGoal({ targetHours: 800 }), true);
eq("mục tiêu thường không phải mục tiêu học", isStudyGoal({ targetHours: null }), false);

// Quá ngày đích: nợ dừng ở tổng, không cộng thêm ngày ngoài đợt.
const after = goalPace(n3, [], "2027-01-15")!;
eq("hết đợt thì nợ dừng ở tổng", after.dueMin, after.totalMin);
eq("hết đợt thì không còn ngày nào", after.daysLeft, 0);
eq("hết đợt thì không tính nhịp còn lại", after.pomoPerDayLeft, null);
eq("đã hết hạn", after.state, "ended");

// ---- mục tiêu con: vừa là CHẶNG đã qua, vừa là MẢNG kỹ năng ----
const children = [
  // Chặng đã đi qua: 500h khai tay, không có hiệp nào trong quá khứ.
  { id: "n4", title: "N5–N4", icon: "🎓", targetHours: 500, priorHours: 500 },
  { id: "vocab", title: "Từ vựng", icon: "🇯🇵", targetHours: 150, priorHours: null },
  { id: "listen", title: "Nghe", icon: "🎧", targetHours: 100, priorHours: null },
];

const sessions = [
  ...Array(6).fill({ goalId: "vocab" }),
  ...Array(2).fill({ goalId: null }),
];

const prog = childProgress(children, sessions);
// ⭐ Chặng đã qua phải hiện ĐẦY nhờ priorHours — không cần bịa 600 hiệp quá khứ.
eq("chặng đã qua đầy nhờ giờ khai tay", prog[0].percent, 100);
eq("chặng đã qua không còn thiếu hiệp nào", prog[0].pomoLeft, 0);
eq("6 hiệp từ vựng = 300 phút", prog[1].doneMin, 300);
eq("mảng chưa đụng tới vẫn hiện 0", prog[2].doneMin, 0);
// Hiệp chưa gắn KHÔNG được im lặng biến mất — nó vẫn trong tổng giờ.
eq("đếm được hiệp chưa gắn", unassignedPomo(sessions), 2);

eq("12 tháng ra đủ 12 cột", monthlyBuckets(week, 12, "2026-08-11").length, 12);
eq(
  "cột cuối là tháng hiện tại",
  monthlyBuckets(week, 12, "2026-08-11")[11].key,
  "2026-08",
);

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
