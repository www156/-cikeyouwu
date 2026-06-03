import { NextRequest, NextResponse } from "next/server";
import { moderateUserText, moderationErrorResponse } from "../_utils/moderation";

type AnalyzeBody = {
  userText?: string;
};

type AnalyzeResult = {
  emotion: string;
  themes: string[];
  explanation: string;
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

function parseJson(text: string): AnalyzeResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[0]) as Partial<AnalyzeResult>;
    return {
      emotion: parsed.emotion || "未命名的当下感",
      themes: Array.isArray(parsed.themes)
        ? parsed.themes.filter(Boolean).map(String).slice(0, 6)
        : ["此刻", "等待", "显影"],
      explanation: parsed.explanation || "DeepSeek API 完成了情绪与文明主题分析。"
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AnalyzeBody;
  const userText = body.userText?.trim() || "我很迷茫";
  const moderation = await moderateUserText(userText);

  if (!moderation.safe) {
    return moderationErrorResponse(moderation);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing DEEPSEEK_API_KEY. Please create .env.local in the project root and set DEEPSEEK_API_KEY=your_key."
      },
      { status: 500 }
    );
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
              "你是数字策展作品《此刻有物》的情绪与文明主题分析器。只返回 JSON，不要 Markdown，不要多余文字。"
          },
          {
            role: "user",
            content: `用户输入：${userText}

请识别用户情绪，并提取适合文物匹配的文明主题。
主题优先从这些方向选择或短语化改写：喜悦、悲伤、愤怒、平静、惊讶、恐惧、期待、成长、等待、改变、关系、责任、梦想、失败、重生、过去、现在、未来、远行、秩序、自由、创造、胜利、庆祝、成就、探索、学习、死亡、反思、启示、超越。

返回格式：
{
  "emotion": "中文情绪描述",
  "themes": ["主题1", "主题2", "主题3", "主题4"],
  "explanation": "一句中文解释"
}`
          }
        ]
      })
    });

    const data = (await response.json()) as DeepseekResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "DeepSeek analyze failed" },
        { status: response.status }
      );
    }

    const parsed = parseJson(data.choices?.[0]?.message?.content || "");
    if (!parsed) {
      return NextResponse.json({ error: "Unable to parse DeepSeek response" }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "DeepSeek analyze failed" },
      { status: 500 }
    );
  }
}
