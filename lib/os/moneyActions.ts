"use server";

import { revalidatePath } from "next/cache";
import { CostCycle } from "@prisma/client";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { dayUTC } from "./day";
import { dateISO, enumOf, num, str, text, valuesOf } from "./formData";

/**
 * Tiền — chi phí cố định và tổng kết tháng.
 *
 * MỌI hàm ở đây phải tự kiểm đăng nhập — Server Action là endpoint thật,
 * middleware không chặn nó.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

/** Khai bằng tên, không đọc object enum lúc chạy — xem `valuesOf`. */
const CYCLES = valuesOf<CostCycle>({ MONTH: null, YEAR: null });

function revalidateMoney() {
  revalidatePath("/os/money");
  revalidatePath("/os");
}

/* ---------------- Chi phí cố định ---------------- */

function costFields(fd: FormData) {
  return {
    name: str(fd, "name", 80),
    // Trần 100 triệu ¥: gõ thừa vài số 0 thì tổng tháng hỏng mà không ai nhận ra.
    amount: num(fd, "amount", { min: 0, max: 100_000_000 }),
    cycle: enumOf(fd, "cycle", CYCLES, CostCycle.MONTH),
    note: text(fd, "note", 300),
    startedAt: dateISO(fd, "startedAt"),
    endedAt: dateISO(fd, "endedAt"),
  };
}

export async function createFixedCost(fd: FormData) {
  await assertOwner();

  const f = costFields(fd);
  if (!f.name || f.amount == null) return;

  const count = await db.fixedCost.count();
  await db.fixedCost.create({
    data: { ...f, name: f.name, amount: f.amount, order: count },
  });

  revalidateMoney();
}

export async function updateFixedCost(id: string, fd: FormData) {
  await assertOwner();

  const f = costFields(fd);
  if (!f.name || f.amount == null) return;

  await db.fixedCost.update({
    where: { id },
    data: { ...f, name: f.name, amount: f.amount },
  });

  revalidateMoney();
}

/**
 * Dừng một khoản kể từ hôm nay, KHÔNG xóa.
 *
 * Đây mới là thứ gần như lúc nào cũng đúng: hủy hợp đồng điện thoại tháng này
 * không làm cho mười hai tháng đã trả tiền biến mất. Xóa hẳn thì mọi tháng cũ
 * bỗng dưng rẻ đi, và lịch sử chi tiêu thành nói dối.
 */
export async function stopFixedCost(id: string, fd: FormData) {
  await assertOwner();

  const endedAt = dateISO(fd, "endedAt") ?? new Date();
  await db.fixedCost.update({
    where: { id },
    data: { endedAt: dayUTC(endedAt.toISOString().slice(0, 10)) },
  });

  revalidateMoney();
}

/** Mở lại một khoản đã dừng — bỏ trống `endedAt`. */
export async function resumeFixedCost(id: string) {
  await assertOwner();
  await db.fixedCost.update({ where: { id }, data: { endedAt: null } });
  revalidateMoney();
}

/** Xóa hẳn — chỉ dùng khi khoản đó nhập nhầm, xem chú thích ở `stopFixedCost`. */
export async function deleteFixedCost(id: string) {
  await assertOwner();
  await db.fixedCost.delete({ where: { id } });
  revalidateMoney();
}

/* ---------------- Thu nhập tháng ---------------- */

/**
 * Chỉ thu nhập phải tự khai — chi tiêu thì cộng từ `DailyLog.spend` và
 * `FixedCost`, hệ thống tự biết.
 *
 * Upsert theo cột `month` (unique) nên lưu bao nhiêu lần cũng không tạo trùng.
 * Để trống ô = xóa con số đó đi, không phải ghi 0: "chưa khai" và "tháng này
 * thu nhập bằng 0" là hai chuyện khác nhau, và tỷ lệ tiết kiệm chỉ tính được
 * ở trường hợp đầu nếu phân biệt được.
 */
export async function saveMonthIncome(monthISO: string, fd: FormData) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-01$/.test(monthISO)) return;

  const income = num(fd, "income", { min: 0, max: 100_000_000 });
  const note = text(fd, "note", 300);
  const month = dayUTC(monthISO);

  await db.monthBudget.upsert({
    where: { month },
    update: { income, note },
    create: { month, income, note },
  });

  revalidateMoney();
}
