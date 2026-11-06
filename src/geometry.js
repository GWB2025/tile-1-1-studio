/* Tile(1,1) mathematical geometry: Smith, Myers, Kaplan & Goodman-Strauss.
 * New implementation for Tile(1,1) Studio. Coordinates use unit edge length.
 */
(function(root,factory){
  if(typeof module==='object' && module.exports) module.exports=factory();
  else root.TileGeometry=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const h=Math.sqrt(3)/2;
  const TILE=Object.freeze([[0,0],[1,0],[1.5,-h],[1.5+h,.5-h],
    [1.5+h,1.5-h],[2.5+h,1.5-h],[3+h,1.5],[3,2],
    [3-h,1.5],[2.5-h,1.5+h],[1.5-h,1.5+h],
    [.5-h,1.5+h],[-h,1.5],[0,1]].map(Object.freeze));
  const ID=[1,0,0,0,1,0];
  const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
  const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const transform=(m,p)=>[m[0]*p[0]+m[1]*p[1]+m[2],m[3]*p[0]+m[4]*p[1]+m[5]];
  const translation=(x,y)=>[1,0,x,0,1,y];
  const rotation=deg=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [c,-s,0,s,c,0];};
  const multiply=(a,b)=>[
    a[0]*b[0]+a[1]*b[3],a[0]*b[1]+a[1]*b[4],a[0]*b[2]+a[1]*b[5]+a[2],
    a[3]*b[0]+a[4]*b[3],a[3]*b[1]+a[4]*b[4],a[3]*b[2]+a[4]*b[5]+a[5]];
  const signedArea=p=>p.reduce((s,a,i)=>s+cross(a,p[(i+1)%p.length]),0)/2;
  const area=p=>Math.abs(signedArea(p));
  const bounds=p=>({minX:Math.min(...p.map(q=>q[0])),maxX:Math.max(...p.map(q=>q[0])),minY:Math.min(...p.map(q=>q[1])),maxY:Math.max(...p.map(q=>q[1]))});
  const overlaps=(a,b)=>a.minX<b.maxX-1e-8 && b.minX<a.maxX-1e-8 && a.minY<b.maxY-1e-8 && b.minY<a.maxY-1e-8;
  function triangulate(poly){
    const p=poly.map(a=>[...a]);
    if(signedArea(p)<0)p.reverse();
    // Remove collinear vertices, including the intentional two-edge straight side.
    for(let i=p.length-1;i>=0;i--){
      if(Math.abs(cross(sub(p[i],p[(i+p.length-1)%p.length]),sub(p[(i+1)%p.length],p[i])))<1e-9)p.splice(i,1);
    }
    const out=[];
    while(p.length>3){
      let found=false;
      for(let i=0;i<p.length;i++){
        const j=(i+p.length-1)%p.length,k=(i+1)%p.length,a=p[j],b=p[i],c=p[k];
        if(cross(sub(b,a),sub(c,b))<=1e-9)continue;
        if(p.some((v,n)=>n!==i&&n!==j&&n!==k&&cross(sub(b,a),sub(v,a))>=-1e-9&&cross(sub(c,b),sub(v,b))>=-1e-9&&cross(sub(a,c),sub(v,c))>=-1e-9))continue;
        out.push([a,b,c]);p.splice(i,1);found=true;break;
      }
      if(!found)throw new Error('Cannot triangulate polygon');
    }
    if(p.length===3)out.push(p);
    return out;
  }
  function clipConvex(poly,clip){
    let p=poly;
    if(signedArea(clip)<0)clip=[...clip].reverse();
    for(let i=0;i<clip.length && p.length;i++){
      const a=clip[i],b=clip[(i+1)%clip.length],v=sub(b,a),out=[];
      let prev=p[p.length-1],dp=cross(v,sub(prev,a));
      for(const curr of p){
        const dc=cross(v,sub(curr,a));
        if((dc>=-1e-10)!==(dp>=-1e-10)){
          const t=dp/(dp-dc);out.push([prev[0]+t*(curr[0]-prev[0]),prev[1]+t*(curr[1]-prev[1])]);
        }
        if(dc>=-1e-10)out.push(curr);
        prev=curr;dp=dc;
      }
      p=out;
    }
    return p;
  }
  function intersectionArea(a,b){
    if(!overlaps(bounds(a),bounds(b)))return 0;
    let total=0;
    for(const t of triangulate(a))for(const u of triangulate(b)){
      if(overlaps(bounds(t),bounds(u)))total+=area(clipConvex(t,u));
    }
    return total;
  }
  function clipLine(a,b,r){
    const dx=b[0]-a[0],dy=b[1]-a[1]; let lo=0,hi=1;
    const p=[-dx,dx,-dy,dy],q=[a[0]-r.x,r.x+r.width-a[0],a[1]-r.y,r.y+r.height-a[1]];
    for(let i=0;i<4;i++){
      if(Math.abs(p[i])<1e-12){if(q[i]<-1e-9)return null;continue;}
      const t=q[i]/p[i];if(p[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);
      if(lo>hi+1e-10)return null;
    }
    if(hi-lo<1e-10)return null;
    return [[a[0]+lo*dx,a[1]+lo*dy],[a[0]+hi*dx,a[1]+hi*dy]];
  }
  function hatchPolygon(poly,{spacing=1.2,angle=45,inset=.35}={}){
    if(!Number.isFinite(spacing)||spacing<=0||!Number.isFinite(angle)||!Number.isFinite(inset)||inset<0)
      throw new Error('Hatching requires positive spacing, a finite angle and a non-negative inset.');
    if(poly.length<3)return [];
    // Work relative to the first vertex: translated tiles retain the same line
    // phase, so decoration of a periodic cell is genuinely periodic too.
    const origin=poly[0],toLocal=rotation(-angle),toPage=rotation(angle);
    const p=poly.map(q=>transform(toLocal,sub(q,origin))),box=bounds(p),out=[];
    const crossings=(polygon,y)=>{
      const xs=[];
      for(let i=0;i<polygon.length;i++){
        const a=polygon[i],b=polygon[(i+1)%polygon.length];
        const ay=Math.abs(a[1]-y)<1e-9?0:a[1]-y,by=Math.abs(b[1]-y)<1e-9?0:b[1]-y;
        if((ay>0)!==(by>0))xs.push(a[0]-ay*(b[0]-a[0])/(by-ay));
      }
      return xs.sort((a,b)=>a-b);
    };
    // Each boundary edge is surrounded by a capsule (rectangle + end discs).
    // Removing their scanline intervals gives a true perpendicular clearance,
    // including beside notches and almost-parallel edges, without SVG masks.
    const strips=p.flatMap((a,i)=>{
      const b=p[(i+1)%p.length],length=distance(a,b);
      if(length<1e-9)return [];
      const n=[-(b[1]-a[1])*inset/length,(b[0]-a[0])*inset/length];
      return [[add(a,n),add(b,n),sub(b,n),sub(a,n)]];
    });
    const first=Math.ceil(box.minY/spacing-.5),last=Math.floor(box.maxY/spacing-.5);
    if(last-first>100000)throw new Error('Hatching spacing is too small for this polygon.');
    for(let k=first;k<=last;k++){
      const y=(k+.5)*spacing,xs=crossings(p,y),blocked=[];
      if(inset>0){
        for(const strip of strips){
          const cuts=crossings(strip,y);
          if(cuts.length>=2)blocked.push([cuts[0],cuts.at(-1)]);
        }
        for(const point of p){
          const r2=inset*inset-(point[1]-y)**2;
          if(r2>0){const dx=Math.sqrt(r2);blocked.push([point[0]-dx,point[0]+dx]);}
        }
      }
      blocked.sort((a,b)=>a[0]-b[0]);
      for(let i=0;i+1<xs.length;i+=2){
        let start=xs[i];const end=xs[i+1];
        const emit=(a,b)=>{if(b-a>.05+1e-9)out.push({a:add(transform(toPage,[a,y]),origin),b:add(transform(toPage,[b,y]),origin)});};
        for(const [lo,hi] of blocked){
          if(hi<=start)continue;
          if(lo>=end)break;
          if(lo>start)emit(start,lo);
          start=Math.max(start,hi);
          if(start>=end)break;
        }
        emit(start,end);
      }
    }
    return out;
  }
  return {TILE,ID,add,sub,cross,distance,transform,translation,rotation,multiply,signedArea,area,bounds,overlaps,triangulate,clipConvex,intersectionArea,clipLine,hatchPolygon};
});
