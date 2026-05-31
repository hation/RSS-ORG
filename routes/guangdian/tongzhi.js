const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

const baseUrl = 'https://www.nrta.gov.cn';

module.exports = async (ctx) => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://www.nrta.gov.cn/col/col113/index.html',
            headers: {
                'User-Agent': config.ua,
                Referer: baseUrl,
            },
            timeout: 15000,
        });

        // 提取 datastore 中的数据
        const dataStoreMatch = response.data.match(/<div id="14416">([\s\S]*?)<\/script><\/div>/);

        if (!dataStoreMatch) {
            ctx.state.data = {
                title: '国家广播电视总局 - 通知公告',
                link: 'https://www.nrta.gov.cn/col/col113/index.html',
                description: '无法获取数据',
                item: [],
            };
            return;
        }

        const dataStore = dataStoreMatch[1];

        // 提取所有 <record> 标签内容
        const records = [];
        const recordRegex = /<record><!\[CDATA\[([\s\S]*?)\]\]><\/record>/g;
        let match;

        while ((match = recordRegex.exec(dataStore)) !== null) {
            records.push(match[1]);
        }

        // 解析每个记录的内容
        const items = [];
        for (const record of records) {
            try {
                const $ = cheerio.load(record);
                const a = $('a');
                const href = a.attr('href');
                const title = a.attr('title');
                const date = $('span')
                    .text()
                    .trim();

                if (href && title && date) {
                    items.push({
                        title: title,
                        description: title,
                        link: href.startsWith('http') ? href : baseUrl + href,
                        pubDate: new Date(date).toUTCString(),
                    });
                }
            } catch (error) {
                console.error('Error parsing record:', error);
            }
        }

        ctx.state.data = {
            title: '国家广播电视总局 - 通知公告',
            link: 'https://www.nrta.gov.cn/col/col113/index.html',
            description: '国家广播电视总局通知公告',
            item: items,
        };
    } catch (error) {
        console.error('Error fetching data from NRTA:', error.message);
        ctx.state.data = {
            title: '国家广播电视总局 - 通知公告',
            link: 'https://www.nrta.gov.cn/col/col113/index.html',
            description: '无法访问数据源，请检查网络连接',
            item: [],
        };
        ctx.status = 200;
    }
};
