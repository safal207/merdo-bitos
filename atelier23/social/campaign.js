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
