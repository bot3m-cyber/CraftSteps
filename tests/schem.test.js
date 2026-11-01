const test=require('node:test');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const {parseSchemBytes,decodeVarints,draftFromParsed,parseSchemFile}=require('../schem.js');
const core=require('../core.js');
const u8=n=>Buffer.from([n]);
const short=n=>{let b=Buffer.alloc(2);b.writeInt16BE(n);return b;};
const int=n=>{let b=Buffer.alloc(4);b.writeInt32BE(n);return b;};
const str=s=>{let b=Buffer.from(s);return Buffer.concat([short(b.length),b]);};
const tag=(type,key,data)=>Buffer.concat([u8(type),str(key),data]);
const compound=(key,children)=>tag(10,key,Buffer.concat([...children,u8(0)]));
const intTag=(key,val)=>tag(3,key,int(val));
const shortTag=(key,val)=>tag(2,key,short(val));
const byteArray=(key,arr)=>tag(7,key,Buffer.concat([int(arr.length),Buffer.from(arr)]));
const palette=(key,entries)=>compound(key,Object.entries(entries).map(([k,n])=>intTag(k,n)));
const listTag=(key,tagId,elements)=>tag(9,key,Buffer.concat([u8(tagId),int(elements.length),...elements]));
const root=(parts)=>Buffer.concat([u8(10),str(''),...parts,u8(0)]);
function fixture(version,{paletteData=[1,0,1,2],extra=[],dims=[2,1,2],paletteValues={'minecraft:air':0,'minecraft:stone':1,'minecraft:oak_door[half=lower,facing=south]':2}}={}){
 const common=[intTag('Version',version),intTag('DataVersion',3465),shortTag('Width',dims[0]),shortTag('Height',dims[1]),shortTag('Length',dims[2])];
 const items=version===2?[...common,palette('Palette',paletteValues),byteArray('BlockData',paletteData),...extra]:[
 ...common,compound('Blocks',[palette('Palette',paletteValues),byteArray('Data',paletteData),...extra])];
 return root(version===2?items:[compound('Schematic',items)]);
}
test('Sponge v2: importiert Blöcke in YZX-Indexreihenfolge',()=>{
 const s=parseSchemBytes(fixture(2));
 assert.equal(s.version,2);assert.equal(s.volume,4);assert.equal(s.blocks.length,3);
 assert.deepEqual(s.blocks.map(b=>[b.x,b.y,b.z]),[[0,0,0],[0,0,1],[1,0,1]]);
 assert.equal(s.blocks[2].properties.half,'lower');
});
test('Sponge v3: Verschachtelung Schematic/Blocks unterstützt',()=>{
 const s=parseSchemBytes(fixture(3));assert.equal(s.version,3);assert.equal(s.width,2);assert.equal(s.blocks[2].blockState,'minecraft:oak_door[half=lower,facing=south]');
});
test('Mehrbyte-VarInts und ungültige Streams',()=>{
 assert.deepEqual(decodeVarints(Uint8Array.from([172,2,1]),2),[300,1]);
 assert.throws(()=>decodeVarints(Uint8Array.from([128]),1),/wenige/);
 assert.throws(()=>decodeVarints(Uint8Array.from([1,1]),1),/Anzahl/);
 assert.throws(()=>decodeVarints(Uint8Array.from([128,128,128,128,128,0]),1),/VarInt/);
});
test('Leere, falsche und zu große Dateien werden sicher abgewiesen',()=>{
 assert.throws(()=>parseSchemBytes(Buffer.from('x')),/NBT/);
 assert.throws(()=>parseSchemBytes(fixture(2,{dims:[0,1,2]})),/Abmessungen/);
 assert.throws(()=>parseSchemBytes(fixture(2,{dims:[60,30,30]})),/zu groß/);
 assert.throws(()=>parseSchemBytes(fixture(2,{paletteData:[1]})),/wenige/);
 assert.throws(()=>parseSchemBytes(fixture(2,{paletteData:[9,0,1,2]})),/unbekannten/);
 assert.throws(()=>parseSchemBytes(fixture(2,{paletteData:[0,0,0,0]})),/Luft/);
 assert.throws(()=>parseSchemBytes(fixture(4)),/Version/);
});
test('BlockEntities und Entities werden mit klarer Warnung behandelt',()=>{
 const s=parseSchemBytes(fixture(3,{extra:[listTag('BlockEntities',10,[u8(0)])]}));
 assert.ok(s.warnings.some(w=>w.includes('Truheninhalte')));
});
test('Gzip-Datei wird über DecompressionStream verarbeitet',async()=>{
 const gzip=zlib.gzipSync(fixture(2));
 const file=new File([gzip],'example.schem');
 const parsed=await parseSchemFile(file);
 assert.equal(parsed.blocks.length,3);
 await assert.rejects(()=>parseSchemFile(new File([gzip],'other.zip')),/Endung/);
 await assert.rejects(()=>parseSchemFile(new File([Buffer.from('bad')],'bad.schem')),/gzip/);
});
test('Entwurf hat berechenbare Blöcke und konsistente Materiallisten',()=>{
 const s=parseSchemBytes(fixture(2));const draft=draftFromParsed(s,'Testhaus');
 assert.ok(draft.id.startsWith('local-'));
 assert.equal(draft.steps.flatMap(x=>x.blocks).length,3);
 assert.equal(draft.editions[0],'Java');
 assert.deepEqual(core.countMaterials(draft.blocks),{stone:2,oak_door:1});
 assert.ok(draft.warnings.length>0);
 assert.ok(core.validateBuild(draft).valid);
});
test('Zu große Schrittzahl wird abgewiesen',()=>{
 const s=parseSchemBytes(fixture(2));assert.throws(()=>draftFromParsed(s,'Hi',{maxPerStep:100}));
});