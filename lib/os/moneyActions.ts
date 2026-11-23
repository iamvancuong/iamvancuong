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

// Thu nhập KHÔNG còn nhập tay: trang Tiền đọc thẳng tiền baito
// (`payByMonth` ở baito.ts). Bảng `MonthBudget` cố ý giữ lại, không xóa — dữ
// liệu cũ còn nằm đó, chỉ là không còn được đọc.
