const art = require('art-template');
const path = require('path');
const config = require('../config');
const typeRegrx = /\.(atom|rss|json)$/;
const xmlFormatter = require('xml-formatter');

module.exports = async (ctx, next) => {
    ctx.state.type = ctx.request.path.match(typeRegrx) || ['', ''];
    ctx.request.path = ctx.request.path.replace(typeRegrx, '');

    await next();

    if (!ctx.body) {
        let template;

        switch (ctx.state.type[1]) {
            case 'atom':
                template = path.resolve(__dirname, '../views/atom.art');
                break;
            case 'rss':
                template = path.resolve(__dirname, '../views/rss.art');
                break;
            case 'json':
                template = path.resolve(__dirname, '../views/json.art');
                ctx.set({
                    'Content-Type': 'application/json; charset=UTF-8',
                });
                break;
            default:
                template = path.resolve(__dirname, '../views/rss.art');
                break;
        }

        if (ctx.url.includes('/chart/')) {
            template = path.resolve(__dirname, '../views/chart.art');
        }

        const data = {
            lastBuildDate: new Date().toUTCString(),
            updated: new Date().toISOString(),
            ttl: config.cacheExpire,
            ...ctx.state.data,
        };
        if (template) {
            let body = art(template, data);
            // 格式化 XML 响应以提高可读性和软件解析成功率
            if (ctx.state.type[1] === 'rss' || ctx.state.type[1] === 'atom' || template.includes('rss.art') || template.includes('atom.art')) {
                try {
                    body = xmlFormatter(body, {
                        indentation: '  ', // 使用2个空格缩进
                        collapseContent: true,
                        lineSeparator: '\n',
                    });
                } catch (err) {
                    console.error('XML 格式化失败:', err);
                }
            }
            ctx.body = body;
        }
        if (ctx.url.includes('/chart/stats/')) {
            ctx.body = JSON.stringify(ctx.state.data);
            ctx.set({
                'Content-Type': 'application/json; charset=UTF-8',
            });
        }
        if (ctx.query.type === 'fragment') {
            ctx.state.data.item = ctx.state.data.item.map((e) => {
                e.pubDate = new Date(e.pubDate).toLocaleDateString();
                e.description = e.description ? e.description.replace('<br/>', '\n') : '';
                return e;
            });
            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });
            ctx.body = art(path.resolve(__dirname, '../views/list.art'), {
                lastBuildDate: new Date().toUTCString(),
                ttl: config.cacheExpire,
                ...ctx.state.data,
            });
        }
        ctx.debug.status[ctx.request.path] = true;
    }
};
