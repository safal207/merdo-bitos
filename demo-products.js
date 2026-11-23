/* BitOS sample product cards: completely fictional merchandise for UX testing.
   No store inventory, price quotation, size availability, cart or order processing. */
(function(){
"use strict";
const root=document.getElementById("demoProducts");
if(!root)return;
const products=[
{id:"TEST-W-01",sex:"woman",kind:"jacket",color:"#647383",colorRu:"Сине-серый",colorTr:"Mavi gri",nameRu:"Жакет мягкой конструкции",nameTr:"Yumuşak kesimli blazer",price:4900,sizes:["XS","S","M","L","XL"],noteRu:"Демо-идея для деловой встречи. Сочетайте с брюками прямого кроя.",noteTr:"İş görüşmesi için örnek fikir. Düz kesim pantolonla tamamlayın."},
{id:"TEST-W-02",sex:"woman",kind:"shirt",color:"#f1e5d4",colorRu:"Молочный",colorTr:"Krem",nameRu:"Рубашка свободного кроя",nameTr:"Rahat kesimli gömlek",price:1950,sizes:["XS","S","M","L"],noteRu:"Светлый слой под жакет. Ткань и реальная посадка не подтверждены.",noteTr:"Blazer altına açık renk katman. Kumaş ve gerçek kalıp doğrulanmadı."},
{id:"TEST-W-03",sex:"woman",kind:"trousers",color:"#a89588",colorRu:"Тёплый серый",colorTr:"Sıcak gri",nameRu:"Брюки прямого силуэта",nameTr:"Düz kesim pantolon",price:2700,sizes:["34","36","38","40","42","44"],noteRu:"Универсальные пропорции; длину и пояс нужно проверить на примерке.",noteTr:"Çok yönlü kesim; boy ve bel uyumu provada kontrol edilmeli."},
{id:"TEST-W-04",sex:"woman",kind:"shoes",color:"#65463a",colorRu:"Шоколадный",colorTr:"Çikolata",nameRu:"Лоферы городские",nameTr:"Günlük loafer",price:2400,sizes:["36","37","38","39","40","41"],noteRu:"Идея обуви к комплекту. Размеры — только пример интерфейса.",noteTr:"Kombin için ayakkabı fikri. Bedenler yalnızca arayüz örneğidir."},
{id:"TEST-M-05",sex:"man",kind:"jacket",color:"#2a3647",colorRu:"Тёмно-синий",colorTr:"Lacivert",nameRu:"Пиджак деловой",nameTr:"Klasik erkek ceketi",price:5600,sizes:["46","48","50","52","54","56"],noteRu:"Строгий верх; особенно важна проверка линии плеч.",noteTr:"Resmî üst katman; özellikle omuz çizgisi kontrol edilmeli."},
{id:"TEST-M-06",sex:"man",kind:"shirt",color:"#e2e9e8",colorRu:"Светло-голубой",colorTr:"Açık mavi",nameRu:"Рубашка оксфорд",nameTr:"Oxford gömlek",price:1450,sizes:["S","M","L","XL","XXL"],noteRu:"Чистая база для делового или повседневного образа.",noteTr:"İş ve günlük kombinler için sade temel parça."},
{id:"TEST-M-07",sex:"man",kind:"trousers",color:"#8a887f",colorRu:"Графитовый",colorTr:"Antrasit",nameRu:"Брюки со стрелками",nameTr:"Kumaş pantolon",price:2350,sizes:["46","48","50","52","54"],noteRu:"Пример классического низа. Изменение длины не включено в цену.",noteTr:"Klasik pantolon örneği. Paça tadilatı örnek fiyata dahil değildir."},
{id:"TEST-M-08",sex:"man",kind:"shoes",color:"#5b4131",colorRu:"Каштановый",colorTr:"Kestane",nameRu:"Туфли дерби",nameTr:"Derby ayakkabı",price:2950,sizes:["40","41","42","43","44","45"],noteRu:"Возможное завершение делового комплекта; примеряйте вместе с брюками.",noteTr:"İş kombini için ayakkabı fikri; pantolonla birlikte deneyin."}
];
const locale={
ru:{
eyebrow:"BITOS / TEST PRODUCT LAB",title:"Тестовые карточки одежды",
intro:"Проверяем, как будет выглядеть каталог Merdo: карточки, цвета, размеры и сборка полного образа. Все 8 товаров, цены и коды придуманы специально для демонстрации.",
warning:"НЕ РЕАЛЬНЫЙ КАТАЛОГ MERDO · ЦЕНЫ И РАЗМЕРЫ УСЛОВНЫЕ · НЕТ ПРОДАЖ И БРОНИРОВАНИЯ",
all:"Все",woman:"Женское",man:"Мужское",jacket:"Пиджаки и жакеты",shirt:"Рубашки и верх",trousers:"Брюки",shoes:"Обувь",category:"Категория",gender:"Кому",demo:"ТЕСТОВЫЙ ТОВАР",sample:"условная цена",select:"Размер (необязательно)",unset:"Пока не знаю",add:"В мой образ",remove:"Убрать из образа",details:"Подробнее",hide:"Скрыть детали",summary:"Мой тестовый комплект",empty:"Выбери карточки: они появятся здесь с общей суммой.",count:"в комплекте",price:"Сумма тестовых цен",sizeUnknown:"без выбранного размера",next:"Перейти к стилисту",clear:"Очистить комплект",notOrder:"Это не корзина. Здесь нельзя купить товар или проверить наличие. Подбор временный и исчезает после перезагрузки.",otherGender:"При смене направления комплект другого пола очищен.",handOff:"Тестовые карточки переданы как ориентир по бюджету, без подтверждения товаров.",color:"Цвет",mockCode:"Демо-код",diagram:"Схематичная иллюстрация одежды, не фотография товара Merdo",noStock:"Не подтверждены ни наличие, ни реальные размеры."
},
tr:{
eyebrow:"BITOS / TEST PRODUCT LAB",title:"Örnek ürün kartları",
intro:"Merdo kataloğunun nasıl çalışabileceğini test ediyoruz: kartlar, renkler, bedenler ve tam kombin. Sekiz ürünün tamamı, fiyatlar ve kodlar arayüz demosu için kurgulanmıştır.",
warning:"GERÇEK MERDO KATALOĞU DEĞİL · FİYATLAR VE BEDENLER ÖRNEK · SATIŞ VE REZERVASYON YOK",
all:"Tümü",woman:"Kadın",man:"Erkek",jacket:"Ceket / blazer",shirt:"Gömlek / üst",trousers:"Pantolon",shoes:"Ayakkabı",category:"Kategori",gender:"Cinsiyet",demo:"ÖRNEK ÜRÜN",sample:"örnek fiyat",select:"Beden (isteğe bağlı)",unset:"Henüz bilmiyorum",add:"Kombinime ekle",remove:"Kombinden çıkar",details:"Ayrıntılar",hide:"Ayrıntıları gizle",summary:"Örnek kombinim",empty:"Ürün kartlarını seçin, toplam örnek tutar burada görünür.",count:"kombinde",price:"Örnek fiyat toplamı",sizeUnknown:"beden seçilmedi",next:"Stilistle devam et",clear:"Kombini temizle",notOrder:"Bu bir alışveriş sepeti değildir. Ürün satın alınamaz veya stok sorgulanamaz. Seçim sayfa yenilendiğinde temizlenir.",otherGender:"Farklı tarz yönüne geçildiği için önceki kombin temizlendi.",handOff:"Örnek kart tutarı yalnızca stilist bütçesine aktarıldı; stok veya ürün doğrulanmadı.",color:"Renk",mockCode:"Örnek kod",diagram:"Şematik çizim; gerçek Merdo ürün fotoğrafı değil",noStock:"Gerçek stok ve bedenler doğrulanmadı."
}};
let gender="all",category="all",selected=new Map(),sizes=new Map(),expanded=new Set(),notice="";
const tr=k=>(locale[document.documentElement.lang==="ru"?"ru":"tr"])[k];
const lang=()=>document.documentElement.lang==="ru"?"ru":"tr";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>new Intl.NumberFormat(lang()==="ru"?"ru-RU":"tr-TR",{maximumFractionDigits:0}).format(v)+" ₺";
const name=p=>lang()==="ru"?p.nameRu:p.nameTr;
const swatchColor=p=>lang()==="ru"?p.colorRu:p.colorTr;
function drawing(p){
const fill=p.color,trim="#d8b99a",line="#69584e";
const parts={
jacket:'<path d="M126 53 159 42 192 53 216 78 242 127 221 148 220 274 99 274 98 148 77 127 102 78Z" fill="'+fill+'" stroke="'+line+'" stroke-width="3"/><path d="M126 53 160 102 144 147 117 90Z M192 53 160 102 176 147 203 90Z" fill="#f1e9df" stroke="'+line+'" stroke-width="2"/><path d="M160 102 160 270" stroke="'+line+'" stroke-width="2"/><path d="M122 189 145 189 M175 189 198 189" stroke="'+trim+'" stroke-width="5" stroke-linecap="round"/><circle cx="166" cy="184" r="3" fill="'+trim+'"/><circle cx="166" cy="206" r="3" fill="'+trim+'"/>',
shirt:'<path d="M129 49 160 57 190 49 217 73 244 113 218 137 207 123 207 267 113 267 113 123 102 137 76 113 103 73Z" fill="'+fill+'" stroke="'+line+'" stroke-width="3"/><path d="M130 49 160 77 146 98 120 64Z M190 49 160 77 174 98 201 64Z" fill="#fffaf2" stroke="'+line+'" stroke-width="2"/><path d="M160 77 160 266" stroke="'+line+'" stroke-width="2"/><circle cx="166" cy="122" r="3" fill="'+line+'"/><circle cx="166" cy="150" r="3" fill="'+line+'"/><circle cx="166" cy="178" r="3" fill="'+line+'"/>',
trousers:'<path d="M107 57 214 57 219 146 192 271 163 271 159 155 156 155 153 271 124 271 100 146Z" fill="'+fill+'" stroke="'+line+'" stroke-width="3"/><path d="M107 71 214 71" stroke="#d3c0a8" stroke-width="6"/><path d="M159 95 159 155" stroke="'+line+'" stroke-width="2"/><path d="M136 106 138 242 M181 106 177 242" stroke="#f1e5d1" stroke-width="2" opacity=".65"/>',
shoes:'<path d="M72 163 Q88 135 124 139 L163 158 Q176 171 192 173 L245 184 Q267 196 258 216 L244 226 91 226 Q67 223 66 204Z" fill="'+fill+'" stroke="'+line+'" stroke-width="3"/><path d="M73 204 254 211" fill="none" stroke="#d9caba" stroke-width="7"/><path d="M118 150 126 178 158 186" stroke="#d9caba" stroke-width="3" fill="none"/><path d="M185 172 Q205 145 234 148 L262 158 Q283 168 281 190 L274 205 229 203" fill="'+fill+'" stroke="'+line+'" stroke-width="3"/><path d="M228 201 277 202" stroke="#d9caba" stroke-width="7"/>'
};
return '<svg viewBox="0 0 320 320" role="img" aria-label="'+esc(tr("diagram"))+'" xmlns="http://www.w3.org/2000/svg"><ellipse cx="160" cy="291" rx="91" ry="11" fill="#b9a18e" opacity=".26"/>'+parts[p.kind]+'</svg>';
}
function pill(g,k){return '<button type="button" data-'+g+'="'+k+'" class="sampleFilter '+((g==="gender"?gender:category)===k?"active":"")+'" aria-pressed="'+String((g==="gender"?gender:category)===k)+'">'+tr(k)+'</button>'}
function productCard(p){
const has=selected.has(p.id),open=expanded.has(p.id),size=sizes.get(p.id)||"";
return '<article class="sampleCard" data-sample-id="'+p.id+'">'+
'<div class="sampleArt" style="--sample-tone:'+p.color+'"><span class="sampleStamp">'+tr("demo")+'</span>'+drawing(p)+'</div>'+
'<div class="sampleBody"><div class="sampleEyebrow">'+tr(p.sex)+' · '+tr(p.kind)+'</div>'+
'<h3>'+esc(name(p))+'</h3><div class="sampleColor"><span class="sampleSwatch" style="background:'+p.color+'"></span>'+esc(swatchColor(p))+'</div>'+
'<div class="samplePrice">'+money(p.price)+' <small>'+tr("sample")+'</small></div>'+
'<label class="sampleSize">'+tr("select")+'<select name="sample-size-'+p.id+'"><option value="">'+tr("unset")+'</option>'+p.sizes.map(x=>'<option value="'+x+'" '+(x===size?"selected":"")+'>'+x+'</option>').join("")+'</select></label>'+
'<div class="sampleActions"><button type="button" data-sample-action="toggle" data-id="'+p.id+'" class="'+(has?"sampleAdded":"sampleAdd")+'" aria-pressed="'+has+'">'+(has?"✓ "+tr("remove"):"+ "+tr("add"))+'</button><button type="button" data-sample-action="details" data-id="'+p.id+'" class="sampleMore" aria-expanded="'+open+'">'+tr(open?"hide":"details")+'</button></div>'+
(open?'<div class="sampleDetails"><p>'+esc(lang()==="ru"?p.noteRu:p.noteTr)+'</p><p><b>'+tr("mockCode")+':</b> '+p.id+'</p><p>'+tr("noStock")+'</p></div>':"")+
'</div></article>';
}
function summary(){
const items=[...selected.values()],amount=items.reduce((s,p)=>s+p.price,0);
return '<section id="sampleLook" class="sampleLook" aria-label="'+tr("summary")+'">'+
'<div><span class="sampleLookKicker">LOOK BUILDER / DEMO</span><h3>'+tr("summary")+' <span class="sampleCount">'+items.length+'</span></h3>'+
(items.length?'<ul class="sampleItems">'+items.map(p=>'<li><span>'+esc(name(p))+' <small>· '+(sizes.get(p.id)||tr("sizeUnknown"))+'</small></span><b>'+money(p.price)+'</b><button type="button" data-sample-action="remove" data-id="'+p.id+'" aria-label="'+tr("remove")+' · '+esc(name(p))+'">×</button></li>').join("")+'</ul>':'<p class="sampleEmpty">'+tr("empty")+'</p>')+
'<p class="sampleLookFoot">'+tr("notOrder")+'</p></div>'+
'<div class="sampleLookTotal"><span>'+tr("price")+'</span><strong>'+money(amount)+'</strong><button type="button" id="sampleToStylist" '+(!items.length?"disabled":"")+'>'+tr("next")+' →</button><button type="button" id="sampleReset" '+(!items.length?"disabled":"")+'>'+tr("clear")+'</button></div></section>';
}
function render(){
const visible=products.filter(p=>(gender==="all"||p.sex===gender)&&(category==="all"||p.kind===category));
root.innerHTML='<div class="sampleIntro"><div><span class="sampleKicker">'+tr("eyebrow")+'</span><h2>'+tr("title")+'</h2><p>'+tr("intro")+'</p></div><span class="sampleIntroCount">'+products.length+' DEMO</span></div>'+
'<div class="sampleWarning" role="note">'+tr("warning")+'</div>'+
'<div class="sampleFilters"><div role="group" aria-label="'+tr("gender")+'">'+["all","woman","man"].map(k=>pill("gender",k)).join("")+'</div>'+
'<div role="group" aria-label="'+tr("category")+'">'+["all","jacket","shirt","trousers","shoes"].map(k=>pill("kind",k)).join("")+'</div></div>'+
'<div class="sampleGrid">'+visible.map(productCard).join("")+'</div><p class="sampleNotice" role="status" aria-live="polite">'+esc(notice)+'</p>'+summary();
}
root.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
if(b.dataset.gender){gender=b.dataset.gender;render();return}
if(b.dataset.kind){category=b.dataset.kind;render();return}
if(b.id==="sampleReset"){selected.clear();notice="";render();return}
if(b.id==="sampleToStylist"){
 const items=[...selected.values()];if(!items.length)return;
 const sum=items.reduce((a,p)=>a+p.price,0), sex=items[0].sex;
 if(window.BitOSJourney?.startFromSamples)window.BitOSJourney.startFromSamples({gender:sex,budget:sum,count:items.length});
 else if(window.BitOSJourney?.start)window.BitOSJourney.start();
 return
}
const action=b.dataset.sampleAction,id=b.dataset.id,p=products.find(x=>x.id===id);if(!p)return;
if(action==="details"){
 if(expanded.has(id))expanded.delete(id);else expanded.add(id);
 render();root.querySelector('[data-sample-action="details"][data-id="'+id+'"]')?.focus({preventScroll:true});return;
}
if(action==="remove"||action==="toggle"&&selected.has(id)){selected.delete(id);notice="";render();root.querySelector('[data-sample-action="toggle"][data-id="'+id+'"]')?.focus({preventScroll:true});return}
if(action==="toggle"){
 if([...selected.values()].some(x=>x.sex!==p.sex)){selected.clear();notice=tr("otherGender")}
 else notice="";
 selected.set(id,p);render();root.querySelector('[data-sample-action="toggle"][data-id="'+id+'"]')?.focus({preventScroll:true});
}
});
root.addEventListener("change",e=>{
const el=e.target;const m=/^sample-size-(TEST-[WM]-\d{2})$/.exec(el.name||"");
if(!m)return;
const p=products.find(x=>x.id===m[1]);if(!p||el.value&&!p.sizes.includes(el.value))return;
sizes.set(p.id,el.value);render();root.querySelector('select[name="sample-size-'+p.id+'"]')?.focus({preventScroll:true});
});
document.getElementById("language")?.addEventListener("click",render);
window.BitOSDemoCards={getSelection(){return [...selected.values()].map(p=>({id:p.id,gender:p.sex,price:p.price,size:sizes.get(p.id)||null}))},clear(){selected.clear();render()}};
render();
})();