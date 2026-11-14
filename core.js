/* CraftSteps – selbstständige, dependency-freie Blockdaten- und Schritt-Engine. */
(function(root, factory) {
  const value = factory();
  if (typeof module === 'object' && module.exports) module.exports = value;
  root.CraftStepsCore = value;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const MATERIALS = {
    cobblestone: { de:'Bruchstein', en:'Cobblestone', hex:'#93928b', stack:64, icon:'▦' },
    stone_bricks: { de:'Steinziegel', en:'Stone Bricks', hex:'#aeb0ab', stack:64, icon:'▦' },
    oak_planks: { de:'Eichenholzbretter', en:'Oak Planks', hex:'#c49a62', stack:64, icon:'▤' },
    spruce_planks: { de:'Fichtenholzbretter', en:'Spruce Planks', hex:'#8d6343', stack:64, icon:'▤' },
    spruce_log: { de:'Fichtenstamm', en:'Spruce Log', hex:'#6b4a34', stack:64, icon:'▥' },
    glass: { de:'Glas', en:'Glass', hex:'#93d7e2', stack:64, icon:'◇' },
    oak_door: { de:'Eichentür', en:'Oak Door', hex:'#aa7040', stack:64, icon:'▥' },
    leaves: { de:'Eichenlaub', en:'Oak Leaves', hex:'#63a557', stack:64, icon:'♣' },
    dirt: { de:'Erde', en:'Dirt', hex:'#8a6546', stack:64, icon:'▦' },
    water: { de:'Wasser (vorhandene Quelle)', en:'Water (existing source)', hex:'#5aace4', stack:0, icon:'≈', inventory:false },
    moss: { de:'Moosblock', en:'Moss Block', hex:'#719a4e', stack:64, icon:'▦' },
    oak_fence: { de:'Eichenzaun', en:'Oak Fence', hex:'#b58b50', stack:64, icon:'╫' },
    lantern: { de:'Laterne', en:'Lantern', hex:'#ecae43', stack:64, icon:'✦' },
    stone_slab: { de:'Steinziegelstufe', en:'Stone Brick Slab', hex:'#8d9392', stack:64, icon:'▱' },
    hay: { de:'Heuballen', en:'Hay Bale', hex:'#d3b448', stack:64, icon:'▥' },
    oak_log: { de:'Eichenstamm', en:'Oak Log', hex:'#7a5a35', stack:64, icon:'▥' },
    obsidian: { de:'Obsidian', en:'Obsidian', hex:'#1b1230', stack:64, icon:'▦' },
    crying_obsidian: { de:'Weinender Obsidian', en:'Crying Obsidian', hex:'#2c0f56', stack:64, icon:'▦' },
    gold_block: { de:'Goldblock', en:'Block of Gold', hex:'#f6d33e', stack:64, icon:'▦' },
    iron_block: { de:'Eisenblock', en:'Block of Iron', hex:'#d8d8d8', stack:64, icon:'▦' },
    bookshelf: { de:'Bücherregal', en:'Bookshelf', hex:'#9a7443', stack:64, icon:'▤' },
    crafting_table: { de:'Werkbank', en:'Crafting Table', hex:'#9b6a37', stack:64, icon:'▤' },
    stone: { de:'Stein', en:'Stone', hex:'#7d7d7d', stack:64, icon:'▦' }
  };
  const block = (x,y,z,type,phase,part,atomicId) => ({x,y,z,type,phase,part:part||null,atomicId:atomicId||null});
  function makeBuild(id,name,category,difficulty,description,width,depth,writer,style,tags) {
    const blocks=[], positions=new Set();
    const add=(x,y,z,type,phase,part,atomicId)=>{
      if(!Number.isInteger(x)||!Number.isInteger(y)||!Number.isInteger(z)||x<0||y<0||z<0) throw new Error('Ungültige Koordinate');
      if(!MATERIALS[type]) throw new Error('Unbekanntes Material: '+type);
      const k=`${x},${y},${z}`; if(positions.has(k)) throw new Error('Doppelter Block: '+k+' ('+id+')');
      positions.add(k); blocks.push(block(x,y,z,type,phase,part,atomicId));
    };
    writer(add);
    const steps=generateSteps(blocks,9);
    return { id,name,category,difficulty,description,width,depth,blocks,steps,style,tags:tags||[],editions:['Java','Bedrock'],version:'1.20+',updated:'2026-11-01',author:'CraftSteps Demo',verified:'programmatisch geprüft' };
  }
  function generateSteps(blocks,maxBlocks) {
    if (!Number.isInteger(maxBlocks)||maxBlocks<1) throw Error('Ungültige Schrittgröße');
    const phases = [...new Set(blocks.map(b=>b.phase))].sort((a,b)=>a-b);
    const steps=[];
    for (const phase of phases) {
      const inPhase=blocks.filter(b=>b.phase===phase).sort((a,b)=>a.y-b.y||a.z-b.z||a.x-b.x);
      const groups=[], seen=new Set();
      for(const b of inPhase) {
        if(b.atomicId) {
          if(seen.has(b.atomicId)) continue;
          seen.add(b.atomicId);
          groups.push(inPhase.filter(q=>q.atomicId===b.atomicId));
        } else groups.push([b]);
      }
      let chunk=[];
      for(const g of groups){
        if(chunk.length && chunk.length+g.length>maxBlocks) {steps.push({index:steps.length+1,phase,blocks:chunk});chunk=[];}
        chunk.push(...g);
      }
      if(chunk.length)steps.push({index:steps.length+1,phase,blocks:chunk});
    }
    return steps;
  }
  function itemCountForBlock(b) {
    if(!MATERIALS[b.type]?.inventory) return MATERIALS[b.type]?.inventory === false ? 0 : (b.part==='upper'||b.part==='head')?0:1;
    return (b.part==='upper'||b.part==='head')?0:1;
  }
  function countMaterials(blocks){
    const counts={};
    for(const b of blocks) {const n=itemCountForBlock(b);if(n)counts[b.type]=(counts[b.type]||0)+n;}
    return counts;
  }
  // Distinguish the overall footprint from blocks actually occupying the lowest Y layer.
  // The lowest layer may be sparse or below Y=0; never assume a filled rectangle.
  function groundLayer(build) {
    const source=Array.isArray(build?.blocks)?build.blocks:[];
    const valid=source.filter(b=>Number.isInteger(b?.x)&&Number.isInteger(b?.y)&&Number.isInteger(b?.z));
    if(!valid.length)return {y:null,width:0,depth:0,area:0,occupied:0,blocks:[]};
    let minX=Infinity,maxX=-Infinity,minY=Infinity,minZ=Infinity,maxZ=-Infinity;
    for(const b of valid){
      minX=Math.min(minX,b.x);maxX=Math.max(maxX,b.x);
      minY=Math.min(minY,b.y);
      minZ=Math.min(minZ,b.z);maxZ=Math.max(maxZ,b.z);
    }
    const floor=[],seen=new Set();
    for(const b of valid)if(b.y===minY){
      const key=b.x+','+b.z;
      if(!seen.has(key)){seen.add(key);floor.push(b);}
    }
    const width=maxX-minX+1,depth=maxZ-minZ+1;
    return {y:minY,width,depth,area:width*depth,occupied:floor.length,blocks:floor};
  }
  function stepState(build,idx) {
    if(!Number.isInteger(idx)||idx<1||idx>build.steps.length) throw Error('Schritt außerhalb des gültigen Bereichs');
    const placed=build.steps.slice(0,idx).flatMap(s=>s.blocks);
    const current=build.steps[idx-1].blocks;
    return {placed,current,stepMaterials:countMaterials(current),index:idx,total:build.steps.length};
  }
  function stacks(type,count){
    const max=MATERIALS[type]?.stack;
    if(!max || count<0 || !Number.isInteger(count)) throw Error('Ungültiges Stack-Material oder Menge');
    const full=Math.floor(count/max),rem=count%max;
    return `${full ? full+' Stack'+(full===1?'':'s') : ''}${full&&rem?' + ':''}${rem ? rem+' Stück':''}` || '0 Stück';
  }
  function validateBuild(build) {
    const seen=new Set();for(const b of build.blocks){const p=`${b.x}:${b.y}:${b.z}`;if(seen.has(p))throw Error('Doppelte Koordinate');seen.add(p);if(!MATERIALS[b.type])throw Error('Material nicht bekannt');}
    const rebuilt=build.steps.flatMap(s=>s.blocks);
    if(rebuilt.length!==build.blocks.length||new Set(rebuilt.map(b=>`${b.x}:${b.y}:${b.z}`)).size!==seen.size)throw Error('Bauplan und Schritte weichen voneinander ab');
    const total=countMaterials(build.blocks),fromSteps=countMaterials(rebuilt);
    for(const key of new Set([...Object.keys(total),...Object.keys(fromSteps)])) if(total[key]!==fromSteps[key])throw Error('Materialinkonsistenz: '+key);
    const groups={};for(const s of build.steps) for(const b of s.blocks)if(b.atomicId){(groups[b.atomicId]??=new Set()).add(s.index);}
    if(Object.values(groups).some(v=>v.size!==1))throw Error('Mehrteiliger Block verteilt');
    return {valid:true,blocks:build.blocks.length,steps:build.steps.length,materialTypes:Object.keys(total).length};
  }
  const builds=[
    makeBuild('starterhuette','Gemütliche Starterhütte','Häuser','Leicht',
      'Eine kompakte Survival-Hütte mit Holzdach, Eingang und Fenstern. Originales CraftSteps-Demobauwerk.',7,7,add=>{
        for(let z=0;z<7;z++)for(let x=0;x<7;x++)add(x,0,z,x===0||z===0||x===6||z===6?'cobblestone':'oak_planks',0);
        for(let y=1;y<=3;y++)for(let z=0;z<7;z++)for(let x=0;x<7;x++){
          if(!(x===0||x===6||z===0||z===6)) continue;
          if(z===6&&x===3&&(y===1||y===2)){add(x,y,z,'oak_door',2,y===1?'lower':'upper','frontdoor');continue;}
          const window = y===2 && ((z===0&&x===3)||(x===0&&z===3)||(x===6&&z===3));
          const corner = (x===0||x===6)&&(z===0||z===6);
          add(x,y,z,window?'glass':corner?'spruce_log':'oak_planks',y===1?1:y===2?2:3);
        }
        for(let z=0;z<7;z++)for(let x=0;x<7;x++)add(x,4,z,'spruce_planks',4);
        for(let z=1;z<6;z++)for(let x=1;x<6;x++)add(x,5,z,'stone_slab',5);
        add(0,5,0,'lantern',6);add(6,5,6,'lantern',6);
      },'house',['survival','holzhütte','cottage']),
    makeBuild('garten','Kleiner Survival-Garten','Natur','Leicht',
      'Ein dekoratives Gartenbeet mit Steinwegen, Grünflächen und Zaun. Originales CraftSteps-Demobauwerk.',9,7,add=>{
        for(let z=0;z<7;z++)for(let x=0;x<9;x++)add(x,0,z,(z===0||z===6||x===0||x===8)?'cobblestone':(x===4?'stone_bricks':'dirt'),0);
        for(let z=1;z<6;z++)for(let x=1;x<8;x++)if(x!==4 && (x+z)%3===0)add(x,1,z,'moss',1);
        for(let z=1;z<6;z++)for(let x=1;x<8;x++)if(x!==4 && (x+z)%3===1)add(x,1,z,'leaves',2);
        for(let x=0;x<9;x++){add(x,1,0,'oak_fence',3);add(x,1,6,'oak_fence',3);}
        for(let z=1;z<6;z++){add(0,1,z,'oak_fence',3);add(8,1,z,'oak_fence',3);}
        add(0,2,0,'lantern',4);add(8,2,6,'lantern',4);
      },'garden',['garten','gartenbeet','natur']),
    makeBuild('wachturm','Kleiner Steinwachturm','Mittelalter','Mittel',
      'Ein schlichter mittelalterlicher Aussichtsturm mit Plattform, Geländer und Laternen. Originales CraftSteps-Demobauwerk.',5,5,add=>{
        for(let z=0;z<5;z++)for(let x=0;x<5;x++)add(x,0,z,'stone_bricks',0);
        for(let y=1;y<=6;y++)for(const [x,z] of [[0,0],[4,0],[0,4],[4,4]])add(x,y,z,'stone_bricks',y);
        for(let z=0;z<5;z++)for(let x=0;x<5;x++)add(x,7,z,'oak_planks',7);
        for(let x=0;x<5;x++){add(x,8,0,'stone_slab',8);add(x,8,4,'stone_slab',8);}
        for(let z=1;z<4;z++){add(0,8,z,'stone_slab',8);add(4,8,z,'stone_slab',8);}
        for(const [x,z] of [[0,0],[4,4]])add(x,9,z,'lantern',9);
      },'tower',['turm','burg','mittelalter']),
    makeBuild('burgtor','Mini-Burgtor','Burgen','Mittel',
      'Ein wehrhaftes Burgtor mit zwei Ecktürmen, Zinnen und einem hohen Torbogen. Originales CraftSteps-Demobauwerk.',11,3,add=>{
        for(let z=0;z<3;z++)for(let x=0;x<11;x++)add(x,0,z,'cobblestone',0);
        for(let y=1;y<=6;y++)for(let z=0;z<3;z++)for(let x=0;x<11;x++){
          const tower=x<=2||x>=8;
          const gate=x>=4&&x<=6&&y<=4;
          if(gate||(!tower&&z!==1))continue;
          add(x,y,z,'stone_bricks',y<=3?1:y<=5?2:3);
        }
        for(let x=0;x<11;x++)for(let z=0;z<3;z++){
          const tower=x<=2||x>=8;
          if(tower&&(x+z)%2===0)add(x,7,z,'stone_slab',4);
          if(!tower&&z===1)add(x,7,z,x%2===0?'stone_bricks':'stone_slab',4);
        }
        add(3,8,1,'lantern',5);add(7,8,1,'lantern',5);
      },'castle',['burg','tor','mittelalter']),
    makeBuild('portalrahmen','Obsidian-Portalrahmen','Portale','Leicht',
      'Ein klassischer Portalrahmen auf einer Steinplattform mit leuchtenden Akzenten. Originales CraftSteps-Demobauwerk.',6,5,add=>{
        for(let z=0;z<5;z++)for(let x=0;x<6;x++)add(x,0,z,(x===0||x===5||z===0||z===4)?'stone_bricks':'cobblestone',0);
        for(let y=1;y<=5;y++)for(let x=1;x<=4;x++){
          const edge=x===1||x===4||y===1||y===5;
          if(!edge)continue;
          const corner=(x===1||x===4)&&(y===1||y===5);
          add(x,y,2,corner?'crying_obsidian':'obsidian',y);
        }
        add(0,1,0,'lantern',6);add(5,1,4,'lantern',6);
      },'portal',['portal','obsidian','nether']),
    makeBuild('scheune','Heuballen-Scheune','Farmen','Mittel',
      'Eine geräumige Farm-Scheune mit Holzrahmen, Heulager und Satteldach. Originales CraftSteps-Demobauwerk.',7,9,add=>{
        for(let z=0;z<9;z++)for(let x=0;x<7;x++)add(x,0,z,'dirt',0);
        for(let y=1;y<=4;y++)for(let z=0;z<9;z++)for(let x=0;x<7;x++){
          if(!(x===0||x===6||z===0||z===8))continue;
          if(z===8&&x===3&&(y===1||y===2)){add(x,y,z,'oak_door',2,y===1?'lower':'upper','barndoor');continue;}
          const post=(x===0||x===6)&&(z===0||z===8||z===4);
          const window=y===3&&(((x===0||x===6)&&(z===2||z===6))||(x===3&&z===0));
          add(x,y,z,post?'oak_log':window?'glass':'oak_planks',y<=2?1:y===3?2:3);
        }
        for(let z=1;z<=3;z++)for(let x=1;x<=2;x++)add(x,1,z,'hay',4);
        for(let z=0;z<9;z++){add(0,5,z,'spruce_planks',5);add(6,5,z,'spruce_planks',5);add(1,6,z,'spruce_planks',6);add(5,6,z,'spruce_planks',6);for(let x=2;x<=4;x++)add(x,7,z,'spruce_planks',7);}
      },'barn',['scheune','bauernhof','farm']),
    makeBuild('wachterstatue','Goldene Wächterstatue','Statuen','Mittel',
      'Eine blockige Wächterstatue auf einem Steinsockel mit goldenem Körper. Originales CraftSteps-Demobauwerk.',5,5,add=>{
        for(let z=0;z<5;z++)for(let x=0;x<5;x++)add(x,0,z,'stone_bricks',0);
        for(let z=1;z<4;z++)for(let x=1;x<4;x++)add(x,1,z,'stone',1);
        for(const x of [1,3])for(let y=2;y<=4;y++)add(x,y,2,'gold_block',2+y-2);
        for(let x=1;x<=3;x++)for(let y=5;y<=7;y++)add(x,y,2,'gold_block',5);
        add(0,6,2,'gold_block',6);add(4,6,2,'gold_block',6);add(0,7,2,'gold_block',6);add(4,7,2,'gold_block',6);
        add(2,8,2,'iron_block',7);add(2,9,2,'iron_block',7);
      },'statue',['statue','wächter','gold']),
    makeBuild('brunnen','Dorfbrunnen','Dekoration','Leicht',
      'Ein kleiner Brunnen mit Wasserbecken, Zaunpfosten und Laternen. Originales CraftSteps-Demobauwerk.',5,5,add=>{
        for(let z=0;z<5;z++)for(let x=0;x<5;x++)add(x,0,z,'cobblestone',0);
        for(let z=0;z<5;z++)for(let x=0;x<5;x++){
          const ring=x===0||x===4||z===0||z===4;
          add(x,1,z,ring?'stone_bricks':'water',1);
        }
        for(const [x,z] of [[0,0],[4,0],[0,4],[4,4]])for(let y=2;y<=3;y++)add(x,y,z,'oak_fence',2);
        for(let x=0;x<5;x++){add(x,4,0,'spruce_planks',3);add(x,4,4,'spruce_planks',3);}
        for(let z=1;z<4;z++){add(0,4,z,'spruce_planks',3);add(4,4,z,'spruce_planks',3);}
        add(2,2,0,'lantern',4);add(2,2,4,'lantern',4);
      },'fountain',['brunnen','dorf','deko']),
    makeBuild('baumhaus','Kleines Baumhaus','Survival-Basen','Mittel',
      'Ein Survival-Unterschlupf auf einem dicken Stamm mit Plattform, Geländer und Blätterdach. Originales CraftSteps-Demobauwerk.',7,7,add=>{
        for(let z=2;z<=4;z++)for(let x=2;x<=4;x++)add(x,0,z,'dirt',0);
        for(let y=1;y<=9;y++){add(3,y,3,'oak_log',y);}
        for(let z=0;z<7;z++)for(let x=0;x<7;x++)if(!(x===3&&z===3))add(x,6,z,'oak_planks',6);
        for(let i=0;i<7;i++){add(i,7,0,'oak_fence',7);add(i,7,6,'oak_fence',7);}
        for(let i=1;i<6;i++){add(0,7,i,'oak_fence',7);add(6,7,i,'oak_fence',7);}
        add(1,7,1,'lantern',8);add(5,7,5,'lantern',8);
        for(let y=9;y<=10;y++)for(let z=1;z<=5;z++)for(let x=1;x<=5;x++){
          if((x===1||x===5)&&(z===1||z===5))continue;
          if(x===3&&z===3&&y===9)continue;
          add(x,y,z,'leaves',y===9?9:10);
        }
      },'treehouse',['baumhaus','survival','wald']),
    makeBuild('leseecke','Bibliotheks-Nische','Innenräume','Leicht',
      'Eine gemütliche Leseecke mit Bücherregalen, Werkbank und Laternenlicht. Originales CraftSteps-Demobauwerk.',5,5,add=>{
        for(let z=0;z<5;z++)for(let x=0;x<5;x++)add(x,0,z,'spruce_planks',0);
        for(let y=1;y<=3;y++)for(let x=0;x<5;x++){add(x,y,0,y===3?'oak_planks':'bookshelf',y);}
        for(let y=1;y<=3;y++)for(let z=1;z<5;z++){add(0,y,z,y===3?'oak_planks':'bookshelf',y);}
        add(4,1,1,'crafting_table',4);
        add(1,1,1,'lantern',5);add(4,2,1,'lantern',5);
      },'library',['bibliothek','innenraum','regale'])
  ];
  for(const build of builds)validateBuild(build);
  return {MATERIALS,builds,generateSteps,countMaterials,groundLayer,stepState,stacks,validateBuild};
});