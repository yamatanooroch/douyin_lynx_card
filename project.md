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

## 五、交互功能增强（P2）

### 1. 倒计时动态更新 ⏱️

#### 功能描述
对于限时特惠类菜品，显示实时倒计时，每秒自动更新，格式为 `HH:MM:SS`。

#### 实现方式
创建自定义 Hook `useCountdown`，使用 `setInterval` 每秒更新剩余时间：

```tsx
function useCountdown(endTime: number | undefined) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    if (!endTime) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setTimeLeft('已结束');
        return;
      }
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();  // 立即执行一次
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);  // 组件卸载时清除定时器
  }, [endTime]);
  
  return timeLeft;
}
```

#### 使用方式
在 `DishCard` 组件中调用：

```tsx
function DishCard({ item, onTap }) {
  const timerText = useCountdown(item.type === 'timer' ? item.timerEndTime : undefined);
  
  return (
    // ...
    {item.type === 'timer' && (
      <view className="badge-timer">
        <text className="timer-txt">距结束 {timerText || item.timerText}</text>
      </view>
    )}
  );
}
```

#### 技术要点
| 要点 | 说明 |
|------|------|
| **条件触发** | 仅当 `item.type === 'timer'` 时启用倒计时 |
| **内存管理** | useEffect 返回清理函数，避免内存泄漏 |
| **时间计算** | 使用时间戳差值计算，转换为时分秒格式 |
| **降级显示** | 倒计时结束显示"已结束"，无数据时使用静态文本 |

---

### 2. 菜品点击交互 👆

#### 功能描述
点击菜品卡片弹出详情弹窗，展示菜品大图、名称、描述、价格和标签信息，支持"立即抢购"操作。

#### 实现方式

**弹窗组件 `DishDetailModal`**：

```tsx
function DishDetailModal({ dish, visible, onClose }) {
  if (!visible || !dish) return null;
  
  return (
    <view className="modal-overlay" bindtap={onClose}>
      <view className="modal-content" bindtap={(e) => e.stopPropagation?.()}>
        <view className="modal-header">
          <text className="modal-title">{dish.title}</text>
          <view className="modal-close" bindtap={onClose}>
            <text className="modal-close-text">×</text>
          </view>
        </view>
        <image src={dish.img} className="modal-image" mode="aspectFill" />
        <view className="modal-body">
          <text className="modal-desc">{dish.content}</text>
          <view className="modal-price-row">
            <text className="modal-price">¥{dish.price}</text>
            <text className="modal-origin">¥{dish.origin}</text>
          </view>
          {dish.tag && (
            <view className="modal-tag-row">
              <view className={`modal-tag modal-tag-${dish.tag}`}>
                <text className="modal-tag-text">
                  {dish.tag === 'hot' ? '热销' : dish.tag === 'new' ? '新品' : '特惠'}
                </text>
              </view>
            </view>
          )}
        </view>
        <view className="modal-footer">
          <view className="modal-buy-btn" bindtap={() => { 
            console.log(`已加入购物车: ${dish.title}`); 
            onClose(); 
          }}>
            <text className="modal-buy-text">立即抢购</text>
          </view>
        </view>
      </view>
    </view>
  );
}
```

**状态管理**：

```tsx
const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);
const [showModal, setShowModal] = useState(false);

const handleDishTap = useCallback((dish: DishItem) => {
  console.log('[DishList] Dish tapped:', dish.title);
  setSelectedDish(dish);
  setShowModal(true);
}, []);

const handleCloseModal = useCallback(() => {
  setShowModal(false);
  setSelectedDish(null);
}, []);
```

#### 技术要点
| 要点 | 说明 |
|------|------|
| **事件冒泡阻止** | 弹窗内容区域使用 `stopPropagation` 防止点击关闭 |
| **条件渲染** | 仅当 `visible && dish` 时渲染弹窗 |
| **useCallback** | 使用 useCallback 优化回调函数，避免不必要的重渲染 |
| **样式隔离** | 使用 `position: fixed` 和 `z-index: 1000` 确保弹窗在最上层 |

---

### 3. 刷新功能 🔄

#### 功能描述
提供手动刷新按钮，点击后重新加载第一页数据，刷新期间显示加载状态。

#### 实现方式

**图标资源**：
- 正常状态：`src/assets/huanyihuan.png`
- 加载状态：`src/assets/shouye.png`

```tsx
// 资源导入
import ASSET_LOADING from './assets/shouye.png';
import ASSET_REFRESH from './assets/huanyihuan.png';

// 刷新按钮渲染
<view 
  className={`refresh-btn ${refreshing ? 'refreshing' : ''}`} 
  bindtap={handleRefresh}
>
  <image 
    src={refreshing ? ASSET_LOADING : ASSET_REFRESH} 
    className="refresh-icon" 
    mode="aspectFit" 
  />
</view>
```

**刷新逻辑**：

```tsx
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = useCallback(async () => {
  console.log('[DishList] Pull to refresh triggered');
  if (refreshing) return;  // 防止重复触发
  
  setRefreshing(true);
  loadingRef.current = false;
  isEndRef.current = false;
  
  try {
    const response = await fetch(`${MOCK_API_URL}?page=1&pageSize=${pageSize}`);
    const result = await response.json();
    
    if (result.data && result.data.length > 0) {
      const newDishes = result.data.map((item, index) => mapMockData(item, index));
      setDataList(newDishes);  // 替换而非追加
      setCurrentPage(2);
      setIsEnd(false);
      isEndRef.current = false;
    }
  } catch (error) {
    console.error('[DishList] Refresh failed:', error);
    setDataList(FALLBACK_DISHES);
  } finally {
    setRefreshing(false);
  }
}, [refreshing]);
```

#### 技术要点
| 要点 | 说明 |
|------|------|
| **防抖处理** | 检查 `refreshing` 状态，防止重复触发 |
| **状态重置** | 刷新时重置分页状态和加载标志 |
| **数据替换** | 使用 `setDataList(newDishes)` 替换数据，而非追加 |
| **视觉反馈** | 刷新时切换图标和添加 `.refreshing` 样式 |

---

### 4. 搜索/筛选功能 🔍

#### 功能描述
提供搜索框和筛选标签，支持按菜品名称搜索，按标签（全部/特惠/热销/新品）筛选。

#### 实现方式

**搜索框**：

```tsx
// 搜索图标资源
import ASSET_SEARCH from './assets/sousuo.png';

// 搜索框渲染
<view className="search-bar">
  <view className="search-input-wrapper">
    <image src={ASSET_SEARCH} className="search-icon" mode="aspectFit" />
    <input 
      className="search-input"
      placeholder="搜索菜品..."
      bindinput={handleSearchChange}
    />
    {searchText && (
      <view className="search-clear" bindtap={() => setSearchText('')}>
        <text className="search-clear-text">×</text>
      </view>
    )}
  </view>
</view>
```

**筛选标签**：

```tsx
type FilterTag = 'all' | 'subsidy' | 'hot' | 'new';

const filterTags = [
  { key: 'all', label: '全部' },
  { key: 'subsidy', label: '特惠' },
  { key: 'hot', label: '热销' },
  { key: 'new', label: '新品' },
];

// 筛选标签渲染
<view className="filter-tags">
  {filterTags.map(tag => (
    <view 
      key={tag.key}
      className={`filter-tag ${activeFilter === tag.key ? 'filter-tag-active' : ''}`}
      bindtap={() => handleFilterChange(tag.key)}
    >
      <text className={`filter-tag-text ${activeFilter === tag.key ? 'filter-tag-text-active' : ''}`}>
        {tag.label}
      </text>
    </view>
  ))}
  <view className="filter-count">
    <text className="filter-count-text">{filteredList.length}个菜品</text>
  </view>
</view>
```

**筛选逻辑**：

```tsx
const [filteredList, setFilteredList] = useState<DishItem[]>([]);
const [searchText, setSearchText] = useState('');
const [activeFilter, setActiveFilter] = useState<FilterTag>('all');

// 应用搜索和筛选
const applyFilters = useCallback((list, search, filter) => {
  let result = list;
  
  // 搜索过滤
  if (search.trim()) {
    const keyword = search.trim().toLowerCase();
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.content.toLowerCase().includes(keyword)
    );
  }
  
  // 标签筛选
  if (filter !== 'all') {
    result = result.filter(item => item.tag === filter);
  }
  
  return result;
}, []);

// 响应式更新筛选结果
useEffect(() => {
  const filtered = applyFilters(dataList, searchText, activeFilter);
  setFilteredList(filtered);
}, [dataList, searchText, activeFilter, applyFilters]);
```

#### 技术要点
| 要点 | 说明 |
|------|------|
| **双重过滤** | 先搜索过滤，再标签过滤，支持组合使用 |
| **大小写不敏感** | 搜索时转换为小写进行匹配 |
| **响应式更新** | useEffect 监听依赖变化，自动更新筛选结果 |
| **无结果提示** | 筛选后无结果时显示"清除筛选"按钮 |
| **数量显示** | 实时显示筛选后的菜品数量 |

---

### 5. 菜品标签角标

#### 功能描述
在菜品卡片右上角显示分类标签（热销/新品/特惠），使用不同颜色区分。

#### 实现方式

```tsx
// 菜品数据中的标签字段
interface DishItem {
  // ...
  tag?: 'hot' | 'new' | 'subsidy';
}

// 标签渲染
{item.tag && (
  <view className={`dish-tag dish-tag-${item.tag}`}>
    <text className="dish-tag-text">
      {item.tag === 'hot' ? '热销' : item.tag === 'new' ? '新品' : '特惠'}
    </text>
  </view>
)}
```

**样式定义**：

```css
.dish-tag {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4rpx 12rpx;
    border-bottom-left-radius: 12rpx;
}

.dish-tag-hot { background-color: #FF3B30; }     /* 红色 - 热销 */
.dish-tag-new { background-color: #FF9500; }     /* 橙色 - 新品 */
.dish-tag-subsidy { background-color: #34C759; } /* 绿色 - 特惠 */

.dish-tag-text {
    font-size: 18rpx;
    color: white;
    font-weight: bold;
}
```

---

## 六、资源文件说明

### 图标资源
| 文件 | 用途 |
|------|------|
| `assets/sousuo.png` | 搜索框图标 |
| `assets/huanyihuan.png` | 刷新按钮正常状态图标 |
| `assets/shouye.png` | 刷新按钮加载状态图标 |

### 菜品图片
| 文件 | 用途 |
|------|------|
| `assets/菜品1.png` | 菜品展示图片 1 |
| `assets/菜品2.png` | 菜品展示图片 2 |
| `assets/菜品3.png` | 菜品展示图片 3 |
| `assets/菜品4.png` | 菜品展示图片 4 |

### 店铺资源
| 文件 | 用途 |
|------|------|
| `assets/Rectangle 5.8.png` | 店铺 Logo |
| `assets/Group 2090053571.png` | 心动标签 |
| `assets/Rectangle.png` | 上榜餐厅角标 |
| `assets/编组_副本.png` | 满星图标 |
| `assets/编组.png` | 半星图标 |
| `assets/0.png` | 空星图标 |
| `assets/Rectangle 4646.png` | 特惠补贴背景 |
| `assets/Rectangle 3.2.png` | 减价标签背景 |

---

## 七、效果图
![alt text](效果图11.23.jpg)