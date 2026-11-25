// Experimental synthetic learning state. No persistence, customer profiling, purchase or activation side effects.
export const tasks=Object.freeze({
 search_intro:Object.freeze({topic:"audit",kind:"practice",context:"search",answer:"defect_not_loss"}),
 utm_check:Object.freeze({topic:"audit",kind:"independent",context:"utm",answer:"tracking_not_orders"}),
 speed_check:Object.freeze({topic:"audit",kind:"transfer",context:"speed",answer:"risk_not_loss"}),
 fit_intro:Object.freeze({topic:"style",kind:"practice",context:"fit",answer:"check_movement"}),
 fabric_check:Object.freeze({topic:"style",kind:"independent",context:"fabric",answer:"match_context"}),
 occasion_check:Object.freeze({topic:"style",kind:"transfer",context:"occasion",answer:"match_context"})
});
const topics=["audit","style"],readiness=["unknown","explore","defer","decline","request_discussion"],experiences=["unknown","helpful","mixed","unhelpful"];
const token=v=>typeof v==="string"&&v.length>0&&v.length<=128&&v.trim()===v;
const freeze=Object.freeze;
function fresh(topic,revision,events){return freeze({topic,revision,active:true,understanding:"unknown",support:"none",attempt:null,exposed:freeze([]),independentContext:null,readiness:"unknown",experience:"unknown",motive:"unknown",events:freeze(events),lastOutcome:"initialized"})}
export function createLearning(topic="audit"){if(!topics.includes(topic))throw Error("invalid topic");return fresh(topic,0,[])}
function normalized(e){
 if(!e||!token(e.id)||!Number.isSafeInteger(e.revision)||e.revision<0||!["orient","start_task","hint","answer","choose_next","reflect","report_motive","switch_topic","stop","restart"].includes(e.type))throw Error("invalid event");
 const n={id:e.id,revision:e.revision,type:e.type};
 if(e.type==="start_task"){if(!Object.hasOwn(tasks,e.task))throw Error("invalid task");n.task=e.task}
 if(e.type==="hint"){if(!["hint","example","guided"].includes(e.support))throw Error("invalid support");n.support=e.support}
 if(e.type==="answer"){if(!token(e.answer)||!token(e.attemptId))throw Error("invalid answer");n.answer=e.answer;n.attemptId=e.attemptId}
 if(e.type==="choose_next"){if(!readiness.includes(e.value))throw Error("invalid readiness");n.value=e.value}
 if(e.type==="reflect"){if(!experiences.includes(e.value))throw Error("invalid experience");n.value=e.value}
 if(e.type==="report_motive"){if(!["unknown","self_reported"].includes(e.value))throw Error("invalid motive status");n.value=e.value}
 if(e.type==="switch_topic"){if(!topics.includes(e.topic))throw Error("invalid topic");n.topic=e.topic}
 return n;
}
export function applyLearning(s,input){
 const e=normalized(input),signature=JSON.stringify(e),prior=s.events.find(x=>x.id===e.id);
 if(prior){if(prior.signature!==signature)throw Error("event id conflict");return s}
 if(e.revision!==s.revision)throw Error("stale revision");
 const events=[...s.events,freeze({id:e.id,signature})];
 if(e.type==="restart"){if(s.revision===Number.MAX_SAFE_INTEGER)throw Error("revision overflow");return fresh(s.topic,s.revision+1,events)}
 if(!s.active)throw Error("session stopped");
 if(e.type==="switch_topic"){if(s.revision===Number.MAX_SAFE_INTEGER)throw Error("revision overflow");return fresh(e.topic,s.revision+1,events)}
 let patch={lastOutcome:"unchanged"};
 switch(e.type){
 case "orient":patch={understanding:s.understanding==="unknown"?"oriented":s.understanding,lastOutcome:"oriented"};break;
 case "start_task":{
  const t=tasks[e.task];if(t.topic!==s.topic)throw Error("wrong topic");
  if(s.attempt)throw Error("attempt in progress");
  if(t.kind==="transfer"&&!s.independentContext)throw Error("independent evidence required");
  patch={attempt:freeze({id:e.id,task:e.task,assisted:false}),support:"none",lastOutcome:"task_started"};break;
 }
 case "hint":{
  if(!s.attempt)throw Error("no attempt");
  const context=tasks[s.attempt.task].context;
  patch={attempt:freeze({...s.attempt,assisted:true}),support:e.support,exposed:freeze([...new Set([...s.exposed,context])]),lastOutcome:"help_requested"};break;
 }
 case "answer":{
  if(!s.attempt||s.attempt.id!==e.attemptId)throw Error("stale attempt");
  const t=tasks[s.attempt.task],correct=e.answer===t.answer,assisted=s.attempt.assisted||s.exposed.includes(t.context);
  let understanding=s.understanding,independentContext=s.independentContext;
  if(!correct){understanding="oriented";independentContext=null}
  else if(t.kind==="practice"||assisted){if(!["independent","transfer_demonstrated"].includes(understanding))understanding="assisted"}
  else if(t.kind==="independent"){understanding="independent";independentContext=t.context}
  else if(t.kind==="transfer"&&s.independentContext&&s.independentContext!==t.context){understanding="transfer_demonstrated"}
  patch={understanding,independentContext,attempt:null,support:"none",exposed:freeze([...new Set([...s.exposed,t.context])]),lastOutcome:correct?(assisted?"assisted_success":"correct"):"retry_needed"};break;
 }
 case "choose_next":patch={readiness:e.value,lastOutcome:"decision_reported"};break;
 case "reflect":patch={experience:e.value,lastOutcome:"experience_reported"};break;
 case "report_motive":patch={motive:e.value,lastOutcome:"motive_reported"};break;
 case "stop":patch={active:false,attempt:null,support:"none",readiness:"decline",lastOutcome:"stopped"};break;
 }
 return freeze({...s,...patch,events:freeze(events)});
}
export function replayLearning(topic,events){return events.reduce(applyLearning,createLearning(topic))}
