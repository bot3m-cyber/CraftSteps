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
  // Litematica stores region palettes and a packed 64-bit index stream.
  // We parse all regions, preserve state strings, and normalize negative world coordinates.
  function parseLitematicBytes(raw){
    const tree=new NbtReader(raw).parse();
    if(!tree.Regions||typeof tree.Regions!=='object'||Array.isArray(tree.Regions))fail('Keine Litematica-Regionen gefunden.');
    const names=Object.keys(tree.Regions);if(!names.length||names.length>64)fail('Ungültige Anzahl Litematica-Regionen.');
    const all=[];const occupied=new Set(),warnings=[];let cellTotal=0;
    function axisObject(obj){if(!obj||!['x','y','z'].every(k=>Number.isInteger(obj[k.toUpperCase()])))fail('Ungültige Position oder Größe einer Litematica-Region.');return [obj.X,obj.Y,obj.Z];}
    for(const regionName of names){
      const r=tree.Regions[regionName],pos=axisObject(r?.Position),size=axisObject(r?.Size),dims=size.map(Math.abs);
      if(!dims.every(n=>n>=1&&n<=65535))fail('Ungültige Region-Abmessungen.');
      const volume=dims[0]*dims[1]*dims[2];cellTotal+=volume;
      if(!Number.isSafeInteger(volume)||cellTotal>MAX_VOLUME)fail('Dieser Litematica-Plan ist für die Vorschau zu groß.');
      const palette=r.BlockStatePalette,packed=r.BlockStates;
      if(!Array.isArray(palette)||!palette.length||palette.length>MAX_ENTRIES||!Array.isArray(packed))fail('Litematica-Palette oder BlockStates fehlen.');
      const states=palette.map((entry)=>{
        if(!entry||typeof entry.Name!=='string')fail('Ungültiger Block in der Litematica-Palette.');
        const prop=entry.Properties&&typeof entry.Properties==='object'?entry.Properties:{};
        const props=Object.entries(prop).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>`${k}=${v}`).join(',');
        return parseState(entry.Name+(props?'['+props+']':''));
      });
      const bits=Math.max(2,Math.ceil(Math.log2(palette.length)));const required=Math.ceil(volume*bits/64);
      if(packed.length<required)fail('Abgeschnittene Litematica-BlockStates.');
      if(packed.length>required+1)fail('Überlange Litematica-BlockStates.');
      const word=(n)=>BigInt.asUintN(64,packed[n]||0n),mask=(1n<<BigInt(bits))-1n;
      for(let i=0;i<volume;i++){
        const at=i*bits,offset=at%64,part=Math.floor(at/64);let idx=(word(part)>>BigInt(offset))&mask;
        if(offset+bits>64)idx=((word(part)>>BigInt(offset))|(word(part+1)<<BigInt(64-offset)))&mask;
        const state=states[Number(idx)];if(!state)fail('Litematica-Index außerhalb der Palette.');
        if(/minecraft:(?:air|cave_air|void_air)$/.test(state.name))continue;
        if(all.length>=MAX_BLOCKS)fail('Zu viele sichtbare Blöcke (maximal 10.000).');
        const x=i%dims[0],z=Math.floor(i/dims[0])%dims[2],y=Math.floor(i/(dims[0]*dims[2]));
        const coords=[x,y,z].map((n,j)=>pos[j]+(size[j]<0?-n:n));
        const coordKey=coords.join('|');if(occupied.has(coordKey))fail('Litematica-Regionen überlappen sich an Blockpositionen.');
        occupied.add(coordKey);
        all.push({x:coords[0],y:coords[1],z:coords[2],type:state.name.startsWith('minecraft:')?state.type:state.name,blockId:state.name,blockState:state.raw,properties:state.properties});
      }
      if(Array.isArray(r.TileEntities)&&r.TileEntities.length)warnings.push(`Region ${regionName}: Truheninhalte / BlockEntities werden nicht übernommen.`);
      if(Array.isArray(r.Entities)&&r.Entities.length)warnings.push(`Region ${regionName}: Entity-Daten werden ignoriert.`);
    }
    if(!all.length)fail('Der Bauplan enthält nur Luftblöcke.');
    const min=[Math.min(...all.map(b=>b.x)),Math.min(...all.map(b=>b.y)),Math.min(...all.map(b=>b.z))],
      max=[Math.max(...all.map(b=>b.x)),Math.max(...all.map(b=>b.y)),Math.max(...all.map(b=>b.z))];
    all.forEach(b=>{b.x-=min[0];b.y-=min[1];b.z-=min[2];});
    const dims=[max[0]-min[0]+1,max[1]-min[1]+1,max[2]-min[2]+1];
    if(dims.some(d=>d>512)||dims.reduce((a,b)=>a*b,1)>MAX_VOLUME)fail('Zusammengesetzte Litematica-Regionen sind zu weit auseinander.');
    if(!Number.isInteger(tree.MinecraftDataVersion||tree.Metadata?.MinecraftDataVersion))warnings.push('Minecraft DataVersion fehlt; Blockstates müssen geprüft werden.');
    warnings.push('Auto-Schritte sind Rohschritte, nicht automatisch auf Platzierbarkeit geprüft.');
    warnings.push('Eigene/Mod-Blockstates können als kariertes Platzhaltermodell erscheinen.');
    return {format:'Litematica .litematic',version:tree.Version||'unbekannt',dataVersion:tree.MinecraftDataVersion||tree.Metadata?.MinecraftDataVersion||0,width:dims[0],height:dims[1],length:dims[2],volume:cellTotal,blocks:all,warnings,offset:min,rawPaletteSize:0};
  }
  // Legacy MCEdit/WorldEdit .schematic uses numeric block IDs + metadata, not modern blockstate JSON.
  // Unknown IDs intentionally remain explicit placeholders; never silently map them to stone.
  const LEGACY_IDS={
    1:'stone',2:'grass_block',3:'dirt',4:'cobblestone',5:'oak_planks',7:'bedrock',8:'water',9:'water',10:'lava',11:'lava',12:'sand',13:'gravel',14:'gold_ore',15:'iron_ore',16:'coal_ore',17:'oak_log',18:'oak_leaves',20:'glass',24:'sandstone',35:'white_wool',41:'gold_block',42:'iron_block',43:'stone_slab',44:'stone_slab',45:'bricks',47:'bookshelf',48:'mossy_cobblestone',49:'obsidian',50:'torch',53:'oak_stairs',54:'chest',56:'diamond_ore',57:'diamond_block',58:'crafting_table',60:'farmland',61:'furnace',62:'furnace',64:'oak_door',65:'ladder',67:'cobblestone_stairs',79:'ice',80:'snow_block',85:'oak_fence',89:'glowstone',98:'stone_bricks',102:'glass_pane',108:'brick_stairs',109:'stone_brick_stairs',112:'nether_bricks',114:'nether_brick_stairs',126:'oak_slab',128:'sandstone_stairs',134:'spruce_stairs',135:'birch_stairs',136:'jungle_stairs',155:'quartz_block',156:'quartz_stairs',159:'white_terracotta',160:'white_stained_glass_pane',162:'acacia_log',163:'acacia_stairs',164:'dark_oak_stairs',171:'white_carpet',172:'hardened_clay',173:'coal_block',179:'red_sandstone',180:'red_sandstone_stairs',182:'red_sandstone_slab',188:'spruce_fence',189:'birch_fence',190:'jungle_fence',191:'dark_oak_fence',192:'acacia_fence',251:'white_concrete',252:'white_concrete_powder'};
  function parseLegacyBytes(raw){
    const tree=new NbtReader(raw).parse();const width=tree.Width,height=tree.Height,length=tree.Length;
    if(![width,height,length].every(n=>Number.isInteger(n)&&n>0&&n<=65535))fail('Ungültige Legacy-Schematic-Abmessungen.');
    const volume=width*height*length;if(volume>MAX_VOLUME)fail('Diese Schematic ist für die Vorschau zu groß.');
    const ids=tree.Blocks,meta=tree.Data,add=tree.AddBlocks;
    if(!(ids instanceof Uint8Array)||ids.length!==volume||!(meta instanceof Uint8Array)||meta.length!==volume)fail('Legacy-Schematic-Blöcke oder Data fehlen / haben falsche Länge.');
    if(add!==undefined&&(!(add instanceof Uint8Array)||add.length!==Math.ceil(volume/2)))fail('Ungültige AddBlocks-Daten.');
    const blocks=[],unknown=new Set();
    for(let i=0;i<volume;i++){
      const high=add?((i%2?add[Math.floor(i/2)]>>4:add[Math.floor(i/2)]&15)<<8):0;
      const id=ids[i]+high;if(id===0)continue;
      if(blocks.length>=MAX_BLOCKS)fail('Zu viele sichtbare Blöcke (maximal 10.000).');
      let type=LEGACY_IDS[id];if(!type){type=`unknown_legacy_${id}`;unknown.add(id);}
      const metadata=meta[i],props=Object.create(null);
      // These simple metadata fields are known; other legacy metadata stays explicitly unverified.
      if(/_stairs$/.test(type)){props.facing=['east','west','south','north'][metadata&3];props.half=(metadata&4)?'top':'bottom';}
      if(/_slab$/.test(type))props.type=id===43||(metadata&8)?'top':'bottom';
      if(/_door$/.test(type))props.half=(metadata&8)?'upper':'lower';
      if(/_log$/.test(type))props.axis=['y','x','z','y'][(metadata>>2)&3];
      const x=i%width,z=Math.floor(i/width)%length,y=Math.floor(i/(width*length));
      const entry={x,y,z,type,blockId:`minecraft:${type}`,blockState:`minecraft:${type}`,properties:props,legacyId:id,legacyMeta:metadata};
      blocks.push(entry);
    }
    if(!blocks.length)fail('Der Bauplan enthält nur Luftblöcke.');
    const warnings=['Legacy .schematic verwendet alte numerische IDs: Palette, Materialliste und Blockstates sind teilweise nur näherungsweise rekonstruierbar.','Manche Sonderblöcke und mehrteilige Blockstates müssen vor Verwendung geprüft werden.'];
    if(unknown.size)warnings.unshift('Nicht zugeordnete Legacy-Block-IDs: '+[...unknown].slice(0,35).join(', ')+(unknown.size>35?' …':'')+'. Sie erscheinen als pinkes Platzhaltermodell.');
    if(Array.isArray(tree.TileEntities)&&tree.TileEntities.length)warnings.push('BlockEntity-Inhalte werden ignoriert.');
    return {format:'Legacy .schematic',version:1,dataVersion:0,width,height,length,volume,blocks,warnings,offset:[0,0,0],rawPaletteSize:0};
  }
  async function parseBlueprintFile(file){
    if(!file||!/^.+\.(schem|litematic|schematic)$/i.test(file.name||''))fail('Unterstützt: .schem, .litematic und .schematic.');
    if(file.size>MAX_COMPRESSED)fail('Datei zu groß (maximal 5 MiB).');
    const bytes=new Uint8Array(await file.arrayBuffer());if(bytes.length<2)fail('Datei ist leer oder ungültig.');
    let output=bytes;
    if(bytes[0]===0x1f&&bytes[1]===0x8b){
      if(typeof DecompressionStream!=='function')fail('Dein Browser unterstützt gzip-Import nicht.');
      try{
        const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
        const parts=[];let size=0;while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;
          if(size>MAX_UNCOMPRESSED){await reader.cancel();fail('Die entpackte Datei überschreitet 14 MiB.');}parts.push(chunk.value);}
        output=new Uint8Array(size);let n=0;for(const part of parts){output.set(part,n);n+=part.length;}
      }catch(e){if(e.message?.includes('überschreitet'))throw e;fail('Die gzip-Datei ist beschädigt oder unlesbar.');}
    }else if(!/\.schematic$/i.test(file.name))fail('Die Datei muss gzip-komprimiert sein.');
    if(output.length>MAX_UNCOMPRESSED)fail('Die entpackte Datei ist zu groß.');
    if(/\.schem$/i.test(file.name))return parseSchemBytes(output);
    if(/\.litematic$/i.test(file.name))return parseLitematicBytes(output);
    return parseLegacyBytes(output);
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
      return {x:b.x,y:b.y,z:b.z,type:b.type,blockState:b.blockState,properties:b.properties,blockId:b.blockId,phase:Math.max(0,b.y-(doorPart?1:0)),part:doorPart||bedPart,atomicId:groupId};
    });
    const id='local-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    const draft={id,name:safeName,description:'Lokaler Import-Entwurf – Materialregeln und Bauschritte müssen noch geprüft werden.',category:'Häuser',difficulty:'Mittel',width:parsed.width,depth:parsed.length,height:parsed.height,blocks,steps:core.generateSteps(blocks,maxPerStep),tags:['importiert'],editions:['Java'],version:'DataVersion '+parsed.dataVersion,updated:new Date().toISOString().slice(0,10),author:'Lokaler Entwurf',verified:'NICHT geprüft',draft:true,importFormat:`${parsed.format} v${parsed.version}`,warnings:[...parsed.warnings],maxPerStep};
    registerMaterials(draft,core.MATERIALS);
    core.validateBuild(draft);
    return draft;
  }
  return {MAX_COMPRESSED,MAX_UNCOMPRESSED,MAX_VOLUME,MAX_BLOCKS,parseSchemBytes,parseSchemFile,parseLitematicBytes,parseLegacyBytes,parseBlueprintFile,decodeVarints,parseState,registerMaterials,draftFromParsed};
});
