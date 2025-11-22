// lynx-component.d.ts

// 扩展 Lynx 的类型定义，添加自定义的组件和属性
import type { ListItemProps, ListScrollToLowerEvent, EventHandler } from '@lynx-js/types';

declare module '@lynx-js/types' {
  // 扩展 IntrinsicElements 以支持 cell 组件
  interface IntrinsicElements {
    // 使用 'cell' 作为 'list-item' 的别名
    'cell': ListItemProps;
  }

  // 扩展 ListProps 以支持 onScrollToBottom 等事件
  interface ListProps {
    // 添加 React 风格的事件处理属性 (映射到 bindscrolltolower)
    onScrollToBottom?: EventHandler<ListScrollToLowerEvent>;
    onScrollToBottomDistance?: number;
  }
}

export {};