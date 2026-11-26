import {simulateUniverse,rng,catalog} from "./customer-universe.mjs";
// Conservative retrospective replay: reserve all baseline orders and production first.
// Synthetic assumptions, not causal estimates. Money in EUR cents.
export function simulateReturn({seed=20261125,population=1000,capacity=12,socialRate=.15,returnBoost=.15}={}){
 for(const p of [socialRate,returnBoost])if(!Number.isFinite(p)||p<0||p>1)throw Error("rate");
 const base=simulateUniverse({seed,population,capacity}), random=rng(seed^12345);
 const draws=base.journal.map(()=>[random(),random(),random(),random()]);
 return ["baseline","social","return"].map(mode=>{
 const states=new Map(base.clients.map(c=>[c.id,{orders:0,last:-1,memory:0,memoryDay:0,gifts:0,extra:0,budget:c.budget,baselineGross:c.spent+c.refunds,contactDay:-100}]));
 const production=base.daily.map(d=>d.production), inventory=new Map(base.inventory), extraOrders=[];
 let gifts=0,giftCost=0,opportunities=0,contacts=0,extraRevenue=0,extraCosts=0;
 for(const [i,e] of base.journal.entries()){
  if(e.type!=="opportunity")continue;
  const s=states.get(e.client), [satisfied,consent,gift,conversion]=draws[i];
  s.memory=Math.max(0,s.memory-(e.day-s.memoryDay)/365);s.memoryDay=e.day;
  if(e.outcome==="paid"){
   s.orders++;s.last=e.day;
   if(satisfied<.8)s.memory=Math.min(1,s.memory+.25);else s.memory=0;
   if(mode==="return"&&satisfied<.8&&consent<.7&&gift<.3&&s.gifts===0){
    s.gifts++;gifts++;giftCost+=1000;s.memory=Math.min(1,s.memory+.2);
   }
  }else if(mode!=="baseline"&&s.orders&&s.memory>0&&consent<.7&&e.canDiscuss&&e.decision==="request_discussion"&&e.outcome==="no_payment_fixture"&&e.day-s.contactDay>=30){
   const o=catalog[e.offer],k=Math.floor(e.day*12/365)+":"+e.offer;
   if(s.baselineGross+s.extra+o.price>s.budget||e.day+o.lead>365||(inventory.get(k)||0)>=o.monthly||production.slice(e.day,e.day+o.lead).some(n=>n>=capacity))continue;
   opportunities++;contacts++;s.contactDay=e.day;
   if(conversion>=Math.min(1,socialRate+(mode==="return"?returnBoost*s.memory:0)))continue;
   s.extra+=o.price;s.orders++;s.last=e.day;extraRevenue+=o.price;extraCosts+=o.cost;
   inventory.set(k,(inventory.get(k)||0)+1);
   for(let d=e.day;d<e.day+o.lead;d++)production[d]++;
   extraOrders.push({client:e.client,day:e.day,episode:e.episode,offer:e.offer,price:o.price,cost:o.cost});
  }
 }
 return {mode,synthetic:true,seed,population,days:365,capacity,opportunities,contacts,gifts,giftCost,extraRevenue,extraCosts,extraOrders,production,inventory:[...inventory].sort(),netRevenue:base.totals.netRevenue+extraRevenue,contribution:base.totals.contribution+extraRevenue-extraCosts-giftCost,repeatPaidOrders:base.totals.repeatPaidOrders+extraOrders.length,externalActions:0};
 });
}
