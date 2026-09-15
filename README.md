# 学省 CampusPrice

给大学生用的跨平台购物比价与优惠导航站。

**在线地址:** https://ppgod886.github.io/campusprice/
**仓库:** https://github.com/ppgod886/campusprice

---

## 这个站到底解决什么问题

电商平台的商品有上亿种,任何比价站都收录不完 —— 所以本站**不试图收录全宇宙的商品**,而是做两件事:

| 模式 | 做什么 | 覆盖范围 |
| --- | --- | --- |
| **① 全网直达** | 输入任意关键词 → 生成六平台(拼多多 / 淘宝天猫 / 京东 / 唯品会 / 得物 / 闲鱼)的搜索直达链接 | **任意商品**,没有上限 |
| **② 站内估算** | 221 件校园高频好物的六平台估算价对比、学生优惠、价格波动 | 校园长尾场景 |

道理很简单:本站收录不完的商品,**平台自己的搜索是完整的**。所以本站只负责把搜索入口做好。

---

## ⚠️ 必须先读:两件关于"真实性"的事

### 1. 站内价格是估算值,不是实时价

静态网页在技术上**无法**获取拼多多 / 淘宝 / 京东的实时价格:这三家没有公开的免鉴权价格接口,
浏览器端直接请求会被 CORS 拦死,加上风控指纹,前端爬取在架构上就不通。

所以站内所有数值(`CATALOG` 里的 `base`、六平台到手价、价格波动曲线)**都是按品类规律生成的估算值**,
只用来帮你判断"这东西大概什么价位、哪个平台通常更便宜"。UI 上用灰色 + `~` 前缀 + `估算` 角标与真实价格严格区分。

真实价格一律通过"直达"按钮到平台上查看。

### 2. 多数平台要求先登录才能看价格

2026-09 用**有头真实浏览器 + 全新无 cookie 上下文**逐个实测的结论:

| 平台 | 未登录访客实测结果 | 标记 |
| --- | --- | --- |
| 京东 | ✅ 免登录可用。页面标题显示「蓝牙耳机 - 商品搜索 - 京东」,关键词被正确接收 | `ok` |
| 闲鱼 | ✅ 搜索页可打开(标题「蓝牙耳机_闲鱼」,筛选栏正常),商品列表懒加载 | `login`(列表需登录) |
| 拼多多 | ⛔ 302 跳转到 `login.html` | `login` |
| 淘宝 | ⛔ 显示「亲,请登录」,结果区停在「加载中」 | `login` |
| 唯品会 | ⛔ 302 跳转到 `passport.vip.com/login` | `login` |
| 得物 | ⛔ 网页版不出结果,只渲染 App 下载页 | `login` |

**这是平台自身的政策,不是链接写错了。** 用户只要在浏览器里登录过一次该平台,
之后点直达就能一步看到价格。所以 UI 上每个平台卡片都标注了 `🔒 需登录` 或 `✅ 免登录`,
页面顶部也有醒目说明 —— 让用户点了之后看到登录页时不会以为网站坏了。

> 改链接时**务必**同步更新 `assets/links.js` 里的 `LINK_STATUS` 表,不要凭猜测把它标成 `ok`。

---

## 目录结构

```
index.html          页面结构 / SEO / JSON-LD / OG 标签
assets/
  data.js           数据层:六平台档案 + 八品类 + 221 件商品库
  links.js          【地基】关键词 → 六平台直达链接的纯函数
  main.js           交互层:直达渲染 / 检索 / 估算比价 / SVG 波动图 / 省钱清单
  style.css         设计系统
tools/
  selftest.mjs      数据与链接自测(63 项)
output/playwright/  浏览器验证截图(不参与部署)
```

零依赖、无构建步骤、无后端。三个 `<script>` 直接跑,`data.js → links.js → main.js` 顺序不能变。

`links.js` 单独拆出来,是因为它是整个方案的地基 —— 纯函数、不碰 DOM、可被独立验证。

---

## 本地运行

```bash
# 任意静态服务器都行
python -m http.server 8899 --bind 127.0.0.1
# 然后打开 http://127.0.0.1:8899/
```

不要直接双击 `index.html` 用 `file://` 打开 —— 省钱清单用的 `localStorage` 和 URL 参数在 `file://` 下行为不一致。

## 测试

```bash
node tools/selftest.mjs
```

覆盖:链接构造(空输入/全角空格/特殊字符/超长截断)、平台档案完整性、商品库完整性(重名、品类合法性、价格正数)、
检索与品类推测、购买链接不是首页、**任意关键词都能生成 6 条合法链接**、登录标记是否如实。

浏览器端另有 78 项审计(控制台无报错、DOM 结构、交互流程、XSS 防护、四档响应式无横向溢出),脚本不随仓库部署。

---

## 维护指南

### 加商品

编辑 `assets/data.js` 的 `CATALOG_RAW`,格式:

```js
['商品名', '品类名', emoji, 参考价, '一句话卖点', '搜索别名 空格分隔'],
```

- `参考价` 填主流电商常见到手价的中位估算值
- `搜索别名` 用来让「移动电源」也能搜到「快充充电宝」这类同义词
- 卖点里出现「考研」「防晒」「收纳」等词会自动挂上对应场景标签(见 `SCENES`)
- 笔记本/平板类会自动获得教育优惠(见 `EDU_RE`)
- 加完跑 `node tools/selftest.mjs`,品类少于 10 件、重名、价格非正数都会被抓出来

### 加平台

在 `assets/data.js` 的 `PLATFORMS` 里加一条,**同时**在 `assets/links.js` 的 `LINK_STATUS` 里
如实填写登录要求。两个文件不一致时自测会失败。

### 改直达链接

只改 `assets/links.js`。**不要加没验证过的筛选参数** —— 藏一个不生效的参数在链接里,
用户点进去发现没筛选,比不给这个入口更糟。目前只保留了有公开依据的京东 `psort=3` / `ev=exbrand_自营`
和淘宝 `sort=price-asc` / `sort=sale-desc`。

---

## 部署

推送到 `main` 分支即可,GitHub Pages 会自动发布(仓库 Settings → Pages → Source: main / root)。

```bash
git add -A
git commit -m "描述你的改动"
git push origin main
```

部署后如果没看到更新,是 Pages 的 CDN 缓存,等 1-2 分钟并强制刷新(Ctrl+F5)。

### ⚠️ 这台机器上的推送配置(踩过的坑)

本机全局 git 配置里有一条 URL 改写规则,把所有 `github.com` 请求转到 `ghproxy.net` 镜像:

```
url.https://ghproxy.net/https://github.com/.insteadof = https://github.com/
```

`ghproxy` 是**只读**镜像 —— `clone` / `fetch` 能用,`push` 会一直卡住直到超时。所以本仓库做了拆分配置:

```bash
# 拉取继续走代理(快)
git remote set-url          origin 'https://ghproxy.net/https://github.com/ppgod886/campusprice.git'
# 推送直连(镜像不支持写)。注意 URL 里带了用户名,
# 这样它不以 https://github.com/ 开头,不会被上面的规则改写
git remote set-url --push   origin 'https://ppgod886@github.com/ppgod886/campusprice.git'
# 凭据交给已登录的 gh,避免走 Git Credential Manager 反复弹窗
git config --local credential.helper '!gh auth git-credential'
```

这几条都是**仓库级**配置,没有动全局设置。换机器或重新 clone 之后需要重设一次。

另外:如果 `git add` 报 `unable to write new index file` 或 `couldn't set refs/remotes/...`,
通常是有残留的 git 进程占着 `.git/index`,等几秒重试即可,不会丢东西。

---

## 改动历史

**本轮改版**(相对于初版):

- 新增「全网直达」:任意关键词 → 六平台搜索直达,解决了"只能比 15 个硬编码商品"的根本问题
- 商品库 15 → 221 件,8 个品类 + 6 个校园场景标签
- 修掉一个继承自初版的 bug:HTML 里 `id="grid"` 重复(section 和内部 div 同名),
  导致 `$('#grid').innerHTML` 把整个榜单标题和筛选栏一起抹掉。初版线上站的 tabs 其实从未显示过
- 去掉 Chart.js(200KB+ CDN 依赖),价格波动图改手写 SVG
- 去掉 Unsplash 图库假图(与商品完全无关),改用品类渐变 + emoji
- 比价表宽度溢出修复(grid 子项 `min-width:0`),1024px 视口不再横向滚动
- 搜索框加 XSS 转义(原版用户输入直接进 innerHTML)
- 新增省钱清单(localStorage)、移动端底部搜索条、移动端比价卡片化
- 全站"估算"与"实时"的视觉区分,以及平台登录要求的如实标注
