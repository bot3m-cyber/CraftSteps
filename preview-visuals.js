/* CraftSteps Visuals v0.3 — original 16×16 pixel textures and geometry from blockstates.
 * Deliberately contains NO Mojang game textures. Pure Canvas 2D software 3D renderer.
 * State support is incremental; unknown blocks have a visible fallback, never a random color.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CraftStepsPreviewVisuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const tileCache = new Map();
  const PI = Math.PI;
  const mathClamp = (a, min, max) => Math.min(max, Math.max(min, a));
  const rawName = block => String(block?.blockId || block?.type || 'unknown').replace(/^minecraft:/, '').split('[')[0].replace(/^[^:]+:/, 'mod_');
  function parseProperties(block) {
    if (block?.properties && typeof block.properties === 'object') return block.properties;
    const raw = block?.blockState || '';
    const props = Object.create(null), found = /\[([^\]]+)\]/.exec(raw);
    if (found) for (const item of found[1].split(',')) { const [key, value] = item.split('='); if (key && value) props[key] = value; }
    return props;
  }
  const hash = (x, y, seed) => { let h = Math.imul(x + 17, 374761393) ^ Math.imul(y + 29, 668265263) ^ seed; h = Math.imul(h ^ h >>> 13, 1274126177); return (h ^ h >>> 16) >>> 0; };
  const hashText = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  function styleOf(type) {
    type = String(type).replace(/^minecraft:/, '').toLowerCase();
    if(type.startsWith('mod_')||type.startsWith('unknown_legacy_'))return 'unknown';
    if(/(^|_)(oak|spruce|birch|jungle|acacia|cherry|mangrove|bamboo|crimson|warped)(_.*)?_stairs$/.test(type))return 'planks';
    if (/^(water|bubble_column)$/.test(type)) return 'water';
    if (type === 'lava') return 'lava';
    if (/glass|_pane$/.test(type)) return 'glass';
    if (/_leaves$|^leaves$/.test(type)) return 'leaves';
    if (/grass_block/.test(type)) return 'grass';
    if (/moss|azalea/.test(type)) return 'moss';
    if (/dirt|mud|farmland|podzol|rooted_dirt/.test(type)) return 'dirt';
    if (/cobblestone|mossy_cobblestone|blackstone/.test(type)) return 'cobble';
    if (/stone_bricks|brick|nether_brick/.test(type)) return 'bricks';
    if (/log|stem|hyphae|wood|stripped_/.test(type)) return 'log';
    if (/planks|fence|door|trapdoor|wooden|chest|barrel|bookshelf|sign|crafting_table/.test(type)) return 'planks';
    if (/sand|sandstone|end_stone/.test(type)) return 'sand';
    if (/snow|quartz|calcite|white_concrete/.test(type)) return 'snow';
    if (/hay|wheat|bamboo/.test(type)) return 'hay';
    if (/lantern|torch|glowstone|shroomlight|sea_lantern|light/.test(type)) return 'light';
    if (/stone|deepslate|andesite|diorite|granite|tuff|slate|basalt|ore|slab/.test(type)) return 'stone';
    if (/wool|concrete|terracotta|carpet|bed/.test(type)) return 'fabric';
    if (/iron|gold|copper|metal|rail|hopper/.test(type)) return 'metal';
    if (/grass|fern|flower|sapling|vine|bush/.test(type)) return 'leaves';
    if (/^air$|cave_air|void_air/.test(type)) return 'air';
    return 'unknown';
  }
  const COLORS = {
    cobble:[124,126,125],stone:[131,136,138],bricks:[150,145,142],planks:[171,129,78],log:[103,77,52],
    leaves:[69,133,51],moss:[87,123,61],grass:[102,155,69],dirt:[120,88,58],sand:[210,189,133],
    snow:[219,230,229],hay:[209,175,68],glass:[167,209,218],water:[55,126,206],lava:[229,109,37],
    light:[240,181,73],fabric:[157,109,102],metal:[153,161,168],unknown:[214,67,185],air:[0,0,0]
  };
  function colorFor(type, face = 'side') {
    const t = String(type).replace(/^minecraft:/, ''); let kind=styleOf(t), rgb=COLORS[kind]||COLORS.unknown;
    if (/spruce|dark_oak/.test(t) && (kind==='planks'||kind==='log')) rgb=[113,80,52];
    if (/birch|bamboo|sandstone/.test(t) && (kind==='planks'||kind==='log')) rgb=[210,188,133];
    if (/cherry/.test(t) && (kind==='planks'||kind==='log')) rgb=[188,135,132];
    if (/mangrove|crimson|red_nether/.test(t) && (kind==='planks'||kind==='log')) rgb=[135,67,65];
    if (/warped/.test(t) && (kind==='planks'||kind==='log')) rgb=[52,135,127];
    if (/deepslate|blackstone/.test(t)) rgb=[71,76,81];
    if (/mossy/.test(t)) rgb=[99,127,92];
    if (/red_sand/.test(t)) rgb=[191,109,69];
    if (/quartz|snow|white_/.test(t) && kind!=='unknown') rgb=[225,225,219];
    if (/red_wool|red_concrete/.test(t)) rgb=[168,57,57];
    if (/blue_wool|blue_concrete/.test(t)) rgb=[68,91,175];
    if (/green_wool|green_concrete/.test(t)) rgb=[75,128,69];
    if (/yellow_wool|yellow_concrete/.test(t)) rgb=[216,173,66];
    if (/oak_leaves/.test(t)) rgb=[81,142,59];
    if (kind==='grass'&&face==='top') rgb=[93,168,68];
    if (kind==='grass'&&face!=='top') rgb=[121,92,65];
    if (kind==='log'&&face==='top') rgb=rgb.map((n,i)=>Math.min(255,n+[55,46,33][i]));
    return rgb;
  }
  function tint(rgb, delta) { return rgb.map(x=>mathClamp(Math.round(x+delta),0,255)); }
  function tile(type, face = 'side') {
    if (typeof document==='undefined') return null;
    const key=type+'|'+face;
    if (tileCache.has(key)) return tileCache.get(key);
    const c=document.createElement('canvas');c.width=c.height=16;
    const ctx=c.getContext('2d');if(!ctx)return null;
    const img=ctx.createImageData(16,16),style=styleOf(type),base=colorFor(type,face),seed=hashText(type);
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){
      const n=hash(x,y,seed)%37-18;let d=n*.62;
      if(style==='planks'){d=(Math.floor(y/4)%2?-6:8)+(y%4===0?-28:0)+(hash(Math.floor(x/3),y,seed)%11-5);}
      if(style==='bricks'){const row=Math.floor(y/4), xx=(x+(row%2)*4)%8;d=y%4===0||xx===0?-37:Math.floor((hash(Math.floor(x/3),Math.floor(y/3),seed)%27)-12);}
      if(style==='cobble'){const row=Math.floor(y/5),xx=(x+(row%2)*3)%6;d=(y%5===0||xx===0)?-39:(hash(Math.floor(x/4),Math.floor(y/4),seed)%39-18);}
      if(style==='log'){if(face==='top'){const ring=Math.floor(Math.max(Math.abs(x-7.5),Math.abs(y-7.5))/2);d=(ring%2===0?17:-25)+n*.2;}else{d=x%5===0?-28:((Math.floor(x/2)%2)?6:-7)+n*.5;}}
      if(style==='grass'&&face==='side'&&y<3){const leafy=[97,163,68];for(let k=0;k<3;k++)img.data[(y*16+x)*4+k]=mathClamp(leafy[k]+n,0,255);img.data[(y*16+x)*4+3]=255;continue;}
      if(style==='leaves'){d=(hash(Math.floor(x/2),Math.floor(y/2),seed)%65)-30;}
      if(style==='sand'||style==='fabric'){d=n*.37;}
      if(style==='metal'){d=x%5===0?-23:(y%5===0?-14:n*.25);}
      if(style==='light'){d=(x>3&&x<12&&y>3&&y<12?48:-17)+n*.4;}
      if(style==='glass'){d=(x<2||x>13||y<2||y>13)?-5:12;}
      if(style==='water'){d=(y%4===0?-14:9)+n*.4;}
      if(style==='unknown'){d=(Math.floor(x/4)+Math.floor(y/4))%2===0?-55:40;}
      const k=(y*16+x)*4;for(let i=0;i<3;i++)img.data[k+i]=mathClamp(base[i]+d,0,255);
      img.data[k+3]=style==='glass'?((x<2||x>13||y<2||y>13)?230:65):style==='water'?195:255;
    }
    ctx.putImageData(img,0,0);tileCache.set(key,c);return c;
  }
  const box=(x0,y0,z0,x1,y1,z1)=>({x0,y0,z0,x1,y1,z1});
  function rotatedBox(shape,angle){
    if(!angle) return shape;
    const corners=[[shape.x0,shape.z0],[shape.x0,shape.z1],[shape.x1,shape.z0],[shape.x1,shape.z1]].map(([x,z])=>{
      let a=x-.5,b=z-.5;for(let i=0;i<angle;i++)[a,b]=[-b,a];return [a+.5,b+.5];});
    return box(Math.min(...corners.map(c=>c[0])),shape.y0,Math.min(...corners.map(c=>c[1])),Math.max(...corners.map(c=>c[0])),shape.y1,Math.max(...corners.map(c=>c[1])));
  }
  function facingTurn(facing){return ({north:0,east:1,south:2,west:3})[facing]||0;}
  function modelFor(block){
    const type=rawName(block),props=parseProperties(block),full=[box(0,0,0,1,1,1)];
    if(type==='air'||type==='cave_air'||type==='void_air')return [];
    if(/_stairs$/.test(type)){
      const upper=props.half==='top',rot=facingTurn(props.facing);
      const pieces=[upper?box(0,.5,0,1,1,1):box(0,0,0,1,.5,1)];
      const y0=upper?0:.5,y1=upper?.5:1;
      if(props.shape?.startsWith('outer')) pieces.push(box(0,y0,.5,.5,y1,1));
      else if(props.shape?.startsWith('inner'))pieces.push(box(0,y0,.5,1,y1,1),box(0,y0,0,.5,y1,.5));
      else pieces.push(box(0,y0,.5,1,y1,1));
      return pieces.map(p=>rotatedBox(p,rot));
    }
    if(/_slab$/.test(type)){if(props.type==='double')return full;return [props.type==='top'?box(0,.5,0,1,1,1):box(0,0,0,1,.5,1)];}
    if(/_carpet$/.test(type))return [box(0,0,0,1,.0625,1)];
    if(/_bed$/.test(type))return [box(0,.19,0,1,.56,1)];
    if(/_fence$/.test(type)||type==='iron_bars'||/_wall$/.test(type)){
      const railHeight=type==='iron_bars'?.94:.78,parts=[box(.36,0,.36,.64,1,.64)];
      for(const [dir,on] of [['north',box(.4,.34,0,.6,railHeight,.5)],['south',box(.4,.34,.5,.6,railHeight,1)],['west',box(0,.34,.4,.5,railHeight,.6)],['east',box(.5,.34,.4,1,railHeight,.6)]]) if(props[dir]==='true'||(!('north' in props)&&!('south' in props)&&!('east' in props)&&!('west' in props)))parts.push(on);
      return parts;
    }
    if(/_pane$/.test(type)){
      const parts=[box(.44,0,.44,.56,1,.56)];
      for(const [dir,on] of [['north',box(.44,0,0,.56,1,.5)],['south',box(.44,0,.5,.56,1,1)],['west',box(0,0,.44,.5,1,.56)],['east',box(.5,0,.44,1,1,.56)]]) if(props[dir]==='true'||Object.keys(props).length===0)parts.push(on);
      return parts;
    }
    if(/_door$/.test(type)){
      const angle=(facingTurn(props.facing)+(props.open==='true'?(props.hinge==='right'?3:1):0))%4;
      return [rotatedBox(box(0,0,.05,1,1,.24),angle)];
    }
    if(/_trapdoor$/.test(type)){
      if(props.open==='true')return [rotatedBox(box(0,0,.03,1,1,.21),facingTurn(props.facing))];
      return [props.half==='top'?box(0,.81,0,1,1,1):box(0,0,0,1,.19,1)];
    }
    if(/_log$|_stem$|_hyphae$/.test(type)){if(props.axis==='x')return [box(0,.15,.15,1,.85,.85)];if(props.axis==='z')return [box(.15,.15,0,.85,.85,1)];}
    if(/lantern/.test(type))return [box(.29,.12,.29,.71,.75,.71),box(.4,.75,.4,.6,.94,.6)];
    if(/torch|candle/.test(type))return [box(.39,0,.39,.61,.68,.61)];
    if(/_flower$|_sapling$|_bush$|_grass$|^fern$/.test(type))return [box(.41,0,.20,.59,.84,.80),box(.20,0,.41,.80,.84,.59)];
    if(type==='water'||type==='lava')return [box(0,0,0,1,props.level&&props.level!=='0'?.78:1,1)];
    return full;
  }
  function isFullCube(block){const type=rawName(block);return modelFor(block).length===1 && Object.values(modelFor(block)[0]).every(v=>v===0||v===1) && styleOf(type)!=='glass'&&styleOf(type)!=='water'&&styleOf(type)!=='leaves';}
  function makeProject(width,height,build,opts={}){
    const yaw=opts.yaw??PI/4, pitch=mathClamp(opts.pitch??0.56,.20,1.35),zoom=mathClamp(opts.zoom??1,.45,3);
    const blocks=build.blocks||[];
    const maxY=build.height||Math.max(1,...blocks.map(b=>b.y+1));
    const spanX=build.width||Math.max(1,...blocks.map(b=>b.x+1));
    const spanZ=build.depth||Math.max(1,...blocks.map(b=>b.z+1));
    const center={x:spanX/2,y:maxY/2,z:spanZ/2};
    function unit(x,y,z){const a=x-center.x,c=z-center.z,b=y-center.y;return {x:a*Math.cos(yaw)-c*Math.sin(yaw),y:(a*Math.sin(yaw)+c*Math.cos(yaw))*Math.sin(pitch)-b*Math.cos(pitch)};}
    const corners=[];for(let x of [0,spanX])for(let y of [0,maxY])for(let z of [0,spanZ])corners.push(unit(x,y,z));
    const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x));
    const minScreenY=Math.min(...corners.map(p=>p.y)),maxScreenY=Math.max(...corners.map(p=>p.y));
    const scale=mathClamp(Math.min((width*.81)/Math.max(1,maxX-minX),(height*.73)/Math.max(1,maxScreenY-minScreenY))*zoom,1,125);
    const ox=width/2-(minX+maxX)*scale/2,oy=height*.54-(minScreenY+maxScreenY)*scale/2;
    return {project:(x,y,z)=>{const p=unit(x,y,z);return {x:p.x*scale+ox,y:p.y*scale+oy};},depth:(x,y,z)=>(x-center.x)*Math.sin(yaw)*Math.cos(pitch)+(z-center.z)*Math.cos(yaw)*Math.cos(pitch)+(y-center.y)*Math.sin(pitch),scale,yaw,pitch};
  }
  const FACES=[
    {id:'top',normal:[0,1,0],pts:s=>[[s.x0,s.y1,s.z0],[s.x1,s.y1,s.z0],[s.x1,s.y1,s.z1],[s.x0,s.y1,s.z1]]},
    {id:'bottom',normal:[0,-1,0],pts:s=>[[s.x0,s.y0,s.z0],[s.x0,s.y0,s.z1],[s.x1,s.y0,s.z1],[s.x1,s.y0,s.z0]]},
    {id:'east',normal:[1,0,0],pts:s=>[[s.x1,s.y0,s.z0],[s.x1,s.y0,s.z1],[s.x1,s.y1,s.z1],[s.x1,s.y1,s.z0]]},
    {id:'west',normal:[-1,0,0],pts:s=>[[s.x0,s.y0,s.z1],[s.x0,s.y0,s.z0],[s.x0,s.y1,s.z0],[s.x0,s.y1,s.z1]]},
    {id:'south',normal:[0,0,1],pts:s=>[[s.x1,s.y0,s.z1],[s.x0,s.y0,s.z1],[s.x0,s.y1,s.z1],[s.x1,s.y1,s.z1]]},
    {id:'north',normal:[0,0,-1],pts:s=>[[s.x0,s.y0,s.z0],[s.x1,s.y0,s.z0],[s.x1,s.y1,s.z0],[s.x0,s.y1,s.z0]]}
  ];
  function polygon(ctx,pts,stroke=null,lw=1){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
  function faceVisible(face,yaw,pitch){const n=face.normal;return n[0]*Math.sin(yaw)*Math.cos(pitch)+n[2]*Math.cos(yaw)*Math.cos(pitch)+n[1]*Math.sin(pitch)>0.01;}
  function faceShade(id){return id==='top'?0:id==='east'||id==='west'?0.15:0.26;}
  function drawTextureFace(ctx,poly,type,id){
    polygon(ctx,poly);ctx.save();ctx.clip();const texture=tile(type,id==='top'?'top':'side');
    if(texture){ctx.transform((poly[1].x-poly[0].x)/16,(poly[1].y-poly[0].y)/16,(poly[3].x-poly[0].x)/16,(poly[3].y-poly[0].y)/16,poly[0].x,poly[0].y);ctx.imageSmoothingEnabled=false;ctx.drawImage(texture,0,0,16,16);}
    ctx.restore();const darkness=faceShade(id);
    if(darkness){polygon(ctx,poly);ctx.fillStyle=`rgba(23,28,31,${darkness})`;ctx.fill();}
    polygon(ctx,poly,'rgba(17,28,24,.16)',.45);
  }
  function drawOutline(ctx,block,project,scale,yaw,pitch){
    const x=block.x,y=block.y,z=block.z;
    const all=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]].map(([a,b,c])=>project(x+a,y+b,z+c));
    const faceSets=[
      {face:FACES[0],ids:[2,3,7,6]},
      {face:FACES[2],ids:[1,5,7,3]},
      {face:FACES[3],ids:[4,0,2,6]},
      {face:FACES[4],ids:[5,4,6,7]},
      {face:FACES[5],ids:[0,1,3,2]}
    ];
    const dedup=new Set(),edges=[];
    for(const entry of faceSets){if(!faceVisible(entry.face,yaw,pitch))continue;
      for(let i=0;i<4;i++){const a=entry.ids[i],b=entry.ids[(i+1)%4];const key=[a,b].sort((x,y)=>x-y).join('-');if(!dedup.has(key)){dedup.add(key);edges.push([a,b]);}}}
    // Fall back to all edges if camera is nearly edge-on.
    if(!edges.length)edges.push([0,1],[0,2],[0,4]);
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    for(const [i,j] of edges){ctx.beginPath();ctx.moveTo(all[i].x,all[i].y);ctx.lineTo(all[j].x,all[j].y);ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=Math.max(2.4,Math.min(5,scale*.13));ctx.stroke();ctx.strokeStyle='#ed3537';ctx.lineWidth=Math.max(1.35,Math.min(3,scale*.073));ctx.stroke();}
    ctx.restore();
  }
  function draw(canvas,build,opts={}){
    if(!canvas||!build||!canvas.getContext)return {rendered:0};
    const ctx=canvas.getContext('2d');if(!ctx)return {rendered:0};
    const rect=canvas.getBoundingClientRect(),w=opts.icon?48:Math.max(1,rect.width),h=opts.icon?48:Math.max(1,rect.height);
    if(!opts.icon&&(w<4||h<4))return {rendered:0};
    const ratio=opts.icon?1:mathClamp(window.devicePixelRatio||1,1,2);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.imageSmoothingEnabled=false;
    if(!opts.transparent){
      const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#c8e1e9');grad.addColorStop(.64,'#e5edf0');grad.addColorStop(.641,'#b9d39b');grad.addColorStop(1,'#82a974');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    }else{ctx.clearRect(0,0,w,h);}
    const {project,depth,scale,yaw,pitch}=makeProject(w,h,build,{yaw:opts.yaw,pitch:opts.pitch,zoom:opts.icon?1.45:opts.zoom});
    const blocks=opts.blocks||build.blocks, highlighted=opts.highlight||[];
    // Deliberate rendering budget keeps a malformed import from freezing mobile browsers.
    const limit=opts.icon?1:(opts.limit|| (w<350?1400:4000));
    const chosen=blocks.length>limit?blocks.filter((b,i)=>i%Math.ceil(blocks.length/limit)===0):blocks;
    if(!opts.transparent){const sx=build.width||1,sz=build.depth||1,grid=[];for(let a of [0,sx])for(let b of [0,sz])grid.push(project(a,-.02,b));
      ctx.beginPath();let p=project(0,-.03,0);ctx.moveTo(p.x,p.y);for(let [a,b] of [[sx,0],[sx,sz],[0,sz],[0,0]]){p=project(a,-.03,b);ctx.lineTo(p.x,p.y);}ctx.fillStyle='rgba(110,159,93,.45)';ctx.fill();ctx.strokeStyle='rgba(70,110,68,.45)';ctx.lineWidth=.8;ctx.stroke();
      if(sx<=32&&sz<=32) {ctx.strokeStyle='rgba(58,93,62,.15)';ctx.lineWidth=.5;for(let x=0;x<=sx;x++){const a=project(x,0,0),b=project(x,0,sz);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}for(let z=0;z<=sz;z++){const a=project(0,0,z),b=project(sx,0,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}
    const faces=[];
    const chosenFull=new Set(chosen.filter(isFullCube).map(b=>`${b.x}|${b.y}|${b.z}`));
    const opaqueDirs={east:[1,0,0],west:[-1,0,0],top:[0,1,0],bottom:[0,-1,0],north:[0,0,-1],south:[0,0,1]};
    for(const b of chosen){const type=rawName(b),geoms=modelFor(b),isOpaque=isFullCube(b),isSeeThrough=['glass','water','leaves'].includes(styleOf(type));
      for(const part of geoms)for(const f of FACES){
        if(!faceVisible(f,yaw,pitch))continue;
        const direction=opaqueDirs[f.id];if(isOpaque&&!isSeeThrough&&chosenFull.has(`${b.x+direction[0]}|${b.y+direction[1]}|${b.z+direction[2]}`))continue;
        const coordinates=f.pts(part).map(v=>[v[0]+b.x,v[1]+b.y,v[2]+b.z]);
        const avg=coordinates.reduce((a,c)=>{a[0]+=c[0];a[1]+=c[1];a[2]+=c[2];return a;},[0,0,0]).map(x=>x/4);
        faces.push({poly:coordinates.map(p=>project(...p)),depth:depth(...avg),type,id:f.id,alpha:isSeeThrough?.67:1});
      }
    }
    faces.sort((a,b)=>a.depth-b.depth);
    for(const f of faces){ctx.globalAlpha=f.alpha;drawTextureFace(ctx,f.poly,f.type,f.id);}ctx.globalAlpha=1;
    // Highlight is generated from the precise integer voxel coordinates, never AI image analysis.
    for(const b of highlighted.slice(0,64))drawOutline(ctx,b,project,scale,yaw,pitch);
    if(chosen.length<blocks.length&&!opts.icon){ctx.font='600 11px system-ui,sans-serif';ctx.fillStyle='#243328';ctx.fillText(`Vorschau reduziert: ${chosen.length}/${blocks.length} Blöcke`,11,h-15);}
    if(!opts.icon&&!opts.hideBadge&&opts.context!=='guide'){ctx.fillStyle='rgba(255,255,255,.84)';ctx.fillRect(9,h-29,Math.min(w-18,160),20);ctx.fillStyle='#385343';ctx.font='800 10px system-ui,sans-serif';ctx.fillText('CRAFTSTEPS · PIXEL MODEL',15,h-15);}
    return {rendered:chosen.length,faces:faces.length};
  }
  function drawIcon(canvas,type){const b={type,blockId:type,properties:{},x:0,y:0,z:0},build={blocks:[b],width:1,depth:1,height:1};return draw(canvas,build,{icon:true,transparent:true,hideBadge:true});}
  function drawIcons(scope){if(typeof document==='undefined')return;for(const el of (scope||document).querySelectorAll('canvas[data-mat-icon]'))drawIcon(el,el.dataset.matIcon);}
  return {styleOf,colorFor,modelFor,parseProperties,draw,drawIcon,drawIcons,tile};
});