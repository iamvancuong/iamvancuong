@AGENTS.md

# iamvancuong.com

**Đọc [`docs/STATE.md`](docs/STATE.md) trước khi làm bất cứ việc gì.** Đó là trạng
thái thật của dự án: đang ở đâu, đã làm gì, còn gì, và — quan trọng nhất — sáu
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

## Trước khi thêm tính năng mới

Dự án **chưa được dùng ngày nào** — dữ liệu trong database toàn là demo. Việc
tiếp theo không phải là code; xem `STATE.md` §9. Ngân sách là 6 giờ/tuần và
website xếp ưu tiên #7 sau tiếng Nhật.
