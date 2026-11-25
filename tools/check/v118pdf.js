// ver.118：あんちょこカードを PDF で（用紙と同じ寸法。上下11mm・左右14mm）
const {open}=require('./setup.js'); const fs=require('fs');
const SP=process.env.SP||'/tmp';
(async()=>{
 const {b,p,errs}=await open({acceptDownloads:true});
 await p.evaluate(()=>{ const st=__debug.state; for(let i=1;i<=3;i++){ const x=st.products[i]; x.sourceType='gift'; x.category='ギフト'; x.name='焼き菓子ギフト'+i; x.salePrice=2160; x.pack.contents=Array.from({length:3+i*3},(_,j)=>({productId:'p'+(5+j),name:'クッキー'+(5+j),qty:1+j%3})); x.pack.items=[{name:'OPP袋',qty:1}]; } });
 await p.click('.nav button[data-view="products"]'); await p.click('#btn-gift-cards'); await p.waitForTimeout(400);
 for(const [id,f] of [['#gc-pdf-test','v118test.pdf'],['#gc-pdf','v118cards.pdf']]){
   const [dl]=await Promise.all([p.waitForEvent('download'), p.click(id)]);
   await dl.saveAs(SP+'/'+f); console.log(f, fs.statSync(SP+'/'+f).size, 'bytes');
 }
 console.log('errors', errs); await b.close();
})();
