import { CostCycle, type DailyLog, type FixedCost, type MonthBudget } from "@prisma/client";
import { isoUTC, todayISO } from "./day";
import { monthStartISO } from "./period";

/**
 * Tính toán của module Tiền — logic thuần, KHÔNG chạm database.
 *
 * Tách khỏi action đúng vì lý do `stats.ts` được tách: đây là chỗ dễ sai âm
 * thầm nhất trong cả hệ thống (một khoản năm quên chia 12, một tháng lấy
 * nhầm hợp đồng đã hết hạn) và sai thì không có lỗi nào hiện ra — chỉ có một
 * con số trông hợp lý mà sai.
 */

export type MonthMoney = {
  /** "2026-08-01" — ngày 1, nửa đêm UTC */
  month: string;
  /** Chi hằng ngày: tổng `DailyLog.spend` trong tháng */
  daily: number;
  /** Chi cố định quy về tháng */
  fixed: number;
  /** daily + fixed */
  total: number;
  income: number | null;
  /** income − total. Null khi chưa khai thu nhập. */
  saved: number | null;
  /** saved / income, 0–1. Null khi chưa khai thu nhập hoặc thu nhập = 0. */
  savedRate: number | null;
  /** Số ngày trong tháng đã ghi `spend` — để biết con số đáng tin tới đâu. */
  daysWithSpend: number;
  /** Tháng đang diễn ra: mọi con số còn chạy tiếp. */
  partial: boolean;
};

/** "2026-08-01" → "2026-08" */
export const monthKey = (iso: string) => iso.slice(0, 7);

/**
 * Một khoản cố định có hiệu lực trong tháng `monthISO` không?
 *
 * So bằng CHUỖI tháng chứ không so Date: `startedAt` là @db.Date ở nửa đêm
 * UTC, mà tháng thì so theo "YYYY-MM" — dùng phép so ngày sẽ loại nhầm khoản
 * bắt đầu giữa tháng, trong khi tháng đó vẫn bị trừ tiền.
 */
export function costActiveIn(c: FixedCost, monthISO: string): boolean {
  const m = monthKey(monthISO);
  if (c.startedAt && monthKey(isoUTC(c.startedAt)) > m) return false;
  if (c.endedAt && monthKey(isoUTC(c.endedAt)) < m) return false;
  return true;
}

/** Khoản theo năm quy về một tháng. Làm tròn để tổng không ra số lẻ đồng. */
export const perMonth = (c: FixedCost): number =>
  c.cycle === CostCycle.YEAR ? Math.round(c.amount / 12) : c.amount;

/** Sàn cố định mỗi tháng ở thời điểm `monthISO`. */
export function fixedTotal(costs: FixedCost[], monthISO: string): number {
  return costs
    .filter((c) => costActiveIn(c, monthISO))
    .reduce((s, c) => s + perMonth(c), 0);
}

/**
 * Gộp một tháng.
 *
 * `logs` và `budgets` truyền vào đã lọc sẵn hay chưa đều được — hàm tự lọc
 * theo tháng, nên gọi nó trong vòng lặp nhiều tháng vẫn đúng.
 */
export function monthMoney(
  monthISO: string,
  logs: DailyLog[],
  costs: FixedCost[],
  budgets: MonthBudget[],
  today = todayISO(),
): MonthMoney {
  const m = monthKey(monthISO);

  const inMonth = logs.filter((l) => monthKey(isoUTC(l.date)) === m);
  const daily = inMonth.reduce((s, l) => s + (l.spend ?? 0), 0);
  const fixed = fixedTotal(costs, monthISO);
  const total = daily + fixed;

  const budget = budgets.find((b) => monthKey(isoUTC(b.month)) === m);
  const income = budget?.income ?? null;

  const saved = income == null ? null : income - total;
  const savedRate = income == null || income <= 0 ? null : (income - total) / income;

  return {
    month: monthISO,
    daily,
    fixed,
    total,
    income,
    saved,
    savedRate,
    daysWithSpend: inMonth.filter((l) => l.spend != null).length,
    partial: m === monthKey(today),
  };
}

/**
 * `n` tháng gần nhất, mới nhất trước.
 *
 * Lùi bằng cách trừ trên số tháng rồi mới dựng chuỗi, không cộng/trừ ngày —
 * cộng 30 ngày sẽ trượt tháng ở tháng 2 và các tháng 31 ngày.
 */
export function recentMonths(n: number, today = todayISO()): string[] {
  const start = monthStartISO(today);
  const y = Number(start.slice(0, 4));
  const mo = Number(start.slice(5, 7));

  return Array.from({ length: n }, (_, i) => {
    const total = y * 12 + (mo - 1) - i;
    const yy = Math.floor(total / 12);
    const mm = (total % 12) + 1;
    return `${yy}-${String(mm).padStart(2, "0")}-01`;
  });
}

/** "2026-08-01" → "Tháng 8/2026" */
export function monthLabelVN(monthISO: string): string {
  return `Tháng ${Number(monthISO.slice(5, 7))}/${monthISO.slice(0, 4)}`;
}

/** 128000 → "128.000" — dấu chấm ngăn nghìn kiểu Việt. */
export function fmtYen(n: number): string {
  return n.toLocaleString("vi-VN");
}
