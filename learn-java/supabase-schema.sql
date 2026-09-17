-- Carnet Java — schéma Supabase
-- À exécuter une fois dans : Supabase → SQL Editor → New query

create extension if not exists "pgcrypto";

-- Réglages (une seule ligne, id fixé à 1)
create table if not exists settings (
  id int primary key default 1,
  reminder_start text not null default '21:00',
  reminder_end text not null default '23:59',
  active_days int[] not null default '{1,2,3,4,5,6}',
  current_phase_id int not null default 0,
  day_in_program int not null default 1,
  objective text not null default '',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- Une ligne par jour de séance : statut, note personnelle, cours archivé
create table if not exists days (
  date date primary key,
  phase_id int not null default 0,
  day_in_program int not null default 1,
  statut text not null default 'a_faire',
  note_contenu text not null default '',
  cours_contenu text not null default '',
  updated_at timestamptz not null default now()
);

-- Projets pratiques (liens GitHub)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  lien text not null,
  phase_id int not null default 0,
  description text not null default '',
  date_ajout timestamptz not null default now()
);

-- Quiz par phase
create table if not exists quizzes (
  phase_id int primary key,
  questions jsonb not null default '[]',
  history jsonb not null default '[]'
);

-- RLS : usage personnel mono-utilisateur, ouvert à la clé publique anon.
-- Ne mets rien de sensible dans cette base ; elle est accessible à quiconque
-- possède ton URL Supabase + clé anon (ce qui est le cas dans le code déployé).
alter table settings enable row level security;
alter table days enable row level security;
alter table projects enable row level security;
alter table quizzes enable row level security;

create policy "allow all settings" on settings for all using (true) with check (true);
create policy "allow all days" on days for all using (true) with check (true);
create policy "allow all projects" on projects for all using (true) with check (true);
create policy "allow all quizzes" on quizzes for all using (true) with check (true);
