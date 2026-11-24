-- イベントの中で、ユーザーごとに入力できる期間を設定できるようにする。
--
-- 行があるユーザーは start_date 〜 end_date（どちらの日も含む、日本時間の日付）だけ入力できる。
-- 行がないユーザーは、これまでどおりイベントの開催期間中ずっと入力できる。
--
-- 既存の Supabase プロジェクトには、SQL Editor でこのファイルの全文を一度だけ実行する。

begin;

create table public.event_user_periods (
  event_id bigint not null,
  user_id uuid not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint event_user_periods_pkey primary key (event_id, user_id),
  constraint event_user_periods_range_check check (start_date <= end_date),
  -- イベントやユーザーを削除したら、期間の設定も一緒に消す
  constraint event_user_periods_event_id_fkey
    foreign key (event_id) references public.events (id) on delete cascade,
  constraint event_user_periods_user_id_fkey
    foreign key (user_id) references next_auth.users (id) on delete cascade
);

alter table public.event_user_periods enable row level security;

-- 参加者は自分の期間を読む必要がある。設定できるのは管理者だけ
create policy "Enable read access for authenticated users only" on public.event_user_periods
  for select to authenticated using (true);
create policy "Enable insert for admin only" on public.event_user_periods
  for insert to authenticated with check (next_auth.is_admin());
create policy "Enable update for admin only" on public.event_user_periods
  for update to authenticated using (next_auth.is_admin()) with check (next_auth.is_admin());
create policy "Enable delete for admin only" on public.event_user_periods
  for delete to authenticated using (next_auth.is_admin());

revoke all on public.event_user_periods from anon;
grant select, insert, update, delete on public.event_user_periods to authenticated;
grant all on public.event_user_periods to service_role;

commit;
