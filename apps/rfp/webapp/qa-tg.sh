#!/usr/bin/env bash
# Send a message or file to Carlos's Telegram. Usage:
#   qa-tg.sh "text message"            — sendMessage
#   qa-tg.sh /path/to/file "caption"   — sendVideo (.webm/.mp4) or sendPhoto/sendDocument
set -euo pipefail
ENVF="/home/clsandoval/cs/monorepo/.env"
TOKEN=$(grep '^TELEGRAM_BOT_TOKEN=' "$ENVF" | cut -d= -f2-)
CHAT=$(grep '^TELEGRAM_CHAT_ID=' "$ENVF" | cut -d= -f2-)
API="https://api.telegram.org/bot${TOKEN}"
if [[ -f "${1:-}" ]]; then
  case "$1" in
    *.webm|*.mp4) M=sendVideo; F=video ;;
    *.png|*.jpg)  M=sendPhoto; F=photo ;;
    *)            M=sendDocument; F=document ;;
  esac
  curl -sS -F "chat_id=${CHAT}" -F "${F}=@$1" -F "caption=${2:-}" "${API}/${M}" >/dev/null && echo "sent $1"
else
  curl -sS -F "chat_id=${CHAT}" -F "text=$1" "${API}/sendMessage" >/dev/null && echo "sent text"
fi
