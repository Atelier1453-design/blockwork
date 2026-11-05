// 画面の外にはみ出している部品をさがす（横に動かす箱の中・閉じた折りたたみの中は数えない）。
// 画面の外にはみ出しているものを探す（横スクロールの箱の中は除く）
exports.check = async function(ctx, label){
  const r = await ctx.evaluate(()=>{
    const W = document.documentElement.clientWidth, out=[];
    const inScroll = el => { for(let a=el.parentElement;a;a=a.parentElement){ const cs=getComputedStyle(a); if(/(auto|scroll|hidden)/.test(cs.overflowX) && a!==document.body && a!==document.documentElement) return true; } return false; };
    document.querySelectorAll('body *').forEach(el=>{
      const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') return; const dd=el.closest('details'); if(dd&&!dd.open&&el.tagName!=='SUMMARY'&&!el.closest('summary')) return;
      const rc=el.getBoundingClientRect(); if(!rc.width||!rc.height) return;
      if((rc.right>W+1||rc.left<-1) && !inScroll(el)) out.push((el.className||el.tagName).toString().slice(0,40)+' '+Math.round(rc.left)+'-'+Math.round(rc.right)+'/'+W+' '+(el.textContent||'').trim().slice(0,20));
    });
    return out.slice(0,8);
  });
  console.log('[overflow '+label+'] '+(r.length? r.join(' | ') : 'なし'));
  return r;
};
