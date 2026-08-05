# PLAN.md — iamvancuong.com

> Personal Website + Life OS
> Cập nhật: 2026-08-04
>
> **Trạng thái hiện tại nằm ở [`STATE.md`](STATE.md)** — đó mới là nơi cập nhật việc đã làm / còn lại.
> File này giữ phần *lý do* đằng sau các quyết định.
> Phần còn lại của tài liệu là lý do đằng sau các quyết định; nơi nào thực tế đã đi khác kế hoạch, tôi ghi chú ngay tại chỗ.
>
> Thiết kế Life OS đã được viết lại theo hướng lấy lĩnh vực làm trung tâm — xem [`OS-DESIGN.md`](OS-DESIGN.md).

---

## 0. Tư duy cốt lõi

Website này **không phải mục tiêu cuối cùng**.

Mục tiêu thật:
> N3 → N2 → giao tiếp tốt → làm IT ở Nhật → kiếm tiền → khỏe mạnh → sống có định hướng.

Website là hệ thống hỗ trợ cuộc sống + nơi lưu hành trình + nền tảng thương hiệu cá nhân.

Vòng lặp chính:

```
Live → Track → Reflect → Learn → Build → Write → Share → Improve → Live better
```

---

## 1. Thứ tự ưu tiên tuyệt đối — đọc lại mỗi khi phân vân

```
1. Tiếng Nhật
2. Trường học
3. Việc / Tiền
4. Ngủ / Cơ thể
5. Career / IT
6. Life OS
7. Public website
8. Extra features
```

**Ngân sách cứng cho website: tối đa 6 giờ/tuần.**

Nếu một tuần: `Web 10h / Japanese 2h` → đó là **system failure**, không phải thành tích.
Dashboard phải phát hiện và cảnh báo điều này (§9, Dashboard).

> ⚠️ **Quan trọng — đừng để việc xây công cụ chặn việc hình thành thói quen.**
> Câu này viết khi `/os` chưa có. **Giờ nó đã xong** — nên câu đúng lúc này là: bắt đầu ghi ngay tối nay, ở `/os/log`. Vẫn cùng một ý: nếu không duy trì nổi 3 tuần thì công cụ đẹp đến đâu cũng vô nghĩa.

---

## 2. Kiến trúc

Một codebase, hai vùng tư duy và dữ liệu tách biệt.

**PUBLIC — `iamvancuong.com`** *(đã dựng xong)*
Home · Now · Blog · Journey · Photos · Projects · About

> «Japan Log» trong bản đầu đã gộp vào `/journey` — hai timeline song song sẽ khiến bạn phải nhập hai lần.

**PRIVATE — `iamvancuong.com/os`** *(đã dựng xong)*
Hôm nay · Muốn hướng tới · Hành trình · Focus · Nhật ký · Viết · Dữ liệu
\+ 7 lĩnh vực: Tiếng Nhật · Công việc · Bản thân · Tình yêu · Gia đình · Tiền · Sức khỏe

> Danh sách module trong bản đầu (Japanese, Career, Money, Body, Experience, Knowledge, Japan Admin)
> đã được thay bằng **7 lĩnh vực × 4 loại nội dung dùng chung**. Xem [`OS-DESIGN.md`](OS-DESIGN.md) §1.
> Hai thứ chưa có chỗ: **giấy tờ/visa** và **Knowledge** — ghi ở §15.

Cầu nối giữa hai vùng — đây là lý do làm web thay vì spreadsheet:

```
Life → Daily Log → Experience → Select → Write → Blog
```

---

## 3. Công nghệ

### Core — thực tế đã dùng
- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Prisma 7** + **MySQL 8.4** (chạy trong Docker) qua adapter `@prisma/adapter-mariadb`
- **sharp** cho ảnh · **jose** + **bcryptjs** cho đăng nhập · **remark** cho Markdown
- ESLint · Git

> Bản kế hoạch ban đầu ghi Next.js 15 và deploy Vercel. Thực tế cài ra Next.js 16, và **chưa deploy** — xem §15.
> Vercel không chạy được MySQL cục bộ, nên khi deploy sẽ cần hosting có MySQL hoặc một dịch vụ MySQL đám mây.

### UI
- Tailwind CSS — không dùng UI framework lớn
- **Lucide React** cho icon
- **Biểu đồ: vẫn hoãn.** Chưa có màn hình nào thật sự cần.

### Content

> Kế hoạch ban đầu: blog là file Markdown trong `content/posts/`, viết xong commit.
> **Đã đổi ở bước N8**: bài viết nằm trong bảng `Post`, soạn ngay trong `/os/write`.
> Lý do: bạn cần bài riêng tư chỉ mình xem, và cần sửa bài từ điện thoại — cả hai đều không làm được nếu bài là file trong repo.

Còn lại trong `content/` chỉ hai file tĩnh: `now.md` và `about.md`. Chúng ít thay đổi và không cần riêng tư nên để file là hợp lý.

Ảnh: `uploads/YYYY/MM/`, ngoài repo, phục vụ qua `/api/uploads/*`.

### ✅ Quyết định: Next.js ngay từ đầu (thay vì HTML trước)

Bạn đổi ý ở điểm này và **bạn đúng**. Lý do không phải kỹ thuật mà là chiến lược:

Mục tiêu #5 của bạn là làm IT ở Nhật. Nếu xây bằng HTML thuần, bạn mất 3 tuần rồi phải viết lại toàn bộ — 3 tuần đó không tạo ra kỹ năng nào nhà tuyển dụng hỏi tới. Xây bằng Next.js + TypeScript thì **thời gian làm web đồng thời là thời gian luyện nghề**, và chính repo này thành mục portfolio mạnh nhất của bạn.

### ⚠️ Milestone 0 — kiểm tra điều kiện đủ

Kế hoạch này ngầm giả định bạn biết React. Nếu chưa vững **useState / useEffect / props / component / map render**, đừng lao vào Next.js.

→ Dành 1 tuần học React cơ bản trước.

Và ghi rõ: **1 tuần đó tính là giờ học IT (ưu tiên #5), không tính vào ngân sách website (ưu tiên #7).** Không vi phạm §1.

---

## 4. Design System — chốt trước khi làm page

Triết lý: **Notion + personal website + personal OS**.
Trắng · border mảnh · typography đẹp · khoảng trắng rộng · gần như không shadow · 1 accent duy nhất.

> Simple enough to use every day. Beautiful enough to want to use every day.

### 4.1 Tokens — `app/globals.css` (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  /* Background */
  --color-bg:         #FFFFFF;
  --color-surface:    #FAFAFA;
  --color-surface-2:  #F5F5F5;

  /* Text */
  --color-ink:        #171717;
  --color-ink-2:      #737373;
  --color-ink-3:      #A3A3A3;

  /* Border */
  --color-line:       #E5E5E5;
  --color-line-soft:  #F0F0F0;

  /* Accent — dùng rất tiết kiệm */
  --color-accent:     #2563EB;

  /* Trạng thái — chỉ 3, chỉ dùng trong /os */
  --color-up:         #16A34A;
  --color-flat:       #A3A3A3;
  --color-down:       #DC2626;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Container */
  --container-site:  1120px;
  --container-prose:  720px;
  --container-os:    1280px;
}
```

> Dùng CSS variable ngay từ đầu → sau này thêm dark mode chỉ là ghi đè ~15 dòng trong `@media (prefers-color-scheme: dark)`. **Không làm dark mode ở phase này.**

**Luật dùng accent:** tối đa **1 chỗ accent trên mỗi màn hình**. Link trong bài viết, nút primary, chỉ số đang cần chú ý. Không dùng accent cho tag, icon trang trí, heading.

### 4.2 Typography

Yêu cầu: đẹp ở cả **Việt · Nhật · Anh**.

Quyết định kỹ thuật: dùng `next/font` để tự subset và tránh layout shift.

```ts
// app/fonts.ts
import { Inter, Noto_Sans_JP } from "next/font/google";

export const sans = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const sansJP = Noto_Sans_JP({
  subsets: ["latin"],   // glyph kanji nạp qua unicode-range, không tải hết
  weight: ["400", "500", "700"],
  variable: "--font-jp",
  display: "swap",
});
```

Font stack: `var(--font-sans), var(--font-jp), system-ui, sans-serif`
→ Chữ Latin/Việt dùng Inter, ký tự Nhật tự động rơi xuống Noto Sans JP.

**Bắt buộc test bằng mắt trước khi chốt**, dán đúng 3 dòng này vào một trang thử:

```
Xin chào, tôi là Cường. Đường phố Tokyo mùa hè rất oi ả.
こんにちは。私はクオンです。日本でエンジニアを目指しています。
Building my life in Japan.
```

Chú ý: dấu tiếng Việt chồng dấu (`ề` `ữ` `ộ`) và độ dày chữ Nhật so với chữ Latin. Geist là lựa chọn thay thế tốt cho Inter — nhưng **Geist không có glyph tiếng Nhật**, vẫn phải ghép Noto Sans JP.

Thang chữ:

| Vai trò | Size / Line-height | Weight |
|---|---|---|
| Display (Home hero) | 40–48 / 1.15 | 600 |
| H1 bài viết | 32 / 1.25 | 600 |
| H2 | 24 / 1.35 | 600 |
| H3 | 18 / 1.4 | 500 |
| Body | 16 / 1.7 | 400 |
| Body (bài viết) | 17 / 1.75 | 400 |
| Small / meta | 14 / 1.5 | 400 |
| Micro (label OS) | 12 / 1.4 | 500, `tracking-wide`, uppercase |

### 4.3 Spacing
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96` — không dùng số lẻ ngoài thang.

### 4.4 Radius
`sm 4px` (input, badge) · `md 6px` (button, card nhỏ) · `lg 8px` (card, modal). Không `rounded-full` trừ avatar.

### 4.5 Border & Shadow
Mặc định: `1px solid var(--color-line)`.
**Shadow chỉ dùng cho phần tử nổi**: dropdown, modal, mobile nav. Card không có shadow.

### 4.6 Container
| Vùng | Max-width |
|---|---|
| Public | 1120px |
| Bài viết (prose) | 720px |
| Life OS | 1280px |

### 4.7 Breakpoints
Mặc định Tailwind: `sm 640 · md 768 · lg 1024 · xl 1280`.
**Life OS thiết kế mobile-first**, public desktop-first nhưng phải responsive tốt.

---

## 5. Component Architecture

```
components/
├── ui/        Button · Input · Textarea · Checkbox · Badge · Card
│              Modal · Dropdown · Tabs · Progress · Divider
├── layout/    Header · Footer · Container · Sidebar · MobileNav
├── blog/      PostCard · PostHeader · PostContent · LanguageToggle · TagFilter
└── os/        MetricCard · GoalCard · KeystoneRow · DailyLogForm · BackupStatus
```

Chỉ tạo component khi: **dùng lại nhiều nơi** hoặc **có logic riêng** hoặc **UI phức tạp**.
Không tạo component cho một `<div>`.

**Không build sẵn cả 11 component `ui/` ở milestone đầu.** Build khi page đầu tiên cần đến nó — nếu không bạn sẽ có Modal và Dropdown nằm không suốt 2 tháng.

---

## 6. Layout

**Public — desktop**
```
┌──────────────────────────────────────┐
│ Cường          Now Blog Projects About│
├──────────────────────────────────────┤
│              Content                 │
└──────────────────────────────────────┘
```

**Public — mobile**: Logo trái · Menu phải · content full width.

**Life OS — desktop**: Sidebar trái (danh sách module) + Main.
**Life OS — mobile**: Bottom tab bar 3 mục quan trọng nhất (`Today` · `Focus` · `More`).

> Daily Log phải nhập xong **trên điện thoại** trong vài chục giây. Đây là ràng buộc thiết kế cứng, không phải mong muốn.

---

## 7. Public Website

### Home
Người lạ vào trong **10 giây** phải hiểu Cường là ai và đang làm gì.
Gồm: Introduction · Current focus (kéo từ `/now`) · Selected projects · Recent posts · Japan journey · CTA nhẹ.

### `/now` — trang quan trọng nhất của phần public
Cập nhật ~1 lần/tháng. Công khai đúng **3** thứ đang tập trung.

```
NOW — 2026.08

01 — Japanese     JLPT N3 → N2
02 — Career       Prepare for IT career in Japan
03 — Body         Sleep / eat / exercise
```

Muốn thêm thứ 4? **Không thêm.**
`/now` công khai là cơ chế chống "cái gì cũng quan trọng" — vì nó công khai nên bạn không tự lừa mình được.

### Projects
Mỗi project: Tên · Mô tả · Stack · Vấn đề · Tôi đã build gì · Screenshot · GitHub/Demo.
Không làm portfolio kiểu corporate. Mục tiêu: cho thấy **bạn thực sự build được thứ gì**.

### Photos
Lưu lại cuộc sống ở Nhật. Phân loại: `Japan · Daily Life · Study · Work · Places · People`.
Visual đơn giản, không kiểu social media.
Ảnh nén WebP, đặt trong `public/images/` — **không** dùng dịch vụ ngoài ở phase này.

### Japan Log
Timeline cuộc sống ở Nhật — vừa là kỉ niệm, vừa là nội dung.

### Journey
Timeline dài hạn, không cần chi tiết:
```
Vietnam → Japan → Japanese School → N3 → N2 → IT Job → Professional Developer
```

---

## 8. Blog & chiến lược song ngữ

### Nguyên tắc
- **Tiếng Việt bắt buộc. Tiếng Nhật tùy chọn.**
- Không có `ja.md` → không hiện nút Japanese, không tạo trang trống, **không coi là lỗi**.
- Bản Nhật **không phải bản dịch**: viết lại ngắn hơn, đúng trình độ hiện tại.

| | Độ dài |
|---|---|
| Tiếng Việt | 1000–2000 từ |
| Tiếng Nhật | 300–500 chữ |

Mục tiêu: **viết được tiếng Nhật thật**, không phải chứng minh mình dịch được.

Ưu tiên có bản Nhật: `Dev` · `IT` · `Japan Life` · `Learning Japanese` · `Career`
Không cần: `Personal journal` · `Emotional` · `Photo`

**Chỉ tiêu thực tế: 1 bài tiếng Nhật chất lượng / tháng.** Sau 1 năm = 12 bài tự viết, đưa thẳng vào hồ sơ xin việc.

### URL (quyết định kỹ thuật)
```
/blog/[slug]        → bản tiếng Việt (mặc định)
/blog/[slug]/ja     → bản tiếng Nhật (chỉ tồn tại khi có ja.md)
```
Dùng route thật, **không dùng `?lang=ja`** — Google index được, chia sẻ link được, và `generateStaticParams` chỉ sinh route `/ja` cho những bài thực sự có file. Khỏi cần i18n middleware.

`<html lang>` đổi theo bản. Thêm `<link rel="alternate" hreflang>` giữa 2 bản.

Trang `/blog` có bộ lọc `Tất cả | 日本語` — để gửi riêng phần tiếng Nhật cho nhà tuyển dụng.

---

## 9. Life OS — `/os`

### CORE

**Dashboard** — trả lời đúng 3 câu:
1. Tôi đang tập trung vào gì?
2. Hôm nay tôi đã làm gì?
3. Tôi có đang đi đúng hướng không?

```
TODAY
Japanese   60 min     IT   45 min
Exercise   ✓          Sleep 23:40

FOCUS
N3  ·  IT Career  ·  Body

⚠ TUẦN NÀY
Web development  8h
Japanese         2h
→ Bạn đang xây hệ thống thay vì dùng hệ thống.
```

Cảnh báo cuối cùng là **tính năng bắt buộc**, không phải trang trí. Nó phát hiện đúng cái bẫy nguy hiểm nhất của dự án này.

**Focus** — 4 trạng thái: `NOW` (**tối đa 3**) · `NEXT` · `LATER` · `NO`.
`NO` = những thứ **chủ động không làm**. Đây là cột có giá trị nhất — nó là nơi bạn học cách nói không.

**Daily Log + Journal** — gộp một, hoàn thành trong **2–3 phút**:
```
Ngủ lúc __   ·  Japanese __ min  ·  IT __ min

3 KEYSTONE
[ ] Ngủ trước 00:00
[ ] Tiếng Nhật ≥ 60 phút
[ ] Ăn đủ

[ ] Tập luyện

JOURNAL
Hôm nay có gì?  /  Học được gì?  /  Mai đổi gì?
[ ] Đáng viết blog?
```

### Keystone Habits — chỉ 3

```
Ngủ trước 00:00        → năng lượng, da, tập trung, tâm lý
Tiếng Nhật ≥ 60 phút   → N3, sự nghiệp, cảm giác tiến bộ
Ăn đủ                  → cân nặng, sức khỏe
+ Tập luyện: 3 buổi/tuần (đo theo tuần, không theo ngày)
```

Không track: phút doomscrolling · từng bữa ăn · từng ly nước · từng phút làm việc · từng task nhỏ.
**Track kết quả nền tảng, không track mọi chuyển động.**

### SUPPORT

**Goals** — phân tầng `Life → Year → Quarter → Month → Week`, một trang duy nhất, UI đơn giản. Không làm OKR.

```
2026
Japanese  └── Pass N3
Career    └── Prepare for IT job
Money     └── Reduce debt
Body      └── Gain healthy weight
```

**Japanese** — không thay thế Anki. Không nhập vocabulary, không nhập Kanji.
Chỉ quản lý: `Mục tiêu JLPT · Điểm mock test · Điểm yếu · Số phút học · Chiến lược · Tài liệu`

⚠️ **Sửa so với bản của bạn:** không dùng `Vocabulary 72%` — % của cái gì thì không ai biết, đó là con số ảo. Neo vào thứ đo được thật:

```
MOCK TEST — theo thang JLPT thật (60/60/60, đậu ≥95 và mỗi phần ≥19)

Ngày         語彙・文法   読解   聴解   Tổng
2026-06-15      38        28     31     97
2026-07-20      41        30     34    105

Điểm yếu đang xử lý: 読解 — tốc độ đọc
```

Một biểu đồ duy nhất: tổng điểm theo thời gian. Đường đi lên = đang đúng hướng.

**Career** — Skills · Projects · Resume · Portfolio · Companies · Applications · Interview notes · Learning roadmap. Không biến thành Jira.

Luật chống ảo tưởng năng lực: **không tự chấm skill mức 4–5 nếu không có bằng chứng public** (link repo / PR / demo).

Đầu trang hiện 1 con số: **"Nếu phỏng vấn tuần sau, tôi qua được bao nhiêu %?"** = % checklist job-readiness.

**Money** — ⚠️ **Sửa mâu thuẫn trong bản của bạn:** bạn viết "không cần ghi từng giao dịch nhỏ" nhưng lại muốn biết "tháng này có đốt tiền quá mức không". Không có dữ liệu thì không tính ra được. Giải pháp trung gian:

- **Chi phí cố định**: nhập **1 lần**, tự lặp mỗi tháng (nhà, điện nước, mạng, học phí, bảo hiểm)
- **Chi biến đổi**: mỗi ngày nhập **1 con số duy nhất** — tổng tiêu hôm nay (5 giây). Không phân loại từng khoản.
- **Chỉ phân loại 3 nhóm tùy ý**: `Ăn ngoài · Mua sắm · Giải trí` — vì đây là 3 chỗ tiền thật sự rò rỉ.
- Tự tính: Thu · Chi · **Tỷ lệ tiết kiệm %** · Số dư · Còn bao lâu đạt mục tiêu

Chỉ số trả lời "tôi có tiêu tiền ngu không": **% chi cho 3 nhóm tùy ý**. Trên 20% là đèn đỏ.

**Body** — gộp Health · Weight · Sleep · Exercise · Food · Hair · Skin · Appearance. Không chia 4 module.

Metric: `Cân nặng (tuần) · Ngủ (ngày) · Số buổi tập (tuần) · Ăn đủ ✓ · Protein ✓ · Ghi chú`
Không đếm calorie.
Da/Tóc: **1 bảng tĩnh** `Sản phẩm | Sáng/Tối | Bắt đầu từ | Có tác dụng?` — cập nhật khi đổi sản phẩm, không track hàng ngày.
Ảnh tiến trình: **1 tháng 1 lần** — xem §10 về nơi lưu ảnh.

### ARCHIVE

**Experience** — `Ngày · Tiêu đề · Chuyện gì · Học được gì · Đáng viết blog?`
Đây chính là cầu nối `Life OS → Experience → Blog`.

**Knowledge** — Second Brain, nhưng không thành Wikipedia cá nhân.
**Luật lọc: nếu tra Google trong 10 giây là ra thì không lưu.**
Ba nhóm xử lý khác nhau: `PHẢI NHỚ → đưa vào Anki` · `THAM KHẢO → link + 1 dòng` · `BIẾT LÀ CÓ → chỉ tên + link`.

**Japan Admin** — `Tên giấy tờ · Hạn · Để ở đâu · Việc cần làm`
Không lưu số hiệu giấy tờ, không lưu ảnh giấy tờ. Chỉ lưu **hạn** và **việc cần làm**.
Dashboard cảnh báo khi còn < 60 ngày.

### OPTIONAL — chưa làm
`Identity` · `Life Score` · `Calendar module`

**Calendar: không xây.** Google Calendar là Single Source of Truth. Website chỉ nhúng iframe agenda để xem nếu cần. Không tạo hệ thống lịch thứ hai.

---

## 10. Lưu dữ liệu

> ⚠️ Mục này từng ghi **localStorage**. Đã thay bằng **MySQL** khi bạn chọn hướng đó.
> Toàn bộ tầng localStorage đã bị xóa khỏi mã nguồn ở bước N7.

**Hiện tại: MySQL 8.4 chạy trong Docker, truy cập qua Prisma 7.**

- Chuỗi kết nối nằm ở `.env` (`DATABASE_URL`). Đổi hosting = sửa đúng một dòng.
- Prisma 7 không còn khai `url` trong `schema.prisma` — nó ở `prisma.config.ts`, còn lúc chạy thì `lib/db.ts` truyền driver adapter `@prisma/adapter-mariadb`.
- Bảng chữ `utf8mb4` — tiếng Việt và tiếng Nhật đều an toàn.
- 10 bảng: `Area · Goal · Principle · Item · Memory · Photo · FocusItem · DailyLog · Tag · Post`. Chi tiết ở [`prisma/schema.prisma`](../prisma/schema.prisma).

### ⚠️ Ảnh không nằm trong database
Database chỉ giữ **đường dẫn**. File thật ở `uploads/YYYY/MM/`, tên ngẫu nhiên, đã nén WebP kèm thumbnail. Nhồi ảnh vào MySQL làm backup chậm kinh khủng và không có CDN.

### ⚠️ Ngày tháng — cạm bẫy đã vấp một lần
Mọi cột `@db.Date` lưu ở **nửa đêm UTC**. Dựng `Date` phải có hậu tố `Z`, đọc ra dùng `getUTC*`. Thiếu chữ `Z` là lệch một ngày ngay, vì JST là UTC+9. Dùng `dayUTC()` / `isoUTC()` trong `lib/os/day.ts`, đừng tự viết lại.

---

## 11. Backup

Rủi ro đã đổi: không còn là "xóa cache mất sạch", mà là hỏng ổ cứng hoặc xóa nhầm.

- `/os/data` → **Tải JSON toàn bộ** (route `/api/backup`, chỉ chủ nhân tải được)
- Ảnh **không** nằm trong file JSON — copy cả thư mục `uploads/` sang OneDrive
- Mức thấp hơn: `docker exec vancuong_mysql mysqldump -ucuong -pdevpass iamvancuong > backup.sql`

Giữ nguyên trong Weekly Review: **"Đã backup chưa?"**

---

## 12. Privacy

Repo **public**. Code public. Nhưng dữ liệu Life OS **không bao giờ vào GitHub** — nó nằm trong MySQL, và `.env` · `uploads/` · `backup/` đều bị `.gitignore` chặn.

Không commit / không hard-code: mật khẩu · token · API key · dữ liệu giấy tờ · số tiền thật · nhật ký.

### Đã làm

- `app/robots.ts` → `disallow: "/os"`, `app/os/layout.tsx` → `robots: { index: false }`
- **Đăng nhập thật**: `middleware.ts` chặn `/os/*`, cookie httpOnly có chữ ký, hạn 30 ngày
- Hash bcrypt lưu dạng **base64** — bộ nạp `.env` của Next.js coi `$2b` `$12` là biến môi trường rồi thay bằng rỗng, kể cả khi bọc nháy đơn
- `/api/uploads/*` kiểm quyền từng ảnh và chặn leo thư mục
- Sitemap chỉ liệt kê bài đã công khai

### ⚠️ Server Action không được middleware bảo vệ

Nó là endpoint thật, gọi thẳng được từ ngoài. Mọi hàm trong `lib/os/*Actions.ts` phải gọi `assertOwner()` ở dòng đầu. Viết action mới thì đừng quên — đây là chỗ dễ thủng nhất của cả hệ thống.

---

## 13. Nhịp vận hành

### Quy tắc 5 phút mỗi ngày
Nếu chỉ mở 5 phút, bạn cần thấy và làm đúng những thứ này:

**THẤY (30 giây):** 3 việc đang tập trung · 3 việc hôm nay · cảnh báo (nếu có)
**LÀM (4 phút):** tick keystone → nhập 5 số (ngủ, JP, IT, tập, chi tiêu) → 3 câu journal

Hết. Không mở module nào khác. Nếu phải mở 5 trang thì hệ thống đã hỏng.

### Weekly — 20 phút, Chủ nhật
1. Tuần này tiến bộ ở đâu? Mất tập trung vì cái gì?
2. **Rà `Focus`: NOW còn đúng 3 việc không?** Cần đẩy gì xuống LATER hoặc NO?
3. Cập nhật Japanese / Career / Body
4. Đặt 3 việc cho tuần sau
5. Xem `Experience`: có gì đáng viết blog? → tạo draft
6. **Backup JSON**

### Monthly — 45 phút
1. Tổng kết tiền: thu / chi / tỷ lệ tiết kiệm
2. Đo cơ thể + chụp ảnh tiến trình
3. **Cập nhật `/now` công khai** — bắt buộc, đây là cam kết với chính mình
4. Đặt 3 mục tiêu tháng sau
5. Xuất bản 1–2 bài blog
6. **Đã viết được 1 bản tiếng Nhật chưa?**

### Quarterly
Chọn lại 3 ưu tiên. **Cho phép bỏ mục tiêu** — bỏ đúng lúc là kỹ năng, không phải thất bại.

---

## 14. Development Rules

1. Không build feature chỉ vì "có thể build". Phải giải quyết vấn đề thật.
2. Nếu Google Calendar / Anki / OneDrive giải quyết được thì **không xây lại**.
3. Build mất 3 ngày mà chỉ tiết kiệm 30 giây/ngày → **không build**.
4. **Mobile-first cho Life OS.**
5. Mỗi feature phải **dùng thử trong cuộc sống thật** trước khi mở rộng.
6. Không refactor quá sớm.
7. Không over-engineer.
8. **Mỗi milestone kết thúc, project phải build và deploy được.** Không để nhánh dở dang qua đêm.

---

## 15. Trạng thái — cập nhật 2026-08-04

Roadmap M1–M8 ban đầu đã chạy xong, sau đó Life OS được thiết kế lại theo lĩnh vực (xem [`OS-DESIGN.md`](OS-DESIGN.md)) và chạy tiếp N1–N8. Phần dưới là thực trạng, không phải kế hoạch.

### ✅ Đã xong

| Nhóm | Chi tiết |
|---|---|
| **Nền móng** | Next.js 16 · TypeScript · Tailwind v4 · design token tập trung · Inter + Noto Sans JP |
| **Công khai** | Home · `/now` · `/blog` (+`[slug]`, `/ja`) · `/journey` · `/photos` · `/projects` · `/about` · robots · sitemap |
| **Đăng nhập** | middleware chặn `/os/*` · cookie httpOnly có chữ ký · hash bcrypt lưu base64 |
| **Database** | MySQL trong Docker · Prisma 7 + adapter mariadb · 10 bảng · utf8mb4 |
| **Life OS** | Dashboard · 7 lĩnh vực × 4 tab · mục tiêu theo mốc tuổi · Hành trình · Focus · Nhật ký · Soạn bài · Dữ liệu |
| **Ảnh** | Nén WebP + thumbnail · xoay & đọc ngày theo EXIF · kiểm quyền từng ảnh · chặn leo thư mục |
| **Soạn thảo** | Thanh công cụ · 3 chế độ xem · xem trước dùng đúng bộ render của trang thật · dán/kéo ảnh |
| **Chủ đề** | Nằm trong bảng `Tag` · tạo mới lúc viết bài · bộ lọc `/blog` tự đồng bộ |

**Dữ liệu hiện có:** 7 lĩnh vực · 7 mục tiêu · 17 nguyên tắc · 3 đồ dùng · 4 chủ đề · 3 bài viết (đều riêng tư) · 0 ký ức · 0 ảnh · 0 nhật ký.

### 🔜 Còn lại — theo thứ tự nên làm

| # | Việc | ~Giờ | Vì sao |
|---|---|---|---|
| **1** | **Đổi mật khẩu `/os`** | 5' | Vẫn là mật khẩu tạm. Chuỗi băm chưa đổi — chạy `npm run hash-password`. |
| **2** | **Deploy**: GitHub → hosting có MySQL → trỏ domain | 4h | Chưa online thì chưa ai thấy, và bạn chỉ dùng được trên một máy. ⚠️ Nếu MySQL nằm ở **máy khác**, phải bật TLS — xem ghi chú `caching_sha2_password` dưới. |
| **3** | **Dùng thật 21 ngày** — ghi nhật ký, ghi ký ức, không code | 0h | Đây là bước quan trọng nhất còn lại. Xem ghi chú dưới. |
| **4** | Giấy tờ ở Nhật: hạn visa/在留カード + cảnh báo trước 60 ngày | 3h | Rủi ro thật, không phải tính năng cho vui |
| **5** | Tiền: chi phí cố định + tổng kết tháng | 4h | Hiện chỉ có 1 con số/ngày, chưa trả lời được "tháng này đốt bao nhiêu" |
| **6** | Tiếng Nhật: bảng điểm mock test | 3h | Chỉ số neo duy nhất của §16 — vẫn chưa có chỗ ghi |
| **7** | Sắp xếp lại thứ tự ảnh trong một ký ức | 1h | Focus đã sắp xếp được; ảnh thì chưa |
| **8** | RSS · ảnh OG · dark mode | 4h | Đánh bóng, không gấp |

### ✅ Đợt hoàn thiện 2026-08-05

Một lượt dọn những chỗ *đã dựng nhưng chưa xong*, không thêm module mới nào:

| Nhóm | Đã làm |
|---|---|
| **Sửa được** | Mục tiêu · Nguyên tắc · Đồ dùng · Ký ức · việc trong Focus đều sửa được tại chỗ. Trước đó chỉ tạo/xóa — mà xóa ký ức là xóa luôn ảnh. Đây là lỗi dùng nặng nhất, và là lý do phổ biến nhất khiến người ta bỏ một hệ thống ghi chép. |
| **Hỏi trước khi xóa** | Mọi nút xóa và cả nút bật/tắt công khai đều hỏi lại. Xóa ký ức nói rõ sẽ mất bao nhiêu tấm ảnh. |
| **Cột chết → có giao diện** | `metric`/`target`/`current` (kèm ô cập nhật nhanh "đang ở đâu") · `dropReason` khi bỏ mục tiêu · `cost`/`note` của đồ dùng · `caption` của ảnh · `order` của Focus. |
| **Nối nhật ký → bài viết** | Ngày đã tick "đáng viết" giờ có nút **viết thành bài**: tạo sẵn bản nháp từ nhật ký và ký ức cùng ngày. Mắt xích cuối của vòng lặp ở §2 — trước đây phải chép tay nên thực tế không ai chép. |
| **Kiểm dữ liệu vào** | `lib/os/formData.ts` dùng chung cho cả ba file action: kẹp số về khoảng hợp lệ, chặn ngày vô lý, lọc enum lạ. Trước đó `jpMin = 999999` lưu được và làm hỏng thống kê âm thầm. |
| **Bảo mật** | Mật khẩu tạm đã bị xóa khỏi `README.md` và `.env` · chặn open redirect ở `?from=` · chặn dò mật khẩu hai tầng (theo IP + tổng, vì `x-forwarded-for` giả được) · `verifySession` kiểm cả `sub`. |
| **Lỗi & chờ** | Có `error.tsx` cho cả hai vùng (hết phiên thì mời đăng nhập lại thay vì màn hình đỏ) · mọi nút gửi form biết báo "đang lưu…". |
| **Dữ liệu** | `FocusItem.areaId` thành khóa ngoại thật · backup thêm bảng `Tag` và quan hệ chủ đề của bài · ảnh được dọn khỏi ổ đĩa nếu ghi database hỏng giữa chừng. |
| **Bớt nhiễu** | Dashboard chỉ hiện lĩnh vực đang có việc ở NOW (OS-DESIGN §10.3) thay vì bày cả 28 ô trống. Thanh dưới trên điện thoại rút còn 4 mục (§6). |
| **Mốc tuổi tính sẵn** | Ô tuổi từ chỗ **gõ tay** thành danh sách chọn sinh ra từ ngày sinh: *25 tuổi — 2028*, chọn xong hiện ngay *06/07/2028 · còn 1 năm 11 tháng*. Ô chọn mốc cũng chỉ hiện đúng thứ cần: chọn Tuần thì ra ô ngày, chọn Tuổi thì ra danh sách tuổi, chọn Cả đời thì không ô nào. Trước đó bày cả hai ô cùng lúc kèm một đoạn hướng dẫn — tức là bắt đọc chỉ dẫn để điền một cái form. |
| **Cam kết tuần / tháng** | Mục tiêu có thêm mốc **Tuần** và **Tháng**, gắn với một kỳ cụ thể. Hết kỳ thì chấm ba mức (đạt · một phần · không đạt) và viết lại ba câu: chuyện gì · **vì sao** · kỳ sau đổi gì. Có nút chép sang kỳ kế tiếp. Trang [`/os/calendar`](../app/os/calendar/page.tsx) đặt cam kết của mỗi tuần cạnh bảy ô ngày của chính tuần đó. Xem [`OS-DESIGN.md`](OS-DESIGN.md) §3①. |
| **Nói đúng sự thật** | `/projects` từng ghi "blog đọc thẳng file Markdown, không CMS, không database" — sai từ bước N8. Đã viết lại, kèm vài chú thích còn nhắc localStorage. |

### 🐛 Bug đã sửa: app chết sau mỗi lần MySQL khởi động lại

Triệu chứng: mọi trang cần database trả 500, log Prisma báo

```
pool timeout: failed to retrieve a connection from pool after 10007ms
(pool connections: active=0 idle=0 limit=10)
```

Rất dễ đọc nhầm thành "không kết nối được database" rồi đi kiểm tra Docker — trong khi Docker vẫn chạy, cổng 3306 vẫn nghe, `mysql` trong container vẫn vào được bình thường.

**Nguyên nhân thật:** MySQL 8.4 dùng `caching_sha2_password`. Server giữ một bộ đệm mật khẩu và **bộ đệm đó rỗng sau mỗi lần restart**. Lần đăng nhập đầu tiên vì thế phải làm *full authentication* bằng khóa RSA, mà mặc định của mariadb connector là **không được phép xin khóa**. Kết quả không phải lỗi tử tế mà là **treo im** cho tới khi pool bỏ cuộc.

Dấu hiệu nhận ra: chỉ cần một client bất kỳ đăng nhập thành công một lần —

```bash
docker exec vancuong_mysql mysql -ucuong -pdevpass -e "SELECT 1"
```

— là app chạy lại ngay tức khắc, cho tới lần restart sau. Nếu thấy hiện tượng "tự nhiên hết" kiểu đó thì gần như chắc chắn là lỗi này.

**Đã sửa** ở [`lib/db.ts`](../lib/db.ts) bằng `allowPublicKeyRetrieval: true`, kèm `connectTimeout` 5s để lần sau có hỏng thì báo sớm chứ không treo 10 giây. Đã kiểm 4 lần restart liên tiếp với bộ đệm nguội: 144–164ms, không lần nào hỏng.

> 🔒 **Khi deploy:** tùy chọn đó nhận khóa công khai qua kênh chưa mã hóa. MySQL chạy cùng máy (localhost/Docker) thì không sao. **MySQL ở máy khác thì phải dùng TLS (`ssl`) thay cho nó** — nếu không, kẻ đứng giữa tráo khóa được và lấy mất mật khẩu database.

---

> ⚠️ Database vẫn đang chứa **dữ liệu mẫu**: 67 ngày nhật ký, 11 ký ức, 13 ảnh đều do `npm run db:demo` sinh ra, không phải bạn ghi. Nó làm chuỗi ngày và lịch nhiệt trông như đang chạy. Chạy `npm run db:demo:clear` trước khi bắt đầu dùng thật, nếu không bạn sẽ không phân biệt được đâu là tiến bộ của mình.

### ⚠️ Việc số 3 mới là việc khó nhất

Sáu tháng nữa nhìn lại, thứ quyết định dự án này thành hay bại không phải là còn bao nhiêu tính năng chưa làm. Nó là: **bạn có mở `/os` mỗi tối và ghi ba dòng không.**

Hiện tại có 0 nhật ký, 0 ký ức, 0 việc trong Focus. Hệ thống đã dựng xong nhưng chưa được dùng ngày nào.

Nên trước khi làm bất cứ việc nào từ số 4 trở đi: **dùng 21 ngày.** Sau 21 ngày bạn sẽ biết chắc thứ gì thiếu — và rất có thể danh sách trên sẽ ngắn đi chứ không dài ra.

### 📌 Cố ý chưa làm

`Life Score` · `Identity` · `Knowledge` — đều nằm trong bản thiết kế nhưng chưa có nhu cầu thật.

**Về `/os/calendar`:** đây **không** phải cái Calendar bị cấm ở §14 quy tắc 2. Cái bị cấm là lịch *hẹn giờ* — sự kiện, lời mời, nhắc giờ — và Google Calendar vẫn là nguồn duy nhất cho việc đó, vĩnh viễn không xây lại. Trang này chỉ trả lời một câu Google Calendar không trả lời được: *tuần này mình đã cam kết gì, và mình đã sống tuần đó ra sao.* Không có ô giờ, không có sự kiện, không đồng bộ với ai.

---

## 16. Definition of Done

**Website**
- [ ] `iamvancuong.com` online ← **việc lớn nhất còn lại**
- [x] Mobile đẹp · Desktop đẹp · Nhanh
- [x] SEO cơ bản (title, description, sitemap) — *còn thiếu ảnh OG*
- [x] Blog viết bằng Markdown, có trình soạn thảo và xem trước
- [ ] **≥ 3 bài viết thật trong 2 tháng** — có 3 bản nháp, **chưa xuất bản bài nào**

**Life OS**
- [x] Nhật ký ngày xong trong **< 3 phút, trên điện thoại**
- [x] Focus không quá 3 NOW — chặn ở server
- [x] Mục tiêu rõ ràng, neo theo mốc tuổi
- [x] Nguyên tắc sống · Đồ dùng · Ký ức có ảnh
- [x] Backup hoạt động
- [x] Không phải mở 5 app để quản lý cuộc sống
- [x] Sửa lại được thứ đã ghi — mục tiêu, nguyên tắc, đồ dùng, ký ức, Focus
- [x] Xóa có hỏi lại, và nói rõ mất kèm bao nhiêu ảnh
- [x] Ngày "đáng viết" tạo được bản nháp bằng một nút
- [ ] Tiếng Nhật: chưa có chỗ ghi điểm mock test *(mục tiêu đã có ô đo `metric`/`target`/`current`, nhưng chưa có bảng điểm theo thời gian)*
- [ ] Tiền: mới có 1 con số/ngày, chưa có chi phí cố định và tổng kết tháng
- [ ] Giấy tờ ở Nhật: chưa có cảnh báo hạn visa

**Tiêu chí duy nhất thật sự quan trọng:**
> Sau 2 tháng, tôi phải đang dùng website này **hàng ngày**.
> Nếu website đẹp nhưng tôi không dùng → **project thất bại.**

Thêm một tiêu chí đối trọng:
> Sau 2 tháng, **điểm mock test N3 phải cao hơn** lúc bắt đầu.
> Nếu web xong mà tiếng Nhật đứng yên → project cũng thất bại, dù web có đẹp đến đâu.

**Đối chiếu ngày 2026-08-04:** phần code gần như xong, nhưng **cả hai tiêu chí trên đều đang ở mức 0** — chưa có ngày nào được ghi, chưa có bài nào xuất bản, chưa có điểm mock test nào. Đó là câu trả lời rõ nhất cho câu hỏi "nên làm gì tiếp theo".

---

## 17. Phase 2 — chỉ khi có nhu cầu thật

```
Next.js → Supabase → Authentication → Cloud Database
```
Multi-device · Sync · Cloud backup · Analytics · Advanced dashboard · Dark mode

Không làm trước khi thật sự thấy đau.

---

## 18. Đã sửa gì so với bản bạn viết

**Giữ nguyên vì đã tốt** — và tốt hơn bản trước của tôi:
- Next.js ngay từ đầu (lý do chiến lược, §3)
- Design System trước khi làm page
- §32 cảnh báo "đang xây hệ thống thay vì dùng hệ thống"
- §36 thứ tự ưu tiên tuyệt đối — website xếp #7
- §37 "đẹp mà không dùng = thất bại"
- Calendar không xây lại
- 3 keystone habits
- Chiến lược song ngữ

**12 điểm đã sửa:**

| # | Vấn đề | Sửa thành |
|---|---|---|
| 1 | Roadmap "Week 1–9" mâu thuẫn với ngân sách 6h/tuần → luôn trễ → bỏ cuộc | Milestone không gắn ngày, có ước tính giờ thật (§15) |
| 2 | W4→W7 build 11 module trong 3 tuần, vi phạm chính Rule 5 | **M7: dùng thật 21 ngày, 0h code**, rồi thêm từng module một |
| 3 | Giả định biết React nhưng không kiểm tra | **M0** — và ghi rõ nó tính là giờ học IT, không phạm §36 |
| 4 | §23 Money tự mâu thuẫn: không ghi giao dịch nhưng muốn biết đốt tiền | Cố định nhập 1 lần + 1 con số/ngày + 3 nhóm tùy ý (§9) |
| 5 | §21 `Vocabulary 72%` — % của cái gì? Con số ảo | Neo vào **điểm mock test thang JLPT thật** (§9) |
| 6 | `/os` sẽ bị Google index | `robots.ts` disallow + `noindex` (§12) |
| 7 | Ảnh tiến trình + ảnh experience sẽ đốt quota localStorage | Ảnh không vào database — lưu ra đĩa, DB chỉ giữ đường dẫn (§10) |
| 8 | Next.js + localStorage → lỗi hydration ngay ngày đầu | *(không còn liên quan — đã chuyển sang MySQL ở N7)* |
| 9 | Thiếu nhịp Weekly/Monthly → Focus sẽ mốc, `/now` không ai cập nhật | **§13** đầy đủ daily/weekly/monthly/quarterly |
| 10 | `?lang=ja` khó SEO, khó share | Route thật `/blog/[slug]/ja` + hreflang (§8) |
| 11 | Chart.js (~200KB) cho 2 biểu đồ | Hoãn quyết định; nghiêng về SVG tự vẽ (§3) |
| 12 | Body gộp da/tóc nhưng không có chỗ nào track | Bảng tĩnh sản phẩm + ảnh 1 tháng/lần (§9) |

**Thêm mới:**
- Ghi Daily Log **bằng giấy từ hôm nay**, không đợi web xong (§1)
- Tiêu chí đối trọng ở Definition of Done: điểm N3 phải tăng (§16)
- Luật dùng accent: tối đa 1 chỗ/màn hình (§4.1)
- Không build sẵn 11 component ui/ (§5)
- Bỏ `posts.json` — Next.js đọc thẳng filesystem (§3)
- Frontmatter schema cụ thể (§3)
- `next/font` cho Inter + Noto Sans JP + đoạn text test 3 ngôn ngữ (§4.2)
