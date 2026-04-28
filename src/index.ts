import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import './paths.js';
import { logger } from './utils/index.js';
import { MCP_CONFIG, STARTUP_MESSAGES } from './utils/index.js';
import { Client } from './client/index.js';
import { SimpleToolRegistry } from './tools/types.js';
import { registerSystemTools } from './tools/system.js';
import { registerJobTools } from './tools/jobs.js';
import { registerTemplateTools } from './tools/templates.js';
import { registerWorkflowTools } from './tools/workflows.js';
import { registerInventoryTools } from './tools/inventory.js';
import { registerProjectTools } from './tools/projects.js';
import { registerInfraTools } from './tools/infra.js';
import { initializeCredentials } from './credentials.js';

async function main() {
  const { baseURL, token } = await initializeCredentials();

  const config = {
    baseURL,
    token,
  };

  const client = new Client(config);

  try {
    await client.get('/api/v2/ping/', new URLSearchParams());
    logger.info(`${STARTUP_MESSAGES.connected} ${config.baseURL}`, 'startup');
  } catch (err) {
    logger.warn(`AAP connectivity check failed: ${err instanceof Error ? err.message : String(err)}`, 'startup');
  }

  const registry = new SimpleToolRegistry();

  registerSystemTools(registry, client);
  registerJobTools(registry, client);
  registerTemplateTools(registry, client);
  registerWorkflowTools(registry, client);
  registerInventoryTools(registry, client);
  registerProjectTools(registry, client);
  registerInfraTools(registry, client);

  const server = new Server(
    {
      name: MCP_CONFIG.name,
      version: MCP_CONFIG.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: registry.listTools(),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const toolInput = request.params.arguments || {};

    const handler = registry.getHandler(toolName);
    if (!handler) {
      return {
        content: [
          {
            type: 'text',
            text: `Tool ${toolName} not found`,
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await handler(toolInput);
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info(STARTUP_MESSAGES.serverStarted, 'startup');
}

main().catch((error) => {
  logger.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`, 'startup');
  process.exit(1);
});
