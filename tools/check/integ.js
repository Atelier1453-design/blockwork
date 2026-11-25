// 画面どうしのつながりを通しで試す（原価計算→登録済み商品・ブロックワーク／仕掛品→原材料マスタ／ギフトの組み合わせ→原価計算→ブロックワーク／材料の値段→⚠／レシピ帳・棚卸し）
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
(async()=>{
 const {b,p,errs}=await open({});
 await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); v.products.forEach((x,i)=>x.id='bwp'+i); st.blockworkValue=JSON.stringify(v); });
 const bw=()=>p.evaluate(()=>JSON.parse(__debug.state.blockworkValue||'{}'));
 const setName=async(v)=>{ await p.fill('#f-name',v); };
 const saveCalc=async()=>{ await p.evaluate(()=>{ window.__oc=window.confirm; window.confirm=()=>true; }); await p.click('#btn-save'); await p.waitForTimeout(600);
   // 確認の小窓が出たら決定
   const ok=await p.$('#confirm-modal-backdrop:not([hidden]) #confirm-modal-ok'); if(ok){ await ok.click(); await p.waitForTimeout(600);} };
 const setRow=async(body,i,name,qty)=>{ await p.evaluate(([body,i,name,qty])=>{ let rows=document.querySelectorAll('#'+body+' tr'); while(rows.length<=i){ document.querySelector(body==='pkg-body'?'[data-add="pkg"]':'[data-add="ing"]').click(); rows=document.querySelectorAll('#'+body+' tr'); } const tr=rows[i]; const n=tr.querySelector('.row-name'); n.value=name; n.dispatchEvent(new Event('input',{bubbles:true})); const q=tr.querySelector('.row-qty'); q.value=qty; q.dispatchEvent(new Event('input',{bubbles:true})); q.dispatchEvent(new Event('change',{bubbles:true})); },[body,i,name,qty]); await p.waitForTimeout(150); };
 // A) 焼き菓子を登録
 const n0=await p.evaluate(()=>__debug.state.products.length);
 await p.click('.nav button[data-view="products"]'); await p.click('[data-view="calc"]'); await p.waitForTimeout(500);
 await setName('テスト抹茶クッキー');
 await setRow('ing-body',0,'薄力粉',200); await setRow('ing-body',1,'バター',100);
 await p.fill('#f-yield-count','20'); await p.dispatchEvent('#f-yield-count','change'); await p.fill('#f-pack-count','5'); await p.dispatchEvent('#f-pack-count','change');
 await setRow('pkg-body',0,'OPP袋',1);
 await saveCalc();
 const P1=await p.evaluate(()=>__debug.state.products.find(x=>x.name==='テスト抹茶クッキー'));
 const B1=(await bw()).products.find(x=>x.name==='テスト抹茶クッキー');
 console.log('A 登録:', (await p.evaluate(()=>__debug.state.products.length))-n0, '件', P1?('原価 '+Math.round(P1.totalCost)+' 税込 '+Math.round(P1.priceInTax)):'なし', '／ブロックワーク:', B1?('1倍の出来高 '+B1.yieldBase+' 単位 '+B1.unit):'なし', '／画面:', await p.evaluate(()=>document.querySelector('.view.active').id));
 // B) 材料の値段を上げる → 一覧に⚠
 await p.evaluate(()=>{ const m=__debug.state.materials.find(x=>x.name==='薄力粉'); m.price*=3; m.unitPrice*=3; __debug.rebuildMaterialIndex(); __debug.scheduleSave(); });
 await p.click('.nav button[data-view="materials"]'); await p.waitForTimeout(300); await p.click('.nav button[data-view="products"]');
 await p.waitForTimeout(2500);
 console.log('B 値段の見直し⚠:', await p.evaluate(()=>{ const c=[...document.querySelectorAll('#view-products .product-card, #view-products [data-id]')].find(x=>x.textContent.includes('テスト抹茶クッキー')); return c? (c.textContent.includes('⚠')?'出た':'出ない（'+c.textContent.replace(/\s+/g,' ').slice(0,60)+'）'):'カードなし'; }));
 // C) 仕掛品 → 原材料マスタ
 await p.click('#view-products [data-view="calc"]'); await p.waitForTimeout(500);
 console.log('C 画面:', await p.evaluate(()=>document.querySelector('.view.active').id), await p.evaluate(()=>{ const m=document.querySelector('.modal-backdrop:not([hidden])'); return m?m.innerText.replace(/\s+/g,' ').slice(0,100):'小窓なし'; }));
 await p.evaluate(()=>{ const s=document.getElementById('f-category'); const o=[...s.options].find(x=>x.value==='仕掛品'||x.textContent.includes('仕掛品')); if(o){ s.value=o.value; s.dispatchEvent(new Event('change',{bubbles:true})); } });
 await setName('テスト生地'); await setRow('ing-body',0,'薄力粉',500); await p.fill('#f-yield-count','1000'); await p.dispatchEvent('#f-yield-count','change');
 await saveCalc();
 console.log('C 仕掛品→原材料:', JSON.stringify(await p.evaluate(()=>{ const m=__debug.state.materials.find(x=>x.name==='テスト生地'); return m?{wipOf:!!m.wipOf,unitPrice:Math.round(m.unitPrice*100)/100,unit:m.unit}:null; })), '／カテゴリ', await p.evaluate(()=>(__debug.state.products.find(x=>x.name==='テスト生地')||{}).category));
 // D) ギフトの組み合わせ → 原価計算 → 登録 → ブロックワークの中身
 await p.click('.nav button[data-view="giftmaker"]'); await p.waitForTimeout(500);
 await p.fill('#gm-target','1500'); await p.click('#gm-run'); await p.waitForTimeout(1500);
 const gmn=await p.$$eval('#gm-results .gm-card', a=>a.length); console.log('D 組み合わせ:', gmn, '件');
 if(gmn){ await p.click('#gm-results [data-gm="0"]'); await p.waitForTimeout(800);
   console.log('D 原価計算に:', await p.evaluate(()=>document.querySelector('.view.active').id), '中身', await p.$$eval('#content-body tr, [id*="content"] tbody tr', a=>a.length));
   await setName('テストギフト'); await saveCalc();
   const G=await p.evaluate(()=>__debug.state.products.find(x=>x.name==='テストギフト'));
   const BG=(await bw()).products.find(x=>x.name==='テストギフト');
   console.log('D 登録:', G?('中身 '+((G.pack&&G.pack.contents)||[]).length+'種・資材 '+((G.pack&&G.pack.items)||[]).length):'なし', '／ブロックワークの使うもの:', BG?JSON.stringify((BG.uses||[]).map(u=>u.pid?u.qty:('G'+u.qty))):'なし'); }
 // E) レシピ帳・棚卸し・行事カレンダー・ブロックワーク
 for(const v of ['recipes','events','materials','blockwork']){ await p.click('.nav button[data-view="'+v+'"]'); await p.waitForTimeout(v==='blockwork'?2500:700); }
 console.log('E レシピ帳に:', await p.evaluate(()=>['テスト抹茶クッキー','テスト生地','テストギフト'].map(n=>n+':'+(__debug.recipeProducts().some(x=>x.name===n)?'あり':'なし')).join(' ')));
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 const fr=p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(400);
 console.log('E ブロックワークの商品タブ:', await fr.evaluate(()=>['テスト抹茶クッキー','テスト生地','テストギフト'].map(n=>n+':'+([...document.querySelectorAll('.pcardhead')].some(x=>x.textContent.includes(n))?'あり':'なし')).join(' ')));
 console.log('errors', errs); await b.close();
})();
