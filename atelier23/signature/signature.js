// Editorial craft layer. No product recommendation, pricing, booking, tracking or network calls.
const chapters=[
 {id:"concept",name:"Замысел",title:"Сначала — характер.",copy:"Важен не только костюм, но и то, как вы хотите чувствовать себя в нём. На консультации мастер уточняет назначение изделия, привычки и пожелания.",question:"Что хочется обсудить?",options:["Комфорт в движении","Выразительные детали","Универсальность"]},
 {id:"fabric",name:"Ткань",title:"Материал задаёт тон.",copy:"Плотность, фактура и драпировка влияют на ощущения и внешний вид. Образцы лучше оценивать при разном освещении и на ощупь.",question:"Какая фактура интересна?",options:["Гладкая","Выраженная фактура","Пока не знаю"]},
 {id:"measure",name:"Мерки",title:"Точность начинается с сантиметра.",copy:"Мастер оценивает пропорции, осанку и свободу движения. Самостоятельно вводить размеры не нужно: корректные мерки снимают на консультации.",question:"Что особенно важно в посадке?",options:["Свобода плеч","Удобство в движении","Обсудить с мастером"]},
 {id:"pattern",name:"Выкройка",title:"Линии становятся формой.",copy:"Мерки и особенности посадки превращаются в рабочую конструкцию. Выкройка связывает пропорции изделия, припуски и детали; конкретный метод зависит от производства."},
 {id:"making",name:"Производство",title:"Ремесло в каждом стежке.",copy:"Раскрой, соединение деталей, обработка и контроль качества превращают материал в изделие. Состав операций и место производства уточняет ателье.",question:"Какие детали показать мастеру?",options:["Лацканы и карманы","Подкладка и отделка","Минималистичные детали"]},
 {id:"fitting",name:"Примерка",title:"Последний штрих — ваш.",copy:"На примерке оценивают баланс, длину, удобство и внешний вид в движении. Возможные корректировки, стоимость и сроки согласовывают с ателье."}
];
const drawings=[
 '<rect x="80" y="35" width="200" height="200" rx="3" fill="#d8cdb7"/><path d="M105 72H250M105 90H226M105 108H245" stroke="#877a62"/><path d="M145 151l24-25 17 20 18-20 25 25-9 24-10-8 1 48h-50l1-48-10 8z" fill="#24382e" stroke="#ad9468" stroke-width="2"/><path d="M186 146v68" stroke="#c8ae7e" stroke-dasharray="3 4"/><circle cx="262" cy="198" r="14" fill="none" stroke="#a88d55" stroke-width="3"/>',
 '<path d="M50 63l201-18 58 117-204 20z" fill="url(#weave)" stroke="#d4bd95" stroke-width="2"/><path d="M64 88l202-18 44 105-206 29z" fill="#8d7761" stroke="#c6b090"/><path d="M76 118l196-14 38 102-205 14z" fill="url(#weave)" stroke="#d4bd95" stroke-width="2"/><path d="M104 220l202-13" stroke="#d4bd95" stroke-dasharray="2 5"/>',
 '<path d="M143 44q37 17 74 0l45 33-21 51-17-12 3 114h-94l3-114-17 12-21-51z" fill="#33483f" stroke="#d3c6a8" stroke-width="2"/><path d="M180 62v168M139 97h82M133 171h94" stroke="#d3c6a8" stroke-dasharray="4 5"/><path d="M87 126Q180 95 274 126T265 187Q248 205 270 234" fill="none" stroke="#e7bc54" stroke-width="16"/><path d="M87 126Q180 95 274 126T265 187Q248 205 270 234" fill="none" stroke="#594521" stroke-width="5" stroke-dasharray="1 9"/>',
 '<rect x="30" y="22" width="300" height="230" rx="2" fill="#284a64"/><rect x="30" y="22" width="300" height="230" fill="url(#grid)"/><path d="M66 218l10-143 37-29 28 12 18 49-17 111zM190 218l-8-112 25-62 50 31 27 143z" fill="none" stroke="#eee3c7" stroke-width="2"/><path d="M85 79l-9 130m54-151 17 151m48-98 75 95M65 232h94m23 0h103" stroke="#b8d0d8" stroke-dasharray="4 5"/><path d="M65 227v10m94-10v10m23-10v10m103-10v10" stroke="#eee3c7"/><text x="44" y="41" fill="#eee3c7" font-size="10">СХЕМА / 04</text>',
 '<path d="M52 175q86-58 249-42v73H52z" fill="url(#weave)" stroke="#d3b997"/><path d="M57 177q97-39 240-39" stroke="#e2c69a" fill="none" stroke-width="2" stroke-dasharray="6 4"/><rect x="228" y="42" width="46" height="70" rx="8" fill="#d9c39c"/><path d="M228 53h46m-46 7h46m-46 7h46m-46 7h46m-46 7h46m-46 7h46m-46 7h46" stroke="#67533a" stroke-width="2"/><path d="M250 112q-34 43-86 12t-50 43" fill="none" stroke="#e2c69a" stroke-width="2"/><path d="M113 167l34-43" stroke="#eeeece" stroke-width="3"/><ellipse cx="147" cy="123" rx="4" ry="2" fill="none" stroke="#eeeece"/>',
 '<rect x="83" y="22" width="194" height="236" rx="90" fill="#43564b" stroke="#c9b18a" stroke-width="3"/><path d="M151 62l-45 32 19 47 18-12-4 99h82l-4-99 18 12 19-47-45-32-29 15z" fill="#192c24" stroke="#cbb997" stroke-width="2"/><path d="M151 62l29 91 29-91m-29 91v75m-34-46h20m28 0h20" fill="none" stroke="#9d967e" stroke-width="2"/><circle cx="180" cy="173" r="3" fill="#cbb997"/><circle cx="180" cy="190" r="3" fill="#cbb997"/>'
];
const $=id=>document.getElementById(id);
const blank=()=>({step:0,choices:{},complete:false});
const key="bitos.atelier23.signature.v1";
function restore(){
 const s=blank();
 try{
  const v=JSON.parse(sessionStorage.getItem(key)||"null");
  if(!v||typeof v!=="object")return s;
  if(Number.isInteger(v.step)&&v.step>=0&&v.step<chapters.length)s.step=v.step;
  for(const c of chapters){if(c.options?.includes(v.choices?.[c.id]))s.choices[c.id]=v.choices[c.id]}
  s.complete=v.complete===true&&s.step===chapters.length-1;
 }catch{}
 return s;
}
let state=restore();
function save(){try{sessionStorage.setItem(key,JSON.stringify(state))}catch{}}
function diagram(i){return '<svg aria-hidden="true" viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#3b4c43"/><path d="M0 0L6 6M-3 3L3 9M3 -3L9 3" stroke="#718073" stroke-width=".7"/></pattern><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" stroke="#6b8b9c" stroke-width=".5" fill="none"/></pattern></defs>'+drawings[i]+'</svg>'}
function summary(){
 return chapters.filter(c=>c.options).map(c=>[c.question,state.choices[c.id]||"Обсудить на встрече"]);
}
function render(focus=false){
 const c=chapters[state.step];
 $("chapters").querySelectorAll("button").forEach((b,i)=>{if(i===state.step)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current")});
 $("progress").textContent="Глава "+(state.step+1)+" из "+chapters.length;
 $("chapter-label").textContent=String(state.step+1).padStart(2,"0")+" / "+c.name;
 $("chapter-title").textContent=c.title;$("chapter-copy").textContent=c.copy;
 $("illustration").innerHTML=diagram(state.step);
 $("choice").hidden=!c.options;$("choice-label").textContent=c.question||"";
 $("options").replaceChildren();
 for(const [i,o] of (c.options||[]).entries()){
  const label=document.createElement("label"),input=document.createElement("input");
  input.type="radio";input.name="preference";input.value=o;input.id=c.id+"-"+i;input.checked=state.choices[c.id]===o;
  input.addEventListener("change",()=>{state.choices[c.id]=o;save()});
  label.append(input,document.createTextNode(o));$("options").append(label);
 }
 $("prev").disabled=state.step===0;
 $("next").textContent=state.step===chapters.length-1?"Собрать заметки":"Далее";
 $("brief").hidden=!state.complete;
 $("copy-status").textContent="";$("copy-fallback").hidden=true;
 $("brief-items").replaceChildren();
 if(state.complete){for(const [q,a] of summary()){const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=q;dd.textContent=a;$("brief-items").append(dt,dd)}}
 save();if(focus)$("chapter-title").focus();
}
function go(i){if(!Number.isInteger(i)||i<0||i>=chapters.length)return;state.step=i;state.complete=false;render(true)}
chapters.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.textContent=(i+1)+". "+c.name;b.addEventListener("click",()=>go(i));$("chapters").append(b)});
$("prev").addEventListener("click",()=>go(state.step-1));
$("next").addEventListener("click",()=>{if(state.step<chapters.length-1)go(state.step+1);else{state.complete=true;render();$("brief-title").focus()}});
$("reset").addEventListener("click",()=>{state=blank();render(true)});
$("copy-brief").addEventListener("click",async()=>{
 const value=["ATELIER 23 — заметки для консультации",...summary().map(([q,a])=>q+" "+a),"Не заказ и не мерки."].join("\n");
 try{await navigator.clipboard.writeText(value);$("copy-status").textContent="Заметки скопированы."}
 catch{$("copy-fallback").value=value;$("copy-fallback").hidden=false;$("copy-fallback").focus();$("copy-fallback").select();$("copy-status").textContent="Скопируйте текст вручную."}
});
render();
