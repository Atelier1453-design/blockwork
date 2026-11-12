// ver.101：行事のくわしい欄（商品は1行ずつ・目安と昨年・資材を役目ごと）、行事の編集、商品の詳細の行事チップ、ギフトの組み合わせを開く、あんちょこカード
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; const Y=new Date().getFullYear();
   st.products[0].name='千歳飴クッキー'; st.products[0].planning.productCode='A01';
   st.products[1].name='七五三ギフト'; st.products[1].category='ギフト'; st.products[1].sourceType='gift'; st.products[1].salePrice=2160;
   st.products[1].pack.contents=[{productId:'p0',name:'千歳飴クッキー',qty:2,mode:'packed'},{productId:'p2',name:'クッキー2',qty:3,mode:'packed'},{productId:'p3',name:'クッキー3',qty:1,mode:'bulk'}];
   st.products[1].pack.items=[{name:'七五三の箱',qty:1,unit:'個',unitPrice:100,amount:100},{name:'手提げ紙袋S',qty:1,unit:'枚',unitPrice:30,amount:30},{name:'ショップカード',qty:1,unit:'枚',unitPrice:3,amount:3}];
   st.products[4].name='クリスマスギフトとても長い名前のギフトセット'; st.products[4].category='ギフト'; st.products[4].sourceType='gift'; st.products[4].salePrice=5400;
   st.products[4].pack.contents=Array.from({length:14},(_,i)=>({productId:'p'+(5+i),name:'クッキー'+(5+i),qty:1+i%3,mode:'packed'}));
   st.products[4].pack.items=[{name:'貼り箱L',qty:1,unit:'個',unitPrice:300,amount:300}];
   st.materials.push({id:'m_box753',name:'七五三の箱',unit:'個',qty:10,price:1000,unitPrice:100,category:'ギフト資材',kind:'supply',giftUse:true,giftEvents:['七五三'],giftBox:{type:'box',kind:'貼り箱'}});
   st.materials.push({id:'m_bagS',name:'手提げ紙袋S',unit:'枚',qty:10,price:300,unitPrice:30,category:'ギフト資材',kind:'supply',giftUse:true,giftEvents:['七五三']});
   st.materials.push({id:'m_seal',name:'千歳飴シール',unit:'枚',qty:10,price:100,unitPrice:10,category:'ギフト資材',kind:'supply',giftUse:true,giftEvents:['七五三']});
   st.materials.push({id:'m_rib',name:'赤いリボン',unit:'本',qty:10,price:100,unitPrice:10,category:'ギフト資材',kind:'supply',giftUse:true,giftEvents:['七五三']});
   st.materials.push({id:'m_boxL',name:'貼り箱L',unit:'個',qty:10,price:3000,unitPrice:300,category:'ギフト資材',kind:'supply',giftUse:true,giftBox:{type:'box',kind:'貼り箱'}});
   __debug.rebuildMaterialIndex();
   const ev=__debug.evCal().events.find(x=>x.name==='七五三'); ev.items=[{pid:'p0',qty:12},{pid:'p1'}]; ev.qtys[Y-1]={p0:20,p1:8}; ev.sold[Y-1]={p0:18,p1:8};
   const xm=__debug.evCal().events.find(x=>x.name==='クリスマス'); xm.items=[{pid:'p4'}];
   const bw=JSON.parse(st.blockworkValue); bw.products.forEach((x,i)=>x.id='b'+i); bw.products[0].name='千歳飴クッキー'; bw.products[1].name='七五三ギフト'; st.blockworkValue=JSON.stringify(bw);
 });
 console.log('migrated:', JSON.stringify(await p.evaluate(()=>{ const ev=__debug.evCal().events.find(x=>x.name==='七五三'); return {items:ev.items, qtys:ev.qtys}; })));
 await p.click('.nav button[data-view="events"]'); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const ev=__debug.evCal().events.find(x=>x.name==='七五三'); __debug.evOpenDetail(ev.id, new Date().getFullYear()); }); await p.waitForTimeout(300);
 console.log('detail items:', await p.$$eval('.ev-item', a=>a.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ')));
 console.log('mats:', await p.$eval('.ev-mats', e=>e.innerText.replace(/\s+/g,' ')));
 console.log('edit btn:', await p.$eval('#ev-edit', e=>e.textContent));
 await check(p,'くわしい欄'); await p.screenshot({path:SP+'/v101detail_'+vp.width+'.png'});
 // 目安を入れる
 await p.fill('input[data-q="p1"]','6'); await p.dispatchEvent('input[data-q="p1"]','change');
 await p.fill('input[data-s="p0"]','11'); await p.dispatchEvent('input[data-s="p0"]','change');
 console.log('saved:', JSON.stringify(await p.evaluate(()=>{ const ev=__debug.evCal().events.find(x=>x.name==='七五三'); return [ev.qtys, ev.sold]; })));
 await p.evaluate(()=>{ const ev=__debug.evCal().events.find(x=>x.name==='七五三'); ev.plan={[new Date().getFullYear()]:'yes'}; });
 console.log('to bw:', JSON.stringify(await p.evaluate(()=>window.__atelierEvents().occ.filter(o=>o.name==='七五三').map(o=>[o.from,o.items]))));
 // ギフトの組み合わせを開く
 await p.click('#ev-to-gm'); await p.waitForTimeout(500);
 console.log('gm:', await p.evaluate(()=>document.querySelector('.view.active').id), await p.evaluate(()=>{ const s=document.querySelector('select[data-pick="__event"]'); return s?s.value:'?'; }));
 // 編集
 await p.click('.nav button[data-view="events"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const ev=__debug.evCal().events.find(x=>x.name==='七五三'); __debug.evOpenDetail(ev.id, new Date().getFullYear()); });
 await p.click('#ev-edit'); await p.waitForTimeout(300);
 console.log('edit h3:', await p.$eval('#ev-modal-body h3', e=>e.textContent), 'items picker:', await p.$('#evf-q') ? 'ある' : 'ない');
 console.log('sale rows x:', JSON.stringify(await p.$$eval('.ev-salebox > div', a=>a.map(x=>Math.round(x.getBoundingClientRect().left)))));
 await check(p,'編集'); await p.screenshot({path:SP+'/v101edit_'+vp.width+'.png'});
 await p.fill('#evf-saleB','15'); await p.click('#evf-save'); await p.waitForTimeout(300);
 console.log('after save items:', JSON.stringify(await p.evaluate(()=>__debug.evCal().events.find(x=>x.name==='七五三').items)), 'saleB', await p.evaluate(()=>__debug.evCal().events.find(x=>x.name==='七五三').saleB));
 await p.evaluate(()=>{ document.getElementById('ev-modal-backdrop').hidden=true; });
 // 商品の詳細の行事チップ
 await p.evaluate(()=>__debug.showProductDetail('p2')); await p.waitForTimeout(400);
 console.log('pd chips on:', await p.$$eval('#pd-events .tag-chip.on', a=>a.map(x=>x.textContent).join(',')||'なし'));
 await p.evaluate(()=>{ [...document.querySelectorAll('#pd-events .tag-chip')].find(x=>x.textContent.includes('バレンタイン')).click(); }); await p.waitForTimeout(200);
 console.log('pd chips on:', await p.$$eval('#pd-events .tag-chip.on', a=>a.map(x=>x.textContent).join(',')), JSON.stringify(await p.evaluate(()=>__debug.evCal().events.find(x=>x.name==='バレンタイン').items)));
 await check(p,'商品の詳細'); await p.evaluate(()=>document.getElementById('pd-events').scrollIntoView()); await p.screenshot({path:SP+'/v101pd_'+vp.width+'.png'});
 // あんちょこカード
 await p.click('.nav button[data-view="products"]'); await p.waitForTimeout(400);
 await p.click('#btn-gift-cards'); await p.waitForTimeout(500);
 console.log('gc list:', await p.$$eval('.gc-items label', a=>a.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ')));
 console.log('gc cards:', await p.$$eval('#gc-preview .gc-card', a=>a.map(x=>x.innerText.replace(/\s+/g,' ')+' fs='+(x.style.fontSize||'8pt')+' ovf='+(x.querySelector('.gc-in').scrollHeight>x.querySelector('.gc-in').clientHeight+1)).join(' || ')));
 await check(p,'あんちょこ'); await p.screenshot({path:SP+'/v101gc_'+vp.width+'.png'});
 if(vp.width===1180){
   await p.evaluate(()=>{ window.print=()=>{}; }); await p.click('#gc-print-btn'); await p.waitForTimeout(300);
   await p.emulateMedia({media:'print'});
   await p.pdf({path:SP+'/v101cards.pdf', preferCSSPageSize:true, printBackground:true}).catch(e=>console.log('pdf only headless', e.message));
   await p.emulateMedia({media:'screen'});
 }
 console.log('errors', errs); await b.close(); }
})();
