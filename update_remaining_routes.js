const fs = require('fs');

async function updatePolicyFile() {
    try {
        const response = await fetch('https://www.miit.gov.cn/zwgk/zcwj/index.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const html = await response.text();

        const queryDataMatch = html.match(/queryData="([^"]*)"/);

        if (queryDataMatch) {
            const queryDataStr = queryDataMatch[1].replace(/'/g, '"');

            try {
                const queryData = JSON.parse(queryDataStr);

                const apiUrl = `https://www.miit.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=buildstatic&webId=${queryData.webId}&tplSetId=${queryData.tplSetId}&pageType=${
                    queryData.pageType
                }&tagId=${encodeURIComponent(queryData.tagId)}&editType=${queryData.editType}&pageId=${queryData.pageId}`;

                const newConfig = `const template = require('../template_page');

const options = {
    feed_title: '工信部 政策文件',
    feed_desc: '工信部 政策文件',
    feed_image: 'https://www.miit.gov.cn/dbsource/3520794/4332284.jpg',
    feed_url: 'https://www.miit.gov.cn/zwgk/zcwj/index.html',
    url: '${apiUrl}',
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

                fs.writeFileSync('routes/gongxinbu/wenjian.js', newConfig, 'utf8');
                console.log('✅ 成功更新政策文件路由');
            } catch (parseError) {
                console.log('解析queryData失败:', parseError);
            }
        }
    } catch (error) {
        console.log('更新政策文件路由失败:', error);
    }
}

function updateInvestmentFile() {
    const fallbackConfig = `const template = require('../template_page');

const options = {
    feed_title: '工信部 投资',
    feed_desc: '工信部 投资',
    feed_image: 'https://www.miit.gov.cn/dbsource/3520794/4332284.jpg',
    feed_url: 'https://www.miit.gov.cn/zwgk/index.html',
    url: 'https://www.miit.gov.cn/zwgk/index.html',
    baseUrl: 'https://www.miit.gov.cn',
    list_slr: ['li', '.list-con'],
    title_slr: 'a',
    link_slr: 'a',
    link_rel: true,
    desc_slr: 'a',
    time_slr: 'span',
    cn: false,
};

module.exports = template(options);`;

    fs.writeFileSync('routes/gongxinbu/touzi.js', fallbackConfig, 'utf8');
    console.log('✅ 成功更新投资路由（使用备用配置）');
}

async function main() {
    console.log('开始更新剩余的路由文件...');

    // 更新政策文件路由
    await updatePolicyFile();

    // 更新投资路由（使用备用配置）
    updateInvestmentFile();

    console.log('\n✅ 所有剩余路由文件更新完成');
}

main().catch(console.error);
