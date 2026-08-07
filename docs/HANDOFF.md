# HANDOFF.md — bàn giao giữa các phiên chat

> Đọc file này + `docs/DEPLOY.md` + `docs/STATE.md` để tiếp nối. Cập nhật 07/08/2026.

## A. Trạng thái tổng thể

- **Đã deploy production**: `https://iamvancuong.com` (cPanel AZDIGI · LiteSpeed · CloudLinux · Passenger · Node 20/22 · MySQL cPanel). SSL bật. Chi tiết + cách update ở **`docs/DEPLOY.md`**.
- **Quy trình deploy**: server KHÔNG build được (glibc 2.28 < Next 16 cần 2.29). Nên: **máy local `npm run build` (đã cấu hình `--webpack`) → commit (kể cả `.next`) → `git push`**; trên server **`bash deploy.sh`** (git pull + vá quyền + restart). `.next` được commit vào git (xem `.gitignore`/`.gitattributes`).

## B. Việc phiên này đã làm — REDESIGN TRANG CHỦ `/`

⚠️ **Toàn bộ đang ở local, CHƯA commit / CHƯA build lại / CHƯA deploy.**

Trang chủ `/` giờ là trang giới thiệu song ngữ (nút chuyển **Tiếng Việt ⇄ 日本語**, không hiện lẫn lộn), full-height mỗi mục, cuộn mượt + hiệu ứng trượt-lên.

Các mục: **Hero** (avatar tròn, tên — JP là katakana `トゥオン・ヴァン・クオン`, tagline, logo social click được: GitHub/LinkedIn/Instagram/YouTube/TikTok) → **Về tôi** (slogan "Ban ngày tiếng Nhật, ban đêm code." + 3 facts, KHÔNG có mục tiêu + Kỹ năng: Laravel/PHP/Angular/Next.js/React/TS/MySQL/Tailwind/Node/REST/Git) → **Chuỗi** (3 số streak: nhật ký/tiếng Nhật/IT + ô nhiệt "Nhịp mỗi ngày" như /os) → **Chặng đường ở Nhật** (timeline bắt đầu 2021, nối bằng đường nét-đứt uốn lượn có mũi tên) → **Liên hệ** (FORM lưu DB) → dải link.

### File đã tạo/sửa (chưa commit)
- `app/page.tsx` — async, `force-dynamic`, fetch streaks → `<Intro streaks>`
- `components/home/Intro.tsx` — toàn bộ trang (client, state ngôn ngữ)
- `components/home/{Frame,BrandIcon,Journey,ContactForm}.tsx` — mới
- `components/Reveal.tsx` — thêm `stagger`
- `lib/home.ts` — copy song ngữ + skills + streaks + journey + form (nội dung timeline/slogan là NHÁP, sửa được)
- `lib/streaks.ts` — mới: đọc DailyLog → 3 streak + heatmap
- `lib/os/stats.ts` — thêm `streakOf()`
- `app/api/contact/route.ts` — mới: nhận form, chặn spam, lưu `ContactMessage`
- `prisma/schema.prisma` — thêm model **`ContactMessage`** (đã `db push` ở LOCAL)
- `app/globals.css` — motion (fade-up, reveal, reveal-stagger, fade-down, nav-link, scroll mượt)
- `components/layout/Header.tsx` — sticky, frosted, nav center, gạch chân động
- `lib/site.ts` — tagline "Du học sinh…", thêm `tiktok`, nav "Now"→"Dạo này"
- `components/layout/Footer.tsx` — "Now"→"Dạo này"

## C. CẦN LÀM TIẾP

1. **Duyệt giao diện** trên `http://localhost:3000` (dev server đang chạy). Tinh chỉnh theo ý.
2. **Ảnh thật**: bỏ vào `public/images/`, điền `src` trong `lib/home.ts` (`images.hero` + mỗi `journey.milestones[].src`). Ảnh sẽ công khai.
3. **Rà tiếng Nhật** trong `lib/home.ts` (bản AI nháp).
4. **TikTok URL** trong `lib/site.ts` đang đoán `@iamvancuong` — kiểm lại.
5. **DEPLOY bản mới** (khi ưng): `npm run build` → commit → push → `bash deploy.sh`. **Kèm 2 bước cho bảng mới:**
   - Tạo bảng `ContactMessage` trên DB production (xuất SQL từ schema → import phpMyAdmin).
   - Regenerate Prisma client trên server (Run NPM Install lại / `npx prisma generate` trong cPanel Terminal), nếu không `/api/contact` lỗi "unknown model".
6. **(Tùy chọn)** Trang đọc tin liên hệ trong `/os` (hộp thư) — hiện tin nhắn lưu DB, đọc qua Prisma Studio.

## D. Gotchas
- Sửa `prisma/schema.prisma` → phải `prisma db push` + **restart dev server** (Turbopack giữ client cũ — STATE §7.2).
- Streak hiện `0` là đúng (DB chưa có ngày ghi đủ điều kiện).
- Định nghĩa streak ở `lib/streaks.ts`: nhật ký = có chữ nhật ký · tiếng Nhật = `jpMin>0` · IT = `itMin>0`.
- Font: chỉ chữ Nhật gắn `lang="ja"` (Noto); chữ Việt/Latin dùng Inter — giữ vậy để đồng bộ.
