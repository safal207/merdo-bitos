import {graph,validate,phasePaths} from "./need-graph.mjs";
import {createSession,dispatch,sessionSummary} from "./trust-communication.mjs";
import {applyEvent} from "./need-activation.mjs";
import {opportunityWindow} from "./opportunity-window.mjs";
import {createLedger,recordFinance,ledgerSummary} from "./customer-lifecycle.mjs";
// All calendar, money and behavioural values are synthetic, Lisbon-only, EUR cents.
const F=Object.freeze, days=365, safe=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export const catalog=F({suit:F({price:150000,cost:90000,lead:20,monthly:35}),shirt:F({price:25000,cost:14000,lead:7,monthly:70}),knit:F({price:35000,cost:20000,lead:4,monthly:50}),alteration:F({price:15000,cost:8000,lead:5,monthly:40})});
export const routines=F([
 F({id:"career_planning",phase:"career_shift",need:"confidence",offers:F(["suit"]),lead:25,anchors:F([[40,90],[230,300]])}),
 F({id:"occasion_planning",phase:"occasion_prepare",need:"identity",offers:F(["suit","shirt"]),lead:35,anchors:F([[100,210],[280,350]])}),
 F({id:"seasonal_wardrobe",phase:"season_shift",need:"comfort",offers:F(["suit","knit"]),lead:25,anchors:F([[75,105],[245,275]])}),
 F({id:"travel_preparation",phase:"travel_shift",need:"identity",offers:F(["shirt","knit"]),lead:20,anchors:F([[140,220],[290,350]])}),
 F({id:"aftercare",phase:"fit_review",need:"comfort",offers:F(["alteration"]),lead:-10,anchors:F([[60,330]])})
]);
export function rng(seed){if(!safe(seed,0,0xffffffff))throw Error("seed");let x=seed>>>0;return ()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296}}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const month=d=>Math.floor(d*12/365);
export function simulateUniverse({seed=20261125,population=1000,capacity=12,seasonal=true}={}){
 if(!safe(population,1,10000)||!safe(capacity,0,10000)||typeof seasonal!=="boolean")throw Error("config");
 const r=rng(seed),map=validate(graph),clients=[],episodes=[],daily=Array.from({length:days},(_,day)=>({day,requests:0,aligned:0,paid:0,refunds:0,netRevenue:0,contribution:0,production:0})),inventory=new Map(),outcomes={},byRoutine={},journal=[];
 let seq=0;const id=()=>"u-"+(++seq);
 // Draw individual budget and social planning routines independently of identity or protected traits.
 for(let i=0;i<population;i++){
  const c={id:"synthetic-"+i,budget:int(r,1,5)*75000,spent:0,ledger:createLedger(),sessions:new Map()};
  clients.push(c);
  const count=int(r,1,4);
  for(let j=0;j<count;j++){
   const routine=pick(r,routines.slice(0,4)),range=seasonal?pick(r,routine.anchors):[60,350],anchor=int(r,...range),day=anchor-routine.lead;
   episodes.push({id:c.id+"-"+j,client:i,day,anchor,routine,offer:pick(r,routine.offers),decision:pick(r,["request_discussion","request_discussion","explore","decline"]),pays:r()<.7,learn:r()<.4,unknown:r()<.06,stale:r()<.05,refund:r()<.04});
  }
  // Aftercare is conditional on prior retained paid order, checked at processing time.
  const routine=routines[4],anchor=int(r,60,330);
  episodes.push({id:c.id+"-aftercare",client:i,day:anchor-routine.lead,anchor,routine,offer:"alteration",decision:pick(r,["request_discussion","explore","decline"]),pays:r()<.7,learn:false,unknown:false,stale:false,refund:false});
 }
 episodes.sort((a,b)=>a.day-b.day||a.client-b.client||a.id.localeCompare(b.id));
 const pendingRefunds=new Map();
 const comm=(s,type,fields={})=>dispatch(graph,s,"communication",{id:id(),revision:s.communication.revision,type,...fields});
 const learn=(s,type,fields={})=>dispatch(graph,s,"learning",{id:id(),revision:s.learning.revision,type,...fields});
 const act=(s,type,day,fields={})=>dispatch(graph,s,"activation",{id:id(),type,day,...fields});
 function bump(k){outcomes[k]=(outcomes[k]||0)+1}
 let cursor=0;
 for(let d=0;d<days;d++){
  for(const f of pendingRefunds.get(d)||[]){
   const c=clients[f.client],before=ledgerSummary(c.ledger);
   c.ledger=recordFinance(c.ledger,{id:"refund-"+f.id,order:"order-"+f.id,day:d,currency:"EUR",type:"refund",amount:f.price});
   const after=ledgerSummary(c.ledger);c.spent-=f.price;
   daily[d].refunds+=f.price;daily[d].netRevenue+=after.netRevenue-before.netRevenue;daily[d].contribution+=after.contribution-before.contribution;
   journal.push({day:d,type:"refund",episode:f.id,client:c.id,amount:f.price});
  }
  while(cursor<episodes.length&&episodes[cursor].day===d){
   const f=episodes[cursor++],c=clients[f.client],routine=f.routine,o=catalog[f.offer],p=map.get(routine.phase);
   if(routine.id==="aftercare"&&!c.ledger.orders.some(x=>x.paid>x.refunded)){bump("aftercare_without_prior_order");continue}
   const context={phase:p.id,anchorDay:f.anchor,fromSpace:f.unknown?undefined:p.space.from,toSpace:p.space.to};
   let s=c.sessions.get(routine.need);
   if(!s)s=createSession(graph,{topic:"style",need:routine.need,day:d,decayPerDay:2});
   else{s=F({...s,activation:applyEvent(graph,s.activation,{id:id(),type:"tick",day:d})});s=comm(s,"restart",{topic:"style"})}
   s=comm(s,"consent",{accepted:true});s=comm(s,"state_need",{need:routine.need});s=comm(s,"reflect",{need:routine.need});s=comm(s,"confirm");
   s=act(s,"activate",d,{...context,occurrence:f.id,strength:90});
   if(f.learn){s=learn(s,"orient");s=learn(s,"start_task",{task:"fabric_check"});s=learn(s,"answer",{attemptId:s.learning.attempt.id,answer:"match_context"})}
   s=comm(s,"choose",{value:f.decision});
   const key=month(d)+":"+f.offer,used=inventory.get(key)||0;
   const due=routine.id==="aftercare"?d+15:f.anchor;
   const fits=d+o.lead<=days&&Array.from({length:o.lead},(_,i)=>daily[d+i].production<capacity).every(Boolean);
   const inStock=used<o.monthly,available=fits&&inStock;
   const availability={offer:f.offer,status:"verified",checkedDay:d-1,validThroughDay:f.stale?d-1:d,leadDays:o.lead,available,source:"synthetic-capacity"};
   const calendar={prepare:d-15,opportunity:d-12,transformation:d-9,ownership:d-5,open:d,close:d+3};
   const w=opportunityWindow(graph,s,{calendar,now:d,...context,offer:f.offer,dueDay:due,availability});
   const history=c.ledger.orders.length?"returning":"new",compatible=phasePaths(graph,{phase:p.id,relativeDay:d-f.anchor,fromSpace:context.fromSpace,toSpace:context.toSpace,need:routine.need,customer:history}).rows.some(x=>x.offer===f.offer);
   daily[d].requests++;if(w.aligned)daily[d].aligned++;
   const stats=byRoutine[routine.id]||={requests:0,paid:0};stats.requests++;
   let outcome=!w.canDiscuss?(!fits?"capacity":!inStock?"assortment":w.capacity!=="feasible"?"fulfillment_"+w.capacity:w.context!=="hypothesis_match"?"context_"+w.context:f.decision!=="request_discussion"?"voluntary_"+f.decision:"not_aligned"):!compatible?"incompatible_history":c.spent+o.price>c.budget?"budget":!f.pays?"no_payment_fixture":"paid";
   if(outcome==="paid"){
    const before=ledgerSummary(c.ledger);
    c.ledger=recordFinance(c.ledger,{id:"pay-"+f.id,order:"order-"+f.id,episode:f.id,offer:f.offer,day:d,currency:"EUR",type:"pay",amount:o.price,cost:o.cost,acquisition:before.paidOrders?0:10000},{synthetic:true,canDiscuss:true,episode:f.id,offer:f.offer,day:d});
    c.spent+=o.price;inventory.set(key,used+1);
    for(let i=0;i<o.lead;i++)daily[d+i].production++;
    const after=ledgerSummary(c.ledger);daily[d].paid++;stats.paid++;daily[d].netRevenue+=after.netRevenue-before.netRevenue;daily[d].contribution+=after.contribution-before.contribution;
    if(f.refund&&d+o.lead<days){const when=d+o.lead;const queue=pendingRefunds.get(when)||[];queue.push({...f,price:o.price});pendingRefunds.set(when,queue)}
   }
   bump(outcome);
   journal.push({day:d,type:"opportunity",episode:f.id,client:c.id,routine:routine.id,need:routine.need,offer:f.offer,decision:f.decision,outcome,aligned:w.aligned,canDiscuss:w.canDiscuss,understanding:sessionSummary(s).understanding,capacity:w.capacity,context:w.context,cycle:s.activation.cycle,history,budget:c.budget,spent:c.spent});
   if(s.communication.active)s=comm(s,"stop");c.sessions.set(routine.need,s);
  }
 }
 if(cursor!==episodes.length)throw Error("episode outside horizon");
 const summaries=clients.map(c=>({id:c.id,budget:c.budget,spent:c.spent,...ledgerSummary(c.ledger)}));
 const financialKeys=["paidOrders","repeatPaidOrders","retainedOrders","netRevenue","refunds","costs","acquisition","contribution"];
 const totals=Object.fromEntries(financialKeys.map(k=>[k,summaries.reduce((sum,c)=>{const n=sum+c[k];if(!Number.isSafeInteger(n))throw Error("aggregate overflow");return n},0)]));
 return {synthetic:true,seed,population,days,currency:"EUR",capacity,seasonal,totals:{...totals,ltv:null},daily,byRoutine,outcomes,inventory:[...inventory].sort(),clients:summaries,journal,externalActions:0};
}
