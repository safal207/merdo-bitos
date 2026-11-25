import assert from "node:assert/strict";
import {graph,phasePaths} from "../atelier23/experiments/need-graph.mjs";
import {createState,applyEvent,replay} from "../atelier23/experiments/need-activation.mjs";
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++};const throws=(f)=>{assert.throws(f);checks++};
const config={need:"confidence",day:0,decayPerDay:5};
const act=(id,day,occurrence="wedding-1",extra={})=>({id,type:"activate",day,occurrence,phase:"occasion_prepare",anchorDay:40,fromSpace:"Повседневная среда",toSpace:"Место торжества",strength:80,...extra});
const tick=(id,day)=>({id,type:"tick",day});
const sat=(id,day,amount)=>({id,type:"satisfy",day,amount,confirmed:true});
const a=act("a",10),s0=createState(graph,config),s1=applyEvent(graph,s0,a);
check(s0.status==="latent"&&s0.intensity===0,"initial");check(s1.intensity===80&&s1.cycle===1&&s1.status==="active","activation");
check(applyEvent(graph,s1,a)===s1,"idempotence");throws(()=>applyEvent(graph,s1,{...a,strength:81}));throws(()=>applyEvent(graph,s1,tick("old",9)));
const s2=applyEvent(graph,s1,sat("b",12,30));check(s2.intensity===40&&s2.status==="active","decay then partial satisfaction");
const s3=applyEvent(graph,s2,sat("c",12,40));check(s3.intensity===0&&s3.status==="satisfied","full satisfaction");
const s4=applyEvent(graph,s3,act("d",13));check(s4.status==="satisfied"&&s4.cycle===1,"same occurrence cannot reactivate");
const s5=applyEvent(graph,s4,act("e",14,"wedding-2"));check(s5.cycle===2&&s5.intensity===80,"new episode");
const s6=applyEvent(graph,s5,tick("f",30));check(s6.status==="expired"&&s6.intensity===0,"decay expiration");
const s7=applyEvent(graph,s6,act("g",31,"wedding-3"));check(s7.cycle===3&&s7.status==="active","recurrence after decay");
check(JSON.stringify(replay(graph,config,[a,sat("b",12,30),sat("c",12,40),act("d",13),act("e",14,"wedding-2"),tick("f",30),act("g",31,"wedding-3")]))===JSON.stringify(s7),"deterministic replay");
check(s1.events.length===1&&s1.occurrences.length===1,"prior state unchanged");
check(applyEvent(graph,s1,sat("no",11,1)).intensity===74,"partial");
throws(()=>applyEvent(graph,s1,{...sat("bad",11,1),confirmed:false}));
throws(()=>applyEvent(graph,s1,{...sat("bad",11,1),amount:0}));
throws(()=>createState(graph,{need:"suit"}));throws(()=>createState(graph,{...config,decayPerDay:0}));
check(applyEvent(graph,s0,act("unknown",10,"x",{toSpace:undefined})).lastOutcome==="context_unknown","unknown space");
check(applyEvent(graph,s0,act("outside",41,"x")).lastOutcome==="context_outside","outside time");
check(applyEvent(graph,s0,act("outside2",10,"x",{toSpace:"другой контекст"})).intensity===0,"outside space");
check(applyEvent(graph,createState(graph,{need:"comfort"}),a).lastOutcome==="no_need_path","unrelated need");
const over=applyEvent(graph,s1,act("over",11,"new", {strength:20}));check(over.cycle===1&&over.intensity===75,"overlap no additive inflation");
const reinforced=applyEvent(graph,over,act("reinforce",12,"newer",{strength:100}));check(reinforced.cycle===1&&reinforced.intensity===100,"max bounded reinforcement");
check(applyEvent(graph,reinforced,tick("huge",Number.MAX_SAFE_INTEGER)).intensity===0,"huge time safe");
for(const bad of [{...a,day:NaN},{...a,anchorDay:Infinity},{...a,strength:101},{...a,strength:0},{...a,occurrence:""},{...a,phase:"suit"},{...a,id:" "},{...a,type:"purchase"}])throws(()=>applyEvent(graph,s0,bad));
for(const phase of graph.nodes.filter(n=>n.type==="phase"))for(const need of graph.nodes.filter(n=>n.type==="need"))for(const day of [phase.time.fromDay-1,phase.time.fromDay,phase.time.toDay,phase.time.toDay+1])for(const mode of ["exact","missing","wrong"]){
 const anchorDay=100,relativeDay=day,fromSpace=mode==="wrong"?"other":phase.space.from,toSpace=mode==="missing"?undefined:phase.space.to;
 const r=phasePaths(graph,{phase:phase.id,relativeDay,fromSpace,toSpace,need:need.id});
 const s=applyEvent(graph,createState(graph,{need:need.id}),{id:"phase-test",type:"activate",day:anchorDay+day,anchorDay,phase:phase.id,occurrence:"sim",strength:50,fromSpace,toSpace});
 check((s.status==="active")===(r.contextStatus==="hypothesis_match"&&r.rows.length>0),"graph gate");
 check(s.intensity===0||s.intensity===50,"intensity bound");
}
let seed=9173;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
for(let run=0;run<100;run++){
 let state=createState(graph,config),events=[],day=0;
 for(let i=0;i<50;i++){
  day+=rnd(4);const kind=rnd(3),id="r"+run+"-"+i;let e;
  if(kind===0)e=act(id,day,"occ-"+rnd(12),{anchorDay:day+1,strength:1+rnd(100)});
  else if(kind===1)e=sat(id,day,1+rnd(100));
  else e=tick(id,day);
  const before=state;state=applyEvent(graph,state,e);events.push(e);
  check(Number.isInteger(state.intensity)&&state.intensity>=0&&state.intensity<=100,"bounded");
  check((state.intensity>0)===(state.status==="active"),"state invariant");
  check(state.cycle>=before.cycle&&state.cycle<=before.cycle+1,"cycle monotonic");
  check(state.cycle<=state.occurrences.length&&state.occurrences.length===new Set(state.occurrences).size,"unique occurrences");
  check(state.day>=before.day&&state.events.length===before.events.length+1,"chronological ledger");
  check(applyEvent(graph,state,e)===state,"duplicate idempotent");
  if(kind!==0)check(state.intensity<=before.intensity,"no spontaneous increase");
 }
 check(JSON.stringify(replay(graph,config,events))===JSON.stringify(state),"random replay");
}
console.log("PASS Need Activation 8.6: "+checks+" checks; 5000 seeded events");
