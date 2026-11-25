import {validate,phasePaths} from "./need-graph.mjs";

// Synthetic hypothesis engine: no customer identities, predictions, outreach or orders.
const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const token=v=>typeof v==="string"&&v.trim()===v&&v.length>0&&v.length<=128;
const freeze=Object.freeze;
export function createState(g,{need,day=0,decayPerDay=5}={}){
 if(validate(g).get(need)?.type!=="need"||!integer(day,0,Number.MAX_SAFE_INTEGER)||!integer(decayPerDay,1,100))throw Error("invalid configuration");
 return freeze({need,day,decayPerDay,intensity:0,status:"latent",cycle:0,occurrences:freeze([]),events:freeze([]),lastOutcome:"initialized"});
}
function normalize(e){
 if(!e||!token(e.id)||!integer(e.day,0,Number.MAX_SAFE_INTEGER)||!["activate","tick","satisfy"].includes(e.type))throw Error("invalid event");
 const n={id:e.id,day:e.day,type:e.type};
 if(e.type==="activate"){
  if(!token(e.occurrence)||!token(e.phase)||!integer(e.anchorDay,0,Number.MAX_SAFE_INTEGER)||!integer(e.strength,1,100))throw Error("invalid activation");
  for(const key of ["fromSpace","toSpace"])if(e[key]!==undefined&&(typeof e[key]!=="string"||!e[key].trim()))throw Error("invalid space");
  Object.assign(n,{occurrence:e.occurrence,phase:e.phase,anchorDay:e.anchorDay,strength:e.strength,fromSpace:e.fromSpace,toSpace:e.toSpace});
 }
 if(e.type==="satisfy"){
  if(!integer(e.amount,1,100)||e.confirmed!==true)throw Error("explicit synthetic satisfaction feedback required");
  n.amount=e.amount;n.confirmed=true;
 }
 return n;
}
export function applyEvent(g,s,input){
 const e=normalize(input),signature=JSON.stringify(e),previous=s.events.find(x=>x.id===e.id);
 if(previous){if(previous.signature!==signature)throw Error("event id conflict");return s}
 if(e.day<s.day)throw Error("out of order");
 if(validate(g).get(s.need)?.type!=="need")throw Error("unknown need");
 // Decay only for active needs; cap elapsed time before multiplying.
 const elapsed=e.day-s.day;
 let intensity=Math.max(0,s.intensity-Math.min(elapsed,100)*s.decayPerDay);
 let status=s.status,cycle=s.cycle,occurrences=s.occurrences,outcome="time_advanced";
 if(status==="active"&&intensity===0){status="expired";outcome="decayed"}
 if(e.type==="activate"){
  const r=phasePaths(g,{phase:e.phase,relativeDay:e.day-e.anchorDay,fromSpace:e.fromSpace,toSpace:e.toSpace,need:s.need,customer:"unknown"});
  if(r.contextStatus!=="hypothesis_match")outcome="context_"+r.contextStatus;
  else if(!r.rows.length)outcome="no_need_path";
  else if(occurrences.includes(e.occurrence))outcome="occurrence_seen";
  else{
   occurrences=freeze([...occurrences,e.occurrence]);
   if(status!=="active"){cycle++;status="active";intensity=e.strength;outcome="activated"}
   else {intensity=Math.max(intensity,e.strength);outcome="reinforced"}
  }
 }else if(e.type==="satisfy"){
  if(status!=="active")outcome="no_active_need";
  else {intensity=Math.max(0,intensity-e.amount);status=intensity===0?"satisfied":"active";outcome=intensity===0?"satisfied":"partially_satisfied"}
 }
 return freeze({...s,day:e.day,intensity,status,cycle,occurrences,events:freeze([...s.events,freeze({id:e.id,signature})]),lastOutcome:outcome});
}
export function replay(g,config,events){
 return events.reduce((s,e)=>applyEvent(g,s,e),createState(g,config));
}
