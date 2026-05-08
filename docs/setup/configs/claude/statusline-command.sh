#!/usr/bin/env bash
input=$(cat)

# Context
pct=$(echo "$input" | jq -r '.context_window.used_percentage // 0')
filled=$(( pct * 2 / 100 ))
empty=$(( 2 - filled ))
bar=""
for ((i=0; i<filled; i++)); do bar+="█"; done
for ((i=0; i<empty; i++)); do bar+="░"; done
if [ "$pct" -ge 80 ] 2>/dev/null; then
  ccolor="\033[31m"
elif [ "$pct" -ge 50 ] 2>/dev/null; then
  ccolor="\033[33m"
else
  ccolor="\033[32m"
fi

# Git branch
branch=$(git -C "$(echo "$input" | jq -r '.cwd // "."')" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

# Rate limits
rl5h=$(printf "%.0f" "$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // 0')")
rl5h_resets=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')

# 5h countdown
rl5h_part=""
if [ -n "$rl5h_resets" ]; then
  now=$(date +%s)
  secs_left=$(( rl5h_resets - now ))
  if [ "$secs_left" -le 0 ]; then
    rl5h_part="ready"
  else
    mins_left=$(( secs_left / 60 ))
    hrs=$(( mins_left / 60 ))
    mins=$(( mins_left % 60 ))
    if [ "$hrs" -gt 0 ]; then
      rl5h_part=$(printf "%s%% (%dh%02dm)" "$rl5h" "$hrs" "$mins")
    else
      rl5h_part=$(printf "%s%% (%dm)" "$rl5h" "$mins")
    fi
  fi
else
  rl5h_part=$(printf "%s%%" "$rl5h")
fi

branch_part=""
if [ -n "$branch" ]; then
  branch_part=" | \033[35m${branch}\033[0m"
fi

# Working directory
cwd=$(echo "$input" | jq -r '.cwd // ""')
cwd_display=$(echo "$cwd" | sed "s|^$HOME|~|")
cwd_part=""
if [ -n "$cwd_display" ]; then
  cwd_part=" | \033[48;2;255;215;55;38;2;0;0;0;1m ${cwd_display} \033[0m"
fi

state=$(cat /home/clsandoval/.claude/.statusline-state 2>/dev/null || echo running)
if [ "$state" = "running" ]; then
  term_bg="\033]11;#f0f3f7\007"
else
  term_bg="\033]111\007"
fi

printf "${term_bg}${ccolor}${bar}\033[39m %s%% ctx | %s${branch_part}${cwd_part}\033[0m" "$pct" "$rl5h_part"
