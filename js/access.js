export const ADMIN_ACCESS_CODE='0909';

export function normalizeAccessCode(value){
  const code=String(value??'').trim();
  return /^\d{1,4}$/.test(code)?code.padStart(4,'0'):'';
}

export function legacyAccessCode(wedding){
  const match=String(wedding||'').match(/^(?:\d{4}-)?(\d{2})-(\d{2})$/);
  return match?`${match[2]}${match[1]}`:'';
}

export function accessCodeForClient(client){
  return normalizeAccessCode(client?.accessCode)||legacyAccessCode(client?.wedding);
}

export function findAccessCodeConflicts(clients=[]){
  const groups=new Map();
  clients.forEach(client=>{
    const code=accessCodeForClient(client);
    if(!code)return;
    if(!groups.has(code))groups.set(code,[]);
    groups.get(code).push(client);
  });
  return [...groups.entries()]
    .filter(([,group])=>group.length>1)
    .map(([code,group])=>({code,clientIds:group.map(client=>client.id),clients:group}));
}

export function migrateAccessCodes(data){
  const copy=data||{};
  const conflicts=findAccessCodeConflicts(copy.clients||[]);
  copy.clients=(copy.clients||[]).map(client=>{
    if(!normalizeAccessCode(client.accessCode)){
      const legacy=legacyAccessCode(client.wedding);
      if(legacy)client.accessCode=legacy;
    }else client.accessCode=normalizeAccessCode(client.accessCode);
    return client;
  });
  const migratedConflicts=findAccessCodeConflicts(copy.clients);
  const conflictIds=new Set(migratedConflicts.flatMap(({clientIds})=>clientIds));
  copy.clients.forEach(client=>{client._accessCodeConflict=conflictIds.has(client.id)});
  copy.accessCodeConflicts=migratedConflicts.map(({code,clientIds})=>({code,clientIds}));
  return copy;
}

export function findAvailableLocalAccessCode(clients=[],preferred=''){
  const used=new Set(clients.map(accessCodeForClient).filter(Boolean));
  const first=normalizeAccessCode(preferred);
  if(first&&first!==ADMIN_ACCESS_CODE&&!used.has(first))return first;
  for(let attempt=0;attempt<20000;attempt++){
    const code=String(Math.floor(Math.random()*10000)).padStart(4,'0');
    if(code!==ADMIN_ACCESS_CODE&&!used.has(code))return code;
  }
  for(let value=0;value<10000;value++){
    const code=String(value).padStart(4,'0');
    if(code!==ADMIN_ACCESS_CODE&&!used.has(code))return code;
  }
  throw new Error('Não há códigos de acesso disponíveis.');
}
