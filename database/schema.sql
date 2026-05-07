-- 猎头能量站数据库 Schema
-- 使用 Cloudflare D1 (SQLite)

-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    openid TEXT UNIQUE,           -- 微信openid或第三方ID
    unionid TEXT,                 -- 微信unionid
    
    -- 账户信息
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,  -- bcrypt加密
    
    -- 会员信息
    vip_level INTEGER DEFAULT 0,  -- 0=免费, 1=月VIP, 2=年VIP, 3=永久VIP
    vip_expire_at INTEGER,        -- VIP过期时间戳
    
    -- 分销信息
    invite_code TEXT UNIQUE,      -- 我的邀请码
    invited_by TEXT,              -- 邀请人ID
    total_invites INTEGER DEFAULT 0, -- 邀请人数
    
    -- 积分系统
    points INTEGER DEFAULT 0,     -- 当前积分
    total_points INTEGER DEFAULT 0, -- 累计获得积分
    
    -- 状态
    status INTEGER DEFAULT 1,     -- 1=正常, 0=禁用
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 积分记录表
CREATE TABLE point_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,         -- sign_in, invite, purchase, task, etc.
    points INTEGER NOT NULL,      -- 正负积分
    description TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 邀请关系表（支持多级分销）
CREATE TABLE invites (
    id TEXT PRIMARY KEY,
    inviter_id TEXT NOT NULL,     -- 邀请人
    invited_id TEXT NOT NULL,     -- 被邀请人
    level INTEGER DEFAULT 1,      -- 分销层级 1/2/3
    reward_points INTEGER DEFAULT 0, -- 奖励积分
    reward_money INTEGER DEFAULT 0,  -- 奖励金额(分)
    status INTEGER DEFAULT 1,     -- 1=有效, 0=已退款
    created_at INTEGER NOT NULL,
    FOREIGN KEY (inviter_id) REFERENCES users(id),
    FOREIGN KEY (invited_id) REFERENCES users(id)
);

-- VIP订单表
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    order_no TEXT UNIQUE NOT NULL, -- 订单号
    
    product_type TEXT NOT NULL,    -- vip_month, vip_year, vip_permanent, points_pack
    product_name TEXT NOT NULL,
    amount INTEGER NOT NULL,       -- 金额(分)
    
    -- 支付信息
    pay_method TEXT,               -- wechat, alipay
    pay_status INTEGER DEFAULT 0,  -- 0=待支付, 1=已支付, 2=已退款
    pay_time INTEGER,
    transaction_id TEXT,           -- 第三方交易号
    
    -- 分销佣金
    commission_level1 INTEGER DEFAULT 0, -- 一级佣金(分)
    commission_level2 INTEGER DEFAULT 0, -- 二级佣金
    commission_level3 INTEGER DEFAULT 0, -- 三级佣金
    
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 签到记录表
CREATE TABLE sign_ins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,           -- 日期 YYYY-MM-DD
    points INTEGER DEFAULT 0,     -- 获得积分
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 文章/内容表
CREATE TABLE articles (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,                 -- Markdown内容
    cover_image TEXT,
    
    -- 分类
    category TEXT NOT NULL,       -- news, course, resource, tool
    
    -- 权限
    view_level INTEGER DEFAULT 0, -- 0=公开, 1=VIP, 2=高级VIP
    points_required INTEGER DEFAULT 0, -- 阅读所需积分
    
    -- 统计
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- 状态
    status INTEGER DEFAULT 1,     -- 1=发布, 0=草稿
    is_featured INTEGER DEFAULT 0, -- 是否精选
    
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 收藏表
CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- 每日任务表
CREATE TABLE daily_tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_key TEXT NOT NULL,      -- sign_in, share, invite, etc.
    completed_at INTEGER,
    date TEXT NOT NULL,          -- 日期 YYYY-MM-DD
    UNIQUE(user_id, task_key, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_point_logs_user ON point_logs(user_id);
CREATE INDEX idx_invites_inviter ON invites(inviter_id);
CREATE INDEX idx_invites_invited ON invites(invited_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(pay_status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_view_level ON articles(view_level);
