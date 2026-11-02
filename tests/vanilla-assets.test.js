const test=require('node:test');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const {ZipArchive,AssetManager,chooseVariants,testWhen,resolveTexture,defaultUV}=require('../vanilla-assets.js');
function zip(files){
 let chunks=[],records=[],offset=0;
 for(const [name,value] of Object.entries(files)){
   const original=Buffer.isBuffer(value)?value:Buffer.from(value,'utf8');
   const compressed=zlib.deflateRawSync(original);const path=Buffer.from(name,'utf8');
   const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(8,8);header.writeUInt32LE(0,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(original.length,22);header.writeUInt16LE(path.length,26);
   const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(8,10);central.writeUInt32LE(0,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(original.length,24);central.writeUInt16LE(path.length,28);central.writeUInt32LE(offset,42);
   chunks.push(header,path,compressed);records.push(central,path);offset+=header.length+path.length+compressed.length;
 }
 const directory=Buffer.concat(records);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(Object.keys(files).length,8);end.writeUInt16LE(Object.keys(files).length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
 return new File([Buffer.concat([...chunks,directory,end])],'1.21.1.jar',{type:'application/java-archive'});
}
const stem='assets/minecraft/';
const json=x=>JSON.stringify(x);
function assetFile(){return zip({
 [stem+'blockstates/stone.json']:json({variants:{'':{model:'minecraft:block/stone'}}}),
 [stem+'models/block/stone.json']:json({parent:'minecraft:block/cube_all',textures:{all:'minecraft:block/stone'}}),
 [stem+'models/block/cube_all.json']:json({textures:{},elements:[{from:[0,0,0],to:[16,16,16],faces:Object.fromEntries(['north','south','east','west','up','down'].map(f=>[f,{texture:'#all'}]))}]}),
 [stem+'textures/block/stone.png']:Buffer.from('PNG owned by unit test (not a Mojang texture)'),
 [stem+'blockstates/oak_stairs.json']:json({variants:{'facing=north,half=bottom':{model:'minecraft:block/oak_stairs'},'facing=south,half=bottom':{model:'minecraft:block/oak_stairs',y:180}}}),
 [stem+'models/block/oak_stairs.json']:json({textures:{all:'minecraft:block/oak_planks'},elements:[{from:[0,0,0],to:[16,8,16],faces:{up:{texture:'#all'},north:{texture:'#all'}}}]}),
 [stem+'textures/block/oak_planks.png']:Buffer.from('PNG from test'),
 });}
test('ZIP index validates a complete Java archive and inflates deflate-raw entries',async()=>{const archive=await ZipArchive.open(assetFile());assert.ok(archive.has(stem+'textures/block/stone.png'));const json=await archive.json(stem+'blockstates/stone.json');assert.equal(json.variants[''].model,'minecraft:block/stone');});
test('ZIP import rejects incomplete or oversized / malformed archives',async()=>{await assert.rejects(ZipArchive.open(zip({'not-minecraft/readme.txt':'x'})),/Vanilla-Java-Assets/);await assert.rejects(ZipArchive.open(new File(['invalid'],'x.jar')),/ZIP-Archiv|Ungültige Datei/);});
test('blockstate variants use current property values and honor multiparts',()=>{const variants={variants:{'facing=north,half=top':{model:'a'},'facing=north,half=bottom':{model:'b'},'':{model:'base'}},multipart:[{when:{facing:'north|east'},apply:{model:'overlay'}}]};assert.deepEqual(chooseVariants(variants,{facing:'north',half:'bottom'}).map(v=>v.model),['b','overlay']);assert.equal(testWhen({OR:[{facing:'south'},{facing:'north'}]},{facing:'north'}),true);});
test('weighted model alternatives are deterministic and preserve vanilla weights',()=>{const spec={variants:{'':[{model:'rare',weight:1},{model:'common',weight:3}]}};assert.equal(chooseVariants(spec,{},'2')[0].model,'rare');assert.equal(chooseVariants(spec,{},'3')[0].model,'common');assert.deepEqual(chooseVariants(spec,{},'3'),chooseVariants(spec,{},'3'));});
test('vanilla texture references are constrained to asset namespace',()=>{assert.equal(resolveTexture('#all',{all:'minecraft:block/stone'}),stem+'textures/block/stone.png');assert.equal(resolveTexture('#loop',{loop:'#loop'}),null);assert.equal(resolveTexture('../evil',{}),null);});
test('implicit face UVs follow the Java block-model coordinate rules',()=>{assert.deepEqual(defaultUV('up',[2,3,4],[14,11,12]),[2,4,14,12]);assert.deepEqual(defaultUV('north',[2,3,4],[14,11,12]),[2,5,14,13]);assert.deepEqual(defaultUV('east',[2,3,4],[14,11,12]),[4,5,12,13]);});
test('real model JSON and PNGs load from the local archive without a texture generator',async()=>{
 const manager=new AssetManager(),previous=globalThis.createImageBitmap;
 globalThis.createImageBitmap=async blob=>({width:16,height:16,testBytes:Buffer.from(await blob.arrayBuffer()).toString()});
 try{await manager.load(assetFile(),{persist:false});await manager.ensure([{type:'stone',x:0,y:0,z:0},{type:'oak_stairs',blockId:'minecraft:oak_stairs',properties:{facing:'south',half:'bottom'},x:1,y:0,z:0}]);const stone=manager.get({type:'stone',x:0,y:0,z:0});assert.equal(stone.length,1);assert.equal(stone[0].elements[0].faces.up.image.testBytes,'PNG owned by unit test (not a Mojang texture)');const stairs=manager.get({type:'oak_stairs',properties:{facing:'south',half:'bottom'},x:1,y:0,z:0});assert.equal(stairs[0].rotation.y,180);assert.equal(stairs[0].elements[0].faces.north.image.testBytes,'PNG from test');}
 finally{globalThis.createImageBitmap=previous;}
});

test('demo block names resolve to actual vanilla models without fabricated textures',()=>{
 const {stateId}=require('../vanilla-assets.js');
 for(const [legacy,actual] of Object.entries({leaves:'oak_leaves',hay:'hay_block',moss:'moss_block',stone_slab:'stone_brick_slab'}))
   assert.equal(stateId({type:legacy}),actual);
 assert.equal(stateId({type:'stone_bricks'}),'stone_bricks');
 assert.equal(stateId({blockId:'minecraft:oak_planks',type:'oak_planks'}),'oak_planks');
});
