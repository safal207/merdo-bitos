/* BitOS illustrated, responsive outfit preview.
   This is a constructed fashion sketch, not an AI try-on, a real stock item,
   a photograph of a person, or verified Merdo merchandise. */
(function(){
"use strict";
const palette={
formal:{jacket:"#273b51",shirt:"#f1e5d6",trousers:"#444956",shoes:"#593c2a",detail:"#c6a27d"},
partners:{jacket:"#817362",shirt:"#f4eee4",trousers:"#434c54",shoes:"#624534",detail:"#c19b67"},
creative:{jacket:"#585c65",shirt:"#c7d3c9",trousers:"#323943",shoes:"#9f7659",detail:"#cbb6a2"},
casual:{jacket:"#708173",shirt:"#eee4d5",trousers:"#536b84",shoes:"#e9d9c4",detail:"#c2a384"}
};
const colors={black:"#24272d",navy:"#283b53",gray:"#777a7b",white:"#f4eee6",beige:"#c5b39a",brown:"#755440",blue:"#6e8da9"};
const t={
ru:{
eyebrow:"ВАШ ОБРАЗ · ПРИМЕР",title:"Вот как выглядит комплект",hint:"Визуальный эскиз на основе ваших ответов — не фотография и не виртуальная примерка.",
jacket:"Пиджак / жакет",shirt:"Рубашка / верх",trousers:"Брюки",shoes:"Обувь",
owned:"Уже есть",planned:"Подобрать",disclosure:"Схематичный образ. Фасоны, цвета и товары не подтверждены Merdo; посадку и наличие проверяют отдельно.",
formal:"Деловая классика",partners:"Деловая встреча",creative:"Креативный офис",casual:"Городской casual",
woman:"Женский",man:"Мужской",
pFormalJacket:"Структурный пиджак",pFormalShirt:"Светлая рубашка",pFormalTrousers:"Классические брюки",pFormalShoes:"Туфли",
pCasualJacket:"Лёгкий верхний слой",pCasualShirt:"Трикотаж / футболка",pCasualTrousers:"Прямые брюки",pCasualShoes:"Удобная обувь",
pCreativeJacket:"Свободный жакет",pCreativeShirt:"Однотонный верх",pCreativeTrousers:"Прямой силуэт",pCreativeShoes:"Кеды / лоферы",
pPartnersJacket:"Мягкий пиджак",pPartnersShirt:"Сдержанная рубашка",pPartnersTrousers:"Чиносы / брюки",pPartnersShoes:"Лоферы"
},
tr:{
eyebrow:"KOMBİNİNİZ · ÖRNEK",title:"İşte kombin görünümünüz",hint:"Yanıtlarınıza göre çizilmiş örnek bir kombin; gerçek ürün fotoğrafı veya sanal prova değildir.",
jacket:"Ceket / blazer",shirt:"Gömlek / üst",trousers:"Pantolon",shoes:"Ayakkabı",
owned:"Bende var",planned:"Seçilecek",disclosure:"Şematik bir kombin. Merdo ürünleri, renkleri ve kalıpları doğrulanmamıştır; stok ve beden ayrıca kontrol edilmelidir.",
formal:"Klasik iş stili",partners:"İş görüşmesi",creative:"Özgün ofis",casual:"Günlük şehir",
woman:"Kadın",man:"Erkek",
pFormalJacket:"Klasik ceket",pFormalShirt:"Açık renk gömlek",pFormalTrousers:"Klasik pantolon",pFormalShoes:"Klasik ayakkabı",
pCasualJacket:"Hafif üst katman",pCasualShirt:"Triko / tişört",pCasualTrousers:"Düz pantolon",pCasualShoes:"Rahat ayakkabı",
pCreativeJacket:"Rahat blazer",pCreativeShirt:"Düz renk üst",pCreativeTrousers:"Düz kesim",pCreativeShoes:"Sneaker / loafer",
pPartnersJacket:"Yumuşak ceket",pPartnersShirt:"Sade gömlek",pPartnersTrousers:"Chino / pantolon",pPartnersShoes:"Loafer"
}};
const key=()=>document.documentElement.lang==="ru"?"ru":"tr";
const tr=k=>t[key()][k]||k;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nameKey=(occasion,k)=>"p"+occasion[0].toUpperCase()+occasion.slice(1)+k[0].toUpperCase()+k.slice(1);
const getColors=(options)=>{
 const occasion=palette[options.occasion]||palette.formal;
 const p={...occasion};
 const owned=window.BitOSWardrobe?.getDetails?.()||{};
 for(const k of ["jacket","shirt","trousers","shoes"])
  if(owned[k]?.owned&&colors[owned[k].color])p[k]=colors[owned[k].color];
 return p;
};
function svg(options,p){
const woman=options.gender==="woman",casual=options.occasion==="casual",creative=options.occasion==="creative";
const id="bitosLookGradient"+(woman?"W":"M");
const paint=(c)=>escape(c);
const right=woman?270:277,left=woman?151:144,shoulder=woman?128:119;
const collar=casual?'<path d="M194 124 L209 153 L226 124" fill="none" stroke="#b4a395" stroke-width="3"/>':
'<path d="M188 122 L209 151 L230 122" fill="none" stroke="#b8a594" stroke-width="3"/><path d="M209 151 L209 285" stroke="#bba897" stroke-width="2"/>';
const shoes=casual?
'<path d="M148 458 L185 458 L184 474 Q176 486 146 486 L117 486 Q109 478 124 468Z" fill="'+paint(p.shoes)+'" stroke="#5c4a3b" stroke-width="3"/><path d="M236 458 L273 458 L297 472 Q307 486 284 486 L241 486 Q229 483 236 458Z" fill="'+paint(p.shoes)+'" stroke="#5c4a3b" stroke-width="3"/><path d="M119 479 L184 479 M239 479 L298 479" stroke="#fff8ed" stroke-width="6"/>':
'<path d="M149 453 L187 453 L182 470 L161 477 L121 477 Q114 470 132 460Z" fill="'+paint(p.shoes)+'" stroke="#4b372e" stroke-width="3"/><path d="M231 453 L269 453 L293 467 Q300 477 286 477 L240 477 L231 468Z" fill="'+paint(p.shoes)+'" stroke="#4b372e" stroke-width="3"/>';
const hair=woman?'<path d="M178 76 Q174 23 210 20 Q249 22 243 78 L257 116 L234 119 L232 81 Q206 99 184 80 L186 116 L167 114Z" fill="#3d352d"/>':
'<path d="M180 57 Q184 22 211 22 Q246 24 241 59 Q232 45 222 46 L208 41 L188 54Z" fill="#41362f"/>';
const head='<path d="M182 60 Q182 28 209 28 Q238 28 239 63 L235 91 Q227 110 209 113 Q193 109 186 93Z" fill="#dbc5ac" stroke="#a9937c" stroke-width="2"/>'+hair+'<path d="M199 112 L199 131 L218 143 L224 126 L222 110" fill="#dbc5ac"/>';
const shirt='<path d="M163 132 Q190 119 210 138 Q234 122 253 134 L246 289 L173 289Z" fill="'+paint(p.shirt)+'" stroke="#a18c7b" stroke-width="2"/>'+collar;
const jacket='<path d="M171 124 L139 136 L113 162 L82 275 L109 289 L137 227 L137 318 L198 318 L209 198 L181 151Z" fill="'+paint(p.jacket)+'" stroke="#322e2d" stroke-width="3"/>'+
'<path d="M245 124 L276 135 L306 161 L337 274 L309 288 L278 226 L281 318 L221 318 L210 198 L237 151Z" fill="'+paint(p.jacket)+'" stroke="#322e2d" stroke-width="3"/>'+
'<path d="M171 124 L209 198 L181 170 L165 184 L151 136Z" fill="#e6dbc9" stroke="#76675a" stroke-width="2"/>'+
'<path d="M245 124 L210 198 L239 170 L255 184 L264 137Z" fill="#e6dbc9" stroke="#76675a" stroke-width="2"/>'+
'<path d="M152 256 L185 256 M238 256 L270 256" stroke="#d2bda2" stroke-width="4" stroke-linecap="round"/>'+
'<circle cx="221" cy="258" r="3.3" fill="#d5bea2"/><circle cx="219" cy="281" r="3" fill="#d5bea2"/>';
const pants='<path d="M150 308 L274 308 L276 371 L264 463 L225 463 L210 361 L193 463 L150 463 L141 372Z" fill="'+paint(p.trousers)+'" stroke="#393634" stroke-width="3"/><path d="M155 314 L269 314" stroke="'+paint(p.detail)+'" stroke-width="7"/><path d="M209 325 L208 360" stroke="#dbd0c0" stroke-width="2" opacity=".5"/>';
return '<svg class="lookModel" viewBox="0 0 420 515" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escape(tr("title"))+'"><defs><linearGradient id="'+id+'" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#e9dfd1"/><stop offset="1" stop-color="#cdbdab"/></linearGradient></defs>'+
'<rect width="420" height="515" rx="17" fill="url(#'+id+')"/><path d="M0 390 L420 300 L420 515 L0 515" fill="#fff6e8" opacity=".28"/><circle cx="306" cy="115" r="110" fill="#faf5ed" opacity=".35"/><ellipse cx="210" cy="493" rx="113" ry="13" fill="#76604b" opacity=".18"/>'+
pants+head+shirt+jacket+shoes+
'<text x="23" y="36" font-size="13" font-weight="800" letter-spacing="3" fill="#634d3b">BitOS  /  LOOK</text>'+
'<text x="23" y="497" font-size="10" font-weight="700" letter-spacing="1.8" fill="#594634">ILLUSTRATIVE CONCEPT · DEMO</text></svg>';
}
function render(options={}){
const g=options.gender==="woman"?"woman":"man";
const occasion=palette[options.occasion]?options.occasion:"formal";
const p=getColors({...options,occasion});
const owned=window.BitOSWardrobe?.getOwned?.()||{};
const list=["jacket","shirt","trousers","shoes"];
const captions=list.map(k=>{
const label=tr(nameKey(occasion,k));
return '<div class="lookPart" data-look-piece="'+k+'"><span class="lookSwatch" style="background:'+p[k]+'" aria-hidden="true"></span><span class="lookPartCopy"><strong>'+escape(label)+'</strong><small>'+tr(k)+'</small></span><span class="lookPartStatus '+(owned[k]?"isOwned":"")+'">'+(owned[k]?"✓ "+tr("owned"):tr("planned"))+'</span></div>';
}).join("");
return '<section class="lookPreview" data-look-gender="'+g+'" data-look-occasion="'+occasion+'" tabindex="-1" aria-label="'+escape(tr("title"))+'">'+
'<div class="lookPreviewArt">'+svg({...options,gender:g,occasion},p)+'</div>'+
'<div class="lookPreviewInfo"><span class="lookPreviewEyebrow">'+tr("eyebrow")+'</span><h3>'+tr("title")+'</h3><p class="lookPreviewOccasion">'+tr(occasion)+' · '+tr(g)+'</p><p class="lookPreviewHint">'+tr("hint")+'</p><div class="lookParts">'+captions+'</div><p class="lookPreviewDisclaimer">'+tr("disclosure")+'</p></div></section>';
}
window.BitOSLookPreview={render};
})();