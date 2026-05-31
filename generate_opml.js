const fs = require('fs');
const path = require('path');

// 从 RSS路由.md 中提取所有有效路由信息
const extractRoutesFromMarkdown = (markdownContent) => {
    const routes = [];
    const sections = markdownContent.split('###');

    sections.forEach((section) => {
        // 跳过不包含路由信息的部分
        if (!section.includes('完整 URL') || section.includes('📝 使用说明')) {
            return;
        }

        // 提取章节标题（部门名称）
        const sectionTitle = section.split('\n')[0].trim();

        // 提取表格内容
        const tableMatch = section.match(/\| 完整 URL[\s\S]*?(\|[\s\S]*?)\|/);
        if (tableMatch) {
            const tableContent = tableMatch[1];

            // 解析表格行
            const lines = tableContent.split('\n');
            lines.forEach((line) => {
                if (line.trim() && !line.includes('完整 URL') && !line.includes('---')) {
                    const columns = line
                        .split('|')
                        .map((col) => col.trim())
                        .filter((col) => col);
                    if (columns.length >= 2) {
                        const url = columns[0];
                        const title = columns[1];

                        // 验证 URL 格式
                        if (url.startsWith('http://') || url.startsWith('https://')) {
                            routes.push({
                                title: title,
                                xmlUrl: url,
                                htmlUrl: url,
                                category: sectionTitle,
                            });
                        }
                    }
                }
            });
        }
    });

    return routes;
};

// 读取当前的 opml 文件
const readCurrentOpml = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const existingEntries = [];

        // 提取现有的 outline 条目
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
    // 合并现有条目和新条目，去除重复
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

    // 按部门分类排序条目
    allEntries.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

    // 生成 OPML 内容
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

    // 添加所有路由
    allEntries.forEach((entry) => {
        opmlContent += `        <outline type="rss" text="${entry.text}" title="${entry.title}" xmlUrl="${entry.xmlUrl}" htmlUrl="${entry.htmlUrl}"/>\n`;
    });

    opmlContent += `    </body>
</opml>`;

    return opmlContent;
};

// 主函数
const main = () => {
    // 读取 RSS路由.md 文件
    const markdownPath = path.join(__dirname, 'RSS路由.md');
    const opmlPath = path.join(__dirname, 'rss.opml.xml');

    try {
        const markdownContent = fs.readFileSync(markdownPath, 'utf8');
        const routes = extractRoutesFromMarkdown(markdownContent);

        const existingEntries = readCurrentOpml(opmlPath);

        const newOpmlContent = generateOpmlContent(routes, existingEntries);

        // 写入新的 OPML 文件
        fs.writeFileSync(opmlPath, newOpmlContent, 'utf8');

        console.log(`成功生成 OPML 文件！包含 ${routes.length} 个路由，已添加到 ${opmlPath}`);
        console.log(`当前文件包含 ${readCurrentOpml(opmlPath).length} 个订阅源`);
    } catch (error) {
        console.error('生成 OPML 文件失败:', error);
    }
};

main();
