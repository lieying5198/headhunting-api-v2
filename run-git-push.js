const { execSync } = require('child_process');
const path = require('path');

const projectPath = 'C:/Users/lieying/WorkBuddy/2026-05-07-task-2';

console.log('🚀 开始执行 Git 操作...\n');

try {
  // 1. git add .
  console.log('📦 执行: git add .');
  execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
  console.log('✅ 文件已添加到暂存区\n');

  // 2. 检查状态
  console.log('📋 Git 状态:');
  const status = execSync('git status', { cwd: projectPath, encoding: 'utf8' });
  console.log(status);

  // 3. git commit
  console.log('📝 执行: git commit');
  const commitMessage = 'feat: 猎头AI加油站 v1.0.0';
  execSync(`git commit -m "${commitMessage}"`, { cwd: projectPath, stdio: 'inherit' });
  console.log('✅ 提交成功\n');

  // 4. git push
  console.log('🚀 执行: git push -u origin main');
  console.log('请在弹出的浏览器窗口中完成 GitHub 认证...\n');
  execSync('git push -u origin main', { cwd: projectPath, stdio: 'inherit' });
  console.log('\n✅ 推送成功！');

} catch (error) {
  console.error('❌ 执行出错:', error.message);
  process.exit(1);
}
