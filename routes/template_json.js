const axios = require('axios');
const config = require('../config');

module.exports = (options) => async (ctx) => {
    const headers = {
        'User-Agent': config.ua,
        Referer: options.baseUrl || '',
    };

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    const response = await axios({
        method: 'get',
        url: options.url,
        headers: headers,
    });

    let rawData = response.data;
    if (typeof rawData === 'string') {
        rawData = JSON.parse(rawData);
    }
    let items = [];

    if (Array.isArray(rawData)) {
        items = rawData.map((item) => ({
            title: item[options.title_key || 'TITLE'] || '',
            description: item[options.desc_key || 'SUB_TITLE'] || item[options.title_key || 'TITLE'] || '',
            link: item[options.link_key || 'URL'] || '',
            pubDate: new Date(item[options.time_key || 'DOCRELPUBTIME'] || new Date()).toUTCString(),
        }));
    }

    ctx.state.data = {
        title: options.feed_title,
        link: options.feed_url,
        image: options.feed_image,
        description: options.feed_desc,
        item: items,
    };
};
