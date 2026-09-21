import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// Verified currently-free models (checked live from OpenRouter)
const FALLBACK_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "google/gemma-4-31b-it:free",
  "qwen/qwen3.8-27b:free",
  "z-ai/glm-5.2:free",
  "cohere/north-mini-code:free",
  "thinkingmachines/inkling:free",
  "openrouter/free",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model } = body;

    // Try user's model first, then fallbacks
    const modelsToTry = model
      ? [model, ...FALLBACK_MODELS.filter((m) => m !== model)]
      : FALLBACK_MODELS;

    const cleanMessages = (messages || [])
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content:
          typeof m.content === "string" && m.content.length > 0
            ? m.content
            : (m.parts || [])
                .filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join(""),
      }))
      .filter((m: any) => m.content && m.content.trim().length > 0);

    if (cleanMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const modelId of modelsToTry) {
      try {
        console.log(`Trying model: ${modelId}`);
        const result = streamText({
          model: openrouter(modelId),
          system:
            "You are Chuin AI, an AI software engineer. Be concise and technical.",
          messages: cleanMessages,
        });

        return result.toDataStreamResponse();
      } catch (err) {
        console.error(`Model ${modelId} failed:`, err);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ error: "All models unavailable. Try again." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API ERROR:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
