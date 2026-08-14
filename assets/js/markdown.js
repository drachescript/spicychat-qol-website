
window.SQOLMarkdown = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const inline = s => {
    let x = esc(s);
    x = x.replace(/`([^`]+)`/g,'<code>$1</code>');
    x = x.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    x = x.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    x = x.replace(/(https?:\/\/[^\s<]+)/g, url => url.includes('href=') ? url : `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
    return x;
  };
  function render(md){
    const lines = String(md||'').replace(/\r/g,'').split('\n');
    let out='', inList=false, para=[];
    const flushPara=()=>{if(para.length){out+=`<p>${inline(para.join(' '))}</p>`;para=[]}};
    const closeList=()=>{if(inList){out+='</ul>';inList=false}};
    for(const raw of lines){
      const line=raw.trimEnd();
      if(!line.trim()){flushPara();closeList();continue;}
      const hm=line.match(/^(#{1,4})\s+(.+)$/);
      if(hm){flushPara();closeList();const n=hm[1].length;out+=`<h${n}>${inline(hm[2])}</h${n}>`;continue;}
      const li=line.match(/^\s*[-*]\s+(.+)$/);
      if(li){flushPara();if(!inList){out+='<ul>';inList=true;}out+=`<li>${inline(li[1])}</li>`;continue;}
      para.push(line.trim());
    }
    flushPara();closeList();return out;
  }
  function sections(md){
    const lines=String(md||'').replace(/\r/g,'').split('\n');
    const sections=[]; let current=null; let intro=[];
    for(const line of lines){
      const m=line.match(/^##\s+(.+)$/);
      if(m){if(current)sections.push(current); current={title:m[1].trim(),lines:[]}; continue;}
      if(current) current.lines.push(line); else intro.push(line);
    }
    if(current) sections.push(current);
    return {intro:intro.join('\n'),sections};
  }
  function versionSections(md){
    return sections(md).sections;
  }
  return {render,sections,versionSections,inline};
})();
