import {graph,validate,phasePaths} from "./need-graph.mjs";
import {createSession,dispatch,sessionSummary} from "./trust-communication.mjs";
import {applyEvent} from "./need-activation.mjs";
import {opportunityWindow,launchPhase} from "./opportunity-window.mjs";
const F=Object.freeze,day=v=>Number.isSafeInteger(v)&&v>=0&&v<365,amount=v=>Number.isSafeInteger(v)&&v>=0;
const token=v=>typeof v==="string"&&v.length>0&&v.length<=128&&v.trim()===v;
const sum=(a,b)=>{const n=a+b;if(!Number.isSafeInteger(n))throw Error("money overflow");return n};
export function createLedger(currency="EUR"){if(!["EUR","RUB"].includes(currency))throw Error("invalid currency");return F({currency,day:0,orders:F([]),events:F([]),revenue:0,refunds:0,costs:0,acquisition:0,contribution:0})}
export function recordFinance(s,e,authorization){
 if(!e||!token(e.id)||!token(e.order)||!day(e.day)||e.currency!==s.currency||!["pay","refund"].includes(e.type)||!amount(e.amount)||e.amount===0)throw Error("invalid financial event");
 const normalized={id:e.id,order:e.order,day:e.day,currency:e.currency,type:e.type,amount:e.amount};
 if(e.type==="pay"){if(!token(e.episode)||!token(e.offer)||!amount(e.cost)||!amount(e.acquisition))throw Error("invalid payment");Object.assign(normalized,{episode:e.episode,offer:e.offer,cost:e.cost,acquisition:e.acquisition})}
 if(Object.keys(e).some(k=>!Object.hasOwn(normalized,k)))throw Error("unknown financial field");
 const signature=JSON.stringify(normalized),old=s.events.find(x=>x.id===e.id);
 if(old){if(old.signature!==signature)throw Error("financial event conflict");return s}
 if(e.day<s.day)throw Error("financial time reversal");
 let orders=[...s.orders],revenue=s.revenue,refunds=s.refunds,costs=s.costs,acquisition=s.acquisition;
 const idx=orders.findIndex(x=>x.id===e.order);
 if(e.type==="pay"){
  if(idx!==-1||orders.some(x=>x.episode===e.episode))throw Error("duplicate order or episode");
  if(!authorization||authorization.synthetic!==true||authorization.canDiscuss!==true||authorization.episode!==e.episode||authorization.offer!==e.offer||authorization.day!==e.day)throw Error("payment fixture requires eligible episode");
  orders.push(F({id:e.order,episode:e.episode,offer:e.offer,day:e.day,paid:e.amount,refunded:0,repeat:orders.length>0}));
  revenue=sum(revenue,e.amount);costs=sum(costs,e.cost);acquisition=sum(acquisition,e.acquisition);
 }else{
  if(idx===-1||e.amount>orders[idx].paid-orders[idx].refunded)throw Error("refund exceeds paid");
  orders[idx]=F({...orders[idx],refunded:sum(orders[idx].refunded,e.amount)});refunds=sum(refunds,e.amount);
 }
 const contribution=sum(sum(sum(revenue,-refunds),-costs),-acquisition);
 return F({...s,day:e.day,orders:F(orders),events:F([...s.events,F({id:e.id,signature})]),revenue,refunds,costs,acquisition,contribution});
}
export function ledgerSummary(s){return F({currency:s.currency,paidOrders:s.orders.length,repeatPaidOrders:s.orders.filter(x=>x.repeat).length,retainedOrders:s.orders.filter(x=>x.paid>x.refunded).length,netRevenue:s.revenue-s.refunds,refunds:s.refunds,costs:s.costs,acquisition:s.acquisition,contribution:s.contribution,ltv:null})}
const fixture=[
 {id:"career",day:20,anchor:40,phase:"career_shift",need:"confidence",offer:"suit",due:40,lead:20,pay:120000,cost:70000,acq:10000,feedback:{day:40,amount:100},learn:true},
 {id:"wedding",day:100,anchor:130,phase:"occasion_prepare",need:"confidence",offer:"suit",due:130,lead:15,pay:160000,cost:90000,acq:0,feedback:{day:130,amount:10}},
 {id:"decline",day:180,anchor:205,phase:"occasion_prepare",need:"confidence",offer:"suit",due:205,lead:15,decision:"decline"},
 {id:"late",day:220,anchor:240,phase:"career_shift",need:"confidence",offer:"suit",due:240,lead:21},
 {id:"stale",day:260,anchor:280,phase:"travel_shift",need:"confidence",offer:"suit",due:280,lead:10,stale:true},
 {id:"unknown",day:300,anchor:330,phase:"occasion_prepare",need:"confidence",offer:"suit",due:330,lead:15,unknown:true},
 {id:"fit",day:340,anchor:330,phase:"fit_review",need:"comfort",offer:"alteration",due:350,lead:5,pay:20000,cost:8000,acq:0,refund:{day:350,amount:20000},feedback:{day:350,amount:10}}
];
const calendar=f=>({prepare:f.day-15,opportunity:f.day-12,transformation:f.day-9,ownership:f.day-5,open:f.day,close:f.day+3});
export function simulateYear(){
 const map=validate(graph),sessions=new Map(),episodes=[],daily=[],journal=[];
 let ledger=createLedger(),seq=0;
 const nextId=()=> "sim-"+(++seq);
 const comm=(s,type,fields={})=>dispatch(graph,s,"communication",{id:nextId(),revision:s.communication.revision,type,...fields});
 const learn=(s,type,fields={})=>dispatch(graph,s,"learning",{id:nextId(),revision:s.learning.revision,type,...fields});
 const act=(s,type,day,fields={})=>dispatch(graph,s,"activation",{id:nextId(),type,day,...fields});
 for(let d=0;d<365;d++){
  for(const [need,s] of sessions)sessions.set(need,F({...s,activation:applyEvent(graph,s.activation,{id:nextId(),type:"tick",day:d})}));
  for(const f of fixture.filter(x=>x.day===d)){
   const p=map.get(f.phase),context={phase:f.phase,anchorDay:f.anchor,fromSpace:f.unknown?undefined:p.space.from,toSpace:p.space.to};
   let s=sessions.get(f.need);
   if(!s)s=createSession(graph,{topic:"style",need:f.need,day:d,decayPerDay:2});
   else s=comm(s,"restart",{topic:"style"});
   s=comm(s,"consent",{accepted:true});s=comm(s,"state_need",{need:f.need});s=comm(s,"reflect",{need:f.need});s=comm(s,"confirm");
   s=act(s,"activate",d,{...context,occurrence:f.id,strength:90});
   if(f.learn){
    s=learn(s,"orient");s=learn(s,"start_task",{task:"fit_intro"});s=learn(s,"hint",{support:"example"});
    s=learn(s,"answer",{attemptId:s.learning.attempt.id,answer:"check_movement"});
    s=learn(s,"start_task",{task:"fabric_check"});s=learn(s,"answer",{attemptId:s.learning.attempt.id,answer:"match_context"});
    s=learn(s,"start_task",{task:"occasion_check"});s=learn(s,"answer",{attemptId:s.learning.attempt.id,answer:"match_context"});
   }
   s=comm(s,"choose",{value:f.decision||"request_discussion"});
   const availability={offer:f.offer,status:"verified",checkedDay:d-2,validThroughDay:f.stale?d-1:d+2,leadDays:f.lead,available:true,source:"synthetic-fixture"};
   const w=opportunityWindow(graph,s,{calendar:calendar(f),now:d,...context,offer:f.offer,dueDay:f.due,availability});
   const rows=phasePaths(graph,{phase:f.phase,relativeDay:d-f.anchor,fromSpace:context.fromSpace,toSpace:context.toSpace,need:f.need,customer:ledger.orders.length?"returning":"new"}).rows;
   const eligible=w.canDiscuss&&rows.some(r=>r.offer===f.offer);
   episodes.push(F({id:f.id,day:d,need:f.need,offer:f.offer,cycle:s.activation.cycle,intensity:s.activation.intensity,activation:s.activation.lastOutcome,window:w,eligible,understanding:sessionSummary(s).understanding}));
   journal.push(F({day:d,type:"opportunity",episode:f.id,eligible}));
   if(f.pay!==undefined){
    ledger=recordFinance(ledger,{id:"paid-"+f.id,order:"order-"+f.id,day:d,currency:"EUR",type:"pay",amount:f.pay,cost:f.cost,acquisition:f.acq,episode:f.id,offer:f.offer},{synthetic:true,canDiscuss:eligible,episode:f.id,offer:f.offer,day:d});
    journal.push(F({day:d,type:"synthetic_payment",episode:f.id}));
   }
   if(s.communication.active)s=comm(s,"stop");
   sessions.set(f.need,s);
  }
  for(const f of fixture){
   if(f.feedback?.day===d){
    const s=sessions.get(f.need),a=applyEvent(graph,s.activation,{id:nextId(),type:"satisfy",day:d,amount:f.feedback.amount,confirmed:true});
    sessions.set(f.need,F({...s,activation:a}));journal.push(F({day:d,type:"synthetic_feedback",episode:f.id,outcome:a.lastOutcome}));
   }
   if(f.refund?.day===d){ledger=recordFinance(ledger,{id:"refund-"+f.id,order:"order-"+f.id,day:d,currency:"EUR",type:"refund",amount:f.refund.amount});journal.push(F({day:d,type:"synthetic_refund",episode:f.id}))}
  }
  daily.push(F({day:d,needs:F(["confidence","comfort"].map(need=>{const a=sessions.get(need)?.activation;return F({need,intensity:a?.intensity??0,cycle:a?.cycle??0,status:a?.status??"latent"})})),campaigns:F(fixture.filter(f=>d>=calendar(f).prepare&&d<=calendar(f).close).map(f=>F({episode:f.id,stage:launchPhase(calendar(f),d)}))),finance:ledgerSummary(ledger)}));
 }
 return F({synthetic:true,days:F(daily),episodes:F(episodes),journal:F(journal),ledger,finance:ledgerSummary(ledger),externalActions:0});
}
