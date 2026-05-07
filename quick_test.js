/**
 * 快速测试脚本 - 验证核心功能
 */

const membership = require('./handlers/membership');
const reward = require('./handlers/reward');
const admin = require('./handlers/admin');

async function runTests() {
  console.log('🧪 开始测试...\n');

  // 测试1: 注册用户
  console.log('📝 测试1: 注册用户');
  const user1 = await membership.register({
    name: '张三',
    phone: '13800138001',
    wechat: 'zhangsan',
    referrer: null
  });
  console.log('注册结果:', JSON.stringify(user1, null, 2));
  if (!user1.success) throw new Error('测试1失败: ' + user1.error);

  // 测试2: 注册推荐人
  console.log('\n📝 测试2: 注册推荐人');
  const user2 = await membership.register({
    name: '李四',
    phone: '13800138002',
    wechat: 'lisi',
    referrer: null
  });
  console.log('注册结果:', JSON.stringify(user2, null, 2));
  if (!user2.success) throw new Error('测试2失败: ' + user2.error);

  // 测试3: 注册被推荐人
  console.log('\n📝 测试3: 注册被推荐人');
  const user3 = await membership.register({
    name: '王五',
    phone: '13800138003',
    wechat: 'wangwu',
    referrer: '13800138002'
  });
  console.log('注册结果:', JSON.stringify(user3, null, 2));
  if (!user3.success) throw new Error('测试3失败: ' + user3.error);

  // 测试4: 检查用户状态
  console.log('\n📝 测试4: 查看用户状态');
  const status = await membership.getStatus('13800138001');
  console.log('状态:', JSON.stringify(status, null, 2));
  if (!status.success) throw new Error('测试4失败: ' + status.error);

  // 测试5: 升级会员
  console.log('\n📝 测试5: 升级会员');
  const upgrade = await membership.upgrade('13800138003', 'yearly');
  console.log('升级结果:', JSON.stringify(upgrade, null, 2));
  if (!upgrade.success) throw new Error('测试5失败: ' + upgrade.error);

  // 验证升级包含微信支付和退款政策
  if (!upgrade.payment || upgrade.payment.method !== '微信支付') {
    throw new Error('测试5失败: 支付方式应为微信支付');
  }
  if (!upgrade.message.includes('不予退费')) {
    throw new Error('测试5失败: 升级消息应包含退款政策提示');
  }

  // 测试6: 查看推荐人
  console.log('\n📝 测试6: 查看推荐人');
  const referrals = await membership.getReferrals('13800138002');
  console.log('推荐情况:', JSON.stringify(referrals, null, 2));
  if (!referrals.success) throw new Error('测试6失败: ' + referrals.error);

  // 测试7: 查看收益
  console.log('\n📝 测试7: 查看收益');
  const earnings = await membership.getEarnings('13800138002');
  console.log('收益情况:', JSON.stringify(earnings, null, 2));
  if (!earnings.success) throw new Error('测试7失败: ' + earnings.error);

  // 测试8: 计算网络价值
  console.log('\n📝 测试8: 计算网络价值');
  const network = await reward.calculateNetworkValue('13800138002');
  console.log('网络价值:', JSON.stringify(network, null, 2));
  if (!network) throw new Error('测试8失败: 无法计算网络价值');

  // 测试9: 申请提现（金额不足100）
  console.log('\n📝 测试9: 申请提现（测试最低金额限制）');
  const withdraw = await membership.withdraw('13800138002', 50);
  console.log('提现结果:', JSON.stringify(withdraw, null, 2));
  if (withdraw.success) throw new Error('测试9失败: 金额低于100应失败');

  // 测试10: 管理员功能
  console.log('\n📝 测试10: 管理员功能');
  const members = await admin.handle('members', 'level=yearly');
  console.log('会员列表:', JSON.stringify(members, null, 2));
  if (!members.success) throw new Error('测试10失败: ' + members.error);

  // 测试11: 统计概览
  console.log('\n📝 测试11: 统计概览');
  const stats = await admin.handle('stats', '');
  console.log('统计:', JSON.stringify(stats, null, 2));
  if (!stats.success) throw new Error('测试11失败: ' + stats.error);

  // 测试12: 排行榜
  console.log('\n📝 测试12: 收益排行榜');
  const leaderboard = await admin.handle('leaderboard', 'type=earnings');
  console.log('排行榜:', JSON.stringify(leaderboard, null, 2));
  if (!leaderboard.success) throw new Error('测试12失败: ' + leaderboard.error);

  console.log('\n✅ 所有测试通过！');
}

// 运行测试
runTests().catch(err => {
  console.error('\n❌ 测试失败:', err.message);
  process.exit(1);
});
