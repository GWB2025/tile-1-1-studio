const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../src/geometry.js');
const T=require('../src/tiling.js');
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function checkPatch(tiles){
  const bs=tiles.map(t=>G.bounds(t.points));
  for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++){
    if(G.overlaps(bs[i],bs[j]))near(G.intersectionArea(tiles[i].points,tiles[j].points),0);
  }
}
test('two-tile periodic cell has exact density, opposite handedness and no overlapping neighbours',()=>{
  const {tiles,u,v}=T.periodicCell();
  near(Math.abs(G.cross(u,v)),2*G.area(G.TILE));
  assert.ok(G.signedArea(tiles[0].points)*G.signedArea(tiles[1].points)<0);
  const patch=[];
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(const tile of tiles)
    patch.push({points:tile.points.map(p=>[p[0]+i*u[0]+j*v[0],p[1]+i*u[1]+j*v[1]])});
  checkPatch(patch);
});
test('substitution has expected tile counts, one handedness and no overlaps',()=>{
  const p=T.aperiodicPatch(2,'Delta');
  assert.equal(p.length,71);
  assert.equal(new Set(p.map(t=>Math.sign(G.signedArea(t.points)))).size,1);
  checkPatch(p);
  assert.equal(T.aperiodicPatch(4,'Delta').length,4401);
});
test('both modes reproduce exactly and different seeds change geometry',()=>{
  for(const mode of ['aperiodic','periodic']){
    const a=T.generate({mode,seed:'20261104'});
    const b=T.generate({mode,seed:'20261104'});
    const c=T.generate({mode,seed:'20261105'});
    assert.deepEqual(a,b);
    assert.notDeepEqual(a.tiles.map(t=>t.points),c.tiles.map(t=>t.points));
  }
});
test('several seeds cover every part of the page and keep all pen coordinates within margins',()=>{
  for(const mode of ['aperiodic','periodic'])for(const seed of ['0','42','20261104','Gordon']){
    const art=T.generate({mode,seed,width:148,height:105,edge:6,margin:8});
    near(art.coverage,1,1e-7);
    for(const line of art.lines)for(const [x,y] of [line.a,line.b]){
      assert.ok(x>=8-1e-7&&x<=140+1e-7&&y>=8-1e-7&&y<=97+1e-7);
    }
    const keys=art.lines.map(l=>T.edgeKey(l.a,l.b));
    assert.equal(new Set(keys).size,keys.length);
  }
});
test('colour changes leave geometry unchanged and periodic colours repeat over the supercell',()=>{
  const a=T.generate({mode:'periodic',seed:'42',palette:'kyoto'});
  const b=T.generate({mode:'periodic',seed:'42',palette:'black'});
  assert.deepEqual(a.tiles.map(t=>t.points),b.tiles.map(t=>t.points));
  const colours=new Map();
  for(const tile of a.tiles){
    const key=`${((tile.i%3)+3)%3},${((tile.j%3)+3)%3},${tile.member}`;
    if(colours.has(key))assert.equal(colours.get(key),tile.colour);
    colours.set(key,tile.colour);
  }
});
test('SVG export is layered, explicit, unfilled and records reproducible settings',()=>{
  const a=T.generate({seed:'42'}),svg=T.toSvg(a);
  assert.match(svg,/width="148mm" height="105mm"/);
  assert.match(svg,/inkscape:groupmode="layer"/);
  assert.match(svg,/fill="none"/);
  assert.doesNotMatch(svg,/<(?:image|text|clipPath)|transform=|<script/);
  assert.deepEqual(JSON.parse(T.recipe(a)).settings,a.settings);
  assert.equal(T.toSvg(T.generate(JSON.parse(T.recipe(a)).settings)),svg);
  const carrier=T.toSvg(a,{carrier:true});
  assert.match(carrier,/width="210mm" height="297mm"/);
  assert.match(carrier,/&quot;offsetMm&quot;:\[31,96\]/);
});
test('invalid settings are rejected with useful errors',()=>{
  for(const s of [{edge:0},{edge:NaN},{margin:80},{mode:'random'},{seed:''},{width:10000},{palette:'unknown'}])
    assert.throws(()=>T.generate(s));
});
