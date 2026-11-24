import path from "path";
import { defineConfig } from "vitest/config";

// 画面を使わない、関数だけのテスト用の設定（npm run test:unit）。
// vitest.config.ts は Storybook のテスト用で、ブラウザを起動する
export default defineConfig({
  resolve: { alias: { "@": path.resolve(".") } },
  test: {
    name: "unit",
    include: ["features/**/*.test.ts", "app/**/*.test.ts"],
  },
});
