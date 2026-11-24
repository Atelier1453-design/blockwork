// ver.113：上の段のチップは「その日に実際にやる工程」から作る（カヌレ：チップはあるのに開くと工程がない）／◯日前が0の商品の知らせ
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
   const pr=id=>v.procs.find(x=>x.label.includes(id)).id;
   const kS=pr('仕込'), kF=v.procs.find(x=>/型|成形/.test(x.label)).id, kB=pr('焼'), kP=v.procs.find(x=>/袋|包/.test(x.label)).id;
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   const today=new Date().getDay(), other=[0,1,2,3,4,5,6].filter(x=>x!==today&&x!==(today+1)%7);
   const mk=(id,name,stock,order,lead)=>({id,name,code:'',category:'焼き菓子',unit:'個',yieldBase:12,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:6,active:true,status:'sale',procOrder:order,procs:Object.fromEntries(order.map(k=>[k,{[s1]:{setup:0,per:20}}])),procLead:lead,uses:[],season:{months:[]},dow:{0:3,1:3,2:3,3:3,4:3,5:3,6:3}});
   v.products=[mk('cn','カヌレ',0,[kS,kB],{[kS]:1}), mk('ck','クッキー',0,[kS,kF,kB,kP],{})];
   // カヌレの仕込みは、今日と明日以外の曜日だけ（だから仕上げは後ろへずれる）
   v.procs.forEach(x=>{ if(x.id===kS) x.days=Object.fromEntries(other.map(k=>[k,1])); });
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.range=7; v.level=false; v.rules=[]; v.events=[]; v.moves={}; v.onHold={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 const days = await fr.evaluate(()=>[...document.querySelectorAll('.day')].slice(0,5).map(d=>d.querySelector('.daylabel').textContent.slice(0,6)+' 上:'+[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].map(x=>x.textContent.replace(/\s+/g,'')).join(',')+' '+d.querySelector('.daysum').textContent.replace(/\s+/g,'')));
 console.log(days.join('\n'));
 // 各日を開いて、工程のチップに同じ商品があるか
 for(let i=0;i<4;i++){ await fr.evaluate(i=>document.querySelectorAll('.day')[i].querySelector('.dayopen').click(),i); await p.waitForTimeout(250);
   console.log('  開く', i, await fr.evaluate(i=>[...document.querySelectorAll('.day')[i].querySelectorAll('.procview .sprow')].map(r=>r.querySelector('.ptag').textContent+':'+[...r.querySelectorAll('.spchip')].map(x=>x.textContent.replace(/（\d+(\.\d)?B）/,'')).filter(t=>/カヌレ|クッキー/.test(t)).join(',')).filter(t=>/カヌレ|クッキー/.test(t)).join(' | '),i));
   await fr.evaluate(i=>document.querySelectorAll('.day')[i].querySelector('.dayopen').click(),i); await p.waitForTimeout(150); }
 // クッキー（◯日前が0）の詳細の知らせ
 await fr.evaluate(()=>{ const x=[...document.querySelectorAll('.day')[2].querySelectorAll('.batchline button.chip.tap')].find(x=>/クッキー/.test(x.textContent)); x&&x.click(); }); await p.waitForTimeout(500);
 console.log('知らせ:', await fr.evaluate(()=>{ const x=document.querySelector('.pvpanel .whyline.red'); return x?x.textContent.slice(0,40):'なし'; }));
 await check(fr,'計画'); await fr.evaluate(()=>document.querySelector('.day').scrollIntoView()); await p.screenshot({path:SP+'/v113_'+vp.width+'.png'});
 console.log('errors', errs); await b.close(); }
})();
