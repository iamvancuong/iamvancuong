import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  SESSION_COOKIE,
  cookieOptions,
  createSession,
  getPasswordHash,
  OWNER_HINT_COOKIE,
} from "@/lib/auth";

/** Chạy trên Node vì bcrypt không chạy được trên Edge. */
export const runtime = "nodejs";

/**
 * Chặn dò mật khẩu — đếm trong bộ nhớ tiến trình.
 *
 * Không cần Redis cho một site một người dùng, và mất sạch khi khởi động lại
 * cũng không sao. Có mặt vì hai lý do: chặn dò mật khẩu, và chặn người lạ đốt
 * CPU — mỗi lần `bcrypt.compare` ở cost 12 tốn ~250ms, gọi liên tục là đủ làm
 * nghẽn cả server.
 *
 * Đếm HAI tầng, vì mỗi tầng bịt lỗ của tầng kia:
 *
 * - **Theo IP** cho phản hồi đúng người: gõ nhầm ở nhà thì chỉ mình mình bị
 *   chặn. Nhưng IP đọc từ `x-forwarded-for`, mà header đó do client gửi — sau
 *   một proxy không ghi đè nó thì đổi header là có bộ đếm mới, tức là bỏ qua
 *   được hoàn toàn.
 * - **Tổng cộng** để bịt đúng chỗ đó. Ở đây chỉ có MỘT người dùng hợp lệ, nên
 *   một trần tổng nới tay là hoàn toàn hợp lý và không giả mạo được. Đặt cao
 *   hơn trần theo IP để một kẻ lạ không khóa được cửa của chủ nhà quá dễ.
 */
const PER_IP = { max: 8, windowMs: 10 * 60 * 1000 };
const GLOBAL = { max: 30, windowMs: 10 * 60 * 1000 };

type Bucket = { n: number; until: number };

const perIp = new Map<string, Bucket>();
let global: Bucket = { n: 0, until: 0 };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

/** Còn lượt không? Cửa sổ đã qua thì bộ đếm tự về 0. */
function blocked(b: Bucket | undefined, max: number, now: number): boolean {
  return b != null && b.until > now && b.n >= max;
}

function bump(b: Bucket | undefined, now: number, windowMs: number): Bucket {
  const fresh = b == null || b.until <= now;
  return { n: fresh ? 1 : b.n + 1, until: now + windowMs };
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();

  const hit = blocked(perIp.get(ip), PER_IP.max, now)
    ? perIp.get(ip)!
    : blocked(global, GLOBAL.max, now)
      ? global
      : null;

  if (hit) {
    const mins = Math.max(1, Math.ceil((hit.until - now) / 60_000));
    return NextResponse.json(
      { error: `Sai quá nhiều lần. Thử lại sau ${mins} phút.` },
      { status: 429 },
    );
  }

  // Dọn bản ghi hết hạn để Map không phình mãi
  for (const [k, v] of perIp) if (v.until <= now) perIp.delete(k);

  const { password } = (await req.json()) as { password?: string };
  const hash = getPasswordHash();

  if (!hash) {
    return NextResponse.json(
      {
        error:
          "Chưa đặt OS_PASSWORD_HASH_B64 trong .env. Chạy: npm run hash-password",
      },
      { status: 500 },
    );
  }

  // So sánh bằng bcrypt — thời gian chạy không phụ thuộc nội dung, nên
  // không lộ thông tin qua việc đo thời gian phản hồi.
  if (!password || !(await bcrypt.compare(password, hash))) {
    perIp.set(ip, bump(perIp.get(ip), now, PER_IP.windowMs));
    global = bump(global, now, GLOBAL.windowMs);

    // Chậm lại một nhịp để làm nản việc thử mật khẩu hàng loạt.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Sai mật khẩu." }, { status: 401 });
  }

  // Vào được rồi thì xóa cả hai bộ đếm — không để lần gõ nhầm lúc nãy còn
  // treo lơ lửng và chặn lần đăng nhập sau.
  perIp.delete(ip);
  global = { n: 0, until: 0 };

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(), cookieOptions);

  // Cookie phụ chỉ để giao diện biết mà đổi nhãn nút. KHÔNG httpOnly nên
  // JavaScript đọc được — nhờ vậy Header vẫn là trang tĩnh, cả site không
  // phải render động chỉ vì một cái nút. Không có giá trị bảo mật nào:
  // quyền thật nằm ở cookie đã ký ở trên.
  res.cookies.set(OWNER_HINT_COOKIE, "1", {
    ...cookieOptions,
    httpOnly: false,
  });

  return res;
}
