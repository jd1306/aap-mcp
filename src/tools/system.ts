import { Client, PingResponse, User } from '../client/index.js';
import { ToolRegistry } from './types.js';

export function registerSystemTools(registry: ToolRegistry, c: Client) {
  registry.registerTool(
    {
      name: 'aap_ping',
      description: '[READ-ONLY] Check AAP cluster health, version, and instance status.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    async () => {
      const result = await c.get<PingResponse>('/api/v2/ping/');
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_me',
      description: '[READ-ONLY] Get details about the currently authenticated AAP user.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    async () => {
      const result = await c.get<User>('/api/v2/me/');
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_dashboard',
      description: '[READ-ONLY] Get AAP dashboard summary: job counts, host counts, and recent activity.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    async () => {
      const result = await c.get<Record<string, unknown>>('/api/v2/dashboard/');
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_metrics',
      description:
        '[READ-ONLY] Get full Prometheus-format cluster metrics including capacity, job stats, and resource counts.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    async () => {
      return await c.getText('/api/v2/metrics/');
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_platform_metrics',
      description:
        '[READ-ONLY] Get level 0 platform metrics: capacity utilization, pending/running/successful/failed job counts, total hosts, total inventories, and instance group health. Lightweight health snapshot.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    async () => {
      const params = new URLSearchParams();
      params.set('level', '0');
      return await c.getText('/api/v2/metrics/', params);
    }
  );
}
