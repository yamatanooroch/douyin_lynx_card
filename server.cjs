// server.js
const express = require('express');
const app = express();
const port = 3001;

// 菜品名称列表（用于生成真实的菜品数据）
const dishNames = [
    '招牌椒麻鸡', '麻辣小龙虾', '水煮牛肉', '口水鸡',
    '夫妻肺片', '宫保鸡丁', '麻婆豆腐', '回锅肉',
    '鱼香肉丝', '酸菜鱼', '红烧肉', '糖醋排骨',
    '干煸四季豆', '蒜泥白肉', '辣子鸡', '毛血旺',
    '剁椒鱼头', '东坡肘子', '水煮鱼', '香辣蟹',
    '烤鱼', '火锅底料', '串串香', '钵钵鸡',
    '冷锅串串', '藤椒鱼', '泡椒凤爪', '红油抄手',
    '担担面', '酸辣粉', '凉粉', '冰粉',
];

// 模拟列表数据
function generateMockData(page, pageSize) {
    const data = [];
    const startId = (page - 1) * pageSize + 1;

    for (let i = 0; i < pageSize; i++) {
        const globalIndex = startId + i - 1;
        const dishName = dishNames[globalIndex % dishNames.length];
        data.push({
            id: startId + i,
            title: dishName,
            content: `精选食材，地道川味`,
            price: 45 + Math.floor(Math.random() * 60),  // 随机价格 45-104
            origin: 68 + Math.floor(Math.random() * 80), // 原价 68-147
        });
    }
    return data;
}

// 允许跨域请求
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    next();
});

// 列表数据接口：支持分页
app.get('/api/list/data', (req, res) => {
    // 从查询参数中获取页码和每页大小
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // 模拟总共 10 页数据（共 100 条），以实现滚动加载
    const totalPages = 10;

    if (page > totalPages) {
        // 如果请求页码超出，返回空数据表示加载完毕
        return res.json({
            data: [],
            page,
            isEnd: true,
        });
    }

    // 模拟网络延迟
    setTimeout(() => {
        const listData = generateMockData(page, pageSize);
        res.json({
            data: listData,
            page,
            isEnd: page === totalPages,
        });
    }, 500); // 模拟 500ms 延迟
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Mock Server is running at http://localhost:${port}`);
    console.log(`Test Endpoint: http://localhost:${port}/api/list/data?page=1`);
    console.log(`For mobile access, use: http://10.21.170.147:${port}/api/list/data?page=1`);
});