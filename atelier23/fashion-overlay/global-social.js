// Disabled until an HTTPS backend is deliberately configured.
export const SOCIAL_API="";
export function createSocialClient({endpoint=SOCIAL_API,fetcher=globalThis.fetch,storage=globalThis.localStorage,uuid=()=>crypto.randomUUID(),onUpdate=()=>{},onStatus=()=>{}}={}){
 const ids=["film","navy","grey","black","ivory","travel-navy","travel-black"];
 const enabled=typeof endpoint==="string"&&/^https:\/\/[^/]+(?:\/[^?#]*)?$/.test(endpoint);
 const key="bitos.atelier23.social.session.v1";let token="",snapshot=null,queue=Promise.resolve(),pending=0;
 try{token=storage.getItem(key)||""}catch{}
 const clear=()=>{token="";try{storage.removeItem(key)}catch{}};
 const request=async(path,body,auth=false)=>{
  const response=await fetcher(endpoint.replace(/\/$/,"")+path,{method:body===undefined?"GET":"POST",headers:{...(body===undefined?{}:{"Content-Type":"application/json"}),...(auth?{Authorization:"Bearer "+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(6000),cache:"no-store"});
  if(!response.ok){const e=Error("HTTP "+response.status);e.status=response.status;throw e}
  return response.json();
 };
 function accept(data){
  if(data?.scope!=="accepted_taps"||!ids.every(id=>Number.isSafeInteger(data.counts?.[id])&&data.counts[id]>=0))throw Error("Invalid totals");
  if(snapshot&&ids.some(id=>data.counts[id]<snapshot.counts[id]))return;
  const counts=Object.fromEntries(ids.map(id=>[id,data.counts[id]]));
  snapshot={counts,ranking:ids.slice(1).map(target=>({target,count:counts[target]})).sort((a,b)=>b.count-a.count||a.target.localeCompare(b.target))};
  onUpdate(snapshot);
 }
 async function session(){if(token)return;const data=await request("/v1/session",{});if(!/^[a-f0-9]{64}$/.test(data.token))throw Error("Invalid session");token=data.token;try{storage.setItem(key,token)}catch{}}
 async function refresh(){if(!enabled)return;try{accept(await request("/v1/stats"));onStatus("ready")}catch{onStatus("offline")}}
 function like(target){
  if(!enabled||!ids.includes(target))return;
  if(pending>=30){onStatus("limited");return}
  const eventId=uuid();pending++;onStatus("pending");
  queue=queue.then(async()=>{
   try{await session();let result;try{result=await request("/v1/likes",{target,eventId},true)}catch(e){if(e.status===401){clear();throw e}if(e.status)throw e;result=await request("/v1/likes",{target,eventId},true)}
    if(result.accepted!==true)throw Error("Unconfirmed");accept(result);onStatus("ready");
   }catch(e){if(e.status===401)clear();onStatus(e.status===429?"limited":"offline")}finally{pending--}
  });
  return queue;
 }
 return {enabled,refresh,like,get snapshot(){return snapshot}};
}
