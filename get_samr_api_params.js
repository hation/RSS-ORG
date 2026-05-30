const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 定义国家市场监督管理总局各页面类型和对应的路由文件
const samrCategories = [
    { name: '公告', file: 'routes/shichang/gonggao.js', url: 'https://www.samr.gov.cn/zw/zjwj/gsgg/index.html' }, // 公示公告
    { name: '通告', file: 'routes/shichang/tonggao.js', url: 'https://www.samr.gov.cn/zw/zjwj/tbtg/index.html' }, // 通报通告
    { name: '召回公告', file: 'routes/shichang/zhaohui.js', url: 'https://www.samr.gov.cn/zw/zh/index.html' }, // 召回
    { name: '新闻发布', file: 'routes/shichang/xinwen.js', url: 'https://www.samr.gov.cn/zw/zjwj/index.html' }, // 新闻发布（暂时使用文件发布页面）
    { name: '文件发布', file: 'routes/shichang/wenjian.js', url: 'https://www.samr.gov.cn/zw/zjwj/index.html' }, // 总局文件
];

// 获取API参数的函数
async function getApiParams(pageUrl) {
    try {
        console.log(`正在获取: ${pageUrl}`);
        const response = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);
        const scriptTags = $('script');

        for (let i = 0; i < scriptTags.length; i++) {
            const scriptTag = scriptTags.eq(i);
            const src = scriptTag.attr('src');

            if (src && src.includes('unitbuild.js')) {
                // 提取queryData（注意cheerio会将属性名转换为小写）
                const queryDataStr = scriptTag.attr('querydata');
                if (queryDataStr) {
                    try {
                        // 修复引号转义问题
                        const fixedQueryDataStr = queryDataStr.replace(/'/g, '"');
                        const queryData = JSON.parse(fixedQueryDataStr);

                        // 构建API URL
                        const apiUrl = `https://www.samr.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=${queryData.parseType}&webId=${queryData.webId}&tplSetId=${queryData.tplSetId}&pageType=${
                            queryData.pageType
                        }&tagId=${encodeURIComponent(queryData.tagId)}&editType=${queryData.editType}&pageId=${queryData.pageId}`;

                        return {
                            pageUrl,
                            apiUrl,
                            queryData,
                        };
                    } catch (parseError) {
                        console.log(`解析queryData失败: ${parseError.message}`);
                    }
                }
            }
        }

        return null;
    } catch (error) {
        console.log(`请求失败: ${pageUrl}, 错误: ${error.message}`);
        return null;
    }
}

// 更新路由文件的函数
function updateRouteFile(filePath, apiParams, category) {
    try {
        // 创建新的配置
        const newConfig = `const template = require('../template_page');

const options = {
    feed_title: '国家市场监督管理总局 - ${category.name}',
    feed_desc: '国家市场监督管理总局 - ${category.name}',
    feed_image: 'https://www.samr.gov.cn/images/logo.png',
    feed_url: '${category.url}',
    url: '${apiParams.apiUrl}',
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

module.exports = template(options);`;

        fs.writeFileSync(filePath, newConfig, 'utf8');
        console.log(`成功更新: ${filePath}`);
    } catch (writeError) {
        console.log(`写入文件失败: ${filePath}, 错误: ${writeError.message}`);
    }
}

// 主函数
async function main() {
    console.log('开始获取国家市场监督管理总局API参数...');

    for (const category of samrCategories) {
        console.log(`\n正在处理: ${category.name}`);
        const apiParams = await getApiParams(category.url);

        if (apiParams) {
            console.log(`成功获取API参数: ${apiParams.apiUrl}`);
            updateRouteFile(category.file, apiParams, category);
        } else {
            console.log('未能获取API参数');
        }
    }

    console.log('\n所有路由更新完成!');
}

// 执行主函数
main();
