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
    :fetch(url, String(url).startsWith("https://api.github.com/")&&process.env.GITHUB_TOKEN
      ? {...options,headers:{...(options?.headers||{}),Authorization:"Bearer "+process.env.GITHUB_TOKEN}}
      :options)
};
vm.runInNewContext(code,context,{filename:"lite-features.js",timeout:10000});

(async()=>{
  await test.ready;
  assert(test.count()>=123,"Expected v0.2.55 individually named feature contracts");
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

  test.choose(["model-quick-access"]);
  p=test.plan();
  assert(p.activeFiles.has("content/model-quick-access.js"));
  assert(p.activeFiles.has("content/model-selector.js"));
  assert(p.selectedStyles.has("content/styles/model-quick-access.css"));
  assert(test.recipe().selectedFeatures.includes("model-selector"));
  assert(!p.activeFiles.has("content/chat-lorebook-manager.js"));
  console.log("PASS: Model Quick Access pulls its Model Selector dependency and dedicated CSS");

  test.choose(["previously-chatted-indicator"]);
  p=test.plan();
  assert(p.activeFiles.has("content/previously-chatted-indicator.js"));
  assert(p.activeFiles.has("content/opened-chats.js"));
  assert(p.selectedStyles.has("content/styles/previously-chatted-indicator.css"));
  assert(!p.activeFiles.has("content/model-quick-access.js"));
  console.log("PASS: Previously Chatted Indicator pulls Opened Chats, not Model Quick Access");

  test.choose(["chat-lorebook-manager"]);
  p=test.plan();
  assert(p.activeFiles.has("content/chat-lorebook-manager.js"));
  assert(p.selectedStyles.has("content/styles/chat-lorebook-manager.css"));
  assert(!p.activeFiles.has("content/model-quick-access.js"));
  console.log("PASS: Chat Lorebook Manager has an independent script and stylesheet");

  test.choose(["story-day-tracker"]);
  p=test.plan();m=test.manifest();
  assert(p.selectedStyles.has("content/styles/story-day-tracker.css"));
  assert(m.content_scripts.some(cs=>(cs.css||[]).includes("content/styles/story-day-tracker.css")));
  test.choose([]);
  p=test.plan();
  assert(!p.selectedStyles.has("content/styles/story-day-tracker.css"));
  console.log("PASS: Story Day Tracker owns its v0.2.54 style separately");

  test.choose(["wiki-lorebook-importer"]);
  p=test.plan();
  assert(p.selectedStyles.has("content/styles/wiki-lorebook-importer.css"));
  test.choose([]);
  p=test.plan();
  assert(!p.selectedStyles.has("content/styles/wiki-lorebook-importer.css"));
  console.log("PASS: Wiki Lorebook Importer stylesheet omitted when unselected");

  test.choose(["ooc"]);
  p=test.plan();
  assert(p.selectedStyles.has("content/styles/ooc.css"));
  test.choose([]);
  p=test.plan();
  assert(!p.selectedStyles.has("content/styles/ooc.css"));
  console.log("PASS: v0.2.54 OOC styles no longer required in unrelated builds");

  test.choose(["soundscapes"]);
  p=test.plan();
  assert(p.selectedStyles.has("content/styles/soundscapes.css"));
  test.choose([]);
  p=test.plan();
  assert(!p.selectedStyles.has("content/styles/soundscapes.css"));
  console.log("PASS: Soundscapes styles can be omitted independently in v0.2.55");

  test.choose(["my-creations-backup"]);
  p=test.plan();
  assert(p.chosen.has("content/my-creations-backup.js"));
  for(const dep of ["bot-backup","card-token-info","lorebook-backup","lorebook-tags"])
    assert(test.recipe().selectedFeatures.includes(dep),"My Creations Backup dependency missing: "+dep);
  assert(p.chosen.has("settings/feature-panels/bot-backup.js"));
  assert(p.chosen.has("settings/feature-panels/lorebook-backup.js"));
  console.log("PASS: v0.2.56 My Creations Backup pulls Bot/Lorebook Backup and owned Settings");

  test.choose(["bot-archive"]);
  p=test.plan();
  assert(p.chosen.has("settings/feature-panels/bot-archive.js"));
  console.log("PASS: Bot Archive v0.2.56 dedicated Settings panel included on selection");

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

  // Test package transformations on real, pinned Full-source HTML/worker files.
  const base="https://raw.githubusercontent.com/"+data.repository+"/"+data.commit+"/";
  const [optionsRes,entryRes]=await Promise.all([fetch(base+"options.html"),fetch(base+"background-entry.js")]);
  assert(optionsRes.ok&&entryRes.ok,"Pinned source HTML/worker should be downloadable");
  const originalOptions=await optionsRes.text(),originalWorker=await entryRes.text();
  const index=test.getPackageIndex();
  const ownedSettings=[...new Set(index.features.flatMap(x=>x.settings))];
  assert(ownedSettings.length>=33,"Expected 33 v0.2.56 Settings panels with declared owners");
  assert(index.features.every(f=>!f.defaultSelected&&!f.defaultUpdatesEnabled));
  test.choose([]);
  p=test.plan();
  for(const file of ownedSettings)assert(!p.chosen.has(file),"Unselected Settings script physically retained: "+file);
  for(const file of ["background/background-translation.js","background/background-wiki-fetch.js"])
    assert(!p.chosen.has(file),"Unselected message-only background service retained: "+file);
  const emptySettings=test.pruneSettings(originalOptions);
  const emptyWorker=test.pruneBackground(originalWorker);
  for(const file of ownedSettings)assert(!emptySettings.includes('src="'+file+'"'),"Settings HTML still imports "+file);
  assert(!emptySettings.includes('data-dsq-feature-panel="translation"'));
  assert(!emptySettings.includes('data-dsq-feature-panel="context-keeper"'));
  assert(!emptyWorker.includes('"background/background-translation.js"'));
  assert(!emptyWorker.includes('"background/background-wiki-fetch.js"'));
  assert(emptyWorker.includes('"background/background-events.js"'));
  console.log("PASS: all 33 owned Settings panels and two safe optional background services are omitted when OFF");

  test.choose(["translation","context-keeper"]);
  p=test.plan();
  assert(p.chosen.has("settings/feature-panels/translation.js"));
  assert(p.chosen.has("settings/feature-panels/context-keeper.js"));
  assert(!p.chosen.has("settings/feature-panels/soundscapes.js"));
  assert(p.chosen.has("background/background-translation.js"));
  assert(!p.chosen.has("background/background-wiki-fetch.js"));
  const selectedSettings=test.pruneSettings(originalOptions);
  assert(selectedSettings.includes('src="settings/feature-panels/translation.js"'));
  assert(selectedSettings.includes('src="settings/feature-panels/context-keeper.js"'));
  assert(!selectedSettings.includes('src="settings/feature-panels/soundscapes.js"'));
  assert(selectedSettings.includes('data-dsq-feature-panel="translation"'));
  assert(!selectedSettings.includes('data-dsq-feature-panel="soundscapes"'));
  const selectedWorker=test.pruneBackground(originalWorker);
  assert(selectedWorker.includes('"background/background-translation.js"'));
  assert(!selectedWorker.includes('"background/background-wiki-fetch.js"'));
  assert.throws(()=>test.pruneSettings(originalOptions.replace(
    '<script src="settings/feature-panels/translation.js"></script>','')),
    /Cannot safely isolate Settings panel/,"A missing known panel must fail closed");
  console.log("PASS: selected Settings panels and Translation background remain, unselected ones are removed");
  test.choose(["wiki-lorebook-importer"]);
  const wikiWorker=test.pruneBackground(originalWorker);
  assert(wikiWorker.includes('"background/background-wiki-fetch.js"'));
  assert(!wikiWorker.includes('"background/background-translation.js"'));
  console.log("PASS: Wiki Fetch can be included without Translation background");

  console.log("Verified v"+data.version+" with "+test.count()+" real feature contracts");
})().catch(err=>{console.error(err);process.exitCode=1;});
