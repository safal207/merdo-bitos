/* BitOS Personal Stylist and Perfect Fit — conceptual demo, no inventory or orders */
(function(){
"use strict";
const root=document.getElementById("stylist");
if(!root)return;
root.setAttribute("tabindex","-1");
const $=(id)=>document.getElementById(id);
const initial={gender:"man",occasion:"formal",fit:"normal",pants:"straight",shoe:"needed",budget:15000,hem:true,sleeve:false,waist:false,source:null};
const state={...initial};
const demoPrices={hem:400,sleeve:650,waist:500}; // hypothetical TRY prices, NOT Merdo quotes
const names={
tr:{topTitle:"Kombini sana özel hazırlayalım",topText:"JamilCo'daki kişisel satış yaklaşımından ilham alan konsept: Önce ihtiyacı anla, sonra bütçene ve vücut yapına göre kombin oluştur, gerekirse ayrı ücretli terzi hizmetini değerlendir.",formTitle:"Önce sizi tanıyalım",resultTitle:"Önerilen görünüm",from:"İlham aldığınız görünüm",intro:"Bu örnek öneri, gerçek Merdo stoğu veya fiyatlandırması değildir.",gender:"Stil yönü",man:"Erkek",woman:"Kadın",occasion:"Nereye giyeceksiniz?",formal:"Resmî toplantı",partners:"Müşteri / iş ortağı",creative:"Yaratıcı / IT ortamı",fit:"Ceket omuzda nasıl oturuyor?",normal:"Rahat",tight:"Dar",loose:"Bol",pants:"Pantolon kalıbı",straight:"Düz",tapered:"Daralan",relaxed:"Rahat",shoe:"Ayakkabınız var mı?",needed:"Yeni ayakkabı gerekli",have:"Uygun ayakkabım var",budget:"Kıyafet bütçesi (₺)",budgetHelp:"Kategori tutarları hedef bütçe dağılımıdır, ürün fiyatı veya teklif değildir.",tailor:"Perfect Fit · Terzi hizmetleri",tailorText:"Ayrı ücretli, opsiyonel hizmet örnekleri. Mağazanın terzi hizmeti sunduğu doğrulanmadı.",hem:"Pantolon paçası kısaltma",sleeve:"Ceket kolu kısaltma",waist:"Pantolon beli ayarlama",budgetLabel:"Kıyafet bütçesi",tailorLabel:"Tahmini terzi hizmeti",total:"Toplam planlanan tutar",reserve:"Kalan pay",fitTitle:"Prova kontrolü",fitNormal:"Omuz dikişi doğru hizada mı? Ceketi ilikleyince çekme oluyor mu? Kollarınızı rahatça hareket ettirebiliyor musunuz?",fitTight:"Omuz ve sırt kalıbını kontrol edin. Dar ceket yalnızca bir beden büyütülerek her zaman düzeltilemez.",fitLoose:"Omuz çizgisi düşüyorsa farklı kalıp deneyin. Bel daraltması omuz kusurunu tek başına çözmez.",draftTitle:"Mağazaya soru taslağı",draftIntro:"Rezervasyon veya mesaj gönderilmez. Metni kopyalayıp mağazaya kendiniz iletebilirsiniz.",copy:"Mesajı kopyala",copied:"Metin kopyalandı",copyFailed:"Kopyalama mümkün değil; metni seçip kopyalayabilirsiniz.",reset:"Seçimi sıfırla",note:"Demo: fiyatlar örnektir, stok, terzi ve randevu entegrasyonu bulunmaz.",jacket:"Ceket",shirt:"Gömlek / üst",trousers:"Pantolon",shoes:"Ayakkabı",details:"Aksesuar",reservePiece:"Yedek bütçe",ownsShoes:"Mevcut ayakkabıyla uyum kontrolü",genders:{man:"erkek",woman:"kadın"}},
ru:{topTitle:"Соберём образ под вас",topText:"Методика премиальной консультации на основе опыта JamilCo: выясняем задачу, подбираем комплект по фигуре и бюджету, затем отдельно предлагаем возможную подгонку.",formTitle:"Сначала узнаем ваши задачи",resultTitle:"Рекомендуемый образ",from:"Образ из фотоленты",intro:"Это рекомендации-концепции, а не подтверждённые товары и цены Merdo.",gender:"Направление образа",man:"Мужской",woman:"Женский",occasion:"Для какого случая?",formal:"Официальная встреча",partners:"Встреча с клиентом",creative:"Творческая / IT-среда",fit:"Как пиджаки сидят в плечах?",normal:"Комфортно",tight:"Тесно",loose:"Свободно",pants:"Крой брюк",straight:"Прямые",tapered:"Зауженные",relaxed:"Свободные",shoe:"Есть подходящая обувь?",needed:"Нужна новая",have:"Да, есть своя",budget:"Бюджет на одежду (₺)",budgetHelp:"Суммы по категориям — план распределения бюджета, не цены и не оферта.",tailor:"Perfect Fit · Портной",tailorText:"Дополнительные услуги за отдельную плату. Наличие портного в Merdo не подтверждено.",hem:"Укоротить брюки",sleeve:"Укоротить рукава пиджака",waist:"Подогнать брюки в талии",budgetLabel:"Бюджет на одежду",tailorLabel:"Условная стоимость портного",total:"Планируемый итог",reserve:"Запас",fitTitle:"Проверка примерки",fitNormal:"Проверьте линию плеч, свободу движений и натяжение пиджака при застёгивании.",fitTight:"Проверьте ширину плеч и спину. Увеличение размера не всегда решает проблему конструкции.",fitLoose:"Проверьте линию плеч. Ушивание талии не исправляет сильно свисающие плечи.",draftTitle:"Черновик запроса в магазин",draftIntro:"Запрос не отправляется, примерка не бронируется. Текст можно скопировать.",copy:"Скопировать запрос",copied:"Текст скопирован",copyFailed:"Автоматически скопировать не удалось. Выделите текст вручную.",reset:"Сбросить подбор",note:"Демо: цены условные, наличие, услуги портного и бронирование не подключены.",jacket:"Пиджак",shirt:"Рубашка / верх",trousers:"Брюки",shoes:"Обувь",details:"Аксессуары",reservePiece:"Запас бюджета",ownsShoes:"Проверка сочетания с вашей обувью",genders:{man:"мужской",woman:"женский"}}
};
const styles={
man:{
formal:{ru:["Строгая деловая классика","Тёмно-синий или графитовый пиджак с чёткой линией плеч","Светло-голубая или белая рубашка","Брюки со стрелками в согласованном тоне","Классические кожаные туфли","Ремень и носки в тон брюк"],tr:["Klasik iş şıklığı","Lacivert veya antrasit, omzu belirgin ceket","Açık mavi veya beyaz gömlek","Uyumlu renkte ütü izli kumaş pantolon","Klasik deri ayakkabı","Pantolon rengine uygun kemer ve çorap"]},
partners:{ru:["Современный business casual","Тёмно-синий пиджак с мягкой конструкцией","Молочная или светло-голубая рубашка без галстука","Прямые серые или бежевые брюки","Кожаные дерби или лоферы","Минималистичный ремень"],tr:["Modern business casual","Yumuşak yapılı lacivert ceket","Krem veya açık mavi kravatsız gömlek","Düz kesim gri veya bej pantolon","Deri derby veya loafer","Sade kemer"]},
creative:{ru:["Интеллектуальный smart casual","Фактурный пиджак глубокого синего цвета","Однотонная оксфордская рубашка","Прямые удобные брюки","Кожаные лоферы","Ненавязчивые аксессуары"],tr:["Yaratıcı smart casual","Dokulu koyu mavi ceket","Tek renk Oxford gömlek","Düz ve rahat pantolon","Deri loafer","Sade aksesuarlar"]}
},woman:{
formal:{ru:["Современная деловая классика","Структурный жакет графитового или тёмно-синего цвета","Шёлковистая непрозрачная блуза или качественная рубашка","Прямые костюмные брюки","Закрытые кожаные туфли на удобном каблуке","Лаконичный ремень и небольшая сумка"],tr:["Modern iş klasiği","Antrasit veya lacivert yapılandırılmış blazer","Opak, şık bluz veya gömlek","Düz kesim kumaş pantolon","Rahat topuklu kapalı deri ayakkabı","Sade kemer ve küçük çanta"]},
partners:{ru:["Элегантный business casual","Блейзер мягкой конструкции","Светлая рубашка или тонкий трикотаж","Прямые или слегка зауженные брюки","Лоферы или туфли на устойчивом каблуке","Неброская сумка"],tr:["Zarif business casual","Yumuşak kalıplı blazer","Açık ton gömlek veya ince triko","Düz veya hafif dar pantolon","Loafer veya rahat topuklu ayakkabı","Sade çanta"]},
creative:{ru:["Выразительный smart casual","Лаконичный жакет с фактурой","Однотонный топ или тонкий трикотаж","Брюки свободного современного кроя","Кожаные лоферы","Графичные аксессуары"],tr:["Yaratıcı smart casual","Dokulu ve sade blazer","Tek renk üst veya ince triko","Rahat modern kesim pantolon","Deri loafer","Geometrik aksesuarlar"]}
}};
function lang(){return document.documentElement.lang==="ru"?"ru":"tr"}
function t(k){return names[lang()][k]}
function currency(n){return new Intl.NumberFormat(lang()==="ru"?"ru-RU":"tr-TR",{maximumFractionDigits:0}).format(n)+" ₺"}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function opts(name,items){return items.map(k=>'<label><input type="radio" name="'+name+'" value="'+k+'" '+(state[name]===k?"checked":"")+'> <span>'+esc(t(k))+'</span></label>').join("")}
function section(){
root.innerHTML='<div class="styleTop"><div><div class="kicker">03 / PERSONAL STYLIST × PERFECT FIT</div><h2>'+t("topTitle")+'</h2><p>'+t("topText")+'</p></div></div>'+
'<div class="stylist"><div class="styleForm"><h3>'+t("formTitle")+'</h3>'+
'<p class="lookFrom" id="lookSource" hidden></p>'+
'<div class="styleField"><fieldset><legend>'+t("gender")+'</legend><div class="styleChoices">'+opts("gender",["man","woman"])+'</div></fieldset></div>'+
'<div class="styleField"><fieldset><legend>'+t("occasion")+'</legend><div class="styleChoices">'+opts("occasion",["formal","partners","creative"])+'</div></fieldset></div>'+
'<div class="styleField"><fieldset><legend>'+t("fit")+'</legend><div class="styleChoices">'+opts("fit",["normal","tight","loose"])+'</div></fieldset></div>'+
'<div class="styleField"><fieldset><legend>'+t("pants")+'</legend><div class="styleChoices">'+opts("pants",["straight","tapered","relaxed"])+'</div></fieldset></div>'+
'<div class="styleField"><fieldset><legend>'+t("shoe")+'</legend><div class="styleChoices">'+opts("shoe",["needed","have"])+'</div></fieldset></div>'+
'<div class="styleField"><label for="styleBudget" style="display:block;font-weight:700;font-size:12px;margin-bottom:7px">'+t("budget")+'</label><input class="styleTextInput" type="number" min="1000" max="1000000" step="500" id="styleBudget" value="'+state.budget+'"><p class="styleNote">'+t("budgetHelp")+'</p></div>'+
'<div class="tailor"><div class="kicker">PERFECT FIT / TERZİ</div><h4>'+t("tailor")+'</h4><p class="styleNote">'+t("tailorText")+'</p>'+
["hem","sleeve","waist"].map(k=>'<div class="tailorRow"><label><input type="checkbox" name="'+k+'" '+(state[k]?"checked":"")+'> <span>'+t(k)+'</span></label><span class="tailorPrice">'+currency(demoPrices[k])+'</span></div>').join("")+'</div>'+
'<button type="button" class="pill" id="resetStyle">'+t("reset")+'</button></div>'+
'<div class="styleResult" aria-live="polite"><span class="smallTag">BitOS / DEMO</span><h3>'+t("resultTitle")+'</h3><button type="button" id="toggleAdvanced" class="advancedToggle" aria-expanded="'+String(root.classList.contains("expanded"))+'">'+(lang()==="tr"?"İnce ayarları "+(root.classList.contains("expanded")?"kapat":"aç"):"Точная настройка "+(root.classList.contains("expanded")?"— скрыть":"— открыть"))+'</button><div id="styleDynamic"></div></div></div>';
$("lookSource").hidden=!state.source;
if(state.source){const p=document.querySelector('[data-post="'+state.source+'"] h3');$("lookSource").textContent=t("from")+": "+(p?.textContent||state.source)}
const form=root.querySelector(".styleForm");
form.addEventListener("change",e=>{
const el=e.target;
if(el.name in state){state[el.name]=el.type==="checkbox"?el.checked:el.value;renderOutput()}else if(el.id==="styleBudget"){const n=Math.trunc(Number(el.value));state.budget=Math.min(1000000,Math.max(1000,Number.isFinite(n)?n:15000));el.value=state.budget;renderOutput()}
});
$("resetStyle").addEventListener("click",()=>{Object.assign(state,initial);section()});
$("toggleAdvanced").addEventListener("click",()=>{root.classList.toggle("expanded");section()});
renderOutput()
}

/* Described garments only: simple color ideas, NOT computer-vision analysis. */
const fashionColor={
ru:{black:"чёрный",navy:"тёмно-синий",gray:"серый",white:"белый",beige:"бежевый",brown:"коричневый",blue:"голубой",other:"другой"},
tr:{black:"siyah",navy:"lacivert",gray:"gri",white:"beyaz",beige:"bej",brown:"kahverengi",blue:"mavi",other:"diğer"}
};
const fashionCut={
ru:{structured:"структурный",relaxed:"свободный",oversize:"оверсайз",classic:"классический",fitted:"приталенный",straight:"прямой",tapered:"зауженный",derby:"дерби",loafers:"лоферы",sneakers:"кроссовки",minimal:"минималистичный",statement:"акцентный"},
tr:{structured:"yapılı",relaxed:"rahat",oversize:"oversize",classic:"klasik",fitted:"vücuda oturan",straight:"düz",tapered:"daralan",derby:"derby",loafers:"loafer",sneakers:"spor ayakkabı",minimal:"minimal",statement:"öne çıkan"}
};
const palette={
navy:{ru:"серый, бежевый или белый",tr:"gri, bej veya beyaz"},
gray:{ru:"тёмно-синий, белый или чёрный",tr:"lacivert, beyaz veya siyah"},
black:{ru:"белый или серый",tr:"beyaz veya gri"},
white:{ru:"тёмно-синий, серый или бежевый",tr:"lacivert, gri veya bej"},
beige:{ru:"тёмно-синий, коричневый или белый",tr:"lacivert, kahverengi veya beyaz"},
brown:{ru:"бежевый, белый или тёмно-синий",tr:"bej, beyaz veya lacivert"},
blue:{ru:"тёмно-синий, серый или бежевый",tr:"lacivert, gri veya bej"}
};
function ownedNote(k,details){
const d=details[k];if(!d?.owned)return "";
const pieces=[fashionColor[lang()][d.color],fashionCut[lang()][d.cut]].filter(Boolean);
if(d.hasPhoto)pieces.push(lang()==="ru"?"фото сохранено на устройстве":"fotoğraf bu cihazda");
return pieces.join(" · ");
}
function colorAdvice(details){
const k=["jacket","trousers","shirt","shoes"].find(k=>details[k]?.owned&&palette[details[k].color]);
if(!k)return "";
const anchor=fashionColor[lang()][details[k].color],choices=palette[details[k].color][lang()];
return lang()==="ru"
?"Цветовая идея: к вашей вещи «"+t(k)+"» ("+anchor+") можно примерить "+choices+". Это ориентир по выбранному цвету, а не проверка фотографии или посадки."
:"Renk fikri: “"+t(k)+"” ("+anchor+") için "+choices+" tonlarını deneyebilirsiniz. Bu seçtiğiniz renge dayalı bir öneridir; fotoğraf analiz edilmez.";
}

function ownedCategories(){
const own=window.BitOSWardrobe?.getOwned()||{};
return {
jacket:own.jacket===true,
trousers:own.trousers===true,
shirt:own.shirt===true,
shoes:own.shoes===true||state.shoe==="have",
details:own.details===true
};
}
function allocation(own){
const p=state.shoe==="needed"?[.38,.19,.14,.23,.04,.02]:[.44,.23,.20,0,.08,.05];
const rounded=p.slice(0,5).map(x=>Math.round(state.budget*x/50)*50);
const ownedFromWardrobe=window.BitOSWardrobe?.getCount?.()||0;
const keys=["jacket","trousers","shirt","shoes","details"];
// Retain the customer's planned spending cap: owning a jacket must never
// push its unused allowance onto socks or any other missing category.
const amounts=ownedFromWardrobe?rounded.map((n,i)=>own[keys[i]]?0:n):rounded;
return [...amounts,state.budget-amounts.reduce((a,b)=>a+b,0)];
}
function renderOutput(){
const keys=["jacket","trousers","shirt","shoes","details","reservePiece"];
const own=ownedCategories();
const profile=styles[state.gender][state.occasion][lang()];
const values=[profile[1],profile[3],profile[2],state.shoe==="have"?t("ownsShoes"):profile[4],profile[5],t("reserve")];
const prices=allocation(own);
const wardrobeCount=window.BitOSWardrobe?.getCount?.()||0;
const tailorTotal=["hem","sleeve","waist"].reduce((sum,k)=>sum+(state[k]?demoPrices[k]:0),0);
const plannedBuy=prices.slice(0,5).reduce((sum,n)=>sum+n,0);
const purchaseTotal=wardrobeCount?plannedBuy:state.budget;
const present=keys.slice(0,5).filter(k=>own[k]).map(k=>t(k));
const missing=keys.slice(0,5).filter(k=>!own[k]).map(k=>t(k));
const ownership=lang()==="tr"?{owned:"Bende var",advice:"Mevcut ürünleri yeniden önermiyoruz. Gerçek uyum ve ölçü prova ile doğrulanır.",none:"Tam kombin dolabınızda mevcut; yeni bir ürün satın almak gerekmeyebilir.",label:"Planlanan eksik parça bütçesi",link:"Dolabımı düzenle"}:
{owned:"Уже есть",advice:"Вещи из вашего гардероба не предлагаем покупать повторно. Сочетаемость и посадку необходимо проверить.",none:"Все категории есть: возможно, ничего докупать не требуется.",label:"План на недостающие вещи",link:"Изменить гардероб"};
const ownedCheck=lang()==="tr"?"Renk, kesim ve kalıp uyumu provada kontrol edilmeli.":"Проверим цвет, крой и посадку при примерке.";
const wardrobeDetails=window.BitOSWardrobe?.getDetails?.()||{};
const colorHint=wardrobeCount?colorAdvice(wardrobeDetails):"";
const cells=keys.slice(0,5).map((k,i)=>'<div class="stylePiece '+(own[k]?"isOwned":"")+'"><div><strong>'+t(k)+'</strong><p>'+(own[k]?(ownedNote(k,wardrobeDetails)?esc(ownedNote(k,wardrobeDetails))+" · "+ownedCheck:ownedCheck):esc(values[i]))+'</p></div>'+(own[k]?'<span class="ownedLabel">✓ '+ownership.owned+'</span>':'<strong>'+currency(prices[i])+'</strong>')+'</div>').join("")+
'<div class="stylePiece"><div><strong>'+t("reservePiece")+'</strong><p>'+t("reserve")+'</p></div><strong>'+currency(prices[5])+'</strong></div>';
const wardrobeInfo=wardrobeCount?'<div class="outfitWardrobeInfo">'+(missing.length?ownership.advice:ownership.none)+' <a href="#myWardrobe">'+ownership.link+' ↗</a></div>':"";
const shoeOwn=own.shoes?'<div class="fitTip">'+t("ownsShoes")+'</div>':"";
$("styleDynamic").innerHTML='<p class="styleNote">'+t("intro")+'</p><h3>'+esc(profile[0])+'</h3><div class="stylePieces">'+cells+'</div>'+wardrobeInfo+(colorHint?'<div class="wardrobeColorNote">'+esc(colorHint)+'</div>':"")+shoeOwn+
'<div class="fitTip"><strong>'+t("fitTitle")+'</strong><p>'+t("fit"+state.fit[0].toUpperCase()+state.fit.slice(1))+'</p></div>'+
'<div class="styleTotals"><div class="stylePiece"><span>'+t("budgetLabel")+'</span><b>'+currency(state.budget)+'</b></div>'+
(wardrobeCount?'<div class="stylePiece"><span>'+ownership.label+'</span><b>'+currency(plannedBuy)+'</b></div>':"")+
'<div class="stylePiece"><span>'+t("tailorLabel")+'</span><b>'+currency(tailorTotal)+'</b></div>'+
'<div class="stylePiece total"><span>'+t("total")+'</span><b>'+currency(purchaseTotal+tailorTotal)+'</b></div></div>'+
'<p class="styleNote">'+t("note")+'</p><h3>'+t("draftTitle")+'</h3><p class="styleNote">'+t("draftIntro")+'</p><div class="fitDraft" id="styleDraft"></div>'+
'<div class="flowActions"><button type="button" class="primary" id="copyStyle">'+t("copy")+'</button></div>';
const occasion=t(state.occasion);
const service=["hem","sleeve","waist"].filter(k=>state[k]).map(k=>t(k));
const ownedSentence=present.length?(lang()==="tr"?"Dolabımda mevcut kategoriler: ":"У меня уже есть: ")+present.join(", ")+". ":"";
const missingSentence=missing.length?(lang()==="tr"?"Eksik kategoriler için mevcut ürün, fiyat ve beden bilgisini sorabilir miyim: ":"Подскажите реальные товары, размеры, цены и наличие для недостающих категорий: ")+missing.join(", ")+". ":"";
const noneSentence=lang()==="tr"?"Yeni ürün ihtiyacı kesin değil. Mevcut parçaların uyumunu ve kalıbını kontrol etmek istiyorum. ":"Возможно, покупать ничего не нужно. Хочу проверить сочетаемость и посадку своих вещей. ";
const text=lang()==="tr"?
"Merhaba! BitOS konsept demosu üzerinden "+occasion.toLowerCase()+" için "+names.tr.genders[state.gender]+" kombin önerilerini gördüm. Giyim bütçem "+currency(state.budget)+". "+(state.source?"İlham aldığım görünüm: "+state.source+". ":"")+ownedSentence+(missing.length?missingSentence:noneSentence)+(service.length?"Ayrı ücretli terzi işlemleri hakkında da bilgi rica ederim: "+service.join(", ")+". ":"")+"Bu yalnızca bilgi talebi taslağıdır; rezervasyon değildir.":
"Здравствуйте! Я посмотрел(а) концепт BitOS для Merdo. Нужен "+names.ru.genders[state.gender]+" образ для события «"+occasion+"», бюджет на одежду "+currency(state.budget)+". "+(state.source?"Заинтересовал образ из фотоленты "+state.source+". ":"")+ownedSentence+(missing.length?missingSentence:noneSentence)+(service.length?"Интересуют также отдельные услуги портного: "+service.join(", ")+". ":"")+"Это черновик запроса, а не оформленная бронь.";
$("styleDraft").textContent=text;
$("copyStyle").addEventListener("click",async()=>{
const value=$("styleDraft").textContent;
try{await navigator.clipboard.writeText(value);$("copyStyle").textContent=t("copied")}
catch(e){$("copyStyle").textContent=t("copyFailed");$("styleDraft").setAttribute("tabindex","0");$("styleDraft").focus()}
});
}
window.BitOSStylist={
applyPreferences(prefs){
for(const k of ["gender","occasion","fit","budget","shoe","hem","sleeve","waist","source"]){if(Object.prototype.hasOwnProperty.call(prefs,k))state[k]=prefs[k]}
section();root.classList.add("show-result");
},
showResult(){
root.classList.add("show-result");
root.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
root.focus({preventScroll:true});
}
};
window.addEventListener("bitos:compose",e=>{
const id=e.detail&&e.detail.lookId;
if(window.BitOSJourney){window.BitOSJourney.startFromLook(id);return}
if(id){state.source=id;state.gender=(id==="look1"||id==="look4")?"woman":"man";section()}
window.BitOSStylist.showResult();
});
$("language").addEventListener("click",section);
window.addEventListener("bitos:wardrobe-change",()=>{if($("styleDynamic"))renderOutput()});
section()
})();