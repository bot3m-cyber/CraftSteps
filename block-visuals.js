/* CraftSteps Visuals v0.4 — official vanilla assets are read ONLY from a user-selected local Java client JAR.
 * The project does not distribute any Mojang textures. Missing assets are neutral placeholders.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CraftStepsVisuals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const assets = () => (typeof globalThis !== 'undefined' ? globalThis.CraftStepsAssets?.manager : null);
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
  // Legacy semantic function retained for compatibility, never used as a substitute for texture pixels.
  function colorFor(){return [145,151,155];}
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
  // Camera bounds come from real block coordinates, never from image analysis.
  function boundsFor(blocks){
    if(!Array.isArray(blocks)||!blocks.length)return null;
    const result={minX:Infinity,minY:Infinity,minZ:Infinity,maxX:-Infinity,maxY:-Infinity,maxZ:-Infinity};
    for(const b of blocks){
      if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(b.z))continue;
      result.minX=Math.min(result.minX,b.x);result.minY=Math.min(result.minY,b.y);result.minZ=Math.min(result.minZ,b.z);
      result.maxX=Math.max(result.maxX,b.x+1);result.maxY=Math.max(result.maxY,b.y+1);result.maxZ=Math.max(result.maxZ,b.z+1);
    }
    return Number.isFinite(result.minX)?result:null;
  }
  function interpolateGuideCamera(from,to,t){
    const delta=Math.atan2(Math.sin(to.yaw-from.yaw),Math.cos(to.yaw-from.yaw));
    const bounds={};
    for(const key of Object.keys(to.bounds))bounds[key]=from.bounds[key]+(to.bounds[key]-from.bounds[key])*t;
    return {yaw:from.yaw+delta*t,pitch:from.pitch+(to.pitch-from.pitch)*t,bounds};
  }
  function makeProject(width,height,build,opts={}){
    // Negative elevation lets the user view the underside of a platform.
    const yaw=opts.yaw??PI/4,pitch=mathClamp(opts.pitch??.56,-1.42,1.42),zoom=mathClamp(opts.zoom??1,.45,3);
    const blocks=build.blocks||[];
    const maxY=build.height||Math.max(1,...blocks.map(b=>b.y+1));
    const spanX=build.width||Math.max(1,...blocks.map(b=>b.x+1));
    const spanZ=build.depth||Math.max(1,...blocks.map(b=>b.z+1));
    let focus=opts.cameraBounds||boundsFor(opts.focus);
    const nextFocus=focus;
    const previous=boundsFor(opts.fromFocus);
    // Interpolate the visible step bounds, so the camera glides rather than jumping.
    if(focus&&previous){
      const t=mathClamp(Number.isFinite(opts.focusBlend)?opts.focusBlend:1,0,1);
      if(t<1){
        focus={};
        for(const key of ['minX','minY','minZ','maxX','maxY','maxZ'])
          focus[key]=previous[key]+(nextFocus[key]-previous[key])*t;
      }
    }
    const pad=focus ? 0.75 : 0;
    const frame=focus?{
      minX:focus.minX-pad,minY:focus.minY-pad,minZ:focus.minZ-pad,
      maxX:focus.maxX+pad,maxY:focus.maxY+pad,maxZ:focus.maxZ+pad
    }:{minX:0,minY:0,minZ:0,maxX:spanX,maxY:maxY,maxZ:spanZ};
    const center={x:(frame.minX+frame.maxX)/2,y:(frame.minY+frame.maxY)/2,z:(frame.minZ+frame.maxZ)/2};
    function unit(x,y,z){
      const a=x-center.x,c=z-center.z,b=y-center.y;
      return {x:a*Math.cos(yaw)-c*Math.sin(yaw),y:(a*Math.sin(yaw)+c*Math.cos(yaw))*Math.sin(pitch)-b*Math.cos(pitch)};
    }
    const corners=[];
    for(const x of [frame.minX,frame.maxX])for(const y of [frame.minY,frame.maxY])for(const z of [frame.minZ,frame.maxZ])corners.push(unit(x,y,z));
    const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x));
    const minY=Math.min(...corners.map(p=>p.y)),maxScreenY=Math.max(...corners.map(p=>p.y));
    const scale=mathClamp(Math.min((width*.81)/Math.max(1,maxX-minX),(height*.72)/Math.max(1,maxScreenY-minY))*zoom,1,125);
    const ox=width/2-(minX+maxX)*scale/2,oy=height*.54-(minY+maxScreenY)*scale/2;
    return {
      project:(x,y,z)=>{const p=unit(x,y,z);return {x:p.x*scale+ox,y:p.y*scale+oy};},
      depth:(x,y,z)=>(x-center.x)*Math.sin(yaw)*Math.cos(pitch)+(z-center.z)*Math.cos(yaw)*Math.cos(pitch)+(y-center.y)*Math.sin(pitch),
      scale,yaw,pitch,center,focused:!!focus
    };
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
  const PLACEHOLDER_FACE={top:'#dfe4e1',bottom:'#89928e',east:'#aeb7b3',west:'#a3aca8',south:'#929c97',north:'#98a29d'};
  // Source image is an actual PNG decoded from the player's own Minecraft client JAR.
  // Java UV values are in a 16x16 coordinate system even when PNG resolution is higher.
  function drawTextureFace(ctx,poly,texture,faceId){
    if(!texture?.image){
      // A deliberately plain, opaque geometry marker. It is never presented as a Minecraft texture.
      polygon(ctx,poly);ctx.fillStyle=PLACEHOLDER_FACE[faceId]||'#aab2ae';ctx.fill();
      polygon(ctx,poly,'rgba(35,46,41,.38)',.65);return;
    }
    polygon(ctx,poly);ctx.save();ctx.clip();
    const im=texture.image,uv=texture.uv||[0,0,16,16],unit=im.width/16;
    const x=Math.min(uv[0],uv[2])*unit,y=Math.min(uv[1],uv[3])*unit;
    const w=Math.abs(uv[2]-uv[0])*unit,h=Math.abs(uv[3]-uv[1])*unit;
    const mirrorU=uv[2]<uv[0],mirrorV=uv[3]<uv[1];
    if(w>0&&h>0){
      ctx.transform((poly[1].x-poly[0].x)/16,(poly[1].y-poly[0].y)/16,(poly[3].x-poly[0].x)/16,(poly[3].y-poly[0].y)/16,poly[0].x,poly[0].y);
      ctx.imageSmoothingEnabled=false;
      const rotation=((texture.rotation||0)%360+360)%360;
      if(rotation){ctx.translate(8,8);ctx.rotate(rotation*Math.PI/180);ctx.translate(-8,-8);}
      if(mirrorU||mirrorV){
        ctx.translate(mirrorU?16:0,mirrorV?16:0);
        ctx.scale(mirrorU?-1:1,mirrorV?-1:1);
      }
      ctx.drawImage(im,x,y,w,h,0,0,16,16);
    }else{ctx.fillStyle=PLACEHOLDER_FACE[faceId]||'#aab2ae';ctx.fill();}
    ctx.restore();
    const shade=faceShade(faceId);if(shade){polygon(ctx,poly);ctx.fillStyle=`rgba(23,28,31,${shade})`;ctx.fill();}
    polygon(ctx,poly,'rgba(17,28,24,.18)',.45);
  }
  const FACES_BY_NAME={up:FACES[0],down:FACES[1],east:FACES[2],west:FACES[3],south:FACES[4],north:FACES[5]};
  function rotatePoint(v,axis,degrees,origin){
    if(!degrees)return v;
    const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a),p=v.slice();
    if(axis==='x'){const y=v[1]-origin[1],z=v[2]-origin[2];p[1]=origin[1]+y*c-z*s;p[2]=origin[2]+y*s+z*c;}
    if(axis==='y'){const x=v[0]-origin[0],z=v[2]-origin[2];p[0]=origin[0]+x*c+z*s;p[2]=origin[2]-x*s+z*c;}
    if(axis==='z'){const x=v[0]-origin[0],y=v[1]-origin[1];p[0]=origin[0]+x*c-y*s;p[1]=origin[1]+x*s+y*c;}
    return p;
  }
  function assetFacesFor(block, modelGroup,project,depth,yaw,pitch,opaqueSet){
    const out=[];
    for(const model of modelGroup){
      for(const element of model.elements){
        const b=box(element.from[0]/16,element.from[1]/16,element.from[2]/16,element.to[0]/16,element.to[1]/16,element.to[2]/16);
        for(const [faceId,texture] of Object.entries(element.faces)){
          const face=FACES_BY_NAME[faceId];if(!face||!texture)continue;
          const corners=face.pts(b);
          // UVs start at the upper-left of a side face, before model rotations.
          const start=faceId==='up'?0:faceId==='down'?1:2;
          let vertices=corners.slice(start).concat(corners.slice(0,start)),normal=face.normal.slice();
          if(element.rotation){const origin=(element.rotation.origin||[8,8,8]).map(x=>x/16);
            vertices=vertices.map(v=>rotatePoint(v,element.rotation.axis,element.rotation.angle,origin));
            normal=rotatePoint(normal,element.rotation.axis,element.rotation.angle,[0,0,0]);}
          if(model.rotation.x){vertices=vertices.map(v=>rotatePoint(v,'x',model.rotation.x,[.5,.5,.5]));normal=rotatePoint(normal,'x',model.rotation.x,[0,0,0]);}
          if(model.rotation.y){vertices=vertices.map(v=>rotatePoint(v,'y',model.rotation.y,[.5,.5,.5]));normal=rotatePoint(normal,'y',model.rotation.y,[0,0,0]);}
          if(opaqueSet&&texture.cullface){let d={north:[0,0,-1],south:[0,0,1],east:[1,0,0],west:[-1,0,0],up:[0,1,0],down:[0,-1,0]}[texture.cullface];if(model.rotation.x)d=rotatePoint(d,'x',model.rotation.x,[0,0,0]);if(model.rotation.y)d=rotatePoint(d,'y',model.rotation.y,[0,0,0]);d=d?.map(n=>Math.round(n));if(d&&opaqueSet.has(`${block.x+d[0]}|${block.y+d[1]}|${block.z+d[2]}`))continue;}
          if(!faceVisible({normal},yaw,pitch))continue;
          const world=vertices.map(v=>[v[0]+block.x,v[1]+block.y,v[2]+block.z]);
          const avg=world.reduce((sum,v)=>sum.map((n,i)=>n+v[i]/4),[0,0,0]);
          const mapped=model.uvlock&&model.rotation.y?{...texture,rotation:(texture.rotation-model.rotation.y+360)%360}:texture;
          out.push({poly:world.map(p=>project(...p)),depth:depth(...avg),texture:mapped,id:face.id,alpha:1});
        }
      }
    }return out;
  }
  function drawFaceOutline(ctx,poly,scale,color){
    ctx.save();
    ctx.lineJoin='round';
    polygon(ctx,poly,'rgba(255,255,255,.92)',Math.max(1.15,Math.min(2.2,scale*.06)));
    polygon(ctx,poly,color,Math.max(.65,Math.min(1.4,scale*.037)));
    ctx.restore();
  }
  function textureMode(){const info=assets()?.info();return info?.ready?'vanilla':info?.status==='loading'?'loading':'missing';}
  function materialOutlineColors(blocks){
    const palette=['#e73752','#167ac9','#198648','#9939c0','#be5e0c','#0c8587'];
    const types=[...new Set(blocks.map(block=>typeof block==='string'?block: block.type || rawName(block)))];
    const outlineColors=new Map(types.map((type,i)=>[type,palette[i]||'hsl('+((i*137.508)%360).toFixed(3)+', 78%, '+(i%2?34:44)+'%)']));
    return outlineColors;
  }
  // All new blocks use the same eased placement curve, with a small stagger.
  function stepPlacement(reveal,index,total) {
    const t=mathClamp(Number.isFinite(reveal)?reveal:1,0,1);
    const delay=Math.max(0,index)/Math.max(1,total-1)*.42;
    const local=mathClamp((t-delay)/.58,0,1);
    return 1-Math.pow(1-local,3);
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
      if(opts.guideStage){ctx.fillStyle='#17181a';ctx.fillRect(0,0,w,h);}else{
      const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#c8e1e9');grad.addColorStop(.64,'#e5edf0');grad.addColorStop(.641,'#b9d39b');grad.addColorStop(1,'#82a974');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
      }
    }else{ctx.clearRect(0,0,w,h);}
    const {project,depth,scale,yaw,pitch}=makeProject(w,h,build,{yaw:opts.yaw,pitch:opts.pitch,zoom:opts.icon?1.45:opts.zoom,focus:opts.followStep?opts.highlight:null,fromFocus:opts.followStep?opts.fromHighlight:null,focusBlend:opts.cameraBlend,cameraBounds:opts.cameraBounds});
    const blocks=opts.blocks||build.blocks, highlighted=opts.highlight||[];
    // Deliberate rendering budget keeps a malformed import from freezing mobile browsers.
    const limit=opts.icon?1:(opts.limit|| (w<350?1400:4000));
    const chosenRaw=blocks.length>limit?blocks.filter((b,i)=>i%Math.ceil(blocks.length/limit)===0):blocks;
    const chosen=globalThis.CraftStepsAssets?.withContext?.(chosenRaw)||chosenRaw;
    const stepPositions=new Map(highlighted.map((b,index)=>[b.x+'|'+b.y+'|'+b.z,index]));
    const reveal=mathClamp(Number.isFinite(opts.stepReveal)?opts.stepReveal:1,0,1);
    if(!opts.transparent){const sx=build.width||1,sz=build.depth||1,grid=[];for(let a of [0,sx])for(let b of [0,sz])grid.push(project(a,-.02,b));
      ctx.beginPath();let p=project(0,-.03,0);ctx.moveTo(p.x,p.y);for(let [a,b] of [[sx,0],[sx,sz],[0,sz],[0,0]]){p=project(a,-.03,b);ctx.lineTo(p.x,p.y);}ctx.fillStyle=opts.guideStage?'#597e36':'rgba(110,159,93,.45)';ctx.fill();ctx.strokeStyle='rgba(70,110,68,.45)';ctx.lineWidth=.8;ctx.stroke();
      if(sx<=32&&sz<=32) {ctx.strokeStyle='rgba(58,93,62,.15)';ctx.lineWidth=.5;for(let x=0;x<=sx;x++){const a=project(x,0,0),b=project(x,0,sz);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}for(let z=0;z<=sz;z++){const a=project(0,0,z),b=project(sx,0,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}
    const faces=[];
    const manager=assets(),ready=!!manager?.info().ready;
    if(ready)void manager.ensure(chosen).catch(e=>console.warn('Vanilla assets:',e));
    const frameBlocks=chosen.filter(block=>{
      const index=stepPositions.get(`${block.x}|${block.y}|${block.z}`);
      return !opts.inPlaceReveal||index===undefined||reveal>=index/Math.max(1,highlighted.length)*.8;
    });
    const chosenFull=new Set(frameBlocks.filter(isFullCube).map(b=>`${b.x}|${b.y}|${b.z}`));
    const opaqueDirs={east:[1,0,0],west:[-1,0,0],top:[0,1,0],bottom:[0,-1,0],north:[0,0,-1],south:[0,0,1]};
    const outlineColors=opts.outlineColors||materialOutlineColors(highlighted);
    let missing=0;
    for(const b of frameBlocks){
      const index=stepPositions.get(b.x+'|'+b.y+'|'+b.z);
      const outline=index===undefined?null:outlineColors.get(b.type||rawName(b));
      const placement=opts.icon||index===undefined?1:stepPlacement(reveal,index,highlighted.length);
      const appearing=!opts.inPlaceReveal&&placement<1;
      const rendered=appearing?{...b,y:b.y+(1-placement)*.48}:b;
      const opacity=appearing?Math.max(.04,placement):1;
      const blockScale=appearing?.8+.2*placement:1;
      const blockProject=blockScale===1?project:(x,y,z)=>{
        const cx=rendered.x+.5,cy=rendered.y+.5,cz=rendered.z+.5;
        return project(cx+(x-cx)*blockScale,cy+(y-cy)*blockScale,cz+(z-cz)*blockScale);
      };
      const model=ready?manager.get(b):null;
      if(model?.length){
        const textured=assetFacesFor(rendered,model,blockProject,depth,yaw,pitch,chosenFull);
        for(const face of textured){face.alpha=opacity;face.outline=outline;}
        faces.push(...textured);continue;
      }
      missing++;
      // No fabricated textures. Neutral geometry only when a vanilla model is missing/loading.
      for(const part of modelFor(b))for(const f of FACES){
        if(!faceVisible(f,yaw,pitch))continue;
        const d=opaqueDirs[f.id],opaque=isFullCube(b);
        if(opaque&&chosenFull.has(`${b.x+d[0]}|${b.y+d[1]}|${b.z+d[2]}`))continue;
        const points=f.pts(part).map(v=>[v[0]+rendered.x,v[1]+rendered.y,v[2]+rendered.z]);
        const avg=points.reduce((sum,v)=>sum.map((n,i)=>n+v[i]/4),[0,0,0]);
        faces.push({poly:points.map(p=>blockProject(...p)),depth:depth(...avg),texture:null,type:rawName(b),id:f.id,alpha:opacity,outline});
      }
    }
    faces.sort((a,b)=>a.depth-b.depth);
    // Paint each outline with its face so closer blocks cover it naturally.
    for(const face of faces){
      ctx.globalAlpha=face.alpha;
      drawTextureFace(ctx,face.poly,face.texture,face.id);
      if(face.outline)drawFaceOutline(ctx,face.poly,scale,face.outline);
    }
    ctx.globalAlpha=1;
    if(!ready&&!opts.icon&&(opts.context==='guide'||opts.context==='hero')){
      // Do not disguise untextured placeholders as actual Minecraft blocks.
      const label='ORIGINALTEXTUREN NICHT GELADEN',sub='Minecraft-Java-Datei oben auswählen';
      ctx.save();ctx.font='bold 11px system-ui,sans-serif';const width=Math.min(w-20,Math.max(205,(typeof ctx.measureText==='function'?ctx.measureText(label).width:label.length*7)+24));
      ctx.fillStyle='rgba(19,30,26,.92)';ctx.fillRect(10,10,width,51);
      ctx.fillStyle='#fff';ctx.fillText(label,19,30);ctx.font='10px system-ui,sans-serif';ctx.fillStyle='#dfece3';ctx.fillText(sub,19,47);
      ctx.restore();
    }
    if(chosen.length<blocks.length&&!opts.icon){ctx.font='600 11px system-ui,sans-serif';ctx.fillStyle='#243328';ctx.fillText(`Vorschau reduziert: ${chosen.length}/${blocks.length} Blöcke`,11,h-15);}
    if(!opts.icon&&!opts.hideBadge&&opts.context!=='guide'){ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(9,h-29,Math.min(w-18,225),20);ctx.fillStyle='#385343';ctx.font='700 10px system-ui,sans-serif';ctx.fillText(ready?(missing?`VANILLA + PLATZHALTER (${missing} MODELLE)`:'VANILLA · ORIGINALTEXTUREN'):'KEINE ORIGINAL-ASSETS',15,h-15);}
    return {rendered:chosen.length,faces:faces.length,missing,vanilla:ready,placeholder:!ready||missing>0};
  }
  function drawIcon(canvas,type){
    if(textureMode()!=='vanilla'){
      // An honest missing-texture symbol, not a fabricated Minecraft item icon.
      const ctx=canvas?.getContext?.('2d');if(!ctx)return {rendered:0,placeholder:true};
      canvas.width=48;canvas.height=48;ctx.clearRect(0,0,48,48);ctx.fillStyle='#f3f5f4';ctx.fillRect(0,0,48,48);
      ctx.strokeStyle='#8d9b95';ctx.lineWidth=2;ctx.strokeRect(1,1,46,46);
      ctx.fillStyle='#45594d';ctx.font='bold 27px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('?',24,34);
      return {rendered:0,placeholder:true};
    }
    const b={type,blockId:type,properties:{},x:0,y:0,z:0},build={blocks:[b],width:1,depth:1,height:1};
    return draw(canvas,build,{icon:true,transparent:true,hideBadge:true});
  }
  function drawIcons(scope){if(typeof document==='undefined')return;for(const el of (scope||document).querySelectorAll('canvas[data-mat-icon]'))drawIcon(el,el.dataset.matIcon);}
  return {interpolateGuideCamera,materialOutlineColors,styleOf,colorFor,modelFor,parseProperties,draw,drawIcon,drawIcons,assetFacesFor,textureMode,boundsFor,makeProject,stepPlacement};
});
