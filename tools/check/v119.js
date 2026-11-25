// ver.119：型番でも候補・行事を役目の列に・留め具に「セットのもの」・◯日前が入っていない商品の一覧・曜日ごとに作る量を控える
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; const add=(id,name,price,o)=>st.materials.push(Object.assign({id,name,unit:'個',qty:10,price:price*10,unitPrice:price,category:'ギフト資材',kind:'supply',giftUse:true},o||{}));
   add('bx','貼り箱M',150,{giftBox:{type:'box',kind:'貼り箱'},model:'HB-2025M',giftEvents:['年賀','クリスマス']}); add('rb','赤いリボン',12,{model:'RB-77'});
   __debug.rebuildMaterialIndex(); });
 // 型番で候補
 await p.click('.nav button[data-view="products"]'); await p.click('#view-products [data-view="calc"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const i=document.querySelector('#pkg-body tr .row-name'); i.focus(); i.value='hb-20'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 console.log('型番で候補:', await p.evaluate(()=>[...document.querySelectorAll('.ac-item')].map(x=>x.innerText.replace(/\s+/g,' ')).slice(0,2).join(' | ')));
 // 原材料マスタ：行事は役目の列
 await p.click('.nav button[data-view="materials"]'); await p.waitForTimeout(500);
 console.log('役目の列:', await p.evaluate(()=>{ const tr=document.querySelector('tr[data-id="bx"]'); if(!tr) return 'なし'; return [...tr.children].slice(1,3).map(td=>td.innerText.replace(/\s+/g,' ')).join(' ‖ '); }));
 // 資材の詳細：留め具の「セットのもの」
 await p.evaluate(()=>{ const tr=document.querySelector('tr[data-id="bx"]'); const btn=tr.querySelector('button, .mat-edit, [data-edit]'); (btn||tr).click(); }); await p.waitForTimeout(500);
 const hasSet = await p.evaluate(()=>{ const sl=document.querySelector('#mm-gs-list .gs-slot[data-slot="fastener"]'); return sl? [...sl.querySelectorAll('.gs-foot label')].map(l=>l.textContent).join('/') : 'なし'; });
 console.log('留め具の選び方:', hasSet);
 if(hasSet!=='なし'){ await p.evaluate(()=>{ const r=document.querySelector('#mm-gs-list .gs-slot[data-slot="fastener"] .gs-setone'); r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(200);
   console.log('セットのものを選んだ:', await p.evaluate(()=>{ const sl=document.querySelector('#mm-gs-list .gs-slot[data-slot="fastener"]'); return [...sl.querySelectorAll('.gs-row')].map(r=>(r.querySelector('.gs-on').checked?'◉':'○')+r.querySelector('select').selectedOptions[0].text).join(',')+' / foot:'+[...sl.querySelectorAll('.gs-foot label')].map(l=>l.textContent).join('/'); })); }
 await check(p,'原材料マスタ');
 await p.evaluate(()=>{ document.querySelectorAll('.modal-backdrop').forEach(m=>m.hidden=true); });
 // ブロックワーク：◯日前が入っていない商品・曜日ごとに控える
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(400);
 console.log('◯日前なし:', await fr.evaluate(()=>{ const x=document.querySelector('.leadbox'); return x? x.querySelector('summary').textContent+' '+[...x.querySelectorAll('.holdchip')].slice(0,3).map(c=>c.textContent).join(','):'出ない'; }));
 await fr.evaluate(()=>{ const x=document.querySelector('.leadbox'); if(x){ x.open=true; x.querySelector('.holdchip').click(); } }); await p.waitForTimeout(400);
 console.log('押すと開く:', await fr.evaluate(()=>{ const o=document.querySelector('.pcard .pbody'); return o? o.closest('.pcard').querySelector('.pcardname').textContent:'開かない'; }));
 await check(fr,'商品タブ');
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='計画').click(); }); await p.waitForTimeout(400);
 await fr.evaluate(()=>{ document.querySelector('.capbox').open=true; }); 
 await fr.evaluate(()=>{ const cells=document.querySelectorAll('.capbox .dowcell input'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; [0,6].forEach(i=>{ set.call(cells[i],'50'); cells[i].dispatchEvent(new Event('input',{bubbles:true})); }); }); await p.waitForTimeout(500);
 console.log('控える:', await fr.evaluate(()=>document.querySelector('.capbox summary').textContent), await p.evaluate(()=>JSON.stringify(JSON.parse(__debug.state.blockworkValue).dayCap)));
 await check(fr,'計画（控える）');
 console.log('errors', errs); await b.close(); }
})();
