const template = require('../template_page');

const options = {
    feed_title: '教育部 教育要闻',
    feed_desc: '教育部 教育要闻',
    feed_image: 'http://www.moe.gov.cn/images/scy_jyb_lgo_03.png',
    feed_url: 'http://www.moe.gov.cn/jyb_sy/sy_jyyw/',
    url: 'http://www.moe.gov.cn/jyb_sy/sy_jyyw/',
    baseUrl: 'http://www.moe.gov.cn',
    list_slr: ['li', '.moe-list'],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: true,
    desc_slr: 'a',
    time_slr: '',
    time_map: function(time) {
        const match = time.match(/(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : time;
    },
    link_map: function(link) {
        // 修复链接格式，去除重复的域名和相对路径
        // 如果链接本身已经是完整 URL，则直接返回
        if (link.startsWith('http://') || link.startsWith('https://')) {
            return link;
        }

        // 处理相对路径
        let fixedLink = link;
        if (fixedLink.startsWith('../../')) {
            fixedLink = fixedLink.replace('../../', '/');
        }

        // 确保链接格式正确
        if (!fixedLink.startsWith('http://') && !fixedLink.startsWith('https://')) {
            fixedLink = fixedLink.startsWith('/') ? fixedLink : '/' + fixedLink;
        }

        return fixedLink;
    },
    cn: false,
};

module.exports = template(options);
