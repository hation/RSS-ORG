#!/usr/bin/env node

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 配置
const BASE_URL = 'http://localhost:1200';
const TIMEOUT = 10000; // 10秒超时
const MAX_RETRIES = 2;

// 关键路由测试列表
const TEST_ROUTES = [
    // 政府类路由（高优先级）
    { path: '/guowuyuan/xinwen', name: '国务院-新闻-要闻', method: 'GET' },
    { path: '/guowuyuan/dongtai', name: '国务院-动态', method: 'GET' },
    { path: '/gongxinbu/dongtai', name: '工信部-工作动态', method: 'GET' },
    { path: '/jiaoyubu/jyyw', name: '教育部-教育要闻', method: 'GET' },

    // 新闻媒体路由
    { path: '/netease/guoji', name: '网易新闻-国际', method: 'GET' },
    { path: '/sina/rollnews', name: '新浪滚动新闻', method: 'GET', params: { cate: 'news' } },

    // 社交媒体路由
    { path: '/weibo/topic/热点', name: '微博话题-热点', method: 'GET' },
    { path: '/zhihu/daily', name: '知乎日报', method: 'GET' },

    // 数据图表路由
    { path: '/stats/category', name: '统计数据分类', method: 'GET' },
    { path: '/chart/exports', name: '进出口图表', method: 'GET' },

    // 测试路由（基础功能）
    { path: '/', name: '首页', method: 'GET' },
    { path: '/api', name: 'API页面', method: 'GET' },
];

// 结果统计
const results = {
    total: 0,
    success: 0,
    failed: 0,
    warnings: 0,
    details: [],
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// 检查服务是否运行
async function checkServerRunning() {
    try {
        const response = await axios.get(`${BASE_URL}/`, { timeout: 3000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

// 启动服务
async function startServer() {
    console.log(colorize('🚀 启动RSS-ORG服务...', 'cyan'));

    try {
        // 检查是否已安装依赖
        const { stdout, stderr } = await execAsync('npm list --depth=0');
        if (stderr && stderr.includes('npm ERR!')) {
            console.log(colorize('📦 安装项目依赖...', 'yellow'));
            await execAsync('npm install');
        }
    } catch (error) {
        console.log(colorize('📦 安装项目依赖...', 'yellow'));
        await execAsync('npm install');
    }

    // 在后台启动服务
    const serverProcess = exec('npm start', { cwd: process.cwd() });

    // 等待服务启动
    console.log(colorize('⏳ 等待服务启动（10秒）...', 'cyan'));
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return serverProcess;
}

// 测试单个路由
async function testRoute(route, retryCount = 0) {
    const startTime = Date.now();

    try {
        const config = {
            method: route.method.toLowerCase(),
            url: `${BASE_URL}${route.path}`,
            timeout: TIMEOUT,
            params: route.params || {},
            headers: {
                'User-Agent': 'RSS-ORG Health Check/1.0',
            },
        };

        const response = await axios(config);
        const duration = Date.now() - startTime;

        // 检查响应状态
        if (response.status >= 200 && response.status < 300) {
            // 检查响应内容
            const hasContent = response.data && ((typeof response.data === 'string' && response.data.length > 0) || (typeof response.data === 'object' && Object.keys(response.data).length > 0));

            if (!hasContent) {
                return {
                    success: false,
                    duration,
                    error: '响应内容为空',
                    status: response.status,
                };
            }

            return {
                success: true,
                duration,
                status: response.status,
                size: typeof response.data === 'string' ? response.data.length : JSON.stringify(response.data).length,
            };
        } else {
            return {
                success: false,
                duration,
                error: `HTTP ${response.status}`,
                status: response.status,
            };
        }
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            console.log(colorize(`  重试 ${route.name} (${retryCount + 1}/${MAX_RETRIES})...`, 'yellow'));
            await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
            return testRoute(route, retryCount + 1);
        }

        const duration = Date.now() - startTime;
        return {
            success: false,
            duration,
            error: error.message || '未知错误',
            status: error.response?.status || 0,
        };
    }
}

// 生成报告
function generateReport() {
    console.log('\n' + colorize('='.repeat(60), 'cyan'));
    console.log(colorize('📊 RSS-ORG 健康检查报告', 'cyan'));
    console.log(colorize('='.repeat(60), 'cyan'));

    // 汇总统计
    console.log(`\n${colorize('汇总统计:', 'magenta')}`);
    console.log(`  测试路由总数: ${results.total}`);
    console.log(`  ${colorize('✓ 成功:', 'green')} ${results.success}`);
    console.log(`  ${colorize('✗ 失败:', 'red')} ${results.failed}`);
    console.log(`  ${colorize('⚠ 警告:', 'yellow')} ${results.warnings}`);

    const successRate = results.total > 0 ? ((results.success / results.total) * 100).toFixed(1) : 0;
    console.log(`  成功率: ${colorize(`${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red')}`);

    // 详细结果
    console.log(`\n${colorize('详细结果:', 'magenta')}`);
    results.details.forEach((detail, index) => {
        const status = detail.success ? colorize('✓', 'green') : detail.warning ? colorize('⚠', 'yellow') : colorize('✗', 'red');

        console.log(`  ${index + 1}. ${status} ${detail.name}`);
        console.log(`     路径: ${detail.path}`);
        console.log(`     状态: ${detail.status}`);
        console.log(`     耗时: ${detail.duration}ms`);

        if (detail.size) {
            console.log(`     大小: ${detail.size} bytes`);
        }

        if (detail.error) {
            console.log(`     错误: ${colorize(detail.error, 'red')}`);
        }

        if (detail.suggestion) {
            console.log(`     建议: ${colorize(detail.suggestion, 'yellow')}`);
        }

        console.log('');
    });

    // 分类统计
    const categories = {};
    results.details.forEach((detail) => {
        const category = detail.path.split('/')[1] || 'root';
        if (!categories[category]) {
            categories[category] = { total: 0, success: 0 };
        }
        categories[category].total++;
        if (detail.success) categories[category].success++;
    });

    console.log(`${colorize('分类统计:', 'magenta')}`);
    Object.entries(categories).forEach(([category, stats]) => {
        const rate = ((stats.success / stats.total) * 100).toFixed(1);
        const color = rate >= 80 ? 'green' : rate >= 60 ? 'yellow' : 'red';
        console.log(`  ${category}: ${stats.success}/${stats.total} (${colorize(`${rate}%`, color)})`);
    });

    // 建议
    console.log(`\n${colorize('建议:', 'magenta')}`);
    if (successRate >= 90) {
        console.log(colorize('  ✅ 系统状态良好，大部分路由工作正常', 'green'));
    } else if (successRate >= 70) {
        console.log(colorize('  ⚠  系统状态一般，部分路由需要修复', 'yellow'));
    } else {
        console.log(colorize('  ❌ 系统状态较差，需要立即修复', 'red'));
    }

    const failedRoutes = results.details.filter((r) => !r.success && !r.warning);
    if (failedRoutes.length > 0) {
        console.log(colorize('  需要优先修复的路由:', 'yellow'));
        failedRoutes.forEach((route) => {
            console.log(`    - ${route.name} (${route.path})`);
        });
    }

    // 生成JSON报告文件
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.total,
            success: results.success,
            failed: results.failed,
            warnings: results.warnings,
            successRate: parseFloat(successRate),
        },
        details: results.details,
        categories: categories,
    };

    require('fs').writeFileSync('./health-check-report.json', JSON.stringify(report, null, 2));

    console.log(colorize(`\n📄 详细报告已保存到: health-check-report.json`, 'cyan'));
}

// 主函数
async function main() {
    console.log(colorize('🔍 RSS-ORG 健康检查开始', 'cyan'));
    console.log(colorize(`📅 ${new Date().toLocaleString()}`, 'cyan'));

    let serverProcess = null;

    try {
        // 检查服务是否已在运行
        const isRunning = await checkServerRunning();
        if (!isRunning) {
            serverProcess = await startServer();

            // 再次检查服务是否启动成功
            const retryCount = 5;
            for (let i = 0; i < retryCount; i++) {
                console.log(colorize(`  检查服务状态 (${i + 1}/${retryCount})...`, 'cyan'));
                if (await checkServerRunning()) {
                    console.log(colorize('✅ 服务启动成功', 'green'));
                    break;
                }
                if (i === retryCount - 1) {
                    throw new Error('服务启动失败，请手动检查');
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        } else {
            console.log(colorize('✅ 服务已在运行', 'green'));
        }

        // 测试所有路由
        console.log(`\n${colorize('🧪 开始测试路由...', 'cyan')}`);
        results.total = TEST_ROUTES.length;

        for (const route of TEST_ROUTES) {
            console.log(`\n测试: ${colorize(route.name, 'blue')}`);
            console.log(`  路径: ${route.path}`);

            const result = await testRoute(route);

            const detail = {
                name: route.name,
                path: route.path,
                success: result.success,
                status: result.status || 0,
                duration: result.duration,
                size: result.size,
                error: result.error,
            };

            // 判断是否为警告（响应成功但可能有问题）
            if (result.success && result.duration > 5000) {
                detail.warning = true;
                detail.suggestion = '响应时间过长，建议优化';
                results.warnings++;
            } else if (result.success && result.size < 100) {
                detail.warning = true;
                detail.suggestion = '响应内容过少，可能数据获取失败';
                results.warnings++;
            }

            if (result.success && !detail.warning) {
                console.log(colorize(`  ✅ 成功 (${result.duration}ms)`, 'green'));
                results.success++;
            } else if (detail.warning) {
                console.log(colorize(`  ⚠  警告: ${detail.suggestion}`, 'yellow'));
                results.success++; // 警告也算成功
            } else {
                console.log(colorize(`  ❌ 失败: ${result.error}`, 'red'));
                results.failed++;
            }

            results.details.push(detail);

            // 避免请求过快
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // 生成报告
        generateReport();
    } catch (error) {
        console.error(colorize(`\n❌ 健康检查失败: ${error.message}`, 'red'));
        process.exit(1);
    } finally {
        // 清理：如果是我们启动的服务，则停止它
        if (serverProcess) {
            console.log(colorize('\n🛑 停止测试服务...', 'cyan'));
            serverProcess.kill();
        }
    }

    // 根据结果退出码
    const successRate = results.total > 0 ? results.success / results.total : 0;
    process.exit(successRate >= 0.7 ? 0 : 1);
}

// 运行主函数
if (require.main === module) {
    main().catch((error) => {
        console.error(colorize(`未处理的错误: ${error.message}`, 'red'));
        process.exit(1);
    });
}

module.exports = { testRoute, checkServerRunning };
