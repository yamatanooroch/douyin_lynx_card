import React, { useState, useEffect, useCallback } from 'react';
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

// 🚨 使用您的真实 IP 地址
const MOCK_API_URL = 'http://10.22.55.182:3000/api/list/data';

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

// =======================================================
// ** 新增组件：DishList - 负责数据获取和无限滚动 **
// =======================================================
function DishList() {
  // 使用 useState 替代硬编码的 dishes 数组
  const [dataList, setDataList] = useState<DishItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const pageSize = 10;

  // 模拟数据映射：将 Mock Server返回的简单数据映射为渲染所需的数据结构
  const mapMockData = (mockItem: any, index: number): DishItem => ({
    id: mockItem.id,
    title: mockItem.title,
    content: mockItem.content,
    // 由于 Mock Server不返回图片URL，我们继续使用本地导入的资源作为占位符
    img: [ASSET_DISH_1, ASSET_DISH_2, ASSET_DISH_3, ASSET_DISH_4][index % 4],
    price: 75,
    origin: 99,
    type: index % 2 === 0 ? 'subsidy' : 'timer',
    subsidyText: '特惠补贴',
    minusText: '减10',
    timerText: '12:88:88'
  });


  const loadData = useCallback(async (page: number) => {
    if (loading || isEnd) {
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${MOCK_API_URL}?page=${page}&pageSize=${pageSize}`);
      const result = await response.json();

      // 检查 Mock Server 返回的数据
      if (result.data && result.data.length > 0) {
        const newDishes = result.data.map(mapMockData);
        setDataList(prevList => [...prevList, ...newDishes]);
        setCurrentPage(page + 1);
      }

      // 更新是否结束状态
      setIsEnd(result.isEnd || (result.data && result.data.length < pageSize));

    } catch (error) {
      console.error('Fetch data failed:', error);
      // 生产环境中应有错误处理和重试机制
    } finally {
      setLoading(false);
    }
  }, [loading, isEnd]);

  // 组件初始化时加载第一页数据
  useEffect(() => {
    loadData(1);
  }, [loadData]); // 依赖 loadData

  // 滚动到底部时的事件处理函数
  const handleScrollToBottom = () => {
    if (!loading && !isEnd) {
      loadData(currentPage);
    }
  };

  // 渲染列表项
  const renderDishCard = (item: DishItem, index: number) => (
    // 使用 <cell> 包裹每个列表项，这是 <list> 组件的要求
    <cell key={item.id} style={{ width: '240px', marginRight: '16px' }}>
      <view className="dish-card">
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
    </cell>
  );

  const renderLoadMoreFooter = () => {
    // 渲染加载更多状态或结束提示
    return (
      <cell key="footer-cell">
        <view style={{ padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
          {loading && <text style={{ color: '#999' }}>正在加载...</text>}
          {isEnd && dataList.length > 0 && <text style={{ color: '#999' }}>—— 已经到底啦 ——</text>}
          {!loading && dataList.length === 0 && <text style={{ color: '#999' }}>暂无菜品数据</text>}
        </view>
      </cell>
    );
  };

  if (dataList.length === 0 && loading) {
    return <view style={{ padding: '20px' }}><text>初次加载中...</text></view>
  }


  // 🚨 注意：实现横向无限滚动，<list> 组件必须配置 scroll-x={true}
  // 并且 list-item 必须是 cell 组件。
  return (
    <list
      className="scroll-dishes" // 样式可以沿用，但请确保 CSS 中设置了 flex 布局和高度
      scroll-x={true}
      show-scrollbar={false}
      onScrollToBottom={handleScrollToBottom}
      // 距离底部 100px 时触发加载
      onScrollToBottomDistance={100}
    >
      {dataList.map(renderDishCard)}
      {/* 加载更多的 cell 作为列表的最后一个元素 */}
      {renderLoadMoreFooter()}
    </list>
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