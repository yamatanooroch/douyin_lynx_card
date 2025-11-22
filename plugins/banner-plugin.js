// plugins/banner-plugin.js

/**
 * Rspack 插件：在所有产物文件的头部添加自定义注释
 */
class BannerPlugin {
    constructor(options = {}) {
        this.author = options.author || 'xxx';
        this.feature = options.feature || '开发注释插⼊功能';

        this.banner = `/** \n* 作者：${this.author}\n* 完成功能：${this.feature}\n**/ \n`;
    }

    // 插件的 apply 方法，会在 Rspack 启动时被调用
    apply(compiler) {
        // 检查 compiler 对象上是否有 rspack 属性来确保兼容性
        const isRspack = compiler.options.isRspack;

        // 使用 'emit' 钩子：在资源被写入到输出目录之前触发
        compiler.hooks.emit.tap('BannerPlugin', (compilation) => {
            // 1. 遍历所有生成的资源 (assets)
            for (const pathname in compilation.assets) {
                // 排除图片等非文本文件，通常只对 JS, CSS, HTML 生效
                if (/\.(js|css|html|json)$/i.test(pathname)) {
                    // 2. 获取当前资源对象
                    const asset = compilation.assets[pathname];

                    // 3. Rspack 使用 Source 对象表示资源内容。我们需要获取其原始内容
                    const source = asset.source();

                    // 4. 在原始内容前加上 Banner
                    const newSource = this.banner + source;

                    // 5. 使用新的内容和原始大小重新创建 Source 对象 (需要引入 Rspack 或 Webpack 的 Source 类)
                    // 
                    // ⚠️ 注意：由于您在 rspeedy 环境下，我们使用一个兼容 Webpack/Rspack 的方法来替换资源。
                    // Webpack/Rspack 通常使用 `RawSource` 或 `ConcatSource`。
                    // 在不直接引入 rspack 模块的情况下，最简单且兼容的方法是替换 assets 对象中的资源。

                    // 替换资源的方法：
                    compilation.assets[pathname] = {
                        source: () => newSource,
                        size: () => newSource.length,
                    };
                }
            }
        });
    }
}

export default BannerPlugin;