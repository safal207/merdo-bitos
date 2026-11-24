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
// Original editorial vectors, not actual manufacturing photos or usable patterns.
const art=[
 {en:"THE PRIVATE CONSULTATION",title:"Ателье начинается с разговора",note:"Силуэт • характер • назначение",detail:"Эскиз будущего изделия"},
 {en:"THE CLOTH LIBRARY",title:"Фактура ткани и направление переплетения",note:"Фактура • драпировка • плотность",detail:"Условные образцы, не каталог тканей"},
 {en:"THE MEASUREMENT",title:"Жёлтая сантиметровая лента и контур посадки",note:"Плечи • баланс • свобода",detail:"Мерки снимает мастер"},
 {en:"THE BLUEPRINT",title:"Голубая схема деталей выкройки",note:"Контур • долевая • припуск",detail:"Не в масштабе, без реальных мерок"},
 {en:"THE HANDWORK",title:"Макродеталь ткани, нити и стежков",note:"Раскрой • соединение • отделка",detail:"Схематичная визуализация ремесла"},
 {en:"THE FINAL FIT",title:"Силуэт готового костюма на примерке",note:"Баланс • длина • движение",detail:"Корректировки согласует мастер"}
];
const path=(d,props={})=>h("path",{d,...props});
const rect=(x,y,width,height,props={})=>h("rect",{x,y,width,height,...props});
const text=(x,y,value,props={})=>h("text",{x,y,...props},value);
const line=(x1,y1,x2,y2,props={})=>h("line",{x1,y1,x2,y2,...props});
const chalk={stroke:"#e1dac5",strokeWidth:1.1,fill:"none",strokeLinecap:"round",strokeLinejoin:"round"};
const stitch={...chalk,strokeDasharray:"2 5",opacity:.8,className:"stitch"};
const blueprint={stroke:"#e7f2ed",strokeWidth:1.2,fill:"none"};
const diagrams=[
 ()=>h("g",null,
 rect(57,34,244,212,{rx:2,fill:"url(#paper)",transform:"rotate(-6 179 140)",filter:"url(#shadow)"}),
 h("g",{transform:"rotate(-6 179 140)"},
 text(77,59,"ATELIER / 01",{fill:"#625a4c",fontSize:8,letterSpacing:2}),
 line(77,66,274,66,{stroke:"#9f927b",strokeWidth:.6}),
 path("M137 88l23-11 20 13 20-13 23 11 30 22-16 45-16-9 2 75h-86l2-75-16 9-16-45z",{fill:"url(#wool)",stroke:"#82745d",strokeWidth:1.5}),
 path("M160 77l20 66 20-66m-20 66v76m-35-36h24m22 0h24",{...chalk,opacity:.8}),
 path("M137 94l-4 102m90-102 4 102",{...stitch,stroke:"#b09b78"}),
 text(79,235,"SILHOUETTE / STUDY",{fill:"#6e6556",fontSize:8,letterSpacing:1.5})),
 h("g",{transform:"translate(280 183) rotate(24)"},rect(-3,-92,6,109,{rx:2,fill:"#b4a284",filter:"url(#shadow)"}),path("M-3 17L0 27L3 17",{fill:"#d7c5a0"}))),
 ()=>h("g",null,
 ...[{x:45,y:45,a:-9,fill:"url(#wool)"},{x:82,y:67,a:5,fill:"url(#twill)"},{x:113,y:100,a:-4,fill:"url(#herringbone)"}].map((s,i)=>h("g",{key:i,transform:"rotate("+s.a+" "+(s.x+105)+" "+(s.y+65)+")"},
 rect(s.x,s.y,209,129,{rx:2,fill:s.fill,stroke:"#8d8069",strokeWidth:.8,filter:"url(#shadow)"}),
 rect(s.x+1,s.y+1,207,127,{fill:"url(#clothLight)",opacity:.7}),
 path("M"+(s.x+9)+" "+(s.y+116)+"h191",{...stitch,stroke:"#dac4a5"}))),
 h("circle",{cx:288,cy:195,r:38,fill:"url(#herringbone)",stroke:"#d2b58a",strokeWidth:2.5,filter:"url(#shadow)"}),
 h("circle",{cx:288,cy:195,r:32,fill:"none",stroke:"#eee0c5",strokeWidth:.7,strokeDasharray:"2 3"}),
 text(288,199,"× 4",{fill:"#f5e8cf",fontSize:10,textAnchor:"middle"})),
 ()=>h("g",null,
 path("M143 29Q180 49 217 29L264 71 244 124 227 110 231 247H129L133 110 116 124 96 71Z",{fill:"url(#wool)",stroke:"#8d9a8c",strokeWidth:1.3,filter:"url(#shadow)"}),
 path("M143 29L180 151 217 29M180 151V246M141 168H168M193 168H220",chalk),
 path("M116 82Q180 64 244 82M131 208H230M180 45V249",{...stitch,opacity:.65}),
 path("M54 125C111 102 221 98 281 128S302 172 260 189 236 223 287 248",{stroke:"#161e19",strokeWidth:21,fill:"none",strokeLinecap:"round",opacity:.6}),
 path("M54 125C111 102 221 98 281 128S302 172 260 189 236 223 287 248",{stroke:"url(#tape)",strokeWidth:17,fill:"none",strokeLinecap:"round",className:"measuring-tape"}),
 path("M54 125C111 102 221 98 281 128S302 172 260 189 236 223 287 248",{stroke:"#574619",strokeWidth:6,strokeDasharray:"1 8",fill:"none"}),
 ...[["10",93,116,-10],["20",151,108,-2],["30",211,111,7],["40",268,130,25]].map(([n,x,y,a])=>text(x,y,n,{key:n,fill:"#4c3916",fontSize:7,fontWeight:700,transform:"rotate("+a+" "+x+" "+y+")"})),
 h("g",{transform:"translate(45 119) rotate(-13)"},rect(0,0,16,11,{rx:1,fill:"#b0a58b",stroke:"#f2d8a0"}))),
 ()=>h("g",{className:"blueprint-sheet"},
 rect(30,20,300,240,{rx:2,fill:"url(#blue)",filter:"url(#shadow)"}),
 rect(30,20,300,240,{fill:"url(#grid)"}),
 text(42,36,"PATTERN STUDY / 04",{fill:"#e4f4f5",fontSize:8,letterSpacing:1.5}),
 path("M62 226L73 78 114 48 143 63 157 108 141 226ZM186 226L180 109 205 50 250 77 287 226Z",{...blueprint,strokeWidth:1.7}),
 path("M69 220L80 82 114 56 137 68 149 109 134 219ZM193 219L188 111 209 58 244 82 279 219Z",{...blueprint,strokeDasharray:"3 4",opacity:.7,className:"stitch"}),
 path("M92 80L88 207m132-124 36 124M76 237H141M187 237H287",{...blueprint,markerStart:"url(#arrow)",markerEnd:"url(#arrow)"}),
 path("M62 232v10m79-10v10m45-10v10m100-10v10M118 55v167m97-164 20 160",{...blueprint,opacity:.6}),
 text(103,249,"A / ПОЛОЧКА",{fontSize:8,fill:"#edf7f6",textAnchor:"middle"}),
 text(237,249,"B / СПИНКА",{fontSize:8,fill:"#edf7f6",textAnchor:"middle"}),
 text(97,136,"ДОЛЕВАЯ",{fontSize:7,fill:"#edf7f6",transform:"rotate(-90 97 136)"}),
 text(289,45,"NTS",{fontSize:8,fill:"#eaf3ef",textAnchor:"end"})),
 ()=>h("g",null,
 rect(34,43,292,193,{rx:3,fill:"url(#wool)",filter:"url(#shadow)"}),
 path("M34 172Q124 126 326 105V236H34Z",{fill:"url(#twill)",stroke:"#665c49",strokeWidth:1}),
 path("M42 175Q145 131 316 113",{stroke:"#161a16",strokeWidth:4,fill:"none",opacity:.7}),
 path("M42 175Q145 131 316 113",{stroke:"#e5cba2",strokeWidth:2,fill:"none",strokeDasharray:"6 5",className:"stitch"}),
 h("g",{transform:"translate(247 70) rotate(17)",filter:"url(#shadow)"},rect(-23,-28,46,56,{rx:9,fill:"url(#thread)"}),rect(-26,-30,52,7,{rx:2,fill:"#bfa887"}),rect(-26,23,52,7,{rx:2,fill:"#bfa887"})),
 path("M247 97C234 145 160 98 154 151S95 191 72 161",{stroke:"#e4c69c",strokeWidth:1.6,fill:"none",strokeLinecap:"round",className:"thread-line"}),
 path("M72 161L109 104",{stroke:"#e6e4d5",strokeWidth:2,strokeLinecap:"round"}),
 h("ellipse",{cx:109,cy:104,rx:4,ry:1.8,transform:"rotate(-56 109 104)",fill:"none",stroke:"#e6e4d5"}),
 h("circle",{cx:279,cy:192,r:30,fill:"url(#wool)",stroke:"#d1b58a",strokeWidth:1.8}),
 path("M256 204Q279 187 301 180",{stroke:"#e5cba2",strokeWidth:3,strokeDasharray:"8 5",fill:"none"})),
 ()=>h("g",null,
 rect(79,21,202,238,{rx:100,fill:"url(#mirror)",stroke:"#b89d71",strokeWidth:2,filter:"url(#shadow)"}),
 path("M151 56L107 86 123 137 144 122 140 234H220L216 122 237 137 253 86 209 56 180 76Z",{fill:"url(#wool)",stroke:"#a8a391",strokeWidth:1.5}),
 path("M151 56L180 76 209 56 193 128 180 156 166 128Z",{fill:"#e3ddd0",stroke:"#8a8374",strokeWidth:.8}),
 path("M177 77l6 0 5 52-8 15-8-15z",{fill:"#685b46"}),
 path("M151 56L140 91 156 106 148 118 180 156 212 118 204 106 220 91 209 56",{fill:"url(#twill)",stroke:"#777d70",strokeWidth:1}),
 path("M180 156V234M144 176h27m18 0h27M199 116h17",{...chalk,opacity:.75}),
 ...[176,192,207].map(y=>h("circle",{key:y,cx:180,cy:y,r:2.6,fill:"#b69e78",stroke:"#302b22",strokeWidth:.6})),
 path("M151 63L180 156M209 63L180 156",{...stitch,opacity:.5}),
 path("M94 235H266",{stroke:"#c1ac84",strokeWidth:.8,opacity:.7}))
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
 const item=art[step];
 return h("svg",{role:"img","aria-label":item.title,viewBox:"0 0 360 280",xmlns:"http://www.w3.org/2000/svg","data-plate":chapters[step].id},
 h("defs",null,
 h("linearGradient",{id:"paper",x2:"1",y2:"1"},h("stop",{stopColor:"#ede0c5"}),h("stop",{offset:"1",stopColor:"#aa9775"})),
 h("radialGradient",{id:"studio"},h("stop",{stopColor:"#43564b"}),h("stop",{offset:"1",stopColor:"#16251f"})),
 h("linearGradient",{id:"blue",x2:"1",y2:"1"},h("stop",{stopColor:"#3d7598"}),h("stop",{offset:"1",stopColor:"#203d60"})),
 h("linearGradient",{id:"tape"},h("stop",{stopColor:"#f4d669"}),h("stop",{offset:".5",stopColor:"#ecc450"}),h("stop",{offset:"1",stopColor:"#d59b37"})),
 h("linearGradient",{id:"mirror",x2:"1",y2:"1"},h("stop",{stopColor:"#64766b"}),h("stop",{offset:"1",stopColor:"#30463c"})),
 h("linearGradient",{id:"clothLight",x2:"0",y2:"1"},h("stop",{stopColor:"#fff2cb",stopOpacity:".17"}),h("stop",{offset:"1",stopColor:"#000",stopOpacity:".27"})),
 h("pattern",{id:"wool",width:3,height:3,patternUnits:"userSpaceOnUse"},rect(0,0,3,3,{fill:"#283b36"}),path("M0 0H3M0 1.5H3",{stroke:"#677269",strokeWidth:.38,opacity:.7}),path("M1 0V3",{stroke:"#142420",strokeWidth:.45})),
 h("pattern",{id:"twill",width:5,height:5,patternUnits:"userSpaceOnUse"},rect(0,0,5,5,{fill:"#655d51"}),path("M-2 2L2-2M0 5L5 0M3 7L7 3",{stroke:"#a39680",strokeWidth:.65,opacity:.6})),
 h("pattern",{id:"herringbone",width:12,height:8,patternUnits:"userSpaceOnUse"},rect(0,0,12,8,{fill:"#545e52"}),path("M0 0L6 4 12 0M0 4L6 8 12 4",{stroke:"#a8a293",strokeWidth:.7,opacity:.85})),
 h("pattern",{id:"thread",width:4,height:4,patternUnits:"userSpaceOnUse"},rect(0,0,4,4,{fill:"#be9c6b"}),path("M0 1H4M0 3H4",{stroke:"#ead2a4",strokeWidth:.7})),
 h("pattern",{id:"grid",width:10,height:10,patternUnits:"userSpaceOnUse"},path("M10 0H0V10",{stroke:"#b7dae8",strokeWidth:.35,opacity:.45,fill:"none"})),
 h("marker",{id:"arrow",viewBox:"0 0 6 6",refX:3,refY:3,markerWidth:4,markerHeight:4,orient:"auto-start-reverse"},path("M0 0L6 3 0 6",{fill:"none",stroke:"#edf7f6",strokeWidth:1})),
 h("filter",{id:"shadow",x:"-25%",y:"-25%",width:"150%",height:"150%"},h("feDropShadow",{dx:2,dy:5,stdDeviation:5,floodColor:"#0b1410",floodOpacity:.6}))),
 rect(0,0,360,280,{fill:"url(#studio)"}),
 rect(9,9,342,262,{rx:1,fill:"none",stroke:"#a18d69",strokeWidth:.6,opacity:.55}),
 diagrams[step]());
}
function CraftPlate({step,direction,replay}){
 const item=art[step];
 return h("figure",{className:"plate","data-chapter":chapters[step].id},
 h("div",{className:"plate-meta"},h("span",null,item.en),h("span",null,"0"+(step+1)+" / 06")),
 h("div",{id:"illustration",className:"plate-art","data-direction":direction},h("div",{className:"film-frame",key:step+":"+replay},h(Diagram,{step}))),
 h("div",{className:"plate-note"},h("strong",null,item.note),h("span",null,item.detail)),
 h("figcaption",null,"Авторская иллюстрация BitOS. Не фотография производства ATELIER 23 и не рабочий технический чертёж."));
}
function ChapterNav({step,onNavigate}){
 return h("nav",{className:"rail",id:"chapters","aria-label":"Главы индивидуального пошива"},
 chapters.map((c,i)=>h("button",{key:c.id,type:"button","aria-current":i===step?"step":undefined,onClick:()=>onNavigate(i)},(i+1)+". "+c.name)));
}
function Chapter({state,onChoose,onNavigate,onNext,headingRef,direction,replay}){
 const c=chapters[state.step];
 return h("section",{className:"spread","aria-labelledby":"chapter-title"},
 h(CraftPlate,{step:state.step,direction,replay}),
 h("div",{className:"copy","data-direction":direction},
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
const sceneLines=[
 "Каждое изделие начинается с идеи.",
 "Характер костюма рождается в ткани.",
 "Точность — это внимание к человеку.",
 "Линии превращаются в конструкцию.",
 "Каждый стежок имеет значение.",
 "Финальный штрих — ощущение себя."
];
function CinemaControls({step,motion,onMotion,onReplay}){
 return h("div",{className:"cinema-controls"},
 h("p",{className:"scene-line",key:step},sceneLines[step]),
 h("div",{className:"cinema-actions"},
 h("button",{type:"button",id:"motion-toggle","aria-pressed":motion,onClick:onMotion},"Анимация"),
 h("button",{type:"button",id:"replay-scene",onClick:onReplay,disabled:!motion},"Повторить кадр")),
 h("p",{className:"cinema-hint"},"Главы переключаются только вами. Настройка системы «уменьшение движения» имеет приоритет."));
}
function SignatureExperience(){
 const [state,setState]=useState(restore);
 const [copy,setCopy]=useState(emptyCopy);
 const [motion,setMotion]=useState(true),[direction,setDirection]=useState("forward"),[replay,setReplay]=useState(0);
 const chapterRef=useRef(null),briefRef=useRef(null),fallbackRef=useRef(null),focus=useRef(null),generation=useRef(0);
 useLayoutEffect(()=>{
  try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{}
  if(focus.current){const target=focus.current==="brief"?briefRef:chapterRef;focus.current=null;target.current?.focus()}
 },[state]);
 useLayoutEffect(()=>{if(copy.fallback){fallbackRef.current?.focus();fallbackRef.current?.select()}},[copy]);
 function clearCopy(){generation.current++;setCopy(emptyCopy())}
 function navigate(i){
  if(!Number.isInteger(i)||i<0||i>=chapters.length)return;
  clearCopy();setDirection(i<state.step?"backward":"forward");focus.current="chapter";setState(s=>({...s,step:i,complete:false}));
 }
 function choose(id,value){if(!chapters.find(c=>c.id===id)?.options?.includes(value))return;clearCopy();setState(s=>({...s,choices:{...s.choices,[id]:value}}))}
 function next(){if(state.step<chapters.length-1)navigate(state.step+1);else{clearCopy();focus.current="brief";setState(s=>({...s,complete:true}))}}
 function reset(){clearCopy();setDirection("backward");focus.current="chapter";setState(blank())}
 async function copyNotes(summary){
  const ticket=++generation.current;
  const value=["ATELIER 23 — заметки для консультации",...summary.map(([q,a])=>q+" "+a),"Не заказ и не мерки."].join("\n");
  try{await navigator.clipboard.writeText(value);if(ticket===generation.current)setCopy({status:"Заметки скопированы.",fallback:""})}
  catch{if(ticket===generation.current)setCopy({status:"Скопируйте текст вручную.",fallback:value})}
 }
 return h("main",{className:"sig","data-renderer":"react","data-motion":motion?"on":"off"},
 h("header",null,h("a",{className:"wordmark",href:"../"},"ATELIER ",h("b",null,"23"),h("small",null,"× BITOS")),h("span",{className:"edition"},"SIGNATURE",h("br"),"EXPERIENCE / 01")),
 h("div",{className:"introcopy"},h("span",{className:"eyebrow"},"Искусство индивидуального пошива"),h("h1",null,"Костюм начинается",h("br"),"с ",h("em",null,"вас.")),h("p",null,"Шесть глав — от замысла и ткани до финальной примерки. Соберите заметки для разговора с мастером, прежде чем выбирать образ.")),
 h(ChapterNav,{step:state.step,onNavigate:navigate}),h("div",{className:"progress-line"},h("p",{id:"progress",role:"status","aria-live":"polite"},"Глава "+(state.step+1)+" из "+chapters.length),h("progress",{max:chapters.length,value:state.step+1,"aria-label":"Прогресс знакомства с пошивом"})),
 h(CinemaControls,{step:state.step,motion,onMotion:()=>setMotion(m=>!m),onReplay:()=>setReplay(n=>n+1)}),
 h(Chapter,{state,onChoose:choose,onNavigate:navigate,onNext:next,headingRef:chapterRef,direction,replay}),
 h(Brief,{state,headingRef:briefRef,onReset:reset,copy,onCopy:copyNotes,fallbackRef}),
 h("footer",null,h("p",null,"Независимый демонстрационный концепт BitOS. Никаких реальных заказов, платежей, записей, сбора контактов или передачи мерок. Процесс схематичен; детали производства и сроки уточняет ателье.")));
}
createRoot(document.getElementById("root")).render(h(SignatureExperience));
