export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, PropertySchema>;
    required: string[];
  };
}

export interface PropertySchema {
  type: string;
  description?: string;
  default?: unknown;
}

export interface ToolHandler {
  (input: Record<string, unknown>): Promise<string>;
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  handlers: Map<string, ToolHandler>;
  registerTool(tool: Tool, handler: ToolHandler): void;
  getTool(name: string): Tool | undefined;
  getHandler(name: string): ToolHandler | undefined;
}

export class SimpleToolRegistry implements ToolRegistry {
  tools = new Map<string, Tool>();
  handlers = new Map<string, ToolHandler>();

  registerTool(tool: Tool, handler: ToolHandler) {
    this.tools.set(tool.name, tool);
    this.handlers.set(tool.name, handler);
  }

  getTool(name: string) {
    return this.tools.get(name);
  }

  getHandler(name: string) {
    return this.handlers.get(name);
  }

  listTools() {
    return Array.from(this.tools.values());
  }
}
