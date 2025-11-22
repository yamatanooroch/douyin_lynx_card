// server.js
const express = require('express');
const app = express();
const port = 3000;

// 模拟列表数据
function generateMockData(page, pageSize) {
    const data = [];
    const startId = (page - 1) * pageSize + 1;

    for (let i = 0; i < pageSize; i++) {
        data.push({
            id: startId + i,
            title: `列表项 #${startId + i}`,
            content: `这是第 ${page} 页的第 ${i + 1} 个数据。`,
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

    // 模拟总共只有 5 页数据，以实现加载到末尾
    const totalPages = 5;

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

app.listen(port, () => {
    console.log(`Mock Server is running at http://localhost:${port}`);
    console.log(`Test Endpoint: http://localhost:${port}/api/list/data?page=1`);
});