import {ADMIN_ACCESS_CODE,accessCodeForClient,normalizeAccessCode} from './access.js';
export const ADMIN_PIN=ADMIN_ACCESS_CODE;
export const clientPin=client=>accessCodeForClient(client);
export function authenticatePin(pin,clients){const code=normalizeAccessCode(pin);if(code===ADMIN_PIN)return {role:'admin',name:'Cora · Administradora'};const client=clients.find(c=>clientPin(c)===code);return client?{role:'client',name:client.name,clientId:client.id}:null}
