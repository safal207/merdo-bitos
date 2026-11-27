import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile(new URL("./social.js",import.meta.url),"utf8");
const {englishDemoURL,xIntentURL,X_TAGS,X_TEXT}=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
const base="https://safal207.github.io/merdo-bitos/atelier23/fashion-overlay/";
test("English share URL strips personal journey and fragment",()=>{
 assert.equal(englishDemoURL(base+"?event=wedding&look=navy&lang=ru#step"),base+"?lang=en");
});
test("X intent includes English copy and hashtags",()=>{
 const u=new URL(xIntentURL(base));
 assert.equal(u.origin,"https://twitter.com");
 assert.equal(u.pathname,"/intent/tweet");
 assert.equal(u.searchParams.get("url"),base+"?lang=en");
 assert.equal(u.searchParams.get("text"),X_TEXT);
 assert.equal(u.searchParams.get("hashtags"),X_TAGS);
 assert.match(X_TAGS,/^[A-Za-z]+(,[A-Za-z]+)*$/);
});
test("static card metadata is English without client-side JS",async()=>{
 const html=await readFile(new URL("./index.html",import.meta.url),"utf8");
 for(const key of ["card","title","description","image","image:alt"]){
  const m=html.match(new RegExp('<meta name="twitter:'+key+'" content="([^"]+)">'));
  assert.ok(m,key);assert.doesNotMatch(m[1],/[А-Яа-яЁё]/);
 }
 assert.match(html,/property="og:locale" content="en_US"/);
 assert.match(html,/id="share-x"/);
});
