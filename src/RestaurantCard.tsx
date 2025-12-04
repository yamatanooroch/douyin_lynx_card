import React, { useState, useEffect, useRef, useCallback } from 'react';
import './RestaurantCard.css';

// 性能监控
const performanceMetrics = {
  startTime: Date.now(),
  fmpTime: 0,
  dataLoadTime: 0,
};

// --- 资源引入 ---
import ASSET_LOGO from './assets/Rectangle 5.8.png';
import ASSET_HEARTBEAT_TAG from './assets/Group 2090053571.png';
import ASSET_HEARTBEAT_BADGE from './assets/Rectangle.png';
import ASSET_STAR_1 from './assets/编组_副本.png';
import ASSET_STAR_2 from './assets/编组.png';
import ASSET_STAR_3 from './assets/0.png';
import ASSET_SUBSIDY_BG from './assets/Rectangle 4646.png';
import ASSET_MINUS_BG from './assets/Rectangle 3.2.png';
import ASSET_DISH_1 from './assets/菜品1.png';
import ASSET_DISH_2 from './assets/菜品2.png';
import ASSET_DISH_3 from './assets/菜品3.png';
import ASSET_DISH_4 from './assets/菜品4.png';
import ASSET_SEARCH from './assets/sousuo.png';
import ASSET_LOADING from './assets/shouye.png';
import ASSET_REFRESH from './assets/huanyihuan.png';

// API URL
const MOCK_API_URL = 'http://10.21.170.147:3001/api/list/data';

// 筛选标签类型
type FilterTag = 'all' | 'subsidy' | 'hot' | 'new';

// --- 类型定义 ---
interface DishItem {
  id: number;
  title: string;
  content: string;
  img: string;
  price: number;
  origin: number;
  type: 'subsidy' | 'timer';
  subsidyText: string;
  minusText: string;
  timerText?: string;
  tag?: 'hot' | 'new' | 'subsidy';
  timerEndTime?: number;
}

interface RestaurantCardProps {
  shopName?: string;
}

// 本地后备数据
const FALLBACK_DISHES: DishItem[] = [
  {
    id: 1,
    title: '招牌椒麻鸡',
    content: '精选农家土鸡',
    img: ASSET_DISH_1,
    price: 68,
    origin: 88,
    type: 'subsidy',
    subsidyText: '特惠补贴',
    minusText: '减10',
    tag: 'hot',
    timerEndTime: Date.now() + 3600000,
  },
  {
    id: 2,
    title: '麻辣小龙虾',
    content: '鲜活小龙虾现做',
    img: ASSET_DISH_2,
    price: 99,
    origin: 128,
    type: 'timer',
    subsidyText: '特惠补贴',
    minusText: '减15',
    timerText: '02:30:00',
    tag: 'new',
    timerEndTime: Date.now() + 9000000,
  },
  {
    id: 3,
    title: '水煮牛肉',
    content: '精选黄牛肉',
    img: ASSET_DISH_3,
    price: 58,
    origin: 78,
    type: 'subsidy',
    subsidyText: '特惠补贴',
    minusText: '减8',
    tag: 'subsidy',
    timerEndTime: Date.now() + 5400000,
  },
  {
    id: 4,
    title: '口水鸡',
    content: '秘制红油口水鸡',
    img: ASSET_DISH_4,
    price: 45,
    origin: 58,
    type: 'timer',
    subsidyText: '特惠补贴',
    minusText: '减5',
    timerText: '01:15:30',
    tag: 'hot',
    timerEndTime: Date.now() + 4500000,
  },
];

// ========================================
// 倒计时 Hook
// ========================================
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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}

// ========================================
// 菜品详情弹窗组件
// ========================================
function DishDetailModal({
  dish,
  visible,
  onClose
}: {
  dish: DishItem | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible || !dish) return null;

  return (
    <view className="modal-overlay" bindtap={onClose}>
      <view className="modal-content" bindtap={(e: any) => e.stopPropagation?.()}>
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
          <view className="modal-buy-btn" bindtap={() => { console.log(`已加入购物车: ${dish.title}`); onClose(); }}>
            <text className="modal-buy-text">立即抢购</text>
          </view>
        </view>
      </view>
    </view>
  );
}

// ========================================
// 单个菜品卡片组件（支持倒计时）
// ========================================
function DishCard({
  item,
  onTap
}: {
  item: DishItem;
  onTap: (item: DishItem) => void;
}) {
  const timerText = useCountdown(item.type === 'timer' ? item.timerEndTime : undefined);

  return (
    <view className="dish-card" bindtap={() => onTap(item)}>
      <view className="img-box">
        <image src={item.img} className="dish-img" mode="aspectFill" />

        {/* 标签角标 */}
        {item.tag && (
          <view className={`dish-tag dish-tag-${item.tag}`}>
            <text className="dish-tag-text">
              {item.tag === 'hot' ? '热销' : item.tag === 'new' ? '新品' : '特惠'}
            </text>
          </view>
        )}

        {/* 浮层标签 */}
        <view className="overlay-position">
          {item.type === 'subsidy' && (
            <view className="badge-group">
              <view className="badge-layer subsidy-layer">
                <image src={ASSET_SUBSIDY_BG} className="bg-subsidy" />
                <text className="txt-subsidy">{item.subsidyText}</text>
              </view>
              <view className="badge-layer minus-layer">
                <image src={ASSET_MINUS_BG} className="bg-minus" />
                <text className="txt-minus">{item.minusText}</text>
              </view>
            </view>
          )}

          {item.type === 'timer' && (
            <view className="badge-timer">
              <text className="timer-txt">距结束 {timerText || item.timerText}</text>
            </view>
          )}
        </view>
      </view>

      <text className="dish-title">{item.title}</text>

      <view className="dish-footer">
        <view className="price-wrap">
          <text className="symbol">¥</text>
          <text className="price-now">{item.price}</text>
          <text className="price-old">¥{item.origin}</text>
        </view>
        <view className="btn-buy">
          <text className="btn-text">抢购</text>
        </view>
      </view>
    </view>
  );
}

// ========================================
// 菜品列表组件
// ========================================
function DishList() {
  const [dataList, setDataList] = useState<DishItem[]>([]);
  const [filteredList, setFilteredList] = useState<DishItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all');
  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 10;
  const loadingRef = useRef(false);
  const isEndRef = useRef(false);

  // 点击菜品卡片处理
  const handleDishTap = useCallback((dish: DishItem) => {
    console.log('[DishList] Dish tapped:', dish.title);
    setSelectedDish(dish);
    setShowModal(true);
  }, []);

  // 关闭弹窗
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedDish(null);
  }, []);

  // 筛选标签列表
  const filterTags: { key: FilterTag; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'subsidy', label: '特惠' },
    { key: 'hot', label: '热销' },
    { key: 'new', label: '新品' },
  ];

  // 映射 Mock 数据
  const mapMockData = (mockItem: any, currentListLength: number): DishItem => {
    const tags: ('hot' | 'new' | 'subsidy')[] = ['hot', 'new', 'subsidy'];
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    const timerEndTime = Date.now() + Math.floor(Math.random() * 4 * 3600000) + 3600000;

    return {
      id: mockItem.id,
      title: mockItem.title,
      content: mockItem.content,
      img: [ASSET_DISH_1, ASSET_DISH_2, ASSET_DISH_3, ASSET_DISH_4][currentListLength % 4],
      price: mockItem.price || 75,
      origin: mockItem.origin || 99,
      type: currentListLength % 2 === 0 ? 'subsidy' : 'timer',
      subsidyText: '特惠补贴',
      minusText: '减' + (5 + Math.floor(Math.random() * 15)),
      timerText: '12:30:00',
      tag: randomTag,
      timerEndTime: timerEndTime,
    };
  };

  // 应用搜索和筛选
  const applyFilters = useCallback((list: DishItem[], search: string, filter: FilterTag) => {
    let result = list;

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
      );
    }

    if (filter !== 'all') {
      result = result.filter(item => item.tag === filter);
    }

    return result;
  }, []);

  // 当数据列表、搜索词或筛选标签变化时更新过滤后的列表
  useEffect(() => {
    const filtered = applyFilters(dataList, searchText, activeFilter);
    setFilteredList(filtered);
  }, [dataList, searchText, activeFilter, applyFilters]);

  // 处理搜索输入变化
  const handleSearchChange = useCallback((e: any) => {
    const value = e.detail?.value || e.target?.value || '';
    setSearchText(value);
  }, []);

  // 处理筛选标签点击
  const handleFilterChange = useCallback((tag: FilterTag) => {
    setActiveFilter(tag);
  }, []);

  // 下拉刷新处理
  const handleRefresh = useCallback(async () => {
    console.log('[DishList] Pull to refresh triggered');
    if (refreshing) return;

    setRefreshing(true);
    loadingRef.current = false;
    isEndRef.current = false;

    try {
      const response = await fetch(`${MOCK_API_URL}?page=1&pageSize=${pageSize}`);
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        const newDishes = result.data.map((item: any, index: number) =>
          mapMockData(item, index)
        );
        setDataList(newDishes);
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

  // 加载数据
  const loadData = async (page: number) => {
    console.log('[DishList] loadData called with page:', page);

    if (loadingRef.current || isEndRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(`${MOCK_API_URL}?page=${page}&pageSize=${pageSize}`);
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        setDataList(prevList => {
          const newDishes = result.data.map((item: any, index: number) =>
            mapMockData(item, prevList.length + index)
          );
          return [...prevList, ...newDishes];
        });
        setCurrentPage(page + 1);
      }

      const ended = result.isEnd || (result.data && result.data.length < pageSize);
      isEndRef.current = ended;
      setIsEnd(ended);

    } catch (error) {
      console.error('[DishList] Fetch data failed:', error);
      setDataList(FALLBACK_DISHES);
      isEndRef.current = true;
      setIsEnd(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // 组件初始化时加载第一页数据
  useEffect(() => {
    loadData(1);
  }, []);

  // 记录 FMP
  useEffect(() => {
    if (dataList.length > 0 && performanceMetrics.fmpTime === 0) {
      performanceMetrics.fmpTime = Date.now() - performanceMetrics.startTime;
      console.log('[Performance] FMP:', performanceMetrics.fmpTime, 'ms');
    }
  }, [dataList.length]);

  // 首次加载状态
  if (dataList.length === 0 && loading) {
    return (
      <view className="dish-list-container">
        <view style={{ padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
          <text>正在加载菜品数据...</text>
        </view>
      </view>
    );
  }

  // 加载完成但无数据
  if (dataList.length === 0 && isEnd) {
    return (
      <view className="dish-list-container">
        <view style={{ padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
          <text>暂无菜品数据</text>
        </view>
      </view>
    );
  }

  return (
    <view className="dish-list-container">
      {/* 搜索栏 */}
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
        <view
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          bindtap={handleRefresh}
        >
          <image src={refreshing ? ASSET_LOADING : ASSET_REFRESH} className="refresh-icon" mode="aspectFit" />
        </view>
      </view>

      {/* 筛选标签 */}
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

      {/* 刷新提示 */}
      {refreshing && (
        <view className="refresh-indicator">
          <text className="refresh-indicator-text">正在刷新...</text>
        </view>
      )}

      {/* 筛选后无结果 */}
      {filteredList.length === 0 && dataList.length > 0 && (
        <view className="no-result">
          <text className="no-result-text">没有找到匹配的菜品</text>
          <view className="reset-filter-btn" bindtap={() => { setSearchText(''); setActiveFilter('all'); }}>
            <text className="reset-filter-text">清除筛选</text>
          </view>
        </view>
      )}

      {/* 菜品列表 */}
      {filteredList.length > 0 && (
        <list
          className="scroll-dishes"
          scroll-orientation="horizontal"
          list-type="single"
          span-count={1}
          scroll-bar-enable={false}
          lower-threshold-item-count={3}
          bindscrolltolower={() => {
            if (!loading && !isEnd) {
              loadData(currentPage);
            }
          }}
          style={{
            width: '100%',
            height: '180px',
            listMainAxisGap: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
          }}
          __lynx_timing_flag="__lynx_timing_actual_fmp"
        >
          {filteredList.map((item) => (
            <list-item
              item-key={`dish-item-${item.id}`}
              key={`dish-item-${item.id}`}
              estimated-main-axis-size-px={130}
            >
              <DishCard item={item} onTap={handleDishTap} />
            </list-item>
          ))}
          {loading && (
            <list-item item-key="loading" key="loading">
              <view style={{ width: '80px', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <text style={{ color: '#999', fontSize: '12px' }}>加载中...</text>
              </view>
            </list-item>
          )}
          {isEnd && filteredList.length > 0 && (
            <list-item item-key="end" key="end">
              <view style={{ width: '80px', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <text style={{ color: '#999', fontSize: '12px' }}>到底啦</text>
              </view>
            </list-item>
          )}
        </list>
      )}

      {/* 菜品详情弹窗 */}
      <DishDetailModal
        dish={selectedDish}
        visible={showModal}
        onClose={handleCloseModal}
      />
    </view>
  );
}

// ========================================
// 主组件：RestaurantCard
// ========================================
export function RestaurantCard({
  shopName = '椒鸣椒麻馆(五道口店)'
}: RestaurantCardProps) {
  return (
    <view className="card-container">
      {/* 顶部店铺区域 */}
      <view className="shop-section">
        <view className="logo-wrapper">
          <image src={ASSET_LOGO} className="shop-logo" mode="aspectFill" />
          <view className="badge-top-left-container">
            <image src={ASSET_HEARTBEAT_TAG} className="badge-top-left" mode="aspectFit" />
          </view>
        </view>

        <view className="info-column">
          <text className="shop-name">{shopName}</text>

          <view className="row-rating">
            <view className="stars-flex">
              {[1, 2, 3, 4, 5].map((_, i) => {
                let starSrc;
                if (i < 3) {
                  starSrc = ASSET_STAR_1;
                } else if (i === 3) {
                  starSrc = ASSET_STAR_2;
                } else {
                  starSrc = ASSET_STAR_3;
                }
                return (
                  <image
                    key={i}
                    src={starSrc}
                    className="icon-star"
                    mode="aspectFit"
                  />
                );
              })}
            </view>
            <text className="text-score">3.5 可以一试</text>
            <text className="text-reviews">170条评价</text>
          </view>

          <view className="row-meta">
            <view className="meta-left">
              <text className="text-meta">中餐</text>
              <text className="text-meta margin-h">龙柏地区</text>
              <text className="text-meta">人均¥220</text>
            </view>
            <text className="text-distance">842m</text>
          </view>

          <view className="row-tags">
            <view className="tag-pink">
              <image src={ASSET_HEARTBEAT_BADGE} className="icon-rank-bg" mode="aspectFit" />
              <text className="text-pink-tag">2025年上榜餐厅</text>
            </view>
            <text className="tag-gray">多人聚餐</text>
            <text className="tag-gray">生日轰趴</text>
            <text className="tag-gray">可订桌</text>
          </view>
        </view>
      </view>

      {/* 底部菜品横向滚动区域 */}
      <DishList />
    </view>
  );
}
