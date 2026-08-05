# iamvancuong.com

Trang cá nhân + Life OS.
Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 7 · MySQL

- **Đang ở đâu, làm gì tiếp: [`docs/STATE.md`](docs/STATE.md)** ← đọc trước
- Kế hoạch tổng thể: [`docs/PLAN.md`](docs/PLAN.md)
- Thiết kế Life OS: [`docs/OS-DESIGN.md`](docs/OS-DESIGN.md)

---

## Chạy

Cần **Docker Desktop** đang bật (MySQL chạy trong container, không cài vào máy).

```bash
npm run db:up
npm run dev
```

Lần đầu trên một máy mới:

```bash
cp .env.example .env
npm run db:up
npm run db:push
npm run db:seed
npm run hash-password
```

Lệnh khác:

```bash
npm run build          # kiểm tra trước khi push
npm run lint
npm run db:studio      # xem/sửa database bằng giao diện
npm run db:down        # tắt MySQL (dữ liệu vẫn còn trong volume)
```

### Dữ liệu mẫu

Để xem thử toàn bộ giao diện khi chưa có dữ liệu thật:

```bash
npm run db:demo        # tạo ~67 ngày nhật ký, 11 ký ức, 13 ảnh, 9 việc Focus, 3 bài viết
npm run db:demo:clear  # xóa sạch
```

Mọi bản ghi mẫu đều có dấu **[demo]** nên nhìn là biết. Phần nhật ký không đánh dấu được (không có cột nào để ghi), nên script lưu danh sách ngày vào `prisma/.demo-days.json` — khi xóa nó chỉ đụng đúng những ngày đó, **không xóa ngày bạn tự ghi**.

### ⚠️ Mật khẩu /os

**Không bao giờ ghi mật khẩu vào file này, vào `.env` dưới dạng chữ thường, hay vào bất kỳ chỗ nào git nhìn thấy.** Repo này sẽ public (PLAN §12) — mật khẩu lọt vào một commit là lọt vĩnh viễn, xóa ở commit sau không gỡ được.

Đặt hoặc đổi:

```bash
npm run hash-password
```

Dán kết quả vào `OS_PASSWORD_HASH_B64` trong `.env`, rồi khởi động lại dev server.

Chuỗi băm lưu dạng **base64**, không phải bcrypt thô — vì bộ nạp `.env` của Next.js coi `$2b` `$12` trong chuỗi bcrypt là biến môi trường rồi thay bằng rỗng, kể cả khi bọc nháy đơn.

---

## Hai vùng

| | Công khai | Riêng tư |
|---|---|---|
| URL | `/` `/blog` `/journey` `/photos` `/now` `/projects` `/about` | `/os/*` |
| Ai xem được | Tất cả | Chỉ bạn, sau khi đăng nhập |
| Vào bằng | — | Nút **Life OS** ở header |

Nút Life OS đọc một cookie gợi ý (`vc_owner`, không httpOnly) chỉ để **đổi nhãn** — nhờ vậy trang công khai vẫn được dựng tĩnh. Cookie đó không mang quyền gì; quyền thật nằm ở cookie đã ký mà `middleware.ts` kiểm tra.

---

## Life OS

**Lấy lĩnh vực làm trung tâm.** 7 lĩnh vực × 4 loại nội dung dùng chung:

```
        ┌── Mục tiêu ────┐  điều tôi muốn đạt
LĨNH    ├── Nguyên tắc ──┤  tôi sống thế nào (NÊN / KHÔNG NÊN)
VỰC  ×  ├── Đang dùng ───┤  thứ tôi dùng / đã bỏ / muốn thử
        └── Ký ức ───────┘  chuyện đã xảy ra, kèm ảnh
```

> **Thêm lĩnh vực mới = thêm một dòng trong bảng `Area`. Không sửa dòng code nào.**
> Cả 7 lĩnh vực dùng chung đúng một file: `app/os/a/[slug]/page.tsx`

Ba trang là **cách nhìn xuyên lĩnh vực**, không phải lĩnh vực:

| Trang | Là gì |
|---|---|
| `/os` | Hôm nay: đang tập trung · 3 việc nền tảng · một nguyên tắc ngẫu nhiên · cảnh báo |
| `/os/goals` | «Con người muốn hướng tới» — mọi mục tiêu xếp theo **mốc tuổi** |
| `/os/journey` | «Hành trình» — mọi ký ức theo dòng thời gian |

Ghi một lần ở lĩnh vực, hiện ra ở tất cả những chỗ liên quan.

### Ràng buộc cố ý

- **NOW tối đa 3 việc.** Kiểm tra ở server, không phải ở giao diện — gọi thẳng action cũng không lách được.
- **Chuỗi ngày** xem được ba tầm: 14 ngày (có nhãn thứ) · 3 tháng · 1 năm (lịch nhiệt), kèm thống kê tháng này và năm nay. Ô tô đậm nhạt theo 0–3 việc chứ không phải xong/chưa xong.
- **Dashboard cảnh báo khi IT > 2× tiếng Nhật trong tuần.** Tiếng Nhật là ưu tiên #1, website là #7.
- **Lĩnh vực trống không phải lỗi.** Hiện chữ "chưa có gì — chưa cần thiết", không cảnh báo đỏ.
- **Mục tiêu bỏ được**, có ô ghi lý do. Bỏ đúng lúc là kỹ năng.

---

## Viết blog

Vào **`/os/write`** → **Bài mới**.

### Trình soạn thảo

Thanh công cụ: **đậm** · *nghiêng* · gạch ngang · chữ nhỏ · tiêu đề lớn/nhỏ · danh sách · danh sách đánh số · trích dẫn · đường kẻ · mã trong dòng · khối mã · liên kết · ảnh.

Phím tắt: `Ctrl+B` đậm · `Ctrl+I` nghiêng · `Ctrl+K` liên kết.

Ba chế độ xem: **Soạn** · **Chia đôi** · **Xem trước**. Bản xem trước dùng **đúng hàm render của trang thật** (remark chạy được cả trên trình duyệt), nên không có chuyện xem trước một kiểu, đăng lên một kiểu.

**Chèn ảnh**: bấm nút ảnh, **dán thẳng từ clipboard**, hoặc **kéo file vào ô soạn**. Ảnh tự nén WebP rồi chèn cú pháp `![](...)` tại con trỏ.

Markdown không có cỡ chữ tùy ý — dùng tiêu đề để làm chữ to, nút **chữ nhỏ** chèn thẻ `<small>`.

### Chủ đề

Chủ đề nằm trong **bảng `Tag`**, không hard-code. Tạo chủ đề mới ngay trong trang soạn bài → bộ lọc ngoài `/blog` **tự có thêm mục đó**, không phải sửa code.

Xóa chủ đề không xóa bài — bài chỉ mất nhãn đó.

`日本語` ở hàng bộ lọc **không phải chủ đề**: nó lọc theo việc bài có bản tiếng Nhật hay không.

### Xuất bản

- **Lưu ≠ Xuất bản.** Bài mới luôn riêng tư cho tới khi bạn bấm Xuất bản.
- Bài riêng tư và bài công khai nằm **chung một kho**, khác nhau đúng một trường `visibility`. Đó chính là "blog riêng tôi xem" — không cần hệ thống thứ hai.
- Đăng nhập rồi thì `/blog` hiện cả bài riêng tư (có nhãn). Khách không thấy gì, kể cả gõ thẳng URL → 404.
- `/os/write` liệt kê những ngày bạn đã tick **"đáng viết thành bài"** trong nhật ký — kho ý tưởng sẵn có.

### Song ngữ

Ô **Bản tiếng Nhật** để trống → nút 日本語 không hiện, URL `/blog/<slug>/ja` không tồn tại. Đó là hành vi đúng, không phải lỗi.

Bản tiếng Nhật **không phải bản dịch**: viết lại ngắn hơn (300–500 chữ) bằng đúng trình độ hiện tại. Mục tiêu **1 bài/tháng**.

---

## Ảnh

- **Bấm vào ảnh là xem ngay tại chỗ**, không mở tab mới. Có nút trước/sau, phím ← →, Esc để đóng, vuốt ngang trên điện thoại.
  - Trong ký ức: lướt trong phạm vi ký ức đó.
  - Ở trang `/photos`: lướt xuyên suốt cả thư viện, không dừng ở ranh giới tháng.
- Kéo vào là xong. Tự nén **WebP**, thu về tối đa 2000px, kèm thumbnail 480px.
- Tự xoay theo EXIF và đọc ngày chụp từ EXIF.
- File ở `uploads/YYYY/MM/`, tên ngẫu nhiên. **Database chỉ giữ đường dẫn.**
- Xóa ký ức thì file ảnh bị xóa theo.
- Ảnh **đi theo quyền của ký ức chứa nó**, đổi trong cùng một transaction — tránh cảnh ký ức riêng tư mà ảnh vẫn xem được.
- `/api/uploads/*` kiểm tra quyền từng ảnh và chặn leo thư mục (`../`).

---

## Cạm bẫy đã gặp — đọc trước khi sửa

**Ngày tháng.** Mọi cột `@db.Date` lưu ở **nửa đêm UTC**. Dựng `Date` phải có hậu tố `Z` (`dayUTC()` trong `lib/os/day.ts`), đọc ra dùng `getUTC*`. Thiếu chữ `Z` là lệch một ngày ngay, vì JST là UTC+9.

**Server Action không được middleware bảo vệ.** Nó là endpoint thật. Mọi hàm trong `lib/os/*Actions.ts` gọi `assertOwner()` ở dòng đầu. Viết action mới thì đừng quên.

**File `"use server"` chỉ được export hàm async.** Hằng số phải để chỗ khác — xem `lib/os/constants.ts`.

**`/os` phải render động.** Dashboard phụ thuộc "hôm nay" và xoay nguyên tắc theo ngày; nếu dựng tĩnh sẽ đóng băng ở thời điểm build.

---

## Cấu trúc

```
app/
├── layout.tsx            Header + Footer + font + metadata gốc
├── globals.css           ⭐ TOÀN BỘ design token nằm ở đây
├── fonts.ts              Inter (Việt) + Noto Sans JP (Nhật)
├── page.tsx  now/  about/  projects/
├── blog/                 Danh sách + [slug] + [slug]/ja
├── journey/  photos/     Bản công khai (chỉ nội dung đã tick)
├── login/
├── os/                   🔒 Life OS — noindex, force-dynamic
│   ├── page.tsx          Hôm nay
│   ├── a/[slug]/         MỘT file cho cả 7 lĩnh vực
│   ├── goals/  journey/  Cách nhìn xuyên lĩnh vực
│   ├── focus/  log/      NOW/NEXT/LATER/NO · nhật ký ngày
│   ├── write/            Soạn bài, xuất bản
│   └── data/             Thống kê + tải backup
└── api/
    ├── auth/             login · logout
    ├── uploads/[...path] Phục vụ ảnh, kiểm tra quyền
    └── backup/           Xuất JSON toàn bộ

components/
├── layout/   Container · Header · Footer · OsLink
├── ui/       Badge · SectionHeading
├── blog/     PostCard · PostView · LanguageToggle
└── os/       AreaTabs · GoalsTab · PrinciplesTab · ItemsTab
            MemoryForm · MemoryList · DailyLogForm · TodayPanel

lib/
├── site.ts       ⭐ Tên, ngày sinh, domain, nav — sửa ở đây
├── db.ts         Prisma client (adapter mariadb)
├── auth.ts       Ký/xác minh cookie · giải mã hash base64
├── session.ts    isOwner() dùng trong Server Component
├── posts.ts      Bài viết, lọc theo quyền
├── markdown.ts   Markdown → HTML
└── os/
    ├── constants.ts   MAX_NOW
    ├── day.ts         Ngày tháng UTC — đọc kỹ phần cạm bẫy
    ├── age.ts         Tuổi và mốc mục tiêu, suy từ ngày sinh
    ├── stats.ts       Mọi con số trên dashboard
    ├── actions.ts     Mục tiêu · nguyên tắc · đồ dùng · ký ức
    ├── dayActions.ts  Focus · nhật ký ngày
    ├── postActions.ts Bài viết
    └── upload.ts      Nén ảnh, lưu đĩa

prisma/schema.prisma   ⭐ Schema
content/               now.md · about.md
docs/                  PLAN.md · OS-DESIGN.md
```

**Đổi màu, cỡ chữ, khoảng cách → sửa `app/globals.css`.** Không rải giá trị lẻ trong từng page.

---

## Sao lưu

`/os/data` → **Tải JSON toàn bộ**.

Ảnh không nằm trong file JSON — copy cả thư mục `uploads/` sang OneDrive.

Sao lưu ở mức database:

```bash
docker exec vancuong_mysql mysqldump -ucuong -pdevpass iamvancuong > backup.sql
```

---

## Riêng tư

Repo **public**, nhưng dữ liệu thì không:

- `.env` · `uploads/` · `backup/` đều bị `.gitignore` chặn
- Dữ liệu Life OS nằm trong MySQL, không bao giờ vào git
- `/os` bị chặn khỏi Google bằng `robots.ts` + `noindex`
- Sitemap chỉ liệt kê bài đã công khai

---

## Việc cần làm trước khi deploy

- [ ] Đổi mật khẩu `/os`
- [ ] Điền `lib/site.ts`: email, GitHub, Instagram
- [ ] Đọc lại 3 bài trong `/os/write`, sửa cho đúng giọng mình rồi xuất bản
- [ ] Kiểm tra `content/now.md` đúng 3 việc đang tập trung
- [ ] Đẩy lên GitHub, dựng MySQL trên hosting, đổi `DATABASE_URL`
