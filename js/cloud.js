// Integração opcional com Supabase.
// Preencha os dois valores abaixo depois de criar o projeto no Supabase.
// Nunca coloque aqui a secret/service_role key.


const SUPABASE_URL = 'https://vvhmhgywoaboweyvowqj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UWtrliD50KELZvlyWOEFKA_0wmlWEH1';

let clientPromise;

export const cloudConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function getClient(){
  if(!cloudConfigured()) return null;
  if(!clientPromise){
    clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
      .then(({createClient})=>createClient(SUPABASE_URL,SUPABASE_ANON_KEY));
  }
  return clientPromise;
}



export async function cloudLoad(){
  const supabase=await getClient();
  if(!supabase) return null;
  const {data,error}=await supabase.from('studio_cora_state').select('payload').eq('id','main').maybeSingle();
  if(error) throw error;
  return data?.payload||null;
}

export async function cloudSave(payload){
  const supabase=await getClient();
  if(!supabase) return false;
  const {error}=await supabase.from('studio_cora_state').upsert({id:'main',payload:{...payload,session:null},updated_at:new Date().toISOString()});
  if(error) throw error;
  return true;
}
