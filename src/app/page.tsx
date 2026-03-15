"use client";

import { useState, useCallback, Component, type ReactNode } from "react";

class ErrorBoundary extends Component<{children: ReactNode}, {error: string | null}> {
  constructor(props: {children: ReactNode}) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:40,textAlign:"center",color:"#f87171"}}>
        <h2>Something went wrong</h2>
        <p style={{color:"#888",marginTop:8}}>{this.state.error}</p>
        <button onClick={() => { this.setState({error: null}); window.location.reload(); }}
          style={{marginTop:16,padding:"8px 24px",background:"#7c5cbf",color:"white",border:"none",borderRadius:8,cursor:"pointer"}}>
          Reload
        </button>
      </div>
    );
    return this.props.children;
  }
}

const C = {
  bg: "#0a0a0f",
  surface: "#141420",
  border: "#1e1e35",
  purple: "#7c5cbf",
  purpleLight: "#a78bfa",
  green: "#22c55e",
  amber: "#f59e0b",
  text: "#e0e0f0",
  textDim: "#8888aa",
  textMuted: "#55546a",
};

interface FrameImage {
  frame: number;
  dataUri?: string;
  error?: string;
  prompt: string;
}

type StageStatus = "pending" | "running" | "done";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MusePageWrapper() {
  return <ErrorBoundary><MusePageInner /></ErrorBoundary>;
}

function MusePageInner() {
  console.log("[MUSE] Page rendered");
  const [brief, setBrief] = useState("");
  const [genre, setGenre] = useState("Sci-Fi");
  const [tone, setTone] = useState("Cinematic");
  const [duration, setDuration] = useState("2 minutes");
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("script");
  const [stages, setStages] = useState<Record<string, StageStatus>>({
    script: "pending", style_bible: "pending", storyboard: "pending", review: "pending", images: "pending",
  });
  const [results, setResults] = useState<Record<string, any>>({});
  const [images, setImages] = useState<FrameImage[]>([]);
  const [pipelineComplete, setPipelineComplete] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!brief.trim() || running) return;
    setRunning(true);
    setResults({});
    setImages([]);
    setStages({ script: "pending", style_bible: "pending", storyboard: "pending", review: "pending", images: "pending" });
    setPipelineComplete(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, genre, tone, duration }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const match = line.match(/^data: ([\s\S]+)$/);
          if (!match) continue;
          try {
            const { event, data } = JSON.parse(match[1]);
            console.log(`[MUSE SSE] event=${event}`, event === "image" ? `frame=${data.frame}` : data);
            if (event === "stage") {
              setStages(p => ({ ...p, [data.stage]: data.status }));
            } else if (event === "result") {
              console.log(`[MUSE] Result type=${data.type}, keys=`, Object.keys(data.data || {}));
              setResults(p => ({ ...p, [data.type]: data.data }));
            } else if (event === "image") {
              console.log(`[MUSE] Image frame=${data.frame}, hasData=${!!data.dataUri}, error=${data.error || "none"}`);
              setImages(p => [...p, data]);
            } else if (event === "error") {
              console.error("[MUSE] Pipeline error:", data.message);
            } else if (event === "complete") {
              console.log("[MUSE] Pipeline complete!");
              setPipelineComplete(true);
            }
          } catch (parseErr) {
            console.warn("[MUSE] Parse error:", parseErr, "raw:", match[1]?.substring(0, 200));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  }, [brief, genre, tone, duration, running]);

  const stageList = [
    { key: "script", label: "📝 Script" },
    { key: "style_bible", label: "🎨 Style Bible" },
    { key: "storyboard", label: "🖼️ Storyboard" },
    { key: "review", label: "🔍 Review" },
    { key: "images", label: "🖌️ Images" },
  ];

  const tabs = [
    { key: "script", label: "Script" },
    { key: "style_bible", label: "Style Bible" },
    { key: "storyboard", label: "Storyboard" },
    { key: "review", label: "Review" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 14, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 48, fontWeight: 200, letterSpacing: "0.3em", color: "white", margin: 0 }}>MUSE</h1>
          <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "0.1em", marginTop: 4 }}>AI Creative Director</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}` }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa" }} />
          <span style={{ fontSize: 12, color: C.textDim }}>Powered by Gemini</span>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        {/* Brief Input */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "white", marginBottom: 16 }}>Creative Brief</h2>
          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="Describe your creative vision... e.g., A noir detective story set in rain-soaked Tokyo where AI ghosts haunt the neon alleys..."
            style={{ ...inputStyle, height: 112, resize: "vertical", fontFamily: "inherit" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Genre</label>
              <input value={genre} onChange={e => setGenre(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Tone</label>
              <input value={tone} onChange={e => setTone(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Duration</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={running || !brief.trim()}
            style={{
              marginTop: 20, padding: "12px 32px", background: running || !brief.trim() ? "#333" : C.purple,
              color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: running ? "not-allowed" : "pointer",
            }}
          >
            {running ? "⏳ Generating..." : "🎬 Generate Creative Package"}
          </button>
        </div>

        {/* Pipeline Stages */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {stageList.map((s, i) => {
            const status = stages[s.key];
            const bg = status === "done" ? "rgba(34,197,94,0.15)" : status === "running" ? "rgba(124,92,191,0.2)" : "rgba(255,255,255,0.03)";
            const borderColor = status === "done" ? C.green : status === "running" ? C.purple : "#333";
            const textColor = status === "done" ? C.green : status === "running" ? C.purpleLight : C.textMuted;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: bg, border: `1px solid ${borderColor}` }}
                  className={status === "running" ? "pulse-glow" : ""}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: textColor }}
                    className={status === "running" ? "animate-pulse" : ""} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: textColor }}>{s.label}</span>
                  {status === "done" && <span style={{ color: C.green, fontSize: 12 }}>✓</span>}
                </div>
                {i < stageList.length - 1 && <div style={{ width: 24, height: 1, background: status === "done" ? C.green + "80" : "#333" }} />}
              </div>
            );
          })}
        </div>

        {/* Action Bar — shows when pipeline is complete */}
        {pipelineComplete && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.3)`,
            borderRadius: 12, padding: "16px 24px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>
                  Package Complete — {results.review?.overall_grade || "A"} Grade
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  {str(results.script?.title || "Untitled")} · {(results.storyboard?.storyboard || []).length} frames · {images.filter(i => i.dataUri).length} images generated
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => {
                const pkg = {
                  brief,
                  script: results.script,
                  style_bible: results.style_bible,
                  storyboard: results.storyboard,
                  review: results.review,
                  meta: { genre, tone, duration, generatedAt: new Date().toISOString(), imageCount: images.filter(i => i.dataUri).length },
                };
                const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${(results.script?.title || "muse-package").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }} style={{
                padding: "10px 20px", background: C.purple, color: "white", border: "none",
                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                📦 Download Package
              </button>
              <button onClick={() => {
                // Download all images as individual files
                images.forEach((img, i) => {
                  if (img.dataUri) {
                    const a = document.createElement("a");
                    a.href = img.dataUri;
                    a.download = `frame_${String(img.frame).padStart(3, "0")}.png`;
                    a.click();
                  }
                });
              }} style={{
                padding: "10px 20px", background: "transparent", color: C.purpleLight,
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                🖼️ Download Frames
              </button>
              <button onClick={() => {
                setResults({});
                setImages([]);
                setStages({ script: "pending", style_bible: "pending", storyboard: "pending", review: "pending", images: "pending" });
                setPipelineComplete(false);
                setBrief("");
              }} style={{
                padding: "10px 20px", background: "transparent", color: C.textDim,
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                🔄 New Brief
              </button>
            </div>
          </div>
        )}

        {/* Output Tabs */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "12px 24px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                  background: activeTab === t.key ? "rgba(124,92,191,0.1)" : "transparent",
                  color: activeTab === t.key ? C.purpleLight : C.textMuted,
                  borderBottom: activeTab === t.key ? `2px solid ${C.purple}` : "2px solid transparent",
                }}>
                {t.label} {results[t.key] && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.green, marginLeft: 6 }} />}
              </button>
            ))}
          </div>
          <div style={{ padding: 24, minHeight: 400, maxHeight: 700, overflowY: "auto" }}>
            {activeTab === "script" && <ScriptView data={results.script} />}
            {activeTab === "style_bible" && <StyleView data={results.style_bible} />}
            {activeTab === "storyboard" && <StoryboardView data={results.storyboard} images={images} />}
            {activeTab === "review" && <ReviewView data={results.review} />}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: 16, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.textMuted }}>Built by Bastion Harbor Studios</p>
      </footer>
    </div>
  );
}

function ScriptView({ data }: { data: any }) {
  if (!data) return <Empty text="Script will appear here..." />;
  return (
    <div>
      <h3 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{data.title || "Untitled"}</h3>
      <p style={{ color: C.purpleLight, fontStyle: "italic", marginTop: 4 }}>{str(data.logline)}</p>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: C.textDim }}>
        {data.genre && <span>Genre: {str(data.genre)}</span>}
        {data.tone && <span>Tone: {str(data.tone)}</span>}
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {(data.scenes || []).map((s: any, i: number) => (
          <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 16, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.purpleLight, fontWeight: 600 }}>Scene {s.scene_number} — {s.location}</span>
              <span style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase" }}>{s.time}</span>
            </div>
            <p style={{ color: "#ccc", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{str(s.action)}</p>
            {s.dialogue?.map((d: any, j: number) => (
              <p key={j} style={{ fontSize: 13, marginTop: 4 }}>
                <span style={{ color: C.amber, fontWeight: 500 }}>{str(d.character || "")}: </span>
                <span style={{ color: "#bbb", fontStyle: "italic" }}>{str(d.line || (typeof d === "string" ? d : ""))}</span>
              </p>
            ))}
            {s.camera_notes && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>📷 {str(s.camera_notes)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StyleView({ data }: { data: any }) {
  if (!data) return <Empty text="Style Bible will appear here..." />;
  const vi = data.visual_identity || {};

  // Extract hex colors safely from palette (could be strings, objects, or nested)
  const palette: string[] = [];
  if (vi.color_palette) {
    const raw = Array.isArray(vi.color_palette) ? vi.color_palette : [vi.color_palette];
    for (const c of raw) {
      if (typeof c === "string") palette.push(c);
      else if (c && typeof c === "object") {
        const hex = c.hex || c.color || c.value || c.code;
        if (typeof hex === "string") palette.push(hex);
        else palette.push(str(c));
      }
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{str(data.project_title)}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <Card title="Visual Identity">
          <LV label="Lighting" value={vi.lighting_style} />
          <LV label="Camera" value={vi.camera_style} />
          <LV label="Aspect Ratio" value={vi.aspect_ratio} />
          <LV label="Film Stock" value={vi.film_stock_reference} />
          {palette.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>Colors:</span>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {palette.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "4px 8px" }}>
                    {c.startsWith("#") && <div style={{ width: 16, height: 16, borderRadius: 4, background: c }} />}
                    <span style={{ fontSize: 11, color: C.textDim }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card title="Global Lock">
          <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{str(vi.global_lock) || "N/A"}</p>
        </Card>
      </div>
      {data.character_designs?.length > 0 && (
        <Card title="Character Designs">
          {data.character_designs.map((c: any, i: number) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ color: C.purpleLight, fontWeight: 500 }}>{str(c.name || c.character || `Character ${i + 1}`)}</span>
              <p style={{ fontSize: 13, color: C.textDim }}>{str(c.description || c)}</p>
            </div>
          ))}
        </Card>
      )}
      {data.location_designs?.length > 0 && (
        <Card title="Location Designs">
          {data.location_designs.map((l: any, i: number) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ color: C.amber, fontWeight: 500 }}>{str(l.name || l.location || `Location ${i + 1}`)}</span>
              <p style={{ fontSize: 13, color: C.textDim }}>{str(l.description || l)}</p>
            </div>
          ))}
        </Card>
      )}
      {data.mood_references && (
        <Card title="Mood References">
          <p style={{ fontSize: 13, color: "#ccc" }}>{str(data.mood_references)}</p>
        </Card>
      )}
    </div>
  );
}

function StoryboardView({ data, images }: { data: any; images: FrameImage[] }) {
  if (!data) return <Empty text="Storyboard will appear here..." />;
  const frames = data.storyboard || [];
  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 16 }}>Storyboard Frames</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {frames.map((f: any, i: number) => {
          const img = images.find(im => im.frame === f.frame_number);
          return (
            <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ aspectRatio: "16/9", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {img?.dataUri ? (
                  <img src={img.dataUri} alt={`Frame ${f.frame_number}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                ) : img?.error ? (
                  <span style={{ color: "#f87171", fontSize: 12, padding: 16, textAlign: "center" }}>⚠ {img.error}</span>
                ) : (
                  <span style={{ color: C.textMuted, fontSize: 13 }}>{images.length > 0 ? "Generating..." : "Awaiting..."}</span>
                )}
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: C.purpleLight, fontSize: 11, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>
                  F{f.frame_number}
                </span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted }}>
                  <span>{f.shot_type}</span>
                  <span>Scene {f.scene_reference}</span>
                </div>
                <p style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{str(f.composition)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewView({ data }: { data: any }) {
  if (!data) return <Empty text="Review will appear here..." />;
  const gc: Record<string, string> = { A: C.green, B: C.green, C: C.amber, D: "#f87171", F: "#ef4444" };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: gc[data.overall_grade?.[0]] || C.textDim }}>{data.overall_grade || "—"}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Overall Grade</div>
        </div>
        <div style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 700,
          background: data.verdict === "APPROVE" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
          color: data.verdict === "APPROVE" ? C.green : C.amber,
          border: `1px solid ${data.verdict === "APPROVE" ? C.green + "4d" : C.amber + "4d"}`,
        }}>
          {data.verdict || "PENDING"}
        </div>
      </div>
      {["script_notes", "storyboard_notes", "style_bible_notes", "coherence_issues"].map(key => {
        const notes = data[key];
        if (!notes?.length) return null;
        return (
          <Card key={key} title={key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}>
            {notes.map((n: unknown, i: number) => (
              <p key={i} style={{ fontSize: 13, color: "#ccc", marginBottom: 4 }}>• {str(n)}</p>
            ))}
          </Card>
        );
      })}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: C.purpleLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{title}</h4>
      {children}
    </div>
  );
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(str).join(", ");
  if (typeof v === "object") {
    try {
      return Object.entries(v as Record<string, unknown>).map(([k, val]) => `${k}: ${str(val)}`).join("; ");
    } catch {
      return JSON.stringify(v);
    }
  }
  return String(v);
}

function LV({ label, value }: { label: string; value?: unknown }) {
  if (!value) return null;
  return <div style={{ marginBottom: 4 }}><span style={{ fontSize: 12, color: C.textMuted }}>{label}: </span><span style={{ fontSize: 13, color: "#ccc" }}>{str(value)}</span></div>;
}

function Empty({ text }: { text: string }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: C.textMuted, fontStyle: "italic" }}>{text}</div>;
}
