const test=require('node:test');
const assert=require('node:assert/strict');
const visual=require('../block-visuals.js');

const approx=(a,b)=>assert.ok(Math.abs(a-b)<0.001, String(a)+' differs from '+String(b));

test('guided camera eases from the previous step to the next one',()=>{
 const old=[{x:0,y:0,z:0},{x:1,y:0,z:0}],next=[{x:17,y:8,z:19},{x:18,y:8,z:19}];
 const build={width:24,height:15,depth:26,blocks:old.concat(next)};
 const options={yaw:.78,pitch:.65,zoom:1};
 const previous=visual.makeProject(700,450,build,{...options,focus:old});
 const current=visual.makeProject(700,450,build,{...options,focus:next});
 const start=visual.makeProject(700,450,build,{...options,focus:next,fromFocus:old,focusBlend:0});
 const end=visual.makeProject(700,450,build,{...options,focus:next,fromFocus:old,focusBlend:1});
 for(const p of [[0,0,0],[18,8,19]]){
   approx(previous.project(...p).x,start.project(...p).x);
   approx(previous.project(...p).y,start.project(...p).y);
   approx(current.project(...p).x,end.project(...p).x);
   approx(current.project(...p).y,end.project(...p).y);
 }
 const midway=visual.makeProject(700,450,build,{...options,focus:next,fromFocus:old,focusBlend:.5});
 assert.notEqual(midway.project(0,0,0).x,start.project(0,0,0).x);
 assert.notEqual(midway.project(0,0,0).x,end.project(0,0,0).x);
});

test('new blocks can be revealed gradually with exact outlines left in place',()=>{
 const opacity=[];
 const ctx={
  beginPath(){},moveTo(){},lineTo(){},closePath(){},save(){},restore(){},clip(){},fill(){},stroke(){},
  clearRect(){},fillRect(){},transform(){},setTransform(){},fillText(){},
  createLinearGradient(){return {addColorStop(){}}}
 };
 let alpha=1;
 Object.defineProperty(ctx,'globalAlpha',{get:()=>alpha,set:v=>{alpha=v;opacity.push(v);}});
 const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({width:350,height:260})};
 const old=global.window;global.window={devicePixelRatio:1};
 try{
   const b={type:'stone_bricks',x:0,y:0,z:0};
   const build={blocks:[b],width:1,height:1,depth:1};
   const result=visual.draw(canvas,build,{context:'guide',highlight:[b],stepReveal:.35,transparent:true,hideBadge:true});
   assert.equal(result.rendered,1);
   assert.ok(opacity.some(v=>v>0&&v<.8),'new block faces should be partially transparent');
   assert.equal(alpha,1);
 }finally{global.window=old;}
});

test('camera transition is optional when the user selects whole-build mode',()=>{
 const build={blocks:[{x:0,y:0,z:0}],width:10,height:10,depth:10};
 const camera=visual.makeProject(540,350,build,{focus:null,fromFocus:[{x:9,y:9,z:9}],focusBlend:0});
 assert.equal(camera.focused,false);
});
