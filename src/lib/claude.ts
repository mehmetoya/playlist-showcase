import Groq from "groq-sdk";
import type { AIAnalysis, ChatMessage, Playlist, PlaylistTrack } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export async function analyzePlaylist(
  playlist: Playlist,
  tracks: PlaylistTrack[]
): Promise<AIAnalysis> {
  const trackList = tracks
    .slice(0, 40)
    .map((t, i) => `${i + 1}. "${t.name}" — ${t.artists.join(", ")}`)
    .join("\n");

  const prompt = `You are an editorial music critic for a high-end magazine. Analyze this Spotify playlist and return a JSON response.

Playlist: "${playlist.name}"
Description: "${playlist.description || "none"}"
Owner: ${playlist.owner.name}
Total tracks: ${playlist.trackCount}
Followers: ${playlist.followers}

Track list (first 40):
${trackList}

Return ONLY valid JSON matching this exact shape (no markdown, no explanation, no code fences):
{
  "mood": "2-4 word mood description",
  "moodBadge": "single word or short phrase for badge",
  "listeningContext": "one evocative sentence about when/where to listen",
  "personality": "one sentence about who would make/love this playlist",
  "emotionalTone": "one sentence about the emotional arc",
  "styleImpression": "one sentence about musical style and sonic palette",
  "poeticReview": "3-4 paragraph editorial review in poetic, magazine-quality prose"
}

Be specific, poetic, and insightful. Avoid clichés. Reference actual artists or track names.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
    temperature: 0.8,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const clean = text.replace(/```json\n?|```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return { ...parsed, generatedAt: new Date().toISOString() };
  } catch {
    throw new Error(`Groq returned invalid JSON: ${clean.slice(0, 200)}`);
  }
}

export async function chatAboutPlaylist(
  playlist: Playlist,
  tracks: PlaylistTrack[],
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const trackList = tracks
    .slice(0, 30)
    .map((t) => `"${t.name}" — ${t.artists.join(", ")}`)
    .join(", ");

  const systemPrompt = `You are a music expert and editorial critic answering questions about a specific Spotify playlist.

Playlist context:
- Name: "${playlist.name}"
- Description: "${playlist.description || "none"}"
- Owner: ${playlist.owner.name}
- Total tracks: ${playlist.trackCount}
- Tracks (first 30): ${trackList}

Answer with insight and editorial quality. Keep answers concise (2-4 sentences) unless more is requested.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ],
    max_tokens: 512,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}