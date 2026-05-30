const template = require('../template_page');

const options = {
    feed_title: '工信部 投资',
    feed_desc: '工信部 投资',
    feed_image: 'https://www.miit.gov.cn/dbsource/3520794/4332284.jpg',
    feed_url: 'https://www.miit.gov.cn/zwgk/index.html',
    url: 'https://www.miit.gov.cn/zwgk/index.html',
    baseUrl: 'https://www.miit.gov.cn',
    list_slr: ['li', '.list-con'],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: true,
    desc_slr: 'a',
    time_slr: 'span',
    cn: false,
};

module.exports = template(options);
