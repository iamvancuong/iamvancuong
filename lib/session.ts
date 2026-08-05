import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

/**
 * Dùng trong Server Component để biết đã đăng nhập chưa.
 *
 * Quan trọng với phần công khai: nội dung `PRIVATE` chỉ hiện khi hàm này
 * trả về true. Nhờ vậy blog riêng tư và blog công khai dùng chung một kho,
 * khác nhau đúng một trường trong database.
 */
export async function isOwner(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
