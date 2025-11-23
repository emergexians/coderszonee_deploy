// app/api/assistant/route.ts
import OpenAI from "openai";

export const runtime = "edge"; // or "nodejs" if you prefer

type HistoryMsg = { role: "system" | "user" | "assistant"; content: string };

function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function systemFor(action: string) {
  switch (action) {
    case "summarize":
      return "You are a concise teaching assistant. Summarize clearly in bullet points with key takeaways.";
    case "skillpath":
      return "You design practical 4–8 week skill paths with weekly modules, outcomes, and resources.";
    case "careerpath":
      return "You advise on career paths with required skills, starter projects, and interview prep.";
    default:
      return "You are a friendly learning assistant for an LMS. Be concise and helpful.";
  }
}

function demoReply(prompt: string, action: string) {
  switch (action) {
    case "summarize":
      return `🔍 (demo) Summary of: "${prompt}"
• Key point 1
• Key point 2
• Key point 3`;
    case "skillpath":
      return `📚 (demo) 6-week skill path for: ${prompt}
Week 1: Foundations
Week 2: Core syntax
Week 3: Projects 1
Week 4: Projects 2
Week 5: APIs & tooling
Week 6: Capstone & review`;
    case "careerpath":
      return `🧭 (demo) Career roadmap for: ${prompt}
1) Core skills
2) Portfolio projects
3) Interview prep
4) Networking & next steps`;
    default:
      return `🤖 (demo) You said: "${prompt}"`;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      history = [],
      action = "chat",
      temperature = 0.4,
      max_tokens = 500,
    }: {
      prompt?: string;
      history?: HistoryMsg[];
      action?: "chat" | "summarize" | "skillpath" | "careerpath";
      temperature?: number;
      max_tokens?: number;
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return json({ error: "Missing `prompt` (string)" }, 400);
    }
    if (!Array.isArray(history)) {
      return json({ error: "`history` must be an array" }, 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // No key? Return a friendly demo response so dev still works.
    if (!apiKey) {
      return json({
        answer: demoReply(prompt, action),
        model: "demo",
        usage: { note: "No OPENAI_API_KEY set; returning stub text." },
      });
    }

    const client = new OpenAI({ apiKey });

    const messages: HistoryMsg[] = [
      { role: "system", content: systemFor(action) },
      ...history,
      { role: "user", content: prompt },
    ];

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a reply.";

    return json({ answer, model, usage: completion.usage });
  } catch (err: unknown) {
    console.error("Assistant API error:", err);
    const message =
      err instanceof Error ? err.message : "Server error";
    return json({ error: message }, 500);
  }
}
