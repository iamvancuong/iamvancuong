#!/usr/bin/env bash
# Deploy trên server (cPanel + Passenger). Chạy: bash deploy.sh
#
# Server này KHÔNG build được (glibc cũ hơn Next 16 cần) nên .next được build
# ở máy local rồi commit vào git. Script chỉ kéo bản mới về + vá quyền + restart.
#
# Quy trình mỗi lần đổi CODE:
#   Máy local:  npm run build  →  git add -A  →  git commit  →  git push
#   Server:     bash deploy.sh
set -e
cd "$(dirname "$0")"

echo "→ Kéo code mới từ git..."
git pull --ff-only

# ⚠️ Bước này thiếu tới 12/08/2026 và đã làm production chết một lần.
#
# `.next` KHÔNG gộp @prisma/client vào bản build — nó `require("@prisma/client")`
# lúc chạy, tức là lấy từ `node_modules`, mà `node_modules` không nằm trong git.
# Nên `git pull` mang schema mới về nhưng client trên server vẫn là bản cũ:
# `db.dayTask` là `undefined`, server ném lỗi, còn TRÌNH DUYỆT chỉ thấy
# "Minified React error #441" — một mã đã bị xóa sạch nội dung, không hề chỉ về
# Prisma. Đó là bản sao production của bẫy STATE.md §7.2.
#
# Chạy vô điều kiện: khi schema không đổi thì lệnh này chỉ tốn ~1 giây.
echo "→ Sinh lại Prisma client (schema có thể đã đổi)..."
if [ -f node_modules/prisma/build/index.js ]; then
  node node_modules/prisma/build/index.js generate
else
  echo "  ⚠️  KHÔNG thấy prisma CLI — devDependency đã bị lược bỏ khi cài."
  echo "     Nếu lần này CÓ đổi prisma/schema.prisma thì app sẽ chạy client CŨ"
  echo "     và lỗi hiện ra sẽ trông chẳng liên quan gì tới Prisma."
  echo "     Xử: cPanel → Setup Node.js App → Run NPM Install → Restart."
fi

echo "→ Vá quyền .next (Passenger cần đọc được)..."
find .next -type d -exec chmod 755 {} \;
find .next -type f -exec chmod 644 {} \;

echo "→ Restart app..."
mkdir -p tmp && touch tmp/restart.txt

echo "✓ Xong. App đang khởi động lại — thử lại web sau vài giây."
