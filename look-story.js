/* Merdo x BitOS editorial look story.
   The entire story uses the SAME illustration, never fake product imagery or stock. */
(function(){
"use strict";
const translations={
ru:{
  section:"История образа",close:"Закрыть",previous:"Назад",next:"Дальше",
  pick:"Собрать под себя",open:"С чем носить?",counter:"из 3",
  frame1:"Посмотри на образ целиком",frame1p:"Сначала оцени сочетание цветов и силуэт. Так начинается подбор, а не продажа случайной вещи.",
  frame2:"Рассмотри детали",frame2p:"Это увеличенный фрагмент той же фотографии. Посмотри на пропорции и линии. Реальную посадку проверяют при примерке.",
  frame3:"Из чего складывается образ",frame3p:"Соберём согласованный комплект, а не список разрозненных вещей.",
  upper:"Верх",lower:"Брюки / низ",shoes:"Обувь",extras:"Детали",
  upperMan:"Пиджак или подходящий верх",upperWoman:"Жакет или подходящий верх",
  lowerText:"Форма и цвет в сочетании с верхом",shoesText:"С учётом назначения и комфорта",extrasText:"Ремень, носки и аксессуары",
  disclaimer:"Фото иллюстративное. Показанные сочетания — идеи, а не товары Merdo. Наличие и цены не подтверждены.",
  step1:"Общий вид",step2:"Ближе",step3:"Комплект"
},
tr:{
  section:"Kombin hikâyesi",close:"Kapat",previous:"Geri",next:"Devam",
  pick:"Kendime göre oluştur",open:"Ne ile kombinlenir?",counter:"/ 3",
  frame1:"Önce bütünü gör",frame1p:"Renk uyumunu ve silueti incele. Önce ihtiyacı anlayalım; tek bir ürün satmaya çalışmayalım.",
  frame2:"Detaylara yaklaş",frame2p:"Aynı fotoğrafın yakın planı. Oranlara dikkat et. Gerçek kalıp yalnızca prova ile anlaşılır.",
  frame3:"Kombini birlikte tamamla",frame3p:"Rastgele ürünler değil, birbirine uyumlu bir kombin planlayalım.",
  upper:"Üst",lower:"Pantolon / alt",shoes:"Ayakkabı",extras:"Detaylar",
  upperMan:"Ceket veya uygun üst",upperWoman:"Blazer veya uygun üst",
  lowerText:"Üstle uyumlu kesim ve renk",shoesText:"Kullanım amacı ve rahatlığa göre",extrasText:"Kemer, çorap ve aksesuarlar",
  disclaimer:"Görsel temsili. Kombinler fikir amaçlıdır; gerçek Merdo ürünleri, fiyatları veya stokları değildir.",
  step1:"Görünüm",step2:"Yakından",step3:"Kombin"
}
};
const t=key=>(translations[document.documentElement.lang==="ru"?"ru":"tr"])[key];
const esc=value=>String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const overlay=document.createElement("div");
overlay.className="lookStoryOverlay";
overlay.id="lookStoryOverlay";
overlay.hidden=true;
overlay.innerHTML='<div class="lookStoryDialog" role="dialog" aria-modal="true" aria-labelledby="lookStoryTitle"><div id="lookStoryContent"></div></div>';
document.body.appendChild(overlay);
let active=null,frame=0,trigger=null,scrollStyle="",touchX=null;
const genders={look1:"woman",look2:"man",look3:"man",look4:"woman"};
function details(){
const article=document.querySelector('[data-post="'+active+'"]');
return {
title:article?.querySelector(".lookInfo h3")?.textContent||"",
image:article?.querySelector(".visual img")?.getAttribute("src")||"",
gender:genders[active]||"man"
};
}
function render(){
if(!active)return;
const d=details(),index=frame+1;
const intro=frame===0?t("frame1"):frame===1?t("frame2"):t("frame3");
const body=frame===0?t("frame1p"):frame===1?t("frame2p"):t("frame3p");
const overlayImg='<div class="lookStoryPicture '+(frame===1?"lookStoryZoom":"")+'"><img src="'+esc(d.image)+'" alt="'+esc(d.title)+'"><span class="lookStoryPhotoNote">DEMO · EDITORIAL</span></div>';
const items=[["upper",d.gender==="woman"?"upperWoman":"upperMan"],["lower","lowerText"],["shoes","shoesText"],["extras","extrasText"]];
const breakdown='<div class="lookStoryParts">'+items.map(([name,desc])=>'<div class="lookStoryPart"><span class="lookStoryPartBullet" aria-hidden="true">✓</span><span><strong>'+t(name)+'</strong><small>'+t(desc)+'</small></span></div>').join("")+'</div>';
const interior=frame===2?breakdown:'<div class="lookStoryImageFrame">'+overlayImg+'</div>';
const steps=['step1','step2','step3'].map((k,i)=>'<span class="lookStoryPip '+(frame===i?"current":"")+'" aria-hidden="true"></span>').join("");
document.getElementById("lookStoryContent").innerHTML=
'<div class="lookStoryTop"><strong>'+t("section")+'</strong><button type="button" data-story="close" class="lookStoryClose" aria-label="'+t("close")+'">×</button></div>'+
'<div class="lookStorySteps"><div class="lookStoryPips">'+steps+'</div><span>'+index+' '+t("counter")+'</span></div>'+
'<div class="lookStoryMain">'+interior+'<div class="lookStoryExplanation"><div class="lookStoryEyebrow">'+esc(d.title)+'</div><h2 id="lookStoryTitle" tabindex="-1">'+intro+'</h2><p>'+body+'</p><p class="lookStoryDisclaimer">'+t("disclaimer")+'</p></div></div>'+
'<div class="lookStoryFooter"><button type="button" data-story="prev" class="lookStoryBack" '+(frame===0?"disabled":"")+'>'+t("previous")+'</button>'+
(frame<2?'<button type="button" data-story="next" class="lookStoryNext">'+t("next")+' →</button>':'<button type="button" data-story="compose" class="lookStoryNext">'+t("pick")+' →</button>')+'</div>';
document.getElementById("lookStoryTitle")?.focus({preventScroll:true});
}
function open(id,from){
if(!genders[id])return;
active=id;frame=0;trigger=from||document.activeElement;scrollStyle=document.body.style.overflow;
document.body.style.overflow="hidden";overlay.hidden=false;render();
}
function close(){
overlay.hidden=true;document.body.style.overflow=scrollStyle;
active=null;const b=trigger;trigger=null;if(b?.isConnected)b.focus();
}
function next(){if(frame<2){frame++;render()}}
function prev(){if(frame>0){frame--;render()}}
overlay.addEventListener("click",e=>{
if(e.target===overlay){close();return}
const b=e.target.closest("button[data-story]");if(!b)return;
switch(b.dataset.story){
case "close":close();break;
case "next":next();break;
case "prev":prev();break;
case "compose":{
const id=active;close();window.dispatchEvent(new CustomEvent("bitos:compose",{detail:{lookId:id}}));break;
}
}
});
document.addEventListener("keydown",e=>{
if(overlay.hidden)return;
if(e.key==="Escape"){e.preventDefault();close()}
if(e.key==="ArrowRight"){e.preventDefault();next()}
if(e.key==="ArrowLeft"){e.preventDefault();prev()}
if(e.key==="Tab"){
const nodes=[...overlay.querySelectorAll('button:not([disabled])')];
if(!nodes.length)return;
const first=nodes[0],last=nodes[nodes.length-1];
if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}
});
overlay.addEventListener("touchstart",e=>{touchX=e.changedTouches[0]?.clientX??null},{passive:true});
overlay.addEventListener("touchend",e=>{
if(touchX===null)return;
const end=e.changedTouches[0]?.clientX??touchX,dx=end-touchX;touchX=null;
if(Math.abs(dx)>70){if(dx<0)next();else prev()}
},{passive:true});
window.BitOSStory={open,close};
})();