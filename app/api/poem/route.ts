import { NextRequest, NextResponse } from "next/server";
import { moderateUserText, moderationErrorResponse } from "../_utils/moderation";

type PoemBody = {
  userText?: string;
  emotion?: string;
  themes?: string[];
  randomSeed?: string | number;
};

type DualPoemResponse = {
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

function buildFallbackPoem(body: PoemBody): DualPoemResponse {
  const emotion = body.emotion || "此刻的情绪";
  const themes = body.themes?.join("、") || "等待、此刻";
  const responseText = `诗歌暂时没有抵达。你的${emotion}仍被留在这里，和「${themes}」一起，等下一次重新寻找。`;

  return {
    chinesePoem: {
      title: "本地策展回应",
      author: "此刻有物",
      content: responseText,
      reason: "当诗暂时缺席，展签先为此刻留下一行字。"
    },
    englishPoem: {
      title: "Local Curatorial Note",
      titleCn: "本地策展回应",
      author: "Ci Ke You Wu",
      authorCn: "此刻有物",
      content:
        "When the poem cannot arrive, the note keeps a quiet place for this feeling.",
      translation: responseText,
      reason: "在远方的诗抵达之前，此刻仍被轻轻放下。"
    }
  };
}

function normalizePoem(parsed: DualPoemResponse): DualPoemResponse | null {
  if (
    !parsed.chinesePoem?.title ||
    !parsed.chinesePoem?.author ||
    !parsed.chinesePoem?.content ||
    !parsed.chinesePoem?.reason ||
    !parsed.englishPoem?.title ||
    !parsed.englishPoem?.titleCn ||
    !parsed.englishPoem?.author ||
    !parsed.englishPoem?.authorCn ||
    !parsed.englishPoem?.content ||
    !parsed.englishPoem?.translation ||
    !parsed.englishPoem?.reason
  ) {
    return null;
  }

  return parsed;
}

function parseJson(text: string): DualPoemResponse | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return normalizePoem(JSON.parse(match[0]) as DualPoemResponse);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as PoemBody;
  const moderation = await moderateUserText(body.userText || "");

  if (!moderation.safe) {
    return moderationErrorResponse(moderation);
  }

  const fallbackPoem = buildFallbackPoem(body);
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const randomSeed = body.randomSeed ?? `${Date.now()}-${Math.random()}`;

  if (!apiKey) {
    return NextResponse.json({
      ...fallbackPoem,
      error: "DEEPSEEK_API_KEY is missing",
      fallback: true
    });
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
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "你是《此刻有物》的诗歌策展助手。请从真实存在的经典诗歌中检索或推荐，不要创作新诗，不要伪造作者。必须同时返回一首中文经典诗和一首英文经典诗，英文诗必须附中文译文。只返回严格 JSON，不要 Markdown，不要解释。"
          },
          {
            role: "user",
            content: `用户输入：${body.userText || ""}
情绪识别：${body.emotion || "未命名的当下感"}
文明主题：${body.themes?.join("、") || "此刻、等待"}
本次选择随机种子：${randomSeed}。请避免与常见默认答案重复。

请检索并选择两首真实存在的经典诗：
1. 一首中文经典诗。
2. 一首英文经典诗，并提供中文译文。

多样性约束：
- 不要总是选择英语课本中最常见的默认答案。
- 禁止选择 The Road Not Taken，除非用户输入明确围绕“道路、岔路、选择、人生路径”。
- 禁止选择 Stopping by Woods on a Snowy Evening，除非用户输入明确围绕“雪夜、停留、树林、冬天”。
- 禁止选择 Do Not Go Gentle into That Good Night，除非用户输入明确围绕“死亡抗争、临终、父亲、衰老反抗”。

英文诗候选方向：
- joy / victory / celebration：可优先考虑 Wordsworth、Shelley、Keats、Walt Whitman、Emily Dickinson。
- loneliness / grief / farewell：可优先考虑 Emily Dickinson、Christina Rossetti、W. B. Yeats、Thomas Hardy。
- change / growth / future：可优先考虑 Rilke、Mary Oliver、Walt Whitman、T. S. Eliot。
- love：可优先考虑 Shakespeare sonnets、Elizabeth Barrett Browning、Neruda 的可靠英译。
- tiredness / stillness：可优先考虑 William Blake、Emily Dickinson、Wordsworth。

要求：
- 不生成原创诗。
- 中文诗与英文诗必须同时出现。
- 如果不确定全文，请选择较短、较经典、较可靠的作品或片段。
- reason 不要写分析报告，不要写“这首诗与用户当前情绪相关”“这首诗表达了”。
- reason 要像策展注释，一句话即可，克制、像展签。

返回 JSON：
{
  "chinesePoem": {
    "title": "",
    "author": "",
    "content": "",
    "reason": ""
  },
  "englishPoem": {
    "title": "",
    "titleCn": "",
    "author": "",
    "authorCn": "",
    "content": "",
    "translation": "",
    "reason": ""
  }
}`
          }
        ]
      })
    });

    const data = (await response.json()) as DeepseekResponse;

    if (!response.ok) {
      return NextResponse.json({
        ...fallbackPoem,
        error: data.error?.message || "DeepSeek poem failed",
        fallback: true
      });
    }

    const parsed = parseJson(data.choices?.[0]?.message?.content || "");
    if (!parsed) {
      return NextResponse.json({
        ...fallbackPoem,
        error: "DeepSeek returned invalid poem JSON",
        fallback: true
      });
    }

    return NextResponse.json({ ...parsed, fallback: false });
  } catch (error) {
    return NextResponse.json({
      ...fallbackPoem,
      error: error instanceof Error ? error.message : "DeepSeek poem failed",
      fallback: true
    });
  }
}
