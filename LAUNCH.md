# 骂醒工作脑 · Launch Checklist & Materials

_最后更新：2026-04-23_

---

## Pre-launch Checklist

### 技术阻塞（必须做完）

- [ ] **Cloudflare DNS 迁移**（国内朋友能打开的前提）
  - [ ] Namecheap → Domain List → weilinhu.com → 改 Nameservers 到 Cloudflare 给的两个
  - [ ] Cloudflare Dashboard → 添加 weilinhu.com → 确认记录导入正确
  - [ ] Cloudflare → Workers & Pages → smash-proxy → Settings → Triggers → Custom Domain → 加 `smash-api.weilinhu.com`
  - [ ] 改 smash.html + smash-fr.html 里的 `PROXY_URL` → `https://smash-api.weilinhu.com/scold`
  - [ ] 国内 4G/WiFi 实测两个 URL 各打一次

- [ ] **Worker 限流防刷** (optional but recommended before PH 爆流)
  - [ ] Cloudflare Worker 加 rate limit：单 IP 每分钟 10 次、每天 100 次
  - [ ] 可选 Turnstile 人机验证（免费）

### 验证清单（上线前扫一遍）

- [ ] 中文版 `weilinhu.com/smash.html?coin=1`
  - [ ] 进场 fanfare 听得见
  - [ ] 6 关卡每个点开都有 BOSS 出场 + FIGHT 音效
  - [ ] 三档狠度（轻拍/打脸/抽醒）切换能看到语气差
  - [ ] Combo×3 → KO 屏，听得见 K.O. 人声 + 游戏结束终曲
  - [ ] 复制图 → 粘到微信能出图 / 下载 PNG 能下图
  - [ ] 国旗 🇫🇷 emoji 不撑破 HUD
  - [ ] 🔊 mute 后 localStorage 记住，刷新还是 mute

- [ ] 法语版 `weilinhu.com/smash-fr.html?coin=1`
  - [ ] 所有功能同上
  - [ ] `UN GIFLEUR ARRIVE...` loading 文案正确
  - [ ] `VAS-Y, ENGUEULE-MOI !` 按钮文案正确

- [ ] 手机 Safari（iOS 16+）
  - [ ] 顶部 HUD 不被状态栏遮挡
  - [ ] 关电脑 → rest.html 倒计时 1 小时
  - [ ] 「加到主屏」能装成 PWA（独立启动，无地址栏）

- [ ] 桌面 Chrome / Safari
  - [ ] 所有音效在 AudioContext 允许后都出声
  - [ ] 分享卡 (1080×1350) 复制到微信、贴到朋友圈能显示

### Analytics（可选但强烈推荐）

- [ ] 加 Umami（self-hosted on Cloudflare, 免费，不打跨境请求）或 Plausible
- [ ] 追踪事件：LEVEL 选择、SUBMIT、COMBO×3、KO 到达、分享点击
- [ ] 3 天数据回看：哪个 LEVEL 最常被点 / 多少人到 KO / 多少人分享

---

## 上线文案

### Twitter / X 主推（EN + ZH 双版）

#### EN version（PH / global audience）

```
I built an arcade that roasts you awake. 🎰

🥟 A Beijing grandpa tells you to stop being pathetic
💻 A Silicon Valley engineer calls your code a waste of life
☯ A Zen master says your "hustle" is just fear

Type your situation → one of 6 bosses tears you apart.
3 combos → forced shutdown. No, really.

weilinhu.com/smash · 100% free · no signup
```

（4 条 thread 续接）

```
2/ Why? Because I noticed:
- I work late not because the work requires it
- I check Slack not because I need to
- I refresh metrics not because they change

I was lying to myself. Told everyone I was "ambitious."
Turns out I was just avoiding something.
```

```
3/ So I built the opposite of a productivity app.

Not "rise and grind." Not "here's your focus score."
Just six voices, one function: call out your BS.

Best one so far: the shrink who tells you "your late-night
'passion' is statistically correlated with unresolved shame."

Ouch.
```

```
4/ Made in a weekend with:
- Vanilla HTML/JS (no React)
- Cloudflare Workers (proxy Claude API)
- Web Audio API (all sounds synthesized, zero files)

Writing a v2: 骂醒购物脑 (Shop-Brain Smasher).
Same 6-boss format. Different weakness.

weilinhu.com/smash
```

#### ZH version（朋友圈 / 小红书）

```
做了个 AI 街机，专门骂醒工作脑。

🏮 北京大爷一嘴京骂告诉你「装孙子呢」
💼 前司老板说「你这不是勤奋是表演」
☯ 禅师说「你以为在修行其实在逃」

写下你当下在干啥，6 个老江湖随机上场骂你一顿。
连击 3 次 → 强制关机睡觉（真关）。

weilinhu.com/smash · 不登录不收钱 · 手机电脑都行
```

### Product Hunt 文案

**Tagline**（最多 60 字符）
```
An arcade that roasts you awake — 6 AI bosses, 3 strikes, bedtime
```

**Description**（正文）
```
Work Brain Smasher is what happens when you stop asking AI to 
help you be more productive, and start asking it to tell you 
the truth.

You pick one of 6 arcade bosses (a Beijing grandpa, a Silicon 
Valley engineer, a Zen master, a French philosophy prof...), 
type what you're currently doing, and they roast you.

It's not motivational. It's the opposite. The goal is to make 
you notice that your "grind" is often just avoidance.

After 3 combos of being roasted, the app force-quits you to a 
1-hour rest page. You can't skip it.

Built in a weekend:
- Vanilla HTML/JS, no framework
- Cloudflare Workers proxy (Claude Sonnet 4.6)
- Web Audio API (all 8-bit sounds synthesized live)
- PWA installable
- Bilingual ZH/FR

Free. No signup. No email. Just roast.

→ weilinhu.com/smash (中文)
→ weilinhu.com/smash-fr (Français)
```

**Gallery 图片需求**
1. INSERT COIN 屏截图（竖屏 9:16）
2. 主屏 6 LEVEL 选择（竖屏）
3. BOSS 对话框 + 京骂文字（竖屏）
4. KO 结算屏（分享卡样式）
5. Loom 20s demo 视频：点 LEVEL → BOSS 出场 → 打字机 → KO

### LinkedIn 版本（可选，同事不会看见的前提）

只发英文版（同事不懂字面意思，但懂幽默）：

```
Weekend project: I built an anti-productivity tool.

It's an arcade game where 6 AI characters call out your BS 
when you're working too hard.

The goal isn't to help you grind more. It's to interrupt the 
grind when it's actually avoidance.

Built with Claude Sonnet 4.6 + Cloudflare Workers + vanilla 
JavaScript. No framework, no signup, no email collection.

Free at weilinhu.com/smash.

(Built in a weekend as a reminder to myself. Turns out I 
needed it more than anyone.)
```

### 小红书文案（配图 = KO 分享卡）

```
标题：我做了个街机专门骂醒工作脑

正文：
下班本来想刷会手机，结果凌晨三点还在改 PPT。
老板没让你改，你自己不肯停。
这不是努力，是拖延和逃避穿了努力的外套。

于是做了个 AI 街机，六个角色专门骂醒打工人：
🏮 北京大爷（一嘴京骂）
🧠 心理医生（临床冷刀）
💼 前司老板（商务拆穿）
🍻 东北铁子（义气糙话）
☯ 禅师（拆你修行假象）
💻 硅谷工程师（代码比喻）

输入你现在在干啥，随机一个上场。
连击 3 次直接 KO，强制关机睡觉。

免登录免付费，手机电脑都能用：
weilinhu.com/smash

#工作 #打工 #反内卷 #AI #独立开发 #街机
```

---

## 发布节奏建议

**发布日（周四或周二，推荐亚洲下午 = 美国早 6-8 点 PH 上榜黄金窗口）**

1. 0700 PST — PH 发布
2. 0800 PST — 推特 thread
3. 下午（亚洲晚） — 朋友圈 + 小红书 + 微信群 1-2 个
4. 不要同时全渠道，观察 PH 反应后再扩

**发布后 48 小时**

1. 每 2 小时查一次 PH 排名，回复所有评论
2. 如果有博主/KOL 转发，发私信感谢 + 给他们独家 demo 角度
3. 关注 Cloudflare Worker 用量（免费额度：10 万请求/天），爆了加付费

**发布后 1 周**

1. 开始做 v2「骂醒购物脑」（`smash-engine.js` 已经抽好，只需要新 personas）
2. 写复盘文章发「尉琳说」

---

## v2 扩展：smash-engine.js 用法

未来新建子 project（比如「骂醒焦虑脑」）：

1. 复制 `smash.html` → `smash-anxiety.html`
2. 改 6 个 personas（焦虑相关：心理咨询师、正念导师、佛系爷爷…）
3. 改 6 个 levels（焦虑场景：晚上睡不着、担心失业、怕错过…）
4. 改 HTML 文案标题「骂醒焦虑脑」
5. 引用同一份 `<script src="/smash-engine.js"></script>`
6. 部署

SFX 音效、smartTruncate、coin 欢迎逻辑全部复用。
