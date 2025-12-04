# 项目功能描述说明书

## 一、基础功能实现

### 1. 餐厅列表
- App组件作为根容器，scroll-view实现纵向滚动列表，循环渲染RestaurantCard组件展示餐厅信息。
- App.tsx: 餐厅卡片数据源cardDataList，包含餐厅 ID 和名称等基础信息，通过 Props 传递给子组件。
- App.css: 全局容器样式，设置100vw和100vh的视口占比，使用#f5f5f5作为背景色，移除内边距确保列表从顶部开始排列。

### 2. 餐厅卡片组件
- 卡片布局：RestaurantCard组件采用上下分区设计，上半部分展示餐厅基本信息，下半部分展示菜品列表。
- 餐厅信息展示：
    - 左侧显示餐厅 Logo 及角标（如 "2025 年上榜餐厅" 标识）
    - 右侧分四行展示：餐厅名称（文字溢出省略）、评分星级、分类\区域\人均消费等元数据、特色标签
- 菜品滚动展示：
    - 使用 Lynx `<list>` 组件实现菜品列表水平滚动，支持100个团购商品
    - 菜品卡片: 图片、标签（补贴\倒计时等）、名称、价格（现价与原价对比）和 "抢购" 按钮
    - 标签类型：补贴+减价组合标签、倒计时标签等，绝对定位实现标签叠加

### 3. Mock 数据服务
- 使用 Node.js Express 搭建本地 Mock Server（server.cjs）
- 支持分页接口：`/api/list/data?page=1&pageSize=10`
- 服务器绑定 `0.0.0.0`，支持局域网内手机访问
- 返回真实菜品名称（招牌椒麻鸡、麻辣小龙虾等32种菜品循环）
- 共返回100条数据（10页 × 10条/页）

---

## 二、性能优化（P0）

### 问题背景
渲染100个团购商品会导致首次渲染耗时较长，但用户首屏只能看到有限的几个商品。

### 优化方案

#### 【高级】使用 `<list>` 组件实现滚动加载
将原有的 `<scroll-view>` 替换为 Lynx 的 `<list>` 组件，利用其内置的**元素回收**和**懒加载**机制：

```tsx
<list
  scroll-orientation="horizontal"    // 横向滚动
  list-type="single"                 // 单行布局
  span-count={1}
  lower-threshold-item-count={3}     // 距离底部3个元素时触发加载
  bindscrolltolower={() => {         // 滚动到底部加载更多
    if (!loading && !isEnd) {
      loadData(currentPage);
    }
  }}
  __lynx_timing_flag="__lynx_timing_actual_fmp"  // 性能监控标记
>
  {dataList.map((item, index) => (
    <list-item
      item-key={`dish-item-${item.id}`}
      key={`dish-item-${item.id}`}
      estimated-main-axis-size-px={130}  // 预估尺寸，优化布局计算
    >
      {renderDishCard(item, index)}
    </list-item>
  ))}
</list>
```

#### 优化原理
| 优化点 | 说明 |
|-------|------|
| **元素回收** | `<list>` 组件只渲染可视区域内的元素，滑出的元素会被回收复用 |
| **懒加载** | 首屏只加载可见的几个元素，后续通过滚动触发分页加载 |
| **预估尺寸** | 使用 `estimated-main-axis-size-px` 让列表提前计算布局 |
| **分页请求** | 每次只请求10条数据，减少首屏网络开销 |

#### 【可选】性能监控 API 集成
集成 Lynx 提供的 `MetricActualFmpEntry` 性能监控：

1. **添加性能指标记录对象**：
```tsx
const performanceMetrics = {
  startTime: Date.now(),
  fmpTime: 0,
  dataLoadTime: 0,
};
```

2. **标记关键元件**：
```tsx
<list __lynx_timing_flag="__lynx_timing_actual_fmp">
```

3. **记录 FMP 时间**：
```tsx
useEffect(() => {
  if (dataList.length > 0 && performanceMetrics.fmpTime === 0) {
    performanceMetrics.fmpTime = Date.now() - performanceMetrics.startTime;
    console.log('[Performance] FMP:', performanceMetrics.fmpTime, 'ms');
  }
}, [dataList.length]);
```

---

## 三、了解编译流程（P1）

### 目标
学习 rspeedy 的编译配置，将输出的图片名称重命名为 `[name].[你的名字].[contenthash:8][ext]` 格式。

### 实现方式
在 `lynx.config.ts` 中配置 `output.filename.image`：

```typescript
import { defineConfig } from '@lynx-js/rspeedy'

export default defineConfig({
  output: {
    filename: {
      image: '[name].gyy.[contenthash:8][ext]',  // gyy 为作者名字缩写
    },
  },
  // ... 其他配置
})
```

### 配置说明
- `[name]`：原始文件名
- `.gyy.`：自定义的作者标识
- `[contenthash:8]`：8位内容哈希，用于缓存控制
- `[ext]`：原始文件扩展名

### 产物示例
```
dist/static/
├── Rectangle 5.8.gyy.a1b2c3d4.png
├── 菜品1.gyy.e5f6g7h8.png
└── ...
```

---

## 四、工程化插件开发（P1）

### 目标
开发一个 Rspack 插件，在所有产物文件（JS、CSS、HTML、JSON）的头部添加自定义注释。

### 插件实现
文件位置：`plugins/banner-plugin.js`

```javascript
class BannerPlugin {
  constructor(options = {}) {
    this.author = options.author || 'xxx';
    this.feature = options.feature || '开发注释插入功能';
    this.banner = `/** \n* 作者：${this.author}\n* 完成功能：${this.feature}\n**/ \n`;
  }

  apply(compiler) {
    // 使用 'emit' 钩子：在资源写入输出目录之前触发
    compiler.hooks.emit.tap('BannerPlugin', (compilation) => {
      for (const pathname in compilation.assets) {
        // 只对 JS、CSS、HTML、JSON 文件生效
        if (/\.(js|css|html|json)$/i.test(pathname)) {
          const asset = compilation.assets[pathname];
          const source = asset.source();
          const newSource = this.banner + source;
          
          // 替换资源内容
          compilation.assets[pathname] = {
            source: () => newSource,
            size: () => newSource.length,
          };
        }
      }
    });
  }
}

module.exports = BannerPlugin;
```

### 插件配置
在 `lynx.config.ts` 中引入并配置插件：

```typescript
import BannerPlugin from './plugins/banner-plugin.js'

export default defineConfig({
  tools: {
    rspack: (config, { appendPlugins }) => {
      appendPlugins([
        new BannerPlugin({
          author: 'Yuyue Guo',
          feature: '添加开发注释'
        }),
      ]);
    },
  },
})
```

### 产物效果
编译后的 JS/CSS 文件头部会自动添加：
```javascript
/** 
* 作者：Yuyue Guo
* 完成功能：添加开发注释
**/ 
// 原始代码...
```

---

## 五、效果图
![alt text](效果图11.23.jpg)