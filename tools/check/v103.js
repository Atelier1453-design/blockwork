// ver.103：あんちょこカードの印刷（その場で印刷・印刷のあとも印を残す・位置合わせの試し刷り・大きさ）
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; st.products[1].sourceType='gift'; st.products[1].category='ギフト'; st.products[1].name='焼き菓子ギフトS';
   st.products[1].pack.contents=[{productId:'p0',name:'クッキー0',qty:2},{productId:'p2',name:'クッキー2',qty:3}]; });
 await p.click('.nav button[data-view="products"]'); await p.click('#btn-gift-cards'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ window.__printed=[]; window.print=()=>{ window.__printed.push(document.body.className); }; });
 await p.evaluate(()=>{ document.querySelector('.gc-adjust').open=true; });
 await check(p,'あんちょこ（合わせる欄を開いた）'); await p.screenshot({path:SP+'/v103gc_'+vp.width+'.png'});
 await p.click('#gc-test');
 console.log('printed (test):', await p.evaluate(()=>window.__printed.join('|')), 'cells', await p.$$eval('#gc-print .gc-testcell', a=>a.length));
 // iPad はプリンタを選び直すと beforeprint/afterprint がまた来る
 await p.evaluate(()=>{ window.dispatchEvent(new Event('afterprint')); window.dispatchEvent(new Event('beforeprint')); });
 console.log('after re-preview:', await p.evaluate(()=>document.body.className));
 if(vp.width===1180){ await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v103test.pdf', preferCSSPageSize:true, printBackground:true}); await p.emulateMedia({media:'screen'}); }
 await p.fill('#gc-dx','2'); await p.dispatchEvent('#gc-dx','change'); await p.fill('#gc-sc','98'); await p.dispatchEvent('#gc-sc','change');
 await p.click('#gc-print-btn');
 console.log('printed:', await p.evaluate(()=>window.__printed.join('|')), 'cards', await p.$$eval('#gc-print .gc-card', a=>a.length), await p.$eval('#gc-print .gc-sheet-in', e=>e.getAttribute('style')));
 if(vp.width===1180){ await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v103cards.pdf', preferCSSPageSize:true, printBackground:true}); await p.emulateMedia({media:'screen'}); }
 await p.click('#gc-close');
 console.log('after close:', JSON.stringify(await p.evaluate(()=>document.body.className)));
 console.log('errors', errs); await b.close(); }
})();
