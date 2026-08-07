"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";

/**
 * Tin nhắn từ form liên hệ công khai (/api/contact ghi vào).
 * MỌI hàm tự kiểm đăng nhập — Server Action là endpoint thật, middleware không chặn.
 */
async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

export async function toggleContactRead(fd: FormData) {
  await assertOwner();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await db.contactMessage.update({
    where: { id },
    data: { read: fd.get("read") === "1" },
  });
  revalidatePath("/os/inbox");
}

export async function deleteContactMessage(fd: FormData) {
  await assertOwner();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await db.contactMessage.delete({ where: { id } });
  revalidatePath("/os/inbox");
}
