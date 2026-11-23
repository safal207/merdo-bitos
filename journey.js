/* BitOS Guided Look — short, honest, mobile-first consultative funnel. No orders, fake urgency, or invented inventory. */
(function(){
"use strict";
const root=document.getElementById("styleJourney");
if(!root)return;
root.setAttribute("tabindex","-1");
const initial=()=>({gender:"man",occasion:"formal",fit:"normal",budget:15000,shoe:"needed",hem:false,sleeve:false,waist:false,source:null});
let answers=initial(), step=-1, samplePref=null;
const locales={
ru:{
badge:"BitOS LOOK LAB",headline:"Не вещь. Твой образ.",sub:"Четыре коротких шага — и ты увидишь цельный комплект для своей задачи. Без сложных анкет.",begin:"Собрать мой образ",quick:"Просто • Персонально • Без обязательств",count:"шаг из 4",back:"Назад",later:"Без подгонки",next:"Посмотреть образ",custom:"Другая сумма",customGo:"Продолжить",budgetErr:"Введите бюджет от 1 000 до 1 000 000 ₺.",finish:"Образ собран!",finishSub:"Мы подобрали направление стиля и примерный бюджет по категориям. Осталось посмотреть комплект и запросить наличие.",see:"Посмотреть мой образ",edit:"Начать заново",apparel:"План на одежду",tailoring:"Дополнительно: портной",disclaimer:"Это демонстрация. Никаких реальных товаров Merdo, цен, скидок, броней или ограничений по времени мы не обещаем.",source:"Вы выбрали образ из фотоленты",gender:"Направление",man:"Мужской",woman:"Женский",genderHint:"Образ с фотографии уже учтён. При необходимости поменяйте направление.",occasionTitle:"Для чего подбираем?",occasionSub:"Начинаем, как у настоящего стилиста: сначала цель, потом вещи.",formal:"Важная встреча",formalSub:"Уверенно и строго",partners:"Общение с клиентом",partnersSub:"Деловой, но открытый",creative:"IT / свободный офис",creativeSub:"Стильно и непринуждённо",casual:"Каждый день / прогулка",casualSub:"Комфорт, обувь и сумка",fitTitle:"Как вещи сидят в плечах?",fitSub:"Уточним посадку, чтобы не навязать неподходящий крой.",normal:"Хорошо",normalSub:"Удобно в плечах",tight:"Тесно",tightSub:"Тянет в спине или плечах",loose:"Свободно",looseSub:"Плечи свисают",budgetTitle:"Сколько планируем на образ?",budgetSub:"Это ваш лимит на одежду, не цена товаров Merdo.",budgetPick:"Выберите бюджет или введите свой.",tailorTitle:"Нужна подгонка?",tailorSub:"Как у премиального консультанта: портной — отдельная, необязательная услуга.",hem:"Укоротить брюки",sleeve:"Рукава пиджака",waist:"Посадка брюк в талии",notReal:"Условные цены для демонстрации. Наличие услуги в Merdo не подтверждено.",save:"Подобрать с портным",hintDone:"Вы уже на последнем шаге."
},
tr:{
badge:"BitOS LOOK LAB",headline:"Tek ürün değil. Tam kombin.",sub:"Dört kısa adımda ihtiyacınıza göre bütün bir görünüm hazırlayalım. Uzun formlar yok.",begin:"Kombinimi oluştur",quick:"Kolay • Kişisel • Bağlayıcı değil",count:"/ 4. adım",back:"Geri",later:"Terzisiz devam",next:"Kombinimi gör",custom:"Farklı tutar",customGo:"Devam et",budgetErr:"1.000 ile 1.000.000 ₺ arasında bir bütçe girin.",finish:"Kombininiz hazır!",finishSub:"Stil yönünü ve kategori bütçe planını hazırladık. Şimdi kombin önerilerini ve stok sorgusu taslağını görün.",see:"Kombinimi incele",edit:"Baştan başla",apparel:"Giyim bütçesi",tailoring:"Ekstra: terzi",disclaimer:"Bağımsız demo. Gerçek Merdo ürünleri, fiyatları, indirimleri, randevuları veya süreli teklifler değildir.",source:"Akıştaki görünümünüz",gender:"Stil yönü",man:"Erkek",woman:"Kadın",genderHint:"Fotoğraftaki yön seçildi. Dilerseniz değiştirebilirsiniz.",occasionTitle:"Hangi fırsat için?",occasionSub:"Gerçek stilist gibi başlıyoruz: önce amaç, sonra kıyafet.",formal:"Önemli toplantı",formalSub:"Güven veren klasik",partners:"Müşteri görüşmesi",partnersSub:"Profesyonel ve samimi",creative:"IT / rahat ofis",creativeSub:"Özgün ve rahat",casual:"Günlük / şehir",casualSub:"Rahatlık, ayakkabı ve çanta",fitTitle:"Üst kıyafetlerin omuzları nasıl oturur?",fitSub:"Vücut yapınıza uygun kalıbı bulalım.",normal:"Rahat",normalSub:"Omuzlar yerinde",tight:"Dar",tightSub:"Sırtı veya omzu sıkar",loose:"Bol",looseSub:"Omuzlar düşer",budgetTitle:"Kombin bütçeniz ne kadar?",budgetSub:"Bu giyim için hedef bütçedir, Merdo ürün fiyatı değildir.",budgetPick:"Bütçe seçin veya kendi tutarınızı yazın.",tailorTitle:"Terzi ayarı ister misiniz?",tailorSub:"Premium hizmette olduğu gibi terzi işlemleri ayrı ve tamamen isteğe bağlıdır.",hem:"Pantolon paçası",sleeve:"Ceket kolu",waist:"Pantolon beli",notReal:"Tutarlar örnektir. Merdo'nun terzi hizmeti doğrulanmamıştır.",save:"Terziyle kombin oluştur",hintDone:"Son adımdasınız."
}};
const money=n=>new Intl.NumberFormat(document.documentElement.lang==="ru"?"ru-RU":"tr-TR",{maximumFractionDigits:0}).format(n)+" ₺";
const tr=k=>locales[document.documentElement.lang==="ru"?"ru":"tr"][k];
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const options=[["formal","briefcase-business"],["partners","handshake"],["creative","sparkles"]];
const icons={formal:"◆",partners:"◈",creative:"✦",casual:"◉",normal:"✓",tight:"↔",loose:"◇"};
const costs={hem:400,sleeve:650,waist:500};
function priceExtra(){return Object.keys(costs).reduce((v,k)=>v+(answers[k]?costs[k]:0),0)}
function progress(){
const n=Math.max(0,Math.min(step,4)),pct=n*25;
return '<div class="journeyProgress" aria-label="progress"><span class="journeyBar" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="'+n+'"><i style="width:'+pct+'%"></i></span><strong>'+(step===4?"✓":step+1+" "+tr("count"))+'</strong></div>'
}
function option(key,desc){
return '<button type="button" class="journeyChoice" data-option="'+key+'"><span class="journeyIcon" aria-hidden="true">'+icons[key]+'</span><span class="journeyChoiceCopy"><strong>'+safe(tr(key))+'</strong><small>'+safe(tr(desc))+'</small></span><span class="journeyChevron" aria-hidden="true">›</span></button>'
}
function chip(key,group){
return '<button type="button" class="journeyChip '+(answers[group]===key?"selected":"")+'" data-'+group+'="'+key+'" aria-pressed="'+String(answers[group]===key)+'">'+safe(tr(key))+'</button>'
}
function render(){
const p=progress();
const ownedCount=window.BitOSWardrobe?.getCount?.()||0;
const wardrobeNote=ownedCount?(document.documentElement.lang==="ru"?"Учтём ваши вещи: "+ownedCount+" из 5 категорий.":"Dolabınızdaki "+ownedCount+" / 5 kategoriyi dikkate alacağız."):"";
let body="";
if(step===-1){
body='<div class="journeyWelcome"><span class="journeyMini">'+tr("quick")+'</span><h2 id="journeyTitle">'+tr("headline")+'</h2><p>'+tr("sub")+'</p><button class="journeyMain" type="button" data-action="start">'+tr("begin")+' <span aria-hidden="true">→</span></button></div>';
}else if(step===0){
body='<h2 id="journeyTitle">'+tr("occasionTitle")+'</h2><p class="journeyQuestion">'+tr("occasionSub")+'</p><div class="journeyChoices">'+option("formal","formalSub")+option("partners","partnersSub")+option("creative","creativeSub")+option("casual","casualSub")+'</div>';
}else if(step===1){
body='<h2 id="journeyTitle">'+tr("fitTitle")+'</h2><p class="journeyQuestion">'+tr("fitSub")+'</p><div class="journeyChoices">'+option("normal","normalSub")+option("tight","tightSub")+option("loose","looseSub")+'</div>';
}else if(step===2){
body='<h2 id="journeyTitle">'+tr("budgetTitle")+'</h2><p class="journeyQuestion">'+tr("budgetSub")+'</p><div class="journeyBudgets">'+[5000,15000,25000].map(v=>'<button type="button" data-budget="'+v+'" class="journeyBudget">'+money(v)+' <span>→</span></button>').join("")+'</div><label class="journeyCustom" for="journeyBudgetCustom">'+tr("custom")+'</label><div class="journeyCustomRow"><input id="journeyBudgetCustom" inputmode="numeric" type="number" min="1000" max="1000000" step="500" value="'+answers.budget+'"><button type="button" data-action="custom">'+tr("customGo")+' →</button></div><p class="journeyError" id="journeyError" role="alert" hidden></p>';
}else if(step===3){
body='<h2 id="journeyTitle">'+tr("tailorTitle")+'</h2><p class="journeyQuestion">'+tr("tailorSub")+'</p><div class="journeyTailors">'+Object.keys(costs).map(k=>'<label class="journeyTailor '+(answers[k]?"active":"")+'"><input type="checkbox" name="journey-'+k+'" '+(answers[k]?"checked":"")+'><span>'+tr(k)+'</span><b>+'+money(costs[k])+'</b></label>').join("")+'</div><div class="journeyEstimate"><span>'+tr("tailoring")+'</span><strong>'+money(priceExtra())+'</strong></div><p class="journeyFine">'+tr("notReal")+'</p><button class="journeyMain" type="button" data-action="finish">'+tr("next")+' →</button><button class="journeyLink" type="button" data-action="skip">'+tr("later")+'</button>';
}else{
const preview=window.BitOSLookPreview?.render(answers)||"";
body='<div class="journeySuccess"><div class="journeySeal" aria-hidden="true">✓</div><h2 id="journeyTitle">'+tr("finish")+'</h2><p>'+tr("finishSub")+'</p>'+(wardrobeNote?'<p class="journeyOwnedNote">✓ '+wardrobeNote+'</p>':"")+preview+'<div class="journeyReceipt"><div><span>'+tr("apparel")+'</span><b>'+money(answers.budget)+'</b></div><div><span>'+tr("tailoring")+'</span><b>+'+money(priceExtra())+'</b></div></div><button class="journeyMain" data-action="reveal" type="button">'+tr("see")+' →</button><button class="journeyLink" data-action="restart" type="button">'+tr("edit")+'</button></div>';
}
const lookName=answers.source?(document.querySelector('[data-post="'+answers.source+'"] h3')?.textContent||answers.source):"";
const source=answers.source?'<div class="journeySource">'+tr("source")+' · '+safe(lookName)+'</div>':"";
const sampleNote=samplePref?'<div class="journeySource">'+(document.documentElement.lang==="ru"?"Выбрано тестовых карточек: ":"Seçilen örnek kart: ")+samplePref.count+" · "+(document.documentElement.lang==="ru"?"Условная сумма: ":"Örnek toplam: ")+money(samplePref.budget)+" · DEMO</div>":"";
const gender=step>=0&&step<4?'<div class="journeyGender"><span>'+tr("gender")+'</span><div>'+chip("man","gender")+chip("woman","gender")+'</div></div>':"";
root.innerHTML='<div class="journeyShell"><div class="journeyHead"><span class="journeyBrand">'+tr("badge")+'</span>'+p+'</div>'+source+sampleNote+
gender+'<div class="journeyContent" aria-live="polite">'+body+'</div>'+
(step>=0&&step<4?'<div class="journeyFooter"><button type="button" class="journeyBack" data-action="back">← '+tr("back")+'</button><span>'+tr("quick")+'</span></div>':"")+
'<div class="journeyDisclaimer">'+tr("disclaimer")+'</div></div>';
}
function focusTitle(){root.querySelector("#journeyTitle")?.setAttribute("tabindex","-1");root.querySelector("#journeyTitle")?.focus({preventScroll:true})}
function move(n){step=n;render();root.scrollIntoView({behavior:"auto",block:"start"});focusTitle()}
function finish(){
if(window.BitOSStylist?.applyPreferences){
window.BitOSStylist.applyPreferences(answers);
}
move(4)
}
function reset(){samplePref=null;answers=initial();document.getElementById("stylist")?.classList.remove("show-result","expanded");move(-1)}
function reveal(){
if(window.BitOSStylist?.showResult){
window.BitOSStylist.showResult();
}else{
document.getElementById("stylist")?.scrollIntoView({behavior:"smooth"});
}
}
root.addEventListener("click",e=>{
const el=e.target.closest("button");if(!el||!root.contains(el))return;
const action=el.dataset.action;
if(action==="start"){move(0);return}
if(action==="back"){move(Math.max(-1,step-1));return}
if(action==="restart"){reset();return}
if(action==="finish"){finish();return}
if(action==="skip"){answers.hem=false;answers.sleeve=false;answers.waist=false;finish();return}
if(action==="reveal"){reveal();return}
if(action==="custom"){const input=root.querySelector("#journeyBudgetCustom");const v=Number(input?.value);if(!Number.isFinite(v)||!Number.isInteger(v)||v<1000||v>1000000){const err=root.querySelector("#journeyError");err.hidden=false;err.textContent=tr("budgetErr");input?.focus();return;}answers.budget=v;move(3);return}
if(el.dataset.option){if(step===0)answers.occasion=el.dataset.option;if(step===1)answers.fit=el.dataset.option;move(step+1);return}
if(el.dataset.budget){answers.budget=Number(el.dataset.budget);move(3);return}
if(el.dataset.gender){answers.gender=el.dataset.gender;render();return}
});
root.addEventListener("change",e=>{
const input=e.target;
if(input.matches('input[type="checkbox"][name^="journey-"]')){
const k=input.name.slice(8);
if(!(k in costs))return;
answers[k]=input.checked;
input.closest(".journeyTailor")?.classList.toggle("active",input.checked);
root.querySelector(".journeyEstimate strong").textContent=money(priceExtra());
}
});
window.BitOSJourney={
startFromSamples(p){
 const budget=Number(p?.budget), count=Number(p?.count);
 if(!Number.isFinite(budget)||budget<1000||!Number.isInteger(count)||count<1)return;
 samplePref={budget:Math.round(budget),count};
 answers=initial();
 answers.gender=p.gender==="woman"?"woman":"man";
 answers.budget=Math.max(1000,Math.min(1000000,Math.round(budget)));
 document.getElementById("stylist")?.classList.remove("show-result","expanded");
 move(0);
 root.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
},
startFromLook(id){
samplePref=null;
document.getElementById("stylist")?.classList.remove("show-result","expanded");
answers=initial();
answers.source=id;
answers.gender=(id==="look1"||id==="look4")?"woman":"man";
move(0);
root.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
},
start(){
samplePref=null;
answers=initial();document.getElementById("stylist")?.classList.remove("show-result","expanded");move(0);root.scrollIntoView({behavior:"smooth",block:"start"})
}
};
document.getElementById("language")?.addEventListener("click",render);
render();
})();
