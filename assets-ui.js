/* CraftSteps original Minecraft asset selector.
   Files never leave the browser; the UI reports whether they were saved. */
(function(){
'use strict';
if(typeof document==='undefined')return;
const api=window.CraftStepsAssets?.manager,mount=document.getElementById('asset-manager');
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
let notice='';
function status(message,error=false){
 notice=message;statusNode.textContent=message;
 statusNode.classList.toggle('vanilla-error',error);
}
function render(){
 const info=api.info();
 const kind=info.kind==='java-client'?'Java-Client':'vollständiges Asset-ZIP';
 const mode=info.status==='loading'?'loading':info.ready?'ready':'missing';
 mount.className='vanilla-control vanilla-'+mode;
 document.getElementById('vanilla-pill').textContent=mode==='loading'?'Wird geladen …':info.ready?'Originaltexturen aktiv':'Nicht geladen';
 const source=document.getElementById('vanilla-source');
 if(mode==='loading')source.textContent='Prüfe Minecraft-Blockstates, Modelle und Texturdateien. Die Datei wird nicht hochgeladen.';
 else if(info.ready)source.textContent=(info.version?'Version '+info.version+' · ':'Version unbekannt · ')+kind+' · '+info.source+'. '+(info.persisted?'Lokal für spätere Besuche gespeichert.':'Nur für diese Sitzung geladen.');
 else source.textContent='Keine Originaltexturen geladen. Wähle deine eigene Minecraft-Java-Client-JAR, damit CraftSteps die tatsächlichen Blocktexturen anzeigen kann.';
 const metrics=document.getElementById('vanilla-metrics');
 metrics.hidden=!info.ready;
 metrics.textContent=info.ready?info.archiveModels+' Modelle und '+info.archiveTextures+' Texturdateien gefunden · '+info.images+' PNGs für die aktuelle Ansicht geladen'+(info.missing?' · '+info.missing+' Blocktypen ohne Modell':''):'';
 pick.disabled=mode==='loading';clear.hidden=!info.ready;clear.disabled=mode==='loading';
 if(!notice&&info.ready&&!info.persisted)statusNode.textContent='Tipp: Die Speicherung konnte eventuell nicht abgeschlossen werden. Details prüfen.';
 const issues=[...(info.diagnostics||[]),...(info.missingTypes||[]).map(id=>'Kein passendes Modell für: minecraft:'+id)].slice(0,15);
 const details=document.getElementById('vanilla-issues');
 details.hidden=issues.length===0;
 document.getElementById('vanilla-issues-title').textContent=issues.length?'Diagnose: '+issues.length+' Hinweise':'Diagnose';
 const list=document.getElementById('vanilla-issues-list');list.replaceChildren();
 for(const msg of issues){const li=document.createElement('li');li.textContent=msg;list.append(li);}
}
pick.addEventListener('change',async()=>{
 const file=pick.files?.[0];if(!file)return;
 status('Lese die Originaldateien …');render();
 try{
  const info=await api.load(file);
  status('Originaltexturen aktiviert'+(info.version?' (Minecraft '+info.version+')':'')+'. '+(info.persisted?'Für spätere Besuche lokal gespeichert.':'Lokal geladen; Speichern war nicht möglich, siehe Diagnose.'),!info.persisted);
 }catch(err){
  status('Minecraft-Datei nicht geladen: '+(err?.message||'Unbekannter Fehler')+'. Die bisherige Texturquelle bleibt unverändert.',true);
 }finally{pick.value='';render();}
});
clear.addEventListener('click',async()=>{
 try{await api.clear();status('Minecraft-Datei und lokale Texturkopie entfernt.');}
 catch(err){status('Datei nicht vollständig entfernt: '+err.message,true);}
 render();
});
api.subscribe(()=>{
 render();
 window.dispatchEvent(new CustomEvent('craftsteps:assets'));
});
render();
void api.restore().then(()=>{
 if(api.info().ready)status('Originaltexturen aus deinem lokalen Browser-Speicher wiederhergestellt.');
 render();
}).catch(err=>{status('Lokale Minecraft-Datei konnte nicht wiederhergestellt werden: '+err.message,true);render();});
})();