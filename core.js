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
    hay: { de:'Heuballen', en:'Hay Bale', hex:'#d3b448', stack:64, icon:'▥' }
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
      },'tower',['turm','burg','mittelalter'])
  ];
  for(const build of builds)validateBuild(build);
  return {MATERIALS,builds,generateSteps,countMaterials,stepState,stacks,validateBuild};
});