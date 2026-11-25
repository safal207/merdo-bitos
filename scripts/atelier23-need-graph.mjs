import assert from "node:assert/strict";
import {graph,validate,paths} from "../atelier23/experiments/need-graph.mjs";
let checks=0;const check=(v,msg)=>{assert.ok(v,msg);checks++};
const map=validate(graph);check(map.size===graph.nodes.length,"unique nodes");
for(const trigger of [undefined,...graph.nodes.filter(n=>n.type==="trigger").map(n=>n.id)])
for(const need of [undefined,...graph.nodes.filter(n=>n.type==="need").map(n=>n.id)])
for(const customer of ["new","returning","unknown"]){
 const rows=paths(graph,{trigger,need,customer});
 for(const r of rows){
 check(r.status==="hypothesis","no inferred facts");
 check(map.get(r.need).type==="need"&&map.get(r.offer).type==="offer"&&map.get(r.goal).type==="goal","typed path");
 check(r.metrics.length>0&&r.metrics.every(id=>map.get(id).type==="metric"),"metric terminal");
 check(need===undefined||r.need===need,"need filter");
 check(trigger===undefined||graph.edges.some(e=>e.from===trigger&&e.to===r.need&&e.relation==="activates"),"trigger filter");
 check(customer!=="new"||r.goal!=="repeat_order","first customer not repeat");
 check(customer!=="returning"||r.goal!=="first_order","returning customer not first");
 check(r.requiresPriorPaidOrder===(r.goal==="repeat_order"),"repeat requires prior order");
 }
 check(new Set(rows.map(r=>[r.need,r.offer,r.goal].join("/"))).size===rows.length,"unique paths");
}
check(paths(graph,{trigger:"event",customer:"new"}).every(r=>r.goal==="first_order"),"event does not imply repeat");
check(paths(graph,{trigger:"fit_change",need:"time"}).length===0,"no invented link");
for(const bad of [
 {...graph,nodes:[...graph.nodes,graph.nodes[0]]},
 {...graph,edges:[...graph.edges,graph.edges[0]]},
 {...graph,edges:[...graph.edges,{from:"referral",relation:"activates",to:"confidence",status:"hypothesis"}]},
 {...graph,edges:[...graph.edges,{from:"meeting",relation:"activates",to:"absent",status:"hypothesis"}]},
 {...graph,edges:graph.edges.map((e,i)=>i?e:{...e,status:"confirmed"})}
]){assert.throws(()=>validate(bad));checks++}
assert.throws(()=>paths(graph,{need:"suit"}));checks++;
assert.throws(()=>paths(graph,{customer:"invalid"}));checks++;
console.log("PASS Need Graph 8.4: "+checks+" checks; "+graph.nodes.length+" nodes; "+graph.edges.length+" edges");
