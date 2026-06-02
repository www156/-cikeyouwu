# 此刻有物

一个期末 AI 项目原型：用户输入当下状态，网页从本地 mock 文物数据中匹配一件文物，并展示文物信息、真实图片、AI 生成图像提示词和文物第一人称回应。

## 功能

- 首页状态输入框
- 用户输入 -> 情绪识别 -> 文明主题提取 -> 文物匹配 -> 历史故事 -> 文物回应
- 本地 mock 文物数据匹配，暂不连接真实博物馆 API
- 展示文物名称、年代、来源、真实图片
- 展示 AI 生成图像提示词
- 展示文物第一人称回应文本
- 展示“为什么是它？”、“如果来自其他文明”、“文物眼中的世界”三个策展模块
- 博物馆感、安静、诗意的页面风格

## 项目结构

```text
cike-you-wu/
  app/
    data/
      artifacts.ts      # 本地文物 mock 数据
    globals.css         # 页面样式
    layout.tsx          # Next.js 根布局
    page.tsx            # 首页与匹配逻辑
  public/
    artifacts/          # 后续可放本地文物图片
  package.json
  next.config.mjs
  tsconfig.json
  README.md
```

## 运行

```bash
npm install
npm run dev
```

然后打开：

```text
http://localhost:3000
```

## Deepseek API

分析用户输入和生成文物回应通过 Next.js API routes 调用 Deepseek API。

在项目根目录创建：

```text
.env.local
```

内容：

```env
DEEPSEEK_API_KEY=你的_Deepseek_API_Key
```

可选指定文本模型：

```env
DEEPSEEK_TEXT_MODEL=deepseek-chat
```

安装依赖：

```powershell
npm install
```

启动前端：

```powershell
npm run dev
```

## 后续可扩展

- 把 `app/data/artifacts.ts` 替换为真实博物馆 API 数据。
- 为每件文物增加情绪标签、主题标签和相似度权重。
- 接入大模型，根据用户输入动态生成第一人称回应。
- 将远程图片下载到 `public/artifacts/`，保证课堂展示时离线可用。
