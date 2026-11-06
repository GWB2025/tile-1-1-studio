const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="src/style.css">',()=>`<style>${fs.readFileSync(path.join(root,'src/style.css'),'utf8')}</style>`);
for(const name of ['geometry','tiling','app'])html=html.replace(`<script src="src/${name}.js"></script>`,()=>`<script>${fs.readFileSync(path.join(root,`src/${name}.js`),'utf8')}</script>`);
fs.writeFileSync(path.join(root,'Tile_1_1_Studio.html'),html);
const T=require('../src/tiling.js');
fs.mkdirSync(path.join(root,'examples'),{recursive:true});
for(const mode of ['aperiodic','periodic'])for(const seed of ['20261104','20261105']){
  const art=T.generate({mode,seed});
  const stem=`tile-1-1-${mode}-seed-${seed}`;
  fs.writeFileSync(path.join(root,'examples',stem+'.svg'),T.toSvg(art));
  fs.writeFileSync(path.join(root,'examples',stem+'.json'),T.recipe(art));
  if(seed==='20261104')fs.writeFileSync(path.join(root,'examples',stem+'-a4-carrier.svg'),T.toSvg(art,{carrier:true}));
  console.log(stem,art.stats);
}
for(const mode of ['aperiodic','periodic'])for(const shading of ['hatch','crosshatch']){
  const art=T.generate({mode,shading,seed:'20261104'});
  const stem=`tile-1-1-${mode}-seed-20261104-${shading}`;
  fs.writeFileSync(path.join(root,'examples',stem+'.svg'),T.toSvg(art));
  fs.writeFileSync(path.join(root,'examples',stem+'.json'),T.recipe(art));
  if(shading==='hatch')fs.writeFileSync(path.join(root,'examples',stem+'-a4-carrier.svg'),T.toSvg(art,{carrier:true}));
  console.log(stem,art.stats);
}
console.log('Built offline Tile_1_1_Studio.html and example SVGs.');
