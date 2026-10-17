#!/usr/bin/env node
"use strict";
// Feature selection smoke test. Validates script omission and profiles against
// the same pinned Custom source used by the actual website package builder.
// A browser install test is still necessary for actual SpicyChat behavior.
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const {webcrypto}=require("node:crypto");
const root=path.resolve(__dirname,"..");
const code=fs.readFileSync(path.join(root,"assets/js/lite-features.js"),"utf8");
const release=fs.readFileSync(path.join(root,"lite/early-access/experimental-release.json"),"utf8");
const data=JSON.parse(release);
const test={};
const state=new Map();
const context={
  window:{__DSQ_CUSTOM_FEATURE_TEST__:test},
  document:{querySelector:()=>null},
  location:{hash:"",origin:"https://spicychatqol.drache.uk",pathname:"/lite/",search:""},
  history:{replaceState(){}},
  localStorage:{getItem:k=>state.get(k)||null,setItem:(k,v)=>state.set(k,v),removeItem:k=>state.delete(k)},
  TextEncoder,TextDecoder,URL,URLSearchParams,Uint8Array,DataView,Blob,
  atob,btoa,crypto:webcrypto,console,Promise,setTimeout,clearTimeout,
  fetch:async (url,options)=>String(url)==="/lite/early-access/experimental-release.json"
    ?new Response(release,{status:200,headers:{"content-type":"application/json"}})
    :fetch(url,options)
};
vm.runInNewContext(code,context,{filename:"lite-features.js",timeout:10000});

(async()=>{
  await test.ready;
  assert.equal(test.count(),112,"Expected all current v0.2.51 contracts");
  assert(test.sections().includes("Blocking"));
  assert(test.sections().includes("Filtering"));
  test.choose(["bot-blocking"]);
  let p=test.plan(),m=test.manifest();
  assert(p.activeFiles.has("content/bot-blocking.js"));
  assert(!p.activeFiles.has("content/language-filter.js"));
  assert(p.chosen.has("content/bot-blocking.js"));
  assert(!p.chosen.has("content/language-filter.js"));
  assert(!m.content_scripts.some(cs=>(cs.js||[]).includes("content/language-filter.js")));
  assert(test.backgroundProfile().includes('"bot-blocking"'));
  assert(!test.backgroundProfile().includes('"language-filter"'));
  assert(test.contentProfile().includes('"bot-blocking"'));
  assert(!test.contentProfile().includes('"language-filter"'));
  console.log("PASS: Bot Blocking does not select Language Filter");

  test.choose(["language-filter"]);
  p=test.plan();m=test.manifest();
  assert(p.activeFiles.has("content/language-filter.js"));
  assert(!p.activeFiles.has("content/bot-blocking.js"));
  assert(!p.chosen.has("content/bot-blocking.js"));
  assert(!m.content_scripts.some(cs=>(cs.js||[]).includes("content/bot-blocking.js")));
  assert(test.backgroundProfile().includes('"language-filter"'));
  console.log("PASS: Language Filter does not select Bot Blocking");

  test.choose(["ooc","chat-index"]);
  p=test.plan();
  assert(p.chosen.has("content/ooc.js"));
  assert(p.chosen.has("content/ooc-composer.js"));
  assert(p.chosen.has("content/chat-index.js"));
  assert(!p.chosen.has("content/language-filter.js"));
  assert(p.selectedStyles.has("content/styles/ooc.css"));
  assert.equal(test.recipe().selectedFeatures.length,2);
  console.log("PASS: OOC + Chat Index includes only requested feature scripts and shared files");

  test.choose([]);
  p=test.plan();
  assert(!p.chosen.has("content/ooc.js"));
  assert(!p.chosen.has("content/chat-index.js"));
  assert(p.chosen.has("content/main.js"));
  console.log("PASS: all optional features OFF leaves shared Core scripts");

  test.choose(["bot-blocking","language-filter"]);
  const fileCount=p.chosen.size;
  const features=test.recipe().selectedFeatures;
  assert.deepEqual([...features],["bot-blocking","language-filter"]);
  console.log("PASS: saved individual-feature recipe =",features.join(", "));
  console.log("Verified v"+data.version+" with "+test.count()+" real feature contracts");
})().catch(err=>{console.error(err);process.exitCode=1;});
