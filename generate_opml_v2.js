const fs = require('fs');
const path = require('path');

// 直接从 RSS路由.md 中手动提取所有有效路由信息
const getRoutes = () => [
    { title: '国务院-新闻-要闻', xmlUrl: 'http://192.168.0.116:1200/guowuyuan/xinwen', htmlUrl: 'http://192.168.0.116:1200/guowuyuan/xinwen' },
    { title: '国务院-动态', xmlUrl: 'http://192.168.0.116:1200/guowuyuan/dongtai', htmlUrl: 'http://192.168.0.116:1200/guowuyuan/dongtai' },
    { title: '国务院-政策-最新', xmlUrl: 'http://192.168.0.116:1200/guowuyuan/zhengce-zuixin', htmlUrl: 'http://192.168.0.116:1200/guowuyuan/zhengce-zuixin' },
    { title: '国务院-数据-要闻', xmlUrl: 'http://192.168.0.116:1200/guowuyuan/shuju', htmlUrl: 'http://192.168.0.116:1200/guowuyuan/shuju' },
    { title: '国务院-公开征求意见', xmlUrl: 'http://192.168.0.116:1200/guowuyuan/fazhiban', htmlUrl: 'http://192.168.0.116:1200/guowuyuan/fazhiban' },
    { title: '工信部-工作动态', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/dongtai', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/dongtai' },
    { title: '工信部-领导活动', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/lingdao', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/lingdao' },
    { title: '工信部-对外交流', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/duiwai', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/duiwai' },
    { title: '工信部-重点工作', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/gongzuo', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/gongzuo' },
    { title: '工信部-政策文件', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/wenjian', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/wenjian' },
    { title: '工信部-统计 综合', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-zonghe', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-zonghe' },
    { title: '工信部-统计 电子', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-dianzi', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-dianzi' },
    { title: '工信部-统计 软件', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-ruanjian', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-ruanjian' },
    { title: '工信部-统计 通信', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-tongxin', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-tongxin' },
    { title: '工信部-统计 消费品', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-xiaofeipin', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-xiaofeipin' },
    { title: '工信部-统计 原材料', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-yuancailiao', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-yuancailiao' },
    { title: '工信部-统计 装备', xmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-zhuangbei', htmlUrl: 'http://192.168.0.116:1200/gongxinbu/tongji-zhuangbei' },
    { title: '科技部-最近更新', xmlUrl: 'http://192.168.0.116:1200/kejibu/gengxin', htmlUrl: 'http://192.168.0.116:1200/kejibu/gengxin' },
    { title: '财政部-政策发布', xmlUrl: 'http://192.168.0.116:1200/caizhengbu/zhengce', htmlUrl: 'http://192.168.0.116:1200/caizhengbu/zhengce' },
    { title: '发改委-新闻', xmlUrl: 'http://192.168.0.116:1200/fagaiwei/xinwen', htmlUrl: 'http://192.168.0.116:1200/fagaiwei/xinwen' },
    { title: '国防部-权威发布', xmlUrl: 'http://192.168.0.116:1200/guofangbu/fabu', htmlUrl: 'http://192.168.0.116:1200/guofangbu/fabu' },
    { title: '外交部-领导人活动', xmlUrl: 'http://192.168.0.116:1200/waijiaobu/lingdaoren', htmlUrl: 'http://192.168.0.116:1200/waijiaobu/lingdaoren' },
    { title: '外交部-司局新闻', xmlUrl: 'http://192.168.0.116:1200/waijiaobu/sjxw', htmlUrl: 'http://192.168.0.116:1200/waijiaobu/sjxw' },
    { title: '外交部-驻外报道', xmlUrl: 'http://192.168.0.116:1200/waijiaobu/zwbd', htmlUrl: 'http://192.168.0.116:1200/waijiaobu/zwbd' },
    { title: '教育部-教育要闻', xmlUrl: 'http://192.168.0.116:1200/jiaoyubu/jyyw', htmlUrl: 'http://192.168.0.116:1200/jiaoyubu/jyyw' },
    { title: '教育部-教育通知', xmlUrl: 'http://192.168.0.116:1200/jiaoyubu/jytz', htmlUrl: 'http://192.168.0.116:1200/jiaoyubu/jytz' },
    { title: '公安部-通知', xmlUrl: 'http://192.168.0.116:1200/gonganbu/bulletin', htmlUrl: 'http://192.168.0.116:1200/gonganbu/bulletin' },
    { title: '住建部-要闻', xmlUrl: 'http://192.168.0.116:1200/zhufang/yaowen', htmlUrl: 'http://192.168.0.116:1200/zhufang/yaowen' },
    { title: '住建部-信息公示', xmlUrl: 'http://192.168.0.116:1200/zhufang/xinxi', htmlUrl: 'http://192.168.0.116:1200/zhufang/xinxi' },
    { title: '住建部-地方动态', xmlUrl: 'http://192.168.0.116:1200/zhufang/difang', htmlUrl: 'http://192.168.0.116:1200/zhufang/difang' },
    { title: '纪检委-要闻', xmlUrl: 'http://192.168.0.116:1200/jijian/yaowen', htmlUrl: 'http://192.168.0.116:1200/jijian/yaowen' },
    { title: '纪检委-中管审查', xmlUrl: 'http://192.168.0.116:1200/jijian/zhongguansc', htmlUrl: 'http://192.168.0.116:1200/jijian/zhongguansc' },
    { title: '纪检委-中管处分', xmlUrl: 'http://192.168.0.116:1200/jijian/zhongguancf', htmlUrl: 'http://192.168.0.116:1200/jijian/zhongguancf' },
    { title: '纪检委-中央审查', xmlUrl: 'http://192.168.0.116:1200/jijian/zhongyangsc', htmlUrl: 'http://192.168.0.116:1200/jijian/zhongyangsc' },
    { title: '纪检委-中央处分', xmlUrl: 'http://192.168.0.116:1200/jijian/zhongyangcf', htmlUrl: 'http://192.168.0.116:1200/jijian/zhongyangcf' },
    { title: '纪检委-省管审查', xmlUrl: 'http://192.168.0.116:1200/jijian/shenguansc', htmlUrl: 'http://192.168.0.116:1200/jijian/shenguansc' },
    { title: '纪检委-省管处分', xmlUrl: 'http://192.168.0.116:1200/jijian/shenguancf', htmlUrl: 'http://192.168.0.116:1200/jijian/shenguancf' },
    { title: '最高检-权威发布', xmlUrl: 'http://192.168.0.116:1200/jianchayuan/fabu', htmlUrl: 'http://192.168.0.116:1200/jianchayuan/fabu' },
    { title: '最高检-新闻', xmlUrl: 'http://192.168.0.116:1200/jianchayuan/xinwen', htmlUrl: 'http://192.168.0.116:1200/jianchayuan/xinwen' },
    { title: '最高法-新闻', xmlUrl: 'http://192.168.0.116:1200/zgfy/zuigao', htmlUrl: 'http://192.168.0.116:1200/zgfy/zuigao' },
    { title: '最高法-地方新闻', xmlUrl: 'http://192.168.0.116:1200/zgfy/difang', htmlUrl: 'http://192.168.0.116:1200/zgfy/difang' },
    { title: '最高法-司法解释', xmlUrl: 'http://192.168.0.116:1200/zgfy/jieshi', htmlUrl: 'http://192.168.0.116:1200/zgfy/jieshi' },
    { title: '最高法-重大案件', xmlUrl: 'http://192.168.0.116:1200/zgfy/zhongda', htmlUrl: 'http://192.168.0.116:1200/zgfy/zhongda' },
    { title: '市监局-召回公告', xmlUrl: 'http://192.168.0.116:1200/shichang/zhaohui', htmlUrl: 'http://192.168.0.116:1200/shichang/zhaohui' },
    { title: '市监局-公告', xmlUrl: 'http://192.168.0.116:1200/shichang/gonggao', htmlUrl: 'http://192.168.0.116:1200/shichang/gonggao' },
    { title: '市监局-通告', xmlUrl: 'http://192.168.0.116:1200/shichang/tonggao', htmlUrl: 'http://192.168.0.116:1200/shichang/tonggao' },
    { title: '市监局-新闻发布', xmlUrl: 'http://192.168.0.116:1200/shichang/xinwen', htmlUrl: 'http://192.168.0.116:1200/shichang/xinwen' },
    { title: '市监局-文件发布', xmlUrl: 'http://192.168.0.116:1200/shichang/wenjian', htmlUrl: 'http://192.168.0.116:1200/shichang/wenjian' },
    { title: '税务总局-税务要闻', xmlUrl: 'http://192.168.0.116:1200/shuiwu/yaowen', htmlUrl: 'http://192.168.0.116:1200/shuiwu/yaowen' },
    { title: '海关总署-动态', xmlUrl: 'http://192.168.0.116:1200/haiguan/dongtai', htmlUrl: 'http://192.168.0.116:1200/haiguan/dongtai' },
    { title: '体育总局-通知公告', xmlUrl: 'http://192.168.0.116:1200/tiyu/tongzhi', htmlUrl: 'http://192.168.0.116:1200/tiyu/tongzhi' },
    { title: '体育总局-地方动态', xmlUrl: 'http://192.168.0.116:1200/tiyu/difang', htmlUrl: 'http://192.168.0.116:1200/tiyu/difang' },
    { title: '广电总局-通知公告', xmlUrl: 'http://192.168.0.116:1200/guangdian/tongzhi', htmlUrl: 'http://192.168.0.116:1200/guangdian/tongzhi' },
    { title: '广电总局-电影备案', xmlUrl: 'http://192.168.0.116:1200/guangdian/movie-beian', htmlUrl: 'http://192.168.0.116:1200/guangdian/movie-beian' },
    { title: '广电总局-电影放映许可', xmlUrl: 'http://192.168.0.116:1200/guangdian/movie-xuke', htmlUrl: 'http://192.168.0.116:1200/guangdian/movie-xuke' },
    { title: '宗教事务局-部工作动态', xmlUrl: 'http://192.168.0.116:1200/zongjiao/bu', htmlUrl: 'http://192.168.0.116:1200/zongjiao/bu' },
    { title: '宗教事务局-地方工作动态', xmlUrl: 'http://192.168.0.116:1200/zongjiao/difang', htmlUrl: 'http://192.168.0.116:1200/zongjiao/difang' },
    { title: '宗教事务局-宗教界动态', xmlUrl: 'http://192.168.0.116:1200/zongjiao/zongjiao', htmlUrl: 'http://192.168.0.116:1200/zongjiao/zongjiao' },
    { title: '知识产权局-知识产权工作', xmlUrl: 'http://192.168.0.116:1200/ip/gongzuo', htmlUrl: 'http://192.168.0.116:1200/ip/gongzuo' },
    { title: '知识产权局-工作通知', xmlUrl: 'http://192.168.0.116:1200/ip/tongzhi', htmlUrl: 'http://192.168.0.116:1200/ip/tongzhi' },
    { title: '上海市经信委-政务公开', xmlUrl: 'http://192.168.0.116:1200/shgov/bulletin', htmlUrl: 'http://192.168.0.116:1200/shgov/bulletin' },
    { title: '四川省纪检委', xmlUrl: 'http://192.168.0.116:1200/gov/sichuan/jijian', htmlUrl: 'http://192.168.0.116:1200/gov/sichuan/jijian' },
    { title: '海淀法院-案件快报', xmlUrl: 'http://192.168.0.116:1200/hdfy/anjian', htmlUrl: 'http://192.168.0.116:1200/hdfy/anjian' },
    { title: 'HUD Press Release', xmlUrl: 'http://192.168.0.116:1200/us/hud/news', htmlUrl: 'http://192.168.0.116:1200/us/hud/news' },
    { title: '美国财政部新闻', xmlUrl: 'http://192.168.0.116:1200/us/treasury/press', htmlUrl: 'http://192.168.0.116:1200/us/treasury/press' },
    { title: '美国交通部新闻', xmlUrl: 'http://192.168.0.116:1200/us/transportation/press', htmlUrl: 'http://192.168.0.116:1200/us/transportation/press' },
    { title: '网易新闻', xmlUrl: 'http://192.168.0.116:1200/netease/guoji', htmlUrl: 'http://192.168.0.116:1200/netease/guoji' },
    { title: '参考消息', xmlUrl: 'http://192.168.0.116:1200/cankao/roll', htmlUrl: 'http://192.168.0.116:1200/cankao/roll' },
    { title: '维基百科-日历', xmlUrl: 'http://192.168.0.116:1200/wikipedia/cal', htmlUrl: 'http://192.168.0.116:1200/wikipedia/cal' },
    { title: '微博-文章', xmlUrl: 'http://192.168.0.116:1200/weibo/article', htmlUrl: 'http://192.168.0.116:1200/weibo/article' },
    { title: '微博-热搜', xmlUrl: 'http://192.168.0.116:1200/weibo/hot', htmlUrl: 'http://192.168.0.116:1200/weibo/hot' },
    { title: '微博-搜索', xmlUrl: 'http://192.168.0.116:1200/weibo/search', htmlUrl: 'http://192.168.0.116:1200/weibo/search' },
    { title: '微博-话题', xmlUrl: 'http://192.168.0.116:1200/weibo/topic', htmlUrl: 'http://192.168.0.116:1200/weibo/topic' },
    { title: '微博-用户', xmlUrl: 'http://192.168.0.116:1200/weibo/user', htmlUrl: 'http://192.168.0.116:1200/weibo/user' },
    { title: '微博-视频', xmlUrl: 'http://192.168.0.116:1200/weibo/video', htmlUrl: 'http://192.168.0.116:1200/weibo/video' },
];

// 读取当前的 opml 文件
const readCurrentOpml = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const existingEntries = [];

        const outlineRegex = /<outline type="rss" text="([^"]+)" title="([^"]+)" xmlUrl="([^"]+)" htmlUrl="([^"]+)"\/>/g;
        let match;

        while ((match = outlineRegex.exec(content)) !== null) {
            existingEntries.push({
                title: match[1],
                text: match[2],
                xmlUrl: match[3],
                htmlUrl: match[4],
            });
        }

        return existingEntries;
    } catch (error) {
        console.error('读取当前 OPML 文件失败:', error);
        return [];
    }
};

// 生成新的 OPML 内容
const generateOpmlContent = (routes, existingEntries) => {
    const allEntries = [...existingEntries];
    const existingUrls = new Set(existingEntries.map((entry) => entry.xmlUrl));

    routes.forEach((route) => {
        if (!existingUrls.has(route.xmlUrl)) {
            allEntries.push({
                text: route.title,
                title: route.title,
                xmlUrl: route.xmlUrl,
                htmlUrl: route.htmlUrl,
            });
        }
    });

    allEntries.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

    let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
    <head>
        <title>RSS-ORG 订阅源</title>
        <dateCreated>${new Date().toISOString()}</dateCreated>
        <dateModified>${new Date().toISOString()}</dateModified>
        <ownerName>RSS-ORG</ownerName>
        <ownerEmail>rssorg@example.com</ownerEmail>
    </head>
    <body>\n`;

    allEntries.forEach((entry) => {
        opmlContent += `        <outline type="rss" text="${entry.text}" title="${entry.title}" xmlUrl="${entry.xmlUrl}" htmlUrl="${entry.htmlUrl}"/>\n`;
    });

    opmlContent += `    </body>
</opml>`;

    return opmlContent;
};

const main = () => {
    const opmlPath = path.join(__dirname, 'rss.opml.xml');

    try {
        const routes = getRoutes();
        const existingEntries = readCurrentOpml(opmlPath);

        const newOpmlContent = generateOpmlContent(routes, existingEntries);

        fs.writeFileSync(opmlPath, newOpmlContent, 'utf8');

        console.log(`成功生成 OPML 文件！包含 ${routes.length} 个路由，已添加到 ${opmlPath}`);
        console.log(`当前文件包含 ${readCurrentOpml(opmlPath).length} 个订阅源`);
    } catch (error) {
        console.error('生成 OPML 文件失败:', error);
    }
};

main();
