type DataSource = "本地整理" | "Met API" | "Wikipedia";

type CoreArtifact = {
  id: string;
  name: string;
  period: string;
  material: string;
  cultureRegion: string;
  currentLocation: string;
  image: string;
  sourceUrl: string;
  dataSource: DataSource;
  themes: string[];
  emotionTags: string[];
  searchKeywords: string[];
  story: string;
  firstPersonView: string;
  responseTemplate: string;
  reason: string;
};

type ExtendedArtifact = {
  id: string;
  name: string;
  cultureRegion: string;
  currentLocation: string;
  period: string;
  material: string;
  themes: string[];
  image: string;
  sourceUrl: string;
};

export type Artifact = CoreArtifact & {
  dynasty: string;
  origin: string;
  imageCredit: string;
  keywords: string[];
  themeTags: string[];
  prompt: string;
  historyStory: string;
  matchReason: string;
  westernCandidate: string;
  westernCandidateReason: string;
  finalChoiceReason: string;
  response: string;
};

const defaultPrompt =
  "A quiet digital museum exhibition, Chinese artifact under soft warm light, restrained composition, poetic curatorial atmosphere";

export const coreArtifacts: CoreArtifact[] = [
  {
    id: "jade-cong",
    name: "良渚玉琮",
    period: "新石器时代晚期",
    material: "玉",
    cultureRegion: "中国",
    currentLocation: "浙江省博物馆等机构藏有同类器物",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Liangzhu%20Culture%20Jade%20Cong%2005.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Cong_(vessel)",
    dataSource: "Wikipedia",
    themes: ["方向", "秩序", "中心", "安放"],
    emotionTags: ["迷茫", "不确定", "焦虑", "失序"],
    searchKeywords: ["jade", "ritual", "center", "sacred"],
    story: "玉琮以方外圆内的形制连接天地想象，像人在混沌中为自己找回中心。",
    firstPersonView: "从我的孔洞向外看，世界像一条被黑暗包围的竖井，光从很远处落下来。",
    responseTemplate:
      "我曾被埋在黑暗里很久，却仍记住了中心。你此刻的{emotion}，不必立刻变成答案。先把自己放回中心，方向会慢慢出现。",
    reason: "它回应迷茫与失序，以方圆结构提示人重新寻找中心。"
  },
  {
    id: "ru-ware",
    name: "汝窑天青釉洗",
    period: "北宋",
    material: "瓷、天青釉",
    cultureRegion: "中国",
    currentLocation: "故宫博物院等机构藏有同类器物",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ru%20Ware%20Celadon%2C%20Northern%20Song%20%2838093962915%29.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Ru_ware",
    dataSource: "Wikipedia",
    themes: ["等待", "修复", "时间", "裂纹"],
    emotionTags: ["疲惫", "压力", "过载", "低落"],
    searchKeywords: ["ceramic", "bowl", "glaze", "quiet"],
    story: "汝窑的天青色像雨后天空，开片裂纹让完整不再等同于无伤。",
    firstPersonView: "我看见世界被天青色轻轻盖住，急促的念头都落进细裂纹里。",
    responseTemplate:
      "我的颜色不是晴天最亮的时候，而是雨后天空刚松开眉头的一瞬。你此刻的{emotion}，可以先不被催促。裂纹不是失败。",
    reason: "它适合承接疲惫和过载，把紧绷转化为温柔的停顿。"
  },
  {
    id: "houmuwu-ding",
    name: "后母戊鼎",
    period: "商代晚期",
    material: "青铜",
    cultureRegion: "中国",
    currentLocation: "中国国家博物馆",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/HouMuWuDingFullView.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Houmuwu_Ding",
    dataSource: "Wikipedia",
    themes: ["责任", "秩序", "死亡", "长期主义"],
    emotionTags: ["后悔", "不安", "责任", "代价"],
    searchKeywords: ["bronze", "ritual", "vessel", "power"],
    story: "巨大的青铜礼器把祭祀、家族记忆和责任铸成可见的重量。",
    firstPersonView: "火光、祭礼、脚步和沉默围绕着我，人们把说不出口的责任交给青铜。",
    responseTemplate:
      "我很重，因为人把责任和不可回头的选择都铸进了我。你此刻的{emotion}，并不说明你已经失败。愿意承担，就是新的火候。",
    reason: "它回应选择后的不安，把错误感转化为承担和修正。"
  },
  {
    id: "bronze-mirror",
    name: "海兽葡萄纹铜镜",
    period: "唐代",
    material: "青铜",
    cultureRegion: "中国",
    currentLocation: "多地博物馆藏有同类器物",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Tang%20Dynasty%20Bronze%20Mirror%20-%201.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Bronze_mirror",
    dataSource: "Wikipedia",
    themes: ["关系", "自我", "时间", "看见"],
    emotionTags: ["怀疑", "孤独", "比较", "不被理解"],
    searchKeywords: ["mirror", "bronze", "reflection", "identity"],
    story: "铜镜连接容貌、身份和他者目光，也让人重新面对自己的影像。",
    firstPersonView: "我看见的世界总有两层：人的脸，以及人藏在脸后的迟疑。",
    responseTemplate:
      "我照见过许多脸，也照见过人们藏在脸后的迟疑。你此刻的{emotion}，不必交给别人的目光审判。",
    reason: "它回应关系与自我怀疑，让外界目光回到自我辨认。"
  },
  {
    id: "blue-white-jar",
    name: "青花云龙纹罐",
    period: "元代",
    material: "瓷、钴蓝釉下彩",
    cultureRegion: "中国",
    currentLocation: "海内外多家机构藏有元青花同类器",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Yuan%20Dynasty%20Blue%20and%20White%20Jar%20Topkap%C4%B1.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Blue_and_white_pottery",
    dataSource: "Wikipedia",
    themes: ["改变", "创造", "远行", "梦想"],
    emotionTags: ["想改变", "兴奋", "不确定", "期待"],
    searchKeywords: ["vessel", "ceramic", "fire", "transformation"],
    story: "青花把远方的钴料、窑火和中国瓷胎结合，形成新的视觉语言。",
    firstPersonView: "我眼中的世界带着钴蓝色的风，海路、窑火和云龙在胎土上相遇。",
    responseTemplate:
      "我身上的蓝来自远方，落在瓷胎上，却成了自己的云与龙。你此刻的{emotion}，正像入窑前的胎土。让它成形。",
    reason: "它回应想改变但不确定的状态，把远方与火候转化为成形。"
  },
  {
    id: "flying-horse",
    name: "铜奔马",
    period: "东汉",
    material: "青铜",
    cultureRegion: "中国",
    currentLocation: "甘肃省博物馆",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/%E9%9B%B7%E5%8F%B0%E6%B1%89%E5%A2%93%E9%93%9C%E5%A5%94%E9%A9%AC2.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Flying_Horse_of_Gansu",
    dataSource: "Wikipedia",
    themes: ["自由", "远行", "行动", "突破"],
    emotionTags: ["停滞", "困住", "拖延", "想逃"],
    searchKeywords: ["horse", "movement", "journey", "speed"],
    story: "铜奔马以一足踏飞鸟的姿态，让沉重青铜获得奔跑的想象。",
    firstPersonView: "我眼中的世界不是静止的展厅，而是一阵正在越过地面的风。",
    responseTemplate:
      "我被铸成奔跑的样子，却在展柜里静止了许多年。你此刻的{emotion}，也许只差一个小动作。真正的出发从重心移动开始。",
    reason: "它回应停滞和突破欲，把静止转化为行动。"
  },
  {
    id: "painted-pottery-basin",
    name: "人面鱼纹彩陶盆",
    period: "新石器时代",
    material: "彩陶",
    cultureRegion: "中国",
    currentLocation: "中国国家博物馆",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Yangshao%20Culture%20Painted%20Pottery%20Basin.jpg",
    sourceUrl: "https://zh.wikipedia.org/wiki/%E4%BA%BA%E9%9D%A2%E9%B1%BC%E7%BA%B9%E5%BD%A9%E9%99%B6%E7%9B%86",
    dataSource: "Wikipedia",
    themes: ["成长", "死亡", "重生", "关系"],
    emotionTags: ["脆弱", "怀念", "不安", "成长"],
    searchKeywords: ["pottery", "fish", "ritual", "rebirth"],
    story: "人面与鱼纹共同出现，连接生命、繁衍和早期信仰中的重生想象。",
    firstPersonView: "水纹在我身上回旋，人面与鱼像在同一场梦里互相凝望。",
    responseTemplate: "我来自水与土，也来自人对生命循环的想象。你此刻的{emotion}，可以被看作一次重新生长。",
    reason: "它回应成长、脆弱和重生，把不安放进生命循环。"
  },
  {
    id: "sanxingdui-mask",
    name: "三星堆青铜纵目面具",
    period: "商周时期",
    material: "青铜",
    cultureRegion: "中国",
    currentLocation: "三星堆博物馆",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Sanxingdui%20bronze%20mask.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Sanxingdui",
    dataSource: "Wikipedia",
    themes: ["梦想", "创造", "自由", "未知"],
    emotionTags: ["困惑", "惊奇", "渴望", "不被理解"],
    searchKeywords: ["mask", "bronze", "mystery", "vision"],
    story: "纵目的面具像一种超越日常的观看方式，打开古蜀文明神秘而自由的想象。",
    firstPersonView: "我的目光向远处伸展，世界不只在眼前，也在看不见的地方发光。",
    responseTemplate: "我不是为了像谁而存在。你此刻的{emotion}，也许正说明你在长出另一种观看世界的眼睛。",
    reason: "它回应不被理解和梦想，提醒人保留异质的观看。"
  },
  {
    id: "changxin-lamp",
    name: "长信宫灯",
    period: "西汉",
    material: "鎏金青铜",
    cultureRegion: "中国",
    currentLocation: "河北博物院",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Changxin%20Palace%20Lamp.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Changxin_Palace_Lamp",
    dataSource: "Wikipedia",
    themes: ["等待", "秩序", "责任", "时间"],
    emotionTags: ["焦虑", "疲惫", "克制", "等待"],
    searchKeywords: ["lamp", "bronze", "light", "palace"],
    story: "宫灯以人的姿态托举光，也以巧妙结构处理烟尘，象征克制中的照明。",
    firstPersonView: "我托着一束不刺眼的光，照见屋内缓慢移动的尘埃。",
    responseTemplate: "我知道等待不只是静止，也是一种照看。你此刻的{emotion}，可以先被一束小光安放。",
    reason: "它回应等待与克制，用温和的光处理焦虑。"
  },
  {
    id: "mawangdui-banner",
    name: "马王堆一号汉墓帛画",
    period: "西汉",
    material: "丝帛、矿物颜料",
    cultureRegion: "中国",
    currentLocation: "湖南博物院",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mawangdui%20silk%20banner.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Mawangdui",
    dataSource: "Wikipedia",
    themes: ["死亡", "重生", "时间", "秩序"],
    emotionTags: ["失去", "哀伤", "恐惧", "怀念"],
    searchKeywords: ["banner", "silk", "afterlife", "death"],
    story: "帛画以天地、人间与地下的结构描绘死后世界，给不可知的死亡以秩序。",
    firstPersonView: "我看见灵魂穿过层层图像，向上升起，也向记忆深处返回。",
    responseTemplate: "我曾陪伴人面对终点。你此刻的{emotion}，不是软弱，而是生命知道自己珍重过什么。",
    reason: "它回应失去与死亡，把哀伤放进更长的宇宙秩序。"
  },
  {
    id: "qingming-scroll",
    name: "清明上河图",
    period: "北宋",
    material: "绢本设色",
    cultureRegion: "中国",
    currentLocation: "故宫博物院",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Along%20the%20River%20During%20the%20Qingming%20Festival%20detail.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Along_the_River_During_the_Qingming_Festival",
    dataSource: "Wikipedia",
    themes: ["关系", "时间", "秩序", "远行"],
    emotionTags: ["孤独", "忙乱", "观察", "想连接"],
    searchKeywords: ["scroll", "city", "river", "people"],
    story: "长卷展开城市生活的细节，人与船、桥、市集共同组成流动的社会关系。",
    firstPersonView: "我看见桥上桥下的人群，喧闹里每个人都有自己的去处。",
    responseTemplate: "我展开的是一整座城的呼吸。你此刻的{emotion}，也只是人群长卷中的一处停顿。",
    reason: "它回应关系和忙乱，让个体重新看见自己与世界的连接。"
  },
  {
    id: "thousand-li",
    name: "千里江山图",
    period: "北宋",
    material: "绢本设色",
    cultureRegion: "中国",
    currentLocation: "故宫博物院",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Wang%20Ximeng%20-%20A%20Thousand%20Li%20of%20Rivers%20and%20Mountains.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/A_Thousand_Li_of_Rivers_and_Mountains",
    dataSource: "Wikipedia",
    themes: ["梦想", "远行", "创造", "自由"],
    emotionTags: ["向往", "渴望", "不甘", "期待"],
    searchKeywords: ["landscape", "mountain", "journey", "dream"],
    story: "青绿山水以辽阔尺度展开少年画家的想象，让远方成为可以凝视的精神空间。",
    firstPersonView: "群山像潮水一样展开，人在其间很小，却能把目光放得很远。",
    responseTemplate: "我把千里放进一卷画里。你此刻的{emotion}，也许不是贪心，而是心里仍有远方。",
    reason: "它回应梦想和远行，把渺小个体放进辽阔视野。"
  },
  {
    id: "dingyao-pillow",
    name: "定窑孩儿枕",
    period: "北宋",
    material: "白瓷",
    cultureRegion: "中国",
    currentLocation: "故宫博物院",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ding%20ware%20pillow.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Ding_ware",
    dataSource: "Wikipedia",
    themes: ["成长", "等待", "关系", "梦"],
    emotionTags: ["疲惫", "想休息", "柔软", "怀旧"],
    searchKeywords: ["pillow", "ceramic", "child", "dream"],
    story: "瓷枕以孩童形象承托睡眠，连接日常器物与安宁的身体记忆。",
    firstPersonView: "我听见夜晚降下来，人的重量轻轻落在梦的边缘。",
    responseTemplate: "我曾承托许多安睡的时刻。你此刻的{emotion}，可以先交给一个安静的夜晚。",
    reason: "它回应疲惫和成长中的脆弱，允许人暂时休息。"
  },
  {
    id: "oracle-bone",
    name: "甲骨刻辞",
    period: "商代",
    material: "龟甲或兽骨",
    cultureRegion: "中国",
    currentLocation: "中国国家博物馆等机构藏有同类器物",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Oracle%20bone%20script.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Oracle_bone",
    dataSource: "Wikipedia",
    themes: ["方向", "时间", "秩序", "未知"],
    emotionTags: ["不确定", "焦虑", "询问", "等待"],
    searchKeywords: ["oracle", "bone", "inscription", "question"],
    story: "甲骨刻辞把疑问刻入龟甲兽骨，让不可知的未来成为可以被询问的对象。",
    firstPersonView: "问题在我身上裂开，火与骨头一起回答人的不安。",
    responseTemplate: "我保存的不是确定答案，而是人认真发问的姿态。你此刻的{emotion}，也可以先成为一个好问题。",
    reason: "它回应方向和未知，把焦虑转换成提问。"
  },
  {
    id: "lantern-shape-vase",
    name: "霁青釉金彩海晏河清尊",
    period: "清代",
    material: "瓷、釉、金彩",
    cultureRegion: "中国",
    currentLocation: "故宫博物院",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Qianlong%20vase.jpg",
    sourceUrl: "https://en.wikipedia.org/wiki/Chinese_ceramics",
    dataSource: "Wikipedia",
    themes: ["秩序", "梦想", "创造", "责任"],
    emotionTags: ["期望", "压力", "理想", "责任"],
    searchKeywords: ["vase", "porcelain", "peace", "order"],
    story: "器名寄寓天下安定的理想，华丽工艺背后是对秩序与愿景的想象。",
    firstPersonView: "我身上的金彩像被安放好的愿望，在静光里等待世界变得平和。",
    responseTemplate: "我被赋予过太大的祝愿。你此刻的{emotion}，也许说明你仍想把混乱整理成一个愿景。",
    reason: "它回应理想和压力，把愿望转成秩序感。"
  }
];

export const extendedArtifacts: ExtendedArtifact[] = [
  ["direction-compass", "司南", "中国", "本地整理", ["方向", "秩序"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20compass.jpg", "https://en.wikipedia.org/wiki/South-pointing_spoon"],
  ["yue-king-sword", "越王勾践剑", "中国", "湖北省博物馆", ["责任", "失败", "重生"], "https://commons.wikimedia.org/wiki/Special:FilePath/Sword%20of%20Goujian.jpg", "https://en.wikipedia.org/wiki/Sword_of_Goujian"],
  ["zenghouyi-bells", "曾侯乙编钟", "中国", "湖北省博物馆", ["秩序", "创造", "关系"], "https://commons.wikimedia.org/wiki/Special:FilePath/Bianzhong%20of%20Marquis%20Yi%20of%20Zeng.jpg", "https://en.wikipedia.org/wiki/Bianzhong_of_Marquis_Yi_of_Zeng"],
  ["terracotta-warrior", "秦始皇陵兵马俑", "中国", "秦始皇帝陵博物院", ["死亡", "秩序", "责任"], "https://commons.wikimedia.org/wiki/Special:FilePath/Terracotta%20Army%2C%20View%20of%20Pit%201.jpg", "https://en.wikipedia.org/wiki/Terracotta_Army"],
  ["gold-suit", "金缕玉衣", "中国", "河北博物院等机构藏有同类器物", ["死亡", "重生", "时间"], "https://commons.wikimedia.org/wiki/Special:FilePath/Jade%20burial%20suit.jpg", "https://en.wikipedia.org/wiki/Jade_burial_suit"],
  ["bronze-tree", "三星堆青铜神树", "中国", "三星堆博物馆", ["梦想", "创造", "秩序"], "https://commons.wikimedia.org/wiki/Special:FilePath/Sanxingdui%20Bronze%20Tree.jpg", "https://en.wikipedia.org/wiki/Sanxingdui"],
  ["sun-bird", "太阳神鸟金饰", "中国", "成都金沙遗址博物馆", ["重生", "时间", "梦想"], "https://commons.wikimedia.org/wiki/Special:FilePath/Golden%20Sun%20Bird.jpg", "https://en.wikipedia.org/wiki/Golden_Sun_Bird"],
  ["lotus-crane", "莲鹤方壶", "中国", "河南博物院", ["自由", "改变", "创造"], "https://commons.wikimedia.org/wiki/Special:FilePath/Lotus%20and%20Crane%20Rectangular%20Hu.jpg", "https://zh.wikipedia.org/wiki/%E8%8E%B2%E9%B9%A4%E6%96%B9%E5%A3%B6"],
  ["t-shaped-silk", "T形帛画", "中国", "湖南博物院", ["死亡", "重生", "秩序"], "https://commons.wikimedia.org/wiki/Special:FilePath/Mawangdui%20silk%20banner.jpg", "https://en.wikipedia.org/wiki/Mawangdui"],
  ["han-jade-pendant", "玉龙形佩", "中国", "中国国家博物馆等机构藏有同类器物", ["成长", "梦想", "创造"], "https://commons.wikimedia.org/wiki/Special:FilePath/Jade%20dragon%20Hongshan.jpg", "https://en.wikipedia.org/wiki/Hongshan_culture"],
  ["porcelain-pagoda", "南京大报恩寺琉璃构件", "中国", "南京博物院等机构藏有同类器物", ["重生", "创造", "信念"], "https://commons.wikimedia.org/wiki/Special:FilePath/Porcelain%20Tower%20of%20Nanjing.jpg", "https://en.wikipedia.org/wiki/Porcelain_Tower_of_Nanjing"],
  ["lacquer-box", "云纹漆奁", "中国", "湖南博物院等机构藏有同类器物", ["关系", "时间", "等待"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20lacquerware.jpg", "https://en.wikipedia.org/wiki/Chinese_lacquerware"],
  ["bronze-rhino", "错金银云纹铜犀尊", "中国", "中国国家博物馆", ["力量", "秩序", "责任"], "https://commons.wikimedia.org/wiki/Special:FilePath/Bronze%20rhinoceros%20zun.jpg", "https://en.wikipedia.org/wiki/Zun_(vessel)"],
  ["guan-ware", "官窑贯耳瓶", "中国", "故宫博物院等机构藏有同类器物", ["等待", "秩序", "修复"], "https://commons.wikimedia.org/wiki/Special:FilePath/Guan%20ware%20vase.jpg", "https://en.wikipedia.org/wiki/Guan_ware"],
  ["five-oxen", "五牛图", "中国", "故宫博物院", ["责任", "时间", "忍耐"], "https://commons.wikimedia.org/wiki/Special:FilePath/Five%20Oxen.jpg", "https://en.wikipedia.org/wiki/Five_Oxen"],
  ["night-revels", "韩熙载夜宴图", "中国", "故宫博物院", ["关系", "时间", "自我"], "https://commons.wikimedia.org/wiki/Special:FilePath/Night%20Revels%20of%20Han%20Xizai.jpg", "https://en.wikipedia.org/wiki/The_Night_Revels_of_Han_Xizai"],
  ["nianhua", "杨柳青年画", "中国", "本地整理", ["梦想", "重生", "关系"], "https://commons.wikimedia.org/wiki/Special:FilePath/Yangliuqing%20New%20Year%20Picture.jpg", "https://en.wikipedia.org/wiki/New_Year_picture"],
  ["bamboo-slip", "居延汉简", "中国", "甘肃简牍博物馆等机构", ["时间", "远行", "责任"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20bamboo%20slips.jpg", "https://en.wikipedia.org/wiki/Bamboo_and_wooden_slips"],
  ["dunhuang-scroll", "敦煌写经", "中国", "敦煌研究院等机构藏有同类文物", ["等待", "信念", "时间"], "https://commons.wikimedia.org/wiki/Special:FilePath/Dunhuang%20manuscript.jpg", "https://en.wikipedia.org/wiki/Dunhuang_manuscripts"],
  ["mogao-fresco", "莫高窟壁画", "中国", "敦煌研究院", ["梦想", "死亡", "远行"], "https://commons.wikimedia.org/wiki/Special:FilePath/Mogao%20Caves%20mural.jpg", "https://en.wikipedia.org/wiki/Mogao_Caves"],
  ["tricolor-camel", "唐三彩载乐骆驼俑", "中国", "中国国家博物馆等机构藏有同类器物", ["远行", "关系", "创造"], "https://commons.wikimedia.org/wiki/Special:FilePath/Tang%20Sancai%20Camel.jpg", "https://en.wikipedia.org/wiki/Tang_dynasty_tomb_figures"],
  ["prancing-horse", "唐三彩马", "中国", "多地博物馆藏有同类器物", ["自由", "远行", "梦想"], "https://commons.wikimedia.org/wiki/Special:FilePath/Tang%20Sancai%20Horse.jpg", "https://en.wikipedia.org/wiki/Sancai"],
  ["white-porcelain", "白瓷孩儿枕", "中国", "故宫博物院等机构藏有同类器物", ["成长", "等待", "梦"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20porcelain%20pillow.jpg", "https://en.wikipedia.org/wiki/Chinese_ceramics"],
  ["famille-rose", "粉彩转心瓶", "中国", "故宫博物院", ["创造", "改变", "秩序"], "https://commons.wikimedia.org/wiki/Special:FilePath/Famille%20rose%20vase.jpg", "https://en.wikipedia.org/wiki/Famille_rose"],
  ["jade-cabbage", "翠玉白菜", "中国", "台北故宫博物院", ["成长", "关系", "生命"], "https://commons.wikimedia.org/wiki/Special:FilePath/Jadeite%20Cabbage.jpg", "https://en.wikipedia.org/wiki/Jadeite_Cabbage"],
  ["meat-stone", "肉形石", "中国", "台北故宫博物院", ["创造", "日常", "关系"], "https://commons.wikimedia.org/wiki/Special:FilePath/Meat-shaped%20Stone.jpg", "https://en.wikipedia.org/wiki/Meat-shaped_Stone"],
  ["mao-gong-ding", "毛公鼎", "中国", "台北故宫博物院", ["责任", "秩序", "时间"], "https://commons.wikimedia.org/wiki/Special:FilePath/Mao%20Gong%20Ding.jpg", "https://en.wikipedia.org/wiki/Mao_Gong_Ding"],
  ["stone-drum", "石鼓文", "中国", "故宫博物院", ["时间", "秩序", "方向"], "https://commons.wikimedia.org/wiki/Special:FilePath/Stone%20Drums%20of%20Qin.jpg", "https://en.wikipedia.org/wiki/Stone_Drums_of_Qin"],
  ["guqin", "唐琴九霄环佩", "中国", "故宫博物院", ["关系", "自由", "创造"], "https://commons.wikimedia.org/wiki/Special:FilePath/Guqin.jpg", "https://en.wikipedia.org/wiki/Guqin"],
  ["bronze-bird", "青铜鸟形尊", "中国", "山西博物院等机构藏有同类器物", ["自由", "梦想", "重生"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20bronze%20bird.jpg", "https://en.wikipedia.org/wiki/Chinese_ritual_bronzes"],
  ["jade-bi", "玉璧", "中国", "多地博物馆藏有同类器物", ["秩序", "死亡", "时间"], "https://commons.wikimedia.org/wiki/Special:FilePath/Jade%20bi.jpg", "https://en.wikipedia.org/wiki/Bi_(jade)"],
  ["taotie-you", "饕餮纹卣", "中国", "多地博物馆藏有同类器物", ["责任", "死亡", "秩序"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20bronze%20you.jpg", "https://en.wikipedia.org/wiki/You_(vessel)"],
  ["dragon-robe", "龙袍", "中国", "故宫博物院等机构藏有同类服饰", ["责任", "秩序", "梦想"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20dragon%20robe.jpg", "https://en.wikipedia.org/wiki/Dragon_robe"],
  ["cloisonne", "掐丝珐琅缠枝莲纹象耳炉", "中国", "故宫博物院等机构藏有同类器物", ["创造", "秩序", "关系"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20cloisonne.jpg", "https://en.wikipedia.org/wiki/Chinese_cloisonn%C3%A9"],
  ["woodblock", "雕版印刷经卷", "中国", "多地机构藏有同类文物", ["创造", "时间", "传播"], "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20woodblock%20printing.jpg", "https://en.wikipedia.org/wiki/Woodblock_printing"]
].map(([id, name, cultureRegion, currentLocation, themes, image, sourceUrl]) => ({
  id: id as string,
  name: name as string,
  cultureRegion: cultureRegion as string,
  currentLocation: currentLocation as string,
  period: "见资料链接",
  material: "见资料链接",
  themes: themes as string[],
  image: image as string,
  sourceUrl: sourceUrl as string
}));

function expandExtended(item: ExtendedArtifact): Artifact {
  const themes = item.themes;
  const emotionTags = themes;

  return {
    ...item,
    period: item.period,
    dynasty: item.period,
    material: item.material,
    origin: item.currentLocation,
    imageCredit: "Wikipedia / Wikimedia Commons",
    dataSource: "Wikipedia",
    keywords: themes,
    emotionTags,
    themeTags: themes,
    searchKeywords: themes.map((theme) => theme.toLowerCase()),
    prompt: defaultPrompt,
    firstPersonView: `我从${item.name}的纹理和形制里看见${themes.join("、")}。`,
    historyStory: `${item.name}被放入“${themes.join("、")}”这一组文明主题中，作为本地整理的扩展候选。`,
    story: `${item.name}被放入“${themes.join("、")}”这一组文明主题中，作为本地整理的扩展候选。`,
    matchReason: `它与${themes.join("、")}相关，适合作为此刻情绪的文化参照。`,
    reason: `它与${themes.join("、")}相关，适合作为此刻情绪的文化参照。`,
    westernCandidate: "Met API 候选文物",
    westernCandidateReason: "作为跨文明参照，由开放馆藏 API 或本地候选补充。",
    finalChoiceReason: `最终选择${item.name}，因为它的主题与当前输入形成呼应。`,
    response: `我以${themes.join("、")}回应你。`,
    responseTemplate: `我以${themes.join("、")}回应你此刻的{emotion}。先不要急着抵达答案，让自己和这件文物一起停留片刻。`
  };
}

export const artifacts: Artifact[] = [
  ...coreArtifacts.map((item) => ({
    ...item,
    dynasty: item.period,
    origin: item.currentLocation,
    imageCredit: `${item.dataSource}`,
    keywords: [...item.themes, ...item.emotionTags],
    themeTags: item.themes,
    prompt: defaultPrompt,
    historyStory: item.story,
    matchReason: item.reason,
    westernCandidate: "Met API 候选文物",
    westernCandidateReason: "作为跨文明参照，由开放馆藏 API 返回。",
    finalChoiceReason: `最终选择${item.name}，因为它与当前输入中的文明主题最接近。`,
    response: item.responseTemplate.replace("{emotion}", "当下情绪")
  })),
  ...extendedArtifacts.map(expandExtended)
];
