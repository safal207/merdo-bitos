const ROOT="https://atelier-23.ru/";
const PHOTO=ROOT+"wp-content/uploads/";
const BOOK=ROOT+"sign-up-for-a-fitting-room/";
const events={business:"Деловая встреча",wedding:"Свадьба",evening:"Торжество",travel:"Путешествие",wardrobe:"Гардероб"};
const products=[
{id:"navy",name:"Уверенная классика",item:"Тёмно-синий костюм VBC",price:145000,desc:"Для переговоров: тёмно-синий костюм, светлая сорочка и лаконичный галстук.",image:"2024/12/Atelier23_24_11_14_0844-600x800.jpg",link:"dark-navy-classic-suit",parts:["suit","shirt","tie","shoes"],events:["business","wedding","wardrobe"]},
{id:"grey",name:"Современный характер",item:"Серый костюм VBC",price:145000,desc:"Мягче строгой классики. С сорочкой — для встреч, с трикотажем — для неформальной среды.",image:"2024/12/Atelier23_24_11_14_0852-1-600x800.jpg",link:"gray-classic-suit",parts:["suit","shirt","shoes"],events:["business","wardrobe","travel"]},
{id:"black",name:"Вечерняя классика",item:"Чёрный шерстяной смокинг",price:165000,desc:"Для вечерней свадьбы, приёма и дресс-кода Black Tie. Белая сорочка, бабочка, подходящая обувь.",image:"2025/08/Atelier23_25_07_30_0537-600x800.jpg",link:"black-tuxedo",parts:["tux","shirt","bow","shoes"],events:["wedding","evening","wardrobe"]},
{id:"ivory",name:"Светлый акцент",item:"Смокинг цвета слоновой кости",price:165000,desc:"Выразительный вариант для летнего вечера или свадьбы на открытом воздухе.",image:"2025/08/Atelier23_26_09_16_-41-600x800.jpg",link:"ivory-shawl-tuxedo",parts:["tux","shirt","bow","shoes"],events:["wedding","evening"]},
{id:"travel-navy",name:"Свободная элегантность",item:"Синие шерстяные брюки VBC",price:null,desc:"Для поездки и неформальной встречи: повседневные брюки, трикотаж и удобная обувь.",image:"2025/10/Atelier_25_10_21_0453-600x800.jpg",link:"italian-casual-pants-5",parts:["trousers","knit","shoes"],events:["travel","wardrobe","business"]},
{id:"travel-black",name:"Лаконичный гардероб",item:"Чёрные шерстяные брюки VBC",price:null,desc:"Универсальная основа для поездок и повседневных сочетаний.",image:"2025/10/Atelier_25_10_21_0251-600x800.jpg",link:"italian-casual-pants-4",parts:["trousers","knit","shoes"],events:["travel","wardrobe"]}
];
const parts={suit:"Костюм",tux:"Смокинг",shirt:"Сорочка",tie:"Галстук",bow:"Бабочка",shoes:"Обувь",trousers:"Брюки",knit:"Трикотаж"};
const product=id=>products.find(p=>p.id===id);
const blank=()=>({date:"",dateSet:false,chosen:"",owned:[],wardrobe:false,summary:false,visited:false});
const KEY="bitos.atelier23.fashionStories.v1";
const today=()=>{let d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const validDate=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d&&d>=today();
function restore(){
 let r={};try{r=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const a={event:Object.hasOwn(events,r.event)?r.event:"",likes:[],saved:[],plans:{},views:{}};
 for(const k of ["likes","saved"])a[k]=Array.isArray(r[k])?[...new Set(r[k].filter(x=>product(x)))]:[];
 for(const id of ["film",...products.map(p=>p.id)]){const v=r.views?.[id];a.views[id]=Number.isSafeInteger(v)&&v>=0?v:0}
 for(const e of Object.keys(events)){
  const t=r.plans?.[e]||{},p=blank();
  p.date=validDate(t.date)?t.date:"";p.dateSet=!!t.dateSet&&(!t.date||!!p.date);
  p.chosen=product(t.chosen)?.events.includes(e)?t.chosen:"";
  p.owned=Array.isArray(t.owned)?[...new Set(t.owned.filter(x=>Object.hasOwn(parts,x)))]:[];
  p.wardrobe=!!t.wardrobe&&!!p.chosen;p.summary=!!t.summary&&p.wardrobe&&p.dateSet;
  p.visited=!!t.visited&&p.summary;a.plans[e]=p;
 }
 return a;
}
let state=restore(),page="film",index=0,returnPage="event";
const $=id=>document.getElementById(id);
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const plan=()=>state.event?state.plans[state.event]:blank();
// Explicit editorial tags; not inferred from sensitive traits or purchase history.
const styleTags={
 navy:["tailored","formal","suit","navy"],
 grey:["tailored","formal","suit","grey"],
 black:["tailored","formal","black-tie","black"],
 ivory:["tailored","formal","black-tie","ivory"],
 "travel-navy":["relaxed","separates","trousers","navy"],
 "travel-black":["relaxed","separates","trousers","black"]
};
function preferenceScore(item){
 const target=styleTags[item.id];
 return products.reduce((total,source)=>{
  const weight=(state.likes.includes(source.id)?1:0)+(state.saved.includes(source.id)?3:0);
  if(!weight)return total;
  const from=styleTags[source.id],shared=target.filter(tag=>from.includes(tag)).length;
  return total+weight*shared/(new Set([...target,...from]).size);
 },0);
}
const rank=items=>items.map((item,i)=>({item,i,score:preferenceScore(item)})).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.item);
let deckEvent="",deck=[],frontier=0;
function rebuildDeck(){
 deckEvent=state.event;deck=rank(products.filter(p=>p.events.includes(state.event)));index=0;frontier=0;
}
// Preserve the whole already-visited prefix, even if the user goes backwards.
// Only the not-yet-shown tail is re-ranked on the next forward gesture.
function list(){
 if(deckEvent!==state.event||!deck.length)rebuildDeck();
 return deck;
}
const completion=()=>{const p=plan();return [!!state.event,p.dateSet,!!p.chosen,p.wardrobe,p.summary,p.visited]};
const fmt=n=>n.toLocaleString("ru-RU")+" ₽";
const icons={heart:'<path d="M20.8 8.6c0 5-8.8 10.7-8.8 10.7S3.2 13.6 3.2 8.6a4.9 4.9 0 0 1 8.8-3 4.9 4.9 0 0 1 8.8 3z"/>',save:'<path d="M6 3h12v18l-6-4-6 4z"/>',share:'<path d="m22 2-7 20-4-9-9-4 20-7zM22 2 11 13"/>'};
const icon=name=>'<svg aria-hidden="true" viewBox="0 0 24 24">'+icons[name]+'</svg>';
const price=p=>p.price?fmt(p.price):"Уточнить цену";
const url=p=>ROOT+"shop/"+p.link+"/";

const screen=$("screen");
let viewCleanup=()=>{};
const viewText=id=>String(state.views[id]||0)+" просм. · на устройстве";
const viewLabel=id=>'<span class="tiny" data-view-count="'+id+'" aria-label="Просмотры на этом устройстве: '+(state.views[id]||0)+'">'+viewText(id)+'</span>';
function recordView(id){
 state.views[id]=Math.min(Number.MAX_SAFE_INTEGER,(state.views[id]||0)+1);persist();
 const el=screen.querySelector('[data-view-count="'+id+'"]');
 if(el){el.textContent=viewText(id);el.setAttribute("aria-label","Просмотры на этом устройстве: "+state.views[id])}
}
function watchPhoto(photo,id){
 const img=photo.querySelector("img");let timer=null,visible=false,counted=false,observer=null;
 const stop=()=>{if(timer!==null)clearTimeout(timer);timer=null};
 const check=()=>{stop();if(!counted&&visible&&!document.hidden&&img.complete&&img.naturalWidth>0)timer=setTimeout(()=>{if(!counted&&visible&&!document.hidden&&photo.isConnected&&img.naturalWidth>0){counted=true;recordView(id)}},1000)};
 if("IntersectionObserver" in window){observer=new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>=.5;check()},{threshold:.5});observer.observe(photo)}
 else{visible=true;check()}
 img.addEventListener("load",check);document.addEventListener("visibilitychange",check);
 viewCleanup=()=>{stop();observer?.disconnect();img.removeEventListener("load",check);document.removeEventListener("visibilitychange",check)};
}
function watchFilm(v){
 let counted=false,seconds=0,last=null;
 const tick=()=>{const now=v.currentTime;if(v.paused||v.seeking||document.hidden){last=null;return}if(last!==null&&now>=last&&now-last<=1.5)seconds+=now-last;last=now;if(!counted&&seconds>=3){counted=true;recordView("film")}};
 const reset=()=>{last=null};
 v.addEventListener("timeupdate",tick);v.addEventListener("seeking",reset);v.addEventListener("pause",reset);document.addEventListener("visibilitychange",reset);
 viewCleanup=()=>{v.removeEventListener("timeupdate",tick);v.removeEventListener("seeking",reset);v.removeEventListener("pause",reset);document.removeEventListener("visibilitychange",reset)};
}
const primary=(label,action,disabled=false)=>'<button type="button" class="primary" data-action="'+action+'" '+(disabled?"disabled":"")+'>'+label+'</button>';
const secondary=(label,action)=>'<button type="button" class="secondary" data-action="'+action+'">'+label+'</button>';
const heading=(num,title,text="")=>'<div class="copy"><span class="eyebrow">'+num+'</span><h1>'+title+'</h1>'+(text?'<p>'+text+'</p>':"")+'</div>';
function invalidate(p){p.summary=false;p.visited=false}
function nextStep(){const p=plan();if(!state.event)return "event";if(!p.chosen)return "look";return "result"}
function go(p){
 if(!state.event&&["look","date","wardrobe","result"].includes(p))p="event";
 if(["wardrobe","result"].includes(p)&&!plan().chosen)p="look";
 page=p;render();screen.scrollTop=0;
}
function render(){
 viewCleanup();viewCleanup=()=>{};
 const p=plan(),n=completion().filter(Boolean).length;
 document.querySelector(".progress b").style.width=(n/6*100)+"%";
 document.querySelector(".progress").setAttribute("aria-valuenow",String(n));
 $("back").disabled=page==="film";$("plan").disabled=page==="plan";
 let body="";
 if(page==="film"){
  body='<div class="story"><div class="media"><video id="film" muted playsinline controls preload="none" poster="https://atelier-23.ru/wp-content/uploads/2024/12/Atelier23_24_11_14_0844-600x800.jpg" aria-label="Рекламный фильм"><source src="../assets/atelier23-film.mp4" type="video/mp4"></video><a id="film-fallback" class="image-fail" hidden href="../assets/atelier23-film.mp4">Открыть ролик ↗</a></div>'+heading("FILM 01","Ваш момент.<br><i>Ваш стиль.</i>")+primary(state.event?"Продолжить":"Найти свой образ","start")+'<span class="tiny">Рекламный концепт · '+viewLabel("film")+'</span></div>';
 }else if(page==="event"){
  body='<div class="story center">'+heading("01 / ПОВОД","К чему вы<br><i>готовитесь?</i>")+'<div class="choice-list">'+Object.entries(events).map(([id,label])=>'<button class="choice" data-event="'+id+'">'+label+'<span>↗</span></button>').join("")+'</div></div>';
 }else if(page==="look"){
  const a=list();index=Math.max(0,Math.min(index,a.length-1));const item=a[index];
  body='<div class="story">'+heading("02 / "+events[state.event],"Ваш образ?")+'<div class="media" id="look-photo" tabindex="0" aria-label="Фото; свайп вверх или вниз, либо клавиши стрелок"><img src="'+PHOTO+item.image+'" alt="'+item.item+'"><div class="image-fail" hidden>Фото недоступно</div><span class="number">'+(index+1)+' / '+a.length+'</span><div class="reactions"><button class="icon" data-like="'+item.id+'" aria-label="Нравится" aria-pressed="'+state.likes.includes(item.id)+'">'+icon("heart")+'</button><button class="icon" data-save="'+item.id+'" aria-label="В избранное" aria-pressed="'+state.saved.includes(item.id)+'">'+icon("save")+'</button></div></div><div class="copy"><h2>'+item.name+'</h2><p>'+item.item+' · '+price(item)+'</p><span class="tiny">Цена изделия · <a href="'+url(item)+'">Каталог ↗</a> · '+viewLabel(item.id)+'</span></div>'+primary("Выбрать образ","choose")+'<div class="action-row"><button class="link" data-action="prev" '+(index===0?"disabled":"")+'>↑ Назад</button><button class="link" data-action="next" '+(index===a.length-1?"disabled":"")+'>↓ Другой образ</button></div></div>';
 }else if(page==="date"){
  body='<div class="story center">'+heading("СРОК","Когда ваш<br><i>момент?</i>")+'<label class="field">Дата события<input id="date" type="date" min="'+today()+'" value="'+p.date+'"></label>'+primary("Готово","date")+secondary("Пока не знаю","unknown")+'<p class="notice" id="date-error" role="status"></p></div>';
 }else if(page==="wardrobe"){
  const item=product(p.chosen);
  body='<div class="story center">'+heading("ГАРДЕРОБ","Что уже<br><i>есть?</i>","Отметьте подходящие вещи.")+'<div>'+item.parts.map(id=>'<label class="checkrow"><input type="checkbox" data-own="'+id+'" '+(p.owned.includes(id)?"checked":"")+'><span>'+parts[id]+'</span></label>').join("")+'</div>'+primary("Готово","wardrobe")+'</div>';
 }else if(page==="result"){
  const item=product(p.chosen),missing=item.parts.filter(x=>!p.owned.includes(x)).map(x=>parts[x]),owned=p.owned.includes(item.parts[0]);
  const days=p.date?Math.round((Date.parse(p.date+"T00:00:00Z")-Date.parse(today()+"T00:00:00Z"))/86400000):null;
  const caution=days!==null&&days<56?"Меньше 8 недель: уточните наличие и подгонку.":days!==null&&state.event==="wedding"&&days<92?"Для свадьбы лучше иметь запас около трёх месяцев.":"Срок и наличие подтвердит менеджер.";
  body='<div class="story">'+heading("03 / ВАШ ВЫБОР","Образ <i>найден.</i>")+'<div class="media"><img src="'+PHOTO+item.image+'" alt="'+item.item+'"><div class="image-fail" hidden>Фото недоступно</div></div><div class="copy"><h2>'+item.name+'</h2><p>'+item.item+' · '+(owned?"уже есть":price(item))+'</p><p class="tiny">'+caution+'</p></div><a class="primary" id="book" href="'+BOOK+'">Записаться на примерку ↗</a><button class="link" data-action="details">Уточнить дату и гардероб</button><span class="tiny">Запись подтверждает ателье. Цена не за весь комплект.</span></div>';
 }else if(page==="plan"){
  const labels=["Выбрать событие","Уточнить дату","Выбрать образ","Проверить гардероб","Подготовить запрос","Посетить ателье"],targets=["event","date","look","wardrobe","summary","visit"];
  body='<div class="story">'+heading("ЛИЧНЫЙ МАРШРУТ","Мой <i>план.</i>",n+" из 6 этапов")+'<div class="plan-list">'+labels.map((s,i)=>'<button data-jump="'+targets[i]+'" '+(i>0&&!state.event||i>=3&&!p.chosen?"disabled":"")+'><b>'+(completion()[i]?"✓":"○")+'</b><span class="'+(completion()[i]?"done":"")+'">'+s+'</span></button>').join("")+'</div>'+primary("Продолжить","resume")+secondary("Избранное · "+state.saved.length,"saved")+'</div>';
 }else if(page==="summary"){
  const item=product(p.chosen),missing=item.parts.filter(x=>!p.owned.includes(x)).map(x=>parts[x]);
  body='<div class="story center">'+heading("КОНСУЛЬТАЦИЯ","Ваш <i>запрос.</i>")+'<div class="summary"><p>'+events[state.event]+'</p><p>'+item.name+'</p><p>Дата: '+(p.date||"уточнить")+'</p><p>Обсудить: '+(missing.join(", ")||"посадку")+'</p></div>'+primary("Скопировать запрос","copy",!p.dateSet||!p.wardrobe)+'<p class="tiny" id="copy-status" role="status">'+(!p.dateSet||!p.wardrobe?"Сначала уточните дату и гардероб.":"")+'</p><a class="secondary" href="'+BOOK+'">Записаться в ателье ↗</a></div>';
 }else if(page==="visit"){
  body='<div class="story center">'+heading("ПОСЛЕДНИЙ ЭТАП","Вы уже были<br><i>в ателье?</i>","Отмечайте только состоявшийся визит.")+'<label class="checkrow"><input id="visit" type="checkbox" '+(p.visited?"checked":"")+' '+(!p.summary?"disabled":"")+'><span>Я посетил ателье</span></label>'+primary("Готово","plan")+'<p class="tiny">Отметка личная, не подтверждение брони.</p></div>';
 }else if(page==="saved"){
  body='<div class="story">'+heading("ВАША КОЛЛЕКЦИЯ","Избранное.")+'<div>'+state.saved.map(id=>{const item=product(id);return '<div class="saved-item"><img src="'+PHOTO+item.image+'" alt=""><span>'+item.name+'</span><button data-remove="'+id+'">Удалить</button></div>'}).join("")+'</div>'+(state.saved.length?"":"<p>Пока нет сохранённых образов.</p>")+primary("К образам","resume")+'</div>';
 }
 screen.innerHTML=body;
 screen.querySelectorAll(".media img").forEach(img=>{const fail=()=>{img.hidden=true;img.parentElement.querySelector(".image-fail").hidden=false};img.addEventListener("error",fail);if(img.complete&&!img.naturalWidth)fail()});
 if(page==="film"){
  const v=$("film"),fallback=$("film-fallback");const fail=()=>fallback.hidden=false;v.addEventListener("error",fail);v.querySelector("source").addEventListener("error",fail);
  watchFilm(v);
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches)v.play().catch(()=>{});
 }
 if(page==="look"){
  const photo=$("look-photo");watchPhoto(photo,list()[index].id);let x=0,y=0;
  photo.addEventListener("touchstart",e=>{x=e.changedTouches[0].clientX;y=e.changedTouches[0].clientY},{passive:true});
  photo.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)*1.2)move(dy<0?1:-1)},{passive:true});
  photo.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();move(["ArrowUp","ArrowLeft"].includes(e.key)?-1:1);$("look-photo")?.focus()}});
 }
}
function move(n){
 const a=list(),next=Math.max(0,Math.min(a.length-1,index+n));
 if(next===index)return;
 if(next>frontier){
  deck=[...a.slice(0,frontier+1),...rank(a.slice(frontier+1))];
  frontier=next;
 }
 index=next;render();
}
function toggle(key,id){state[key]=state[key].includes(id)?state[key].filter(x=>x!==id):[...state[key],id];persist()}
$("back").addEventListener("click",()=>{const back={event:"film",look:"event",result:"look",date:"result",wardrobe:"date",plan:returnPage,saved:"plan",summary:"plan",visit:"plan"};go(back[page]||"film")});
$("plan").addEventListener("click",()=>{returnPage=page;go("plan")});
screen.addEventListener("click",async e=>{
 const b=e.target.closest("button");if(!b||b.disabled)return;const d=b.dataset,p=plan(),a=d.action;
 if(d.event){state.event=d.event;rebuildDeck();persist();return go("look")}
 if(d.like||d.save){const key=d.like?"likes":"saved",id=d.like||d.save;toggle(key,id);b.setAttribute("aria-pressed",String(state[key].includes(id)));return}
 if(d.remove){toggle("saved",d.remove);return render()}
 if(d.jump)return go(d.jump);
 if(a==="start"||a==="resume")return go(nextStep());
 if(a==="next"||a==="prev")return move(a==="next"?1:-1);
 if(a==="choose"){const id=list()[index].id;if(p.chosen!==id){p.chosen=id;p.wardrobe=false;invalidate(p)}persist();return go("result")}
 if(a==="details")return go("date");
 if(a==="date"||a==="unknown"){
  const d=a==="date"?$("date").value:"";
  if(a==="date"&&!validDate(d)){$("date-error").textContent="Выберите сегодняшнюю или будущую дату.";return}
  if(p.date!==d||!p.dateSet)invalidate(p);p.date=d;p.dateSet=true;persist();return go("wardrobe")
 }
 if(a==="wardrobe"){p.wardrobe=true;persist();return go("result")}
 if(a==="copy"){const item=product(p.chosen);try{await navigator.clipboard.writeText("ATELIER 23\n"+events[state.event]+"\n"+item.name+"\n"+(p.date||"Дата уточняется")+"\n"+url(item));p.summary=true;persist();$("copy-status").textContent="Запрос скопирован."}catch{$("copy-status").textContent="Копирование недоступно."}return}
 if(a==="saved"||a==="plan")return go(a)
});
screen.addEventListener("change",e=>{
 const el=e.target,p=plan(),id=el.dataset.own;
 if(id&&Object.hasOwn(parts,id)){p.owned=el.checked?[...new Set([...p.owned,id])]:p.owned.filter(x=>x!==id);p.wardrobe=false;invalidate(p);persist()}
 if(el.id==="visit"&&p.summary){p.visited=el.checked;persist()}
});
go("film");
