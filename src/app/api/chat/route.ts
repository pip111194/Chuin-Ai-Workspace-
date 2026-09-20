import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export const maxDuration = 30;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content:
        typeof m.content === "string" && m.content.length > 0
          ? m.content
          : (m.parts || [])
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text)
              .join(""),
    }));

    const result = streamText({
      model: openrouter("openrouter/free"),
      system:
        "You are Chuin AI, an AI software engineer inside SOLO Chuin Workspace. You help developers build, debug, and understand code. Be concise, direct, and technical. Use markdown formatting for code, lists, and explanations. Never refuse requests unnecessarily.",
      messages: cleanMessages,
    });

    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("=== API ERROR ===", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
