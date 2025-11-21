import { useEffect } from '@lynx-js/react';
import { RestaurantCard } from './RestaurantCard';

import './App.css';

const cardDataList = [
  { id: 1, name: '椒鸣椒麻馆(五道口店)' },
  { id: 2, name: '云海肴(中关村店)' },
  { id: 3, name: '西贝莜面村(朝阳大悦城店)' },
  { id: 4, name: '海底捞(三里屯店)' },
];

export function App(props: { onRender?: () => void }) {
  useEffect(() => {
    props.onRender?.();
  }, []);

  return (
    <scroll-view
      className="app-container"
      scroll-y={true}
      style={{ height: '100%' }}
    >
      {cardDataList.map((card) => (
        <RestaurantCard key={card.id} shopName={card.name} />
      ))}
    </scroll-view>
  );
}