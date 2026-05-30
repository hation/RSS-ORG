const template = require('../template_page');

const options = {
    feed_title: '国家市场监督管理总局 - 召回公告',
    feed_desc: '国家市场监督管理总局 - 召回公告',
    feed_image: 'https://www.samr.gov.cn/images/logo.png',
    feed_url: 'https://www.samr.gov.cn/zw/zh/index.html',
    url:
        'https://www.samr.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=bulidstatic&webId=29e9522dc89d4e088a953d8cede72f4c&tplSetId=5c30fb89ae5e48b9aefe3cdf49853830&pageType=column&tagId=%E5%86%85%E5%AE%B9%E5%8C%BA%E5%9F%9F&editType=null&pageId=bf39604e7599427c92ec64e90577f57a',
    baseUrl: 'https://www.samr.gov.cn',
    data_slr: 'data.html',
    list_slr: ['ul', 'ul'],
    title_slr: 'li.nav04Left02_content a',
    link_slr: 'li.nav04Left02_content a',
    link_rel: true,
    desc_slr: 'li.nav04Left02_content a',
    time_slr: 'li.nav04Left02_contenttime',
    cn: false,
};

module.exports = template(options);
