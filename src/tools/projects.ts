import { Client, Page, Project } from '../client/index.js';
import { ToolRegistry } from './types.js';

export function registerProjectTools(registry: ToolRegistry, c: Client) {
  registry.registerTool(
    {
      name: 'aap_list_projects',
      description: '[READ-ONLY] List projects (Git repositories synced to AAP) with optional filtering by status or search term.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search projects by name or description',
          },
          status: {
            type: 'string',
            description: 'Filter by sync status: never updated, ok, failed, missing, running',
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
      if (input.status) params.set('status', String(input.status));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Project>>('/api/v2/projects/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_project',
      description: '[READ-ONLY] Get details for a specific project by ID, including SCM URL, branch, and last sync status.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Project ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<Project>(`/api/v2/projects/${id}/`);
      return JSON.stringify(result, null, 2);
    }
  );
}
