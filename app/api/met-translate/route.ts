import { NextRequest, NextResponse } from "next/server";

type MetTranslateBody = {
  title?: string;
  culture?: string;
  objectDate?: string;
  medium?: string;
  classification?: string;
  department?: string;
  objectName?: string;
  userText?: string;
  emotion?: string;
  themes?: string[];
};

type MetTranslation = {
  titleZh: string;
  titleEn: string;
  cultureZh: string;
  dateZh: string;
  mediumZh: string;
  storyZh: string;
  responseTemplateZh: string;
};

type DeepseekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function fallbackTranslate(body: MetTranslateBody): MetTranslation {
  const titleEn = body.title || body.objectName || "Untitled Object";
  const objectType = body.objectName || body.classification || "器物";
  const titleZh = titleEn.toLowerCase() === "gekkin" ? "月琴" : titleEn;

  return {
    titleZh,
    titleEn,
    cultureZh: localizeCulture(body.culture || ""),
    dateZh: localizeDate(body.objectDate || ""),
    mediumZh: localizeMedium(body.medium || ""),
    storyZh: `这是一件与${objectType}相关的文物。它的年代、材料和文化背景以 MET 来源页面为准。它可能用于日常生活、仪式、装饰或收藏场景，具体用途需要结合馆藏说明判断。`,
    responseTemplateZh: `我是一件${objectType}。我的材料和年代能说明当时的人怎样制作、使用和保存物品。你现在的{emotion}，也可以先从具体的事情和手边的物品里慢慢整理。`
  };
}

function localizeCulture(value: string) {
  const text = value.toLowerCase();
  if (text.includes("japan")) return "日本";
  if (text.includes("china")) return "中国";
  if (text.includes("egypt")) return "古埃及";
  if (text.includes("greek")) return "古希腊";
  if (text.includes("roman")) return "古罗马";
  return value || "见来源页面";
}

function localizeDate(value: string) {
  return value
    .replace(/(\d+)(st|nd|rd|th) century/gi, "$1世纪")
    .replace(/early/gi, "早期")
    .replace(/late/gi, "晚期")
    .replace(/mid-/gi, "中期");
}

function localizeMedium(value: string) {
  const dictionary: Record<string, string> = {
    ivory: "象牙",
    skin: "皮革",
    silk: "丝",
    "silk strings": "丝弦",
    wood: "木",
    metal: "金属",
    bronze: "青铜",
    ceramic: "陶瓷",
    porcelain: "瓷",
    paper: "纸",
    cotton: "棉",
    glass: "玻璃",
    gold: "金",
    silver: "银"
  };

  return value
    ? value
        .split(/,\s*/)
        .map((item) => dictionary[item.toLowerCase()] || item)
        .join("、")
    : "见来源页面";
}

function parseJson(text: string): MetTranslation | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]) as MetTranslation;
    if (
      !parsed.titleZh ||
      !parsed.titleEn ||
      !parsed.cultureZh ||
      !parsed.dateZh ||
      !parsed.mediumZh ||
      !parsed.storyZh ||
      !parsed.responseTemplateZh
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as MetTranslateBody;
  const fallback = fallbackTranslate(body);
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ...fallback, fallback: true });
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_TEXT_MODEL || "deepseek-chat",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "你是博物馆文物信息翻译与改写助手。只根据给定 MET 字段工作，不编造具体历史事件、所有者、地点或用途。输出严格 JSON，不要 Markdown。"
          },
          {
            role: "user",
            content: `请把以下 MET 文物字段翻译并改写为中文展签信息。

MET 字段：
- title: ${body.title || ""}
- culture: ${body.culture || ""}
- objectDate: ${body.objectDate || ""}
- medium: ${body.medium || ""}
- classification: ${body.classification || ""}
- department: ${body.department || ""}
- objectName: ${body.objectName || ""}

用户输入：${body.userText || ""}
当前情绪：${body.emotion || ""}
主题：${body.themes?.join("、") || ""}

要求：
1. titleZh 必须是具体中文文物名，不要翻译成“大都会博物馆馆藏文物”或“馆藏文物”。
2. 如果 title 是 Gekkin，titleZh 应为“月琴”。
3. 如果无法准确翻译，保留音译 + 器物类型，例如“某某琴”“某某盒”“某某瓶”。
4. titleEn 保留英文原名。
5. cultureZh、dateZh、mediumZh 必须中文化，例如“19th century”写成“19世纪”，“ivory, skin, silk strings”写成“象牙、皮革、丝弦”。
6. storyZh 用简明中文介绍：这类器物大概是什么、当时可能用于什么场景、所处历史/文化环境。不要写“这是 MET 记录中的……”，不要重复数据库字段，不要文艺化。
7. responseTemplateZh 用第一人称，必须包含 {emotion} 占位符。结合文物用途、用户输入和当前情绪，具体、接地气，不要写空泛意象。
8. 禁止使用“命运、光影、时间长河、未来形状”等套话。

返回 JSON：
{
  "titleZh": "",
  "titleEn": "",
  "cultureZh": "",
  "dateZh": "",
  "mediumZh": "",
  "storyZh": "",
  "responseTemplateZh": ""
}`
          }
        ]
      })
    });

    const data = (await response.json()) as DeepseekResponse;
    if (!response.ok) {
      return NextResponse.json({
        ...fallback,
        error: data.error?.message || "Deepseek MET translation failed",
        fallback: true
      });
    }

    const parsed = parseJson(data.choices?.[0]?.message?.content || "");
    if (!parsed) {
      return NextResponse.json({
        ...fallback,
        error: "Deepseek returned invalid MET translation JSON",
        fallback: true
      });
    }

    return NextResponse.json({ ...parsed, fallback: false });
  } catch (error) {
    return NextResponse.json({
      ...fallback,
      error: error instanceof Error ? error.message : "Deepseek MET translation failed",
      fallback: true
    });
  }
}
