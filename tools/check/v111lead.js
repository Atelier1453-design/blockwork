// ver.111：最終工程の◯日前（工程のやる曜日があるとき）。使い方：node v111lead.js '{"sDays":{"1":1,"4":1}}'
const {open}=require('./setup.js');
(async()=>{ const {b,p,errs}=await open({});
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 const opt=JSON.parse(process.argv[2]||'{}');
 await p.evaluate((opt)=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const pr=id=>v.procs.find(x=>x.label.includes(id)).id;
   const kS=pr('仕込'), kF=v.procs.find(x=>/成形|分割|型/.test(x.label)).id, kB=pr('焼');
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   const mk=(id,name,stock,lead,per)=>({id,name,code:'',category:'焼き菓子',unit:'袋',yieldBase:12,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:10,active:true,status:'sale',procOrder:[kS,kF,kB],procs:{[kS]:{[s1]:{setup:0,per:per||20}},[kF]:{[s1]:{setup:0,per:per||20}},[kB]:{[s1]:{setup:0,per:per||20}}},procLead:lead,uses:[],season:{months:[]},dow:{0:3,1:3,2:3,3:3,4:3,5:3,6:3}});
   v.products=[mk('a','アイテムA',opt.stock??20,{[kS]:2,[kF]:1})]; if(opt.others2) for(let i=0;i<opt.others2;i++) v.products.push(mk('q'+i,'ほかQ'+i,i*4,{[kS]:1}));
   for(let i=0;i<(opt.others||0);i++) v.products.push(mk('o'+i,'ほか'+i,0,{},opt.per||60));
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=opt.closed||[]; v.startMode='today'; v.range=14; v.level=opt.level!==false; v.rules=opt.rules||[]; v.events=[]; v.moves={}; v.onHold={};
   if(opt.rule){ v.rules=[{id:'r1',name:'仕込み',cat:'焼き菓子',pids:[],max:1,procs:[kS]}]; }
   if(opt.sDays){ v.procs.forEach(x=>{ if(x.id===kS) x.days=opt.sDays; }); }
   if(opt.lock){ v.lockedDays={[TD]:[{pid:'a',multi:1,made:12,seq:[kS,kF,kB],lead:{[kS]:2,[kF]:1}}]}; }
   if(opt.procDays){ v.procs.forEach(x=>{ if(x.id===kB) x.days=opt.procDays; }); }
   st.blockworkValue=JSON.stringify(v); }, opt);
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 const n=await fr.evaluate(()=>document.querySelectorAll('.day').length); const out=[];
 for(let i=0;i<n;i++){ const cl=await fr.evaluate(i=>document.querySelectorAll('.day')[i].classList.contains('closed'),i); if(cl){ out.push('休'); continue; }
   await fr.evaluate(i=>document.querySelectorAll('.day')[i].querySelector('.dayopen').click(),i); await p.waitForTimeout(200);
   out.push(await fr.evaluate(i=>{ const d=document.querySelectorAll('.day')[i]; return d.querySelector('.daylabel').textContent.slice(0,6)+' '+[...d.querySelectorAll('.procview .sprow')].map(r=>[...r.querySelectorAll('.spchip')].filter(x=>/アイテムA/.test(x.textContent)).map(x=>r.querySelector('.ptag').textContent+(/用/.test(x.textContent)?'('+x.textContent.match(/\d+\/\d+用/)[0]+')':'')).join(',')).filter(Boolean).join(' '); },i));
   await fr.evaluate(i=>document.querySelectorAll('.day')[i].querySelector('.dayopen').click(),i); await p.waitForTimeout(120); }
 console.log(out.filter(x=>/仕込|成形|分割|型|焼/.test(x)).join(' | '));
 await b.close(); })();
