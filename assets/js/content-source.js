
window.SQOLSource = (() => {
  let configPromise;
  const config = () => configPromise ||= fetch('/data/site-config.json',{cache:'no-store'}).then(r=>r.json());
  async function text(project,file,fallback){
    const c=await config();
    const rawBase=project==='android'?c.androidRepoRaw:c.extensionRepoRaw;
    // Worker first if it is deployed on Cloudflare later.
    try{
      const wr=await fetch(`/api/source?project=${encodeURIComponent(project)}&file=${encodeURIComponent(file)}`,{cache:'no-store'});
      if(wr.ok){return {text:await wr.text(),source:'live-worker'};}
    }catch(e){}
    // GitHub raw works directly on GitHub Pages too.
    try{
      const rr=await fetch(`${rawBase}/${file}?v=${Date.now()}`,{cache:'no-store'});
      if(rr.ok){return {text:await rr.text(),source:'live-github'};}
    }catch(e){}
    const fr=await fetch(fallback,{cache:'no-store'});
    if(!fr.ok) throw new Error(`Could not load ${file}`);
    return {text:await fr.text(),source:'fallback'};
  }
  async function json(project,file,fallback){
    const r=await text(project,file,fallback); return {...r,data:JSON.parse(r.text)};
  }
  async function androidLatest(){
    try{const r=await fetch('/api/android/latest',{cache:'no-store'});if(r.ok)return await r.json();}catch(e){}
    return {available:false};
  }
  return {config,text,json,androidLatest};
})();
