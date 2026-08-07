import {cloudConfigured,cloudLoad,cloudSave} from './cloud.js';
const KEY='studio-cora-data-v1';
export const uid=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
export function loadData(seed){try{const saved=localStorage.getItem(KEY);return saved?JSON.parse(saved):structuredClone(seed)}catch{return structuredClone(seed)}}
export function saveData(data){localStorage.setItem(KEY,JSON.stringify(data));if(cloudConfigured())cloudSave(data).catch(error=>console.warn('Supabase: não foi possível sincronizar.',error));return data}
export async function hydrateData(seed){const local=loadData(seed);if(!cloudConfigured())return local;try{const remote=await cloudLoad();if(remote){localStorage.setItem(KEY,JSON.stringify(remote));return remote}await cloudSave(local);return local}catch(error){console.warn('Supabase indisponível; usando dados locais.',error);return local}}
export function resetData(seed){const data=structuredClone(seed);saveData(data);return data}
export function exportData(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='studio-cora-backup.json';a.click();URL.revokeObjectURL(a.href)}
export function importData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);saveData(data);resolve(data)}catch{reject(new Error('Arquivo inválido'))}};reader.onerror=reject;reader.readAsText(file)})}
