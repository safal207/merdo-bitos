import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile(new URL("./locale.js",import.meta.url),"utf8");
const {translate,localizeTree,translations}=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
test("all dictionary entries are exact and Russian remains canonical",()=>{
 for(const [ru,en] of Object.entries(translations)){assert.equal(translate(ru,"en"),en);assert.equal(translate(ru,"ru"),ru)}
});
test("source text coverage and RUB amounts",async()=>{
 const files=await Promise.all(["index.html","overlay.js"].map(p=>readFile(new URL(p,import.meta.url),"utf8")));
 assert.doesNotMatch(translate(files.join("\n"),"en"),/[А-Яа-яЁё]/);
 assert.equal(translate("145\u00a0000 ₽","en"),"145,000 RUB");
});
test("live text and aria labels round trip without rebuilding the DOM",()=>{
 const node={data:"Ваш момент."},a={"aria-label":"Нравится фильм"};
 const el={getAttribute:k=>a[k],hasAttribute:k=>Object.hasOwn(a,k),setAttribute:(k,v)=>a[k]=v,querySelectorAll:()=>[]};
 const oldDoc=globalThis.document,oldFilter=globalThis.NodeFilter;
 try{
  globalThis.NodeFilter={SHOW_TEXT:4};globalThis.document={createTreeWalker:()=>{let once=false;return {nextNode(){if(once)return null;once=true;return node}}}};
  localizeTree(el,"en");assert.equal(node.data,"Your moment.");assert.equal(a["aria-label"],"Like film");
  localizeTree(el,"ru");assert.equal(node.data,"Ваш момент.");assert.equal(a["aria-label"],"Нравится фильм");
  localizeTree(el,"en");node.data="Без слов.";a["aria-label"]="Выключить звук";localizeTree(el,"en");
  assert.equal(node.data,"Without words.");assert.equal(a["aria-label"],"Mute");
  localizeTree(el,"ru");assert.equal(node.data,"Без слов.");assert.equal(a["aria-label"],"Выключить звук");
 }finally{globalThis.document=oldDoc;globalThis.NodeFilter=oldFilter}
});
