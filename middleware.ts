import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/**
 * Chặn toàn bộ /os. Middleware chạy trước khi bất kỳ trang nào được render,
 * nên không lọt qua được bằng cách gõ thẳng URL.
 *
 * Trang đăng nhập đặt ở /login (ngoài /os) để không dính layout sidebar của
 * Life OS, và cũng khỏi phải chừa ngoại lệ ở đây.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  // Nhớ nơi định đến để đăng nhập xong quay lại đúng chỗ.
  url.search =
    pathname === "/os" ? "" : `?from=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/os/:path*"],
};
