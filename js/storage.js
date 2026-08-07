import {cloudConfigured,cloudLoad,cloudSave} from './cloud.js';
const KEY='studio-cora-data-v1';
const REMOVED_DEMO_CLIENTS=['clara martins','beatriz almeida','marina oliveira'];
function cleanData(data){
  const copy=data||{};
  copy.clients=(copy.clients||[]).filter(c=>!REMOVED_DEMO_CLIENTS.includes(String(c.name||'').trim().toLowerCase()));
  copy.notifications=(copy.notifications||[]).filter(n=>!REMOVED_DEMO_CLIENTS.some(name=>String(n.text||'').toLowerCase().includes(name)));
  if(copy.session?.clientId&&!copy.clients.some(c=>c.id===copy.session.clientId))copy.session=null;
  return copy;
}
export const uid=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
export function loadData(seed){try{const saved=localStorage.getItem(KEY);return cleanData(saved?JSON.parse(saved):structuredClone(seed))}catch{return cleanData(structuredClone(seed))}}
export function saveData(data){const clean=cleanData(data);localStorage.setItem(KEY,JSON.stringify(clean));if(cloudConfigured())cloudSave(clean).catch(error=>console.warn('Supabase: não foi possível sincronizar.',error));return clean}
export async function hydrateData(seed){const local=loadData(seed);if(!cloudConfigured())return local;try{const remote=await cloudLoad();if(remote){const clean=cleanData(remote);localStorage.setItem(KEY,JSON.stringify(clean));if(JSON.stringify(clean)!==JSON.stringify(remote))await cloudSave(clean);return clean}await cloudSave(local);return local}catch(error){console.warn('Supabase indisponível; usando dados locais.',error);return local}}
export function resetData(seed){const data=cleanData(structuredClone(seed));saveData(data);return data}
export function exportData(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='studio-cora-backup.json';a.click();URL.revokeObjectURL(a.href)}
export function importData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);saveData(data);resolve(data)}catch{reject(new Error('Arquivo inválido'))}};reader.onerror=reject;reader.readAsText(file)})}
