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

echo "→ Vá quyền .next (Passenger cần đọc được)..."
find .next -type d -exec chmod 755 {} \;
find .next -type f -exec chmod 644 {} \;

echo "→ Restart app..."
mkdir -p tmp && touch tmp/restart.txt

echo "✓ Xong. App đang khởi động lại — thử lại web sau vài giây."
