const test=require('node:test');
const assert=require('node:assert/strict');
const visuals=require('../block-visuals.js');
test('step camera automatically centers on the actual highlighted block coordinates',()=>{
  const build={width:30,depth:30,height:12,blocks:[{x:0,y:0,z:0},{x:29,y:11,z:29}]};
  const current=[{x:24,y:7,z:21},{x:25,y:7,z:21}];
  assert.deepEqual(visuals.boundsFor(current),{minX:24,minY:7,minZ:21,maxX:26,maxY:8,maxZ:22});
  const camera=visuals.makeProject(660,440,build,{yaw:.9,pitch:.65,focus:current});
  const full=visuals.makeProject(660,440,build,{yaw:.9,pitch:.65});
  const screen=camera.project(25,7.5,21.5);
  assert.ok(Math.abs(screen.x-330)<.001,'current step centered horizontally');
  assert.ok(Math.abs(screen.y-237.6)<.001,'current step centered vertically');
  assert.ok(camera.scale>full.scale,'step is zoomed in relative to whole build');
  assert.equal(camera.focused,true);
  assert.equal(full.focused,false);
});
test('the camera supports a negative elevation to see underneath a platform',()=>{
  const build={width:4,depth:4,height:1,blocks:[{x:0,y:0,z:0}]};
  const underside=visuals.makeProject(500,320,build,{yaw:Math.PI/4,pitch:-.83});
  assert.equal(underside.pitch,-.83);
  const block={x:0,y:0,z:0},shape=[{elements:[{from:[0,0,0],to:[16,16,16],faces:{up:{texture:'up'},down:{texture:'down'}}}],rotation:{x:0,y:0}}];
  const project=(x,y,z)=>({x:x+z,y:y+z}),depth=(x,y,z)=>x+y+z;
  const below=visuals.assetFacesFor(block,shape,project,depth,.8,-.8,null);
  const above=visuals.assetFacesFor(block,shape,project,depth,.8,.8,null);
  assert.deepEqual(below.map(f=>f.id),['bottom']);
  assert.deepEqual(above.map(f=>f.id),['top']);
});
test('invalid or empty focus lists fall back safely to the full building camera',()=>{
  assert.equal(visuals.boundsFor([]),null);
  assert.equal(visuals.boundsFor([{x:NaN,y:0,z:0}]),null);
  const build={blocks:[{x:0,y:0,z:0}],width:1,depth:1,height:1};
  assert.equal(visuals.makeProject(300,300,build,{focus:[]}).focused,false);
});
