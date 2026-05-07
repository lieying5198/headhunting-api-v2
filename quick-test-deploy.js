/**
 * 快速部署和测试脚本
 */

const { execSync } = require('child_process');
const https = require('https');

const API_URL = 'https://headhunting-api.lieying5198.workers.dev';

async function runCommand(cmd) {
  console.log(`\n> ${cmd}`);
  try {
    const result = execSync(cmd, { cwd: __dirname, encoding: 'utf-8' });
    console.log(result);
    return result;
  } catch (e) {
    console.error('命令执行失败:', e.message);
    return null;
  }
}

async function testEndpoint(url) {
  return new Promise((resolve) => {
    console.log(`\n🧪 测试: ${url}`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          console.log(`状态码: ${res.statusCode}`);
          console.log('响应:', data.substring(0, 500));
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          console.log('响应:', data.substring(0, 500));
          resolve({ status: res.statusCode, data: null });
        }
      });
    }).on('error', (e) => {
      console.error('请求失败:', e.message);
      resolve({ status: 0, error: e.message });
    });
  });
}

async function main() {
  console.log('========================================');
  console.log('  猎头能量站 - API 部署与测试');
  console.log('========================================');

  // 1. 部署
  console.log('\n📦 步骤1: 部署到 Cloudflare Workers...');
  await runCommand('npx wrangler deploy --env production');

  // 等待部署生效
  console.log('\n⏳ 等待30秒让部署生效...');
  await new Promise(r => setTimeout(r, 30000));

  // 2. 测试端点
  console.log('\n========================================');
  console.log('  API 功能测试');
  console.log('========================================');

  const tests = [
    `${API_URL}/api/health`,
    `${API_URL}/api/public/stats`,
    `${API_URL}/api/public/home`,
  ];

  for (const url of tests) {
    await testEndpoint(url);
  }

  console.log('\n========================================');
  console.log('  测试完成');
  console.log('========================================');
}

main().catch(console.error);
