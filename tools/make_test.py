#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""テスト用のページを作る：app.html に window.__debug（中の変数・関数）を足して test/index.html に書き出す。
使い方:  python3 tools/make_test.py   →   cd test && python3 -m http.server 8934
Playwright などで http://127.0.0.1:8934/index.html を開き、window.__debug.state にテスト用のデータを入れて動かす。
test/ は .gitignore で公開しない。
"""
import io, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g = io.open(os.path.join(root, "app.html"), encoding="utf-8").read()
names = ["state", "recalc", "kindOf", "rebuildMaterialIndex", "rebuildMaterialCategories",
         "rebuildMaterialCategoryFilter", "renderMaterialTable", "renderProductList",
         "setRowMaterial", "batchMultiplierValue", "setAllowedMultipliers", "fillRows", "loadBlockworkFrame"]
for n in names[1:]:
    if ("function " + n + "(") not in g:
        sys.exit("MISSING function " + n)
anchor = "  async function init(){"
assert g.count(anchor) == 1
g = g.replace(anchor, "  window.__debug = { " + ", ".join("%s: %s" % (n, n) for n in names) + " };\n" + anchor, 1)
os.makedirs(os.path.join(root, "test"), exist_ok=True)
io.open(os.path.join(root, "test", "index.html"), "w", encoding="utf-8").write(g)
print("test/index.html を作りました")
