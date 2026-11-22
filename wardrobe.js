/* BitOS My Wardrobe MVP: category-presence only, held on this device. */
(function(){
"use strict";
const root=document.getElementById("myWardrobe");
if(!root)return;
const storageKey="bitos:wardrobe:v1";
const keys=["jacket","shirt","trousers","shoes","details"];
const symbol={jacket:"♢",shirt:"◈",trousers:"▥",shoes:"↗",details:"✧"};
const text={
ru:{eyebrow:"МОЙ ГАРДЕРОБ",headline:"Что у тебя уже есть?",intro:"Отметь вещи, которые можно использовать в новом образе. Стилист предложит недостающие категории — без лишних покупок.",jacket:"Пиджак / жакет",shirt:"Рубашка / верх",trousers:"Брюки",shoes:"Обувь",details:"Аксессуары",in:"Уже есть",out:"Не отмечено",summary:"категорий отмечено",action:"Собрать из того, что есть",clear:"Очистить",privacy:"Сохраняется только выбор категорий в этом браузере. Не передаём магазину. Сочетаемость, размеры и состояние вещей нужно проверить.",reset:"Выбор очищен",noStore:"Браузер не разрешил сохранить выбор, он действует только до закрытия страницы."},
tr:{eyebrow:"GARDIROBUM",headline:"Zaten nelerin var?",intro:"Yeni kombininde kullanabileceğin parçaları işaretle. Stilist gereksiz ürünler yerine eksik kategorileri önerir.",jacket:"Ceket / blazer",shirt:"Gömlek / üst",trousers:"Pantolon",shoes:"Ayakkabı",details:"Aksesuar",in:"Bende var",out:"İşaretlenmedi",summary:"kategori işaretlendi",action:"Mevcutlarımla kombin oluştur",clear:"Seçimi temizle",privacy:"Yalnızca kategori seçimleri bu tarayıcıda saklanır. Mağazayla paylaşılmaz. Uyum, beden ve durum prova sırasında doğrulanmalıdır.",reset:"Seçim temizlendi",noStore:"Tarayıcı kaydetmeye izin vermedi; seçimler sadece bu sayfada geçerli."}
};
let stored=true;
const fresh=()=>Object.fromEntries(keys.map(k=>[k,false]));
function load(){
try{
const data=JSON.parse(localStorage.getItem(storageKey)||"null");
if(!data||typeof data!=="object"||Array.isArray(data))return fresh();
return Object.fromEntries(keys.map(k=>[k,data[k]===true]));
}catch(e){stored=false;return fresh()}
}
let owned=load();
const tr=k=>text[document.documentElement.lang==="ru"?"ru":"tr"][k];
const icon="✦";
function emit(){window.dispatchEvent(new CustomEvent("bitos:wardrobe-change",{detail:{owned:{...owned}}}))}
function persist(){
try{localStorage.setItem(storageKey,JSON.stringify(owned));stored=true}
catch(e){stored=false}
emit()
}
function card(k){
return '<label class="wardrobeCategory '+(owned[k]?"owned":"")+'"><input type="checkbox" name="wardrobe-'+k+'" '+(owned[k]?"checked":"")+'><span class="wardrobeSymbol" aria-hidden="true">'+symbol[k]+'</span><span class="wardrobeCopy"><strong>'+tr(k)+'</strong><small>'+tr(owned[k]?"in":"out")+'</small></span><span class="wardrobeCheck" aria-hidden="true">'+(owned[k]?"✓":"+")+'</span></label>'
}
function render(){
const count=keys.filter(k=>owned[k]).length;
root.innerHTML='<div class="wardrobeHead"><span class="wardrobeMini">'+tr("eyebrow")+'</span><h2>'+tr("headline")+'</h2><p>'+tr("intro")+'</p></div>'+
'<div class="wardrobeStatus"><strong>'+count+' / 5</strong><span>'+tr("summary")+'</span><div class="wardrobeMeter" role="progressbar" aria-label="'+tr("summary")+'" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+count+'"><i style="width:'+(count*20)+'%"></i></div></div>'+
'<div class="wardrobeCategories">'+keys.map(card).join("")+'</div>'+
'<div class="wardrobeActions"><button type="button" id="wardrobeProceed">'+tr("action")+' →</button><button type="button" id="wardrobeClear">'+tr("clear")+'</button></div>'+
'<p class="wardrobePrivacy">'+tr("privacy")+(stored?"":" "+tr("noStore"))+'</p>';
}
root.addEventListener("change",e=>{
const input=e.target;
if(!input.matches('input[type="checkbox"][name^="wardrobe-"]'))return;
const key=input.name.slice("wardrobe-".length);
if(!keys.includes(key))return;
owned[key]=input.checked;persist();render()
});
root.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
if(b.id==="wardrobeClear"){owned=fresh();persist();render()}
if(b.id==="wardrobeProceed"){
if(window.BitOSJourney?.start){window.BitOSJourney.start()}
else document.getElementById("styleJourney")?.scrollIntoView({behavior:"smooth"});
}
});
document.getElementById("language")?.addEventListener("click",render);
window.BitOSWardrobe={
getOwned(){return {...owned}},
getCount(){return keys.filter(k=>owned[k]).length},
clear(){owned=fresh();persist();render()}
};
render();emit();
})();