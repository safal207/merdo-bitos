import {CATALOG,rate} from "./showcase.js";
const num=n=>n==null?"—":n.toLocaleString("ru-RU",{maximumFractionDigits:1});
const pct=n=>n==null?"—":num(n)+"%";
const rub=n=>Math.round(n).toLocaleString("ru-RU")+" ₽";
export function scenario({buyers,check,extra,attach}){
 const base=buyers*check,additional=buyers*extra*attach/100;
 return {base,additional,total:base+additional,average:buyers?(base+additional)/buyers:0};
}
export function diagnose(scenes,products,funnel){
 const ranked=[...scenes].filter(x=>x.clicks>0).sort((a,b)=>b.clicks-a.clicks);
 const best=[...products].filter(x=>x.selected>0).sort((a,b)=>b.selected-a.selected)[0]||null;
 const booking=[...products].filter(x=>x.booking>0).sort((a,b)=>b.booking-a.booking)[0]||null;
 const choice=funnel.findIndex(([name])=>name==="Выбрали образ");
 const fit=funnel.findIndex(([name])=>name==="Перешли к записи");
 const gap=choice>=0&&fit===choice+1&&funnel[choice][1]>0?{from:funnel[choice][1],to:funnel[fit][1],rate:rate(funnel[fit][1],funnel[choice][1])}:null;
 return {ranked,best,booking,gap};
}
const el=(tag,cls="",text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
const title=(label,text)=>{const d=el("div","adv-title");d.append(el("span","adv-kicker",label),el("h3","",text));return d};
const note=(label,text)=>{const d=el("div","adv-note");d.append(el("strong","",label),el("p","",text));return d};
const metric=(n,label)=>{const d=el("div","adv-mini");d.append(el("b","",n),el("small","",label));return d};
const model={buyers:12,check:180000,extra:35000,attach:50};
export function renderAdvisor(host,{demo,available,scenes,products,funnel}){
 const {ranked,best,booking,gap}=diagnose(scenes,products,funnel);
 const scope=demo?"Демо · условные события":available?"Локально · события этого браузера":"Локальные данные недоступны";
 const marketing=el("article","adv-card marketing");
 marketing.append(title("01 · MARKETING","Какая реклама приводит к действию"),el("p","caption",scope));
 if(ranked.length&&available){
  const list=el("div","adv-rank");
  for(const s of ranked.slice(0,4)){const r=el("div","adv-rank-row"),label=el("div","adv-rank-label"),rail=el("div","adv-rail"),bar=el("i");label.append(el("span","",s.label),el("b","",num(s.clicks)+" кликов"));bar.style.width=rate(s.clicks,ranked[0].clicks)+"%";rail.append(bar);r.append(label,rail);list.append(r)}
  marketing.append(list,note("Сигнал",ranked[0].label+" — больше всего нажатий ("+num(ranked[0].clicks)+"). Число кликов зависит и от охвата; это не доказательство эффективности рекламы."));
 }else marketing.append(note("Нет достаточных событий","Сначала соберите нажатия CTA по сценам."));
 marketing.append(note("Гипотеза для проверки","Сравнить короткий ролик для деловых встреч с роликом для особых событий. Метрика: стоимость подтверждённой записи. Нужны расходы, источник трафика и CRM; пока не подключены."));
 const product=el("article","adv-card product-advisor");
 product.append(title("02 · PRODUCT","Где клиенту трудно продолжить"),el("p","caption",scope));
 if(gap&&available){
  const grid=el("div","adv-minis");grid.append(metric(num(gap.from),"Выбрали образ"),metric(num(gap.to),"Перешли к записи"),metric(pct(gap.rate),"Конверсия шага"));product.append(grid,note("Сигнал",num(gap.from-gap.to)+" участников этой когорты не прошли следующий шаг ("+pct(100-gap.rate)+"). Причина пока неизвестна."));
 }else product.append(note("Нет базы для расчёта","Нужны последовательные события выбора образа и перехода к записи в рамках одной когорты."));
 const ab=el("div","adv-ab");ab.append(metric("A","Записаться на примерку"),metric("B","Подобрать ткань с мастером"));
 product.append(el("h4","","Предложенный A/B-тест"),ab,note("Критерий успеха","Сравнить долю подтверждённых записей на участника эксперимента; дополнительно — явку и качество заявок. Тест не запущен."));
 const style=el("article","adv-card style-advisor");
 style.append(title("03 · STYLE","Какие образы стоит развивать"),el("p","caption",scope));
 function styleCard(p,tag,idea){
  const c=CATALOG.find(r=>r[0]===p.id);if(!c)return;
  const d=el("div","adv-look"),img=el("img"),body=el("div","adv-look-body");img.src="https://atelier-23.ru/wp-content/uploads/"+c[3];img.alt=c[2];img.loading="lazy";img.addEventListener("error",()=>img.hidden=true);
  body.append(el("small","adv-kicker",tag),el("h4","",c[1]),el("b","",num(p.selected)+" выборов · "+num(p.booking)+" переходов к записи"),el("p","caption",num(p.views)+" просмотров · "+num(p.saves)+" сохранений"),el("p","",idea));d.append(img,body);style.append(d);
 }
 const idea=id=>id==="black"||id==="ivory"?"Проверить полный вечерний образ: сорочка и бабочка.":id==="navy"||id==="grey"?"Проверить комплект: сорочка и галстук.":"Проверить сочетание с трикотажем и подходящей обувью.";
 if(best&&available)styleCard(best,"Лидер по выбору",idea(best.id));
 if(booking&&available&&booking.id!==best?.id)styleCard(booking,"Лидер по переходам к записи",idea(booking.id));
 const alternative=[...products].filter(p=>p.id!==best?.id&&p.booking>0).sort((a,b)=>b.booking-a.booking)[0];
 if(booking&&best?.id===booking.id&&alternative&&available)styleCard(alternative,"Следующий по переходам к записи",idea(alternative.id));
 if(!best&&!booking||!available)style.append(note("Данных пока мало","Не рекомендуем конкретный ассортимент без событий выбора или записи."));
 style.append(note("Следующий шаг","Сравнить предложения законченных образов и отдельных изделий. Не считать лайки заказами; нужны реальные составы чеков и маржа."));
 const finance=el("article","adv-card finance-advisor");
 finance.append(title("04 · COMMERCE","Симулятор дополнительных продаж"),el("p","caption","Независимый сценарий · не реальные данные, не прогноз"));
 const form=el("div","adv-form"),output=el("div","adv-results"),mix=el("div","adv-mix"),base=el("i"),add=el("i");mix.append(base,add);
 const fields=[["buyers","Покупатели",0,50,1,num],["check","Средний чек, ₽",150000,500000,10000,rub],["extra","Доп. предложение, ₽",15000,150000,5000,rub],["attach","Доля покупателей доп. предложения",0,100,5,pct]];
 const refs={};
 function update(){
  const x=scenario(model);
  for(const [key,,,,,fmt] of fields)refs[key].textContent=fmt(model[key]);
  output.replaceChildren(metric(rub(x.base),"Основная выручка"),metric("+"+rub(x.additional),"Дополнительная выручка"),metric(rub(x.total),"Сумма по сценарию"),metric(rub(x.average),"Чек с допродажей"));
  base.style.width=(x.total?x.base/x.total*100:0)+"%";add.style.width=(x.total?x.additional/x.total*100:0)+"%";
 }
 for(const [key,label,min,max,step] of fields){const d=el("label","adv-field"),line=el("span","adv-field-label"),v=el("b"),input=el("input");refs[key]=v;line.append(el("span","",label),v);input.type="range";input.min=min;input.max=max;input.step=step;input.value=model[key];input.dataset.model=key;input.addEventListener("input",()=>{model[key]=Number(input.value);update()});d.append(line,input);form.append(d)}
 finance.append(form,output,mix,el("p","caption","Сценарий выручки, не прибыли: себестоимость, налоги, возвраты и затраты не учтены."));update();
 const loyalty=el("article","adv-card loyalty-advisor");
 loyalty.append(title("05 · RELATIONSHIP","Следующая покупка начинается с первой"),el("p","caption","Проект CRM-сценариев · не запущены; фактического удержания покупателей нет"));
 const journey=el("div","adv-journey");
 for(const [n,t,desc,kpi] of [["01","После покупки","С согласия сохранить мерки и предпочтения.","Полнота профилей"],["02","Следующее событие","Уточнить повод и дату, предложить подходящий образ.","Повторные записи"],["03","Новый сезон","Согласованная персональная подборка тканей и изделий.","Повторные покупки"],["04","Развитие гардероба","Предлагать недостающие сочетания, а не лишние покупки.","Повторная выручка"]]){
  const d=el("div","adv-journey-step"),b=el("div");b.append(el("h4","",t),el("p","",desc),el("small","",kpi+" · нет данных"));d.append(el("span","adv-step",n),b);journey.append(d)
 }
 loyalty.append(journey,note("Что подключить","CRM, историю покупок, согласие на коммуникации, измерение повторных покупок по когорте и контроль отписок. Никаких автоматических сообщений сейчас."));
 host.replaceChildren(marketing,product,style,finance,loyalty);
}
