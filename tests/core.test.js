const test=require('node:test');
const assert=require('node:assert/strict');
const {builds,MATERIALS,countMaterials,generateSteps,stepState,stacks,validateBuild}=require('../core.js');

test('Drei eigenständige Builds sind vorhanden',()=>{
  assert.equal(builds.length,3);
  assert.equal(new Set(builds.map(b=>b.id)).size,3);
});
for(const build of builds){
  test(build.name+': alle Koordinaten eindeutig und rekonstruierbar',()=>{
    const result=validateBuild(build);
    assert.ok(result.valid);
    const flat=build.steps.flatMap(s=>s.blocks);
    assert.equal(flat.length,build.blocks.length);
    assert.deepEqual(countMaterials(flat),countMaterials(build.blocks));
    assert.ok(build.steps.every(s=>s.blocks.length>=1&&s.blocks.length<=9));
    assert.deepEqual(build.steps.map(s=>s.index),Array.from({length:build.steps.length},(_,i)=>i+1));
  });
  test(build.name+': kumulative Struktur und Schrittmaterialien korrekt',()=>{
    for(let i=1;i<=build.steps.length;i++){
      const s=stepState(build,i);
      assert.equal(s.current.length,build.steps[i-1].blocks.length);
      assert.equal(s.placed.length,build.steps.slice(0,i).reduce((n,step)=>n+step.blocks.length,0));
      assert.deepEqual(s.stepMaterials,countMaterials(s.current));
    }
  });
}
test('Zweiteilige Tür ist ein Inventargegenstand',()=>{
  const hut=builds.find(b=>b.id==='starterhuette');
  const doors=hut.blocks.filter(b=>b.type==='oak_door');
  assert.equal(doors.length,2);
  assert.equal(countMaterials(doors).oak_door,1);
  assert.equal(countMaterials(hut.blocks).oak_door,1);
  assert.equal(hut.steps.filter(s=>s.blocks.some(b=>b.type==='oak_door')).length,1);
});
test('Stackberechnung mit 64er Stackgrößen',()=>{
  assert.equal(stacks('stone_bricks',130),'2 Stacks + 2 Stück');
  assert.equal(stacks('stone_bricks',64),'1 Stack');
  assert.equal(stacks('stone_bricks',1),'1 Stück');
  assert.equal(stacks('stone_bricks',128),'2 Stacks');
  assert.throws(()=>stacks('water',5));
});
test('Unbekanntes Material wird zurückgewiesen',()=>{
  assert.throws(()=>validateBuild({blocks:[{x:0,y:0,z:0,type:'nonexistent'}],steps:[{index:1,blocks:[{x:0,y:0,z:0,type:'nonexistent'}]}]}));
});
test('Doppelte Koordinaten werden zurückgewiesen',()=>{
  const a={x:0,y:0,z:0,type:'dirt'};
  assert.throws(()=>validateBuild({blocks:[a,{...a,type:'moss'}],steps:[{index:1,blocks:[a,{...a,type:'moss'}]}]}),/Doppelte/);
});
test('Ungültige Schrittgrößen und Schrittnummern abgewiesen',()=>{
  assert.throws(()=>generateSteps([],0));
  assert.throws(()=>stepState(builds[0],0));
  assert.throws(()=>stepState(builds[0],builds[0].steps.length+1));
});
test('Alle Material-IDs besitzen Definitionen',()=>{
  for(const b of builds)for(const q of b.blocks)assert.ok(MATERIALS[q.type]);
});
