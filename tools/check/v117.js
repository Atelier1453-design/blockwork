// ver.117：やらない→後ろもやめるか・進み具合の確かめ／あんちょこカードの十字で位置合わせ
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 const dlg=[]; p.on('dialog', d=>{ dlg.push(d.message().replace(/\s+/g,' ').slice(0,90)); d.message().includes('これ以降')?d.accept():d.dismiss(); });
 // あんちょこカード
 await p.evaluate(()=>{ const st=__debug.state; st.settings.giftCard={hole:'l',bg:true,start:1,dx:0,dy:0,sc:100,trim:5,scV2:1,scV3:1}; const x=st.products[1]; x.sourceType='gift'; x.category='ギフト'; x.name='ギフト1'; x.pack.contents=[{productId:'p0',name:'クッキー0',qty:2}]; });
 await p.click('.nav button[data-view="products"]'); await p.click('#btn-gift-cards'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ document.querySelector('.gc-adjust').open=true; });
 console.log('はじめ:', JSON.stringify(await p.evaluate(()=>{ const c=__debug.state.settings.giftCard; return {dx:c.dx,dy:c.dy,trim:c.trim}; })), await p.$eval('#gc-pos',e=>e.textContent));
 await p.fill('#gc-mx','61'); await p.fill('#gc-my','36'); await p.click('#gc-pos-go');
 console.log('十字で合わせた:', JSON.stringify(await p.evaluate(()=>{ const c=__debug.state.settings.giftCard; return {dx:c.dx,dy:c.dy}; })), await p.$eval('#gc-pos',e=>e.textContent));
 await check(p,'あんちょこ'); await p.click('#gc-close');
 // 計画
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id; const P=v.procs.map(x=>x.id).slice(0,4);
   const TD=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date());
   v.products=[{id:'a',name:'アイテムA',code:'',category:'焼き菓子',unit:'袋',yieldBase:12,multis:[1],baseMulti:1,maxMulti:1,stock:0,stockMark:{k:'num',d:TD},safety:6,active:true,status:'sale',procOrder:P,procs:Object.fromEntries(P.map(k=>[k,{[s1]:{setup:0,per:20}}])),procLead:{},uses:[],season:{months:[]},dow:{0:3,1:3,2:3,3:3,4:3,5:3,6:3}}];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.range=7; v.level=false; v.rules=[]; v.events=[]; v.moves={}; v.onHold={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500); fr = p.frames().find(f=>f!==p.mainFrame());
 const openA=async()=>{ await fr.evaluate(()=>{ const d=document.querySelector('.day'); const x=[...d.querySelectorAll('.procview .spchip')].find(x=>/アイテムA/.test(x.textContent))||[...d.querySelectorAll('.batchline button.chip.tap')].find(x=>/アイテムA/.test(x.textContent)); x.click(); }); await p.waitForTimeout(400); };
 const procBtn=async(li,label)=>{ await fr.evaluate(([li,label])=>{ const L=document.querySelectorAll('.pvpanel .taskprocs li')[li]; [...L.querySelectorAll('button')].find(x=>x.textContent===label).click(); },[li,label]); await p.waitForTimeout(300); };
 const st=()=>fr.evaluate(()=>[...document.querySelectorAll('.pvpanel .taskprocs li')].map(li=>li.querySelector('.tstate').textContent).join('／'));
 const moves=()=>p.evaluate(()=>JSON.stringify(JSON.parse(__debug.state.blockworkValue).moves||{}));
 await openA();
 await procBtn(1,'やらない'); console.log('やらない（後ろもやめる）:', await st());
 await fr.evaluate(()=>document.querySelector('.pvdiscard').click()); await p.waitForTimeout(400);
 await openA();
 await procBtn(2,'やってある'); console.log('3つ目だけやってある:', await st());
 await fr.evaluate(()=>document.querySelector('.pvclose').click()); await p.waitForTimeout(400);
 console.log('確かめ:', dlg.slice(-1)[0], '→ キャンセルで残る:', await fr.evaluate(()=>!!document.querySelector('.pvpanel')), 'moves', await moves());
 await check(fr,'計画'); 
 console.log('errors', errs); await b.close(); }
})();
