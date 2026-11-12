// ver.105：ブロックワークの「保留中」（材料待ちなどで作れないメニューを、計画から外しておく）
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
   const mk=(id,name,stock)=>({id,name,code:'',category:'焼き菓子',unit:'袋',yieldBase:6,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:6,active:true,status:'sale',procOrder:[kS,kB],procs:{[kS]:{[s1]:{setup:5,per:10}},[kB]:{[s1]:{setup:5,per:10}}},uses:[],season:{months:[]},dow:{0:2,1:2,2:2,3:2,4:2,5:2,6:2}});
   v.products=[mk('b0','ガレット',0),mk('b1','フィナンシェ',30)];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.range=7; v.level=false; v.rules=[]; v.events=[]; v.moves={}; v.onHold={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 const plan = ()=>fr.evaluate(()=>[...document.querySelectorAll('.day')].slice(0,4).map(d=>[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].map(x=>x.textContent.replace(/\s+/g,'').slice(0,8)).join(',')).join(' | '));
 console.log('plan before:', await plan());
 await fr.evaluate(()=>{ [...document.querySelectorAll('.batchline button.chip.tap')].find(x=>x.textContent.includes('ガレット')).click(); }); await p.waitForTimeout(300);
 await check(fr,'メニューの詳細'); await fr.evaluate(()=>document.querySelector('.taskpanel').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v105panel_'+vp.width+'.png'});
 await fr.evaluate(()=>{ [...document.querySelectorAll('.taskpanel button')].find(x=>x.textContent.includes('保留中へ')).click(); }); await p.waitForTimeout(600);
 console.log('plan after hold:', await plan());
 console.log('holdbox:', await fr.evaluate(()=>{ const x=document.querySelector('.holdbox'); return x?x.innerText.replace(/\s+/g,' '):'none'; }));
 console.log('saved:', await p.evaluate(()=>JSON.stringify(JSON.parse(__debug.state.blockworkValue).onHold)));
 await check(fr,'保留中'); await fr.evaluate(()=>document.querySelector('.holdbox').scrollIntoView({block:'start'})); await p.screenshot({path:SP+'/v105hold_'+vp.width+'.png'});
 fr.page().on('dialog', d=>d.accept());
 p.on('dialog', d=>d.accept());
 await fr.evaluate(()=>{ window.confirm=()=>true; document.querySelector('.holdchip').click(); }); await p.waitForTimeout(600);
 console.log('plan after release:', await plan(), 'holdbox:', await fr.evaluate(()=>!!document.querySelector('.holdbox')));
 console.log('errors', errs); await b.close(); }
})();
