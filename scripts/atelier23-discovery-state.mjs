import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync("atelier23/audit/index.html","utf8");
const match=html.match(/\/\* DISCOVERY_CORE_START \*\/([\s\S]*?)\/\* DISCOVERY_CORE_END \*\//);
if(!match)throw Error("production state core missing");
const api=vm.runInNewContext(match[1]+"\n;({markets,needs,loops,frequencies,periods,assessments,actions,initial,evidence,allowedActions,transition,summary,cohortMetrics})");

const {markets,needs,loops,frequencies,periods,assessments,actions,initial,evidence,allowedActions,transition,summary,cohortMetrics}=api;
let passed=0,paths=0;function check(ok,label){if(!ok)throw Error(label);passed++}
const choose=(s,value)=>transition(s,{type:"choose",value});const next=s=>transition(s,{type:"continue"});const back=s=>transition(s,{type:"back"});const reset=s=>transition(s,{type:"reset"});
for(const m of Object.keys(markets))for(const n of Object.keys(needs))for(const f of Object.keys(frequencies))for(const p of Object.keys(periods))for(const g of Object.keys(needs[n].goals)){
 let s=initial();for(const v of [m,n,f,p,g])s=choose(s,v);
 check(s.step===5,"ordered states");check(evidence(s)!=="search"||m!=="moscow","market guard");check(choose(s,"pilot")===s,"invalid event");
 const astate=next(s);for(const a of Object.keys(assessments)){const q=choose(astate,a);const allowed=allowedActions(q);
 check(allowed.includes("pilot")===(a==="relevant"&&g!=="unknown"&&f!=="unknown"&&p!=="unknown"),"pilot guard");
 for(const action of Object.keys(actions)){const z=choose(q,action);if(!allowed.includes(action)){check(z===q,"reject");continue}paths++;
 const str=summary(z);check(z.step===8&&str.includes(frequencies[f])&&str.includes(periods[p])&&str.includes(loops[n][2])&&str.includes(actions[action]),"summary");
 check(summary(back(z))===""&&back(z).action==="","invalidate summary");let b=z;for(let i=8;i>0;i--){b=back(b);check(b.step===i-1,"back")}
 check(JSON.stringify(b)===JSON.stringify(initial()),"all fields cleared");check(JSON.stringify(reset(z))===JSON.stringify(initial()),"reset");
 }
 }
 const b=back(back(s));check(b.step===3&&b.period===""&&b.goal===""&&b.frequency===f,"period reset");
}
const sample={customers:10,repeatCustomers:3,orders:15,netRevenue:1000,variableCosts:400,acquisitionCosts:100};const r=cohortMetrics(sample);check(r.repeatRate===.3&&r.ordersPerCustomer===1.5&&r.revenuePerCustomer===100&&r.contributionPerCustomer===50,"known control");
for(const bad of [null,{}, {...sample,customers:0},{...sample,repeatCustomers:11},{...sample,orders:12},{...sample,orders:1.5},{...sample,netRevenue:NaN},{...sample,acquisitionCosts:"100"},{...sample,repeatCustomers:0}])check(cohortMetrics(bad)===null,"invalid financial inputs");
check(cohortMetrics({...sample,variableCosts:1500}).contributionPerCustomer===-60,"negative contribution preserved");
check(cohortMetrics({...sample,netRevenue:-100}).revenuePerCustomer===-10,"net refunds allowed");
check(cohortMetrics({...sample,netRevenue:-100}).contributionPerCustomer===-60,"refund loss preserved");
for(const bad of [{...sample,customers:1e20,orders:1e20},{...sample,orders:Number.MAX_SAFE_INTEGER+1},{...sample,variableCosts:Number.MAX_VALUE,acquisitionCosts:Number.MAX_VALUE},{...sample,netRevenue:-Number.MAX_VALUE,variableCosts:Number.MAX_VALUE},{...sample,variableCosts:-1},{...sample,acquisitionCosts:-1}])check(cohortMetrics(bad)===null,"reject unsafe numbers or nonfinite results");
// Compare count constraints to a small exhaustive independent enumeration.
for(let c=1;c<=12;c++)for(let r=0;r<=c+1;r++)for(let o=0;o<=36;o++){
 const valid=r<=c&&o>=c+r&&(r>0||o===c);
 check((cohortMetrics({...sample,customers:c,repeatCustomers:r,orders:o})!==null)===valid,"cohort counts");
}


console.log("PASS Customer Need Loop: "+passed+" assertions, "+paths+" valid terminal paths");