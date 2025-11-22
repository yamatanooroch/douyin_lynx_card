import React, { useState, useEffect, useRef } from 'react';
// import { root, view, text, image, list, cell, scrollview } from '@lynx-js/react';
import './RestaurantCard.css'; // 样式文件保持不变

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

// 🚨 Mock API URL - 使用 localhost
const MOCK_API_URL = 'http://localhost:3001/api/list/data';

// --- 类型定义 ---
interface DishItem {
  id: number;
  title: string;
  content: string; // Mock数据中的content字段

  // 以下是静态资源占位符，需要与您的实际渲染逻辑保持一致
  img: string;
  price: number;
  origin: number;
  type: 'subsidy' | 'timer';
  subsidyText: string;
  minusText: string;
  timerText?: string;
}

interface RestaurantCardProps {
  shopName?: string;
}

function DishList() {
  // 使用 useState 替代硬编码的 dishes 数组
  const [dataList, setDataList] = useState<DishItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  // 移除 initialized 状态，改用 dataList.length === 0 && loading 来判断首次加载状态
  const pageSize = 10;

  // 使用 ref 来避免闭包问题
  const loadingRef = useRef(false);
  const isEndRef = useRef(false);

  // 模拟数据映射：将 Mock Server返回的简单数据映射为渲染所需的数据结构
  const mapMockData = (mockItem: any, currentListLength: number): DishItem => ({
    id: mockItem.id,
    title: mockItem.title,
    content: mockItem.content,
    // 由于 Mock Server不返回图片URL，我们继续使用本地导入的资源作为占位符
    img: [ASSET_DISH_1, ASSET_DISH_2, ASSET_DISH_3, ASSET_DISH_4][currentListLength % 4],
    price: 75,
    origin: 99,
    // 使用总索引来确定类型
    type: currentListLength % 2 === 0 ? 'subsidy' : 'timer',
    subsidyText: '特惠补贴',
    minusText: '减10',
    timerText: '12:88:88'
  });


  const loadData = async (page: number) => {
    console.log('[DishList] loadData called with page:', page);

    if (loadingRef.current || isEndRef.current) {
      console.log('[DishList] Skipping loadData - loading or isEnd is true');
      return;
    }

    loadingRef.current = true;
    setLoading(true); // 设置 loading 状态开始加载

    try {
      console.log('[DishList] Fetching from:', `${MOCK_API_URL}?page=${page}&pageSize=${pageSize}`);
      const response = await fetch(`${MOCK_API_URL}?page=${page}&pageSize=${pageSize}`);
      console.log('[DishList] Response status:', response.status);
      const result = await response.json();
      console.log('[DishList] Result:', result);

      // 检查 Mock Server 返回的数据
      if (result.data && result.data.length > 0) {
        // 使用函数式更新确保基于最新状态
        setDataList(prevList => {
          const newDishes = result.data.map((item: any, index: number) => 
            mapMockData(item, prevList.length + index)
          );
          console.log('[DishList] Mapped dishes:', newDishes);
          return [...prevList, ...newDishes];
        });
        setCurrentPage(page + 1);
      } else {
        console.log('[DishList] No data received or empty array');
      }

      // 更新是否结束状态
      const ended = result.isEnd || (result.data && result.data.length < pageSize);
      isEndRef.current = ended;
      setIsEnd(ended);

    } catch (error) {
      console.error('[DishList] Fetch data failed:', error);
      // 生产环境中应有错误处理和重试机制
      isEndRef.current = true;
      setIsEnd(true);
    } finally {
      loadingRef.current = false;
      setLoading(false); // 设置 loading 状态结束加载
      console.log('[DishList] Loading finished');
    }
  };

  // 组件初始化时加载第一页数据
  useEffect(() => {
    console.log('[DishList] useEffect triggered, loading initial data');
    loadData(1);
  }, []); // 只在组件挂载时执行一次

  // 滚动到底部时的事件处理函数 (未使用，但保留)
  const handleScrollToBottom = () => {
    if (!loading && !isEnd) {
      loadData(currentPage);
    }
  };

  // 正常渲染列表
  console.log('[DishList] Rendering dish list with', dataList.length, 'items');

  // 渲染列表项
  const renderDishCard = (item: DishItem, index: number) => (
    // 使用 view 代替您的自定义组件
    <view key={item.id} className="dish-card">
      {/* 图片容器 */}
      <view className="img-box">
        <image src={item.img} className="dish-img" mode="aspectFill" />

        {/* 浮层标签逻辑 (与原逻辑相同) */}
        <view className="overlay-position">
          {item.type === 'subsidy' && (
            <view className="badge-group">
              {/* 特惠补贴 */}
              <view className="badge-layer subsidy-layer">
                <image src={ASSET_SUBSIDY_BG} className="bg-subsidy" />
                <text className="txt-subsidy">{item.subsidyText}</text>
              </view>
              {/* 减10 */}
              <view className="badge-layer minus-layer">
                <image src={ASSET_MINUS_BG} className="bg-minus" />
                <text className="txt-minus">{item.minusText}</text>
              </view>
            </view>
          )}

          {item.type === 'timer' && (
            <view className="badge-timer">
              <text className="timer-txt">距结束 {item.timerText}</text>
            </view>
          )}
        </view>
      </view>

      {/* 菜品信息 */}
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

  const renderLoadMoreFooter = () => {
    // 渲染加载更多状态或结束提示
    return (
      <view key="footer-view" style={{ padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
        {/* 当 loading 时，无论是首次加载还是滚动加载，都显示 */}
        {loading && <text style={{ color: '#999' }}>正在加载...</text>}
        {/* 只有加载结束且有数据时，才显示“已到底” */}
        {isEnd && dataList.length > 0 && <text style={{ color: '#999' }}>—— 已经到底啦 ——</text>}
        {/* 只有加载结束且没有数据时，才显示“暂无数据” */}
        {!loading && isEnd && dataList.length === 0 && <text style={{ color: '#999' }}>暂无菜品数据</text>}
      </view>
    );
  };

  // 🚨 关键修改: 首次加载时，如果数据列表为空，显示加载状态
  if (dataList.length === 0 && loading) {
    console.log('[DishList] Data is empty and loading, showing initial loader');
    return <view style={{ padding: '20px', alignItems: 'center', justifyContent: 'center' }}><text>正在加载菜品数据...</text></view>;
  }

  // 🚨 关键修改: 加载完成后，如果数据列表仍然为空，显示暂无数据
  if (dataList.length === 0 && isEnd) {
    console.log('[DishList] No data after loading finished, showing empty message');
    return <view style={{ padding: '20px', alignItems: 'center', justifyContent: 'center' }}><text>暂无菜品数据</text></view>;
  }

  // 正常渲染列表
  console.log('[DishList] Rendering dish list with', dataList.length, 'items');


  // 使用 scroll-view 实现横向滚动
  return (
    <scroll-view
      className="scroll-dishes"
      scroll-x={true}
      enable-flex={true}
      show-scrollbar={false}
    // 添加 onScrollToLower={handleScrollToBottom} 如果您希望支持自动加载
    >
      <view className="dish-list-container">
        {dataList.map(renderDishCard)}
        {/* 加载更多状态 */}
        {renderLoadMoreFooter()}
      </view>
    </scroll-view>
  );
}


// =======================================================
// ** 主组件：RestaurantCard **
// =======================================================
export function RestaurantCard({
  shopName = '椒鸣椒麻馆(五道口店)'
}: RestaurantCardProps) {

  // 顶部店铺区域保持不变
  return (
    <view className="card-container">
      {/* --- 顶部店铺区域 --- */}
      <view className="shop-section">
        {/* 左侧：Logo与角标 */}
        <view className="logo-wrapper">
          <image src={ASSET_LOGO} className="shop-logo" mode="aspectFill" />
          <view className="badge-top-left-container">
            <image src={ASSET_HEARTBEAT_TAG} className="badge-top-left" mode="aspectFit" />
          </view>
        </view>

        {/* 右侧：信息列表 */}
        <view className="info-column">
          {/* 第一行：店名 */}
          <text className="shop-name">{shopName}</text>

          {/* 第二行：评分 */}
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

          {/* 第三行：Meta信息 */}
          <view className="row-meta">
            <view className="meta-left">
              <text className="text-meta">中餐</text>
              <text className="text-meta margin-h">龙柏地区</text>
              <text className="text-meta">人均¥220</text>
            </view>
            <text className="text-distance">842m</text>
          </view>

          {/* 第四行：标签 */}
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

      {/* --- 底部菜品横向滚动区域 (使用 DishList) --- */}
      <DishList />

    </view>
  );
}