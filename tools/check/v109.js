// ver.109：送る・日の変更は「閉じて反映する」まで下書き／指定焼き菓子はカテゴリのチップから選ぶ／登録済みのギフトを組み合わせと同じ見た目で／あんちょこカードの印刷の置き方
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 // ギフト
 await p.evaluate(()=>{ const st=__debug.state; [1,3].forEach(i=>{ const x=st.products[i]; x.sourceType='gift'; x.category='ギフト'; x.name='焼き菓子ギフト'+i; x.salePrice=2160;
   x.pack.contents=[{productId:'p0',name:'クッキー0',qty:2,mode:'packed'},{productId:'p2',name:'クッキー2',qty:3,mode:'bulk'}];
   x.pack.items=[{name:'貼り箱S',qty:1,unit:'個',unitPrice:120,amount:120},{name:'赤いリボン',qty:1,unit:'本',unitPrice:10,amount:10},{name:'手提げ紙袋S',qty:1,unit:'枚',unitPrice:30,amount:30}]; x.pack.laborCost=50; });
   st.materials.push({id:'m_bx',name:'貼り箱S',unit:'個',qty:10,price:1200,unitPrice:120,category:'ギフト資材',kind:'supply',giftUse:true,giftBox:{type:'box',kind:'貼り箱'}});
   st.materials.push({id:'m_rb',name:'赤いリボン',unit:'本',qty:10,price:100,unitPrice:10,category:'ギフト資材',kind:'supply',giftUse:true});
   st.materials.push({id:'m_bg',name:'手提げ紙袋S',unit:'枚',qty:10,price:300,unitPrice:30,category:'ギフト資材',kind:'supply',giftUse:true});
   __debug.rebuildMaterialIndex(); });
 await p.click('.nav button[data-view="giftmaker"]'); await p.waitForTimeout(400);
 await p.click('#btn-gm-saved'); await p.waitForTimeout(300);
 console.log('saved gifts:', await p.$$eval('#gm-saved .gm-card', a=>a.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,200)).join(' || ')));
 await check(p,'登録済みのギフト'); await p.screenshot({path:SP+'/v109saved_'+vp.width+'.png'});
 await p.click('#gm-saved [data-gms-open]'); await p.waitForTimeout(400);
 console.log('detail view:', await p.evaluate(()=>document.querySelector('.view.active').id), !!(await p.$('.pd-giftview .gm-card')));
 await check(p,'商品の詳細（ギフト）'); await p.evaluate(()=>document.querySelector('.pd-giftview').scrollIntoView()); await p.screenshot({path:SP+'/v109pd_'+vp.width+'.png'});
 // あんちょこカード：1ページ・左右の真ん中
 if(vp.width===1180){
   await p.click('.nav button[data-view="products"]'); await p.click('#btn-gift-cards'); await p.waitForTimeout(400);
   await p.evaluate(()=>{ window.print=()=>{}; document.querySelector('.gc-adjust').open=true; }); await p.click('#gc-test');
   await p.evaluate(()=>{ document.getElementById('print-page-style').textContent='@page{size:210mm 297mm; margin:13mm;}'; });
   await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v109test.pdf', preferCSSPageSize:true, printBackground:true});
   await p.emulateMedia({media:'screen'}); await p.click('#gc-close');
 }
 // ブロックワーク
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const kS=v.procs.find(x=>x.label.includes('仕込')).id, kB=v.procs.find(x=>x.label.includes('焼')).id;
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   const mk=(id,name,cat,stock,code)=>({id,name,code:code||'',category:cat,unit:'袋',yieldBase:6,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:6,active:true,status:'sale',procOrder:[kS,kB],procs:{[kS]:{[s1]:{setup:5,per:10}},[kB]:{[s1]:{setup:5,per:10}}},uses:[],season:{months:[]},dow:{0:2,1:2,2:2,3:2,4:2,5:2,6:2}});
   v.products=[mk('b0','ガレット','焼き菓子',0,'A01'),mk('b1','フィナンシェ','焼き菓子',0,'A02'),mk('b2','マドレーヌ','焼き菓子',30,'A03'),mk('b3','チョコクッキー','クッキー',30,'B01'),mk('w1','生地','仕掛品',0)];
   v.categories=['焼き菓子','クッキー','仕掛品'];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.range=7; v.level=false; v.rules=[]; v.events=[]; v.moves={}; v.onHold={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 // 仕掛品の「使う日の前の日までに作る」ははじめからオン
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 console.log('wipPrev chip:', await fr.evaluate(()=>{ const h=[...document.querySelectorAll('.pcardhead')].find(x=>x.textContent.includes('生地')); h.click(); return null; }), await fr.evaluate(()=>{ const b=[...document.querySelectorAll('.chipbtn')].find(x=>x.textContent.includes('使う日の前の日までに作る')); return b?b.textContent+' on='+b.classList.contains('on'):'none'; }));
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='計画').click(); }); await p.waitForTimeout(400);
 await fr.evaluate(()=>{ [...document.querySelector('.day').querySelectorAll('.batchline button.chip.tap')].find(x=>x.textContent.includes('フィナンシェ')).click(); }); await p.waitForTimeout(500);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pvpanel button')].find(x=>x.textContent.includes('まるごと次の営業日へ')).click(); }); await p.waitForTimeout(500);
 console.log('after push (draft):', await fr.evaluate(()=>{ const pv=document.querySelector('.pvpanel'); return pv? (pv.querySelector('.sentchip')?'struck ':'no-strike ')+(pv.querySelector('.pvnote')?'note ':'')+pv.querySelector('.pvclose').textContent : 'panel gone'; }), 'moves:', await p.evaluate(()=>Object.keys(JSON.parse(__debug.state.blockworkValue).moves||{}).length));
 console.log('pvpanel position: in row?', await fr.evaluate(()=>{ const pv=document.querySelector('.pvpanel'); return pv && pv.previousElementSibling ? pv.previousElementSibling.className : '?'; }));
 await fr.evaluate(()=>document.querySelector('.pvpanel').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v109draft_'+vp.width+'.png'});
 await fr.evaluate(()=>{ document.querySelector('.pvclose').click(); }); await p.waitForTimeout(500);
 console.log('after close: moves', await p.evaluate(()=>Object.keys(JSON.parse(__debug.state.blockworkValue).moves||{}).length), 'day1 chips:', await fr.evaluate(()=>[...document.querySelector('.day .procview').querySelectorAll('.spchip')].map(x=>x.textContent).filter(t=>/フィナンシェ/.test(t)).length));
 // 指定焼き菓子
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='注文・イベント').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ const i=document.querySelector('.evtab .addbox input.evname'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(i,'山田さん'); i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(100);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.evtab .addbox button')].find(b=>b.textContent.includes('追加')).click(); }); await p.waitForTimeout(400);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.evform .prefbtn')].find(b=>b.textContent==='指定焼き菓子').click(); }); await p.waitForTimeout(300);
 console.log('cat chips:', await fr.evaluate(()=>[...document.querySelectorAll('.bkcats .chipbtn')].map(x=>x.textContent).join(',')));
 await fr.evaluate(()=>{ [...document.querySelectorAll('.bkcats .chipbtn')].find(x=>x.textContent==='焼き菓子').click(); }); await p.waitForTimeout(200);
 console.log('cands:', await fr.evaluate(()=>[...document.querySelectorAll('.bkcands .chipbtn')].map(x=>x.textContent).join(',')));
 await fr.evaluate(()=>{ [...document.querySelectorAll('.bkcands .chipbtn')].find(x=>x.textContent.includes('フィナンシェ')).click(); }); await p.waitForTimeout(200);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.bkcats .chipbtn')].find(x=>x.textContent==='クッキー').click(); }); await p.waitForTimeout(200);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.bkcands .chipbtn')][0].click(); }); await p.waitForTimeout(200);
 console.log('items:', await fr.evaluate(()=>[...document.querySelectorAll('.ordersum .ordersumrow')].map(r=>r.innerText.replace(/\s+/g,' ')).join(' | ')));
 await check(fr,'指定焼き菓子'); await fr.evaluate(()=>document.querySelector('.bkpick').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v109baked_'+vp.width+'.png'});
 console.log('errors', errs); await b.close(); }
})();
