import { NextResponse } from "next/server";

export const MODERATION_BLOCK_MESSAGE = "检测到不适合本作品处理的内容，请换一种表达。";

export type ModerationCategory =
  | "none"
  | "sexual_minors"
  | "explicit_sexual"
  | "sexual_violence"
  | "extreme_violence"
  | "hate"
  | "illegal_request";

export type ModerationResult = {
  safe: boolean;
  category: ModerationCategory;
  message: string;
};

type DeepseekModerationResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const SAFE_RESULT: ModerationResult = {
  safe: true,
  category: "none",
  message: ""
};

const BLOCK_RESULT = (category: ModerationCategory): ModerationResult => ({
  safe: false,
  category,
  message: MODERATION_BLOCK_MESSAGE
});

function parseModerationJson(text: string): ModerationResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[0]) as Partial<ModerationResult>;
    const category = parsed.category || "none";

    if (
      ![
        "none",
        "sexual_minors",
        "explicit_sexual",
        "sexual_violence",
        "extreme_violence",
        "hate",
        "illegal_request"
      ].includes(category)
    ) {
      return null;
    }

    return {
      safe: Boolean(parsed.safe),
      category: category as ModerationCategory,
      message: parsed.safe ? "" : parsed.message || MODERATION_BLOCK_MESSAGE
    };
  } catch {
    return null;
  }
}

function localKeywordModeration(userText: string): ModerationResult {
  const text = userText.toLowerCase();

  const minorTerms = /(未成年|儿童|幼童|幼女|男童|女童|小学生|初中生|萝莉|正太)/;
  const sexualTerms = /(性行为|性交|裸照|色情|做爱|强奸|性侵|猥亵|淫秽)/;
  if (minorTerms.test(text) && sexualTerms.test(text)) {
    return BLOCK_RESULT("sexual_minors");
  }

  if (/(强奸|性侵|轮奸|迷奸|性暴力|猥亵)/.test(text)) {
    return BLOCK_RESULT("sexual_violence");
  }

  if (/(露骨色情|成人视频|黄色视频|淫秽内容|色情小说|色情图片)/.test(text)) {
    return BLOCK_RESULT("explicit_sexual");
  }

  if (/(杀光|屠杀|灭门|灭族|炸学校|炸地铁|炸商场|大规模枪击)/.test(text)) {
    return BLOCK_RESULT("extreme_violence");
  }

  if (/(种族灭绝|杀光.*(民族|种族|族群)|.*(民族|种族|族群).*都该死)/.test(text)) {
    return BLOCK_RESULT("hate");
  }

  if (/(教我|帮我|如何|怎么).*(制毒|贩毒|洗钱|盗号|诈骗|做炸弹|造炸弹|制作炸药|伪造证件)/.test(text)) {
    return BLOCK_RESULT("illegal_request");
  }

  return SAFE_RESULT;
}

export async function moderateUserText(userText: string): Promise<ModerationResult> {
  const trimmed = userText.trim();
  if (!trimmed) {
    return SAFE_RESULT;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return localKeywordModeration(trimmed);
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
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "你是《此刻有物》的轻量内容审核器。只判断用户输入是否适合进入一个文物策展作品。必须拦截：儿童性内容、恋童、未成年人性相关、露骨色情、性暴力、明确的极端暴力威胁、仇恨攻击、违法犯罪请求。不要拦截普通负面情绪，例如：我很难过、我想退学、我讨厌现在的生活、我很愤怒、我很孤独、我觉得人生没意义。只返回严格 JSON，不要 Markdown，不要解释。"
          },
          {
            role: "user",
            content: `请审核这段用户输入：
${trimmed}

如果安全，返回：
{
  "safe": true,
  "category": "none",
  "message": ""
}

如果不安全，只能从以下 category 中选择一个：
sexual_minors
explicit_sexual
sexual_violence
extreme_violence
hate
illegal_request

并返回：
{
  "safe": false,
  "category": "上述类别之一",
  "message": "检测到不适合本作品处理的内容，请换一种表达。"
}`
          }
        ]
      })
    });

    if (!response.ok) {
      return localKeywordModeration(trimmed);
    }

    const data = (await response.json()) as DeepseekModerationResponse;
    const result = parseModerationJson(data.choices?.[0]?.message?.content || "");

    return result || localKeywordModeration(trimmed);
  } catch {
    return localKeywordModeration(trimmed);
  }
}

export function moderationErrorResponse(result: ModerationResult) {
  return NextResponse.json(
    {
      error: result.message || MODERATION_BLOCK_MESSAGE,
      category: result.category
    },
    { status: 400 }
  );
}
