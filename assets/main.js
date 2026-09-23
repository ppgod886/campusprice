/* ============ 学省 CampusPrice · 交互逻辑

 ============ */

/* ---------- 商品数据(价格为演示样例) ---------- */
const P = [
  {id:1, name:'无线蓝牙耳机', cat:'数码3C', emoji:'🎧', img:'1606220945770-b5b6c2c55bf1', base:199,
   sell:'降噪+长续航,网课通勤两相宜'},
  {id:2, name:'快充充电宝 20000mAh', cat:'数码3C', emoji:'🔋', img:'1609091839311-d5365f9ff1c5', base:129,
   sell:'图书馆/教室续命刚需,可上飞机'},
  {id:3, name:'轻薄笔记本电脑', cat:'数码3C', emoji:'💻', img:'1517336714731-489689fd1ca8', base:4999, stu:0.92,
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
  {id:9, name:'氨基酸洗面奶', cat:'洗护美妆', emoji:'🧴', img:'1620916566398-39f1143ab7be', base:69,
   sell:'温和清洁,男女通用'},
  {id:10, name:'保湿面霜', cat:'洗护美妆', emoji:'🧖', img:'1611930022073-b7a4ba5fcccd', base:99,
   sell:'秋冬防干裂,军训后修复'},
  {id:11, name:'考研英语全套资料', cat:'文具书籍', emoji:'📚', img:'1544716278-ca5e3f4abd8c', base:158,
   sell:'真题+解析一站式,自习室人手一套'},
  {id:12, name:'桌面文具套装', cat:'文具书籍', emoji:'✏️', img:'1456735190827-d1262f71b8a3', base:39,
   sell:'笔记好物组合装,开学补货首选'},
  {id:13, name:'春秋百搭运动鞋', cat:'运动出行', emoji:'👟', img:'1600185365483-26d7a4cc7519', base:269,
   sell:'体测/通勤/约会一双搞定'},
  {id:14, name:'大容量双肩背包', cat:'运动出行', emoji:'🎒', img:'1622560480605-d83c853bc5c3', base:119,
   sell:'书本电脑雨伞全装下,护脊减负'},
  {id:15, name:'便携晴雨伞', cat:'运动出行', emoji:'☂️', img:'1519692933481-e162a57d6721', base:45,
   sell:'防晒防雨两用,塞进书包无压力'},
  {id:16, name:'机械键盘', cat:'数码3C', emoji:'⌨️', img:'1587829741301-dc798b83add3', base:159,
   sell:'码字写论文手感起飞,宿舍气氛组标配'},
  {id:17, name:'网课平板 iPad', cat:'数码3C', emoji:'📲', img:'1544244015-0df4b3ffc6b0', base:2499, stu:0.92,
   sell:'网课笔记分屏神器,支持教育优惠'},
  {id:18, name:'宿舍小电煮锅', cat:'宿舍生活', emoji:'🍲', img:'1556911220-bff31c812dba', base:89,
   sell:'煮面火锅一人食,深夜食堂自由'},
  {id:19, name:'床头挂篮置物架', cat:'宿舍生活', emoji:'🧺', img:'1584622650111-993a426fbf0a', base:25,
   sell:'上铺党神器,手机零食触手可及'},
  {id:20, name:'氨基酸洗发水', cat:'洗护美妆', emoji:'🧴', img:'1615397349754-cfa2066a298e', base:49,
   sell:'控油蓬松,早八救星'},
  {id:21, name:'防晒霜', cat:'洗护美妆', emoji:'☀️', img:'1596462502278-27bfdc403348', base:59,
   sell:'军训/体育课/通勤,全年都要防'},
  {id:22, name:'加厚笔记本套装', cat:'文具书籍', emoji:'📓', img:'1517842645767-c639042777db', base:29,
   sell:'错题+课堂笔记分科记录,3本装'},
  {id:23, name:'荧光笔记号笔套装', cat:'文具书籍', emoji:'🖍️', img:'1456735190827-d1262f71b8a3', base:19,
   sell:'划重点神器,考研党手绘笔记必备'},
  {id:24, name:'加厚瑜伽垫', cat:'运动出行', emoji:'🧘', img:'1599901860904-17e6ed7083a0', base:69,
   sell:'宿舍跟练女团腿/帕梅拉,防滑加厚'},
  {id:25, name:'速干运动T恤', cat:'运动出行', emoji:'👕', img:'1583743814966-8936f5b7be1a', base:49,
   sell:'体测跑步不闷汗,快干轻薄'}
];

/* ---------- 品牌扩充商品(主流品牌覆盖) ---------- */
const IMG = {
  tee:'1521572163474-6864f9cf17ab', denim:'1596755094514-f87e34085b2c', knit:'1434389677669-e08b4cac3105',
  red:'1542291026-7eec264c27ff', white:'1600185365483-26d7a4cc7519', pastel:'1595950653106-6c9ebd614d3a',
  colorful:'1560769629-975ec94e6a86', boots:'1608256246200-53e635b5b65f', loafers:'1543163521-1bf539c55dd2',
  storage:'1584622650111-993a426fbf0a', clean:'1563453392212-326f5e854473', blacktee:'1583743814966-8936f5b7be1a',
  mouse:'1527864550417-7fd91fc51a46', choco:'1599599810769-bcde5a160d32', milk:'1563636619-e9143da7973b',
  can:'1554866585-cd94860890b7', yoga:'1599901860904-17e6ed7083a0', umbrella:'1519692933481-e162a57d6721',
  cream:'1611930022073-b7a4ba5fcccd', phone:'1511707171634-5f897ff02aa9', lamp2:'1507473885765-e6ed057f782c',
  kitchen2:'1556911220-bff31c812dba', ribs2:'1544025162-d76694265947', pancake2:'1567620905732-2d1ec7ab7445',
  aroma:'1570172619644-dfd03ed5d881',
  chips:'1599490659213-e2b9527bd087', candy:'1621939514649-280e2ee25f60'
};
const IMG2 = {
  pants:'1594633312681-425c7b97ccd1', sweat:'1620799140408-edc6dcb6d633', jkt:'1591047139829-d91aecb6caea',
  dark:'1491553895911-0055eca6402d', totes:'1522338242992-e1a54906a8da',
  pancake:'1567620905732-2d1ec7ab7445', salad:'1546069901-ba9599a7e63c',
  phone:'1511707171634-5f897ff02aa9', serum:'1556228578-8c89e6adf883', pen2:'1471107340929-a87cd0f5b5f3',
  gym:'1517836357463-d25dfeac3438', workout:'1571019613454-1cb2f99b2d8b', lamp:'1507473885765-e6ed057f782c',
  mouse:'1527864550417-7fd91fc51a46', speaker:'1543512214-318c7553f230', bank:'1609091839311-d5365f9ff1c5',
  kitchen:'1556911220-bff31c812dba', juice:'1613478223719-2ab802602423', dental:'1606811841689-23dfddce3e95',
  ribs:'1544025162-d76694265947', choco:'1599599810769-bcde5a160d32', milk:'1563636619-e9143da7973b',
  yogurt:'1488477181946-6428a0291777', can:'1554866585-cd94860890b7', water:'1548839140-29a749e1cf4d',
  candle:'1602523961358-f9f03dd557db', mug:'1544787219-7f47ccb76574', bowl:'1546069901-ba9599a7e63c',
  prep:'1546793665-c74683f339c1', basketball:'1546519638-68e109498ffc', socks:'1584735175315-9d5df23860e6',
  laptop:'1517336714731-489689fd1ca8', ipad:'1544244015-0df4b3ffc6b0', earbuds:'1606220945770-b5b6c2c55bf1',
  bed:'1522771739844-6a9f6d5f14af', cosmetics:'1596462502278-27bfdc403348', shampoo:'1615397349754-cfa2066a298e',
  stationery:'1456735190827-d1262f71b8a3', books:'1544716278-ca5e3f4abd8c'
};
const CAT_EMOJI = {'服饰穿搭':'👕','鞋靴':'👟','生活日用':'🧽','食品饮料':'🍪'};
/* [品类, 品牌, 品名, 参考价, 图] */
const EXTRA = [
  ['服饰穿搭','优衣库','圆领纯色T恤',79,'tee'],
  ['服饰穿搭','优衣库','纯棉法兰绒衬衫',149,'denim'],
  ['服饰穿搭','优衣库','柔软针织开衫',199,'knit'],
  ['服饰穿搭','ZARA','印花短袖T恤',129,'tee'],
  ['服饰穿搭','ZARA','水洗牛仔衬衫',199,'denim'],
  ['服饰穿搭','H&M','宽松针织毛衣',159,'knit'],
  ['服饰穿搭','太平鸟','oversize短袖',139,'tee'],
  ['服饰穿搭','海澜之家','修身长袖衬衫',159,'denim'],
  ['服饰穿搭','李宁','运动长袖T恤',119,'tee'],
  ['服饰穿搭','无印良品','纯棉家居针织衫',159,'knit'],
  ['鞋靴','耐克','Air 缓震跑步鞋',599,'red'],
  ['鞋靴','李宁','赤兔跑步鞋',329,'red'],
  ['鞋靴','安踏','KT 气垫篮球鞋',429,'colorful'],
  ['鞋靴','斯凯奇','经典熊猫鞋',399,'white'],
  ['鞋靴','回力','经典小白鞋',79,'white'],
  ['鞋靴','阿迪达斯','三叶草板鞋',599,'pastel'],
  ['鞋靴','耐克','空军一号板鞋',799,'pastel'],
  ['鞋靴','斐乐','复古老爹鞋',699,'colorful'],
  ['鞋靴','百丽','切尔西马丁靴',399,'boots'],
  ['鞋靴','热风','英伦风短靴',299,'boots'],
  ['鞋靴','红蜻蜓','通勤乐福鞋',259,'loafers'],
  ['鞋靴','匡威','经典高帮帆布鞋',429,'white'],
  ['生活日用','名创优品','桌面收纳盒',19.9,'storage'],
  ['生活日用','京东京造','抽屉式收纳箱',39.9,'storage'],
  ['生活日用','名创优品','多层置物架',29.9,'storage'],
  ['生活日用','蓝月亮','洗衣液 2kg',39.9,'clean'],
  ['生活日用','立白','洗洁精家庭装',12.9,'clean'],
  ['生活日用','舒肤佳','香皂 4 块装',19.9,'clean'],
  ['生活日用','京东京造','滚筒粘毛器',9.9,'clean'],
  ['食品饮料','乐事','薯片追剧整箱',49.9,'chips'],
  ['食品饮料','上好佳','鲜虾片家庭装',29.9,'chips'],
  ['食品饮料','德芙','巧克力分享装',59.9,'candy'],
  ['食品饮料','阿尔卑斯','棒棒糖袋装',19.9,'candy'],
  ['食品饮料','三只松鼠','每日坚果 30 包',79,'choco'],
  ['食品饮料','伊利','纯牛奶 24 盒',59.9,'milk'],
  ['食品饮料','元气森林','气泡水 15 瓶',69.9,'can'],
  ['食品饮料','卫龙','辣条混装大礼包',26.9,'chips'],
  ['数码3C','小米','手环 9',249,'phone'],
  ['数码3C','罗技','G102 电竞鼠标',129,'mouse']
];
P.push(...EXTRA.map((r,i)=>({
  id: 100 + i, cat: r[0], brand: r[1], name: r[2], base: r[3],
  emoji: CAT_EMOJI[r[0]] || '🛒', img: r[4] ? IMG[r[4]] : '',
  sell: `${r[1]} ${r[2]},学生党高频购买`
})));

/* ---------- 大规模品牌扩充(目标总量 200+) ---------- */
const EXTRA2 = [
  ['数码3C','小米','Redmi 手机',999,'phone'],['数码3C','荣耀','畅玩手机',899,'phone'],
  ['数码3C','OPPO','K 系列手机',1499,'phone'],['数码3C','vivo','Y 系列手机',1299,'phone'],
  ['数码3C','苹果','iPhone SE',3499,'phone'],['数码3C','联想','小新笔记本',3999,'laptop'],
  ['数码3C','戴尔','灵越笔记本',4299,'laptop'],['数码3C','华硕','顽石笔记本',3699,'laptop'],
  ['数码3C','华为','MatePad 平板',1899,'ipad'],['数码3C','荣耀','平板 8 Pro',1299,'ipad'],
  ['数码3C','华为','FreeBuds 耳机',299,'earbuds'],['数码3C','苹果','AirPods 2',1299,'earbuds'],
  ['数码3C','罗技','G304 无线鼠标',199,'mouse'],['数码3C','小米','小爱音箱',99,'speaker'],
  ['数码3C','闪极','移动电源 2万毫安',129,'bank'],
  ['宿舍生活','网易严选','纯棉四件套',159,'bed'],['宿舍生活','水星家纺','冬被加厚',129,'bed'],
  ['宿舍生活','美的','宿舍小电锅',99,'kitchen'],['宿舍生活','苏泊尔','电煮锅 1.2L',129,'kitchen'],
  ['宿舍生活','小熊','煮蛋器',49,'kitchen'],['宿舍生活','九阳','便携榨汁机',149,'juice'],
  ['宿舍生活','美的','桌面小风扇',89,'lamp2'],['宿舍生活','飞利浦','LED 台灯',129,'lamp'],
  ['宿舍生活','欧普','护眼台灯',99,'lamp'],['宿舍生活','小米','台灯 Pro',169,'lamp'],
  ['宿舍生活','网易严选','收纳袋三件套',29,'totes'],['宿舍生活','太力','真空压缩袋',39,'storage'],
  ['宿舍生活','好太太','晾衣绳',19,'totes'],
  ['洗护美妆','珀莱雅','红宝石精华',239,'serum'],['洗护美妆','薇诺娜','舒敏保湿霜',168,'cream'],
  ['洗护美妆','欧莱雅','复颜面膜',99,'cosmetics'],['洗护美妆','大宝','SOD 蜜',19,'serum'],
  ['洗护美妆','高露洁','牙膏三支装',29.9,'dental'],['洗护美妆','舒客','软毛牙刷两支',19.9,'dental'],
  ['洗护美妆','潘婷','乳液修护洗发水',39.9,'shampoo'],['洗护美妆','多芬','沐浴露 1L',39.9,'shampoo'],
  ['洗护美妆','全棉时代','洗脸巾 100 抽',29.9,'cosmetics'],['洗护美妆','完美日记','小细跟唇釉',59.9,'cosmetics'],
  ['洗护美妆','花西子','空气蜜粉',139,'cosmetics'],
  ['文具书籍','晨光','中性笔 12 支',19.9,'pen2'],['文具书籍','得力','迷你订书机',15,'stationery'],
  ['文具书籍','百乐','P500 中性笔 3 支',25,'pen2'],['文具书籍','凌美','狩猎者钢笔',99,'pen2'],
  ['文具书籍','广博','便利贴组合',9.9,'stationery'],['文具书籍','天一','四六级真题',29.8,'books'],
  ['文具书籍','文都','考研数学全书',89,'books'],['文具书籍','星火','四六级词汇',39.8,'books'],
  ['文具书籍','得力','开学文具大礼包',39.9,'stationery'],['文具书籍','晨光','荧光笔 6 色',12.9,'stationery'],
  ['文具书籍','卡西欧','科学计算器',99,'stationery'],['文具书籍','爱立熊','错题打印纸 2 卷',19.9,'books'],
  ['运动出行','匹克','防滑篮球',99,'basketball'],['运动出行','京东京造','可拆卸哑铃',59,'gym'],
  ['运动出行','Keep','瑜伽球',39.9,'yoga'],['运动出行','李宁','运动短裤',99,'workout'],
  ['运动出行','安踏','速干训练 T',129,'workout'],['运动出行','匹克','运动袜 5 双',39.9,'socks'],
  ['运动出行','天堂','折叠晴雨伞',39,'umbrella'],['运动出行','迪卡侬','速干运动毛巾',29.9,'workout'],
  ['服饰穿搭','优衣库','高腰休闲裤',199,'pants'],['服饰穿搭','优衣库','圆领长袖 T',99,'tee'],
  ['服饰穿搭','优衣库','摇粒绒开衫',179,'knit'],['服饰穿搭','优衣库','牛仔外套',299,'jkt'],
  ['服饰穿搭','ZARA','基础连帽卫衣',159,'sweat'],['服饰穿搭','ZARA','休闲直筒裤',229,'pants'],
  ['服饰穿搭','ZARA','针织开衫',259,'knit'],['服饰穿搭','H&M','棉质圆领 T',69,'tee'],
  ['服饰穿搭','H&M','休闲卫裤',129,'pants'],['服饰穿搭','H&M','牛仔夹克',249,'jkt'],
  ['服饰穿搭','太平鸟','印花连帽卫衣',229,'sweat'],['服饰穿搭','太平鸟','休闲西装裤',299,'pants'],
  ['服饰穿搭','森马','纯棉套头卫衣',119,'sweat'],['服饰穿搭','森马','休闲短裤',79,'tee'],
  ['服饰穿搭','以纯','柔软针织衫',129,'knit'],['服饰穿搭','以纯','长袖衬衫',119,'denim'],
  ['服饰穿搭','海澜之家','经典 Polo 衫',129,'tee'],['服饰穿搭','无印良品','宽松休闲裤',199,'pants'],
  ['服饰穿搭','无印良品','有机棉卫衣',249,'sweat'],['服饰穿搭','李宁','运动卫裤',159,'pants'],
  ['服饰穿搭','优衣库','空气感衬衫',199,'denim'],['服饰穿搭','ZARA','条纹长袖 T',159,'tee'],
  ['服饰穿搭','H&M','圆领针织衫',149,'knit'],['服饰穿搭','太平鸟','飞行员夹克',399,'jkt'],
  ['服饰穿搭','森马','连帽拉链外套',139,'sweat'],['服饰穿搭','无印良品','法兰绒家居裤',159,'pants'],
  ['服饰穿搭','优衣库','打底长袖 T',79,'tee'],['服饰穿搭','李宁','速干训练短袖',89,'tee'],
  ['服饰穿搭','H&M','荷叶边衬衫',159,'denim'],['服饰穿搭','优衣库','灯芯绒衬衫',179,'denim'],
  ['鞋靴','特步','动力巢跑步鞋',269,'red'],['鞋靴','361°','轻量运动鞋',239,'red'],
  ['鞋靴','匹克','休闲板鞋',199,'white'],['鞋靴','鸿星尔克','慢跑鞋',189,'red'],
  ['鞋靴','万斯','Old Skool 滑板鞋',499,'white'],['鞋靴','彪马','复古板鞋',459,'pastel'],
  ['鞋靴','阿迪达斯','轻量跑步鞋',459,'red'],['鞋靴','New Balance','574 经典款',499,'white'],
  ['鞋靴','卓诗尼','通勤单鞋',199,'loafers'],['鞋靴','意尔康','商务皮鞋',299,'loafers'],
  ['鞋靴','奥康','正装皮鞋',339,'loafers'],['鞋靴','斯凯奇','一脚蹬懒人鞋',339,'white'],
  ['鞋靴','木林森','复古马丁靴',289,'boots'],['鞋靴','热风','切尔西短靴',269,'boots'],
  ['鞋靴','百丽','通勤乐福鞋',359,'loafers'],['鞋靴','探路者','户外徒步鞋',329,'dark'],
  ['鞋靴','骆驼','登山越野鞋',289,'dark'],['鞋靴','人本','经典帆布鞋',59,'white'],
  ['生活日用','维达','棉柔巾 100 抽',29.9,'clean'],['生活日用','心相印','抽纸 20 包',34.9,'clean'],
  ['生活日用','洁柔','卷纸 12 卷',27.9,'clean'],['生活日用','倍加洁','软毛牙刷 4 支',14.9,'clean'],
  ['生活日用','京东京造','氨基酸洗手液',19.9,'clean'],['生活日用','超能','洗衣液 3kg',44.9,'clean'],
  ['生活日用','奥妙','洗衣凝珠 30 颗',49.9,'clean'],['生活日用','名创优品','化妆刷收纳筒',15,'storage'],
  ['生活日用','网易严选','袜子收纳盒',25,'storage'],['生活日用','佳帮手','免手洗拖把',59,'clean'],
  ['生活日用','3M 思高','百洁布 4 片',19.9,'clean'],['生活日用','美丽雅','马桶刷',19.9,'clean'],
  ['生活日用','妙洁','保鲜袋 3 卷',13.9,'clean'],['生活日用','洁云','厨房纸 2 卷',16.9,'clean'],
  ['生活日用','名创优品','无火香薰',25,'candle'],['生活日用','名创优品','湿巾 80 抽',10,'clean'],
  ['生活日用','悠家良品','ins 马克杯',29.9,'mug'],['生活日用','苏泊尔','保温饭盒',59.9,'bowl'],
  ['生活日用','得力','防风衣架 20 只',16.9,'storage'],['生活日用','乐扣乐扣','玻璃保鲜盒',39.9,'prep'],
  ['食品饮料','良品铺子','零食大礼包',69.9,'candy'],['食品饮料','百草味','猪肉脯 200g',26.9,'ribs'],
  ['食品饮料','农夫山泉','饮用水 24 瓶',33.9,'water'],['食品饮料','康师傅','红烧牛肉面 12 连包',39.9,'pancake2'],
  ['食品饮料','统一','冰红茶 15 瓶',29.9,'can'],['食品饮料','蒙牛','纯牛奶 16 盒',49.9,'milk'],
  ['食品饮料','王老吉','凉茶 12 罐',45.9,'can'],['食品饮料','奥利奥','家庭分享装',19.9,'candy'],
  ['食品饮料','乐吧','薯片 8 包',26.9,'chips'],['食品饮料','盼盼','麦香鸡味块',16.8,'chips'],
  ['食品饮料','洽洽','香瓜子 500g',15.9,'candy'],['食品饮料','旺旺','雪饼家族装',29.9,'candy'],
  ['食品饮料','蒙牛','酸奶 8 杯',39.9,'yogurt'],['食品饮料','卡士','鲜酪乳 6 杯',45,'yogurt'],
  ['食品饮料','喜之郎','果冻分享装',49.9,'candy'],['食品饮料','盼盼','软面包 1kg',25,'pancake'],
  ['食品饮料','港荣','蒸蛋糕 1kg',29.9,'pancake'],['食品饮料','良品铺子','软面包 500g',35,'pancake'],
  ['食品饮料','农夫山泉','NFC 果汁 1L',29.9,'juice'],['食品饮料','王小卤','虎皮凤爪',39.9,'ribs2'],
  ['食品饮料','自嗨锅','自热火锅',39.9,'kitchen2']
];
P.push(...EXTRA2.map((r,i)=>({
  id: 200 + i, cat: r[0], brand: r[1], name: r[2], base: r[3],
  emoji: CAT_EMOJI[r[0]] || '🛒', img: r[4] ? (IMG[r[4]] || IMG2[r[4]]) : '',
  sell: `${r[1]} ${r[2]},学生党高频购买`
})));

/* ---------- 逐商品专属图(按名称精确匹配,未命中的沿用品类图池) ---------- */
const IMG3 = {
  phone2:'1592750475338-74b7b21085ab', phone3:'1616348436168-de43ad0db179',
  laptop2:'1496181133206-80ce9b88a853', laptop3:'1541807084-5c52b6b3adef',
  watch:'1546868871-7041f2a55e12', canvas:'1525966222134-fcfa99b8ae77',
  tee3:'1576566588028-4147f3842f27', suit:'1594938298603-c8148c4dae35',
  jeans:'1542272604-787c3835535d', bread:'1549931319-a545dcf3bc73',
  noodles:'1612929633738-8fe44f7ec841'
};
const ALLIMG = Object.assign({}, IMG, IMG2, IMG3);
const PER_PRODUCT = {
  '无线蓝牙耳机':'earbuds','快充充电宝 20000mAh':'bank','轻薄笔记本电脑':'laptop','桌面护眼台灯':'lamp',
  '宿舍折叠收纳箱':'storage','全棉床上三件套':'bed','迷你加湿器':'aroma','大容量保温杯':'bottle',
  '氨基酸洗面奶':'cleanser','保湿面霜':'cream','考研英语全套资料':'books','桌面文具套装':'stationery',
  '春秋百搭运动鞋':'sneaker','大容量双肩背包':'backpack','便携晴雨伞':'umbrella','机械键盘':'keyboard',
  '网课平板 iPad':'ipad','宿舍小电煮锅':'kitchen2','床头挂篮置物架':'totes','氨基酸洗发水':'shampoo',
  '防晒霜':'cosmetics','加厚笔记本套装':'notebook','荧光笔记号笔套装':'stationery','加厚瑜伽垫':'yoga',
  '速干运动T恤':'blacktee',
  '圆领纯色T恤':'tee','纯棉法兰绒衬衫':'denim','柔软针织开衫':'knit','印花短袖T恤':'tee3',
  '水洗牛仔衬衫':'denim','宽松针织毛衣':'knit','oversize短袖':'tee3','修身长袖衬衫':'denim',
  '运动长袖T恤':'tee','纯棉家居针织衫':'knit',
  'Air 缓震跑步鞋':'red','赤兔跑步鞋':'red','KT 气垫篮球鞋':'colorful','经典熊猫鞋':'white',
  '经典小白鞋':'white','三叶草板鞋':'pastel','空军一号板鞋':'pastel','复古老爹鞋':'colorful',
  '切尔西马丁靴':'boots','英伦风短靴':'boots','通勤乐福鞋':'loafers','经典高帮帆布鞋':'canvas',
  '桌面收纳盒':'storage','抽屉式收纳箱':'storage','多层置物架':'storage','洗衣液 2kg':'clean',
  '洗洁精家庭装':'clean','香皂 4 块装':'clean','滚筒粘毛器':'clean',
  '薯片追剧整箱':'chips','鲜虾片家庭装':'chips','巧克力分享装':'choco','棒棒糖袋装':'candy',
  '每日坚果 30 包':'choco','纯牛奶 24 盒':'milk','气泡水 15 瓶':'can','辣条混装大礼包':'chips',
  '纯牛奶 16 盒':'milk','酸奶 8 杯':'yogurt','鲜酪乳 6 杯':'yogurt','饮用水 24 瓶':'water',
  '冰红茶 15 瓶':'can','凉茶 12 罐':'can','NFC 果汁 1L':'juice','红烧牛肉面 12 连包':'noodles',
  '虎皮凤爪':'ribs','自热火锅':'kitchen2','零食大礼包':'candy','猪肉脯 200g':'ribs',
  '软面包 1kg':'bread','蒸蛋糕 1kg':'bread','软面包 500g':'bread',
  'Redmi 手机':'phone','畅玩手机':'phone2','K 系列手机':'phone3','Y 系列手机':'phone',
  'iPhone SE':'phone3','小新笔记本':'laptop2','灵越笔记本':'laptop3','顽石笔记本':'laptop',
  'MatePad 平板':'ipad','平板 8 Pro':'ipad','FreeBuds 耳机':'earbuds','AirPods 2':'earbuds',
  'G304 无线鼠标':'mouse','G102 电竞鼠标':'mouse2','小爱音箱':'speaker','移动电源 2万毫安':'bank',
  '手环 9':'watch',
  '纯棉四件套':'bed','冬被加厚':'bed','便携榨汁机':'juice','桌面小风扇':'lamp',
  'LED 台灯':'lamp','护眼台灯':'lamp','台灯 Pro':'lamp',
  '收纳袋三件套':'totes','真空压缩袋':'storage','晾衣绳':'totes',
  '红宝石精华':'serum','舒敏保湿霜':'cream','复颜面膜':'cosmetics','SOD 蜜':'serum',
  '牙膏三支装':'dental','软毛牙刷两支':'dental','乳液修护洗发水':'shampoo','沐浴露 1L':'shampoo',
  '洗脸巾 100 抽':'cosmetics','小细跟唇釉':'cosmetics','空气蜜粉':'cosmetics',
  '迷你订书机':'stationery','P500 中性笔 3 支':'pen2','狩猎者钢笔':'pen2','便利贴组合':'stationery',
  '四六级真题':'books','考研数学全书':'books','四六级词汇':'books','开学文具大礼包':'stationery',
  '荧光笔 6 色':'stationery','科学计算器':'stationery','错题打印纸 2 卷':'books',
  '防滑篮球':'basketball','可拆卸哑铃':'gym','瑜伽球':'yoga','运动短裤':'workout',
  '速干训练 T':'workout','运动袜 5 双':'socks','折叠晴雨伞':'umbrella','速干运动毛巾':'workout',
  '高腰休闲裤':'pants','圆领长袖 T':'tee','摇粒绒开衫':'knit','牛仔外套':'jkt',
  '基础连帽卫衣':'sweat','休闲直筒裤':'pants','针织开衫':'knit','棉质圆领 T':'tee',
  '休闲卫裤':'pants','牛仔夹克':'jkt','印花连帽卫衣':'sweat','休闲西装裤':'pants',
  '纯棉套头卫衣':'sweat','休闲短裤':'tee','柔软针织衫':'knit','长袖衬衫':'denim',
  '经典 Polo 衫':'tee','宽松休闲裤':'pants','有机棉卫衣':'sweat','运动卫裤':'pants',
  '空气感衬衫':'denim','条纹长袖 T':'tee','圆领针织衫':'knit','飞行员夹克':'jkt',
  '连帽拉链外套':'sweat','法兰绒家居裤':'pants','打底长袖 T':'tee','速干训练短袖':'tee',
  '荷叶边衬衫':'denim','灯芯绒衬衫':'denim',
  '动力巢跑步鞋':'red','轻量运动鞋':'red','休闲板鞋':'white','慢跑鞋':'red',
  'Old Skool 滑板鞋':'canvas','复古板鞋':'pastel','轻量跑步鞋':'red','574 经典款':'white',
  '通勤单鞋':'loafers','商务皮鞋':'loafers','正装皮鞋':'loafers','一脚蹬懒人鞋':'white',
  '复古马丁靴':'boots','切尔西短靴':'boots','防滑篮球鞋':'colorful','户外徒步鞋':'dark',
  '登山越野鞋':'dark','防滑篮球':'basketball','可拆卸哑铃':'gym','瑜伽球':'yoga',
  '运动短裤':'workout','速干训练 T':'workout','运动袜 5 双':'socks','折叠晴雨伞':'umbrella',
  '速干运动毛巾':'workout'
};
P.forEach(p => {
  const k = PER_PRODUCT[p.name];
  if (k && ALLIMG[k]) p.img = ALLIMG[k];
});

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
  const vals = MONTHS.map((m,i)=> Math.round(p.base * SEASON[i] * (0.97 + prand(seedOf(p)*37 + i*13)*0.06)));
  const curIdx = Math.max(0, MONTHS.indexOf((new Date().getMonth()+1) + '月'));
  return { vals, current: vals[curIdx], curIdx };
}

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
/* 图片已自托管在仓库 assets/img/ 下,与网站同域,避免第三方图床加载失败 */
const imgUrl = (id,w)=>`assets/img/${id}.jpg`;
/* 图片加载失败自动重试一次(应对网络抖动),重试仍失败才降级为图标 */
window.imgErr = function(img){
  /* 卡片已被重新渲染(图片脱离文档)时放弃重试:避免为看不见的节点白白发请求并持有引用 */
  if (!img || img.isConnected === false) return;
  const n = +(img.dataset.retry || 0);
  if (n < 3){
    img.dataset.retry = String(n + 1);
    setTimeout(()=>{
      /* 等待期间用户切换了品类/品牌,节点可能已移除,此时不再改写 src */
      if (img.isConnected === false) return;
      img.src = img.src + (img.src.indexOf('?')>-1?'&':'?') + 'r=' + n;
    }, 600 + n * 900);
  } else {
    /* 卡片可能已被重新渲染(图片已脱离文档),此时 parentElement 为 null */
    if (img.parentElement) img.parentElement.classList.add('noimg');
  }
};
/* 非有限值(0 价/负价等异常数据导致的 NaN、Infinity)统一显示为 ¥—,避免「¥NaN」进入界面 */
const fmt = n => { const v = Number(n); return isFinite(v) ? '¥' + (v >= 100 ? Math.round(v) : Math.round(v*10)/10) : '¥—'; };
/* 安全百分比:分子/分母任一非有限或分母为 0 时返回 null(而非 NaN/Infinity),由调用方决定降级文案 */
const pct = (num, den) => (isFinite(num) && isFinite(den) && den !== 0) ? Math.round(num/den*100) : null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* URL 编码兜底:用户输入若含孤立代理项(不成对的 UTF-16),encodeURIComponent 会抛 URIError,
   这里将其替换为 U+FFFD 后再编码,保证搜索/比价链路不因奇异字符中断 */
const safeEnc = s => { try { return encodeURIComponent(s); } catch(e){ return encodeURIComponent(String(s).replace(/[\uD800-\uDFFF]/g, '\uFFFD')); } };
function seedOf(p){ return typeof p.id === 'number' ? p.id : (p.__seed || 1); }
function priceFor(p, plat, idx, student){
  let v = p.base * plat.multi * (0.95 + prand(seedOf(p)*53 + idx*29)*0.1);
  if (student && (plat.student || p.stu)) v *= (p.stu || plat.student);
  return v >= 100 ? Math.round(v) : Math.round(v*10)/10;
}

/* ---------- 好物榜单 ---------- */
let curCat = '全部', curTerm = '', curBrand = '全部品牌';
const grid = $('#productGrid'), resultNote = $('#resultNote');

/* 品牌筛选项 */
const brandSel = $('#brandSel');
const BRANDS = [...new Set(P.filter(p=>p.brand).map(p=>p.brand))].sort((a,b)=>a.localeCompare(b,'zh'));
brandSel.innerHTML = '<option value="全部品牌">全部品牌</option><option value="精选自营">精选自营(无品牌)</option>'
  + BRANDS.map(b=>`<option value="${b}">${b}</option>`).join('');
brandSel.addEventListener('change', ()=>{ curBrand = brandSel.value; renderGrid(); });

function filtered(){
  return P.filter(p=>
    (curCat==='全部'||p.cat===curCat) &&
    (curBrand==='全部品牌' || (curBrand==='精选自营' ? !p.brand : p.brand===curBrand)) &&
    (!curTerm || p.name.includes(curTerm) || p.cat.includes(curTerm) || p.sell.includes(curTerm) || (p.brand||'').includes(curTerm))
  );
}

function cardPrices(p){
  /* 卡片上显示 京东/淘宝/拼多多/闲鱼 到手价(二手不叠加学生折扣) */
  return PLATS.filter(x=>['jd','tb','pdd','xy'].includes(x.key)).map(plat=>{
    const price = priceFor(p, plat, 0, !plat.used);
    return {key:plat.key, name:plat.name.split('(')[0], price, used:!!plat.used};
  });
}
function renderGrid(){
  const list = filtered();
  if (!list.length){
    /* 空结果(搜索词无匹配,或品类+品牌组合为空)在手机上就是一片空白,
       这里给出「当前筛选」与一条一键复原的出路,避免用户以为页面坏了 */
    const cond = [esc(curCat)]
      .concat(curBrand !== '全部品牌' ? [esc(curBrand)] : [])
      .concat(curTerm ? ['关键词「' + esc(curTerm) + '」'] : []).join(' · ');
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <b>没有符合条件的好物</b>
        <p>当前筛选:${cond}。换个关键词,或清空筛选看看全部好物。</p>
        <button class="empty-reset" type="button">清空筛选,看全部好物</button>
      </div>`;
  } else {
    grid.innerHTML = list.map(p=>{
      const ps = cardPrices(p);
      const newPs = ps.filter(x=>!x.used);
      const min = Math.min(...newPs.map(x=>x.price));
      const used = ps.find(x=>x.used);
      const savePct = pct(p.base - min, p.base);
      const title = (p.brand ? p.brand + ' · ' : '') + p.name;
      return `
      <article class="card" data-id="${p.id}">
        <div class="card-photo${p.img ? '' : ' noimg'}" data-emoji="${p.emoji}">
          ${p.img ? `<img src="${imgUrl(p.img, 420)}" alt="${esc(title)}" loading="lazy" decoding="async" onerror="window.imgErr&&window.imgErr(this)">` : ''}
          <span class="save-badge">到手约省 ${savePct === null ? '—' : savePct + '%'}</span>
        </div>
        <h3 class="card-name">${esc(title)}</h3>
        <p class="card-sell">${p.sell}</p>
        <div class="card-p4">
          ${ps.map(x=>`<div class="p4 ${!x.used && x.price===min ? 'best':''}"><div class="pn">${x.name}</div><div class="pv">${fmt(x.price)}</div></div>`).join('')}
        </div>
        <button class="card-btn" type="button">查看完整比价与波动<span class="sr-only">:${esc(title)}</span> →</button>
      </article>`;
    }).join('');
  }
  resultNote.textContent = curTerm
    ? `🔍 搜索“${curTerm}”找到 ${list.length} 件好物 · 价格为演示样例`
    : `📌 ${curCat}${curBrand!=='全部品牌' ? ' · ' + curBrand : ''}共 ${list.length} 件好物 · 绿色为四平台最低到手价`;
}
/* 品类筛选按钮:同步视觉选中态(.active)与无障碍状态(aria-pressed),
   否则读屏无法知道 10 个筛选按钮里当前生效的是哪一个 */
function setActiveTab(cat){
  document.querySelectorAll('#tabs .tab').forEach(t=>{
    const on = t.dataset.cat === cat;
    t.classList.toggle('active', on);
    t.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
/* 空状态复位:品类 / 品牌 / 关键词三处筛选一起清空,与点「全部」tab 的行为保持一致 */
function resetFilters(){
  curCat = '全部'; curTerm = ''; curBrand = '全部品牌';
  brandSel.value = '全部品牌';
  $('#searchInput').value = '';
  setActiveTab('全部');
  renderGrid();
}
grid.addEventListener('click', e=>{
  if (e.target.closest('.empty-reset')){ resetFilters(); return; }
  const card = e.target.closest('.card'); if(!card) return;
  loadCompare(+card.dataset.id);
  document.getElementById('compare').scrollIntoView({behavior:'smooth'});
});
$('#tabs').addEventListener('click', e=>{
  const btn = e.target.closest('.tab'); if(!btn) return;
  setActiveTab(btn.dataset.cat);
  curCat = btn.dataset.cat; curTerm=''; $('#searchInput').value='';
  curBrand = '全部品牌'; brandSel.value = '全部品牌';
  renderGrid();
});

/* ---------- 跨平台比价 ---------- */
let trendChart = null;
function loadCompare(idOrProduct){
  const p = typeof idOrProduct === 'object' ? idOrProduct : P.find(x=>x.id===idOrProduct);
  if (!p) return; /* id 找不到对应商品(如陈旧 DOM 事件)时安全退出,避免后续 p.xxx 抛错 */
  if ([...cmpSelect.options].some(o => o.value == p.id)) cmpSelect.value = p.id;
  $('#cmpCur').innerHTML = `📦 当前比价:<b>${esc(p.emoji)} ${esc(p.name)}</b>(${esc(p.cat)}) · 标价参考 ${fmt(p.base)}`;
  // 免登录比价工具条(购物党/慢慢买/什么值得买)
  const pk = safeEnc(p.name);
  $('#aggBar').innerHTML = '<span class="agg-t">免登录查全网:</span>' +
    `<a href="https://www.gwdang.com/search/all?keyword=${pk}" target="_blank" rel="noopener">📊 购物党·全网比价</a>` +
    `<a href="https://tool.manmanbuy.com/historyLowest.aspx?keyword=${pk}" target="_blank" rel="noopener">📉 慢慢买·历史价格</a>` +
    `<a href="https://search.smzdm.com/?c=home&s=${pk}" target="_blank" rel="noopener">🔥 什么值得买</a>`;

  /* 六平台行 */
  const rows = PLATS.map((plat,idx)=>{
    const listPrice = priceFor(p, plat, 0, false);
    /* 与 priceFor 的判定保持一致(平台学生权益 或 商品教育优惠),闲鱼二手不叠加 */
    const stuOn = !!plat.student || (!!p.stu && !plat.used);
    const finalPrice = stuOn ? priceFor(p, plat, 0, true) : priceFor(p, plat, 0, false);
    return {plat, idx, listPrice, stuOn, finalPrice};
  });
  const news = rows.filter(r=>!r.plat.used);
  const min = Math.min(...news.map(r=>r.finalPrice));
  const best = news.find(r=>r.finalPrice===min) || news[0];
  const usedRow = rows.find(r=>r.plat.used);
  const vsBase = pct(p.base - min, p.base);

  $('#cmpSummary').innerHTML = `
    <div class="src-stat"><div class="m-num green">${fmt(min)}</div><div class="m-lbl">新货最低到手 · ${best.plat.name}</div></div>
    <div class="src-stat"><div class="m-num">${fmt(usedRow.finalPrice)}</div><div class="m-lbl">二手参考(闲鱼95新,不计入)</div></div>
    <div class="src-stat"><div class="m-num orange">省 ${vsBase === null ? '—' : vsBase + '%'}</div><div class="m-lbl">比标价参考价节省(含学生优惠)</div></div>`;

  $('#cmpBody').innerHTML = rows.map(r=>{
    const isBest = !r.plat.used && r.finalPrice===min;
    const promos = r.plat.promos.map(t=>`<span class="${PROMO_TAG_CLS}">${t}</span>`).join('');
    const stu = r.stuOn
      ? `<span class="stu-tag">${p.stu && !r.plat.used && p.stu<0.93 ? '教育优惠 '+(p.stu*10).toFixed(1).replace('.0','')+'折' : r.plat.stuLabel}</span>`
      : (r.plat.stuLabel ? `<span style="color:#64748b;font-size:12px">无</span>` : '');
    // 各平台商品搜索直达链接(带商品关键词)
    const kw = safeEnc((p.brand ? p.brand + ' ' : '') + p.name);
    const href = {
      jd:'https://search.jd.com/Search?keyword=', tb:'https://s.taobao.com/search?q=',
      pdd:'https://mobile.yangkeduo.com/search_result.html?search_key=', vip:'https://search.vip.com/search.php?keyword=',
      dw:'https://www.dewu.com/search?keyword=', xy:'https://www.goofish.com/search?keyword='
    }[r.plat.key] + kw;
    return `
    <tr class="${isBest?'best':''}${r.plat.used?' used':''}">
      <td class="ch-name">${r.plat.icon} ${r.plat.name}</td>
      <td>${fmt(r.listPrice)}</td>
      <td>${promos}</td>
      <td>${stu}</td>
      <td><b style="${isBest?'color:#047857':''}">${fmt(r.finalPrice)}</b>${isBest?'<span class="price-badge">最低到手</span>':''}${r.plat.used?'<span class="strike" style="margin-left:6px">二手参考</span>':''}</td>
      <td>${r.plat.ship}</td>
      <td><a class="buy-link" href="${href}" target="_blank" rel="noopener">去购买<span class="sr-only">:${esc(r.plat.name)} ${esc(p.name)}(新窗口打开)</span> ↗</a></td>
    </tr>`;
  }).join('');

  renderTrend(p);

  /* 学生认证提示(只推荐真正有学生认证权益的平台,避免引导到无学生价的平台) */
  const stuRows = news.filter(r=>r.plat.student);
  if (stuRows.length) {
    const cheapestStu = stuRows.reduce((a,b)=>a.finalPrice<b.finalPrice?a:b);
    $('#cmpCur').innerHTML += ` · <span style="color:#1d4ed8">🎓 完成学生认证,${cheapestStu.plat.name}到手再省 ${fmt(cheapestStu.listPrice-cheapestStu.finalPrice)}</span>`;
  }
}

function renderTrend(p){
  const {vals, current, curIdx} = trendSeries(p);
  const min = Math.min(...vals), max = Math.max(...vals);
  const minIdx = vals.indexOf(min);
  const gapPct = pct(current - min, min);
  /* 建议条文字与 8% 同色底色叠加,原 #059669/#0ea5e9/#d97706/#dc2626 实测对比度仅 2.6~4.3,
     均低于 AA 的 4.5:1;这里换成同色系更深一档的色值(实测 4.9~6.7) */
  let advice, color;
  if (gapPct === null){ advice = '⚠️ 价格数据异常,暂无法给出入手建议'; color = '#475569'; }
  else if (gapPct <= 3){ advice = '✅ 当前价接近全年最低,可以放心入手'; color = '#047857'; }
  else if (gapPct <= 8){ advice = '👍 当前价处于较低位,刚需可直接买'; color = '#0369a1'; }
  else if (gapPct <= 15){ advice = `⏳ 当前比全年最低价高 ${gapPct}%,不急可蹲 618 / 双11`; color = '#a34a08'; }
  else { advice = `🛑 当前比全年最低价高 ${gapPct}%,建议加购物车等大促`; color = '#b91c1c'; }
  const rangePct = pct(max - min, min);

  $('#piBox').innerHTML = `
    <div class="pi-line"><span>当前价(${MONTHS[curIdx]})</span><b>${fmt(current)}</b></div>
    <div class="pi-line"><span>全年最低(${MONTHS[minIdx]})</span><b style="color:#047857">${fmt(min)}</b></div>
    <div class="pi-line"><span>全年最高(${MONTHS[vals.indexOf(max)]})</span><b style="color:#dc2626">${fmt(max)}</b></div>
    <div class="pi-line"><span>价格波动幅度</span><b>${rangePct === null ? '—' : rangePct + '%'}</b></div>
    <div class="pi-advice" style="background:${color}14;color:${color}">${advice}</div>`;

  const ctx = document.getElementById('trendChart');
  /* Chart.js 未加载 / canvas 缺失时降级为文字提示,比价表、榜单、日历等其它功能不受影响 */
  if (!window.Chart || !ctx){
    const box = document.querySelector('.chart-box');
    if (box){
      box.classList.add('nochart');
      if (!box.querySelector('.chart-fallback')){
        const tip = document.createElement('p');
        tip.className = 'chart-fallback';
        tip.textContent = '图表组件未加载,价格区间已在上方文字中列出,比价功能不受影响';
        box.appendChild(tip);
      }
    }
    return;
  }
  if (trendChart){ trendChart.destroy(); trendChart = null; }
  const grad = ctx.getContext('2d').createLinearGradient(0,0,0,260);
  grad.addColorStop(0,'rgba(37,99,235,.22)');
  grad.addColorStop(1,'rgba(37,99,235,0)');
  const radii = vals.map((v,i)=> i===minIdx ? 6 : (i===curIdx ? 6 : 3));
  const colors = vals.map((v,i)=> i===minIdx ? '#059669' : '#2563eb');
  try {
    trendChart = new Chart(ctx, {
      type:'line',
      data:{ labels:MONTHS, datasets:[{
        label:p.name, data:vals, borderColor:'#2563eb', backgroundColor:grad,
        fill:true, tension:.35, borderWidth:2.5, pointRadius:radii, pointBackgroundColor:colors
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        /* 触屏:手指无法像鼠标那样精确悬停到 3px 的圆点上,
           改成「任意位置都命中最近的月份」,点一下就能看到该月价格 */
        interaction:{mode:'index',intersect:false},
        plugins:{
          legend:{display:false},
          tooltip:{callbacks:{label:c=>` ${MONTHS[c.dataIndex]}:${fmt(c.parsed.y)}${c.dataIndex===minIdx?' (全年最低)':''}`}}
        },
        scales:{ y:{ticks:{callback:v=>'¥'+v}} }
      }
    });
  } catch(err){
    /* 图表组件自身异常不应向外冒泡,更不能中断首屏初始化(榜单/日历) */
    trendChart = null;
    if (window.console && console.warn) console.warn('[CampusPrice] 价格趋势图渲染失败:', err);
  }
}

const cmpSelect = $('#cmpSelect');
cmpSelect.innerHTML = P.map(p=>`<option value="${p.id}">${p.brand ? p.brand + ' ' : ''}${p.name}(${fmt(p.base)})</option>`).join('');
cmpSelect.addEventListener('change', ()=> loadCompare(+cmpSelect.value));

/* ---------- 比价搜索(联想+自定义) ---------- */
const cmpSearchForm = $('#cmpSearchForm'), cmpSearch = $('#cmpSearch'), cmpSuggest = $('#cmpSuggest');
function showSuggest(term){
  if (!term){ cmpSuggest.classList.remove('show'); return; }
  const list = P.filter(p=>p.name.includes(term)||p.cat.includes(term)||p.sell.includes(term)).slice(0,8);
  cmpSuggest.innerHTML = list.map(p=>`<button type="button" data-id="${p.id}"><span>${p.emoji} ${p.name}</span><span class="sg-cat">${p.cat}</span></button>`).join('')
    + `<button type="button" data-custom="1"><span class="sg-new">🔎 对「${esc(term)}」按类目估算比价</span><span class="sg-cat">估算数据</span></button>`;
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
  /* 先聚焦再收起:否则被点中的联想按钮随下拉一起隐藏,焦点会掉回 body,
     键盘用户下一次 Tab 会从页首重新开始;先 focus 会触发 focus 监听重开下拉,故顺序不能反 */
  cmpSearch.focus();
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
    /* role=status + aria-live:轻提示是纯视觉的 2.6s 气泡,读屏用户原本完全收不到这条反馈 */
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    /* width:max-content + max-width:否则 position:fixed 元素按 left:50% 之外的剩余空间收缩,
       长文案(如「已生成「…」的估算比价」)在手机上会被压成半屏宽的细长条 */
    t.style.cssText = 'position:fixed;left:50%;bottom:calc(44px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:max-content;max-width:calc(100vw - 32px);text-align:center;line-height:1.5;background:#fff;border:1px solid rgba(37,99,235,.5);color:#1d4ed8;padding:11px 24px;border-radius:22px;font-size:14px;z-index:300;box-shadow:0 12px 36px rgba(15,23,42,.18);pointer-events:none;transition:opacity .3s';
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
  if (match){ curCat='全部'; curTerm=term; setActiveTab('全部'); renderGrid(); loadCompare(match); }
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

/* 移动端菜单:同步 aria-expanded / aria-label,展开时锁定背景滚动(关闭时必须解锁,否则页面会永久不能滚动) */
const navMenu = $('#navMenu'), burger = $('#burger');
function setMenu(open){
  navMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  /* 展开后按钮的作用已变成「关闭」,名称必须跟着变,否则读屏听到的是相反的操作 */
  burger.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
}
burger.addEventListener('click', ()=>{
  const open = !navMenu.classList.contains('open');
  setMenu(open);
  /* 展开后把焦点送进浮层,键盘用户不必再从头 Tab 一遍 */
  if (open){
    const first = navMenu.querySelector('a');
    if (first) first.focus();
  }
});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click', ()=> setMenu(false)));
/* 点菜单外的空白处 / 按 Esc 也要能关掉,而不是只能靠再点一次汉堡 */
document.addEventListener('click', e=>{
  if (!navMenu.classList.contains('open')) return;
  if (e.target.closest('#navMenu') || e.target.closest('#burger')) return;
  setMenu(false);
});
addEventListener('keydown', e=>{
  if (e.key !== 'Escape') return;
  /* Esc 优先关闭比价联想下拉(它同样是浮层,原实现只能用鼠标点空白处关掉) */
  if (cmpSuggest.classList.contains('show')){
    cmpSuggest.classList.remove('show');
    cmpSearch.focus();
    return;
  }
  const wasOpen = navMenu.classList.contains('open');
  setMenu(false);
  /* 焦点送回触发它的汉堡按钮,避免键盘用户「焦点掉到 body」后从页首重新 Tab */
  if (wasOpen) burger.focus();
});
/* 旋屏或拉宽窗口回到桌面断点后菜单已不可见,此处兜底解锁,避免滚动锁定残留 */
addEventListener('resize', ()=>{ if (innerWidth > 960) setMenu(false); }, {passive:true});

/* ---------- 图表默认 & 初始化 ---------- */
if (window.Chart && Chart.defaults && Chart.defaults.font){
  Chart.defaults.color = '#5f6f86';
  Chart.defaults.font.family = '"Noto Sans SC","Microsoft YaHei",sans-serif';
  Chart.defaults.borderColor = 'rgba(15,23,42,.08)';
}
/* 先渲染首屏榜单与日历,再做比价/图表:即便比价或图表组件异常,核心内容也已就位 */
renderGrid();
renderCalendar();
loadCompare(P[0]);
