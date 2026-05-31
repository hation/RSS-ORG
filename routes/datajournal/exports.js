const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

const baseUrl = 'http://www.mof.gov.cn';
const url1 = 'https://en.wikipedia.org/wiki/List_of_countries_by_exports?oldformat=true';
const url2 = 'https://en.wikipedia.org/wiki/List_of_countries_by_imports?oldformat=true';

module.exports = async (ctx) => {
    // 尝试从缓存获取数据
    const cacheKey = 'chart-exports-data';
    const cachedData = ctx.cache.get(cacheKey);

    if (cachedData) {
        ctx.state.data = cachedData;
        return;
    }

    try {
        // 并行请求两个页面，减少响应时间
        const [response1, response2] = await Promise.all([
            axios({
                method: 'get',
                url: url1,
                headers: {
                    'User-Agent': config.ua,
                    Referer: baseUrl,
                },
                timeout: 15000, // 减少超时时间
            }),
            axios({
                method: 'get',
                url: url2,
                headers: {
                    'User-Agent': config.ua,
                    Referer: baseUrl,
                },
                timeout: 15000, // 减少超时时间
            }),
        ]);

        const $1 = cheerio.load(response1.data);
        const $2 = cheerio.load(response2.data);

        const list1 = $1('tr', '.wikitable tbody');
        const list2 = $2('tr', '.wikitable tbody');

        const imps = {};
        for (let i = 0; i < list2.length; i++) {
            if (i === 0) {
                continue;
            }
            const name = $2(list2[i])
                .find('td:nth-of-type(2) a')
                .eq(0)
                .text();

            const amount = $2(list2[i])
                .find('td:nth-of-type(3)')
                .eq(0)
                .text()
                .replace(/\$|,/g, '');

            imps[name] = parseInt(amount) / 1000000;
        }

        const chapter_item = [];
        // 处理所有国家的数据
        for (let i = 1; i < list1.length; i++) {
            let name = $1(list1[i])
                .find('td:nth-of-type(2) a')
                .eq(0)
                .text();

            const exp_amount = $1(list1[i])
                .find('td:nth-of-type(3)')
                .eq(0)
                .text()
                .replace(/\$|,/g, '');

            const percent = $1(list1[i])
                .find('td:nth-of-type(5)')
                .eq(0)
                .text()
                .replace('\n', '');

            const gdp = percent ? (parseInt(exp_amount) * 100) / parseInt(percent) : exp_amount;
            name = name.replace('Korea, South', 'South Korea');
            const imp_amount = imps[name] || 0;

            // 移除大数据数组的创建，直接存储数值用于计算
            const item = {
                name: name,
                exp_amount: exp_amount,
                imp_amount: imp_amount,
                percent: percent,
                exp_count: Math.floor(parseInt(exp_amount) / 10000), // 直接存储计算结果
                imp_count: Math.floor(parseInt(imp_amount) / 10000), // 直接存储计算结果
                gdp_count: Math.floor(parseInt(gdp) / 10000), // 直接存储计算结果
            };
            chapter_item.push(item);
        }

        const data = {
            title: 'list of countries by exports/imports (2017)',
            link: url1,
            description: 'list of countries by exports/imports (2017)',
            item: chapter_item,
        };

        ctx.state.data = data;

        // 将数据存入缓存，设置缓存时间为 1 小时
        ctx.cache.set(cacheKey, data, 60 * 60 * 1000);
    } catch (error) {
        console.error('Error fetching data from Wikipedia:', error.message);
        ctx.state.data = {
            title: 'list of countries by exports/imports (2017)',
            link: url1,
            description: '无法访问数据源，请检查网络连接',
            item: [],
        };
        ctx.status = 200; // 返回 200 状态码，避免 500 错误
    }
};
