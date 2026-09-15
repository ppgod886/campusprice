/* ============================================================
   学省 CampusPrice · 交互逻辑
   ------------------------------------------------------------
   依赖(按顺序加载):assets/data.js → assets/links.js → 本文件

   本文件里所有"价格"都是【估算值】,不是实时价。
   真实价格只通过 buildLinks() 生成的平台直达链接由用户自行查看。
   任何把估算价写成实时价的改动都是 bug。
   ============================================================ */

/* ---------- 小工具 ---------- */

/** 查询选择器简写 */
const $ = (s, root) => (root || document).querySelector(s);
const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

/**
 * HTML 转义。
 * 用户输入的关键词会被拼进 innerHTML,不转义就是 XSS,
 * 直达比价区尤其危险(关键词直接来自输入框和地址栏)。
 */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/** 金额格式化(数字部分,不带 ~ 前缀) */
function fmt(n) {
  if (!isFinite(n)) return '—';
  return '¥' + (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10);
}

/** 价格数字部分(不带 ¥) */
function num(n) {
  return n >= 100 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
}

/* ---------- 确定性伪随机:同一个商品每次刷新估算值要一致 ---------- */
function prand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 9973;
}

/* ---------- 估算价格模型 ---------- */
/**
 * 估算某商品在某平台的到手价。
 * 公式:参考价 × 平台倍率 × 波动因子 × 学生折扣
 * 再次强调:这是估算,不是抓取到的真实价格。
 */
function estPrice(p, platKey, seedOffset) {
  const plat = PLAT_MAP[platKey];
  if (!plat) return p.base;
  const seed = (typeof p.id === 'number' ? p.id : hashSeed(p.name)) * 53 + (seedOffset || 0) * 29;
  let v = p.base * plat.est * (0.95 + prand(seed) * 0.1);
  if (plat.student) v *= plat.student;      // 平台通用学生折扣
  if (p.stu) v *= p.stu;                    // 商品专属教育优惠
  return v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
}

/** 某商品的六平台估算最低价(不含二手) */
function estMin(p) {
  return Math.min.apply(null, NEW_KEYS.map(k => estPrice(p, k, 0)));
}

/* 各品类参考价中位数 —— 给库外关键词一个合理的估算基准 */
const CAT_MEDIAN = (() => {
  const out = {};
  for (const c of CATEGORIES) {
    const list = CATALOG.filter(p => p.cat === c.name).map(p => p.base).sort((a, b) => a - b);
    out[c.name] = list.length ? list[Math.floor(list.length / 2)] : 100;
  }
  return out;
})();

/** 把一个库外关键词包装成临时商品对象 */
function makeCustomProduct(keyword) {
  const kw = normalizeKeyword(keyword);
  const cat = guessCategory(kw) || '数码3C';
  return {
    id: 'custom',
    name: kw,
    cat,
    emoji: '🔎',
    base: CAT_MEDIAN[cat] || 100,
    sell: '未收录的关键词,按「' + cat + '」品类中位价估算',
    aliases: '',
    scenes: [],
    custom: true
  };
}

/* ---------- 价格波动(12 个月,确定性生成) ---------- */
const MONTHS = ['10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'];
/* 11月双11、6月618、9月开学季偏低 */
const SEASON = [1.02, 0.88, 0.99, 0.99, 1.01, 0.97, 1.00, 1.02, 0.90, 1.03, 1.04, 0.96];

function trendSeries(p) {
  const seed = typeof p.id === 'number' ? p.id : hashSeed(p.name);
  const vals = MONTHS.map((m, i) =>
    Math.round(p.base * SEASON[i] * (0.97 + prand(seed * 37 + i * 13) * 0.06))
  );
  return { vals, current: vals[11] };
}

/* ============================================================
   状态
   ============================================================ */
const state = {
  cat: '全部',
  scene: '全部',
  term: '',
  sort: 'hot',
  directKeyword: '',
  favorites: new Set()
};

const FAV_KEY = 'cp_save_v1';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) JSON.parse(raw).forEach(id => state.favorites.add(+id));
  } catch (e) { /* 隐私模式下 localStorage 可能不可用,忽略即可 */ }
}
function persistFavorites() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(state.favorites)));
  } catch (e) { /* 同上 */ }
}

/* ============================================================
   Toast
   ============================================================ */
let toastTimer = null;
function toast(msg) {
  let t = $('#toast2');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast2';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2800);
}

/* ============================================================
   一、直达比价区(核心功能)
   ============================================================ */

/** 渲染任意关键词的六平台直达卡片 */
function renderDirect(keyword) {
  const kw = normalizeKeyword(keyword);
  const box = $('#directBox');
  const titleEl = $('#directKw');

  if (!isUsableKeyword(kw)) {
    state.directKeyword = '';
    titleEl.textContent = '输入任意商品,一键直达六大平台';
    box.innerHTML = '<div class="direct-empty">在上方搜索框里输入你想买的东西 —— 任何商品都可以,<br>这里会生成拼多多 / 淘宝 / 京东 / 唯品会 / 得物 / 闲鱼的实时搜索入口。</div>';
    return;
  }

  state.directKeyword = kw;
  const links = buildLinks(kw);
  const cat = guessCategory(kw);
  const hitCount = searchCatalog(kw).length;

  titleEl.innerHTML = `「<span>${esc(kw)}</span>」的六平台实时入口`;

  /* 顶部提示:说清楚本站能做什么、不能做什么,以及"为什么要先登录" */
  const loginNames = links.filter(l => l.needsLogin).map(l => l.short).join(' / ');
  const hint = `
    <div class="direct-hint">
      🛰️ 本站不做抓取、不存储价格 —— 点击下面的按钮会<strong>直接打开该平台的搜索页</strong>,
      价格以平台实时显示的为准。
      ${links.some(l => l.needsLogin) ? `<br>🔒 <strong>需要先登录的平台:${esc(loginNames)}</strong>。
      这些平台对未登录访客会先跳登录页,<strong>这是平台自身的要求,不是本站的问题</strong>;
      在浏览器里登录过一次之后,再回来点直达就能一步看到价格。` : ''}
      ${links.some(l => !l.needsLogin) ? `<br>✅ ${esc(links.filter(l => !l.needsLogin).map(l => l.short).join(' / '))} 免登录可直接查看。` : ''}
      ${cat ? `<br>关键词识别为「${esc(cat)}」类目。` : ''}
      ${hitCount ? `站内已收录 <a href="#grid" data-jump-term="${esc(kw)}" style="color:#1d4ed8;font-weight:700">${hitCount} 件相关商品</a>,可看估算对比。` : ''}
    </div>`;

  const cards = links.map(l => {
    const variants = l.variants.length
      ? `<div class="plat-vars">${l.variants.map(v => `<a href="${esc(v.url)}" target="_blank" rel="noopener nofollow">${esc(v.label)} ↗</a>`).join('')}</div>`
      : '';
    /* 实测结论如实标注:需要登录的给警示,免登录的给确认 */
    const warn = l.needsLogin
      ? `<div class="plat-warn">🔒 <span>${esc(l.statusNote)},首次会先跳到登录页</span></div>`
      : `<div class="plat-warn ok">✓ <span>${esc(l.statusNote)}</span></div>`;
    /* 有真学生折扣才用 🎓,没有的(如拼多多的"无需认证")用 💡,避免误导 */
    const stuLine = l.studentLabel
      ? `<div class="plat-stu">${l.student ? '🎓' : '💡'} ${esc(l.studentLabel)}</div>`
      : '';

    return `
      <div class="plat-card ${l.used ? 'used' : ''}" style="--pc:${l.color};--pcs:${l.colorSoft}">
        <div class="plat-top">
          <div class="plat-icon">${l.icon}</div>
          <div>
            <div class="plat-name">${esc(l.name)}</div>
            <div class="plat-sub">${esc(l.ship)}${l.used ? ' · 二手参考' : ''}</div>
          </div>
        </div>
        <div class="plat-promo">${esc(l.promo)}<br><span style="color:#94a3b8">${esc(l.note)}</span></div>
        ${stuLine}
        <a class="plat-go" href="${esc(l.url)}" target="_blank" rel="noopener nofollow">去${esc(l.short)}看实时价 ↗</a>
        ${variants}
        ${warn}
      </div>`;
  }).join('');

  box.innerHTML = hint + `<div class="direct-grid">${cards}</div>`;
}

/* "复制全部链接" —— 方便贴到群里慢慢看 */
function copyAllLinks() {
  const kw = state.directKeyword;
  if (!kw) { toast('先输入一个商品关键词'); return; }
  const lines = buildLinks(kw).map(l => `${l.name}：${l.url}`);
  copyText(`【${kw}】六平台比价入口\n${lines.join('\n')}\n—— 来自 学省 CampusPrice`,
    `已复制「${kw}」的 ${lines.length} 条平台链接`);
}

/** 打开全部六个平台(浏览器可能拦截弹窗,所以明确告知) */
function openAllLinks() {
  const kw = state.directKeyword;
  if (!kw) { toast('先输入一个商品关键词'); return; }
  const links = buildLinks(kw).filter(l => !l.used);   // 二手平台不自动打开
  links.forEach(l => window.open(l.url, '_blank', 'noopener'));
  toast(`已尝试打开 ${links.length} 个平台,如有拦截请允许弹出窗口`);
}

function copyText(text, okMsg) {
  const done = () => toast(okMsg);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); }
  catch (e) { toast('复制失败,请手动选择文本'); }
  document.body.removeChild(ta);
}

/* ============================================================
   二、商品榜单
   ============================================================ */

function currentList() {
  let list = searchCatalog(state.term, { cat: state.cat, scene: state.scene });
  if (state.sort === 'price-asc') list = list.slice().sort((a, b) => a.base - b.base);
  else if (state.sort === 'price-desc') list = list.slice().sort((a, b) => b.base - a.base);
  else if (state.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  return list;
}

function renderGrid() {
  const grid = $('#gridList');
  const list = currentList();
  const note = $('#resultNote');

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty">
        <span class="em">🔍</span>
        <b>站内没有收录「${esc(state.term)}」</b>
        <div>不过没关系 —— 这完全不影响比价。</div>
        <div style="margin-top:14px">
          <button class="btn btn-primary" id="emptyDirect">生成「${esc(state.term)}」的六平台实时入口 →</button>
        </div>
      </div>`;
    note.innerHTML = `站内收录 ${CATALOG.length} 件校园高频好物,没搜到就直接用上面的全网直达。`;
    const btn = $('#emptyDirect');
    if (btn) btn.addEventListener('click', () => doSearch(state.term));
    return;
  }

  grid.innerHTML = list.map(p => {
    const min = estMin(p);
    const save = Math.round((1 - min / p.base) * 100);
    const cat = CAT_MAP[p.cat] || {};
    const faved = state.favorites.has(p.id);

    const cells = CARD_KEYS.map(key => {
      const plat = PLAT_MAP[key];
      const price = estPrice(p, key, 0);
      const isBest = !plat.used && price === min;
      return `<div class="p4 ${isBest ? 'best' : ''}">
        <div class="pn">${esc(plat.short)}${plat.used ? '·二手' : ''}</div>
        <div class="pv">~${num(price)}</div>
      </div>`;
    }).join('');

    return `
      <article class="card" data-id="${p.id}">
        <div class="card-thumb" style="background:${cat.grad || '#eef2f7'}">
          <button class="card-fav ${faved ? 'on' : ''}" data-fav="${p.id}"
                  title="${faved ? '从省钱清单移除' : '加入省钱清单'}"
                  aria-label="${faved ? '从省钱清单移除' : '加入省钱清单'}">${faved ? '★' : '☆'}</button>
          <span class="em">${p.emoji}</span>
          <span class="card-cat">${esc(p.cat)}</span>
          ${save > 0 ? `<span class="card-save">约省 ${save}%</span>` : ''}
        </div>
        <h3 class="card-name">${esc(p.name)}</h3>
        <p class="card-sell">${esc(p.sell)}</p>
        <div class="card-p4">${cells}</div>
        <div class="card-btn"><button type="button">查看完整比价与波动 →</button></div>
      </article>`;
  }).join('');

  /* 估算口径必须在列表上就说清楚,不能只藏在角落小字里。
     这里不再额外挂 .est-tag 角标 —— 文字里已经写了"估算参考",重复反而啰嗦。 */
  note.innerHTML = `共 <b>${list.length}</b> 件 · 卡片价格均为<strong>估算参考值,不是实时价</strong>,真实价格请点进卡片或用上方全网直达查看`;
}

/* ============================================================
   三、站内六平台估算比价
   ============================================================ */
function loadCompare(p) {
  const isCustom = !!p.custom;

  /* 让下拉框与当前比价的商品保持同步 ——
     从商品卡片点进来时如果不同步,下拉还显示上一个商品,很容易看错。 */
  if (!isCustom) {
    const sel = $('#cmpSelect');
    if (sel && String(sel.value) !== String(p.id)) sel.value = String(p.id);
  }

  $('#cmpCur').innerHTML =
    `📦 当前比价:<b>${p.emoji} ${esc(p.name)}</b>(${esc(p.cat)}) · ` +
    `参考价基准 ${fmt(p.base)}<span class="est-tag">估算</span>` +
    (isCustom ? ' · <span style="color:#d97706">关键词未收录,按品类中位价估算</span>' : '');

  const rows = PLATFORMS.slice().sort((a, b) => a.priority - b.priority).map(plat => {
    const price = estPrice(p, plat.key, 0);
    const stuOn = !!(plat.student || (p.stu && !plat.used));
    return { plat, price, stuOn };
  });

  const news = rows.filter(r => !r.plat.used);
  const min = Math.min.apply(null, news.map(r => r.price));
  const best = news.find(r => r.price === min);
  const usedRow = rows.find(r => r.plat.used);
  const vsBase = Math.round((1 - min / p.base) * 100);

  $('#cmpSummary').innerHTML = `
    <div class="src-stat"><div class="m-num green">${fmt(min)}</div><div class="m-lbl">最低估算到手 · ${esc(best.plat.name)}<span class="est-tag">估算</span></div></div>
    <div class="src-stat"><div class="m-num">${usedRow ? fmt(usedRow.price) : '—'}</div><div class="m-lbl">二手参考(闲鱼,不计入最低)</div></div>
    <div class="src-stat"><div class="m-num orange">约省 ${vsBase}%</div><div class="m-lbl">相对参考价的估算节省</div></div>`;

  /* 桌面:表格 */
  $('#cmpBody').innerHTML = rows.map(r => {
    const isBest = !r.plat.used && r.price === min;
    const stuTxt = p.stu && !r.plat.used && p.stu < 0.93
      ? `教育优惠 ${Math.round((1 - p.stu) * 100)}折`
      : (r.plat.studentLabel || '学生优惠');
    const stu = r.stuOn ? `<span class="stu-tag">${esc(stuTxt)}</span>` : '';
    return `
    <tr class="${isBest ? 'best' : ''}">
      <td class="ch-name"><span class="plat-dot" style="background:${r.plat.color}"></span>${r.plat.icon} ${esc(r.plat.name)}</td>
      <td class="est">~${num(r.price)}</td>
      <td><span class="promo-tag">${esc(r.plat.promo)}</span></td>
      <td>${stu}</td>
      <td><b class="est" style="${isBest ? 'color:#047857' : ''}">~${num(r.price)}</b>${isBest ? '<span class="price-badge">估算最低</span>' : ''}</td>
      <td>${esc(r.plat.ship)}</td>
      <td><a class="buy-link" href="${esc(buyUrl(r.plat.key, p.name))}" target="_blank" rel="noopener nofollow">查实时价 ↗</a></td>
    </tr>`;
  }).join('');

  /* 移动端:卡片 */
  $('#cmpMobile').innerHTML = rows.map(r => {
    const isBest = !r.plat.used && r.price === min;
    return `
    <div class="cmp-mcard ${isBest ? 'best' : ''}" style="--pc:${r.plat.color}">
      <div class="mc-top">
        <div class="mc-name">${r.plat.icon} ${esc(r.plat.name)}</div>
        <div class="mc-price ${isBest ? '' : 'est'}" style="${isBest ? 'color:#047857' : ''}">~${num(r.price)}</div>
      </div>
      <div class="mc-row">
        <span class="promo-tag">${esc(r.plat.promo)}</span>
        ${r.stuOn ? `<span class="stu-tag">🎓 ${esc(r.plat.studentLabel || '学生优惠')}</span>` : ''}
        <span>${esc(r.plat.ship)}</span>
      </div>
      <div style="margin-top:9px">
        <a class="buy-link" href="${esc(buyUrl(r.plat.key, p.name))}" target="_blank" rel="noopener nofollow">去${esc(r.plat.short)}查实时价 ↗</a>
      </div>
    </div>`;
  }).join('');

  renderTrend(p);
}

/* ---------- 价格波动:手写 SVG,不依赖 Chart.js ---------- */
function renderTrend(p) {
  const { vals, current } = trendSeries(p);
  const min = Math.min.apply(null, vals);
  const max = Math.max.apply(null, vals);
  const minIdx = vals.indexOf(min);
  const maxIdx = vals.indexOf(max);
  const gapPct = Math.round((current - min) / min * 100);

  let advice, color;
  if (gapPct <= 3) { advice = '✅ 估算当前价接近全年低点,刚需可以入手'; color = '#059669'; }
  else if (gapPct <= 8) { advice = '👍 估算当前价处于较低位,刚需可直接买'; color = '#0ea5e9'; }
  else if (gapPct <= 15) { advice = `⏳ 估算当前比全年低点高 ${gapPct}%,不急可蹲 618 / 双11`; color = '#d97706'; }
  else { advice = `🛑 估算当前比全年低点高 ${gapPct}%,建议加购物车等大促`; color = '#dc2626'; }

  $('#piBox').innerHTML = `
    <div class="pi-line"><span>当前估算(9月)</span><b>${fmt(current)}</b></div>
    <div class="pi-line"><span>全年估算低点(${MONTHS[minIdx]})</span><b style="color:#047857">${fmt(min)}</b></div>
    <div class="pi-line"><span>全年估算高点(${MONTHS[maxIdx]})</span><b style="color:#dc2626">${fmt(max)}</b></div>
    <div class="pi-line"><span>估算波动幅度</span><b>${Math.round((max - min) / min * 100)}%</b></div>
    <div class="pi-advice" style="background:${color}14;color:${color}">${advice}</div>
    <div style="margin-top:9px;font-size:11.5px;color:#94a3b8">以上是按品类促销规律生成的估算曲线,不是真实历史成交价</div>`;

  $('#trendChart').innerHTML = buildSparkSVG(vals, minIdx, MONTHS);
}

/**
 * 生成价格走势 SVG。
 * 用原生 SVG 而不是 Chart.js:省掉 200KB+ 的 CDN 依赖,首屏不再被第三方阻塞。
 */
function buildSparkSVG(vals, minIdx, labels) {
  const W = 560, H = 230;
  const padL = 52, padR = 14, padT = 18, padB = 30;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const min = Math.min.apply(null, vals);
  const max = Math.max.apply(null, vals);
  const span = (max - min) || 1;
  /* 上下留一点余量,曲线不贴边 */
  const y = v => padT + ih - ((v - min) / span * 0.88 + 0.06) * ih;
  const x = i => padL + (vals.length === 1 ? iw / 2 : i * iw / (vals.length - 1));
  const pts = vals.map((v, i) => [x(i), y(v)]);
  const line = pts.map((pt, i) => (i ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' ');
  const area = line + ` L ${pts[pts.length - 1][0].toFixed(1)} ${padT + ih} L ${pts[0][0].toFixed(1)} ${padT + ih} Z`;

  /* y 轴三条参考线 */
  const gridVals = [max, min + span / 2, min];
  const grid = gridVals.map(v => {
    const yy = y(v).toFixed(1);
    return `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="rgba(15,23,42,.08)" stroke-dasharray="3 4"/>
            <text x="${padL - 8}" y="${(+yy + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#94a3b8">¥${Math.round(v)}</text>`;
  }).join('');

  /* x 轴:隔月标一次避免拥挤,但【首月和末月必须标】—— 
     末月就是"当前",是整个图最该被看懂的点,漏掉它等于图没画完。 */
  const lastIdx = labels.length - 1;
  const xlabels = labels.map((m, i) => {
    if (i % 2 !== 0 && i !== lastIdx) return '';
    return `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11"
             fill="${i === lastIdx ? '#2563eb' : '#94a3b8'}"
             font-weight="${i === lastIdx ? '700' : '400'}">${m}</text>`;
  }).join('');

  const dots = pts.map((pt, i) => {
    const isMin = i === minIdx;
    const isCur = i === vals.length - 1;
    if (!isMin && !isCur) return '';
    const c = isMin ? '#059669' : '#2563eb';
    return `<circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="5" fill="${c}" stroke="#fff" stroke-width="2.5"/>`;
  }).join('');

  return `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="近一年估算价格走势">
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(37,99,235,.26)"/>
        <stop offset="100%" stop-color="rgba(37,99,235,0)"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${area}" fill="url(#areaGrad)"/>
    <path d="${line}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${xlabels}
  </svg>`;
}

/* ============================================================
   四、优惠日历
   ============================================================ */
const CAL = [
  { m: 1, name: '年货节', d: '寒假返乡前,囤行李与年货好物', lv: 'mid' },
  { m: 2, name: '开学返校', d: '春季开学小促,补漏为主', lv: 'low' },
  { m: 3, name: '38 女神节', d: '美妆洗护全年好价之一', lv: 'mid' },
  { m: 4, name: '品类日', d: '数码家电以旧换新补贴', lv: 'low' },
  { m: 5, name: '五一大促', d: '提前练手比价,不急不买', lv: 'mid' },
  { m: 6, name: '618 大促', d: '上半年最大力度 ⭐ 大件必等', lv: 'high' },
  { m: 7, name: '暑促清仓', d: '夏品清仓,返校装备提前看', lv: 'low' },
  { m: 8, name: '暑期数码节', d: '电脑数码教育优惠黄金窗口', lv: 'mid' },
  { m: 9, name: '开学季', d: '宿舍用品 / 文具 / 数码专场', lv: 'mid' },
  { m: 10, name: '养草期', d: '无大促:加购物车 + 锁好价等双11', lv: 'low' },
  { m: 11, name: '双11', d: '全年最大力度 ⭐ 囤一年用量', lv: 'high' },
  { m: 12, name: '双12', d: '双11 补漏,日用品捡漏', lv: 'mid' }
];

function renderCalendar() {
  const nowM = new Date().getMonth() + 1;
  /* 从 9 月开始的学年视角 */
  const order = CAL.slice(8).concat(CAL.slice(0, 8));
  $('#calGrid').innerHTML = order.map(c => {
    const lvTxt = c.lv === 'high'
      ? '<span class="cal-badge highb">全年力度大</span>'
      : c.lv === 'mid' ? '<span class="cal-badge midb">力度中等</span>'
        : '<span class="cal-badge lowb">力度较小</span>';
    const now = c.m === nowM ? '<span class="cal-badge nowb">当前</span>' : '';
    return `<div class="cal-card ${c.m === nowM ? 'now' : ''} ${c.lv === 'high' ? 'hot' : ''}">
      <div class="cal-m">${c.m}月${now}${lvTxt}</div>
      <b>${esc(c.name)}</b><p>${esc(c.d)}</p>
    </div>`;
  }).join('');
}

/* ============================================================
   五、省钱清单
   ============================================================ */
function renderFavCount() {
  const n = state.favorites.size;
  $$('.save-count').forEach(el => {
    el.textContent = n;
    el.style.display = n ? '' : 'none';
  });
}

function renderSavePanel() {
  const body = $('#saveBody');
  const items = CATALOG.filter(p => state.favorites.has(p.id));

  if (!items.length) {
    body.innerHTML = '<div class="save-empty"><span class="em">📝</span>清单还是空的<br>点商品卡左上角的 ☆ 把想买的东西存进来</div>';
    $('#saveFoot').style.display = 'none';
    return;
  }

  body.innerHTML = items.map(p => {
    const cat = CAT_MAP[p.cat] || {};
    return `
      <div class="save-item">
        <div class="si-thumb" style="background:${cat.grad || '#eef2f7'}">${p.emoji}</div>
        <div class="si-main">
          <div class="si-name">${esc(p.name)}</div>
          <div class="si-meta">${esc(p.cat)} · 估算最低 <b class="est">~${num(estMin(p))}</b></div>
        </div>
        <button class="si-del" data-unfav="${p.id}" title="移除" aria-label="移除">✕</button>
      </div>`;
  }).join('');

  /* 汇总用的是估算价,必须写明 */
  const total = items.reduce((s, p) => s + estMin(p), 0);
  const rawTotal = items.reduce((s, p) => s + p.base, 0);
  $('#saveFoot').style.display = '';
  $('#saveTotal').innerHTML =
    `<span>共 ${items.length} 件 · 估算合计</span>
     <span class="st-num">${fmt(total)}</span>`;
  $('#saveSub').textContent = rawTotal > 0
    ? `按各平台估算最低价相加,比参考价合计 ${fmt(rawTotal)} 约省 ${Math.round((1 - total / rawTotal) * 100)}%`
    : '';
}

function toggleFav(id) {
  if (state.favorites.has(id)) { state.favorites.delete(id); toast('已从清单移除'); }
  else { state.favorites.add(id); toast('已加入省钱清单 ★'); }
  persistFavorites();
  renderFavCount();
  renderSavePanel();
  renderGrid();
}

function openSavePanel(on) {
  $('#savePanel').classList.toggle('open', on);
  $('#scrim').classList.toggle('on', on);
  $('#savePanel').setAttribute('aria-hidden', on ? 'false' : 'true');
}

/** 复制清单:每件商品给出六平台直达链接 */
function copySaveList() {
  const items = CATALOG.filter(p => state.favorites.has(p.id));
  if (!items.length) { toast('清单是空的'); return; }
  const lines = items.map(p => {
    const links = buildLinks(p.name);
    return `· ${p.name}(估算最低 ~${num(estMin(p))})\n  ${links.map(l => l.url).join('\n  ')}`;
  });
  const total = items.reduce((s, p) => s + estMin(p), 0);
  copyText(
    `【我的省钱清单】共 ${items.length} 件,估算合计 ~${num(total)}\n${lines.join('\n')}\n—— 来自 学省 CampusPrice`,
    '清单已复制,可粘贴到备忘录'
  );
}

/* ============================================================
   六、搜索(hero 搜索框 + 移动端搜索条共用一套逻辑)
   ============================================================ */
let suggestIndex = -1;

function showSuggest(term, boxEl) {
  const kw = normalizeKeyword(term);
  if (!kw) { boxEl.classList.remove('show'); return; }
  const hits = searchCatalog(kw, null, 6);
  const rows = hits.map(p =>
    `<button type="button" data-term="${esc(p.name)}">
       <span>${p.emoji} ${esc(p.name)}</span><span class="sg-cat">${esc(p.cat)}</span>
     </button>`).join('');

  boxEl.innerHTML =
    (hits.length ? `<div class="sg-head">站内收录</div>${rows}` : '<div class="sg-head">站内未收录</div>') +
    `<button type="button" class="sg-all" data-term="${esc(kw)}">
       <span>🛰️ 直接搜「${esc(kw)}」的六平台实时价</span><span class="sg-cat">全网直达</span>
     </button>`;
  boxEl.classList.add('show');
  suggestIndex = -1;
}

/** 统一入口:输入一个词,决定是展示站内榜单还是直接走全网直达 */
function doSearch(term) {
  const kw = normalizeKeyword(term);
  if (!kw) { toast('请输入想买的商品'); return; }

  const hits = searchCatalog(kw);
  gotoDirect(kw);                       // 无论有没有收录,直达区都要更新

  if (hits.length) {
    state.term = kw; state.cat = '全部'; state.scene = '全部';
    syncChips();
    renderGrid();
    toast(`站内收录 ${hits.length} 件相关商品,已为你估算比价`);
    document.getElementById('grid').scrollIntoView({ behavior: 'smooth' });
  } else {
    /* 没收录也要把榜单切到"空结果"状态。
       否则列表会留着上一次的 221 件商品,让人误以为搜索命中了它们。 */
    state.term = kw; state.cat = '全部'; state.scene = '全部';
    syncChips();
    renderGrid();
    toast(`站内未收录「${kw}」,已生成六平台实时搜索入口`);
    document.getElementById('direct').scrollIntoView({ behavior: 'smooth' });
  }
}

/** 更新直达区,并同步两处搜索框 */
function gotoDirect(kw) {
  renderDirect(kw);
  const heroInput = $('#searchInput');
  const mInput = $('#mobileInput');
  if (heroInput) heroInput.value = kw;
  if (mInput) mInput.value = kw;
}

/* ============================================================
   七、筛选栏同步
   ============================================================ */
function syncChips() {
  $$('#tabs .chip').forEach(b => b.classList.toggle('active', b.dataset.cat === state.cat));
  $$('#scenes .chip').forEach(b => b.classList.toggle('active', b.dataset.scene === state.scene));
}

/* ============================================================
   八、事件绑定
   ============================================================ */
function bind() {
  /* --- hero 搜索 --- */
  const searchForm = $('#searchForm');
  const searchInput = $('#searchInput');
  const searchSuggest = $('#searchSuggest');

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    searchSuggest.classList.remove('show');
    doSearch(searchInput.value);
  });
  searchInput.addEventListener('input', () => showSuggest(searchInput.value, searchSuggest));
  searchInput.addEventListener('focus', () => showSuggest(searchInput.value, searchSuggest));
  searchInput.addEventListener('keydown', e => {
    const btns = $$('button', searchSuggest);
    if (!btns.length || !searchSuggest.classList.contains('show')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      suggestIndex = (suggestIndex + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length;
      btns[suggestIndex].focus();
    } else if (e.key === 'Escape') {
      searchSuggest.classList.remove('show');
    }
  });
  searchSuggest.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    e.preventDefault();
    searchSuggest.classList.remove('show');
    doSearch(btn.dataset.term);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.search')) searchSuggest.classList.remove('show');
  });

  /* --- 移动端搜索条 --- */
  $('#mobileForm').addEventListener('submit', e => {
    e.preventDefault();
    doSearch($('#mobileInput').value);
  });

  /* --- 直达区按钮 --- */
  $('#copyAll').addEventListener('click', copyAllLinks);
  $('#openAll').addEventListener('click', openAllLinks);

  /* 直达区里的"站内 N 件相关商品"跳转 */
  $('#directBox').addEventListener('click', e => {
    const a = e.target.closest('[data-jump-term]');
    if (!a) return;
    e.preventDefault();
    state.term = a.dataset.jumpTerm; state.cat = '全部'; state.scene = '全部';
    syncChips(); renderGrid();
    document.getElementById('grid').scrollIntoView({ behavior: 'smooth' });
  });

  /* --- 品类 / 场景筛选 ---
     点品类或场景等于"我要开始逛了",所以要清掉上一次的搜索词。
     不清的话,搜完「螺蛳粉」再点「数码3C」会得到空列表,看起来像坏了。 */
  $('#tabs').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    state.cat = btn.dataset.cat;
    state.term = '';
    if (state.cat === '全部') state.scene = '全部';
    syncChips(); renderGrid();
  });
  $('#scenes').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    state.scene = state.scene === btn.dataset.scene ? '全部' : btn.dataset.scene;
    state.term = '';
    syncChips(); renderGrid();
  });
  $('#sortSel').addEventListener('change', e => {
    state.sort = e.target.value;
    renderGrid();
  });

  /* --- 商品卡片:收藏 / 查看比价 --- */
  $('#gridList').addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.stopPropagation(); toggleFav(+fav.dataset.fav); return; }

    const card = e.target.closest('.card');
    if (!card) return;
    const p = CATALOG.find(x => x.id === +card.dataset.id);
    if (!p) return;
    loadCompare(p);
    gotoDirect(p.name);
    document.getElementById('compare').scrollIntoView({ behavior: 'smooth' });
  });

  /* --- 比价区商品选择 --- */
  $('#cmpSelect').addEventListener('change', e => {
    const p = CATALOG.find(x => x.id === +e.target.value);
    if (p) { loadCompare(p); gotoDirect(p.name); }
  });

  /* --- 省钱清单 --- */
  $('#navSave').addEventListener('click', () => openSavePanel(true));
  $('#saveClose').addEventListener('click', () => openSavePanel(false));
  $('#scrim').addEventListener('click', () => openSavePanel(false));
  $('#copySave').addEventListener('click', copySaveList);
  $('#clearSave').addEventListener('click', () => {
    if (!state.favorites.size) { toast('清单已经是空的'); return; }
    state.favorites.clear();
    persistFavorites(); renderFavCount(); renderSavePanel(); renderGrid();
    toast('清单已清空');
  });
  $('#saveBody').addEventListener('click', e => {
    const del = e.target.closest('[data-unfav]');
    if (del) toggleFav(+del.dataset.unfav);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') openSavePanel(false);
  });

  /* --- 导航 --- */
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });
  $('#burger').addEventListener('click', () => $('#navMenu').classList.toggle('open'));
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => $('#navMenu').classList.remove('open')));
}

/* ============================================================
   九、动效
   ============================================================ */
function initMotion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const countObs = new IntersectionObserver((es, obs) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      countUp(e.target, reduce);
      obs.unobserve(e.target);
    });
  }, { threshold: .4 });
  $$('.stats .num').forEach(el => countObs.observe(el));

  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
}

function countUp(el, instant) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  if (instant) { el.textContent = target + suffix; return; }
  const t0 = performance.now(), dur = 1100;
  (function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ============================================================
   十、初始化
   ============================================================ */
function init() {
  loadFavorites();

  /* 统计数字与商品库保持一致,写死会很快过期 */
  const statMap = { '#statPlat': SITE_STATS.platforms, '#statProd': SITE_STATS.products, '#statCal': CAL.length, '#statScene': SITE_STATS.scenes };
  Object.keys(statMap).forEach(k => {
    const el = $(k);
    if (el) el.dataset.count = statMap[k];
  });

  /* 比价下拉框:按品类分组 */
  $('#cmpSelect').innerHTML = CATEGORIES.map(c => {
    const opts = CATALOG.filter(p => p.cat === c.name)
      .map(p => `<option value="${p.id}">${esc(p.name)}(${fmt(p.base)})</option>`).join('');
    return `<optgroup label="${esc(c.icon + ' ' + c.name)}">${opts}</optgroup>`;
  }).join('');

  bind();
  initMotion();
  renderFavCount();
  renderSavePanel();
  renderGrid();
  renderCalendar();
  loadCompare(CATALOG[0]);

  /* 首屏默认给一个可直接用的直达示例,不留空白 */
  renderDirect('蓝牙耳机');

  /* 支持 ?q= 分享(从聊天里点进来直接出结果) */
  const q = new URLSearchParams(location.search).get('q');
  if (q) doSearch(q);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
