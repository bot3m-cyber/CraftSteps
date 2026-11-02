const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const visuals=require('../block-visuals.js');
test('No fabricated texture mode is exposed without a loaded Java client',()=>{
  assert.equal(visuals.textureMode(),'missing');
  assert.equal(fs.existsSync(path.join(__dirname,'..','preview-visuals.js')),false);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),/preview-visuals/);
});
test('Original client assets take precedence when available',()=>{
  const old=global.CraftStepsAssets;
  try{global.CraftStepsAssets={manager:{info:()=>({ready:true})}};assert.equal(visuals.textureMode(),'vanilla');}
  finally{global.CraftStepsAssets=old;}
});
test('Loading is explicitly distinguished from original vanilla assets',()=>{
  const old=global.CraftStepsAssets;
  try{global.CraftStepsAssets={manager:{info:()=>({ready:false,status:'loading'})}};assert.equal(visuals.textureMode(),'loading');}
  finally{global.CraftStepsAssets=old;}
});
test('neutral fallback faces are opaque, visible polygons rather than empty clipped areas',()=>{
  const fills=[];
  const ctx={beginPath(){},moveTo(){},lineTo(){},closePath(){},save(){},restore(){},clip(){},stroke(){},clearRect(){},fillRect(){},transform(){},setTransform(){},fill(){fills.push(this.fillStyle)},fillText(){},createLinearGradient(){return {addColorStop(){}}}};
  const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({width:180,height:140})};
  const previousWindow=global.window;global.window={devicePixelRatio:1};
  try{const result=visuals.draw(canvas,{width:1,depth:1,height:1,blocks:[{type:'stone_bricks',x:0,y:0,z:0}]},{transparent:true,hideBadge:true});
    assert.equal(result.placeholder,true);assert.ok(result.faces>=3);assert.ok(fills.includes('#dfe4e1'));assert.ok(new Set(fills.filter(x=>/^#/.test(x))).size>=2);
  }finally{global.window=previousWindow;}
});
