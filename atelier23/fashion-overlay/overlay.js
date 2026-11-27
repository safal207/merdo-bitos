import {makeTracker} from "./analytics.js";
import {translate,localizeTree} from "./locale.js";
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
const KEY="bitos.atelier23.fashionOverlay.v1";
const today=()=>{let d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const validDate=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d&&d>=today();
function restore(){
 let r={};try{r=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const a={event:Object.hasOwn(events,r.event)?r.event:"",likes:[],saved:[],plans:{},views:{}};
 for(const k of ["likes","saved"])a[k]=Array.isArray(r[k])?[...new Set(r[k].filter(x=>x==="film"||product(x)))]:[];
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
const shareURL=item=>{const u=new URL(location.href);u.search="";u.hash="";u.searchParams.set("event",state.event);u.searchParams.set("look",item.id);u.searchParams.set("lang",locale);return u.href};
const atelierMark='<svg aria-hidden="true" class="atelier-mark" viewBox="0 0 90 65" fill="none" stroke="currentColor" stroke-width=".9" stroke-linejoin="round" stroke-linecap="round"><path class="pattern" d="M31 9 39 5Q45 15 51 5L59 9 69 19 64 32 58 27 60 58 45 60 30 58 32 27 26 32 21 19Z M39 5 45 24 51 5 M45 24 42 59"/><path d="M10 48Q23 33 41 49T78 42" stroke-width="6" opacity=".20"/><path d="M10 48Q23 33 41 49T78 42 M15 43l3 4m5-7 1 5m7-4-1 5m8 0-2 5m9-1-1 5m8-1v5m7-5 2 4m4-8 3 4m3-9 4 3"/><path d="M68 5 84 23 65 9Q64 3 68 5Z" fill="currentColor"/><path d="M67 8Q85-3 86 16T81 39" stroke-dasharray="2 2"/></svg>';

const screen=$("screen"),film=$("film"),app=document.querySelector(".app");
const LOCALE_KEY="bitos.atelier23.fashionOverlay.locale.v1";
let savedLocale="";
try{savedLocale=localStorage.getItem(LOCALE_KEY)||""}catch{}
const requestedLocale=new URLSearchParams(location.search).get("lang");
let locale=["ru","en"].includes(requestedLocale)?requestedLocale:savedLocale==="en"?"en":"ru";
const t=raw=>translate(raw,locale);
const localize=(root=app)=>localizeTree(root,locale);
const metaOriginals=[...document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')].map(el=>[el,el.content]);
function applyLocale(){
 document.documentElement.lang=locale;
 localize();
 for(const [el,raw] of metaOriginals)el.content=t(raw);
 const toggle=$("locale-toggle");
 toggle.textContent=locale==="en"?"RU":"EN";
 toggle.lang=locale==="en"?"ru":"en";
 toggle.setAttribute("aria-label",locale==="en"?"Switch to Russian":"Switch to English");
}
$("locale-toggle").addEventListener("click",()=>{
 locale=locale==="en"?"ru":"en";
 try{localStorage.setItem(LOCALE_KEY,locale)}catch{}
 const next=new URL(location.href);next.searchParams.set("lang",locale);
 try{history.replaceState(history.state,"",next.href)}catch{}
 applyLocale();
});

let track=()=>false;
try{track=makeTracker(localStorage,globalThis.crypto?.randomUUID?.()||("visit-"+Date.now()+"-"+Math.random().toString(36).slice(2)))}catch{}
function log(type,details={}){
 const button=$("cue-cta");
 const filmContext=page==="film"&&button?{cue:button.dataset.cue,second:film.currentTime}:{};
 return track(type,{page,occasion:state.event,...filmContext,...details});
}
const motion=matchMedia("(prefers-reduced-motion: reduce)");
// Original 17.64s film, SHA256 e4a47584c6309e6baac87949fe6726108eccf337f356c0bee7c3328651d261c5.
// Scene cuts verified against the actual MP4; 15s is the closing title fade.
const timeline=[
 {at:0,id:"emotion",line1:"Ваш момент.",line2:"Ваш стиль.",cta:"Выбрать повод",action:"event"},
 {at:2.8,id:"business",line1:"Уверенность.",line2:"Без слов.",cta:"Деловой образ",action:"business"},
 {at:5.8,id:"occasion",line1:"Особый момент.",line2:"Ваш образ.",cta:"Выбрать повод",action:"event"},
 {at:8.8,id:"craft",line1:"Ткань.",line2:"Посадка.",cta:"Узнать о пошиве",action:"tailoring"},
 {at:11.8,id:"detail",line1:"Каждая деталь.",line2:"Имеет значение.",cta:"Подобрать образ",action:"event"},
 {at:15,id:"fitting",line1:"Ваш костюм.",line2:"Ваши мерки.",cta:"Записаться на примерку",action:"booking"}
];
function currentCue(){
 const t=Number.isFinite(film.currentTime)?Math.max(0,film.currentTime):0;
 return [...timeline].reverse().find(c=>t>=c.at)||timeline[0];
}
function syncTimeline(force=false){
 if(page!=="film")return;
 const title=$("cue-title"),sub=$("cue-subtitle"),button=$("cue-cta"),other=$("cue-other");
 if(!title||!sub||!button||!other)return;
 // Keep the meaning stable during an active keyboard or pointer interaction.
 if(!force&&(button===document.activeElement||button.dataset.pressing==="true"))return;
 const cue=currentCue();
 if(!force&&button.dataset.cue===cue.id)return;
 title.textContent=cue.line1;sub.textContent=cue.line2;
 button.textContent=cue.id==="emotion"&&state.event?"Продолжить":cue.cta;
 button.dataset.cue=cue.id;button.dataset.intent=cue.action;
 other.hidden=cue.action==="event";localize(screen);
}
for(const event of ["timeupdate","seeked","loadedmetadata","ended","play"])film.addEventListener(event,()=>syncTimeline());
screen.addEventListener("pointerdown",e=>{const b=e.target.closest("#cue-cta");if(b)b.dataset.pressing="true"});
for(const event of ["pointerup","pointercancel"])screen.addEventListener(event,e=>{const b=$("cue-cta");if(b)delete b.dataset.pressing});
screen.addEventListener("focusout",e=>{if(e.target.id==="cue-cta")queueMicrotask(()=>syncTimeline())});
let filmCleanup=()=>{},filmActive=false,filmWanted=!motion.matches;
const filmURL=()=>{const u=new URL(location.href);u.search="";u.hash="";u.searchParams.set("lang",locale);return u.href};
const sharePanel=()=>'<div class="share-panel" id="share-panel" hidden><p id="share-status" role="status"></p><input id="share-link" aria-label="Ссылка для отправки" readonly><button class="link" data-action="close-share">Закрыть</button></div>';
const eye='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
let viewCleanup=()=>{};
const viewText=id=>String(state.views[id]||0)+" просм. · на устройстве";
const viewLabel=id=>'<span class="tiny" data-view-count="'+id+'" aria-label="Просмотры на этом устройстве: '+(state.views[id]||0)+'">'+viewText(id)+'</span>';
function recordView(id){
 log(id==="film"?"film_view":"look_view",{target:id});
 state.views[id]=Math.min(Number.MAX_SAFE_INTEGER,(state.views[id]||0)+1);persist();
 const el=screen.querySelector('[data-view-count="'+id+'"]');
 if(el){el.textContent=viewText(id);el.setAttribute("aria-label","Просмотры на этом устройстве: "+state.views[id]);localizeTree(el,locale)}
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
 let counted=false,seconds=0,last=null,lastCue="",sceneSeconds=0;
 const seen=new Set();
 const reset=()=>{last=null;lastCue="";sceneSeconds=0};
 const tick=()=>{
  const now=v.currentTime;
  if(v.paused||v.seeking||document.hidden||!Number.isFinite(now)){reset();return}
  const delta=last!==null&&now>=last&&now-last<=1.5?now-last:0;
  if(delta>0)seconds+=delta;
  const cue=page==="film"&&$("cue-cta")?.dataset.cue===currentCue().id?currentCue().id:"";
  if(cue&&cue===lastCue&&delta>0){sceneSeconds+=delta}
  else{sceneSeconds=0}
  if(cue&&sceneSeconds>=1&&!seen.has(cue)){seen.add(cue);log("scene_view",{target:"film",cue,second:now})}
  last=now;lastCue=cue;
  if(!counted&&seconds>=3){counted=true;recordView("film")}
 };
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
 app.dataset.mode=page;
 const showFilm=page==="film"||page==="event";
 if(showFilm&&!filmActive){filmActive=true;watchFilm(film);filmCleanup=viewCleanup;viewCleanup=()=>{};if(filmWanted)film.play().catch(()=>{})}
 if(!showFilm&&filmActive){filmActive=false;film.pause();filmCleanup();filmCleanup=()=>{}}
 const p=plan(),n=completion().filter(Boolean).length;
 document.querySelector(".progress b").style.width=(n/6*100)+"%";
 document.querySelector(".progress").setAttribute("aria-valuenow",String(n));
 $("back").disabled=page==="film";$("plan").disabled=page==="plan";
 let body="";
 if(page==="film"){
  body='<div class="story overlay"><div class="mark-overlay">'+atelierMark+'</div><div class="video-controls"><button class="icon" data-action="play" aria-label="Воспроизвести фильм">▶</button><button class="icon" data-action="sound" aria-label="Включить звук">♫</button></div><div class="overlay-actions"><div class="eye-stat">'+eye+viewLabel("film")+'</div><button class="icon" data-like="film" aria-label="Нравится фильм" aria-pressed="'+state.likes.includes("film")+'">'+icon("heart")+'</button><button class="icon" data-save="film" aria-label="Сохранить фильм" aria-pressed="'+state.saved.includes("film")+'">'+icon("save")+'</button><button class="icon" data-share="film" aria-label="Поделиться фильмом">'+icon("share")+'</button></div><div class="overlay-copy"><span class="eyebrow">FILM 01 · YOUR MOMENT</span><h1><span id="cue-title">Ваш момент.</span><br><i id="cue-subtitle">Ваш стиль.</i></h1></div><button class="primary" id="cue-cta" data-action="cue" data-intent="event" data-cue="emotion">'+(state.event?"Продолжить":"Выбрать повод")+'</button><div class="cue-footer"><span class="tiny">Рекламный концепт</span><button class="link" id="cue-other" data-action="start" hidden>Выбрать повод</button></div><a id="film-fallback" class="link" hidden href="../assets/atelier23-film.mp4">Открыть ролик ↗</a>'+sharePanel()+'</div>';
 }else if(page==="event"){
  body='<div class="story overlay event-overlay"><div class="overlay-copy"><span class="eyebrow">01 / ПОВОД</span><h1>К чему вы<br><i>готовитесь?</i></h1></div><div class="choice-list">'+Object.entries(events).map(([id,label])=>'<button class="choice" data-event="'+id+'">'+label+'<span>↗</span></button>').join("")+'</div></div>';
 }else if(page==="look"){
  const a=list();index=Math.max(0,Math.min(index,a.length-1));const item=a[index];
  body='<div class="story product-overlay">'+heading("02 / "+events[state.event],"Ваш образ?")+'<div class="media" id="look-photo" tabindex="0" aria-label="Фото; свайп вверх или вниз, либо клавиши стрелок"><img src="'+PHOTO+item.image+'" alt="'+item.item+'"><div class="image-fail" hidden>Фото недоступно</div><span class="number">'+(index+1)+' / '+a.length+'</span><div class="reactions"><button class="icon" data-like="'+item.id+'" aria-label="Нравится" aria-pressed="'+state.likes.includes(item.id)+'">'+icon("heart")+'</button><button class="icon" data-save="'+item.id+'" aria-label="В избранное" aria-pressed="'+state.saved.includes(item.id)+'">'+icon("save")+'</button><button class="icon" data-share="'+item.id+'" aria-label="Поделиться образом">'+icon("share")+'</button></div><div class="share-panel" id="share-panel" hidden><p id="share-status" role="status"></p><input id="share-link" aria-label="Ссылка на образ" readonly><button class="link" data-action="close-share">Закрыть</button></div></div><div class="copy"><h2>'+item.name+'</h2><p>'+item.item+' · '+price(item)+'</p><span class="tiny">Цена изделия · <a href="'+url(item)+'">Каталог ↗</a> · '+viewLabel(item.id)+'</span></div>'+primary("Хочу этот образ","choose")+'<div class="action-row"><button class="link" data-action="prev" '+(index===0?"disabled":"")+'>↑ Назад</button><button class="link" data-action="next" '+(index===a.length-1?"disabled":"")+'>↓ Другой образ</button></div></div>';
 }else if(page==="date"){
  body='<div class="story center">'+heading("СРОК","Когда ваш<br><i>момент?</i>")+'<label class="field">Дата события<input id="date" type="date" min="'+today()+'" value="'+p.date+'"></label>'+primary("Готово","date")+secondary("Пока не знаю","unknown")+'<p class="notice" id="date-error" role="status"></p></div>';
 }else if(page==="wardrobe"){
  const item=product(p.chosen);
  body='<div class="story center">'+heading("ГАРДЕРОБ","Что уже<br><i>есть?</i>","Отметьте подходящие вещи.")+'<div>'+item.parts.map(id=>'<label class="checkrow"><input type="checkbox" data-own="'+id+'" '+(p.owned.includes(id)?"checked":"")+'><span>'+parts[id]+'</span></label>').join("")+'</div>'+primary("Готово","wardrobe")+'</div>';
 }else if(page==="result"){
  const item=product(p.chosen),missing=item.parts.filter(x=>!p.owned.includes(x)).map(x=>parts[x]),owned=p.owned.includes(item.parts[0]);
  const days=p.date?Math.round((Date.parse(p.date+"T00:00:00Z")-Date.parse(today()+"T00:00:00Z"))/86400000):null;
  const caution=days!==null&&days<56?"Меньше 8 недель: уточните наличие и подгонку.":days!==null&&state.event==="wedding"&&days<92?"Для свадьбы лучше иметь запас около трёх месяцев.":"Срок и наличие подтвердит менеджер.";
  body='<div class="story product-overlay">'+heading("03 / ВАШ ВЫБОР","Образ <i>найден.</i>")+'<div class="media"><img src="'+PHOTO+item.image+'" alt="'+item.item+'"><div class="image-fail" hidden>Фото недоступно</div></div><div class="copy"><h2>'+item.name+'</h2><p>'+item.item+' · '+(owned?"уже есть":price(item))+'</p><p class="tiny">'+caution+'</p></div><a class="primary" id="book" href="'+BOOK+'">Записаться на примерку ↗</a><button class="link" data-action="details">Уточнить дату и гардероб</button><span class="tiny">Запись подтверждает ателье. Цена не за весь комплект.</span></div>';
 }else if(page==="plan"){
  const labels=["Выбрать событие","Уточнить дату","Выбрать образ","Проверить гардероб","Подготовить запрос","Посетить ателье"],targets=["event","date","look","wardrobe","summary","visit"];
  body='<div class="story">'+heading("ЛИЧНЫЙ МАРШРУТ","Мой <i>план.</i>",n+" из 6 этапов")+'<div class="plan-list">'+labels.map((s,i)=>'<button data-jump="'+targets[i]+'" '+(i>0&&!state.event||i>=3&&!p.chosen?"disabled":"")+'><b>'+(completion()[i]?"✓":"○")+'</b><span class="'+(completion()[i]?"done":"")+'">'+s+'</span></button>').join("")+'</div>'+primary("Продолжить","resume")+secondary("Избранное · "+state.saved.length,"saved")+'</div>';
 }else if(page==="summary"){
  const item=product(p.chosen),missing=item.parts.filter(x=>!p.owned.includes(x)).map(x=>parts[x]);
  body='<div class="story center">'+heading("КОНСУЛЬТАЦИЯ","Ваш <i>запрос.</i>")+'<div class="summary"><p>'+events[state.event]+'</p><p>'+item.name+'</p><p>Дата: '+(p.date||"уточнить")+'</p><p>Обсудить: '+(missing.join(", ")||"посадку")+'</p></div>'+primary("Скопировать запрос","copy",!p.dateSet||!p.wardrobe)+'<p class="tiny" id="copy-status" role="status">'+(!p.dateSet||!p.wardrobe?"Сначала уточните дату и гардероб.":"")+'</p><a class="secondary" href="'+BOOK+'">Записаться в ателье ↗</a></div>';
 }else if(page==="visit"){
  body='<div class="story center">'+heading("ПОСЛЕДНИЙ ЭТАП","Вы уже были<br><i>в ателье?</i>","Отмечайте только состоявшийся визит.")+'<label class="checkrow"><input id="visit" type="checkbox" '+(p.visited?"checked":"")+' '+(!p.summary?"disabled":"")+'><span>Я посетил ателье</span></label>'+primary("Готово","plan")+'<p class="tiny">Отметка личная, не подтверждение брони.</p></div>';
 }else if(page==="saved"){
  body='<div class="story">'+heading("ВАША КОЛЛЕКЦИЯ","Избранное.")+'<div>'+state.saved.map(id=>{if(id==="film")return '<div class="saved-item"><span>ATELIER 23 · Фильм 01</span><button data-action="open-film">Открыть</button><button data-remove="film">Удалить</button></div>';const item=product(id);return '<div class="saved-item"><img src="'+PHOTO+item.image+'" alt=""><span>'+item.name+'</span><button data-remove="'+id+'">Удалить</button></div>'}).join("")+'</div>'+(state.saved.length?"":"<p>Пока нет сохранённых образов.</p>")+primary("К образам","resume")+'</div>';
 }
 screen.innerHTML=body;localize(screen);
 screen.querySelectorAll(".media img").forEach(img=>{const fail=()=>{img.hidden=true;img.parentElement.querySelector(".image-fail").hidden=false};img.addEventListener("error",fail);if(img.complete&&!img.naturalWidth)fail()});
 if(page==="film"){syncTimeline(true);updateFilmControls();if(film.error||film.querySelector("source").dataset.failed)$("film-fallback").hidden=false;}
 if(page==="look"){
  const photo=$("look-photo");watchPhoto(photo,list()[index].id);let x=0,y=0;
  photo.addEventListener("touchstart",e=>{x=e.changedTouches[0].clientX;y=e.changedTouches[0].clientY},{passive:true});
  photo.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)*1.2)move(dy<0?1:-1)},{passive:true});
  photo.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();move(["ArrowUp","ArrowLeft"].includes(e.key)?-1:1);$("look-photo")?.focus()}});
 }
}
function updateFilmControls(){
 const play=screen.querySelector('[data-action="play"]'),sound=screen.querySelector('[data-action="sound"]');
 if(play){play.textContent=film.paused?"▶":"Ⅱ";play.setAttribute("aria-label",film.paused?"Воспроизвести фильм":"Приостановить фильм")}
 if(sound){sound.textContent=film.muted?"♫":"♪";sound.setAttribute("aria-label",film.muted?"Включить звук":"Выключить звук");sound.setAttribute("aria-pressed",String(!film.muted))}localize(screen);
}
film.addEventListener("play",updateFilmControls);film.addEventListener("pause",updateFilmControls);film.addEventListener("volumechange",updateFilmControls);
const failFilm=()=>{film.querySelector("source").dataset.failed="1";const link=$("film-fallback");if(link)link.hidden=false};
film.addEventListener("error",failFilm);film.querySelector("source").addEventListener("error",failFilm);
motion.addEventListener?.("change",e=>{if(e.matches){filmWanted=false;film.pause()}});
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
 if(d.event){state.event=d.event;log("occasion_selected");rebuildDeck();persist();return go("look")}
 if(d.like||d.save){const key=d.like?"likes":"saved",id=d.like||d.save;toggle(key,id);const on=state[key].includes(id);log("reaction",{target:id,intent:(d.like?"like_":"save_")+(on?"on":"off")});b.setAttribute("aria-pressed",String(on));return}
 if(a==="play"){if(film.paused){filmWanted=true;film.play().catch(()=>{})}else{filmWanted=false;film.pause()}return}
 if(a==="sound"){film.muted=!film.muted;return}
 if(a==="open-film")return go("film");
 if(d.share){
  const item=product(d.share),link=item?shareURL(item):filmURL();
  const shareContext={target:d.share,page,occasion:state.event,...(page==="film"?{cue:$("cue-cta")?.dataset.cue,second:film.currentTime}:{})};
  track("share_click",shareContext);
  if(navigator.share){try{await navigator.share({title:"ATELIER 23 · "+t(item?.name||"Ваш момент"),url:link});track("share_resolved",shareContext);return}catch(err){if(err.name==="AbortError"){track("share_cancelled",shareContext);return}}}
  const panel=$("share-panel"),input=$("share-link"),status=$("share-status");
  if(!panel||!input||!status)return;
  panel.hidden=false;input.value=link;
  try{await navigator.clipboard.writeText(link);track("link_copied",shareContext);status.textContent="Ссылка скопирована.";localize(screen)}catch{status.textContent="Скопируйте ссылку.";localize(screen);input.focus();input.select()}
  return;
 }
 if(a==="close-share"){$("share-panel").hidden=true;return}
 if(d.remove){toggle("saved",d.remove);log("reaction",{target:d.remove,intent:"save_off"});return render()}
 if(d.jump)return go(d.jump);
 if(a==="cue"){
  const intent=d.intent;log("cta_click",{target:"film",intent});
  if(intent==="business"){state.event="business";log("occasion_selected",{target:"film",intent});rebuildDeck();persist();return go("look")}
  if(intent==="tailoring"){log("tailoring_click",{target:"film",intent});location.assign(ROOT+"personal-tailoring/");return}
  if(intent==="booking"){log("booking_click",{target:"film",intent});location.assign(BOOK);return}
  return go("event");
 }
 if(a==="start"){if(page==="film")log("cta_click",{target:"film",intent:"event"});return go("event")}
 if(a==="resume")return go(nextStep());
 if(a==="next"||a==="prev")return move(a==="next"?1:-1);
 if(a==="choose"){const id=list()[index].id;log("look_selected",{target:id});if(p.chosen!==id){p.chosen=id;p.wardrobe=false;invalidate(p)}persist();return go("result")}
 if(a==="details")return go("date");
 if(a==="date"||a==="unknown"){
  const d=a==="date"?$("date").value:"";
  if(a==="date"&&!validDate(d)){$("date-error").textContent="Выберите сегодняшнюю или будущую дату.";localize(screen);return}
  if(p.date!==d||!p.dateSet)invalidate(p);p.date=d;p.dateSet=true;persist();return go("wardrobe")
 }
 if(a==="wardrobe"){p.wardrobe=true;persist();return go("result")}
 if(a==="copy"){const item=product(p.chosen);try{await navigator.clipboard.writeText("ATELIER 23\n"+t(events[state.event])+"\n"+t(item.name)+"\n"+t(p.date||"Дата уточняется")+"\n"+url(item));p.summary=true;persist();$("copy-status").textContent="Запрос скопирован.";localize(screen)}catch{$("copy-status").textContent="Копирование недоступно.";localize(screen)}return}
 if(a==="saved"||a==="plan")return go(a)
});
function logBookingLink(e){
 if(e.type==="auxclick"&&e.button!==1)return;
 const link=e.target.closest("a[href]");
 if(link?.href===BOOK)log("booking_click",{target:plan().chosen||undefined,intent:"booking"});
}
screen.addEventListener("click",logBookingLink);
screen.addEventListener("auxclick",logBookingLink);
screen.addEventListener("change",e=>{
 const el=e.target,p=plan(),id=el.dataset.own;
 if(id&&Object.hasOwn(parts,id)){p.owned=el.checked?[...new Set([...p.owned,id])]:p.owned.filter(x=>x!==id);p.wardrobe=false;invalidate(p);persist()}
 if(el.id==="visit"&&p.summary){p.visited=el.checked;persist()}
});
const incoming=new URLSearchParams(location.search);
const incomingEvent=incoming.get("event"),incomingLook=product(incoming.get("look"));
if(Object.hasOwn(events,incomingEvent)&&incomingLook?.events.includes(incomingEvent)){
 state.event=incomingEvent;rebuildDeck();deck=[incomingLook,...deck.filter(p=>p.id!==incomingLook.id)];index=0;frontier=0;
 persist();go("look");
}else go("film");
applyLocale();
