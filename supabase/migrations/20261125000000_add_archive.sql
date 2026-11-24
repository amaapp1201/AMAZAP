-- チーム、カテゴリ、アクション、ユーザーをアーカイブできるようにする。
--
-- archived_at が null なら利用中、日時が入っていればアーカイブ中。
-- アーカイブしたものは一覧や選択肢に出なくなるが、行は残るので、
-- 過去のイベントの記録や集計はそのまま読める。null に戻せば再び使える。
--
-- 既存の Supabase プロジェクトには、SQL Editor でこのファイルの全文を一度だけ実行する。

begin;

alter table public.teams add column archived_at timestamptz;
alter table public.action_categories add column archived_at timestamptz;
alter table public.actions add column archived_at timestamptz;
alter table next_auth.users add column archived_at timestamptz;

-- ユーザー一覧でアーカイブ中かどうかを絞り込めるよう、列を追加する
create or replace view public.user_teams_view as
select
  users.id as user_id,
  users.name as user_name,
  users.team_id,
  teams.name as team_name,
  users.is_admin,
  users.archived_at
from next_auth.users users
left join public.teams on users.team_id = teams.id;

-- イベント公開時の固定（スナップショット）から、アーカイブ中のものを除く
create or replace function public.insert_event_actions_snapshot(p_event_id bigint)
returns void
language plpgsql
as $$
begin
  insert into event_actions_snapshot (event_id, action_id, name, category_id, order_id, point)
  select
    p_event_id,
    actions.id,
    actions.name,
    actions.category_id,
    actions.order_id,
    actions.point
  from actions
  join event_categories
  on actions.category_id = event_categories.category_id
  where event_categories.event_id = p_event_id
    and actions.archived_at is null;
end;
$$;

create or replace function public.insert_event_users_snapshot(p_event_id bigint)
returns void
language plpgsql
as $$
begin
  insert into event_users_snapshot (event_id, user_id, team_id, name)
  select
    p_event_id,
    next_auth.users.id,
    next_auth.users.team_id,
    next_auth.users.name
  from next_auth.users
  join event_teams
  on next_auth.users.team_id = event_teams.team_id
  where event_teams.event_id = p_event_id
    and next_auth.users.archived_at is null;
end;
$$;

commit;
