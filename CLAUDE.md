@AGENTS.md

# iamvancuong.com

**Đọc [`docs/STATE.md`](docs/STATE.md) trước khi làm bất cứ việc gì.** Đó là trạng
thái thật của dự án: đang ở đâu, đã làm gì, còn gì, và — quan trọng nhất — tám
cái bẫy đã vấp mà triệu chứng của chúng không hề chỉ về nguyên nhân.

Trang cá nhân + Life OS riêng, **một người dùng duy nhất**. Next.js 16 · Prisma 7
· MySQL 8.4 trong Docker.

## Ba luật không được phá

1. **Mọi server action gọi `assertOwner()` ở dòng đầu.** Server Action là endpoint
   thật — `middleware.ts` KHÔNG chặn nó. Quên một hàm là thủng cả hệ thống.
2. **Ngày `@db.Date` luôn ở nửa đêm UTC.** Dùng `dayUTC()` / `isoUTC()` trong
   `lib/os/day.ts`, đọc bằng `getUTC*`. Thiếu hậu tố `Z` là lệch một ngày, vì
   JST là UTC+9.
3. **Không `Object.values()` lên enum của Prisma.** Dùng `valuesOf<T>({...})`
   trong `lib/os/formData.ts` — xem `STATE.md` §7.2 để biết vì sao.

## Sửa `prisma/schema.prisma` thì phải khởi động lại dev server

`prisma generate` ghi vào `node_modules`, mà Turbopack không theo dõi thư mục
đó — tiến trình đang chạy giữ client cũ và báo lỗi trông chẳng liên quan
(`Unknown field ...`, `Cannot convert undefined or null to object`) trong khi
`tsc` và `build` đều sạch. Đã dính hai lần. Chi tiết + cách nhận ra: `STATE.md` §7.2.

## Chạy

```bash
npm.cmd run dev
```

Trên PowerShell phải là `npm.cmd`, không phải `npm` (execution policy chặn
`npm.ps1`). Cần Docker Desktop bật; `predev` tự khởi động MySQL và chờ healthy.

## Chạy test

```bash
npm.cmd run test
```

77 phép kiểm cho `day` · `period` · `stats` · `money` — logic thuần, không
framework, không chạm database. Chạy nó trước khi đụng vào bốn file đó: đây là
chỗ sai **âm thầm** nhất, sai một phép cộng ngày thì không có lỗi nào hiện ra,
chỉ có một con số trông hợp lý mà sai.

## Trước khi thêm tính năng mới

Tính năng đã làm hết theo yêu cầu ngày 06/08 (`STATE.md` §8 gần như trống).
Sản phẩm **vẫn gần như chưa được dùng**: 1 ngày nhật ký thật, 0 lần ghi số đo.
Việc tiếp theo không phải là code; xem `STATE.md` §9. Ngân sách là 6 giờ/tuần
và website xếp ưu tiên #7 sau tiếng Nhật.
