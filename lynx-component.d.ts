// lynx-component.d.ts

// 扩展 React 的 JSX 命名空间，添加 Lynx 特有的组件和属性
declare namespace JSX {

    // 1. 声明 <cell> 组件为 JSX 固有元素
    interface IntrinsicElements {
        // 这里的类型使用 React 的基础类型来兼容
        'cell': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { style?: any };
    }

    // 2. 定义 <list> 组件的属性接口
    interface ListProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
        // 滚动方向属性
        'scroll-x'?: boolean;
        'scroll-y'?: boolean;
        // 滚动条属性
        'show-scrollbar'?: boolean;

        // 解决 'onScrollToBottom' 不存在的错误
        onScrollToBottom?: (event: any) => void;
        onScrollToBottomDistance?: number;

        // 列表所需的样式或布局属性
        style?: any;
    }

    // 3. 将 ListProps 应用到 <list> 标签
    interface IntrinsicElements {
        'list': ListProps;
    }
}