const template = require('../template_page');

const options = {
    feed_title: '国务院-最新政策',
    feed_desc: '国务院-最新政策',
    feed_image: 'http://www.gov.cn/images/newlogo19ysp_rt.png',
    feed_url: 'https://www.gov.cn/zhengce/index.htm',
    url: 'https://www.gov.cn/zhengce/index.htm',
    baseUrl: 'https://www.gov.cn',
    list_slr: ['.list.fl ul li'],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: false,
    link_map: function(link) {
        if (link.startsWith('http://') || link.startsWith('https://')) {
            return link;
        }
        if (link.startsWith('./')) {
            return 'https://www.gov.cn/zhengce/' + link.substring(2);
        }
        if (link.startsWith('/')) {
            return 'https://www.gov.cn' + link;
        }
        return 'https://www.gov.cn/zhengce/' + link;
    },
    desc_slr: 'a',
    time_slr: 'span',
    time_map: function(time) {
        return time.trim() + ' 00:00:00';
    },
    cn: false,
};

module.exports = template(options);
