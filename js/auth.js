export const ADMIN_PIN='0909';
export const clientPin=client=>client?.wedding?client.wedding.slice(8,10)+client.wedding.slice(5,7):'';
export function authenticatePin(pin,clients){if(pin===ADMIN_PIN)return {role:'admin',name:'Cora · Administradora'};const client=clients.find(c=>clientPin(c)===pin);return client?{role:'client',name:client.name,clientId:client.id}:null}
