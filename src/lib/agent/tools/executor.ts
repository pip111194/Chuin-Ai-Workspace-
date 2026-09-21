import { prisma } from "@/lib/prisma";
import { toolRegistry } from "./registry";
import type { ToolContext, ToolResult } from "./types";

/**
 * Execute a tool by name with given input.
 * - Validates input against the tool's Zod schema
 * - Records the tool call in the database
 * - Enforces timeout
 * - Returns structured result
 */
export async function executeTool(
  toolName: string,
  rawInput: unknown,
  context: ToolContext
): Promise<ToolResult> {
  const startTime = Date.now();

  // 1. Lookup tool
  const tool = toolRegistry.get(toolName);
  if (!tool) {
    return {
      success: false,
      error: `Tool not found: ${toolName}`,
      durationMs: Date.now() - startTime,
    };
  }

  // 2. Validate input
  let parsedInput: any;
  try {
    parsedInput = tool.inputSchema.parse(rawInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Invalid input for ${toolName}: ${message}`,
      durationMs: Date.now() - startTime,
    };
  }

  // 3. Record tool call as PENDING in DB (if stepId provided)
  let toolCallId: string | null = null;
  if (context.stepId) {
    try {
      const record = await prisma.toolCall.create({
        data: {
          stepId: context.stepId,
          toolName,
          input: parsedInput as any,
          status: "PENDING",
        },
      });
      toolCallId = record.id;
    } catch (err) {
      console.error("Failed to record tool call:", err);
    }
  }

  // 4. Execute with timeout
  let output: any = null;
  let error: string | null = null;
  let success = false;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Tool timed out after ${tool.timeout}ms`)),
        tool.timeout
      )
    );

    output = await Promise.race([
      tool.execute(parsedInput, context),
      timeoutPromise,
    ]);

    // 5. Validate output
    try {
      output = tool.outputSchema.parse(output);
    } catch (err) {
      console.warn(`Tool ${toolName} output schema mismatch:`, err);
    }

    success = true;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    success = false;
  }

  const durationMs = Date.now() - startTime;

  // 6. Update tool call record
  if (toolCallId) {
    try {
      await prisma.toolCall.update({
        where: { id: toolCallId },
        data: {
          status: success ? "SUCCESS" : "FAILED",
          output: output as any,
          error: error,
          durationMs,
          completedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("Failed to update tool call record:", err);
    }
  }

  return {
    success,
    output: success ? output : undefined,
    error: error || undefined,
    durationMs,
  };
}

/**
 * Get OpenAI-compatible tool definitions for the given agent type.
 * These are the tools the LLM will see and can choose from.
 */
export function getToolsForLLM(agentType: string = "general") {
  const tools = toolRegistry.getForAgent(agentType);

  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name.replace(/\./g, "_"), // OpenAI doesn't allow dots
      description: tool.description,
      parameters: zodToJsonSchema(tool.inputSchema),
    },
  }));
}

/**
 * Simple Zod → JSON Schema converter (basic types only).
 * For production, use zod-to-json-schema package.
 */
function zodToJsonSchema(schema: any): any {
  // Zod 3 introspection
  const def = schema._def;
  const typeName = def?.typeName;

  if (typeName === "ZodObject") {
    const shape = def.shape();
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      const isOptional =
        (value as any)._def?.typeName === "ZodOptional" ||
        (value as any).isOptional?.();
      if (!isOptional) required.push(key);
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (typeName === "ZodString") return { type: "string" };
  if (typeName === "ZodNumber") return { type: "number" };
  if (typeName === "ZodBoolean") return { type: "boolean" };
  if (typeName === "ZodArray") {
    return {
      type: "array",
      items: zodToJsonSchema(def.type),
    };
  }
  if (typeName === "ZodOptional") return zodToJsonSchema(def.innerType);
  if (typeName === "ZodDefault") return zodToJsonSchema(def.innerType);
  if (typeName === "ZodEnum") return { type: "string", enum: def.values };

  return { type: "string" };
}
