"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { num, str } from "./formData";

/**
 * Baito. MỌI hàm ở đây phải tự kiểm đăng nhập — Server Action là endpoint
 * thật, middleware không chặn nó.
 *
 * Nhập duy nhất qua ô lịch: một ngày × một việc = tối đa một ca.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

function revalidateBaito() {
  revalidatePath("/os/baito");
}

/**
 * Đặt số giờ của MỘT việc trong MỘT ngày. 0 = xóa.
 *
 * Lương giờ được chụp lại vào ca mỗi lần lưu, nên tăng lương ở bảng việc chỉ
 * ảnh hưởng ca nhập/sửa từ đó trở đi.
 */
export async function setDayHours(
  iso: string,
  jobId: string,
  hours: number,
): Promise<{ ok: boolean; error?: string }> {
  await assertOwner();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { ok: false, error: "Ngày sai." };
  const date = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) {
    return { ok: false, error: "Ngày sai." };
  }
  if (!Number.isFinite(hours) || hours < 0) return { ok: false, error: "Số giờ sai." };
  const minutes = Math.round(Math.min(24, hours) * 60);

  const job = await db.baitoJob.findUnique({ where: { id: jobId } });
  if (!job) return { ok: false, error: "Không thấy việc này." };

  const existing = await db.workShift.findMany({ where: { date, jobId } });
  if (existing.length > 1) {
    return { ok: false, error: "Ngày này có nhiều ca cùng việc — không sửa trong ô được." };
  }

  // Ca nhập trước khi có bảng việc (jobId NULL) không còn chỗ nào sửa được,
  // nên lưu ô của ngày đó là GỘP chúng vào việc đang chọn. Ô lịch đã cộng sẵn
  // giờ của chúng vào số hiện ra để sửa, nên không mất giờ nào trong im lặng.
  await db.workShift.deleteMany({ where: { date, jobId: null } });

  const cur = existing[0];
  if (minutes === 0) {
    if (cur) await db.workShift.delete({ where: { id: cur.id } });
  } else if (!cur) {
    await db.workShift.create({ data: { date, minutes, jobId, rate: job.rate } });
  } else {
    await db.workShift.update({
      where: { id: cur.id },
      data: { minutes, rate: job.rate, start: null, end: null, breakMin: 0 },
    });
  }

  revalidateBaito();
  return { ok: true };
}

/** Sửa tên + lương giờ của một việc. Không đổi tiền các ca đã lưu. */
export async function updateJob(id: string, fd: FormData) {
  await assertOwner();
  const name = str(fd, "name", 60);
  const rate = num(fd, "rate", { min: 0, max: 100_000 });
  if (!name || rate == null) return;
  await db.baitoJob.update({ where: { id }, data: { name, rate } });
  revalidateBaito();
}
