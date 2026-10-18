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
  assert(test.count()>=118,"Expected v0.2.52 independently named feature contracts");
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

  test.choose(["auto-blocking"]);
  p=test.plan();m=test.manifest();
  assert(p.activeFiles.has("content/auto-blocking.js"));
  assert(p.activeFiles.has("content/bot-blocking.js"));
  assert(p.activeFiles.has("content/cards.js"));
  assert(!p.activeFiles.has("content/language-filter.js"));
  assert(test.recipe().selectedFeatures.includes("bot-blocking"));
  assert(test.recipe().selectedFeatures.includes("cards"));
  console.log("PASS: Auto Blocking pulls its bot/card dependencies, not Language Filter");

  test.choose(["auto-images"]);
  p=test.plan();
  assert(p.activeFiles.has("content/auto-images.js"));
  assert(p.activeFiles.has("content/chat-picture-core.js"));
  assert(p.activeFiles.has("content/custom-pictures-menu.js"));
  assert(!p.activeFiles.has("content/auto-voice.js"));
  assert(!p.chosen.has("content/auto-voice.js"));
  console.log("PASS: Auto Images includes picture helpers but omits Auto Voice");

  test.choose(["character-pictures"]);
  p=test.plan();
  assert(p.activeFiles.has("content/character-pictures.js"));
  assert(p.activeFiles.has("content/chat-picture-editor-core.js"));
  assert(p.activeFiles.has("content/chat-picture-override-core.js"));
  assert(!p.activeFiles.has("content/persona-pictures.js"));
  assert(!p.activeFiles.has("content/picture-library.js"));
  console.log("PASS: Character Pictures includes required editor helpers separately from Persona Pictures");

  test.choose(["chat-search"]);
  p=test.plan();
  assert(p.selectedStyles.has("content/styles/chat-search.css"));
  test.choose([]);
  p=test.plan();
  assert(!p.selectedStyles.has("content/styles/chat-search.css"));
  console.log("PASS: feature-owned Chat Search CSS is omitted when not selected");

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
