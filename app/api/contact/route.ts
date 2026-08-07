import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** bcrypt/Prisma → Node runtime. */
export const runtime = "nodejs";

/**
 * Nhận tin nhắn từ form liên hệ công khai, LƯU vào DB (chưa gửi mail).
 * Chặn spam bằng bộ đếm trong bộ nhớ — cùng ý tưởng với /api/auth/login:
 * theo IP + tổng, mất khi khởi động lại cũng không sao.
 */
const PER_IP = { max: 3, windowMs: 60 * 60 * 1000 }; // 3 tin / giờ / IP
const GLOBAL = { max: 60, windowMs: 60 * 60 * 1000 };

type Bucket = { n: number; until: number };
const perIp = new Map<string, Bucket>();
let globalBucket: Bucket = { n: 0, until: 0 };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

function blocked(b: Bucket | undefined, max: number, now: number): boolean {
  return b != null && b.until > now && b.n >= max;
}

function bump(b: Bucket | undefined, now: number, windowMs: number): Bucket {
  const fresh = b == null || b.until <= now;
  return { n: fresh ? 1 : b.n + 1, until: now + windowMs };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();

  if (blocked(perIp.get(ip), PER_IP.max, now) || blocked(globalBucket, GLOBAL.max, now)) {
    return NextResponse.json(
      { error: "Bạn gửi hơi nhiều rồi, thử lại sau một lát nhé." },
      { status: 429 },
    );
  }
  for (const [k, v] of perIp) if (v.until <= now) perIp.delete(k);

  let body: { name?: string; email?: string; message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 100);
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  // Chỉ LỜI NHẮN bắt buộc. Tên bỏ trống cũng được. Email không bắt buộc, nhưng
  // nếu có nhập thì phải đúng định dạng (để còn trả lời được).
  if (message.length < 1 || message.length > 4000)
    return NextResponse.json({ error: "Vui lòng nhập lời nhắn." }, { status: 400 });
  if (email && (!EMAIL_RE.test(email) || email.length > 200))
    return NextResponse.json({ error: "Email chưa hợp lệ." }, { status: 400 });

  perIp.set(ip, bump(perIp.get(ip), now, PER_IP.windowMs));
  globalBucket = bump(globalBucket, now, GLOBAL.windowMs);

  await db.contactMessage.create({ data: { name, email, message, ip } });

  return NextResponse.json({ ok: true });
}
