#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""src/blockwork.html を base64 にして app.html の BW_APP_HTML_B64 に埋め込む。
使い方:  python3 tools/embed_blockwork.py
- 埋め込んだあと、app.html の最後の <script> を node --check で文法チェックする（node があれば）。
"""
import base64, io, os, re, subprocess, sys, tempfile
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app_p = os.path.join(root, "app.html")
bw_p = os.path.join(root, "src", "blockwork.html")
app = io.open(app_p, encoding="utf-8").read()
bw = io.open(bw_p, encoding="utf-8").read()
b64 = base64.b64encode(bw.encode("utf-8")).decode("ascii")
m = re.search(r'(BW_APP_HTML_B64\s*=\s*")([^"]*)(")', app)
if not m:
    sys.exit("BW_APP_HTML_B64 が app.html に見つかりません")
app = app[:m.start(2)] + b64 + app[m.end(2):]
io.open(app_p, "w", encoding="utf-8").write(app)
print("embedded: %d bytes of blockwork -> app.html (%d bytes)" % (len(bw), len(app)))
try:
    scr = re.findall(r"<script>([\s\S]*?)</script>", app)[-1]
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
        t.write(scr)
    r = subprocess.run(["node", "--check", t.name], capture_output=True, text=True)
    print("node --check:", "OK" if r.returncode == 0 else r.stderr[:2000])
except FileNotFoundError:
    print("node が無いので文法チェックは省略")
