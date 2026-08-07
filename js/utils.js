export const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const fmtDate=d=>d?new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.',''):'';
export const daysUntil=d=>Math.ceil((new Date(`${d}T12:00:00`)-new Date())/86400000);
export const initials=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
export function toast(msg){const region=document.querySelector('#toast-region');if(!region)return;const el=document.createElement('div');el.className='toast';el.textContent=msg;region.append(el);setTimeout(()=>el.remove(),3200)}
