/**
 * Kiểm bất biến của pomodoro trên DATABASE THẬT:
 *
 *     DailyLog.jpPomo  ==  số dòng PomoSession cùng ngày
 *
 * Bất biến này là thứ duy nhất giữ cho tổng giờ và ngân sách từng mảng nói
 * cùng một câu chuyện. Nó hỏng ÂM THẦM: cả hai con số vẫn trông hợp lý, chỉ
 * là không khớp nhau, và không có lỗi nào hiện ra.
 *
 *     npx tsx scripts/check-pomo.ts
 *
 * Chạy lại bất cứ lúc nào thấy nghi. Nếu có ngày lệch, sửa bằng cách mở
 * /os/log/[ngày] và bấm lại hàng ô — setPomodoro ghi lại cả hai cho khớp.
 */
import "dotenv/config";
import { db } from "../lib/db";
import { isoUTC } from "../lib/os/day";

async function main() {
  const [logs, sessions] = await Promise.all([
    db.dailyLog.findMany({ select: { date: true, jpPomo: true } }),
    db.pomoSession.findMany({ select: { date: true } }),
  ]);

  const counted = new Map<string, number>();
  for (const s of sessions) {
    const k = isoUTC(s.date);
    counted.set(k, (counted.get(k) ?? 0) + 1);
  }

  // Kiểm CẢ HAI chiều: ngày có jpPomo mà không có dòng nào, và ngày có dòng
  // mà DailyLog chưa từng được tạo. Chiều thứ hai mới là chiều dễ quên.
  const days = new Set([
    ...logs.map((l) => isoUTC(l.date)),
    ...counted.keys(),
  ]);

  const bad: string[] = [];
  for (const d of days) {
    const said = logs.find((l) => isoUTC(l.date) === d)?.jpPomo ?? 0;
    const real = counted.get(d) ?? 0;
    if (said !== real) bad.push(`  ${d}: jpPomo=${said} nhưng có ${real} dòng`);
  }

  console.log(`\n${days.size} ngày có dữ liệu pomodoro.`);
  console.log(
    bad.length === 0
      ? "✓ Bất biến giữ được ở mọi ngày.\n"
      : `✗ ${bad.length} ngày LỆCH:\n${bad.join("\n")}\n`,
  );

  if (bad.length) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
