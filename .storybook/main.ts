import { StorybookConfig } from "@storybook/experimental-nextjs-vite";

const config: StorybookConfig = {
  stories: [
    // "../stories/**/*.mdx",
    // "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
  ],
  // framework: {
  //   name: "@storybook/nextjs",
  //   options: {},
  // },
  viteFinal: async (config) => {
    // modify the Vite config here
    // 特定のモジュールをバンドル対象から除外
    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      exclude: ["@mapbox/node-pre-gyp"], // 除外するモジュールを指定
    };

    return config;
  },
  framework: "@storybook/experimental-nextjs-vite",
  staticDirs: ["../public"],
};
export default config;
