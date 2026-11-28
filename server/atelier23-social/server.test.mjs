import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {mkdtemp,rm,readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createSocialServer,TARGETS} from "./server.mjs";
const clientSource=await readFile(new URL("../../atelier23/fashion-overlay/global-social.js",import.meta.url),"utf8");
const {createSocialClient}=await import("data:text/javascript;base64,"+Buffer.from(clientSource).toString("base64"));
const origin="https://safal207.github.io",secret="test-only-secret-that-is-long-enough";
async function fixture(t){
 const dir=await mkdtemp(join(tmpdir(),"atelier-social-")),file=join(dir,"test.sqlite");let now=1700000040000,instance,base;
 async function start(){instance=createSocialServer({file,origin,secret,clock:()=>now});await new Promise(r=>instance.server.listen(0,"127.0.0.1",r));base="http://127.0.0.1:"+instance.server.address().port}
 async function stop(){await new Promise(r=>instance.server.close(r));instance.db.close()}
 await start();t.after(async()=>{await stop();await rm(dir,{recursive:true,force:true})});
 async function request(path,body,token,from=origin){const r=await fetch(base+path,{method:body===undefined?"GET":"POST",headers:{Origin:from,...(body===undefined?{}:{"Content-Type":"application/json"}),...(token?{Authorization:"Bearer "+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,body:await r.json()}}
 const session=async()=>{const r=await request("/v1/session",{});assert.equal(r.status,201);return r.body.token};
 const like=(token,target,eventId=randomUUID())=>request("/v1/likes",{target,eventId},token);
 return {request,session,like,advance:ms=>{now+=ms},restart:async()=>{await stop();await start()},get base(){return base}};
}
test("zero counts, independent products, repeated taps and restart",async t=>{
 const f=await fixture(t),first=await f.request("/v1/stats");assert.deepEqual(first.body.counts,Object.fromEntries(TARGETS.map(x=>[x,0])));
 const a=await f.session(),b=await f.session();
 await Promise.all([...Array.from({length:5},()=>f.like(a,"navy")),...Array.from({length:3},()=>f.like(b,"ivory")),f.like(b,"film")]).then(rs=>assert.ok(rs.every(r=>r.status===200)));
 let s=(await f.request("/v1/stats")).body;
 assert.deepEqual([s.counts.navy,s.counts.ivory,s.counts.film],[5,3,1]);assert.equal(s.ranking[0].target,"navy");
 await f.restart();assert.deepEqual((await f.request("/v1/stats")).body,s);
});
test("idempotency under simultaneous retry; reject conflict, unknown target and missing session",async t=>{
 const f=await fixture(t),a=await f.session(),b=await f.session(),id=randomUUID();
 const rs=await Promise.all(Array.from({length:8},()=>f.like(a,"grey",id)));
 assert.equal(rs.filter(r=>r.body.duplicate===false).length,1);assert.equal(rs.filter(r=>r.body.duplicate===true).length,7);
 assert.equal((await f.like(a,"navy",id)).status,409);assert.equal((await f.like(b,"grey",id)).status,409);
 assert.equal((await f.like(a,"invalid")).status,400);assert.equal((await f.like("", "navy")).status,401);
 assert.equal((await f.request("/v1/stats",undefined,undefined,"https://other.invalid")).status,403);
 assert.equal((await f.request("/v1/stats")).body.counts.grey,1);
});
test("per-session and source rate limit, expiry and no inflation",async t=>{
 const f=await fixture(t),a=await f.session();
 const rs=await Promise.all(Array.from({length:35},()=>f.like(a,"black")));
 assert.equal(rs.filter(r=>r.status===200).length,30);assert.equal(rs.filter(r=>r.status===429).length,5);
 assert.equal((await f.request("/v1/stats")).body.counts.black,30);
 for(let i=0;i<3;i++){const token=await f.session();const r=await Promise.all(Array.from({length:30},()=>f.like(token,"black")));assert.equal(r.filter(x=>x.status===200).length,30)}
 const b=await f.session();assert.equal((await f.like(b,"black")).status,429);
 assert.equal((await f.request("/v1/stats")).body.counts.black,120);
 f.advance(60000);assert.equal((await f.like(b,"black")).status,200);
 f.advance(86400001);assert.equal((await f.like(b,"black")).status,401);
});
test("client preserves local mode, serializes taps, retries same event ID and receives real totals",async t=>{
 const f=await fixture(t),storage=new Map(),store={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 let lost=false,requests=0,updates=[],statuses=[];
 const fetcher=async(url,options)=>{
  requests++;const path=new URL(url).pathname;
  const r=await fetch(f.base+path,{...options,headers:{...options.headers,Origin:origin}});
  if(path==="/v1/likes"&&!lost){lost=true;await r.text();throw Error("lost response after commit")}
  return r;
 };
 const disabled=createSocialClient({endpoint:"",fetcher,storage:store,uuid:randomUUID});await disabled.refresh();await disabled.like("navy");assert.equal(requests,0);
 const client=createSocialClient({endpoint:"https://example.invalid",fetcher,storage:store,uuid:randomUUID,onUpdate:s=>updates.push(s),onStatus:s=>statuses.push(s)});
 await client.refresh();await Promise.all([client.like("navy"),client.like("navy"),client.like("ivory")]);
 assert.equal(client.snapshot.counts.navy,2);assert.equal(client.snapshot.counts.ivory,1);assert.equal(client.snapshot.ranking[0].target,"navy");
 assert.equal((await f.request("/v1/stats")).body.counts.navy,2);assert.ok(statuses.includes("pending"));assert.equal(statuses.at(-1),"ready");
 assert.ok(updates.length>=4);
});
