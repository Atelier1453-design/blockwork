// テスト用のページ（python3 tools/make_test.py で作る test/index.html）を開いて、作り物のデータを入れる。本人のデータは使わない。
const { chromium } = require('playwright');
exports.open = async function(opts){
  const b = await chromium.launch();
  const ctx = await b.newContext(Object.assign({viewport:{width:1180,height:820}, ignoreHTTPSErrors:true}, opts||{}));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort());
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8934/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(()=>{
    const D = window.__debug, st = D.state;
    st.dbxReady = true;
    const mk=(name,unit,qty,price,kind)=>({id:'m_'+name,name,unit,qty,price,unitPrice:price/qty,category:'粉類',kind:kind||'food'});
    st.materials = [mk('薄力粉','g',1000,400),mk('バター','g',450,900),mk('グラニュー糖','kg',1,300),mk('卵','個',10,300),mk('アーモンドパウダー','g',1000,2000),mk('OPP袋','枚',100,500,'supply')];
    D.rebuildMaterialIndex();
    const prods=[];
    for(let i=0;i<30;i++){
      const ing=[{name:'薄力粉',qty:200,unit:'g',unitPrice:0.4,amount:80},{name:'バター',qty:100,unit:'g',unitPrice:2,amount:200},{name:'グラニュー糖',qty:0.08,unit:'kg',unitPrice:300,amount:24},{name:'卵',qty:1,unit:'個',unitPrice:30,amount:30},{name:'アーモンドパウダー',qty:30,unit:'g',unitPrice:2,amount:60}];
      prods.push({id:'p'+i,name:'クッキー'+i,category:'クッキー',sourceType:'bake',salePrice: i%2? 300: 200,
        batch:{yieldCount:40,baseYieldCount:20,multiplier:2,allowedMultipliers:[1,2],yieldUnit:'枚',ingredients:ing,materialCostTotal:394,laborCost:100,overheadCost:20,costPerYieldUnit:25},
        pack:{piecesPerPackage:5,materialCostForPackage:120,items:[{name:'OPP袋',qty:1,unit:'枚',unitPrice:5,amount:5}],itemsCost:5,contents:[],laborCost:10,overheadCost:2,sgaCost:10},
        totalCost:147,marginRate:0.35,priceExTax:220,priceInTax:250,profitRate:0.3,planning:{countUnit:'袋'},updatedAt:'2026-09-01T00:00:00.000Z',createdAt:'2026-09-01T00:00:00.000Z'});
    }
    st.products=prods;
    st.settings.laborRate = 25; st.settings.overheadRate = 8;
    st.blockworkValue = JSON.stringify({staff:[{id:'s1',name:'トモヒロ'}], procs:[{id:'k1',label:'計量'},{id:'k2',label:'成形'},{id:'k3',label:'焼成'},{id:'k4',label:'袋詰め'}],
      products: prods.map(function(p){ return {name:p.name, code:'', procOrder:['k1','k2','k3','k4'], procs:{k1:{s1:{setup:10,per:5}},k2:{s1:{setup:5,per:20}},k3:{s1:{setup:0,per:15}},k4:{s1:{setup:5,per:10}}}}; })});
  });
  return {b,p,errs};
};
