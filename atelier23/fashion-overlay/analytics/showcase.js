// Synthetic illustrative 30-day cohort. Never written to the local event log.
export const DEMO=Object.freeze({
 period:"Условный период · 30 дней",
 starts:1000,filmViews:820,lookViews:1460,likes:310,unlikes:26,saves:180,unsaves:17,shares:84,copied:35,shareResolved:22,occasions:420,looks:180,booking:72,tailoring:94,visits:1000,
 confirmed:40,attended:24,sales:12,revenue:2160000,
 funnel:[
 ["Запустили ролик",1000],["Просмотрели ≥ 3 с",820],["Выбрали повод",420],["Выбрали образ",180],["Перешли к записи",72],["Запись подтверждена",40],["Посетили ателье",24],["Купили",12]
 ],
 retention:[[0,1000],[1,940],[2,875],[3,820],[4,770],[5,724],[6,688],[7,645],[8,610],[9,577],[10,550],[11,522],[12,495],[13,468],[14,441],[15,414],[16,390],[17,365],[17.64,350]],
 scenes:[
 {id:"emotion",range:"0–2,8",label:"Ваш момент",views:940,clicks:138},
 {id:"business",range:"2,8–5,8",label:"Деловой образ",views:770,clicks:96},
 {id:"occasion",range:"5,8–8,8",label:"Особый момент",views:645,clicks:124},
 {id:"craft",range:"8,8–11,8",label:"Пошив",views:577,clicks:94},
 {id:"detail",range:"11,8–15",label:"Детали",views:468,clicks:62},
 {id:"fitting",range:"15–17,64",label:"Примерка",views:390,clicks:42}
 ],
 products:[
 {id:"navy",views:420,likes:96,saves:55,selected:54,booking:18},
 {id:"grey",views:310,likes:65,saves:40,selected:38,booking:9},
 {id:"black",views:280,likes:55,saves:34,selected:35,booking:14},
 {id:"ivory",views:195,likes:41,saves:27,selected:25,booking:11},
 {id:"travel-navy",views:145,likes:32,saves:15,selected:16,booking:5},
 {id:"travel-black",views:110,likes:21,saves:9,selected:12,booking:3}
 ]
});
// Funnel numbers are nested unique demo participants. Scene and product numbers
// are events and need not equal the unique funnel stages. 60 product booking
// clicks plus 12 film-origin booking clicks from participants who already chose a look;
// scene CTA clicks are not the same grain as the unique funnel.
export const CATALOG=[
 ["navy","Уверенная классика","Тёмно-синий костюм","2024/12/Atelier23_24_11_14_0844-600x800.jpg"],
 ["grey","Современный характер","Серый костюм","2024/12/Atelier23_24_11_14_0852-1-600x800.jpg"],
 ["black","Вечерняя классика","Чёрный смокинг","2025/08/Atelier23_25_07_30_0537-600x800.jpg"],
 ["ivory","Светлый акцент","Смокинг слоновой кости","2025/08/Atelier23_26_09_16_-41-600x800.jpg"],
 ["travel-navy","Свободная элегантность","Синие брюки","2025/10/Atelier_25_10_21_0453-600x800.jpg"],
 ["travel-black","Лаконичный гардероб","Чёрные брюки","2025/10/Atelier_25_10_21_0251-600x800.jpg"]
];
export function localProducts(rows){return CATALOG.map(([id])=>{const count=(type,intent)=>rows.filter(r=>r.target===id&&r.type===type&&(!intent||r.intent===intent)).length;return {id,views:count("look_view"),likes:count("reaction","like_on")+count("reaction","like_repeat"),saves:count("reaction","save_on"),selected:count("look_selected"),booking:count("booking_click")}})}
export const rate=(a,b)=>b>0?a/b*100:null;
// Ordered local cohort: one visit ID, chronological event sequence. A page
// reload starts a new visit; the 2000-row cap means only retained history.
export function localFunnel(rows){
 const stages=[["Просмотрели ≥ 3 с","film_view"],["Выбрали повод","occasion_selected"],["Выбрали образ","look_selected"],["Перешли к записи","booking_click"]];
 const visits=new Map();
 for(const row of rows){if(!visits.has(row.visit))visits.set(row.visit,[]);visits.get(row.visit).push(row)}
 const counts=stages.map(()=>0);
 for(const events of visits.values()){
  let i=0;
  for(const row of [...events].sort((a,b)=>a.ts-b.ts)){if(i<stages.length&&row.type===stages[i][1])counts[i++]++}
 }
 return stages.map(([name],i)=>[name,counts[i]]);
}
