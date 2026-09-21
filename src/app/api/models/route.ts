import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
    image?: string;
  };
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status}`);
    }

    const data = await res.json();
    const models: OpenRouterModel[] = data.data || [];

    // Filter only truly free models (prompt AND completion = 0)
    const freeModels = models
      .filter((model) => {
        const prompt = parseFloat(model.pricing?.prompt || "1");
        const completion = parseFloat(model.pricing?.completion || "1");
        return prompt === 0 && completion === 0;
      })
      .map((model) => {
        // Extract provider from model ID (e.g., "meta-llama/llama-3.3-70b" → "meta-llama")
        const providerSlug = model.id.split("/")[0];

        // Get first letter for fallback icon
        const providerName = providerSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return {
          id: model.id,
          name: model.name || model.id,
          provider: providerName,
          providerSlug: providerSlug,
          description: model.description || "",
          contextLength: model.context_length || 0,
          logo: `https://openrouter.ai/images/icons/${providerSlug}.svg`,
        };
      })
      // Sort alphabetically by name
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      models: freeModels,
      count: freeModels.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models", models: [], count: 0 },
      { status: 500 }
    );
  }
}
