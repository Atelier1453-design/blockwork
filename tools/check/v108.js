// ver.108：計画の工程ごとのチップで日・やる人を変える／まるごと次の営業日へで取り消し線→閉じると消える／指定焼き菓子・お渡しの時間・発送
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const kS=v.procs.find(x=>x.label.includes('仕込')).id, kB=v.procs.find(x=>x.label.includes('焼')).id;
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   const mk=(id,name,cat,stock)=>({id,name,code:'',category:cat,unit:'袋',yieldBase:6,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:6,active:true,status:'sale',procOrder:[kS,kB],procs:{[kS]:{[s1]:{setup:5,per:10}},[kB]:{[s1]:{setup:5,per:10}}},uses:[],season:{months:[]},dow:{0:2,1:2,2:2,3:2,4:2,5:2,6:2}});
   v.products=[mk('b0','ガレット','焼き菓子',0),mk('b1','フィナンシェ','焼き菓子',0),mk('b2','マドレーヌ','焼き菓子',30),mk('b3','チョコクッキー','クッキー',30),mk('g1','ギフトA','ギフト',0)];
   v.categories=['焼き菓子','クッキー','ギフト'];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.range=7; v.level=false; v.rules=[]; v.events=[]; v.moves={}; v.onHold={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 const topChips = ()=>fr.evaluate(()=>[...document.querySelectorAll('.day')].slice(0,2).map(d=>[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].map(x=>x.textContent.replace(/\s+/g,'').slice(0,6)).join(',')).join(' | '));
 console.log('top chips:', await topChips());
 // 上のチップを押すと、日が開いて工程ごとのチップの下に詳細
 await fr.evaluate(()=>{ [...document.querySelector('.day').querySelectorAll('.batchline button.chip.tap')].find(x=>x.textContent.includes('ガレット')).click(); }); await p.waitForTimeout(500);
 console.log('day open, top chips now:', await topChips());
 console.log('pvpanel:', await fr.evaluate(()=>{ const x=document.querySelector('.pvpanel'); return x? x.innerText.replace(/\s+/g,' ').slice(0,160):'none'; }));
 await check(fr,'工程チップの詳細'); await fr.evaluate(()=>document.querySelector('.pvpanel').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v108panel_'+vp.width+'.png'});
 // 焼きのチップを押す → やる人の行
 await fr.evaluate(()=>{ const rows=[...document.querySelectorAll('.procview .sprow')]; const r=rows.find(x=>x.textContent.includes('焼')); [...r.querySelectorAll('.spchip')].find(x=>x.textContent.includes('フィナンシェ')).click(); }); await p.waitForTimeout(400);
 console.log('who row:', await fr.evaluate(()=>{ const x=document.querySelector('.pvwhorow'); return x?x.innerText.replace(/\s+/g,' '):'none'; }));
 // まるごと次の営業日へ
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pvpanel button')].find(x=>x.textContent.includes('まるごと次の営業日へ')).click(); }); await p.waitForTimeout(600);
 console.log('after push:', await fr.evaluate(()=>{ const x=document.querySelector('.pvpanel .sentchip'); return x?('struck:'+x.textContent+' / '+document.querySelector('.pvpanel').innerText.replace(/\s+/g,' ').slice(0,80)):'no strike'; }));
 await fr.evaluate(()=>document.querySelector('.pvpanel').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v108sent_'+vp.width+'.png'});
 await fr.evaluate(()=>{ document.querySelector('.pvclose').click(); }); await p.waitForTimeout(400);
 console.log('after close pv chips day1:', await fr.evaluate(()=>[...document.querySelector('.day .procview').querySelectorAll('.spchip')].map(x=>x.textContent.replace(/\s+/g,'').slice(0,6)).join(',')));
 // 日を閉じて上のチップ
 await fr.evaluate(()=>{ document.querySelector('.day .dayopen').click(); }); await p.waitForTimeout(400);
 console.log('top chips after close:', await topChips());
 // 注文・イベント
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='注文・イベント').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ const i=document.querySelector('.evtab .addbox input.evname'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(i,'山田さん'); i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(100);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.evtab .addbox button')].find(b=>b.textContent.includes('追加')).click(); }); await p.waitForTimeout(400);
 console.log('kinds:', await fr.evaluate(()=>[...document.querySelectorAll('.evform .evrow')][0].innerText.replace(/\s+/g,' ')));
 console.log('time:', await fr.evaluate(()=>document.querySelector('.evform input.evtime').value), 'ship row (gift):', await fr.evaluate(()=>[...document.querySelectorAll('.evform .evrow')].some(r=>r.textContent.includes('発送する'))));
 await fr.evaluate(()=>{ [...document.querySelectorAll('.evform .prefbtn')].find(b=>b.textContent==='発送する').click(); }); await p.waitForTimeout(200);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.evform .prefbtn')].find(b=>b.textContent==='指定焼き菓子').click(); }); await p.waitForTimeout(300);
 console.log('ship row (baked):', await fr.evaluate(()=>[...document.querySelectorAll('.evform .evrow')].some(r=>r.textContent.includes('発送する'))), 'h5:', await fr.evaluate(()=>[...document.querySelectorAll('.evform h5')].map(x=>x.textContent).join('|')));
 await fr.evaluate(()=>{ document.querySelector('.bkadd').click(); }); await p.waitForTimeout(200);
 await fr.evaluate(()=>{ document.querySelector('.bkadd').click(); }); await p.waitForTimeout(200);
 await fr.evaluate(()=>{ const sels=document.querySelectorAll('.bkrow')[1].querySelectorAll('select'); const s=sels[0]; s.value='クッキー'; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 console.log('baked rows:', await fr.evaluate(()=>[...document.querySelectorAll('.bkrow')].map(r=>[...r.querySelectorAll('select')].map(s=>s.options[s.selectedIndex].text).join('/')+' opts:'+r.querySelectorAll('select')[1].options.length).join(' || ')));
 console.log('cats:', await fr.evaluate(()=>[...document.querySelector('.bkrow select').options].map(o=>o.text).join(',')));
 console.log('saved:', await p.evaluate(()=>{ const e=JSON.parse(__debug.state.blockworkValue).events[0]; return JSON.stringify({kind:e.kind,time:e.time,ship:e.ship,items:e.items}); }));
 await check(fr,'注文'); await fr.evaluate(()=>document.querySelector('.bkrows').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v108order_'+vp.width+'.png'});
 console.log('errors', errs); await b.close(); }
})();
