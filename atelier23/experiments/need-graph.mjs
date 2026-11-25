// Experimental typed hypothesis graph. No customer records or asserted commercial outcomes.
export const graph = {
  "version": "8.4",
  "status": "hypothesis",
  "nodes": [
    {
      "id": "confidence",
      "type": "need",
      "label": "Уверенность во внешнем виде"
    },
    {
      "id": "comfort",
      "type": "need",
      "label": "Комфорт и посадка"
    },
    {
      "id": "identity",
      "type": "need",
      "label": "Самовыражение и уместность"
    },
    {
      "id": "time",
      "type": "need",
      "label": "Экономия времени"
    },
    {
      "id": "meeting",
      "type": "trigger",
      "label": "Деловая встреча"
    },
    {
      "id": "event",
      "type": "trigger",
      "label": "Торжество"
    },
    {
      "id": "season",
      "type": "trigger",
      "label": "Смена сезона"
    },
    {
      "id": "fit_change",
      "type": "trigger",
      "label": "Изменение посадки"
    },
    {
      "id": "suit",
      "type": "offer",
      "label": "Индивидуальный костюм"
    },
    {
      "id": "shirt",
      "type": "offer",
      "label": "Рубашка"
    },
    {
      "id": "alteration",
      "type": "offer",
      "label": "Корректировка посадки (уточнить доступность)"
    },
    {
      "id": "consult",
      "type": "offer",
      "label": "Персональная консультация"
    },
    {
      "id": "knit",
      "type": "offer",
      "label": "Трикотаж (уточнить наличие)"
    },
    {
      "id": "referral",
      "type": "channel",
      "label": "Рекомендация"
    },
    {
      "id": "search",
      "type": "channel",
      "label": "Поиск на сайте"
    },
    {
      "id": "repeat_order",
      "type": "goal",
      "label": "Повторный оплаченный заказ"
    },
    {
      "id": "first_order",
      "type": "goal",
      "label": "Первый оплаченный заказ"
    },
    {
      "id": "repeat_rate",
      "type": "metric",
      "label": "Доля повторных покупателей"
    },
    {
      "id": "contribution",
      "type": "metric",
      "label": "Маржинальный вклад когорты"
    },
    {
      "id": "first_conversion",
      "type": "metric",
      "label": "Конверсия в первый заказ"
    }
  ],
  "edges": [
    {
      "from": "meeting",
      "relation": "activates",
      "to": "confidence",
      "status": "hypothesis"
    },
    {
      "from": "meeting",
      "relation": "activates",
      "to": "identity",
      "status": "hypothesis"
    },
    {
      "from": "event",
      "relation": "activates",
      "to": "confidence",
      "status": "hypothesis"
    },
    {
      "from": "event",
      "relation": "activates",
      "to": "identity",
      "status": "hypothesis"
    },
    {
      "from": "season",
      "relation": "activates",
      "to": "identity",
      "status": "hypothesis"
    },
    {
      "from": "season",
      "relation": "activates",
      "to": "comfort",
      "status": "hypothesis"
    },
    {
      "from": "fit_change",
      "relation": "activates",
      "to": "comfort",
      "status": "hypothesis"
    },
    {
      "from": "meeting",
      "relation": "activates",
      "to": "time",
      "status": "hypothesis"
    },
    {
      "from": "confidence",
      "relation": "served_by",
      "to": "suit",
      "status": "hypothesis"
    },
    {
      "from": "confidence",
      "relation": "served_by",
      "to": "consult",
      "status": "hypothesis"
    },
    {
      "from": "identity",
      "relation": "served_by",
      "to": "suit",
      "status": "hypothesis"
    },
    {
      "from": "identity",
      "relation": "served_by",
      "to": "shirt",
      "status": "hypothesis"
    },
    {
      "from": "identity",
      "relation": "served_by",
      "to": "knit",
      "status": "hypothesis"
    },
    {
      "from": "comfort",
      "relation": "served_by",
      "to": "suit",
      "status": "hypothesis"
    },
    {
      "from": "comfort",
      "relation": "served_by",
      "to": "alteration",
      "status": "hypothesis"
    },
    {
      "from": "comfort",
      "relation": "served_by",
      "to": "knit",
      "status": "hypothesis"
    },
    {
      "from": "time",
      "relation": "served_by",
      "to": "consult",
      "status": "hypothesis"
    },
    {
      "from": "referral",
      "relation": "exposes",
      "to": "consult",
      "status": "hypothesis"
    },
    {
      "from": "referral",
      "relation": "exposes",
      "to": "suit",
      "status": "hypothesis"
    },
    {
      "from": "search",
      "relation": "exposes",
      "to": "suit",
      "status": "hypothesis"
    },
    {
      "from": "search",
      "relation": "exposes",
      "to": "shirt",
      "status": "hypothesis"
    },
    {
      "from": "search",
      "relation": "exposes",
      "to": "knit",
      "status": "hypothesis"
    },
    {
      "from": "suit",
      "relation": "may_support",
      "to": "repeat_order",
      "status": "hypothesis"
    },
    {
      "from": "suit",
      "relation": "may_support",
      "to": "first_order",
      "status": "hypothesis"
    },
    {
      "from": "shirt",
      "relation": "may_support",
      "to": "repeat_order",
      "status": "hypothesis"
    },
    {
      "from": "shirt",
      "relation": "may_support",
      "to": "first_order",
      "status": "hypothesis"
    },
    {
      "from": "alteration",
      "relation": "may_support",
      "to": "repeat_order",
      "status": "hypothesis"
    },
    {
      "from": "consult",
      "relation": "may_support",
      "to": "first_order",
      "status": "hypothesis"
    },
    {
      "from": "consult",
      "relation": "may_support",
      "to": "repeat_order",
      "status": "hypothesis"
    },
    {
      "from": "knit",
      "relation": "may_support",
      "to": "repeat_order",
      "status": "hypothesis"
    },
    {
      "from": "knit",
      "relation": "may_support",
      "to": "first_order",
      "status": "hypothesis"
    },
    {
      "from": "repeat_order",
      "relation": "measured_by",
      "to": "repeat_rate",
      "status": "hypothesis"
    },
    {
      "from": "repeat_order",
      "relation": "measured_by",
      "to": "contribution",
      "status": "hypothesis"
    },
    {
      "from": "first_order",
      "relation": "measured_by",
      "to": "first_conversion",
      "status": "hypothesis"
    },
    {
      "from": "first_order",
      "relation": "measured_by",
      "to": "contribution",
      "status": "hypothesis"
    }
  ]
};
const types={activates:["trigger","need"],served_by:["need","offer"],exposes:["channel","offer"],may_support:["offer","goal"],measured_by:["goal","metric"]};
export function validate(g){
 if(!g||!Array.isArray(g.nodes)||!Array.isArray(g.edges)||g.status!=="hypothesis")throw Error("invalid graph");
 const map=new Map(),seen=new Set();
 for(const n of g.nodes){if(!n||typeof n.id!=="string"||!n.id||typeof n.label!=="string"||!n.label.trim()||!Object.values(types).flat().includes(n.type)||map.has(n.id))throw Error("invalid node");map.set(n.id,n)}
 for(const e of g.edges){const pair=types[e.relation],a=map.get(e.from),b=map.get(e.to),key=JSON.stringify([e.from,e.relation,e.to]);if(!Array.isArray(pair)||!a||!b||a.type!==pair[0]||b.type!==pair[1]||e.status!=="hypothesis"||seen.has(key))throw Error("invalid edge");seen.add(key)}
 return map;
}
export function paths(g,{trigger,need,customer="unknown"}={}){
 const map=validate(g);if(!["new","returning","unknown"].includes(customer))throw Error("invalid customer context");
 if(trigger!==undefined&&map.get(trigger)?.type!=="trigger")throw Error("invalid trigger");
 if(need!==undefined&&map.get(need)?.type!=="need")throw Error("invalid need");
 const edges=(id,relation)=>g.edges.filter(e=>e.from===id&&e.relation===relation).map(e=>e.to);
 const needs=trigger===undefined?g.nodes.filter(n=>n.type==="need").map(n=>n.id):edges(trigger,"activates");
 const rows=[];
 for(const n of needs.filter(x=>need===undefined||x===need))for(const offer of edges(n,"served_by"))for(const goal of edges(offer,"may_support")){
 if(customer==="new"&&goal==="repeat_order"||customer==="returning"&&goal==="first_order")continue;
 rows.push({need:n,offer,goal,metrics:edges(goal,"measured_by"),status:"hypothesis",requiresPriorPaidOrder:goal==="repeat_order"});
 }
 return rows;
}
