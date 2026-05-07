/**
 * 演示脚本 - 展示完整功能流程
 */

const membership = require('./handlers/membership');
const reward = require('./handlers/reward');

async function runDemo() {
  console.log('='.repeat(60));
  console.log('🦁 猎头加油站 - 完整功能演示');
  console.log('='.repeat(60));

  // 场景设置
  console.log('\n📋 场景设置：');
  console.log('- 发布者创建了技能并设置了会员价格');
  console.log('- 张三注册成为分销会员');
  console.log('- 张三推荐李四注册');
  console.log('- 李四升级为年卡会员');
  console.log('- 张三获得佣金奖励\n');

  // Step 1: 张三注册
  console.log('📌 Step 1: 张三注册');
  console.log('-'.repeat(40));
  const zhangsan = await membership.register({
    name: '张三',
    phone: '13800138001',
    wechat: 'zhangsan_hh'
  });
  console.log('✅ 注册成功！');
  console.log(`   用户ID: ${zhangsan.user.id}`);
  console.log(`   推荐码: ${zhangsan.user.referral_code}`);
  console.log(`   ${zhangsan.message}`);

  // Step 2: 李四通过张三的推荐码注册
  console.log('\n📌 Step 2: 李四通过张三的推荐注册');
  console.log('-'.repeat(40));
  const lisi = await membership.register({
    name: '李四',
    phone: '13800138002',
    wechat: 'lisi_hh',
    referrer: zhangsan.user.referral_code // 使用张三的推荐码
  });
  console.log('✅ 注册成功！');
  console.log(`   李四的推荐人: 张三`);

  // Step 3: 李四升级为年卡会员
  console.log('\n📌 Step 3: 李四升级为年卡会员');
  console.log('-'.repeat(40));
  const upgradeResult = await membership.upgrade('13800138002', 'yearly');
  console.log('✅ 升级成功！');
  console.log(`   ${upgradeResult.message}`);
  console.log(`   实际支付: ¥${upgradeResult.payment.actual_price}`);
  if (upgradeResult.payment.discount > 0) {
    console.log(`   推荐折扣: ¥${upgradeResult.payment.discount}`);
  }

  // Step 4: 张三查看收益
  console.log('\n📌 Step 4: 张三查看收益');
  console.log('-'.repeat(40));
  const zhangsanEarnings = await membership.getEarnings('13800138001');
  console.log('📊 收益概览:');
  console.log(`   累计收益: ¥${zhangsanEarnings.summary.total_earnings}`);
  console.log(`   可提现: ¥${zhangsanEarnings.summary.withdrawable}`);
  console.log(`   待确认: ¥${zhangsanEarnings.summary.pending}`);

  // Step 5: 张三查看推荐情况
  console.log('\n📌 Step 5: 张三查看推荐情况');
  console.log('-'.repeat(40));
  const zhangsanRefs = await membership.getReferrals('13800138001');
  console.log('👥 我的推荐:');
  console.log(`   推荐码: ${zhangsanRefs.my_referral_code}`);
  console.log(`   总推荐: ${zhangsanRefs.stats.total_referrals}人`);
  console.log(`   付费推荐: ${zhangsanRefs.stats.paid_referrals}人`);
  console.log(`   潜在收益: ¥${zhangsanRefs.stats.potential_earnings}`);

  // Step 6: 张三计算网络价值
  console.log('\n📌 Step 6: 张三的网络价值');
  console.log('-'.repeat(40));
  const networkValue = await reward.calculateNetworkValue(zhangsan.user.id);
  console.log('🌐 网络价值:');
  console.log(`   当前收益: ¥${networkValue.current}`);
  console.log(`   一级推荐: ${networkValue.level1.total}人 (付费${networkValue.level1.paid}人)`);
  console.log(`   一级潜在: ¥${networkValue.level1.potential}`);
  console.log(`   二级推荐: ${networkValue.level2.total}人 (付费${networkValue.level2.paid}人)`);
  console.log(`   二级潜在: ¥${networkValue.level2.potential}`);
  console.log(`   总潜在价值: ¥${networkValue.totalPotential}`);

  // Step 7: 张三申请提现
  console.log('\n📌 Step 7: 张三申请提现');
  console.log('-'.repeat(40));
  const withdrawResult = await membership.withdraw('13800138001', 100);
  if (withdrawResult.success) {
    console.log('✅ 提现申请成功！');
    console.log(`   提现金额: ¥${withdrawResult.withdrawal.amount}`);
    console.log(`   ${withdrawResult.message}`);
  }

  // Step 8: 张三的状态
  console.log('\n📌 Step 8: 张三的会员状态');
  console.log('-'.repeat(40));
  const zhangsanStatus = await membership.getStatus('13800138001');
  console.log('👤 会员状态:');
  console.log(`   姓名: ${zhangsanStatus.user.name}`);
  console.log(`   手机: ${zhangsanStatus.user.phone}`);
  console.log(`   等级: ${zhangsanStatus.user.level_name}`);
  console.log(`   注册时间: ${zhangsanStatus.user.member_since}`);

  // 佣金说明
  console.log('\n' + '='.repeat(60));
  console.log('💰 佣金分配说明:');
  console.log('='.repeat(60));
  console.log(`
李四购买年卡 ¥599：
├── 一级推荐人(张三)获得: ¥599 × 20% = ¥119.80
├── 二级推荐人(无)获得: ¥599 × 5% = ¥0
└── 平台收入: ¥599 - ¥119.80 = ¥479.20

如果李四再推荐王五购买终身会员 ¥1999：
├── 张三(二级)获得: ¥1999 × 5% = ¥99.95
├── 李四(一级)获得: ¥1999 × 20% = ¥399.80
└── 王五的上级(无)获得: ¥0
  `);

  console.log('🦁 演示结束！');
  console.log('='.repeat(60));
}

// 运行演示
runDemo().catch(console.error);
