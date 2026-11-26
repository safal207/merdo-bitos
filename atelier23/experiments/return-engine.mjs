import {simulateUniverse,rng,catalog} from "./customer-universe.mjs";
// Synthetic retrospective policy replay; not a causal forecast or live CRM.
export function simulateReturn({seed=20261125,population=1000}={}){
 const base=simulateUniverse({seed,population}), random=rng(seed^12345);
 const draws=base.journal.map(()=>[random(),random(),random()]);
 return ["baseline","social","return"].map(mode=>{
 const states=new Map(base.clients.map(c=>[c.id,{orders:0,last:-1,memory:0,gifts:0}]));
 let gifts=0, giftCost=0, opportunities=0, contacts=0;
 for(const [i,e] of base.journal.entries()){
  if(e.type!=="opportunity")continue;
  const s=states.get(e.client), [satisfied,consent,gift]=draws[i];
  if(s.last>=0)s.memory=Math.max(0,s.memory-(e.day-s.last)/365);
  if(e.outcome==="paid"){
   s.orders++;s.last=e.day;
   if(satisfied<.8)s.memory=Math.min(1,s.memory+.25);
   if(mode==="return"&&satisfied<.8&&consent<.7&&gift<.3&&s.gifts===0){
    s.gifts++;gifts++;giftCost+=1000;
   }
  }else if(mode!=="baseline"&&s.orders&&satisfied<.8&&consent<.7&&e.canDiscuss&&e.decision==="request_discussion"&&e.outcome==="no_payment_fixture"&&e.spent+catalog[e.offer].price<=e.budget){
   opportunities++;contacts++;
  }
 }
 return {mode,synthetic:true,seed,population,days:365,opportunities,contacts,gifts,giftCost,netRevenue:base.totals.netRevenue,contribution:base.totals.contribution-giftCost,repeatPaidOrders:base.totals.repeatPaidOrders,externalActions:0};
 });
}
