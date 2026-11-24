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
const KEY="bitos.atelier23.fashionJourney.v1";
const today=()=>{let d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const validDate=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d&&d>=today();
function restore(){
 let r={};try{r=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const a={event:Object.hasOwn(events,r.event)?r.event:"",likes:[],saved:[],plans:{}};
 for(const k of ["likes","saved"])a[k]=Array.isArray(r[k])?[...new Set(r[k].filter(x=>product(x)))]:[];
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
let state=restore(),page="home",index=0;
const $=id=>document.getElementById(id);
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const plan=()=>state.event?state.plans[state.event]:blank();
const list=()=>products.filter(p=>!state.event||p.events.includes(state.event));
const completion=()=>{const p=plan();return [!!state.event,p.dateSet,!!p.chosen,p.wardrobe,p.summary,p.visited]};
const fmt=n=>n.toLocaleString("ru-RU")+" ₽";
const icons={heart:'<path d="M20.8 8.6c0 5-8.8 10.7-8.8 10.7S3.2 13.6 3.2 8.6a4.9 4.9 0 0 1 8.8-3 4.9 4.9 0 0 1 8.8 3z"/>',save:'<path d="M6 3h12v18l-6-4-6 4z"/>',share:'<path d="m22 2-7 20-4-9-9-4 20-7zM22 2 11 13"/>'};
const icon=name=>'<svg aria-hidden="true" viewBox="0 0 24 24">'+icons[name]+'</svg>';
const price=p=>p.price?fmt(p.price):"Уточнить цену";
const url=p=>ROOT+"shop/"+p.link+"/";
function go(next,scroll=true){
 if(!["home","feed","plan","saved"].includes(next))return;
 if((next==="feed"||next==="plan")&&!state.event)next="home";
 page=next;document.querySelectorAll("[data-page]").forEach(x=>x.hidden=x.id!==page);
 document.querySelectorAll(".bottom [data-nav]").forEach(x=>{if(x.dataset.nav===page)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current")});
 render();if(scroll)window.scrollTo({top:0,behavior:"instant"});if(page!=="home")$("film").pause();
}
function render(){
 $("saved-count").textContent=state.saved.length;
 $("events").innerHTML=Object.entries(events).map(([id,label])=>'<button type="button" data-event="'+id+'" aria-pressed="'+(state.event===id)+'">'+label+'<span aria-hidden="true">↗</span></button>').join("");
 const f=completion().filter(Boolean).length;
 $("feed-progress-label").textContent=f+" из 6 этапов";$("feed-progress").style.width=(f/6*100)+"%";
 if(page==="feed")renderFeed();if(page==="plan")renderPlan();if(page==="saved")renderSaved();
}
function renderFeed(){
 const a=list();index=Math.max(0,Math.min(index,a.length-1));const p=a[index],selected=plan().chosen===p.id;
 $("feed-title").textContent=events[state.event];
 $("feed-body").innerHTML='<article class="post"><div class="post-head"><b>ATELIER 23 / COLLECTION</b><span>'+String(index+1).padStart(2,"0")+' / '+String(a.length).padStart(2,"0")+'</span></div><div class="photo" tabindex="0" aria-label="Фото образа, стрелки влево и вправо меняют вариант"><img src="'+PHOTO+p.image+'" alt="'+p.item+'" fetchpriority="high"><div class="img-error" hidden>Фото временно недоступно</div><span class="counter">'+(index+1)+' / '+a.length+'</span></div><div class="post-actions"><button type="button" class="icon-btn like" data-like="'+p.id+'" aria-label="Нравится" aria-pressed="'+state.likes.includes(p.id)+'">'+icon("heart")+'</button><button type="button" class="icon-btn" data-share="'+p.id+'" aria-label="Поделиться">'+icon("share")+'</button><span class="spacer"></span><div class="dots" aria-label="Варианты образа">'+a.map((x,i)=>'<button data-index="'+i+'" aria-label="Образ '+(i+1)+'" aria-current="'+(index===i)+'"></button>').join("")+'</div><span class="spacer"></span><button type="button" class="icon-btn" data-save="'+p.id+'" aria-label="Сохранить образ" aria-pressed="'+state.saved.includes(p.id)+'">'+icon("save")+'</button></div><div class="post-copy"><p class="tiny" id="reaction">'+(state.likes.includes(p.id)?"Вам нравится этот образ.":"Оцените образ — это ваш личный сигнал.")+'</p><h2>'+p.name+'</h2><p>'+p.desc+'</p><p class="price">'+price(p)+' <small>за указанное изделие, не комплект</small></p><p>'+p.item+' · <a href="'+url(p)+'">Карточка товара ↗</a></p><div class="proof">★ 4,8 / 37 отзывов об ателье<br><a href="'+ROOT+'personal-tailoring/">Рейтинг опубликован на сайте ателье, не оценка изделия ↗</a></div><button class="primary" data-choose="'+p.id+'">'+(selected?"✓ Выбран — открыть план":"Выбрать этот образ")+'</button><button class="secondary" data-nav="plan">Мой план</button><p id="share-status" class="tiny" role="status"></p></div></article><div class="pager"><button data-move="-1" '+(index===0?"disabled":"")+'>← Назад</button><span>Листайте фото</span><button data-move="1" '+(index===a.length-1?"disabled":"")+'>Дальше →</button></div>';
 const photo=$("feed-body").querySelector(".photo"),img=photo.querySelector("img");
 img.addEventListener("error",()=>{img.hidden=true;photo.querySelector(".img-error").hidden=false});
 let x=0,y=0;
 photo.addEventListener("touchstart",e=>{x=e.changedTouches[0].clientX;y=e.changedTouches[0].clientY},{passive:true});
 photo.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1)},{passive:true});
 photo.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();move(e.key==="ArrowLeft"?-1:1);$("feed-body").querySelector(".photo").focus()}});
}
function move(n){const next=Math.min(list().length-1,Math.max(0,index+n));if(next!==index){index=next;renderFeed()}}
function renderPlan(){
 const p=plan(),c=completion(),n=c.filter(Boolean).length,look=product(p.chosen),required=look?.parts||[];
 const labels=["Определить событие","Уточнить дату или срок","Выбрать образ","Проверить гардероб","Подготовить запрос","Подтвердить визит самостоятельно"];
 const notes=[events[state.event],p.date||"Дата пока не известна",look?.name||"Выберите в ленте",p.wardrobe?"Проверено вами":"Отметьте вещи ниже",p.summary?"Запрос готов":"Сформируйте после выбора",p.visited?"Отмечено вами, не подтверждение ателье":"Не отмечается автоматически"];
 const days=p.date?Math.round((Date.parse(p.date+"T00:00:00Z")-Date.parse(today()+"T00:00:00Z"))/86400000):null;
 const primaryPart=required[0],ownedPrimary=p.owned.includes(primaryPart);
 const amount=look?(ownedPrimary?"0 ₽ за основное изделие (уже есть)":price(look)):"Сначала выберите образ";
 const missing=required.filter(x=>!p.owned.includes(x)).map(x=>parts[x]);
 $("plan-body").innerHTML='<div class="panel"><p class="kicker">'+events[state.event]+'</p><h2 id="plan-progress">'+n+' из 6 этапов</h2><div class="track" role="progressbar" aria-label="Готовность плана" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="6"><b style="width:'+(n/6*100)+'%"></b></div>'+labels.map((label,i)=>'<div class="task '+(c[i]?"done":"")+'" data-task="'+i+'"><span class="check" aria-hidden="true">'+(c[i]?"✓":"")+'</span><div><span class="task-name">'+label+'</span><small>'+notes[i]+'</small></div></div>').join("")+'</div><div class="panel"><h2>Дата события</h2><label class="field">Когда нужно быть готовым?<input id="event-date" type="date" min="'+today()+'" value="'+p.date+'"></label><button class="primary" id="set-date">Подтвердить дату</button><button class="secondary" id="unknown-date">Пока не знаю дату</button><p id="date-error" role="status" class="tiny"></p>'+(days!==null&&days<56?'<div class="notice">До события меньше 8 недель: уточните готовые изделия и срок подгонки. Индивидуальный пошив не обещаем.</div>':days!==null&&state.event==="wedding"&&days<92?'<div class="notice">Для свадьбы ателье рекомендует запас около трёх месяцев. Срок согласуйте с менеджером.</div>':"")+'</div><div class="panel"><h2>Образ и гардероб</h2>'+(look?'<p>'+look.name+' · '+look.item+'</p>'+required.map(id=>'<label class="field-inline"><input type="checkbox" data-own="'+id+'" '+(p.owned.includes(id)?"checked":"")+'><span>'+parts[id]+'</span></label>').join("")+'<button class="primary" id="confirm-wardrobe">'+(p.wardrobe?"✓ Гардероб проверен":"Гардероб проверен")+'</button><p class="tiny">Отмечайте только подходящие вещи. Совместимость подтвердит стилист.</p>':'<p>Выберите один образ, чтобы составить список вещей.</p><button class="primary" data-nav="feed">Выбрать образ</button>')+'</div><div class="panel"><h2>Ваш запрос</h2><p class="summary">'+(look?"Основное изделие: "+amount+"\nНедостающие вещи: "+(missing.join(", ")||"не отмечены")+"\nДополнения не оценены, итоговая стоимость не рассчитана.":amount)+'</p><button class="primary" id="confirm-summary" '+(!p.wardrobe||!p.dateSet?"disabled":"")+'>'+ (p.summary?"✓ Запрос подготовлен":"Подготовить запрос")+'</button><button class="secondary" id="copy-summary" '+(!p.summary?"disabled":"")+'>Скопировать запрос консультанту</button><p id="copy-status" role="status" class="tiny"></p><a class="secondary" id="book" href="'+BOOK+'">Записаться в ателье ↗</a><p class="tiny">Переход на официальный сайт не означает подтверждение записи.</p><label class="field-inline"><input id="visited" type="checkbox" '+(p.visited?"checked":"")+' '+(!p.summary?"disabled":"")+'><span>Я уже посетил ателье</span></label></div><button class="text-btn" id="reset-plan">Начать этот маршрут заново</button>';
}
function renderSaved(){
 $("saved-body").innerHTML=state.saved.length?'<p class="tiny">Ваши личные сохранения. Не заказы.</p><div class="saved-list">'+state.saved.map(id=>{const p=product(id);return '<article class="saved-item"><img src="'+PHOTO+p.image+'" alt="'+p.item+'" loading="lazy"><div><h3>'+p.name+'</h3><p>'+price(p)+'</p><a class="quiet" href="'+url(p)+'">Товар ↗</a>'+(state.event&&p.events.includes(state.event)?'<button data-open="'+id+'">В ленту</button>':"")+'<button data-save="'+id+'" aria-label="Удалить '+p.name+' из избранного">Удалить</button></div></article>'}).join("")+'</div>':'<div class="panel"><p>Пока ничего не сохранено. Нажмите закладку на понравившемся образе.</p><button class="primary" data-nav="'+(state.event?"feed":"home")+'">Посмотреть образы</button></div>';
}
function invalidate(p){p.summary=false;p.visited=false}
function toggle(k,id){state[k]=state[k].includes(id)?state[k].filter(x=>x!==id):[...state[k],id];persist()}
document.addEventListener("click",async e=>{
 const b=e.target.closest("button");if(!b||b.disabled)return;
 const d=b.dataset,p=plan();
 if(d.nav)return go(d.nav);
 if(d.event){state.event=d.event;index=0;persist();return go("feed")}
 if(d.move)return move(Number(d.move));
 if(d.index!==undefined){index=Number(d.index);return renderFeed()}
 if(d.open){index=list().findIndex(x=>x.id===d.open);return go("feed")}
 if(d.like){toggle("likes",d.like);b.setAttribute("aria-pressed",String(state.likes.includes(d.like)));$("reaction").textContent=state.likes.includes(d.like)?"Вам нравится этот образ.":"Оцените образ — это ваш личный сигнал.";return}
 if(d.save){toggle("saved",d.save);$("saved-count").textContent=state.saved.length;if(page==="feed")b.setAttribute("aria-pressed",String(state.saved.includes(d.save)));else renderSaved();return}
 if(d.share){const item=product(d.share);try{if(navigator.share)await navigator.share({title:item.name,url:url(item)});else await navigator.clipboard.writeText(url(item));$("share-status").textContent="Ссылка готова для отправки."}catch(err){if(err.name!=="AbortError")$("share-status").textContent="Поделитесь ссылкой через карточку товара."}return}
 if(d.choose){if(p.chosen!==d.choose){p.chosen=d.choose;p.wardrobe=false;invalidate(p);persist()}return go("plan")}
 if(b.id==="set-date"){const v=$("event-date").value;if(!validDate(v)){$("date-error").textContent="Выберите сегодняшнюю или будущую дату.";return}if(p.date!==v||!p.dateSet)invalidate(p);p.date=v;p.dateSet=true}
 else if(b.id==="unknown-date"){if(p.date||!p.dateSet)invalidate(p);p.date="";p.dateSet=true}
 else if(b.id==="confirm-wardrobe"){if(!p.chosen)return;p.wardrobe=true}
 else if(b.id==="confirm-summary"){if(!p.wardrobe||!p.dateSet)return;p.summary=true}
 else if(b.id==="copy-summary"){const item=product(p.chosen);const str="ATELIER 23 · "+events[state.event]+"\nДата: "+(p.date||"уточнить")+"\nОбраз: "+item.name+"\nУже есть: "+item.parts.filter(x=>p.owned.includes(x)).map(x=>parts[x]).join(", ")+"\nНужно обсудить: "+item.parts.filter(x=>!p.owned.includes(x)).map(x=>parts[x]).join(", ")+"\n"+url(item);try{await navigator.clipboard.writeText(str);$("copy-status").textContent="Запрос скопирован."}catch{$("copy-status").textContent="Копирование недоступно. Используйте данные плана."}return}
 else if(b.id==="reset-plan"){if(!window.confirm("Сбросить план этого события? Избранное сохранится."))return;state.plans[state.event]=blank();persist();return go("plan")}
 else return;
 persist();renderPlan();
});
document.addEventListener("change",e=>{
 const el=e.target,p=plan(),id=el.dataset.own;
 if(id&&Object.hasOwn(parts,id)){p.owned=el.checked?[...new Set([...p.owned,id])]:p.owned.filter(x=>x!==id);p.wardrobe=false;invalidate(p);persist();renderPlan();$("plan-body").querySelector('[data-own="'+id+'"]')?.focus()}
 if(el.id==="visited"&&p.summary){p.visited=el.checked;persist();renderPlan();$("visited")?.focus()}
});
const v=$("film"),fallback=$("film-fallback");v.addEventListener("error",()=>fallback.hidden=false);v.querySelector("source").addEventListener("error",()=>fallback.hidden=false);
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
if("IntersectionObserver" in window&&!reduced.matches){let started=false;const io=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&page==="home"&&!started&&!reduced.matches){started=true;io.disconnect();v.play().catch(()=>{})}},{threshold:.4});io.observe(v)}
reduced.addEventListener?.("change",e=>{if(e.matches)v.pause()});
go("home",false);