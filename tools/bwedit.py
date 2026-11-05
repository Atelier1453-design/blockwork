#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ブロックワーク（src/blockwork.html）の React 部分を、日本語に戻してから直すための道具。

React 部分は日本語が \\uXXXX で書かれているので、そのままでは探しにくい。
読み込むと日本語に戻した文（d）を持ち、保存するときに \\uXXXX の形に戻す。

使い方（直すスクリプトの中で）:
    import sys; sys.path.insert(0, 'tools'); import bwedit as B
    B.rep('元の文', '新しい文')        # ちょうど1回見つかることを確かめて置きかえる（n= で回数を指定）
    B.find('探す文', 300)              # 前後300文字を見る
    B.css('.newclass{color:red;}')     # CSS を足す
    B.save()                          # 書き戻す（このあと python3 tools/embed_blockwork.py）
"""
import io, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'src', 'blockwork.html')
_s = io.open(PATH, encoding='utf-8').read()
_i = _s.index('(()=>{var De=window.React')
_st = _s.rfind('<script', 0, _i)
_b0 = _s.index('>', _st) + 1
_en = _s.index('</script>', _i)
_body = _s[_b0:_en]
d = re.sub(r'\\u([0-9A-Fa-f]{4})', lambda m: chr(int(m.group(1), 16)), _body)
d = re.sub('[\ud800-\udbff][\udc00-\udfff]', lambda m: m.group(0).encode('utf-16', 'surrogatepass').decode('utf-16'), d)
_css = []

def esc(t):
    out = []
    for ch in t:
        o = ord(ch)
        if o < 128: out.append(ch)
        elif o < 0x10000: out.append('\\u%04X' % o)
        else:
            o -= 0x10000
            out.append('\\u%04X\\u%04X' % (0xD800 + (o >> 10), 0xDC00 + (o & 0x3FF)))
    return ''.join(out)

def rep(a, b, n=1):
    """a をちょうど n 回見つけて b に置きかえる（数が違えば止まる）"""
    global d
    c = d.count(a)
    assert c == n, ('見つかった数が違います', c, a[:80])
    d = d.replace(a, b)

def find(a, around=200):
    i = d.find(a)
    print(d[max(0, i - around):i + len(a) + around] if i >= 0 else '（見つかりません）')
    return i

def css(text):
    """CSS を足す（.pnoproc の前に入れる）"""
    _css.append(text)

def save():
    s = _s[:_b0] + esc(d) + _s[_en:]
    if _css:
        anchor = '.pnoproc{'
        assert s.count(anchor) >= 1, 'CSS を入れる場所が見つかりません'
        s = s.replace(anchor, ' '.join(_css) + ' ' + anchor, 1)
    io.open(PATH, 'w', encoding='utf-8').write(s)
    print('src/blockwork.html を書きかえました。次に python3 tools/embed_blockwork.py')

if __name__ == '__main__':
    print('読み込み OK：', len(d), '文字。そのまま戻すと同じになるか：', esc(d) == _body)
