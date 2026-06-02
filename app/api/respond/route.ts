import { NextRequest, NextResponse } from "next/server";

type RespondBody = {
  userText?: string;
  emotion?: string;
  themes?: string[];
  artifact?: {
    name?: string;
    story?: string;
    reason?: string;
    responseTemplate?: string;
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

export async function POST(request: NextRequest) {
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

  const body = (await request.json()) as RespondBody;
  const artifact = body.artifact || {};
  const fallback =
    artifact.responseTemplate?.replace("{emotion}", body.emotion || "当下情绪") || "";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_TEXT_MODEL || "deepseek-chat",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "你为数字策展作品《此刻有物》写文物第一人称回应。必须基于给定文物资料，不编造具体历史事实。语气要自然、具体、接地气，不要像心理咨询，也不要过度文艺。不要说“作为AI”。"
          },
          {
            role: "user",
            content: `用户输入：${body.userText || ""}
情绪：${body.emotion || "当下情绪"}
文明主题：${body.themes?.join("、") || "此刻、等待"}

文物名称：${artifact.name || "文物"}
文物介绍：${artifact.story || ""}
匹配理由：${artifact.reason || ""}
本地回应模板：${artifact.responseTemplate || ""}

请写一段文物第一人称回应：
- 不超过120字
- 必须结合文物用途、材料或历史背景
- 必须回应用户输入和当前情绪
- 信息明确，语言接地气
- 不要空泛意象
- 不要使用“命运、光影、时间长河、未来形状”等套话
- 不要编造来源资料中没有的具体事件或人物`
          }
        ]
      })
    });

    const data = (await response.json()) as DeepseekResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          response: fallback,
          error: data.error?.message || "Deepseek respond failed",
          fallback: true
        },
        { status: response.status }
      );
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { response: fallback, error: "Deepseek returned empty response", fallback: true },
        { status: 502 }
      );
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    return NextResponse.json(
      {
        response: fallback,
        error: error instanceof Error ? error.message : "Deepseek respond failed",
        fallback: true
      },
      { status: 500 }
    );
  }
}
