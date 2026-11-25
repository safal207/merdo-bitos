import {tasks,createLearning,applyLearning,replayLearning} from "../atelier23/experiments/learning-engine.mjs";
let checks=0;function check(v,msg){if(!v)throw Error(msg);checks++}
function rejects(f){let ok=false;try{f()}catch{ok=true}check(ok,"must reject")}
let i=0;const event=(s,type,extra={})=>({id:"e"+(++i),revision:s.revision,type,...extra});
const run=(s,type,extra)=>applyLearning(s,event(s,type,extra));
let s=createLearning();check(s.understanding==="unknown"&&s.readiness==="unknown","initial");
s=run(s,"orient");check(s.understanding==="oriented","orientation");
s=run(s,"start_task",{task:"search_intro"});let attempt=s.attempt.id;
s=run(s,"hint",{support:"guided"});check(s.understanding==="oriented","hint not learning");
s=run(s,"answer",{attemptId:attempt,answer:"defect_not_loss"});check(s.understanding==="assisted"&&s.readiness==="unknown","assisted only");
rejects(()=>run(s,"start_task",{task:"speed_check"}));
s=run(s,"start_task",{task:"utm_check"});s=run(s,"answer",{attemptId:s.attempt.id,answer:"tracking_not_orders"});check(s.understanding==="independent","independent");
s=run(s,"start_task",{task:"speed_check"});s=run(s,"answer",{attemptId:s.attempt.id,answer:"risk_not_loss"});check(s.understanding==="transfer_demonstrated"&&s.readiness==="unknown","transfer no sale");
s=run(s,"choose_next",{value:"decline"});check(s.understanding==="transfer_demonstrated"&&s.readiness==="decline","refusal not failure");
s=run(s,"reflect",{value:"helpful"});check(s.readiness==="decline","feedback no sale");
const old=s;const stop=event(s,"stop");s=applyLearning(s,stop);check(!s.active,"stop");check(applyLearning(s,stop)===s,"duplicate idempotence");rejects(()=>applyLearning(s,{...stop,type:"orient"}));rejects(()=>run(s,"orient"));
s=run(s,"restart");check(s.active&&s.understanding==="unknown"&&s.readiness==="unknown"&&s.revision===1,"restart");
rejects(()=>applyLearning(s,{id:"stale",revision:0,type:"orient"}));
s=run(s,"start_task",{task:"utm_check"});s=run(s,"hint",{support:"hint"});s=run(s,"answer",{attemptId:s.attempt.id,answer:"tracking_not_orders"});check(s.understanding==="assisted","assisted independent task not independent");
s=run(s,"start_task",{task:"utm_check"});s=run(s,"answer",{attemptId:s.attempt.id,answer:"tracking_not_orders"});check(s.understanding==="assisted","repeated exposed task not independent");
s=run(s,"switch_topic",{topic:"style"});check(s.topic==="style"&&s.understanding==="unknown"&&!s.exposed.length&&!s.independentContext,"topic isolation");
rejects(()=>run(s,"start_task",{task:"utm_check"}));s=run(s,"start_task",{task:"fabric_check"});rejects(()=>run(s,"answer",{attemptId:"wrong",answer:"match_context"}));
s=run(s,"answer",{attemptId:s.attempt.id,answer:"match_context"});check(s.understanding==="independent","style independent");s=run(s,"start_task",{task:"occasion_check"});s=run(s,"answer",{attemptId:s.attempt.id,answer:"wrong"});check(s.understanding==="oriented"&&!s.independentContext,"incorrect transfer resets evidence");
let seed=123456;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
for(let j=0;j<1000;j++){
 let a=createLearning(j%2?"style":"audit"),stream=[];
 const add=(type,extra)=>{const e=event(a,type,extra);stream.push(e);a=applyLearning(a,e)};
 const topic=a.topic,choices=Object.entries(tasks).filter(([,t])=>t.topic===topic);
 add("orient");
 for(const [id,t] of choices){
  if(t.kind==="transfer"&&!a.independentContext)continue;
  add("start_task",{task:id});const helped=rnd(3)===0;if(helped)add("hint",{support:"example"});
  const before=a.readiness;add("answer",{attemptId:a.attempt.id,answer:rnd(4)===0?"wrong":t.answer});
  check(a.readiness===before,"answer never changes readiness");
  check(!a.attempt,"attempt closed");
 }
 add("choose_next",{value:"defer"});add("stop");
 check(!a.active&&a.understanding!=="unknown","terminal");
 check(JSON.stringify(replayLearning(topic,stream))===JSON.stringify(a),"deterministic replay");
 check(Object.isFrozen(a)&&Object.isFrozen(a.events),"immutable");
}

console.log("PASS Learning Engine 8.8: "+checks+" checks; 1000 seeded sessions");
