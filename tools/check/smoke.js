// 全部の画面を iPad の横（1180×820）と縦（820×1180）で開いて、はみ出しとエラーを見る。
// 使い方：bash tools/check/run.sh（テスト用ページを作って、サーバーを立てて、これを動かす）
const {open}=require('./setup.js'); const {check}=require('./ovf.js');
(async()=>{
 let bad=0;
 for (const vp of [{width:1180,height:820},{width:820,height:1180}]) {
  const {b,p,errs}=await open({viewport:vp});
  console.log('=== '+vp.width+'×'+vp.height);
  const ck=async(ctx,label)=>{ const r=await check(ctx,label); bad+=r.length; };
  for (const v of ['products','materials','giftmaker','recipes','links','settings']) {
    await p.click('.nav button[data-view="'+v+'"]'); await p.waitForTimeout(600); await ck(p, v);
  }
  await p.click('.nav button[data-view="products"]'); await p.waitForTimeout(300);
  await p.click('[data-view="review"]'); await p.waitForTimeout(1200); await ck(p,'値段の見直し');
  await p.click('.nav button[data-view="giftmaker"]'); await p.waitForTimeout(300);
  await p.evaluate(()=>{const c=document.getElementById('gm-userules'); if(c&&c.checked) c.click();});
  await p.fill('#gm-target','3000'); await p.click('#gm-run'); await p.waitForTimeout(800); await ck(p,'ギフトの結果');
  await p.evaluate(()=>{ __debug.state.blockworkValue=null; });
  await p.evaluate(()=>__debug.loadBlockworkFrame(true)); await p.click('.nav button[data-view="blockwork"]'); await p.waitForTimeout(2500);
  const fr = p.frames().find(f=>f!==p.mainFrame());
  for (const t of ['計画','在庫','商品','人と時間','休み','店の仕事','工程','注文・イベント','取込','データ']) {
    await fr.evaluate(t=>{ const b=[...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()===t); b&&b.click(); }, t); await p.waitForTimeout(400);
    await ck(fr, 'ブロックワーク：'+t);
  }
  // 計画の日を開いて、メニュー確定まで
  await fr.evaluate(()=>{ [...document.querySelectorAll('nav.tabs button')].find(b=>b.textContent.trim()==='計画').click(); }); await p.waitForTimeout(300);
  await fr.evaluate(()=>{ const d=document.querySelector('.day:not(.closed)'); d&&d.querySelector('.dayopen').click(); }); await p.waitForTimeout(400);
  await ck(fr,'ブロックワーク：計画の日を開く');
  if(errs.length){ console.log('エラー：', errs); bad+=errs.length; }
  await b.close();
 }
 console.log(bad ? '★ 直すところがあります（'+bad+'件）' : '★ はみ出し・エラーなし');
 process.exit(bad?1:0);
})();
