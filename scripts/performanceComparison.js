/**
 * 性能对比演示脚本
 * 用于模拟优化前后的性能数据对比
 */

// 模拟优化前的性能数据（使用 scroll-view）
const beforeOptimization = {
    startTime: 0,
    fmpTime: 1200,
    dataLoadTime: 350,
    lynxFmpTime: 0,  // scroll-view 不支持 FMP 标记
    firstRenderTime: 1000,
    listItemCount: 100,
};

// 模拟优化后的性能数据（使用 list 组件）
const afterOptimization = {
    startTime: 0,
    fmpTime: 420,
    dataLoadTime: 120,
    lynxFmpTime: 395,
    firstRenderTime: 200,
    listItemCount: 10,
};

function calculateImprovement(before, after) {
    if (before === 0) return 'N/A';
    const improvement = ((before - after) / before * 100).toFixed(1);
    return `${improvement}%`;
}

function comparePerformance() {
    console.log('\n' + '='.repeat(70));
    console.log('性能优化对比');
    console.log('='.repeat(70));

    const comparisons = [
        {
            name: '首次渲染时间',
            before: beforeOptimization.firstRenderTime,
            after: afterOptimization.firstRenderTime,
            unit: 'ms'
        },
        {
            name: '自定义 FMP',
            before: beforeOptimization.fmpTime,
            after: afterOptimization.fmpTime,
            unit: 'ms'
        },
        {
            name: 'Lynx 官方 FMP',
            before: beforeOptimization.lynxFmpTime,
            after: afterOptimization.lynxFmpTime,
            unit: 'ms'
        },
        {
            name: '数据加载时间',
            before: beforeOptimization.dataLoadTime,
            after: afterOptimization.dataLoadTime,
            unit: 'ms'
        },
        {
            name: '首屏项数',
            before: beforeOptimization.listItemCount,
            after: afterOptimization.listItemCount,
            unit: '项'
        }
    ];

    comparisons.forEach(comp => {
        const improvement = calculateImprovement(comp.before, comp.after);
        const beforeValue = comp.before || '未支持';
        const afterValue = comp.after || '未获取';

        console.log(`\n${comp.name}:`);
        console.log(`  优化前: ${beforeValue} ${comp.unit}`);
        console.log(`  优化后: ${afterValue} ${comp.unit}`);

        if (typeof comp.before === 'number' && typeof comp.after === 'number' && comp.before > 0) {
            const diff = comp.before - comp.after;
            const arrow = diff > 0 ? '' : diff < 0 ? '' : '';
            console.log(`  ${arrow} 提升: ${improvement}`);
        }
    });

    console.log('\n' + '='.repeat(70));
    console.log('优化总结:');
    console.log('  - 首次渲染速度提升 80%');
    console.log('  - FMP 时间降低 65%');
    console.log('  - 数据加载提升 66%');
    console.log('  - 首屏数据量减少 90%');
    console.log('  - 内存占用降低约 75%');
    console.log('='.repeat(70) + '\n');
}

// 执行性能对比
comparePerformance();

// 导出数据供其他模块使用
export { beforeOptimization, afterOptimization, comparePerformance };
