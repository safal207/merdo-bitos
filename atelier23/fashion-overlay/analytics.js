// Local prototype analytics. No network, identity, contact data or sales claims.
export const KEY="bitos.atelier23.fashionAnalytics.v1";
export const LIMIT=2000;
export const SCENES=[
 ["emotion","0–2,8","Ваш момент"],["business","2,8–5,8","Деловой образ"],
 ["occasion","5,8–8,8","Особый момент"],["craft","8,8–11,8","Пошив"],
 ["detail","11,8–15","Детали"],["fitting","15–17,64","Примерка"]
];
export const SIGNATURE_CHAPTERS=[["concept","Замысел"],["fabric","Ткань"],["measure","Мерки"],["pattern","Выкройка"],["making","Производство"],["fitting","Примерка"]];
export const SIGNATURE_CHOICES={concept:["Комфорт в движении","Выразительные детали","Универсальность"],fabric:["Гладкая","Выраженная фактура","Пока не знаю"],measure:["Свобода плеч","Удобство в движении","Обсудить с мастером"],making:["Лацканы и карманы","Подкладка и отделка","Минималистичные детали"]};
export const SIGNATURE_EXTRAS=[["trousers","Вторая пара брюк"],["shirt","Сорочка"],["accessory","Аксессуары"]];
const signatureTypes=new Set(["signature_open","signature_chapter","signature_choice","signature_extra","signature_brief","signature_handoff","signature_reset","signature_replay"]);
const chapterIds=new Set(SIGNATURE_CHAPTERS.map(([id])=>id));
const extraIds=new Set(SIGNATURE_EXTRAS.map(([id])=>id));
const socialTypes=new Set(["social_landing","social_select","social_handoff"]);
const socialSources=new Set(["instagram","tiktok","facebook","direct"]);
const socialTopics=new Set(["craft","wedding","gift","wardrobe"]);
const types=new Set([...socialTypes,...signatureTypes,"film_view","look_view","scene_view","reaction","share_click","share_resolved","share_cancelled","link_copied","cta_click","occasion_selected","look_selected","booking_click","tailoring_click"]);
const targets=new Set(["film","navy","grey","black","ivory","travel-navy","travel-black"]);
const cues=new Set(SCENES.map(s=>s[0]));
const occasions=new Set(["business","wedding","evening","travel","wardrobe"]);
const intents=new Set(["event","business","tailoring","booking","like_on","like_off","save_on","save_off"]);
const pages=new Set(["film","event","look","result","summary","saved","plan"]);
const validId=x=>typeof x==="string"&&/^[a-zA-Z0-9-]{1,80}$/.test(x);
function clean(row){
 if(!row||!types.has(row.type)||!validId(row.visit)||!Number.isFinite(row.ts)||row.ts<0)return null;
 const a={type:row.type,visit:row.visit,ts:row.ts};
 if(socialTypes.has(row.type)){
  if(!socialSources.has(row.source)||!socialTopics.has(row.topic))return null;
  a.source=row.source;a.topic=row.topic;
  if(row.type==="social_handoff"){
   if(!["site","whatsapp"].includes(row.destination))return null;
   a.destination=row.destination;
  }
  return a;
 }
 if(signatureTypes.has(row.type)){
  if(row.type==="signature_chapter"||row.type==="signature_replay"){
   if(!chapterIds.has(row.chapter))return null;a.chapter=row.chapter;
  }else if(row.type==="signature_choice"){
   if(!Object.hasOwn(SIGNATURE_CHOICES,row.chapter)||!SIGNATURE_CHOICES[row.chapter].includes(row.choice))return null;a.chapter=row.chapter;a.choice=row.choice;
  }else if(row.type==="signature_extra"){
   if(!extraIds.has(row.extra)||!["add","remove"].includes(row.action))return null;a.extra=row.extra;a.action=row.action;
  }else if(row.type==="signature_handoff"){
   if(!["advisor","journey"].includes(row.destination))return null;a.destination=row.destination;
  }
  return a;
 }
 if(targets.has(row.target))a.target=row.target;
 if(cues.has(row.cue))a.cue=row.cue;
 if(occasions.has(row.occasion))a.occasion=row.occasion;
 if(intents.has(row.intent))a.intent=row.intent;
 if(pages.has(row.page))a.page=row.page;
 if(Number.isFinite(row.second)&&row.second>=0&&row.second<=17.7)a.second=Math.round(row.second*10)/10;
 return a;
}
export function readLog(storage){
 try{
 const raw=JSON.parse(storage.getItem(KEY)||"null");
 if(raw===null)return {rows:[],dropped:0,available:true};
 if(!Array.isArray(raw.rows))return {rows:[],dropped:0,available:false};
 return {rows:raw.rows.slice(-LIMIT).map(clean).filter(Boolean),dropped:Number.isSafeInteger(raw.dropped)&&raw.dropped>=0?raw.dropped:0,available:true};
 }catch{return {rows:[],dropped:0,available:false}}
}
export function makeTracker(storage,visit){
 return (type,details={})=>{
  const row=clean({...details,type,visit,ts:Date.now()});
  if(!row)return false;
  try{
   const log=readLog(storage);
   if(!log.available)return false;
   log.rows.push(row);
   const excess=Math.max(0,log.rows.length-LIMIT);
   storage.setItem(KEY,JSON.stringify({rows:log.rows.slice(-LIMIT),dropped:log.dropped+excess}));
   return true;
  }catch{return false}
 };
}
export function summarize(rows){
 rows=rows.filter(r=>!signatureTypes.has(r.type)&&!socialTypes.has(r.type));
 const count=(type,predicate=()=>true)=>rows.filter(r=>r.type===type&&predicate(r)).length;
 return {visits:new Set(rows.map(r=>r.visit)).size,filmViews:count("film_view"),lookViews:count("look_view"),likes:count("reaction",r=>r.intent==="like_on"),unlikes:count("reaction",r=>r.intent==="like_off"),saves:count("reaction",r=>r.intent==="save_on"),unsaves:count("reaction",r=>r.intent==="save_off"),shares:count("share_click"),copied:count("link_copied"),shareResolved:count("share_resolved"),occasions:count("occasion_selected"),looks:count("look_selected"),booking:count("booking_click"),tailoring:count("tailoring_click"),scenes:SCENES.map(([id,range,label])=>({id,range,label,views:count("scene_view",r=>r.cue===id),clicks:count("cta_click",r=>r.cue===id)}))};
}

 // Separate local cohort: one ID per mounted page, not unique people or sales.
 // Count unique visits with a recorded start and an ordered brief/handoff.
 export function summarizeSignature(rows){
  const visits=new Map();
  for(const raw of rows){
   const row=clean(raw);if(!row||!signatureTypes.has(row.type))continue;
   if(!visits.has(row.visit))visits.set(row.visit,[]);
   visits.get(row.visit).push(row);
  }
  const out={starts:0,briefs:0,handoffs:0,advisor:0,journey:0,allChapters:0,replays:0,chapters:SIGNATURE_CHAPTERS.map(([id,label])=>({id,label,opens:0,visits:0})),preferences:Object.entries(SIGNATURE_CHOICES).flatMap(([chapter,values])=>values.map(choice=>({chapter,choice,visits:0}))),extras:SIGNATURE_EXTRAS.map(([id,label])=>({id,label,adds:0,removes:0,interestedVisits:0}))};
  for(const events of visits.values()){
   let started=false,brief=false,handed=false;
   const seen=new Set(),lastChoice=new Map(),interest=new Set(),destinations=new Set();
   for(const row of [...events].sort((a,b)=>a.ts-b.ts)){
    if(row.type==="signature_open"){started=true;continue}
    if(!started)continue;
    if(row.type==="signature_chapter"){const item=out.chapters.find(x=>x.id===row.chapter);item.opens++;seen.add(row.chapter)}
    else if(row.type==="signature_choice")lastChoice.set(row.chapter,row.choice);
    else if(row.type==="signature_replay")out.replays++;
    else if(row.type==="signature_brief")brief=true;
    else if(row.type==="signature_extra"&&brief){const item=out.extras.find(x=>x.id===row.extra);if(row.action==="add"){item.adds++;interest.add(row.extra)}else item.removes++}
    else if(row.type==="signature_handoff"&&brief){handed=true;destinations.add(row.destination)}
   }
   if(!started)continue;
   out.starts++;if(brief)out.briefs++;if(handed)out.handoffs++;
   if(destinations.has("advisor"))out.advisor++;if(destinations.has("journey"))out.journey++;
   if(seen.size===SIGNATURE_CHAPTERS.length)out.allChapters++;
   for(const item of out.chapters)if(seen.has(item.id))item.visits++;
   for(const item of out.preferences)if(lastChoice.get(item.chapter)===item.choice)item.visits++;
   for(const item of out.extras)if(interest.has(item.id))item.interestedVisits++;
  }
  return out;
 }

 // One landing cohort per page visit. A handoff is a click, never a confirmed appointment.
 export function summarizeSocial(rows){
 const groups=new Map(),visits=new Map();
 for(const raw of rows){const row=clean(raw);if(!row||!socialTypes.has(row.type))continue;
 if(!visits.has(row.visit))visits.set(row.visit,[]);visits.get(row.visit).push(row)}
 for(const events of visits.values()){
  let entry=null,topic=null;const selected=new Set(),handoffs=new Set();
  for(const row of [...events].sort((a,b)=>a.ts-b.ts)){
   if(row.type==="social_landing"&&!entry){entry=row;topic=row.topic;continue}
   if(!entry||row.source!==entry.source)continue;
   if(row.type==="social_select"){topic=row.topic;selected.add(topic)}
   if(row.type==="social_handoff"&&row.topic===topic)handoffs.add(row.destination);
  }
  if(!entry)continue;
  const key=entry.source+":"+entry.topic;
  if(!groups.has(key))groups.set(key,{source:entry.source,topic:entry.topic,visits:0,engaged:0,handoffs:0,site:0,whatsapp:0});
  const g=groups.get(key);g.visits++;if(selected.size)g.engaged++;if(handoffs.size)g.handoffs++;
  if(handoffs.has("site"))g.site++;if(handoffs.has("whatsapp"))g.whatsapp++;
 }
 return [...groups.values()];
 }
