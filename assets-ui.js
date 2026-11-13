/* CraftSteps original Minecraft asset selector.
   Files never leave the browser; the UI reports whether they were saved. */
(function(){
'use strict';
if(typeof document==='undefined')return;
const assets=window.CraftStepsAssets,api=assets?.manager,mount=document.getElementById('asset-manager');
if(!api||!mount)return;
mount.innerHTML=[
 '<div class="vanilla-control-main">',
  '<div class="vanilla-control-head"><span class="vanilla-eyebrow">MINECRAFT JAVA</span><strong>Originaltexturen</strong><span class="vanilla-pill" id="vanilla-pill">Nicht geladen</span></div>',
  '<p class="vanilla-description" id="vanilla-source">Prüfe lokale Dateien …</p>',
  '<p class="vanilla-metrics" id="vanilla-metrics" hidden></p>',
 '</div>',
 '<div class="vanilla-actions">',
  '<label class="vanilla-upload" for="vanilla-file">Minecraft-Datei auswählen<input id="vanilla-file" type="file" accept=".jar,.zip,application/java-archive,application/zip" aria-label="Eigene Minecraft Java Client JAR oder vollständiges Vanilla Asset ZIP auswählen"></label>',
  '<button class="vanilla-remove" type="button" id="vanilla-clear" hidden>Entfernen</button>',
  '<button class="vanilla-remove" type="button" data-auto-textures hidden>Erneut laden</button>',
 '</div>',
 '<div class="vanilla-status" id="vanilla-file-text" role="status" aria-live="polite"></div>',
 '<details class="vanilla-help"><summary>Wo finde ich meine Minecraft-Datei?</summary>',
  '<p>Windows: <code>%APPDATA%\\.minecraft\\versions</code> öffnen, den Ordner deiner installierten Java-Version auswählen und die gleichnamige <code>.jar</code>-Datei laden.</p>',
  '<p>Handy: Kopiere deine eigene Java-Clientdatei vom PC auf dein Gerät und wähle sie hier aus. Die Webseite kann Minecraft-Dateien nicht automatisch finden.</p>',
  '<p>Ein ZIP muss vollständige Blockstates, Modelle und Texturen enthalten. Einzelne Texture-Only-Resource-Packs können nicht allein als vollständige Vanilla-Quelle verwendet werden.</p>',
 '</details>',
 '<details class="vanilla-issues" id="vanilla-issues" hidden><summary id="vanilla-issues-title">Fehlende Modelle und Diagnose</summary><ul id="vanilla-issues-list"></ul></details>'
].join('');
const pick=document.getElementById('vanilla-file');
const clear=document.getElementById('vanilla-clear');
const statusNode=document.getElementById('vanilla-file-text');
let notice='',download=null,downloadFailed=false;
function status(message,error=false){
 notice=message;statusNode.textContent=message;
 statusNode.classList.toggle('vanilla-error',error);
 const feedback=document.getElementById('imm-assets-feedback');
 if(feedback){feedback.textContent=message;feedback.classList.toggle('vanilla-error',error);}
}
function render(){
 const info=api.info();
 const kind=info.kind==='java-client'?'Java-Client':'vollständiges Asset-ZIP';
 const mode=info.ready?'ready':download||info.status==='loading'?'loading':'missing';
 mount.className='vanilla-control vanilla-'+mode;
 document.getElementById('vanilla-pill').textContent=mode==='loading'?'Wird geladen …':info.ready?'Originaltexturen aktiv':'Nicht geladen';
 const source=document.getElementById('vanilla-source');
 if(mode==='loading')source.textContent=download?'Lädt Minecraft Java 1.21.1 direkt von Mojang …':'Prüft die ausgewählte Minecraft-Datei …';
 else if(info.ready)source.textContent=(info.version?'Version '+info.version+' · ':'Version unbekannt · ')+kind+' · '+info.source+'. '+(info.persisted?'Lokal für spätere Besuche gespeichert.':'Nur für diese Sitzung geladen.');
 else source.textContent='Minecraft-Originaltexturen sind gerade nicht verfügbar.';
 const metrics=document.getElementById('vanilla-metrics');
 metrics.hidden=!info.ready;
 metrics.textContent=info.ready?info.archiveModels+' Modelle und '+info.archiveTextures+' Texturdateien gefunden · '+info.images+' PNGs für die aktuelle Ansicht geladen'+(info.missing?' · '+info.missing+' Blocktypen ohne Modell':''):'';
 pick.disabled=info.status==='loading';
 const fullscreenInput=document.getElementById('immersive-vanilla-file');
 if(fullscreenInput)fullscreenInput.disabled=pick.disabled;
 for(const retry of document.querySelectorAll?.('[data-auto-textures]')||[])retry.hidden=!downloadFailed||!!download;clear.hidden=!info.ready;clear.disabled=mode==='loading';
 if(!notice&&info.ready&&!info.persisted)statusNode.textContent='Tipp: Die Speicherung konnte eventuell nicht abgeschlossen werden. Details prüfen.';
 const issues=[...(info.diagnostics||[]),...(info.missingTypes||[]).map(id=>'Kein passendes Modell für: minecraft:'+id)].slice(0,15);
 const details=document.getElementById('vanilla-issues');
 details.hidden=issues.length===0;
 document.getElementById('vanilla-issues-title').textContent=issues.length?'Diagnose: '+issues.length+' Hinweise':'Diagnose';
 const list=document.getElementById('vanilla-issues-list');list.replaceChildren();
 for(const msg of issues){const li=document.createElement('li');li.textContent=msg;list.append(li);}
 // The immersive viewer is already mounted when a file finishes loading.
 // Refresh these labels in-place without resetting the camera or 3D animation.
 const indicator=document.getElementById('imm-assets-indicator');
 if(indicator){
   const panel=indicator.closest?.('.imm-asset-panel');
   if(panel)panel.hidden=info.ready;
   indicator.textContent=info.ready?'Originaltexturen aktiv'+(info.version?' · '+info.version:''):mode==='loading'?'Originaltexturen werden geladen …':'Originaltexturen fehlen';
   indicator.className=info.ready?'imm-asset-ready':'imm-asset-missing';
   const action=document.getElementById('imm-assets-button-label');
   if(action)action.textContent=info.ready?'Minecraft-Datei wechseln':'Originaltexturen laden';
   const help=document.getElementById('imm-assets-help');
   if(help)help.textContent=info.ready?'Originaldatei lokal geladen; keine Dateien hochgeladen.':'Bei Bedarf eine eigene Minecraft-Java-Datei auswählen (.jar).';
 }
}
async function loadUserFile(file){
 if(!file||api.info().status==='loading')return;
 download?.abort();download=null;downloadFailed=false;
 status('Lese die Originaldateien …');render();
 try{
  const info=await api.load(file);
  status('Originaltexturen aktiviert'+(info.version?' (Minecraft '+info.version+')':'')+'. '+(info.persisted?'Für spätere Besuche lokal gespeichert.':'Lokal geladen; Speichern war nicht möglich, siehe Diagnose.'),!info.persisted);
 }catch(err){
  status('Minecraft-Datei nicht geladen: '+(err?.message||'Unbekannter Fehler')+'. Die bisherige Texturquelle bleibt unverändert.',true);
 }finally{render();}
}
pick.addEventListener('change',async()=>{
 const file=pick.files?.[0];
 await loadUserFile(file);
 pick.value='';
});
// The fullscreen control uses its own native file picker. Event delegation
// survives the viewer being rebuilt on step changes and works on Android.
document.addEventListener('change',async event=>{
 const input=event.target;
 if(input?.id!=='immersive-vanilla-file')return;
 const file=input.files?.[0];
 await loadUserFile(file);
 input.value='';
});
clear.addEventListener('click',async()=>{
 try{await api.clear();status('Minecraft-Datei und lokale Texturkopie entfernt.');}
 catch(err){status('Datei nicht vollständig entfernt: '+err.message,true);}
 render();
});
window.addEventListener?.('craftsteps:view',render);
api.subscribe(()=>{
 render();
 window.dispatchEvent(new CustomEvent('craftsteps:assets'));
});
async function loadOfficial(){
 if(download||api.info().ready||api.info().status==='loading'||!assets.fetchDefaultClient)return;
 const controller=new AbortController();
 download=controller;
 const timeout=setTimeout(()=>controller.abort(),45000);
 status('');
 render();
 try{
  const file=await assets.fetchDefaultClient(controller.signal);
  if(download!==controller)return;
  await api.load(file);
  downloadFailed=false;
 }catch{
  if(download!==controller)return;
  downloadFailed=true;
  status('Automatisches Laden fehlgeschlagen. Erneut versuchen oder eigene Minecraft-Datei auswählen.',true);
 }finally{
  clearTimeout(timeout);
  if(download===controller){download=null;render();}
 }
}
document.addEventListener('click',event=>{
 if(event.target.closest?.('[data-auto-textures]'))void loadOfficial();
});
render();
void api.restore().then(()=>{
 if(api.info().ready)status('Originaltexturen aus deinem lokalen Browser-Speicher wiederhergestellt.');
 else void loadOfficial();
 render();
}).catch(err=>{status('Lokale Minecraft-Datei konnte nicht wiederhergestellt werden: '+err.message,true);render();});
})();