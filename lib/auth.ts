import { SignJWT, jwtVerify } from "jose";

/**
 * Đăng nhập cho MỘT người dùng duy nhất.
 *
 * Không dùng Auth.js / OAuth vì chỉ có một tài khoản: một mật khẩu, lưu dạng
 * băm trong biến môi trường, đổi lấy một cookie httpOnly có chữ ký.
 *
 * Việc kiểm tra mật khẩu (bcrypt) nằm ở route handler chạy trên Node.
 * Middleware chỉ xác minh chữ ký cookie — jose chạy được trên Edge, bcrypt thì không.
 */

export const SESSION_COOKIE = "vc_session";

/**
 * Cookie phụ, KHÔNG httpOnly, chỉ để giao diện đổi nhãn nút "Life OS".
 * Không mang quyền gì — sửa tay trong trình duyệt cũng chẳng vào được đâu,
 * vì middleware chỉ tin cookie đã ký ở trên.
 *
 * Có nó thì Header vẫn là component tĩnh, cả site không phải render động
 * chỉ vì một cái nút.
 */
export const OWNER_HINT_COOKIE = "vc_owner";

const MAX_AGE_DAYS = 30;

/**
 * Chuỗi băm bcrypt được lưu dưới dạng base64.
 *
 * Lý do: bcrypt sinh ra chuỗi kiểu `$2b$12$...`, mà bộ nạp .env của Next.js
 * coi `$2b` `$12` là tên biến môi trường rồi thay bằng chuỗi rỗng — kể cả khi
 * đã bọc nháy đơn. Base64 không có ký tự `$` nên tránh hẳn được chuyện đó.
 */
export function getPasswordHash(): string | null {
  const b64 = process.env.OS_PASSWORD_HASH_B64;
  if (!b64) return null;
  const hash = Buffer.from(b64, "base64").toString("utf8");
  return hash.startsWith("$2") ? hash : null;
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Thiếu AUTH_SECRET trong .env");
  return new TextEncoder().encode(s);
}

export async function createSession(): Promise<string> {
  return new SignJWT({ sub: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_DAYS}d`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    // Kiểm cả `sub`, không chỉ chữ ký: nếu sau này AUTH_SECRET bị dùng lại để
    // ký thứ khác (link một lần, token xem trước…), thì token đó cũng hợp lệ
    // về chữ ký và sẽ mở được /os nếu ở đây chỉ kiểm mỗi chữ ký.
    return payload.sub === "owner";
  } catch {
    return false;
  }
}

export const cookieOptions = {
  httpOnly: true, // JavaScript trong trang không đọc được → chống XSS lấy cookie
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
};
