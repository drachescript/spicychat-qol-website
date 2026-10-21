(() => {
'use strict';
// One source-of-truth catalog from actual build/features/*.json in qol-custom.
// Runtime/Settings/background independence is experimental, not certified.
const T=new TextEncoder(), D=new TextDecoder();
const STORE='sqol-custom-feature-builder-v1';
const OLD_STORES=['sqol-custom-experimental-v1','sqol-lite-builder-v1'];
const BUILD_NAME='SpicyChat QoL Custom (Early Access)';
const MARKER='qol-custom-early-access.json';
const EXCLUDED=new Set(['.gitignore','README.md','SECURITY.md','PERMISSIONS.md','PRIVACY.md',
  'CONTRIBUTING.md','android-CHANGELOG.md','features.md']);
const SRC_DIRS=new Set(['content','background','settings','shared','popup','icons']);
const SOURCE_FILES=new Set(['background.js','background-entry.js','options.js','options.html',
  'options.css','options-overhaul.css','popup.html','popup.js','content.css',
  'platform-capabilities.css','CHANGELOG.md','LICENSE','THIRD-PARTY-NOTICES.md']);
const el={
  list:document.querySelector('[data-features-list]'),
  status:document.querySelector('[data-features-status]'),
  summary:document.querySelector('[data-features-summary]'),
  version:document.querySelector('[data-features-version]'),
  categories:document.querySelector('[data-features-categories]'),
  search:document.querySelector('[data-features-search]'),
  onlySelected:document.querySelector('[data-features-only-selected]'),
  details:document.querySelector('[data-features-details]'),
  count:document.querySelector('[data-features-count]'),
  install:document.querySelector('[data-features-install]'),
  download:document.querySelector('[data-features-download]'),
  folder:document.querySelector('[data-features-folder]'),
  folderName:document.querySelector('[data-features-folder-name]'),
  all:document.querySelector('[data-features-all]'),
  none:document.querySelector('[data-features-none]'),
  recommended:document.querySelector('[data-features-recommended]'),
  export:document.querySelector('[data-features-export]'),
  share:document.querySelector('[data-features-share]'),
  copy:document.querySelector('[data-features-copy]'),
  import:document.querySelector('[data-features-import]'),
  importFile:document.querySelector('[data-features-import-file]'),
  codeInput:document.querySelector('[data-features-code-input]'),
  preview:document.querySelector('[data-features-recipe-preview]')
};
const els=el; // Existing trusted folder-updater controls use this alias.
let info, modules, sourceManifest, treeFiles, catalog, packageIndex;
let selected=new Set(),dirHandle=null,busy=false;
let activeCategory='All',searchValue='',onlySelected=false;
let importedUnknown=[],updateModes={default:'manual',overrides:{}};
const safe=p=>typeof p==='string'&&/^[a-zA-Z0-9_.\/-]+$/.test(p)&&
  p.length<220&&!p.startsWith('/')&&!p.includes('//')&&!p.split('/').includes('..')&&!p.split('/').includes('.');
const clone=o=>JSON.parse(JSON.stringify(o));
const allFeatures=()=>catalog?.features||[];
const byId=id=>allFeatures().find(f=>f.id===id);
const current=()=>allFeatures().filter(f=>selected.has(f.id)).map(f=>f.id);
function currentBundles(){
  const groups=new Set(['core']);
  for(const id of current()){const f=byId(id);if(f)groups.add(f.group);}
  let changed=true;while(changed){changed=false;
    for(const group of [...groups])for(const dep of modules.bundles[group]?.dependsOn||[])
      if(!groups.has(dep)){groups.add(dep);changed=true;}
  }
  return modules.bundleOrder.filter(id=>groups.has(id));
}
const msg=(s,error=false)=>{if(el.status){el.status.textContent=s;el.status.classList.toggle('error',error);}};
function closure(ids){
  const ordered=new Set(),visiting=new Set();
  function visit(id){
    const f=byId(id);
    if(!f)throw Error('Unknown feature: '+id);
    if(visiting.has(id))throw Error('Circular dependency involving '+id);
    if(ordered.has(id))return;
    visiting.add(id);
    for(const dep of f.requiredFeatures||[])visit(dep);
    visiting.delete(id);ordered.add(id);
  }
  for(const id of ids)visit(id);
  return ordered;
}
function persist(){
  try{localStorage.setItem(STORE,JSON.stringify({
    schema:'sqol-custom-feature-recipe/v1',selectedFeatures:current(),updateModes,
    importedUnknown
  }));}catch(e){console.warn('[QoL Custom] Could not save recipe',e);}
}
function setSelection(ids){
  selected=closure(ids);persist();render();
}
function toggle(id,checked){
  const next=new Set(selected);
  if(checked)next.add(id);
  else{
    next.delete(id);
    let changed=true;
    while(changed){
      changed=false;
      for(const candidate of [...next]){
        const needs=byId(candidate)?.requiredFeatures||[];
        if(needs.some(dep=>!next.has(dep))){next.delete(candidate);changed=true;}
      }
    }
  }
  setSelection([...next]);
}
function recipe(){
  return {schema:'sqol-custom-feature-recipe/v1',
    source:{repository:info.repository,version:info.version,ref:'qol-custom'},
    selectedFeatures:current(),
    updates:updateModes,
    unknownFeatures:importedUnknown};
}
function shareCode(){
  const bytes=T.encode(JSON.stringify(recipe()));
  let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function parseInput(value){
  let raw=String(value||'').trim();
  if(!raw)throw Error('Choose a recipe file or paste a share link/code first.');
  let data;
  if(raw.startsWith('{')) data=JSON.parse(raw);
  else{
    if(raw.startsWith('http'))raw=new URL(raw).hash.slice(1);
    raw=raw.replace(/^#?(?:build|recipe)=/,'');
    if(raw.length>65000||!/^[A-Za-z0-9_-]+$/.test(raw))throw Error('Invalid share code.');
    let base=raw.replace(/-/g,'+').replace(/_/g,'/');
    base+='='.repeat((4-base.length%4)%4);
    const binary=atob(base);
    data=JSON.parse(D.decode(Uint8Array.from(binary,ch=>ch.charCodeAt(0))));
  }
  if(!data||typeof data!=='object')throw Error('Invalid recipe.');
  let items;
  if(Array.isArray(data.selectedFeatures)){
    items=data.selectedFeatures;
  }else if(Array.isArray(data.modules)||Array.isArray(data.bundles)){
    const groups=data.modules||data.bundles;
    if(groups.length>30||groups.some(v=>typeof v!=='string'))throw Error('Invalid old module recipe.');
    items=allFeatures().filter(f=>groups.includes(f.group)).map(f=>f.id);
  }else throw Error('Recipe does not include a feature selection.');
  if(items.length>500||items.some(v=>typeof v!=='string'))throw Error('Invalid feature list.');
  const known=items.filter(id=>byId(id));
  importedUnknown=[...new Set(items.filter(id=>!byId(id)))];
  const updates=data.updates||data.updateModes;
  if(updates&&typeof updates==='object'&&['auto','manual','off'].includes(updates.default))
    updateModes={default:updates.default,overrides:typeof updates.overrides==='object'&&updates.overrides?updates.overrides:{}};
  return known;
}
function importRecipe(input){
  setSelection(parseInput(input));
  msg(importedUnknown.length?'Recipe imported; unknown future features were saved but cannot be installed.':'Recipe imported. U can edit your selection.');
}
function render(){
  if(!catalog)return;
  const features=allFeatures();
  const cats=['All',...catalog.sections];
  if(el.categories){
    el.categories.replaceChildren();
    for(const name of cats){
      const b=document.createElement('button');b.type='button';b.className='button secondary ea-filter-button';
      b.classList.toggle('active',activeCategory===name);
      b.textContent=name+(name==='All'?' ('+features.length+')':' ('+features.filter(f=>f.section===name).length+')');
      b.setAttribute('aria-pressed',String(activeCategory===name));
      b.addEventListener('click',()=>{activeCategory=name;render();});
      el.categories.appendChild(b);
    }
  }
  if(el.list){
    el.list.replaceChildren();
    const matching=features.filter(f=>
      (activeCategory==='All'||f.section===activeCategory)&&
      (!onlySelected||selected.has(f.id))&&
      (!searchValue||[f.label,f.description,f.section,f.id].join(' ').toLowerCase().includes(searchValue)));
    for(const f of matching){
      const label=document.createElement('label');
      label.className='ea-feature-row'+(selected.has(f.id)?' selected':'');
      const c=document.createElement('input');c.type='checkbox';c.checked=selected.has(f.id);
      c.dataset.feature=f.id;
      const body=document.createElement('span');body.className='ea-feature-body';
      const name=document.createElement('strong');name.textContent=f.label;
      const meta=document.createElement('small');
      meta.textContent=f.section+(f.requiredFeatures?.length?' · Needs '+f.requiredFeatures.join(', '):'');
      body.append(name,meta);
      const details=document.createElement('button');
      details.type='button';details.className='ea-feature-info';
      details.textContent='Info';details.setAttribute('aria-label','More about '+f.label);
      details.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showDetails(f);});
      label.append(c,body,details);
      el.list.append(label);
    }
    if(!matching.length){const p=document.createElement('p');p.className='lite-summary-note';p.textContent='No matching features. Try another category or search.';el.list.append(p);}
  }
  const count=current().length;
  if(el.count)el.count.textContent=count+' of '+features.length+' features selected';
  if(el.summary)el.summary.textContent=count+' features · '+currentBundles().length+' required groups';
  if(el.preview)el.preview.textContent=JSON.stringify(recipe(),null,2);
}
function showDetails(f){
  if(!el.details)return;
  el.details.hidden=false;
  el.details.replaceChildren();
  const head=document.createElement('h3');head.textContent=f.label;
  const desc=document.createElement('p');desc.textContent=f.description;
  const context=document.createElement('p');context.textContent='Category: '+f.section+'. '+(f.runtimeScripts.length?'Includes '+f.runtimeScripts.length+' feature script(s).':'Uses shared Settings/background services.');
  const deps=document.createElement('p');deps.textContent=f.requiredFeatures.length?'Requires: '+f.requiredFeatures.map(id=>byId(id)?.label||id).join(', '):'No extra feature dependencies declared.';
  const readiness=document.createElement('p');readiness.textContent=f.customBuildStatus==='validated'?'Custom build checks passed for this feature.':'Experimental: independent browser behavior has not been validated.';
  const x=document.createElement('button');x.type='button';x.className='button secondary';x.textContent='Close';x.addEventListener('click',()=>{el.details.hidden=true;});
  el.details.append(head,desc,context,deps,readiness,x);
}
async function load(){
  const response=await fetch('/lite/early-access/experimental-release.json',{cache:'no-store'});
  if(!response.ok)throw Error('The Custom release details could not be loaded.');
  info=await response.json();
  if(info.schema!=='sqol-experimental-modules/v1'||info.status!=='experimental-unvalidated'||
     info.repository!=='drachescript/spicychat-qol-extension'||
     !/^[a-f0-9]{40}$/.test(info.commit)||!/^[a-f0-9]{40}$/.test(info.tree))throw Error('Invalid build source.');
  const root='https://raw.githubusercontent.com/'+info.repository+'/'+info.commit+'/';
  const treeUrl='https://api.github.com/repos/'+info.repository+'/git/trees/'+info.tree+'?recursive=1';
  const requests=await Promise.all([fetch(root+'manifest.json'),fetch(root+'build/modules.json'),
    fetch(root+'build/feature-catalog.json'),fetch(root+'build/custom-package-index.json'),fetch(treeUrl)]);
  if(requests.some(r=>!r.ok))throw Error('Could not load the QoL Custom catalog from GitHub.');
  sourceManifest=await requests[0].json();modules=await requests[1].json();
  catalog=await requests[2].json();packageIndex=await requests[3].json();const tree=await requests[4].json();
  if(!Array.isArray(tree.tree)||tree.truncated||catalog.schema!=='sqol-custom-feature-catalog/v1'||
     sourceManifest.version!==info.version||catalog.version!==info.version||
     catalog.featureCount!==catalog.features.length||catalog.featureCount<100||
     packageIndex.schema!=='spicychat-qol-custom-package-assets/v1'||
     packageIndex.sourceVersion!==info.version||packageIndex.newFeaturesDefaultOff!==true||
     !Array.isArray(packageIndex.features))throw Error('Incomplete Custom feature/package catalog.');
  treeFiles=new Map(tree.tree.filter(x=>x.type==='blob'&&safe(x.path)&&/^[a-f0-9]{40}$/.test(x.sha)).map(x=>[x.path,x.sha]));
  const indexEntries=new Map();
  for(const entry of packageIndex.features){
    if(!entry||typeof entry.id!=='string'||indexEntries.has(entry.id)||
       entry.defaultSelected!==false||entry.defaultUpdatesEnabled!==false||
       !Array.isArray(entry.dependencies)||!Array.isArray(entry.settings)||
       !Array.isArray(entry.styles)||!Array.isArray(entry.background)||
       !Array.isArray(entry.helpers))throw Error('Invalid Custom package ownership index.');
    indexEntries.set(entry.id,entry);
  }
  for(const f of allFeatures()){
    const entry=indexEntries.get(f.id);
    if(!entry||entry.runtime!==f.runtimeScripts[0]||
       JSON.stringify([...entry.dependencies].sort())!==JSON.stringify([...f.requiredFeatures].sort())||
       JSON.stringify([...entry.styles].sort())!==JSON.stringify([...f.cssFiles].sort())||
       JSON.stringify([...entry.settings].sort())!==JSON.stringify([...(f.settingsScripts||[])].sort()))
      throw Error('Custom package ownership mismatch: '+f.id);
  }
  const seen=new Set();
  for(const f of allFeatures()){
    if(seen.has(f.id)||!Array.isArray(f.runtimeScripts)||!Array.isArray(f.requiredFeatures))throw Error('Invalid feature contract: '+f.id);
    seen.add(f.id);
    for(const path of [...f.runtimeScripts,...(f.requiredHelpers||[]),...f.cssFiles,...(f.settingsScripts||[]),...(f.backgroundFiles||[])]){
      if(!treeFiles.has(path))throw Error('Feature source missing: '+path);
    }
  }
  for(const path of ['manifest.json','build/feature-catalog.json','content/build-profile.js',
    'background/feature-build-profile.js'])if(!treeFiles.has(path))throw Error('Missing build dependency: '+path);
  const restoredHash=new URLSearchParams(location.hash.slice(1)).get('recipe')||
    new URLSearchParams(location.hash.slice(1)).get('build');
  let restored=null;
  try{
    if(restoredHash)restored=parseInput(restoredHash);
    else{
      let stored=localStorage.getItem(STORE);
      if(!stored){for(const key of OLD_STORES){stored=localStorage.getItem(key);if(stored)break;}}
      if(stored)restored=parseInput(stored);
    }
  }catch(err){console.warn('[QoL Custom] Could not restore saved recipe',err);}
  selected=closure(restored||[]);
  persist();
  if(el.version)el.version.textContent='v'+info.version+' · '+allFeatures().length+' features';
  if(el.install)el.install.disabled=!window.showDirectoryPicker;
  if(el.folder)el.folder.disabled=!window.showDirectoryPicker;
  if(el.download)el.download.disabled=false;
  if(!window.showDirectoryPicker){if(el.folderName)el.folderName.textContent='Folder installation needs desktop Chrome or Brave. ZIP download still works.';}
  else{dirHandle=await rememberedFolder();if(dirHandle&&el.folderName)el.folderName.textContent='Remembered folder: '+dirHandle.name;}
  render();
  msg('Ready: choose individual features, then download or update your Custom build.');
}
function plannedFiles(active){
  const runtime=new Set(catalog.sharedRuntimeScripts);
  const styles=new Set(catalog.sharedStyles);
  for(const id of active){const f=byId(id);
    for(const p of f.runtimeScripts)runtime.add(p);
    for(const p of f.requiredHelpers||[])runtime.add(p);
    for(const p of f.cssFiles)styles.add(p);
  }
  const selectedOwned=new Set([...runtime]);
  const chosen=new Set();
  const allDeclared=new Set(catalog.allContentScriptPaths);
  const allFeatureScripts=new Set(allFeatures().flatMap(f=>[...f.runtimeScripts,...(f.requiredHelpers||[])]));
  for(const path of treeFiles.keys()){
    if(EXCLUDED.has(path)||path.startsWith('.github/')||path.startsWith('build/')||
       path.startsWith('scripts/')||path.startsWith('custom/'))continue;
    const parts=path.split('/');
    if(path==='manifest.json'||path===MARKER)continue;
    if(parts.length===1){if(SOURCE_FILES.has(path))chosen.add(path);continue;}
    if(!SRC_DIRS.has(parts[0]))continue;
    if(path.endsWith('.py')||path.endsWith('.zip')||path.endsWith('.md'))continue;
    if(parts[0]==='content'){
      if(path.endsWith('.js')){
        if(allFeatureScripts.has(path)&&!selectedOwned.has(path))continue;
        if(allDeclared.has(path)&&!runtime.has(path))continue;
      }
      if(path.endsWith('.css')&&!styles.has(path))continue;
    }
    chosen.add(path);
  }
  for(const path of runtime)chosen.add(path);
  for(const path of styles)chosen.add(path);
  return {chosen,activeFiles:runtime,selectedStyles:styles};
}
function manifestFor(active,plan){
  const m=clone(sourceManifest);
  m.name=BUILD_NAME;
  m.description='Experimental Custom QoL build using individually selected features.';
  m.content_scripts=m.content_scripts.map(cs=>{
    const out=clone(cs);
    if(out.js)out.js=out.js.filter(p=>plan.activeFiles.has(p));
    if(out.css)out.css=out.css.filter(p=>plan.selectedStyles.has(p));
    return out;
  }).filter(cs=>(cs.js?.length||0)+(cs.css?.length||0)>0);
  m.web_accessible_resources=(m.web_accessible_resources||[]).map(x=>({...x,
    resources:x.resources.filter(p=>plan.chosen.has(p))})).filter(x=>x.resources.length);
  m.background={service_worker:'background-entry.js'};
  delete m.browser_specific_settings;
  m.action=m.action||{};m.action.default_title=BUILD_NAME+' — WIP';
  return m;
}
function buildProfile(active){
  const data={id:'custom-ea',label:'QoL Custom — Experimental',generated:true,
    bundles:currentBundles(),features:active};
  return T.encode('if(!window.__DSQ_TAB_GATE__?.paused){window.__DSQ_BUILD_PROFILE__=Object.freeze('+
    JSON.stringify(data)+');}\n');
}
function backgroundProfile(active){
  return T.encode('"use strict";\nconst DSQ_BACKGROUND_BUILD_PROFILE=Object.freeze({id:"custom-ea",features:Object.freeze('+
    JSON.stringify(active)+')});\nfunction dsqBackgroundHasFeature(id){return DSQ_BACKGROUND_BUILD_PROFILE.features.includes(String(id||""));}\n');
}

// Reused ZIP and permission-based folder updater.
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
  const selectedIds=current();
  const plan=plannedFiles(selectedIds);
  const manifest=manifestFor(selectedIds,plan);
  const needed=new Set();
  for(const cs of manifest.content_scripts){
    for(const p of [...(cs.js||[]),...(cs.css||[])])needed.add(p);
  }
  for(const entry of manifest.web_accessible_resources||[])
    for(const p of entry.resources)needed.add(p);
  for(const p of ['background-entry.js','options.html','popup.html',
    'background/feature-build-profile.js','content/build-profile.js'])needed.add(p);
  for(const p of needed)if(!plan.chosen.has(p))throw Error('Missing required build file: '+p);
  const files=await downloadSource(plan.chosen);
  files.set('content/build-profile.js',buildProfile(selectedIds));
  files.set('background/feature-build-profile.js',backgroundProfile(selectedIds));
  const recipe={schema:'sqol-experimental-install/v1',channel:'group-ea',version:info.version,
    commit:info.commit,bundles:currentBundles(),features:selectedIds,
    selectedFeatures:selectedIds,ownedFiles:[...files.keys(),'manifest.json',MARKER].sort()};
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

el.list?.addEventListener('change',e=>{
  const f=e.target?.dataset?.feature;
  if(f)toggle(f,!!e.target.checked);
});
el.search?.addEventListener('input',e=>{searchValue=String(e.target.value||'').toLowerCase().trim();render();});
el.onlySelected?.addEventListener('change',e=>{onlySelected=!!e.target.checked;render();});
el.all?.addEventListener('click',()=>setSelection(allFeatures().map(f=>f.id)));
el.none?.addEventListener('click',()=>{importedUnknown=[];setSelection([]);});
el.recommended?.addEventListener('click',()=>setSelection(
  allFeatures().filter(f=>['ooc','chat-search','chat-index','bot-blocking','language-filter','chat-organizer'].includes(f.id)).map(f=>f.id)
));
el.export?.addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(recipe(),null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='spicychat-qol-custom-features.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  msg('Recipe downloaded.');
});
el.copy?.addEventListener('click',async()=>{
  const code=shareCode();
  if(el.codeInput)el.codeInput.value=code;
  try{await navigator.clipboard.writeText(code);msg('Build code copied.');}
  catch{msg('Build code shown in the text box. Copy it from there.');}
});
el.share?.addEventListener('click',async()=>{
  const url=location.origin+'/lite/#recipe='+shareCode();
  if(el.codeInput)el.codeInput.value=url;
  try{await navigator.clipboard.writeText(url);msg('Share link copied.');}
  catch{msg('Share link shown in the text box. Copy it from there.');}
});
el.import?.addEventListener('click',()=>{
  try{importRecipe(el.codeInput?.value||'');}catch(e){msg(e.message,true);}
});
el.importFile?.addEventListener('change',async()=>{
  const file=el.importFile.files?.[0];
  if(!file)return;
  try{if(file.size>200000)throw Error('Recipe file is too large.');
    importRecipe(await file.text());}catch(e){msg(e.message,true);}
  el.importFile.value='';
});
el.download?.addEventListener('click',()=>operate(async()=>{
  msg('Preparing and checking your experimental Custom ZIP…');
  const build=await packageBuild();
  const url=URL.createObjectURL(zip(build.files)),a=document.createElement('a');
  a.href=url;a.download='spicychat-qol-custom-v'+info.version+'-features.zip';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  msg('Downloaded Custom ZIP: '+current().length+' features ('+build.files.size+' files). Extract the ZIP and Load unpacked.');
}));
el.folder?.addEventListener('click',()=>operate(async()=>{
  const h=await chooseFolder(true),prev=await validateTarget(h);
  msg(prev?'Connected to Custom v'+prev.version+' folder.':'Connected to an empty folder.');
}));
el.install?.addEventListener('click',()=>operate(async()=>{
  const h=await chooseFolder();
  await validateTarget(h);
  const build=await packageBuild(),prev=await applyFolder(h,build);
  msg((prev?'Updated':'Installed')+' v'+info.version+' with '+current().length+' features. '+
    (prev?'Click Reload for your extension in chrome://extensions.':'Select this folder using Load unpacked in chrome://extensions.'));
}));
const startup=load().catch(e=>{
  console.error('[QoL Custom]',e);msg(e.message||String(e),true);
  throw e;
});
// Only an explicitly initialized local test harness gets access to build
// planning functions. Normal website visitors do not receive these hooks.
if(window.__DSQ_CUSTOM_FEATURE_TEST__){
  Object.assign(window.__DSQ_CUSTOM_FEATURE_TEST__,{
    ready:startup,
    choose:ids=>setSelection(ids),
    selected:()=>current(),
    sections:()=>catalog?.sections,
    count:()=>catalog?.featureCount,
    plan:()=>plannedFiles(current()),
    manifest:()=>manifestFor(current(),plannedFiles(current())),
    contentProfile:()=>D.decode(buildProfile(current())),
    backgroundProfile:()=>D.decode(backgroundProfile(current())),
    recipe:()=>recipe()
  });
}
})();
