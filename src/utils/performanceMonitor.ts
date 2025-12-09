/**
 * 性能监控工具
 * 用于收集和分析页面性能指标
 */

export interface PerformanceMetrics {
    startTime: number;
    fmpTime: number;
    dataLoadTime: number;
    lynxFmpTime: number;
    firstRenderTime: number;
    listItemCount: number;
}

export interface PerformanceReport {
    title: string;
    metrics: {
        name: string;
        value: number | string;
        unit?: string;
    }[];
    timestamp: number;
}

/**
 * 创建性能报告
 */
export function createPerformanceReport(metrics: PerformanceMetrics): PerformanceReport {
    return {
        title: '餐厅卡片性能监控报告',
        timestamp: Date.now(),
        metrics: [
            {
                name: '首次渲染时间',
                value: metrics.firstRenderTime || '未获取',
                unit: 'ms',
            },
            {
                name: '自定义 FMP 时间',
                value: metrics.fmpTime || '未完成',
                unit: 'ms',
            },
            {
                name: 'Lynx 官方 FMP 时间',
                value: metrics.lynxFmpTime || '未获取',
                unit: 'ms',
            },
            {
                name: '数据加载时间',
                value: metrics.dataLoadTime || '未完成',
                unit: 'ms',
            },
            {
                name: '首屏列表项数量',
                value: metrics.listItemCount,
                unit: '项',
            },
            {
                name: '总耗时',
                value: metrics.fmpTime || 0,
                unit: 'ms',
            },
        ],
    };
}

/**
 * 格式化性能报告为控制台输出
 */
export function formatPerformanceReport(report: PerformanceReport): string {
    const lines = [
        '='.repeat(50),
        `📊 ${report.title}`,
        `🕒 时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}`,
        '='.repeat(50),
    ];

    report.metrics.forEach((metric) => {
        const value = typeof metric.value === 'number'
            ? metric.value.toFixed(2)
            : metric.value;
        const unit = metric.unit || '';
        lines.push(`${metric.name.padEnd(20)}: ${value} ${unit}`);
    });

    lines.push('='.repeat(50));

    return lines.join('\n');
}

/**
 * 对比优化前后的性能数据
 */
export function comparePerformance(
    before: PerformanceMetrics,
    after: PerformanceMetrics
): string {
    const lines = [
        '='.repeat(60),
        '📈 性能优化对比报告',
        '='.repeat(60),
    ];

    const comparisons = [
        {
            name: '自定义 FMP 时间',
            before: before.fmpTime,
            after: after.fmpTime,
            unit: 'ms',
        },
        {
            name: 'Lynx 官方 FMP',
            before: before.lynxFmpTime,
            after: after.lynxFmpTime,
            unit: 'ms',
        },
        {
            name: '数据加载时间',
            before: before.dataLoadTime,
            after: after.dataLoadTime,
            unit: 'ms',
        },
        {
            name: '首屏项数',
            before: before.listItemCount,
            after: after.listItemCount,
            unit: '项',
        },
    ];

    comparisons.forEach((comp) => {
        const improvement = comp.before - comp.after;
        const percentage = comp.before > 0
            ? ((improvement / comp.before) * 100).toFixed(2)
            : '0.00';

        const arrow = improvement > 0 ? '📉' : improvement < 0 ? '📈' : '➡️';
        const sign = improvement > 0 ? '-' : improvement < 0 ? '+' : '';

        lines.push('');
        lines.push(`${comp.name}:`);
        lines.push(`  优化前: ${comp.before} ${comp.unit}`);
        lines.push(`  优化后: ${comp.after} ${comp.unit}`);
        lines.push(`  ${arrow} 变化: ${sign}${Math.abs(improvement)} ${comp.unit} (${sign}${percentage}%)`);
    });

    lines.push('');
    lines.push('='.repeat(60));

    return lines.join('\n');
}

/**
 * 获取 Lynx 性能条目
 */
export function getLynxPerformanceEntries(): any[] {
    try {
        if (typeof (window as any).__LYNX_NATIVE_API__ !== 'undefined') {
            const api = (window as any).__LYNX_NATIVE_API__;
            if (api.performance && api.performance.getEntries) {
                return api.performance.getEntries();
            }
        }
    } catch (error) {
        console.warn('获取 Lynx 性能条目失败:', error);
    }
    return [];
}

/**
 * 获取 FMP 条目
 */
export function getFmpEntry(): any | null {
    try {
        if (typeof (window as any).__LYNX_NATIVE_API__ !== 'undefined') {
            const api = (window as any).__LYNX_NATIVE_API__;
            if (api.performance && api.performance.getEntriesByType) {
                const entries = api.performance.getEntriesByType('metric_actual_fmp');
                return entries && entries.length > 0 ? entries[0] : null;
            }
        }
    } catch (error) {
        console.warn('获取 FMP 条目失败:', error);
    }
    return null;
}
