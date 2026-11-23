import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const h = React.createElement;
const BASE = "https://atelier-23.ru/";
const BOOK = BASE + "sign-up-for-a-fitting-room/";
const SHOP = BASE + "collection/costumes/";
const TAILOR = BASE + "personal-tailoring/";
const TG = "https://t.me/A23_Private";
const FILM = new URL("./assets/atelier23-film.mp4", import.meta.url).href;
const PHOTO = {
  hero: BASE + "wp-content/uploads/2026/09/a23-hero-autumn-poster-2720.jpg",
  fitting: BASE + "wp-content/uploads/2026/09/a23o-a23-primerka-u-zerkala-960.webp",
  fabric: BASE + "wp-content/uploads/2026/09/a23o-a23-vybor-tkani-na-divane-960.webp",
  atelier: BASE + "wp-content/uploads/2026/09/a23o-a23-fabrika-sew-900.webp"
};
const OCCASIONS = [
  ["business", "Деловые встречи", "Профессиональный образ, который работает на вас"],
  ["wedding", "Свадьба", "Важный день и костюм со своим характером"],
  ["evening", "Торжество или вечер", "Дресс-код, фактура и точность деталей"],
  ["wardrobe", "Обновить гардероб", "Вещи, которые легко сочетаются"]
];
const STYLES = [
  ["classic", "Современная классика", "Сдержанно, точно, вне времени"],
  ["relaxed", "Расслабленный стиль", "Мягкий силуэт, свобода движения"],
  ["bold", "Выразительный образ", "Интересная фактура, детали и акцент"]
];
const BUDGETS = [
  ["low", "До 150 000 ₽", "Сначала смотрим готовые изделия"],
  ["mid", "150–250 тыс. ₽", "Ориентир для индивидуального костюма"],
  ["high", "Более 250 000 ₽", "Больше возможностей выбора материала"],
  ["unsure", "Обсудить на встрече", "Поможем определить комфортный бюджет"]
];
const EXISTING = [["shirt", "Сорочка"], ["shoes", "Обувь"], ["jacket", "Пиджак"]];
const INITIAL = { occasion: "", date: "", style: "", budget: "", existing: [] };
const LABELS = ["Событие", "Срок", "Стиль", "Бюджет"];

function BtnLink({href,children,outline=false,className=""}) {
  return h("a", {href, target:"_blank", rel:"noopener noreferrer", className:"btn "+(outline?"btn-ghost":"btn-primary")+" "+className}, children, h("span", {"aria-hidden":"true"}, "↗"));
}
function VideoPanel() {
  const ref = useRef(null);
  const [started,setStarted] = useState(false);
  const [paused,setPaused] = useState(false);
  const [reduced,setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change",update);
    return () => media.removeEventListener?.("change",update);
  },[]);
  useEffect(() => {
    const v=ref.current;
    if(!v || reduced) {v?.pause();return;}
    const observer = new IntersectionObserver(entries => {
      if(entries[0]?.isIntersecting && !paused) {
        if(!v.src) {v.src=FILM; v.load();}
        v.play().then(()=>setStarted(true)).catch(()=>{});
      } else v.pause();
    }, {threshold:0.25});
    observer.observe(v);
    return ()=>{observer.disconnect();v.pause();};
  },[reduced,paused]);
  return h("div",{className:"hero-film"},
    h("img",{src:PHOTO.hero, className:"hero-poster", alt:"Детали мужской одежды ATELIER 23",fetchPriority:"high"}),
    h("video",{ref, className:"film-video "+(started?"visible":""), muted:true,loop:true,playsInline:true,preload:"none",poster:PHOTO.hero, "aria-label":"Рекламный видеоконцепт, не съёмка производства"}),
    h("div",{className:"video-scrim"}),
    h("div",{className:"video-header"}, h("span",null,"A FASHION FILM"),h("span",null,"CONCEPT / 2026")),
    h("div",{className:"video-bottom"},
      h("span",null,"Рекламный концепт, не съёмка производства Atelier 23"),
      h("button",{type:"button",className:"video-toggle",disabled:reduced, onClick:()=>setPaused(!paused),"aria-label":paused?"Воспроизвести видео":"Приостановить видео"},reduced?"—":paused?"▶":"Ⅱ"))
  );
}
function Choice({item,selected,onPick}) {
  return h("button",{type:"button",className:"option"+(selected?" chosen":""),onClick:()=>onPick(item[0]),"aria-pressed":selected},
    h("span",{className:"option-mark","aria-hidden":"true"},selected?"●":"○"),
    h("span",{className:"option-main"},h("strong",null,item[1]),h("small",null,item[2])),
    h("span",{className:"option-arr","aria-hidden":"true"},"↗")
  );
}
function daysUntil(date) {
  if(!date)return null;
  const [y,m,d]=date.split("-").map(Number);
  const now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const target=new Date(y,m-1,d);
  return Math.ceil((target-start)/86400000);
}
function getAdvice(form) {
  const days=daysUntil(form.date);
  const urgent=days!==null && days<56;
  const low=form.budget==="low";
  let name, copy, route=TAILOR, product;
  if(urgent) {
    name="К важной дате — без неоправданных обещаний";
    copy="На индивидуальный костюм ателье ориентирует на восемь недель. До вашего события времени меньше. Сначала уточните наличие готовых моделей и возможность подгонки у менеджера.";
    product="Готовая коллекция и консультация о подгонке"; route=SHOP;
  } else if(low) {
    name="Соберём решение в вашем бюджете";
    copy="Индивидуальный костюм начинается от 150 000 ₽. Вместо обещания неподходящей цены рекомендуем посмотреть готовую коллекцию и обсудить отдельные вещи.";
    product="Готовые модели и отдельные предметы"; route=SHOP;
  } else if(form.occasion==="wedding") {
    name="Костюм для вашего важного дня";
    copy="Обсудим формат церемонии, требования к образу и запас по срокам. Выбор ткани и посадку лучше подтвердить лично.";
    product="Индивидуальный костюм от 150 000 ₽";
  } else if(form.occasion==="evening") {
    name="Образ, соответствующий вечеру";
    copy="Начните с дресс-кода. На встрече можно уточнить, нужен готовый смокинг или индивидуальное изделие.";
    product="Костюм или смокинг по задаче";
  } else if(form.occasion==="wardrobe") {
    name="Гардероб, в котором вещи работают вместе";
    copy="Учтём то, что уже есть, чтобы не покупать лишнего. На встрече подберём недостающие элементы.";
    product="Разбор гардероба и подбор сочетаний";
  } else {
    name="Костюм, подходящий вашему ритму";
    copy="Ткань, силуэт и детали подбираются под ваши деловые встречи и индивидуальные предпочтения.";
    product="Костюм по меркам от 150 000 ₽";
  }
  if(form.existing.length)copy+=" Уже имеющиеся вещи исключим из списка покупок после уточнения деталей.";
  return {name,copy,route,product,urgent,low,days};
}
function App() {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState(INITIAL);
  const [copied,setCopied]=useState(false);
  const [menu,setMenu]=useState(false);
  const engine=useRef(null);
  const advice=getAdvice(form);
  const valid=[!!form.occasion,true,!!form.style,!!form.budget][step] ?? true;
  const update=(key,value)=>{setForm(old=>({...old,[key]:value}));setCopied(false);};
  const scroll=()=>engine.current?.scrollIntoView({behavior:"smooth",block:"start"});
  const next=()=>{if(valid){setStep(Math.min(step+1,4));setTimeout(scroll,0)}};
  const back=()=>{setStep(Math.max(step-1,0));setCopied(false);};
  const reset=()=>{setStep(0);setForm(INITIAL);setCopied(false);setTimeout(scroll,0)};
  const toggleExisting=(id)=>setForm(f=>({...f,existing:f.existing.includes(id)?f.existing.filter(a=>a!==id):[...f.existing,id]}));
  const copy=async()=>{
    const occasion=OCCASIONS.find(a=>a[0]===form.occasion)?.[1]||"не указано";
    const style=STYLES.find(a=>a[0]===form.style)?.[1]||"не указан";
    const budget=BUDGETS.find(a=>a[0]===form.budget)?.[1]||"не указан";
    const data="Концепт ATELIER 23 × BitOS. Событие: "+occasion+". Дата: "+(form.date||"обсудить")+". Стиль: "+style+". Бюджет: "+budget+". Уже есть: "+(form.existing.map(id=>EXISTING.find(x=>x[0]===id)?.[1]).join(", ")||"не указано")+". Рекомендация: "+advice.product+".";
    try {await navigator.clipboard.writeText(data);setCopied(true);}
    catch {window.prompt("Скопируйте запрос",data);}
  };
  return h(React.Fragment,null,
    h("header",{className:"topbar"},
      h("a",{href:"#top",className:"wordmark"},"ATELIER ",h("b",null,"23"),h("small",null,"× BitOS DEMO")),
      h("nav",{className:"navigation"+(menu?" active":""),"aria-label":"Навигация"},
        h("a",{href:"#approach",onClick:()=>setMenu(false)},"Философия"),
        h("a",{href:"#journey",onClick:()=>setMenu(false)},"Подбор"),
        h("a",{href:"#craft",onClick:()=>setMenu(false)},"Ремесло"),
        h("a",{href:"#visit",onClick:()=>setMenu(false)},"Встреча")
      ),
      h("button",{className:"top-cta",onClick:scroll},"Подобрать образ ",h("span",null,"↗")),
      h("button",{className:"hamburger",onClick:()=>setMenu(!menu),"aria-expanded":menu,"aria-label":menu?"Закрыть меню":"Открыть меню"},menu?"✕":"☰")
    ),
    h("main",{id:"top"},
      h("section",{className:"hero"},
        h("div",{className:"hero-copy"},
          h("div",{className:"hero-inner"},
            h("span",{className:"eyebrow"},"МОСКВА · ПАТРИАРШИЕ · КОСТЮМЫ ПО МЕРКАМ"),
            h("h1",null,"Сначала",h("br"),"ваш ",h("em",null,"повод."),h("br"),"Потом костюм."),
            h("p",null,"Мы начинаем с того, куда вы собираетесь. А потом подбираем силуэт, ткань и детали под конкретную историю."),
            h("div",{className:"hero-actions"},
              h("button",{className:"btn btn-primary",onClick:scroll},"Найти свой образ ",h("span",null,"↗")),
              h("a",{className:"subtle-link",href:"#approach"},"Узнать о подходе ↓")
            )
          ),
          h("div",{className:"hero-stats"},
            h("div",null,h("strong",null,"от 150 000 ₽"),h("span",null,"индивидуальный костюм")),
            h("div",null,h("strong",null,"8 недель"),h("span",null,"ориентир пошива")),
            h("div",null,h("strong",null,"Москва"),h("span",null,"примерка в ателье"))
          )
        ),
        h(VideoPanel)
      ),
      h("section",{className:"intro section",id:"approach"},
        h("div",{className:"shell intro-grid"},
          h("div",null,h("span",{className:"eyebrow ink"},"ПРОФЕССИЯ — СЛУШАТЬ КЛИЕНТА"),h("h2",null,"Не просто костюм.",h("br"),h("em",null,"Решение под событие."))),
          h("div",null,h("p",null,"Деловая встреча, свадьба, вечер или обновление гардероба. Хороший консультант сначала выясняет повод. Это принцип персональной продажи, который мы переносим в BitOS."),
            h("p",null,"Никаких искусственных скидок и обещаний. Мы предлагаем направление для личной консультации."),
            h("a",{className:"text-link",href:"#journey"},"Начать консультацию →"))
        )
      ),
      h("section",{className:"quiz-section section",id:"journey",ref:engine},
        h("div",{className:"shell"},
          h("div",{className:"section-heading"},
            h("span",{className:"eyebrow ink"},"BITOS OCCASION ENGINE / ДЕМОНСТРАЦИЯ"),
            h("h2",null,"Ваш повод.",h("br"),h("em",null,"Наш следующий вопрос.")),
            h("p",null,"Четыре коротких шага — и персональная рекомендация без передачи данных.")
          ),
          h("div",{className:"quiz-grid"},
            h("aside",{className:"quiz-aside"},
              h("div",{className:"aside-text"},h("span",null,"CONSULTATION / 001"),h("h3",null,"У каждой вещи",h("br"),"свой ",h("em",null,"момент.")),h("p",null,"Не предлагаем лишнего. Учитываем событие, сроки и то, что уже есть в гардеробе.")),
              h("img",{src:PHOTO.fabric,loading:"lazy",alt:"Образцы тканей на консультации в Atelier 23"}),
              h("small",null,"Изображение из материалов Atelier 23")
            ),
            h("div",{className:"quiz-main"},
              h("div",{className:"step-head"},h("span",null,step===4?"ГОТОВО":"ШАГ 0"+(step+1)+" / 04"),h("span",null,step===4?"ВАША РЕКОМЕНДАЦИЯ":LABELS[step].toUpperCase())),
              h("div",{className:"progress",role:"presentation"},LABELS.map((x,i)=>h("i",{key:x,className:step>=i?"active":""}))),
              step===0 && h("div",{className:"quiz-body"},
                h("h3",null,"Для какого события выбираете образ?"),
                h("p",null,"Не с размера и не с модели. Начнём с вашей задачи."),
                h("div",{className:"options"},OCCASIONS.map(x=>h(Choice,{key:x[0],item:x,selected:form.occasion===x[0],onPick:v=>update("occasion",v)})))
              ),
              step===1 && h("div",{className:"quiz-body"},
                h("h3",null,"К какой дате нужен образ?"),
                h("p",null,"Индивидуальный костюм обычно требует около восьми недель. Точный срок нужно подтверждать в ателье."),
                h("label",{className:"input-label",htmlFor:"eventDate"},"Дата мероприятия (необязательно)"),
                h("input",{id:"eventDate",type:"date",value:form.date,onChange:e=>update("date",e.target.value)}),
                h("button",{className:"clear-date",type:"button",onClick:()=>update("date","")},"Пока не знаю дату"),
                form.date && daysUntil(form.date)<56 && h("div",{className:"warning"},"До события меньше 8 недель — сначала проверим готовые модели и подгонку.")
              ),
              step===2 && h("div",{className:"quiz-body"},
                h("h3",null,"Как вам комфортно выглядеть?"),
                h("p",null,"Ориентир по стилю, а не окончательный выбор ткани или посадки."),
                h("div",{className:"options"},STYLES.map(x=>h(Choice,{key:x[0],item:x,selected:form.style===x[0],onPick:v=>update("style",v)})))
              ),
              step===3 && h("div",{className:"quiz-body"},
                h("h3",null,"Какой бюджет рассматриваете?"),
                h("p",null,"Это помогает не предлагать то, что не соответствует вашим ожиданиям."),
                h("div",{className:"options"},BUDGETS.map(x=>h(Choice,{key:x[0],item:x,selected:form.budget===x[0],onPick:v=>update("budget",v)}))),
                h("div",{className:"existing"},h("strong",null,"Что уже есть?"),h("small",null,"Не включаем в будущие рекомендации без необходимости."),
                  h("div",{className:"chips"},EXISTING.map(x=>h("button",{type:"button",key:x[0],className:form.existing.includes(x[0])?"selected":"",onClick:()=>toggleExisting(x[0]),"aria-pressed":form.existing.includes(x[0])},(form.existing.includes(x[0])?"✓ ":"+ ")+x[1])))
                )
              ),
              step===4 && h("div",{className:"quiz-body result-body"},
                h("span",{className:"eyebrow ink"},"ПРЕДВАРИТЕЛЬНАЯ РЕКОМЕНДАЦИЯ"),
                h("h3",null,advice.name),
                h("p",null,advice.copy),
                h("div",{className:"result-product"},h("small",null,"ЧТО ОБСУДИТЬ С КОНСУЛЬТАНТОМ"),h("strong",null,advice.product)),
                h("div",{className:"result-metrics"},h("span",null,"Костюм по меркам",h("b",null,"от 150 000 ₽")),h("span",null,"Ориентир пошива",h("b",null,"8 недель"))),
                h("div",{className:"result-actions"},h(BtnLink,{href:BOOK},"Записаться на встречу"),h(BtnLink,{href:advice.route,outline:true},advice.urgent||advice.low?"Посмотреть готовые костюмы":"Подробнее о пошиве")),
                h("button",{className:"copy-result",onClick:copy},copied?"✓ Запрос скопирован":"Скопировать запрос консультанту"),
                h("small",{className:"privacy"},"Ничего не сохраняем и не отправляем. Наличие, цены и сроки подтвердит ATELIER 23.")
              ),
              h("div",{className:"step-footer"},
                h("button",{type:"button",className:"back-btn",disabled:step===0,onClick:back},"← Назад"),
                step===4 ? h("button",{type:"button",className:"next-btn",onClick:reset},"Начать заново ↻") :
                  h("button",{type:"button",className:"next-btn",disabled:!valid,onClick:next},step===3?"Получить рекомендацию →":"Продолжить →")
              )
            )
          )
        )
      ),
      h("section",{className:"craft section",id:"craft"},
        h("div",{className:"shell craft-layout"},
          h("div",{className:"craft-copy"},h("span",{className:"eyebrow"},"ЗНАКОМСТВО С РЕМЕСЛОМ"),h("h2",null,"Характер виден",h("br"),h("em",null,"в деталях.")),h("p",null,"Ткани итальянских фабрик, пошив в Португалии и финальная примерка в Москве — по информации Atelier 23."),h(BtnLink,{href:TAILOR,outline:true},"Как проходит пошив")),
          h("img",{src:PHOTO.fitting,loading:"lazy",alt:"Примерка мужского костюма в ателье"})
        )
      ),
      h("section",{className:"faq section"},
        h("div",{className:"shell faq-layout"},h("div",null,h("span",{className:"eyebrow ink"},"ПЕРЕД ПЕРВОЙ ВСТРЕЧЕЙ"),h("h2",null,"Частые",h("br"),h("em",null,"вопросы."))),
          h("div",null,
            h("details",null,h("summary",null,"Можно ли сшить костюм за две недели?"),h("p",null,"По материалам ATELIER 23, ориентир индивидуального костюма — восемь недель. Срочные случаи нужно обсуждать отдельно; готовая коллекция может быть альтернативой.")),
            h("details",null,h("summary",null,"Нужен ли точный бюджет?"),h("p",null,"Нет. Подбор только предлагает направление. Итоговая цена зависит от ткани и решения, подтверждается менеджером.")),
            h("details",null,h("summary",null,"Сохраняются ли ответы на сайте?"),h("p",null,"Нет. Это независимое демонстрационное приложение. Ответы находятся только в оперативном состоянии страницы, не отправляются на сервер.")),
            h("details",null,h("summary",null,"Как попасть на примерку?"),h("p",null,"Кнопка записи открывает официальный сайт ATELIER 23. Демо не бронирует время."))
          )
        )
      ),
      h("footer",{className:"footer",id:"visit"},
        h("div",{className:"shell"},
          h("span",{className:"eyebrow"},"ATELIER 23 · МОСКВА"),
          h("h2",null,"Большой костюм",h("br"),"начинается с ",h("em",null,"разговора.")),
          h("p",null,"Большой Козихинский переулок, 23. Ежедневно 11:00–20:00, по предварительной записи."),
          h("div",{className:"footer-cta"},h(BtnLink,{href:BOOK},"Записаться в ателье"),h(BtnLink,{href:TG,outline:true},"Написать менеджеру")),
          h("div",{className:"footer-end"},h("strong",null,"ATELIER 23 × BitOS"),h("span",null,"Независимый неофициальный демо-концепт. ",h("a",{href:BASE,target:"_blank",rel:"noopener noreferrer"},"Официальный сайт ↗")))
        )
      )
    )
  );
}

createRoot(document.getElementById("root")).render(h(App));
