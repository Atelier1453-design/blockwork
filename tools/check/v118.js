// ver.118：原価計算のギフトで器を選ぶと、ギフトのセットの資材を自動で入れる（役目の色つき）
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; const add=(id,name,price,o)=>st.materials.push(Object.assign({id,name,unit:'個',qty:10,price:price*10,unitPrice:price,category:'ギフト資材',kind:'supply',giftUse:true},o||{}));
   add('bx','貼り箱M',150,{giftBox:{type:'box',kind:'貼り箱'}}); add('rb','赤いリボン',12); add('sl','金のシール',5,{giftRole:'deco'}); add('cd','ショップカード',3,{giftRole:'insert'}); add('bg','手提げ紙袋M',35,{giftRole:'carry'});
   add('bx2','OPP袋大',8,{giftBox:{type:'bag',kind:'OPP'}});
   st.materials.find(m=>m.id==='bx').giftSet={cushion:[],fastener:[{id:'rb',qty:1,on:true}],deco:[{id:'sl',qty:2,on:true}],insert:[{id:'cd',qty:1,on:true}],carry:[{id:'bg',qty:1,on:true}]};
   __debug.rebuildMaterialIndex(); });
 await p.click('.nav button[data-view="products"]'); await p.waitForTimeout(300);
 await p.click('[data-view="calc"]'); await p.waitForTimeout(500);
 await p.evaluate(()=>{ document.querySelector('[data-src="gift"]').click(); }); await p.waitForTimeout(300);
 const rows=()=>p.$$eval('#pkg-body tr', a=>a.map(tr=>(tr.dataset.materialName||'(空)')+' ×'+tr.querySelector('.row-qty').value+(tr.dataset.free?'(0円)':'')+' '+((tr.querySelector('.row-roletag')||{}).textContent||'')).join(' | '));
 // 1行目に器
 await p.evaluate(()=>{ const i=document.querySelector('#pkg-body tr .row-name'); i.value='貼り箱M'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 console.log('器を入れた:', await rows());
 console.log('知らせ:', await p.$eval('#pkg-boxnote', e=>e.textContent.slice(0,80)));
 await check(p,'原価計算（ギフト）'); await p.evaluate(()=>document.getElementById('pkg-body').scrollIntoView({block:'center'})); await p.screenshot({path:SP+'/v118_'+vp.width+'.png'});
 // 器を変える（セット未設定）→ 前に入れた行は外れる
 await p.evaluate(()=>{ const i=document.querySelector('#pkg-body tr .row-name'); i.value='OPP袋大'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 console.log('器を変えた:', await rows());
 console.log('知らせ:', await p.$eval('#pkg-boxnote', e=>e.textContent.slice(0,60)));
 console.log('errors', errs); await b.close(); }
})();
