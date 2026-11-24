export type Event = {
  id: number;
  name: string;
  startAt: string | null;
  endAt: string | null;
  is_team_rank_visible: boolean;
  is_user_rank_visible: boolean;
  event_categories: {
    category_id: number;
    event_id: number;
    action_categories: {
      is_single_selection: boolean;
      id: number;
      name: string;
      order_id: number;
      actions: {
        id: number;
        name: string;
        point: number;
        order_id: number;
      }[];
    } | null;
  }[];
  event_teams: {
    team_id: number;
    teams: {
      id: number;
      name: string;
    } | null;
  }[];
};

export type PublishedEvent = {
  id: number;
  name: string;
  startAt: string | null;
  endAt: string | null;
  is_team_rank_visible: boolean;
  is_user_rank_visible: boolean;
  event_categories: {
    category_id: number;
    event_id: number;
    name_snapshot: string | null;
    order_id_snapshot: number | null;
    is_single_selection_snapshot: boolean;
    event_actions_snapshot: {
      action_id: number;
      event_id: number;
      name: string;
      point: number;
      order_id: number;
    }[];
  }[];
  event_teams: {
    team_id: number;
    name_snapshot: string | null;
  }[];
};

export type DailyRecord = {
  date: string;
  id: number;
  last_action_point_cumulative: number;
  last_step_cumulative: number;
  today_action_point_summary: number;
  today_step_summary: number;
  record_actions: { action_id: number }[];
};
