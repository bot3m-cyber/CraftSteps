const test=require('node:test');
const assert=require('node:assert/strict');
const {groundLayer,builds}=require('../core.js');
const {stepPlacement}=require('../block-visuals.js');

test('the lowest occupied layer is independent of Y=0 and may be sparse',()=>{
  const build={blocks:[
    {x:-2,y:-4,z:3,type:'stone'},
    {x:0,y:-4,z:4,type:'stone'},
    {x:0,y:-4,z:4,type:'stone'}, // duplicates should not inflate displayed occupancy
    {x:1,y:2,z:5,type:'oak_planks'}
  ]};
  const result=groundLayer(build);
  assert.equal(result.y,-4);
  assert.equal(result.width,4);
  assert.equal(result.depth,3);
  assert.equal(result.area,12);
  assert.equal(result.occupied,2);
  assert.equal(result.blocks.length,2);
});

test('ground layer handles empty builds without invalid geometry',()=>{
  assert.deepEqual(groundLayer({blocks:[]}),{y:null,width:0,depth:0,area:0,occupied:0,blocks:[]});
});

test('all sample builds report the exact occupancy of their true lowest layer',()=>{
  for(const build of builds){
    const base=groundLayer(build);
    const minY=Math.min(...build.blocks.map(b=>b.y));
    const unique=new Set(build.blocks.filter(b=>b.y===minY).map(b=>b.x+','+b.z));
    assert.equal(base.y,minY,build.name);
    assert.equal(base.occupied,unique.size,build.name);
    assert.ok(base.area>=base.occupied,build.name);
  }
});

test('block placement easing is gradual, staggered and finishes exactly at 1',()=>{
  assert.equal(stepPlacement(0,0,3),0);
  assert.equal(stepPlacement(1,0,3),1);
  assert.equal(stepPlacement(1,2,3),1);
  assert.ok(stepPlacement(.5,0,3)>stepPlacement(.5,2,3));
  assert.ok(stepPlacement(.15,0,3)>0);
  assert.equal(stepPlacement(.15,2,3),0);
});
