# MUSE Demo Video Script (<4 minutes)

## Setup
- Screen recording software (OBS, Loom, or QuickTime)
- Browser open to https://muse-hackathon.vercel.app
- Google Cloud Console open in another tab (show Project Shockwave)
- Voiceover (you talk while showing the screen)

---

## SCRIPT (3:30 target)

### 0:00-0:20 — Hook
**[Show MUSE landing page]**

> "Every filmmaker starts with a vision. But turning that vision into a production-ready package — script, storyboards, style bible — takes days or weeks. What if AI could do it in minutes?"

> "This is MUSE — an AI Creative Director powered by Gemini."

### 0:20-0:40 — Who We Are
**[Stay on landing page]**

> "I'm Louie Pecan from Bastion Harbor Studios. We've shipped over 250 AI-generated projects — short films, branded content, interactive installations. We're Top 50 AWS AI Artists and we teach AI filmmaking to 200+ creators."

> "MUSE automates the hardest part of our production pipeline: pre-production."

### 0:40-1:10 — Enter the Brief
**[Type a brief into the input field]**

Suggested brief to type:
> "A 2-minute cyberpunk short: a street vendor sells stolen memories in neon-lit alleyways of Neo-Tokyo. A woman arrives to buy back her dead lover's last memory. Genre: sci-fi romance. Tone: bittersweet beauty."

> "I type a creative brief — the concept, genre, tone, and target duration. That's all MUSE needs."

**[Click "Generate Creative Package"]**

### 1:10-2:00 — Watch the Pipeline
**[Show the stages lighting up one by one]**

> "Watch the pipeline work. Five stages, all powered by Gemini."

**[As Script stage completes]**
> "Stage 1: Gemini 2.5 Flash generates a structured screenplay — scenes, dialogue, camera notes."

**[Click Script tab to show output]**
> "Full screenplay with specific locations, emotional beats, and cinematography directions."

**[As Style Bible completes]**
> "Stage 2: A comprehensive style bible — color palette with hex codes, lighting direction, camera choices, film stock references, and a Global Lock string that keeps every generated image visually consistent."

**[As Storyboard completes]**
> "Stage 3: Detailed storyboard with frame-by-frame composition, camera movements, and AI-optimized image prompts."

**[As Review completes]**
> "Stage 4: An AI creative director reviews the entire package for coherence and quality. It grades the work and catches issues before we generate images."

### 2:00-2:40 — Images + Style Bible
**[As images start appearing]**
> "Stage 5: Gemini 3.1 Flash generates actual storyboard frames — each one styled to match the style bible. Watch them come in."

**[Click through Storyboard tab showing generated images]**
> "Every frame maintains visual consistency through the Global Lock technique — a style string from the bible appended to every image prompt."

**[Click Style Bible tab]**
> "The style bible includes specific hex colors, lighting direction, film references — everything a cinematographer needs."

### 2:40-3:00 — Download + Completion
**[Show the green completion bar]**
> "Package complete. Grade A. I can download the full package as JSON, or download all the storyboard frames individually."

**[Click Download Package]**
> "One click — script, style bible, storyboard, review — all structured data ready for the next stage of production."

### 3:00-3:20 — Architecture + GCP
**[Show architecture diagram or switch to Google Cloud Console]**

> "Under the hood: Next.js frontend, Gemini 2.5 Flash for text generation with structured JSON output, Gemini 3.1 Flash for image generation, streamed to the browser via Server-Sent Events. Deployed on Vercel with Google Cloud Storage for package persistence."

### 3:20-3:40 — What's Next
> "MUSE is just the beginning. Next: voice-driven creative direction via Gemini Live API, video generation integration with Kling and Veo, and spatial consistency for maintaining environments across shots."

> "From brief to production package in minutes. This is MUSE."

**[End on the completion screen with generated frames visible]**

---

## RECORDING TIPS
1. **Clear browser tabs** — only MUSE + GCP Console
2. **Pre-run once** to warm up the API (faster response for the recording)
3. **Record at 1080p minimum**
4. **Speak naturally** — you're a filmmaker talking about your tool, not reading a script
5. **If generation takes long**, you can cut/speed up the waiting parts in post
6. **Show the actual output** — let the judges see real generated content, not slides
