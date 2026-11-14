/* CraftSteps v0.2 – Galerie + private importierte Schematic-Entwürfe */
(function(){
'use strict';
const core=window.CraftStepsCore, {builds,MATERIALS,countMaterials,stepState,stacks}=core;
const visuals=window.CraftStepsVisuals;
const tr={
 de:{onboardTitle:'Was möchtest du bauen?',onboardSub:'Wähle deine Lieblingsthemen – passende Bauwerke erscheinen zuerst. Du kannst das jederzeit ändern.',onboardStart:'Los geht’s',onboardSkip:'Überspringen',forYou:'Für dich',interests:'Interessen',interestsHint:'Bestimmt, welche Bauwerke zuerst erscheinen.',edit:'Ändern',offlineReady:'App-Dateien offline gespeichert. Minecraft-Texturen benötigen einen abgeschlossenen ersten Download.',discover:'Entdecke neue Bauideen',subtitle:'Schritt für Schritt. Block für Block.',all:'Alle',fav:'Favoriten',cat:'Kategorien',popular:'Bauwerke entdecken',works:'Bauwerke',search:'Bauwerke, Stile oder Materialien suchen',allDifficulty:'Alle Stufen',easy:'Leicht',medium:'Mittel',hard:'Schwer',steps:'Schritte',build:'Bau starten',continue:'Bau fortsetzen',materials:'Materialliste',viewMaterials:'Alle Materialien',about:'Über dieses Bauwerk',goBack:'Zurück',next:'Weiter',blocks:'Blöcke',items:'Gegenstände',materialTypes:'Materialarten',gathered:'gesammelt',copy:'Liste kopieren',export:'Als Text exportieren',settings:'Einstellungen',appearance:'Darstellung',theme:'Design',language:'Sprache',edition:'Minecraft-Edition',light:'Hell',dark:'Dunkel',reset:'Lokale Daten zurücksetzen',progress:'Fortschritt',info:'App-Informationen',demo:'Originale Demo-Bauwerke',license:'CraftSteps ist ein unabhängiges Projekt. Die Illustrationen stammen aus selbst definierten Blockkoordinaten, nicht aus WBuilds.',empty:'Keine Bauwerke gefunden',emptyHint:'Versuche eine andere Suche oder Kategorie.',difficulty:'Schwierigkeit',category:'Kategorie',size:'Abmessungen',version:'Minecraft-Version',share:'Teilen',rot:'Drehen',zoomIn:'Vergrößern',zoomOut:'Verkleinern',highlight:'Farbig umrandet = im aktuellen Schritt platzieren',marked:'Bereits besorgt',none:'Keine Materialien gefunden',finish:'Letzter Schritt erreicht',step:'Schritt',hold:'Sponge-.schem-Import im Studio (lokale Entwürfe), noch keine Server-Synchronisierung.',latest:'Zuletzt bearbeitet',save:'Lokal gespeichert',resetQuestion:'Lokale Favoriten, Materialhäkchen und Baufortschritte wirklich löschen?',resetDone:'Lokale Daten wurden gelöscht.',shareCopied:'Link kopiert.',copied:'Materialliste kopiert.',copyFailed:'Kopieren nicht verfügbar.',favOnly:'Nur Favoriten',view:'Ansehen',guide:'Bauanleitung',allCategories:'Alle Kategorien',your:'Für dein nächstes Bauprojekt',viewStep:'Schritt ansehen',materialTotal:'Materialien gesamt',settingsNote:'Diese Einstellungen werden nur in diesem Browser gespeichert.'},
 en:{onboardTitle:'What do you want to build?',onboardSub:'Pick your favorite themes – matching builds show up first. You can change this any time.',onboardStart:'Let’s go',onboardSkip:'Skip',forYou:'For you',interests:'Interests',interestsHint:'Decides which builds appear first.',edit:'Change',offlineReady:'App files saved offline. Minecraft textures need a completed initial download.',discover:'Discover your next build',subtitle:'Step by step. Block by block.',all:'All',fav:'Favorites',cat:'Categories',popular:'Explore builds',works:'builds',search:'Search builds, styles or materials',allDifficulty:'All levels',easy:'Easy',medium:'Medium',hard:'Hard',steps:'steps',build:'Start building',continue:'Continue building',materials:'Material list',viewMaterials:'All materials',about:'About this build',goBack:'Back',next:'Next',blocks:'Blocks',items:'items',materialTypes:'material types',gathered:'collected',copy:'Copy list',export:'Export as text',settings:'Settings',appearance:'Appearance',theme:'Theme',language:'Language',edition:'Minecraft edition',light:'Light',dark:'Dark',reset:'Reset local data',progress:'Progress',info:'About CraftSteps',demo:'Original demo builds',license:'CraftSteps is an independent project. Its illustrations come from original block coordinates, not WBuilds assets.',empty:'No builds found',emptyHint:'Try another search or category.',difficulty:'Difficulty',category:'Category',size:'Dimensions',version:'Minecraft version',share:'Share',rot:'Rotate',zoomIn:'Zoom in',zoomOut:'Zoom out',highlight:'Colored outlines = place these blocks now',marked:'Already collected',none:'No materials found',finish:'Final step reached',step:'Step',hold:'Local Sponge .schem draft imports in Studio, no server synchronization yet.',latest:'Updated',save:'Saved locally',resetQuestion:'Delete local favorites, checked materials, and build progress?',resetDone:'Local data deleted.',shareCopied:'Link copied.',copied:'Material list copied.',copyFailed:'Copy is unavailable.',favOnly:'Favorites only',view:'View',guide:'Guide',allCategories:'All categories',your:'For your next building project',viewStep:'View step',materialTotal:'Total materials',settingsNote:'These preferences are saved only in this browser.'}
};
const icons={
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.06 1.57V21h-2.5v-.09a1.7 1.7 0 0 0-1.06-1.57 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 7.1 15 1.7 1.7 0 0 0 5.53 14H5v-2.5h.53A1.7 1.7 0 0 0 7.1 10.44a1.7 1.7 0 0 0-.34-1.88L6.7 8.5l1.8-1.8.06.06A1.7 1.7 0 0 0 10.44 7.1 1.7 1.7 0 0 0 11.5 5.53V5H14v.53a1.7 1.7 0 0 0 1.06 1.57 1.7 1.7 0 0 0 1.88-.34L17 6.7l1.8 1.8-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20 11.5h.5V14H20a1.7 1.7 0 0 0-.6 1z"/>',
 search:'<circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/>',
 back:'<path d="m15 18-6-6 6-6"/>',
 heart:'<path d="M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/>',
 share:'<path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M5 13v7h14v-7"/>',
 box:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"/>',
 play:'<path d="m8 4 12 8-12 8V4z"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 next:'<path d="m9 18 6-6-6-6"/>',
 rotate:'<path d="M20 7v5h-5"/><path d="M3.3 10A9 9 0 0 1 20 12l-5-5M4 17v-5h5M20.7 14A9 9 0 0 1 4 12l5 5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',folder:'<path d="M3 6h7l2 3h9v11H3z"/>',shield:'<path d="M12 2 3 6v7c0 6 9 9 9 9s9-3 9-9V6z"/>',layers:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>'
};
function ic(name){return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.box}</svg>`;}
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function get(key, fallback){try{const val=localStorage.getItem('craftsteps:'+key);return val==null?fallback:JSON.parse(val);}catch{return fallback;}}
function put(key,value){try{localStorage.setItem('craftsteps:'+key,JSON.stringify(value));}catch{/* private mode */}}
const state={yaw:Math.PI/4,pitch:.58,view:get('onboarded',false)?'home':'onboarding',interests:get('interests',[]),onboarded:get('onboarded',false),id:builds[0].id,category:'Alle',query:'',filter:'all',sort:'recommended',size:'all',materialQuery:'',searchOpen:true,rotation:0,zoom:1,followStep:true,immersive3D:false,guideMode:'image',animateSteps:get('animateSteps',true),theme:get('theme','light'),edition:get('edition','Java'),lang:get('lang','de'),favorites:get('favorites',[]),progress:get('progress',{}),collected:get('collected',{})};
const motion={token:0,progress:1,from:[]};
let autoplay=0;
function pauseGuide(){
 clearTimeout(autoplay);
 autoplay=0;
 const button=document.querySelector('[data-action="play-guide"]');
 if(button){button.textContent='▶ Abspielen';button.setAttribute('aria-pressed','false');}
}
function playGuide(){
 const build=findBuild();
 if((state.progress[build.id]||1)>=build.steps.length)changeGuideStep(1);
 function schedule(){
  const button=document.querySelector('[data-action="play-guide"]');
  if(!button||!state.immersive3D){pauseGuide();return;}
  button.textContent='Ⅱ Pause';
  button.setAttribute('aria-pressed','true');
  autoplay=setTimeout(()=>{
   const current=state.progress[build.id]||1;
   if(current>=build.steps.length){pauseGuide();return;}
   changeGuideStep(current+1);
   schedule();
  },1400);
 }
 schedule();
}
function startStepMotion(previous=[]){
 motion.token++;motion.from=Array.isArray(previous)?previous:[];motion.progress=1;
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(state.guideMode==='image'||!state.animateSteps||reduced){requestAnimationFrame(drawAll);return;}
 motion.progress=0;
 const token=motion.token,begin=performance.now(),duration=720;
 function tick(now){
   if(token!==motion.token||state.view!=='guide')return;
   const t=Math.max(0,Math.min(1,(now-begin)/duration));
   motion.progress=1-Math.pow(1-t,3);
   document.querySelectorAll('canvas[data-context="guide"]').forEach(drawCanvas);
   if(t<1)requestAnimationFrame(tick);
   else motion.from=[];
 }
 requestAnimationFrame(tick);
}
function changeGuideStep(next){
 const b=findBuild(),current=state.progress[b.id]||1;
 next=Math.max(1,Math.min(b.steps.length,Math.round(Number(next)||current)));
 if(next===current)return;
 const previous=stepState(b,current).current;
 state.progress[b.id]=next;put('progress',state.progress);
 render();startStepMotion(previous);revealStepViewer();
}
const T=()=>tr[state.lang]||tr.de;
const findBuild=()=>builds.find(b=>b.id===state.id)||builds[0];
const loc=(type)=>MATERIALS[type]?.[state.lang]||type;
const diff=(value)=>({'Leicht':T().easy,'Mittel':T().medium,'Schwer':T().hard}[value]||value);
const CATEGORY_ORDER=['Häuser','Burgen','Farmen','Portale','Dekoration','Statuen','Redstone','Survival-Basen','Innenräume','Natur','Mittelalter'];
const CAT_EN={'Häuser':'Houses','Burgen':'Castles','Farmen':'Farms','Portale':'Portals','Dekoration':'Decoration','Statuen':'Statues','Redstone':'Redstone','Survival-Basen':'Survival bases','Innenräume':'Interiors','Natur':'Nature','Mittelalter':'Medieval'};
const catLabel=c=>state.lang==='en'?(CAT_EN[c]||c):c;
const categoryList=()=>{const used=[...new Set(builds.map(b=>b.category))];return [...CATEGORY_ORDER.filter(c=>used.includes(c)),...used.filter(c=>!CATEGORY_ORDER.includes(c))];};
const cats=()=>['Alle','Favoriten',...categoryList()];
function showOfflineNote(msg){const host=document.getElementById('offline-note');if(!host)return;host.innerHTML='<span></span><button type="button" aria-label="Hinweis schließen">×</button>';host.firstChild.textContent=msg;host.hidden=false;host.querySelector('button').onclick=()=>{host.hidden=true;};}
function toast(msg){const node=document.getElementById('toast');node.textContent=msg;node.classList.add('toast-active');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('toast-active'),2400);}
function btn(name,label,act,opts={}){return `<button class="icon-button ${opts.cls||''}" data-action="${act}" aria-label="${esc(label)}" title="${esc(label)}">${ic(name)}</button>`;}
function header(){let detail=state.view!=='home',go=detail?'back':'settings',left=btn(detail?'back':'settings',detail?T().goBack:T().settings,go),right=state.view==='home'?btn('search',T().search,'toggle-search'):state.view==='detail'?btn('heart',T().fav,'favorite')+btn('share',T().share,'share'):state.view==='guide'?btn('rotate',T().rot,'rotate'):btn('search',T().search,'toggle-search');return `<header class="topbar"><div class="side">${left}</div><button data-action="home" class="brand" aria-label="CraftSteps Startseite">CRAFT<span>STEPS</span><small>BAUANLEITUNGEN</small></button><div class="side">${right}</div></header>`;}
function bottomNav(){
 return '<nav class="craft-app-nav" aria-label="CraftSteps Navigation">'+
 '<button type="button" data-action="home" class="'+(state.view==='home'&&state.category!=='Favoriten'?'active':'')+'">'+ic('box')+'<span>Entdecken</span></button>'+
 '<a href="image-studio.html">'+ic('plus')+'<span>Erstellen</span></a>'+
 '<button type="button" data-action="show-favorites" class="'+(state.view==='home'&&state.category==='Favoriten'?'active':'')+'">'+ic('heart')+'<span>Favoriten</span></button>'+
 '<button type="button" data-action="settings" class="'+(state.view==='settings'?'active':'')+'">'+ic('settings')+'<span>Optionen</span></button></nav>';
}
function card(build){const fav=state.favorites.includes(build.id);return `<article class="build-card"><button class="art-button" data-action="detail" data-id="${build.id}" aria-label="${esc(build.name)} ${T().view}"><canvas class="voxel" data-build="${build.id}" data-context="card" role="img" aria-label="3D-Vorschau: ${esc(build.name)}"></canvas></button><button class="favorite-float ${fav?'active':''}" data-action="favorite" data-id="${build.id}" aria-pressed="${fav}" aria-label="${fav?'Favorit entfernen':'Als Favorit markieren'}">${ic('heart')}</button><button class="card-label" style="background:none;border:0;padding-left:0;text-align:left;width:100%" data-action="detail" data-id="${build.id}">${esc(build.name)}</button><div class="card-sub"><span>${build.steps.length} ${T().steps}</span><span class="difficulty">${build.draft?'Privater Entwurf':diff(build.difficulty)}</span></div></article>`;}
function visibleBuilds(){
 const list=builds.filter(b=>{
  const count=b.blocks.length;
  const size=state.size==='all'||(state.size==='small'&&count<250)||(state.size==='medium'&&count>=250&&count<1000)||(state.size==='large'&&count>=1000);
  return size&&(state.category==='Alle'||(state.category==='Favoriten'?state.favorites.includes(b.id):b.category===state.category))&&(state.filter==='all'||b.difficulty===state.filter)&&(state.edition==='Pocket'||b.editions.includes(state.edition))&&(!state.query||[b.name,b.category,b.difficulty,...b.tags,...Object.keys(countMaterials(b.blocks)).map(loc)].join(' ').toLocaleLowerCase().includes(state.query.toLocaleLowerCase()));
 });
 const date=b=>Date.parse(b.updated)||0;
 const difficulty=b=>['Leicht','Mittel','Schwer'].indexOf(b.difficulty);
 const compare={
  newest:(a,b)=>date(b)-date(a),
  oldest:(a,b)=>date(a)-date(b),
  difficulty:(a,b)=>difficulty(a)-difficulty(b),
  steps:(a,b)=>a.steps.length-b.steps.length,
  size:(a,b)=>a.blocks.length-b.blocks.length,
  name:(a,b)=>a.name.localeCompare(b.name,state.lang),
  recommended:(a,b)=>Number(state.interests.includes(b.category))-Number(state.interests.includes(a.category))
 };
 return list.sort(compare[state.sort]||compare.recommended);
}
function galleryFilters(){
 const en=state.lang==='en';
 const sorts=en?['For you','Newest','Oldest','Difficulty','Fewest steps','Fewest blocks','Name']:['Für dich','Neueste','Älteste','Schwierigkeit','Wenigste Schritte','Wenigste Blöcke','Name'];
 const sizes=en?['All sizes','Small · under 250 blocks','Medium · 250–999 blocks','Large · 1,000+ blocks']:['Alle Größen','Klein · unter 250 Blöcke','Mittel · 250–999 Blöcke','Groß · ab 1.000 Blöcken'];
 return '<div class="gallery-filters"><label>'+ (en?'Sort by':'Sortieren')+'<select id="build-sort" class="select">'+['recommended','newest','oldest','difficulty','steps','size','name'].map((id,i)=>'<option value="'+id+'" '+(state.sort===id?'selected':'')+'>'+sorts[i]+'</option>').join('')+'</select></label><label>'+(en?'Size':'Größe')+'<select id="build-size" class="select">'+['all','small','medium','large'].map((id,i)=>'<option value="'+id+'" '+(state.size===id?'selected':'')+'>'+sizes[i]+'</option>').join('')+'</select></label><button class="secondary" data-action="clear-filters">'+(en?'Reset filters':'Filter zurücksetzen')+'</button></div>';
}
function dimensions(build){
 const xs=build.blocks.map(b=>b.x),ys=build.blocks.map(b=>b.y),zs=build.blocks.map(b=>b.z);
 const width=Math.max(...xs)-Math.min(...xs)+1,height=Math.max(...ys)-Math.min(...ys)+1,depth=Math.max(...zs)-Math.min(...zs)+1;
 return '<details class="build-dimensions"><summary>'+width+' × '+height+' × '+depth+' '+(state.lang==='en'?'blocks':'Blöcke')+'</summary><p>'+(state.lang==='en'?'Width × height × depth. Ground area':'Breite × Höhe × Tiefe. Grundfläche')+' '+width+' × '+depth+' = '+width*depth+' '+(state.lang==='en'?'blocks':'Blöcke')+'.</p></details>';
}
function onboarding(){const chosen=state.interests;return `<main class="onboarding" aria-labelledby="ob-title"><div class="ob-brand">CRAFT<span>STEPS</span></div><h1 id="ob-title" class="page-title">${T().onboardTitle}</h1><p class="subtext">${T().onboardSub}</p><div class="interest-grid" role="group" aria-label="${T().interests}">${categoryList().map(c=>`<button type="button" class="interest-chip ${chosen.includes(c)?'active':''}" data-action="toggle-interest" data-id="${esc(c)}" aria-pressed="${chosen.includes(c)}">${chosen.includes(c)?ic('check'):''}${esc(catLabel(c))}</button>`).join('')}</div><div class="ob-actions"><button type="button" class="primary block" data-action="finish-onboarding">${T().onboardStart}</button><button type="button" class="small-link" data-action="skip-onboarding">${T().onboardSkip}</button></div></main>`;}
function home(){const list=visibleBuilds(),personal=state.sort==='recommended'&&state.category==='Alle'&&!state.query&&state.interests.length>0;return `<main class="content catalog"><h1 class="page-title">${T().discover}</h1><p class="subtext">${T().subtitle}</p>${state.searchOpen?`<div class="search-area"><label class="search-box">${ic('search')}<input id="search-input" placeholder="${esc(T().search)}" aria-label="${esc(T().search)}" value="${esc(state.query)}" autocomplete="off"></label><select id="difficulty" aria-label="${T().difficulty}" class="select"><option value="all">${T().allDifficulty}</option>${['Leicht','Mittel','Schwer'].map(d=>`<option value="${d}" ${state.filter===d?'selected':''}>${diff(d)}</option>`).join('')}</select></div>`:''}<nav class="category-rail" aria-label="${T().cat}">${cats().map(c=>`<button class="category-pill ${state.category===c?'active':''}" data-action="category" data-id="${c}" aria-pressed="${state.category===c}">${c==='Favoriten'?ic('heart'):({Häuser:'🏠',Burgen:'🏰',Farmen:'🌾',Dekoration:'🪴',Redstone:'🕹️',Portale:'🟣',Statuen:'🗿',Natur:'🌳'})[c]||''} ${c==='Alle'?T().all:c==='Favoriten'?T().fav:catLabel(c)}</button>`).join('')}</nav>${galleryFilters()}<div class="filter-row"><div class="section-heading"><h2>${state.category==='Alle'?(personal?T().forYou:T().popular):state.category==='Favoriten'?T().fav:catLabel(state.category)}</h2><span class="caption-pill">${list.length} ${T().works}</span></div></div><section class="gallery" aria-label="${T().popular}">${list.length?list.map(card).join(''):`<div class="empty-state">${ic('search')}<strong>${T().empty}</strong>${T().emptyHint}</div>`}</section><details class="catalog-tools"><summary>${state.lang==='en'?'Create a guide':'Anleitung erstellen'}</summary><button type="button" class="secondary" data-action="example-image-guide">${state.lang==='en'?'Try an image guide':'Beispiel: Bildanleitung ansehen'}</button><section class="guide-options" aria-label="Art der Bauanleitung"><a class="guide-option" href="studio.html"><strong>3D-Anleitung</strong><span>Bauplan importieren, drehen und Block für Block bauen.</span></a><a class="guide-option" href="image-studio.html"><strong>Bilder-Anleitung</strong><span>Schrittbilder hochladen oder gespeicherte Bildanleitungen öffnen.</span></a></section></details><p class="footer-note">CraftSteps v0.10.6 · ${T().license}</p></main>`;}
function materialStyle(type){
 const color=MATERIALS[type]?.hex;
 return '--material-color:'+(/^#[0-9a-f]{6}$/i.test(color||'')?color:'#8999ac');
}
function matIcon(type){return `<canvas class="mat-icon" data-mat-icon="${esc(type)}" width="48" height="48" aria-hidden="true"></canvas>`;}
function materialPairs(build){
 return Object.entries(countMaterials(build.blocks)).sort(([a],[b])=>loc(a).localeCompare(loc(b),state.lang));
}
function materialPreview(pairs){
 return `<section class="detail-materials"><div class="section-heading"><h2>${T().materials}</h2><button class="small-link" data-action="materials">${T().viewMaterials} →</button></div><p class="subtext">${pairs.reduce((sum,[,count])=>sum+count,0)} ${T().items} · ${pairs.length} ${T().materialTypes}</p><div class="preview-tiles">${pairs.slice(0,8).map(([type,count])=>`<div class="step-item">${matIcon(type)}<span>${esc(loc(type))}</span><strong>× ${count}</strong></div>`).join('')}</div></section>`;
}
function detail(){
 const b=findBuild(),progress=state.progress[b.id],pairs=materialPairs(b);
 const total=pairs.reduce((sum,[,count])=>sum+count,0);
 const view=state.detailAngle||0, en=state.lang==='en';
 const labels=en?['Front','Side','Above']:['Vorne','Seite','Oben'];
 return `<main class="content build-detail">
 <div class="build-showcase">
  <div class="detail-hero"><canvas class="voxel" data-build="${esc(b.id)}" data-context="hero" role="img" aria-label="${esc(b.name)} · ${labels[view]}"></canvas>
   <div class="showcase-overlay">${dimensions(b)}<span>${view+1} / ${labels.length}</span></div>
  </div>
  <div class="detail-angles" role="group" aria-label="${en?'Preview angle':'Vorschauperspektive'}">${labels.map((label,i)=>`<button class="secondary" data-action="detail-angle" data-id="${i}" aria-pressed="${i===view}">${label}</button>`).join('')}</div>
 </div>
 <div class="detail-body">
  <p class="detail-category">${esc(catLabel(b.category))}</p>
  <h1 class="detail-name">${esc(b.name)}</h1>
  <p class="detail-description">${esc(b.description)}</p>
  <div class="edition-tags">${b.editions.map(x=>`<span class="edition-tag">${esc(x)}</span>`).join('')}</div>
  <dl class="detail-facts"><div><dt>${T().difficulty}</dt><dd>${diff(b.difficulty)}</dd></div><div><dt>${T().steps}</dt><dd>${b.steps.length}</dd></div><div><dt>${T().materials}</dt><dd>${total}</dd></div></dl>
  ${b.draft?`<p class="draft-notice">${en?'Local draft · check the suggested steps before building.':'Lokaler Entwurf · prüfe die vorgeschlagenen Schritte vor dem Bauen.'}</p>`:''}
  <button class="primary block" data-action="${progress?'guide':'materials'}">${ic('play')} ${progress?T().continue:T().build}</button>
  ${progress?`<p class="subtext">${T().step} ${progress} / ${b.steps.length}</p>`:''}
  ${materialPreview(pairs)}
 </div></main>`;
}
function mats(){const b=findBuild(),pairs=materialPairs(b),filtered=pairs.filter(([k])=>loc(k).toLocaleLowerCase().includes(state.materialQuery.toLocaleLowerCase())),marked=state.collected[b.id]||[],tot=pairs.reduce((sum,p)=>sum+p[1],0),done=pairs.filter(([k])=>marked.includes(k)).reduce((s,p)=>s+p[1],0);return `<main class="content material-page"><h1 class="material-hero">${T().materials}</h1><div class="material-intro"><span>${esc(b.name)}</span><span>${pairs.length} ${T().materialTypes} · ${tot} ${T().items}</span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${tot?Math.round(100*done/tot):0}" aria-label="${T().gathered}"><div class="progress-fill" style="width:${tot?100*done/tot:0}%"></div></div><div class="material-actions"><p class="subtext">${done} / ${tot} ${T().gathered}</p><button class="small-link" data-action="reset-materials" ${marked.length?'':'disabled'}>${state.lang==='en'?'Reset checklist':'Häkchen zurücksetzen'}</button></div><div class="search-area"><label class="search-box">${ic('search')}<input id="material-search" placeholder="${T().materials} durchsuchen" value="${esc(state.materialQuery)}"></label></div>${b.draft?`<p class="draft-notice"><strong>Vorläufige Materialliste:</strong> Manche Blockzustände, Inventarobjekte und Mehrfachblöcke brauchen manuelle Prüfung.</p>`:''}<div class="materials-list">${filtered.length?filtered.map(([type,count])=>`<button data-action="mark" data-id="${type}" style="${materialStyle(type)}" class="material-row ${marked.includes(type)?'checked':''}" aria-pressed="${marked.includes(type)}"><span class="checkmark">${marked.includes(type)?ic('check'):''}</span>${matIcon(type)}<span class="mat-name">${esc(loc(type))}<small class="mat-stack">${stacks(type,count)}</small></span><span class="mat-count">×${count}</span></button>`).join(''):`<div class="empty-state">${T().none}</div>`}</div><div class="actions-row"><button class="secondary" data-action="copy">${ic('box')} ${T().copy}</button><button class="secondary" data-action="export">${ic('share')} ${T().export}</button></div><button class="primary block" data-action="guide">${ic('play')} ${state.progress[b.id]?T().continue:T().build}</button></main>`;}
function textureNotice(){
  if(window.CraftStepsAssets?.manager?.info().ready)return '';
  return `<aside class="texture-notice" aria-label="Minecraft-Texturen"><div><strong>Minecraft-Texturen</strong><p>Der Browser lädt die Originaltexturen direkt von Mojang. Du kannst auch eine eigene Java-Datei auswählen.</p></div><button class="texture-action" type="button" data-action="load-textures">Original-Assets auswählen</button></aside>`;
}
function stepPictureData(build,s){
 const levels=[...new Set(s.current.map(b=>b.y))].sort((a,b)=>a-b);
 const current=new Set(s.current.map(b=>b.x+','+b.y+','+b.z));
 const onLevels=s.placed.filter(b=>levels.includes(b.y));
 const xs=onLevels.map(b=>b.x),zs=onLevels.map(b=>b.z);
 const minX=Math.min(...xs),minZ=Math.min(...zs),size=18,tile=17,pad=12,head=24;
 const pw=(Math.max(...xs)-minX+1)*size+pad*2,ph=(Math.max(...zs)-minZ+1)*size+head+pad;
 let cols=1,best=Infinity;
 for(let c=1;c<=levels.length;c++){const w=c*pw,h=Math.ceil(levels.length/c)*ph,score=Math.abs(Math.log(w/h/.85));if(score<best-1e-9){best=score;cols=c;}}
 const rows=Math.ceil(levels.length/cols),width=cols*pw,height=rows*ph;
 const panels=levels.map((y,i)=>{
  const ox=(i%cols)*pw,oy=Math.floor(i/cols)*ph;
  const tiles=s.placed.filter(b=>b.y===y).map(b=>{
   const fresh=current.has(b.x+','+b.y+','+b.z);
   const color=materialStyle(b.type).split(':')[1];
   return '<rect x="'+(pad+(b.x-minX)*size)+'" y="'+(head+(b.z-minZ)*size)+'" width="'+tile+'" height="'+tile+'" rx="2" fill="'+(fresh?color:'#adb4bc')+'" stroke="'+(fresh?'#171924':'none')+'" stroke-width="1.6"/>';
  }).join('');
  return '<g transform="translate('+ox+' '+oy+')"><text x="'+pad+'" y="16" fill="#252b33" font-size="11">Y = '+y+'</text>'+tiles+'</g>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><rect width="100%" height="100%" fill="#f1f4f7"/>'+panels+'</svg>';
 return {src:'data:image/svg+xml,'+encodeURIComponent(svg),width,height};
}
const stepPicture=(build,s)=>stepPictureData(build,s).src;
function guideMaterials(build,items){
 const colors=visuals.materialOutlineColors(build.blocks);
 return items.map(([type,n])=>`<div class="guide-block" title="${esc(loc(type))}"><span class="guide-block-icon" style="--block-outline:${colors.get(type)||'#fff'}">${matIcon(type)}</span><span aria-label="${esc(loc(type))} ×${n}">×${n}</span></div>`).join('');
}
function guide(){const b=findBuild(),num=Math.max(1,Math.min(state.progress[b.id]||1,b.steps.length)),s=stepState(b,num),pictureData=state.guideMode==='image'&&num===1?stepPictureData(b,s):null,picture=pictureData?pictureData.src:null;return `<main class="content guide-layout ${state.guideMode==='image'?'image-mode':'three-mode'}"><div class="step-pill">${T().step} ${num} / ${b.steps.length}</div><div class="progress-track" role="progressbar" aria-valuenow="${Math.round(100*num/b.steps.length)}" aria-valuemin="0" aria-valuemax="100" aria-label="${T().progress}"><div class="progress-fill" style="width:${100*num/b.steps.length}%"></div></div>${textureNotice()}${b.draft?`<p class="draft-banner">Ungeprüfte Rohschritte – Platzierungsreihenfolge und Mengen selbst prüfen.</p>`:''}<div class="guide-mode-switch" role="group" aria-label="${state.lang==='en'?'View mode':'Ansicht'}"><button type="button" data-action="guide-mode" data-id="image" aria-pressed="${state.guideMode==='image'}">${state.lang==='en'?'Image':'Bild'}</button><button type="button" data-action="guide-mode" data-id="3d" aria-pressed="${state.guideMode==='3d'}">3D</button></div><button type="button" class="immersive-launch" data-action="open-3d">${ic('layers')} 3D-Modus bildschirmfüllend öffnen</button>${state.guideMode==='image'?`<dialog id="step-image-dialog" aria-labelledby="step-image-title"><div class="step-image-heading"><strong id="step-image-title">${T().step} ${num} / ${b.steps.length}</strong><form method="dialog"><button class="secondary" autofocus>${state.lang==='en'?'Close':'Schließen'}</button></form></div>${picture?`<img width="${pictureData.width}" height="${pictureData.height}" src="${picture}" alt="${T().step} ${num}">`:`<canvas class="guide-still" data-build="${b.id}" data-context="guide" role="img" aria-label="${T().step} ${num}"></canvas>`}</dialog>`:''}<div class="guide-image">${picture?`<img class="step-picture" width="${pictureData.width}" height="${pictureData.height}" style="aspect-ratio:${pictureData.width}/${pictureData.height}" src="${picture}" alt="${state.lang==='en'?'Top view of affected layers':'Draufsicht der betroffenen Ebenen'}">`:`<canvas class="${state.guideMode==='image'?'guide-still':'voxel'}" data-build="${b.id}" data-context="guide" role="img" aria-label="Bauzustand ${num}, ${s.current.length} neue Blockpositionen farbig markiert"></canvas>`}${state.guideMode==='image'?`<button type="button" class="step-image-open" data-action="zoom-step-image" aria-haspopup="dialog" aria-label="${state.lang==='en'?'Enlarge step image':'Schrittbild vergrößern'}"></button>`:''}<div class="viewer-tools">${btn('minus',T().zoomOut,'zoom-out')}${btn('plus',T().zoomIn,'zoom-in')}${btn('rotate',T().rot,'rotate')}</div><span class="viewer-hint">▢ ${picture?(state.lang==='en'?'Colored = new blocks · gray = already placed':'Farbig = neu · grau = bereits gesetzt'):T().highlight} ${state.guideMode==='image'?'':' · Ziehen: Drehen, auch von unten'}</span></div><details class="guide-extra"><summary>${state.lang==='en'?'View options':'Ansichtsoptionen'}</summary><div class="motion-toolbar" role="group" aria-label="Schrittanimation">
  <button type="button" data-action="replay-step">${ic('play')} Animierten Schritt abspielen</button>
  <button type="button" data-action="toggle-motion" aria-pressed="${state.animateSteps?'true':'false'}">Animation ${state.animateSteps?'an':'aus'}</button>
 </div><div class="view-switches" role="group" aria-label="3D-Kamerasteuerung"><button type="button" data-action="toggle-focus" aria-pressed="${state.followStep?'true':'false'}">${state.followStep?'Gesamtes Bauwerk':'Schritt fokussieren'}</button><button type="button" data-action="view-below">Unterseite ansehen</button><button type="button" data-action="view-above">Von oben ansehen</button></div></details><div class="guide-info" style="padding-top:13px"><span>${esc(b.name)}</span><span>${s.current.length} ${T().blocks} in diesem Schritt</span></div><h2 class="guide-material-head">${T().blocks}</h2><div class="step-items">${guideMaterials(b,Object.entries(s.stepMaterials))}</div><details class="coordinate-card"><summary>Blockpositionen anzeigen</summary><div class="coordinate-list">${Object.entries(s.current.reduce((groups,block)=>{(groups[block.type]??=[]).push(block);return groups;},{})).map(([type,blocks])=>`<div class="coordinate-group" style="${materialStyle(type)}"><strong>${esc(loc(type))} ×${blocks.length}</strong><div>${blocks.map(block=>`<small>X ${block.x} · Y ${block.y} · Z ${block.z}</small>`).join('')}</div></div>`).join('')}</div></details><div class="nav-controls"><button data-action="prev" class="primary" ${num<=1?'disabled':''}>${ic('back')} ${T().goBack}</button><button data-action="next" class="primary" ${num>=b.steps.length?'disabled':''}>${T().next} ${ic('next')}</button></div><div class="actions-row"><button data-action="materials" class="secondary">${ic('box')} ${T().viewMaterials}</button><button data-action="reset-progress" class="secondary">${ic('rotate')} ${T().progress} zurücksetzen</button></div><p class="footer-note">${T().save} · ← / → ${T().steps} navigieren</p></main>`;}

function immersive3D(){
  const build=findBuild(),step=Math.max(1,Math.min(state.progress[build.id]||1,build.steps.length));
  const current=stepState(build,step),items=Object.entries(current.stepMaterials);
  const assetInfo=window.CraftStepsAssets?.manager?.info?.()||{},assetsReady=!!assetInfo.ready;
  return '<section class="immersive3d" role="dialog" aria-modal="true" aria-label="CraftSteps 3D-Bauansicht">'+
    '<header class="immersive3d-head"><div><strong>3D-Bauansicht</strong><small>'+esc(build.name)+' · Schritt '+step+' / '+build.steps.length+'</small></div>'+
    '<button data-action="close-3d" class="imm-close" type="button" aria-label="3D-Ansicht schließen">Schließen ×</button></header>'+
    '<div class="immersive3d-scene"><canvas class="voxel" data-build="'+esc(build.id)+'" data-context="guide" role="img" aria-label="Drehbare Minecraft-3D-Bauansicht"></canvas>'+
    '<div class="imm-asset-panel" '+(assetsReady?'hidden ':'')+'aria-label="Original-Minecraft-Texturen">'+
    '<div class="imm-asset-title"><span id="imm-assets-indicator" class="'+(assetsReady?'imm-asset-ready':'imm-asset-missing')+'">'+(assetsReady?'Originaltexturen aktiv'+(assetInfo.version?' · '+esc(assetInfo.version):''):'Originaltexturen fehlen')+'</span></div>'+
    '<label class="imm-asset-upload"><span id="imm-assets-button-label">'+(assetsReady?'Minecraft-Datei wechseln':'Originaltexturen laden')+'</span><input id="immersive-vanilla-file" type="file" accept=".jar,.zip,application/java-archive,application/zip" aria-label="Eigene Minecraft-Java-Client-Datei für die 3D-Ansicht auswählen"></label>'+
    '<button class="imm-asset-upload" type="button" data-auto-textures hidden>Erneut laden</button>'+
    '<p id="imm-assets-help">'+(assetsReady?'Originaldatei lokal geladen; keine Dateien hochgeladen.':'Auf dem Handy eigene Minecraft-Java-Datei vom PC auswählen (.jar).')+'</p>'+
    '<p id="imm-assets-feedback" role="status" aria-live="polite"></p></div>'+
    '<span class="imm-hint">Ziehen: frei drehen · auch von unten</span></div>'+
    '<div class="immersive3d-footer"><div class="immersive3d-actions">'+
    '<button data-action="toggle-focus" type="button">'+(state.followStep?'Gesamtansicht':'Schritt fokussieren')+'</button>'+
    '<button data-action="view-below" type="button">Unterseite</button><button data-action="view-above" type="button">Oberseite</button>'+
    '<button data-action="play-guide" type="button" aria-pressed="'+!!autoplay+'">'+(autoplay?'Ⅱ Pause':'▶ Abspielen')+'</button>'+
    '<button data-action="replay-step" type="button" aria-label="Schrittanimation wiederholen">▶ Schritt</button>'+
    '<button data-action="toggle-motion" type="button" aria-pressed="'+state.animateSteps+'">Animation '+(state.animateSteps?'an':'aus')+'</button>'+
    '<button data-action="zoom-out" type="button" aria-label="Herauszoomen">−</button><button data-action="zoom-in" type="button" aria-label="Hineinzoomen">+</button></div>'+
    '<div class="immersive3d-materials">'+(guideMaterials(build,items)||'<span>Keine neuen Materialblöcke</span>')+'</div>'+
    '<label class="imm-scrubber"><span>Bauschritt wählen</span><input id="guide-scrubber" aria-label="Bauschritt auswählen" type="range" min="1" max="'+build.steps.length+'" value="'+step+'"></label>'+
    '<div class="immersive3d-step-nav"><button data-action="prev" type="button" '+(step<=1?'disabled':'')+'>← Zurück</button>'+
    '<span>Schritt '+step+' / '+build.steps.length+'</span>'+
    '<button data-action="next" type="button" '+(step>=build.steps.length?'disabled':'')+'>Weiter →</button></div></div></section>';
}
function settings(){return `<main class="content settings-page"><h1 class="page-title">${T().settings}</h1><p class="subtext">${T().settingsNote}</p><div class="section-heading"><h2>${T().appearance}</h2></div><section class="settings-group"><div class="settings-line"><div><strong>${T().theme}</strong><small>${T().light} / ${T().dark}</small></div><select id="theme-select" class="select"><option value="light" ${state.theme==='light'?'selected':''}>${T().light}</option><option value="dark" ${state.theme==='dark'?'selected':''}>${T().dark}</option></select></div><div class="settings-line"><div><strong>${T().language}</strong><small>Deutsch / English</small></div><select id="lang-select" class="select"><option value="de" ${state.lang==='de'?'selected':''}>Deutsch</option><option value="en" ${state.lang==='en'?'selected':''}>English</option></select></div><div class="settings-line"><div><strong>${T().interests}</strong><small>${T().interestsHint}</small></div><button class="secondary" data-action="edit-interests">${T().edit}</button></div><div class="settings-line"><div><strong>${T().edition}</strong><small>Java / Bedrock / Pocket</small></div><select id="edition-select" class="select">${['Java','Bedrock','Pocket'].map(x=>`<option value="${x}" ${state.edition===x?'selected':''}>${x}</option>`).join('')}</select></div></section><div class="section-heading"><h2>${T().info}</h2></div><div class="meta-note">${T().license}<br><br>${T().hold}<br><br><strong>${builds.length} ${T().demo}</strong><br>Renderings werden direkt aus gespeicherten 3D-Koordinaten erstellt.</div><a class="import-entry" href="studio.html">${ic('plus')} Eigene Bauwerke importieren und verwalten <span>→</span></a><button data-action="reset-all" class="secondary" style="width:100%">${T().reset}</button></main>`;}
function render(focusId=null){document.body.classList.toggle('dark',state.theme==='dark');document.documentElement.lang=state.lang;document.querySelector('meta[name="theme-color"]').content=state.theme==='dark'?'#161917':'#ffffff';document.body.dataset.view=state.view;const body=state.view==='onboarding'?onboarding():state.view==='home'?home():state.view==='detail'?detail():state.view==='materials'?mats():state.view==='guide'?guide():settings();document.body.classList.toggle('imm-open',state.immersive3D);document.getElementById('app').innerHTML=`<div class="app-shell">${state.view==='onboarding'?body:header()+body+bottomNav()}</div>`+(state.immersive3D&&state.view==='guide'?immersive3D():'');window.dispatchEvent(new CustomEvent('craftsteps:view'));requestAnimationFrame(drawAll);if(focusId){const el=document.getElementById(focusId);if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}}}
function navigate(view,id){pauseGuide();if(id)state.id=id;if(view==='guide'&&state.view!=='guide')state.guideMode='image';state.view=view;state.detailAngle=0;syncRoute(view);state.rotation=0;state.yaw=Math.PI/4;state.pitch=.58;state.zoom=1;state.followStep=true;state.immersive3D=false;motion.token++;motion.progress=1;motion.from=[];state.materialQuery='';render();window.scrollTo({top:0,behavior:'instant'});}
function drawCanvas(canvas){
  const build=builds.find(b=>b.id===canvas.dataset.build);
  if(!build||!visuals)return;
  const isGuide=canvas.dataset.context==='guide';
  const still=isGuide&&state.guideMode==='image'&&!state.immersive3D;
  const n=Math.max(1,Math.min(state.progress[build.id]||1,build.steps.length));
  const progress=isGuide?stepState(build,n):null;
  visuals.draw(canvas,build,{
    blocks:progress?progress.placed:build.blocks,
    highlight:progress?progress.current:[],
    outlineColors:isGuide?visuals.materialOutlineColors(build.blocks):null,
    guideStage:isGuide,
    yaw:still?(n===1?0:Math.PI/4+(Math.floor((n-2)/4)%4)*Math.PI/2):canvas.dataset.context==='card'?Math.PI/4:state.yaw,
    pitch:still?(n===1?1.5:.55):canvas.dataset.context==='card'?.58:state.pitch,
    zoom:still||canvas.dataset.context==='card'?1:state.zoom,
    context:canvas.closest('.immersive3d')?'immersive':canvas.dataset.context,
    hideBadge:!!canvas.closest('.immersive3d'),
    followStep:isGuide&&(still?n>1:state.followStep),
    stepReveal:isGuide&&!still?motion.progress:1,
    fromHighlight:isGuide&&!still&&motion.progress<1?motion.from:null,
    cameraBlend:isGuide&&!still?motion.progress:1,
    limit:canvas.dataset.context==='card'?1200:4000
  });
}
function drawAll(){document.querySelectorAll('canvas[data-build]').forEach(drawCanvas);visuals?.drawIcons(document);}
function revealStepViewer(){
 if(!state.immersive3D)window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('craftsteps:assets',()=>{requestAnimationFrame(drawAll);if(window.CraftStepsAssets?.manager?.info().ready)document.querySelectorAll('.texture-notice').forEach(el=>el.remove());});
// Rotation and elevation are real 3D transforms. Red guides are projected from world-space blocks.
let dragging=null;
document.addEventListener('pointerdown',ev=>{
  const canvas=ev.target.closest('canvas.voxel');
  if(!canvas||canvas.dataset.context==='card'||(canvas.dataset.context==='guide'&&state.guideMode==='image'&&!state.immersive3D))return;
  dragging={pointer:ev.pointerId,x:ev.clientX,y:ev.clientY,canvas};
  canvas.setPointerCapture?.(ev.pointerId);
});
document.addEventListener('pointermove',ev=>{
  if(!dragging||dragging.pointer!==ev.pointerId)return;
  const dx=ev.clientX-dragging.x,dy=ev.clientY-dragging.y;
  dragging.x=ev.clientX;dragging.y=ev.clientY;
  state.yaw+=dx*.014;
  state.pitch=Math.max(-1.42,Math.min(1.42,state.pitch+dy*.009));
  drawAll();
});
for(const eventName of ['pointerup','pointercancel'])document.addEventListener(eventName,()=>{dragging=null;});
function materialText(){const b=findBuild();return `${b.name}\n${Object.entries(countMaterials(b.blocks)).map(([k,n])=>`${loc(k)}: ${n} (${stacks(k,n)})`).join('\n')}`;}
async function copy(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.focus();t.select();if(!document.execCommand('copy'))throw Error('copy');t.remove();}return true;}catch{return false;}}
function clicked(event){const el=event.target.closest('[data-action]');if(!el)return;const a=el.dataset.action,id=el.dataset.id,b=findBuild();switch(a){
 case 'example-image-guide':state.guideMode='image';navigate('guide','starterhuette');break;
 case 'zoom-step-image':{const dialog=document.getElementById('step-image-dialog');if(dialog&&!dialog.open){dialog.showModal();const canvas=dialog.querySelector('canvas');if(canvas)drawCanvas(canvas);}break;}
 case 'guide-mode':if(!['image','3d'].includes(id)||state.guideMode===id)break;pauseGuide();dragging=null;motion.token++;motion.progress=1;motion.from=[];state.guideMode=id;render();document.querySelector('[data-action="guide-mode"][data-id="'+id+'"]')?.focus();break;
 case 'clear-filters':state.query='';state.category='Alle';state.filter='all';state.sort='recommended';state.size='all';render();break;
 case 'reset-materials':state.collected[b.id]=[];put('collected',state.collected);render();break;
 case 'home':state.category='Alle';navigate('home');break;case 'show-favorites':state.category='Favoriten';navigate('home');break;case 'settings':navigate('settings');break;case 'back':navigate(state.view==='guide'||state.view==='materials'?'detail':'home');break;
 case 'toggle-interest':{state.interests=state.interests.includes(id)?state.interests.filter(x=>x!==id):[...state.interests,id];put('interests',state.interests);render();break;}
 case 'finish-onboarding':state.onboarded=true;put('onboarded',true);state.category='Alle';navigate('home');break;
 case 'skip-onboarding':state.onboarded=true;state.interests=[];put('onboarded',true);put('interests',[]);state.category='Alle';navigate('home');break;
 case 'edit-interests':navigate('onboarding');break;
 case 'toggle-search':navigate('home');document.getElementById('search-input')?.focus();break;
 case 'category':state.category=id;render();break;
 case 'detail':navigate('detail',id);break;
 case 'detail-angle':{
  state.detailAngle=Number(id);
  state.yaw=[Math.PI/4,Math.PI*.75,0][state.detailAngle];
  state.pitch=state.detailAngle===2?1.5:.58;
  render();
  document.querySelector('[data-action="detail-angle"][aria-pressed="true"]')?.focus({preventScroll:true});
  break;
 }
 case 'favorite':{const buildId=id||b.id;state.favorites=state.favorites.includes(buildId)?state.favorites.filter(x=>x!==buildId):[...state.favorites,buildId];put('favorites',state.favorites);render();break;}
 case 'guide':if(!state.progress[b.id]){state.progress[b.id]=1;put('progress',state.progress);}navigate('guide');startStepMotion([]);break;
 case 'materials':navigate('materials');break;
 case 'prev':case 'next':{pauseGuide();const n=state.progress[b.id]||1;changeGuideStep(n+(a==='next'?1:-1));break;}
 case 'mark':{let list=state.collected[b.id]||[];list=list.includes(id)?list.filter(x=>x!==id):[...list,id];state.collected[b.id]=list;put('collected',state.collected);render();break;}
 case 'load-textures':{const input=document.getElementById('vanilla-file');if(input)input.click();else document.getElementById('asset-manager')?.scrollIntoView({behavior:'smooth'});break;}
 case 'open-3d':state.guideMode='3d';state.immersive3D=true;render();startStepMotion([]);break;
 case 'play-guide':if(autoplay)pauseGuide();else playGuide();break;
 case 'replay-step':pauseGuide();startStepMotion([]);break;
 case 'toggle-motion':state.animateSteps=!state.animateSteps;put('animateSteps',state.animateSteps);render();if(state.animateSteps)startStepMotion([]);break;
 case 'close-3d':pauseGuide();state.immersive3D=false;render();break;
 case 'toggle-focus':state.followStep=!state.followStep;render();break;
 case 'view-below':state.pitch=-.76;render();break;
 case 'view-above':state.pitch=.66;render();break;
 case 'rotate':state.rotation=(state.rotation+1)%4;state.yaw+=Math.PI/2;render();break;
 case 'zoom-in':state.zoom=Math.min(1.6,state.zoom+.13);render();break;
 case 'zoom-out':state.zoom=Math.max(.65,state.zoom-.13);render();break;
 case 'reset-progress':if(confirm(T().resetQuestion)){delete state.progress[b.id];put('progress',state.progress);navigate('detail');}break;
 case 'reset-all':if(confirm(T().resetQuestion)){state.favorites=[];state.progress={};state.collected={};put('favorites',[]);put('progress',{});put('collected',{});toast(T().resetDone);render();}break;
 case 'copy':void copy(materialText()).then(ok=>toast(ok?T().copied:T().copyFailed));break;
 case 'export':{const blob=new Blob([materialText()],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(blob),link=document.createElement('a');link.href=u;link.download=`craftsteps-${b.id}-materialliste.txt`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);break;}
 case 'share':{if(b.draft){toast('Lokale Entwürfe sind nicht auf anderen Geräten abrufbar.');break;}const url=window.location.href.split('#')[0]+'#'+b.id;void (navigator.share?navigator.share({title:b.name,url}).catch(()=>copy(url)):copy(url)).then(()=>toast(T().shareCopied)).catch(()=>{});break;}
}}
document.addEventListener('click',clicked);
document.addEventListener('input',event=>{if(event.target.id==='search-input'){state.query=event.target.value;render('search-input');}if(event.target.id==='material-search'){state.materialQuery=event.target.value;render('material-search');}});
document.addEventListener('change',event=>{const id=event.target.id,value=event.target.value;if(id==='build-sort'){state.sort=value;render();}if(id==='build-size'){state.size=value;render();}if(id==='difficulty'){state.filter=value;render();}if(id==='theme-select'){state.theme=value;put('theme',value);render();}if(id==='lang-select'){state.lang=value;put('lang',value);render();}if(id==='edition-select'){state.edition=value;put('edition',value);render();}if(id==='guide-scrubber'){pauseGuide();changeGuideStep(Number(value));}});
document.addEventListener('keydown',event=>{if(document.getElementById('step-image-dialog')?.open)return;if(state.immersive3D&&event.key==='Escape'){pauseGuide();state.immersive3D=false;render();event.preventDefault();return;}if(state.view==='guide'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&['ArrowRight','ArrowLeft'].includes(event.key)){pauseGuide();const b=findBuild(),n=state.progress[b.id]||1;changeGuideStep(n+(event.key==='ArrowRight'?1:-1));event.preventDefault();}});
document.addEventListener('wheel',event=>{
 const canvas=event.target.closest('canvas.voxel[data-context="guide"]');
 if(!canvas||state.guideMode!=='3d')return;
 event.preventDefault();
 state.zoom=Math.max(.65,Math.min(1.6,state.zoom+(event.deltaY<0?.08:-.08)));
 drawCanvas(canvas);
},{passive:false});
window.addEventListener('resize',()=>requestAnimationFrame(drawAll));
function syncRoute(view){
 const hash=['detail','materials','guide'].includes(view)
  ?'#'+encodeURIComponent(state.id)+(view==='detail'?'':'/'+view):'';
 if(location.hash!==hash)history.replaceState(null,'',location.pathname+location.search+hash);
}
function restoreRoute(){
 const [id,view]=location.hash.slice(1).split('/');
 if(!id||!builds.some(b=>encodeURIComponent(b.id)===id))return;
 state.id=builds.find(b=>encodeURIComponent(b.id)===id).id;
 state.view=['materials','guide'].includes(view)?view:'detail';
}
restoreRoute();
render();
async function loadPrivateDrafts(){
  const store=window.CraftStepsDrafts,importer=window.CraftStepsSchem;
  if(!store||!importer)return;
  try{
    const saved=await store.all();
    for(const build of saved){
      if(!build||!build.draft||typeof build.id!=='string'||!build.id.startsWith('local-')||!Array.isArray(build.blocks)||build.blocks.length>importer.MAX_BLOCKS)continue;
      try{
        importer.registerMaterials(build,MATERIALS);
        core.validateBuild(build);
        if(!builds.some(b=>b.id===build.id))builds.push(build);
      }catch(e){console.warn('Nicht lesbarer CraftSteps-Entwurf:',e.message);}
    }
    if(location.hash.startsWith('#local-'))restoreRoute();
    render();
  }catch(e){console.warn('CraftSteps-Entwürfe können nicht geladen werden:',e.message);}
}
void loadPrivateDrafts();
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
      if(!get('offlineToast',false)){put('offlineToast',true);showOfflineNote(T().offlineReady);}
    }).catch(()=>{/* Offline-Modus optional */});
  });
}
})();
