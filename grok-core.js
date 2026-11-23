/* Merdo x BitOS · static adaptation of user's Grok stylist handoff.
 * Copy, quote rules, 8-photo visual system and 4-step progression are grounded
 * in grok-workspace.zip. No payment, orders, inventory, tracking or lead storage.
 */
(()=>{"use strict";
const root=document.getElementById("grokApp");if(!root)return;
const STORAGE="merdo-bitos-grok-v2", PIECES=["jacket","shirt","trousers","shoes","details"], OCCASIONS=["formal","partners","creative","casual"];
const FITS=["normal","tight","loose"], PANTS=["straight","tapered","relaxed"], COLORS=["navy","gray","black","white","beige","brown","blue"];
const COLORHEX={navy:"#273b51",gray:"#8a8178",black:"#1c1916",white:"#f7f3ec",beige:"#e4d2b8",brown:"#593c2a",blue:"#536b84"};
const PALETTE={
formal:{jacket:"#273b51",shirt:"#f1e5d6",trousers:"#444956",shoes:"#593c2a",details:"#c6a27d"},
partners:{jacket:"#817362",shirt:"#f4eee4",trousers:"#434c54",shoes:"#624534",details:"#c19b67"},
creative:{jacket:"#585c65",shirt:"#c7d3c9",trousers:"#323943",shoes:"#9f7659",details:"#cbb6a2"},
casual:{jacket:"#708173",shirt:"#eee4d5",trousers:"#536b84",shoes:"#e9d9c4",details:"#c2a384"}
};
const profiles={
man:{
formal:{ru:["Строгая деловая классика","Тёмно-синий пиджак с чёткой линией плеч","Тёплая светлая рубашка без галстука","Серые брюки со стрелками","Коричневые классические туфли","Ремень и носки в тон брюк"],tr:["Klasik iş şıklığı","Omzu net lacivert ceket","Kravatsız sıcak açık gömlek","Ütü izli gri kumaş pantolon","Kahverengi klasik deri ayakkabı","Pantolon rengine uygun kemer ve çorap"]},
partners:{ru:["Современный business casual","Мягкий пиджак тёплого тауп","Молочная рубашка","Прямые серые брюки","Коричневые кожаные лоферы","Минималистичный ремень"],tr:["Modern business casual","Yumuşak sıcak taupe ceket","Kravatsız krem gömlek","Düz kesim gri pantolon","Kahverengi deri loafer","Sade kemer"]},
creative:{ru:["Интеллектуальный smart casual","Фактурный графитовый пиджак","Оксфорд шалфейного оттенка","Прямые тёмные брюки","Замшевые лоферы песочного тона","Ненавязчивые аксессуары"],tr:["Yaratıcı smart casual","Dokulu antrasit ceket","Adaçayı Oxford gömlek","Düz koyu pantolon","Kum rengi süet loafer","Sade aksesuarlar"]},
casual:{ru:["Городской выходной","Шалфейный овершерт","Молочное поло","Прямые синие джинсы","Светлые кожаные кеды","Ремень и носки спокойного тона"],tr:["Rahat şehir stili","Adaçayı overshirt","Krem polo","Düz mavi jean","Açık renk deri sneaker","Sakin tonda kemer ve çorap"]}
},
woman:{
formal:{ru:["Современная деловая классика","Структурный тёмно-синий жакет","Непрозрачная светлая блуза","Прямые костюмные брюки","Закрытые туфли на устойчивом каблуке","Лаконичный ремень и небольшая сумка"],tr:["Modern iş klasiği","Yapılandırılmış lacivert blazer","Opak açık renk bluz","Düz kumaş pantolon","Rahat topuklu kapalı ayakkabı","Sade kemer ve küçük çanta"]},
partners:{ru:["Элегантный business casual","Мягкий жакет цвета тауп","Светлая рубашка","Прямые серые брюки","Коричневые лоферы","Неброская сумка"],tr:["Zarif business casual","Yumuşak taupe blazer","Açık ton gömlek","Düz gri pantolon","Kahverengi loafer","Sade çanta"]},
creative:{ru:["Выразительный smart casual","Фактурный графитовый жакет","Топ шалфейного оттенка","Тёмные брюки современного кроя","Кожаные лоферы песочного тона","Графичные аксессуары"],tr:["Yaratıcı smart casual","Dokulu antrasit blazer","Adaçayı üst","Modern kesimli koyu pantolon","Kum rengi deri loafer","Grafik aksesuarlar"]},
casual:{ru:["Лёгкий городской образ","Шалфейный лёгкий жакет","Молочный топ","Прямые джинсы","Светлые кеды","Сумка через плечо"],tr:["Günlük şehir kombini","Adaçayı hafif blazer","Krem üst","Düz jean","Açık renk sneaker","Çapraz çanta"]}
}
};
const strings={
ru:{
demo:"Демо-концепт",introKicker:"Стилист BitOS",introTitle:"Образ на модели, не только смета",introLead:"Четыре шага — и сразу фигура в собранном комплекте: пиджак или жакет, верх, брюки и обувь.",introNote:"Гамма меняется вместе со стилем. Вещи из гардероба отмечаются как уже ваши.",introCta:"Открыть стилиста",introFine:"Независимый концепт для Merdo. Партнёрство не подтверждено. Это фотореалистичный пример, не витрина и не заказ.",
steps:["Цель","Посадка","Бюджет","Портной"],next:"Дальше",back:"Назад",showLook:"Показать образ",s1Title:"Для какого случая собираем?",s1Lead:"Повод задаёт силуэт и цветовую гамму на модели.",gender:"Для кого",man:"Мужской",woman:"Женский",
occasions:{formal:"Деловая встреча",partners:"Встреча с клиентом",creative:"Творческая работа",casual:"Городской день"},
occasionHints:{formal:"Чёткое плечо, спокойный тон",partners:"Мягче классики",creative:"Фактура и шалфей",casual:"Легче, джинсы и кеды"},
s2Title:"Как одежда должна сидеть?",s2Lead:"Посадка — это заметка для примерки. Фотография от выбора посадки не меняется.",fit:"Посадка",fits:{normal:"Обычная",tight:"Ближе к фигуре",loose:"Свободнее"},pants:"Крой брюк",pantsOpts:{straight:"Прямые",tapered:"Зауженные",relaxed:"Свободные"},shoesQ:"Обувь",needed:"Нужна новая",have:"Подходящая уже есть",
s3Title:"Бюджет на одежду",s3Lead:"Сумма в лирах условная. Это не цена витрины Merdo. Портной рассчитывается отдельно.",s4Title:"Портной и гардероб",s4Lead:"Подгонка необязательна. То, что уже есть дома, не предлагаем покупать снова.",tailor:"Подгонка",tailorHint:"Отдельная условная смета.",hem:"Укоротить брюки",sleeve:"Укоротить рукава",waist:"Подогнать талию брюк",wardrobe:"Уже есть дома",wardrobeHint:"Освободившаяся сумма остаётся резервом.",yourColor:"Ваш цвет",colors:{navy:"Тёмно-синий",gray:"Серый",black:"Чёрный",white:"Белый",beige:"Бежевый",brown:"Коричневый",blue:"Синий"},
pieces:{jacket:"Пиджак / жакет",shirt:"Верх",trousers:"Брюки",shoes:"Обувь",details:"Детали"},piecesShort:{jacket:"Пиджак",shirt:"Верх",trousers:"Брюки",shoes:"Обувь",details:"Детали"},
resultKicker:"Ваш образ · пример",photoNote:"Фотореалистичный пример на модели. Цвет и посадка ваших вещей не изменяют фотографию.",notProduct:"Не товар Merdo",budget:"Бюджет на одежду",toBuy:"К докупке",reserve:"Свободный резерв",tailorApart:"Портной отдельно",owned:"Уже есть",detailsBtn:"Детали образа и запрос",edit:"Править ответы",fitTitle:"На примерке",colorTitle:"К цвету из гардероба",draftTitle:"Черновик запроса",draftHint:"Текст только копируется. Это не отправка, не бронь и не заказ.",copy:"Скопировать запрос",copied:"Скопировано",copyError:"Автоматически скопировать не удалось. Выделите текст ниже и скопируйте вручную.",disclaimer:"Фотореалистичный пример, не фотографии реальных товаров Merdo. Цвета, размеры, фасоны, цены и наличие не подтверждены.",colorsDontChange:"Ваш цвет показан меткой, фото модели не перекрашивается.",noSaved:"Сохранение на устройстве недоступно — ответы могут не пережить обновление страницы.",demoTools:"Другие инструменты BitOS",oldWardrobe:"Мой гардероб",oldCatalog:"Тестовые товары",oldSocial:"Фотолента",oldSources:"Статус каталога",reStart:"Заново",
fitsAdvice:{normal:"Проверьте плечо, застёжку и свободу движений.",tight:"Убедитесь, что не тянет в спине и плечах: нужна проверка кроя.",loose:"Если плечо сползает, нужен другой крой — не просто ушить талию."},
pantsAdvice:{straight:"Прямой крой сохраняет линию и проще подгоняется по длине.",tapered:"Заужение требует проверки по щиколотке.",relaxed:"Свободный крой особенно чувствителен к длине брючины."}
},
tr:{
demo:"Konsept demo",introKicker:"BitOS stilist",introTitle:"Sadece hesap değil, gerçekçi kombin görüntüsü",introLead:"Dört adımdan hemen sonra ceket, üst, pantolon ve ayakkabıdan oluşan tam görünümü bir model üzerinde görürsünüz.",introNote:"Renk paleti seçtiğiniz amaca göre değişir. Gardırobunuzdaki parçalar yeniden önerilmez.",introCta:"Stilisti aç",introFine:"Merdo için bağımsız konsept. Ortaklık doğrulanmamıştır. Fotoğraflar ürün veya stok göstermez.",
steps:["Amaç","Kalıp","Bütçe","Terzi"],next:"İleri",back:"Geri",showLook:"Kombini göster",s1Title:"Kombin hangi durum için?",s1Lead:"Vesile modelin stilini ve renk paletini belirler.",gender:"Kimin için",man:"Erkek",woman:"Kadın",
occasions:{formal:"İş toplantısı",partners:"Müşteri buluşması",creative:"Yaratıcı iş",casual:"Şehir günü"},
occasionHints:{formal:"Net omuz, sakin ton",partners:"Klasikten daha yumuşak",creative:"Doku ve adaçayı",casual:"Jean ve sneaker"},
s2Title:"Kıyafet nasıl oturmalı?",s2Lead:"Kalıp prova notudur, fotoğrafı değiştirmez.",fit:"Oturuş",fits:{normal:"Normal",tight:"Daha dar",loose:"Daha bol"},pants:"Pantolon kesimi",pantsOpts:{straight:"Düz",tapered:"Daralan",relaxed:"Rahat"},shoesQ:"Ayakkabı",needed:"Yeni gerekli",have:"Uygun olanım var",
s3Title:"Giyim bütçesi",s3Lead:"Lira cinsinden koşullu tutar. Merdo ürün fiyatı değildir, terzi ücretleri ayrı.",s4Title:"Terzi ve gardırop",s4Lead:"Tadilat isteğe bağlı. Evde olan parçalar yeniden satın alınmaz.",tailor:"Tadilat",tailorHint:"Ayrı örnek ücret.",hem:"Paça kısaltma",sleeve:"Kol kısaltma",waist:"Bel ayarı",wardrobe:"Zaten bende var",wardrobeHint:"Kalan tutar yeniden dağıtılmayıp rezervde kalır.",yourColor:"Renginiz",colors:{navy:"Lacivert",gray:"Gri",black:"Siyah",white:"Beyaz",beige:"Bej",brown:"Kahverengi",blue:"Mavi"},
pieces:{jacket:"Ceket / blazer",shirt:"Üst",trousers:"Pantolon",shoes:"Ayakkabı",details:"Detay"},piecesShort:{jacket:"Ceket",shirt:"Üst",trousers:"Pantolon",shoes:"Ayakkabı",details:"Detay"},
resultKicker:"Kombininiz · örnek",photoNote:"Model üzerinde örnek görünüm; kişisel renk ve kalıp fotoğrafı değiştirmez.",notProduct:"Merdo ürünü değil",budget:"Giyim bütçesi",toBuy:"Alınacak",reserve:"Serbest rezerv",tailorApart:"Terzi ayrı",owned:"Bende var",detailsBtn:"Kombin detayı ve talep",edit:"Yanıtları düzenle",fitTitle:"Provada",colorTitle:"Gardırop renginiz",draftTitle:"Talep taslağı",draftHint:"Metin yalnızca kopyalanır, gönderim veya rezervasyon değildir.",copy:"Talebi kopyala",copied:"Kopyalandı",copyError:"Otomatik kopyalama başarısız. Metni seçip manuel kopyalayabilirsiniz.",disclaimer:"Model fotoğrafları gerçek Merdo ürünlerini göstermez. Renk, beden, kalıp, fiyat ve stok doğrulanmamıştır.",colorsDontChange:"Kendi renginiz listede gösterilir; model fotoğrafı değiştirilmez.",noSaved:"Cihazda kayıt mümkün değil; yanıtlar kaybolabilir.",demoTools:"Diğer BitOS araçları",oldWardrobe:"Gardırobum",oldCatalog:"Örnek ürünler",oldSocial:"Sosyal akış",oldSources:"Katalog durumu",reStart:"Baştan başla",
fitsAdvice:{normal:"Omuzların, düğmenin ve hareket rahatlığının uyumunu kontrol edin.",tight:"Sırt ve omuzlarda sıkışma varsa farklı kalıp deneyin.",loose:"Omuz düşüyorsa sadece bel daraltmak yetmez."},
pantsAdvice:{straight:"Düz kesim daha kolay boy ayarı sağlar.",tapered:"Bilek çevresinde çok dar olmamalı.",relaxed:"Rahat pantolonda paça uzunluğu önemlidir."}
}};
const safe=s=>String(s).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const initial=()=>({gender:"man",occasion:"formal",fit:"normal",pants:"straight",shoe:"needed",budget:15000,hem:false,sleeve:false,waist:false,owned:{jacket:false,shirt:false,trousers:false,shoes:false,details:false},colors:{}});
let state=initial(),lang="ru",screen="intro",step=1,detailsOpen=false,feedback="",persistOK=true,hydrated=false;
function isOwned(k){return state.owned[k]===true||(k==="shoes"&&state.shoe==="have")}
const t=()=>strings[lang],money=n=>new Intl.NumberFormat(lang==="ru"?"ru-RU":"tr-TR").format(Math.round(n))+" ₺";
function clampBudget(n){if(!Number.isFinite(n))return 15000;return Math.min(1000000,Math.max(1000,Math.round(n/50)*50))}
function quote(){
 const shares=state.shoe==="needed"?[.38,.19,.14,.23,.04]:[.44,.23,.2,0,.08],keys=["jacket","trousers","shirt","shoes","details"];
 const amounts={jacket:0,trousers:0,shirt:0,shoes:0,details:0};keys.forEach((k,i)=>{if(!isOwned(k))amounts[k]=Math.round((state.budget*shares[i])/50)*50});
 let toBuy=PIECES.reduce((sum,k)=>sum+amounts[k],0);
 while(toBuy>state.budget){const k=keys.reduce((best,k)=>amounts[k]>amounts[best]?k:best,"jacket");amounts[k]-=Math.min(amounts[k],Math.ceil((toBuy-state.budget)/50)*50);toBuy=PIECES.reduce((sum,k)=>sum+amounts[k],0)}
 return {amounts,toBuy,reserve:state.budget-toBuy,tailor:(state.hem?400:0)+(state.sleeve?650:0)+(state.waist?500:0)}
}
function hydrate(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE)||"null");
  if(raw&&typeof raw==="object"&&raw.state&&["man","woman"].includes(raw.state.gender)&&OCCASIONS.includes(raw.state.occasion)){
   const d=raw.state;state={...initial(),gender:d.gender,occasion:d.occasion,fit:FITS.includes(d.fit)?d.fit:"normal",pants:PANTS.includes(d.pants)?d.pants:"straight",shoe:d.shoe==="have"?"have":"needed",budget:clampBudget(Number(d.budget)),hem:d.hem===true,sleeve:d.sleeve===true,waist:d.waist===true};
   for(const k of PIECES){state.owned[k]=d.owned?.[k]===true;if(COLORS.includes(d.colors?.[k]))state.colors[k]=d.colors[k]}
   screen=["intro","flow","result"].includes(raw.screen)?raw.screen:"intro";
   step=[1,2,3,4].includes(raw.step)?raw.step:1;lang=raw.lang==="tr"?"tr":"ru";
   return;
  }
  // When switching from BitOS v1, reuse only user-owned categories; do not send photos.
  const old=JSON.parse(localStorage.getItem("bitos:wardrobe:v2")||localStorage.getItem("bitos:wardrobe:v1")||"null");
  if(old&&typeof old==="object")for(const k of PIECES){const x=old[k];state.owned[k]=x===true||x?.owned===true;if(COLORS.includes(x?.color))state.colors[k]=x.color}
 }catch(e){persistOK=false}
}
function persist(){
 try{localStorage.setItem(STORAGE,JSON.stringify({state,screen,step,lang}));persistOK=true}catch(e){persistOK=false}
 document.documentElement.lang=lang;
}
function focusOn(selector){requestAnimationFrame(()=>root.querySelector(selector)?.focus({preventScroll:true}))}
function go(next,nextStep=1){
 screen=next;step=nextStep;detailsOpen=false;feedback="";persist();render();window.scrollTo({top:0,behavior:"instant"});focusOn(next==="intro"?"#grokTitle":next==="result"?"#grokResultTitle":"#grokStepTitle")
}
const choice=(field,val,label,hint="",color="")=>'<button type="button" class="grok-choice" data-set="'+field+'" data-val="'+val+'" aria-pressed="'+String(state[field]===val)+'"><span><strong>'+safe(label)+'</strong>'+(hint?'<small>'+safe(hint)+'</small>':"")+'</span>'+(color?'<span class="grok-swatch" style="--tone:'+color+'"></span>':'<i aria-hidden="true"></i>')+'</button>';
const switches=(field,keys,dict)=>'<div class="grok-switches">'+keys.map(k=>'<button type="button" class="grok-switch" data-set="'+field+'" data-val="'+k+'" aria-pressed="'+String(state[field]===k)+'">'+safe(dict[k])+'</button>').join("")+'</div>';
function renderIntro(){
 const c=t();return '<section class="grok-screen"><p class="grok-kicker">'+c.introKicker+'</p><h1 id="grokTitle" tabindex="-1" class="grok-title">'+c.introTitle+'</h1><p class="grok-lead">'+c.introLead+'</p><p class="grok-sub">'+c.introNote+'</p>'+
 '<button class="grok-primary" data-action="start" type="button"><span>'+c.introCta+'</span><span aria-hidden="true">→</span></button>'+
 '<div class="grok-introPhotos"><figure><div class="grok-photo" data-gender="man" data-occasion="formal"><img src="./looks/man-formal.jpg" loading="eager" decoding="async" fetchpriority="high" alt="'+c.man+' · '+c.occasions.formal+'"></div><figcaption>'+c.occasions.formal+' · '+c.man+'</figcaption></figure>'+
 '<figure><div class="grok-photo" data-gender="woman" data-occasion="casual"><img src="./looks/woman-casual.jpg" loading="lazy" decoding="async" alt="'+c.woman+' · '+c.occasions.casual+'"></div><figcaption>'+c.occasions.casual+' · '+c.woman+'</figcaption></figure></div><p class="grok-introFine">'+c.introFine+'</p></section>'
}
function renderGoal(){
 const c=t();return '<h1 id="grokStepTitle" tabindex="-1" class="grok-question">'+c.s1Title+'</h1><p class="grok-questionLead">'+c.s1Lead+'</p>'+
 '<fieldset class="grok-fieldset"><legend class="grok-legend">'+c.gender+'</legend><div class="grok-choices two">'+["man","woman"].map(g=>choice("gender",g,c[g])).join("")+'</div></fieldset>'+
 '<fieldset class="grok-fieldset"><legend class="sr-only">'+c.s1Title+'</legend><div class="grok-choices">'+OCCASIONS.map(o=>choice("occasion",o,c.occasions[o],c.occasionHints[o],PALETTE[o].jacket)).join("")+'</div></fieldset>';
}
function renderFit(){
 const c=t();return '<h1 id="grokStepTitle" tabindex="-1" class="grok-question">'+c.s2Title+'</h1><p class="grok-questionLead">'+c.s2Lead+'</p>'+
 '<fieldset class="grok-fieldset"><legend class="grok-legend">'+c.fit+'</legend>'+switches("fit",FITS,c.fits)+'</fieldset>'+
 '<fieldset class="grok-fieldset"><legend class="grok-legend">'+c.pants+'</legend>'+switches("pants",PANTS,c.pantsOpts)+'</fieldset>'+
 '<fieldset class="grok-fieldset"><legend class="grok-legend">'+c.shoesQ+'</legend>'+switches("shoe",["needed","have"],c)+'</fieldset>';
}
function renderBudget(){
 const c=t();return '<h1 id="grokStepTitle" tabindex="-1" class="grok-question">'+c.s3Title+'</h1><p class="grok-questionLead">'+c.s3Lead+'</p>'+
 '<label for="grokBudget" class="sr-only">'+c.budget+'</label><input id="grokBudget" class="grok-budget" inputmode="numeric" type="number" min="1000" max="1000000" step="50" value="'+state.budget+'"><div class="grok-currency">₺ · TRY</div>'+
 '<input id="grokRange" class="grok-range" type="range" min="5000" max="80000" step="500" value="'+Math.max(5000,Math.min(80000,state.budget))+'" aria-label="'+c.budget+'"><div class="grok-presets">'+[8000,15000,25000,45000].map(v=>'<button type="button" data-budget="'+v+'" aria-pressed="'+String(v===state.budget)+'">'+money(v).replace(" ₺","")+'</button>').join("")+'</div>';
}
function ownedCard(k){
 const c=t(),on=!!state.owned[k];return '<div class="grok-ownedItem '+(on?"isOwned":"")+'"><button type="button" data-owned="'+k+'" aria-pressed="'+on+'"><span>'+c.pieces[k]+'</span><span>'+(on?"✓ "+c.owned:"—")+'</span></button>'+
 (on?'<div class="grok-ownedColors"><label>'+c.yourColor+'</label><div class="grok-colorOptions">'+COLORS.map(color=>'<button type="button" data-color="'+k+'" data-val="'+color+'" aria-pressed="'+String(state.colors[k]===color)+'" style="--tone:'+COLORHEX[color]+'" title="'+c.colors[color]+'" aria-label="'+c.colors[color]+'"></button>').join("")+'</div></div>':"")+'</div>';
}
function renderTailor(){
 const c=t(),q=quote();const prices={hem:400,sleeve:650,waist:500};
 return '<h1 id="grokStepTitle" tabindex="-1" class="grok-question">'+c.s4Title+'</h1><p class="grok-questionLead">'+c.s4Lead+'</p>'+
 '<fieldset class="grok-fieldset"><legend class="grok-legend">✂ '+c.tailor+'</legend><p class="grok-miniNote">'+c.tailorHint+'</p><div class="grok-choices">'+Object.keys(prices).map(k=>'<button class="grok-choice" type="button" data-tailor="'+k+'" aria-pressed="'+String(state[k])+'"><span><strong>'+c[k]+'</strong><small>'+money(prices[k])+'</small></span><i aria-hidden="true"></i></button>').join("")+'</div><p class="grok-tailorTotal">'+c.tailorApart+': <strong>'+money(q.tailor)+'</strong></p></fieldset>'+
 '<fieldset class="grok-fieldset"><legend class="grok-legend">'+c.wardrobe+'</legend><p class="grok-miniNote">'+c.wardrobeHint+'</p><div class="grok-ownedCards">'+PIECES.map(ownedCard).join("")+'</div></fieldset>';
}
function renderFlow(){
 const c=t();return '<section class="grok-screen"><ol class="grok-progress" aria-label="'+c.steps.join(", ")+'">'+c.steps.map((label,i)=>'<li class="'+(i+1===step?"current":i+1<step?"done":"")+'"><i></i><small>'+(i+1)+'. '+label+'</small></li>').join("")+'</ol>'+
 (step===1?renderGoal():step===2?renderFit():step===3?renderBudget():renderTailor())+
 '<div class="grok-stepButtons"><button type="button" class="grok-secondary" data-action="back">← '+c.back+'</button><button type="button" class="grok-primary" data-action="next"><span>'+(step===4?c.showLook:c.next)+'</span><span aria-hidden="true">→</span></button></div></section>';
}
function srcPhoto(gender,occasion,caption){
 return '<div class="grok-photo" data-gender="'+gender+'" data-occasion="'+occasion+'"><img src="./looks/'+gender+'-'+occasion+'.jpg" width="900" height="1350" fetchpriority="high" decoding="async" alt="'+safe(caption)+'"><span class="grok-photoBadge">'+t().notProduct+'</span></div>'
}
function swatch(k){
 const given=isOwned(k)?state.colors[k]:null;
 return (given&&COLORHEX[given])?COLORHEX[given]:PALETTE[state.occasion][k];
}
function buildDraft(){
 const c=t(),q=quote(),owned=PIECES.filter(isOwned).map(k=>c.pieces[k].toLowerCase()+(state.colors[k]?" ("+c.colors[state.colors[k]]+")":"")),missing=PIECES.filter(k=>!isOwned(k)).map(k=>c.pieces[k].toLowerCase());
 const services=["hem","sleeve","waist"].filter(k=>state[k]).map(k=>c[k].toLowerCase());
 const note=lang==="ru"
 ? "Посадка: "+c.fits[state.fit].toLowerCase()+". Крой брюк: "+c.pantsOpts[state.pants].toLowerCase()+". Обувь: "+c[state.shoe].toLowerCase()+"."
 : "Kalıp: "+c.fits[state.fit].toLowerCase()+". Pantolon: "+c.pantsOpts[state.pants].toLowerCase()+". Ayakkabı: "+c[state.shoe].toLowerCase()+".";
 if(lang==="ru"){
  return "Здравствуйте! Я посмотрел(а) независимый концепт BitOS для Merdo. Нужен "+(state.gender==="woman"?"женский":"мужской")+" образ на случай «"+c.occasions[state.occasion]+"», бюджет на одежду "+money(state.budget)+". "+note+" "+(owned.length?"Уже есть: "+owned.join(", ")+". ":"")+(missing.length?"Нужны варианты: "+missing.join(", ")+". ":"Хочу собрать образ из своих вещей. ")+(services.length?"Прошу отдельно уточнить стоимость и условия портного: "+services.join(", ")+". ":"")+"Это черновик запроса, без отправки, брони и заказа. Наличие и цены Merdo не подтверждены.";
 }
 return "Merhaba! Merdo için bağımsız BitOS konseptine baktım. "+c.occasions[state.occasion]+" için "+(state.gender==="woman"?"kadın":"erkek")+" kombin, giyim bütçem "+money(state.budget)+". "+note+" "+(owned.length?"Bende olanlar: "+owned.join(", ")+". ":"")+(missing.length?"İlgilendiğim parçalar: "+missing.join(", ")+". ":"Mevcut parçalarımla kombin oluşturmak istiyorum. ")+(services.length?"Ayrı terzi koşullarını öğrenmek isterim: "+services.join(", ")+". ":"")+"Bu yalnızca talep taslağıdır; gönderim, rezervasyon veya sipariş yoktur. Merdo stok ve fiyatları doğrulanmamıştır.";
}
function detailHtml(){
 const c=t(),q=quote(),profile=profiles[state.gender][state.occasion][lang],advice=c.fitsAdvice[state.fit]+" "+c.pantsAdvice[state.pants];
 let colorNote="";for(const k of PIECES){if(isOwned(k)&&state.colors[k]){colorNote=c.pieces[k]+": "+c.colors[state.colors[k]]+". "+c.colorsDontChange;break}}
 return '<div class="grok-details" id="grokDetails"><h2>'+c.detailsBtn+'</h2><div class="grok-detailsList">'+PIECES.map((k,i)=>'<div class="grok-detailPiece"><span class="swatch" style="background:'+swatch(k)+'"></span><div><strong>'+c.pieces[k]+'</strong><p>'+safe(profile[i+1])+'</p>'+(isOwned(k)?'<p>'+c.owned+(state.colors[k]?" · "+c.colors[state.colors[k]]:"")+'</p>':"")+'</div><b>'+(isOwned(k)?c.owned:money(q.amounts[k]))+'</b></div>').join("")+'</div>'+
 '<div class="grok-pricebox"><div class="main"><span>'+c.toBuy+'</span><strong>'+money(q.toBuy)+'</strong></div><div><span>'+c.reserve+'</span><strong>'+money(q.reserve)+'</strong></div><div class="tailor"><span>'+c.tailorApart+'</span><strong>'+money(q.tailor)+'</strong></div></div>'+
 '<h2>'+c.fitTitle+'</h2><p class="grok-advice">'+safe(advice)+'</p>'+(colorNote?'<p class="grok-advice">'+safe(colorNote)+'</p>':"")+
 '<h2>'+c.draftTitle+'</h2><p class="grok-miniNote">'+c.draftHint+'</p><textarea id="grokDraft" class="grok-draft" rows="7" readonly>'+safe(buildDraft())+'</textarea>'+
 '<button type="button" class="grok-primary" data-action="copy"><span>'+c.copy+'</span><span>↗</span></button><p class="grok-status" id="grokFeedback" role="status" aria-live="polite">'+safe(feedback)+'</p></div>';
}
function renderResult(){
 const c=t(),q=quote(),profile=profiles[state.gender][state.occasion][lang],visualKeys=["jacket","shirt","trousers","shoes"],photoAlt=profile.slice(1,5).join(". ")+".";
 return '<section class="grok-screen"><p class="grok-kicker">'+c.resultKicker+'</p><h1 id="grokResultTitle" tabindex="-1" class="grok-resultName">'+safe(profile[0])+'</h1><p class="grok-sub">'+c.occasions[state.occasion]+' · '+c[state.gender]+'</p>'+
 '<figure class="grok-resultPhoto">'+srcPhoto(state.gender,state.occasion,photoAlt)+'<figcaption class="grok-photoCaption">'+c.photoNote+'</figcaption></figure>'+
 '<div class="grok-shortParts">'+visualKeys.map(k=>'<div class="grok-shortPart"><i class="swatch" style="background:'+swatch(k)+'"></i><span>'+c.piecesShort[k]+'</span><small>'+(isOwned(k)?c.owned:money(q.amounts[k]))+'</small></div>').join("")+'</div>'+
 '<div class="grok-pricebox"><div class="main"><span>'+c.toBuy+'</span><strong>'+money(q.toBuy)+'</strong></div><div><span>'+c.budget+'</span><strong>'+money(state.budget)+'</strong></div><div><span>'+c.reserve+'</span><strong>'+money(q.reserve)+'</strong></div><div><span>'+c.pieces.details+'</span><strong>'+(isOwned("details")?c.owned:money(q.amounts.details))+'</strong></div><div class="tailor"><span>'+c.tailorApart+'</span><strong>+'+money(q.tailor)+'</strong></div></div>'+
 '<button type="button" class="grok-primary" data-action="details" aria-expanded="'+String(detailsOpen)+'"><span>'+c.detailsBtn+'</span><span aria-hidden="true">'+(detailsOpen?"↑":"→")+'</span></button>'+
 (detailsOpen?detailHtml():"")+
 '<button type="button" class="grok-link" data-action="edit">'+c.edit+'</button>'+
 '<p class="grok-disclaimer">'+c.disclaimer+'</p></section>';
}
function render(){
 const c=t();document.documentElement.lang=lang;
 root.innerHTML='<div class="grok-shell"><header class="grok-header"><button type="button" class="grok-logo" data-action="home" aria-label="Merdo · '+c.demo+'"><span>Merdo</span><small>× BITOS</small></button>'+
 '<div class="grok-headerRight"><span class="grok-demo">'+c.demo+'</span><div class="grok-lang" role="group" aria-label="Language"><button data-lang="ru" aria-pressed="'+(lang==="ru")+'">RU</button><button data-lang="tr" aria-pressed="'+(lang==="tr")+'">TR</button></div></div></header>'+
 (screen==="intro"?renderIntro():screen==="flow"?renderFlow():renderResult())+
 (!persistOK?'<p class="grok-disclaimer">'+c.noSaved+'</p>':"")+
 '<footer class="grok-footer"><span>MERDO × BitOS · DEMO</span><a href="https://github.com/safal207/merdo-bitos/issues" target="_blank" rel="noopener noreferrer">Backlog</a><span>'+c.demoTools+':</span></footer>'+
 '<nav class="grok-legacyLinks" aria-label="'+c.demoTools+'"><a href="./legacy.html#discover">'+c.oldSocial+'</a><a href="./legacy.html#demoProducts">'+c.oldCatalog+'</a><a href="./legacy.html#myWardrobe">'+c.oldWardrobe+'</a><a href="./legacy.html#catalogStatus">'+c.oldSources+'</a></nav></div>';
}
function restoreFocus(selector){const e=root.querySelector(selector);if(e)e.focus({preventScroll:true})}
root.addEventListener("click",async event=>{
 const b=event.target.closest("button");if(!b||!root.contains(b))return;
 if(b.dataset.lang){lang=b.dataset.lang;persist();render();restoreFocus('[data-lang="'+lang+'"]');return}
 const action=b.dataset.action;
 if(action==="home"){go("intro");return}
 if(action==="start"){go("flow",1);return}
 if(action==="back"){step===1?go("intro"):go("flow",step-1);return}
 if(action==="next"){if(step===3)state.budget=clampBudget(state.budget);step===4?go("result"):go("flow",step+1);return}
 if(action==="edit"){go("flow",4);return}
 if(action==="details"){detailsOpen=!detailsOpen;render();restoreFocus('[data-action="details"]');if(detailsOpen)document.getElementById("grokDetails")?.scrollIntoView({block:"start",behavior:"smooth"});return}
 if(action==="copy"){
  const draft=root.querySelector("#grokDraft");if(!draft)return;
  try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");await navigator.clipboard.writeText(draft.value);feedback=t().copied}
  catch(e){feedback=t().copyError;draft.focus();draft.select()}
  const el=root.querySelector("#grokFeedback");if(el)el.textContent=feedback;return;
 }
 if(b.dataset.set){const key=b.dataset.set,value=b.dataset.val;if((key==="gender"&&["man","woman"].includes(value))||(key==="occasion"&&OCCASIONS.includes(value))||(key==="fit"&&FITS.includes(value))||(key==="pants"&&PANTS.includes(value))||(key==="shoe"&&["have","needed"].includes(value))){state[key]=value;persist();render();restoreFocus('[data-set="'+key+'"][data-val="'+value+'"]')}return}
 if(b.dataset.budget){state.budget=Number(b.dataset.budget);persist();render();restoreFocus('[data-budget="'+state.budget+'"]');return}
 if(b.dataset.tailor){const key=b.dataset.tailor;if(!["hem","sleeve","waist"].includes(key))return;state[key]=!state[key];persist();render();restoreFocus('[data-tailor="'+key+'"]');return}
 if(b.dataset.owned){const key=b.dataset.owned;if(!PIECES.includes(key))return;state.owned[key]=!state.owned[key];if(!state.owned[key])delete state.colors[key];persist();render();restoreFocus('[data-owned="'+key+'"]');return}
 if(b.dataset.color){const key=b.dataset.color,value=b.dataset.val;if(!PIECES.includes(key)||!COLORS.includes(value))return;state.colors[key]=value;persist();render();restoreFocus('[data-color="'+key+'"][data-val="'+value+'"]')}
});
root.addEventListener("change",e=>{
 if(e.target.id==="grokBudget"||e.target.id==="grokRange"){
  const n=Number(e.target.value);state.budget=clampBudget(n);persist();render();restoreFocus(e.target.id==="grokBudget"?"#grokBudget":"#grokRange")
 }
});
root.addEventListener("input",e=>{
 if(e.target.id==="grokBudget"){const n=Number(e.target.value);if(Number.isFinite(n)&&n>=0&&n<=1000000)state.budget=n}
 if(e.target.id==="grokRange"){state.budget=Number(e.target.value);const input=root.querySelector("#grokBudget");if(input)input.value=state.budget}
});
window.BitOSGrok={getState:()=>JSON.parse(JSON.stringify(state)),getQuote:quote,reset:()=>{state=initial();go("intro")}};
hydrate();hydrated=true;persist();render();
})();