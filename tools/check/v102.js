// ver.102：行事の目安を、売れ方の見込み（はじめ少し・週末ちらほら・1週間前から増える・前日が山・当日少し）で日ごとに割りふって計画する
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; st.products[0].name='クリスマスクッキー'; st.products[1].name='クリスマスギフト'; st.products[1].category='ギフト';
   const ev=__debug.evCal().events.find(x=>x.name==='クリスマス'); const Y=new Date().getFullYear();
   ev.rule={t:'md',m:11,d:26}; ev.saleB=14; ev.saleA=0; ev.prep=7; ev.items=[{pid:'p0'},{pid:'p1'}]; ev.qtys={[Y]:{p0:60,p1:30}}; ev.plan={[Y]:'yes'}; });
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const kS=v.procs.find(x=>x.label.includes('仕込')).id, kB=v.procs.find(x=>x.label.includes('焼')).id;
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   const mk=(id,name,cat,stock,status)=>({id,name,code:'',category:cat,unit:'袋',yieldBase:6,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:0,active:status!=='rest',status,procOrder:[kS,kB],procs:{[kS]:{[s1]:{setup:5,per:10}},[kB]:{[s1]:{setup:5,per:10}}},uses:[],season:{months:[]},dow:{}});
   v.products=[mk('b0','クリスマスクッキー','焼き菓子',0,'rest'),mk('b1','クリスマスギフト','ギフト',0,'order'),mk('b9','ほかの品','焼き菓子',50,'sale')];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[2]; v.startMode='today'; v.range=21; v.level=false; v.rules=[]; v.events=[]; v.moves={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 console.log('plan:', await fr.evaluate(()=>[...document.querySelectorAll('.day')].map(d=>d.querySelector('.daylabel').textContent.slice(0,9)+(d.classList.contains('closed')?'休':'')+':'+[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].map(x=>x.textContent.replace(/\s+/g,'')).filter(t=>/クリスマス/.test(t)).join(',')).join('\n')));
 await check(fr,'計画');
 // くわしい欄の売れ方の見込み
 await p.click('.nav button[data-view="events"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const ev=__debug.evCal().events.find(x=>x.name==='クリスマス'); __debug.evOpenDetail(ev.id, new Date().getFullYear()); }); await p.waitForTimeout(300);
 console.log('curve:', await p.$$eval('.ev-cday', a=>a.map(x=>x.innerText.replace(/\s+/g,'')).join(' ')));
 await check(p,'くわしい欄'); await p.screenshot({path:SP+'/v102detail_'+vp.width+'.png'});
 console.log('errors', errs); await b.close(); }
})();
