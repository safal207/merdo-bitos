export const topics=Object.freeze({
 craft:{title:"O seu fato começa consigo.",label:"À medida",copy:"Descubra os tecidos, as medidas e a construção que dão forma a uma peça individual.",prompt:"Gostaria de conversar sobre um fato à medida."},
 wedding:{title:"Um fato para o seu grande dia.",label:"Casamento",copy:"Converse sobre a cerimónia, o estilo e o calendário de provas com o atelier.",prompt:"Gostaria de conversar sobre um fato de noivo."},
 gift:{title:"Ofereça uma experiência pessoal.",label:"Cartão oferta",copy:"Explore a possibilidade de oferecer uma experiência de alfaiataria. Confirme valores e condições com o atelier.",prompt:"Gostaria de saber mais sobre o cartão oferta."},
 wardrobe:{title:"Um guarda-roupa com intenção.",label:"Guarda-roupa",copy:"Converse sobre peças que complementem o que já tem e o seu dia a dia.",prompt:"Gostaria de conversar sobre o meu guarda-roupa."}
});
export const SITE="https://atelier23.store/pt";
export const WHATSAPP="https://wa.me/351912204778";
export function campaign(search){
 const q=new URLSearchParams(search);
 const source=q.get("utm_source"),topic=q.get("utm_content");
 return {source:["instagram","tiktok","facebook"].includes(source)?source:"direct",topic:Object.hasOwn(topics,topic)?topic:"craft"};
}
export function destination(topic,kind){
 if(!Object.hasOwn(topics,topic))return null;
 if(kind==="site")return SITE;
 if(kind==="whatsapp")return WHATSAPP+"?text="+encodeURIComponent(topics[topic].prompt);
 return null;
}

 // Official 2026 Christmas guide, checked 2026-11-25. No checkout or guaranteed delivery.
 export const GIFT_GUIDE="https://atelier23.store/pt/pages/christmas-gift-guide";
 export const giftValues=Object.freeze([350,1000,1500,2000]);
 export const giftFormats=Object.freeze(["digital","printed"]);
 export function giftDeadline(format,date){
  if(!giftFormats.includes(format)||typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date+"T00:00:00Z").toISOString().slice(0,10)!==date)return null;
  if(date<"2026-11-25"||date>"2026-12-24")return "outside";
  return date<=(format==="printed"?"2026-12-18":"2026-12-24")?"within":"past";
 }
 export function giftContact(value,format){
  if(!giftValues.includes(value)||!giftFormats.includes(format))return null;
  const message="Gostaria de saber mais sobre o cartão oferta de "+value+" € ("+(format==="digital"?"digital":"impresso")+").";
  return WHATSAPP+"?text="+encodeURIComponent(message);
 }
 export function lisbonDate(){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Lisbon",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const get=t=>parts.find(x=>x.type===t)?.value;
  return [get("year"),get("month"),get("day")].join("-");
 }

 // Source: https://atelier23.store/pages/wedding-suits (official wedding page).
 export const WEDDING_PAGE="https://atelier23.store/pages/wedding-suits";
 export const weddingStyles=Object.freeze({day:"Fato de três peças",evening:"Smoking",both:"Fato e smoking",unsure:"A decidir com o atelier"});
 export const weddingGuests=Object.freeze({father:"Pai do noivo",groomsmen:"Padrinhos"});
 export function validWeddingDate(date,today){
  const valid=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d;
  return valid(date)&&valid(today)&&date>=today;
 }
 export function weddingContact({date="",style="",guests=[]}={},today=lisbonDate()){
  if(!Object.hasOwn(weddingStyles,style)||!Array.isArray(guests)||guests.some(id=>!Object.hasOwn(weddingGuests,id))||(date!==""&&!validWeddingDate(date,today)))return null;
  const selected=Object.keys(weddingGuests).filter(id=>guests.includes(id)).map(id=>weddingGuests[id]);
  const message=["Gostaria de conversar sobre o fato de noivo.","Estilo: "+weddingStyles[style]+".",date?"Data do casamento: "+date+".":"Data a confirmar.",selected.length?"Também gostaria de falar sobre: "+selected.join(", ")+".":""].filter(Boolean).join(" ");
  return WHATSAPP+"?text="+encodeURIComponent(message);
 }
