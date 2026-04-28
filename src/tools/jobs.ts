import { Client, Page, Job, LaunchResponse } from '../client/index.js';
import { ToolRegistry } from './types.js';

const STDOUT_MAX_CHARS = 100_000;

export function registerJobTools(registry: ToolRegistry, c: Client) {
  registry.registerTool(
    {
      name: 'aap_list_jobs',
      description: '[READ-ONLY] List automation jobs with optional filtering by status or search term.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by job status: pending, waiting, running, successful, failed, error, canceled',
          },
          search: {
            type: 'string',
            description: 'Search jobs by name or related fields',
          },
          order_by: {
            type: 'string',
            description: 'Sort field, prefix with - for descending (e.g. -created, name). Default: -created',
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
      params.set('order_by', String(input.order_by || '-created'));
      if (input.page) params.set('page', String(Math.max(1, Number(input.page))));
      if (input.page_size) params.set('page_size', String(Math.min(200, Number(input.page_size) || 25)));

      const result = await c.get<Page<Job>>('/api/v2/jobs/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_job',
      description: '[READ-ONLY] Get details for a specific job by ID, including status, timing, and summary fields.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Job ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<Job>(`/api/v2/jobs/${id}/`);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_job_stdout',
      description:
        '[READ-ONLY] Get the stdout/log output of a job. Works for both in-progress and completed jobs. Output is truncated at 100,000 characters.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Job ID',
          },
          format: {
            type: 'string',
            description:
              'Output format: txt (default, ANSI-stripped), ansi (with color codes), json (structured events)',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const params = new URLSearchParams();
      params.set('format', String(input.format || 'txt'));

      let text = await c.getText(`/api/v2/jobs/${id}/stdout/`, params);
      if (text.length > STDOUT_MAX_CHARS) {
        text =
          text.slice(0, STDOUT_MAX_CHARS) +
          `\n\n[OUTPUT TRUNCATED — returned first ${STDOUT_MAX_CHARS} of ${text.length} total characters. Check the AAP UI for full output.]`;
      }
      return text;
    }
  );

  registry.registerTool(
    {
      name: 'aap_cancel_job',
      description: '[DESTRUCTIVE] Cancel a running or pending job.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Job ID to cancel',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      await c.post(`/api/v2/jobs/${id}/cancel/`);
      return `Job ${id} cancel request sent successfully.`;
    }
  );

  registry.registerTool(
    {
      name: 'aap_relaunch_job',
      description: '[DESTRUCTIVE] Relaunch a completed or failed job using the same parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Job ID to relaunch',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.post<LaunchResponse>(`/api/v2/jobs/${id}/relaunch/`, {});
      return `Job relaunched successfully. New job ID: ${result.job}. Use aap_get_job with id=${result.job} to monitor status.`;
    }
  );
}
