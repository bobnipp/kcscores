-- Fourball scoring app: database setup
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run once on a fresh project.

create extension if not exists pgcrypto;

-- Courses ------------------------------------------------------------
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  is_home     boolean not null default false,
  par         smallint[] not null check (array_length(par, 1) = 18),
  stroke_index smallint[] not null check (array_length(stroke_index, 1) = 18),
  created_at  timestamptz not null default now()
);
-- only one home course
create unique index if not exists one_home_course on courses ((true)) where is_home;

create table if not exists tees (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  name       text not null,
  rating     numeric(4,1) not null,
  slope      smallint not null check (slope between 55 and 155),
  sort       smallint not null default 0
);

-- Saved players --------------------------------------------------------
create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  hcp_index   numeric(4,1),
  created_at  timestamptz not null default now()
);

-- Events ---------------------------------------------------------------
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references courses(id),
  buy_in       numeric(8,2) not null default 20,
  format       text not null default 'gn' check (format in ('gn','gg','nn')),
  in_progress  boolean not null default true,
  created_at   timestamptz not null default now(),
  ended_at     timestamptz
);
-- only one event in progress at a time
create unique index if not exists one_live_event on events ((true)) where in_progress;

create table if not exists event_teams (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id) on delete cascade,
  position  smallint not null,
  name      text not null,
  unique (event_id, position)
);

create table if not exists event_players (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  team_id    uuid not null references event_teams(id) on delete cascade,
  slot       smallint not null check (slot between 0 and 3),
  player_id  uuid references players(id) on delete set null,
  tee_id     uuid references tees(id) on delete set null,
  unique (team_id, slot),
  unique (event_id, player_id)
);

-- One row per player per hole
create table if not exists scores (
  event_player_id uuid not null references event_players(id) on delete cascade,
  event_id        uuid not null references events(id) on delete cascade,
  hole            smallint not null check (hole between 1 and 18),
  strokes         smallint not null check (strokes between 1 and 15),
  updated_at      timestamptz not null default now(),
  primary key (event_player_id, hole)
);
create index if not exists scores_event on scores (event_id);

-- Access: no login, anyone with the app can read and write -------------
do $$
declare t text;
begin
  foreach t in array array['courses','tees','players','events','event_teams','event_players','scores'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "open access" on %I', t);
    execute format('create policy "open access" on %I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Live updates for the leaderboard -------------------------------------
alter publication supabase_realtime add table scores, events, event_teams, event_players, players;

-- Starter course (edit or delete in the app) ---------------------------
insert into courses (name, is_home, par, stroke_index)
select 'Pinecrest Golf Club', true,
  '{4,5,3,4,4,4,3,5,4,4,3,5,4,4,3,4,5,4}', '{7,1,17,11,3,13,15,5,9,8,18,2,12,4,16,10,6,14}'
where not exists (select 1 from courses);

insert into tees (course_id, name, rating, slope, sort)
select c.id, t.name, t.rating, t.slope, t.sort
from courses c,
  (values ('Blue', 72.4, 131, 0), ('White', 70.1, 125, 1), ('Gold', 67.8, 117, 2)) as t(name, rating, slope, sort)
where c.name = 'Pinecrest Golf Club' and not exists (select 1 from tees);
