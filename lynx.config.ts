import { defineConfig } from '@lynx-js/rspeedy'

import BannerPlugin from './plugins/banner-plugin.js'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

export default defineConfig({
  output: {
    filename: {
      image: '[name].gyy.[contenthash:8][ext]',
      // assets: '[name].gyy.[contenthash:8][ext]', 
    },
  },

  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
    pluginTypeCheck(),
  ],

  tools: {
    rspack: (config, { appendPlugins }) => {
      // 使用 appendPlugins 方法添加插件
      appendPlugins([
        new BannerPlugin({
          // 可选：在这里修改作者名字
          author: 'Yuyue Guo',
          feature: '添加开发注释'
        }),
      ]);
    },
  },
})
