import assert from "node:assert/strict";
import {graph,validate,paths,phasePaths} from "../atelier23/experiments/need-graph.mjs";
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

let phaseChecks=0;function pcheck(v,msg){assert.ok(v,msg);phaseChecks++}
for(const p of graph.nodes.filter(n=>n.type==="phase"))for(const customer of ["new","returning","unknown"]){
 for(const day of [p.time.fromDay-1,p.time.fromDay,p.time.toDay,p.time.toDay+1,undefined])for(const place of ["exact","missing","wrong"]){
 const opts={phase:p.id,relativeDay:day,customer,...(place==="exact"?{fromSpace:p.space.from,toSpace:p.space.to}:place==="wrong"?{fromSpace:"другая среда",toSpace:p.space.to}:{})};
 const r=phasePaths(graph,opts);const outside=place==="wrong"||(day!==undefined&&(day<p.time.fromDay||day>p.time.toDay));
 pcheck(outside?r.contextStatus==="outside"&&r.rows.length===0:r.contextStatus===(day!==undefined&&place==="exact"?"hypothesis_match":"unknown")&&r.rows.length>0,"phase status");
 pcheck(r.rows.every(x=>x.status==="hypothesis"&&(customer!=="new"||x.goal!=="repeat_order")&&(customer!=="returning"||x.goal!=="first_order")),"customer guard");
 }
}
for(const bad of [{phase:"meeting"},{phase:"career_shift",relativeDay:1.5},{phase:"career_shift",relativeDay:NaN},{phase:"career_shift",fromSpace:""},{phase:"career_shift",toSpace:42},{phase:"career_shift",customer:"invalid"}]){assert.throws(()=>phasePaths(graph,bad));phaseChecks++}
for(const bad of [{stage:"before",fromDay:-1,toDay:0},{stage:"during",fromDay:-1,toDay:0},{stage:"after",fromDay:0,toDay:1},{stage:"before",fromDay:-1,toDay:-2}]){assert.throws(()=>validate({...graph,nodes:graph.nodes.map(n=>n.id==="career_shift"?{...n,time:{...n.time,...bad}}:n)}));phaseChecks++}
console.log("PASS Transition Phases 8.5: "+phaseChecks+" checks");
