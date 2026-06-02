"use client";

import { FormEvent, useMemo, useState } from "react";
import { Artifact, artifacts } from "./data/artifacts";

type UserAnalysis = {
  emotion: string;
  themes: string[];
  searchKeywords: string[];
  explanation: string;
  source: "deepseek" | "fallback";
};

type MatchResult = {
  userInput: string;
  analysis: UserAnalysis;
  artifact: Artifact;
  score: number;
  response: string;
  responseSource: "deepseek" | "fallback";
  metCandidate: MetCandidate | null;
  metCandidates: MetCandidate[];
};

type CurationTab = "why" | "civilization" | "writing";

type PoemState = {
  userText: string;
  isLoading: boolean;
  error: string | null;
  poem: {
    chinesePoem: {
      title: string;
      author: string;
      content: string;
      reason: string;
    };
    englishPoem: {
      title: string;
      titleCn: string;
      author: string;
      authorCn: string;
      content: string;
      translation: string;
      reason: string;
    };
  } | null;
};

type MetCandidate = {
  title: string;
  objectName: string;
  objectDate: string;
  culture: string;
  medium: string;
  classification: string;
  department: string;
  primaryImage?: string;
  primaryImageSmall: string;
  objectURL: string;
  relevanceScore: number;
  translation?: MetTranslation;
};

type CivilizationCandidate = {
  label: string;
  name: string;
  englishName?: string;
  cultureRegion: string;
  currentLocation?: string;
  period: string;
  material: string;
  reason: string;
  sourceUrl?: string;
};

type MetCandidateResult = {
  selected: MetCandidate;
  candidates: MetCandidate[];
};

type CrossCivilizationArtifact = CivilizationCandidate & {
  themes: string[];
  emotionTags: string[];
  searchKeywords: string[];
};

type MetSearchResponse = {
  objectIDs?: number[] | null;
};

type MetObjectResponse = {
  objectID?: number;
  objectName?: string;
  title?: string;
  objectDate?: string;
  culture?: string;
  medium?: string;
  primaryImage?: string;
  primaryImageSmall?: string;
  objectURL?: string;
  repository?: string;
  classification?: string;
  creditLine?: string;
  department?: string;
};

type MetTranslation = {
  titleZh: string;
  titleEn: string;
  cultureZh: string;
  dateZh: string;
  mediumZh: string;
  storyZh: string;
  responseTemplateZh: string;
  fallback?: boolean;
};

const crossCivilizationArtifacts: CrossCivilizationArtifact[] = [
  {
    label: "古希腊文明",
    name: "胜利女神尼刻像",
    cultureRegion: "古希腊",
    currentLocation: "卢浮宫",
    period: "约公元前190年",
    material: "帕罗斯大理石",
    themes: ["胜利", "庆祝", "荣耀", "自由", "远行", "成就"],
    emotionTags: ["喜悦", "期待", "兴奋", "自豪"],
    searchKeywords: ["victory", "nike", "glory", "celebration"],
    reason: "它以迎风展开的姿态回应胜利、荣耀与抵达后的高处时刻。",
    sourceUrl: "https://en.wikipedia.org/wiki/Winged_Victory_of_Samothrace"
  },
  {
    label: "古希腊文明",
    name: "德尔斐青铜御者",
    cultureRegion: "古希腊",
    currentLocation: "德尔斐考古博物馆",
    period: "约公元前470年",
    material: "青铜",
    themes: ["方向", "秩序", "胜利", "克制", "责任"],
    emotionTags: ["迷茫", "平静", "期待", "不确定"],
    searchKeywords: ["charioteer", "delphi", "victory", "order"],
    reason: "它把胜利之后的克制保存下来，适合回应寻找方向与保持秩序的心境。",
    sourceUrl: "https://en.wikipedia.org/wiki/Charioteer_of_Delphi"
  },
  {
    label: "古希腊文明",
    name: "白底送别陶瓶",
    cultureRegion: "古希腊",
    currentLocation: "大都会艺术博物馆等机构藏有同类器物",
    period: "约公元前5世纪",
    material: "陶土、白底彩绘",
    themes: ["离别", "死亡", "等待", "时间", "关系"],
    emotionTags: ["悲伤", "怀念", "不舍", "平静"],
    searchKeywords: ["lekythos", "parting", "funerary", "memory"],
    reason: "白底陶瓶常与送别和纪念有关，能回应离别、等待与仍未放下的关系。",
    sourceUrl: "https://en.wikipedia.org/wiki/White-ground_technique"
  },
  {
    label: "日本文明",
    name: "志野茶碗",
    cultureRegion: "日本",
    currentLocation: "东京国立博物馆等机构藏有同类器物",
    period: "桃山时代",
    material: "陶器、釉",
    themes: ["等待", "修复", "平静", "失败", "重生"],
    emotionTags: ["疲惫", "平静", "不安", "自我怀疑"],
    searchKeywords: ["shino", "tea bowl", "quiet", "repair"],
    reason: "茶碗以手作痕迹和不完美回应等待、修复与自我安放。",
    sourceUrl: "https://en.wikipedia.org/wiki/Shino_ware"
  },
  {
    label: "日本文明",
    name: "曜变天目茶碗",
    cultureRegion: "日本",
    currentLocation: "静嘉堂文库美术馆",
    period: "南宋，传入日本后收藏",
    material: "陶瓷、铁釉",
    themes: ["梦想", "惊讶", "创造", "宇宙", "启示"],
    emotionTags: ["惊讶", "期待", "喜悦", "敬畏"],
    searchKeywords: ["tenmoku", "tea bowl", "stars", "wonder"],
    reason: "它在一只碗中显出星空般的光斑，适合回应惊讶、梦想与创造的瞬间。",
    sourceUrl: "https://en.wikipedia.org/wiki/Tenmoku"
  },
  {
    label: "日本文明",
    name: "短册和歌",
    cultureRegion: "日本",
    currentLocation: "东京国立博物馆等机构藏有同类作品",
    period: "江户时代及更早传统",
    material: "纸本墨书",
    themes: ["离别", "关系", "时间", "等待", "书信"],
    emotionTags: ["悲伤", "怀念", "温柔", "孤独"],
    searchKeywords: ["waka", "poem card", "letter", "parting"],
    reason: "短册把难以直说的情感收进窄长纸面，适合回应离别与等待。",
    sourceUrl: "https://en.wikipedia.org/wiki/Tanzaku"
  },
  {
    label: "古埃及文明",
    name: "阿尼纸草书",
    cultureRegion: "古埃及",
    currentLocation: "大英博物馆",
    period: "约公元前1250年",
    material: "纸草、颜料",
    themes: ["死亡", "秩序", "审判", "重生", "时间"],
    emotionTags: ["恐惧", "悲伤", "反思", "不安"],
    searchKeywords: ["book of the dead", "judgement", "afterlife", "order"],
    reason: "它把死亡后的审判与复归画成秩序，适合回应恐惧、反思与终点意识。",
    sourceUrl: "https://en.wikipedia.org/wiki/Papyrus_of_Ani"
  },
  {
    label: "古埃及文明",
    name: "图坦卡蒙黄金面具",
    cultureRegion: "古埃及",
    currentLocation: "埃及博物馆",
    period: "约公元前1323年",
    material: "黄金、玻璃、宝石",
    themes: ["死亡", "重生", "荣耀", "秩序", "责任"],
    emotionTags: ["恐惧", "悲伤", "敬畏", "平静"],
    searchKeywords: ["mask", "gold", "afterlife", "king"],
    reason: "面具以黄金保存面容，也保存人对死亡、荣耀与复归的想象。",
    sourceUrl: "https://en.wikipedia.org/wiki/Mask_of_Tutankhamun"
  },
  {
    label: "古埃及文明",
    name: "圣甲虫护符",
    cultureRegion: "古埃及",
    currentLocation: "大都会艺术博物馆等机构藏有同类器物",
    period: "新王国时期及以后",
    material: "釉陶、石、宝石等",
    themes: ["重生", "改变", "未来", "守护", "开始"],
    emotionTags: ["期待", "恐惧", "不安", "想改变但不确定"],
    searchKeywords: ["scarab", "amulet", "rebirth", "protection"],
    reason: "圣甲虫象征日复一日的更新，适合回应想改变却仍不确定的时刻。",
    sourceUrl: "https://en.wikipedia.org/wiki/Scarab_artifact"
  }
];

const defaultExample = "我很迷茫";

const analysisRules: Array<{
  triggers: string[];
  emotion: string;
  themes: string[];
  searchKeywords: string[];
  explanation: string;
}> = [
  {
    triggers: ["开心", "高兴", "喜悦", "冠军", "夺冠", "赢了", "胜利", "庆祝", "成功", "荣耀"],
    emotion: "喜悦与成就感",
    themes: ["胜利", "庆祝", "荣耀", "成就"],
    searchKeywords: ["victory", "celebration", "glory", "laurel"],
    explanation: "你的输入带着完成之后的明亮情绪，像一次抵达、被看见和值得庆祝的时刻。"
  },
  {
    triggers: ["离别", "分别", "告别", "分开", "想念", "舍不得", "远走", "送别", "再见"],
    emotion: "离别与怀念",
    themes: ["离别", "时间", "等待", "关系", "书信"],
    searchKeywords: ["parting", "letter", "memory", "farewell"],
    explanation: "你的输入指向离开之后仍留在心里的关系，时间被拉长，等待也变得具体。"
  },
  {
    triggers: ["改变", "开始", "重新", "未来", "计划", "想做", "成长", "转变"],
    emotion: "想改变但不确定",
    themes: ["重塑", "开始", "火候", "成形"],
    searchKeywords: ["vessel", "ceramic", "fire", "transformation"],
    explanation: "你的输入里有开始和改变的冲动，也有尚未完全成形的不确定。"
  },
  {
    triggers: ["决定", "错", "后悔", "不安", "选择", "代价", "承担", "失败"],
    emotion: "后悔与不安",
    themes: ["代价", "忍耐", "长期主义", "复归"],
    searchKeywords: ["sword", "battle", "king", "exile"],
    explanation: "你的输入指向选择之后的重量，像是在回看一个已经发生、但仍可修正的转折。"
  },
  {
    triggers: ["迷茫", "不知道", "方向", "混乱", "找不到", "空", "焦虑", "害怕"],
    emotion: "迷茫与不确定",
    themes: ["秩序", "中心", "寻找方向", "安放"],
    searchKeywords: ["oracle", "ritual", "sacred", "center"],
    explanation: "你的输入呈现出方向感暂时消失的状态，需要的不是答案，而是重新找到中心。"
  },
  {
    triggers: ["累", "疲惫", "压力", "睡不着", "烦", "崩溃", "喘不过气", "想停下"],
    emotion: "疲惫与过载",
    themes: ["修复", "静观", "余白", "裂纹"],
    searchKeywords: ["ceramic", "bowl", "healing", "quiet"],
    explanation: "你的输入像一个需要暂停的信号，情绪正在请求更慢、更柔和的承接。"
  },
  {
    triggers: ["自我", "怀疑", "别人", "比较", "孤独", "关系", "不被理解", "看见"],
    emotion: "自我怀疑与孤独",
    themes: ["自我观看", "身份", "目光", "关系"],
    searchKeywords: ["mirror", "portrait", "reflection", "identity"],
    explanation: "你的输入和他人的目光、自我确认有关，像是在寻找一个更诚实的镜面。"
  },
  {
    triggers: ["困住", "拖延", "停滞", "突破", "想逃", "行动", "勇气", "出发"],
    emotion: "停滞中的突破欲",
    themes: ["行动", "速度", "突破", "出发"],
    searchKeywords: ["horse", "movement", "journey", "speed"],
    explanation: "你的输入带着被困住后的行动欲，需要一件能把静止转化为出发的文物。"
  }
];

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function countTextHits(text: string, terms: string[]) {
  const normalized = normalize(text);
  return terms.reduce((score, term) => {
    return normalized.includes(normalize(term)) ? score + 1 : score;
  }, 0);
}

function overlapScore(source: string[], target: string[]) {
  const normalizedTarget = target.map(normalize);
  return source.reduce((score, item) => {
    const normalizedItem = normalize(item);
    return normalizedTarget.some(
      (targetItem) => targetItem.includes(normalizedItem) || normalizedItem.includes(targetItem)
    )
      ? score + 1
      : score;
  }, 0);
}

function isArtifactOnlyObject(objectData: MetObjectResponse) {
  const text = `${objectData.objectName ?? ""} ${objectData.title ?? ""}`.toLowerCase();
  const banned = [
    "temple",
    "tomb",
    "monastery",
    "church",
    "mosque",
    "site",
    "portrait of",
    "view of",
    "landscape",
    "event",
    "myth",
    "god ",
    "goddess "
  ];

  return Boolean(
    (objectData.primaryImage || objectData.primaryImageSmall) &&
      objectData.objectDate &&
      objectData.medium &&
      objectData.title &&
      !banned.some((term) => text.includes(term))
  );
}

function chooseMetImage(objectData: MetObjectResponse) {
  const image = objectData.primaryImage || objectData.primaryImageSmall || "";

  if (!image || image.length < 12) {
    return null;
  }

  return image;
}

function translateMetCulture(culture: string) {
  const normalized = culture.toLowerCase();

  if (normalized.includes("china") || normalized.includes("chinese")) return "中国";
  if (normalized.includes("japan") || normalized.includes("japanese")) return "日本";
  if (normalized.includes("egypt")) return "古埃及";
  if (normalized.includes("greek") || normalized.includes("greece")) return "古希腊";
  if (normalized.includes("roman")) return "古罗马";
  if (normalized.includes("europe")) return "欧洲";
  if (normalized.includes("america")) return "美洲";
  if (normalized.includes("india")) return "印度";
  if (normalized.includes("islamic")) return "伊斯兰文化区";

  return culture ? "见 MET 来源页" : "见 MET 来源页";
}

function buildPlainMetStory(met: MetCandidate) {
  const objectType = met.objectName || met.classification || "文物";
  const culture = translateMetCulture(met.culture);

  return `${objectType}通常和生活、仪式、装饰或纪念场景有关。这件文物来自${culture}相关文化背景，材料和制作方式说明当时的人会通过具体物品保存审美、习惯和社会关系；更详细的用途需要以来源页面说明为准。`;
}

function cleanMetTitleZh(titleZh: string | undefined, titleEn: string) {
  const invalidTitles = ["大都会馆藏文物", "大都会博物馆馆藏文物", "馆藏文物", "MET馆藏文物"];
  const trimmed = titleZh?.trim();

  if (!trimmed || invalidTitles.includes(trimmed)) {
    return titleEn;
  }

  return trimmed;
}

function isMostlyEnglish(text: string) {
  return /^[\x00-\x7F\s.,;:'"!?()/-]+$/.test(text);
}

function fallbackChineseObjectName(met: MetCandidate) {
  const typeText = `${met.objectName} ${met.classification}`.toLowerCase();

  if (typeText.includes("musical instrument")) return "乐器";
  if (typeText.includes("vase")) return "瓶";
  if (typeText.includes("bowl")) return "碗";
  if (typeText.includes("box")) return "盒";
  if (typeText.includes("mirror")) return "镜";
  if (typeText.includes("textile")) return "织物";
  if (typeText.includes("painting")) return "绘画";
  if (typeText.includes("sculpture")) return "雕塑";

  return "器物";
}

function analyzeUserInput(userText: string): UserAnalysis {
  const text = userText.trim() || defaultExample;
  const ranked = analysisRules
    .map((rule) => ({
      rule,
      score: countTextHits(text, rule.triggers)
    }))
    .sort((a, b) => b.score - a.score);

  const matched = ranked.filter((item) => item.score > 0).slice(0, 2);

  if (matched.length === 0) {
    return {
      emotion: "未命名的当下感",
      themes: ["此刻", "等待", "显影", "安放"],
      searchKeywords: ["artifact", "ritual", "vessel", "memory"],
      explanation: "这段输入没有落入固定模板，它更像一个尚未命名的当下，需要由文物慢慢显影。",
      source: "fallback"
    };
  }

  const primary = matched[0].rule;
  const extraThemes = matched.flatMap((item) => item.rule.themes);
  const extraKeywords = matched.flatMap((item) => item.rule.searchKeywords);

  return {
    emotion: primary.emotion,
    themes: unique(extraThemes),
    searchKeywords: unique(extraKeywords),
    explanation: primary.explanation,
    source: "fallback"
  };
}

function buildSearchKeywordsFromThemes(themes: string[]) {
  const dictionary: Record<string, string[]> = {
    方向: ["ritual", "compass", "oracle", "journey"],
    成长: ["child", "plant", "jade", "vessel"],
    等待: ["ceramic", "lamp", "bowl", "quiet"],
    改变: ["transformation", "fire", "ceramic", "vessel"],
    关系: ["mirror", "portrait", "people", "ceremony"],
    责任: ["bronze", "ritual", "vessel", "inscription"],
    梦想: ["landscape", "mountain", "dream", "journey"],
    失败: ["sword", "battle", "repair", "bronze"],
    重生: ["rebirth", "mask", "burial", "phoenix"],
    时间: ["scroll", "inscription", "clock", "memory"],
    死亡: ["burial", "afterlife", "mask", "tomb object"],
    远行: ["horse", "camel", "journey", "road"],
    秩序: ["ritual", "bronze", "vessel", "order"],
    自由: ["horse", "bird", "movement", "wind"],
    创造: ["ceramic", "painting", "porcelain", "craft"],
    胜利: ["sword", "laurel", "trophy", "battle"],
    庆祝: ["music", "vessel", "festival", "dance"],
    成就: ["crown", "medal", "ritual", "inscription"]
  };

  return unique(themes.flatMap((theme) => dictionary[theme] || [theme, "artifact"])).slice(0, 6);
}

const metKeywordRules: Array<{
  triggers: string[];
  keywords: string[];
}> = [
  {
    triggers: ["迷茫", "方向", "不确定", "寻找", "秩序", "中心"],
    keywords: ["direction", "journey", "map", "ritual", "oracle"]
  },
  {
    triggers: ["成长", "改变", "重塑", "开始", "学习", "探索", "成形"],
    keywords: ["transformation", "education", "craft", "learning"]
  },
  {
    triggers: ["喜悦", "开心", "庆祝", "胜利", "荣耀", "成就", "冠军"],
    keywords: ["celebration", "festival", "music", "victory"]
  },
  {
    triggers: ["责任", "承担", "权力", "领导", "秩序", "仪式"],
    keywords: ["power", "leadership", "ceremony"]
  },
  {
    triggers: ["爱情", "爱", "关系", "婚姻", "亲密", "美", "自我"],
    keywords: ["love", "marriage", "beauty", "mirror"]
  },
  {
    triggers: ["离别", "分别", "告别", "远行", "等待", "书信", "怀念", "记忆"],
    keywords: ["travel", "farewell", "letter", "memory"]
  }
];

const defaultMetKeywords = ["ritual", "vessel", "ceramic", "bronze", "memory", "journey"];

function pickRandomItems<T>(items: T[], minCount: number, maxCount: number) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const count = Math.min(
    shuffled.length,
    minCount + Math.floor(Math.random() * (maxCount - minCount + 1))
  );

  return shuffled.slice(0, count);
}

function buildMetSearchKeywordPool(analysis: UserAnalysis) {
  const text = [
    analysis.emotion,
    analysis.explanation,
    ...analysis.themes,
    ...analysis.searchKeywords
  ].join(" ");

  const mapped = metKeywordRules.flatMap((rule) => {
    return rule.triggers.some((trigger) => text.includes(trigger)) ? rule.keywords : [];
  });

  return unique([...mapped, ...analysis.searchKeywords, ...defaultMetKeywords])
    .filter((keyword) => /^[a-z][a-z\s-]*$/i.test(keyword))
    .slice(0, 24);
}

function pickMetSearchKeywords(analysis: UserAnalysis) {
  const pool = buildMetSearchKeywordPool(analysis);
  return pickRandomItems(pool.length ? pool : defaultMetKeywords, 1, 2);
}

async function analyzeWithDeepseek(userText: string): Promise<UserAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userText })
  });

  if (!response.ok) {
    throw new Error("Deepseek analyze unavailable");
  }

  const data = (await response.json()) as {
    emotion?: string;
    themes?: string[];
    explanation?: string;
  };
  const themes = data.themes?.filter(Boolean).slice(0, 6) || ["此刻", "等待", "显影"];

  return {
    emotion: data.emotion || "未命名的当下感",
    themes,
    searchKeywords: buildSearchKeywordsFromThemes(themes),
    explanation: data.explanation || "Deepseek API 完成了情绪与文明主题分析。",
    source: "deepseek"
  };
}

function scoreArtifact(userAnalysis: UserAnalysis, artifact: Artifact) {
  let score = 0;

  score += overlapScore(userAnalysis.themes, artifact.themeTags) * 5;
  score += overlapScore(userAnalysis.searchKeywords, artifact.searchKeywords) * 4;
  score += countTextHits(userAnalysis.emotion, artifact.emotionTags) * 4;
  score += overlapScore(userAnalysis.themes, artifact.themes) * 2;
  score += countTextHits(userAnalysis.explanation, artifact.keywords);

  return score;
}

function chooseLocalArtifact(userAnalysis: UserAnalysis, userText: string) {
  const ranked = artifacts
    .map((artifact) => ({ artifact, score: scoreArtifact(userAnalysis, artifact) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0].score <= 0) {
    const seed = Array.from(userText).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return {
      artifact: artifacts[seed % artifacts.length],
      score: 0
    };
  }

  const topScore = ranked[0].score;
  const tied = ranked.filter((item) => item.score === topScore);
  const seed = Array.from(userText).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return tied[seed % tied.length];
}

function buildResponse(artifact: Artifact, analysis: UserAnalysis) {
  return artifact.responseTemplate.replace("{emotion}", analysis.emotion);
}

async function generateArtifactResponse(
  userText: string,
  analysis: UserAnalysis,
  artifact: Artifact
): Promise<{ response: string; responseSource: "deepseek" | "fallback" }> {
  const fallback = buildResponse(artifact, analysis);

  try {
    const response = await fetch("/api/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userText,
        emotion: analysis.emotion,
        themes: analysis.themes,
        artifact: {
          name: artifact.name,
          story: artifact.story,
          reason: artifact.reason,
          responseTemplate: artifact.responseTemplate
        }
      })
    });

    const data = (await response.json()) as { response?: string };

    if (!response.ok || !data.response) {
      throw new Error("Deepseek respond unavailable");
    }

    return {
      response: data.response,
      responseSource: "deepseek"
    };
  } catch {
    return {
      response: fallback,
      responseSource: "fallback"
    };
  }
}

async function fetchMetCandidate(analysis: UserAnalysis): Promise<MetCandidateResult | null> {
  try {
    const objectIDs: number[] = [];
    const keywords = pickMetSearchKeywords(analysis);

    for (const keyword of keywords) {
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(
        keyword
      )}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        continue;
      }

      const searchData = (await searchResponse.json()) as MetSearchResponse;
      const searchLimit = 20 + Math.floor(Math.random() * 31);
      for (const objectID of searchData.objectIDs?.slice(0, searchLimit) ?? []) {
        if (!objectIDs.includes(objectID)) {
          objectIDs.push(objectID);
        }
      }
    }

    const candidates: MetCandidate[] = [];
    const sampledObjectIDs = pickRandomItems(objectIDs, 1, Math.min(18, objectIDs.length));

    for (const objectID of sampledObjectIDs) {
      const objectResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
      );

      if (!objectResponse.ok) {
        continue;
      }

      const objectData = (await objectResponse.json()) as MetObjectResponse;

      if (!isArtifactOnlyObject(objectData)) {
        continue;
      }

      const image = chooseMetImage(objectData);
      if (!image) {
        continue;
      }

      const searchable = [
        objectData.title,
        objectData.objectDate,
        objectData.culture,
        objectData.medium
      ]
        .filter(Boolean)
        .join(" ");

      candidates.push({
        title: objectData.title || "Untitled object",
        objectName: objectData.objectName || "",
        objectDate: objectData.objectDate || "",
        culture: objectData.culture || "Culture not listed",
        medium: objectData.medium || "",
        classification: objectData.classification || "",
        department: objectData.department || "",
        primaryImage: objectData.primaryImage || "",
        primaryImageSmall: objectData.primaryImageSmall || image,
        objectURL: objectData.objectURL || "",
        relevanceScore:
          countTextHits(searchable, analysis.searchKeywords) + countTextHits(searchable, analysis.themes)
      });
    }

    if (candidates.length === 0) {
      return null;
    }

    const relevant = candidates
      .filter((candidate) => candidate.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (relevant.length > 0) {
      const topRelevant = relevant.slice(0, 5);
      return {
        selected: topRelevant[Math.floor(Math.random() * topRelevant.length)],
        candidates
      };
    }

    const firstFive = candidates.slice(0, 5);
    return {
      selected: firstFive[Math.floor(Math.random() * firstFive.length)],
      candidates
    };
  } catch {
    return null;
  }
}

async function translateMetCandidate(
  met: MetCandidate,
  analysis: UserAnalysis,
  userText: string
): Promise<MetTranslation | null> {
  try {
    const response = await fetch("/api/met-translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: met.title,
        culture: met.culture,
        objectDate: met.objectDate,
        medium: met.medium,
        classification: met.classification,
        department: met.department,
        objectName: met.objectName,
        userText,
        emotion: analysis.emotion,
        themes: analysis.themes
      })
    });

    const data = (await response.json()) as MetTranslation;
    if (!response.ok || !data.titleZh) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function buildMetArtifact(met: MetCandidate, analysis: UserAnalysis): Artifact {
  const themes = analysis.themes.length ? analysis.themes : ["此刻", "记忆"];
  const sourceUrl = met.objectURL || "https://www.metmuseum.org/art/collection";
  const translated = met.translation;
  const story = translated?.storyZh || buildPlainMetStory(met);
  const reason = `系统根据你的情绪和主题词「${themes.join("、")}」搜索 MET 开放馆藏，并从有图片、年代和材料信息的文物中选出这件。`;
  const titleEn = translated?.titleEn || met.title;
  const cleanedTitleZh = cleanMetTitleZh(translated?.titleZh, titleEn);
  const titleZh = isMostlyEnglish(cleanedTitleZh) ? fallbackChineseObjectName(met) : cleanedTitleZh;

  return {
    id: `met-${met.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: titleZh,
    period: translated?.dateZh || met.objectDate,
    material: translated?.mediumZh || met.medium,
    cultureRegion: translated?.cultureZh || translateMetCulture(met.culture),
    currentLocation: "大都会艺术博物馆",
    image: met.primaryImage || met.primaryImageSmall,
    sourceUrl,
    dataSource: "Met API",
    themes,
    emotionTags: [analysis.emotion],
    searchKeywords: analysis.searchKeywords,
    story,
    firstPersonView: `从我的年代向外望去，${themes.join("、")}像一束被重新点亮的展厅光线。`,
    responseTemplate:
      translated?.responseTemplateZh ||
      `我是一件由${translated?.mediumZh || met.medium}制成的文物，记录年代是${translated?.dateZh || met.objectDate}。过去，我可能服务于生活、仪式或纪念场景。你现在的{emotion}并不罕见，人们一直会把重要的感受放进器物、图像和材料里。`,
    reason,
    dynasty: met.objectDate,
    origin: "大都会艺术博物馆",
    imageCredit: "图片来源：MET 开放馆藏",
    keywords: [...themes, analysis.emotion, ...analysis.searchKeywords],
    themeTags: themes,
    prompt:
      "A quiet museum exhibition view, artifact memory, poetic curatorial atmosphere",
    historyStory: story,
    matchReason: reason,
    westernCandidate: titleEn,
    westernCandidateReason: "由大都会开放馆藏接口根据当前情绪主题关键词返回的文物。",
    finalChoiceReason: reason,
    response: ""
  };
}

function normalizeMetCultureKey(culture: string) {
  const trimmed = culture.trim();
  if (!trimmed || trimmed.toLowerCase() === "culture not listed") {
    return "未知文化";
  }

  return trimmed.toLowerCase();
}

function getMetCandidateCulture(candidate: MetCandidate) {
  if (!candidate.culture.trim() || candidate.culture.toLowerCase() === "culture not listed") {
    return "未知文化";
  }

  const translatedCulture = candidate.translation?.cultureZh;
  if (translatedCulture && translatedCulture !== "见 MET 来源页" && translatedCulture !== "见来源页面") {
    return translatedCulture;
  }

  return translateMetCulture(candidate.culture);
}

function isSameMetObject(a: MetCandidate, b: MetCandidate) {
  return Boolean(a.objectURL && b.objectURL && a.objectURL === b.objectURL) ||
    (a.title === b.title && a.objectDate === b.objectDate);
}

function pickCivilizationMetCandidates(
  candidates: MetCandidate[],
  selected: MetCandidate | null
) {
  const seenCultures = new Set<string>();
  const picked: MetCandidate[] = [];

  candidates
    .filter((candidate) => !selected || !isSameMetObject(candidate, selected))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .forEach((candidate) => {
      const cultureKey = normalizeMetCultureKey(candidate.culture);
      if (seenCultures.has(cultureKey) || picked.length >= 4) {
        return;
      }

      seenCultures.add(cultureKey);
      picked.push(candidate);
    });

  return picked;
}

function buildCivilizationReason(candidate: MetCandidate, analysis: UserAnalysis) {
  const culture = getMetCandidateCulture(candidate);
  const themes = analysis.themes.slice(0, 3).join("、");

  return `${culture}的这件文物也靠近这种感受。它让「${themes}」换了一种材料和年代出现。`;
}

function buildMetCivilizationCards(result: MatchResult): CivilizationCandidate[] {
  return pickCivilizationMetCandidates(result.metCandidates, result.metCandidate).map((candidate) => {
    const titleEn = candidate.translation?.titleEn || candidate.title;
    const titleZh = cleanMetTitleZh(candidate.translation?.titleZh, titleEn);
    const culture = getMetCandidateCulture(candidate);

    return {
      label: culture,
      name: isMostlyEnglish(titleZh) ? fallbackChineseObjectName(candidate) : titleZh,
      englishName: titleEn,
      cultureRegion: culture,
      period: candidate.translation?.dateZh || candidate.objectDate,
      material: candidate.translation?.mediumZh || candidate.medium,
      reason: buildCivilizationReason(candidate, result.analysis),
      sourceUrl: candidate.objectURL
    };
  });
}

function buildCuratorialReason(result: MatchResult) {
  const text = result.userInput;
  const themes = result.analysis.themes.join("、");
  const emotion = result.analysis.emotion;

  if (countTextHits(text, ["下课", "结束", "快点", "赶紧", "等不及"]) > 0) {
    return "你似乎正在等待某个时刻快点到来。这种对变化的期待，也是一种很具体的当下感受。";
  }

  if (countTextHits(text, ["爱上", "喜欢", "恋爱", "心动", "想靠近"]) > 0) {
    return "你的注意力正在被另一个人吸引。很多情感的开始，都带着好奇与靠近的冲动。";
  }

  if (countTextHits(text, ["无聊", "没意思", "空白", "乏味"]) > 0) {
    return "你似乎正在寻找新的刺激和变化。无聊有时不是空白，而是某种尚未被满足的期待。";
  }

  if (countTextHits(text, ["国家", "远方", "出国", "生活", "离开", "搬去"]) > 0) {
    return "你的想法里有对远方的向往。离开熟悉环境的念头，往往意味着对另一种生活的想象。";
  }

  if (countTextHits(`${emotion} ${themes}`, ["迷茫", "不确定", "方向", "寻找"]) > 0) {
    return "你似乎正在寻找一个能暂时停靠的位置。在方向变清楚之前，人常常需要先确认自己站在哪里。";
  }

  if (countTextHits(`${emotion} ${themes}`, ["喜悦", "胜利", "庆祝", "成就"]) > 0) {
    return "你的想法里有一种完成后的明亮感。欢庆不只是热闹，也是在承认自己确实走过了一段路。";
  }

  if (countTextHits(`${emotion} ${themes}`, ["疲惫", "修复", "静观", "累"]) > 0) {
    return "你似乎需要一个慢下来的间隙。疲惫并不只是停滞，它也提醒人重新照看自己的节奏。";
  }

  if (countTextHits(`${emotion} ${themes}`, ["离别", "等待", "关系", "怀念"]) > 0) {
    return "你的想法里有一段还没有完全放下的关系。离别之后，人常常会用等待保存重要的部分。";
  }

  return `你的想法里有一种${emotion}。它靠近「${themes}」，像是一种正在成形、还需要被轻轻安放的当下感受。`;
}

function scoreCivilizationArtifact(analysis: UserAnalysis, candidate: CrossCivilizationArtifact) {
  let score = 0;

  score += overlapScore(analysis.themes, candidate.themes) * 5;
  score += overlapScore(analysis.searchKeywords, candidate.searchKeywords) * 4;
  score += countTextHits(analysis.emotion, candidate.emotionTags) * 4;
  score += countTextHits(analysis.explanation, candidate.themes) * 2;
  score += countTextHits(analysis.explanation, candidate.searchKeywords);

  return score;
}

function buildMetCivilizationCandidate(result: MatchResult): CrossCivilizationArtifact | null {
  const met = result.metCandidate;

  if (!met) {
    return null;
  }

  const culture = met.culture.toLowerCase();
  const label = culture.includes("greek")
    ? "古希腊文明"
    : culture.includes("egypt")
      ? "古埃及文明"
      : culture.includes("japan")
        ? "日本文明"
        : null;

  if (!label) {
    return null;
  }

  return {
    label,
    name: met.title,
    cultureRegion: met.culture,
    currentLocation: "大都会艺术博物馆",
    period: met.objectDate,
    material: met.medium,
    themes: result.analysis.themes,
    emotionTags: [result.analysis.emotion],
    searchKeywords: result.analysis.searchKeywords,
    reason: `大都会开放馆藏接口根据「${result.analysis.themes.join("、")}」找到的候选。`,
    sourceUrl: met.objectURL
  };
}

function buildDynamicCivilizationCandidates(result: MatchResult): CivilizationCandidate[] {
  return buildMetCivilizationCards(result);
}

async function buildMatch(input: string): Promise<MatchResult> {
  const userInput = input.trim() || defaultExample;
  let analysis: UserAnalysis;

  try {
    analysis = await analyzeWithDeepseek(userInput);
  } catch {
    analysis = analyzeUserInput(userInput);
  }

  const metResult = await fetchMetCandidate(analysis);
  const metCandidate = metResult?.selected ?? null;
  const metCandidates = metResult?.candidates ?? [];
  if (metCandidate) {
    metCandidate.translation = await translateMetCandidate(metCandidate, analysis, userInput) || undefined;
  }
  const civilizationMetCandidates = pickCivilizationMetCandidates(metCandidates, metCandidate);
  await Promise.all(
    civilizationMetCandidates.map(async (candidate) => {
      candidate.translation =
        candidate.translation || (await translateMetCandidate(candidate, analysis, userInput)) || undefined;
    })
  );
  const localMatch = chooseLocalArtifact(analysis, userInput);
  const artifact = metCandidate ? buildMetArtifact(metCandidate, analysis) : localMatch.artifact;
  const score = metCandidate ? metCandidate.relevanceScore : localMatch.score;
  const { response, responseSource } = await generateArtifactResponse(userInput, analysis, artifact);

  return {
    userInput,
    analysis,
    artifact,
    score,
    response,
    responseSource,
    metCandidate,
    metCandidates
  };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [touched, setTouched] = useState(false);
  const [activeTab, setActiveTab] = useState<CurationTab>("why");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [poemState, setPoemState] = useState<PoemState | null>(null);

  const examples = useMemo(
    () => ["我很迷茫", "我做了一个可能是错的决定", "我最近很累", "我想开始改变"],
    []
  );

  async function runMatch(value: string) {
    setIsMatching(true);
    setActiveTab("why");
    setIsOverlayOpen(false);
    setPoemState(null);
    setResult(await buildMatch(value));
    setIsMatching(false);
  }

  async function fetchPoem(currentResult: MatchResult) {
    if (
      poemState?.userText === currentResult.userInput &&
      (poemState.poem || poemState.isLoading)
    ) {
      return;
    }

    setPoemState({
      userText: currentResult.userInput,
      poem: null,
      isLoading: true,
      error: null
    });

    try {
      const response = await fetch("/api/poem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userText: currentResult.userInput,
          emotion: currentResult.analysis.emotion,
          themes: currentResult.analysis.themes,
          randomSeed: `${Date.now()}-${Math.random()}`
        })
      });

      const data = await response.json();

      const poem = data.poem || data;

      if (!response.ok || !poem?.chinesePoem || !poem?.englishPoem) {
        throw new Error(data.error || "诗歌获取失败");
      }

      setPoemState({
        userText: currentResult.userInput,
        poem,
        isLoading: false,
        error: data.fallback ? "Deepseek 暂未返回合适诗歌，已使用本地诗歌 fallback。" : null
      });
    } catch (error) {
      setPoemState({
        userText: currentResult.userInput,
        poem: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "诗歌获取失败，请稍后再试。"
      });
    }
  }

  function openCuration(tab: CurationTab) {
    setActiveTab(tab);
    setIsOverlayOpen(true);
    if (tab === "writing" && result) {
      void fetchPoem(result);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    await runMatch(input);
  }

  async function applyExample(example: string) {
    setInput(example);
    setTouched(true);
    await runMatch(example);
  }

  const selected = result?.artifact ?? null;
  const civilizationCandidates = result ? buildDynamicCivilizationCandidates(result) : [];

  return (
    <main className={`page-shell${selected ? " result-mode" : ""}`}>
      <section className="intro">
        <div className="museum-mark">此刻有物</div>
        <p className="kicker">给此刻的一件文物</p>
        <h1>把此刻交给一件文物。</h1>
        <p className="lead">
          输入你现在的状态，系统会先识别情绪，再提取文明主题，最后从开放馆藏与本地文物库中匹配一件文物，让它以第一人称回应你。
        </p>

        <form className="search-panel" onSubmit={handleSubmit}>
          <label htmlFor="state-input">此刻的你</label>
          <div className="input-row">
            <input
              id="state-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="例如：我很迷茫"
              autoComplete="off"
            />
            <button type="submit" disabled={isMatching}>
              {isMatching ? "正在寻物" : "寻找文物"}
            </button>
          </div>
          {touched && !input.trim() ? <p className="hint">已使用默认示例进行匹配。</p> : null}
        </form>

        <div className="examples" aria-label="示例输入">
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => applyExample(example)}>
              {example}
            </button>
          ))}
        </div>
      </section>

      <section className="exhibition" aria-live="polite">
        {selected && result ? (
          <article className="artifact-card">
            <div className="image-frame">
              <img src={selected.image} alt={selected.name} />
            </div>
            <div className="artifact-copy">
              <p className="label">匹配文物</p>
              <h2>{selected.name}</h2>
              {selected.dataSource === "Met API" ? (
                <p className="artifact-original-title">{selected.westernCandidate}</p>
              ) : null}
              <dl>
                <div>
                  <dt>文化</dt>
                  <dd>{selected.cultureRegion}</dd>
                </div>
                <div>
                  <dt>年代</dt>
                  <dd>{selected.period}</dd>
                </div>
                <div>
                  <dt>材料</dt>
                  <dd>{selected.material}</dd>
                </div>
                <div>
                  <dt>来源链接</dt>
                  <dd>
                    <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                      {selected.dataSource === "Wikipedia" ? "查看维基百科" : "查看来源页面"}
                    </a>
                  </dd>
                </div>
              </dl>

              <section className="prompt-block">
                <h3>历史故事</h3>
                <p>{selected.story}</p>
              </section>

              <blockquote>{result.response}</blockquote>

              <div className="curation-actions" aria-label="策展说明">
                  <button
                    type="button"
                    aria-expanded={isOverlayOpen && activeTab === "why"}
                    onClick={() => openCuration("why")}
                  >
                    为什么是它？
                  </button>
                  <button
                    type="button"
                    aria-expanded={isOverlayOpen && activeTab === "civilization"}
                    onClick={() => openCuration("civilization")}
                  >
                    如果来自其他文明
                  </button>
                  <button
                    type="button"
                    aria-expanded={isOverlayOpen && activeTab === "writing"}
                    onClick={() => openCuration("writing")}
                  >
                    有人这样写过
                  </button>
              </div>
            </div>

            {isOverlayOpen ? (
              <aside className="curation-overlay" aria-label="展览说明卡">
                <div className="overlay-card">
                  <button
                    className="overlay-close"
                    type="button"
                    aria-label="关闭说明"
                    onClick={() => setIsOverlayOpen(false)}
                  >
                    关闭
                  </button>

                  {activeTab === "why" ? (
                    <section className="tab-panel">
                      <p className="overlay-kicker">01</p>
                      <h3>为什么是它？</h3>
                      <div className="curation-fields">
                        <section className="curation-field">
                          <h4>你的想法</h4>
                        <p>{result.userInput}</p>
                      </section>
                      <section className="curation-field">
                        <h4>情绪识别</h4>
                        <p>{result.analysis.emotion}</p>
                      </section>
                        <section className="curation-field">
                          <h4>文明主题</h4>
                          <p>{result.analysis.themes.join("、")}</p>
                        </section>
                      <section className="curation-field">
                        <h4>匹配原因</h4>
                        <p>{buildCuratorialReason(result)}</p>
                      </section>
                      </div>
                    </section>
                  ) : null}

                  {activeTab === "civilization" ? (
                    <section className="tab-panel">
                      <p className="overlay-kicker">02</p>
                      <h3>如果来自其他文明</h3>
                      <div className="civilization-cards">
                        {civilizationCandidates.length > 0 ? civilizationCandidates.map((candidate) => (
                          <section key={candidate.label}>
                          <p>{candidate.label}</p>
                          <h4>{candidate.name}</h4>
                          {candidate.englishName ? (
                            <span className="artifact-original-title">{candidate.englishName}</span>
                          ) : null}
                          <dl>
                            <div>
                              <dt>所属文化</dt>
                              <dd>{candidate.cultureRegion}</dd>
                            </div>
                            <div>
                              <dt>年代</dt>
                              <dd>{candidate.period}</dd>
                            </div>
                            <div>
                              <dt>材料</dt>
                              <dd>{candidate.material}</dd>
                            </div>
                          </dl>
                          <small>{candidate.reason}</small>
                          {candidate.sourceUrl ? (
                            <a href={candidate.sourceUrl} target="_blank" rel="noreferrer">
                              查看来源页面
                            </a>
                          ) : null}
                        </section>
                      )) : (
                        <section>
                          <p>暂无候选</p>
                          <h4>同一批结果里暂时没有其他文化的合适文物</h4>
                          <small>这次开放馆藏返回的可用文物较少，主文物已经是其中最适合展示的一件。</small>
                        </section>
                      )}
                    </div>
                    </section>
                  ) : null}

                  {activeTab === "writing" ? (
                    <section className="tab-panel">
                      <p className="overlay-kicker">03</p>
                      <h3>有人这样写过</h3>
                      <p className="poem-guide">
                        也许在很久以前，有人用另一种语言写下过与你此刻相近的心情。
                      </p>
                    {poemState?.isLoading ? (
                      <div className="poem-loading">正在寻找一首相似的诗……</div>
                    ) : null}
                    {poemState?.error ? <p className="poem-error">{poemState.error}</p> : null}
                    {poemState?.poem ? (
                      <article className="poem-card">
                        <section className="poem-section">
                          <h4 className="poemChineseTitle">
                            {poemState.poem.chinesePoem.title.replace(/[《》]/g, "")}
                          </h4>
                          <p className="poem-author">{poemState.poem.chinesePoem.author}</p>
                          <p className="poemChineseBody poemChinesePoemBody">
                            {poemState.poem.chinesePoem.content}
                          </p>
                          <p className="poemReason">{poemState.poem.chinesePoem.reason}</p>
                        </section>

                        <section className="poem-section">
                          <h4 className="poemEnglishTitle">
                            {poemState.poem.englishPoem.title}
                            <span>（{poemState.poem.englishPoem.titleCn}）</span>
                          </h4>
                          <p className="poem-author">
                            <span className="poemEnglishAuthor">
                              {poemState.poem.englishPoem.author}
                            </span>
                            <span className="poemAuthorDivider">/</span>
                            <span>{poemState.poem.englishPoem.authorCn}</span>
                          </p>
                          <div className="poem-body">
                            <p className="poemEnglishBody">{poemState.poem.englishPoem.content}</p>
                            <p className="poemChineseBody">{poemState.poem.englishPoem.translation}</p>
                          </div>
                          <p className="poemReason">{poemState.poem.englishPoem.reason}</p>
                        </section>
                      </article>
                    ) : null}
                    </section>
                  ) : null}
                </div>
              </aside>
            ) : null}
          </article>
        ) : (
          <div className="empty-state">
            <div className="plinth" />
            <p>展柜还空着。写下此刻，一件文物会慢慢亮起来。</p>
          </div>
        )}
      </section>
    </main>
  );
}
