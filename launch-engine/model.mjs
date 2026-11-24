// Independent launch planning primitives. PLF-inspired, not an official Walker product.
export const stages=Object.freeze([
 {id:"research",label:"Pre-Prelaunch",offset:-10,gate:"Потребность подтверждена разговором с покупателями"},
 {id:"plc1",label:"PLC 1 · Opportunity",offset:-7,gate:"Проверены ценность и достоверность материала"},
 {id:"plc2",label:"PLC 2 · Transformation",offset:-4,gate:"Пример результата проверен, права на материалы согласованы"},
 {id:"plc3",label:"PLC 3 · Ownership",offset:-1,gate:"Путь клиента проверен, условия прозрачны"},
 {id:"open",label:"Open Cart / Pilot",offset:0,gate:"Владелец подтвердил предложение, цены, возможности и разрешение на запуск"},
 {id:"close",label:"Review window",offset:5,gate:"Сверены результаты и реальные обязательства перед покупателями"},
 {id:"post",label:"Post-launch",offset:6,gate:"Сверены расходы, возвраты и заказы; записаны выводы"}
]);
export const metrics=Object.freeze(["visits","leads","orders","revenue","variableCost","campaignCost"]);
export const validDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
export function calendar(open){
 if(!validDate(open))return stages.map(s=>({...s,date:null}));
 return stages.map(s=>({...s,date:new Date(Date.parse(open)+s.offset*86400000).toISOString().slice(0,10)}));
}
export function ready(raw){
 const valid=Array.isArray(raw)?raw:[];const prefix=[];
 for(const stage of stages){if(!valid.includes(stage.id))break;prefix.push(stage.id)}
 return prefix;
}
export function toggleReady(raw,id,checked){
 const prefix=ready(raw),i=stages.findIndex(s=>s.id===id);
 if(i<0)return prefix;
 if(!checked)return prefix.slice(0,i);
 return i===prefix.length?[...prefix,id]:prefix;
}
const parse=(x,integer)=>{if(x===null||x===undefined||x==="")return null;if(typeof x!=="number"&&typeof x!=="string")return null;if(typeof x==="string"&&!/^\d+(?:\.\d{1,2})?$/.test(x))return null;const n=Number(x);return Number.isFinite(n)&&n>=0&&n<=1e12&&(!integer||Number.isSafeInteger(n))?n:null};
export function economics(raw={}){
 raw=raw||{};const v=Object.fromEntries(metrics.map((k,i)=>[k,parse(raw[k],i<3)]));
 const errors=metrics.filter(k=>raw[k]!==undefined&&raw[k]!==null&&raw[k]!==""&&v[k]===null);
 if(v.visits!==null&&v.leads!==null&&v.leads>v.visits)errors.push("leads>visits");
 if(v.orders!==null&&v.leads!==null&&v.orders>v.leads)errors.push("orders>leads");
 if(v.orders!==null&&v.visits!==null&&v.orders>v.visits)errors.push("orders>visits");
 const ratio=(a,b)=>a!==null&&b!==null&&b>0?a/b:null;
 const round=n=>Math.round(n*100)/100;
 if(errors.length)return {values:v,errors,leadRate:null,orderRate:null,costPerOrder:null,contribution:null,roi:null};
 const contribution=[v.revenue,v.variableCost,v.campaignCost].every(n=>n!==null)?round(v.revenue-v.variableCost-v.campaignCost):null;
 const orderRate=ratio(v.orders,v.visits),leadRate=ratio(v.leads,v.visits);
 return {values:v,errors,leadRate,orderRate,costPerOrder:ratio(v.campaignCost,v.orders),contribution,roi:ratio(contribution,v.campaignCost)};
}
export function newPlan(){return {open:"",done:[],numbers:{}}}
export function normalizePlan(raw){
 raw=raw&&typeof raw==="object"?raw:{};return {open:validDate(raw.open)?raw.open:"",done:ready(raw.done),numbers:economics(raw.numbers).values};
}
export function readPlan(storage,key){try{return normalizePlan(JSON.parse(storage.getItem(key)||"null"))}catch{return newPlan()}}
export function storePlan(storage,key,raw){try{storage.setItem(key,JSON.stringify(normalizePlan(raw)));return true}catch{return false}}
