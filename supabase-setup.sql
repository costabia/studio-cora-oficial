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
