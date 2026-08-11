#!/usr/bin/env bash
# Deploy trên server (cPanel + Passenger). Chạy: bash deploy.sh
#
# Server này KHÔNG build được (glibc cũ hơn Next 16 cần) nên .next được build
# ở máy local rồi commit vào git. Script chỉ kéo bản mới về + sinh lại Prisma
# client + vá quyền + restart.
#
# Quy trình mỗi lần đổi CODE:
#   Máy local:  npm run build  →  git add -A  →  git commit  →  git push
#   Server:     bash deploy.sh
#
# Đổi SCHEMA thì chạy file SQL trên phpMyAdmin TRƯỚC — xem DEPLOY.md §2b.
set -e
cd "$(dirname "$0")"

# ---------------------------------------------------------------- kéo code
#
# ⚠️ `git pull` GHI ĐÈ CHÍNH FILE NÀY khi bản mới có sửa deploy.sh.
#
# Bash không nạp cả script vào bộ nhớ — nó đọc theo vị trí byte và đọc tiếp
# sau mỗi lệnh. File bị thay giữa chừng thì phần còn lại được đọc từ **file
# mới tại vị trí byte cũ**, tức là nhảy vào giữa dòng, bỏ qua nguyên một khối,
# hoặc chạy một lệnh cắt đôi. Đã dính đúng lần 12/08/2026: khối `prisma
# generate` vừa thêm bị bỏ qua hoàn toàn mà không có lỗi nào — deploy báo
# "✓ Xong" trong khi app vẫn chết.
#
# Cách xử: kéo code xong thì **nạp lại chính mình từ đầu** bằng `exec`. Lần
# hai biến DEPLOY_REEXEC đã đặt nên không kéo nữa, và toàn bộ phần dưới chắc
# chắn là của bản MỚI, đọc từ byte 0.
if [ "${DEPLOY_REEXEC:-}" != "1" ]; then
  echo "→ Kéo code mới từ git..."
  git pull --ff-only
  DEPLOY_REEXEC=1 exec bash "$0" "$@"
fi

# ------------------------------------------------------------------- node
#
# Node nằm trong virtualenv của cPanel, KHÔNG có sẵn trên PATH của shell
# thường — gõ `node` ở Terminal ra `command not found`. Không nạp venv thì
# bước prisma bên dưới chết, và vì `set -e` nên cả deploy dừng giữa chừng.
#
# Dùng ký tự đại diện cho số phiên bản: hôm nay là 22, nâng Node ở cPanel là
# đường dẫn đổi, mà lúc đó không ai nhớ ra phải sửa file này.
if ! command -v node >/dev/null 2>&1; then
  for activate in "$HOME"/nodevenv/iamvancuong/*/bin/activate; do
    if [ -f "$activate" ]; then
      # shellcheck disable=SC1090
      . "$activate"
      break
    fi
  done
fi

# --------------------------------------------------------- Prisma client
#
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
echo "→ Sinh lại Prisma client..."
if ! command -v node >/dev/null 2>&1; then
  # Nháy ĐƠN: trong nháy kép thì `node` là thay thế lệnh, bash sẽ đi CHẠY node.
  echo '  ⚠️  KHÔNG chạy được: không tìm thấy lệnh node.'
  echo "     Nạp venv rồi chạy tay:"
  echo "       source ~/nodevenv/iamvancuong/*/bin/activate"
  echo "       node node_modules/prisma/build/index.js generate"
elif [ -f node_modules/prisma/build/index.js ]; then
  # `|| true` để một lần generate hỏng không giết cả deploy trước khi restart —
  # nhưng in cảnh báo thật to, vì bỏ qua nó là app chạy client cũ.
  node node_modules/prisma/build/index.js generate || {
    echo "  ⚠️  prisma generate HỎNG. Nếu lần này có đổi schema thì app sẽ lỗi."
  }
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
