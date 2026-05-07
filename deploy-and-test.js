/**
 * Node.js 部署和测试脚本
 */
const { execSync } = require('child_process');

const API_URL = 'https://headhunting-api.lieying5198.workers.dev';

function runCommand(cmd, cwd = __dirname) {
  console.log(`\n> ${cmd}`);
  try {
    const result = execSync(cmd, { 
      cwd, 
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    return true;
  } catch (e) {
    console.error('命令执行失败:', e.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('  猎头能量站 - API 部署与测试');
  console.log('========================================');

  // 1. 部署
  console.log('\n📦 步骤1: 部署到 Cloudflare Workers...');
  const deployed = runCommand('npx wrangler deploy --env production');
  
  if (!deployed) {
    console.log('\n尝试不使用 --env 参数...');
    runCommand('npx wrangler deploy');
  }

  console.log('\n========================================');
  console.log('  请手动测试以下端点:');
  console.log('========================================');
  console.log(`\n🌐 API 地址: ${API_URL}`);
  console.log('\n测试端点:');
  console.log(`  1. 健康检查: ${API_URL}/api/health`);
  console.log(`  2. 统计数据: ${API_URL}/api/public/stats`);
  console.log(`  3. 首页数据: ${API_URL}/api/public/home`);
  console.log(`  4. 文章列表: ${API_URL}/api/articles`);
  console.log('\n========================================');
}

main().catch(console.error);
