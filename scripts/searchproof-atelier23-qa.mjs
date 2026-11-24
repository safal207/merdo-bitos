import fs from 'node:fs/promises';
import { analyzeHtml } from '../searchproof/src/core.mjs';
import { extractPageSignals } from '../searchproof/src/crawler.mjs';
import assert from 'node:assert/strict';

const hosts=new Set(['atelier-23.ru','www.atelier-23.ru','atelier23.store','www.atelier23.store']);
const roots=['https://atelier-23.ru/','https://atelier23.store/'];
const seeds=[
'/', '/personal-tailoring/', '/sign-up-for-a-fitting-room/', '/shop/dark-navy-classic-suit/', '/privacy-policy/'
].map(p=>new URL(p,roots[0]).href).concat([
'/','/pt','/pages/made-to-measure','/pt/pages/contactos','/products/round-neck-navy','/pt/products/camisola-gola-redonda-merino-azul-marinho'
].map(p=>new URL(p,roots[1]).href));
const keys=['utm_source','utm_medium','utm_campaign','utm_content'];
const tag={utm_source:'telegram',utm_medium:'story',utm_campaign:'qa_link_check',utm_content:'ci_synthetic'};
function safe(input){
  const u=new URL(input);
  return hosts.has(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&!u.port&&!/\/(?:cart|checkout|checkouts|orders|account|admin|wp-admin|wp-json|logout|login|localization|contact)(?:\/|$)/i.test(u.pathname)&&![...u.searchParams.keys()].some(k=>/^(add-to-cart|remove_item|wc-ajax|_wpnonce|action|quantity|key|token|session)$/i.test(k));
}
function classify(status){return status===404||status===410?'broken':status===403||status===429||status===0||status>=500?'inconclusive':status>=200&&status<300?'ok':'review'}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function meta(html,key){
  const attr=(s,n)=>s.match(new RegExp('(?:^|\\s)'+n+'\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)','i'))?.slice(1).find(x=>x!==undefined)||'';
  for(const t of html.match(/<meta\b[^>]*>/gi)||[]) if((attr(t,'property')||attr(t,'name')).toLowerCase()===key)return attr(t,'content');
  return '';
}
assert.equal(safe('https://atelier-23.ru/?add-to-cart=12'),false);
assert.equal(safe('https://atelier23.store/cart/add.js'),false);
assert.equal(safe('https://other.example/'),false);
assert.equal(classify(403),'inconclusive');
assert.equal(classify(404),'broken');
assert.equal(meta('<meta property="og:image" content="photo.jpg">','og:image'),'photo.jpg');
const rows=[], edges=[], linkRows=[], campaigns=[], visited=new Map();
let requests=0;
async function probe(input){
  let url=input;const chain=[],seen=new Set();
  try{
    for(let hop=0;hop<6;hop++){
      if(!safe(url)||seen.has(url))return {input,finalUrl:url,status:0,chain,error:'blocked target or redirect loop'};
      if(requests>=100)return {input,finalUrl:url,status:0,chain,error:'request budget'};
      seen.add(url);requests++;await delay(800);
      const res=await fetch(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'user-agent':'Mozilla/5.0 (compatible; SearchProof QA; public read-only audit)','accept':'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.1'}});
      const loc=res.headers.get('location');chain.push({url,status:res.status,location:loc?new URL(loc,url).href:null});
      if(res.status>=300&&res.status<400&&loc){await res.body?.cancel();url=new URL(loc,url).href;continue;}
      const type=res.headers.get('content-type')||'';
      let html='';
      if(/html|xml|text\/plain/i.test(type)){
        const reader=res.body?.getReader();let size=0;const decoder=new TextDecoder();
        if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4_000_000){await reader.cancel();break;}html+=decoder.decode(value,{stream:true});}
      }else await res.body?.cancel();
      const challenge=/just a moment|attention required|cf-chl|challenge-platform/i.test(html.slice(0,20000))&&!/<meta[^>]+(?:og:title|description)/i.test(html.slice(0,20000));
      return {input,finalUrl:url,status:res.status,chain,type,html,challenge,error:challenge?'possible bot challenge':''};
    }
    return {input,finalUrl:url,status:0,chain,error:'redirect limit'};
  }catch(e){return {input,finalUrl:url,status:0,chain,error:String(e)};}
}
function publicResult(p){const {html,...r}=p;return {...r,verdict:p.challenge?'inconclusive':classify(p.status)};}
await fs.mkdir('qa-searchproof-evidence',{recursive:true});
try{
  const metadata=new Map();
  for(const root of roots){
    const robots=await probe(new URL('/robots.txt',root).href);
    const sitemap=await probe(new URL(root===roots[0]?'/sitemap_index.xml':'/sitemap.xml',root).href);
    metadata.set(new URL(root).origin,{robots:{url:robots.finalUrl,status:robots.status,body:robots.html||''},sitemap:{url:sitemap.finalUrl,status:sitemap.status}});
  }
  for(const url of seeds){
    const p=await probe(url);visited.set(url,publicResult(p));
    const row=publicResult(p);
    if(row.verdict==='ok'&&/html/i.test(p.type)&&p.html){
      const audit=analyzeHtml({html:p.html,requestedUrl:url,finalUrl:p.finalUrl,httpStatus:p.status,...metadata.get(new URL(url).origin)});
      const signals=extractPageSignals(p.html,p.finalUrl);
      row.title=signals.title;row.description=signals.description;row.canonical=signals.canonical;
      row.social=Object.fromEntries(['og:title','og:description','og:image','og:image:width','og:image:height','og:url','og:type','twitter:card','twitter:image'].map(k=>[k,meta(p.html,k)]));
      row.findings=audit.findings.filter(f=>f.status!=='pass');
      row.scores=audit.scores;
      for(const target of signals.internalLinks)edges.push({from:url,to:target});
      for(const m of p.html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)){
        try{const u=new URL(m[1].replace(/&amp;/g,'&'),p.finalUrl);
          if(/^(t\.me|telegram\.me|wa\.me|api\.whatsapp\.com)$/i.test(u.hostname)){
            linkRows.push({from:url,to:u.href,kind:'messenger',verdict:'syntax_only_not_opened',utmPresent:keys.filter(k=>u.searchParams.has(k))});
          }
        }catch{}
      }
    }
    rows.push(row);
  }
  // Bounded sample, no query-generated links or commerce mutations.
  const eligible=[...new Set(edges.map(e=>e.to))].filter(u=>{try{return safe(u)&&!new URL(u).search&&!visited.has(u)&&!/(\.(pdf|zip|jpg|png|mp4|webp|svg|css|js))$/i.test(new URL(u).pathname)}catch{return false}});
  const selected=roots.flatMap(root=>eligible.filter(u=>new URL(u).origin===new URL(root).origin).slice(0,12));
  for(const u of selected){const p=publicResult(await probe(u));visited.set(u,p);linkRows.push({kind:'internal',...p});}
  for(const base of [seeds[0],seeds[1],seeds[2],seeds[3],seeds[5],seeds[6],seeds[7],seeds[10]]){
    const u=new URL(base);Object.entries(tag).forEach(([k,v])=>u.searchParams.set(k,v));
    const p=await probe(u.href),final=new URL(p.finalUrl);
    const retained=keys.filter(k=>final.searchParams.get(k)===tag[k]);
    campaigns.push({...publicResult(p),base,retained,missing:keys.filter(k=>!retained.includes(k)),note:'Synthetic CI URL; only URL parameter preservation, not analytics reception or sales attribution'});
  }
}finally{
 const graph=edges.map(e=>({...e,observed:visited.get(e.to)?.verdict||'not_sampled',status:visited.get(e.to)?.status??null}));
 const report={generatedAt:new Date().toISOString(),searchproofRef:'67366c17ace5a383e68f8ebf3cf45f2960bcfe8c',scope:'Public read-only bounded sample; no messages, forms, orders or analytics access',requests,pages:rows,links:linkRows,campaigns,graph};
 await fs.writeFile('qa-searchproof-evidence/report.json',JSON.stringify(report,null,2));
 const lines=['# Atelier 23 · SearchProof QA','',report.scope,'','| URL | HTTP | Observation | OG image |','|---|---|---|---|',...rows.map(r=>'| '+r.input+' | '+r.status+' | '+r.verdict+' | '+(r.social?.['og:image']?'present':r.social?'missing':'not checked')+' |'),'','## UTM URL preservation',...campaigns.map(r=>'- '+r.base+': '+r.verdict+'; '+r.retained.length+'/4 parameters retained'),'','## Sampled internal links',...linkRows.filter(x=>x.kind==='internal').map(r=>'- '+r.input+': '+r.status+' '+r.verdict),'','No traffic, ranking or conversion claims. Redirect and HTML evidence only.'];
 await fs.writeFile('qa-searchproof-evidence/summary.md',lines.join('\n'));
 if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));
 console.log(JSON.stringify({requests,pages:rows.length,ok:rows.filter(r=>r.verdict==='ok').length,internal:linkRows.filter(r=>r.kind==='internal').length,campaigns:campaigns.length,broken:linkRows.filter(r=>r.verdict==='broken').length,inconclusive:rows.filter(r=>r.verdict==='inconclusive').length}));
 if(!rows.some(r=>r.verdict==='ok'&&r.social))process.exitCode=1;
}
