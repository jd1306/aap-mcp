import { Client, Page, Inventory, Host, Group } from '../client/index.js';
import { ToolRegistry } from './types.js';

export function registerInventoryTools(registry: ToolRegistry, c: Client) {
  registry.registerTool(
    {
      name: 'aap_list_inventories',
      description: '[READ-ONLY] List inventories with optional search and pagination.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search inventories by name or description',
          },
          page: {
            type: 'number',
            description: 'Page number (default: 1)',
          },
          page_size: {
            type: 'number',
            description: 'Results per page, max 200 (default: 25)',
          },
        },
        required: [],
      },
    },
    async (input) => {
      const params = new URLSearchParams();
      if (input.search) params.set('search', String(input.search));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Inventory>>('/api/v2/inventories/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_inventory',
      description: '[READ-ONLY] Get details for a specific inventory by ID, including host counts and group counts.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Inventory ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<Inventory>(`/api/v2/inventories/${id}/`);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_hosts',
      description: '[READ-ONLY] List hosts with optional filtering by inventory, enabled state, or search term.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search hosts by name or description',
          },
          inventory: {
            type: 'number',
            description: 'Filter by inventory ID',
          },
          enabled: {
            type: 'string',
            description: 'Filter by enabled state: true or false',
          },
          page: {
            type: 'number',
            description: 'Page number (default: 1)',
          },
          page_size: {
            type: 'number',
            description: 'Results per page, max 200 (default: 25)',
          },
        },
        required: [],
      },
    },
    async (input) => {
      const params = new URLSearchParams();
      if (input.search) params.set('search', String(input.search));
      if (input.inventory && Number(input.inventory) > 0) params.set('inventory', String(Number(input.inventory)));
      if (input.enabled) params.set('enabled', String(input.enabled));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Host>>('/api/v2/hosts/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_host',
      description: '[READ-ONLY] Get details for a specific host by ID, including variables and last job status.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Host ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<Host>(`/api/v2/hosts/${id}/`);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_host_facts',
      description: '[READ-ONLY] Get Ansible facts collected for a host from its most recent job run.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Host ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<Record<string, unknown>>(`/api/v2/hosts/${id}/ansible_facts/`);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_groups',
      description: '[READ-ONLY] List inventory groups with optional filtering by inventory or search term.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search groups by name or description',
          },
          inventory: {
            type: 'number',
            description: 'Filter by inventory ID',
          },
          page: {
            type: 'number',
            description: 'Page number (default: 1)',
          },
          page_size: {
            type: 'number',
            description: 'Results per page, max 200 (default: 25)',
          },
        },
        required: [],
      },
    },
    async (input) => {
      const params = new URLSearchParams();
      if (input.search) params.set('search', String(input.search));
      if (input.inventory && Number(input.inventory) > 0) params.set('inventory', String(Number(input.inventory)));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Group>>('/api/v2/groups/', params);
      return JSON.stringify(result, null, 2);
    }
  );
}
