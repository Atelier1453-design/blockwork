// ver.104：あんちょこカードの印刷（中身を先に作る・左右の真ん中にそろえる・上下左右の矢印で位置合わせ）
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
const SP=process.env.SP||'/tmp';
(async()=>{
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
 const {b,p,errs}=await open({viewport:vp});
 console.log('=== ',vp.width);
 await p.evaluate(()=>{ const st=__debug.state; [1,3].forEach(i=>{ st.products[i].sourceType='gift'; st.products[i].category='ギフト'; st.products[i].name='焼き菓子ギフト'+i;
   st.products[i].pack.contents=[{productId:'p0',name:'クッキー0',qty:2},{productId:'p2',name:'クッキー2',qty:3}]; }); });
 await p.click('.nav button[data-view="products"]'); await p.click('#btn-gift-cards'); await p.waitForTimeout(300);
 console.log('built before print:', await p.$$eval('#gc-print .gc-run-cards .gc-card', a=>a.length), await p.$$eval('#gc-print .gc-run-test .gc-testcell', a=>a.length));
 console.log('doc height same?', await p.evaluate(()=>document.documentElement.scrollHeight<=window.innerHeight+5 || 'scroll '+document.documentElement.scrollHeight));
 await p.evaluate(()=>{ window.__printed=[]; window.print=()=>{ window.__printed.push(document.body.className+' build='+(window.__built||0)); }; document.querySelector('.gc-adjust').open=true; });
 for(const mv of ['-0.5,0','-0.5,0','0,-0.5']) await p.click(`[data-gcmv="${mv}"]`);
 await p.click('[data-gcsc="0.5"]');
 console.log('pos:', await p.$eval('#gc-pos', e=>e.textContent), await p.$eval('#gc-scv', e=>e.textContent), JSON.stringify(await p.evaluate(()=>__debug.state.settings.giftCard)));
 console.log('sheet style:', await p.$eval('#gc-print .gc-sheet-in', e=>e.getAttribute('style')));
 await check(p,'あんちょこ（合わせる）'); await p.screenshot({path:SP+'/v104gc_'+vp.width+'.png'});
 await p.click('#gc-test'); console.log('printed:', await p.evaluate(()=>window.__printed.join('|')));
 if(vp.width===1180){ await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v104test.pdf', preferCSSPageSize:true, printBackground:true}); await p.emulateMedia({media:'screen'}); }
 await p.click('#gc-adj-reset');
 await p.click('#gc-print-btn'); console.log('printed:', await p.evaluate(()=>window.__printed.join('|')));
 if(vp.width===1180){ await p.emulateMedia({media:'print'}); await p.pdf({path:SP+'/v104cards.pdf', preferCSSPageSize:true, printBackground:true}); await p.emulateMedia({media:'screen'}); }
 await p.click('#gc-close'); console.log('after close:', JSON.stringify(await p.evaluate(()=>document.body.className)));
 console.log('errors', errs); await b.close(); }
})();
