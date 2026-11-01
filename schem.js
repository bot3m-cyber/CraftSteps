/* CraftSteps Sponge .schem import: Java NBT, gzip, Sponge v2/v3. No external dependencies. */
(function(root, factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CraftStepsSchem=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const MAX_COMPRESSED=5*1024*1024;
  const MAX_UNCOMPRESSED=14*1024*1024;
  const MAX_VOLUME=24000;
  const MAX_BLOCKS=10000;
  const MAX_ENTRIES=250000;
  const MAX_DEPTH=24;
  const decoder=new TextDecoder('utf-8',{fatal:true});
  function fail(message){throw new Error(message);}
  class NbtReader{
    constructor(input){
      this.bytes=input instanceof Uint8Array?input:new Uint8Array(input);
      if(this.bytes.byteLength>MAX_UNCOMPRESSED)fail('Die entpackte Datei ist zu groß.');
      this.dv=new DataView(this.bytes.buffer,this.bytes.byteOffset,this.bytes.byteLength);
      this.offset=0;
    }
    check(n){if(!Number.isSafeInteger(n)||n<0||this.offset+n>this.bytes.length)fail('Ungültige oder abgeschnittene NBT-Daten.');}
    readU8(){this.check(1);return this.dv.getUint8(this.offset++);}
    readI8(){this.check(1);return this.dv.getInt8(this.offset++);}
    readU16(){this.check(2);let v=this.dv.getUint16(this.offset);this.offset+=2;return v;}
    readI16(){this.check(2);let v=this.dv.getInt16(this.offset);this.offset+=2;return v;}
    readI32(){this.check(4);let v=this.dv.getInt32(this.offset);this.offset+=4;return v;}
    readBig(){this.check(8);let v=this.dv.getBigInt64(this.offset);this.offset+=8;return v;}
    readFloat(){this.check(4);let v=this.dv.getFloat32(this.offset);this.offset+=4;return v;}
    readDouble(){this.check(8);let v=this.dv.getFloat64(this.offset);this.offset+=8;return v;}
    readBytes(n){this.check(n);const b=this.bytes.subarray(this.offset,this.offset+n);this.offset+=n;return b;}
    readString(){const n=this.readU16();return decoder.decode(this.readBytes(n));}
    readLength(limit=MAX_ENTRIES){const n=this.readI32();if(n<0||n>limit)fail('Ungültige oder zu große NBT-Liste.');return n;}
    payload(tag,depth){
      if(depth>MAX_DEPTH)fail('Zu tief verschachtelte NBT-Datei.');
      switch(tag){
        case 1:return this.readI8();
        case 2:return this.readI16();
        case 3:return this.readI32();
        case 4:return this.readBig();
        case 5:return this.readFloat();
        case 6:return this.readDouble();
        case 7:return this.readBytes(this.readLength(MAX_UNCOMPRESSED));
        case 8:return this.readString();
        case 9:{const type=this.readU8(),length=this.readLength();if(type===0&&length)fail('Ungültige NBT-Liste.');const list=[];for(let i=0;i<length;i++)list.push(this.payload(type,depth+1));return list;}
        case 10:{const object=Object.create(null);let count=0;while(true){const type=this.readU8();if(type===0)break;if(++count>MAX_ENTRIES)fail('Zu viele NBT-Einträge.');const name=this.readString();if(Object.hasOwn(object,name))fail('Doppelter NBT-Schlüssel: '+name);object[name]=this.payload(type,depth+1);}return object;}
        case 11:{const n=this.readLength();const array=[];this.check(n*4);for(let i=0;i<n;i++)array.push(this.readI32());return array;}
        case 12:{const n=this.readLength();const array=[];this.check(n*8);for(let i=0;i<n;i++)array.push(this.readBig());return array;}
        default:fail('Nicht unterstützter NBT-Tag: '+tag);
      }
    }
    parse(){if(this.readU8()!==10)fail('Die Datei enthält keinen NBT-Compound.');this.readString();const value=this.payload(10,0);if(this.offset!==this.bytes.length)fail('Unerwartete Daten am Ende der NBT-Datei.');return value;}
  }
  function decodeVarints(bytes,count){
    const indices=new Array(count);let p=0;
    for(let i=0;i<count;i++){
      let value=0,done=false;
      for(let j=0;j<5;j++){
        if(p>=bytes.length)fail('Zu wenige Blockdaten im Bauplan.');
        const c=bytes[p++];
        if(j===4&&(c&0xf8))fail('Ungültiger VarInt-Palettenindex.');
        value+=(c&0x7f)*2**(7*j);
        if((c&0x80)===0){done=true;break;}
      }
      if(!done)fail('VarInt überschreitet fünf Bytes.');
      indices[i]=value;
    }
    if(p!==bytes.length)fail('Die Anzahl der Blockdaten passt nicht zu den Abmessungen.');
    return indices;
  }
  function parseState(text){
    if(typeof text!=='string'||text.length>512)fail('Ungültiger Blockzustand in der Palette.');
    const match=/^([a-z0-9_.-]+:)?([a-z0-9_./-]+)(?:\[([a-z0-9_=.,-]+)\])?$/.exec(text);
    if(!match)fail('Ungültiger Blockzustand: '+text.slice(0,60));
    if(['__proto__','constructor','prototype'].includes(match[2]))fail('Ungültiger Blockname.');
    const full=(match[1]||'minecraft:')+match[2],properties=Object.create(null);
    if(match[3])for(const pair of match[3].split(',')){
      const parts=pair.split('=');if(parts.length!==2||!parts[0]||!parts[1]||Object.hasOwn(properties,parts[0]))fail('Ungültige Blockeigenschaften.');
      properties[parts[0]]=parts[1];
    }
    return {name:full,type:match[2],properties,raw:text};
  }
  function parseSchemBytes(raw){
    const tree=new NbtReader(raw).parse();
    const root=tree.Schematic||tree;
    const version=root.Version;
    if(version!==2&&version!==3)fail('Nur Sponge .schem Version 2 und 3 werden unterstützt.');
    const width=root.Width, height=root.Height,length=root.Length;
    if(![width,height,length].every(n=>Number.isInteger(n)&&n>=1&&n<=65535))fail('Ungültige Bauwerk-Abmessungen.');
    const volume=width*height*length;
    if(volume>MAX_VOLUME)fail('Dieser Bauplan ist für die Vorschau zu groß (maximal 24.000 Positionen).');
    if(!Number.isInteger(root.DataVersion)||root.DataVersion<1)fail('Minecraft DataVersion fehlt oder ist ungültig.');
    const container=version===2?root:root.Blocks;
    if(!container||typeof container!=='object')fail('Blockdaten fehlen.');
    const palette=container.Palette;
    const data=version===2?container.BlockData:container.Data;
    if(!palette||typeof palette!=='object'||palette instanceof Uint8Array||Array.isArray(palette)||!(data instanceof Uint8Array))fail('Palette oder Blockdaten fehlen.');
    const idxToState=new Map();
    const keys=Object.keys(palette);
    if(!keys.length||keys.length>MAX_ENTRIES)fail('Leere oder übergroße Palette.');
    for(const name of keys){
      const index=palette[name];
      if(!Number.isInteger(index)||index<0||index>=MAX_ENTRIES||idxToState.has(index))fail('Ungültiger oder doppelter Palettenindex.');
      idxToState.set(index,parseState(name));
    }
    const indices=decodeVarints(data,volume),blocks=[],unsupported=new Set();
    for(let i=0;i<volume;i++){
      const state=idxToState.get(indices[i]);if(!state)fail('Blockdaten verweisen auf unbekannten Palettenindex.');
      if(state.name==='minecraft:air'||state.name==='minecraft:cave_air'||state.name==='minecraft:void_air')continue;
      if(blocks.length>=MAX_BLOCKS)fail('Zu viele sichtbare Blöcke (maximal 10.000).');
      const x=i%width,z=Math.floor(i/width)%length,y=Math.floor(i/(width*length));
      blocks.push({x,y,z,type:state.name.startsWith('minecraft:')?state.type:state.name,blockId:state.name,blockState:state.raw,properties:state.properties});
      if(!state.name.startsWith('minecraft:'))unsupported.add(state.name.split(':')[0]);
    }
    if(!blocks.length)fail('Der Bauplan enthält nur Luftblöcke.');
    const warnings=[];
    if(unsupported.size)warnings.push('Mod-Blöcke erkannt ('+[...unsupported].join(', ')+'): Namen und Materialregeln müssen überprüft werden.');
    const entities=root.Entities||[];if(Array.isArray(entities)&&entities.length)warnings.push('Entity-Daten (z. B. Rüstungsständer) werden noch nicht übernommen.');
    if(container.BlockEntities?.length)warnings.push('BlockEntity-Inhalte (z. B. Truheninhalte) werden noch nicht übernommen.');
    if(root.Biomes)warnings.push('Biomdaten werden ignoriert.');
    if(blocks.some(b=>/water|lava|farmland|_bed$|_door$|_plant$|_wall_|_slab$|_candle$|_banner$|_sign$|_double_plant$|redstone|_stairs$/.test(b.type)))warnings.push('Besondere Blockzustände/Inventargegenstände müssen vor Veröffentlichung manuell geprüft werden.');
    warnings.push('Die Schritte werden zunächst nur nach Höhe sortiert; Erreichbarkeit und Platzierungsregeln sind noch nicht automatisch geprüft.');
    return {format:'Sponge .schem',version,dataVersion:root.DataVersion,width,height,length,offset:Array.isArray(root.Offset)&&root.Offset.length===3?root.Offset:[0,0,0],volume,blocks,warnings,rawPaletteSize:keys.length};
  }
  async function parseSchemFile(file){
    if(!file||!/\.schem$/i.test(file.name||''))fail('Bitte eine Datei mit der Endung .schem auswählen.');
    if(file.size>MAX_COMPRESSED)fail('Datei zu groß (maximal 5 MiB komprimiert).');
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(bytes.length<2||bytes[0]!==0x1f||bytes[1]!==0x8b)fail('Eine .schem-Datei muss gzip-komprimiert sein.');
    if(typeof DecompressionStream!=='function')fail('Dein Browser unterstützt gzip-Import nicht. Bitte einen aktuellen Browser verwenden.');
    let output,reader;
    try{
      reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
      const parts=[];let size=0;
      while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>MAX_UNCOMPRESSED){await reader.cancel();fail('Die entpackte Datei überschreitet 14 MiB.');}parts.push(chunk.value);}
      output=new Uint8Array(size);let pos=0;for(const part of parts){output.set(part,pos);pos+=part.length;}
    }catch(e){if(e.message?.includes('überschreitet'))throw e;fail('Die gzip-Datei ist beschädigt oder unlesbar.');}
    return parseSchemBytes(output);
  }
  function materialColor(type){let h=2166136261;for(let i=0;i<type.length;i++)h=Math.imul(h^type.charCodeAt(i),16777619);let hue=(h>>>0)%360;const c=(offset)=>Math.round(85+105*(.5+.5*Math.sin((hue+offset)*Math.PI/180))).toString(16).padStart(2,'0');return `#${c(0)}${c(120)}${c(240)}`;}
  function registerMaterials(build,materialMap){
    for(const block of build.blocks){
      if(!Object.hasOwn(materialMap,block.type)){
        const name=block.type.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        materialMap[block.type]={de:name,en:name,hex:materialColor(block.type),stack:64,icon:'▦'};
      }
    }
  }
  function draftFromParsed(parsed,name,{maxPerStep=9}={}){
    if(!Number.isInteger(maxPerStep)||maxPerStep<1||maxPerStep>32)fail('Schrittgröße muss zwischen 1 und 32 liegen.');
    const core=(typeof globalThis!=='undefined'&&globalThis.CraftStepsCore)||(typeof require==='function'?require('./core.js'):null);
    if(!core)fail('CraftSteps-Core fehlt.');
    const safeName=String(name||'').trim().slice(0,70);if(!safeName)fail('Bitte Bauwerksnamen angeben.');
    const blocks=parsed.blocks.map(b=>{
      const props=b.properties||{},multipart=/_door$|_tall_grass$|_large_fern$|^sunflower$|^lilac$|^rose_bush$|^peony$|^pitcher_plant$/.test(b.type);
      const doorPart=multipart&&props.half==='upper'?'upper':null;
      const bedPart=/_bed$/.test(b.type)&&props.part==='head'?'head':null;
      const groupId=multipart?`double:${b.x}:${b.y-(doorPart?1:0)}:${b.z}`:null;
      return {x:b.x,y:b.y,z:b.z,type:b.type,blockState:b.blockState,blockId:b.blockId,phase:Math.max(0,b.y-(doorPart?1:0)),part:doorPart||bedPart,atomicId:groupId};
    });
    const id='local-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    const draft={id,name:safeName,description:'Lokaler Import-Entwurf – Materialregeln und Bauschritte müssen noch geprüft werden.',category:'Häuser',difficulty:'Mittel',width:parsed.width,depth:parsed.length,height:parsed.height,blocks,steps:core.generateSteps(blocks,maxPerStep),tags:['importiert'],editions:['Java'],version:'DataVersion '+parsed.dataVersion,updated:new Date().toISOString().slice(0,10),author:'Lokaler Entwurf',verified:'NICHT geprüft',draft:true,importFormat:`${parsed.format} v${parsed.version}`,warnings:[...parsed.warnings],maxPerStep};
    registerMaterials(draft,core.MATERIALS);
    core.validateBuild(draft);
    return draft;
  }
  return {MAX_COMPRESSED,MAX_UNCOMPRESSED,MAX_VOLUME,MAX_BLOCKS,parseSchemBytes,parseSchemFile,decodeVarints,parseState,registerMaterials,draftFromParsed};
});