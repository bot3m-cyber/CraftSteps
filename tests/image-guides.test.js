const test=require('node:test');
const assert=require('node:assert/strict');
const {diffRegions,validImage,validateGuide}=require('../image-guides.js');
function frame(width,height,rgb=[20,40,60]){
 const data=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<data.length;i+=4){data[i]=rgb[0];data[i+1]=rgb[1];data[i+2]=rgb[2];data[i+3]=255;}
 return {width,height,data};
}
function fill(f,x0,y0,x1,y1,rgb){
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const i=(y*f.width+x)*4;
   f.data.set([rgb[0],rgb[1],rgb[2],255],i);
 }
}
test('step screenshot comparison marks new areas in aligned images',()=>{
 const before=frame(96,96),after=frame(96,96);
 fill(after,24,24,48,48,[210,210,210]);
 const result=diffRegions(before,after);
 assert.equal(result.reliable,true);
 assert.ok(result.regions.length>=1);
 const first=result.regions[0];
 assert.ok(first.x<=24&&first.x+first.width>=48);
 assert.ok(first.y<=24&&first.y+first.height>=48);
});
test('completely different screenshots are not falsely marked block-exact',()=>{
 const before=frame(96,96,[10,10,10]),after=frame(96,96,[240,240,240]);
 const result=diffRegions(before,after);
 assert.equal(result.reliable,false);
 assert.deepEqual(result.regions,[]);
 assert.ok(result.changedRatio>.4);
});
test('isolated pixel noise does not create massive red outlines',()=>{
 const before=frame(96,96),after=frame(96,96);
 fill(after,3,3,4,4,[240,240,240]);
 assert.equal(diffRegions(before,after).regions.length,0);
});
test('incompatible images fail clearly without claiming recognition',()=>{
 assert.throws(()=>diffRegions(frame(16,16),frame(20,20)),/Abmessungen/);
});
test('private guide drafts require valid images and bounded counts',()=>{
 const image={type:'image/png',size:128};
 assert.equal(validImage(image),true);
 assert.equal(validImage({type:'text/html',size:10}),false);
 assert.equal(validateGuide({id:'img-12345678',title:'Haus',steps:[{image}],baseline:null}),true);
 assert.throws(()=>validateGuide({id:'img-12345678',title:'Haus',steps:[],baseline:null}),/1–48/);
 assert.throws(()=>validateGuide({id:'img-12345678',title:'Haus',steps:[{image:{type:'image/png',size:8*1024*1024}}]}),/7 MB/);
});
