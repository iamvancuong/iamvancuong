# STATE.md — dự án đang đứng ở đâu

> **Đọc file này TRƯỚC.** Đây là trạng thái thật, cập nhật **2026-08-06**.
> `PLAN.md` là lý do đằng sau các quyết định · `OS-DESIGN.md` là thiết kế Life OS.
> Hai file kia giải thích *vì sao*; file này nói *đang ở đâu và làm gì tiếp*.

---

## 0. Nếu chỉ đọc được 5 dòng

1. **Code xong. Sản phẩm gần như chưa được dùng.** Dữ liệu mẫu đã xóa sạch (06/08). Hiện có **1 ngày nhật ký thật**, 0 lần ghi số đo, 0 ký ức, **0 hiệp pomodoro**. 7 số đo đã lập nhưng chưa nhập con số nào.
   - 🔴 12/08: đã lập đợt **JLPT N3** (12/08 → 12/12, 7 hiệp/ngày) + 6 mảng. **Ngân sách 6 mảng = 875h nhưng nhịp 7 hiệp chỉ chứa 717h** — kế hoạch vượt trần 157h ngay trên giấy. Phải chọn: 8.5 hiệp/ngày, hoặc kéo sang ~5 tháng, hoặc cắt bớt giờ. Sửa ở `/os/data`.
2. **Đã lên GitHub**, repo `iamvancuong/iamvancuong` **công khai**. **Chưa deploy** — vẫn chỉ chạy trên một máy.
3. 🔴 **Mật khẩu `/os` vẫn là mật khẩu tạm.** Nó *không* nằm trong repo (`.env` bị gitignore, lịch sử cũ đã mất), nhưng phải đổi **trước khi deploy**: `npm.cmd run hash-password` rồi thay dòng trong `.env` **và khởi động lại server** — Next chỉ đọc `.env` lúc tiến trình khởi động.
4. Đợt 05–06/08 đã commit và push đủ. `git log` để xem.
5. Việc tiếp theo **không phải là code** — xem §9.

---

## 1. Dự án là gì

Trang cá nhân + hệ điều hành cuộc sống riêng, **một người dùng duy nhất** (Trương Văn Cường, sinh 06/07/2003, người Việt đang ở Nhật, hướng tới JLPT N2 + việc IT ở Nhật).

Một codebase, hai vùng, **chung một database**:

```
CÔNG KHAI  /  /now  /blog  /journey  /photos  /projects  /about
RIÊNG TƯ   /os/*   (middleware chặn, cookie JWT ký, hạn 30 ngày)
```

Nối hai vùng bằng **đúng một cột `visibility`** trên `Memory`, `Photo`, `Post`.
Không tick = chỉ mình xem. Tick = hiện ra ngoài. Viết một lần, không copy qua lại.

Vòng lặp mục tiêu:

```
Sống → ghi vào /os → chọn cái đáng kể → viết thành bài → công khai
```

---

## 2. Stack

| | |
|---|---|
| Framework | Next.js **16.3.0** App Router + Turbopack · React 19.2.8 · TypeScript |
| CSS | Tailwind **v4** (token trong `app/globals.css`, không dùng UI framework) |
| DB | MySQL **8.4** trong Docker · Prisma **7.9.1** + `@prisma/adapter-mariadb` |
| Khác | `jose` + `bcryptjs` (đăng nhập) · `sharp` (ảnh) · `remark` (Markdown) · `lucide-react` |
| Test | `npm run test` — **116** phép kiểm, **không dùng framework** (xem `scripts/test.ts`) |
| Không có | CI |

**Quy mô:** ~95 file nguồn. 23 trang, 6 API route (+ `/feed.xml`), 56 server action, 15 bảng, 9 enum.

---

## 3. Chạy

Cần **Docker Desktop** bật.

```bash
npm.cmd run dev
```

`predev` tự chạy `docker compose up -d --wait` nên MySQL luôn sẵn sàng trước khi Next khởi động.

> ⚠️ **Trên PowerShell phải gõ `npm.cmd`**, không phải `npm`. Máy này đang ở
> execution policy `Restricted` (mặc định Windows) nên `npm.ps1` bị chặn.
> Sửa hẳn: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`.

Lệnh khác:

```bash
npm.cmd run build           # kiểm tra trước khi push
npm.cmd run db:studio       # xem/sửa DB bằng giao diện — CÁCH DUY NHẤT để thêm lĩnh vực
npm.cmd run db:demo:clear   # xóa dữ liệu mẫu  ← nên chạy trước khi dùng thật
npm.cmd run hash-password   # đổi mật khẩu /os
npm.cmd run db:push         # sau khi sửa schema
```

---

## 4. Cấu trúc

```
app/
├── (công khai)  page · now · blog/[slug]/(ja) · journey · photos · projects
│                ⚠️ `projects` = trang «Hồ sơ», đã GỘP /projects + /cv + /about
│                   (17/08). Hai địa chỉ kia chỉ còn 308 trong `next.config.ts`.
├── login/       LoginForm (client)
├── os/          layout(force-dynamic, noindex) · page(dashboard) · calendar · focus
│   ├── goals · journey · log/[date] · write/[slug] · data
│   └── a/[slug]   ← MỘT file cho CẢ 7 lĩnh vực (điểm mấu chốt của thiết kế)
├── api/         auth/login · auth/logout · backup · uploads · uploads/[...path]
│               cv/[lang]  ← sinh file CV PDF (vi/ja) bằng pdf-lib
├── error.tsx · os/error.tsx · robots.ts · sitemap.ts(force-dynamic)
lib/
├── db.ts          Prisma singleton — ĐỌC CHÚ THÍCH, có bẫy caching_sha2 (§7)
├── auth.ts · session.ts
├── posts.ts · markdown.ts · now.ts · projects.ts · site.ts
├── cv.ts · cv-pdf.ts   dữ liệu CV + bộ dựng PDF (tọa độ tính tay — xem §7.7)
└── os/
    ├── actions.ts      23 action: Goal · Principle · Item · Memory · Photo
    ├── dayActions.ts    7 action: Focus · DailyLog
    ├── postActions.ts   7 action: Post · Tag
    ├── metricActions.ts 5 action: Metric · MetricEntry
    ├── formData.ts     đọc + KIỂM dữ liệu form (dùng chung cả 4 file trên)
    ├── day.ts          quy ước ngày nửa đêm UTC — TUÂN THỦ TUYỆT ĐỐI
    ├── period.ts       kỳ tuần/tháng, tuần bắt đầu THỨ HAI
    ├── age.ts · stats.ts · upload.ts · constants.ts
components/os/  GoalsTab · GoalReview · HorizonPicker · MetricsTab · Sparkline
                PrinciplesTab · ItemsTab · MemoryForm · MemoryList · DailyLogForm
                Streak · TodayPanel · OsNav · AreaTabs · Disclosure · FormButtons
                formBits · MarkdownEditor
```

### Luật bất di bất dịch

1. **Mọi server action gọi `assertOwner()` ở dòng đầu.** Server Action là endpoint thật, middleware KHÔNG chặn nó. Hiện 42/42 hàm đều có. Viết hàm mới mà quên là thủng cả hệ thống.
2. **Ngày `@db.Date` luôn ở nửa đêm UTC.** Dùng `dayUTC()` / `isoUTC()` trong `lib/os/day.ts`, đọc bằng `getUTC*`. Thiếu hậu tố `Z` là lệch một ngày ngay, vì JST là UTC+9.
3. **Tuần bắt đầu Thứ Hai** — thống nhất giữa `period.ts` và lịch nhiệt trong `Streak.tsx`.
4. **Ảnh không vào database.** DB chỉ giữ đường dẫn; file thật ở `uploads/YYYY/MM/`, phục vụ qua `/api/uploads/*` có kiểm quyền từng tấm.
5. **Không dùng `Object.values(EnumCủaPrisma)`** — dùng `valuesOf<T>({...})` trong `formData.ts`. Lý do ở §7.

---

## 5. ✅ ĐÃ LÀM (đã kiểm chứng chạy được)

### Nền móng
Next 16 + Tailwind v4 + design token tập trung · Inter + Noto Sans JP (đẹp ở cả Việt/Nhật/Anh) · responsive · `/os` mobile-first.

### Đăng nhập & bảo mật
- Middleware chặn `/os/*` · cookie httpOnly ký HS256, hạn 30 ngày · bcrypt cost 12
- Hash lưu **base64** (bộ nạp `.env` của Next coi `$2b` `$12` là biến môi trường rồi thay bằng rỗng)
- Chống dò mật khẩu **hai tầng**: theo IP (8 lần/10 phút) + tổng (30 lần/10 phút). Hai tầng vì `x-forwarded-for` do client gửi nên giả được; site một người dùng thì trần tổng là hợp lý và không giả mạo được.
- `verifySession` kiểm cả `sub`, không chỉ chữ ký
- Chặn open redirect ở `?from=`
- `/api/uploads/*`: kiểm quyền từng ảnh, chặn leo thư mục, từ chối file mồ côi, `Cache-Control: private` cho ảnh riêng tư

### Life OS
| Trang | Nội dung |
|---|---|
| `/os` | **Bốn tab** (14/08, trạng thái ở `?tab=`): **Nên nhớ** (mặc định — «Nỗ lực để làm gì?» cố định trong code + 3 nguyên tắc/ngày) · **Việc** (đường vào nhật ký + việc hôm nay/ngày mai + 3 việc NOW) · **Tiếng Nhật** (pomodoro + nhịp đợt + biểu đồ) · **Nhìn lại** (kỳ chưa chấm · cam kết kỳ này · chuỗi ngày + lịch nhiệt · mục tiêu gần nhất). Badge trên tab chỉ đếm thứ **có hạn** — việc chưa xong, kỳ chưa chấm — vì ẩn một thứ có hạn sau tab là cách chắc nhất để quên nó. ⚠️ **3 việc nền tảng đã GỠ khỏi đây** (12/08) — chỉ tick được cuối ngày, mà đây là màn hình mở lúc sáng dậy. ⚠️ **«Lĩnh vực đang có việc» đã GỠ** (14/08) — bảy đường tắt sang thứ vốn nằm sẵn ở thanh bên |
| `/os/a/[slug]` | 1 file cho 7 lĩnh vực × 5 tab: Mục tiêu · Nguyên tắc · Đang dùng · **Số đo** · Ký ức. **Tab rỗng bị ẩn**, nằm sau nút `+` kèm một dòng nói nó dùng để làm gì |
| `/os/calendar` | Lịch tháng **đọc theo tuần**: ô ngày (đậm nhạt theo việc nền tảng) cạnh cam kết của chính tuần đó |
| `/os/focus` | NOW/NEXT/LATER/NO · **trần NOW = 3 enforce ở SERVER** · sắp xếp lên/xuống |
| `/os/log` | Danh sách kiểu app Journal, gộp nhật ký + ký ức cùng ngày |
| `/os/log/[date]` | **Không có nút Lưu** — tick lưu ngay, ô chữ lưu khi rời ô |
| `/os/goals` | Mọi mục tiêu xếp theo mốc tuổi |
| `/os/journey` | Mọi ký ức theo dòng thời gian, có ảnh |
| `/os/write` | Danh sách bài + nút **"viết thành bài"** từ ngày đã đánh dấu |
| `/os/data` | Thống kê + tải backup JSON |

### Mục tiêu — hai loại
- **Cam kết có kỳ** (Tuần/Tháng): gắn `periodStart`, nhập ngày nào trong kỳ cũng được, server nắn về thứ Hai / ngày 1. Hết kỳ **chấm ba mức** (đạt · một phần · không đạt) + **ba câu tự sự** (chuyện gì · **vì sao** · kỳ sau đổi gì). Có nút **làm lại kỳ sau** (chống trùng).
- **Mốc dài hạn** (Năm nay/Năm sau/Tuổi/Cả đời): tick xong, hoặc bỏ kèm lý do.
- **Mốc tuổi tính sẵn** từ ngày sinh: chọn "30 tuổi" → hiện ngay "06/07/2033 · còn 6 năm 11 tháng". Ô chọn chỉ hiện đúng thứ cần dùng.

### Quản lý giờ học tiếng Nhật (12/08/2026)

Bốn bảng mới: `DayTask` · `StudyGoal` · `StudySkill` · `PomoSession`.

- **Pomodoro** — 10 ô ở `/os` và ở `/os/log/[ngày]` (cùng một component, nhận
  `iso` nên chữa được ngày đã qua). Bấm ô thứ n = "xong n hiệp", **một chạm**;
  bấm lại ô cuối đang sáng thì lùi một hiệp. Đủ 60 phút thì việc nền tảng
  «Tiếng Nhật» **tự bật** (chỉ bật, không tự tắt).
- **Ô reset theo ngày là hệ quả, không phải cơ chế**: mỗi ngày là một tập
  `PomoSession` khóa theo `date`, `/os` luôn hỏi `todayISO()` (JST cố định).
- **Mảng kỹ năng có ngân sách giờ** (từ vựng 250h · nghe 150h…). Vì thế MỘT
  HIỆP LÀ MỘT DÒNG chứ không phải một con số đếm — một con số không nhớ được
  hiệp đó học mảng nào, và đổi sau khi có dữ liệu thật thì **không suy ngược
  được**, vì thông tin chưa từng được ghi.
- **`/os/data` §Mục tiêu học** — đặt đợt + chia mảng. Cộng ngân sách các mảng
  và **so thẳng với sức chứa của nhịp** ngay tại chỗ đặt kế hoạch.
- **`/os/calendar`** — vạch giờ học dưới mỗi ô ngày + tổng giờ tháng. Chỉ ĐỌC;
  vẫn không có ô giờ, không có sự kiện (xem §8 «cố ý không làm»).

#### ⚠️ Bất biến phải giữ

```
DailyLog.jpPomo  ==  số dòng PomoSession cùng ngày
```

Giữ được vì **chỉ `setPomodoro()` được ghi `jpPomo`**, và nó ghi cả hai trong
một transaction. Form nhật ký cố ý **không** còn nhận `jpPomo` nữa. Thêm đường
ghi thứ hai là hai con số trôi khỏi nhau — hỏng âm thầm, cả hai vẫn trông hợp
lý. Nghi thì chạy `npm run check:pomo` (kiểm cả hai chiều).

⚠️ **Không đọc thẳng `DailyLog.jpMin`** ở bất cứ chỗ thống kê nào — nó chỉ còn
là phút LẺ ngoài pomodoro. Tổng là `jpTotal()` trong `lib/os/japanese.ts`.

### Số đo (tab «Số đo»)
Một con số có tên/đơn vị/đích/**hướng tốt**, ghi lại theo thời gian, vẽ đường SVG **tự viết** (không cài thư viện biểu đồ — PLAN §3).
- Trục X **tỉ lệ theo ngày thật**, không theo thứ tự bản ghi — hai lần đo cách nhau 3 tháng phải nhìn ra là xa nhau.
- Màu đường theo **hướng**: chi tiêu tăng thì đỏ, điểm thi tăng thì xanh.
- Ghi lại cùng một ngày là **đè lên** (`@@unique([metricId, date])`), không tạo dòng thứ hai.
- Một bảng phục vụ cả điểm mock JLPT · cân nặng · chi tiêu tháng — thay vì ba module riêng (OS-DESIGN §1).

### Đang dùng — bảng 3 cột
Đang dùng · Muốn thử · Đã bỏ đặt cạnh nhau, đổi trạng thái bằng **một chạm**.
**Cố ý không làm kéo–thả**: HTML5 drag không chạy trên cảm ứng mà Life OS là mobile-first (PLAN §6/§14.4), làm cho chạy phải thêm thư viện (dự án đang có 0 dependency giao diện), và người ta đổi trạng thái chừng một tháng một lần — PLAN §14.3.
Ô kết luận chỉ chiếm chỗ khi **đã có nội dung**. Từ 6 điều khiển mỗi dòng xuống còn 2.

### CRUD
Thêm/sửa/xóa đầy đủ cho: Goal · Principle · Item · Metric · MetricEntry · Memory · Photo(caption) · FocusItem · Post · Tag.
Mọi nút xóa **hỏi lại**, và nói rõ mất kèm bao nhiêu ảnh / bao nhiêu lần đo.

### Công khai
Home · `/now` (đọc `content/now.md`) · `/blog` (+`[slug]`, `/ja`, lọc theo chủ đề) · `/journey` · `/photos` (có lightbox) · `/projects` · `/about` · robots (chặn `/os`) · sitemap (chỉ bài đã công khai).

### Đã kiểm chứng đầu-cuối (05/08, bản production)
| Luồng | Kết quả |
|---|---|
| Khách vào `/os` · `/api/backup` | 307 → login · 404 |
| Tiêu đề bài riêng tư lọt ra trang khách | 0/4 |
| Chủ nhân thấy nhiều hơn khách | blog 6 vs 2 · ký ức 11 vs 6 |
| Ký ức riêng → tick công khai → `/journey` | 6→7, hiện ngay, không cần build |
| Ảnh riêng tư: khách / chủ nhân | 404 / 200 |
| Leo thư mục · file mồ côi | 404 / 404 |
| Nhật ký → nháp → xuất bản → blog + trang chủ + sitemap | ✅ |
| Gỡ bài xuống → sitemap giảm, khách 404 | ✅ không cần build |
| Cam kết tuần: tạo → chấm → tự sự → làm lại kỳ sau | ✅ |
| MySQL restart 4 lần liên tiếp, cache xác thực nguội | ✅ 144–164ms |

---

## 6. 🟡 CHƯA HOÀN THIỆN

Toàn bộ nhóm này **đã đóng ngày 06/08**. Không còn mục nào.

| Thứ | Trạng thái |
|---|---|
| ~~`site.social`~~ | ✅ 6 link (GitHub · LinkedIn · Email · Instagram · YouTube · Facebook). Thứ tự khai trong `site.ts` = thứ tự hiện ở footer, xếp theo mức liên quan tới việc IT. |
| ~~Giao diện Lĩnh vực~~ | ✅ `/os/data` — thêm · sửa · ẩn/hiện · đổi thứ tự · xóa. `slug` cố ý không sửa được (là địa chỉ trang). |
| ~~Xóa nhật ký ngày~~ | ✅ Nút ở cuối `/os/log/[date]`, chỉ hiện khi ngày đó có bản ghi. |
| ~~Đổi lĩnh vực của ký ức~~ | ✅ Ô chọn trong form sửa ký ức. |
| ~~Đổi tên chủ đề (Tag)~~ | ✅ Sửa tại chỗ ở `/os/write/[slug]`; `slug` giữ nguyên. |
| ~~Sắp xếp ảnh trong ký ức~~ | ✅ `Photo.order` + nút lên/xuống. ⚠️ Phải có `orderBy` ở **cả bốn** truy vấn ảnh. |
| ~~`Goal.detail`~~ | ✅ Có textarea, hiện ở dòng mục tiêu. |
| ~~`Photo.bytes`~~ | ✅ Hiện kích thước + dung lượng từng tấm và tổng cả ký ức. |
| ~~`buildingTooMuch()`~~ | ✅ Thêm `DailyLog.webMin`. Nó từng so `itMin` với `jpMin` — **đo nhầm cả hai đầu**: phạt việc học IT (thứ phục vụ mục tiêu việc làm) và mù hoàn toàn trước giờ ngồi xây chính cái web này. |
| ~~`public/`~~ | ✅ Đã xóa 5 file svg mặc định của Next. |

---

## 7. 🪤 TÁM CÁI BẪY ĐÃ VẤP — đừng vấp lại

> Phần này là thứ giá trị nhất của file. Mỗi mục đều tốn thời gian thật để tìm ra,
> và triệu chứng đều **không hề chỉ về nguyên nhân**.

### 1. `pool timeout ... active=0 idle=0` sau mỗi lần MySQL restart
**Không phải** database chết. MySQL 8.4 dùng `caching_sha2_password`; bộ đệm mật khẩu **rỗng sau mỗi lần restart**, nên lần đăng nhập đầu phải làm *full authentication* bằng khóa RSA — mà mặc định mariadb connector **không được phép xin khóa**. Kết quả là **treo im** chứ không báo lỗi.
**Dấu hiệu nhận ra:** chạy `docker exec vancuong_mysql mysql -ucuong -pdevpass -e "SELECT 1"` một lần là app chạy lại ngay.
**Đã sửa:** `allowPublicKeyRetrieval: true` trong `lib/db.ts`.
**⚠️ Khi deploy:** tùy chọn này nhận khóa qua kênh chưa mã hóa. Cùng máy thì không sao; **MySQL ở máy khác thì phải dùng TLS (`ssl`)** thay cho nó.

### 2. ⭐ Sửa schema trong lúc dev server đang chạy → Prisma client cũ

**Đã dính HAI lần với hai triệu chứng khác hẳn nhau**, nên nhận mặt cho kỹ:

```
Unknown field `metrics` for include statement on model `Area`   ← thêm quan hệ
Cannot convert undefined or null to object                       ← thêm enum
```

Cùng một gốc: `prisma generate` ghi vào `node_modules`, mà **Turbopack không theo dõi `node_modules`** — tiến trình `next dev` đang chạy giữ nguyên client cũ. Cực kỳ dễ đi tìm nhầm chỗ, vì code đúng, schema đúng, `npx tsc` sạch, `npm run build` sạch, client trên đĩa cũng đúng. **Chỉ có tiến trình đang chạy là cũ.**

**Cách nhận ra trong 10 giây:**

```bash
node -e "console.log(require('@prisma/client').Prisma.dmmf.datamodel.models.find(m=>m.name==='Area').fields.map(f=>f.name).join(', '))"
```

Nếu trường bạn vừa thêm **có** trong kết quả mà app vẫn báo không có → chắc chắn là bẫy này.

**Đã bịt:**
- `predev` / `prestart` / `prebuild` đều chạy `prisma generate` trước → khởi động lại là chắc chắn sạch
- `db:push` in lời nhắc khởi động lại (`scripts/after-db-push.mjs`)
- Không dùng `Object.values` lên enum nữa; dùng `valuesOf<T>({...})` trong `formData.ts` — chỉ dùng *kiểu*, không dùng *giá trị* lúc chạy, và TypeScript bắt liệt kê đủ mọi nhánh

**Vẫn gặp thì:** tắt dev server, `rm -rf .next/dev`, chạy lại. Nhớ tắt bằng PowerShell — xem bẫy §7.4.

### 3. Sitemap đóng băng — bài mới không bao giờ vào Google
Next dựng `sitemap.xml` thành route **tĩnh**, đóng băng ở thời điểm build; `next build` lần sau còn khôi phục từ cache (`x-nextjs-cache: HIT`). Bài xuất bản hiện đủ trên `/blog` và trang chủ nhưng **không có trong sitemap**.
**Kiểu hỏng tệ nhất: không có lỗi nào để thấy, chỉ là mãi không ai vào đọc.**
**Đã sửa:** `export const dynamic = "force-dynamic"` trong `app/sitemap.ts`.

### 4. `pkill` không giết được process trên Windows
`pkill -f "next start"` báo thành công nhưng process vẫn sống, cổng vẫn bị giữ, và `next start` mới **im lặng chết** vì `EADDRINUSE`. Kết quả: đo nhầm server cũ và tưởng bản sửa không ăn thua. Đã mắc bẫy này **hai lần**.
**Cách đúng:**
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object -Expand OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }
```
**Luôn kiểm tra log server mới có `EADDRINUSE` không trước khi tin kết quả đo.**

### 5. Next 16 chỉ cho MỘT dev server mỗi thư mục
Chạy `next dev` thứ hai (dù khác cổng) sẽ bị từ chối. Muốn test song song thì dùng `next start` với bản build.

### 6. PowerShell chặn `npm`
Execution policy `Restricted` (mặc định Windows) chặn `npm.ps1`. Dùng `npm.cmd`, hoặc đổi policy sang `RemoteSigned` cho `CurrentUser`.

### 7. CV PDF: chữ mất tích mà không có lỗi nào (17/08/2026)

`lib/cv-pdf.ts` dựng file bằng `pdf-lib` — không có trình duyệt nào ở giữa để
tự bọc chữ hay tự đổi font. Hai kiểu hỏng, **cả hai đều im lặng**:

1. **Thiếu glyph.** Bản đầu dùng Noto Sans cho bản Việt. Noto Sans KHÔNG có
   `→`, mà `lib/projects.ts` có dòng *"Tối ưu UX/UI từ Figma → Angular"* —
   pdf-lib vẽ ra một ô trống chứ không ném lỗi. Đã bịt hai lớp: dùng **một bộ
   font duy nhất** (Noto Sans JP phủ cả Latin + dấu Việt + kana), và
   `assertGlyphs()` ném lỗi nếu còn ký tự nào không vẽ được.
2. ⭐ **Bộ cắt font làm hỏng glyph ghép.** `@pdf-lib/fontkit` (rẽ nhánh fontkit
   v1.1.1, 2019) cắt font sai ở glyph GHÉP — chữ có dấu là một glyph cơ sở cộng
   một glyph dấu, ghép bằng tham chiếu ID; cắt mà không kéo theo thành phần thì
   tham chiếu trỏ ra ngoài và glyph **không vẽ ra gì**. Đo trên đúng file đã
   sinh: `138 glyph → 61 có nét · 68 LỖI`. Kết quả là một file PDF mở được, đủ
   2 trang, đúng bề rộng từng dòng, mà **hơn nửa số chữ biến mất**.
   **Đã sửa:** `lib/cv-fontkit.ts` — lớp đệm cho pdf-lib dùng `fontkit` v2
   (chỉ thiếu đúng hàm `encodeStream()`). Sau khi sửa: `137 có nét · 0 lỗi`.
   **Bài học đắt hơn cả bug:** bộ kiểm đầu tiên báo "✓ sạch" trên chính file
   hỏng đó, vì nó đo bề rộng bằng font **gốc** còn thứ nằm trong PDF là font
   **đã cắt** — hai vật thể khác nhau. Muốn biết chữ có hiện ra không thì phải
   **đọc ngược font nhúng trong file PDF ra và đếm glyph có nét**.
3. **Tràn lề.** Thêm một dòng kỹ năng dài vào `lib/cv.ts` là chữ có thể chạy ra
   khỏi mép giấy.

`npm run check:cv` giờ kiểm cả ba: tràn lề · nét vẽ của font đã nhúng · bảng
ToUnicode (copy chữ + máy quét CV đọc được). Chạy sau mỗi lần sửa `lib/cv.ts`,
`lib/projects.ts`, hoặc nâng cấp `pdf-lib`/`fontkit`.

⚠️ `assets/fonts/*.ttf` (10.6MB) **phải được commit**. Thiếu file font thì
route `/api/cv/[lang]` chết ở lượt tải đầu tiên, và chỉ ở production.

### 8. Nội dung thu gọn bằng CSS vẫn bấm được bằng phím Tab

Thủ thuật `grid-rows-[0fr]` + `overflow-hidden` (dùng ở accordion Hành trình và
menu mobile) chỉ giấu nội dung khỏi MẮT. Nút bên trong vẫn nằm trong thứ tự Tab,
vẫn bấm được, trình đọc màn hình vẫn đọc hết. Phát hiện khi thử bằng script:
một cú bấm vào ô tháng của năm đang ĐÓNG vẫn đổi được trạng thái.
**Cách sửa:** `inert={!open}` trên khối bị thu gọn — nó cắt cả Tab lẫn chuột mà
KHÔNG phá hiệu ứng chuyển động, khác `hidden`.

---

## 8. 🔴 CHƯA LÀM

### Chặn việc sử dụng
| # | Việc | ~Giờ |
|---|---|---|
| 1 | 🔴 **Đổi mật khẩu `/os`** — vẫn là bản tạm. Không nằm trong repo, nhưng repo đã công khai nên phải đổi TRƯỚC khi deploy. Nhớ **khởi động lại server** sau khi sửa `.env`, nếu không tiến trình vẫn giữ giá trị cũ và triệu chứng là "đổi rồi mà vẫn sai". | 5' |
| 2 | 🔴 **Deploy** — hosting có MySQL → domain → HTTPS. ⚠️ MySQL ở máy khác thì phải bật TLS thay cho `allowPublicKeyRetrieval` (xem §7.1). | 4h |
| ~~3~~ | ~~Xóa dữ liệu mẫu~~ ✅ · ~~Commit + push~~ ✅ · ~~Điền `site.social`~~ ✅ — tất cả 06/08 | |

### Module còn thiếu
| Việc | ~Giờ | Ghi chú |
|---|---|---|
| ~~Tiền: chi phí cố định + tổng kết tháng + tỷ lệ tiết kiệm~~ | ✅ | `/os/money`. `FixedCost` + `MonthBudget`. Tính toán ở `lib/os/money.ts`, không chạm database. |
| ~~Cơ thể: ảnh tiến trình~~ | ✅ | Tab «Tiến trình» của lĩnh vực, xếp cũ → mới, ghi "+N ngày" giữa hai tấm. |
| ~~Giao diện quản lý Lĩnh vực~~ | ✅ | `/os/data` |
| ~~RSS · ảnh OG · dark mode~~ | ✅ | `/feed.xml` · `opengraph-image.tsx` · dark mode theo hệ điều hành |
| ~~Test cho `stats.ts` + `day.ts` + `period.ts`~~ | ✅ | `npm run test` — 77 phép, thêm cả `money.ts` |
| **Giấy tờ Nhật: hạn visa/在留カード + cảnh báo trước 60 ngày** | 3h | Đã đề xuất 05/08. **Chủ nhân từ chối ngày 06/08**: *"cái đó tôi tự viết blog chứ sao lại code"*. Ghi lại để lần sau đừng đề xuất lại — nhưng rủi ro thì vẫn là rủi ro thật, chỉ là chủ nhân chọn xử lý ngoài hệ thống. |

### Tầng 2 của Số đo — chưa làm, đòn bẩy lớn nhất còn lại
Nối `DailyLog` ↔ `Metric`: cho một số đo khai báo nó **tự lấy số từ trường nào
của DailyLog** (`jpMin`, `spend`, `workout`). Ghi nhật ký một lần là nhiều lĩnh
vực tự cập nhật, hết cảnh nhập hai nơi. ~3h. **Cố ý đợi**: chưa biết chủ nhân
thật sự ghi số nào mỗi ngày thì không nên xây đường ống cho một dòng chảy chưa
tồn tại.

### 🚫 CỐ Ý KHÔNG LÀM
`Life Score` · `Identity` · `Knowledge` (second brain) · **lịch hẹn giờ** (Google Calendar là nguồn duy nhất — `/os/calendar` chỉ là cam kết tuần, không có ô giờ, không có sự kiện) · multi-user · Supabase · AI tự tóm tắt tuần.

> Việc **chọn** cái gì đáng viết chính là phần có giá trị của quy trình.
> Tự động hóa nó là bỏ mất phần đó.

---

## 9. 👉 LÀM GÌ TIẾP THEO

**Thứ tự này quan trọng hơn nội dung từng việc.**

```
1. Đổi mật khẩu                          5 phút   ← CHƯA XONG
2. Deploy                                4 giờ    ← CHƯA XONG
3. ▶ DÙNG THẬT 1 THÁNG — 0 giờ code ◀
4. Sau đó: đọc lại, rồi mới quyết định làm gì
```

> **Ghi lại cho trung thực:** ngày 06/08 chủ nhân yêu cầu làm HẾT mọi tính năng
> trước rồi mới dùng, với lý do *"sau 1 tháng tôi sẽ biết web app cần update hay
> sửa gì"*. Điều đó đã làm xong. Nghĩa là §9 giờ chỉ còn đúng một việc thật:
> **dùng nó**. Không còn tính năng nào để trốn vào nữa.

### Vì sao bước 4 mới là bước khó nhất

Tính tới 06/08/2026: **1 ngày được ghi thật · 0 bài xuất bản · 0 điểm mock test
· 0 lần ghi số đo** (7 số đo đã lập). Dữ liệu mẫu đã xóa sạch, nên `/os` bây giờ
gần như trống — và **đó là trạng thái đúng**.

`OS-DESIGN.md` §9 gọi tên đúng cái bẫy ở đây: **vừa đủ đẹp để hài lòng, chưa đủ
dùng để có ích.** Hai ngày qua đã thêm rất nhiều tính năng; không tính năng nào
trong số đó tự nhập một con số cân nặng hộ chủ nhân.

Phép thử rẻ nhất cho toàn bộ thiết kế số đo: **ghi một con số thật vào một số đo
bất kỳ.** Nếu việc đó thấy phiền thì tầng 2 (nối tự động từ `DailyLog`) mới đáng
làm; nếu thấy nhẹ thì không cần làm gì thêm.

### Sau một tháng, hỏi ba câu

- Trường nào chưa bao giờ điền? → **xóa cột.**
- Trang nào chưa bao giờ mở? → **xóa khỏi nav.**
- Lúc nào muốn có thứ gì đó mà không có? → **đó** mới là backlog thật.

Rất có thể danh sách §8 sẽ **ngắn đi** chứ không dài ra.

---

## 10. Lời nhắc cho AI đọc file này

1. **Đừng thêm module mới trước khi bước 5 xong.** Chủ nhân có xu hướng muốn xây nhiều thứ cùng lúc và đã tự nhận điều đó; công việc của bạn là giúp phanh lại, không phải giúp tăng ga.
2. **Đừng viết thêm tài liệu.** `PLAN.md` đã 700+ dòng cho một app một người dùng. Viết tài liệu cho cảm giác giống tiến bộ và rẻ hơn nhiều so với việc ghi ba dòng lúc 11 giờ đêm. Cập nhật file này khi trạng thái đổi là đủ.
3. **Đừng tin dữ liệu trong DB là thật** — kiểm `prisma/.demo-days.json` và dấu `[demo]` trước khi kết luận "hệ thống đang được dùng".
4. **Kiểm chứng, đừng khẳng định.** Mọi bug trong §7 đều có triệu chứng chỉ sai hướng. Chạy thử và đo, đừng suy luận từ tên file.
5. **Không để lại dữ liệu bịa trong Life OS.** Nếu tạo bản ghi để test, xóa sạch sau đó — đây là nhật ký cá nhân thật, không phải môi trường sandbox.
6. Ngân sách của chủ nhân cho dự án này là **6 giờ/tuần**, và website xếp **ưu tiên #7** sau tiếng Nhật, trường học, việc/tiền, ngủ/cơ thể, career. Nếu một tuần nào code web nhiều hơn học tiếng Nhật thì đó là **thất bại của hệ thống**, không phải thành tích.
