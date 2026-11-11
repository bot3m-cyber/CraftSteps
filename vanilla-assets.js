/* CraftSteps — vanilla resource loader. No Minecraft graphics or game files are bundled.
   The user picks a local Java client .jar (ZIP) or a resource-pack .zip. ZIP entries,
   blockstate/model JSON and PNGs are decoded in that browser only. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CraftStepsAssets=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MAX_ARCHIVE=140*1024*1024, MAX_ENTRIES=35000, MAX_ENTRY=6*1024*1024, MAX_JSON=512*1024;
const BASE='assets/minecraft/';
const pathOK=p=>/^assets\/minecraft\/(blockstates|models|textures)\/[a-z0-9_./-]+\.(json|png)$/.test(p)&&!p.includes('..');
const LEGACY_DEMO_IDS=Object.freeze({leaves:'oak_leaves',hay:'hay_block',moss:'moss_block',stone_slab:'stone_brick_slab'});
function stateId(b){const id=String(b?.blockId||b?.type||'minecraft:unknown').replace(/^minecraft:/,'').split('[')[0].replace(/[^a-z0-9_]/g,'');return LEGACY_DEMO_IDS[id]||id;}
function properties(b){
 const p=b?.properties&&typeof b.properties==='object'?{...b.properties}:{};
 const m=/\[([^\]]+)\]/.exec(b?.blockState||'');
 if(m)for(const piece of m[1].split(',')){const [k,v]=piece.split('=');if(k&&v&&!(k in p))p[k]=v;}
 const type=stateId(b);
 // The original demo blocks predate blockstate import. Give their missing states
 // valid vanilla defaults; never overwrite states supplied by a .schem/.litematic.
 if(/_door$/.test(type)&&!/_trapdoor$/.test(type)){
   p.facing??='north';p.half??=b?.part==='upper'?'upper':'lower';
   p.hinge??='left';p.open??='false';p.powered??='false';
 } else if(/_slab$/.test(type)){p.type??='bottom';p.waterlogged??='false';}
 else if(/_log$|_stem$|_hyphae$/.test(type)){p.axis??='y';}
 else if(type==='lantern'||type==='soul_lantern'){p.hanging??='false';p.waterlogged??='false';}
 return p;
}
function withContext(blocks){
 if(!Array.isArray(blocks))return [];
 const occupied=new Map(blocks.map(b=>[b.x+'|'+b.y+'|'+b.z,b]));
 const dirs={north:[0,0,-1],east:[1,0,0],south:[0,0,1],west:[-1,0,0]};
 return blocks.map(b=>{
   const id=stateId(b),base=properties(b);
   if(!(/_fence$|_pane$/.test(id)||id==='iron_bars'))return b;
   if(Object.keys(dirs).some(dir=>dir in base))return b;
   const derived={...base};
   for(const [dir,[dx,dy,dz]] of Object.entries(dirs)){
     const neighbor=occupied.get((b.x+dx)+'|'+(b.y+dy)+'|'+(b.z+dz));
     // Infer only same-family connections. Other block attachments need real
     // schematic states and should not be fabricated as correct vanilla behavior.
     const other=neighbor?stateId(neighbor):'';
     derived[dir]=other===id?'true':'false';
   }
   return {...b,properties:derived};
 });
}
function uint32(v,p){return v.getUint32(p,true);}function uint16(v,p){return v.getUint16(p,true);}
function sanitizeName(value,kind){const clean=String(value||'').replace(/^minecraft:/,'');if(!/^[a-z0-9_./-]+$/.test(clean)||clean.includes('..')||clean.startsWith('/'))throw Error('Ungültiger Asset-Pfad');return BASE+kind+'/'+clean;}
async function inflateRaw(data,expected){
  if(typeof DecompressionStream==='undefined')throw Error('Dein Browser unterstützt das ZIP-Entpacken nicht (DecompressionStream).');
  const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
    if(size>MAX_ENTRY||size>expected){await reader.cancel();throw Error('Defekte oder zu große ZIP-Datei');}chunks.push(value);}}
  finally{reader.releaseLock();}
  if(size!==expected)throw Error('ZIP-Entpackgröße ist ungültig');const result=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
class ZipArchive {
 constructor(file,entries){this.file=file;this.entries=entries;}
 static async open(file){
  if(!file||typeof file.size!=='number'||file.size<100||file.size>MAX_ARCHIVE)throw Error('Ungültige Datei oder größer als 140 MiB');
  const tailStart=Math.max(0,file.size-(65535+22));const tail=new DataView(await file.slice(tailStart).arrayBuffer());let end=-1;
  for(let i=tail.byteLength-22;i>=0;i--)if(uint32(tail,i)===0x06054b50&&i+22+uint16(tail,i+20)===tail.byteLength){end=i;break;}
  if(end<0)throw Error('Kein gültiges ZIP-Archiv');
  const total=uint16(tail,end+10),len=uint32(tail,end+12),off=uint32(tail,end+16);
  if(total===0xffff||len===0xffffffff||off===0xffffffff)throw Error('ZIP64 wird nicht unterstützt');
  if(total>MAX_ENTRIES||len>16*1024*1024||off+len>file.size)throw Error('ZIP-Verzeichnis außerhalb der erlaubten Grenzen');
  const data=new DataView(await file.slice(off,off+len).arrayBuffer()),entries=new Map();let i=0;
  const utf8=new TextDecoder('utf-8',{fatal:false});
  for(let n=0;n<total;n++){
    if(i+46>data.byteLength||uint32(data,i)!==0x02014b50)throw Error('Defektes ZIP-Verzeichnis');
    const flags=uint16(data,i+8),method=uint16(data,i+10),compressed=uint32(data,i+20),raw=uint32(data,i+24),nameLen=uint16(data,i+28),extraLen=uint16(data,i+30),commentLen=uint16(data,i+32),local=uint32(data,i+42);
    if(i+46+nameLen+extraLen+commentLen>data.byteLength)throw Error('Defekter ZIP-Dateiname');
    const path=utf8.decode(new Uint8Array(data.buffer,data.byteOffset+i+46,nameLen));
    if(pathOK(path)&&!(flags&1)&&(method===0||method===8)&&compressed<=MAX_ENTRY&&raw<=MAX_ENTRY&&local<file.size){entries.set(path,{local,compressed,raw,method,crc:uint32(data,i+16)});}
    i+=46+nameLen+extraLen+commentLen;
  }
  if(!entries.size||!entries.has(BASE+'textures/block/stone.png')||!entries.has(BASE+'blockstates/stone.json')||!entries.has(BASE+'models/block/stone.json'))throw Error('Keine vollständigen Vanilla-Java-Assets gefunden. Bitte eine Minecraft-Java-Client-JAR mit assets/minecraft auswählen.');
  return new ZipArchive(file,entries);
 }
 has(path){return this.entries.has(path);}
 async bytes(path){const e=this.entries.get(path);if(!e)return null;const hd=new DataView(await this.file.slice(e.local,e.local+30).arrayBuffer());if(hd.byteLength<30||uint32(hd,0)!==0x04034b50)throw Error('Ungültiger ZIP-Dateieintrag');const start=e.local+30+uint16(hd,26)+uint16(hd,28);if(start+e.compressed>this.file.size)throw Error('ZIP-Datei abgeschnitten');const compressed=new Uint8Array(await this.file.slice(start,start+e.compressed).arrayBuffer());return e.method===0?compressed:inflateRaw(compressed,e.raw);}
 async json(path){const e=this.entries.get(path);if(!e)return null;if(e.raw>MAX_JSON)throw Error('Modelldatei zu groß');const bytes=await this.bytes(path);return JSON.parse(new TextDecoder().decode(bytes));}
}
function testWhen(when,props){if(!when)return true;if(Array.isArray(when.OR))return when.OR.some(w=>testWhen(w,props));if(Array.isArray(when.AND))return when.AND.every(w=>testWhen(w,props));return Object.entries(when).every(([key,value])=>String(value).split('|').includes(String(props[key]??'')));}
function hashSeed(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function weighted(value,seed){const values=Array.isArray(value)?value:[value];if(values.length<2)return values[0];const total=values.reduce((n,v)=>n+Math.max(1,Number(v?.weight)||1),0);let pick=hashSeed(seed)%total;for(const v of values){pick-=Math.max(1,Number(v?.weight)||1);if(pick<0)return v;}return values[0];}
function chooseVariants(spec,props,seed='0'){if(!spec||typeof spec!=='object')return [];const arr=[];if(spec.variants){const keys=Object.keys(spec.variants);const match=keys.filter(k=>k===''||testWhen(Object.fromEntries(k.split(',').map(s=>s.split('='))),props)).sort((a,b)=>b.length-a.length)[0];if(match!==undefined)arr.push(weighted(spec.variants[match],seed+'|variant'));else if(!Object.keys(props).length&&keys.length)arr.push(weighted(spec.variants[keys[0]],seed+'|default'));}
 if(spec.multipart)for(let i=0;i<spec.multipart.length;i++){const entry=spec.multipart[i];if(testWhen(entry.when,props))arr.push(weighted(entry.apply,seed+'|multipart|'+i));}return arr.filter(x=>x&&typeof x.model==='string').slice(0,24);}
function resolveTexture(tag,textureMap){let t=tag;const seen=new Set();while(typeof t==='string'&&t.startsWith('#')){const key=t.slice(1);if(seen.has(key))return null;seen.add(key);t=textureMap[key];}if(!t||typeof t!=='string')return null;try{return sanitizeName(t,'textures')+'.png';}catch{return null;}}
function defaultUV(face,from,to){switch(face){
 case 'down':return [from[0],16-to[2],to[0],16-from[2]];
 case 'up':return [from[0],from[2],to[0],to[2]];
 case 'north':return [16-to[0],16-to[1],16-from[0],16-from[1]];
 case 'south':return [from[0],16-to[1],to[0],16-from[1]];
 case 'west':return [from[2],16-to[1],to[2],16-from[1]];
 case 'east':return [16-to[2],16-to[1],16-from[2],16-from[1]];
 default:return [0,0,16,16];}}
class AssetManager {
 constructor(){this.zip=null;this.status='none';this.source='';this.errors=[];this.jsonCache=new Map();this.dataCache=new Map();this.imageCache=new Map();this.callbacks=new Set();this.pending=new Set();this.processing=null;this.restoring=null;this.version='';}
 subscribe(fn){this.callbacks.add(fn);return ()=>this.callbacks.delete(fn);}
 notify(){for(const fn of this.callbacks){try{fn(this.info());}catch{}}}
 info(){return {ready:!!this.zip,source:this.source,models:this.dataCache.size,images:[...this.imageCache.values()].filter(i=>i&&i.width).length,missing:this.errors.length,status:this.status};}
 async load(file,{persist=true}={}){
  this.status='loading';this.notify();try{const zip=await ZipArchive.open(file);this.zip=zip;this.source=file.name||'Minecraft Java';this.dataCache.clear();this.jsonCache.clear();this.imageCache.clear();this.errors=[];this.version=this.source;this.status='ready';this.notify();if(persist){try{await persistFile(file);}catch(e){this.errors.push('Texturen wurden geladen, aber nicht dauerhaft gespeichert: '+e.message);this.notify();}}return this.info();}
  catch(e){this.status=this.zip?'ready':'none';this.notify();throw e;}
 }
 async restore(){if(this.restoring)return this.restoring;this.restoring=(async()=>{try{const file=await savedFile();if(file)await this.load(file,{persist:false});}catch(e){this.errors.push('Gespeicherte Minecraft-Datei konnte nicht geladen werden: '+e.message);this.notify();}})();return this.restoring;}
 async clear(){this.zip=null;this.source='';this.status='none';this.dataCache.clear();this.jsonCache.clear();this.imageCache.clear();this.errors=[];await deleteFile();this.notify();}
 async json(path){if(this.jsonCache.has(path))return this.jsonCache.get(path);const result=await this.zip.json(path);this.jsonCache.set(path,result);return result;}
 async model(path,seen=new Set()){
  const filename=sanitizeName(path,'models')+'.json';if(seen.has(filename)||seen.size>16)throw Error('Ungültige Model-Vererbung');seen.add(filename);const json=await this.json(filename);if(!json)return null;
  const base=json.parent?await this.model(json.parent,new Set(seen)):null;
  return {textures:{...(base?.textures||{}),...(json.textures||{})},elements:json.elements??base?.elements??[],ambientocclusion:json.ambientocclusion??base?.ambientocclusion??true};
 }
 async image(path){
  if(!path||!this.zip?.has(path))return null;
  if(this.imageCache.has(path))return this.imageCache.get(path);
  const bytes=await this.zip.bytes(path),blob=new Blob([bytes],{type:'image/png'});
  let bitmap=null;
  if(typeof createImageBitmap==='function'){
    try{bitmap=await createImageBitmap(blob);}catch(error){
      // Mobile browsers sometimes reject createImageBitmap for particular PNGs:
      // try the standard HTML image decoder before declaring the model missing.
      if(typeof Image==='undefined')throw error;
    }
  }
  if(!bitmap){
    if(typeof Image==='undefined')throw Error('Dieser Browser kann PNG-Texturen nicht dekodieren.');
    bitmap=await new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(blob),img=new Image();
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('PNG kann nicht gelesen werden'));};
      img.src=url;
    });
  }
  this.imageCache.set(path,bitmap);return bitmap;
 }
 async build(block){const type=stateId(block),props=properties(block);const spec=await this.json(BASE+'blockstates/'+type+'.json');if(!spec)return null;const seed=[type,block?.x||0,block?.y||0,block?.z||0].join('|'),selectors=chooseVariants(spec,props,seed);const output=[];
  for(const selected of selectors){const m=await this.model(selected.model);if(!m)continue;const elements=[];
   for(const e of m.elements.slice(0,64)){
     if(!Array.isArray(e.from)||!Array.isArray(e.to)||e.from.length!==3||e.to.length!==3)continue;
     const faces={};for(const [face,cfg] of Object.entries(e.faces||{})){
       const path=resolveTexture(cfg.texture,m.textures);if(!path)continue;const image=await this.image(path);
       if(!image&&this.errors.length<20)this.errors.push(type+': Originaltextur fehlt: '+path);
       faces[face]={image,uv:Array.isArray(cfg.uv)?cfg.uv:defaultUV(face,e.from,e.to),rotation:cfg.rotation||0,tintindex:cfg.tintindex??-1,cullface:cfg.cullface||null};
     }
     if(Object.keys(faces).length)elements.push({from:e.from,to:e.to,faces,rotation:e.rotation||null,shade:e.shade!==false});
   }
   if(elements.length)output.push({elements,rotation:{x:selected.x||0,y:selected.y||0},uvlock:!!selected.uvlock});
  }return output.length?output:null;
 }
 key(block){const p=properties(block),type=stateId(block),variant=hashSeed([type,block?.x||0,block?.y||0,block?.z||0].join('|'))%16;return type+'['+Object.entries(p).sort(([a],[b])=>a.localeCompare(b)).map(([a,b])=>a+'='+b).join(',')+']@'+variant;}
 get(block){return this.dataCache.get(this.key(block))||null;}
 async ensure(blocks){if(!this.zip||!Array.isArray(blocks))return;const unique=new Map();for(const b of blocks){const key=this.key(b);if(!unique.has(key))unique.set(key,b);}const keys=[...unique.keys()];
  const queue=keys.filter(k=>!this.dataCache.has(k)&&!this.pending.has(k)).slice(0,1200);if(!queue.length)return;
  const workers=Array.from({length:Math.min(5,queue.length)},async()=>{while(queue.length){const key=queue.shift(),block=unique.get(key);this.pending.add(key);try{this.dataCache.set(key,await this.build(block)||[]);}catch(e){this.dataCache.set(key,[]);if(this.errors.length<20)this.errors.push(key+': '+e.message);}finally{this.pending.delete(key);}}});await Promise.all(workers);this.notify();
 }
}
function indexedDBAvailable(){return typeof indexedDB!=='undefined';}
function openDB(){return new Promise((resolve,reject)=>{if(!indexedDBAvailable())return reject(Error('IndexedDB ist nicht verfügbar'));const q=indexedDB.open('craftsteps_minecraft_vanilla_assets',1);q.onupgradeneeded=()=>q.result.createObjectStore('files');q.onerror=()=>reject(q.error||Error('Datenbankfehler'));q.onsuccess=()=>resolve(q.result);});}
async function withDB(mode,operation){const db=await openDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),req=operation(tx.objectStore('files'));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Speicherfehler'));});}finally{db.close();}}
function savedFile(){if(!indexedDBAvailable())return null;return withDB('readonly',s=>s.get('vanilla'));}
function persistFile(file){return withDB('readwrite',s=>s.put(file,'vanilla'));}
function deleteFile(){if(!indexedDBAvailable())return Promise.resolve();return withDB('readwrite',s=>s.delete('vanilla'));}
const manager=new AssetManager();return {ZipArchive,AssetManager,manager,chooseVariants,testWhen,resolveTexture,defaultUV,stateId,properties,withContext};
});
