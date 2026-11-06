/* Browser UI; all drawing logic lives in the testable geometry engine. */
(()=>{
  'use strict';
  const T=window.TileStudio,G=window.TileGeometry,$=id=>document.getElementById(id);
  const papers={postcard:[148,105],a5:[210,148],a4:[210,297]};
  let art=null,filled=false,dirty=false;
  const message=(text,error=false)=>{$('message').textContent=text;$('message').classList.toggle('error',error);};
  function read(){const [width,height]=papers[$('paper').value];return {mode:document.querySelector('input[name=mode]:checked').value,seed:$('seed').value,width,height,edge:Number($('edge').value),margin:Number($('margin').value),rotation:Number($('rotation').value),palette:$('palette').value,penWidth:Number($('penWidth').value),shading:$('shading').value,hatchSpacing:Number($('hatchSpacing').value),hatchAngle:Number($('hatchAngle').value),hatchVariation:$('hatchVariation').value};}
  function updateLabels(){
    $('edgeValue').value=`${$('edge').value} mm`;
    $('hatchSpacingValue').value=`${Number($('hatchSpacing').value).toFixed(1)} mm`;
    const shadingOff=$('shading').value==='none';
    for(const id of ['hatchSpacing','hatchAngle','hatchVariation'])$(id).disabled=shadingOff;
    $('shadingNote').textContent=shadingOff?'Outlines only. Choose a shading style to add pen lines inside the tiles.':'Wider spacing gives lighter shading and faster plots. Varied tones change spacing and angle between tiles.';
    $('modeNote').textContent=read().mode==='aperiodic'?'Rotations and translations only. All tiles have the same handedness.':'A repeating cell with an original tile and its mirror image.';
    $('swatches').replaceChildren(...T.PALETTES[$('palette').value].map(p=>{const e=document.createElement('span');e.className='swatch';e.style.background=p.hex;e.title=p.name;return e;}));
  }
  function paint(){
    if(!art)return;
    const s=art.settings;
    if(!filled)$('paperView').innerHTML=T.toSvg(art).replace(/<\?xml[^>]*>/,'');
    else {
      const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
      svg.setAttribute('viewBox',`0 0 ${s.width} ${s.height}`);svg.setAttribute('aria-label',`${s.mode} tiling, coloured tiles`);
      const r=[[s.margin,s.margin],[s.width-s.margin,s.margin],[s.width-s.margin,s.height-s.margin],[s.margin,s.height-s.margin]];
      for(const tile of art.tiles){
        const p=G.clipConvex(tile.points,r);if(p.length<3)continue;
        const el=document.createElementNS(ns,'polygon');el.setAttribute('points',p.map(q=>q.join(',')).join(' '));el.setAttribute('fill',T.PALETTES[s.palette][tile.colour].hex);el.setAttribute('fill-opacity','.76');el.setAttribute('stroke','#fffdf7');el.setAttribute('stroke-width','.16');svg.append(el);
      }
      $('paperView').replaceChildren(svg);
    }
    $('paperView').classList.toggle('portrait',s.height>s.width);
    $('viewLines').setAttribute('aria-pressed',String(!filled));$('viewFills').setAttribute('aria-pressed',String(filled));
    $('previewNote').textContent=filled?'Solid colours are for inspection. Switch to Pen lines to see the exported shading.':'The preview shows every exported pen path, including shading. Paper and captions are not exported.';
    $('artTitle').textContent=s.mode==='aperiodic'?'Aperiodic study':'Periodic study';
    $('caption').textContent=`TILE(1,1) / ${s.mode} / SEED ${s.seed}`;
    $('pageLabel').textContent=`${s.width} × ${s.height} mm`;
    $('stats').textContent=`${art.stats.tiles} tiles in crop · ${art.stats.segments.toLocaleString()} segments · ${(art.stats.lengthMm/1000).toFixed(2)} m of pen travel`;
    $('exportNote').textContent=`${art.stats.outlineSegments} outlines + ${art.stats.shadingSegments.toLocaleString()} shading lines · separate pen layers`;
    $('carrier').disabled=s.width!==148||s.height!==105||dirty;
  }
  function generate(){
    try{art=T.generate(read());dirty=false;$('export').disabled=false;paint();message('Ready to export. Your seed and settings are recorded in the SVG.');return true;}
    catch(e){$('export').disabled=true;$('carrier').disabled=true;message(e.message,true);return false;}
  }
  function download(text,name,type){
    const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  const fileStem=()=>`tile-1-1-${art.settings.mode}-seed-${art.settings.seed.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,60)}${art.settings.shading==='none'?'':`-${art.settings.shading}`}`;
  $('controls').addEventListener('submit',e=>{e.preventDefault();generate();});
  $('controls').addEventListener('input',()=>{dirty=true;updateLabels();$('export').disabled=true;$('carrier').disabled=true;message('Settings changed. Select Generate tiling to update the drawing.');});
  $('next').addEventListener('click',()=>{
    const seed=$('seed').value.trim();
    if(/^\d+$/.test(seed))$('seed').value=String(BigInt(seed)+1n);
    else {const m=seed.match(/^(.*)~(\d+)$/);$('seed').value=m?`${m[1]}~${BigInt(m[2])+1n}`:`${seed}~1`;}
    generate();
  });
  document.querySelectorAll('input[name=mode]').forEach(e=>e.addEventListener('change',()=>{updateLabels();generate();}));
  $('viewLines').addEventListener('click',()=>{filled=false;paint();});$('viewFills').addEventListener('click',()=>{filled=true;paint();});
  $('export').addEventListener('click',()=>{if(!art||dirty)return;download(T.toSvg(art),`${fileStem()}.svg`,'image/svg+xml');message('SVG downloaded. In SVG Plotter, keep original size and position and use 0° rotation.');});
  $('carrier').addEventListener('click',()=>{if(!art||dirty)return;download(T.toSvg(art,{carrier:true}),`${fileStem()}-a4-carrier.svg`,'image/svg+xml');message('A4 carrier downloaded. Place the postcard top-left at (31, 96) mm on A4 portrait.');});
  $('saveRecipe').addEventListener('click',()=>{try{const s=T.settings(read());download(T.recipe({settings:s}),`tile-1-1-settings-${s.seed.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,60)}.json`,'application/json');message('Settings downloaded. Use Load settings to recreate the drawing.');}catch(e){message(e.message,true);}});
  $('loadRecipe').addEventListener('click',()=>$('recipeFile').click());
  $('recipeFile').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.size>100000)throw new Error('That settings file is too large.');
      const s=T.readRecipe(await file.text()),paper=Object.keys(papers).find(k=>papers[k][0]===s.width&&papers[k][1]===s.height);
      if(!paper)throw new Error('This paper size is not supported by the interface.');
      const rotation=[...$('rotation').options].find(o=>Number(o.value)===s.rotation);
      if(!rotation)throw new Error('This rotation is not supported by the interface.');
      document.querySelector(`input[name=mode][value=${s.mode}]`).checked=true;
      for(const k of ['seed','edge','margin','rotation','palette','penWidth','shading','hatchSpacing','hatchAngle','hatchVariation'])$(k).value=s[k];
      $('paper').value=paper;updateLabels();generate();
    }catch(err){message(err.message,true);}finally{e.target.value='';}
  });
  $('about').addEventListener('click',()=>$('aboutDialog').showModal());$('closeAbout').addEventListener('click',()=>$('aboutDialog').close());
  updateLabels();generate();
})();
