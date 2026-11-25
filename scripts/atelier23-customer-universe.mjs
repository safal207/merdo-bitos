import assert from "node:assert/strict";
import {simulateUniverse,catalog,routines} from "../atelier23/experiments/customer-universe.mjs";
let checks=0;const check=(x,m)=>{assert.ok(x,m);checks++};
const u=simulateUniverse();const same=simulateUniverse();assert.deepEqual(u,same);checks++;
const other=simulateUniverse({seed:20261126});check(JSON.stringify(other.journal)!==JSON.stringify(u.journal),"seed diversity");
const flat=simulateUniverse({seasonal:false});check(JSON.stringify(flat.daily.map(d=>d.requests))!==JSON.stringify(u.daily.map(d=>d.requests)),"seasonality changes schedule");
const zero=simulateUniverse({population:100,capacity:0});check(zero.totals.paidOrders===0&&zero.totals.netRevenue===0,"zero capacity");
check(u.clients.length===1000&&u.daily.length===365&&u.externalActions===0,"dimensions and isolation");
for(const d of u.daily){check(d.production>=0&&d.production<=u.capacity,"shared daily production");check(d.aligned<=d.requests&&d.paid<=d.aligned,"daily conversion");}
for(const c of u.clients){check(c.spent>=0&&c.spent<=c.budget&&c.spent===c.netRevenue,"customer budget");check(c.repeatPaidOrders<=Math.max(0,c.paidOrders-1)&&c.retainedOrders<=c.paidOrders,"repeat accounting");check(c.contribution===c.netRevenue-c.costs-c.acquisition&&c.ltv===null,"finance");}
for(const [key,n] of u.inventory){const offer=key.split(":")[1];check(n<=catalog[offer].monthly,"assortment cap");}
const orders=new Set(),paidClients=new Set();
for(const x of u.journal){if(x.type==="refund"){check(orders.has(x.episode),"refund original");continue}check(x.day>=0&&x.day<365&&x.spent<=x.budget,"bounds");if(x.outcome==="paid"){check(x.canDiscuss&&x.aligned&&x.decision==="request_discussion"&&x.capacity==="feasible"&&x.context==="hypothesis_match","authorization");check(!orders.has(x.episode),"unique payment");check(x.history===(paidClients.has(x.client)?"returning":"new"),"prior paid history");orders.add(x.episode);paidClients.add(x.client)}else check(!orders.has(x.episode),"no duplicate event");}
check(orders.size===u.totals.paidOrders,"payment reconciliation");
check(u.daily.reduce((a,d)=>a+d.netRevenue,0)===u.totals.netRevenue,"daily revenue reconciliation");
check(u.daily.reduce((a,d)=>a+d.contribution,0)===u.totals.contribution,"daily contribution reconciliation");
check(u.totals.contribution===u.totals.netRevenue-u.totals.costs-u.totals.acquisition,"portfolio contribution");
check(u.totals.paidOrders>0&&u.totals.repeatPaidOrders>0&&Object.keys(u.byRoutine).length===routines.length,"positive control diversity");
for(const config of [{seed:-1},{population:0},{capacity:-1},{seasonal:1}]){assert.throws(()=>simulateUniverse(config));checks++}
console.log("PASS Customer Universe 9.2: "+checks+" checks; "+u.population+" customers; "+u.days+" days");
console.log("UNIVERSE "+JSON.stringify({totals:u.totals,outcomes:u.outcomes,byRoutine:u.byRoutine,peakProduction:Math.max(...u.daily.map(d=>d.production)),requests:u.daily.reduce((a,d)=>a+d.requests,0),seasonalMonths:Array.from({length:12},(_,m)=>u.daily.filter(d=>Math.floor(d.day*12/365)===m).reduce((a,d)=>a+d.requests,0))}));
