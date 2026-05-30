const axios = require('axios');
const fs = require('fs');
const path = require('path');

const miitCategories = [
    { name: '领导活动', file: 'routes/gongxinbu/lingdao.js', url: 'https://www.miit.gov.cn/xwfb/bldhd/index.html' },
    { name: '对外交流', file: 'routes/gongxinbu/duiwai.js', url: 'https://www.miit.gov.cn/xwfb/gxdt/sjdt/index.html' },
    { name: '工信动态', file: 'routes/gongxinbu/gongzuo.js', url: 'https://www.miit.gov.cn/xwfb/gxdt/index.html' },
    { name: '地方动态', file: 'routes/gongxinbu/fagui.js', url: 'https://www.miit.gov.cn/xwfb/gxdt/dfdt/index.html' },
    { name: '部属动态', file: 'routes/gongxinbu/gongkai.js', url: 'https://www.miit.gov.cn/xwfb/gxdt/bsdt/index.html' },
    { name: '政策文件', file: 'routes/gongxinbu/wenjian.js', url: 'https://www.miit.gov.cn/zcfb/zcfg/index.html' },
    { name: '统计-综合', file: 'routes/gongxinbu/tongji-zonghe.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '统计-电子', file: 'routes/gongxinbu/tongji-dianzi.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '统计-软件', file: 'routes/gongxinbu/tongji-ruanjian.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '统计-通信', file: 'routes/gongxinbu/tongji-tongxin.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '统计-消费品', file: 'routes/gongxinbu/tongji-xiaofeipin.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '统计-原材料', file: 'routes/gongxinbu/tongji-yuancailiao.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '统计-装备', file: 'routes/gongxinbu/tongji-zhuangbei.js', url: 'https://www.miit.gov.cn/gxsj/tjfx/index.html' },
    { name: '投资', file: 'routes/gongxinbu/touzi.js', url: 'https://www.miit.gov.cn/touzi/index.html' },
];

async function getApiParams(pageUrl) {
    try {
        console.log(`正在获取: ${pageUrl}`);
        const response = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const html = response.data;

        // 匹配包含 unitbuild.js 的 script 标签
        const scriptMatch = html.match(/<script[^>]*src="[^"]*unitbuild\.js[^"]*"[^>]*>([\s\S]*?)<\/script>/);

        if (scriptMatch) {
            // 查找 queryData 属性
            const queryDataMatch = html.match(/queryData="([^"]*)"/);

            if (queryDataMatch) {
                const queryDataStr = queryDataMatch[1].replace(/'/g, '"');

                try {
                    const queryData = JSON.parse(queryDataStr);

                    const apiUrl = `https://www.miit.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=buildstatic&webId=${queryData.webId}&tplSetId=${queryData.tplSetId}&pageType=${
                        queryData.pageType
                    }&tagId=${encodeURIComponent(queryData.tagId)}&editType=${queryData.editType}&pageId=${queryData.pageId}`;

                    return {
                        pageUrl,
                        apiUrl,
                        queryData,
                    };
                } catch (parseError) {
                    console.log(`解析queryData失败: ${parseError.message}`);
                    console.log(`queryData字符串: ${queryDataStr}`);
                }
            }
        }

        return null;
    } catch (error) {
        console.log(`请求失败: ${pageUrl}, 错误: ${error.message}`);
        return null;
    }
}

function updateRouteFile(filePath, apiParams, category) {
    try {
        const newConfig = `const template = require('../template_page');

const options = {
    feed_title: '工信部${category.name.includes('统计') ? '-' + category.name.split('-')[1] : ' ' + category.name}',
    feed_desc: '工信部${category.name.includes('统计') ? '-' + category.name.split('-')[1] : ' ' + category.name}',
    feed_image: 'https://www.miit.gov.cn/dbsource/3520794/4332284.jpg',
    feed_url: '${category.url}',
    url: '${apiParams.apiUrl}',
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

module.exports = template(options);`;

        fs.writeFileSync(filePath, newConfig, 'utf8');
        console.log(`✅ 成功更新文件: ${filePath}`);
    } catch (error) {
        console.log(`❌ 无法更新文件: ${filePath}, 错误: ${error.message}`);
    }
}

async function main() {
    console.log('开始获取工信部各页面API参数...\n');

    const apiParamsList = [];

    for (const category of miitCategories) {
        const params = await getApiParams(category.url);

        if (params) {
            apiParamsList.push({
                category,
                apiParams: params,
            });

            console.log(`✅ 成功获取 ${category.name} 的API参数`);
        } else {
            console.log(`❌ 未能获取 ${category.name} 的API参数`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n开始更新路由文件...\n');
    apiParamsList.forEach((item) => {
        if (fs.existsSync(item.category.file)) {
            updateRouteFile(item.category.file, item.apiParams, item.category);
        } else {
            console.log(`❌ 文件不存在: ${item.category.file}`);
        }
    });

    const resultFile = 'miit_api_params2.json';
    fs.writeFileSync(resultFile, JSON.stringify(apiParamsList, null, 2), 'utf8');
    console.log(`\n✅ API参数已保存到: ${resultFile}`);

    const existingFiles = fs.readdirSync('routes/gongxinbu');
    const processedFiles = apiParamsList.map((item) => path.basename(item.category.file));
    const unprocessedFiles = existingFiles.filter((file) => !processedFiles.includes(file));

    if (unprocessedFiles.length > 0) {
        console.log('\n⚠️ 以下文件可能需要手动检查或更新:');
        unprocessedFiles.forEach((file) => {
            console.log(`   - routes/gongxinbu/${file}`);
        });
    }
}

main().catch((error) => {
    console.log(`❌ 程序执行失败: ${error.message}`);
    console.log(error.stack);
});
