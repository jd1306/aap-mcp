import { Client, Page, Credential, Organization, Instance, InstanceGroup, InventorySource, InventoryUpdate } from '../client/index.js';
import { ToolRegistry } from './types.js';

export function registerInfraTools(registry: ToolRegistry, c: Client) {
  registry.registerTool(
    {
      name: 'aap_list_credentials',
      description: '[READ-ONLY] List credentials by name and type. Secret values are never returned by AAP.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search credentials by name or description',
          },
          credential_type: {
            type: 'number',
            description: 'Filter by credential type ID',
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
      if (input.credential_type && Number(input.credential_type) > 0) params.set('credential_type', String(Number(input.credential_type)));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Credential>>('/api/v2/credentials/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_organizations',
      description: '[READ-ONLY] List organizations with optional search and pagination.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search organizations by name or description',
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

      const result = await c.get<Page<Organization>>('/api/v2/organizations/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_instances',
      description: '[READ-ONLY] List AAP cluster instances (control and execution nodes) with capacity and version info.',
      inputSchema: {
        type: 'object',
        properties: {
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
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Instance>>('/api/v2/instances/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_instance_groups',
      description: '[READ-ONLY] List instance groups showing capacity and whether they are container groups.',
      inputSchema: {
        type: 'object',
        properties: {
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
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<InstanceGroup>>('/api/v2/instance_groups/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_inventory_sources',
      description: '[READ-ONLY] List inventory sources (dynamic inventory configurations) with status and last update time.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search inventory sources by name',
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

      const result = await c.get<Page<InventorySource>>('/api/v2/inventory_sources/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_inventory_updates',
      description: '[READ-ONLY] List inventory update jobs (dynamic inventory syncs) with optional status filtering.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: pending, waiting, running, successful, failed, error, canceled',
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
      if (input.status) params.set('status', String(input.status));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<InventoryUpdate>>('/api/v2/inventory_updates/', params);
      return JSON.stringify(result, null, 2);
    }
  );
}
