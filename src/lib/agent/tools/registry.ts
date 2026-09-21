import type { ToolDefinition } from "./types";
import {
  filesystemReadTool,
  filesystemWriteTool,
  filesystemListTool,
} from "./filesystem";

/**
 * Central Tool Registry
 * All tools must be registered here to be available to agents.
 */
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getByPermission(level: string): ToolDefinition[] {
    return this.getAll().filter((t) => t.permissionLevel === level);
  }

  getForAgent(agentType: string): ToolDefinition[] {
    return this.getAll().filter((t) => t.agentAccess.includes(agentType));
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  size(): number {
    return this.tools.size;
  }
}

// Singleton registry
export const toolRegistry = new ToolRegistry();

// =====================
// REGISTER ALL TOOLS
// =====================

// Filesystem tools
toolRegistry.register(filesystemReadTool);
toolRegistry.register(filesystemWriteTool);
toolRegistry.register(filesystemListTool);

// Log registered tools on module load
if (process.env.NODE_ENV === "development") {
  console.log(
    `[ToolRegistry] Registered ${toolRegistry.size()} tools:`,
    toolRegistry.getAll().map((t) => t.name).join(", ")
  );
}

export default toolRegistry;
