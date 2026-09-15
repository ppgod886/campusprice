/* ============================================================
   学省 CampusPrice · 数据与链接自测
   ------------------------------------------------------------
   运行:node tools/selftest.mjs
   用途:改完 data.js / links.js 后跑一遍,确保站点地基没坏。
   ============================================================ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = vm.createContext({ console, encodeURIComponent, Math, String, Number, JSON });

/* data.js 与 links.js 是普通脚本(非 ES 模块),在同一上下文里顺序执行,
   这样它们的顶层 const 就能互相看见 —— 和浏览器里的加载方式一致。

   注意:vm 里顶层 const/let 会进入上下文的"全局词法作用域",
   但不会成为 globalThis 的属性,所以要多跑一段脚本把名字显式导出来。 */
for (const f of ['assets/data.js', 'assets/links.js']) {
  vm.runInContext(readFileSync(join(root, f), 'utf8'), ctx, { filename: f });
}
vm.runInContext(`globalThis.__T = {
  PLATFORMS, PLAT_MAP, CATEGORIES, CAT_MAP, CATALOG, CATALOG_RAW, SCENES, SITE_STATS,
  buildLinks, isUsableKeyword, normalizeKeyword, guessCategory, searchCatalog, buyUrl, homeLinks
};`, ctx, { filename: 'export' });

const {
  PLATFORMS, PLAT_MAP, CATEGORIES, CATALOG, CATALOG_RAW, SCENES, SITE_STATS,
  buildLinks, isUsableKeyword, normalizeKeyword, guessCategory, searchCatalog, buyUrl, homeLinks
} = ctx.__T;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (extra ? '  → ' + extra : '')); }
}
function section(t) { console.log('\n' + t); }

/* ---------- 1. 链接构造器 ---------- */
section('1. 链接构造器 buildLinks()');
{
  const l = buildLinks('蓝牙耳机');
  ok('返回 6 条链接', l.length === 6, 'got ' + l.length);
  ok('全部是 https', l.every(x => x.url.startsWith('https://')));
  ok('URL 里没有未编码的中文', l.every(x => !/[\u4e00-\u9fa5]/.test(x.url)));
  ok('拼多多优先级最高(排第一)', l[0].key === 'pdd', 'got ' + l[0].key);
  ok('每条都有平台配色', l.every(x => /^#[0-9A-Fa-f]{6}$/.test(x.color)));
  ok('URL 里带上了关键词', l.every(x => x.url.includes(encodeURIComponent('蓝牙耳机'))));

  ok('空字符串 → []', buildLinks('').length === 0);
  ok('纯空白 → []', buildLinks('   ').length === 0);
  ok('全角空格 → []', buildLinks('\u3000\u3000').length === 0);
  ok('纯标点 → []', buildLinks('!!!').length === 0);
  ok('null → []', buildLinks(null).length === 0);
  ok('undefined → []', buildLinks(undefined).length === 0);

  const weirdRaw = '100%纯棉 T恤 & 短袖/男';
  const weird = buildLinks(weirdRaw);
  ok('特殊字符不产生非法 URL', weird.length === 6 && weird.every(x => { try { new URL(x.url); return true; } catch { return false; } }));
  ok('URL 里没有裸露的空格或引号', weird.every(x => !/[\s"<>]/.test(x.url)));
  ok('解码后能还原完整关键词', weird.every(x => decodeURIComponent(x.url).includes(weirdRaw)),
    weird[0] && decodeURIComponent(weird[0].url));

  const long = buildLinks('长'.repeat(200));
  ok('超长关键词被截断且仍合法', long.length === 6 && long.every(x => { try { new URL(x.url); return true; } catch { return false; } }));

  ok('所有 URL 都能被 new URL() 解析', l.every(x => { try { new URL(x.url); return true; } catch { return false; } }));
  ok('每个平台至少给出首页兜底', homeLinks().length === 6 && homeLinks().every(x => x.url.startsWith('https://')));

  /* 变体链接必须与主链接同域,且都带上了关键词 —— 防止手滑写错域名 */
  let badVariant = [];
  for (const x of l) {
    for (const v of x.variants) {
      const host = new URL(x.url).hostname;
      let vh;
      try { vh = new URL(v.url).hostname; } catch { badVariant.push(v.url + '(非法)'); continue; }
      if (vh !== host) badVariant.push(v.label + ' 域名不符 ' + vh + ' ≠ ' + host);
      if (!decodeURIComponent(v.url).includes('蓝牙耳机')) badVariant.push(v.label + ' 丢了关键词');
    }
  }
  ok('筛选变体链接域名正确且带关键词', badVariant.length === 0, badVariant.join('; '));
  ok('没有编造未经验证的平台筛选参数(拼多多/唯品会/得物/闲鱼均无变体)',
    ['pdd', 'vip', 'dw', 'xy'].every(k => l.find(x => x.key === k).variants.length === 0));
  ok('京东/淘宝各有 2 个已验证筛选', l.find(x => x.key === 'jd').variants.length === 2 && l.find(x => x.key === 'tb').variants.length === 2);

  /* 登录要求必须如实标注 —— 这是全站最容易"说了假话"的地方 */
  ok('每条链接都带 needsLogin 标记', l.every(x => typeof x.needsLogin === 'boolean'));
  ok('每条链接都带实测说明文字', l.every(x => typeof x.statusNote === 'string' && x.statusNote.length > 4));
  ok('京东标记为免登录可用', l.find(x => x.key === 'jd').needsLogin === false, l.find(x => x.key === 'jd').statusNote);
  ok('拼多多/淘宝/唯品会/得物标记为需登录',
    ['pdd', 'tb', 'vip', 'dw'].every(k => l.find(x => x.key === k).needsLogin === true));
  ok('六个平台的实测说明各不相同', new Set(l.map(x => x.statusNote)).size === 6);
}

/* ---------- 2. 平台档案 ---------- */
section('2. 平台档案');
{
  ok('共 6 个平台', PLATFORMS.length === 6);
  ok('key 唯一', new Set(PLATFORMS.map(p => p.key)).size === 6);
  ok('每个平台都有直达模板且含 {q}', PLATFORMS.every(p => p.search.includes('{q}')));
  ok('每个平台都有首页兜底', PLATFORMS.every(p => p.home && p.home.startsWith('https://')));
  ok('每个平台都有配色', PLATFORMS.every(p => /^#[0-9A-Fa-f]{6}$/.test(p.color)));
  ok('闲鱼被标记为二手', PLAT_MAP.xy.used === true);
  const req = ['拼多多', '淘宝/天猫', '京东'];
  ok('覆盖了用户点名的三大平台', req.every(n => PLATFORMS.some(p => p.name === n)));
}

/* ---------- 3. 商品库完整性 ---------- */
section('3. 商品库');
{
  ok('商品数量 ≥ 200', CATALOG.length >= 200, 'got ' + CATALOG.length);
  ok('RAW 与构建结果等长', CATALOG_RAW.length === CATALOG.length);
  ok('SITE_STATS 与实际一致',
    SITE_STATS.products === CATALOG.length &&
    SITE_STATS.platforms === PLATFORMS.length &&
    SITE_STATS.categories === CATEGORIES.length);

  const names = CATALOG.map(p => p.name);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  ok('没有重名商品', dup.length === 0, dup.join(', '));

  ok('id 唯一且连续',
    new Set(CATALOG.map(p => p.id)).size === CATALOG.length &&
    CATALOG[0].id === 1 && CATALOG[CATALOG.length - 1].id === CATALOG.length);

  ok('每件都有名称/卖点', CATALOG.every(p => p.name && p.name.length >= 2 && p.sell && p.sell.length >= 4));
  ok('每件参考价都是正数', CATALOG.every(p => typeof p.base === 'number' && p.base > 0));
  ok('每件都有 emoji', CATALOG.every(p => p.emoji && p.emoji.length > 0));

  const catNames = new Set(CATEGORIES.map(c => c.name));
  const badCat = CATALOG.filter(p => !catNames.has(p.cat));
  ok('所有商品的品类都在 CATEGORIES 里', badCat.length === 0, badCat.map(p => p.name + ':' + p.cat).join(', '));

  const badScene = CATALOG.filter(p => p.scenes.some(s => !SCENES.some(x => x.name === s)));
  ok('场景标签都是已定义的', badScene.length === 0);

  const emptyCat = CATEGORIES.filter(c => CATALOG.filter(p => p.cat === c.name).length < 10);
  ok('每个品类至少有 10 件商品', emptyCat.length === 0, emptyCat.map(c => c.name).join(', '));

  ok('教育优惠只加在电脑/平板类', CATALOG.every(p => !p.stu || /笔记本|游戏本|平板|电脑|显示器|阅读器/.test(p.name)));
}

/* ---------- 4. 检索与品类推测 ---------- */
section('4. 检索与品类推测');
{
  ok('搜「耳机」有结果', searchCatalog('耳机').length > 0);
  ok('搜「考研」有结果', searchCatalog('考研').length > 0);
  ok('搜「螺蛳粉」有结果', searchCatalog('螺蛳粉').length > 0);
  ok('搜不存在的词返回空', searchCatalog('zzzz不存在的商品xyz').length === 0);
  ok('limit 生效', searchCatalog('', null, 5).length === 5);
  ok('品类过滤生效', searchCatalog('', { cat: '食品零食' }).every(p => p.cat === '食品零食'));
  ok('场景过滤生效', searchCatalog('', { scene: '考研自习' }).every(p => p.scenes.includes('考研自习')));
  ok('别名能搜到正式名(搜「移动电源」找到充电宝)',
    searchCatalog('移动电源').some(p => p.name.includes('充电宝')));

  ok('guessCategory 识别数码', guessCategory('机械键盘') === '数码3C', 'got ' + guessCategory('机械键盘'));
  ok('guessCategory 识别零食', guessCategory('薯片') === '食品零食', 'got ' + guessCategory('薯片'));
  ok('guessCategory 对陌生词返回 null', guessCategory('量子纠缠发生器') === null, 'got ' + guessCategory('量子纠缠发生器'));

  ok('normalizeKeyword 去首尾空白', normalizeKeyword('  耳机  ') === '耳机');
  ok('normalizeKeyword 折叠连续空白', normalizeKeyword('蓝牙   耳机') === '蓝牙 耳机');
  ok('isUsableKeyword 拒绝空', !isUsableKeyword('   '));
  ok('isUsableKeyword 接受正常词', isUsableKeyword('耳机'));
}

/* ---------- 5. 购买链接不能指向首页 ---------- */
section('5. 购买链接(比价表用)');
{
  let homeHits = 0;
  for (const key of PLATFORMS.map(p => p.key)) {
    const u = buyUrl(key, '无线蓝牙耳机');
    const home = PLAT_MAP[key].home;
    if (u === home || u === '#') homeHits++;
  }
  ok('6 个平台的购买链接都不是首页兜底', homeHits === 0, homeHits + ' 个指向了首页');
  ok('购买链接带上了商品关键词', buyUrl('pdd', '无线蓝牙耳机').includes(encodeURIComponent('无线蓝牙耳机')));
}

/* ---------- 6. 关键词全覆盖(核心承诺) ---------- */
section('6. 任意关键词都能生成 6 条链接');
{
  const samples = [
    '蓝牙耳机', '卫生纸', 'iPhone 16 Pro', '显卡 4060', '猫粮',
    '雅思真题', '滑雪手套', '任天堂 Switch', '隐形眼镜', '维生素C',
    'Nike Air Force 1', 'USB-C to HDMI 转接线', '宿舍用小冰箱'
  ];
  let bad = [];
  for (const s of samples) {
    const l = buildLinks(s);
    if (l.length !== 6) { bad.push(s); continue; }
    if (!l.every(x => { try { new URL(x.url); return true; } catch { return false; } })) bad.push(s + '(URL非法)');
  }
  ok(`抽查 ${samples.length} 个任意关键词(含英文/数字/未收录品),全部生成 6 条合法链接`,
    bad.length === 0, bad.join(', '));
}

/* ---------- 汇总 ---------- */
console.log('\n' + '─'.repeat(52));
console.log(`通过 ${pass} 项,失败 ${fail} 项`);
console.log('─'.repeat(52));
process.exit(fail ? 1 : 0);
