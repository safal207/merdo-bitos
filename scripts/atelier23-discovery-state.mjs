import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync("atelier23/audit/index.html","utf8");
const match=html.match(/\/\* DISCOVERY_CORE_START \*\/([\s\S]*?)\/\* DISCOVERY_CORE_END \*\//);
if(!match)throw Error("production state core missing");
const api=vm.runInNewContext(match[1]+"\n;({markets,needs,assessments,actions,initial,evidence,allowedActions,transition,summary})");

const {markets,needs,assessments,actions,initial,evidence,allowedActions,transition,summary}=api;
let passed=0,paths=0;function check(ok,label){if(!ok)throw Error(label);passed++}
const choose=(s,value)=>transition(s,{type:"choose",value});const next=s=>transition(s,{type:"continue"});const back=s=>transition(s,{type:"back"});const reset=s=>transition(s,{type:"reset"});
for(const m of Object.keys(markets))for(const n of Object.keys(needs))for(const g of Object.keys(needs[n].goals)){
 const s0=initial(),s1=choose(s0,m),s2=choose(s1,n),s3=choose(s2,g),s4=next(s3);
 check(s1.step===1&&s2.step===2&&s3.step===3&&s4.step===4,"ordered states");
 check(evidence(s3)!=="search"||m!=="moscow","no unsupported Moscow search claim");
 check(choose(s3,"pilot")===s3,"no out-of-order action");
 for(const a of Object.keys(assessments)){
  const s5=choose(s4,a),allowed=allowedActions(s5);
  check(s5.step===5,"assessment transition");
  check((a==="relevant"&&g!=="unknown")===allowed.includes("pilot"),"pilot consent guard");
  for(const action of Object.keys(actions)){
   const s6=choose(s5,action);
   if(!allowed.includes(action)){check(s6===s5,"reject disallowed action");continue}
   paths++;
   check(s6.step===6&&summary(s6).includes(needs[n].label)&&summary(s6).includes(needs[n].goals[g])&&summary(s6).includes(actions[action]),"personal summary");
   check(summary(back(s6))===""&&back(s6).action==="","back invalidates summary");
   let b=s6;for(let i=6;i>0;i--){b=back(b);check(b.step===i-1,"reverse transition")}
   check(JSON.stringify(b)===JSON.stringify(initial()),"back to initial");
   check(JSON.stringify(reset(s6))===JSON.stringify(initial()),"full reset");
   check(JSON.stringify(reset(reset(s6)))===JSON.stringify(initial()),"idempotent reset");
  }
 }
 check(back(s3).goal===""&&back(s3).need===n,"goal invalidation");
 check(back(s2).need===""&&back(s2).market===m,"need invalidation");
 check(back(s1).market==="","market invalidation");
}

console.log("PASS Guided Discovery: "+passed+" assertions, "+paths+" valid terminal paths");