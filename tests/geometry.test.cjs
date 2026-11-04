const {test} = require('node:test');
const assert = require('node:assert/strict');
const G = require('../src/geometry.js');
const near = (a,b,t=1e-8) => assert.ok(Math.abs(a-b)<t, `${a} != ${b}`);
test('Tile(1,1) has fourteen unit edges and the analytical area', () => {
  assert.equal(G.TILE.length,14);
  G.TILE.forEach((p,i)=>near(G.distance(p,G.TILE[(i+1)%14]),1));
  near(G.area(G.TILE),3*(1+Math.sqrt(3)));
});
test('rigid transformations preserve length and reflection reverses handedness',()=>{
  const t=G.multiply(G.translation(5,-2),G.rotation(73));
  const poly=G.TILE.map(p=>G.transform(t,p));
  near(G.area(poly),G.area(G.TILE));
  near(G.signedArea(G.TILE.map(p=>[-p[0],p[1]])),-G.signedArea(G.TILE));
});
test('triangle decomposition and polygon clipping conserve area',()=>{
  near(G.triangulate(G.TILE).reduce((a,p)=>a+G.area(p),0),G.area(G.TILE));
  near(G.intersectionArea(G.TILE,G.TILE),G.area(G.TILE));
  near(G.intersectionArea(G.TILE,G.TILE.map(p=>[p[0]+20,p[1]])),0);
  const square=[[0,0],[2,0],[2,2],[0,2]];
  near(G.intersectionArea(square,[[1,1],[3,1],[3,3],[1,3]]),1);
});
test('line clipping handles crossing, inside, outside and boundary segments',()=>{
  const r={x:0,y:0,width:10,height:10};
  assert.deepEqual(G.clipLine([-5,5],[15,5],r),[[0,5],[10,5]]);
  assert.deepEqual(G.clipLine([2,2],[5,8],r),[[2,2],[5,8]]);
  assert.equal(G.clipLine([-1,0],[-1,10],r),null);
  assert.deepEqual(G.clipLine([0,0],[10,0],r),[[0,0],[10,0]]);
});
