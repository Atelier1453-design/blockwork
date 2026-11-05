#!/usr/bin/env bash
# 上げる前の確かめ：テスト用ページを作る → サーバーを立てる → 全画面を iPad の横・縦で開いて確かめる
# 使い方：bash tools/check/run.sh            （全画面の確かめ）
#         bash tools/check/run.sh 自分のテスト.js （tools/check の中の別のテストを動かす）
set -e
cd "$(dirname "$0")/../.."
python3 tools/make_test.py
if ! curl -s -o /dev/null http://127.0.0.1:8934/index.html; then
  (cd test && setsid nohup python3 -m http.server 8934 </dev/null >/dev/null 2>&1 &)
  sleep 1
fi
cd tools/check
node "${1:-smoke.js}"
