# Life OS — thiết kế lại theo lĩnh vực

> Bản v2, thay cho phần `/os` trong PLAN.md §9
> 2026-08-04 — **đã dựng xong toàn bộ, xem §9**

---

## 0. Chỗ tôi làm sai ở bản trước

Bản v1 tôi dựng một **máy đo chỉ số**: ngủ mấy giờ, học mấy phút, tập mấy buổi.

Nó trả lời được câu *"hôm nay tôi có kỷ luật không"*, nhưng không trả lời được câu quan trọng hơn:

> **"Tôi đang đi đúng con đường mình chọn không?"**

Con số không trả lời được câu đó. Chỉ có **lĩnh vực** mới trả lời được — vì mỗi lĩnh vực chứa: mình muốn trở thành gì ở đó, mình sống theo nguyên tắc nào, và mình đã đi qua những gì.

Bản v2 lấy **lĩnh vực làm trung tâm**. Chỉ số tụt xuống thành một phần nhỏ bên trong, không còn là cả hệ thống.

---

## 1. Ý tưởng trung tâm

Nếu làm 7 lĩnh vực thành 7 module riêng thì đó là 7 lần công sức, và thêm lĩnh vực thứ 8 là lần thứ 8. Không bền.

Thay vào đó:

> **7 lĩnh vực × 4 loại nội dung dùng chung = 1 bộ code.**

Mỗi lĩnh vực là một **dòng trong database**, không phải một thư mục code. Thêm "Sức khỏe tinh thần" hay "Bạn bè" sau này = thêm một dòng, **không viết thêm dòng code nào**.

Đây không chỉ là chuyện đẹp về kỹ thuật. Đây là thứ giữ cho dự án đủ nhỏ để bạn làm xong — vì website vẫn là ưu tiên #7, sau tiếng Nhật.

```
        ┌──── Mục tiêu ────┐  điều tôi muốn đạt ở lĩnh vực này
LĨNH    ├──── Nguyên tắc ──┤  tôi sống thế nào ở lĩnh vực này
VỰC  ×  ├──── Đang dùng ───┤  thứ tôi dùng / học / theo
        └──── Ký ức ───────┘  chuyện đã xảy ra, kèm ảnh
```

---

## 2. Bảy lĩnh vực

| Lĩnh vực | Câu hỏi nó trả lời |
|---|---|
| **Tiếng Nhật** | Tôi đang ở đâu trên đường tới N2? |
| **Công việc** | Tôi có đang tiến gần một công việc IT ở Nhật không? |
| **Bản thân** | Tôi đang chăm mình thế nào — da, tóc, quần áo, răng, cơ thể? |
| **Tình yêu** | Tôi muốn đối xử với người mình yêu ra sao? |
| **Gia đình** | Tôi làm gì cho bố mẹ, và bao lâu rồi tôi chưa gọi về? |
| **Tiền** | Tôi đang đứng ở đâu về tài chính? |
| **Sức khỏe** | Cơ thể tôi có đang khỏe lên không? |

Danh sách này **nằm trong database, không nằm trong code**. Bỏ bớt hoặc thêm vào lúc nào cũng được.

### Hai thứ KHÔNG phải lĩnh vực

Bạn liệt kê *"Con người muốn hướng tới"* và *"Hành trình của tôi"* cùng hàng với các mục kia. Tôi cho rằng nên tách ra — chúng không phải lĩnh vực, chúng là **cách nhìn xuyên qua tất cả lĩnh vực**:

**「Con người muốn hướng tới」= tất cả mục tiêu, xếp theo mốc tuổi.**
Mục tiêu 25 tuổi của bạn không chỉ nằm ở một lĩnh vực — nó gồm tiếng Nhật, công việc, tình yêu, tiền. Nên trang này gom mọi mục tiêu lại rồi xếp theo mốc thời gian, chứ không phải một kho riêng.

**「Hành trình của tôi」= tất cả ký ức, xếp theo thời gian.**
Ngày bạn sang Nhật vừa thuộc *Hành trình*, vừa thuộc *Công việc*, vừa thuộc *Gia đình*. Nếu tách riêng, bạn sẽ phải nhập hai lần và sớm muộn hai bên lệch nhau.

Ghi **một lần** vào lĩnh vực, hiện ra ở **cả hai** chỗ. Đây là nguyên tắc xuyên suốt cả hệ thống: *một thông tin chỉ nhập một lần*.

---

## 3. Bốn loại nội dung

Tôi cân nhắc khá lâu con số này. Ba loại thì thiếu, năm loại thì bắt đầu chồng lấn. Bốn là chỗ vừa.

### ① Mục tiêu — *tôi muốn tới đâu*

Có **hai loại**, cùng một bảng nhưng khác hẳn nhau về bản chất:

| | Cam kết có kỳ | Mốc dài hạn |
|---|---|---|
| Mốc | Tuần · Tháng | Năm nay · Năm sau · Tuổi · Cả đời |
| Thuộc về | đúng một tuần/tháng cụ thể | không có ngày kết thúc |
| Kết thúc bằng | **chấm kết quả + viết lại** | tick xong, hoặc bỏ kèm lý do |
| Ví dụ | *tuần này chi dưới 10.000¥* · *tuần này không uống nước ngọt* | *đậu N2* · *25 tuổi đang đi làm IT ở Nhật* |

**Vì sao cam kết phải có kỳ.** "Tuần này không uống nước ngọt" mà không gắn với một tuần cụ thể thì tuần sau mở lên vẫn thấy dòng đó, không biết nó nói về tuần nào, và danh sách sớm thành một đống xác. Nên mỗi cam kết mang một `periodStart` — thứ Hai của tuần, hoặc ngày 1 của tháng. Nhập ngày nào trong kỳ cũng được, hệ thống tự nắn về đầu kỳ.

**Hết kỳ thì chấm ba mức: đạt · một phần · không đạt.** Có mức giữa vì phần lớn tuần thật nằm ở đó — ép về đúng/sai chỉ khiến người ta ngại chấm rồi bỏ luôn.

**Và viết lại ba câu** — cố ý giống hệt nhật ký ngày để khỏi phải học thêm khung tư duy thứ hai:

```
Chuyện gì đã xảy ra?          Ba ngày đầu ổn, tới thứ Năm thì…
Điều gì khiến mình không đạt?  ← ô đáng giá nhất
Kỳ sau đổi gì?
```

Câu thứ hai là lý do cả tính năng này tồn tại. Biết "tuần này không đạt" thì tuần sau vẫn thế; biết "không đạt vì đi ăn ngoài mặc định người ta gọi nước ngọt, mình ngại gọi riêng" thì mới có thứ cụ thể để sửa.

**Nút «làm lại kỳ sau»** chép cam kết sang tuần/tháng kế tiếp, **không chép phần tự sự** — kỳ mới bắt đầu trắng, bài học cũ nằm lại đúng chỗ của nó. Không có nút này thì mỗi tuần phải gõ lại từ đầu, và sau ba tuần là bỏ.

#### Trang Lịch — `/os/calendar`

Lịch tháng nhưng **đọc theo tuần**: mỗi hàng là một tuần, bên trái là bảy ô ngày tô đậm nhạt theo số việc nền tảng đã làm, bên phải là cam kết của chính tuần đó.

Lưới ngày thuần không diễn tả được cam kết, vì cam kết thuộc về cả tuần chứ không thuộc một ngày. Đặt hai thứ cạnh nhau thì thấy được điều khó thấy nhất: **tuần mình hứa nhiều nhất có phải tuần mình sống tốt nhất không.**

---

#### Mốc dài hạn — phần đã có từ đầu

Mốc thời gian tính theo **tuổi**, không phải theo năm. Bạn sinh **06/07/2003**, nên hệ thống tự biết:

```
Hôm nay bạn 23 tuổi 0 tháng
25 tuổi  →  06/07/2028   ·  còn 1 năm 11 tháng
30 tuổi  →  06/07/2033   ·  còn 6 năm 11 tháng
```

Đặt mục tiêu theo tuổi làm nó thật hơn hẳn so với "mục tiêu 3 năm". *"Năm 25 tuổi tôi muốn đang đi làm IT ở Nhật"* — và hệ thống nói thẳng: còn 1 năm 11 tháng.

Mỗi mục tiêu có: `lĩnh vực · mốc (năm nay / năm sau / 25 tuổi / 30 tuổi / cả đời) · vì sao · trạng thái`.
Cho phép trạng thái **"đã bỏ"** — bỏ mục tiêu đúng lúc là kỹ năng, không phải thất bại. Có ô ghi lý do bỏ.

### ② Nguyên tắc — *tôi sống thế nào*

Đây là loại tôi thiếu hoàn toàn ở bản v1, và với những gì bạn mô tả thì nó có khi là loại **quan trọng nhất**.

Hai chiều: **NÊN** và **KHÔNG NÊN**.

```
Tình yêu
  NÊN        Nói ra điều mình cần, đừng bắt người ta đoán
  NÊN        Cãi nhau xong phải chốt lại, không để lửng lơ
  KHÔNG      Không im lặng bỏ đi giữa lúc đang nói chuyện
  KHÔNG      Không đem chuyện của hai người ra kể với người thứ ba

Bản thân
  NÊN        Ngủ trước 12h
  KHÔNG      Không mua quần áo chỉ vì đang giảm giá
```

Nguyên tắc **không phải to-do**. Bạn không tick nó mỗi ngày. Nó là thứ bạn **đọc lại** khi đang phân vân — và đó chính là lúc người ta hay đi chệch đường.

Dashboard sẽ đưa ngẫu nhiên một nguyên tắc ra mỗi ngày. Đọc mất ba giây, nhưng đó là cách duy nhất để những dòng này không thành chữ chết.

### ③ Đang dùng — *thứ tôi đang theo*

Skincare, dầu gội, quần áo, giáo trình tiếng Nhật, khóa học, công cụ code.

Mỗi thứ có `trạng thái` — **đang dùng / đã bỏ / muốn thử** — và quan trọng nhất là ô **kết luận**:

```
CeraVe Foaming Cleanser   đang dùng   từ 03/2026
  → Da đỡ dầu hẳn sau 3 tuần. Giữ.

Dầu gội X                 đã bỏ       03–05/2026
  → Dùng 2 tháng không thấy khác gì. Không mua lại.
```

Phần "đã bỏ" mới là phần có giá trị. Sáu tháng nữa bạn nhìn lại sẽ biết mình **đã thử gì rồi**, khỏi mua lại thứ từng vô dụng. Không có nó thì bạn cứ quay vòng mãi.

### ④ Ký ức — *chuyện đã xảy ra*, **có ảnh**

Ngày tháng tự do — **lùi được về tận tuổi thơ ở Quảng Trị**, không chỉ từ hôm nay trở đi.

Mỗi ký ức có: `ngày · tiêu đề · kể lại · lĩnh vực · ảnh · học được gì · công khai hay riêng tư`.

Đây là nơi ảnh sống. Và là nguyên liệu cho blog.

---

## 4. Cơ chế công khai / riêng tư

Đây là câu trả lời cho *"vừa là nơi riêng của tôi, vừa là nơi chia sẻ"*.

**Mọi thứ mặc định RIÊNG TƯ.** Mỗi ký ức, mỗi ảnh, mỗi bài viết có một ô tick:

```
[ ] Cho người khác xem
```

Tick vào thì nó hiện ở phần public. Không tick thì chỉ mình bạn thấy.

Nghĩa là:

```
Viết một lần ở /os
        │
        ├── không tick  →  chỉ mình bạn
        └── tick        →  hiện trên iamvancuong.com
```

Bạn không phải viết hai lần, không phải copy qua lại. Nhật ký riêng và blog công khai **là cùng một kho**, chỉ khác cái tick.

Blog cũng vậy: bài có `visibility = private` thì chỉ hiện khi bạn đã đăng nhập. Đó chính là "blog riêng tôi xem" — không cần hệ thống thứ hai.

---

## 5. Ảnh

Bạn nói sẽ up nhiều ảnh, nên phần này phải làm cho tử tế ngay từ đầu.

**Ảnh không lưu trong database.** Database chỉ giữ đường dẫn + chú thích. File thật nằm ở object storage (Cloudflare R2 hoặc thư mục trên hosting của bạn sau này).

Lý do: nhồi ảnh vào MySQL làm database phình to, backup chậm kinh khủng, và không có CDN nên trang tải rất chậm.

Mỗi ảnh: `đường dẫn · chú thích · ngày chụp · gắn với ký ức/lĩnh vực nào · công khai hay không`.

Xử lý khi upload: nén sang **WebP**, tạo thêm bản thumbnail nhỏ cho trang lưới. Ảnh điện thoại giờ 4–8MB/tấm, up thẳng vài trăm tấm là trang chết.

---

## 6. Database

Bạn chọn **MySQL** — được, và tôi sẽ dùng **Prisma** làm ORM. Prisma quan trọng vì hai lý do:

1. Đổi hosting hay đổi sang Postgres sau này chỉ là sửa **một dòng** cấu hình.
2. Nó sinh ra kiểu TypeScript từ schema, nên gõ sai tên cột là báo lỗi ngay lúc code chứ không phải lúc chạy.

Schema đầy đủ nằm ở [`prisma/schema.prisma`](../prisma/schema.prisma). Tóm tắt:

```
Area          7 lĩnh vực — thêm/bớt bằng cách sửa dữ liệu, không sửa code
 ├── Goal          mục tiêu, mốc theo tuổi
 ├── Principle     nguyên tắc NÊN / KHÔNG NÊN
 ├── Item          thứ đang dùng / đã bỏ / muốn thử
 └── Memory        ký ức, có ngày tự do, có ảnh
       └── Photo   ảnh (chỉ lưu đường dẫn)

FocusItem     NOW / NEXT / LATER / NO  (giữ nguyên từ v1)
DailyLog      chỉ số hằng ngày         (giữ nguyên, thu nhỏ lại)
Tag           chủ đề bài viết — tạo mới lúc viết, /blog tự có bộ lọc
Post          blog, public hoặc private
```

**Chuyển sang database ngay bây giờ là đúng thời điểm.** Hiện tại bạn chưa có dữ liệu thật nào trong localStorage, nên đổi gần như không mất gì. Để hai tháng nữa mới đổi thì phải viết script migrate và rất dễ mất dữ liệu.

---

## 7. Đăng nhập

Có database thật thì **bắt buộc phải có đăng nhập thật** — dữ liệu giờ nằm trên server, không còn nằm trong máy bạn nữa.

Một người dùng duy nhất, nên không cần Auth.js hay OAuth cho phức tạp:

- Một mật khẩu, lưu dạng **băm (hash)** trong biến môi trường
- Đăng nhập xong đặt **cookie httpOnly**, hạn 30 ngày
- `middleware.ts` chặn mọi đường dẫn `/os/*`
- Nội dung `private` cũng dùng chính cookie đó để quyết định hiện hay ẩn

Khoảng 80 dòng code, không thêm thư viện nào. Đủ chắc cho một site cá nhân.

---

## 8. Cấu trúc trang

### Riêng tư — cần đăng nhập

```
/os                     Hôm nay: đang tập trung · cam kết kỳ này · kỳ đã qua chưa chấm ·
                        3 việc nền tảng · một nguyên tắc mỗi ngày
/os/a/[lĩnh vực]        Trang lĩnh vực — 4 tab: Mục tiêu · Nguyên tắc · Đang dùng · Ký ức
/os/calendar            Lịch tháng đọc theo tuần — cam kết tuần đặt cạnh ngày đã sống
/os/goals               「Con người muốn hướng tới」— mọi mục tiêu xếp theo mốc tuổi
/os/journey             「Hành trình của tôi」— mọi ký ức theo dòng thời gian, có ảnh
/os/focus               NOW / NEXT / LATER / NO
/os/log                 Nhật ký ngày
/os/write               Viết blog, chọn công khai hay riêng tư
/os/data                Thống kê + tải backup
```

Chỉ có **một** file code cho `/os/a/[lĩnh vực]`. Bảy lĩnh vực dùng chung nó. Thêm lĩnh vực thứ tám thì file đó vẫn thế.

### Công khai

```
/journey                Hành trình — chỉ những ký ức đã tick công khai
/photos                 Ảnh — chỉ ảnh đã tick công khai
/blog                   Bài viết công khai (đăng nhập rồi thì thấy cả bài riêng tư)
/now  /about  /projects Giữ nguyên
```

---

## 9. Lộ trình — ĐÃ XONG toàn bộ (2026-08-04)

| # | Việc | Trạng thái |
|---|---|---|
| **N1** | Prisma + MySQL + schema + 7 lĩnh vực mẫu | ✅ |
| **N2** | Đăng nhập + middleware chặn `/os` | ✅ |
| **N3** | Trang lĩnh vực dùng chung + Mục tiêu / Nguyên tắc / Đang dùng | ✅ |
| **N4** | Ký ức + upload ảnh + nén WebP | ✅ |
| **N5** | `/os/goals` theo mốc tuổi · `/os/journey` timeline | ✅ |
| **N6** | `/journey` `/photos` công khai | ✅ |
| **N7** | Focus + Nhật ký chuyển sang database, bỏ hẳn localStorage | ✅ |
| **N8** | Blog công khai/riêng tư, viết ngay trong `/os` | ✅ |
| **+** | Chủ đề thành bảng `Tag` · trình soạn thảo có thanh công cụ và xem trước | ✅ |
| **+** | Sửa được mọi thứ đã ghi · xóa có hỏi lại · ô đo mục tiêu · lý do khi bỏ · chú thích ảnh · nút «viết thành bài» | ✅ |
| — | **Dùng thật 3 tuần trước khi thêm gì** | ⬜ **chưa bắt đầu** |

Việc còn lại và thứ tự ưu tiên: xem [`PLAN.md` §15](PLAN.md).

### Ba chỗ làm khác thiết kế ban đầu — và vì sao

**Prisma 7 thay vì cấu hình quen thuộc.** Bản 7 bỏ `url` khỏi `schema.prisma`, chuyển sang `prisma.config.ts` + driver adapter. Kết nối MySQL đi qua `@prisma/adapter-mariadb`.

**MySQL chạy trong Docker.** Máy chưa cài MySQL nhưng có sẵn Docker, nên dùng container: không phải cài gì vào máy, xóa đi cũng sạch. Đổi sang hosting sau này chỉ là sửa `DATABASE_URL`.

**Có một quãng dùng localStorage rồi bỏ.** Life OS v1 chạy trên localStorage trước khi bạn chọn MySQL. Toàn bộ tầng đó đã bị xóa ở N7. Ghi lại đây để sau này đọc git log khỏi thắc mắc.

### Đã dựng xong nhưng chưa dùng

Số ngày bạn thật sự ghi, tính tới 2026-08-05: **0.**

Database đang có 67 ngày nhật ký, 11 ký ức, 13 ảnh và 9 việc trong Focus — nhưng **tất cả đều do `npm run db:demo` sinh ra**, không dòng nào của bạn. Chuỗi ngày, lịch nhiệt, thống kê tháng: đều là số của một người không có thật.

Đó là chỗ nguy hiểm nhất hiện giờ. Không phải vì dữ liệu mẫu sai — nó có ích lúc dựng giao diện — mà vì mở `/os` bây giờ **thấy giống hệt một hệ thống đang chạy**. Cảm giác đó thay thế mất việc thật.

```
npm run db:demo:clear
```

Chạy dòng đó trước ngày đầu tiên. Bắt đầu từ số 0 thật thì con số sau đó mới có nghĩa.

Hệ thống đang ở đúng trạng thái nguy hiểm nhất: **vừa đủ đẹp để hài lòng, chưa đủ dùng để có ích.** Việc tiếp theo không phải là code.

---

## 10. Điều tôi lo, và cách xử lý

**Lo:** 7 lĩnh vực × 4 loại = 28 chỗ trống. Nhìn vào 28 ô trống là nản, và bạn sẽ có xu hướng đi điền cho đầy — đúng cái bẫy "làm quá nhiều thứ cùng lúc" mà cả hệ thống này sinh ra để tránh.

**Cách xử lý:**

1. **Không lĩnh vực nào bắt buộc phải có nội dung.** Lĩnh vực trống hiện chữ *"Chưa có gì ở đây — chưa cần thiết"*, không phải cảnh báo đỏ.
2. **Điền theo nhu cầu, không điền cho đủ.** Sáu tháng nữa mà *Tình yêu* vẫn trống thì hoàn toàn ổn.
3. **Dashboard chỉ hiện lĩnh vực đang có việc ở NOW.** Bốn lĩnh vực còn lại vẫn nằm đó, im lặng.
4. **Cảnh báo "xây hệ thống thay vì dùng hệ thống" giữ nguyên** — giờ càng cần, vì phần code sắp tới lớn hơn nhiều.

Một hệ thống tốt phải chịu được việc bị bỏ trống. Nếu nó bắt bạn phải chăm nó thì nó đã thành một mục tiêu thứ tám rồi.
