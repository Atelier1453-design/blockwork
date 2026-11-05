---
name: kobo-note-dev
description: 工房ノート（app.html・ブロックワーク）を直して、確かめて、公開するまでの手順。app.html や src/blockwork.html を直すとき、上げる前の確かめをするとき、版を上げて main に公開するときに使う。
---

# 工房ノートを直す → 確かめる → 上げる

CLAUDE.md の「最初に守ること」「本人の好み」を先に読んでおくこと（返事は日本語・並び順・折りたたみなど）。

## 1. 直す

### app.html（原価計算・原材料マスタ・ギフト・レシピ帳など）
- ふつうに編集する。並べるところは `cmpByCode`（商品番号順）と `categoryRank`（カテゴリの順番）を使う。

### ブロックワーク（src/blockwork.html の React 部分）
- 日本語が `\uXXXX` になっているので、`tools/bwedit.py` で日本語に戻してから直す。

```python
import sys; sys.path.insert(0, 'tools'); import bwedit as B
B.find('探したい文')                 # 前後を見る
B.rep('元の文', '新しい文')          # ちょうど1回のときだけ置きかえる（回数が違えば止まる）
B.css('.newclass{color:#333;}')     # CSS を足す
B.save()
```

- 置きかえる文は、`B.find` で見てから、かっこの数まで写す。かっこが1つずれると全体が動かなくなる。
- 直したら必ず埋め込み直す：`python3 tools/embed_blockwork.py`
  - 「node --check (blockwork): OK」「node --check: OK」が出ること。NG なら src/blockwork.html を直す（埋め込みは止まっているので公開版はこわれていない）。
  - NG のときは、`git checkout src/blockwork.html` で戻してから、変更を1つずつ当てて、どれでこわれるか探す。

## 2. 版を上げる
- `app.html` の `<div class="brand-ver">ver.NN</div>` を1つ上げる（本人は版の番号で読み込みを確かめている）。

## 3. 確かめる
- 全画面の確かめ：`bash tools/check/run.sh`
  - iPad の横（1180×820）と縦（820×1180）で、全部の画面とブロックワークの全タブを開いて、画面の外へのはみ出しとエラーを見る。最後に「★ はみ出し・エラーなし」が出ること。
- 今回直したところは、`tools/check/` に小さなテストを書いて `bash tools/check/run.sh そのテスト.js` で動かす。
  - `setup.js` の `open({viewport:{width,height}})` でページを開く（作り物のデータ入り）。`__debug.state` にデータを入れて動かす。
  - ブロックワーク：`__debug.state.blockworkValue` を書きかえて `__debug.loadBlockworkFrame(true)` → `page.frames()` の中を操作する。
  - `ovf.js` の `check(ctx, '名前')` ではみ出しを見る。`page.screenshot` で画像を撮って、目でも見る。
  - **本人のデータは使わない・コミットしない**（このリポジトリは公開）。
- iPad でしか分からないこと（キーボード・指の操作）は、返事で「iPad で見てほしい」と書く。

## 4. 記録する
- `docs/history.md` に、その版で何をしたかを書き足す（本人に分かる言葉で）。
- データの持ち方が増えたら、CLAUDE.md の「しくみ」に1行足す。本人の好みが分かったら「本人の好み」に足す。

## 5. 上げる
```bash
git add -A app.html src/blockwork.html CLAUDE.md docs/history.md tools .claude
git commit -m "ver.NN: …（日本語で短く）"
git push -u origin HEAD:<作業用のブランチ>
git push origin HEAD:main      # 本人の了承ずみ。GitHub Pages に出る
```
- コミットの最後に、会話で指示された Co-Authored-By などの行を付ける。モデル名は書かない。

## 6. 返事
- 日本語で、何をしたかを短く。確かめたこと（横・縦ではみ出しなし など）と、iPad で見てほしいことを書く。
