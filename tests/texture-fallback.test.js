const test=require('node:test');
const assert=require('node:assert/strict');
const visuals=require('../block-visuals.js');
const preview=require('../preview-visuals.js');
test('Visible pixel preview is available without a loaded Java client',()=>{
  assert.equal(visuals.textureMode(),'preview');
  assert.equal(typeof preview.draw,'function');
  assert.equal(typeof preview.tile,'function');
});
test('Original client assets take precedence when available',()=>{
  const old=global.CraftStepsAssets;
  try{global.CraftStepsAssets={manager:{info:()=>({ready:true})}};assert.equal(visuals.textureMode(),'vanilla');}
  finally{global.CraftStepsAssets=old;}
});
test('The preview stays active while vanilla assets are loading',()=>{
  const old=global.CraftStepsAssets;
  try{global.CraftStepsAssets={manager:{info:()=>({ready:false,status:'loading'})}};assert.equal(visuals.textureMode(),'preview');}
  finally{global.CraftStepsAssets=old;}
});
