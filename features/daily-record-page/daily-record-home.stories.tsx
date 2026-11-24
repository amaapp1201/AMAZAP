import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { DailyRecordHome } from "./daily-record-home";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "DailyRecordHome",
  component: DailyRecordHome,

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    updateDailyRecord: () => Promise.resolve(),
  },
} satisfies Meta<typeof DailyRecordHome>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = [
  {
    id: 1,
    name: "日常生活",
    orderId: 1,
    actions: [
      {
        id: 1,
        name: "歩く",
        point: 3,
        orderId: 1,
      },
      {
        id: 2,
        name: "歌う",
        point: 4,
        orderId: 2,
      },
      {
        id: 3,
        name: "走る",
        point: 5,
        orderId: 3,
      },
    ],
    isSingleSelection: false,
  },
  {
    id: 2,
    name: "学校生活",
    orderId: 2,
    actions: [
      {
        id: 4,
        name: "勉強",
        point: 10,
        orderId: 1,
      },
      {
        id: 5,
        name: "部活動",
        point: 20,
        orderId: 2,
      },
    ],
    isSingleSelection: false,
  },
  {
    id: 3,
    name: "運動",
    orderId: 2,
    actions: [
      {
        id: 6,
        name: "軽い運動",
        point: 30,
        orderId: 1,
      },
      {
        id: 7,
        name: "激しい運動",
        point: 50,
        orderId: 2,
      },
    ],
    isSingleSelection: true,
  },
];

const todayDailyRecord = {
  date: "2021-10-01",
  id: 1,
  last_action_point_cumulative: 0,
  last_step_cumulative: 0,
  today_action_point_summary: 0,
  today_step_summary: 0,
  record_actions: [],
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const 期間中イベント: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00Z",
      endAt: "2021-10-10T00:00:00Z",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    isoCurrentDate: "2021-10-01T00:00:00Z",
    isoActualCurrentDate: "2021-10-01T00:00:00Z",

    todayDailyRecord: todayDailyRecord,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 歩くアクションをクリック
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);

    // 勉強アクションをクリック
    const actionButton2 = canvas.getByRole("button", { name: /勉強/ });
    userEvent.click(actionButton2);

    // 総合ポイントが正しく表示されていることを確認
    const totalText = canvas.getByText("総合");
    expect(totalText).toBeInTheDocument();

    const totalPoint = await canvas.findAllByText("13");
    expect(totalPoint).toHaveLength(2);

    // 軽い運動アクションをクリック
    const actionButton3 = canvas.getByRole("button", { name: /軽い運動/ });
    userEvent.click(actionButton3);

    // 総合ポイントが正しく表示されていることを確認
    const totalPoint2 = await canvas.findAllByText("43");
    expect(totalPoint2).toHaveLength(2);

    // 激しい運動アクションをクリック
    const actionButton4 = canvas.getByRole("button", { name: /激しい運動/ });
    userEvent.click(actionButton4);

    // 総合ポイントが正しく表示されていることを確認
    const totalPoint3 = await canvas.findAllByText("63");
    expect(totalPoint3).toHaveLength(2);

    // 歩数を入力
    const stepsInput = canvas.getByLabelText(/今日の歩数/);
    userEvent.type(stepsInput, "2000");

    // 歩数分ポイントが表示されている
    const stepsPoint = await canvas.findByText("2pt");
    expect(stepsPoint).toBeInTheDocument();

    // 総合ポイントが正しく表示されていることを確認
    const totalPoint4 = await canvas.findAllByText("65");
    expect(totalPoint4).toHaveLength(2);
  },
};

export const イベント開始1秒前: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00Z",
      endAt: "2021-10-10T00:00:00Z",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-09-19T23:59:59Z",
    isoActualCurrentDate: "2021-09-19T23:59:59Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // アクションの入力が締め切られていることを確認
    const title = canvas.getByText("※この日のアクションの入力は締め切りました");
    expect(title).toBeInTheDocument();

    // アクションボタンがクリックできないことを確認
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);
    const actionButton2 = canvas.getByRole("button", { name: /歌う/ });
    userEvent.click(actionButton2);

    // ポイントが表示されていないことを確認
    const totalPoint = canvas.queryByText("7");
    expect(totalPoint).not.toBeInTheDocument();

    // 入力フォームを取得
    const input = canvas.getByLabelText(/今日の歩数/);

    // 入力フォームが無効化されていることを確認
    expect(input).toBeDisabled();

    // 無効な入力操作
    await userEvent.type(input, "123");

    // 値が変更されないことを確認
    expect(input).toHaveValue("0"); // デフォルト値のまま
  },
};

export const イベント開始時間ちょうど: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00Z",
      endAt: "2021-10-10T00:00:00Z",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-09-20T00:00:00Z",
    isoActualCurrentDate: "2021-09-20T00:00:00Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 歩くアクションをクリック
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);

    // 勉強アクションをクリック
    const actionButton2 = canvas.getByRole("button", { name: /勉強/ });
    userEvent.click(actionButton2);

    // 総合ポイントが正しく表示されていることを確認
    const totalText = canvas.getByText("総合");
    expect(totalText).toBeInTheDocument();

    const totalPoint = await canvas.findAllByText("13");
    expect(totalPoint).toHaveLength(2);
  },
};

export const イベント終了時間ちょうど: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00Z",
      endAt: "2021-10-10T00:00:00Z",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-10-10T00:00:00Z",
    isoActualCurrentDate: "2021-10-10T00:00:00Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 歩くアクションをクリック
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);

    // 勉強アクションをクリック
    const actionButton2 = canvas.getByRole("button", { name: /勉強/ });
    userEvent.click(actionButton2);

    // 総合ポイントが正しく表示されていることを確認
    const totalText = canvas.getByText("総合");
    expect(totalText).toBeInTheDocument();

    const totalPoint = await canvas.findAllByText("13");
    expect(totalPoint).toHaveLength(2);
  },
};

export const イベント開始日の前日入力不可能: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00+09:00",
      endAt: "2021-10-10T00:00:00+09:00",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-09-19T01:00:00+09:00",
    isoActualCurrentDate: "2021-09-20T01:00:00+09:00",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // アクションの入力が締め切られていることを確認
    const title = canvas.getByText("※この日のアクションの入力は締め切りました");
    expect(title).toBeInTheDocument();

    // アクションボタンがクリックできないことを確認
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);
    const actionButton2 = canvas.getByRole("button", { name: /歌う/ });
    userEvent.click(actionButton2);

    // ポイントが表示されていないことを確認
    const totalPoint = canvas.queryByText("7");
    expect(totalPoint).not.toBeInTheDocument();

    // 入力フォームを取得
    const input = canvas.getByLabelText(/今日の歩数/);

    // 入力フォームが無効化されていることを確認
    expect(input).toBeDisabled();

    // 無効な入力操作
    await userEvent.type(input, "123");

    // 値が変更されないことを確認
    expect(input).toHaveValue("0"); // デフォルト値のまま
  },
};

export const イベント開始次の日の前日入力可能: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00+09:00",
      endAt: "2021-10-10T00:00:00+09:00",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-09-21T00:00:00+09:00",
    isoActualCurrentDate: "2021-09-21T00:00:00+09:00",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 歩くアクションをクリック
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);

    // 勉強アクションをクリック
    const actionButton2 = canvas.getByRole("button", { name: /勉強/ });
    userEvent.click(actionButton2);

    // 総合ポイントが正しく表示されていることを確認
    const totalText = canvas.getByText("総合");
    expect(totalText).toBeInTheDocument();

    const totalPoint = await canvas.findAllByText("13");
    expect(totalPoint).toHaveLength(2);
  },
};

export const イベント終了次の日の前日入力可能: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00+09:00",
      endAt: "2021-10-10T00:00:00+09:00",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-10-10T00:00:00+09:00",
    isoActualCurrentDate: "2021-10-11T00:00:00+09:00",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 歩くアクションをクリック
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);

    // 勉強アクションをクリック
    const actionButton2 = canvas.getByRole("button", { name: /勉強/ });
    userEvent.click(actionButton2);

    // 総合ポイントが正しく表示されていることを確認
    const totalText = canvas.getByText("総合");
    expect(totalText).toBeInTheDocument();

    const totalPoint = await canvas.findAllByText("13");
    expect(totalPoint).toHaveLength(2);
  },
};

export const イベント終了日2日後の前日入力不可能: Story = {
  args: {
    userId: "111",
    currentEvent: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00+09:00",
      endAt: "2021-10-10T00:00:00+09:00",
      isTeamRankVisible: false,
      isUserRankVisible: false,
      categories: categories,
      teams: [
        {
          id: 1,
          name: "元気100倍",
        },
      ],
    },
    todayDailyRecord: todayDailyRecord,
    isoCurrentDate: "2021-10-11T01:00:00+09:00",
    isoActualCurrentDate: "2021-10-12T01:00:00+09:00",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // アクションの入力が締め切られていることを確認
    const title = canvas.getByText("※この日のアクションの入力は締め切りました");
    expect(title).toBeInTheDocument();

    // アクションボタンがクリックできないことを確認
    const actionButton1 = canvas.getByRole("button", { name: /歩く/ });
    userEvent.click(actionButton1);
    const actionButton2 = canvas.getByRole("button", { name: /歌う/ });
    userEvent.click(actionButton2);

    // ポイントが表示されていないことを確認
    const totalPoint = canvas.queryByText("7");
    expect(totalPoint).not.toBeInTheDocument();

    // 入力フォームを取得
    const input = canvas.getByLabelText(/今日の歩数/);

    // 入力フォームが無効化されていることを確認
    expect(input).toBeDisabled();

    // 無効な入力操作
    await userEvent.type(input, "123");

    // 値が変更されないことを確認
    expect(input).toHaveValue("0"); // デフォルト値のまま
  },
};
