#!/usr/bin/env node
/**
 * 猎头AI加油站 - GitHub Pages 推送脚本
 * 只推送 website 文件夹内容作为 GitHub Pages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectPath = 'C:/Users/lieying/WorkBuddy/2026-05-07-task-2';
const websitePath = path.join(projectPath, 'website');
const tempPagesPath = path.join(projectPath, '.gh-pages-temp');

const GH_REPO = 'git@github.com:lieying5198/headhunting-power-station.git';

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║     🦁 猎头AI加油站 - GitHub Pages 部署             ║');
console.log('╚══════════════════════════════════════════════════════╝');

function run(cmd, cwd) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

try {
  // 1. 检查 website 目录
  console.log('\n📂 检查 website 目录...');
  if (!fs.existsSync(websitePath)) {
    console.error('❌ website 目录不存在!');
    process.exit(1);
  }
  const files = fs.readdirSync(websitePath);
  console.log(`  找到 ${files.length} 个文件:`, files.join(', '));

  // 2. 清理旧临时目录
  console.log('\n🧹 清理旧临时目录...');
  if (fs.existsSync(tempPagesPath)) {
    fs.rmSync(tempPagesPath, { recursive: true });
  }

  // 3. 复制 website 到临时目录（作为 GitHub Pages 根目录）
  console.log('\n📋 复制 website 到临时目录...');
  fs.mkdirSync(tempPagesPath);
  
  files.forEach(file => {
    const src = path.join(websitePath, file);
    const dest = path.join(tempPagesPath, file);
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  });
  console.log('  ✅ 复制完成');

  // 4. 添加额外需要的文件（.nojekyll, CNAME 等）
  // 创建 .nojekyll 文件（重要！让 GitHub Pages 不使用 Jekyll）
  fs.writeFileSync(path.join(tempPagesPath, '.nojekyll'), '');
  
  // 5. 初始化 Git 仓库
  console.log('\n🔧 初始化 Git 仓库...');
  run('git init', tempPagesPath);
  run('git config user.name "lieying"', tempPagesPath);
  run('git config user.email "lieying5198@users.noreply.github.com"', tempPagesPath);

  // 6. 检查远程仓库
  console.log('\n🔗 检查远程仓库...');
  try {
    const remotes = run('git remote -v', tempPagesPath);
    console.log(remotes);
  } catch (e) {
    console.log('  添加远程仓库...');
    run(`git remote add origin ${GH_REPO}`, tempPagesPath);
  }

  // 7. 添加文件
  console.log('\n📦 添加文件到暂存区...');
  run('git add .', tempPagesPath);

  // 8. 检查状态
  console.log('\n📋 Git 状态:');
  const status = run('git status --short', tempPagesPath);
  console.log(status || '  (无变更)');

  // 9. 提交
  console.log('\n📝 提交代码...');
  try {
    run('git commit -m "feat: 猎头AI加油站 v1.0.0 - GitHub Pages 部署"', tempPagesPath);
    console.log('  ✅ 提交成功');
  } catch (e) {
    if (e.stdout && e.stdout.includes('nothing to commit')) {
      console.log('  ℹ️  没有新文件需要提交');
    } else {
      throw e;
    }
  }

  // 10. 推送到 GitHub
  console.log('\n🚀 推送到 GitHub...');
  try {
    // 先尝试从远程拉取（如果仓库已有内容）
    run('git pull origin master --rebase --allow-unrelated-histories', tempPagesPath);
  } catch (e) {
    // 可能是新仓库，忽略
    console.log('  (新仓库或无历史，跳过 pull)');
  }
  
  run('git push -u origin master --force', tempPagesPath);

  // 11. 清理
  console.log('\n🧹 清理临时目录...');
  fs.rmSync(tempPagesPath, { recursive: true });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ GitHub Pages 推送完成!');
  console.log('');
  console.log('📋 下一步操作:');
  console.log('   1. 访问: https://github.com/lieying5198/headhunting-power-station');
  console.log('   2. 点击 Settings → Pages');
  console.log('   3. Source 选择 "master" 分支');
  console.log('   4. 等待 2-5 分钟，网站将上线到:');
  console.log('      https://lieying5198.github.io/headhunting-power-station');
  console.log('');
  console.log('💡 如果需要自定义域名:');
  console.log('   在 website 目录创建 CNAME 文件写入你的域名');
  console.log('═══════════════════════════════════════════════════════');

} catch (error) {
  console.error('\n❌ 执行出错:', error.message);
  if (error.stderr) console.error('STDERR:', error.stderr);
  process.exit(1);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
