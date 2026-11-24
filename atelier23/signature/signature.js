import React, {useState,useLayoutEffect,useRef} from "react";
import {createRoot} from "react-dom/client";
const h=React.createElement;
// Editorial craft layer; no product recommendation, booking, payment or analytics.
const chapters=[
 {id:"concept",name:"Замысел",title:"Сначала — характер.",copy:"Важен не только костюм, но и то, как вы хотите чувствовать себя в нём. На консультации мастер уточняет назначение изделия, привычки и пожелания.",question:"Что хочется обсудить?",options:["Комфорт в движении","Выразительные детали","Универсальность"]},
 {id:"fabric",name:"Ткань",title:"Материал задаёт тон.",copy:"Плотность, фактура и драпировка влияют на ощущения и внешний вид. Образцы лучше оценивать при разном освещении и на ощупь.",question:"Какая фактура интересна?",options:["Гладкая","Выраженная фактура","Пока не знаю"]},
 {id:"measure",name:"Мерки",title:"Точность начинается с сантиметра.",copy:"Мастер оценивает пропорции, осанку и свободу движения. Самостоятельно вводить размеры не нужно: корректные мерки снимают на консультации.",question:"Что особенно важно в посадке?",options:["Свобода плеч","Удобство в движении","Обсудить с мастером"]},
 {id:"pattern",name:"Выкройка",title:"Линии становятся формой.",copy:"Мерки и особенности посадки превращаются в рабочую конструкцию. Выкройка связывает пропорции изделия, припуски и детали; конкретный метод зависит от производства."},
 {id:"making",name:"Производство",title:"Ремесло в каждом стежке.",copy:"Раскрой, соединение деталей, обработка и контроль качества превращают материал в изделие. Состав операций и место производства уточняет ателье.",question:"Какие детали показать мастеру?",options:["Лацканы и карманы","Подкладка и отделка","Минималистичные детали"]},
 {id:"fitting",name:"Примерка",title:"Последний штрих — ваш.",copy:"На примерке оценивают баланс, длину, удобство и внешний вид в движении. Возможные корректировки, стоимость и сроки согласовывают с ателье."}
];
const drawings=[
[h("rect",{"x":"80","y":"35","width":"200","height":"200","rx":"3","fill":"#d8cdb7","key":0}),
  h("path",{"d":"M105 72H250M105 90H226M105 108H245","stroke":"#877a62","key":1}),
  h("path",{"d":"M145 151l24-25 17 20 18-20 25 25-9 24-10-8 1 48h-50l1-48-10 8z","fill":"#24382e","stroke":"#ad9468","strokeWidth":"2","key":2}),
  h("path",{"d":"M186 146v68","stroke":"#c8ae7e","strokeDasharray":"3 4","key":3}),
  h("circle",{"cx":"262","cy":"198","r":"14","fill":"none","stroke":"#a88d55","strokeWidth":"3","key":4})],
[h("path",{"d":"M50 63l201-18 58 117-204 20z","fill":"url(#weave)","stroke":"#d4bd95","strokeWidth":"2","key":0}),
  h("path",{"d":"M64 88l202-18 44 105-206 29z","fill":"#8d7761","stroke":"#c6b090","key":1}),
  h("path",{"d":"M76 118l196-14 38 102-205 14z","fill":"url(#weave)","stroke":"#d4bd95","strokeWidth":"2","key":2}),
  h("path",{"d":"M104 220l202-13","stroke":"#d4bd95","strokeDasharray":"2 5","key":3})],
[h("path",{"d":"M143 44q37 17 74 0l45 33-21 51-17-12 3 114h-94l3-114-17 12-21-51z","fill":"#33483f","stroke":"#d3c6a8","strokeWidth":"2","key":0}),
  h("path",{"d":"M180 62v168M139 97h82M133 171h94","stroke":"#d3c6a8","strokeDasharray":"4 5","key":1}),
  h("path",{"d":"M87 126Q180 95 274 126T265 187Q248 205 270 234","fill":"none","stroke":"#e7bc54","strokeWidth":"16","key":2}),
  h("path",{"d":"M87 126Q180 95 274 126T265 187Q248 205 270 234","fill":"none","stroke":"#594521","strokeWidth":"5","strokeDasharray":"1 9","key":3})],
[h("rect",{"x":"30","y":"22","width":"300","height":"230","rx":"2","fill":"#284a64","key":0}),
  h("rect",{"x":"30","y":"22","width":"300","height":"230","fill":"url(#grid)","key":1}),
  h("path",{"d":"M66 218l10-143 37-29 28 12 18 49-17 111zM190 218l-8-112 25-62 50 31 27 143z","fill":"none","stroke":"#eee3c7","strokeWidth":"2","key":2}),
  h("path",{"d":"M85 79l-9 130m54-151 17 151m48-98 75 95M65 232h94m23 0h103","stroke":"#b8d0d8","strokeDasharray":"4 5","key":3}),
  h("path",{"d":"M65 227v10m94-10v10m23-10v10m103-10v10","stroke":"#eee3c7","key":4}),
  h("text",{"x":"44","y":"41","fill":"#eee3c7","fontSize":"10","key":5},"СХЕМА / 04")],
[h("path",{"d":"M52 175q86-58 249-42v73H52z","fill":"url(#weave)","stroke":"#d3b997","key":0}),
  h("path",{"d":"M57 177q97-39 240-39","stroke":"#e2c69a","fill":"none","strokeWidth":"2","strokeDasharray":"6 4","key":1}),
  h("rect",{"x":"228","y":"42","width":"46","height":"70","rx":"8","fill":"#d9c39c","key":2}),
  h("path",{"d":"M228 53h46m-46 7h46m-46 7h46m-46 7h46m-46 7h46m-46 7h46m-46 7h46","stroke":"#67533a","strokeWidth":"2","key":3}),
  h("path",{"d":"M250 112q-34 43-86 12t-50 43","fill":"none","stroke":"#e2c69a","strokeWidth":"2","key":4}),
  h("path",{"d":"M113 167l34-43","stroke":"#eeeece","strokeWidth":"3","key":5}),
  h("ellipse",{"cx":"147","cy":"123","rx":"4","ry":"2","fill":"none","stroke":"#eeeece","key":6})],
[h("rect",{"x":"83","y":"22","width":"194","height":"236","rx":"90","fill":"#43564b","stroke":"#c9b18a","strokeWidth":"3","key":0}),
  h("path",{"d":"M151 62l-45 32 19 47 18-12-4 99h82l-4-99 18 12 19-47-45-32-29 15z","fill":"#192c24","stroke":"#cbb997","strokeWidth":"2","key":1}),
  h("path",{"d":"M151 62l29 91 29-91m-29 91v75m-34-46h20m28 0h20","fill":"none","stroke":"#9d967e","strokeWidth":"2","key":2}),
  h("circle",{"cx":"180","cy":"173","r":"3","fill":"#cbb997","key":3}),
  h("circle",{"cx":"180","cy":"190","r":"3","fill":"#cbb997","key":4})]
];

const KEY="bitos.atelier23.signature.v1";
const blank=()=>({step:0,choices:{},complete:false});
function restore(){
 const s=blank();
 try{
  const v=JSON.parse(sessionStorage.getItem(KEY)||"null");
  if(!v||typeof v!=="object")return s;
  if(Number.isInteger(v.step)&&v.step>=0&&v.step<chapters.length)s.step=v.step;
  for(const c of chapters)if(c.options?.includes(v.choices?.[c.id]))s.choices[c.id]=v.choices[c.id];
  s.complete=v.complete===true&&s.step===chapters.length-1;
 }catch{}
 return s;
}
function Diagram({step}){
 return h("svg",{"aria-hidden":true,viewBox:"0 0 360 280",xmlns:"http://www.w3.org/2000/svg"},
 h("defs",null,
 h("pattern",{id:"weave",width:6,height:6,patternUnits:"userSpaceOnUse"},
 h("rect",{width:6,height:6,fill:"#3b4c43"}),h("path",{d:"M0 0L6 6M-3 3L3 9M3 -3L9 3",stroke:"#718073",strokeWidth:.7})),
 h("pattern",{id:"grid",width:16,height:16,patternUnits:"userSpaceOnUse"},h("path",{d:"M16 0H0V16",stroke:"#6b8b9c",strokeWidth:.5,fill:"none"}))),
 drawings[step]);
}
function ChapterNav({step,onNavigate}){
 return h("nav",{className:"rail",id:"chapters","aria-label":"Главы индивидуального пошива"},
 chapters.map((c,i)=>h("button",{key:c.id,type:"button","aria-current":i===step?"step":undefined,onClick:()=>onNavigate(i)},(i+1)+". "+c.name)));
}
function Chapter({state,onChoose,onNavigate,onNext,headingRef}){
 const c=chapters[state.step];
 return h("section",{className:"spread","aria-labelledby":"chapter-title"},
 h("figure",{className:"plate"},h("div",{id:"illustration"},h(Diagram,{step:state.step})),h("figcaption",null,"Авторская условная схема процесса, не технический чертёж и не документальная съёмка ATELIER 23.")),
 h("div",{className:"copy"},
 h("span",{className:"eyebrow",id:"chapter-label"},String(state.step+1).padStart(2,"0")+" / "+c.name),
 h("h2",{id:"chapter-title",tabIndex:-1,ref:headingRef},c.title),
 h("p",{id:"chapter-copy"},c.copy),
 h("fieldset",{id:"choice",hidden:!c.options},h("legend",{id:"choice-label"},c.question||""),
 h("div",{id:"options"},(c.options||[]).map((o,i)=>h("label",{key:c.id+"-"+i},h("input",{type:"radio",name:"preference",id:c.id+"-"+i,value:o,checked:state.choices[c.id]===o,onChange:()=>onChoose(c.id,o)}),o)))),
 h("div",{className:"controls"},
 h("button",{type:"button",className:"btn btn-ghost",id:"prev",disabled:state.step===0,onClick:()=>onNavigate(state.step-1)},"Назад"),
 h("button",{type:"button",className:"btn btn-primary",id:"next",onClick:onNext},state.step===chapters.length-1?"Собрать заметки":"Далее"))));
}
function Brief({state,headingRef,onReset,copy,onCopy,fallbackRef}){
 const summary=chapters.filter(c=>c.options).map(c=>[c.question,state.choices[c.id]||"Обсудить на встрече"]);
 return h("section",{className:"brief",id:"brief","aria-labelledby":"brief-title",hidden:!state.complete},
 h("span",{className:"eyebrow"},"Ваши заметки"),h("h2",{id:"brief-title",tabIndex:-1,ref:headingRef},"Разговор с мастером"),
 h("p",null,"Это предварительные предпочтения, а не мерки, заказ или подтверждение стоимости."),
 h("dl",{id:"brief-items"},state.complete?summary.map(([q,a])=>h(React.Fragment,{key:q},h("dt",null,q),h("dd",null,a))):null),
 h("button",{className:"btn btn-ghost",type:"button",id:"copy-brief",onClick:()=>onCopy(summary)},"Скопировать заметки"),
 h("textarea",{id:"copy-fallback","aria-label":"Заметки для ручного копирования",readOnly:true,hidden:!copy.fallback,value:copy.fallback,ref:fallbackRef}),
 h("p",{id:"copy-status",role:"status"},copy.status),
 h("div",{className:"actions"},h("a",{className:"btn btn-primary",id:"advisor",href:"../#journey"},"Перейти к подбору образа"),h("a",{className:"btn btn-ghost",id:"journey",href:"../fashion-journey/"},"Исследовать образы")),
 h("p",{className:"notice"},"Подбор события, бюджета, сроков и запись на примерку уже находятся в существующем сервисе. Заметки можно скопировать вручную; они не передаются автоматически. Дополнительные изделия и стоимость обсуждаются с мастером, без платежей в этой демонстрации."),
 h("button",{className:"btn btn-ghost",type:"button",id:"reset",onClick:onReset},"Начать заново"));
}
const emptyCopy=()=>({status:"",fallback:""});
function SignatureExperience(){
 const [state,setState]=useState(restore);
 const [copy,setCopy]=useState(emptyCopy);
 const chapterRef=useRef(null),briefRef=useRef(null),fallbackRef=useRef(null),focus=useRef(null),generation=useRef(0);
 useLayoutEffect(()=>{
  try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{}
  if(focus.current){const target=focus.current==="brief"?briefRef:chapterRef;focus.current=null;target.current?.focus()}
 },[state]);
 useLayoutEffect(()=>{if(copy.fallback){fallbackRef.current?.focus();fallbackRef.current?.select()}},[copy]);
 function clearCopy(){generation.current++;setCopy(emptyCopy())}
 function navigate(i){
  if(!Number.isInteger(i)||i<0||i>=chapters.length)return;
  clearCopy();focus.current="chapter";setState(s=>({...s,step:i,complete:false}));
 }
 function choose(id,value){if(!chapters.find(c=>c.id===id)?.options?.includes(value))return;clearCopy();setState(s=>({...s,choices:{...s.choices,[id]:value}}))}
 function next(){if(state.step<chapters.length-1)navigate(state.step+1);else{clearCopy();focus.current="brief";setState(s=>({...s,complete:true}))}}
 function reset(){clearCopy();focus.current="chapter";setState(blank())}
 async function copyNotes(summary){
  const ticket=++generation.current;
  const value=["ATELIER 23 — заметки для консультации",...summary.map(([q,a])=>q+" "+a),"Не заказ и не мерки."].join("\n");
  try{await navigator.clipboard.writeText(value);if(ticket===generation.current)setCopy({status:"Заметки скопированы.",fallback:""})}
  catch{if(ticket===generation.current)setCopy({status:"Скопируйте текст вручную.",fallback:value})}
 }
 return h("main",{className:"sig","data-renderer":"react"},
 h("header",null,h("a",{className:"wordmark",href:"../"},"ATELIER ",h("b",null,"23"),h("small",null,"× BITOS")),h("span",{className:"edition"},"SIGNATURE",h("br"),"EXPERIENCE / 01")),
 h("div",{className:"introcopy"},h("span",{className:"eyebrow"},"Искусство индивидуального пошива"),h("h1",null,"Костюм начинается",h("br"),"с ",h("em",null,"вас.")),h("p",null,"Шесть глав — от замысла и ткани до финальной примерки. Соберите заметки для разговора с мастером, прежде чем выбирать образ.")),
 h(ChapterNav,{step:state.step,onNavigate:navigate}),h("p",{id:"progress",role:"status","aria-live":"polite"},"Глава "+(state.step+1)+" из "+chapters.length),
 h(Chapter,{state,onChoose:choose,onNavigate:navigate,onNext:next,headingRef:chapterRef}),
 h(Brief,{state,headingRef:briefRef,onReset:reset,copy,onCopy:copyNotes,fallbackRef}),
 h("footer",null,h("p",null,"Независимый демонстрационный концепт BitOS. Никаких реальных заказов, платежей, записей, сбора контактов или передачи мерок. Процесс схематичен; детали производства и сроки уточняет ателье.")));
}
createRoot(document.getElementById("root")).render(h(SignatureExperience));
