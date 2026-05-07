/**
 * 猎头加油站 - 主入口
 * Headhunting Power Station - Main Entry
 */

const commandRouter = require('./handlers/commands');
const membership = require('./handlers/membership');

/**
 * Skill 主处理函数
 * @param {Object} input - 用户输入
 * @param {Object} context - 上下文信息
 * @returns {Object} 处理结果
 */
async function handler(input, context) {
  const { command, args } = input;
  const userContext = {
    user_id: context.user_id,
    phone: context.phone || null,
    platform: context.platform
  };

  // 记录日志
  console.log(`[Skill] Command: ${command}, User: ${userContext.phone || 'anonymous'}`);

  // 路由命令
  return await commandRouter.route(command, args, userContext);
}

/**
 * Skill 初始化函数
 * @param {Object} config - 技能配置
 */
async function initialize(config) {
  console.log('[Skill] Initializing Headhunting Power Station...');
  
  // 初始化数据库
  const db = require('./handlers/database');
  
  // 检查是否需要创建示例数据
  const users = await db.getAllUsers();
  if (users.length === 0) {
    console.log('[Skill] Initializing sample data...');
    await initializeSampleData();
  }
  
  console.log('[Skill] Initialization complete.');
}

/**
 * 初始化示例数据
 */
async function initializeSampleData() {
  const membership = require('./handlers/membership');
  
  // 创建演示用户
  await membership.register({
    name: '演示用户',
    phone: '13800138000',
    wechat: 'demo_user',
    referrer: null
  });
}

// Skill 元数据
const metadata = {
  id: 'headhunting-power-station',
  name: '🦁 猎头加油站',
  version: '1.0.0',
  description: '猎头全方位能力提升与精准交付赋能系统',
  commands: [
    { name: 'help', desc: '显示帮助' },
    { name: 'search', desc: '搜索知识库' },
    { name: 'jdanalyze', desc: 'JD深度解析' },
    { name: 'candidate', desc: '候选人评估' },
    { name: 'match', desc: '精准匹配' },
    { name: 'insight', desc: '行业洞察' },
    { name: 'daily', desc: '每日资讯' },
    { name: 'register', desc: '注册会员' },
    { name: 'upgrade', desc: '升级会员' },
    { name: 'status', desc: '会员状态' },
    { name: 'referrals', desc: '推荐人' },
    { name: 'earnings', desc: '收益明细' },
    { name: 'withdraw', desc: '申请提现' }
  ],
  permissions: ['ima_knowledge', 'ima_search', 'web_search'],
  limits: {
    free: { daily_requests: 3 },
    pro: { daily_requests: -1 }
  },
  pricing: {
    monthly: 99,
    yearly: 599,
    lifetime: 1999
  },
  distribution: {
    level1_rate: 0.20,
    level2_rate: 0.05
  }
};

// 导出
module.exports = {
  handler,
  initialize,
  metadata
};

// 如果直接运行，显示帮助信息
if (require.main === module) {
  console.log('\n🦁 猎头加油站 - Headhunting Power Station');
  console.log('='.repeat(50));
  console.log('Version:', metadata.version);
  console.log('Description:', metadata.description);
  console.log('\nAvailable Commands:');
  metadata.commands.forEach(cmd => {
    console.log(`  /${cmd.name.padEnd(15)} - ${cmd.desc}`);
  });
  console.log('\nPricing:');
  console.log('  Monthly: ¥99');
  console.log('  Yearly: ¥599');
  console.log('  Lifetime: ¥1999');
  console.log('\nDistribution:');
  console.log('  Level 1: 20% commission');
  console.log('  Level 2: 5% commission');
  console.log('\n' + '='.repeat(50));
}
