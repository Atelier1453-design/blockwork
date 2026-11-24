// ver.110：詳細の「やる／前の営業日へ／次の営業日へ／やらない／やってある」と、◯日前の工程・やる人の選択肢
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 const vp={width:1180,height:820};
 const {b,p,errs}=await open({viewport:vp});
 p.on('dialog', d=>{ console.log('  [alert]', d.message()); d.accept(); });
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 const ids = await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const P=v.procs.map(x=>x.id), k1=P[0],k2=P[1],kB=v.procs.find(x=>x.label.includes('焼')).id;
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   const mk=(id,name,stock)=>({id,name,code:'',category:'焼き菓子',unit:'袋',yieldBase:6,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:6,active:true,status:'sale',procOrder:[k1,k2,kB],procs:{[k1]:{[s1]:{setup:0,per:20}},[k2]:{[s1]:{setup:0,per:20}},[kB]:{[s1]:{setup:0,per:20},[v.staff[1].id]:{setup:0,per:20}}},procLead:{[k1]:1},uses:[],season:{months:[]},dow:{0:3,1:3,2:3,3:3,4:3,5:3,6:3}});
   v.products=[mk('a','アイテムA',3),mk('c','アイテムC',20)];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; sf.procExclude=[]; });
   v.staff[2].procExclude=[kB, k1, k2];
   v.closedDays=[]; v.startMode='today'; v.range=7; v.level=false; v.rules=[]; v.events=[]; v.moves={}; v.onHold={}; v.routines=[];
   st.blockworkValue=JSON.stringify(v); return {k1,k2,kB,staff:v.staff.map(x=>x.name)}; });
 console.log('procs', JSON.stringify(ids));
 const reload=async()=>{ await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2200); fr = p.frames().find(f=>f!==p.mainFrame()); };
 await reload();
 // 計画（日ごとの工程）を読む：全部の日を開いて、アイテムAのチップ
 const sched = async()=>{ const out=[]; const n=await fr.evaluate(()=>document.querySelectorAll('.day').length);
   for(let i=0;i<Math.min(n,5);i++){ await fr.evaluate(i=>{ const d=document.querySelectorAll('.day')[i]; d.querySelector('.dayopen').click(); },i); await p.waitForTimeout(200);
     out.push(await fr.evaluate(i=>{ const d=document.querySelectorAll('.day')[i]; return d.querySelector('.daylabel').textContent.slice(0,6)+' '+[...d.querySelectorAll('.procview .sprow')].map(r=>[...r.querySelectorAll('.spchip')].filter(x=>/アイテムA/.test(x.textContent)).map(x=>r.querySelector('.ptag').textContent+':'+x.textContent.replace(/（\d+(\.\d)?B）/,'').replace(/\s+/g,'')).join(',')).filter(Boolean).join(' '); },i));
     await fr.evaluate(i=>{ const d=document.querySelectorAll('.day')[i]; d.querySelector('.dayopen').click(); },i); await p.waitForTimeout(150); }
   return out.join(' | '); };
 const moves=()=>p.evaluate(()=>JSON.stringify(JSON.parse(__debug.state.blockworkValue).moves||{}));
 const openDay=async(i)=>{ await fr.evaluate(i=>document.querySelectorAll('.day')[i].querySelector('.dayopen').click(),i); await p.waitForTimeout(300); };
 const tapChip=async(i,proc,name)=>{ await fr.evaluate(([i,proc,name])=>{ const d=document.querySelectorAll('.day')[i]; const r=[...d.querySelectorAll('.procview .sprow')].find(r=>r.querySelector('.ptag').textContent===proc); [...r.querySelectorAll('.spchip')].find(x=>x.textContent.includes(name)).click(); },[i,proc,name]); await p.waitForTimeout(300); };
 const panelTxt=()=>fr.evaluate(()=>{ const x=document.querySelector('.pvpanel'); return x?x.innerText.replace(/\s+/g,' ').slice(0,60)+'…【'+[...x.querySelectorAll('.taskprocs li')].map(li=>li.querySelector('.tstate').textContent+'/'+((li.querySelector('.swapbtn.sel')||{}).textContent||'-')).join('；')+'】':'(なし)'; });
 const btn=async(label,idx=0)=>{ await fr.evaluate(([label,idx])=>{ const bs=[...document.querySelectorAll('.pvpanel button')].filter(x=>x.textContent.trim()===label); bs[idx].click(); },[label,idx]); await p.waitForTimeout(250); };
 const procBtn=async(li,label)=>{ await fr.evaluate(([li,label])=>{ const L=document.querySelectorAll('.pvpanel .taskprocs li')[li]; [...L.querySelectorAll('button')].find(x=>x.textContent===label).click(); },[li,label]); await p.waitForTimeout(250); };
 const close=async()=>{ await fr.evaluate(()=>document.querySelector('.pvclose').click()); await p.waitForTimeout(500); };
 const procNames = await fr.evaluate(()=>[...document.querySelectorAll('.day')][0]?1:0);
 const reset=async()=>{ await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); v.moves={}; st.blockworkValue=JSON.stringify(v); }); await reload(); };
 const firstRow=async(i)=>fr.evaluate(i=>{ const r=[...document.querySelectorAll('.day')[i].querySelectorAll('.procview .sprow')].find(r=>[...r.querySelectorAll('.spchip')].some(x=>/アイテムA/.test(x.textContent))); return r?r.querySelector('.ptag').textContent:null; },i);
 console.log('はじめ:', await sched()); console.log('もう一度:', await sched());
 // A) まるごと次の営業日へ
 await openDay(0); await tapChip(0,await firstRow(0),'アイテムA');
 console.log('A panel:', await panelTxt());
 console.log('A who:', await fr.evaluate(()=>{ const x=document.querySelector('.pvwhorow'); return x?x.innerText.replace(/\s+/g,' '):'none'; }));
 await btn('まるごと次の営業日へ'); console.log('A 下書き:', await panelTxt());
 await close(); console.log('A moves:', await moves()); console.log('A 計画:', await sched()); console.log('A 再:', await sched());
 // B) 送った先（11/25）の「（11/24の分）」を開いて、まるごと前の営業日へ
 await openDay(1);
 const inRow = await fr.evaluate(()=>{ const d=document.querySelectorAll('.day')[1]; const rows=[...d.querySelectorAll('.procview .sprow')]; for(const r of rows){ for(const x of r.querySelectorAll('.spchip')) if(/アイテムA/.test(x.textContent)) return r.querySelector('.ptag').textContent+'|'+x.textContent; } return null; });
 console.log('B 行:', inRow);
 await fr.evaluate(()=>{ const d=document.querySelectorAll('.day')[1]; const x=[...d.querySelectorAll('.procview .spchip')].find(x=>/アイテムA/.test(x.textContent)); x.click(); }); await p.waitForTimeout(300);
 console.log('B panel:', await panelTxt());
 if(await fr.evaluate(()=>!!document.querySelector('.pvpanel'))){ await btn('まるごと前の営業日へ'); console.log('B 下書き:', await panelTxt()); await close(); }
 console.log('B moves:', await moves()); console.log('B 計画:', await sched());
 // C) やってある→やる→まるごと次（A と同じになるか）
 await reset(); await openDay(0); await tapChip(0,await firstRow(0),'アイテムA');
 await procBtn(1,'やってある'); console.log('C やってある:', await panelTxt());
 await procBtn(1,'やる'); console.log('C やる:', await panelTxt());
 await procBtn(0,'やってある'); await procBtn(0,'やる'); console.log('C 早めもやる:', await panelTxt());
 await btn('まるごと次の営業日へ'); await close(); console.log('C moves:', await moves());
 // D) 焼きだけ：次へ→前へ→前へ
 await reset(); await openDay(0); await tapChip(0,await firstRow(0),'アイテムA');
 await procBtn(2,'次の営業日へ'); console.log('D 焼き次:', await panelTxt());
 await procBtn(2,'前の営業日へ'); console.log('D 前へ:', await panelTxt());
 await procBtn(2,'前の営業日へ'); console.log('D もう一度前へ:', await panelTxt());
 await close(); console.log('D moves:', await moves()); console.log('D 計画:', await sched());
 // E) 早めの工程（11/25用）を開いて「やってある」→詳細が消えない
 await reset(); await openDay(0);
 await fr.evaluate(()=>{ const d=document.querySelectorAll('.day')[0]; const x=[...d.querySelectorAll('.procview .spchip')].find(x=>/アイテムA/.test(x.textContent)&&/用/.test(x.textContent)); x&&x.click(); }); await p.waitForTimeout(300);
 console.log('E panel:', await panelTxt());
 await procBtn(0,'やってある'); console.log('E やってある後:', await panelTxt());
 await close(); console.log('E moves:', await moves());
 console.log('errors', errs); await b.close();
})();
