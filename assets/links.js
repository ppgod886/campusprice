/* ============================================================
   学省 CampusPrice · 六平台直达链接构造器
   ------------------------------------------------------------
   这是整个站点最关键的一个单元,职责只有一个:
       关键词(任意字符串) → 六个平台的可用搜索链接

   它是纯函数:不碰 DOM、不发请求、无副作用,所以可以被独立验证。
   站点"涵盖几乎所有商品"的能力完全建立在这里 ——
   因为搜索由各平台自己完成,本地不需要预先收录商品。

   自测清单(改完务必逐条跑):
     buildLinks('蓝牙耳机')      → 6 条,URL 均以 https:// 开头且不含未编码中文
     buildLinks('  ')            → []            (空关键词不产生链接)
     buildLinks('100%纯棉 T恤')  → 特殊字符被正确编码,不产生非法 URL
     buildLinks('蓝牙耳机')[0].key === 'pdd'      (按 priority 排序,拼多多优先)
   ============================================================ */

/* ------------------------------------------------------------
   实测结论表
   ------------------------------------------------------------
   2026-09 用【有头真实浏览器 + 全新无 cookie 上下文】逐个实测,
   结论如下(注意:这是平台政策,不是链接写错了):

     jd  京东   免登录可用。页面标题直接显示「蓝牙耳机 - 商品搜索 - 京东」,
                证明关键词被正确接收。
     xy  闲鱼   搜索页免登录可打开(标题「蓝牙耳机_闲鱼」,筛选栏正常),
                但商品列表懒加载,未登录时可能一直显示"加载中"。
     pdd 拼多多 未登录直接 302 到 login.html。必须先登录。
     tb  淘宝   显示"亲,请登录",结果区停在"加载中"。必须先登录。
     vip 唯品会 未登录 302 到 passport.vip.com/login。必须先登录。
     dw  得物   网页版搜索不出结果,只渲染 App 下载页。建议用 App。

   ⚠️ 这些结论必须如实映射到 UI 上。
      如果界面上写着"点开就是实时价",而用户点开看到的是登录页,
      他会认为网站坏了 —— 那比不做这个功能更糟。
      所以每个平台都要带 needsLogin 标记,UI 据此显示提示。
   ------------------------------------------------------------ */
const LINK_STATUS = {
  pdd: { state: 'login', note: '网页版搜索需先登录拼多多账号' },
  tb: { state: 'login', note: '淘宝网页版搜索需先登录(或用手机淘宝 App)' },
  jd: { state: 'ok', note: '京东搜索页免登录可用,直接看价' },
  vip: { state: 'login', note: '唯品会搜索需先登录账号' },
  dw: { state: 'login', note: '得物网页版搜索需登录,建议用得物 App' },
  xy: { state: 'login', note: '闲鱼搜索页可打开,商品列表需登录后加载' }
};

/** 该平台是否需要先登录才能看到价格 */
function needsLogin(platKey) {
  return (LINK_STATUS[platKey] || {}).state === 'login';
}

/* ------------------------------------------------------------
   关键词清洗
   ------------------------------------------------------------ */
/**
 * 把用户输入整理成适合放进 URL 查询串的关键词。
 * 全角空格、连续空白、首尾空白都会处理掉。
 */
function normalizeKeyword(raw) {
  if (raw === null || raw === undefined) return '';
  return String(raw)
    .replace(/\u3000/g, ' ')      // 全角空格
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);                 // 超长输入截断,避免生成离谱 URL
}

/** 关键词是否可用于构造链接 */
function isUsableKeyword(raw) {
  const k = normalizeKeyword(raw);
  /* 至少要有一个非标点的可见字符 */
  return /[^\s\p{P}\p{S}]/u.test(k);
}

/* ------------------------------------------------------------
   各平台的链接变体(筛选条件)
   ------------------------------------------------------------
   原则:只加【确定有效】的参数。
   藏一个不生效的参数在链接里,用户点进去发现没筛选,比不给这个入口
   更糟 —— 他会以为网站坏了。所以没验证过的平台宁可留空。

   已验证可靠的:
     · 京东 psort=3            价格从低到高(京东搜索页通用参数)
     · 京东 ev=exbrand_自营    只看自营
     · 淘宝 sort=price-asc     价格从低到高
     · 淘宝 sort=sale-desc     按销量
   拼多多移动端与唯品会的排序参数没有公开文档,不做猜测,一律留空。
   ------------------------------------------------------------ */
function variantsFor(plat, encoded) {
  switch (plat.key) {
    case 'jd':
      return [
        { label: '只看自营', url: `https://search.jd.com/Search?keyword=${encoded}&enc=utf-8&ev=exbrand_%E8%87%AA%E8%90%A5` },
        { label: '价格从低到高', url: `https://search.jd.com/Search?keyword=${encoded}&enc=utf-8&psort=3` }
      ];
    case 'tb':
      return [
        { label: '按销量排序', url: `https://s.taobao.com/search?q=${encoded}&sort=sale-desc` },
        { label: '价格从低到高', url: `https://s.taobao.com/search?q=${encoded}&sort=price-asc` }
      ];
    default:
      /* 拼多多 / 唯品会 / 得物 / 闲鱼:不编造未经验证的筛选参数 */
      return [];
  }
}

/* ------------------------------------------------------------
   主函数:关键词 → 六平台直达链接
   ------------------------------------------------------------ */
/**
 * @param {string} rawKeyword 用户输入的任意关键词
 * @returns {Array<{
 *   key:string, name:string, icon:string, color:string, colorSoft:string,
 *   url:string, variants:Array<{label:string,url:string}>,
 *   note:string, promo:string, student:number|null, studentLabel:string|null,
 *   status:string, used:boolean
 * }>} 按平台 priority 排序;关键词无效时返回 []
 */
function buildLinks(rawKeyword) {
  if (!isUsableKeyword(rawKeyword)) return [];
  const kw = normalizeKeyword(rawKeyword);
  const encoded = encodeURIComponent(kw);

  return PLATFORMS
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map(plat => ({
      key: plat.key,
      name: plat.name,
      short: plat.short,
      icon: plat.icon,
      color: plat.color,
      colorSoft: plat.colorSoft,
      url: plat.search.replace('{q}', encoded),
      variants: variantsFor(plat, encoded),
      note: plat.note,
      promo: plat.promo,
      student: plat.student,
      studentLabel: plat.studentLabel,
      ship: plat.ship,
      used: !!plat.used,
      status: (LINK_STATUS[plat.key] || {}).state || 'ok',
      statusNote: (LINK_STATUS[plat.key] || {}).note || '',
      needsLogin: needsLogin(plat.key)
    }));
}

/* ------------------------------------------------------------
   兜底:平台首页(当某平台直达不可用时给用户一条退路)
   ------------------------------------------------------------ */
function homeLinks() {
  return PLATFORMS
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map(p => ({ key: p.key, name: p.name, icon: p.icon, color: p.color, url: p.home }));
}

/* ------------------------------------------------------------
   品类推测:关键词 → 最可能的品类(用于联想与文案)
   ------------------------------------------------------------ */
/**
 * 在商品库中做一次轻量检索,返回最可能的品类名。
 * 找不到线索时返回 null —— 不要瞎猜,UI 会显示"全网搜索"。
 */
function guessCategory(keyword) {
  const k = normalizeKeyword(keyword);
  if (!k) return null;

  /* 先看品类名本身 */
  for (const c of CATEGORIES) {
    if (k.includes(c.name) || c.name.includes(k)) return c.name;
  }
  /* 再看商品库里的名称与别名 */
  const hit = CATALOG.find(p => p.name.includes(k) || k.includes(p.name) || p.aliases.includes(k));
  return hit ? hit.cat : null;
}

/* ------------------------------------------------------------
   站内检索:关键词 → 匹配到的商品(按相关度排序)
   ------------------------------------------------------------ */
/**
 * 相关度:名称完全相等 > 名称包含 > 别名包含 > 卖点包含
 * @param {string} keyword
 * @param {{cat?:string, scene?:string}} [filter]
 * @param {number} [limit]
 */
function searchCatalog(keyword, filter, limit) {
  const k = normalizeKeyword(keyword).toLowerCase();
  const f = filter || {};
  let pool = CATALOG;

  if (f.cat && f.cat !== '全部') pool = pool.filter(p => p.cat === f.cat);
  if (f.scene && f.scene !== '全部') pool = pool.filter(p => p.scenes.includes(f.scene));

  if (!k) return limit ? pool.slice(0, limit) : pool;

  const scored = [];
  for (const p of pool) {
    const name = p.name.toLowerCase();
    let score = 0;
    if (name === k) score = 100;
    else if (name.includes(k)) score = 80;
    else if (p.aliases.toLowerCase().includes(k)) score = 60;
    else if (p.cat.toLowerCase().includes(k)) score = 40;
    else if (p.sell.toLowerCase().includes(k)) score = 20;
    if (score > 0) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score || a.p.base - b.p.base);
  const out = scored.map(x => x.p);
  return limit ? out.slice(0, limit) : out;
}

/* ------------------------------------------------------------
   平台名 → 购买入口(站内比价表用,带上关键词直达)
   ------------------------------------------------------------ */
/**
 * 比价表里的"去购买"按钮不应指向平台首页,而要指向该商品的搜索结果。
 * @param {string} platKey
 * @param {string} productName
 */
function buyUrl(platKey, productName) {
  const links = buildLinks(productName);
  const hit = links.find(l => l.key === platKey);
  return hit ? hit.url : (PLAT_MAP[platKey] ? PLAT_MAP[platKey].home : '#');
}
