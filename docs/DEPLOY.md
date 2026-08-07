# DEPLOY.md — triển khai & cập nhật iamvancuong.com

> Sổ tay thao tác. Mở file này khi cần deploy hoặc quên cách làm.
> Cập nhật 07/08/2026 — lần deploy đầu tiên (đã lên sóng).

---

## 0. Nếu chỉ đọc 5 dòng

1. **Đổi nội dung** (bài viết, ký ức, ảnh, số đo…) → **KHÔNG deploy gì**, làm thẳng trên `/os`, hiện ngay.
2. **Đổi code** → phải **build ở máy local** rồi đẩy lên (server **không** build được — xem §4).
3. Quy trình đổi code: **máy local** `npm run build` → `git push` · **server** `bash deploy.sh`.
4. ⚠️ **Luôn `npm run build` TRƯỚC khi commit.** Quên là server chạy code cũ dù source đã mới.
5. Trên server dùng `bash deploy.sh`, **đừng** chỉ `git pull` (thiếu vá quyền + restart).

---

## 1. Đang chạy ở đâu

| | |
|---|---|
| Domain | `iamvancuong.com` (mua ở PA Vietnam, nameserver trỏ về AZDIGI) |
| Hosting | AZDIGI shared hosting (cPanel · LiteSpeed · CloudLinux · Passenger) |
| Node | 22 (venv: `/home/ujxmchhx/nodevenv/iamvancuong/22/`) |
| Thư mục code | `/home/ujxmchhx/iamvancuong/` (Application root) |
| Docroot domain | `/home/ujxmchhx/iamvancuong.com/` (cPanel tự tạo, chứa `.htaccess` Passenger) |
| Startup file | `server.js` (custom server cho Passenger) |
| Database | MySQL cPanel · DB `ujxmchhx_iamvancuong` · user `ujxmchhx_ujxmchhx` |
| Ảnh upload | `/home/ujxmchhx/iamvancuong/uploads/` (không vào git) |
| GitHub | `github.com/iamvancuong/iamvancuong` (public) |

---

## 2. Cập nhật khi ĐỔI CODE

**Ở máy bạn** (`C:\Cuong\iamvancuong`) — đúng thứ tự:

```bash
npm run build
git add -A && git commit -m "mô tả thay đổi"
git push
```

**Trên server** (cPanel → Terminal) — 1 lệnh:

```bash
cd /home/ujxmchhx/iamvancuong && bash deploy.sh
```

`deploy.sh` tự làm: `git pull` → vá quyền `.next` → `touch tmp/restart.txt` (restart).
Chờ vài giây rồi tải lại web.

> **Vì sao build trước push?** Server không build được (§4), nên bản `.next` được
> build ở máy bạn và **commit thẳng vào git**. Không build lại = đẩy `.next` cũ.

---

## 3. Cập nhật khi ĐỔI NỘI DUNG

Không làm gì ở đây cả. Vào `https://iamvancuong.com/os`, viết/sửa trực tiếp.
Bài publish, ký ức tick công khai, ảnh… hiện ra ngay, **không cần build/deploy**.

---

## 4. Vì sao set up kiểu này (đừng "sửa cho gọn" kẻo hỏng)

- **Server KHÔNG build được.** Next 16 dùng SWC cần `GLIBC ≥ 2.29`, mà CloudLinux
  của hosting chỉ có `2.28`. `npm run build` trên server sẽ fail. → Bắt buộc build
  ở máy local (glibc mới) rồi mang `.next` lên. Nâng gói hosting **không** đổi được
  glibc. Muốn build-trên-server thì phải VPS — nhưng không cần thiết.
- **Build bằng webpack, KHÔNG Turbopack.** `package.json` để `next build --webpack`.
  Turbopack tạo symlink Windows tuyệt đối cho external `@prisma/client`, nén qua
  Windows là mất → lên Linux lỗi `Cannot find module @prisma/client-<hash>`.
- **`.next` được commit vào git** (xem `.gitignore` + `.gitattributes`). Đó là cách
  mang bản build lên server qua `git pull`. `.gitattributes` giữ `.next` byte-nguyên
  vẹn (không đổi line-ending làm hỏng font/manifest).
- **Prisma 7 dùng WASM query compiler** (không cần engine native) → `node_modules`
  chạy được trên Linux dù cài ở đâu. Chỉ `sharp` là native, cài ngay trên server.
- **Custom `server.js`** để Passenger chạy trực tiếp, không cần Docker, không đụng
  các script `predev/prestart` (vốn gọi Docker).

---

## 5. Biến môi trường (đặt ở cPanel → Setup Node.js App → Environment variables)

Không nằm trong git. 4 biến (`NODE_ENV=production` do Application mode tự set):

| Biến | Giá trị |
|---|---|
| `DATABASE_URL` | `mysql://ujxmchhx_ujxmchhx:<mật_khẩu_%40>@localhost:3306/ujxmchhx_iamvancuong` |
| `AUTH_SECRET` | chuỗi hex ngẫu nhiên (ký cookie) |
| `OS_PASSWORD_HASH_B64` | hash bcrypt base64 của mật khẩu `/os` (tạo bằng `npm run hash-password`) |
| `UPLOAD_DIR` | `/home/ujxmchhx/iamvancuong/uploads` |

> Mật khẩu DB có ký tự `@` → mã hóa thành `%40` trong URL cho chắc.
> Đổi biến ở đây rồi phải **Restart** app.

---

## 6. Sự cố thường gặp (đã vấp — cách xử)

| Triệu chứng | Nguyên nhân & cách xử |
|---|---|
| `npm install` báo "error during installation of modules" | Thường là `postinstall: prisma generate` chạy nhầm cwd (venv). Vào Terminal, `cd` vào thư mục app rồi chạy tay `npx prisma generate`. |
| App 503, log `EACCES: permission denied` ở `.next/...` | File giải nén thiếu quyền. Vá bằng: `find .next -type d -exec chmod 755 {} \;` rồi `find .next -type f -exec chmod 644 {} \;` (**dùng `\;`, không phải `+`** — để cha được sửa trước con). |
| `git reset/pull` báo `Permission denied` tạo thư mục | Thư mục source thiếu quyền ghi. `find . -type d -not -path './node_modules/*' -not -path './.git/*' -exec chmod 755 {} \;` rồi tương tự cho file 644. |
| Log `Failed to load external module @prisma/client-<hash>` | Build bằng Turbopack. Build lại bằng `npm run build` (đã để `--webpack`), push, `deploy.sh`. |
| Cảnh báo `@next/swc... GLIBC_2.29 not found` | **Vô hại** — chỉ là warning, Next tự bỏ qua khi *chạy* app đã build sẵn. Không cần xử. |
| Trang chủ OK nhưng mọi trang khác 404 (test bằng `curl 127.0.0.1`) | Ảo — `curl 127.0.0.1 + Host header` không kích hoạt đúng Passenger. **Test bằng domain thật** trên trình duyệt. |
| Vào web được nhưng **login không lưu** (quay lại trang login) | Cookie có cờ `Secure` (vì production) → chỉ hoạt động trên **HTTPS**. Bật SSL: cPanel → SSL/TLS Status → Run AutoSSL cho domain. |

---

## 7. Dựng lại từ đầu (nếu mất server / chuyển hosting)

1. **DB**: cPanel → MySQL Databases: tạo DB + user + gán ALL. phpMyAdmin → Import
   `scripts/deploy-db.sql` (15 bảng + 7 lĩnh vực).
2. **Domain**: PA Vietnam trỏ nameserver → AZDIGI. cPanel → Domains → thêm domain.
3. **Node app**: Setup Node.js App → Node ≥ 20 · Production · root `iamvancuong` ·
   URL = domain · startup `server.js`. Nhập 4 env vars (§5). Tạo thư mục `uploads`.
4. **Code**: Terminal:
   ```bash
   cd /home/ujxmchhx/iamvancuong
   git init -b main
   git remote add origin https://github.com/iamvancuong/iamvancuong.git
   git fetch origin && git reset --hard origin/main
   git branch --set-upstream-to=origin/main main
   ```
   (Nếu `reset` báo Permission denied → vá quyền như §6 rồi chạy lại.)
5. **Cài deps**: Setup Node.js App → **Run NPM Install** (postinstall tự `prisma generate`).
   Hoặc Terminal: `source /home/ujxmchhx/nodevenv/iamvancuong/<ver>/bin/activate && npm install`.
6. **SSL**: cPanel → SSL/TLS Status → Run AutoSSL. Bật Force HTTPS Redirect.
7. `bash deploy.sh` → xong.
