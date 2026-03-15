# MUSE — AI Creative Director

## Inspiration

Every filmmaker starts with a vision. But turning that vision into a production-ready package — script, storyboards, style bible, shot list — takes days or weeks of pre-production work. Solo creators and small teams are especially bottlenecked here. We asked: what if an AI could do the creative direction work in minutes, not weeks?

We built MUSE because we live this problem every day. Bastion Harbor Studios has shipped 250+ generative AI projects across short films, branded content, and interactive installations. We know the gap between "great idea" and "production-ready package" — MUSE closes it.

## What it does

MUSE is an AI Creative Director that takes a creative brief and produces a complete production package:

1. **Script** — Structured screenplay with scenes, dialogue, camera notes, and emotional beats
2. **Style Bible** — Comprehensive visual direction: color palette (hex codes), lighting style, camera choices, film stock references, and a Global Lock string for generation consistency
3. **Storyboard** — Detailed frame-by-frame breakdown with composition notes, camera movements, and AI-optimized image prompts
4. **Creative Review** — Multi-round AI critique that evaluates the package for coherence, quality, and creative merit. Packages are refined until they reach approval.
5. **Storyboard Images** — AI-generated storyboard frames for every shot, styled to match the style bible

The entire pipeline runs end-to-end from a single text brief. No manual intervention required.

## How we built it

**Architecture:**
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS — dark cinematic UI with real-time pipeline visualization
- **Backend:** Next.js API routes calling Gemini directly via `@google/genai` SDK
- **Text Generation:** Gemini 2.5 Flash for script writing, style bible compilation, storyboard planning, and creative review (all structured JSON output)
- **Image Generation:** Gemini 3.1 Flash Image Preview for storyboard frame generation with native multimodal output
- **Deployment:** Vercel (serverless, edge-optimized)

**Pipeline Design:**
- 5-stage sequential pipeline with structured JSON contracts between stages
- Each stage receives the output of all prior stages for full context
- Creative review stage implements a critique-correct-verify loop (up to 2 rounds)
- Style bible includes a "Global Lock" string appended to all image prompts for visual consistency
- Every storyboard frame prompt is enriched with lighting notes, composition guidance, and style references

**Key Technical Decisions:**
- Structured JSON output (`response_mime_type: "application/json"`) ensures reliable parsing between pipeline stages
- Separate models for text (2.5 Flash) and image (3.1 Flash Image) for optimal quality in each domain
- Base64 image encoding for zero-latency storyboard display (no CDN round-trips)

## Challenges we ran into

- **Image model availability:** The image generation model naming changed during development. We had to dynamically discover the correct model endpoint (`gemini-3.1-flash-image-preview`).
- **JSON reliability:** Ensuring consistent JSON output across 5 pipeline stages required careful system prompt engineering. We use `response_mime_type: "application/json"` to enforce structure.
- **Style consistency:** Getting storyboard images to maintain visual coherence across frames required the "Global Lock" technique — a consistent style string appended to every image prompt.
- **Serverless timeouts:** Full pipeline takes 60-120 seconds. We structured the API to stream stage completions so the UI shows progress in real-time.

## Accomplishments that we're proud of

- **End-to-end working pipeline:** Brief in → complete production package out, with zero manual steps
- **Grade A creative review on first pass:** The critique-correct-verify loop consistently produces high-quality output
- **11/11 storyboard frames generated:** Zero failures in our test runs — the image generation pipeline is robust
- **Real production value:** This isn't a hackathon toy — it's a tool we'll use in our actual production workflow at Bastion Harbor Studios

## What we learned

- Gemini's structured JSON output is remarkably reliable for multi-stage pipelines
- The Global Lock technique (appending consistent style strings to all prompts) dramatically improves visual coherence across generated images
- Multi-round AI critique significantly improves output quality — the agent catches issues humans might miss in a first pass
- Separating text and image generation models allows optimizing for each domain independently

## What's next for MUSE

- **Voice-driven creative direction** via Gemini Live API — describe your vision verbally, get a package back
- **Video generation integration** — route approved storyboard frames to Kling 3.0, Veo 3.1, or LTX 2.3 for video generation (our Video Forge pipeline)
- **Spatial Consistency Engine** — floor-plan-guided prompt engineering to maintain environmental coherence across shots
- **Grain integration** — use our forensic visual analysis engine (getgrain.xyz) to verify style consistency at the parameter level
- **On-chain agent commerce** — register MUSE as a discoverable agent via ERC-8004 for autonomous creative hiring

## Built With

- gemini-2.5-flash
- gemini-3.1-flash-image-preview
- google-genai
- next.js
- typescript
- tailwind-css
- vercel
