import assert from "node:assert/strict";
import {simulateReturn} from "../atelier23/experiments/return-engine.mjs";
import {simulateUniverse,catalog} from "../atelier23/experiments/customer-universe.mjs";
const config={seed:20261125,population:1000,capacity:12};
const base=simulateUniverse(config), results=simulateReturn(config);
assert.deepEqual(results,simulateReturn(config));
for(const r of results){
 assert.equal(r.population,1000);assert.equal(r.days,365);assert.equal(r.externalActions,0);
 assert.equal(r.netRevenue,base.totals.netRevenue+r.extraRevenue);
 assert.equal(r.contribution,base.totals.contribution+r.extraRevenue-r.extraCosts-r.giftCost);
 assert.equal(r.giftCost,r.gifts*1000);assert.ok(r.gifts<=1000);
 assert.equal(r.repeatPaidOrders,base.totals.repeatPaidOrders+r.extraOrders.length);
 assert.ok(r.production.every(n=>n>=0&&n<=config.capacity));
 for(const [k,n] of r.inventory)assert.ok(n<=catalog[k.split(":")[1]].monthly);
 const spent=new Map(base.clients.map(c=>[c.id,c.spent+c.refunds]));
 const budgets=new Map(base.clients.map(c=>[c.id,c.budget]));
 const episodes=new Map(base.journal.filter(e=>e.type==="opportunity").map(e=>[e.episode,e]));
 const last=new Map(), seen=new Set();
 for(const o of r.extraOrders){
  const e=episodes.get(o.episode);assert.ok(e.canDiscuss&&e.decision==="request_discussion"&&e.outcome==="no_payment_fixture");
  assert.equal(o.price,catalog[o.offer].price);assert.equal(o.cost,catalog[o.offer].cost);
  assert.ok(!seen.has(o.episode));seen.add(o.episode);
  assert.ok(o.day-(last.get(o.client)??-100)>=30);last.set(o.client,o.day);
  spent.set(o.client,spent.get(o.client)+o.price);assert.ok(spent.get(o.client)<=budgets.get(o.client));
 }
 assert.equal(r.extraRevenue,r.extraOrders.reduce((a,o)=>a+o.price,0));
 assert.equal(r.extraCosts,r.extraOrders.reduce((a,o)=>a+o.cost,0));
}
assert.equal(results[0].extraOrders.length,0);assert.equal(results[0].gifts,0);
assert.ok(simulateReturn({...config,socialRate:0,returnBoost:0}).every(r=>r.extraOrders.length===0));
assert.ok(simulateReturn({...config,capacity:0}).every(r=>r.extraOrders.length===0&&r.gifts===0));
assert.throws(()=>simulateReturn({...config,socialRate:-1}));
console.log(JSON.stringify(results.map(({extraOrders,production,inventory,...r})=>({...r,extraOrderCount:extraOrders.length})),null,2));
console.log("RETURN-001 invariant checks passed");
