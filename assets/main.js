/* ============ 学省 CampusPrice · 交互逻辑 ============ */

/* ---------- 商品数据(价格为演示样例) ---------- */
const P = [
  {id:1, name:'无线蓝牙耳机', cat:'数码3C', emoji:'🎧', img:'1505740420928-5e560c06d30e', base:199,
   sell:'降噪+长续航,网课通勤两相宜'},
  {id:2, name:'快充充电宝 20000mAh', cat:'数码3C', emoji:'🔋', img:'1511707171634-5f897ff02aa9', base:129,
   sell:'图书馆/教室续命刚需,可上飞机'},
  {id:3, name:'轻薄笔记本电脑', cat:'数码3C', emoji:'💻', img:'1496181133206-80ce9b88a853', base:4999, stu:0.92,
   sell:'写论文跑课表,教育优惠大件首选'},
  {id:4, name:'桌面护眼台灯', cat:'宿舍生活', emoji:'💡', img:'1507473885765-e6ed057f782c', base:79,
   sell:'熄灯后学习不伤眼'},
  {id:5, name:'宿舍折叠收纳箱', cat:'宿舍生活', emoji:'📦', img:'1584622650111-993a426fbf0a', base:49,
   sell:'小宿舍扩容神器,换季衣物收纳'},
  {id:6, name:'全棉床上三件套', cat:'宿舍生活', emoji:'🛏️', img:'1522771739844-6a9f6d5f14af', base:139,
   sell:'开学必买,睡得好才学得好'},
  {id:7, name:'迷你加湿器', cat:'宿舍生活', emoji:'💧', img:'1570172619644-dfd03ed5d881', base:59,
   sell:'秋冬干燥季宿舍救星'},
  {id:8, name:'大容量保温杯', cat:'宿舍生活', emoji:'🚰', img:'1602143407151-7111542de6e8', base:89,
   sell:'早八热水自由,图书馆带水标配'},
  {id:9, name:'氨基酸洗面奶', cat:'洗护美妆', emoji:'🧴', img:'1556228453-efd6c1ff04f6', base:69,
   sell:'温和清洁,男女通用'},
  {id:10, name:'保湿面霜', cat:'洗护美妆', emoji:'🧖', img:'1571781926291-c477ebfd024b', base:99,
   sell:'秋冬防干裂,军训后修复'},
  {id:11, name:'考研英语全套资料', cat:'文具书籍', emoji:'📚', img:'1481627834876-b7833e8f5570', base:158,
   sell:'真题+解析一站式,自习室人手一套'},
  {id:12, name:'桌面文具套装', cat:'文具书籍', emoji:'✏️', img:'1456735190827-d1262f71b8a3', base:39,
   sell:'笔记好物组合装,开学补货首选'},
  {id:13, name:'春秋百搭运动鞋', cat:'运动出行', emoji:'👟', img:'1542291026-7eec264c27ff', base:269,
   sell:'体测/通勤/约会一双搞定'},
  {id:14, name:'大容量双肩背包', cat:'运动出行', emoji:'🎒', img:'1553062407-98eeb64c6a62', base:119,
   sell:'书本电脑雨伞全装下,护脊减负'},
  {id:15, name:'便携晴雨伞', cat:'运动出行', emoji:'☂️', img:'1519692933481-e162a57d6721', base:45,
   sell:'防晒防雨两用,塞进书包无压力'}
];

/* ---------- 平台档案(multi: 相对标价倍率 / student: 学生折上折) ---------- */
const PLATS = [
  {key:'jd',  name:'京东',        icon:'🐶',  multi:1.00, ship:'次日达',      promos:['满199减20','PLUS会员95折'], student:0.95, stuLabel:'学生认证95折'},
  {key:'tb',  name:'淘宝/天猫',   icon:'🛍️', multi:0.97, ship:'3天左右',     promos:['跨店满300-50','淘金币抵扣'], student:0.95, stuLabel:'88VIP学生95折'},
  {key:'pdd', name:'拼多多',      icon:'🧧',  multi:0.89, ship:'3-5天',       promos:['百亿补贴','限时秒杀'],       student:null,  stuLabel:'百亿补贴已低价'},
  {key:'vip', name:'唯品会',      icon:'🎀',  multi:0.94, ship:'2-4天',       promos:['特卖3折起','满259减40'],     student:null,  stuLabel:null},
  {key:'dw',  name:'得物',        icon:'🧢',  multi:1.06, ship:'3-6天(查验)', promos:['新人立减券','正品查验'],     student:0.98,  stuLabel:'学生认证98折'},
  {key:'xy',  name:'闲鱼(二手)',  icon:'♻️', multi:0.60, ship:'看卖家',      promos:['个人闲置95新','验货宝'],     student:null,  stuLabel:null, used:true}
];
const PROMO_TAG_CLS = 'promo-tag';

/* 学生认证优惠汇总(静态展示) */
const stuExtra = p => p.stu || null; /* 部分大件有专属学生折扣(如笔记本教育优惠) */

/* ---------- 价格波动(12个月,含大促 dips) ---------- */
const MONTHS = ['10月','11月','12月','1月','2月','3月','4月','5月','6月','7月','8月','9月'];
const SEASON = [1.02,0.88,0.99,0.99,1.01,0.97,1.00,1.02,0.90,1.03,1.04,0.96]; /* 11月双11、6月618、9月开学季偏低 */
function prand(seed){ const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); }
function trendSeries(p){
  const vals = MONTHS.map((m,i)=> Math.round(p.base * SEASON[i] * (0.97 + prand(p.id*37 + i*13)*0.06)));
  return { vals, current: vals[11] };
}

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
const imgUrl = (id,w)=>`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
const fmt = n => '¥' + (n >= 100 ? Math.round(n) : Math.round(n*10)/10);
function priceFor(p, plat, idx, student){
  let v = p.base * plat.multi * (0.95 + prand(p.id*53 + idx*29)*0.1);
  if (student && (plat.student || p.stu)) v *= (p.stu || plat.student);
  return v >= 100 ? Math.round(v) : Math.round(v*10)/10;
}

/* ---------- 好物榜单 ---------- */
let curCat = '全部', curTerm = '';
const grid = $('#grid'), resultNote = $('#resultNote');

function cardPrices(p){
  /* 卡片上显示 京东/淘宝/拼多多/闲鱼 到手价(二手不叠加学生折扣) */
  return PLATS.filter(x=>['jd','tb','pdd','xy'].includes(x.key)).map(plat=>{
    const price = priceFor(p, plat, 0, !plat.used);
    return {key:plat.key, name:plat.name.split('(')[0], price, used:!!plat.used};
  });
}
function renderGrid(){
  const list = P.filter(p=>(curCat==='全部'||p.cat===curCat) && (!curTerm || p.name.includes(curTerm) || p.cat.includes(curTerm) || p.sell.includes(curTerm)));
  grid.innerHTML = list.map(p=>{
    const ps = cardPrices(p);
    const newPs = ps.filter(x=>!x.used);
    const min = Math.min(...newPs.map(x=>x.price));
    const used = ps.find(x=>x.used);
    const save = Math.round((1 - min/ (p.base*1.0)) * 100);
    return `
    <article class="card" data-id="${p.id}">
      <div class="card-photo" data-emoji="${p.emoji}">
        <img src="${imgUrl(p.img, 640)}" alt="${p.name}" loading="lazy" onerror="this.parentElement.classList.add('noimg')">
        <span class="save-badge">到手约省 ${save}%</span>
      </div>
      <h3 class="card-name">${p.name}</h3>
      <p class="card-sell">${p.sell}</p>
      <div class="card-p4">
        ${ps.map(x=>`<div class="p4 ${!x.used && x.price===min ? 'best':''}"><div class="pn">${x.name}</div><div class="pv">${fmt(x.price)}</div></div>`).join('')}
      </div>
      <button class="card-btn">查看完整比价与波动 →</button>
    </article>`;
  }).join('');
  resultNote.textContent = curTerm
    ? `🔍 搜索“${curTerm}”找到 ${list.length} 件好物 · 价格为演示样例`
    : `📌 按大学生购买热度排序,共 ${list.length} 件好物 · 绿色为四平台最低到手价`;
}
grid.addEventListener('click', e=>{
  const card = e.target.closest('.card'); if(!card) return;
  loadCompare(+card.dataset.id);
  document.getElementById('compare').scrollIntoView({behavior:'smooth'});
});
$('#tabs').addEventListener('click', e=>{
  const btn = e.target.closest('.tab'); if(!btn) return;
  document.querySelectorAll('#tabs .tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  curCat = btn.dataset.cat; curTerm=''; $('#searchInput').value='';
  renderGrid();
});

/* ---------- 跨平台比价 ---------- */
let trendChart = null;
function loadCompare(idOrProduct){
  const p = typeof idOrProduct === 'object' ? idOrProduct : P.find(x=>x.id===idOrProduct);
  $('#cmpSelect').value = p.id;
  $('#cmpCur').innerHTML = `📦 当前比价:<b>${p.emoji} ${p.name}</b>(${p.cat}) · 标价参考 ${fmt(p.base)}`;

  /* 六平台行 */
  const rows = PLATS.map((plat,idx)=>{
    const listPrice = priceFor(p, plat, 0, false);
    const stuOn = !!(plat.student || (p.stu && !plat.used));
    const finalPrice = stuOn ? priceFor(p, plat, 0, true) : priceFor(p, plat, 0, false);
    return {plat, idx, listPrice, stuOn, finalPrice};
  });
  const news = rows.filter(r=>!r.plat.used);
  const min = Math.min(...news.map(r=>r.finalPrice));
  const best = news.find(r=>r.finalPrice===min);
  const usedRow = rows.find(r=>r.plat.used);
  const vsBase = Math.round((1 - min/p.base)*100);

  $('#cmpSummary').innerHTML = `
    <div class="src-stat"><div class="m-num green">${fmt(min)}</div><div class="m-lbl">新货最低到手 · ${best.plat.name}</div></div>
    <div class="src-stat"><div class="m-num">${fmt(usedRow.finalPrice)}</div><div class="m-lbl">二手参考(闲鱼95新,不计入)</div></div>
    <div class="src-stat"><div class="m-num orange">省 ${vsBase}%</div><div class="m-lbl">比标价参考价节省(含学生优惠)</div></div>`;

  $('#cmpBody').innerHTML = rows.map(r=>{
    const isBest = !r.plat.used && r.finalPrice===min;
    const promos = r.plat.promos.map(t=>`<span class="${PROMO_TAG_CLS}">${t}</span>`).join('');
    const stu = r.stuOn
      ? `<span class="stu-tag">${p.stu && !r.plat.used && p.stu<0.93 ? '教育优惠 '+Math.round((1-p.stu)*100)+'折' : r.plat.stuLabel}</span>`
      : (r.plat.stuLabel ? `<span style="color:#94a3b8;font-size:12px">无</span>` : '');
    const href = {jd:'https://www.jd.com',tb:'https://www.taobao.com',pdd:'https://mobile.yangkeduo.com',vip:'https://www.vip.com',dw:'https://www.dewu.com',xy:'https://www.goofish.com'}[r.plat.key] || '#';
    return `
    <tr class="${isBest?'best':''}${r.plat.used?' used':''}">
      <td class="ch-name">${r.plat.icon} ${r.plat.name}</td>
      <td>${fmt(r.listPrice)}</td>
      <td>${promos}</td>
      <td>${stu}</td>
      <td><b style="${isBest?'color:#047857':''}">${fmt(r.finalPrice)}</b>${isBest?'<span class="price-badge">最低到手</span>':''}${r.plat.used?'<span class="strike" style="margin-left:6px">二手参考</span>':''}</td>
      <td>${r.plat.ship}</td>
      <td><a class="buy-link" href="${href}" target="_blank" rel="noopener">去购买 ↗</a></td>
    </tr>`;
  }).join('');

  renderTrend(p);

  /* 学生认证提示 */
  const stuRows = news.filter(r=>r.stuOn);
  if (stuRows.length) {
    const cheapestStu = stuRows.reduce((a,b)=>a.finalPrice<b.finalPrice?a:b);
    $('#cmpCur').innerHTML += ` · <span style="color:#1d4ed8">🎓 完成学生认证,${cheapestStu.plat.name}到手再省 ${fmt(cheapestStu.listPrice-cheapestStu.finalPrice)}</span>`;
  }
}

function renderTrend(p){
  const {vals, current} = trendSeries(p);
  const min = Math.min(...vals), max = Math.max(...vals);
  const minIdx = vals.indexOf(min);
  const gapPct = Math.round((current-min)/min*100);
  let advice, color;
  if (gapPct <= 3){ advice = '✅ 当前价接近全年最低,可以放心入手'; color = '#059669'; }
  else if (gapPct <= 8){ advice = '👍 当前价处于较低位,刚需可直接买'; color = '#0ea5e9'; }
  else if (gapPct <= 15){ advice = `⏳ 当前比全年最低价高 ${gapPct}%,不急可蹲 618 / 双11`; color = '#d97706'; }
  else { advice = `🛑 当前比全年最低价高 ${gapPct}%,建议加购物车等大促`; color = '#dc2626'; }

  $('#piBox').innerHTML = `
    <div class="pi-line"><span>当前价(9月)</span><b>${fmt(current)}</b></div>
    <div class="pi-line"><span>全年最低(${MONTHS[minIdx]})</span><b style="color:#047857">${fmt(min)}</b></div>
    <div class="pi-line"><span>全年最高(${MONTHS[vals.indexOf(max)]})</span><b style="color:#dc2626">${fmt(max)}</b></div>
    <div class="pi-line"><span>价格波动幅度</span><b>${Math.round((max-min)/min*100)}%</b></div>
    <div class="pi-advice" style="background:${color}14;color:${color}">${advice}</div>`;

  if (!window.Chart) return;
  const ctx = document.getElementById('trendChart');
  if (trendChart){ trendChart.destroy(); }
  const grad = ctx.getContext('2d').createLinearGradient(0,0,0,260);
  grad.addColorStop(0,'rgba(37,99,235,.22)');
  grad.addColorStop(1,'rgba(37,99,235,0)');
  const radii = vals.map((v,i)=> i===minIdx ? 6 : (i===11 ? 6 : 3));
  const colors = vals.map((v,i)=> i===minIdx ? '#059669' : (i===11 ? '#2563eb' : '#2563eb'));
  trendChart = new Chart(ctx, {
    type:'line',
    data:{ labels:MONTHS, datasets:[{
      label:p.name, data:vals, borderColor:'#2563eb', backgroundColor:grad,
      fill:true, tension:.35, borderWidth:2.5, pointRadius:radii, pointBackgroundColor:colors
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>` ${MONTHS[c.dataIndex]}:${fmt(c.parsed.y)}${c.dataIndex===minIdx?' (全年最低)':''}`}}
      },
      scales:{ y:{ticks:{callback:v=>'¥'+v}} }
    }
  });
}

const cmpSelect = $('#cmpSelect');
cmpSelect.innerHTML = P.map(p=>`<option value="${p.id}">${p.name}(${fmt(p.base)})</option>`).join('');
cmpSelect.addEventListener('change', ()=> loadCompare(+cmpSelect.value));

/* ---------- 比价搜索(联想+自定义) ---------- */
const cmpSearchForm = $('#cmpSearchForm'), cmpSearch = $('#cmpSearch'), cmpSuggest = $('#cmpSuggest');
function showSuggest(term){
  if (!term){ cmpSuggest.classList.remove('show'); return; }
  const list = P.filter(p=>p.name.includes(term)||p.cat.includes(term)||p.sell.includes(term)).slice(0,8);
  cmpSuggest.innerHTML = list.map(p=>`<button type="button" data-id="${p.id}"><span>${p.emoji} ${p.name}</span><span class="sg-cat">${p.cat}</span></button>`).join('')
    + `<button type="button" data-custom="1"><span class="sg-new">🔎 对「${term}」按类目估算比价</span><span class="sg-cat">估算数据</span></button>`;
  cmpSuggest.classList.add('show');
}
cmpSearch.addEventListener('input', ()=> showSuggest(cmpSearch.value.trim()));
cmpSearch.addEventListener('focus', ()=> showSuggest(cmpSearch.value.trim()));
cmpSuggest.addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  e.preventDefault();
  if (btn.dataset.custom){
    const term = cmpSearch.value.trim(); if(!term) return;
    const g = guessCat(term);
    loadCompare({id:'custom', name:term, cat:g.cat, emoji:'🔎', base:g.base, __seed:strSeed(term)});
  } else {
    const p = P.find(x=>x.id === +btn.dataset.id);
    cmpSelect.value = p.id; cmpSearch.value = p.name;
    loadCompare(p);
  }
  cmpSuggest.classList.remove('show');
});
cmpSearchForm.addEventListener('submit', e=>{
  e.preventDefault();
  const term = cmpSearch.value.trim(); if(!term) return;
  const match = P.find(p=>p.name===term) || P.find(p=>p.name.includes(term)||term.includes(p.name)||p.sell.includes(term));
  if (match){ cmpSelect.value = match.id; loadCompare(match); showToast2('已匹配到站内商品:' + match.name); }
  else {
    const g = guessCat(term);
    loadCompare({id:'custom', name:term, cat:g.cat, emoji:'🔎', base:g.base, __seed:strSeed(term)});
    showToast2('🔎 已生成「' + term + '」的估算比价(演示数据)');
  }
  cmpSuggest.classList.remove('show');
});
document.addEventListener('click', e=>{ if(!e.target.closest('.src-search')) cmpSuggest.classList.remove('show'); });

function strSeed(s){ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h%9973; }
const GUESS_RULES = [
  [/电脑|笔记本|平板|手机|耳机|充电|键盘|鼠标/i,'数码3C',300],
  [/灯|收纳|床|被|壶|杯|加湿|风扇|洗衣/i,'宿舍生活',80],
  [/洗|妆|护肤|面膜|面霜|精华/i,'洗护美妆',70],
  [/书|考研|笔|文具|打印|资料/i,'文具书籍',100],
  [/鞋|包|伞|衣|运动/i,'运动出行',150]
];
function guessCat(term){
  for (const [re,cat,base] of GUESS_RULES) if (re.test(term)) return {cat, base};
  return {cat:'宿舍生活', base:80};
}

/* ---------- 优惠日历 ---------- */
const CAL = [
  {m:1, name:'年货节', d:'寒假返乡前,囤行李与年货好物', lv:'mid'},
  {m:2, name:'开学返校', d:'春季开学小促,补漏为主', lv:'low'},
  {m:3, name:'38女神节', d:'美妆洗护全年好价之一', lv:'mid'},
  {m:4, name:'品类日', d:'数码家电以旧换新补贴', lv:'low'},
  {m:5, name:'五一大促', d:'提前练手比价,不急不买', lv:'mid'},
  {m:6, name:'618大促', d:'上半年最大力度 ⭐ 大件必等', lv:'high'},
  {m:7, name:'暑促清仓', d:'夏品清仓,返校装备提前看', lv:'low'},
  {m:8, name:'暑期数码节', d:'电脑数码教育优惠黄金窗口', lv:'mid'},
  {m:9, name:'开学季', d:'宿舍用品/文具/数码专场,现在就是', lv:'mid'},
  {m:10, name:'养草期', d:'无大促:加购物车+锁好价等双11', lv:'low'},
  {m:11, name:'双11', d:'全年最大力度 ⭐ 囤一年用量', lv:'high'},
  {m:12, name:'双12', d:'双11补漏,日用品捡漏', lv:'mid'}
];
function renderCalendar(){
  const nowM = new Date().getMonth() + 1;
  const order = [...CAL.slice(8), ...CAL.slice(0,8)]; /* 从9月开始的学年视角 */
  $('#calGrid').innerHTML = order.map(c=>{
    const lvTxt = c.lv==='high' ? '<span class="cal-badge highb">全年力度大</span>' : c.lv==='mid' ? '<span class="cal-badge midb">力度中等</span>' : '<span class="cal-badge lowb">力度较小</span>';
    const now = c.m===nowM ? '<span class="cal-badge nowb">当前</span>' : '';
    return `<div class="cal-card ${c.m===nowM?'now':''} ${c.lv==='high'?'hot':''}"><div class="cal-m">${c.m}月${now}${lvTxt}</div><b>${c.name}</b><p>${c.d}</p></div>`;
  }).join('');
}

/* ---------- 轻提示(搜索反馈) ---------- */
let toastTimer = null;
function showToast2(msg){
  let t = $('#toast2');
  if (!t){
    t = document.createElement('div');
    t.id = 'toast2';
    t.style.cssText = 'position:fixed;left:50%;bottom:44px;transform:translateX(-50%);background:#fff;border:1px solid rgba(37,99,235,.5);color:#1d4ed8;padding:11px 24px;border-radius:999px;font-size:14px;z-index:300;box-shadow:0 12px 36px rgba(15,23,42,.18)';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.style.opacity = '0', 2600);
}

/* ---------- Hero 搜索联动比价 ---------- */
$('#searchForm').addEventListener('submit', e=>{
  e.preventDefault();
  const term = $('#searchInput').value.trim();
  if (!term) { document.getElementById('grid').scrollIntoView({behavior:'smooth'}); return; }
  const match = P.find(p=>p.name.includes(term)||term.includes(p.name)||p.sell.includes(term)||p.cat.includes(term));
  if (match){ curCat='全部'; curTerm=term; document.querySelectorAll('#tabs .tab').forEach(t=>t.classList.toggle('active',t.dataset.cat==='全部')); renderGrid(); loadCompare(match); }
  else {
    const g = guessCat(term);
    loadCompare({id:'custom', name:term, cat:g.cat, emoji:'🔎', base:g.base, __seed:strSeed(term)});
    showToast2('🔎 已生成「' + term + '」的估算比价(演示数据)');
  }
  document.getElementById('compare').scrollIntoView({behavior:'smooth'});
});

/* ---------- 数字滚动 / 滚动显现 / 导航 ---------- */
const countObs = new IntersectionObserver((es,obs)=>{
  es.forEach(e=>{ if(e.isIntersecting){ countUp(e.target); obs.unobserve(e.target); } });
},{threshold:.4});
function countUp(el){
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1200;
  (function tick(t){
    const p = Math.min(1,(t-t0)/dur), ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(target*ease) + suffix;
    if (p<1) requestAnimationFrame(tick);
  })(t0);
}
document.querySelectorAll('.stats .num').forEach(el=>countObs.observe(el));

const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const nav = $('#nav');
addEventListener('scroll', ()=> nav.classList.toggle('scrolled', scrollY>30), {passive:true});
$('#burger').addEventListener('click', ()=> $('#navMenu').classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click', ()=> $('#navMenu').classList.remove('open')));

/* ---------- 图表默认 & 初始化 ---------- */
if (window.Chart){
  Chart.defaults.color = '#5f6f86';
  Chart.defaults.font.family = '"Noto Sans SC","Microsoft YaHei",sans-serif';
  Chart.defaults.borderColor = 'rgba(15,23,42,.08)';
}
loadCompare(P[0]);
renderGrid();
renderCalendar();
