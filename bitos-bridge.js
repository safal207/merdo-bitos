/* BitOS legacy -> Grok transfer. Explicit, same-origin and one-time.
 * Transfers only category flags, manually selected color/cut and demo item
 * labels / sizes / mock prices. NEVER transfers user photos or contact data.
 */
(function(){
"use strict";
const key="bitos:grok-handoff:v1";
const roots=[["demoProducts","samples"],["myWardrobe","wardrobe"]];
const dictionary={
ru:{
samplesTitle:"Продолжить с выбранными карточками",samplesText:"Передадим выбранные демо-вещи, пол и их условную сумму в новый стилист Grok. Это не заказ и не подтверждённые цены Merdo.",samplesButton:"Собрать образ с этими карточками →",
wardrobeTitle:"Перенести мой гардероб в новый стилист",wardrobeText:"Передадим только отмеченные категории, вручную выбранные цвета и фасоны. Личные фотографии не передаются.",wardrobeButton:"Собрать образ из моего гардероба →",
missing:"Сначала выберите хотя бы одну тестовую карточку.",failed:"Не удалось перенести данные: браузер ограничил хранение. Используйте стилиста напрямую.",outdated:"Сначала отметьте вещи в гардеробе.",meta:"Временный перенос в этой вкладке · ничего не отправляется на сервер"
},
tr:{
samplesTitle:"Seçilen ürünlerle devam et",samplesText:"Örnek kartları, cinsiyet ve koşullu fiyat toplamını Grok stilistine aktarırız. Bu bir sipariş veya onaylı Merdo fiyatı değildir.",samplesButton:"Bu kartlarla kombin oluştur →",
wardrobeTitle:"Gardırobumu yeni stiliste aktar",wardrobeText:"Yalnızca kategoriler, sizin seçtiğiniz renkler ve kesimler aktarılır. Kişisel fotoğraflar aktarılmaz.",wardrobeButton:"Gardırobumla kombin oluştur →",
missing:"Önce en az bir örnek ürün seçin.",failed:"Tarayıcı depolaması engelledi; bu bilgileri aktaramadık. Stilisti doğrudan açabilirsiniz.",outdated:"Önce gardırobunuzdaki parçaları seçin.",meta:"Yalnızca bu sekmede geçici aktarım · sunucuya gönderilmez"
}};
const lang=()=>document.documentElement.lang==="ru"?"ru":"tr";
const t=k=>dictionary[lang()][k];
function buildPanel(id,kind){
const root=document.getElementById(id);
if(!root)return;
const p=document.createElement("aside");p.className="bitosHandoff";p.dataset.bridge=kind;
p.innerHTML='<h3></h3><p class="bitosBridgeText"></p><button type="button" class="bitosBridgeGo"></button><small class="bitosBridgeMeta"></small><p class="bitosBridgeStatus" role="status" aria-live="polite"></p>';
root.insertAdjacentElement("afterend",p);
p.querySelector(".bitosBridgeGo").addEventListener("click",()=>go(kind,p));
}
function syncTexts(){
for(const p of document.querySelectorAll(".bitosHandoff")){
const type=p.dataset.bridge;
p.querySelector("h3").textContent=t(type+"Title");
p.querySelector(".bitosBridgeText").textContent=t(type+"Text");
p.querySelector(".bitosBridgeGo").textContent=t(type+"Button");
p.querySelector(".bitosBridgeMeta").textContent=t("meta");
}
}
function go(kind,panel){
let data;
if(kind==="samples"){
const current=window.BitOSDemoCards?.getSelection?.()||[];
if(!current.length){panel.querySelector(".bitosBridgeStatus").textContent=t("missing");return}
const items=current.slice(0,8).map(v=>({
id:v.id,gender:v.gender,kind:v.kind,price:v.price,size:v.size,
nameRu:v.nameRu,nameTr:v.nameTr
}));
const sum=items.reduce((acc,x)=>acc+Number(x.price||0),0);
data={version:1,kind,at:Date.now(),gender:items[0].gender,budget:sum,items};
}else{
const details=window.BitOSWardrobe?.getDetails?.();
if(!details){panel.querySelector(".bitosBridgeStatus").textContent=t("outdated");return}
const owned={};
for(const k of ["jacket","shirt","trousers","shoes","details"]){
const x=details[k]||{};owned[k]={owned:x.owned===true,color:x.color||"unknown",cut:x.cut||"unknown"};
}
data={version:1,kind,at:Date.now(),owned};
}
try{sessionStorage.setItem(key,JSON.stringify(data))}
catch(e){panel.querySelector(".bitosBridgeStatus").textContent=t("failed");return}
window.location.assign("./index.html?handoff="+kind);
}
roots.forEach(([id,kind])=>buildPanel(id,kind));
document.getElementById("language")?.addEventListener("click",syncTexts);
syncTexts();
})();