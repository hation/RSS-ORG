const template = require('../template_page');

const options = {
    feed_title: '工信部-综合',
    feed_desc: '工信部-综合',
    feed_image: 'https://www.miit.gov.cn/dbsource/3520794/4332284.jpg',
    feed_url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html',
    url:
        'https://www.miit.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=buildstatic&webId=8d828e408d90447786ddbe128d495e9e&tplSetId=209741b2109044b5b7695700b2bec37e&pageType=column&tagId=%E5%8F%B3%E4%BE%A7%E5%86%85%E5%AE%B9&editType=null&pageId=b5946cb121b84c30b9ac608467c9df4e',
    baseUrl: 'https://www.miit.gov.cn',
    data_slr: 'data.html',
    list_slr: ['li.cf', ''],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: true,
    desc_slr: 'a',
    time_slr: 'span',
    cn: false,
};

module.exports = template(options);
