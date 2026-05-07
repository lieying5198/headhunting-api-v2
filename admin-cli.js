/**
 * 管理员命令行工具
 */

const admin = require('./handlers/admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const commands = {
  '1': { name: 'members', desc: '会员列表' },
  '2': { name: 'member', desc: '会员详情', prompt: '输入手机号: ' },
  '3': { name: 'earnings', desc: '收益报告' },
  '4': { name: 'withdrawals', desc: '提现列表' },
  '5': { name: 'leaderboard', desc: '排行榜' },
  '6': { name: 'stats', desc: '统计数据' },
  '0': { name: 'exit', desc: '退出' }
};

function showMenu() {
  console.log('\n🦁 猎头加油站 - 管理员后台');
  console.log('='.repeat(40));
  Object.entries(commands).forEach(([key, cmd]) => {
    console.log(`  ${key}. ${cmd.desc}`);
  });
  console.log('='.repeat(40));
}

async function handleCommand(cmd) {
  const command = commands[cmd];
  
  if (!command) {
    console.log('无效的命令');
    return;
  }

  if (command.name === 'exit') {
    console.log('再见！');
    process.exit(0);
  }

  try {
    let result;
    
    if (command.prompt) {
      result = await askQuestion(command.prompt);
      result = await admin.handle(command.name, result);
    } else {
      result = await admin.handle(command.name, '');
    }

    console.log('\n📊 结果:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 主循环
async function main() {
  while (true) {
    showMenu();
    const answer = await askQuestion('\n请选择操作: ');
    await handleCommand(answer.trim());
  }
}

main().catch(console.error);
