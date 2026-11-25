import assert from "node:assert/strict";
import {simulateYear,createLedger,recordFinance,ledgerSummary} from "../atelier23/experiments/customer-lifecycle.mjs";
let checks=0;
const check=(v,m)=>{assert.ok(v,m);checks++};
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
const reject=(fn,m)=>{assert.throws(fn,undefined,m);checks++};
const r=simulateYear();
eq(r,simulateYear(),"deterministic replay");eq(r.days.length,365);eq(r.externalActions,0);eq(r.synthetic,true);
eq(r.episodes.map(e=>e.id),["career","wedding","decline","late","stale","unknown","fit"]);
eq(r.episodes.filter(e=>e.eligible).map(e=>e.id),["career","wedding","fit"]);
eq(r.episodes.map(e=>e.window.capacity),["feasible","feasible","feasible","too_late","unknown","feasible","feasible"]);
eq(r.episodes[0].understanding,"transfer_demonstrated");eq(r.episodes[1].understanding,"unknown","learning not inferred from recurrence");
eq(r.episodes[2].window.decision,"decline");eq(r.episodes[2].window.canDiscuss,false);
eq(r.episodes[5].window.context,"unknown");eq(r.episodes[5].eligible,false);
eq(r.episodes.map(e=>e.cycle),[1,2,3,3,3,3,1]);
eq(r.episodes[5].intensity,10,"unknown context does not reinforce");
eq(r.finance,{currency:"EUR",paidOrders:3,repeatPaidOrders:2,retainedOrders:2,netRevenue:280000,refunds:20000,costs:168000,acquisition:10000,contribution:102000,ltv:null});
eq(r.ledger.orders.map(x=>x.repeat),[false,true,true]);eq(r.journal.filter(x=>x.type==="synthetic_feedback").map(x=>x.outcome),["satisfied","partially_satisfied","partially_satisfied"]);
for(const e of r.episodes){
 check(e.window.synthetic&&e.window.status==="hypothesis","synthetic output");
 check(!e.window.purchaseCreated&&!e.window.reservationCreated&&!e.window.communicationSent,"window has no external effects");
 check(!e.eligible||e.window.canDiscuss,"window guard");
 eq(r.days[e.day].campaigns.find(x=>x.episode===e.id).stage,"launch");
 for(const [offset,stage] of [[-15,"pre_prelaunch"],[-12,"opportunity"],[-9,"transformation"],[-5,"ownership"],[3,"post_launch"]])eq(r.days[e.day+offset].campaigns.find(x=>x.episode===e.id).stage,stage);
}
for(let d=0;d<365;d++){
 const s=r.days[d],f=s.finance;eq(s.day,d);eq(s.needs.length,2);
 check(f.contribution===f.netRevenue-f.costs-f.acquisition,"money conservation");
 eq(f.ltv,null);check(f.repeatPaidOrders===Math.max(0,f.paidOrders-1),"repeat follows prior paid order");
 check(f.retainedOrders<=f.paidOrders,"retained count");
 eq(f.paidOrders,r.ledger.orders.filter(o=>o.day<=d).length);
 for(const n of s.needs){
  check(Number.isInteger(n.intensity)&&n.intensity>=0&&n.intensity<=100,"bounded intensity");
  check((n.status==="active")===(n.intensity>0),"active iff positive");
  if(d){const prev=r.days[d-1].needs.find(x=>x.need===n.need);check(n.cycle>=prev.cycle&&n.cycle<=prev.cycle+1,"cycle monotonic");
   if(!r.episodes.some(e=>e.day===d&&e.need===n.need)){check(n.intensity<=prev.intensity,"no spontaneous intensity gain");eq(n.cycle,prev.cycle)}
  }
 }
 if(d&&!r.journal.some(e=>e.day===d&&["synthetic_payment","synthetic_refund"].includes(e.type)))eq(f,r.days[d-1].finance,"nonfinancial event has no financial impact");
}
eq(r.days[20].needs[0].intensity,90,"payment not satisfaction");eq(r.days[40].needs[0].status,"satisfied");
eq(r.days[350].finance.retainedOrders,2);
const p={id:"p",order:"o",day:1,currency:"EUR",type:"pay",amount:100,cost:70,acquisition:10,episode:"ep",offer:"suit"};
const auth={synthetic:true,canDiscuss:true,episode:"ep",offer:"suit",day:1};
const empty=createLedger(),paid=recordFinance(empty,p,auth);
eq(empty.orders.length,0);eq(recordFinance(paid,p,auth),paid);
for(const a of [undefined,{...auth,canDiscuss:false},{...auth,synthetic:false},{...auth,day:2},{...auth,offer:"shirt"},{...auth,episode:"other"}])reject(()=>recordFinance(empty,p,a),"invalid authorization");
for(const e of [{...p,id:"p2"},{...p,id:"p2",order:"o2"},{...p,amount:101},{...p,id:"p2",currency:"RUB"},{...p,id:"p2",day:365},{...p,id:"p2",amount:0},{...p,id:"p2",amount:1.5},{...p,id:"p2",cost:-1}])reject(()=>recordFinance(paid,e,auth),"invalid payment");
const refund={id:"r",order:"o",day:2,currency:"EUR",type:"refund",amount:100};
const refunded=recordFinance(paid,refund);
eq(ledgerSummary(refunded).contribution,-80);eq(ledgerSummary(refunded).retainedOrders,0);eq(recordFinance(refunded,refund),refunded);
for(const e of [{...refund,id:"r2",amount:1},{...refund,id:"r2",order:"unknown"},{...refund,amount:99},{...refund,id:"r2",day:0}])reject(()=>recordFinance(refunded,e),"invalid refund");
reject(()=>recordFinance(paid,{...refund,amount:101}),"over-refund");
const max=recordFinance(empty,{...p,amount:Number.MAX_SAFE_INTEGER,cost:0,acquisition:0},auth);
reject(()=>recordFinance(max,{...p,id:"p2",order:"o2",episode:"ep2",amount:1},{...auth,episode:"ep2"}),"overflow");
for(let revenue=1;revenue<=20;revenue++)for(let refundAmount=0;refundAmount<=revenue;refundAmount++)for(const cost of [0,revenue,revenue+1]){
 const q=recordFinance(empty,{...p,amount:revenue,cost,acquisition:3},auth);
 const end=refundAmount?recordFinance(q,{...refund,amount:refundAmount}):q;
 const f=ledgerSummary(end);eq(f.netRevenue,revenue-refundAmount);eq(f.contribution,revenue-refundAmount-cost-3);
 eq(f.retainedOrders,refundAmount===revenue?0:1);eq(f.paidOrders,1);
}
console.log("PASS Customer Lifecycle 9.1: "+checks+" checks; "+r.days.length+" days; "+r.episodes.length+" episodes; "+r.finance.paidOrders+" synthetic paid orders; "+r.finance.retainedOrders+" retained");
