import {createServer} from "node:http";
import {DatabaseSync} from "node:sqlite";
import {randomBytes,createHash,createHmac} from "node:crypto";
import {pathToFileURL} from "node:url";
export const TARGETS=["film","navy","grey","black","ivory","travel-navy","travel-black"];
const sha=s=>createHash("sha256").update(s).digest("hex");
const DAY=86400000,MIN=60000;
export function createSocialServer({file="social.sqlite",origin,secret,clock=Date.now}={}){
 if(!origin||!secret||secret.length<32)throw Error("SOCIAL_ORIGIN and SOCIAL_SECRET (32+ characters) required");
 const db=new DatabaseSync(file);
 db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS totals(target TEXT PRIMARY KEY,n INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,token TEXT NOT NULL,target TEXT NOT NULL,ts INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS limits(k TEXT PRIMARY KEY,n INTEGER NOT NULL,expires INTEGER NOT NULL)");
 for(const id of TARGETS)db.prepare("INSERT OR IGNORE INTO totals(target,n) VALUES (?,0)").run(id);
 const transaction=fn=>{db.exec("BEGIN IMMEDIATE");try{const x=fn();db.exec("COMMIT");return x}catch(e){db.exec("ROLLBACK");throw e}};
 const stats=()=>{const counts=Object.fromEntries(db.prepare("SELECT target,n FROM totals").all().map(r=>[r.target,r.n]));return {counts,ranking:TARGETS.slice(1).map(target=>({target,count:counts[target]})).sort((a,b)=>b.count-a.count||a.target.localeCompare(b.target)),scope:"accepted_taps"}};
 function take(key,max,expires){const old=db.prepare("SELECT n FROM limits WHERE k=?").get(key);if((old?.n||0)>=max)return false;db.prepare("INSERT INTO limits(k,n,expires) VALUES (?,1,?) ON CONFLICT(k) DO UPDATE SET n=n+1").run(key,expires);return true}
 const fail=(status,error)=>({status,body:{error}});
 function cleanup(now){db.prepare("DELETE FROM limits WHERE expires<=?").run(now);db.prepare("DELETE FROM sessions WHERE expires<=?").run(now);db.prepare("DELETE FROM events WHERE ts<?").run(now-DAY)}
 const ipKey=(address,day)=>createHmac("sha256",secret).update(day+":"+address).digest("hex");
 const server=createServer(async(req,res)=>{
  res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.setHeader("Vary","Origin");
  const reply=(status,body)=>{res.statusCode=status;if(status===429)res.setHeader("Retry-After","60");res.end(body===null?"":JSON.stringify(body))};
  if(req.headers.origin!==origin)return reply(403,{error:"origin"});
  res.setHeader("Access-Control-Allow-Origin",origin);res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
  if(req.method==="OPTIONS")return reply(204,null);
  if(req.method==="GET"&&req.url==="/v1/stats")return reply(200,stats());
  if(req.method!=="POST"||!["/v1/session","/v1/likes"].includes(req.url))return reply(404,{error:"not_found"});
  if(!/^application\/json(?:;|$)/i.test(req.headers["content-type"]||""))return reply(415,{error:"content_type"});
  let body;try{let bytes=0,parts=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>1024)return reply(413,{error:"body_size"});parts.push(chunk)}body=JSON.parse(Buffer.concat(parts).toString());if(!body||typeof body!=="object"||Array.isArray(body))throw Error()}catch{return reply(400,{error:"json"})}
  const now=clock(),day=Math.floor(now/DAY),minute=Math.floor(now/MIN),ip=ipKey(req.socket.remoteAddress||"unknown",day);
  try{
   const result=transaction(()=>{
    cleanup(now);
    if(req.url==="/v1/session"){
     if(!take("issue:"+ip+":"+minute,10,(minute+1)*MIN))return fail(429,"session_limit");
     if(!take("issue-day:"+ip,100,(day+1)*DAY))return fail(429,"session_limit");
     const token=randomBytes(32).toString("hex");db.prepare("INSERT INTO sessions VALUES (?,?)").run(sha(token),now+DAY);
     return {status:201,body:{token}};
    }
    const token=(req.headers.authorization||"").replace(/^Bearer /,"");
    if(!/^[a-f0-9]{64}$/.test(token)||!db.prepare("SELECT 1 FROM sessions WHERE token=? AND expires>?").get(sha(token),now))return fail(401,"session");
    const hash=sha(token),{target,eventId}=body;
    if(!TARGETS.includes(target)||typeof eventId!=="string"||!/^[a-f0-9-]{36}$/.test(eventId))return fail(400,"invalid_event");
    const old=db.prepare("SELECT token,target FROM events WHERE id=?").get(eventId);
    if(old)return old.token===hash&&old.target===target?{status:200,body:{accepted:true,duplicate:true,...stats()}}:fail(409,"event_conflict");
    if(!take("tap:"+hash+":"+minute,30,(minute+1)*MIN))return fail(429,"tap_limit");
    if(!take("ip:"+ip+":"+minute,120,(minute+1)*MIN))return fail(429,"tap_limit");
    if(!take("day:"+ip,1000,(day+1)*DAY))return fail(429,"tap_limit");
    db.prepare("INSERT INTO events VALUES (?,?,?,?)").run(eventId,hash,target,now);
    db.prepare("UPDATE totals SET n=n+1 WHERE target=?").run(target);
    return {status:200,body:{accepted:true,duplicate:false,...stats()}};
   });
   return reply(result.status,result.body);
  }catch{return reply(500,{error:"server"})}
 });
 server.requestTimeout=10000;server.headersTimeout=5000;
 return {server,db};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {server}=createSocialServer({file:process.env.SOCIAL_DB||"social.sqlite",origin:process.env.SOCIAL_ORIGIN,secret:process.env.SOCIAL_SECRET});
 server.listen(Number(process.env.PORT||8787),"0.0.0.0");
}
