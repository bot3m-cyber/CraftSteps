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
