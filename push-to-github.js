#!/usr/bin/env node
/**
 * 猎头AI加油站 - Git 推送脚本
 * 执行 git add, commit, push 操作
 */

const { execSync } = require('child_process');
const path = require('path');

const projectPath = 'C:/Users/lieying/WorkBuddy/2026-05-07-task-2';

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║         🦁 猎头AI加油站 - Git 推送                 ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

try {
  // 1. 设置工作目录
  console.log('📂 工作目录:', projectPath);
  
  // 2. 检查远程仓库
  console.log('\n🔗 检查远程仓库...');
  try {
    const remotes = execSync('git remote -v', { cwd: projectPath, encoding: 'utf8' });
    console.log(remotes);
  } catch (e) {
    console.log('添加远程仓库...');
    execSync('git remote add origin git@github.com:lieying5198/headhunting-power-station.git', { cwd: projectPath, stdio: 'inherit' });
  }

  // 3. 添加文件到暂存区
  console.log('\n📦 添加文件到暂存区...');
  execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
  console.log('✅ 文件已添加\n');

  // 4. 检查状态
  console.log('📋 Git 状态:');
  const status = execSync('git status', { cwd: projectPath, encoding: 'utf8' });
  console.log(status);

  // 5. 提交
  console.log('📝 提交代码...');
  const commitMessage = 'feat: 猎头AI加油站 v1.0.0 - 正式发布';
  try {
    execSync(`git commit -m "${commitMessage}"`, { cwd: projectPath, stdio: 'inherit' });
    console.log('✅ 提交成功\n');
  } catch (e) {
    if (e.message.includes('nothing to commit')) {
      console.log('ℹ️  没有新文件需要提交\n');
    } else {
      throw e;
    }
  }

  // 6. 推送到 GitHub
  console.log('🚀 推送到 GitHub...');
  console.log('分支: master\n');
  execSync('git push -u origin master', { cwd: projectPath, stdio: 'inherit' });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ 推送完成！');
  console.log('');
  console.log('📋 下一步操作:');
  console.log('   1. 访问: https://github.com/lieying5198/headhunting-power-station');
  console.log('   2. 点击 Settings → Pages');
  console.log('   3. Source 选择 "master" 分支');
  console.log('   4. 等待 1-2 分钟，网站将上线到:');
  console.log('      https://lieying5198.github.io/headhunting-power-station');
  console.log('═══════════════════════════════════════════════════════');

} catch (error) {
  console.error('\n❌ 执行出错:', error.message);
  console.error('\n请确保:');
  console.error('   1. 已配置 GitHub SSH 密钥');
  console.error('   2. SSH 密钥已添加到 GitHub 账户');
  console.error('   参考: https://github.com/settings/keys');
  process.exit(1);
}
