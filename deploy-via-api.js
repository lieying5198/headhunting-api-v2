#!/usr/bin/env node
/**
 * 猎头AI加油站 - GitHub API 部署脚本
 * 通过 GitHub API 上传 website 文件夹到仓库
 * 
 * 使用方法:
 *   node deploy-via-api.js <GITHUB_TOKEN>
 * 
 * 获取 Token: https://github.com/settings/tokens (需要 repo 权限)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============ 配置 =============
const OWNER = 'lieying5198';
const REPO = 'headhunting-power-station';
const WEBSITE_PATH = path.join(__dirname, 'website');
const BRANCH = 'main';

// 从命令行参数获取 Token
const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error('❌ 请提供 GitHub Token');
  console.error('   使用方法: node deploy-via-api.js <YOUR_GITHUB_TOKEN>');
  console.error('');
  console.error('   获取 Token: https://github.com/settings/tokens');
  console.error('   权限: repo (全部)');
  process.exit(1);
}

// ============ GitHub API 工具 =============
function githubApi(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Headhunting-Deploy-Script',
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ============ 文件处理 =============
function getAllFiles(dir, basePath = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else {
      // 跳过 .gitkeep 和隐藏文件
      if (!entry.name.startsWith('.')) {
        files.push({ path: relativePath, fullPath });
      }
    }
  }
  return files;
}

function readFileBase64(filePath) {
  const content = fs.readFileSync(filePath);
  // 移除换行符，生成纯 base64
  return content.toString('base64').replace(/\n/g, '');
}

// ============ 获取文件的 SHA =============
async function getFileSha(filePath) {
  try {
    const result = await githubApi(
      'GET',
      `/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`
    );
    if (result.status === 200 && result.data.sha) {
      return result.data.sha;
    }
  } catch (e) {
    // 文件不存在，返回 null
  }
  return null;
}

// ============ 上传文件 =============
async function uploadFile(filePath, content, sha = null) {
  const payload = {
    message: `feat: upload ${filePath}`,
    content: content,
    branch: BRANCH
  };
  if (sha) payload.sha = sha;

  const result = await githubApi('PUT', `/repos/${OWNER}/${REPO}/contents/${filePath}`, payload);
  
  if (result.status === 200 || result.status === 201) {
    return { success: true };
  } else if (result.status === 422 && result.data?.errors?.[0]?.message?.includes('already exists')) {
    console.error(`  ⚠️  ${filePath} 需要 SHA，请重试`);
    return { success: false, needSha: true };
  } else {
    return { success: false, error: result.data?.message || 'Unknown error' };
  }
}

// ============ 主流程 =============
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🦁 猎头AI加油站 - GitHub API 部署                    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📂 仓库: ${OWNER}/${REPO}`);
  console.log(`🌿 分支: ${BRANCH}`);
  console.log(`📁 源目录: ${WEBSITE_PATH}`);
  console.log('');

  // 1. 检查 website 目录
  if (!fs.existsSync(WEBSITE_PATH)) {
    console.error('❌ website 目录不存在!');
    process.exit(1);
  }

  // 2. 获取所有文件
  const files = getAllFiles(WEBSITE_PATH);
  console.log(`📦 发现 ${files.length} 个文件待上传`);
  files.forEach(f => console.log(`   - ${f.path}`));
  console.log('');

  // 3. 预获取所有 SHA（避免逐个上传时 422 错误）
  console.log('🔍 预获取文件 SHA...');
  const shaMap = {};
  for (const file of files) {
    const sha = await getFileSha(file.path);
    if (sha) {
      shaMap[file.path] = sha;
      console.log(`   ✓ ${file.path} (已有 SHA: ${sha.substring(0, 7)}...)`);
    } else {
      console.log(`   ○ ${file.path} (新文件)`);
    }
    await new Promise(r => setTimeout(r, 100)); // 避免 API 限流
  }

  // 4. 上传文件
  console.log('\n🚀 开始上传文件...');
  let uploaded = 0;
  let failed = 0;
  const failedFiles = [];

  for (const file of files) {
    process.stdout.write(`\r   上传中: ${file.path}...`);
    
    const content = readFileBase64(file.fullPath);
    const sha = shaMap[file.path] || null;
    const result = await uploadFile(file.path, content, sha);

    if (result.success) {
      uploaded++;
      console.log(`\r   ✅ ${file.path}`);
    } else {
      failed++;
      failedFiles.push({ path: file.path, error: result.error });
      console.log(`\r   ❌ ${file.path}: ${result.error}`);
    }

    await new Promise(r => setTimeout(r, 200)); // 避免 API 限流
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ 部署完成！成功: ${uploaded}, 失败: ${failed}`);
  console.log('═══════════════════════════════════════════════════════');

  if (failed > 0) {
    console.log('\n❌ 失败的文件:');
    failedFiles.forEach(f => console.log(`   - ${f.path}: ${f.error}`));
  }

  console.log('');
  console.log('📋 下一步:');
  console.log('   1. 访问: https://github.com/lieying5198/headhunting-power-station/settings/pages');
  console.log('   2. Source 选择 "master" 分支');
  console.log('   3. 等待 2-5 分钟');
  console.log('   4. 访问: https://lieying5198.github.io/headhunting-power-station');
  console.log('');
  console.log('💡 然后编辑 website/app.js 第7行，填入 Cloudflare Workers 地址');
}

main().catch(console.error);
