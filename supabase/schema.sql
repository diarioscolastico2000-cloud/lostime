create table if not exists lobbies (codice text primary key, game_id text not null, max_players int not null, stato text not null default 'attesa', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists lobby_players (id uuid primary key default gen_random_uuid(), lobby_codice text references lobbies(codice) on delete cascade, nickname text not null, ordine int not null, online boolean default true, last_seen timestamptz default now());
create table if not exists game_states (lobby_codice text primary key references lobbies(codice) on delete cascade, turno text not null, payload jsonb not null, versione int not null default 1, updated_at timestamptz default now());
alter table lobbies enable row level security;
alter table lobby_players enable row level security;
alter table game_states enable row level security;
-- MVP: policy permissive per prototipo, restringere per codice in produzione via function
create policy "anon read lobbies" on lobbies for select to anon using (true);
create policy "anon insert lobbies" on lobbies for insert to anon with check (true);
create policy "anon update lobbies" on lobbies for update to anon using (true);
create policy "anon read players" on lobby_players for select to anon using (true);
create policy "anon insert players" on lobby_players for insert to anon with check (true);
create policy "anon read states" on game_states for select to anon using (true);
create policy "anon insert states" on game_states for insert to anon with check (true);
create policy "anon update states" on game_states for update to anon using (true);
