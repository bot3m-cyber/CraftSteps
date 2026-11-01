/* Browser-only IndexedDB store for private drafts. This is NOT server-side admin storage. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CraftStepsDrafts=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 let dbPromise;
 function open(){
   if(!globalThis.indexedDB)return Promise.reject(new Error('IndexedDB ist in diesem Browser nicht verfügbar.'));
   if(dbPromise)return dbPromise;
   dbPromise=new Promise((resolve,reject)=>{
     const request=indexedDB.open('craftsteps-imports',1);
     request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('drafts'))request.result.createObjectStore('drafts',{keyPath:'id'});};
     request.onsuccess=()=>resolve(request.result);
     request.onerror=()=>reject(request.error||new Error('Datenbank konnte nicht geöffnet werden.'));
   }).catch(e=>{dbPromise=null;throw e;});
   return dbPromise;
 }
 async function tx(mode,operation){
   const db=await open();return new Promise((resolve,reject)=>{
     const transaction=db.transaction('drafts',mode),store=transaction.objectStore('drafts');
     let result;const request=operation(store);
     request.onsuccess=()=>{result=request.result;};
     request.onerror=()=>reject(request.error||new Error('Speichern fehlgeschlagen.'));
     transaction.oncomplete=()=>resolve(result);
     transaction.onerror=()=>reject(transaction.error||new Error('Datenbankfehler.'));
     transaction.onabort=()=>reject(transaction.error||new Error('Speichervorgang abgebrochen.'));
   });
 }
 async function all(){return tx('readonly',s=>s.getAll());}
 async function save(build){
   if(!build||typeof build.id!=='string'||!/^local-[a-z0-9-]{8,}$/i.test(build.id)||!build.draft||!Array.isArray(build.blocks)||build.blocks.length>10000)throw Error('Ungültiger Entwurf.');
   return tx('readwrite',s=>s.put(build));
 }
 async function remove(id){if(typeof id!=='string'||!id.startsWith('local-'))throw Error('Ungültige Entwurfs-ID.');return tx('readwrite',s=>s.delete(id));}
 return {all,save,remove};
});