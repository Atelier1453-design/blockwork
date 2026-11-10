// ver.99：仕掛品は使う日に足りないときだけ作る・前日にはじめる（1工程）・タブの位置を覚える
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 const alerts=[]; p.on('dialog', async dl=>{ alerts.push(dl.message()); await dl.accept(); });
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 const setData=async(keep)=>{ await p.evaluate(keep=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const kS=v.procs.find(x=>x.label.includes('仕込')).id, kB=v.procs.find(x=>x.label.includes('焼')).id;
   const TD=(d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate())(new Date());
   const mk=(id,name,cat,stock,safety,dow,extra)=>Object.assign({id,name,code:id,category:cat,unit:'袋',yieldBase:10,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety,active:true,status:'sale',procOrder:[kS,kB],procs:{[kS]:{[s1]:{setup:5,per:10}},[kB]:{[s1]:{setup:5,per:10}}},uses:[],season:{months:[]},dow},extra||{});
   const d7=n=>({0:n,1:n,2:n,3:n,4:n,5:n,6:n});
   v.products=[ mk('A','製品A','焼き菓子',14,5,d7(2),{uses:[{pid:'AS',qty:5,per:'batch'}]}), mk('AS','仕掛品AS','仕掛品',6,10,d7(0),{keepSafety:keep}), mk('C','クッキー','焼き菓子',3,5,d7(4)) ];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.level=false; v.rules=[]; v.events=[]; v.moves={};
   st.blockworkValue=JSON.stringify(v); }, keep);
   await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500); fr = p.frames().find(f=>f!==p.mainFrame()); };
 const plan=()=>fr.evaluate(()=>[...document.querySelectorAll('.day:not(.closed)')].slice(0,7).map(d=>d.querySelector('.daylabel').textContent.slice(0,5)+':'+[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].map(x=>x.textContent.replace(/ ×.*/,'')).join(',')).join(' | '));
 await setData(false);
 console.log('前もって作らない:', await plan());
 await setData(true);
 console.log('安全在庫まで作る :', await plan());
 // 前日にはじめる（1工程）
 await setData(false);
 const DI = await fr.evaluate(()=>[...document.querySelectorAll('.day:not(.closed)')].findIndex((d,i)=>i>=2&&[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].some(x=>x.textContent.includes('クッキー'))));
 await fr.evaluate(DI=>{ const c=[...document.querySelectorAll('.day:not(.closed)')[DI].querySelectorAll('.batchline button.chip.tap')].find(x=>x.textContent.includes('クッキー')); c.click(); }, DI); await p.waitForTimeout(300);
 const st=()=>fr.evaluate(()=>[...document.querySelectorAll('.taskpanel .taskprocs li')].map(li=>li.querySelector('.tstate').textContent).join(' / '));
 const prev=async ix=>{ await fr.evaluate(ix=>{ const li=document.querySelectorAll('.taskpanel .taskprocs li')[ix]; [...li.querySelectorAll('button')].find(b=>b.textContent==='前日にはじめる').click(); }, ix); await p.waitForTimeout(400); };
 console.log('cookie day', DI, 'はじめ:', await st());
 await prev(0); console.log('仕込みを前日:', await st());
 await prev(1); console.log('焼きを前日:', await st());
 await prev(1); console.log('焼きをもう1日:', await st());
 for(let k=0;k<4;k++) await prev(1);
 console.log('今日まで来たら:', await st(), '| alerts:', JSON.stringify(alerts.slice(-1)));
 // タブの位置
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='在庫').click(); }); await p.waitForTimeout(500);
 await fr.evaluate(()=>{ document.body.style.minHeight='3000px'; window.scrollTo(0,400); }); await p.waitForTimeout(400);
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(500);
 const yP=await fr.evaluate(()=>window.scrollY);
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='在庫').click(); }); await p.waitForTimeout(700);
 console.log('在庫に戻る:', await fr.evaluate(()=>window.scrollY), '(商品タブ', yP, ')');
 await p.click('.nav button[data-view="products"]'); await p.waitForTimeout(500);
 await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(800);
 console.log('ほかの画面から戻る:', await fr.evaluate(()=>window.scrollY));
 await check(fr,'在庫');
 console.log('errors', errs); await b.close(); }
})();
