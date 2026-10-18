-- Myth Busters: Breast Cancer Edition — schema, RLS and server-authoritative game logic.
-- Every game RPC is SECURITY DEFINER and executable only by service_role; the browser talks to
-- Next.js route handlers, never to these tables or functions directly.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables

create table public.players (
  id uuid primary key,
  nickname text not null check (char_length(nickname) between 3 and 16 and nickname ~ '^[A-Za-z0-9 ]+$'),
  character text not null check (character in ('pinky','rosie','bloom','monster','captain')),
  recovery_code_hash text,
  created_at timestamptz not null default now()
);
create unique index players_nickname_ci on public.players (lower(nickname));
create unique index players_recovery on public.players (recovery_code_hash) where recovery_code_hash is not null;

create table public.questions (
  id text primary key,
  statement text not null,
  answer text not null check (answer in ('MYTH','FACT')),
  explanation_short text not null,
  explanation_long text,
  source_name text not null,
  source_url text not null,
  category text not null check (category in ('basics','signs','risk','ultimate')),
  topic text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  review_status text not null default 'draft' check (review_status in ('draft','approved')),
  reviewer text,
  reviewed_at timestamptz
);

create table public.matching_pairs (
  id text primary key,
  pair_type text not null check (pair_type in ('myth_fact','theme_action')),
  card_a text not null,
  card_b text not null,
  label_a text not null,
  label_b text not null,
  explanation text not null,
  source_name text,
  source_url text,
  review_status text not null default 'draft' check (review_status in ('draft','approved')),
  reviewer text,
  reviewed_at timestamptz
);

create table public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on update cascade on delete cascade,
  category text not null check (category in ('basics','signs','risk','pairs','ultimate')),
  mode text not null check (mode in ('quiz','pairs_easy','pairs_challenge')),
  difficulty text not null,
  timed boolean not null default false,
  question_time int,
  question_ids text[],
  pair_ids text[],
  cards jsonb,                      -- server-only Pink Pairs layout [{id, pair_id, side}]
  matched_pair_ids text[] not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  elapsed_seconds int,
  raw_score int,
  max_raw_score int,
  nmbp int,
  accuracy numeric(5,4),
  correct_count int,
  incorrect_count int,
  not_sure_count int,
  incorrect_flips int not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress','completed','rejected')),
  rejected_reason text
);
create index game_attempts_player on public.game_attempts (player_id, started_at desc);

create table public.answers (
  attempt_id uuid not null references public.game_attempts(id) on delete cascade,
  idx int not null,
  question_id text not null references public.questions(id),
  served_at timestamptz not null default now(),
  answered_at timestamptz,
  choice text check (choice in ('MYTH','FACT','NOT_SURE','TIMEOUT')),
  outcome text check (outcome in ('correct','incorrect','not_sure','timeout')),
  correct boolean,
  points int,
  primary key (attempt_id, idx)
);

create table public.pairs_flips (
  attempt_id uuid not null references public.game_attempts(id) on delete cascade,
  card_a text not null,
  card_b text not null,
  matched boolean not null,
  at timestamptz not null default now()
);

create table public.player_totals (
  player_id uuid primary key references public.players(id) on update cascade on delete cascade,
  total_nmbp bigint not null default 0,
  rounds_completed int not null default 0,
  categories text[] not null default '{}',
  avg_nmbp numeric(8,2) not null default 0,
  best_nmbp int not null default 0,
  total_reached_at timestamptz not null default now()
);

create table public.achievements (
  id text primary key,
  name text not null,
  rule text not null,
  sort int not null
);

create table public.player_achievements (
  player_id uuid not null references public.players(id) on update cascade on delete cascade,
  achievement_id text not null references public.achievements(id),
  attempt_id uuid references public.game_attempts(id) on delete set null,
  earned_at timestamptz not null default now(),
  primary key (player_id, achievement_id)
);

create table public.cta_events (
  event text primary key check (event in ('results_shown','join_clicked')),
  count bigint not null default 0
);
insert into public.cta_events (event) values ('results_shown'), ('join_clicked');

create table public.rate_events (
  key text not null,
  at timestamptz not null default now()
);
create index rate_events_key on public.rate_events (key, at);

insert into public.achievements (id, name, rule, sort) values
  ('first_investigation', 'First Investigation', 'Complete your first quiz.', 1),
  ('myth_hunter', 'Myth Hunter', 'Correctly identify 5 myths in one attempt.', 2),
  ('fact_finder', 'Fact Finder', 'Correctly identify 5 fact statements in one attempt.', 3),
  ('perfect_round', 'Perfect Round', 'Answer every question correctly in a round.', 4),
  ('pink_pair_pro', 'Pink Pair Pro', 'Complete Pink Pairs Challenge Mode.', 5),
  ('awareness_champion', 'Awareness Champion', 'Complete 10 rounds.', 6),
  ('personal_best', 'Personal Best', 'Beat your previous best Myth Buster Points.', 7),
  ('knowledge_explorer', 'Knowledge Explorer', 'Complete all five categories.', 8);

-- ---------------------------------------------------------------- RLS: deny everything to clients

do $$
declare t text;
begin
  foreach t in array array['players','questions','matching_pairs','game_attempts','answers','pairs_flips',
                           'player_totals','achievements','player_achievements','cta_events','rate_events']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- pure scoring helpers

create or replace function public.mb_nmbp(raw int, max_raw int) returns int
language sql immutable as $$
  select greatest(0, least(1000, floor(1000.0 * raw / max_raw + 0.5)::int));
$$;

create or replace function public.mb_quiz_points(is_correct boolean, timed boolean, remaining_s numeric, total_s int) returns int
language sql immutable as $$
  select case
    when not is_correct then 0
    when not timed or total_s is null then 100
    else 100 + floor(50.0 * greatest(0, least(remaining_s, total_s)) / total_s)::int
  end;
$$;

create or replace function public.mb_pairs_score(elapsed_s int, incorrect_flips int, challenge boolean) returns int
language sql immutable as $$
  select case when challenge
    then round(greatest(200, 2000 - 25 * elapsed_s - 50 * incorrect_flips) * 1.5)::int
    else greatest(200, 2000 - 25 * elapsed_s - 50 * incorrect_flips)
  end;
$$;

-- ---------------------------------------------------------------- internal helpers

create or replace function public.mb_rate_check(p_key text, p_limit int, p_window interval) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from rate_events where key = p_key and at < now() - p_window;
  select count(*) into n from rate_events where key = p_key and at >= now() - p_window;
  if n >= p_limit then return false; end if;
  insert into rate_events (key) values (p_key);
  return true;
end $$;

create or replace function public.mb_require_player(p_player uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from players where id = p_player) then
    raise exception 'no_profile' using errcode = 'P0001';
  end if;
end $$;

create or replace function public.mb_rank(p_player uuid) returns int
language sql stable security definer set search_path = public as $$
  with me as (select * from player_totals where player_id = p_player and rounds_completed > 0)
  select case when not exists (select 1 from me) then null else (
    select count(*)::int + 1 from player_totals t, me
    where t.rounds_completed > 0 and (
      t.total_nmbp > me.total_nmbp
      or (t.total_nmbp = me.total_nmbp and t.avg_nmbp > me.avg_nmbp)
      or (t.total_nmbp = me.total_nmbp and t.avg_nmbp = me.avg_nmbp and cardinality(t.categories) > cardinality(me.categories))
      or (t.total_nmbp = me.total_nmbp and t.avg_nmbp = me.avg_nmbp and cardinality(t.categories) = cardinality(me.categories)
          and t.rounds_completed > me.rounds_completed)
      or (t.total_nmbp = me.total_nmbp and t.avg_nmbp = me.avg_nmbp and cardinality(t.categories) = cardinality(me.categories)
          and t.rounds_completed = me.rounds_completed and t.total_reached_at < me.total_reached_at)
    )) end;
$$;

create or replace function public.mb_broadcast() returns void
language plpgsql security definer set search_path = public as $$
begin
  begin
    perform realtime.send(jsonb_build_object('at', now()), 'leaderboard_changed', 'leaderboard', false);
  exception when others then
    null; -- realtime is best-effort; clients also poll
  end;
end $$;

-- Applies a validated, scored attempt to the player's totals exactly once and awards achievements.
create or replace function public.mb_apply_completion(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a game_attempts;
  t player_totals;
  prev_best int;
  prev_rounds int;
  myths int := 0;
  facts int := 0;
  earned text[] := '{}';
  ach text;
begin
  select * into a from game_attempts where id = p_attempt;

  insert into player_totals (player_id) values (a.player_id) on conflict (player_id) do nothing;
  select * into t from player_totals where player_id = a.player_id for update;
  prev_best := t.best_nmbp;
  prev_rounds := t.rounds_completed;

  update player_totals set
    total_nmbp = total_nmbp + a.nmbp,
    rounds_completed = rounds_completed + 1,
    categories = case when a.category = any(categories) then categories else categories || a.category end,
    avg_nmbp = round((total_nmbp + a.nmbp)::numeric / (rounds_completed + 1), 2),
    best_nmbp = greatest(best_nmbp, a.nmbp),
    total_reached_at = case when a.nmbp > 0 or prev_rounds = 0 then now() else total_reached_at end
  where player_id = a.player_id
  returning * into t;

  if a.mode = 'quiz' then
    select count(*) filter (where q.answer = 'MYTH' and an.correct),
           count(*) filter (where q.answer = 'FACT' and an.correct)
      into myths, facts
      from answers an join questions q on q.id = an.question_id
     where an.attempt_id = a.id;
    earned := array_append(earned, 'first_investigation');
    if myths >= 5 then earned := array_append(earned, 'myth_hunter'); end if;
    if facts >= 5 then earned := array_append(earned, 'fact_finder'); end if;
    if a.correct_count = cardinality(a.question_ids) then earned := array_append(earned, 'perfect_round'); end if;
  elsif a.mode = 'pairs_challenge' then
    earned := array_append(earned, 'pink_pair_pro');
  end if;
  if t.rounds_completed >= 10 then earned := array_append(earned, 'awareness_champion'); end if;
  if prev_rounds > 0 and a.nmbp > prev_best then earned := array_append(earned, 'personal_best'); end if;
  if cardinality(t.categories) >= 5 then earned := array_append(earned, 'knowledge_explorer'); end if;

  -- Only report achievements that are new for this player.
  with ins as (
    insert into player_achievements (player_id, achievement_id, attempt_id)
    select a.player_id, x, a.id from unnest(earned) x
    on conflict do nothing
    returning achievement_id
  )
  select coalesce(array_agg(achievement_id), '{}') into earned from ins;

  perform mb_broadcast();

  return jsonb_build_object(
    'total_nmbp', t.total_nmbp,
    'rounds_completed', t.rounds_completed,
    'categories_completed', cardinality(t.categories),
    'avg_nmbp', t.avg_nmbp,
    'rank', mb_rank(a.player_id),
    'new_achievements', (
      select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'rule', rule) order by sort), '[]'::jsonb)
      from achievements where id = any(earned))
  );
end $$;

-- ---------------------------------------------------------------- profile

create or replace function public.mb_set_profile(p_player uuid, p_nickname text, p_character text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  insert into players (id, nickname, character) values (p_player, btrim(p_nickname), p_character)
  on conflict (id) do update set nickname = excluded.nickname, character = excluded.character;
  return (select jsonb_build_object('id', id, 'nickname', nickname, 'character', character) from players where id = p_player);
exception when unique_violation then
  raise exception 'nickname_taken' using errcode = 'P0001';
end $$;

create or replace function public.mb_get_profile(p_player uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', id, 'nickname', nickname, 'character', character,
                            'has_recovery_code', recovery_code_hash is not null)
  from players where id = p_player;
$$;

create or replace function public.mb_set_recovery_hash(p_player uuid, p_hash text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform mb_require_player(p_player);
  update players set recovery_code_hash = p_hash where id = p_player;
end $$;

-- Moves a profile (and through ON UPDATE CASCADE, its history) onto the caller's new anonymous id.
create or replace function public.mb_redeem_recovery(p_new_player uuid, p_hash text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare old_id uuid;
begin
  select id into old_id from players where recovery_code_hash = p_hash;
  if old_id is null then raise exception 'invalid_code' using errcode = 'P0001'; end if;
  if old_id = p_new_player then return mb_get_profile(old_id); end if;
  if exists (select 1 from game_attempts where player_id = p_new_player and status = 'completed') then
    raise exception 'device_has_progress' using errcode = 'P0001';
  end if;
  delete from players where id = p_new_player;
  update players set id = p_new_player, recovery_code_hash = null where id = old_id;
  return mb_get_profile(p_new_player);
end $$;

create or replace function public.mb_delete_player(p_player uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from players where id = p_player;
  perform mb_broadcast();
end $$;

-- ---------------------------------------------------------------- quiz

create or replace function public.mb_start_quiz(p_player uuid, p_category text, p_timed boolean, p_include_draft boolean default false)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  n int := case when p_category = 'ultimate' then 15 else 10 end;
  recent text[];
  picked text[];
  att uuid;
begin
  perform mb_require_player(p_player);
  if p_category not in ('basics','signs','risk','ultimate') then
    raise exception 'bad_category' using errcode = 'P0001';
  end if;
  if not mb_rate_check('attempt:' || p_player, 30, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(qid), '{}') into recent from (
    select unnest(question_ids) qid from (
      select question_ids from game_attempts
      where player_id = p_player and category = p_category and mode = 'quiz' and status <> 'in_progress'
      order by started_at desc limit 2) r) x;

  -- Ultimate draws from every quiz category, spread across topics; the others draw from their own bank.
  with pool as (
    select q.id, q.topic,
           (q.id = any(recent)) as seen,
           row_number() over (partition by q.topic order by (q.id = any(recent)), random()) as topic_rank
    from questions q
    where (q.review_status = 'approved' or p_include_draft)
      and (p_category = 'ultimate' or q.category = p_category)
  )
  select array_agg(id) into picked from (
    select id from pool
    order by seen, case when p_category = 'ultimate' then topic_rank else 1 end, random()
    limit n) s;

  if picked is null or cardinality(picked) < n then
    raise exception 'not_enough_questions' using errcode = 'P0001';
  end if;

  insert into game_attempts (player_id, category, mode, difficulty, timed, question_time, question_ids)
  values (p_player, p_category, 'quiz',
          case p_category when 'basics' then 'easy' when 'signs' then 'easy-medium' when 'risk' then 'medium' else 'challenging' end,
          p_timed, case when p_timed then 20 end, picked)
  returning id into att;

  return jsonb_build_object('attempt_id', att, 'total', n, 'timed', p_timed,
                            'question_time', case when p_timed then 20 end);
end $$;

create or replace function public.mb_serve_question(p_player uuid, p_attempt uuid, p_idx int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a game_attempts;
  an answers;
  answered int;
begin
  select * into a from game_attempts where id = p_attempt and player_id = p_player;
  if a.id is null then raise exception 'not_found' using errcode = 'P0001'; end if;
  if a.status <> 'in_progress' then raise exception 'attempt_closed' using errcode = 'P0001'; end if;
  if p_idx < 0 or p_idx >= cardinality(a.question_ids) then raise exception 'bad_index' using errcode = 'P0001'; end if;
  select count(*) into answered from answers where attempt_id = a.id and answered_at is not null;
  if p_idx <> answered then raise exception 'out_of_order' using errcode = 'P0001'; end if;

  insert into answers (attempt_id, idx, question_id) values (a.id, p_idx, a.question_ids[p_idx + 1])
  on conflict (attempt_id, idx) do nothing;   -- re-serving keeps the original served_at (timer can't be reset)
  select * into an from answers where attempt_id = a.id and idx = p_idx;

  return (select jsonb_build_object(
    'idx', p_idx, 'total', cardinality(a.question_ids), 'statement', q.statement,
    'timed', a.timed, 'question_time', a.question_time,
    'remaining', case when a.timed then greatest(0, a.question_time - extract(epoch from now() - an.served_at)) end)
    from questions q where q.id = an.question_id);
end $$;

create or replace function public.mb_submit_answer(p_player uuid, p_attempt uuid, p_idx int, p_choice text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a game_attempts;
  an answers;
  q questions;
  elapsed numeric;
  v_outcome text;
  v_correct boolean := false;
  v_points int := 0;
  v_choice text := p_choice;
begin
  if p_choice not in ('MYTH','FACT','NOT_SURE','TIMEOUT') then raise exception 'bad_choice' using errcode = 'P0001'; end if;
  select * into a from game_attempts where id = p_attempt and player_id = p_player for update;
  if a.id is null then raise exception 'not_found' using errcode = 'P0001'; end if;
  if a.status <> 'in_progress' then raise exception 'attempt_closed' using errcode = 'P0001'; end if;
  select * into an from answers where attempt_id = a.id and idx = p_idx;
  if an.attempt_id is null then raise exception 'not_served' using errcode = 'P0001'; end if;
  if an.answered_at is not null then raise exception 'already_answered' using errcode = 'P0001'; end if;
  select * into q from questions where id = an.question_id;

  elapsed := extract(epoch from now() - an.served_at);
  if elapsed < 1 then
    update game_attempts set status = 'rejected', rejected_reason = 'answer_under_1s', completed_at = now() where id = a.id;
    return jsonb_build_object('rejected', true, 'reason', 'answer_under_1s');
  end if;

  if not a.timed and v_choice = 'TIMEOUT' then v_choice := 'NOT_SURE'; end if;
  if a.timed and (v_choice = 'TIMEOUT' or elapsed > a.question_time + 2) then
    v_outcome := 'timeout';
    v_choice := 'TIMEOUT';
  elsif v_choice = 'NOT_SURE' then
    v_outcome := 'not_sure';
  else
    v_correct := (v_choice = q.answer);
    v_outcome := case when v_correct then 'correct' else 'incorrect' end;
    v_points := mb_quiz_points(v_correct, a.timed, a.question_time - elapsed, a.question_time);
  end if;

  update answers set answered_at = now(), choice = v_choice, outcome = v_outcome, correct = v_correct, points = v_points
  where attempt_id = a.id and idx = p_idx;

  return jsonb_build_object(
    'rejected', false, 'outcome', v_outcome, 'correct', v_correct, 'points', v_points,
    'answer', q.answer, 'statement', q.statement,
    'explanation_short', q.explanation_short, 'explanation_long', q.explanation_long,
    'source_name', q.source_name, 'source_url', q.source_url,
    'score', (select coalesce(sum(points), 0) from answers where attempt_id = a.id),
    'is_last', p_idx + 1 = cardinality(a.question_ids));
end $$;

create or replace function public.mb_complete_quiz(p_player uuid, p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a game_attempts;
  n int;
  answered int; raw int; c int; i int; ns int;
  totals jsonb;
begin
  select * into a from game_attempts where id = p_attempt and player_id = p_player for update;
  if a.id is null or a.mode <> 'quiz' then raise exception 'not_found' using errcode = 'P0001'; end if;
  if a.status <> 'in_progress' then
    -- Idempotent: a repeated completion returns the stored result and awards nothing.
    return mb_attempt_result(p_player, p_attempt);
  end if;
  n := cardinality(a.question_ids);
  select count(*) filter (where answered_at is not null), coalesce(sum(points), 0),
         count(*) filter (where outcome = 'correct'), count(*) filter (where outcome = 'incorrect'),
         count(*) filter (where outcome in ('not_sure','timeout'))
    into answered, raw, c, i, ns
    from answers where attempt_id = a.id;
  if answered <> n then
    raise exception 'incomplete' using errcode = 'P0001';
  end if;

  update game_attempts set
    status = 'completed', completed_at = now(),
    elapsed_seconds = floor(extract(epoch from now() - started_at))::int,
    raw_score = raw, max_raw_score = 150 * n, nmbp = mb_nmbp(raw, 150 * n),
    accuracy = round(c::numeric / n, 4), correct_count = c, incorrect_count = i, not_sure_count = ns
  where id = a.id and status = 'in_progress';

  totals := mb_apply_completion(a.id);
  return mb_attempt_result(p_player, p_attempt) || jsonb_build_object('new_achievements', totals->'new_achievements');
end $$;

-- ---------------------------------------------------------------- Pink Pairs

create or replace function public.mb_start_pairs(p_player uuid, p_mode text, p_include_draft boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  n int := case when p_mode = 'pairs_challenge' then 8 else 4 end;
  picked text[];
  layout jsonb;
  att uuid;
begin
  perform mb_require_player(p_player);
  if p_mode not in ('pairs_easy','pairs_challenge') then raise exception 'bad_mode' using errcode = 'P0001'; end if;
  if not mb_rate_check('attempt:' || p_player, 30, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  -- Rotate pairs: least-recently-seen by this player first, then random.
  with seen as (
    select pid, max(started_at) last_seen from (
      select unnest(pair_ids) pid, started_at from game_attempts
      where player_id = p_player and pair_ids is not null) x group by pid)
  select array_agg(id) into picked from (
    select mp.id from matching_pairs mp left join seen s on s.pid = mp.id
    where mp.review_status = 'approved' or p_include_draft
    order by s.last_seen nulls first, random()
    limit n) p;

  if picked is null or cardinality(picked) < n then
    raise exception 'not_enough_pairs' using errcode = 'P0001';
  end if;

  select jsonb_agg(c order by random()) into layout from (
    select jsonb_build_object('id', substr(md5(gen_random_uuid()::text), 1, 10), 'pair_id', mp.id, 'side', s.side) c
    from matching_pairs mp cross join (values ('a'), ('b')) s(side)
    where mp.id = any(picked)) z;

  insert into game_attempts (player_id, category, mode, difficulty, timed, pair_ids, cards)
  values (p_player, 'pairs', p_mode, case when p_mode = 'pairs_easy' then 'easy' else 'challenge' end,
          p_mode = 'pairs_challenge', picked, layout)
  returning id into att;

  return jsonb_build_object('attempt_id', att, 'mode', p_mode, 'pairs', n, 'cards', mb_pairs_cards(att));
end $$;

-- Public card faces (no pair ids) for an attempt.
create or replace function public.mb_pairs_cards(p_attempt uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_agg(jsonb_build_object(
           'id', c->>'id',
           'text', case when c->>'side' = 'a' then mp.card_a else mp.card_b end,
           'kind', case when c->>'side' = 'a' then mp.label_a else mp.label_b end,
           'matched', mp.id = any(a.matched_pair_ids))
         order by ord)
  from game_attempts a,
       jsonb_array_elements(a.cards) with ordinality as e(c, ord)
       join matching_pairs mp on mp.id = e.c->>'pair_id'
  where a.id = p_attempt;
$$;

create or replace function public.mb_flip_pair(p_player uuid, p_attempt uuid, p_card_a text, p_card_b text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a game_attempts;
  pa text; pb text;
  mp matching_pairs;
  is_match boolean;
begin
  select * into a from game_attempts where id = p_attempt and player_id = p_player for update;
  if a.id is null or a.mode not like 'pairs_%' then raise exception 'not_found' using errcode = 'P0001'; end if;
  if a.status <> 'in_progress' then raise exception 'attempt_closed' using errcode = 'P0001'; end if;
  if p_card_a = p_card_b then raise exception 'same_card' using errcode = 'P0001'; end if;
  select c->>'pair_id' into pa from jsonb_array_elements(a.cards) c where c->>'id' = p_card_a;
  select c->>'pair_id' into pb from jsonb_array_elements(a.cards) c where c->>'id' = p_card_b;
  if pa is null or pb is null then raise exception 'bad_card' using errcode = 'P0001'; end if;
  if pa = any(a.matched_pair_ids) or pb = any(a.matched_pair_ids) then
    raise exception 'already_matched' using errcode = 'P0001';
  end if;

  is_match := pa = pb;
  insert into pairs_flips (attempt_id, card_a, card_b, matched) values (a.id, p_card_a, p_card_b, is_match);
  if is_match then
    update game_attempts set matched_pair_ids = matched_pair_ids || pa where id = a.id returning * into a;
    select * into mp from matching_pairs where id = pa;
    return jsonb_build_object('matched', true, 'incorrect_flips', a.incorrect_flips,
      'pairs_found', cardinality(a.matched_pair_ids), 'pairs_total', cardinality(a.pair_ids),
      'pair', jsonb_build_object('id', mp.id, 'type', mp.pair_type, 'card_a', mp.card_a, 'card_b', mp.card_b,
                                 'label_a', mp.label_a, 'label_b', mp.label_b, 'explanation', mp.explanation,
                                 'source_name', mp.source_name, 'source_url', mp.source_url));
  end if;
  update game_attempts set incorrect_flips = incorrect_flips + 1 where id = a.id returning * into a;
  return jsonb_build_object('matched', false, 'incorrect_flips', a.incorrect_flips,
    'pairs_found', cardinality(a.matched_pair_ids), 'pairs_total', cardinality(a.pair_ids));
end $$;

create or replace function public.mb_complete_pairs(p_player uuid, p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a game_attempts;
  secs int;
  raw int;
  max_raw int;
  totals jsonb;
begin
  select * into a from game_attempts where id = p_attempt and player_id = p_player for update;
  if a.id is null or a.mode not like 'pairs_%' then raise exception 'not_found' using errcode = 'P0001'; end if;
  if a.status <> 'in_progress' then return mb_attempt_result(p_player, p_attempt); end if;
  if cardinality(a.matched_pair_ids) <> cardinality(a.pair_ids) then
    raise exception 'incomplete' using errcode = 'P0001';
  end if;

  secs := floor(extract(epoch from now() - a.started_at))::int;
  if (a.mode = 'pairs_easy' and secs < 8) or (a.mode = 'pairs_challenge' and secs < 20) then
    update game_attempts set status = 'rejected', rejected_reason = 'too_fast', completed_at = now(), elapsed_seconds = secs
    where id = a.id;
    return mb_attempt_result(p_player, p_attempt);
  end if;

  raw := mb_pairs_score(secs, a.incorrect_flips, a.mode = 'pairs_challenge');
  max_raw := case when a.mode = 'pairs_challenge' then 3000 else 2000 end;
  update game_attempts set status = 'completed', completed_at = now(), elapsed_seconds = secs,
    raw_score = raw, max_raw_score = max_raw, nmbp = mb_nmbp(raw, max_raw),
    accuracy = round(cardinality(pair_ids)::numeric / (cardinality(pair_ids) + incorrect_flips), 4)
  where id = a.id and status = 'in_progress';

  totals := mb_apply_completion(a.id);
  return mb_attempt_result(p_player, p_attempt) || jsonb_build_object('new_achievements', totals->'new_achievements');
end $$;

-- ---------------------------------------------------------------- results, leaderboard, progress

create or replace function public.mb_attempt_result(p_player uuid, p_attempt uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  a game_attempts;
  t player_totals;
  review jsonb;
begin
  select * into a from game_attempts where id = p_attempt and player_id = p_player;
  if a.id is null then raise exception 'not_found' using errcode = 'P0001'; end if;
  select * into t from player_totals where player_id = p_player;

  if a.mode = 'quiz' then
    select jsonb_agg(jsonb_build_object('statement', q.statement, 'answer', q.answer, 'outcome', an.outcome,
             'points', an.points, 'explanation', q.explanation_short, 'source_name', q.source_name,
             'source_url', q.source_url) order by an.idx)
      into review from answers an join questions q on q.id = an.question_id where an.attempt_id = a.id;
  else
    select jsonb_agg(jsonb_build_object('type', mp.pair_type, 'card_a', mp.card_a, 'card_b', mp.card_b,
             'label_a', mp.label_a, 'label_b', mp.label_b, 'explanation', mp.explanation,
             'source_name', mp.source_name, 'source_url', mp.source_url) order by array_position(a.pair_ids, mp.id))
      into review from matching_pairs mp where mp.id = any(a.pair_ids);
  end if;

  return jsonb_build_object(
    'attempt_id', a.id, 'category', a.category, 'mode', a.mode, 'timed', a.timed, 'status', a.status,
    'rejected_reason', a.rejected_reason,
    'raw_score', a.raw_score, 'max_raw_score', a.max_raw_score, 'nmbp', a.nmbp,
    'correct', a.correct_count, 'incorrect', a.incorrect_count, 'not_sure', a.not_sure_count,
    'total_questions', cardinality(a.question_ids),
    'elapsed_seconds', a.elapsed_seconds, 'incorrect_flips', a.incorrect_flips,
    'total_nmbp', coalesce(t.total_nmbp, 0), 'rounds_completed', coalesce(t.rounds_completed, 0),
    'categories_completed', coalesce(cardinality(t.categories), 0), 'rank', mb_rank(p_player),
    'achievements', (select coalesce(jsonb_agg(jsonb_build_object('id', ac.id, 'name', ac.name, 'rule', ac.rule)), '[]'::jsonb)
                     from player_achievements pa join achievements ac on ac.id = pa.achievement_id
                     where pa.attempt_id = a.id),
    'review', coalesce(review, '[]'::jsonb));
end $$;

create or replace function public.mb_leaderboard(p_limit int default 50, p_offset int default 0) returns jsonb
language sql stable security definer set search_path = public as $$
  with ranked as (
    select p.nickname, p.character, t.total_nmbp, t.rounds_completed,
           cardinality(t.categories) as categories_completed, t.avg_nmbp,
           row_number() over (order by t.total_nmbp desc, t.avg_nmbp desc, cardinality(t.categories) desc,
                                       t.rounds_completed desc, t.total_reached_at asc) as rank
    from player_totals t join players p on p.id = t.player_id
    where t.rounds_completed > 0
  )
  select jsonb_build_object(
    'total_players', (select count(*) from ranked),
    'rows', coalesce((select jsonb_agg(to_jsonb(r) order by r.rank)
                      from (select * from ranked order by rank offset greatest(p_offset, 0) limit least(greatest(p_limit, 1), 100)) r),
                     '[]'::jsonb));
$$;

create or replace function public.mb_my_progress(p_player uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'profile', mb_get_profile(p_player),
    'total_nmbp', coalesce(t.total_nmbp, 0),
    'rounds_completed', coalesce(t.rounds_completed, 0),
    'categories', coalesce(to_jsonb(t.categories), '[]'::jsonb),
    'categories_completed', coalesce(cardinality(t.categories), 0),
    'avg_nmbp', coalesce(t.avg_nmbp, 0),
    'best_nmbp', coalesce(t.best_nmbp, 0),
    'rank', mb_rank(p_player),
    'quiz_accuracy', (select round(avg(accuracy), 4) from game_attempts
                      where player_id = p_player and status = 'completed' and mode = 'quiz'),
    'pairs_best', (select jsonb_build_object(
                     'easy', min(elapsed_seconds) filter (where mode = 'pairs_easy'),
                     'challenge', min(elapsed_seconds) filter (where mode = 'pairs_challenge'))
                   from game_attempts where player_id = p_player and status = 'completed'),
    'achievements', (select jsonb_agg(jsonb_build_object('id', ac.id, 'name', ac.name, 'rule', ac.rule,
                       'earned', pa.player_id is not null, 'earned_at', pa.earned_at) order by ac.sort)
                     from achievements ac
                     left join player_achievements pa on pa.achievement_id = ac.id and pa.player_id = p_player),
    'recent', (select coalesce(jsonb_agg(r), '[]'::jsonb) from (
                 select id as attempt_id, category, mode, nmbp, raw_score, completed_at
                 from game_attempts where player_id = p_player and status = 'completed'
                 order by completed_at desc limit 10) r))
  from (select 1) one
  left join player_totals t on t.player_id = p_player;
$$;

create or replace function public.mb_track_cta(p_event text) returns void
language sql security definer set search_path = public as $$
  update cta_events set count = count + 1 where event = p_event;
$$;

-- ---------------------------------------------------------------- privileges: service_role only

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
grant all on all tables in schema public to service_role;
