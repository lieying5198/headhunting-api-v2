/**
 * Cloudflare Workers API 入口
 * 猎头能量站 - 后端服务
 */

const router = {
  // 认证相关
  'POST /api/auth/register': handleRegister,
  'POST /api/auth/login': handleLogin,
  'POST /api/auth/logout': handleLogout,
  // 'POST /api/auth/forgot': handleForgotPassword, // TODO: 待实现
  'GET /api/auth/profile': handleGetProfile,
  'PUT /api/auth/profile': handleUpdateProfile,
  // 'POST /api/auth/change-password': handleChangePassword, // TODO: 待实现
  
  // 微信相关
  'POST /api/wechat/login': handleWechatLogin,
  'GET /api/wechat/config': handleWechatConfig,
  
  // VIP与积分
  'GET /api/vip/status': handleVipStatus,
  'GET /api/points/balance': handlePointsBalance,
  'GET /api/points/logs': handlePointsLogs,
  'POST /api/points/sign-in': handleSignIn,
  'GET /api/points/tasks': handleDailyTasks,
  'POST /api/points/tasks/:key/complete': handleCompleteTask,
  
  // 邀请分销
  'GET /api/invite/code': handleGetInviteCode,
  'GET /api/invite/stats': handleInviteStats,
  'GET /api/invite/history': handleInviteHistory,
  
  // 订单与支付
  'POST /api/order/create': handleCreateOrder,
  'GET /api/order/:id': handleGetOrder,
  'GET /api/order/list': handleOrderList,
  'POST /api/order/pay': handlePayOrder,
  'POST /api/order/callback/wechat': handleWechatCallback,
  'POST /api/order/callback/alipay': handleAlipayCallback,
  
  // 内容
  'GET /api/articles': handleArticleList,
  'GET /api/articles/:id': handleArticleDetail,
  'GET /api/articles/category/:category': handleCategoryArticles,
  'POST /api/articles/:id/view': handleArticleView,
  'POST /api/articles/:id/like': handleArticleLike,
  'GET /api/articles/featured': handleFeaturedArticles,
  
  // 收藏
  'GET /api/favorites': handleFavorites,
  'POST /api/favorites/:articleId': handleAddFavorite,
  'DELETE /api/favorites/:articleId': handleRemoveFavorite,
  
  // 公开数据
  'GET /api/public/stats': handlePublicStats,
  'GET /api/public/home': handleHomeData,
  'GET /api/health': handleHealth,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // 处理 OPTIONS 预检
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 查找匹配的路由
    const routeKey = `${method} ${path}`;
    const handler = router[routeKey];
    
    if (handler) {
      try {
        const response = await handler(request, env, ctx);
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message || '服务器错误' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // 通配符路由匹配
    for (const [pattern, handler] of Object.entries(router)) {
      const [pmethod, ppath] = pattern.split(' ');
      if (method === pmethod && matchPath(ppath, path)) {
        try {
          const response = await handler(request, env, ctx, extractParams(ppath, path));
          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message || '服务器错误' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: '接口不存在' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

// 路径匹配
function matchPath(pattern, path) {
  const regex = pattern.replace(/:[^/]+/g, '[^/]+');
  return new RegExp(`^${regex}$`).test(path);
}

// 提取参数
function extractParams(pattern, path) {
  const params = {};
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  patternParts.forEach((part, i) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[i];
    }
  });
  
  return params;
}

// 工具函数
async function getDb(env) {
  return env.DB;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function hashPassword(password) {
  // 简单哈希，生产环境应使用bcrypt
  // 这里使用Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'headhunting_salt_2024');
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function generateOrderNo() {
  return 'H' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============ 认证接口 ============

async function handleRegister(request, env) {
  const { username, email, password, invite_code } = await request.json();
  
  if (!username || !email || !password) {
    throw new Error('请填写完整信息');
  }
  
  const db = await getDb(env);
  const id = generateId();
  const now = Date.now();
  const password_hash = hashPassword(password);
  const myInviteCode = generateInviteCode();
  
  // 检查是否使用邀请码
  let inviterId = null;
  if (invite_code) {
    const inviter = await db.prepare(
      'SELECT id FROM users WHERE invite_code = ?'
    ).bind(invite_code).first();
    if (inviter) {
      inviterId = inviter.id;
    }
  }
  
  // 创建用户
  await db.prepare(`
    INSERT INTO users (id, username, email, password_hash, invite_code, invited_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, username, email, password_hash, myInviteCode, inviterId, now, now).run();
  
  // 如果有邀请人，给邀请人加积分
  if (inviterId) {
    const invitePoints = 50; // 邀请奖励50积分
    await db.prepare(`
      UPDATE users SET 
        points = points + ?, 
        total_points = total_points + ?,
        total_invites = total_invites + 1
      WHERE id = ?
    `).bind(invitePoints, invitePoints, inviterId).run();
    
    // 记录积分日志
    await db.prepare(`
      INSERT INTO point_logs (id, user_id, action, points, description, created_at)
      VALUES (?, ?, 'invite_bonus', ?, '邀请好友奖励', ?)
    `).bind(generateId(), inviterId, invitePoints, now).run();
    
    // 记录邀请关系
    await db.prepare(`
      INSERT INTO invites (id, inviter_id, invited_id, level, reward_points, created_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `).bind(generateId(), inviterId, id, invitePoints, now).run();
  }
  
  // 生成token (简化版，实际应该用JWT)
  const token = generateId() + generateId();
  
  // 存入KV
  await env.KV.put(`token:${token}`, id, { expirationTtl: 86400 * 7 }); // 7天过期
  
  return {
    success: true,
    data: {
      token,
      user: { id, username, email, vip_level: 0, points: 0, invite_code: myInviteCode }
    }
  };
}

async function handleLogin(request, env) {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    throw new Error('请填写邮箱和密码');
  }
  
  const db = await getDb(env);
  const user = await db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new Error('邮箱或密码错误');
  }
  
  if (user.status === 0) {
    throw new Error('账号已被禁用');
  }
  
  const token = generateId() + generateId();
  await env.KV.put(`token:${token}`, user.id, { expirationTtl: 86400 * 7 });
  
  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        vip_level: user.vip_level,
        vip_expire_at: user.vip_expire_at,
        points: user.points,
        invite_code: user.invite_code,
        total_invites: user.total_invites
      }
    }
  };
}

async function handleLogout(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    await env.KV.delete(`token:${token}`);
  }
  return { success: true };
}

async function handleGetProfile(request, env) {
  const user = await authenticate(request, env);
  return { success: true, data: { user } };
}

async function handleUpdateProfile(request, env) {
  const user = await authenticate(request, env);
  const { username, phone } = await request.json();
  const db = await getDb(env);
  const now = Date.now();
  
  await db.prepare(`
    UPDATE users SET username = COALESCE(?, username), phone = COALESCE(?, phone), updated_at = ?
    WHERE id = ?
  `).bind(username, phone, now, user.id).run();
  
  return { success: true, message: '更新成功' };
}

// 中间件：验证登录
async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('请先登录');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const userId = await env.KV.get(`token:${token}`);
  
  if (!userId) {
    throw new Error('登录已过期');
  }
  
  const db = await getDb(env);
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  
  if (!user) {
    throw new Error('用户不存在');
  }
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    vip_level: user.vip_level,
    vip_expire_at: user.vip_expire_at,
    points: user.points,
    invite_code: user.invite_code,
    total_invites: user.total_invites,
    total_points: user.total_points
  };
}

// ============ VIP与积分接口 ============

async function handleVipStatus(request, env) {
  const user = await authenticate(request, env);
  
  let isVip = false;
  if (user.vip_level > 0) {
    if (!user.vip_expire_at || user.vip_expire_at > Date.now()) {
      isVip = true;
    }
  }
  
  return {
    success: true,
    data: {
      vip_level: user.vip_level,
      is_vip: isVip,
      expire_at: user.vip_expire_at,
      products: [
        { id: 'vip_month', name: '月度VIP', price: 99, period: 30, features: ['全部课程', '专属群聊', '优先推荐'] },
        { id: 'vip_year', name: '年度VIP', price: 599, period: 365, features: ['全部课程', '专属群聊', '优先推荐', '8折优惠'] },
        { id: 'vip_permanent', name: '永久VIP', price: 1999, period: 9999, features: ['全部课程', '专属群聊', '优先推荐', '永久有效', '专属顾问'] },
      ]
    }
  };
}

async function handlePointsBalance(request, env) {
  const user = await authenticate(request, env);
  return { success: true, data: { points: user.points, total_points: user.total_points } };
}

async function handlePointsLogs(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  const logs = await db.prepare(`
    SELECT * FROM point_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).bind(user.id).all();
  
  return { success: true, data: { logs: logs.results } };
}

async function handleSignIn(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  // 检查今天是否签到
  const todaySign = await db.prepare(
    'SELECT * FROM sign_ins WHERE user_id = ? AND date = ?'
  ).bind(user.id, today).first();
  
  if (todaySign) {
    throw new Error('今天已签到');
  }
  
  // 连续签到奖励
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yesterdaySign = await db.prepare(
    'SELECT * FROM sign_ins WHERE user_id = ? AND date = ?'
  ).bind(user.id, yesterday).first();
  
  let points = 5; // 基础5积分
  let连续天数 = 1;
  
  if (yesterdaySign) {
    连续天数 = yesterdaySign.days + 1 || 2;
    // 连续7天额外奖励
    if (连续天数 >= 7) {
      points = 15;
    } else if (连续天数 >= 3) {
      points = 10;
    }
  }
  
  // 插入签到记录
  await db.prepare(`
    INSERT INTO sign_ins (id, user_id, date, points, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(generateId(), user.id, today, points, now).run();
  
  // 更新用户积分
  await db.prepare(`
    UPDATE users SET points = points + ?, total_points = total_points + ? WHERE id = ?
  `).bind(points, points, user.id).run();
  
  // 记录日志
  await db.prepare(`
    INSERT INTO point_logs (id, user_id, action, points, description, created_at)
    VALUES (?, ?, 'sign_in', ?, ?, ?)
  `).bind(generateId(), user.id, points, `签到奖励${连续天数 > 1 ? '(连续' + 连续天数 + '天)' : ''}`, now).run();
  
  return { 
    success: true, 
    data: { 
      points, 
      total_points: user.points + points,
      sign_days: 连续天数,
      message: `签到成功，获得${points}积分`
    } 
  };
}

async function handleDailyTasks(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  const today = new Date().toISOString().split('T')[0];
  
  const tasks = [
    { key: 'sign_in', name: '每日签到', points: 5, icon: '📅' },
    { key: 'share', name: '分享文章', points: 3, icon: '📤' },
    { key: 'invite', name: '邀请好友', points: 50, icon: '👥' },
    { key: 'view_articles', name: '阅读文章', points: 2, icon: '📖' },
  ];
  
  const completedTasks = await db.prepare(
    'SELECT task_key FROM daily_tasks WHERE user_id = ? AND date = ?'
  ).bind(user.id, today).all();
  
  const completedKeys = completedTasks.results.map(r => r.task_key);
  
  return { 
    success: true, 
    data: { 
      tasks: tasks.map(t => ({
        ...t,
        completed: completedKeys.includes(t.key)
      })),
      total_points: user.points
    } 
  };
}

async function handleCompleteTask(request, env, params) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const taskKey = params.key;
  
  // 任务配置
  const taskConfig = {
    'sign_in': { points: 5, name: '每日签到' },
    'share': { points: 3, name: '分享文章' },
    'invite': { points: 50, name: '邀请好友' },
    'view_articles': { points: 2, name: '阅读文章' },
  };
  
  if (!taskConfig[taskKey]) {
    throw new Error('任务不存在');
  }
  
  // 检查今天是否已完成
  const existing = await db.prepare(
    'SELECT * FROM daily_tasks WHERE user_id = ? AND task_key = ? AND date = ?'
  ).bind(user.id, taskKey, today).first();
  
  if (existing) {
    throw new Error('今日已完成');
  }
  
  const task = taskConfig[taskKey];
  
  // 标记完成
  await db.prepare(`
    INSERT INTO daily_tasks (id, user_id, task_key, completed_at, date)
    VALUES (?, ?, ?, ?, ?)
  `).bind(generateId(), user.id, taskKey, now, today).run();
  
  // 发放积分
  await db.prepare(`
    UPDATE users SET points = points + ?, total_points = total_points + ? WHERE id = ?
  `).bind(task.points, task.points, user.id).run();
  
  await db.prepare(`
    INSERT INTO point_logs (id, user_id, action, points, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(generateId(), user.id, taskKey + '_task', task.points, task.name + '奖励', now).run();
  
  return { success: true, data: { points: task.points } };
}

// ============ 邀请分销接口 ============

async function handleGetInviteCode(request, env) {
  const user = await authenticate(request, env);
  return { 
    success: true, 
    data: { 
      invite_code: user.invite_code,
      share_url: `https://lieying5198.github.io/headhunting-power-station/?invite=${user.invite_code}`,
      share_title: '猎头能量站 - 加入一起成长',
      share_desc: '免费获得专业课程和资源，还有积分奖励！'
    } 
  };
}

async function handleInviteStats(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  // 统计各层级邀请
  const stats = await db.prepare(`
    SELECT level, COUNT(*) as count, SUM(reward_points) as points 
    FROM invites WHERE inviter_id = ? GROUP BY level
  `).bind(user.id).all();
  
  // 计算佣金
  const orders = await db.prepare(`
    SELECT SUM(commission_level1) as c1, SUM(commission_level2) as c2, SUM(commission_level3) as c3
    FROM orders WHERE pay_status = 1 AND invited_by = ?
  `).bind(user.id).first();
  
  return {
    success: true,
    data: {
      total_invites: user.total_invites,
      total_points: stats.results.reduce((sum, r) => sum + (r.points || 0), 0),
      by_level: stats.results,
      commissions: {
        total: (orders.c1 || 0) + (orders.c2 || 0) + (orders.c3 || 0),
        withdrawable: (orders.c1 || 0) + (orders.c2 || 0) + (orders.c3 || 0)
      },
      levels: [
        { level: 1, reward: '10%佣金+50积分', name: '一级好友' },
        { level: 2, reward: '5%佣金', name: '二级好友' },
        { level: 3, reward: '2%佣金', name: '三级好友' },
      ]
    }
  };
}

async function handleInviteHistory(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  const history = await db.prepare(`
    SELECT i.*, u.username, u.created_at as invited_time
    FROM invites i
    JOIN users u ON i.invited_id = u.id
    WHERE i.inviter_id = ?
    ORDER BY i.created_at DESC
    LIMIT 50
  `).bind(user.id).all();
  
  return { success: true, data: { history: history.results } };
}

// ============ 订单与支付接口 ============

async function handleCreateOrder(request, env) {
  const user = await authenticate(request, env);
  const { product_type } = await request.json();
  
  const products = {
    'vip_month': { name: '月度VIP', amount: 9900, period: 30 },
    'vip_year': { name: '年度VIP', amount: 59900, period: 365 },
    'vip_permanent': { name: '永久VIP', amount: 199900, period: 9999 },
  };
  
  if (!products[product_type]) {
    throw new Error('产品不存在');
  }
  
  const product = products[product_type];
  const db = await getDb(env);
  const now = Date.now();
  const id = generateId();
  const orderNo = generateOrderNo();
  
  await db.prepare(`
    INSERT INTO orders (id, user_id, order_no, product_type, product_name, amount, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, user.id, orderNo, product_type, product.name, product.amount, now, now).run();
  
  return {
    success: true,
    data: {
      order_id: id,
      order_no: orderNo,
      amount: product.amount,
      name: product.name,
      pay_url: `/pay?order=${orderNo}` // 前端跳转支付页
    }
  };
}

async function handleGetOrder(request, env, params) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  const order = await db.prepare(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?'
  ).bind(params.id, user.id).first();
  
  if (!order) {
    throw new Error('订单不存在');
  }
  
  return { success: true, data: { order } };
}

async function handleOrderList(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  const orders = await db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).bind(user.id).all();
  
  return { success: true, data: { orders: orders.results } };
}

// 模拟支付成功回调
async function handlePayOrder(request, env) {
  const user = await authenticate(request, env);
  const { order_id, pay_method } = await request.json();
  const db = await getDb(env);
  const now = Date.now();
  
  const order = await db.prepare(
    'SELECT * FROM orders WHERE id = ? AND user_id = ? AND pay_status = 0'
  ).bind(order_id, user.id).first();
  
  if (!order) {
    throw new Error('订单不存在或已支付');
  }
  
  // 模拟支付成功
  await db.prepare(`
    UPDATE orders SET pay_status = 1, pay_method = ?, pay_time = ?, updated_at = ? WHERE id = ?
  `).bind(pay_method || 'simulated', now, now, order_id).run();
  
  // 开通VIP或发放积分
  const vipProducts = ['vip_month', 'vip_year', 'vip_permanent'];
  if (vipProducts.includes(order.product_type)) {
    const periods = { vip_month: 30, vip_year: 365, vip_permanent: 365 * 50 };
    const vipLevel = { vip_month: 1, vip_year: 2, vip_permanent: 3 };
    const expireAt = order.product_type === 'vip_permanent' 
      ? 9999999999999 
      : now + periods[order.product_type] * 86400000;
    
    await db.prepare(`
      UPDATE users SET vip_level = ?, vip_expire_at = ? WHERE id = ?
    `).bind(vipLevel[order.product_type], expireAt, user.id).run();
    
    // 计算分销佣金并发放
    if (user.invited_by) {
      const levels = [
        { level: 1, rate: 0.10 },
        { level: 2, rate: 0.05 },
        { level: 3, rate: 0.02 },
      ];
      
      let currentInviter = user.invited_by;
      for (const l of levels) {
        if (!currentInviter) break;
        
        const inviter = await db.prepare('SELECT * FROM users WHERE id = ?').bind(currentInviter).first();
        if (!inviter) break;
        
        const commission = Math.floor(order.amount * l.rate);
        
        // 更新订单佣金
        await db.prepare(`
          UPDATE orders SET commission_level${l.level} = ? WHERE id = ?
        `).bind(commission, order_id).run();
        
        // 给邀请人发放佣金（积分）
        await db.prepare(`
          UPDATE users SET points = points + ? WHERE id = ?
        `).bind(commission, currentInviter).run();
        
        await db.prepare(`
          INSERT INTO point_logs (id, user_id, action, points, description, created_at)
          VALUES (?, ?, 'commission', ?, ?, ?)
        `).bind(generateId(), currentInviter, commission, `分销佣金(${l.name})`, now).run();
        
        currentInviter = inviter.invited_by;
      }
    }
  } else if (order.product_type.startsWith('points_')) {
    const points = parseInt(order.product_type.split('_')[1]) || order.amount;
    await db.prepare(`
      UPDATE users SET points = points + ?, total_points = total_points + ? WHERE id = ?
    `).bind(points, points, user.id).run();
  }
  
  return { success: true, message: '支付成功', data: { order_id } };
}

// 微信支付回调
async function handleWechatCallback(request, env) {
  const body = await request.text();
  // 实际应该验证签名
  // 这里简化处理
  return new Response('<xml><return_code>SUCCESS</return_code></xml>', {
    headers: { 'Content-Type': 'text/xml' }
  });
}

// 支付宝回调
async function handleAlipayCallback(request, env) {
  const body = await request.text();
  return new Response('success', { status: 200 });
}

// ============ 内容接口 ============

async function handleArticleList(request, env) {
  const user = await authenticate(request, env).catch(() => null);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const pageSize = 20;
  const db = await getDb(env);
  
  let query = 'SELECT * FROM articles WHERE status = 1';
  const bindings = [];
  
  // 权限过滤
  if (!user || user.vip_level === 0) {
    query += ' AND view_level <= 1';
  } else if (user.vip_level === 1) {
    query += ' AND view_level <= 2';
  }
  
  query += ' ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?';
  bindings.push(pageSize, (page - 1) * pageSize);
  
  const articles = await db.prepare(query).bind(...bindings).all();
  
  // 格式化日期
  const list = articles.results.map(a => ({
    ...a,
    created_at: new Date(a.created_at).toISOString(),
    can_view: !user || user.points >= a.points_required || a.view_level <= user.vip_level
  }));
  
  return { success: true, data: { articles: list, page, pageSize } };
}

async function handleArticleDetail(request, env, params) {
  const user = await authenticate(request, env).catch(() => null);
  const db = await getDb(env);
  
  const article = await db.prepare(
    'SELECT * FROM articles WHERE id = ?'
  ).bind(params.id).first();
  
  if (!article) {
    throw new Error('文章不存在');
  }
  
  // 权限检查
  const canView = !user || 
    article.view_level <= user.vip_level || 
    user.points >= article.points_required;
  
  if (!canView) {
    return { 
      success: false, 
      error: '积分不足或需要VIP',
      need_points: article.points_required,
      need_vip: article.view_level
    };
  }
  
  // 扣除积分（首次阅读）
  if (user && article.points_required > 0) {
    await db.prepare(`
      UPDATE users SET points = points - ? WHERE id = ? AND points >= ?
    `).bind(article.points_required, user.id, article.points_required).run();
  }
  
  // 增加浏览量
  await db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?')
    .bind(params.id).run();
  
  return { 
    success: true, 
    data: { 
      article: {
        ...article,
        created_at: new Date(article.created_at).toISOString()
      }
    } 
  };
}

async function handleCategoryArticles(request, env, params) {
  const user = await authenticate(request, env).catch(() => null);
  const db = await getDb(env);
  
  let query = 'SELECT * FROM articles WHERE status = 1 AND category = ?';
  
  if (!user || user.vip_level === 0) {
    query += ' AND view_level <= 1';
  }
  
  query += ' ORDER BY is_featured DESC, created_at DESC LIMIT 50';
  
  const articles = await db.prepare(query).bind(params.category).all();
  
  return { success: true, data: { articles: articles.results } };
}

async function handleArticleView(request, env, params) {
  await getDb(env).then(db => 
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?')
      .bind(params.id).run()
  );
  return { success: true };
}

async function handleArticleLike(request, env, params) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  await db.prepare('UPDATE articles SET like_count = like_count + 1 WHERE id = ?')
    .bind(params.id).run();
  
  return { success: true };
}

async function handleFeaturedArticles(request, env) {
  const db = await getDb(env);
  const articles = await db.prepare(`
    SELECT * FROM articles WHERE status = 1 AND is_featured = 1 
    ORDER BY created_at DESC LIMIT 10
  `).all();
  
  return { success: true, data: { articles: articles.results } };
}

// ============ 收藏接口 ============

async function handleFavorites(request, env) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  const favorites = await db.prepare(`
    SELECT a.*, f.created_at as favorited_at
    FROM favorites f
    JOIN articles a ON f.article_id = a.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).bind(user.id).all();
  
  return { success: true, data: { favorites: favorites.results } };
}

async function handleAddFavorite(request, env, params) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  const now = Date.now();
  
  await db.prepare(`
    INSERT OR IGNORE INTO favorites (id, user_id, article_id, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(generateId(), user.id, params.articleId, now).run();
  
  return { success: true };
}

async function handleRemoveFavorite(request, env, params) {
  const user = await authenticate(request, env);
  const db = await getDb(env);
  
  await db.prepare(
    'DELETE FROM favorites WHERE user_id = ? AND article_id = ?'
  ).bind(user.id, params.articleId).run();
  
  return { success: true };
}

// ============ 公开接口 ============

async function handlePublicStats(request, env) {
  const db = await getDb(env);
  
  const users = await db.prepare('SELECT COUNT(*) as count FROM users').first();
  const articles = await db.prepare('SELECT COUNT(*) as count FROM articles WHERE status = 1').first();
  const vips = await db.prepare('SELECT COUNT(*) as count FROM users WHERE vip_level > 0').first();
  
  return {
    success: true,
    data: {
      total_users: users.count,
      total_articles: articles.count,
      total_vips: vips.count
    }
  };
}

async function handleHomeData(request, env) {
  const db = await getDb(env);
  
  // 获取精选文章
  const featured = await db.prepare(`
    SELECT * FROM articles WHERE status = 1 AND is_featured = 1 
    ORDER BY created_at DESC LIMIT 5
  `).all();
  
  // 获取最新文章
  const latest = await db.prepare(`
    SELECT * FROM articles WHERE status = 1 AND view_level = 0
    ORDER BY created_at DESC LIMIT 10
  `).all();
  
  // 统计数据
  const stats = await db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM articles WHERE status = 1) as articles,
      (SELECT COUNT(*) FROM users WHERE vip_level > 0) as vips
  `).first();
  
  return {
    success: true,
    data: {
      featured: featured.results,
      latest: latest.results,
      stats
    }
  };
}

// 微信登录（简化版）
async function handleWechatLogin(request, env) {
  const { code } = await request.json();
  
  // 实际应该调用微信API获取openid
  // 这里简化处理
  const openid = 'wx_' + code || generateId();
  
  const db = await getDb(env);
  let user = await db.prepare('SELECT * FROM users WHERE openid = ?').bind(openid).first();
  
  if (!user) {
    // 自动注册
    const id = generateId();
    const now = Date.now();
    const inviteCode = generateInviteCode();
    
    await db.prepare(`
      INSERT INTO users (id, openid, username, invite_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, openid, '用户' + id.substr(0, 6), inviteCode, now, now).run();
    
    user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  }
  
  const token = generateId() + generateId();
  await env.KV.put(`token:${token}`, user.id, { expirationTtl: 86400 * 30 });
  
  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        vip_level: user.vip_level,
        points: user.points
      }
    }
  };
}

async function handleWechatConfig(request, env) {
  // 返回微信JSSDK配置
  return {
    success: true,
    data: {
      appId: 'your_appid',
      timestamp: Math.floor(Date.now() / 1000),
      nonceStr: generateId(),
      signature: '' // 需要后端签名
    }
  };
}

// ============ 健康检查 ============

async function handleHealth(request, env) {
  const db = await getDb(env);
  let dbStatus = 'connected';
  let kvStatus = 'connected';
  
  try {
    await db.prepare('SELECT 1').first();
  } catch (e) {
    dbStatus = 'error: ' + e.message;
  }
  
  try {
    await env.KV.get('health_check_test');
  } catch (e) {
    kvStatus = 'error: ' + e.message;
  }
  
  return {
    success: true,
    data: {
      status: 'ok',
      service: '猎头能量站 API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Date.now(),
      services: {
        database: dbStatus,
        kv: kvStatus
      }
    }
  };
}
