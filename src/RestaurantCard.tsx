import { root } from "@lynx-js/react";
import './RestaurantCard.css';

// 资源引入
import ASSET_LOGO from './assets/Rectangle 5.8.png';
import ASSET_HEARTBEAT_TAG from './assets/Group 2090053571.png';
import ASSET_HEARTBEAT_BADGE from './assets/Rectangle.png';
import ASSET_STAR_1 from './assets/编组_副本.png';
import ASSET_STAR_2 from './assets/编组.png';
import ASSET_STAR_3 from './assets/0.png';
import ASSET_SUBSIDY_BG from './assets/Rectangle 4646.png'; // 特惠补贴背景
import ASSET_MINUS_BG from './assets/Rectangle 3.2.png';    // 减10背景
import ASSET_DISH_1 from './assets/菜品1.png';
import ASSET_DISH_2 from './assets/菜品2.png';
import ASSET_DISH_3 from './assets/菜品3.png';
import ASSET_DISH_4 from './assets/菜品4.png'; 


// 模拟数据
const dishes = [
  {
    id: 1,
    img: ASSET_DISH_1,
    name: '【神仙下午茶】葡萄柠檬茶(超大桶装)!',
    price: 75,
    origin: 99,
    type: 'subsidy', // 补贴类型
    subsidyText: '特惠补贴',
    minusText: '减10'
  },
  {
    id: 2,
    img: ASSET_DISH_2,
    name: '【断货王回归】冰镇杨梅瑞纳冰',
    price: 75,
    origin: 99,
    type: 'timer', // 倒计时类型
    timerText: '12:88:88'
  },
  {
    id: 3,
    img: ASSET_DISH_3,
    name: '【神仙下午茶】葡萄柠檬茶(超大桶装)',
    price: 75,
    origin: 99,
    type: 'subsidy',
    subsidyText: '特惠补贴',
    minusText: '减10'
  },
  {
    id: 4,
    img: ASSET_DISH_4,
    name: '超值儿时回忆巴达玩偶套餐',
    price: 75,
    origin: 99,
    type: 'subsidy',
    subsidyText: '特惠补贴',
    minusText: '减10'
  },
  // 更多数据用于滚动
  ...Array(96).fill(null).map((_, i) => ({
    id: 5 + i,
    img: ASSET_DISH_1,
    name: `美味加倍套餐系列 ${i + 1}`,
    price: 66,
    origin: 88,
    type: 'subsidy',
    subsidyText: '特惠补贴',
    minusText: '减5'
  }))
];

interface RestaurantCardProps {
  shopName?: string;
}

export function RestaurantCard({
  shopName = '椒鸣椒麻馆(五道口店)' // 设置默认值
}: RestaurantCardProps) {
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
          <text className="shop-name" >{shopName}</text>

          {/* 第二行：评分 */}
          <view className="row-rating">
            <view className="stars-flex">
              {[1, 2, 3, 4, 5].map((_, i) => {
                // 根据索引选择图片（i从0开始）
                let starSrc;
                if (i < 3) { // 前3个（索引0、1、2）
                  starSrc = ASSET_STAR_1;
                } else if (i === 3) { // 第4个（索引3）
                  starSrc = ASSET_STAR_2;
                } else { // 第5个（索引4）
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

          {/* 第三行：Meta信息 (与Logo底部对齐) */}
          <view className="row-meta">
            <view className="meta-left">
              <text className="text-meta">中餐</text>
              <text className="text-meta margin-h">龙柏地区</text>
              <text className="text-meta">人均¥220</text>
            </view>
            <text className="text-distance">842m</text>
          </view>

          {/* 第四行：标签 (位于Logo下方区域) */}
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

      {/* --- 底部菜品横向滚动区域 --- */}
      <scroll-view className="scroll-dishes" scroll-x={true} enable-flex={true} show-scrollbar={false}>
        <view className="dish-list-container">
          {dishes.map((item, index) => (
            <view key={index} className="dish-card">
              {/* 图片容器 */}
              <view className="img-box">
                <image src={item.img} className="dish-img" mode="aspectFill" />

                {/* 浮层标签逻辑 */}
                <view className="overlay-position">
                  {item.type === 'subsidy' && (
                    <view className="badge-group">
                      {/* 特惠补贴 (底层) */}
                      <view className="badge-layer subsidy-layer"  >
                        <image src={ASSET_SUBSIDY_BG} className="bg-subsidy" />
                        <text className="txt-subsidy">{item.subsidyText}</text>
                      </view>
                      {/* 减10 (叠加层) */}
                      <view className="badge-layer minus-layer"  >
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
              <text className="dish-title" >{item.name}</text>

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
          ))}
        </view>
      </scroll-view>
    </view>
  );
}