(() => {
'use strict';
// Unified early-access Custom builder; QoL source is pinned through release metadata.
// Experimental combinations are NOT certified to work in Chrome/Brave.
const T = new TextEncoder();
const D = new TextDecoder();
const STORE = 'sqol-custom-experimental-v1';
const LEGACY_STORE = 'sqol-lite-builder-v1';
const BUILD_NAME = 'SpicyChat QoL Custom (Early Access)';
const MARKER = 'qol-custom-early-access.json';
const EXCLUDED = new Set([
  '.gitignore','README.md','SECURITY.md','PERMISSIONS.md','PRIVACY.md',
  'CONTRIBUTING.md','android-CHANGELOG.md','features.md'
]);
const SRC_DIRS = new Set(['content','background','settings','shared','popup','icons']);
const SOURCE_FILES = new Set([
  'background.js','background-entry.js','options.js','options.html','options.css',
  'options-overhaul.css','popup.html','popup.js','content.css',
  'platform-capabilities.css','CHANGELOG.md','LICENSE','THIRD-PARTY-NOTICES.md'
]);
const els = {
  list:document.querySelector('[data-mod-list]'),
  status:document.querySelector('[data-mod-status]'),
  summary:document.querySelector('[data-mod-summary]'),
  version:document.querySelector('[data-mod-version]'),
  dep:document.querySelector('[data-mod-dependencies]'),
  install:document.querySelector('[data-mod-install]'),
  download:document.querySelector('[data-mod-download]'),
  folder:document.querySelector('[data-mod-folder]'),
  folderName:document.querySelector('[data-mod-folder-name]'),
  all:document.querySelector('[data-mod-all]'),
  minimal:document.querySelector('[data-mod-minimal]'),
  recommended:document.querySelector('[data-mod-recommended]'),
  code:document.querySelector('[data-mod-code]'),
  import:document.querySelector('[data-mod-import]'),
  codeInput:document.querySelector('[data-mod-code-input]'),
  presets:[...document.querySelectorAll('[data-mod-preset]')],
  preview:document.querySelector('[data-mod-recipe-preview]'),
  export:document.querySelector('[data-mod-export]'),
  share:document.querySelector('[data-mod-share]'),
  reset:document.querySelector('[data-mod-reset]'),
  importFile:document.querySelector('[data-mod-import-file]'),
  firefox:document.querySelector('[data-mod-firefox]')
};
let info, modules, sourceManifest, treeFiles, selected, dirHandle, busy = false;
let currentPreset='minimal';
let unknownModules=[];
const safe = p => typeof p === 'string' && /^[a-zA-Z0-9_.\/-]+$/.test(p) &&
  p.length < 220 && !p.startsWith('/') && !p.includes('//') &&
  !p.split('/').includes('..') && !p.split('/').includes('.');
const clone = o => JSON.parse(JSON.stringify(o));
const msg = (m,error=false) => {
  if (els.status) {els.status.textContent=m;els.status.classList.toggle('error',error);}
};
const label = id => modules.bundles[id]?.label || id;
const groups = () => modules.bundleOrder;
const current = () => groups().filter(id => selected.has(id));
function closure(ids) {
  const result=new Set(),visiting=new Set();
  const include=id=>{
    if (!modules.bundles[id]) throw Error('Unknown module: '+id);
    if(visiting.has(id)) throw Error('Circular module dependency: '+id);
    if(result.has(id))return;
    visiting.add(id);
    for(const dep of modules.bundles[id].dependsOn || []) include(dep);
    visiting.delete(id);result.add(id);
  };
  include('core');
  for(const [id,b] of Object.entries(modules.bundles)) if(b.required)include(id);
  for(const id of ids)include(id);
  return result;
}
function setSelection(ids, preset='custom', preserveUrl=false){
  selected=closure(ids);
  currentPreset=preset;
  try { localStorage.setItem(STORE,JSON.stringify({modules:current(),preset:currentPreset,unknownModules})); } catch {}
  if (!preserveUrl && location.hash) history.replaceState(null,'',location.pathname+location.search);
  render();
}
function render(){
  els.list.replaceChildren();
  for(const id of groups()){
    const b=modules.bundles[id],checked=selected.has(id);
    const card=document.createElement('label');
    card.className='lite-module-card'+(checked?' selected':'')+(b.required?' locked':'');
    const checkbox=document.createElement('input');
    checkbox.type='checkbox';checkbox.checked=checked;checkbox.disabled=!!b.required;
    checkbox.dataset.group=id;
    const tick=document.createElement('span');
    tick.className='lite-module-check';tick.textContent=checked?'✓':'';
    const copy=document.createElement('span');copy.className='lite-module-copy';
    const head=document.createElement('span');head.className='lite-module-title';
    const name=document.createElement('strong');name.textContent=b.label||id;
    const count=document.createElement('small');count.textContent=(b.files||[]).length+' script files';
    head.append(name,count);
    const desc=document.createElement('span');desc.className='lite-module-description';
    desc.textContent=b.description||'Experimental module';
    const note=document.createElement('span');note.className='lite-module-meta';
    const dep=document.createElement('em');
    dep.textContent=b.required?'Required':'Needs: '+((b.dependsOn||[]).map(label).join(', ')||'Core');
    note.append(dep);copy.append(head,desc,note);card.append(checkbox,tick,copy);
    els.list.append(card);
  }
  const active=current();
  const scriptCount=new Set(active.flatMap(id=>modules.bundles[id].files||[])).size;
  els.summary.textContent=active.length+' groups · '+scriptCount+' included scripts';
  els.dep.textContent='Selected: '+active.map(label).join(', ')+'. Dependencies are included automatically.';
  for (const button of els.presets) button.setAttribute('aria-pressed', String(button.dataset.modPreset===currentPreset));
  if (els.preview) els.preview.textContent=JSON.stringify(recipe(),null,2);
  if (els.codeInput && document.activeElement!==els.codeInput) els.codeInput.placeholder='Paste a saved recipe, share link, or build code here…';

}
function persistCode() {
  const data={schema:'sqol-experimental-recipe/v1',version:info.version,modules:current(),preset:currentPreset};
  const bytes=T.encode(JSON.stringify(data));
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodeCode(value){
  let str=String(value||'').trim();
  if(str.startsWith('http')){try{str=new URL(str).hash.replace(/^#build=/,'')}catch{}}
  str=str.replace(/^#?build=/,'');
  if(str.length>8000||!/^[a-zA-Z0-9_-]+$/.test(str))throw Error('Invalid build code');
  const binary=atob(str.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-str.length%4)%4));
  const parsed=JSON.parse(D.decode(Uint8Array.from(binary, c=>c.charCodeAt(0))));
  if(parsed.schema!=='sqol-experimental-recipe/v1'||!Array.isArray(parsed.modules)||
      parsed.modules.length>groups().length||parsed.modules.some(x=>!modules.bundles[x])){
    throw Error('Unsupported recipe code or unknown modules');
  }
  return parsed.modules;
}
function recipe(){
  return {schema:2,type:'spicychat-qol-custom-build',source:{repository:'https://github.com/'+info.repository,version:info.version,ref:'qol-custom'},
    preset:currentPreset,bundles:[...current(),...unknownModules],updatePolicy:{core:'required',optionalModules:'follow-recipe'}};
}
function parseSelection(value){
  let input=String(value||'').trim();
  if(!input)throw Error('Paste a build code, recipe JSON or share link first.');
  let data;
  if(input.startsWith('{')){
    data=JSON.parse(input);
  } else {
    if(input.startsWith('http')){const link=new URL(input);input=link.hash.slice(1);}
    input=input.replace(/^(?:#)?(?:build|recipe)=/,'');
    if(input.length>12000||!/^[A-Za-z0-9_-]+$/.test(input))throw Error('Invalid build code.');
    const b64=input.replace(/-/g,'+').replace(/_/g,'/');
    const padded=b64+'='.repeat((4-b64.length%4)%4);
    const bin=atob(padded);
    data=JSON.parse(D.decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));
  }
  const candidates=data?.modules||data?.bundles;
  if(!Array.isArray(candidates)||candidates.length>80||candidates.some(v=>typeof v!=='string'))throw Error('This does not look like a QoL Custom recipe.');
  const known=candidates.filter(v=>modules.bundles[v]);
  unknownModules=[...new Set(candidates.filter(v=>!modules.bundles[v]))];
  return {modules:known,preset:typeof data.preset==='string'?data.preset:'custom'};
}
function saveRecipe(){
  const blob=new Blob([JSON.stringify(recipe(),null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='spicychat-qol-custom-recipe.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  msg('Your selection was saved as a recipe.');
}
async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true;}
  catch{ if(els.codeInput){els.codeInput.value=value;els.codeInput.focus();els.codeInput.select();}return false;}
}
function applyRecipe(value){
  const parsed=parseSelection(value);
  setSelection(parsed.modules,'custom');
  msg(unknownModules.length?'Recipe loaded. '+unknownModules.length+' unknown future module(s) kept for export; they are not installed.':'Recipe loaded. U can now download or update your build.');
}
async function load(){
  const r=await fetch('/lite/early-access/experimental-release.json',{cache:'no-store'});
  if(!r.ok)throw Error('Experimental release metadata unavailable');
  info=await r.json();
  if(info.schema!=='sqol-experimental-modules/v1'||info.status!=='experimental-unvalidated'||
      info.repository!=='drachescript/spicychat-qol-extension'||
      !/^[a-f0-9]{40}$/.test(info.commit)||!/^[a-f0-9]{40}$/.test(info.tree)) {
    throw Error('Invalid pinned source metadata');
  }
  const raw='https://raw.githubusercontent.com/'+info.repository+'/'+info.commit+'/';
  const api='https://api.github.com/repos/'+info.repository+'/git/trees/'+info.tree+'?recursive=1';
  const results=await Promise.all([fetch(raw+'manifest.json'),fetch(raw+'build/modules.json'),fetch(api)]);
  if(results.some(r=>!r.ok))throw Error('Could not load immutable source catalog (GitHub request failed)');
  sourceManifest=await results[0].json();modules=await results[1].json();
  const tree=await results[2].json();
  if(tree.truncated||!Array.isArray(tree.tree)||!Array.isArray(modules.bundleOrder)||
      sourceManifest.version!==info.version) throw Error('Incomplete or incompatible source catalog');
  treeFiles=new Map(tree.tree.filter(x=>x.type==='blob'&&safe(x.path)&&/^[a-f0-9]{40}$/.test(x.sha)).map(x=>[x.path,x.sha]));
  for(const b of Object.values(modules.bundles))for(const p of b.files||[]){
    if(!treeFiles.has(p))throw Error('Source module missing: '+p);
  }
  for(const p of ['manifest.json','content/build-profile.js','background/feature-build-profile.js']){
    if(!treeFiles.has(p))throw Error('Missing shared build resource: '+p);
  }
  els.version.textContent='v'+info.version+' · '+groups().length+' groups';
  const params=new URLSearchParams(location.hash.slice(1));
  const hash=params.get('build')||params.get('recipe');
  let restored;
  try{
    if(hash)restored=parseSelection(hash);
    else{
      const saved=JSON.parse(localStorage.getItem(STORE)||'null');
      if(Array.isArray(saved))restored={modules:saved,preset:'custom'};
      else if(Array.isArray(saved?.modules))restored=saved;
      else{
        const legacy=JSON.parse(localStorage.getItem(LEGACY_STORE)||'null');
        if(Array.isArray(legacy?.bundles))restored={modules:legacy.bundles,preset:legacy.preset||'custom'};
      }
    }
  }catch(error){console.warn('[QoL Custom] Could not restore saved selection',error);}
  const initial=Array.isArray(restored?.modules)?restored.modules.filter(x=>modules.bundles[x]):['core','interface'];
  unknownModules=Array.isArray(restored?.unknownModules)?restored.unknownModules:[...unknownModules];
  setSelection(initial,restored?.preset||'minimal',!!hash);
  els.install.disabled=!('showDirectoryPicker' in window);
  els.folder.disabled=!('showDirectoryPicker' in window);
  els.download.disabled=false;
  if(!('showDirectoryPicker' in window))els.folderName.textContent='Folder writing needs desktop Chrome/Brave. Download ZIP instead.';
  else {dirHandle=await rememberedFolder();if(dirHandle)els.folderName.textContent='Remembered folder: '+dirHandle.name;}
  msg('Ready to test module combinations. These builds may have bugs or missing features.');
}
function plannedFiles(active){
  const activeFiles=new Set(active.flatMap(id=>modules.bundles[id].files||[]));
  const mapped=new Set(Object.values(modules.bundles).flatMap(b=>b.files||[]));
  const cssOwners=new Map();
  for(const [id,paths]of Object.entries(modules.runtimeAssets?.styles||{}))
    for(const path of paths) {
      if(!cssOwners.has(path))cssOwners.set(path,new Set());
      cssOwners.get(path).add(id);
    }
  const selectedStyles=new Set([...cssOwners].filter(([,owners])=>[...owners].some(o=>active.includes(o))).map(([p])=>p));
  // Exclude every unselected runtime JS/CSS declared by the source. All shared
  // settings/background services are still included (and disclosed as WIP).
  const chosen = new Set();
  for(const path of treeFiles.keys()){
    if(EXCLUDED.has(path)||path.startsWith('.github/')||path.startsWith('build/')||
       path.startsWith('scripts/')||path.startsWith('custom/'))continue;
    const parts=path.split('/');
    if(path==='manifest.json'||path===MARKER)continue;
    if(parts.length===1){
      if(SOURCE_FILES.has(path))chosen.add(path);
      continue;
    }
    if(!SRC_DIRS.has(parts[0]))continue;
    if(path.endsWith('.py')||path.endsWith('.zip')||path.endsWith('.md'))continue;
    if(path.startsWith('content/')){
      if(mapped.has(path)&&!activeFiles.has(path))continue;
      if(path.endsWith('.js')&&!activeFiles.has(path))continue;
      if(path.endsWith('.css')&&!selectedStyles.has(path))continue;
    }
    chosen.add(path);
  }
  // Preserve any files loaded via manifest scripts or web-accessible entries.
  for(const path of activeFiles)chosen.add(path);
  for(const path of selectedStyles)chosen.add(path);
  return {chosen,activeFiles,selectedStyles};
}
function manifestFor(active,plan){
  const m=clone(sourceManifest);
  m.name=BUILD_NAME;
  m.description='Experimental Custom QoL module build. Some combinations may be broken.';
  m.content_scripts=m.content_scripts.map(s=>{
    const o=clone(s);
    if(o.js)o.js=o.js.filter(path=>plan.activeFiles.has(path));
    if(o.css)o.css=o.css.filter(path=>plan.selectedStyles.has(path));
    return o;
  }).filter(s=>(s.js?.length||0)+(s.css?.length||0)>0);
  m.web_accessible_resources=(m.web_accessible_resources||[]).map(entry=>({
    ...entry, resources:entry.resources.filter(p=>plan.chosen.has(p))
  })).filter(entry=>entry.resources.length);
  m.background={service_worker:'background-entry.js'};
  delete m.browser_specific_settings;
  m.action=m.action||{};
  m.action.default_title=BUILD_NAME+' — WIP';
  return m;
}
function buildProfile(active){
  // Bundle-level selection: avoid claiming per-feature isolation before
  // every feature contract and Settings/background dependency has been split.
  const payload={id:'custom-ea',label:'QoL Custom — Experimental',generated:true,
    bundles:active,features:null};
  return T.encode('if(!window.__DSQ_TAB_GATE__?.paused){window.__DSQ_BUILD_PROFILE__=Object.freeze('+
    JSON.stringify(payload)+');}\n');
}
function sourcePath(path){return 'https://raw.githubusercontent.com/'+info.repository+'/'+info.commit+'/'+path;}
async function gitBlob(bytes){
  const head=T.encode('blob '+bytes.length+'\0');
  const joined=new Uint8Array(head.length+bytes.length);joined.set(head);joined.set(bytes,head.length);
  const hash=await crypto.subtle.digest('SHA-1',joined);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function downloadSource(paths){
  const files=new Map(),queue=[...paths].sort(),total=queue.length;let count=0;
  const workers=Array.from({length:Math.min(8,total)},async()=>{
    while(queue.length){
      const path=queue.shift();
      const response=await fetch(sourcePath(path),{cache:'no-store',mode:'cors'});
      if(!response.ok)throw Error('Source download failed: '+path+' ('+response.status+')');
      const bytes=new Uint8Array(await response.arrayBuffer());
      if(await gitBlob(bytes)!==treeFiles.get(path))throw Error('Integrity mismatch in '+path);
      files.set(path,bytes);
      count++;
      if(count%8===0||count===total)msg('Downloaded and verified '+count+'/'+total+' files…');
    }
  });
  await Promise.all(workers);
  return files;
}
async function packageBuild(){
  const active=current();const p=plannedFiles(active);const manifest=manifestFor(active,p);
  const linked=new Set();
  for(const cs of manifest.content_scripts){
    for(const path of [...cs.js||[],...cs.css||[]])linked.add(path);
  }
  for(const group of manifest.web_accessible_resources||[])
    for(const path of group.resources)linked.add(path);
  for(const path of ['background-entry.js','options.html','popup.html'])linked.add(path);
  for(const path of linked)if(!p.chosen.has(path))throw Error('Missing build dependency: '+path);
  if(!p.chosen.has('background/feature-build-profile.js'))throw Error('Background build gate missing');
  if(!p.chosen.has('content/build-profile.js'))throw Error('Content build gate missing');
  const files=await downloadSource(p.chosen);
  files.set('content/build-profile.js',buildProfile(active));
  const recipe={schema:'sqol-experimental-install/v1',channel:'group-ea',version:info.version,
    commit:info.commit,bundles:active,ownedFiles:[...files.keys(),'manifest.json',MARKER].sort()};
  files.set(MARKER,T.encode(JSON.stringify(recipe,null,2)+'\n'));
  files.set('manifest.json',T.encode(JSON.stringify(manifest,null,2)+'\n'));
  return {files,recipe};
}
function crc32(data){
  let crc=0xffffffff;
  for(const value of data){
    crc ^= value;
    for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }return (crc^0xffffffff)>>>0;
}
function zip(files){
  let offset=0;const locals=[],centers=[];
  for(const [path,data] of [...files].sort(([a],[b])=>a.localeCompare(b))){
    const filename=T.encode(path),crc=crc32(data);
    const local=new Uint8Array(30+filename.length),l=new DataView(local.buffer);
    l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);
    l.setUint32(14,crc,true);l.setUint32(18,data.length,true);
    l.setUint32(22,data.length,true);l.setUint16(26,filename.length,true);
    local.set(filename,30);locals.push(local,data);
    const central=new Uint8Array(46+filename.length),c=new DataView(central.buffer);
    c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);
    c.setUint32(16,crc,true);c.setUint32(20,data.length,true);
    c.setUint32(24,data.length,true);c.setUint16(28,filename.length,true);
    c.setUint32(42,offset,true);central.set(filename,46);centers.push(central);
    offset+=local.length+data.length;
  }
  const clen=centers.reduce((sum,v)=>sum+v.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.size,true);
  e.setUint16(10,files.size,true);e.setUint32(12,clen,true);e.setUint32(16,offset,true);
  return new Blob([...locals,...centers,end],{type:'application/zip'});
}
async function dbOpen(){
  return new Promise((resolve,reject)=>{
    const rq=indexedDB.open('sqol-custom-experimental',1);
    rq.onupgradeneeded=()=>rq.result.createObjectStore('handles');
    rq.onsuccess=()=>resolve(rq.result);rq.onerror=()=>reject(rq.error);
  });
}
async function saveFolder(h){
  try{
    const db=await dbOpen();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('handles','readwrite');
      tx.objectStore('handles').put(h,'extension');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });db.close();
  }catch(e){console.warn('Could not remember extension folder',e);}
}
async function rememberedFolder(){
  try{
    const db=await dbOpen();
    const val=await new Promise((resolve,reject)=>{
      const tx=db.transaction('handles','readonly'),rq=tx.objectStore('handles').get('extension');
      rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>reject(rq.error);
    });db.close();return val;
  }catch{return null;}
}
async function chooseFolder(force=false){
  if(!window.showDirectoryPicker)throw Error('Folder access requires desktop Chrome/Brave');
  if(!dirHandle||force)dirHandle=await showDirectoryPicker({id:'sqol-custom-group-ea',mode:'readwrite'});
  const opts={mode:'readwrite'};
  if(await dirHandle.queryPermission(opts)!=='granted'&&
     await dirHandle.requestPermission(opts)!=='granted')throw Error('Folder permission denied');
  await saveFolder(dirHandle);
  els.folderName.textContent='Selected: '+dirHandle.name;
  return dirHandle;
}
async function readFile(handle,path){
  let dir=handle;
  try{
    const parts=path.split('/');
    for(const p of parts.slice(0,-1))dir=await dir.getDirectoryHandle(p);
    const f=await dir.getFileHandle(parts.at(-1));
    return new Uint8Array(await(await f.getFile()).arrayBuffer());
  }catch(e){if(e.name==='NotFoundError')return null;throw e;}
}
async function writeFile(handle,path,bytes){
  let dir=handle;const p=path.split('/');
  for(const x of p.slice(0,-1))dir=await dir.getDirectoryHandle(x,{create:true});
  const f=await dir.getFileHandle(p.at(-1),{create:true});
  const w=await f.createWritable();try{await w.write(bytes);await w.close();}
  catch(e){await w.abort().catch(()=>{});throw e;}
}
async function deleteFile(handle,path){
  let dir=handle;const parts=path.split('/');
  try{
    for(const part of parts.slice(0,-1))dir=await dir.getDirectoryHandle(part);
    await dir.removeEntry(parts.at(-1));
  }catch(e){if(e.name!=='NotFoundError')throw e;}
}
async function validateTarget(handle){
  const existing=await readFile(handle,MARKER);
  const manifest=await readFile(handle,'manifest.json');
  if(!existing){
    // Existing Full/OOC/other extension must never be overwritten.
    if(manifest)throw Error('This folder has an extension but no Custom EA marker. Choose a different folder.');
    for await(const [name]of handle.entries())
      throw Error('For first installation choose an empty folder. Found: '+name);
    return null;
  }
  let marker,installed;
  try{marker=JSON.parse(D.decode(existing));installed=JSON.parse(D.decode(manifest));}catch{
    throw Error('Existing Custom folder metadata is invalid. No files were changed.');
  }
  if(marker.schema!=='sqol-experimental-install/v1'||marker.channel!=='group-ea'||
     installed.name!==BUILD_NAME||!Array.isArray(marker.ownedFiles)||
     marker.ownedFiles.length>1000||marker.ownedFiles.some(p=>!safe(p))) {
    throw Error('This is not a valid experimental QoL Custom folder.');
  }
  return marker;
}
async function applyFolder(handle,build){
  const previous=await validateTarget(handle);
  const obsolete=(previous?.ownedFiles||[]).filter(p=>!build.files.has(p));
  const touched=new Set([...build.files.keys(),...obsolete]);
  const originals=new Map();
  for(const p of touched)originals.set(p,await readFile(handle,p));
  if(previous){
    const base=await handle.getDirectoryHandle('.qol-custom-backups',{create:true});
    const timestamp=new Date().toISOString().replace(/[:.]/g,'-');
    const backup=await base.getDirectoryHandle('v'+previous.version+'-'+timestamp,{create:true});
    for(const [p,bytes]of originals)if(bytes!==null)await writeFile(backup,p,bytes);
  }
  const changed=[];
  try{
    for(const p of obsolete){
      if(p!=='manifest.json'&&p!==MARKER){await deleteFile(handle,p);changed.push(p);}
    }
    for(const [p,bytes]of build.files){
      if(p==='manifest.json'||p===MARKER)continue;
      await writeFile(handle,p,bytes);changed.push(p);
    }
    await writeFile(handle,MARKER,build.files.get(MARKER));changed.push(MARKER);
    await writeFile(handle,'manifest.json',build.files.get('manifest.json'));changed.push('manifest.json');
  }catch(e){
    let broken=false;
    for(const p of changed.reverse()){
      try{const old=originals.get(p);if(old===null)await deleteFile(handle,p);else await writeFile(handle,p,old);}
      catch{broken=true;}
    }
    throw Error('Update interrupted. '+(broken?'Rollback incomplete: check .qol-custom-backups. ':'Previous files restored. ')+e.message);
  }
  return previous;
}
function busyState(value){
  busy=value;for(const b of [els.install,els.download,els.folder,els.all,els.minimal,els.recommended])if(b)b.disabled=value;
}
async function operate(fn){
  if(busy)return;busyState(true);
  try{await fn();}catch(e){
    if(e.name==='AbortError')msg('Folder selection cancelled.');
    else{console.error('[QoL Custom EA]',e);msg(e.message||String(e),true);}
  }finally{busyState(false);}
}
els.list?.addEventListener('change',e=>{
  const id=e.target?.dataset?.group;if(!id)return;
  const next=new Set(selected);if(e.target.checked)next.add(id);
  else{
    next.delete(id);
    // Remove dependent groups when a required module is unchecked.
    let changed=true;
    while(changed){
      changed=false;for(const candidate of [...next]){
        if((modules.bundles[candidate].dependsOn||[]).includes(id)||
           (modules.bundles[candidate].dependsOn||[]).some(dep=>!next.has(dep))){
          if(!modules.bundles[candidate].required){next.delete(candidate);changed=true;}
        }
      }
    }
  }
  unknownModules=[];
  setSelection([...next]);
});
els.all?.addEventListener('click',()=>setSelection(groups(),'full'));
els.minimal?.addEventListener('click',()=>setSelection(['core','interface'],'minimal'));
els.recommended?.addEventListener('click',()=>setSelection(['core','interface','chat','chatList','listings','profiles','personas'],'recommended-lite'));
for(const button of els.presets){
  button.addEventListener('click',()=>{
    const preset=button.dataset.modPreset;
    if(preset==='full')setSelection(groups(),'full');
    else if(preset==='minimal')setSelection(['core','interface'],'minimal');
    else if(preset==='recommended-lite')setSelection(['core','interface','chat','chatList','listings','profiles','personas'],'recommended-lite');
    else setSelection(current(),'custom');
  });
}
els.export?.addEventListener('click',saveRecipe);
els.share?.addEventListener('click',async()=>{
  const url=location.origin+'/lite/#build='+persistCode();
  if(await copyText(url))msg('Share link copied.');
  else msg('Share link is in the text box. Copy it from there.');
});
els.reset?.addEventListener('click',()=>{
  unknownModules=[];try{localStorage.removeItem(STORE);localStorage.removeItem(LEGACY_STORE);}catch{}
  setSelection(['core','interface'],'minimal');
  msg('Builder reset to Minimal.');
});
els.importFile?.addEventListener('change',async()=>{
  const file=els.importFile.files?.[0];if(!file)return;
  try{if(file.size>128000)throw Error('Recipe file is too large.');
    applyRecipe(await file.text());}catch(e){msg(e.message,true);}
  els.importFile.value='';
});
els.firefox?.addEventListener('click',()=>msg('Firefox Custom builds are not available yet. For now use the normal Firefox QoL extension.',true));
els.code?.addEventListener('click',async()=>{
  const code=persistCode();els.codeInput.value=code;
  if(await copyText(code))msg('Build code copied.');
  else msg('Build code is shown in the text box. Copy it from there.');
});
els.import?.addEventListener('click',()=>{try{applyRecipe(els.codeInput.value);}catch(e){msg(e.message,true);}});
els.download?.addEventListener('click',()=>operate(async()=>{
  msg('Preparing experimental Custom ZIP…');
  const build=await packageBuild(),obj=URL.createObjectURL(zip(build.files)),a=document.createElement('a');
  a.href=obj;a.download='spicychat-qol-custom-v'+info.version+'-experimental.zip';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(obj),60000);
  msg('Experimental ZIP downloaded ('+build.files.size+' files). Extract and Load unpacked. Expect bugs; report broken modules.');
}));
els.folder?.addEventListener('click',()=>operate(async()=>{
  const h=await chooseFolder(true),existing=await validateTarget(h);
  msg(existing?'Connected to v'+existing.version+' Custom.':'Connected to empty folder. Ready to install.');
}));
els.install?.addEventListener('click',()=>operate(async()=>{
  const h=await chooseFolder();
  await validateTarget(h);
  const build=await packageBuild();
  const previous=await applyFolder(h,build);
  msg((previous?'Updated':'Installed')+' v'+info.version+' ('+build.files.size+' files, '+build.recipe.bundles.length+' groups). '+
    (previous?'Click Reload for the extension in chrome://extensions.':'Use Load unpacked and select this folder in chrome://extensions.'));
}));
load().catch(e=>{console.error('[QoL Custom EA]',e);msg(e.message,true);});
})();
