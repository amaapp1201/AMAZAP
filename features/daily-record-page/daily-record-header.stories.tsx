import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { DailyRecordHeader } from "./daily-record-header";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "DailyRecordHeader",
  component: DailyRecordHeader,

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
} satisfies Meta<typeof DailyRecordHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const 期間中イベント: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-09-20T00:00:00Z",
      endAt: "2021-10-10T00:00:00Z",
      is_team_rank_visible: false,
      is_user_rank_visible: false,
    },
    isoCurrentDate: "2021-10-01T00:00:00Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが正しく表示されていることを確認
    const title = canvas.getByText("秋の運動キャンペーン");
    expect(title).toBeInTheDocument();

    // イベント期間外が表示されていないことを確認
    const message = canvas.queryByText("イベント期間外です");
    expect(message).not.toBeInTheDocument();

    // ランキングページへのリンクが表示されていないことを確認
    const link = canvas.queryByRole("link", { name: "ランキングページリンク" });
    expect(link).not.toBeInTheDocument();
  },
};

export const イベント開始1秒前: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-10-02T00:00:00Z",
      endAt: "2021-10-02T00:00:00Z",
      is_team_rank_visible: false,
      is_user_rank_visible: false,
    },
    isoCurrentDate: "2021-10-01T23:59:59Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが正しく表示されていることを確認
    const title = canvas.getByText("秋の運動キャンペーン");
    expect(title).toBeInTheDocument();

    // イベント期間外であることを確認
    const message = canvas.getByText("イベント期間外です");
    expect(message).toBeInTheDocument();
  },
};

export const イベント開始時間ちょうど: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-10-01T00:00:00Z",
      endAt: "2021-10-02T00:00:00Z",
      is_team_rank_visible: false,
      is_user_rank_visible: false,
    },
    isoCurrentDate: "2021-10-01T00:00:00Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが正しく表示されていることを確認
    const title = canvas.getByText("秋の運動キャンペーン");
    expect(title).toBeInTheDocument();

    // イベント期間外が表示されていないことを確認
    const message = canvas.queryByText("イベント期間外です");
    expect(message).not.toBeInTheDocument();
  },
};

export const イベント終了時間ちょうど: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-10-01T00:00:00Z",
      endAt: "2021-10-02T00:00:00Z",
      is_team_rank_visible: false,
      is_user_rank_visible: false,
    },
    isoCurrentDate: "2021-10-02T00:00:00Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが正しく表示されていることを確認
    const title = canvas.getByText("秋の運動キャンペーン");
    expect(title).toBeInTheDocument();

    // イベント期間外が表示されていないことを確認
    const message = canvas.queryByText("イベント期間外です");
    expect(message).not.toBeInTheDocument();
  },
};

export const イベント終了１秒後ちょうど: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-10-01T00:00:00Z",
      endAt: "2021-10-02T00:00:00Z",
      is_team_rank_visible: false,
      is_user_rank_visible: false,
    },
    isoCurrentDate: "2021-10-02T00:00:01Z",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが正しく表示されていることを確認
    const title = canvas.getByText("秋の運動キャンペーン");
    expect(title).toBeInTheDocument();

    // イベント期間外であることを確認
    const message = canvas.getByText("イベント期間外です");
    expect(message).toBeInTheDocument();
  },
};

export const チームランキング表示: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-10-01T00:00:00Z",
      endAt: "2021-10-02T00:00:00Z",
      is_team_rank_visible: true,
      is_user_rank_visible: false,
    },
    isoCurrentDate: new Date().toISOString(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ランキングボタンが表示されていることを確認
    const link = canvas.getByRole("link", { name: "ランキングページリンク" });
    expect(link).toHaveAttribute("href", "/reports/123");
  },
};

export const ユーザーランキング表示: Story = {
  args: {
    team: { name: "元気100倍" },
    userProfile: { name: "中川椋介", isAdmin: false },
    event: {
      id: 123,
      name: "秋の運動キャンペーン",
      startAt: "2021-10-01T00:00:00Z",
      endAt: "2021-10-02T00:00:00Z",
      is_team_rank_visible: false,
      is_user_rank_visible: true,
    },
    isoCurrentDate: new Date().toISOString(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ランキングボタンが表示されていることを確認
    const link = canvas.getByRole("link", { name: "ランキングページリンク" });
    expect(link).toHaveAttribute("href", "/reports/123");
  },
};
