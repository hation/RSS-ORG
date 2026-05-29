const template = require('../template_page');

const options = {
    feed_title: '外交部 驻外报道',
    feed_desc: '外交部 驻外报道',
    feed_image: 'https://www.mfa.gov.cn/web/images/logo.png',
    feed_url: 'https://www.mfa.gov.cn/web/wjdt_674879/zwbd_674895/',
    url: 'https://www.mfa.gov.cn/web/wjdt_674879/zwbd_674895/',
    baseUrl: 'https://www.mfa.gov.cn/web/wjdt_674879/zwbd_674895/',
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
