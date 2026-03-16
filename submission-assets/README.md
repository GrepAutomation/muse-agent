# 🎬 MUSE — AI Creative Director

> From creative brief to production package in minutes. Powered by Gemini.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://muse-hackathon.vercel.app)
[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.5%20Flash-blue)](https://ai.google.dev)

## What is MUSE?

MUSE is an AI Creative Director that transforms a creative brief into a complete production package:

| Stage | Output | Model |
|-------|--------|-------|
| 📝 Script | Structured screenplay (scenes, dialogue, camera notes) | Gemini 2.5 Flash |
| 🎨 Style Bible | Visual direction (colors, lighting, camera, film references) | Gemini 2.5 Flash |
| 🖼️ Storyboard | Frame-by-frame breakdown with composition notes | Gemini 2.5 Flash |
| 🔍 Review | AI creative critique with approval/revision cycle | Gemini 2.5 Flash |
| 🖌️ Images | Generated storyboard frames matching the style bible | Gemini 3.1 Flash Image |

## Architecture

```
User Brief (text)
  → Stage 1: Script Generator (Gemini 2.5 Flash, JSON output)
    → Stage 2: Style Bible Compiler (inherits script context)
      → Stage 3: Storyboard Artist (inherits script + style)
        → Stage 4: Creative Review (critique-correct-verify loop)
          → Stage 5: Image Generator (Gemini 3.1 Flash Image)
            → Complete Production Package
```

**Key Design Decisions:**
- **Structured JSON contracts** between pipeline stages ensure reliable data flow
- **Global Lock** style string from the style bible is appended to every image prompt for visual consistency
- **Critique-correct-verify** loop catches quality issues before image generation
- **Separate models** for text (2.5 Flash) and images (3.1 Flash Image) for optimal quality

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Google GenAI SDK (`@google/genai`)
- **Text Model:** `gemini-2.5-flash` with `responseMimeType: "application/json"`
- **Image Model:** `gemini-3.1-flash-image-preview` with `responseModalities: ["IMAGE", "TEXT"]`
- **Deployment:** Vercel (serverless)

## Getting Started

### Prerequisites
- Node.js 20+
- Google AI API key ([get one here](https://aistudio.google.com/apikey))

### Local Development

```bash
git clone https://github.com/grepautomation/muse-agent.git
cd muse-agent
npm install
echo "GOOGLE_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

```bash
npx vercel --prod
npx vercel env add GOOGLE_API_KEY production
```

## Example Output

**Brief:** *"A 30-second cyberpunk short: a street vendor sells memories in neon-lit alleyways of Neo-Tokyo. A customer buys their dead lover's last memory."*

**Result:**
- 📝 Script: "The Memory Vendor" — 3 scenes, 11 shots, 2 characters
- 🎨 Style Bible: Neon-noir palette (#FF00FF, #00FFFF, #1A1A2E), anamorphic 2.39:1, Blade Runner meets Wong Kar-wai
- 🖼️ Storyboard: 11 frames with detailed composition and camera notes
- 🔍 Review: Grade A, approved in 1 round
- 🖌️ Images: 11 generated storyboard frames, all matching the style bible

## About

Built by [Bastion Harbor Studios](https://louiepecan.com) — AI-native filmmaking since 2021, 250+ shipped projects, Top 50 AWS AI Artists.

## License

MIT
