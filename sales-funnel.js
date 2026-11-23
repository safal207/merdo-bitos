/* Merdo × BitOS sales funnel demonstration.
 * No live catalog, checkout, payment, booking, contact capture, CRM, or network analytics.
 * Its labels show marketing hypotheses, not real offers from Merdo.
 */
(function(){
"use strict";
const STEPS=["tripwire","core","bump","oto","retention"];
const tailorPrices={hem:400,sleeve:650,waist:500};
const dict={
ru:{
badge:"BITOS / SALES FLOW LAB",headline:"Как образ превращается в продажу",teaser:"Посмотри путь от бесплатного подбора до заявки, дополнительных предложений и возвращения клиента. Это только демонстрация механики продаж.",
start:"Показать воронку продаж",warning:"ДЕМО: нет реального заказа, оплаты, записи, скидки, наличия товаров или отправки заявки.",
free:"Бесплатный подбор уже готов",price:"К докупке (условно)",reserve:"Остаток бюджета",tailor:"Портной отдельно",extra:"Дополнительная подгонка",noBump:"Без дополнительной подгонки",included:"Уже учтено в анкете",after:"Гипотеза: предложение после будущей покупки",currency:"Цены и услуги условные, не подтверждены Merdo.",
steps:["Первая покупка","Основной комплект","Портной","После покупки","Возвращение"],
stepInfo:["Tripwire","Core offer","Order bump","OTO / cross-sell","Retention"],
tripwireTitle:"Небольшой первый шаг",tripwireText:"Воронка ClickFunnels может начинаться с небольшого доступного аксессуара. Пока это идея для согласования с Merdo, а не товар или платёж.",
tripwireYes:"Показать подходящий аксессуар",tripwireNo:"Сразу к полному образу",tripwireChosen:"В запрос включим вопрос о недорогом аксессуаре. Его цена не прибавляется к смете.",
coreTitle:"Главное предложение — собранный образ",coreText:"Основной комплект уже рассчитан стилистом, но реальные артикулы, размеры и остатки ещё нужно подтвердить. Вместо оплаты предлагаем скопировать черновик запроса.",
coreTotal:"План покупок из анкеты",request:"Черновик запроса",copy:"Скопировать запрос",copied:"Текст скопирован",copyFallback:"Автокопирование недоступно. Выдели текст и скопируй вручную.",coreNext:"Перейти к дополнительной услуге",
bumpTitle:"Дополнить заказ услугой Perfect Fit",bumpText:"Order bump — необязательная услуга. Портной не входит в бюджет на одежду. Можно выбрать только одну дополнительную услугу в этой демонстрации.",
bumpZero:"Ничего не добавлять",hem:"Укоротить брюки",sleeve:"Укоротить рукава",waist:"Подогнать талию",bumpTotal:"Портной с дополнением",bumpNext:"Посмотреть OTO-сценарий",
otoTitle:"Что предложить после реальной покупки?",otoText:"OTO обычно появляется после фактической покупки. Здесь мы только моделируем будущий сценарий — никакой покупки не было.",
otoYes:"Интересен второй образ из существующих вещей",otoNo:"Пока без дополнительных образов",otoChosen:"В финальном запросе можно уточнить, есть ли подходящий второй образ. Цены не меняются.",otoNext:"Посмотреть возвращение клиента",
retTitle:"Возвращение без навязчивости",retText:"Следующее обращение должно учитывать уже купленные вещи. Реальные уведомления возможны только при согласии клиента; здесь ничего не собираем и не отправляем.",
retDraft:"Итоговый черновик для копирования",retFollow:"В будущем можно предложить новую комбинацию с имеющимися вещами — только по запросу клиента.",
done:"Демонстрационный путь завершён",doneText:"Показан маркетинговый сценарий, а не выполненная продажа. Для запуска нужны подтверждённый каталог, реальные условия услуг, система заявок, согласия и аналитика.",
next:"Дальше",back:"Назад",close:"Свернуть",reset:"Пройти снова",progress:"Этап",addOnQuestion:"Спросить о подходящем аксессуаре",secondLookQuestion:"Показать альтернативный комплект",notTracked:"Это только шаги текущего сценария. Реальные конверсии и выручка не измеряются."
},
tr:{
badge:"BITOS / SATIŞ AKIŞI LAB",headline:"Kombinden satışa uzanan yol",teaser:"Ücretsiz stil önerisinden bilgi talebine, ek tekliflere ve geri dönüşe kadar örnek bir akış. Yalnızca satış mekaniği demosudur.",
start:"Satış akışını göster",warning:"DEMO: gerçek sipariş, ödeme, randevu, indirim, stok veya mesaj gönderimi yok.",
free:"Ücretsiz kombin hazır",price:"Alınacak (örnek)",reserve:"Bütçe bakiyesi",tailor:"Terzi ayrı",extra:"Ek tadilat",noBump:"Ek tadilat yok",included:"Ankette zaten seçildi",after:"Gelecekteki alışveriş sonrasına yönelik fikir",currency:"Ücretler ve hizmetler kurgusaldır; Merdo tarafından doğrulanmamıştır.",
steps:["İlk alışveriş","Ana kombin","Terzi","Alışveriş sonrası","Tekrar geliş"],
stepInfo:["Tripwire","Core offer","Order bump","OTO / cross-sell","Retention"],
tripwireTitle:"Küçük bir ilk adım",tripwireText:"Bir satış akışı küçük bir aksesuar önerisiyle başlayabilir. Henüz Merdo tarafından onaylanmış bir ürün veya ödeme değildir.",
tripwireYes:"Uygun bir aksesuar sor",tripwireNo:"Doğrudan kombine geç",tripwireChosen:"Talep taslağına uygun fiyatlı aksesuar sorusu eklenir. Örnek bütçeye eklenmez.",
coreTitle:"Ana teklif — tam kombin",coreText:"Stilist örnek bütçeyi hesapladı fakat gerçek ürün kodları, bedenler ve stok onaylanmadı. Ödeme yerine talep metnini kopyalayabilirsiniz.",
coreTotal:"Kombinin örnek toplamı",request:"Talep taslağı",copy:"Talebi kopyala",copied:"Metin kopyalandı",copyFallback:"Otomatik kopyalama mümkün değil. Metni seçip elle kopyalayın.",coreNext:"Ek hizmeti incele",
bumpTitle:"Perfect Fit ek hizmeti",bumpText:"Order bump isteğe bağlı ek bir hizmettir. Terzi, giyim bütçesine dahil değildir. Bu demoda bir ek seçenek seçebilirsiniz.",
bumpZero:"Eklemek istemiyorum",hem:"Paça kısaltma",sleeve:"Kol kısaltma",waist:"Bel ayarı",bumpTotal:"Ek hizmetle terzi toplamı",bumpNext:"OTO örneğini gör",
otoTitle:"Gerçek satın alma sonrası ne önerilebilir?",otoText:"OTO ancak gerçek bir satın almadan sonra sunulabilir. Burada yalnızca olası bir gelecek akışını canlandırıyoruz; alışveriş yapılmadı.",
otoYes:"Mevcut parçalarımla ikinci bir kombin ilgimi çeker",otoNo:"Şimdilik ikinci kombin istemiyorum",otoChosen:"Son talepte ikinci kombin olasılığı sorulabilir. Örnek ücretler değişmez.",otoNext:"Tekrar alışveriş akışı",
retTitle:"Rahatsız etmeden tekrar alışveriş",retText:"Yeni öneriler önceden alınmış kıyafetleri dikkate almalı. Bildirimler yalnızca müşterinin izniyle olabilir; burada veri toplanmaz veya gönderilmez.",
retDraft:"Kopyalanabilir son talep",retFollow:"Gelecekte, sadece müşteri isterse mevcut kıyafetleriyle yeni kombinler önerebiliriz.",
done:"Örnek müşteri yolculuğu tamamlandı",doneText:"Bu bir satış değildir. Gerçek lansman için doğrulanmış stok, onaylı hizmet şartları, CRM, izin ve analitik gerekir.",
next:"İleri",back:"Geri",close:"Kapat",reset:"Yeniden başla",progress:"Aşama",addOnQuestion:"Uygun bir aksesuar sor",secondLookQuestion:"İkinci kombin alternatifini sor",notTracked:"Yalnızca bu demodaki adımlar gösterilir. Gerçek dönüşüm veya ciro ölçülmez."
}};
let stage=0,tripwire=false,bump="",oto=false,copied="";
const getLang=()=>document.documentElement.lang==="tr"?"tr":"ru";
const L=k=>dict[getLang()][k]??k;
const model=()=>window.BitOSGrok?.getState?.();
const getQuote=()=>window.BitOSGrok?.getQuote?.();
const fmt=n=>new Intl.NumberFormat(getLang()==="tr"?"tr-TR":"ru-RU",{maximumFractionDigits:0}).format(n)+" ₺";
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function draft(){
 const base=window.BitOSGrok?.getDraft?.()||"";
 const notes=[];
 if(tripwire)notes.push(L("addOnQuestion"));
 if(bump)notes.push(L(bump));
 if(oto)notes.push(L("secondLookQuestion"));
 return base+(notes.length?"\n\n"+(getLang()==="ru"?"Дополнительные вопросы (не заказ): ":"Ek sorular (sipariş değildir): ")+notes.join("; ")+".":"");
}
function selectedButtons(items,value,action){
 return '<div class="funnelChoices">'+items.map(({id,title,note,disabled})=>'<button type="button" data-funnel-action="'+action+'" data-value="'+id+'" aria-pressed="'+String(value===id)+'" '+(disabled?"disabled":"")+'><span>'+safe(title)+'</span>'+(note?'<small>'+safe(note)+'</small>':"")+'</button>').join("")+'</div>';
}
function copyArea(){
 return '<div class="funnelDraftWrap"><label for="funnelDraft">'+L("request")+'</label><textarea id="funnelDraft" class="funnelDraft" readonly rows="6">'+safe(draft())+'</textarea><button type="button" data-funnel-action="copy" class="grok-secondary">'+L("copy")+'</button><p class="funnelCopyStatus" role="status">'+safe(copied)+'</p></div>';
}
function stepContent(q,s){
 switch(stage){
 case 1:
 return '<h3>'+L("tripwireTitle")+'</h3><p>'+L("tripwireText")+'</p>'+selectedButtons([
 {id:"yes",title:L("tripwireYes")},{id:"no",title:L("tripwireNo")}
 ],tripwire?"yes":"no","tripwire")+(tripwire?'<p class="funnelSelected">'+L("tripwireChosen")+'</p>':"");
 case 2:
 return '<h3>'+L("coreTitle")+'</h3><p>'+L("coreText")+'</p><dl class="funnelTotals"><div><dt>'+L("coreTotal")+'</dt><dd>'+fmt(q.toBuy)+'</dd></div><div><dt>'+L("reserve")+'</dt><dd>'+fmt(q.reserve)+'</dd></div><div><dt>'+L("tailor")+'</dt><dd>'+fmt(q.tailor)+'</dd></div></dl>'+copyArea();
 case 3:{
 const options=[{id:"",title:L("bumpZero")}];
 for(const k of ["hem","sleeve","waist"]){
  options.push({id:k,title:L(k)+" · "+fmt(tailorPrices[k]),note:s[k]===true?L("included"):"",disabled:s[k]===true});
 }
 return '<h3>'+L("bumpTitle")+'</h3><p>'+L("bumpText")+'</p>'+selectedButtons(options,bump,"bump")+
 '<dl class="funnelTotals"><div><dt>'+L("price")+'</dt><dd>'+fmt(q.toBuy)+'</dd></div><div><dt>'+L("bumpTotal")+'</dt><dd>'+fmt(q.tailor+(bump?tailorPrices[bump]:0))+'</dd></div></dl><p class="funnelNote">'+L("currency")+'</p>';
 }
 case 4:
 return '<h3>'+L("otoTitle")+'</h3><p>'+L("otoText")+'</p>'+selectedButtons([
 {id:"yes",title:L("otoYes")},{id:"no",title:L("otoNo")}
 ],oto?"yes":"no","oto")+(oto?'<p class="funnelSelected">'+L("otoChosen")+'</p>':"");
 case 5:
 return '<h3>'+L("retTitle")+'</h3><p>'+L("retText")+'</p><p class="funnelSelected">'+L("retFollow")+'</p>'+copyArea()+'<div class="funnelDone"><strong>'+L("done")+'</strong><p>'+L("doneText")+'</p></div>';
 default:return "";
 }
}
function render(){
 const root=document.getElementById("bitosSalesFunnel");if(!root)return;
 const q=getQuote(),s=model();
 if(!q||!s){root.innerHTML="";return}
 if(bump&&s[bump]===true)bump="";
 if(stage===0){
 root.innerHTML='<section class="funnelTeaser" aria-label="'+L("headline")+'"><span class="grok-overline">'+L("badge")+'</span><h2>'+L("headline")+'</h2><p>'+L("teaser")+'</p><p class="funnelWarning">'+L("warning")+'</p><button type="button" data-funnel-action="start" class="grok-primary"><span>'+L("start")+'</span><span aria-hidden="true">→</span></button></section>';
 return;
 }
 const n=stage-1;
 root.innerHTML='<section class="funnelDemo" data-funnel-stage="'+stage+'" aria-label="'+L("headline")+'">'+
 '<div class="funnelTop"><span class="grok-overline">'+L("badge")+'</span><button type="button" class="grok-link" data-funnel-action="close">'+L("close")+'</button></div>'+
 '<p class="funnelWarning">'+L("warning")+'</p><div class="funnelStepIndex">'+L("progress")+' '+stage+' / '+STEPS.length+' · '+L("stepInfo")[n]+'</div>'+
 '<ol class="funnelProgress">'+STEPS.map((k,i)=>'<li class="'+(i===n?"active":i<n?"done":"")+'"><span>'+(i+1)+'</span><small>'+L("steps")[i]+'</small></li>').join("")+'</ol>'+
 '<div class="funnelContent">'+stepContent(q,s)+'</div><nav class="funnelNav">'+
 '<button type="button" data-funnel-action="back" class="grok-secondary">'+L("back")+'</button>'+
 (stage<5?'<button type="button" data-funnel-action="next" class="grok-primary"><span>'+L("next")+'</span><span aria-hidden="true">→</span></button>':'<button type="button" data-funnel-action="reset" class="grok-primary"><span>'+L("reset")+'</span><span aria-hidden="true">↻</span></button>')+
 '</nav><p class="funnelNote">'+L("notTracked")+'</p></section>';
}
function advance(to){
 stage=Math.max(0,Math.min(5,to));copied="";
 render();
 if(stage>0)document.querySelector("#bitosSalesFunnel .funnelDemo")?.scrollIntoView({block:"start",behavior:"auto"});
 document.querySelector('#bitosSalesFunnel [data-funnel-action="'+(stage===0?"start":"back")+'"]')?.focus({preventScroll:true});
}
document.addEventListener("click",async e=>{
 const b=e.target.closest("#bitosSalesFunnel [data-funnel-action]");
 if(!b)return;
 const op=b.dataset.funnelAction;
 if(op==="start")return advance(1);
 if(op==="close")return advance(0);
 if(op==="back")return advance(stage-1);
 if(op==="next")return advance(stage+1);
 if(op==="reset"){tripwire=false;bump="";oto=false;return advance(1)}
 if(op==="tripwire"){tripwire=b.dataset.value==="yes";render();document.querySelector('[data-funnel-action="tripwire"][data-value="'+b.dataset.value+'"]')?.focus({preventScroll:true});return}
 if(op==="bump"){
  const v=b.dataset.value;
  if(v!==""&&!Object.hasOwn(tailorPrices,v))return;
  if(v&&model()?.[v]===true)return;
  bump=v;render();document.querySelector('[data-funnel-action="bump"][data-value="'+v+'"]')?.focus({preventScroll:true});return
 }
 if(op==="oto"){oto=b.dataset.value==="yes";render();document.querySelector('[data-funnel-action="oto"][data-value="'+b.dataset.value+'"]')?.focus({preventScroll:true});return}
 if(op==="copy"){
  const area=document.getElementById("funnelDraft");if(!area)return;
  try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");await navigator.clipboard.writeText(area.value);copied=L("copied")}
  catch(error){copied=L("copyFallback");area.focus();area.select()}
  const p=document.querySelector("#bitosSalesFunnel .funnelCopyStatus");
  if(p)p.textContent=copied;
 }
});
window.BitOSSalesFunnel={render,getState:()=>({stage,tripwire,bump,oto}),getDraft:draft};
render();
})();