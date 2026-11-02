-- STUDIO CORA: banco inicial para sincronizar os dados do sistema.
-- Cole este arquivo no SQL Editor do Supabase e clique em Run.

create table if not exists public.studio_cora_state (
  id text primary key check (id = 'main'),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.studio_cora_state enable row level security;

grant select, insert, update on public.studio_cora_state to anon;

drop policy if exists "studio cora state select" on public.studio_cora_state;
drop policy if exists "studio cora state insert" on public.studio_cora_state;
drop policy if exists "studio cora state update" on public.studio_cora_state;

create policy "studio cora state select"
  on public.studio_cora_state for select to anon
  using (id = 'main');

create policy "studio cora state insert"
  on public.studio_cora_state for insert to anon
  with check (id = 'main');

create policy "studio cora state update"
  on public.studio_cora_state for update to anon
  using (id = 'main')
  with check (id = 'main');

-- Códigos de acesso: reserva transacional para novos briefings.
create table if not exists public.studio_cora_access_codes (
  access_code text primary key check (access_code ~ '^[0-9]{4}$'),
  client_id text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.allocate_studio_cora_access_code(
  p_client_id text,
  p_preferred_code text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
  i integer;
begin
  perform pg_advisory_xact_lock(hashtext('studio-cora-access-codes'));

  select access_code into candidate
    from public.studio_cora_access_codes
   where client_id = p_client_id;
  if candidate is not null then return candidate; end if;

  -- Importa códigos já migrados para a tabela de reserva sem alterar duplicidades antigas.
  insert into public.studio_cora_access_codes(access_code, client_id)
  select lpad(item->>'accessCode',4,'0'), item->>'id'
    from public.studio_cora_state s,
         lateral jsonb_array_elements(coalesce(s.payload->'clients','[]'::jsonb)) item
   where s.id='main'
     and item->>'accessCode' ~ '^[0-9]{1,4}$'
  on conflict do nothing;

  candidate := lpad(regexp_replace(coalesce(p_preferred_code,''),'[^0-9]','','g'),4,'0');
  if candidate ~ '^[0-9]{4}$' and candidate <> '0909' then
    insert into public.studio_cora_access_codes(access_code,client_id)
    values(candidate,p_client_id) on conflict do nothing;
    if found then return candidate; end if;
  end if;

  for i in 1..20000 loop
    candidate := lpad(floor(random()*10000)::int::text,4,'0');
    if candidate <> '0909' then
      insert into public.studio_cora_access_codes(access_code,client_id)
      values(candidate,p_client_id) on conflict do nothing;
      if found then return candidate; end if;
    end if;
  end loop;

  -- Fallback exaustivo e finito quando a ocupação estiver muito alta.
  for i in 0..9999 loop
    candidate := lpad(i::text,4,'0');
    if candidate <> '0909' then
      insert into public.studio_cora_access_codes(access_code,client_id)
      values(candidate,p_client_id) on conflict do nothing;
      if found then return candidate; end if;
    end if;
  end loop;

  raise exception 'Todos os códigos de acesso estão ocupados';
end;
$$;

grant execute on function public.allocate_studio_cora_access_code(text,text) to anon;
