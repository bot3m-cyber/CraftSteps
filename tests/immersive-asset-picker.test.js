const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('immersive 3D view includes a native Java-client file picker rather than hidden top-page controls',()=>{
 const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'..','styles.css'),'utf8');
 assert.match(app,/id="immersive-vanilla-file"/);
 assert.match(app,/Originaltexturen laden/);
 assert.match(app,/id="imm-assets-indicator"/);
 assert.match(app,/canvas\.closest\('\.immersive3d'\)\?'immersive'/);
 assert.match(css,/\.imm-asset-upload input\[type=file\]/);
});

test('mobile fullscreen file selection uses the same local Minecraft asset manager and updates the viewer',async()=>{
 const listeners=new Map(),elements=new Map(),loaded=[],events=[];
 function element(id){
   if(elements.has(id))return elements.get(id);
   const el={id,textContent:'',hidden:false,disabled:false,value:'',
     files:[],className:'',classList:{toggle(){}},
     addEventListener(type,fn){listeners.set(id+':'+type,fn);},
     replaceChildren(){},append(){},setAttribute(){},
     innerHTML:''};
   elements.set(id,el);return el;
 }
 let notify=null;
 let state={ready:false,status:'none',source:'',kind:null,version:null,persisted:false,
   archiveModels:0,archiveTextures:0,images:0,missing:0,missingTypes:[],diagnostics:[]};
 const manager={
   info(){return {...state};},
   subscribe(fn){notify=fn;return ()=>{};},
   async load(file){
     loaded.push(file);
     state={...state,ready:true,status:'ready',source:file.name,kind:'java-client',
       version:'1.21.1',persisted:true,archiveModels:80,archiveTextures:120};
     notify?.();
     return this.info();
   },
   async clear(){},async restore(){}
 };
 const document={
   getElementById(id){return element(id);},
   addEventListener(type,fn){listeners.set('document:'+type,fn);},
   createElement(tag){return element(tag);}
 };
 const window={CraftStepsAssets:{manager},dispatchEvent(event){events.push(event.type);}};
 const context={document,window,CustomEvent:class{constructor(type){this.type=type;}},console};
 const code=fs.readFileSync(path.join(__dirname,'..','assets-ui.js'),'utf8');
 vm.runInNewContext(code,context,{filename:'assets-ui.js'});
 await Promise.resolve();
 const handler=listeners.get('document:change');
 assert.equal(typeof handler,'function');
 const file={name:'1.21.1.jar',size:2048},input={id:'immersive-vanilla-file',files:[file],value:'original'};
 await handler({target:input});
 assert.equal(loaded.length,1);
 assert.equal(loaded[0],file);
 assert.equal(input.value,'');
 assert.match(element('imm-assets-indicator').textContent,/Originaltexturen aktiv.*1\.21\.1/);
 assert.equal(element('imm-assets-button-label').textContent,'Minecraft-Datei wechseln');
 assert.match(element('imm-assets-feedback').textContent,/Originaltexturen aktiviert/);
 assert.ok(events.includes('craftsteps:assets'));
});
