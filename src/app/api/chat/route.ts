import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { DEFAULT_MODEL, FREE_MODELS } from "@/lib/models";

export const maxDuration = 60;
export const runtime = "edge";
export const dynamic = "force-dynamic";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const FREE_MODEL_IDS = new Set(FREE_MODELS.map((freeModel) => freeModel.id));

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}

export async function POST(req: Request) {
  try {
    const request = (await req.json()) as {
      messages?: unknown;
      model?: unknown;
    };
    const { messages, model } = request;
    const requestedModel = typeof model === "string" ? model : "";

    const modelId = FREE_MODEL_IDS.has(requestedModel)
      ? requestedModel
      : DEFAULT_MODEL;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please enter a message first." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanMessages = (messages as unknown[]).map((message) => {
      const m = message as ChatMessage;

      return m.content
        ? { role: m.role, content: m.content }
        : {
            role: m.role,
            content: (m.parts || [])
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join(""),
          };
    });

    const result = streamText({
      model: openrouter(modelId),
      system: "You are Chuin AI. Be concise. Use markdown for code.",
      messages: cleanMessages,
      temperature: 0.7,
      maxTokens: 4000,
    });

    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform, no-store",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "This model is temporarily unavailable. Please try another free model." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
