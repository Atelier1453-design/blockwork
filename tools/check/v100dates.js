// ver.100：行事の日にち（二十四節気・旧暦・第◯曜日）が合っているか
const {open}=require('./setup.js');
(async()=>{
 const {b,p,errs}=await open();
 const r=await p.evaluate(()=>{ const D=__debug, out={};
   [2025,2026,2027].forEach(y=>{ out[y]={}; D.evCal().events.forEach(ev=>{ const o=D.evOcc(ev,y); out[y][ev.name]=o?o.day:null; });
     out[y].sekki=D.evSekkiOfYear(y).map(x=>x.name+x.date.slice(5)).join(' '); });
   return out; });
 for (const y of [2025,2026,2027]) {
   const o=r[y]; console.log(y, '節分',o['節分'],'春のお彼岸',o['春のお彼岸'],'母の日',o['母の日'],'父の日',o['父の日'],'敬老の日',o['敬老の日'],'秋のお彼岸',o['秋のお彼岸'],'七夕（旧暦）',o['七夕（旧暦）'],'お月見',o['お月見'],'成人の日',o['成人の日'],'スポーツの日',o['スポーツの日']);
   console.log('  ', o.sekki);
 }
 console.log('errors',errs); await b.close();
})();
