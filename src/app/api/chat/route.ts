import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export const maxDuration = 30;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("=== REQ ===", JSON.stringify(body));

    const messages = (body.messages || []).map((m: any) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : "",
    }));

    const result = await streamText({
      model: openrouter("openrouter/free"),
      system: "You are Chuin AI. Be helpful and concise.",
      messages,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error("=== STREAM ERROR ===", error);
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error) {
    console.error("=== API CATCH ===", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
