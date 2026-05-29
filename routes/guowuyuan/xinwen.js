const template = require('../template_json');

const options = {
    feed_title: '国务院-新闻',
    feed_desc: '国务院-新闻',
    feed_image: 'http://www.gov.cn/images/newlogo19ysp_rt.png',
    feed_url: 'https://www.gov.cn/yaowen/liebiao/',
    url: 'https://www.gov.cn/yaowen/liebiao/YAOWENLIEBIAO.json',
    baseUrl: 'https://www.gov.cn/',
    title_key: 'TITLE',
    link_key: 'URL',
    time_key: 'DOCRELPUBTIME',
    desc_key: 'SUB_TITLE',
};

module.exports = template(options);
