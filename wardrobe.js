/* BitOS My Wardrobe v2: one garment per category, color, cut and optional local photo.
   Photos are resized on-device, stored only in localStorage, never uploaded. */
(function(){
"use strict";
const root=document.getElementById("myWardrobe");if(!root)return;
const storageKey="bitos:wardrobe:v2",legacyKey="bitos:wardrobe:v1";
const keys=["jacket","shirt","trousers","shoes","details"];
const symbols={jacket:"♢",shirt:"◈",trousers:"▥",shoes:"↗",details:"✧"};
const colorKeys=["unknown","black","navy","gray","white","beige","brown","blue","other"];
const cuts={
 jacket:["unknown","structured","relaxed","oversize"],
 shirt:["unknown","classic","fitted","relaxed"],
 trousers:["unknown","straight","tapered","relaxed"],
 shoes:["unknown","derby","loafers","sneakers"],
 details:["unknown","minimal","classic","statement"]
};
const language={
ru:{
eyebrow:"МОЙ ГАРДЕРОБ",headline:"Что у тебя уже есть?",intro:"Отметь свои вещи, укажи цвет и фасон, при желании добавь фото. Стилист учтёт это, не предлагая покупать то же самое.",
jacket:"Пиджак / жакет",shirt:"Рубашка / верх",trousers:"Брюки",shoes:"Обувь",details:"Аксессуары",
in:"Уже есть",out:"Не отмечено",summary:"категорий отмечено",action:"Собрать из того, что есть",clear:"Очистить всё",
privacy:"Ваш выбор, цвет, фасон и уменьшенные фотографии хранятся только в этом браузере. Они не загружаются на сервер и не добавляются в запрос магазину. Цвет и фасон вы указываете сами; автоматического анализа фото нет. Проверяйте сочетаемость и посадку при примерке.",
noStore:"Сохранение на этом устройстве недоступно. После обновления страницы выбор может исчезнуть.",
color:"Цвет вещи",cut:"Фасон / тип",photo:"Добавить своё фото",removePhoto:"Удалить фото",photoAlt:"Моя вещь",photoHelp:"JPEG, PNG или WebP до 8 МБ. Изображение уменьшается перед сохранением.",invalidPhoto:"Выберите JPEG, PNG или WebP не больше 8 МБ.",photoError:"Не удалось обработать фото. Попробуйте другой файл.",saveError:"Не удалось сохранить фото. Освободите память браузера или удалите старое изображение.",photoSaved:"Фото сохранено в этом браузере",photoNone:"Фото необязательно",edit:"Детали моей вещи",privacyTag:"Только на устройстве",
unknown:"Не указывать",black:"Чёрный",navy:"Тёмно-синий",gray:"Серый",white:"Белый",beige:"Бежевый",brown:"Коричневый",blue:"Голубой / синий",other:"Другой",
structured:"Структурный",relaxed:"Свободный",oversize:"Оверсайз",classic:"Классический",fitted:"Приталенный",straight:"Прямой",tapered:"Зауженный",derby:"Дерби",loafers:"Лоферы",sneakers:"Кроссовки",minimal:"Минималистичный",statement:"Акцентный"
},
tr:{
eyebrow:"GARDIROBUM",headline:"Zaten nelerin var?",intro:"Kıyafetlerini işaretle; renk ve kesimini seç, istersen fotoğraf ekle. Stilist sahip olduklarını yeniden satın almanı istemez.",
jacket:"Ceket / blazer",shirt:"Gömlek / üst",trousers:"Pantolon",shoes:"Ayakkabı",details:"Aksesuar",
in:"Bende var",out:"İşaretlenmedi",summary:"kategori işaretlendi",action:"Mevcutlarımla kombin oluştur",clear:"Hepsini temizle",
privacy:"Seçimler, renk, kesim ve küçültülmüş fotoğraflar yalnızca bu tarayıcıda saklanır. Sunucuya yüklenmez veya mağazaya yazılan mesajlara eklenmez. Otomatik fotoğraf analizi yoktur; renk ve kesimi siz seçersiniz. Uyum ve kalıp prova sırasında doğrulanır.",
noStore:"Bu cihazda kayıt mümkün değil. Sayfayı yenilediğinizde seçimler kaybolabilir.",
color:"Renk",cut:"Kesim / tür",photo:"Fotoğraf ekle",removePhoto:"Fotoğrafı sil",photoAlt:"Kendi kıyafetim",photoHelp:"En fazla 8 MB JPEG, PNG veya WebP. Saklanmadan önce küçültülür.",invalidPhoto:"8 MB altı JPEG, PNG veya WebP seçin.",photoError:"Fotoğraf işlenemedi. Başka bir dosya deneyin.",saveError:"Fotoğraf kaydedilemedi. Tarayıcı alanı açın veya eski fotoğrafı silin.",photoSaved:"Fotoğraf bu tarayıcıya kaydedildi",photoNone:"Fotoğraf isteğe bağlı",edit:"Kıyafet ayrıntıları",privacyTag:"Yalnızca bu cihazda",
unknown:"Belirtmek istemiyorum",black:"Siyah",navy:"Lacivert",gray:"Gri",white:"Beyaz",beige:"Bej",brown:"Kahverengi",blue:"Mavi / açık mavi",other:"Diğer",
structured:"Yapılı",relaxed:"Rahat",oversize:"Oversize",classic:"Klasik",fitted:"Vücuda oturan",straight:"Düz",tapered:"Daralan",derby:"Derby",loafers:"Loafer",sneakers:"Spor ayakkabı",minimal:"Minimal",statement:"Öne çıkan"
}};
const empty=()=>({owned:false,color:"unknown",cut:"unknown",photo:""});
const photoOK=x=>typeof x==="string"&&x.length<750000&&/^data:image\/(?:webp|jpeg);base64,[a-zA-Z0-9+/=]+$/.test(x);
const normalize=(source)=>{
 const d={};for(const k of keys){
 const x=source?.[k];
 if(x&&typeof x==="object"&&!Array.isArray(x)){
 d[k]={owned:x.owned===true,color:colorKeys.includes(x.color)?x.color:"unknown",cut:cuts[k].includes(x.cut)?x.cut:"unknown",photo:photoOK(x.photo)?x.photo:""};
 }else d[k]={...empty(),owned:x===true};
 }return d;
};
let canStore=true;
function load(){
 try{
 const value=localStorage.getItem(storageKey);
 if(value)return normalize(JSON.parse(value));
 return normalize(JSON.parse(localStorage.getItem(legacyKey)||"null"));
 }catch(e){canStore=false;return normalize(null)}
}
let items=load();
let error="";
const t=k=>language[document.documentElement.lang==="ru"?"ru":"tr"][k]||k;
const html=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function summary(){return Object.fromEntries(keys.map(k=>[k,items[k].owned===true]))}
function details(){return Object.fromEntries(keys.map(k=>[k,{owned:items[k].owned,color:items[k].color,cut:items[k].cut,hasPhoto:!!items[k].photo}]))}
function emit(){window.dispatchEvent(new CustomEvent("bitos:wardrobe-change",{detail:{owned:summary(),details:details()}}))}
function persist(){
 try{localStorage.setItem(storageKey,JSON.stringify(items));canStore=true;emit();return true}
 catch(e){canStore=false;emit();return false}
}
function select(k,field,values){
 return '<label class="wardrobeField">'+t(field)+'<select name="wardrobe-'+field+'-'+k+'">'+values.map(v=>'<option value="'+v+'" '+(items[k][field]===v?"selected":"")+'>'+html(t(v))+'</option>').join("")+'</select></label>';
}
function card(k){
 const item=items[k],owned=item.owned;
 return '<article class="wardrobeCategory '+(owned?"owned":"")+'" data-wardrobe-item="'+k+'">'+
 '<label class="wardrobeToggle"><input type="checkbox" name="wardrobe-'+k+'" '+(owned?"checked":"")+'><span class="wardrobeSymbol" aria-hidden="true">'+symbols[k]+'</span><span class="wardrobeCopy"><strong>'+t(k)+'</strong><small>'+t(owned?"in":"out")+'</small></span><span class="wardrobeCheck" aria-hidden="true">'+(owned?"✓":"+")+'</span></label>'+
 (owned?'<div class="wardrobeEditor"><div class="wardrobeFields">'+select(k,"color",colorKeys)+select(k,"cut",cuts[k])+'</div>'+
 '<div class="wardrobePhotoSlot">'+(item.photo?'<img class="wardrobePhoto" src="'+item.photo+'" alt="'+html(t("photoAlt"))+'">':'<span class="wardrobePhotoPlaceholder">'+t("photoNone")+'</span>')+'</div>'+
 '<div class="wardrobePhotoControls"><label class="wardrobeUpload">'+t("photo")+'<input type="file" name="wardrobe-photo-'+k+'" accept="image/jpeg,image/png,image/webp" aria-label="'+t("photo")+' · '+t(k)+'"></label>'+
 (item.photo?'<button type="button" data-photo-remove="'+k+'">'+t("removePhoto")+'</button>':"")+'</div>'+
 '<p class="wardrobePhotoHint">'+(item.photo?t("photoSaved"):t("photoHelp"))+'</p></div>':"")+
 '</article>';
}
function renderAndFocus(name){
 render();
 if(!name)return;
 const target=Array.from(root.querySelectorAll("input,select,button")).find(el=>el.name===name||el.id===name);
 target?.focus({preventScroll:true});
}
function render(){
 const count=keys.filter(k=>items[k].owned).length;
 root.innerHTML='<div class="wardrobeHead"><span class="wardrobeMini">'+t("eyebrow")+'</span><h2>'+t("headline")+'</h2><p>'+t("intro")+'</p></div>'+
 '<div class="wardrobeStatus"><strong>'+count+' / 5</strong><span>'+t("summary")+'</span><div class="wardrobeMeter" role="progressbar" aria-label="'+t("summary")+'" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+count+'"><i style="width:'+(count*20)+'%"></i></div></div>'+
 '<div class="wardrobeCategories">'+keys.map(card).join("")+'</div>'+
 '<p class="wardrobeError" role="status" aria-live="polite">'+html(error)+'</p>'+
 '<div class="wardrobeActions"><button type="button" id="wardrobeProceed">'+t("action")+' →</button><button type="button" id="wardrobeClear">'+t("clear")+'</button></div>'+
 '<p class="wardrobePrivacy">'+t("privacy")+(canStore?"":" "+t("noStore"))+'</p>';
}
async function compress(file){
 // Draw decoded pixels to Canvas. Do not preserve original file or EXIF metadata.
 // HTMLImageElement decoding is a fallback for browsers lacking createImageBitmap.
 let source=null, release=()=>{};
 if(typeof createImageBitmap==="function"){
  try{source=await createImageBitmap(file);release=()=>source.close()}catch(e){source=null}
 }
 if(!source){
  const objectUrl=URL.createObjectURL(file);
  try{
   source=await new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(Error("Image decode failed"));
    image.src=objectUrl;
   });
  }catch(e){URL.revokeObjectURL(objectUrl);throw e}
  release=()=>URL.revokeObjectURL(objectUrl);
 }
 try{
  const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;
  if(!width||!height||width>20000||height>20000)throw Error("Unsupported dimensions");
  const scale=Math.min(1,640/Math.max(width,height));
  const c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(width*scale));
  c.height=Math.max(1,Math.round(height*scale));
  const ctx=c.getContext("2d",{alpha:false});
  if(!ctx)throw Error("Canvas unavailable");
  ctx.drawImage(source,0,0,c.width,c.height);
  let result=c.toDataURL("image/webp",.7);
  if(!photoOK(result))result=c.toDataURL("image/jpeg",.65);
  if(!photoOK(result))throw Error("Image too large after downscale");
  return result;
 }finally{release()}
}
root.addEventListener("change",async e=>{
 const input=e.target;const name=input.name||"";
 if(name.startsWith("wardrobe-photo-")){
  const k=name.slice("wardrobe-photo-".length),file=input.files?.[0];
  if(!keys.includes(k)||!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8*1024*1024){
   error=t("invalidPhoto");render();return;
  }
  try{
   const photo=await compress(file);
   const previous=items[k].photo;items[k].photo=photo;error="";
   if(!persist()){items[k].photo=previous;error=t("saveError");persist()}
  }catch(e){error=t("photoError")}
  render();return;
 }
 if(name.startsWith("wardrobe-color-")||name.startsWith("wardrobe-cut-")){
  const field=name.startsWith("wardrobe-color-")?"color":"cut";
  const k=name.slice(("wardrobe-"+field+"-").length);
  if(!keys.includes(k))return;
  const valid=field==="color"?colorKeys:cuts[k];
  if(!valid.includes(input.value))return;
  items[k][field]=input.value;error="";persist();renderAndFocus(name);return;
 }
 if(/^wardrobe-(jacket|shirt|trousers|shoes|details)$/.test(name)){
  const k=name.slice("wardrobe-".length);items[k].owned=input.checked;
  if(!input.checked){items[k].photo="";items[k].color="unknown";items[k].cut="unknown"}
  error="";persist();renderAndFocus(name);
 }
});
root.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.photoRemove){const k=b.dataset.photoRemove;
  if(keys.includes(k)){items[k].photo="";error="";persist();render()}return}
 if(b.id==="wardrobeClear"){items=normalize(null);error="";persist();renderAndFocus("wardrobeClear");return}
 if(b.id==="wardrobeProceed"){
  if(window.BitOSJourney?.start)window.BitOSJourney.start();
  else document.getElementById("styleJourney")?.scrollIntoView({behavior:"smooth"});
 }
});
document.getElementById("language")?.addEventListener("click",render);
window.BitOSWardrobe={
 getOwned(){return summary()},
 getDetails(){return details()},
 getCount(){return keys.filter(k=>items[k].owned).length},
 clear(){items=normalize(null);error="";persist();render()}
};
render();emit();
})();