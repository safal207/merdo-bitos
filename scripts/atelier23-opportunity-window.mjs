import assert from "node:assert/strict";
import {graph} from "../atelier23/experiments/need-graph.mjs";
import {createSession,dispatch} from "../atelier23/experiments/trust-communication.mjs";
import {launchPhase,fulfillment,opportunityWindow} from "../atelier23/experiments/opportunity-window.mjs";
let checks=0;
const check=(v,msg)=>{assert.ok(v,msg);checks++};
const throws=fn=>{assert.throws(fn);checks++};
const calendar={prepare:1,opportunity:10,transformation:20,ownership:30,open:40,close:60};
for(const [d,p] of [[0,"before"],[1,"pre_prelaunch"],[9,"pre_prelaunch"],[10,"opportunity"],[19,"opportunity"],[20,"transformation"],[29,"transformation"],[30,"ownership"],[39,"ownership"],[40,"launch"],[59,"launch"],[60,"post_launch"],[61,"post_launch"]])check(launchPhase(calendar,d)===p,"half-open launch boundary");
for(const bad of [{...calendar,open:30},{...calendar,close:39},{...calendar,prepare:-1},{...calendar,open:1.5},{...calendar,close:Infinity},{}])throws(()=>launchPhase(bad,40));
const p=graph.nodes.find(n=>n.id==="occasion_prepare");
let serial=0;
const apply=(s,domain,e)=>dispatch(graph,s,domain,{id:"event-"+(++serial),...(domain==="communication"?{revision:s.communication.revision}:domain==="learning"?{revision:s.learning.revision}:{}),...e});
function session(now,decision,active,confirmed,consent){
 let s=createSession(graph,{topic:"style",need:"confidence",day:now});
 if(!consent)return s;
 s=apply(s,"communication",{type:"consent",accepted:true});
 s=apply(s,"communication",{type:"state_need",need:"confidence"});
 if(confirmed){s=apply(s,"communication",{type:"reflect",need:"confidence"});s=apply(s,"communication",{type:"confirm"})}
 if(active)s=apply(s,"activation",{type:"activate",day:now,occurrence:"wedding-1",phase:p.id,anchorDay:now+10,strength:80,fromSpace:p.space.from,toSpace:p.space.to});
 if(decision!=="unknown"&&(decision!=="request_discussion"||confirmed))s=apply(s,"communication",{type:"choose",value:decision});
 return s;
}
const base={calendar,now:40,phase:p.id,anchorDay:50,fromSpace:p.space.from,toSpace:p.space.to,offer:"suit",dueDay:50,availability:{offer:"suit",status:"verified",checkedDay:40,validThroughDay:42,leadDays:10,available:true,source:"synthetic control"}};
const s=session(40,"request_discussion",true,true,true),snapshot=JSON.stringify(s);
const r=opportunityWindow(graph,s,base);
check(r.canDiscuss&&r.aligned&&r.understanding==="unknown"&&!r.independent,"explicit request can discuss without forced learning");
check(JSON.stringify(s)===snapshot,"read-only session");
check(JSON.stringify(r)===JSON.stringify(opportunityWindow(graph,s,base)),"deterministic");
for(const [patch,expected] of [[{dueDay:49},"too_late"],[{dueDay:39},"too_late"],[{dueDay:undefined},"unknown"],[{availability:undefined},"unknown"],[{availability:{...base.availability,checkedDay:41}},"unknown"],[{availability:{...base.availability,checkedDay:39,validThroughDay:39}},"unknown"],[{availability:{...base.availability,available:false}},"unavailable"]]){
 const x=opportunityWindow(graph,s,{...base,...patch});check(x.capacity===expected&&!x.canDiscuss,"capacity guard");
}
for(const patch of [{anchorDay:undefined},{anchorDay:40},{fromSpace:undefined},{toSpace:"wrong"},{offer:"shirt",availability:{...base.availability,offer:"shirt"}},{now:41}])check(!opportunityWindow(graph,s,{...base,...patch}).canDiscuss,"context or stale guard");
for(const patch of [{availability:{...base.availability,offer:"shirt"}},{availability:{...base.availability,leadDays:-1}},{availability:{...base.availability,source:""}},{dueDay:NaN}])throws(()=>opportunityWindow(graph,s,{...base,...patch}));
for(const now of [1,9,10,20,30,39,40,50,59,60,90])
for(const decision of ["unknown","explore","defer","decline","request_discussion"])
for(const active of [false,true])for(const confirmed of [false,true])for(const consent of [false,true])
for(const capacity of ["feasible","unknown","unavailable","too_late"]){
 const state=session(now,decision,active,confirmed,consent);
 const input={...base,now,anchorDay:now+10,dueDay:now+10,availability:capacity==="unknown"?undefined:{...base.availability,checkedDay:now,validThroughDay:now,leadDays:capacity==="too_late"?11:10,available:capacity!=="unavailable"}};
 const before=JSON.stringify(state),out=opportunityWindow(graph,state,input);
 const aligned=now>=40&&now<60&&active&&confirmed&&consent&&capacity==="feasible";
 const allowed=aligned&&decision==="request_discussion";
 check(out.aligned===aligned,"alignment control");check(out.canDiscuss===allowed,"explicit decision control");
 check(!out.purchaseCreated&&!out.reservationCreated&&!out.communicationSent&&out.commercialEffect==="unknown","no external effect");
 check(before===JSON.stringify(state),"no mutation");
}
const oriented=apply(s,"learning",{type:"orient"});
check(opportunityWindow(graph,oriented,base).canDiscuss&&opportunityWindow(graph,oriented,base).understanding==="oriented","learning descriptive only");
const stopped=apply(s,"communication",{type:"stop"});
check(!opportunityWindow(graph,stopped,base).canDiscuss,"stop guard");
check(fulfillment(graph,{offer:"suit",now:Number.MAX_SAFE_INTEGER-1,dueDay:Number.MAX_SAFE_INTEGER,availability:{...base.availability,checkedDay:Number.MAX_SAFE_INTEGER-1,validThroughDay:Number.MAX_SAFE_INTEGER,leadDays:2}})==="too_late","overflow-safe deadline");
console.log("PASS Opportunity Window 9.0: "+checks+" checks");
