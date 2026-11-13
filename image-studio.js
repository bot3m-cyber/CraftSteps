/* Image-first guide authoring. All images stay in browser IndexedDB. */
(function(){
 'use strict';
 const api=window.CraftStepsImageGuides;
 const $=id=>document.getElementById(id);
 let images=[],baseline=null,urls=[];
 const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
 function status(msg,error){$('upload-status').textContent=msg;$('upload-status').classList.toggle('img-error',!!error);}
 function clearURLs(){for(const u of urls)URL.revokeObjectURL(u);urls=[];}
 function renderFiles(){
   clearURLs();$('step-count').textContent=images.length+' von 48 Schritten';
   $('step-list').innerHTML=images.map((file,i)=>{
     const url=URL.createObjectURL(file);urls.push(url);
     return '<div class="img-file-row"><img src="'+url+'" alt=""><span><strong>Schritt '+(i+1)+'</strong><small>'+escapeText(file.name)+'</small></span><div class="img-file-tools"><button type="button" data-move="'+i+'" data-delta="-1" aria-label="Schritt nach oben" '+(i===0?'disabled':'')+'>↑</button><button type="button" data-move="'+i+'" data-delta="1" aria-label="Schritt nach unten" '+(i===images.length-1?'disabled':'')+'>↓</button><button type="button" data-delete="'+i+'" aria-label="Schritt entfernen">×</button></div></div>';
   }).join('');
 }
 $('step-files').addEventListener('change',event=>{
   const files=Array.from(event.target.files||[]);
   if(files.length+images.length>api.MAX_STEPS){status('Es sind höchstens 48 Schritte erlaubt.',true);return;}
   const bad=files.find(f=>!api.validImage(f));
   if(bad){status('Nicht unterstützte oder zu große Datei: '+bad.name,true);return;}
   images.push(...files);event.target.value='';renderFiles();status('');
 });
 $('baseline-file').addEventListener('change',event=>{
   const file=event.target.files&&event.target.files[0];
   if(!file)return;
   if(!api.validImage(file)){status('Das Ausgangsbild ist ungültig oder über 7 MB groß.',true);event.target.value='';return;}
   baseline=file;status('Ausgangsbild ausgewählt: '+file.name);
 });
 $('step-list').addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button)return;
   if(button.dataset.delete!==undefined){images.splice(Number(button.dataset.delete),1);}
   else if(button.dataset.move!==undefined){
     const i=Number(button.dataset.move),j=i+Number(button.dataset.delta);
     if(j<0||j>=images.length)return;
     [images[i],images[j]]=[images[j],images[i]];
   }
   renderFiles();
 });
 async function renderSaved(){
   const node=$('saved-guides');
   try{
     const all=(await api.store.all()).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
     $('saved-count').textContent=String(all.length);
     node.innerHTML=all.length?all.map(x=>'<div class="img-saved-row"><div><strong>'+escapeText(x.title)+'</strong><small>'+x.steps.length+' Schritte · Nur auf diesem Gerät</small></div><a class="img-secondary" href="image-guide.html?id='+encodeURIComponent(x.id)+'">Ansehen</a><button type="button" data-remove="'+escapeText(x.id)+'" aria-label="Bildanleitung löschen">×</button></div>').join(''):'<p class="img-muted">Noch keine Anleitungen gespeichert.</p>';
   }catch(e){node.textContent='Deine Entwürfe konnten nicht geladen werden: '+e.message;}
 }
 $('saved-guides').addEventListener('click',async event=>{
   const b=event.target.closest('button[data-remove]');if(!b)return;
   if(!confirm('Diese private Bildanleitung wirklich löschen?'))return;
   try{await api.store.remove(b.dataset.remove);await renderSaved();}
   catch(e){status('Löschen fehlgeschlagen: '+e.message,true);}
 });
 $('save-guide').addEventListener('click',async()=>{
   const title=$('build-title').value.trim();
   if(!title){status('Bitte gib dem Bauwerk zuerst einen Namen.',true);$('build-title').focus();return;}
   if(!images.length){status('Bitte wähle mindestens ein Schrittbild aus.',true);return;}
   const id='img-'+(globalThis.crypto&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
   const guide={id,title,category:$('build-category').value,baseline,steps:images.map((image,i)=>({image,title:'Schritt '+(i+1)})),createdAt:Date.now(),source:'local-images'};
   const button=$('save-guide');button.disabled=true;status('Speichere Bilder ausschließlich in deinem Browser …');
   try{
     await api.store.save(guide);
     location.href='image-guide.html?id='+encodeURIComponent(id);
   }catch(e){status('Speichern fehlgeschlagen: '+e.message,true);button.disabled=false;}
 });
 renderFiles();void renderSaved();
})();
