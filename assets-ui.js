/* CraftSteps vanilla-asset control: private browser-only selection, no server upload. */
(function(){'use strict';
if(typeof document==='undefined')return;
const api=window.CraftStepsAssets?.manager,mount=document.getElementById('asset-manager');if(!api||!mount)return;
function buttonStatus(status){const label=document.getElementById('vanilla-file-text');if(label)label.textContent=status;}
function render(){const info=api.info();mount.className='vanilla-control '+(info.ready?'vanilla-ready':'vanilla-missing');
 mount.innerHTML=`<div class="vanilla-control-text"><strong>Originale Minecraft-Java-Texturen</strong><p id="vanilla-source"></p></div><div class="vanilla-actions"><label class="vanilla-upload">Minecraft-Client (.jar) auswählen<input id="vanilla-file" type="file" accept=".jar,.zip,application/java-archive,application/zip" aria-label="Originale Minecraft-Java-Clientdatei auswählen"></label><button class="vanilla-remove" type="button" id="vanilla-clear" ${info.ready?'':'hidden'}>Entfernen</button></div><div class="vanilla-status" id="vanilla-file-text" role="status" aria-live="polite"></div>`;
 const message=info.ready?`Aktiv: ${info.source} · Texturen werden nur in deinem Browser gelesen. Keine Dateien werden hochgeladen.`:'Wähle deine Minecraft-Java-Clientdatei aus dem Ordner „versions“. Ohne diese Datei zeigt CraftSteps neutrale Platzhalter. Kein offizielles Mojang- oder Microsoft-Produkt.';
 document.getElementById('vanilla-source').textContent=message;
 document.getElementById('vanilla-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;buttonStatus('Lese die Minecraft-Assets …');try{await api.load(file);buttonStatus('Original-Assets geladen. Die 3D-Ansicht wird aktualisiert.');window.dispatchEvent(new CustomEvent('craftsteps:assets'));}catch(err){buttonStatus('Datei nicht geladen: '+err.message);}});
 document.getElementById('vanilla-clear').addEventListener('click',async()=>{try{await api.clear();buttonStatus('Lokale Original-Assets entfernt.');window.dispatchEvent(new CustomEvent('craftsteps:assets'));}catch(err){buttonStatus('Entfernen fehlgeschlagen: '+err.message);}});
}
let prev='';api.subscribe(info=>{const key=info.status+'|'+info.source+'|'+info.ready;if(key!==prev){prev=key;render();}window.dispatchEvent(new CustomEvent('craftsteps:assets'));});
render();void api.restore();
})();
