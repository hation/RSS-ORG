const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

const baseUrl = 'https://www.chinafilm.gov.cn';
const listUrl = 'https://www.chinafilm.gov.cn/xxgk/gsxx/dybalx/';

module.exports = async (ctx) => {
    try {
        const response = await axios({
            method: 'get',
            url: listUrl,
            headers: {
                'User-Agent': config.ua,
                Referer: baseUrl,
            },
            timeout: 15000,
        });

        const $ = cheerio.load(response.data);
        const items = [];

        // 查找所有电影备案通知链接
        const noticeLinks = $('a[href*="/20"]').filter(function() {
            const href = $(this).attr('href');
            return href && href.includes('.html'); // 筛选包含通知详情页面链接
        });

        noticeLinks.each(function() {
            try {
                const title = $(this)
                    .text()
                    .trim();
                const href = $(this).attr('href');
                const dateText = $(this)
                    .next()
                    .text()
                    .trim();

                if (title && href) {
                    const fullUrl = href.startsWith('http') ? href : baseUrl + href.replace('./', '/');
                    items.push({
                        title: title,
                        description: title,
                        link: fullUrl,
                        pubDate: new Date(dateText).toUTCString(),
                    });
                }
            } catch (error) {
                console.error('Error parsing item:', error);
            }
        });

        ctx.state.data = {
            title: '国家电影局 - 电影剧本备案公示',
            link: listUrl,
            description: '国家电影局最新电影剧本备案公示信息',
            item: items.slice(0, 20), // 只取前20条信息
        };
    } catch (error) {
        console.error('Error fetching data from China Film Bureau:', error.message);
        ctx.state.data = {
            title: '国家电影局 - 电影剧本备案公示',
            link: listUrl,
            description: '无法访问数据源，请检查网络连接',
            item: [],
        };
        ctx.status = 200; // 返回 200 状态码，避免 500 错误
    }
};
