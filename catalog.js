/* Catalog verification gate. Never turn broad store mentions into fake product inventory. */
(function(){
"use strict";
const root=document.getElementById("catalogStatus");if(!root)return;
const words={
ru:{
eyebrow:"ДАННЫЕ МАГАЗИНА",title:"Каталог Merdo: что действительно подтверждено",intro:"Мы нашли магазин и публичные упоминания ассортимента. Но не нашли проверяемую актуальную выгрузку товаров с артикулами, ценами, размерами и остатками. Поэтому BitOS пока показывает идеи образов — не товары в продаже.",
offlineTitle:"Магазин подтверждён",offline:"Merdo Mağazaları указан среди магазинов Gazipaşa Airport AVM в Турции.",
offlineLink:"Список магазинов AVM",siteTitle:"Онлайн-каталог не подтверждён",site:"На merdostore.com перечислены категории и бренды, но найденная страница содержит шаблонные блоки. Не подтверждено, что сайт отражает актуальные товары конкретной точки Merdo.",
siteLink:"Проверить источник",brands:"На найденном сайте упоминаются Cazador, U.S. Polo Assn., Benetton и Süvari. Это не доказательство наличия конкретных моделей.",
products:"Подтверждённых SKU в BitOS",count:"0",status:"Пока без реальных цен и заказов",
action:"Запросить актуальный ассортимент",copy:"Скопировать запрос",copied:"Текст запроса скопирован",manual:"Не удалось скопировать автоматически. Скопируйте текст из поля.",disclosure:"Ничего не отправляется. Текст можно передать магазину самостоятельно.",ask:"Здравствуйте! Увидел(а) независимый концепт Merdo × BitOS. Подскажите, пожалуйста, где посмотреть актуальный каталог Merdo с фотографиями, артикулами, ценами, размерами и наличием? Нужна информация по следующим категориям: ",all:"одежда, обувь и аксессуары",none:"подбор сочетаний уже имеющихся вещей",fit:"Есть ли возможность примерки и отдельно оплачиваемой подгонки у портного? Пожалуйста, уточните условия и стоимость.",
close:"Закрыть"
},
tr:{
eyebrow:"MAĞAZA VERİLERİ",title:"Merdo kataloğu: neler doğrulandı?",intro:"Mağazayı ve ürün gruplarına dair kaynakları bulduk. Ancak SKU, fiyat, beden ve anlık stok içeren doğrulanmış güncel bir katalog bulamadık. BitOS şimdilik satılık ürünleri değil, kombin fikirlerini gösterir.",
offlineTitle:"Mağaza doğrulandı",offline:"Merdo Mağazaları, Gazipaşa Airport AVM mağaza listesinde yer alıyor.",
offlineLink:"AVM mağaza listesi",siteTitle:"Online katalog doğrulanmadı",site:"merdostore.com adresinde kategori ve marka adları var, fakat erişilebilen sayfada şablon içerik bulunuyor. Sitenin bu mağazanın güncel stoğunu yansıttığı teyit edilmedi.",
siteLink:"Kaynağa bak",brands:"Bulunan sitede Cazador, U.S. Polo Assn., Benetton ve Süvari adları geçiyor. Bu belirli ürünlerin stokta olduğunu kanıtlamaz.",
products:"BitOS'ta doğrulanan SKU",count:"0",status:"Şimdilik gerçek fiyat veya sipariş yok",
action:"Güncel ürünleri sor",copy:"Talebi kopyala",copied:"Talep metni kopyalandı",manual:"Otomatik kopyalama başarısız oldu. Metni seçip kopyalayabilirsiniz.",disclosure:"Mesaj otomatik gönderilmez. Metni mağazaya kendiniz iletebilirsiniz.",ask:"Merhaba! Bağımsız Merdo × BitOS konseptini gördüm. Fotoğraf, ürün kodu, güncel fiyat, beden ve stok içeren Merdo kataloğunu nereden görebilirim? Şu kategorilerle ilgileniyorum: ",all:"giyim, ayakkabı ve aksesuarlar",none:"mevcut gardırobumdaki parçaların uyumu",fit:"Prova imkânı ve ayrıca ücretlendirilen terzi hizmeti var mı? Koşulları ve fiyatı öğrenebilir miyim?",
close:"Kapat"
}};
const categories={jacket:["пиджаки и жакеты","ceket ve blazer"],shirt:["рубашки и верх","gömlek ve üst"],trousers:["брюки","pantolon"],shoes:["обувь","ayakkabı"],details:["аксессуары","aksesuar"]};
const lang=()=>document.documentElement.lang==="ru"?"ru":"tr";
const tr=k=>words[lang()][k];
function requestText(){
const ownership=window.BitOSWardrobe?.getOwned?.();
const missing=ownership?Object.keys(categories).filter(k=>!ownership[k]):[];
const selected=ownership?(missing.length?missing.map(k=>categories[k][lang()==="ru"?0:1]).join(", "):tr("none")):tr("all");
return tr("ask")+selected+". "+tr("fit")
}
function render(){
root.innerHTML='<div class="catalogHeader"><div><span class="catalogEyebrow">'+tr("eyebrow")+'</span><h2>'+tr("title")+'</h2><p>'+tr("intro")+'</p></div><div class="catalogNumber"><b>0</b><span>'+tr("products")+'</span></div></div>'+
'<div class="catalogFacts"><article><strong>✓ '+tr("offlineTitle")+'</strong><p>'+tr("offline")+'</p><a href="https://gzpairportavm.com/projeler" target="_blank" rel="noopener noreferrer">'+tr("offlineLink")+' ↗</a></article><article><strong>○ '+tr("siteTitle")+'</strong><p>'+tr("site")+'</p><a href="https://merdostore.com/" target="_blank" rel="noopener noreferrer">'+tr("siteLink")+' ↗</a></article></div>'+
'<p class="catalogBrands">'+tr("brands")+'</p>'+
'<div class="catalogLead"><div><strong>'+tr("status")+'</strong><p>'+tr("disclosure")+'</p></div><button id="catalogAsk" type="button">'+tr("action")+' →</button></div>'+
'<div id="catalogRequest" hidden><label for="catalogDraft">'+tr("disclosure")+'</label><textarea id="catalogDraft" rows="4" readonly></textarea><button type="button" id="catalogCopy">'+tr("copy")+'</button><button type="button" id="catalogClose">'+tr("close")+'</button><p id="catalogFeedback" role="status" aria-live="polite"></p></div>'
}
root.addEventListener("click",async e=>{
const b=e.target.closest("button");if(!b)return;
if(b.id==="catalogAsk"){
root.querySelector("#catalogDraft").value=requestText();
root.querySelector("#catalogRequest").hidden=false;
root.querySelector("#catalogDraft").focus();
}
if(b.id==="catalogClose"){root.querySelector("#catalogRequest").hidden=true;root.querySelector("#catalogAsk").focus()}
if(b.id==="catalogCopy"){
const value=root.querySelector("#catalogDraft").value;
try{await navigator.clipboard.writeText(value);root.querySelector("#catalogFeedback").textContent=tr("copied")}
catch(err){root.querySelector("#catalogFeedback").textContent=tr("manual");root.querySelector("#catalogDraft").focus();root.querySelector("#catalogDraft").select()}
}
});
document.getElementById("language")?.addEventListener("click",render);
window.addEventListener("bitos:wardrobe-change",()=>{const input=root.querySelector("#catalogDraft");if(input)input.value=requestText()});
render()
})();