/* CraftSteps Image Guides: offline private screenshots, plus conservative local image differences.
   Automatic differences are NOT AI and cannot reconstruct 3D block coordinates. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.CraftStepsImageGuides=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAX_STEPS=48,MAX_IMAGE_BYTES=7*1024*1024,MAX_TOTAL_BYTES=90*1024*1024;
 function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
 function diffRegions(before,after,options){
   options=options||{};
   if(!before||!after||!before.data||!after.data||before.width!==after.width||before.height!==after.height)throw Error('Bilder müssen dieselben Abmessungen haben.');
   const width=after.width,height=after.height,cols=Math.ceil(width/12),rows=Math.ceil(height/12),marked=new Uint8Array(cols*rows);
   const threshold=clamp(Number(options.threshold)||75,20,300),sample=2;
   const total=cols*rows;
   let changed=0;
   for(let ty=0;ty<rows;ty++)for(let tx=0;tx<cols;tx++){
     let pixelCount=0,different=0;
     for(let y=ty*12;y<Math.min(height,(ty+1)*12);y+=sample){
       for(let x=tx*12;x<Math.min(width,(tx+1)*12);x+=sample){
         const i=(y*width+x)*4,a=before.data,b=after.data;
         const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
         pixelCount++;if(d>=threshold)different++;
       }
     }
     const k=ty*cols+tx;
     if(pixelCount&&different/pixelCount>.10){marked[k]=1;changed++;}
   }
   const ratio=changed/Math.max(1,total);
   if(ratio>.40)return {regions:[],changedRatio:ratio,reliable:false,reason:'Die Bilder unterscheiden sich großflächig. Die Kamera könnte bewegt worden sein.'};
   if(changed===0)return {regions:[],changedRatio:0,reliable:true,reason:'Keine deutlichen Veränderungen erkannt.'};
   const seen=new Uint8Array(marked.length),regions=[];
   for(let idx=0;idx<marked.length;idx++){
     if(!marked[idx]||seen[idx])continue;
     seen[idx]=1;const queue=[idx];let q=0,count=0,minX=cols,maxX=0,minY=rows,maxY=0;
     while(q<queue.length){
       const at=queue[q++],x=at%cols,y=Math.floor(at/cols);count++;
       minX=Math.min(x,minX);maxX=Math.max(x,maxX);
       minY=Math.min(y,minY);maxY=Math.max(y,maxY);
       for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
         const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=cols||ny>=rows)continue;
         const next=ny*cols+nx;if(marked[next]&&!seen[next]){seen[next]=1;queue.push(next);}
       }
     }
     if(count<2)continue;
     const pad=2,x=clamp(minX*12-pad,0,width),y=clamp(minY*12-pad,0,height);
     const right=clamp((maxX+1)*12+pad,0,width),bottom=clamp((maxY+1)*12+pad,0,height);
     regions.push({x,y,width:right-x,height:bottom-y,pixels:count});
   }
   regions.sort((a,b)=>b.pixels-a.pixels);
   return {regions:regions.slice(0,24),changedRatio:ratio,reliable:true};
 }
 function validImage(file){
   return file&&['image/png','image/jpeg','image/webp'].includes(file.type)&&file.size>0&&file.size<=MAX_IMAGE_BYTES;
 }
 function validateGuide(guide){
   if(!guide||typeof guide.id!=='string'||!/^img-[a-z0-9-]{8,}$/i.test(guide.id))throw Error('Ungültige Anleitung-ID.');
   if(!guide.title||guide.title.length>90||!Array.isArray(guide.steps)||guide.steps.length<1||guide.steps.length>MAX_STEPS)throw Error('Bitte 1–48 gültige Schrittbilder auswählen.');
   const files=[guide.baseline,...guide.steps.map(x=>x.image)].filter(Boolean);
   if(files.some(f=>!validImage(f))||files.reduce((n,f)=>n+f.size,0)>MAX_TOTAL_BYTES)throw Error('Bilder dürfen je 7 MB und insgesamt 90 MB nicht überschreiten.');
   return true;
 }
 let dbPromise;
 function openDB(){
   if(typeof indexedDB==='undefined')return Promise.reject(Error('Dein Browser unterstützt keine lokale Speicherung.'));
   if(dbPromise)return dbPromise;
   dbPromise=new Promise((resolve,reject)=>{
     const req=indexedDB.open('craftsteps-image-guides',1);
     req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('guides'))req.result.createObjectStore('guides',{keyPath:'id'});};
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error||Error('Speicherfehler'));
   }).catch(e=>{dbPromise=null;throw e;});
   return dbPromise;
 }
 async function operation(mode,fn){
   const db=await openDB();
   return new Promise((resolve,reject)=>{
     const tx=db.transaction('guides',mode),req=fn(tx.objectStore('guides'));
     let result;
     req.onsuccess=()=>{result=req.result;};req.onerror=()=>reject(req.error||Error('Speichern fehlgeschlagen.'));
     tx.oncomplete=()=>resolve(result);
     tx.onerror=()=>reject(tx.error||Error('Speichern fehlgeschlagen.'));
     tx.onabort=()=>reject(tx.error||Error('Speichern abgebrochen.'));
   });
 }
 const store={
   all:()=>operation('readonly',s=>s.getAll()),
   get:id=>operation('readonly',s=>s.get(id)),
   save:guide=>{validateGuide(guide);return operation('readwrite',s=>s.put(guide));},
   remove:id=>operation('readwrite',s=>s.delete(id))
 };
 return {diffRegions,validateGuide,validImage,store,MAX_STEPS,MAX_IMAGE_BYTES};
});
