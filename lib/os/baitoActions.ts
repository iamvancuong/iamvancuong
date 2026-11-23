"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { parseHM, shiftMinutes } from "./baito";
import { dateISO, num, str, text } from "./formData";

/**
 * Ca baito. MỌI hàm ở đây phải tự kiểm đăng nhập — Server Action là endpoint
 * thật, middleware không chặn nó.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

/**
 * Hai cách nhập: giờ bắt đầu–kết thúc (+ nghỉ), HOẶC thẳng số giờ.
 * Có đủ bắt đầu + kết thúc thì tính từ đó; không thì đọc ô «số giờ».
 * Trần 24h/ca: gõ «45» thay vì «4.5» thì bị kẹp, không làm hỏng cả tuần.
 */
function shiftFields(fd: FormData) {
  const date = dateISO(fd, "date");
  const start = str(fd, "start", 5);
  const end = str(fd, "end", 5);
  const breakMin = num(fd, "breakMin", { min: 0, max: 600 }) ?? 0;

  let minutes: number | null = null;
  let s: string | null = null;
  let e: string | null = null;
  if (parseHM(start) != null && parseHM(end) != null) {
    minutes = shiftMinutes(start!, end!, breakMin);
    s = start;
    e = end;
  } else {
    const raw = str(fd, "hours", 10);
    const h = raw == null ? NaN : Number(raw.replace(",", "."));
    if (Number.isFinite(h) && h > 0) minutes = Math.round(Math.min(24, h) * 60);
  }
  if (minutes != null) minutes = Math.min(24 * 60, minutes);

  return {
    date,
    start: s,
    end: e,
    breakMin: s ? breakMin : 0,
    minutes,
    place: str(fd, "place", 80),
    note: text(fd, "note", 500),
  };
}

function revalidateBaito() {
  revalidatePath("/os/baito");
}

export async function createShift(fd: FormData) {
  await assertOwner();
  const f = shiftFields(fd);
  if (!f.date || f.minutes == null || f.minutes <= 0) return;
  await db.workShift.create({ data: { ...f, date: f.date, minutes: f.minutes } });
  revalidateBaito();
}

export async function updateShift(id: string, fd: FormData) {
  await assertOwner();
  const f = shiftFields(fd);
  if (!f.date || f.minutes == null || f.minutes <= 0) return;
  await db.workShift.update({
    where: { id },
    data: { ...f, date: f.date, minutes: f.minutes },
  });
  revalidateBaito();
}

export async function deleteShift(id: string) {
  await assertOwner();
  await db.workShift.delete({ where: { id } });
  revalidateBaito();
}
