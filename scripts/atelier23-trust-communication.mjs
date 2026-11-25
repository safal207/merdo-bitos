import assert from "node:assert/strict";
import {graph} from "../atelier23/experiments/need-graph.mjs";
import {createCommunication,applyCommunication,createSession,dispatch,sessionSummary,evidence} from "../atelier23/experiments/trust-communication.mjs";
let checks=0;const check=(v,msg)=>{assert.ok(v,msg);checks++},reject=fn=>{assert.throws(fn);checks++};
const ev=(s,id,type,extra={})=>({id,revision:s.revision,type,...extra});
const send=(s,id,type,extra)=>applyCommunication(graph,s,ev(s,id,type,extra));
let c=createCommunication();
reject(()=>send(c,"x","state_need",{need:"confidence"}));reject(()=>send(c,"x","consent",{accepted:"yes"}));
c=send(c,"1","consent",{accepted:true});c=send(c,"2","state_need",{need:"confidence"});
reject(()=>send(c,"x","reflect",{need:"comfort"}));reject(()=>send(c,"x","confirm"));
c=send(c,"3","reflect",{need:"confidence"});c=send(c,"4","confirm");c=send(c,"5","show_evidence",{key:"search"});
check(c.decision==="unknown","evidence not purchase");
reject(()=>send(c,"x","show_evidence",{key:"fit"}));reject(()=>send(c,"x","show_evidence",{key:"search",status:"verified"}));
const e=ev(c,"6","choose",{value:"request_discussion"}),d=applyCommunication(graph,c,e);
check(applyCommunication(graph,d,e)===d,"idempotent");reject(()=>applyCommunication(graph,d,{...e,value:"defer"}));
c=send(d,"7","correct",{need:"comfort"});check(c.decision==="unknown"&&!c.confirmed&&c.shown.length===0,"correction");
reject(()=>send(c,"x","choose",{value:"request_discussion"}));
for(const stage of [createCommunication(),send(createCommunication(),"a","consent",{accepted:true}),c,d]){
 const stopped=send(stage,"stop","stop");check(!stopped.active&&!stopped.consent&&stopped.decision==="decline","stop");reject(()=>send(stopped,"new","request_support",{value:"example"}));
 const r=send(stopped,"restart","restart",{topic:"style"});check(r.revision===stage.revision+1&&!r.consent&&r.need==="unknown","restart");reject(()=>applyCommunication(graph,r,ev(stage,"stale","stop")));
}
let s=createSession(graph,{need:"confidence",day:10});
reject(()=>dispatch(graph,s,"learning",{id:"l0",revision:0,type:"orient"}));
const comm=(id,type,extra={})=>{const l=s.learning,a=s.activation;s=dispatch(graph,s,"communication",ev(s.communication,id,type,extra));check(s.learning===l&&s.activation===a,"domain isolation")};
comm("c1","consent",{accepted:true});comm("c2","state_need",{need:"confidence"});comm("c3","reflect",{need:"confidence"});comm("c4","confirm");comm("c5","show_evidence",{key:"search"});comm("c6","request_support",{value:"example"});
check(s.learning.understanding==="unknown"&&s.activation.intensity===0&&s.communication.decision==="unknown","no implied state");
let prev=s.communication;s=dispatch(graph,s,"learning",{id:"l1",revision:0,type:"orient"});check(s.communication===prev&&s.learning.understanding==="oriented","explicit learning");
s=dispatch(graph,s,"learning",{id:"l2",revision:0,type:"start_task",task:"utm_check"});
comm("c7","show_evidence",{key:"utm"});
reject(()=>dispatch(graph,s,"learning",{id:"l3",revision:0,type:"answer",attemptId:"l2",answer:"tracking_not_orders"}));
s=dispatch(graph,s,"learning",{id:"l4",revision:0,type:"hint",support:"hint"});s=dispatch(graph,s,"learning",{id:"l5",revision:0,type:"answer",attemptId:"l2",answer:"tracking_not_orders"});
check(s.learning.understanding==="assisted","exposure is assisted");reject(()=>dispatch(graph,s,"learning",{id:"l6",revision:0,type:"start_task",task:"utm_check"}));
const phase=graph.nodes.find(n=>n.id==="career_shift");prev=s.communication;const l=s.learning;
s=dispatch(graph,s,"activation",{id:"a1",day:10,type:"activate",occurrence:"synthetic1",phase:phase.id,anchorDay:20,strength:80,fromSpace:phase.space.from,toSpace:phase.space.to});
check(s.activation.intensity===80&&s.communication===prev&&s.learning===l,"explicit activation");
comm("c8","choose",{value:"request_discussion"});let summary=sessionSummary(s);check(summary.syntheticIntensity===80&&summary.purchaseCreated===false&&summary.commercialEffect==="unknown","no financial effects");
comm("c9","stop");reject(()=>dispatch(graph,s,"activation",{id:"a2",day:11,type:"tick"}));reject(()=>dispatch(graph,s,"learning",{id:"l7",revision:0,type:"orient"}));
comm("c10","restart",{topic:"audit"});comm("c11","consent",{accepted:true});check(sessionSummary(s).understanding==="unknown","same topic reset guard");
reject(()=>dispatch(graph,s,"learning",{id:"l8",revision:0,type:"orient"}));s=dispatch(graph,s,"learning",{id:"l9",revision:0,type:"restart"});
check(s.learning.understanding==="unknown","explicit learning reset");reject(()=>dispatch(graph,s,"learning",{id:"l10",revision:1,type:"start_task",task:"utm_check"}));
for(const topic of ["audit","style"])for(const need of ["unknown",...graph.nodes.filter(n=>n.type==="need").map(n=>n.id)])for(const decision of ["explore","defer","decline","request_discussion"]){
 let t=createCommunication(topic);t=send(t,"1","consent",{accepted:true});t=send(t,"2","state_need",{need});t=send(t,"3","reflect",{need});t=send(t,"4","confirm");
 if(need==="unknown"&&decision==="request_discussion"){reject(()=>send(t,"5","choose",{value:decision}));continue}
 t=send(t,"5","choose",{value:decision});check(t.decision===decision&&t.active===(decision!=="decline"),"choice");
}
let rng=42;const random=n=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return Math.floor(rng/4294967296*n)};
for(let i=0;i<100;i++){let t=createCommunication();for(let j=0;j<50;j++){
 const type=["consent","state_need","reflect","confirm","correct","show_evidence","request_support","choose","stop","restart"][random(10)];
 const extra=type==="consent"?{accepted:!!random(2)}:["state_need","reflect","correct"].includes(type)?{need:["confidence","comfort","unknown"][random(3)]}:type==="show_evidence"?{key:["search","fit","utm"][random(3)]}:type==="request_support"?{value:"example"}:type==="choose"?{value:["explore","defer","decline","request_discussion"][random(4)]}:type==="restart"?{topic:["audit","style"][random(2)]}:{};
 const input=ev(t,"e"+i+"-"+j,type,extra),old=t;
 try{t=applyCommunication(graph,t,input)}catch{check(t===old,"rejected transition immutable");continue}
 check(Object.isFrozen(t)&&(!t.active?(!t.consent&&t.decision==="decline"):true),"state invariant");
 check(t.decision!=="request_discussion"||t.confirmed&&t.need!=="unknown","discussion guard");
 check(t.shown.every(key=>evidence[key].topic===t.topic),"evidence scope");check(applyCommunication(graph,t,input)===t,"idempotence");
}}
console.log("PASS Trust & Communication 8.9: "+checks+" checks; 5000 seeded events");
