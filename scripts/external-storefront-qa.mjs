import fs from 'node:fs/promises';
import {chromium,firefox,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const engine=process.env.QA_BROWSER||'chromium';
const browser=await ({chromium,firefox,webkit}[engine]).launch({headless:true});
const out='qa-evidence';
await fs.mkdir(out,{recursive:true});
const scenarios=[
 ['en-search','https://atelier23.store/search?q=suit','positive'],
 ['pt-search','https://atelier23.store/pt/search?q=fato','positive'],
 ['en-empty','https://atelier23.store/search?q=qa-a23-no-result-7419','negative'],
 ['pt-empty','https://atelier23.store/pt/search?q=qa-a23-no-result-7419','negative'],
 ['ru-home','https://atelier-23.ru/','page'],
 ['ru-booking','https://atelier-23.ru/sign-up-for-a-fitting-room/','page'],
 ['ru-product','https://atelier-23.ru/shop/dark-navy-classic-suit/','page'],
 ['pt-home','https://atelier23.store/pt','page'],
 ['pt-mtm','https://atelier23.store/pages/made-to-measure','page'],
 ['pt-product','https://atelier23.store/pt/products/camisola-gola-redonda-merino-azul-marinho','page']
];
const rows=[];
try {
for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:width===390?844:900},locale:'en-US'});
 for(const [id,url,kind] of scenarios){
  const page=await context.newPage();const errors=[],network=[];
  page.on('pageerror',e=>errors.push(String(e).slice(0,400)));
  page.on('response',r=>{if(r.status()>=400)network.push({status:r.status(),url:r.url().split('?')[0]});});
  page.on('requestfailed',r=>network.push({error:r.failure()?.errorText,url:r.url().split('?')[0]}));
  const record={id,url,engine,width,kind};
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   record.status=response?.status();
   await page.waitForLoadState('load',{timeout:12000}).catch(()=>{});
   await page.waitForTimeout(4000);
   record.title=await page.title();
   record.finalUrl=page.url();
   record.snapshot=await page.evaluate(()=>{
    const main=document.querySelector('main,#MainContent,[role=main]');
    const shown=e=>!!(e.getClientRects().length&&getComputedStyle(e).visibility==='visible'&&getComputedStyle(e).display!=='none');
    const links=main?[...main.querySelectorAll('a[href*="/products/"]')].filter(shown).map(a=>a.href.split('?')[0]):[];
    return {mainPresent:!!main,visibleProductLinks:[...new Set(links)],mainText:main?.innerText.slice(0,1800),headings:[...document.querySelectorAll('h1')].filter(shown).map(e=>e.innerText),overflow:document.documentElement.scrollWidth>innerWidth+2,viewport:{width:innerWidth,height:innerHeight},navigation:performance.getEntriesByType('navigation').map(n=>({responseStart:n.responseStart,domContentLoaded:n.domContentLoadedEventEnd,load:n.loadEventEnd,transferSize:n.transferSize}))};
   });
   if(kind==='positive'){
    const count=Number(record.title.match(/(?:Search:|Pesquisa:)\s*(\d+)/i)?.[1]);
    record.expectedTitleCount=Number.isFinite(count)?count:null;
    record.verdict=record.status!==200||!record.snapshot.mainPresent||!Number.isFinite(count)||count===0?'INCONCLUSIVE':record.snapshot.visibleProductLinks.length===0?'NO_VISIBLE_PRODUCT_LINKS':'VISIBLE_PRODUCT_LINKS_PRESENT';
   }else if(kind==='negative'){
    record.verdict=record.status===200&&record.snapshot.mainPresent?'REVIEW_EMPTY_STATE':'INCONCLUSIVE';
   }
   await page.screenshot({path:out+'/'+engine+'-'+width+'-'+id+'.png',timeout:10000});
   if(engine==='chromium'&&width===390&&['ru-home','ru-booking','pt-home','pt-mtm'].includes(id)){
    try{const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();record.axe=a.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}));}catch(e){record.axeError=String(e);}
   }
  }catch(e){record.error=String(e);record.verdict='INCONCLUSIVE';}
  record.jsErrors=errors.slice(0,25);record.networkIssues=network.slice(0,40);
  rows.push(record);await page.close();await new Promise(r=>setTimeout(r,1000));
 }
 await context.close();
}
}finally{
 await fs.writeFile(out+'/summary.json',JSON.stringify(rows,null,2));
 await browser.close();
 console.log(JSON.stringify({browser:engine,observations:rows.length,completed:rows.filter(r=>!r.error).length}));
}
