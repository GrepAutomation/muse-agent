# MUSE Architecture

## Pipeline

```
User Brief (text + genre + tone + duration)
  │
  ▼
┌─────────────────────────────────┐
│  Stage 1: SCRIPT GENERATOR      │
│  Model: Gemini 2.5 Flash        │
│  Output: Structured screenplay  │
│  (JSON: title, logline, scenes) │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Stage 2: STYLE BIBLE COMPILER  │
│  Model: Gemini 2.5 Flash        │
│  Input: Brief + Script          │
│  Output: Visual direction JSON  │
│  (palette, lighting, Global     │
│   Lock, character/location      │
│   designs, film references)     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Stage 3: STORYBOARD ARTIST     │
│  Model: Gemini 2.5 Flash        │
│  Input: Script + Style Bible    │
│  Output: Frame-by-frame         │
│  breakdown with image prompts   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Stage 4: CREATIVE REVIEW       │
│  Model: Gemini 2.5 Flash        │
│  Input: Brief + All outputs     │
│  Output: Grade, verdict, notes  │
│  (Critique-Correct-Verify loop) │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Stage 5: IMAGE GENERATION      │
│  Model: Gemini 3.1 Flash Image  │
│  Input: Storyboard prompts +    │
│         Global Lock style       │
│  Output: Generated frames       │
└─────────────────────────────────┘
               │
               ▼
      Complete Creative Package
      (Download JSON + Frames)
```

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + CSS (inline styles)
- **Backend:** Next.js API Routes with Server-Sent Events (SSE)
- **Text Generation:** `gemini-2.5-flash` via `@google/genai` SDK
- **Image Generation:** `gemini-3.1-flash-image-preview` via `@google/genai` SDK
- **Deployment:** Vercel (Pro plan, 300s function timeout)
- **Cloud Storage:** Google Cloud Storage for package persistence

## Key Design Decisions

1. **Structured JSON contracts** — All pipeline stages use `responseMimeType: "application/json"` for reliable inter-stage data flow
2. **Global Lock** — Style bible produces a consistent style string appended to every image prompt
3. **SSE streaming** — Real-time progress updates as each stage completes
4. **Error boundary** — React error boundary catches rendering issues from unexpected Gemini output shapes
5. **Universal str() helper** — Safely converts any nested object to displayable string (Gemini returns unpredictable structures)
