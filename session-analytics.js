/* BitOS session analytics lab: NOT site-wide tracking.
 * Strict allowlist, no cookies, identity, URL, form content or network calls.
 * Current-tab sessionStorage only; users can clear. This is an inspection
 * tool for validating instrumentation prior to explicitly consented analytics.
 */
(function(){
"use strict";
const KEY="bitos:session-analytics:v1",LIMIT=150;
const EVENTS=[
 ["session_opened","Страница открыта","Sayfa açıldı"],
 ["stylist_started","Стилист запущен","Stilist başlatıldı"],
 ["step_1_completed","Цель выбрана","Amaç seçildi"],
 ["step_2_completed","Посадка выбрана","Kalıp seçildi"],
 ["step_3_completed","Бюджет указан","Bütçe seçildi"],
 ["step_4_completed","Гардероб и портной","Gardırop ve terzi"],
 ["look_viewed","Образ показан","Kombin görüntülendi"],
 ["look_details_opened","Детали образа открыты","Kombin ayrıntıları açıldı"],
 ["stylist_copy_attempted","Попытка копирования запроса","Talebi kopyalama denemesi"],
 ["stylist_copy_succeeded","Черновик скопирован","Taslak kopyalandı"],
 ["funnel_started","Демо-воронка открыта","Örnek satış akışı açıldı"],
 ["tripwire_interest","Интерес к аксессуару","Aksesuar ilgisi"],
 ["core_stage_viewed","Основной комплект показан","Ana kombin görüntülendi"],
 ["bump_stage_viewed","Предложение портного показано","Terzi teklifi görüntülendi"],
 ["bump_interest","Интерес к дополнительному портному","Ek terzi ilgisi"],
 ["oto_stage_viewed","OTO-сценарий показан","OTO örneği görüntülendi"],
 ["oto_interest","Интерес ко второму образу","İkinci kombin ilgisi"],
 ["retention_stage_viewed","Повторное обращение показано","Tekrar geliş görüntülendi"],
 ["funnel_demo_completed","Демо-воронка завершена","Örnek satış akışı tamamlandı"],
 ["funnel_copy_attempted","Попытка копирования запроса в воронке","Satış akışında kopyalama denemesi"],
 ["funnel_copy_succeeded","Черновик воронки скопирован","Satış akışı taslağı kopyalandı"]
];
const allowed=new Map(EVENTS.map(([id,ru,tr])=>[id,{ru,tr}]));
const milestones=["session_opened","stylist_started","look_viewed","funnel_started","core_stage_viewed","bump_stage_viewed","oto_stage_viewed","retention_stage_viewed","funnel_demo_completed"];
const T={
ru:{label:"Диагностика воронки",intro:"События только этой вкладки. Это проверка механики, а не аналитика посетителей магазина.",notice:"Ничего не отправляется на сервер: без ID, контактов, сумм, UTM и персональных данных. Нет расчёта настоящей конверсии или продаж.",progress:"Пройденные этапы",total:"Событий в этой вкладке",completed:"Из 9 контрольных этапов",timeline:"Последние события",empty:"Событий ещё нет",copy:"Скопировать JSON событий",clear:"Очистить журнал",copied:"JSON скопирован",failed:"Буфер обмена недоступен: выделите JSON в поле ниже и скопируйте вручную.",cleared:"Локальный журнал очищен",subtle:"Частота событий здесь не отражает количество разных пользователей.",schema:"Схема v1 · локальная сессия"},
tr:{label:"Satış akışı tanılama",intro:"Yalnızca bu sekmedeki olaylar. Bu, gerçek mağaza ziyaretçi analitiği değildir.",notice:"Sunucuya veri gitmez: kimlik, iletişim, tutar, UTM veya kişisel bilgi yok. Gerçek dönüşüm ya da satış ölçülmez.",progress:"Tamamlanan aşamalar",total:"Bu sekmedeki olay",completed:"9 kontrol aşamasından",timeline:"Son olaylar",empty:"Henüz olay yok",copy:"Olay JSON'unu kopyala",clear:"Olay günlüğünü temizle",copied:"JSON kopyalandı",failed:"Pano kullanılamıyor: aşağıdaki JSON metnini seçip elle kopyalayın.",cleared:"Yerel olay günlüğü silindi",subtle:"Olay sayıları farklı ziyaretçi sayısını göstermez.",schema:"Şema v1 · yerel oturum"}
};
const lang=()=>document.documentElement.lang==="tr"?"tr":"ru";
const t=k=>T[lang()][k];
const label=id=>allowed.get(id)?.[lang()]||id;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let entries=[],message="",storageAvailable=true;
try{
 const raw=JSON.parse(sessionStorage.getItem(KEY)||"null");
 if(Array.isArray(raw))entries=raw.filter(x=>x&&allowed.has(x.event)&&Number.isSafeInteger(x.time)&&x.time>0&&x.time<4102444800000).slice(-LIMIT).map(x=>({event:x.event,time:x.time}));
}catch(e){storageAvailable=false}
function save(){
 try{sessionStorage.setItem(KEY,JSON.stringify(entries));storageAvailable=true}
 catch(e){storageAvailable=false}
}
function record(event){
 if(!allowed.has(event))return false;
 entries.push({event,time:Date.now()});
 if(entries.length>LIMIT)entries=entries.slice(-LIMIT);
 save();message="";render();
 return true;
}
function data(){return entries.map(x=>({event:x.event,time:x.time}))}
function json(){return JSON.stringify({schema:"bitos-session-analytics-v1",scope:"single-tab",hasRealConversions:false,events:data()},null,2)}
function render(){
 const host=document.getElementById("bitosAnalytics");if(!host)return;
 const seen=new Set(entries.map(x=>x.event)),finished=milestones.filter(x=>seen.has(x)).length;
 const rows=entries.slice(-12).reverse().map(x=>'<li><span>'+escape(label(x.event))+'</span><time>'+new Date(x.time).toLocaleTimeString(lang()==="tr"?"tr-TR":"ru-RU",{hour:"2-digit",minute:"2-digit",second:"2-digit"})+'</time></li>').join("");
 host.innerHTML='<section class="analyticsInner"><span class="grok-overline">'+t("schema")+'</span>'+
 '<p class="analyticsIntro">'+t("intro")+'</p><p class="analyticsPrivacy">'+t("notice")+'</p>'+
 '<div class="analyticsStats"><div><span>'+t("total")+'</span><strong>'+entries.length+'</strong></div><div><span>'+t("completed")+'</span><strong>'+finished+'/9</strong></div></div>'+
 '<h3>'+t("progress")+'</h3><ol class="analyticsSteps">'+milestones.map(id=>'<li class="'+(seen.has(id)?"passed":"")+'"><span aria-hidden="true">'+(seen.has(id)?"✓":"○")+'</span>'+escape(label(id))+'</li>').join("")+'</ol>'+
 '<h3>'+t("timeline")+'</h3><ol class="analyticsTimeline">'+(rows||'<li>'+t("empty")+'</li>')+'</ol>'+
 '<p class="analyticsTip">'+t("subtle")+'</p><div class="analyticsActions"><button type="button" data-analytics-action="copy">'+t("copy")+'</button><button type="button" data-analytics-action="clear">'+t("clear")+'</button></div>'+
 '<p class="analyticsFeedback" role="status" aria-live="polite">'+escape(message)+'</p><textarea id="analyticsFallback" readonly hidden aria-label="JSON"></textarea></section>';
}
document.addEventListener("click",async e=>{
 const b=e.target.closest("#bitosAnalytics [data-analytics-action]");
 if(!b)return;
 if(b.dataset.analyticsAction==="clear"){
  entries=[];message=t("cleared");try{sessionStorage.removeItem(KEY)}catch(e){}render();return;
 }
 if(b.dataset.analyticsAction==="copy"){
  const txt=json();
  try{if(!navigator.clipboard?.writeText)throw Error("Clipboard not available");await navigator.clipboard.writeText(txt);message=t("copied");render()}
  catch(e){
   message=t("failed");render();const input=document.getElementById("analyticsFallback");
   if(input){input.hidden=false;input.value=txt;input.focus();input.select()}
  }
 }
});
window.BitOSAnalytics=Object.freeze({record,render,getEvents:data,getMilestones:()=>milestones.map(id=>({event:id,seen:entries.some(x=>x.event===id)})),exportJSON:json,reset:()=>{entries=[];try{sessionStorage.removeItem(KEY)}catch(e){}render()}});
if(!entries.some(x=>x.event==="session_opened"))record("session_opened");
})();