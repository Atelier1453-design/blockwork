// ver.107：あんちょこカードを1枚ずつ、印刷できる所の上下左右の真ん中に固定（2ページ目に行かない）・線の長さで大きさを直す
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; for(let i=1;i<=12;i++){ const x=st.products[i]; x.sourceType='gift'; x.category='ギフト'; x.name='ギフト'+i; x.pack.contents=[{productId:'p0',name:'クッキー0',qty:2},{productId:'p20',name:'クッキー20',qty:3}]; } });
 await p.click('.nav button[data-view="products"]'); await p.click('#btn-gift-cards'); await p.waitForTimeout(400);
 console.log('pages:', await p.$eval('#gc-pages', e=>e.innerText.replace(/\s+/g,' ')), 'built cards:', await p.$$eval('#gc-print .gc-run-cards .gc-card', a=>a.length));
 await p.click('[data-gcpg="1"]'); await p.waitForTimeout(200);
 console.log('page2 cards:', await p.$$eval('#gc-print .gc-run-cards .gc-card', a=>a.length));
 await p.evaluate(()=>{ window.print=()=>{}; document.querySelector('.gc-adjust').open=true; });
 await p.fill('#gc-meas','93'); await p.click('#gc-meas-go');
 console.log('sc after 93mm:', await p.evaluate(()=>__debug.state.settings.giftCard.sc), await p.$eval('#gc-scv', e=>e.textContent));
 await check(p,'あんちょこ'); await p.screenshot({path:SP+'/v107gc_'+vp.width+'.png'});
 if(vp.width===1180){
   await p.click('#gc-test');
   // iPad のように上下左右に13mmの余白がある用紙で
   await p.evaluate(()=>{ document.getElementById('print-page-style').textContent='@page{size:210mm 297mm; margin:13mm;}'; });
   await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v107test.pdf', preferCSSPageSize:true, printBackground:true}); await p.emulateMedia({media:'screen'});
   await p.click('#gc-print-btn');
   await p.evaluate(()=>{ document.getElementById('print-page-style').textContent='@page{size:210mm 297mm; margin:13mm;}'; });
   await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v107cards.pdf', preferCSSPageSize:true, printBackground:true}); await p.emulateMedia({media:'screen'});
 }
 console.log('errors', errs); await b.close(); }
})();
