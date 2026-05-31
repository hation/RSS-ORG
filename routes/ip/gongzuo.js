const template = require('../template_page');

const options = {
    feed_title: '国家知识产权局 - 知识产权工作',
    feed_desc: '国家知识产权局 - 知识产权工作',
    feed_image: 'https://www.cnipa.gov.cn/images/index_13102156.png',
    feed_url: 'https://www.cnipa.gov.cn/col/col53/index.html',
    url: 'https://www.cnipa.gov.cn/module/web/jpage/dataproxy.jsp?page=1&webid=1&path=https://www.cnipa.gov.cn/&columnid=53&unitid=669&webname=%E5%9B%BD%E5%AE%B6%E7%9F%A5%E8%AF%86%E4%BA%A7%E6%9D%83%E5%B1%80',
    baseUrl: 'https://www.cnipa.gov.cn',
    data_slr: 'recordset.record',
    list_slr: ['li', ''],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: false,
    desc_slr: 'a',
    time_slr: 'span',
    cn: false,
};

module.exports = template(options);
