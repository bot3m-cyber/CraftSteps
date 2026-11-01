/* CraftSteps Studio v0.2: browser-local file validation, preview, and private drafts. */
(function(){
'use strict';
const importer=window.CraftStepsSchem,core=window.CraftStepsCore,store=window.CraftStepsDrafts;
const status=document.querySelector('#studio-status'),preview=document.querySelector('#preview');
let parsed=null,loading=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function report(message,cls=''){status.className='studio-status '+cls;status.textContent=message;}
function nameFromFile(filename){return filename.replace(/\.schem$/i,'').replace(/[_-]/g,' ').slice(0,70)||'Mein Minecraft-Bauwerk';}
function getForm(){const name=document.querySelector('#draft-name'),cat=document.querySelector('#draft-category'),diff=document.querySelector('#draft-difficulty'),size=document.querySelector('#draft-size');return {name:name?.value,category:cat?.value,difficulty:diff?.value,maxPerStep:Number(size?.value)};}
function svgCellCanvas(){const canvas=document.querySelector('#plan-preview');if(!canvas||!parsed)return;
 const ratio=Math.min(window.devicePixelRatio||1,2),rect=canvas.getBoundingClientRect(),width=Math.max(250,rect.width),height=Math.max(170,rect.height),ctx=canvas.getContext('2d');
 canvas.width=width*ratio;canvas.height=height*ratio;ctx.scale(ratio,ratio);
 ctx.fillStyle='#e9f1e3';ctx.fillRect(0,0,width,height);
 const scale=Math.min((width-20)/parsed.width,(height-20)/parsed.length),px=(width-scale*parsed.width)/2,py=(height-scale*parsed.length)/2;
 const positions=new Map();for(const b of parsed.blocks){const key=b.x+','+b.z;const old=positions.get(key);if(!old||b.y>=old.y)positions.set(key,b);}
 for(let z=0;z<parsed.length;z++)for(let x=0;x<parsed.width;x++){
 const b=positions.get(x+','+z);const p=px+x*scale,q=py+z*scale;ctx.fillStyle=b?(core.MATERIALS[b.type]?.hex||'#a0a0a0'):'#bad6aa';ctx.fillRect(p+.6,q+.6,Math.max(0,scale-1.2),Math.max(0,scale-1.2));
 if(scale>12){ctx.strokeStyle='rgba(30,45,30,.1)';ctx.strokeRect(p+.5,q+.5,Math.max(0,scale-1),Math.max(0,scale-1));}
 }
 ctx.fillStyle='#213622';ctx.font='bold 11px sans-serif';ctx.fillText('DRAUFSICHT · X →, Z ↓',11,15);
}
async function renderDrafts(){
 const list=document.querySelector('#draft-list'),counter=document.querySelector('#draft-count');
 try{
   const items=await store.all();counter.textContent=String(items.length);
   if(!items.length){list.innerHTML='<p class="studio-muted">Noch keine lokalen Entwürfe gespeichert.</p>';return;}
   list.innerHTML=items.slice().reverse().map(b=>`<div class="studio-draft-row"><div><strong>${esc(b.name)}</strong><p>${b.blocks.length} Blockpositionen · ${b.steps.length} Rohschritte · Privat</p></div><div class="studio-draft-buttons"><a class="studio-btn secondary" href="index.html#${encodeURIComponent(b.id)}">Ansehen</a><button class="studio-btn secondary" data-delete="${esc(b.id)}">Löschen</button></div></div>`).join('');
 }catch(error){list.innerHTML=`<p class="studio-muted">Entwürfe konnten nicht geladen werden: ${esc(error.message)}</p>`;}
}
function renderPreview(filename){if(!parsed)return;
 const draft=importer.draftFromParsed(parsed,nameFromFile(filename));
 const counts=Object.entries(core.countMaterials(draft.blocks)).sort((a,b)=>b[1]-a[1]);
 const unique=counts.length;
 preview.hidden=false;
 preview.innerHTML=`<div class="studio-section-title"><h2>2. Import überprüfen</h2><span class="studio-pill">Sponge V${parsed.version} · Java</span></div>
 <div class="studio-metrics"><div class="studio-metric"><strong>${parsed.blocks.length.toLocaleString('de')}</strong><small>Blockpositionen</small></div><div class="studio-metric"><strong>${parsed.width} × ${parsed.height} × ${parsed.length}</strong><small>Abmessungen</small></div><div class="studio-metric"><strong>${unique}</strong><small>Materialtypen</small></div></div>
 <div class="studio-grid"><div><canvas id="plan-preview" class="studio-canvas" role="img" aria-label="Draufsicht der importierten Blockpositionen"></canvas><p class="studio-muted">Vorläufige Draufsicht. Die vollständige 3D-Bauansicht findest du nach dem Speichern in der Galerie.</p></div><div class="studio-summary"><h3>Vorläufige Materialien</h3>${counts.slice(0,14).map(([key,count])=>`<div class="studio-material"><span><span class="studio-swatch" style="background:${esc(core.MATERIALS[key]?.hex||'#888')}"></span>${esc(core.MATERIALS[key]?.de||key)}</span><strong>×${count}</strong></div>`).join('')}${counts.length>14?`<p class="studio-muted">+ ${counts.length-14} weitere Materialtypen</p>`:''}<p class="studio-caution">Mengen sind vorläufig. Inventargegenstände und Sonderfälle müssen noch überprüft werden.</p></div></div>
 <div class="studio-warnings"><h3>Hinweise zum Import</h3><ul>${parsed.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>
 <div class="studio-section-title"><h2>3. Privaten Entwurf anlegen</h2></div>
 <form id="draft-form" class="studio-form"><div class="studio-field wide"><label for="draft-name"><strong>Name</strong></label><input id="draft-name" maxlength="70" required value="${esc(nameFromFile(filename))}"/></div>
 <div class="studio-field"><label for="draft-category"><strong>Kategorie</strong></label><select id="draft-category">${['Häuser','Mittelalter','Farmen','Burgen','Dekoration','Natur','Redstone'].map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
 <div class="studio-field"><label for="draft-difficulty"><strong>Schwierigkeit</strong></label><select id="draft-difficulty"><option>Leicht</option><option selected>Mittel</option><option>Schwer</option></select></div>
 <div class="studio-field wide"><label for="draft-size"><strong>Maximale Blöcke pro Rohschritt</strong><small>1–32 · Die automatische Reihenfolge ist noch nicht bautechnisch geprüft.</small></label><input id="draft-size" type="number" min="1" max="32" step="1" value="9" required/></div>
 <div class="wide studio-actions"><button class="studio-btn" type="submit" id="save-draft">Privaten Entwurf speichern</button><span class="studio-muted">Das Bauwerk wird lokal im aktuellen Browser gespeichert, nicht öffentlich hochgeladen.</span></div></form>`;
 requestAnimationFrame(svgCellCanvas);
}
async function handleImport(file){if(!file)return;loading=true;parsed=null;preview.hidden=true;report('Importiere und prüfe die Blockdaten …');
 try{const result=await importer.parseSchemFile(file);parsed=result;renderPreview(file.name);report('Datei erfolgreich analysiert. Bitte Hinweise prüfen und als privaten Entwurf speichern.','good');}
 catch(error){parsed=null;report('Import fehlgeschlagen: '+error.message,'error');}
 finally{loading=false;}
}
async function onSave(){if(!parsed||loading)return;const fields=getForm();if(!fields.name?.trim())return report('Bitte Namen eingeben.','error');
 try{loading=true;const draft=importer.draftFromParsed(parsed,fields.name,{maxPerStep:fields.maxPerStep});draft.category=fields.category;draft.difficulty=fields.difficulty;await store.save(draft);report('Entwurf lokal gespeichert. Öffne die Galerie, um die Bauanleitung zu prüfen.','good');await renderDrafts();location.href='index.html#'+encodeURIComponent(draft.id);}
 catch(e){report('Entwurf konnte nicht gespeichert werden: '+e.message,'error');}
 finally{loading=false;}
}
document.querySelector('#schem-file').addEventListener('change',e=>{void handleImport(e.target.files?.[0]);});
document.addEventListener('submit',e=>{if(e.target.id==='draft-form'){e.preventDefault();void onSave();}});
document.addEventListener('click',e=>{const button=e.target.closest('[data-delete]');if(!button)return;const id=button.dataset.delete;if(!confirm('Diesen lokalen Entwurf wirklich löschen?'))return;void store.remove(id).then(()=>{report('Entwurf gelöscht.','good');return renderDrafts();}).catch(err=>report('Löschen fehlgeschlagen: '+err.message,'error'));});
window.addEventListener('resize',()=>requestAnimationFrame(svgCellCanvas));
void renderDrafts();
})();