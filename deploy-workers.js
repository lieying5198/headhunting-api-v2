const { execSync } = require('child_process');
const path = require('path');

const workspace = 'C:\\Users\\lieying\\WorkBuddy\\2026-05-07-task-2';

try {
  console.log('🚀 开始部署 Workers...');
  console.log('='.repeat(50));

  process.chdir(workspace);
  console.log(`工作目录: ${process.cwd()}`);

  // 执行部署命令
  const result = execSync('npx wrangler deploy --env production', {
    encoding: 'utf-8',
    stdio: 'pipe',
    cwd: workspace,
    timeout: 180000 // 3分钟超时
  });

  console.log('\n✅ 部署成功!');
  console.log('='.repeat(50));
  console.log(result);

} catch (error) {
  console.error('\n❌ 部署失败!');
  console.error('='.repeat(50));
  if (error.stdout) console.log('STDOUT:', error.stdout);
  if (error.stderr) console.error('STDERR:', error.stderr);
  console.error('Error:', error.message);
  process.exit(1);
}
