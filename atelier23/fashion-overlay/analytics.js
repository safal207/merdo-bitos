// Local prototype analytics. No network, identity, contact data or sales claims.
export const KEY="bitos.atelier23.fashionAnalytics.v1";
export const LIMIT=2000;
export const SCENES=[
 ["emotion","0–2,8","Ваш момент"],["business","2,8–5,8","Деловой образ"],
 ["occasion","5,8–8,8","Особый момент"],["craft","8,8–11,8","Пошив"],
 ["detail","11,8–15","Детали"],["fitting","15–17,64","Примерка"]
];
const types=new Set(["film_view","look_view","scene_view","reaction","share_click","share_resolved","share_cancelled","link_copied","cta_click","occasion_selected","look_selected","booking_click","tailoring_click"]);
const targets=new Set(["film","navy","grey","black","ivory","travel-navy","travel-black"]);
const cues=new Set(SCENES.map(s=>s[0]));
const occasions=new Set(["business","wedding","evening","travel","wardrobe"]);
const intents=new Set(["event","business","tailoring","booking","like_on","like_repeat","like_off","save_on","save_off"]);
const pages=new Set(["film","event","look","result","summary","saved","plan"]);
const validId=x=>typeof x==="string"&&/^[a-zA-Z0-9-]{1,80}$/.test(x);
function clean(row){
 if(!row||!types.has(row.type)||!validId(row.visit)||!Number.isFinite(row.ts)||row.ts<0)return null;
 const a={type:row.type,visit:row.visit,ts:row.ts};
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
 const count=(type,predicate=()=>true)=>rows.filter(r=>r.type===type&&predicate(r)).length;
 return {visits:new Set(rows.map(r=>r.visit)).size,filmViews:count("film_view"),lookViews:count("look_view"),likes:count("reaction",r=>r.intent==="like_on"||r.intent==="like_repeat"),unlikes:count("reaction",r=>r.intent==="like_off"),saves:count("reaction",r=>r.intent==="save_on"),unsaves:count("reaction",r=>r.intent==="save_off"),shares:count("share_click"),copied:count("link_copied"),shareResolved:count("share_resolved"),occasions:count("occasion_selected"),looks:count("look_selected"),booking:count("booking_click"),tailoring:count("tailoring_click"),scenes:SCENES.map(([id,range,label])=>({id,range,label,views:count("scene_view",r=>r.cue===id),clicks:count("cta_click",r=>r.cue===id)}))};
}
