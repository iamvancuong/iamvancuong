# Hướng dẫn sử dụng — iamvancuong.com

> Dành cho **người dùng**, không phải cho người sửa code.
> Muốn biết dự án đang ở đâu thì đọc [`STATE.md`](STATE.md).
> Cập nhật 06/08/2026.

---

## 1. Bật lên và đăng nhập

Cần **Docker Desktop** đang chạy trước.

```bash
npm.cmd run dev
```

Mở `http://localhost:3000`. Trên PowerShell phải gõ `npm.cmd`, không phải `npm`.

Vùng riêng tư ở `/os`, bấm nút **Life OS** góc phải trên hoặc vào thẳng địa chỉ.
Đăng nhập một lần, cookie giữ **30 ngày**.

**Đổi mật khẩu:**

```bash
npm.cmd run hash-password
```

Nó in ra một dòng `OS_PASSWORD_HASH_B64="..."`. Mở `.env`, **thay** dòng cũ bằng
dòng đó (thay chứ không thêm — hai dòng cùng tên thì chỉ một dòng có tác dụng),
lưu lại, rồi **khởi động lại server**.

> ⚠️ Bước khởi động lại là bắt buộc. Chương trình chỉ đọc `.env` **một lần lúc
> mở**. Sửa file trong lúc server đang chạy thì mật khẩu mới bị từ chối còn mật
> khẩu cũ vẫn vào được — trông y như đổi hỏng, nhưng thật ra là chưa nạp.

---

## 2. Hai vùng, một cột

| | Ai xem được | Có gì |
|---|---|---|
| **Công khai** | mọi người | `/` · `/now` · `/blog` · `/journey` · `/photos` · `/projects` · `/about` |
| **Riêng tư** | chỉ bạn | `/os/*` |

Nối hai vùng bằng **đúng một ô tick**. Ký ức, ảnh và bài viết đều mặc định riêng
tư; tick "cho người khác xem" là nó hiện ra ngoài. Viết một lần, không copy qua
lại, không có hai bản lệch nhau.

---

## 3. Vòng lặp hằng ngày — 2 phút

Đây là phần duy nhất **phải làm đều**. Mọi thứ khác đều có thể bỏ.

1. Mở **Hôm nay** (`/os`).
2. Tick **ba việc nền tảng**: Ngủ trước 00:00 · Tiếng Nhật ≥ 60 phút · Ăn đủ 3
   bữa. Bấm là lưu ngay, không có nút Lưu.
3. Bấm **"Ghi nhật ký hôm nay →"** rồi điền số liệu và ba câu:
   *Hôm nay có gì? · Học được gì? · Mai đổi gì?*

Ô chữ lưu khi bạn rời khỏi ô. **Nếu ngày nào thấy điền mất quá ba phút thì đó là
lỗi thiết kế — bớt trường đi, đừng cố chịu đựng.**

### Bốn ô số trong nhật ký

| Ô | Nghĩa |
|---|---|
| Đi ngủ lúc | giờ, dạng `23:40` |
| Chi tiêu hôm nay | ¥ — **cộng thẳng vào trang Tiền**, không phải nhập lại |
| Tiếng Nhật | phút |
| IT | phút học lập trình |
| **Xây web này** | phút ngồi sửa chính trang này |

Ô cuối tồn tại để trả lời một câu duy nhất: *mình đang học, hay đang xây công cụ
để quản lý việc học?* Khi số phút xây web vượt số phút tiếng Nhật trong một tuần
(và ≥ 2 giờ), trang **Hôm nay** sẽ hiện cảnh báo. Đó là cảm biến quan trọng nhất
của cả hệ thống — điền thật thì nó mới có tác dụng.

### Ghi nhầm ngày?

Mở đúng ngày đó rồi bấm **"Xóa nhật ký ngày này"** ở cuối trang. Ký ức cùng ngày
không mất theo.

---

## 4. Bảy lĩnh vực

Mỗi lĩnh vực trả lời **đúng một câu hỏi** (hiện ngay dưới tên). Mỗi lĩnh vực có
tối đa 6 tab, và **tab nào trống thì bị giấu sau nút `+`** — bấm `+` để xem tab
đó dùng làm gì rồi mới mở.

| Tab | Dùng cho | Nhịp |
|---|---|---|
| **Mục tiêu** | cam kết tuần/tháng, hoặc mốc dài hạn theo tuổi | tuần |
| **Nguyên tắc** | cách mình muốn sống ở đây — không phải to-do, không tick | hiếm |
| **Đang dùng** | đồ/khóa học/công cụ: đang dùng · muốn thử · đã bỏ | tháng |
| **Số đo** | một con số theo thời gian, có biểu đồ | tuần/tháng |
| **Ký ức** | chuyện đã xảy ra, có ảnh, ngày lùi được về tuổi thơ | khi có |
| **Tiến trình** | ảnh chụp theo chu kỳ — da, tóc, cơ thể | tháng |

### Mục tiêu — hai loại khác hẳn nhau

- **Cam kết có kỳ** (Tuần/Tháng): hết kỳ thì **chấm ba mức** (đạt · một phần ·
  không đạt) và viết **ba câu**: chuyện gì · **vì sao** · kỳ sau đổi gì. Có nút
  *làm lại kỳ sau*. Phần giá trị nhất là câu "vì sao" — đạt hay không đạt một
  tuần thì ít nghĩa, biết vì sao mới đổi được tuần sau.
- **Mốc dài hạn** (Năm nay / Năm sau / Tuổi / Cả đời): tick xong, hoặc bỏ kèm lý
  do. Chọn "30 tuổi" là nó tự hiện ngày và còn bao lâu.

### Số đo

Một con số có **tên · đơn vị · đích · hướng tốt**. Hướng quyết định màu đường:
chi tiêu tăng thì đỏ, điểm thi tăng thì xanh.

- Ghi lại **cùng một ngày là đè lên**, không tạo dòng thứ hai. Gõ nhầm thì ghi
  lại đúng ngày đó là xong.
- Trục ngang **tỉ lệ theo ngày thật** — hai lần đo cách nhau 3 tháng nhìn ra là xa.
- Ô **nhóm** để gom số đo cùng loại (`JLPT`, `Trên lớp`, `Ra thị trường`). Nhóm
  không chỉ cho gọn: nó nói rõ **cái gì không so được với cái gì** — điểm thi thử
  thang /180 mỗi tháng và điểm kiểm tra trên lớp mỗi tuần để chung một chỗ thì mắt
  sẽ tự so hai đường, mà so là vô nghĩa.

Hiện có sẵn 7 số đo ở 4 lĩnh vực. Ba lĩnh vực **Tình yêu · Gia đình · Bản thân
cố ý không có số đo** — không phải quên. Đo tình cảm bằng số là hỏng; thứ quan
sát được ở đó là **hành động đã làm**, ghi thành Ký ức.

### Tiến trình

Ảnh chụp cùng một góc, cùng ánh sáng, **mỗi tháng một lần**. Xếp cũ → mới và ghi
"+N ngày" giữa hai tấm.

Vì sao nó đáng làm: bạn nhìn mình mỗi ngày nên **không bao giờ thấy mình đổi**,
và trí nhớ về ngoại hình của chính mình là thứ kém tin cậy nhất. Với da/tóc/cơ
thể thì **ảnh chính là biểu đồ**. Ngày lấy từ EXIF nên chụp hôm nay mai tải lên
vẫn tính đúng ngày chụp. Luôn riêng tư.

---

## 5. Các trang khác trong `/os`

| Trang | Dùng khi |
|---|---|
| **Nhật ký** | xem lại các ngày đã ghi, gộp cả ký ức cùng ngày |
| **Lịch** | nhìn cả tháng theo tuần, ô ngày đậm nhạt theo số việc nền tảng |
| **Focus** | NOW / NEXT / LATER / **NO**. Trần **3 việc NOW**, ép ở máy chủ nên không lách được |
| **Tiền** | tổng kết tháng — xem §6 |
| **Muốn hướng tới** | mọi mục tiêu xếp theo mốc tuổi |
| **Hành trình** | mọi ký ức theo dòng thời gian |
| **Viết** | danh sách bài + nút "viết thành bài" từ ngày đã đánh dấu |
| **Dữ liệu & lĩnh vực** | thêm/sửa/ẩn lĩnh vực · thống kê · tải sao lưu |

Cột **NO** trong Focus không phải thùng rác — nó là danh sách *chủ động không
làm*, và đọc lại nó sáu tháng sau có ích ngang danh sách đang làm.

---

## 6. Trang Tiền

`/os/money`. Ba nguồn số, chỉ **một** phải tự khai:

| Nguồn | Ở đâu |
|---|---|
| Chi hằng ngày | tự cộng từ ô «Chi tiêu» trong nhật ký |
| Chi cố định | danh sách ở cuối trang Tiền |
| **Thu nhập** | **bạn tự nhập**, ngay trong bảng 12 tháng |

**Chi phí cố định** = tiền nhà · điện thoại · bảo hiểm · vé tàu tháng. Để riêng
khỏi chi tiêu hằng ngày vì đây không phải quyết định mỗi ngày — trộn chung thì
phần bạn *thật sự chọn được* sẽ bị chôn dưới tiền nhà.

- Khoản trả **mỗi năm** tự chia 12.
- Ngừng trả thì bấm **"dừng từ hôm nay"**, đừng xóa. Xóa làm mọi tháng cũ bỗng
  rẻ đi và lịch sử chi tiêu thành nói dối.
- Ô thu nhập **để trống nghĩa là chưa khai**, khác hẳn ghi 0.

Trang cũng hiện **sàn cố định × 3** — đúng cái đích mà số đo «Quỹ khẩn cấp» ghi
là *"= 3 tháng chi phí"*.

---

## 7. Từ nhật ký ra bài blog

```
Sống → ghi vào /os → tick "đáng viết thành bài" → /os/write → xuất bản
```

Trong nhật ký ngày có ô **"Đáng viết thành bài blog"**. Cuối tuần vào **Viết**,
những ngày đã đánh dấu nằm sẵn đó với nút *viết thành bài*.

Bài mặc định **riêng tư**. Xuất bản rồi thì nó hiện ở `/blog`, trang chủ,
`sitemap.xml` và `/feed.xml` **ngay lập tức**, không cần build lại. Gỡ xuống
cũng vậy.

Bài có thể có **bản tiếng Nhật** (`/blog/<slug>/ja`) — để trống thì trang đó
không tồn tại.

> Việc **chọn** cái gì đáng viết chính là phần có giá trị. Đừng tìm cách tự động
> hóa nó.

---

## 8. Ảnh

- Tự nén sang WebP, không cần chỉnh trước khi tải lên.
- **Không nằm trong database** — file thật ở thư mục `uploads/YYYY/MM/`.
- Ảnh riêng tư người lạ **không mở được** kể cả khi có đúng đường dẫn.
- Trong một ký ức, **tấm đầu tiên là tấm đại diện** — dùng nút lên/xuống để đổi.

⚠️ **Sao lưu JSON không kèm ảnh.** Muốn an toàn thì copy cả thư mục `uploads`
sang OneDrive.

---

## 9. Sửa thông tin cá nhân

Tất cả nằm trong **`lib/site.ts`** — tên, tagline, mô tả, ngày sinh, và 6 link
mạng xã hội ở footer. Sửa một dòng ở đó là cả site đổi theo: footer, thẻ chia sẻ
lên Messenger/Zalo, RSS, và các mốc tuổi trong `/os`.

Link nào để **chuỗi rỗng** thì tự biến mất khỏi footer. Thứ tự khai trong file
chính là thứ tự hiện ra.

⚠️ Ngày sinh (`birthDate`) dùng để tính tuổi và mọi mốc "25 tuổi / 30 tuổi" —
sửa nó là các mục tiêu theo tuổi đổi ngày theo.

---

## 10. Giao diện sáng / tối

Nút ở góc phải trên, cạnh nút **Life OS**. Bấm để đi vòng qua **ba** trạng thái:

| Icon | Nghĩa |
|---|---|
| 🖥 màn hình | **Theo hệ thống** — mặc định. Máy chuyển tối buổi tối thì trang chuyển theo. |
| ☀️ mặt trời | **Luôn sáng**, kể cả khi máy đang để tối |
| 🌙 mặt trăng | **Luôn tối**, kể cả khi máy đang để sáng |

Ba trạng thái chứ không phải hai: nếu chỉ bật/tắt thì lần đầu bấm là mất luôn
khả năng đi theo cài đặt máy — mà đó mới là thứ đúng phần lớn thời gian.

Lựa chọn nhớ trong trình duyệt và **không chớp màu khi tải lại**. Mỗi trình
duyệt / mỗi máy nhớ riêng, vì nó là lựa chọn hiển thị chứ không phải dữ liệu.

---

## 11. Ba điều dễ nhầm

**① Sửa `.env` xong phải khởi động lại server.** Áp dụng cho mật khẩu và mọi
biến khác. Không khởi động lại thì giá trị cũ vẫn được dùng.

**② Sửa file trong `prisma/` xong cũng phải khởi động lại server.** Triệu chứng
nếu quên là những lỗi trông chẳng liên quan gì (`Unknown field ...`).

**③ Trước khi tin một con số, xem cột "N ngày đã ghi".** Tháng chưa ghi ngày nào
thì chi tiêu bằng 0 — đó là *chưa ghi*, không phải *không tiêu*.

---

## 12. Sao lưu

Vào **Dữ liệu & lĩnh vực** → **Tải JSON toàn bộ**. Kèm theo copy thư mục
`uploads`. Mức thấp hơn:

```bash
docker exec vancuong_mysql mysqldump -ucuong -pdevpass iamvancuong > backup.sql
```

---

## 13. Nếu chỉ nhớ được một điều

Hệ thống này **không tự làm gì cho bạn**. Nó chỉ có ích khi có dữ liệu thật, mà
dữ liệu thật chỉ đến từ hai phút mỗi tối.

Hiện có **1 ngày** được ghi và **0 lần ghi số đo**. Việc đáng làm nhất bây giờ
không phải thêm tính năng nào — mà là ghi ngày thứ hai.
