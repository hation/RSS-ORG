const template = require('../template_page');

const options = {
    feed_title: '外交动态 领导人活动',
    feed_desc: '外交动态 领导人活动',
    feed_image: 'https://www.mfa.gov.cn/web/images/logo.png',
    feed_url: 'https://www.mfa.gov.cn/web/wjdt_674879/gjldrhd_674881/',
    url: 'https://www.mfa.gov.cn/web/wjdt_674879/gjldrhd_674881/',
    baseUrl: 'https://www.mfa.gov.cn/web/wjdt_674879/gjldrhd_674881/',
    list_slr: ['li', '.newsBd ul.list1'],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: true,
    link_map: function(link) {
        return link.replace(/^\.\//, '');
    },
    desc_slr: 'a',
    time_slr: 'a',
    time_map: function(time) {
        const match = time.match(/（(\d{4}-\d{2}-\d{2})）/);
        return match ? match[1] : time;
    },
    cn: false,
};

module.exports = template(options);
