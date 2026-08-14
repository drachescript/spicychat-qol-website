
const REPOS = {
  extension: 'drachescript/spicychat-qol-extention',
  android: 'drachescript/spicychat-qol-android'
};
const ALLOWED = {
  extension: new Set(['README.md','features.md','CHANGELOG.md','manifest.json','THIRD-PARTY-NOTICES.md','android-CHANGELOG.md']),
  android: new Set(['README.md','CHANGELOG.md','version.json','pubspec.yaml'])
};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
export default {
 async fetch(request,env,ctx){
  if(request.method==='OPTIONS')return new Response(null,{headers:cors});
  if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:cors});
  const u=new URL(request.url);
  if(u.pathname==='/api/source'){
    const project=u.searchParams.get('project'),file=u.searchParams.get('file');
    if(!REPOS[project]||!ALLOWED[project]?.has(file))return new Response('Not allowed',{status:400,headers:cors});
    return proxyRaw(project,file);
  }
  if(u.pathname==='/api/android/latest') return androidLatest();
  return new Response('Not found',{status:404,headers:cors});
 }
};
async function proxyRaw(project,file){
 const url=`https://raw.githubusercontent.com/${REPOS[project]}/main/${file}`;
 const r=await fetch(url,{headers:{'User-Agent':'SpicyChat-QoL-Website'}});
 return new Response(await r.arrayBuffer(),{status:r.status,headers:{...cors,'Content-Type':r.headers.get('Content-Type')||'text/plain; charset=utf-8','Cache-Control':'public,max-age=300'}});
}
async function androidLatest(){
 // Prefer a simple root version.json later if the Android repo adds one.
 try{
  const v=await fetch(`https://raw.githubusercontent.com/${REPOS.android}/main/version.json`,{headers:{'User-Agent':'SpicyChat-QoL-Website'}});
  if(v.ok){const data=await v.json();return Response.json({...data,available:true},{headers:{...cors,'Cache-Control':'public,max-age=180'}});}
 }catch(e){}
 // Otherwise use the latest GitHub Release and locate the APK asset.
 const r=await fetch(`https://api.github.com/repos/${REPOS.android}/releases/latest`,{headers:{'Accept':'application/vnd.github+json','User-Agent':'SpicyChat-QoL-Website','X-GitHub-Api-Version':'2022-11-28'}});
 if(!r.ok)return Response.json({available:false},{status:200,headers:{...cors,'Cache-Control':'public,max-age=180'}});
 const rel=await r.json();const apk=(rel.assets||[]).find(a=>String(a.name).toLowerCase().endsWith('.apk'));
 return Response.json({available:true,versionName:String(rel.tag_name||'').replace(/^v/,''),tagName:rel.tag_name,publishedAt:rel.published_at,releaseUrl:rel.html_url,apkUrl:apk?.browser_download_url||'',apkName:apk?.name||''},{headers:{...cors,'Cache-Control':'public,max-age=180'}});
}
