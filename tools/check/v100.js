// ver.100：行事カレンダー（画面・くわしい欄・準備のお知らせ・ブロックワークの帯と計画・ギフトの行事）
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; st.products[0].name='千歳飴クッキー'; st.products[0].category='焼き菓子'; st.products[1].name='七五三ギフト'; st.products[1].category='ギフト';
   const bw=JSON.parse(st.blockworkValue); bw.products[0].name='千歳飴クッキー'; bw.products[1].name='七五三ギフト'; st.blockworkValue=JSON.stringify(bw);
   st.materials.push({id:'m_box753',name:'七五三の箱',unit:'個',qty:10,price:1000,unitPrice:100,category:'ギフト資材',kind:'supply',giftUse:true,giftEvents:['七五三']}); __debug.rebuildMaterialIndex();
   const ev=__debug.evCal().events.find(x=>x.name==='七五三'); ev.items=[{pid:'p0',qty:12},{pid:'p1',qty:5}]; ev.notes={'2025':'千歳飴クッキーが20袋売れた。ギフトは早めに完売。'}; });
 // 準備のお知らせ
 await p.evaluate(()=>__debug.evCheckPrompts()); await p.waitForTimeout(400);
 console.log('prompt:', await p.evaluate(()=>{ const b=document.getElementById('ev-modal-backdrop'); return b.hidden?'none':document.getElementById('ev-modal-body').innerText.replace(/\s+/g,' ').slice(0,160); }));
 await check(p,'お知らせ');
 await p.screenshot({path:'/tmp/claude-0/-home-user-blockwork/248be3d7-5b33-5eae-9daa-a35cf615e3cd/scratchpad/v100prompt_'+vp.width+'.png'});
 await p.click('#evq-yes'); await p.waitForTimeout(500);
 console.log('plan saved:', JSON.stringify(await p.evaluate(()=>__debug.evCal().events.find(x=>x.name==='七五三').plan)));
 // 行事カレンダーの画面
 await p.evaluate(()=>{ const b=document.getElementById('ev-modal-backdrop'); b.hidden=true; });
 await p.click('.nav button[data-view="events"]'); await p.waitForTimeout(600);
 console.log('now:', await p.$eval('#ev-now-box', e=>e.innerText.replace(/\s+/g,' ')));
 console.log('months:', await p.$$eval('.ev-mhead', a=>a.map(x=>x.innerText.replace(/\s+/g,' ')).slice(9,12).join(' | ')));
 console.log('nov rows:', await p.$$eval('.ev-month.open .ev-row', a=>a.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ')));
 await check(p,'行事カレンダー');
 await p.screenshot({path:'/tmp/claude-0/-home-user-blockwork/248be3d7-5b33-5eae-9daa-a35cf615e3cd/scratchpad/v100cal_'+vp.width+'.png', fullPage:false});
 // くわしい欄
 await p.evaluate(()=>{ [...document.querySelectorAll('.ev-row')].find(x=>x.textContent.includes('七五三')).click(); }); await p.waitForTimeout(400);
 console.log('detail:', await p.$eval('#ev-modal-body', e=>e.innerText.replace(/\s+/g,' ').slice(0,400)));
 await check(p,'くわしい欄');
 await p.screenshot({path:'/tmp/claude-0/-home-user-blockwork/248be3d7-5b33-5eae-9daa-a35cf615e3cd/scratchpad/v100detail_'+vp.width+'.png'});
 await p.fill('#ev-note','今年は12袋から'); await p.click('#ev-close'); await p.waitForTimeout(300);
 console.log('note:', JSON.stringify(await p.evaluate(()=>__debug.evCal().events.find(x=>x.name==='七五三').notes)));
 // 直す（商品を名前で足す）
 await p.evaluate(()=>{ [...document.querySelectorAll('.ev-row')].find(x=>x.textContent.includes('七五三')).click(); }); await p.waitForTimeout(300);
 await p.click('#ev-edit'); await p.waitForTimeout(300);
 await check(p,'直す');
 await p.screenshot({path:'/tmp/claude-0/-home-user-blockwork/248be3d7-5b33-5eae-9daa-a35cf615e3cd/scratchpad/v100edit_'+vp.width+'.png'});
 await p.click('#evf-q'); await p.keyboard.type('クッキー2'); await p.waitForTimeout(300);
 console.log('hits:', await p.$$eval('#evf-hits button', a=>a.map(x=>x.textContent).slice(0,3).join(' / ')));
 await p.evaluate(()=>{ document.querySelector('#evf-hits button').click(); }); await p.waitForTimeout(200);
 await p.click('#evf-save'); await p.waitForTimeout(400);
 console.log('items:', JSON.stringify(await p.evaluate(()=>__debug.evCal().events.find(x=>x.name==='七五三').items)));
 await p.evaluate(()=>{ document.getElementById('ev-modal-backdrop').hidden=true; });
 // ブロックワーク：帯と計画（ちゃんとしたブロックワークのデータで）
 await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
 let fr = p.frames().find(f=>f!==p.mainFrame());
 await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='商品').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ document.querySelector('.pcardhead').click(); }); await p.waitForTimeout(300);
 await fr.evaluate(()=>{ [...document.querySelectorAll('.pbody .chipbtn')][0].click(); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const st=__debug.state; const v=JSON.parse(st.blockworkValue); const s1=v.staff[0].id;
   const kS=v.procs.find(x=>x.label.includes('仕込')).id, kB=v.procs.find(x=>x.label.includes('焼')).id;
   const TD=(d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate())(new Date());
   const mk=(id,name,cat,stock,status)=>({id,name,code:'',category:cat,unit:'袋',yieldBase:6,multis:[1],baseMulti:1,maxMulti:1,stock,stockMark:{k:'num',d:TD},safety:0,active:status!=='rest',status,procOrder:[kS,kB],procs:{[kS]:{[s1]:{setup:5,per:10}},[kB]:{[s1]:{setup:5,per:10}}},uses:[],season:{months:[]},dow:{}});
   v.products=[mk('b0','千歳飴クッキー','焼き菓子',2,'rest'),mk('b1','七五三ギフト','ギフト',0,'order'),mk('b9','ほかの品','焼き菓子',50,'sale')];
   v.staff.forEach(sf=>{ for(let k=0;k<7;k++) sf.shifts[k]={start:'10:00',end:'20:00'}; });
   v.closedDays=[]; v.startMode='today'; v.level=false; v.rules=[]; v.events=[]; v.moves={};
   st.blockworkValue=JSON.stringify(v); });
 await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.waitForTimeout(2500);
 fr = p.frames().find(f=>f!==p.mainFrame());
 console.log('banner:', await fr.evaluate(()=>{ const x=document.querySelector('.evbanner'); return x?x.innerText.replace(/\s+/g,' '):'none'; }));
 console.log('plan:', await fr.evaluate(()=>[...document.querySelectorAll('.day:not(.closed)')].slice(0,4).map(d=>d.querySelector('.daylabel').textContent.slice(0,5)+':'+[...d.querySelectorAll('.batchline button.chip.tap:not(.add)')].map(x=>x.textContent).join(',')).join(' | ')));
 await check(fr,'ブロックワークの帯');
 await fr.evaluate(()=>document.querySelector('.evbanner').scrollIntoView({block:'start'})); await p.screenshot({path:'/tmp/claude-0/-home-user-blockwork/248be3d7-5b33-5eae-9daa-a35cf615e3cd/scratchpad/v100bw_'+vp.width+'.png'});
 await fr.evaluate(()=>{ [...document.querySelectorAll('.evbchip')].find(x=>x.textContent.includes('七五三')).click(); }); await p.waitForTimeout(600);
 console.log('open from bw:', await p.evaluate(()=>document.querySelector('.view.active').id), await p.evaluate(()=>document.getElementById('ev-modal-backdrop').hidden?'closed':document.querySelector('.ev-dhead h3').textContent));
 await p.evaluate(()=>{ document.getElementById('ev-modal-backdrop').hidden=true; });
 // ギフトの組み合わせ：行事が自動で
 await p.click('.nav button[data-view="giftmaker"]'); await p.waitForTimeout(500);
 console.log('gm event:', await p.evaluate(()=>{ const s=document.querySelector('select[data-pick="__event"]'); return s?s.value:'?'; }));
 console.log('errors', errs); await b.close(); }
})();
