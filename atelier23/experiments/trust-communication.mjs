import {validate} from "./need-graph.mjs";
import {createLearning,applyLearning,tasks} from "./learning-engine.mjs";
import {createState,applyEvent} from "./need-activation.mjs";
// Experimental synthetic communication. No personal profiling, tracking, purchase or external actions.
const F=Object.freeze,token=v=>typeof v==="string"&&v.length>0&&v.length<=128&&v.trim()===v;
const decisions=["explore","defer","decline","request_discussion"];
export const evidence=F({
 search:F({topic:"audit",context:"search",status:"verified",date:"2026-11-24",reference:"#tc-01",claim:"Полная выдача EN не показала карточки при проверке; потери продаж неизвестны."}),
 speed:F({topic:"audit",context:"speed",status:"verified",date:"2026-11-24",reference:"#speed",claim:"Лабораторный LCP записи 6,35 с; коммерческий эффект не измерен."}),
 utm:F({topic:"audit",context:"utm",status:"verified",date:"2026-11-24",reference:"#tc-08",claim:"8/8 проверенных URL сохранили UTM; число заказов неизвестно."}),
 fit:F({topic:"style",context:"fit",status:"hypothesis",reference:null,claim:"Индивидуальная посадка может быть полезна; предпочтения и наличие уточняются."}),
 availability:F({topic:"style",context:null,status:"unknown",reference:null,claim:"Актуальная доступность не подтверждена."})
});
function fresh(topic,revision,events){return F({topic,revision,active:true,consent:false,stage:"permission",need:"unknown",reflection:null,confirmed:false,shown:F([]),support:"none",decision:"unknown",events:F(events),lastOutcome:"initialized"})}
export function createCommunication(topic="audit"){if(!["audit","style"].includes(topic))throw Error("invalid topic");return fresh(topic,0,[])}
const kinds=["consent","state_need","reflect","confirm","correct","show_evidence","request_support","choose","stop","restart"];
function normalize(g,e){
 if(!e||!token(e.id)||!Number.isSafeInteger(e.revision)||e.revision<0||!kinds.includes(e.type))throw Error("invalid event");
 const n={id:e.id,revision:e.revision,type:e.type};
 if(["state_need","reflect","correct"].includes(e.type)){if(e.need!=="unknown"&&validate(g).get(e.need)?.type!=="need")throw Error("invalid need");n.need=e.need}
 if(e.type==="consent"){if(typeof e.accepted!=="boolean")throw Error("explicit consent required");n.accepted=e.accepted}
 if(e.type==="show_evidence"){if(!Object.hasOwn(evidence,e.key))throw Error("unknown evidence");n.key=e.key}
 if(e.type==="request_support"){if(!["none","explanation","example","repeat_test"].includes(e.value))throw Error("invalid support");n.value=e.value}
 if(e.type==="choose"){if(!decisions.includes(e.value))throw Error("invalid decision");n.value=e.value}
 if(e.type==="restart"){if(!["audit","style"].includes(e.topic))throw Error("invalid topic");n.topic=e.topic}
 if(Object.keys(e).some(k=>!Object.hasOwn(n,k)))throw Error("unexpected field");
 return n;
}
export function applyCommunication(g,s,input){
 const e=normalize(g,input),signature=JSON.stringify(e),prior=s.events.find(x=>x.id===e.id);
 if(prior){if(prior.signature!==signature)throw Error("event id conflict");return s}
 if(e.revision!==s.revision)throw Error("stale revision");
 const events=[...s.events,F({id:e.id,signature})];
 if(e.type==="restart"){if(s.active||s.revision===Number.MAX_SAFE_INTEGER)throw Error("restart requires stopped session");return fresh(e.topic,s.revision+1,events)}
 if(!s.active)throw Error("session stopped");
 let p;
 if(e.type==="stop"||(e.type==="choose"&&e.value==="decline")||(e.type==="consent"&&!e.accepted)){
 p={active:false,consent:false,stage:"stopped",decision:"decline",support:"none",lastOutcome:"stopped"};
 }else if(e.type==="consent"){
 if(s.stage!=="permission")throw Error("consent already granted");
 p={consent:true,stage:"discovery",lastOutcome:"permission_granted"};
 }else{
 if(!s.consent)throw Error("permission required");
 switch(e.type){
 case "state_need":case "correct":p={need:e.need,reflection:null,confirmed:false,shown:F([]),support:"none",decision:"unknown",stage:"discovery",lastOutcome:"need_reported"};break;
 case "reflect":if(s.stage!=="discovery"||e.need!==s.need)throw Error("reflection mismatch");p={reflection:e.need,confirmed:false,stage:"reflection",lastOutcome:"reflected"};break;
 case "confirm":if(s.stage!=="reflection"||s.reflection===null)throw Error("no reflection");p={confirmed:true,stage:"review",lastOutcome:"interpretation_confirmed"};break;
 case "show_evidence":if(!s.confirmed||evidence[e.key].topic!==s.topic)throw Error("evidence context mismatch");p={shown:F([...new Set([...s.shown,e.key])]),lastOutcome:"evidence_shown"};break;
 case "request_support":p={support:e.value,lastOutcome:"support_requested"};break;
 case "choose":if(e.value==="request_discussion"&&(!s.confirmed||s.need==="unknown"||s.stage!=="review"))throw Error("clarify need first");p={decision:e.value,lastOutcome:"decision_reported"};break;
 default:throw Error("invalid transition");
 }
 }
 return F({...s,...p,events:F(events)});
}
// Separate states, explicit routing, no inferred understanding or need intensity.
export function createSession(g,{topic="audit",need,day=0,decayPerDay=5}={}){
 return F({communication:createCommunication(topic),learning:createLearning(topic),activation:createState(g,{need,day,decayPerDay}),learningRevision:0,disclosed:F([])});
}
export function dispatch(g,s,domain,event){
 if(domain==="communication"){
 const c=applyCommunication(g,s.communication,event);if(c===s.communication)return s;
 // Exposure survives corrections/restarts in this synthetic session: no false independent assessment.
 const context=event.type==="show_evidence"?evidence[event.key].context:null;
 return F({...s,communication:c,disclosed:context?F([...new Set([...s.disclosed,context])]):s.disclosed});
 }
 if(!["learning","activation"].includes(domain))throw Error("invalid domain");
 if(!s.communication.active||!s.communication.consent)throw Error("communication not authorized");
 if(domain==="learning"){
 const c=s.communication,l=s.learning;
 const reset=event.type==="restart"||event.type==="switch_topic";
 if(s.learningRevision!==c.revision&&!reset)throw Error("explicit learning reset required");
 if(event.type==="switch_topic"&&event.topic!==c.topic||event.type!=="switch_topic"&&l.topic!==c.topic)throw Error("topic mismatch");
 if(event.type==="answer"&&l.attempt&&s.disclosed.includes(tasks[l.attempt.task].context)&&!l.attempt.assisted)throw Error("disclosed answer: explicit assisted attempt required");
 if(event.type==="start_task"&&tasks[event.task]&&tasks[event.task].kind!=="practice"&&s.disclosed.includes(tasks[event.task].context))throw Error("fresh assessment context required");
 const n=applyLearning(l,event);if(n===l)return s;
 return F({...s,learning:n,learningRevision:reset?c.revision:s.learningRevision});
 }
 const a=applyEvent(g,s.activation,event);return a===s.activation?s:F({...s,activation:a});
}
export function sessionSummary(s){
 const c=s.communication,l=s.learning,a=s.activation;
 return F({topic:c.topic,need:c.need,confirmed:c.confirmed,decision:c.decision,active:c.active,
 evidence:F(c.shown.map(k=>evidence[k])),understanding:c.topic===l.topic&&s.learningRevision===c.revision?l.understanding:"unknown",
 syntheticIntensity:c.active&&c.need===a.need&&c.confirmed?a.intensity:null,commercialEffect:"unknown",purchaseCreated:false});
}
