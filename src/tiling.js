/* Tile(1,1) Studio. Mathematical construction: Smith, Myers, Kaplan and
 * Goodman-Strauss, A chiral aperiodic monotile (2024), Appendix A / Figure 5.3.
 * The coordinate and substitution tables are mathematical data; see REFERENCES.md.
 */
(function(root,factory){
  if(typeof module==='object' && module.exports) module.exports=factory(require('./geometry.js'));
  else root.TileStudio=factory(root.TileGeometry);
})(typeof globalThis!=='undefined'?globalThis:this,function(G){
  'use strict';
  const VERSION='1.0.0';
  const PALETTES={
    kyoto:[{name:'Pigma Micron Orange 05 · 35781',hex:'#df7b28'},{name:'Pigma Micron Light Brown 05 · 35783',hex:'#a97850'},{name:'Pigma Micron Dark Brown 05 · 37741',hex:'#493126'}],
    garden:[{name:'Pigma Micron Green 05',hex:'#48725a'},{name:'Pigma Micron Blue 05',hex:'#406993'},{name:'Pigma Micron Purple 05',hex:'#805875'}],
    black:[{name:'Pigma Micron Black 05',hex:'#252a29'}]
  };
  const RULES={
    Gamma:['Pi','Delta',null,'Theta','Sigma','Xi','Phi','Gamma'],
    Delta:['Xi','Delta','Xi','Phi','Sigma','Pi','Phi','Gamma'],
    Theta:['Psi','Delta','Pi','Phi','Sigma','Pi','Phi','Gamma'],
    Lambda:['Psi','Delta','Xi','Phi','Sigma','Pi','Phi','Gamma'],
    Xi:['Psi','Delta','Pi','Phi','Sigma','Psi','Phi','Gamma'],
    Pi:['Psi','Delta','Xi','Phi','Sigma','Psi','Phi','Gamma'],
    Sigma:['Xi','Delta','Xi','Phi','Sigma','Pi','Lambda','Gamma'],
    Phi:['Psi','Delta','Psi','Phi','Sigma','Pi','Phi','Gamma'],
    Psi:['Psi','Delta','Psi','Phi','Sigma','Psi','Phi','Gamma']
  };
  function hash(text){
    let h=2166136261;
    for(const c of String(text)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}
    h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return (h^(h>>>16))>>>0;
  }
  function random(seed){
    let state=hash(seed);
    return ()=>{state=(state+0x6d2b79f5)|0;let t=Math.imul(state^(state>>>15),1|state);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
  }
  const CACHE=new Map();
  function aperiodicPatch(depth=4,label='Delta'){
    if(!Number.isInteger(depth)||depth<0||depth>5||!RULES[label])throw new Error('Invalid substitution settings');
    const cacheKey=`${depth}/${label}`;
    if(CACHE.has(cacheKey))return CACHE.get(cacheKey);
    const q=[3,5,7,11].map(i=>G.TILE[i]);
    let nodes={};
    for(const name of Object.keys(RULES))nodes[name]={quad:q,label:name};
    nodes.Gamma={quad:q,children:[
      [{label:'Gamma1'},G.ID],
      [{label:'Gamma2'},G.multiply(G.translation(...G.TILE[8]),G.rotation(30))]
    ]};
    for(let generation=0;generation<depth;generation++){
      const quad=nodes.Delta.quad,transforms=[G.ID]; let angle=0;
      for(const [turn,from,to] of [[60,3,1],[0,2,0],[60,3,1],[60,3,1],[0,2,0],[60,3,1],[-120,3,3]]){
        angle+=turn;
        const r=G.rotation(angle),target=G.transform(transforms.at(-1),quad[from]);
        const move=G.sub(target,G.transform(r,quad[to]));
        transforms.push(G.multiply(G.translation(...move),r));
      }
      const ts=transforms.map(t=>G.multiply([-1,0,0,0,1,0],t));
      const newQuad=[[6,2],[5,1],[3,2],[0,1]].map(([t,p])=>G.transform(ts[t],quad[p]));
      const next={};
      for(const [name,rule] of Object.entries(RULES))next[name]={quad:newQuad,children:rule.flatMap((child,i)=>child?[[nodes[child],ts[i]]]:[])};
      nodes=next;
    }
    const out=[];
    function visit(node,m,path){
      if(node.children){node.children.forEach(([child,t],i)=>visit(child,G.multiply(m,t),`${path}.${i}`));return;}
      out.push({points:G.TILE.map(p=>G.transform(m,p)),label:node.label,id:path});
    }
    // Each generation reflects the whole construction. Normalise globally to
    // keep the original handedness at both odd and even depths.
    visit(nodes[label],depth%2?[-1,0,0,0,1,0]:G.ID,label);
    if(CACHE.size>4)CACHE.delete(CACHE.keys().next().value);
    CACHE.set(cacheKey,out);return out;
  }
  function periodicCell(){
    const s=Math.sqrt(3),m=G.multiply(G.translation(...G.TILE[6]),G.multiply(G.rotation(150),[-1,0,0,0,1,0]));
    return {u:[3+2*s,-s],v:[(3-s)/2,(3+s)/2],tiles:[
      {points:G.TILE,label:'Original',member:0},
      {points:G.TILE.map(p=>G.transform(m,p)),label:'Reflected',member:1}
    ]};
  }
  function settings(input={}){
    const s={mode:'aperiodic',seed:'20261104',width:148,height:105,edge:6,margin:8,rotation:0,palette:'kyoto',penWidth:.25,...input};
    s.seed=String(s.seed).trim();
    if(!s.seed||s.seed.length>120)throw new Error('Enter a seed of 1–120 characters.');
    if(!['aperiodic','periodic'].includes(s.mode))throw new Error('Choose periodic or aperiodic mode.');
    if(!PALETTES[s.palette])throw new Error('Choose a supported pen palette.');
    for(const [key,min,max] of [['width',50,297],['height',50,297],['edge',3,18],['margin',3,30],['rotation',-360,360],['penWidth',.05,1]]){
      if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw new Error(`${key} must be between ${min} and ${max}.`);
    }
    if(s.margin*2>=Math.min(s.width,s.height)-10)throw new Error('The margin leaves too little drawing area.');
    return s;
  }
  function pageTiles(tiles,centre,angle,s){
    const r=G.rotation(angle),box={minX:s.margin,minY:s.margin,maxX:s.width-s.margin,maxY:s.height-s.margin};
    return tiles.flatMap(tile=>{
      const points=tile.points.map(p=>{
        const q=G.transform(r,G.sub(p,centre));return [q[0]*s.edge+s.width/2,q[1]*s.edge+s.height/2];
      });
      return G.overlaps(G.bounds(points),box)?[{...tile,points}]:[];
    });
  }
  function coveredArea(tiles,r){
    const rect=[[r.x,r.y],[r.x+r.width,r.y],[r.x+r.width,r.y+r.height],[r.x,r.y+r.height]];
    return tiles.reduce((a,t)=>a+G.area(G.clipConvex(t.points,rect)),0);
  }
  const mod=(a,n)=>((a%n)+n)%n;
  const edgeKey=(a,b)=>{const p=a.map(x=>x.toFixed(5)).join(','),q=b.map(x=>x.toFixed(5)).join(',');return p<q?`${p}/${q}`:`${q}/${p}`;};
  function generate(input={}){
    const s=settings(input),rng=random(`${s.seed}/geometry`),angle=Math.floor(rng()*12)*30+s.rotation;
    const rect={x:s.margin,y:s.margin,width:s.width-2*s.margin,height:s.height-2*s.margin};
    let tiles,construction;
    if(s.mode==='aperiodic'){
      const labels=Object.keys(RULES),label=labels[Math.floor(rng()*labels.length)];
      let found=false;
      for(const depth of [4,5]){
        const patch=aperiodicPatch(depth,label);
        for(let attempt=0;attempt<36;attempt++){
          const anchor=patch[Math.floor(rng()*patch.length)];
          const centre=anchor.points.reduce((a,p)=>G.add(a,[p[0]/14,p[1]/14]),[0,0]);
          const candidate=pageTiles(patch,centre,angle,s);
          if(Math.abs(coveredArea(candidate,rect)/(rect.width*rect.height)-1)<1e-7){
            tiles=candidate;construction={method:'homochiral substitution patch',root:label,depth,centre,angle};found=true;break;
          }
        }
        if(found)break;
      }
      if(!found)throw new Error('This crop could not be covered. Try a larger tile size or another seed.');
    }else{
      const cell=periodicCell(),fu=rng(),fv=rng(),centre=[fu*cell.u[0]+fv*cell.v[0],fu*cell.u[1]+fv*cell.v[1]];
      const inverse=G.rotation(-angle),det=G.cross(cell.u,cell.v);
      const corners=[[0,0],[s.width,0],[s.width,s.height],[0,s.height]].map(p=>G.add(G.transform(inverse,[(p[0]-s.width/2)/s.edge,(p[1]-s.height/2)/s.edge]),centre));
      const ij=corners.map(p=>[G.cross(p,cell.v)/det,G.cross(cell.u,p)/det]);
      const ib=G.bounds(ij),raw=[];
      for(let i=Math.floor(ib.minX)-3;i<=Math.ceil(ib.maxX)+3;i++)for(let j=Math.floor(ib.minY)-3;j<=Math.ceil(ib.maxY)+3;j++){
        const move=[i*cell.u[0]+j*cell.v[0],i*cell.u[1]+j*cell.v[1]];
        for(const t of cell.tiles)raw.push({...t,i,j,id:`${i},${j},${t.member}`,points:t.points.map(p=>G.add(p,move))});
      }
      tiles=pageTiles(raw,centre,angle,s);
      construction={method:'two-tile translation lattice',centre,angle,lattice:[cell.u,cell.v],colourRepeat:[3,3]};
    }
    const palette=PALETTES[s.palette];
    tiles=tiles.map(t=>{
      const colourKey=s.mode==='periodic'?`${mod(t.i,3)},${mod(t.j,3)},${t.member}`:t.id;
      return {...t,colour:hash(`${s.seed}/colour/${colourKey}`)%palette.length};
    });
    // Assign each shared edge once, before clipping. Unit edges retain the
    // collinear midpoint, so an edge is never exported on top of a double edge.
    const edges=new Map();
    for(const tile of tiles)tile.points.forEach((p,i)=>{
      const q=tile.points[(i+1)%14],key=edgeKey(p,q);
      if(!edges.has(key))edges.set(key,{a:p,b:q,colour:tile.colour});
    });
    const lines=[];
    for(const e of edges.values()){
      const line=G.clipLine(e.a,e.b,rect);
      if(line)lines.push({a:line[0],b:line[1],colour:e.colour});
    }
    const coverage=coveredArea(tiles,rect)/(rect.width*rect.height);
    const lengthMm=lines.reduce((a,l)=>a+G.distance(l.a,l.b),0);
    return {version:VERSION,settings:s,construction,tiles,lines,coverage,stats:{tiles:tiles.length,segments:lines.length,lengthMm}};
  }
  const xml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const num=x=>Number(x.toFixed(4)).toString();
  function recipe(art){return JSON.stringify({application:'Tile(1,1) Studio',version:VERSION,settings:art.settings},null,2);}
  function toSvg(art,{carrier=false}={}){
    const s=art.settings;
    if(carrier&&(s.width!==148||s.height!==105))throw new Error('The A4 carrier is for the 148 × 105 mm postcard.');
    const [dx,dy]=carrier?[31,96]:[0,0],w=carrier?210:s.width,h=carrier?297:s.height;
    const meta={application:'Tile(1,1) Studio',version:VERSION,settings:s,construction:art.construction,stats:art.stats,offsetMm:[dx,dy],note:'Finite crop; aperiodicity refers to the generating infinite tiling. Shared edges drawn once.'};
    const out=[`<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">`,
      `<title>${xml(`Tile(1,1) ${s.mode} · seed ${s.seed}`)}</title>`,
      `<metadata>${xml(JSON.stringify(meta))}</metadata>`];
    PALETTES[s.palette].forEach((pen,index)=>{
      out.push(`<g id="pen-${index+1}" inkscape:groupmode="layer" inkscape:label="${xml(pen.name)}" fill="none" stroke="${pen.hex}" stroke-width="${s.penWidth}" stroke-linecap="round" stroke-linejoin="round">`);
      // Independent two-point paths avoid a giant compound path overwhelming
      // an SVG importer; every move is explicit and every pen pass is separate.
      for(const l of art.lines)if(l.colour===index)out.push(`<path d="M ${num(l.a[0]+dx)} ${num(l.a[1]+dy)} L ${num(l.b[0]+dx)} ${num(l.b[1]+dy)}"/>`);
      out.push('</g>');
    });out.push('</svg>');return out.join('\n');
  }
  return {VERSION,PALETTES,hash,random,settings,aperiodicPatch,periodicCell,generate,edgeKey,recipe,toSvg};
});
