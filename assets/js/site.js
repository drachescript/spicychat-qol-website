
(async()=>{
  const header=document.querySelector('[data-header]');
  if(header){const f=()=>header.classList.toggle('scrolled',scrollY>10);f();addEventListener('scroll',f,{passive:true});}
  const btn=document.querySelector('[data-menu-toggle]'),nav=document.querySelector('[data-nav]');
  if(btn&&nav){btn.addEventListener('click',()=>{const o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(o));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded','false');}));}
  document.querySelectorAll('[data-year]').forEach(n=>n.textContent=new Date().getFullYear());

  const cfg=await SQOLSource.config();
  document.querySelectorAll('[data-stable-version]').forEach(n=>n.textContent=cfg.stableVersion);

  try{
    const m=await SQOLSource.json('extension','manifest.json','/data/fallback/manifest.json');
    document.querySelectorAll('[data-dev-version]').forEach(n=>n.textContent=m.data.version||'unknown');
  }catch(e){}

  try{
    const a=await SQOLSource.androidLatest();
    if(a.available){document.querySelectorAll('[data-android-version]').forEach(n=>n.textContent=a.versionName||a.tagName||'Available');}
  }catch(e){}

  // Global project/compatibility notices.
  try{
    const s=await fetch('/data/site-status.json',{cache:'no-store'}).then(r=>r.json());
    const host=document.querySelector('[data-global-notice]');
    const item=s.incident?.enabled?s.incident:s.announcement?.enabled?s.announcement:null;
    if(host&&item){host.hidden=false;host.innerHTML=`<div class="global-notice ${s.incident?.enabled?'incident':''}"><strong>${escapeHTML(item.label||'Update')}</strong><p><b>${escapeHTML(item.title)}</b> ${escapeHTML(item.text)}</p><a href="${item.href||'/status/'}">More →</a></div>`;}
  }catch(e){}

  // Curated homepage overview from README -> Current features.
  if(document.querySelector('[data-home-features]')){
    try{
      const r=await SQOLSource.text('extension','README.md','/data/fallback/README.md');
      const match=r.text.match(/## Current features\s*([\s\S]*?)(?=\n##\s|$)/i);
      const bullets=(match?match[1]:'').split('\n').map(x=>x.match(/^\s*[-*]\s+(.+)/)?.[1]).filter(Boolean);
      const html=(bullets.length?bullets:[
        'Opened chats, saved lists and bot filtering.','Chat/OOC/persona tools and exports.','UI cleanup and Mini Panel controls.','Backup/import tools and performance helpers.'
      ]).map(x=>`<article class="overview-item"><span class="dot"></span><p>${SQOLMarkdown.inline(x)}</p></article>`).join('');
      document.querySelectorAll('[data-home-features]').forEach(h=>h.innerHTML=html);
    }catch(e){}
  }

  // Full feature pages / dev preview.
  if(document.querySelector('[data-features-content]')){
    try{
      const r=await SQOLSource.text('extension','features.md','/data/fallback/features.md');
      setSource('features',r.source); const p=SQOLMarkdown.sections(r.text);
      const html=p.sections.map(s=>`<section class="markdown-section" id="${slug(s.title)}"><h2>${SQOLMarkdown.inline(s.title)}</h2>${SQOLMarkdown.render(s.lines.join('\n'))}</section>`).join('');
      document.querySelectorAll('[data-features-content]').forEach(h=>h.innerHTML=html);
    }catch(e){document.querySelectorAll('[data-features-content]').forEach(h=>h.innerHTML='<div class="loading-card">Could not load features right now.</div>');}
  }

  // Extension changelog.
  if(document.querySelector('[data-changelog-content]')){
    try{
      const r=await SQOLSource.text('extension','CHANGELOG.md','/data/fallback/CHANGELOG.md');setSource('changelog',r.source);renderReleases(document.querySelector('[data-changelog-content]'),r.text);
    }catch(e){}
  }

  // Android readme/status. First Android README, then extension android changelog fallback.
  if(document.querySelector('[data-android-readme]')){
    let r;
    try{r=await SQOLSource.text('android','README.md','/data/fallback/android-CHANGELOG.md');}catch(e){}
    if(r){setSource('android',r.source);document.querySelector('[data-android-readme]').innerHTML=SQOLMarkdown.render(r.text);}
  }

  if(document.querySelector('[data-android-changelog-content]')){
    let r;
    try{r=await SQOLSource.text('android','CHANGELOG.md','/data/fallback/android-CHANGELOG.md');}catch(e){}
    if(r){setSource('android-changelog',r.source);renderReleases(document.querySelector('[data-android-changelog-content]'),r.text,true);}
  }

  const search=document.querySelector('[data-changelog-search]');
  if(search){search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('.release').forEach(el=>el.classList.toggle('hidden',q&&!el.textContent.toLowerCase().includes(q)));});}

  function renderReleases(host,md,isAndroid=false){
    const secs=SQOLMarkdown.versionSections(md);
    if(!secs.length){host.innerHTML=`<article class="markdown-article">${SQOLMarkdown.render(md)}</article>`;return;}
    host.innerHTML=secs.map((s,i)=>{const id=slug(s.title);const isVersion=/^v?\d+(\.\d+)+/.test(s.title);return `<details class="release" id="${id}" ${i===0?'open':''}><summary><span>${SQOLMarkdown.inline(s.title)}</span>${isVersion?'<span class="badge quiet">version</span>':''}</summary><div class="release-body">${SQOLMarkdown.render(s.lines.join('\n'))}</div></details>`;}).join('');
    if(location.hash){const el=document.getElementById(location.hash.slice(1));if(el&&el.tagName==='DETAILS')el.open=true;}
  }
  function setSource(key,source){const el=document.querySelector(`[data-source-state="${key}"]`);if(!el)return;const live=source!=='fallback';el.className=`source-state ${live?'live':'fallback'}`;el.textContent=live?'Loaded from the live GitHub source.':'Live GitHub source is not available yet — showing the current bundled copy.';}
  function slug(s){return String(s).toLowerCase().replace(/^v/,'v-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
})();
