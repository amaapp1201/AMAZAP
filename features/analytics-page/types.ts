// 分析画面に渡す、イベント 1 つ分の記録データ
export type AnalyticsData = {
  event: {
    id: number;
    name: string;
  };
  // 表示する日付（yyyy-MM-dd、日本時間）。イベントの開始日から、終了日と今日の早いほうまで
  days: string[];
  teams: { id: number; name: string }[];
  users: {
    id: string;
    name: string;
    teamId: number | null;
    // ユーザーごとの入力期間（yyyy-MM-dd）。設定がなければ null（開催期間中ずっと）
    period: { startDate: string; endDate: string } | null;
  }[];
  categories: { id: number; name: string }[];
  actions: { id: number; name: string; categoryId: number; point: number }[];
  // ユーザーの 1 日分の記録
  records: {
    userId: string;
    teamId: number;
    day: string;
    steps: number;
    actionPoints: number;
    actionIds: number[];
  }[];
};

export type AnalyticsEventOption = {
  id: number;
  name: string;
  status: "active" | "done";
};
