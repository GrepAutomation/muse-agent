import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const PROMPTS = {
  script: `You are a professional screenwriter. Given a creative brief, generate a structured screenplay in JSON format with fields: title, logline, genre, tone, scenes (array of {scene_number, location, time, action, dialogue[], camera_notes}). Target the specified duration. Be cinematic and specific.`,
  style_bible: `You are a visual director. Given a brief and script, compile a comprehensive style bible in JSON format with fields: project_title, visual_identity (color_palette, lighting_style, camera_style, aspect_ratio, film_stock_reference, global_lock), character_designs[], location_designs[], mood_references. Be specific about hex colors, lens choices, and film references.`,
  storyboard: `You are a storyboard artist. Given a script and style bible, generate detailed storyboard frames in JSON format with fields: storyboard (array of {frame_number, scene_reference, shot_type, composition, subject, camera_movement, lighting_notes, image_prompt}). The image_prompt should be a detailed cinematic generation prompt. Generate 2-3 frames per scene.`,
  review: `You are a creative director reviewing a production package. Evaluate the script, storyboard, and style bible for coherence, quality, and creative merit. Return JSON with: overall_grade (A-F), verdict (APPROVE or REVISE), script_notes[], storyboard_notes[], style_bible_notes[], coherence_issues[].`,
};

// Image store removed — using inline base64

async function generateJSON(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.8,
    },
  });
  return response.text ?? "{}";
}

async function generateImage(prompt: string): Promise<{ data?: string; mime?: string; error?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [{ role: "user", parts: [{ text: `Generate this cinematic storyboard frame as a high quality image: ${prompt}` }] }],
      config: {
        responseModalities: ["image", "text"] as unknown as undefined,
      } as Record<string, unknown>,
    });
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          const b64 = typeof part.inlineData.data === "string"
            ? part.inlineData.data
            : Buffer.from(part.inlineData.data as unknown as ArrayBuffer).toString("base64");
          return { data: b64, mime: part.inlineData.mimeType ?? "image/png" };
        }
      }
    }
    return { error: "No image in response" };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function POST(req: NextRequest) {
  const { brief, genre, tone, duration } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`));
        } catch { /* controller closed */ }
      };

      try {
        // Stage 1: Script
        send("stage", { stage: "script", status: "running" });
        const scriptText = await generateJSON(
          PROMPTS.script,
          `Creative Brief: ${brief}\nGenre: ${genre}\nTone: ${tone}\nTarget Duration: ${duration}`
        );
        let script;
        try { script = JSON.parse(scriptText); } catch { script = { raw: scriptText }; }
        send("stage", { stage: "script", status: "done" });
        send("result", { type: "script", data: script });

        // Stage 2: Style Bible
        send("stage", { stage: "style_bible", status: "running" });
        const styleBibleText = await generateJSON(
          PROMPTS.style_bible,
          `Creative Brief: ${brief}\n\nScript:\n${scriptText}`
        );
        let styleBible;
        try { styleBible = JSON.parse(styleBibleText); } catch { styleBible = { raw: styleBibleText }; }
        send("stage", { stage: "style_bible", status: "done" });
        send("result", { type: "style_bible", data: styleBible });

        // Stage 3: Storyboard
        send("stage", { stage: "storyboard", status: "running" });
        const storyboardText = await generateJSON(
          PROMPTS.storyboard,
          `Script:\n${scriptText}\n\nStyle Bible:\n${styleBibleText}`
        );
        let storyboard;
        try { storyboard = JSON.parse(storyboardText); } catch { storyboard = { raw: storyboardText }; }
        send("stage", { stage: "storyboard", status: "done" });
        send("result", { type: "storyboard", data: storyboard });

        // Stage 4: Review
        send("stage", { stage: "review", status: "running" });
        const reviewText = await generateJSON(
          PROMPTS.review,
          `Original Brief: ${brief}\n\nScript:\n${scriptText}\n\nStoryboard:\n${storyboardText}\n\nStyle Bible:\n${styleBibleText}`
        );
        let review;
        try { review = JSON.parse(reviewText); } catch { review = { raw: reviewText }; }
        send("stage", { stage: "review", status: "done" });
        send("result", { type: "review", data: review });

        // Stage 5: Images — send as individual base64 chunks
        send("stage", { stage: "images", status: "running" });
        const frames = storyboard?.storyboard || [];
        const globalLock = styleBible?.visual_identity?.global_lock || "";

        for (const frame of frames) {
          try {
            let prompt = frame.image_prompt || "";
            if (globalLock) prompt += `\n\nStyle: ${globalLock}`;
            const result = await generateImage(prompt);

            if (result.data && result.mime) {
              send("image", {
                frame: frame.frame_number,
                dataUri: `data:${result.mime};base64,${result.data}`,
                prompt: frame.image_prompt || "",
              });
            } else {
              send("image", {
                frame: frame.frame_number,
                error: result.error || "Unknown error",
                prompt: frame.image_prompt || "",
              });
            }
          } catch (imgErr: unknown) {
            send("image", {
              frame: frame.frame_number,
              error: (imgErr as Error).message,
              prompt: frame.image_prompt || "",
            });
          }
        }

        send("stage", { stage: "images", status: "done" });
        send("complete", { success: true });
      } catch (e: unknown) {
        send("error", { message: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
