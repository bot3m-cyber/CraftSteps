/* CraftSteps image tutorials. Pixel changes are heuristic, not AI or Minecraft block recognition. */
(function(){
 'use strict';
 const api=window.CraftStepsImageGuides,$=id=>document.getElementById(id);
 const id=new URL(location.href).searchParams.get('id');
 const cache=new Map();let guide=null,index=0,revision=0;
 const status=(msg,error)=>{$('diff-status').textContent=msg;$('diff-status').classList.toggle('img-error',!!error);};
 async function decode(blob){
   if(!blob||!blob.size)throw Error('Dieses Bild fehlt.');
   if(typeof createImageBitmap==='function'){
     try{return await createImageBitmap(blob);}catch{/* Try HTML image below. */}
   }
   return new Promise((resolve,reject)=>{
     const url=URL.createObjectURL(blob),img=new Image();
     img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
     img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Bild konnte nicht geöffnet werden.'));};
     img.src=url;
   });
 }
 async function imageAt(step){
   const key=step===-1?'baseline':String(step);
   if(cache.has(key))return cache.get(key);
   const file=step<0?guide.baseline:guide.steps[step].image;
   const decoded=await decode(file);cache.set(key,decoded);
   if(cache.size>5){
     for(const [k,v] of cache){
       if(k===key||k===String(index)||k===String(index-1))continue;
       if(typeof v.close==='function')v.close();cache.delete(k);break;
     }
   }
   return decoded;
 }
 async function renderImage(){
   const token=++revision,canvas=$('image-canvas'),ctx=canvas.getContext('2d');
   if(!ctx)return;
   const current=await imageAt(index);
   if(token!==revision)return;
   const width=Math.max(1,Math.min(1440,current.width)),height=Math.max(1,Math.round(current.height*width/current.width));
   canvas.width=width;canvas.height=height;
   ctx.imageSmoothingEnabled=true;ctx.drawImage(current,0,0,width,height);
   if(!$('show-markings').checked){status('Automatische Markierung ausgeblendet.');return;}
   const previousIndex=index===0?-1:index-1;
   if(previousIndex===-1&&!guide.baseline){status('Schritt 1: Ohne Ausgangsbild gibt es noch keinen vorherigen Zustand zum Vergleichen.');return;}
   const previous=await imageAt(previousIndex);
   if(token!==revision)return;
   if(Math.abs(previous.width/previous.height-current.width/current.height)>.025){
     status('Unterschiedliches Bildformat: Eine zuverlässige Markierung ist nicht möglich.',true);return;
   }
   const sampleWidth=Math.min(600,width),sampleHeight=Math.max(1,Math.round(height*sampleWidth/width));
   const temp=document.createElement('canvas');temp.width=sampleWidth;temp.height=sampleHeight;
   const source=temp.getContext('2d',{willReadFrequently:true});
   source.drawImage(previous,0,0,sampleWidth,sampleHeight);
   const before=source.getImageData(0,0,sampleWidth,sampleHeight);
   source.clearRect(0,0,sampleWidth,sampleHeight);source.drawImage(current,0,0,sampleWidth,sampleHeight);
   const after=source.getImageData(0,0,sampleWidth,sampleHeight);
   const threshold=75+(Number($('sensitivity').value)-50)*1.4;
   const result=api.diffRegions(before,after,{threshold});
   if(token!==revision)return;
   if(!result.reliable){status(result.reason+' Bitte nutze Schrittbilder aus derselben Kameraposition.',true);return;}
   if(!result.regions.length){status(result.reason||'Keine ausreichend großen Änderungen erkannt.');return;}
   const scale=width/sampleWidth;
   ctx.save();ctx.lineJoin='round';
   for(const box of result.regions){
     const x=box.x*scale,y=box.y*scale,w=box.width*scale,h=box.height*scale;
     ctx.strokeStyle='rgba(255,255,255,.94)';ctx.lineWidth=Math.max(3,scale*5);ctx.strokeRect(x,y,w,h);
     ctx.strokeStyle='#ee303c';ctx.lineWidth=Math.max(2,scale*2.5);ctx.strokeRect(x,y,w,h);
   }
   ctx.restore();status(result.regions.length+' veränderte Bildbereiche automatisch markiert (Beta). Keine Block-KI.');
 }
 function showStep(){
   if(!guide)return;
   $('guide-step').textContent='Schritt '+(index+1)+' / '+guide.steps.length;
   const pct=(index+1)/guide.steps.length*100;
   $('guide-percent').textContent=Math.round(pct)+' %';
   $('guide-progress').style.width=pct+'%';
   $('previous').disabled=index===0;$('next').disabled=index===guide.steps.length-1;
   try{localStorage.setItem('craftsteps:image-progress:'+guide.id,String(index));}catch{/* private mode */}
   status('Vergleiche deine Schrittbilder …');
   void renderImage().catch(e=>status('Bildanzeige fehlgeschlagen: '+e.message,true));
 }
 function move(delta){const next=Math.max(0,Math.min(guide.steps.length-1,index+delta));if(next===index)return;index=next;showStep();$('image-canvas').scrollIntoView({behavior:'smooth',block:'center'});}
 $('previous').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));
 $('show-markings').addEventListener('change',showStep);
 $('sensitivity').addEventListener('input',showStep);
 document.addEventListener('keydown',event=>{
   if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
   if(event.key==='ArrowRight'){move(1);event.preventDefault();}
   if(event.key==='ArrowLeft'){move(-1);event.preventDefault();}
 });
 async function init(){
   try{
     if(!id)throw Error('Keine Bildanleitung ausgewählt.');
     guide=await api.store.get(id);
     if(!guide)throw Error('Diese private Bildanleitung wurde in diesem Browser nicht gefunden.');
     $('guide-title').textContent=guide.title;
     $('guide-meta').textContent=guide.category+' · '+guide.steps.length+' Schrittbilder · Nur lokal gespeichert';
     try{index=Math.max(0,Math.min(guide.steps.length-1,Number(localStorage.getItem('craftsteps:image-progress:'+guide.id))||0));}catch{}
     $('guide-loading').hidden=true;$('guide-content').hidden=false;showStep();
   }catch(error){$('guide-loading').textContent=error.message+' Du kannst im Bildstudio eine Anleitung erstellen.';}
 }
 void init();
})();
