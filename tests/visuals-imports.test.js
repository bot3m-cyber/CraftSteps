const test=require('node:test');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const {parseLitematicBytes,parseLegacyBytes,parseBlueprintFile,draftFromParsed}=require('../schem.js');
const v=require('../block-visuals.js');
const core=require('../core.js');
const buf=n=>Buffer.from([n]);
const short=n=>{const b=Buffer.alloc(2);b.writeInt16BE(n);return b;};
const int=n=>{const b=Buffer.alloc(4);b.writeInt32BE(n);return b;};
const lng=n=>{const b=Buffer.alloc(8);b.writeBigInt64BE(BigInt(n));return b;};
const str=s=>Buffer.concat([short(Buffer.byteLength(s)),Buffer.from(s)]);
const tag=(id,name,bytes)=>Buffer.concat([buf(id),str(name),bytes]);
const byteArray=(name,bytes)=>tag(7,name,Buffer.concat([int(bytes.length),Buffer.from(bytes)]));
const stringTag=(name,val)=>tag(8,name,str(val));
const intTag=(name,val)=>tag(3,name,int(val));
const shortTag=(name,val)=>tag(2,name,short(val));
const longArray=(name,values)=>tag(12,name,Buffer.concat([int(values.length),...values.map(lng)]));
const compound=(name,children)=>tag(10,name,Buffer.concat([...children,buf(0)]));
const list=(name,type,values)=>tag(9,name,Buffer.concat([buf(type),int(values.length),...values]));
const payloadCompound=children=>Buffer.concat([...children,buf(0)]);
const root=children=>Buffer.concat([buf(10),str(''),...children,buf(0)]);
function sampleLitematic(negative=false){const s=negative?-2:2,p=negative?-3:0;
  const blocks=longArray('BlockStates',[85n]); // four 2-bit palette entries: [1,1,1,1]
  const palette=list('BlockStatePalette',10,[
    payloadCompound([stringTag('Name','minecraft:air')]),
    payloadCompound([stringTag('Name','minecraft:oak_stairs'),compound('Properties',[stringTag('facing','east'),stringTag('half','top')])])]);
  const region=compound('room',[compound('Position',[intTag('X',p),intTag('Y',0),intTag('Z',0)]),compound('Size',[intTag('X',s),intTag('Y',1),intTag('Z',2)]),palette,blocks]);
  return root([intTag('Version',6),intTag('MinecraftDataVersion',3465),compound('Regions',[region])]);
}
function sampleLegacy(id=53){return root([shortTag('Width',2),shortTag('Height',1),shortTag('Length',2),stringTag('Materials','Alpha'),byteArray('Blocks',[1,0,5,id]),byteArray('Data',[0,0,0,4])]);}
test('Litematica palette, BlockStates, properties and 3D coordinates',()=>{
  const s=parseLitematicBytes(sampleLitematic());assert.equal(s.blocks.length,4);
  assert.equal(s.width,2);assert.equal(s.height,1);assert.equal(s.length,2);
  assert.deepEqual(s.blocks.map(b=>[b.x,b.y,b.z]),[[0,0,0],[1,0,0],[0,0,1],[1,0,1]]);
  assert.equal(s.blocks[0].blockState,'minecraft:oak_stairs[facing=east,half=top]');
  const d=draftFromParsed(s,'Treppen');assert.ok(core.validateBuild(d).valid);
  assert.equal(d.blocks[0].properties.half,'top');
});
test('negative Litematica region positions normalized',()=>{
  const s=parseLitematicBytes(sampleLitematic(true));
  assert.equal(s.width,2);assert.deepEqual(s.blocks.map(b=>b.x),[1,0,1,0]);
});
test('reject malformed and oversized Litematica data',()=>{
  assert.throws(()=>parseLitematicBytes(Buffer.from('bad')),/NBT/);
  const t=root([compound('Regions',[compound('room',[compound('Position',[intTag('X',0),intTag('Y',0),intTag('Z',0)]),compound('Size',[intTag('X',250),intTag('Y',250),intTag('Z',1)]),list('BlockStatePalette',10,[payloadCompound([stringTag('Name','minecraft:stone')])]),longArray('BlockStates',[0n])])])]);
  assert.throws(()=>parseLitematicBytes(t),/zu groß/);
});
test('legacy .schematic maps known IDs but marks unknown IDs clearly',()=>{
  const s=parseLegacyBytes(sampleLegacy());assert.equal(s.blocks.length,3);
  assert.equal(s.blocks[2].type,'oak_stairs');assert.equal(s.blocks[2].properties.half,'top');
  const unknown=parseLegacyBytes(sampleLegacy(212));assert.ok(unknown.warnings.some(x=>x.includes('212')));
  assert.equal(unknown.blocks[2].type,'unknown_legacy_212');
});
test('file input routes gzip .litematic and compressed .schematic',async()=>{
  const file1=new File([zlib.gzipSync(sampleLitematic())],'room.litematic');
  assert.equal((await parseBlueprintFile(file1)).format,'Litematica .litematic');
  const file2=new File([zlib.gzipSync(sampleLegacy())],'legacy.schematic');
  assert.equal((await parseBlueprintFile(file2)).format,'Legacy .schematic');
  await assert.rejects(()=>parseBlueprintFile(new File([Buffer.from('abc')],'bad.zip')),/Unterstützt/);
});
test('minecraft-state visual models: stairs, slabs, doors and fence connections',()=>{
  assert.equal(v.styleOf('minecraft:stone_bricks'),'bricks');
  assert.equal(v.styleOf('minecraft:oak_planks'),'planks');
  assert.equal(v.styleOf('minecraft:unlikely_mod_block'),'unknown');
  const stairs=v.modelFor({type:'oak_stairs',properties:{facing:'west',half:'top'}});
  assert.equal(stairs.length,2);assert.ok(stairs.some(b=>b.y0===0&&b.y1===.5));
  assert.deepEqual(v.modelFor({type:'stone_slab',properties:{type:'top'}})[0].y0,.5);
  const doorNorth=v.modelFor({type:'oak_door',properties:{facing:'north'}})[0];
  const doorEast=v.modelFor({type:'oak_door',properties:{facing:'east'}})[0];
  assert.notDeepEqual(doorNorth,doorEast);
  const fence=v.modelFor({type:'oak_fence',properties:{north:'true',east:'false',south:'false',west:'false'}});
  assert.equal(fence.length,2);
});
test('the renderer draws actual geometry and projected current-step outlines',()=>{
  const ctx={strokeCount:0,beginPath(){},moveTo(){},lineTo(){},closePath(){},save(){},restore(){},clip(){},fill(){},stroke(){this.strokeCount++},clearRect(){},fillRect(){},transform(){},setTransform(){},fillText(){},createLinearGradient(){return {addColorStop(){}}}};
  const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({width:360,height:260})};
  global.window={devicePixelRatio:1};
  const build={width:2,depth:1,height:2,blocks:[{x:0,y:0,z:0,type:'oak_stairs',properties:{facing:'east'}},{x:1,y:0,z:0,type:'stone_bricks'}]};
  const result=v.draw(canvas,build,{highlight:[build.blocks[0]],context:'guide'});
  assert.equal(result.rendered,2);assert.ok(result.faces>=2);assert.ok(ctx.strokeCount>=12);
  delete global.window;
});
