import { Client, Page, WorkflowJobTemplate, WorkflowJob, LaunchRequirements, LaunchResponse, SurveyQuestion } from '../client/index.js';
import { ToolRegistry } from './types.js';

function formatSurveyQuestion(q: SurveyQuestion): string {
  let result = `  - variable: "${q.variable}" (type: ${q.type}, required: ${q.required})\n`;
  result += `    Question: "${q.question_name}"\n`;
  if (q.question_description) {
    result += `    Description: ${q.question_description}\n`;
  }
  if (q.default !== undefined && q.default !== null && q.default !== '') {
    result += `    Default: ${JSON.stringify(q.default)}\n`;
  }
  if (q.choices) {
    result += `    Choices: ${JSON.stringify(q.choices)}\n`;
  }
  if (q.min !== undefined || q.max !== undefined) {
    if (q.min !== undefined && q.max !== undefined) {
      result += `    Range: ${q.min} to ${q.max}\n`;
    } else if (q.min !== undefined) {
      result += `    Min: ${q.min}\n`;
    } else {
      result += `    Max: ${q.max}\n`;
    }
  }
  return result;
}

function formatWorkflowLaunchRequirements(id: number, reqs: LaunchRequirements): string {
  if (!reqs.survey_enabled && reqs.variables_needed_to_start?.length === 0 && !reqs.ask_inventory_on_launch) {
    return `Workflow template ${id} has no survey or additional requirements. Safe to call aap_launch_workflow directly.`;
  }

  let result = `Workflow template ${id} launch requirements:\n\n`;

  if (reqs.survey_enabled && reqs.survey_spec) {
    result += `SURVEY REQUIRED: "${reqs.survey_spec.name}"\n`;
    if (reqs.survey_spec.description) {
      result += `Description: ${reqs.survey_spec.description}\n`;
    }
    result += '\n';

    const required = reqs.survey_spec.spec.filter((q) => q.required);
    const optional = reqs.survey_spec.spec.filter((q) => !q.required);

    if (required.length > 0) {
      result += 'Required variables:\n';
      for (const q of required) {
        result += formatSurveyQuestion(q);
      }
    }
    if (optional.length > 0) {
      result += 'Optional variables:\n';
      for (const q of optional) {
        result += formatSurveyQuestion(q);
      }
    }
  }

  if (reqs.variables_needed_to_start?.length) {
    result += `Additional variables needed: ${reqs.variables_needed_to_start.join(', ')}\n`;
  }

  if (reqs.ask_inventory_on_launch) {
    result += 'INVENTORY REQUIRED: Supply an inventory ID via the inventory parameter.\n';
  }

  result += `\nTo launch, call aap_launch_workflow with id=${id} and provide extra_vars as a JSON string:\n`;
  result += '  extra_vars: \'{"variable_name": "value", ...}\'';

  return result;
}

export function registerWorkflowTools(registry: ToolRegistry, c: Client) {
  registry.registerTool(
    {
      name: 'aap_list_workflow_templates',
      description: '[READ-ONLY] List workflow job templates with optional search and pagination.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search workflow templates by name or description',
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

      const result = await c.get<Page<WorkflowJobTemplate>>('/api/v2/workflow_job_templates/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_workflow_template',
      description: '[READ-ONLY] Get details for a specific workflow job template by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Workflow job template ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<WorkflowJobTemplate>(`/api/v2/workflow_job_templates/${id}/`);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_check_workflow_launch_requirements',
      description:
        '[READ-ONLY] Check if a workflow job template requires a survey or additional parameters before launching. Always call this before aap_launch_workflow if you are unsure.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Workflow job template ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const reqs = await c.get<LaunchRequirements>(`/api/v2/workflow_job_templates/${id}/launch/`);
      return formatWorkflowLaunchRequirements(id, reqs);
    }
  );

  registry.registerTool(
    {
      name: 'aap_launch_workflow',
      description:
        '[DESTRUCTIVE] Launch a workflow job template. If the template has a survey, you MUST call aap_check_workflow_launch_requirements first to see required variables, then supply them via extra_vars.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Workflow job template ID',
          },
          extra_vars: {
            type: 'string',
            description: 'JSON string of extra variables. Required if template has a survey.',
          },
          inventory: {
            type: 'number',
            description: 'Override inventory ID (only if template allows it)',
          },
          limit: {
            type: 'string',
            description: 'Limit execution to specific hosts or groups',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const reqs = await c.get<LaunchRequirements>(`/api/v2/workflow_job_templates/${id}/launch/`);

      const extraVars = input.extra_vars ? String(input.extra_vars) : '';
      if (reqs.survey_enabled && !extraVars) {
        throw new Error(
          `Workflow template ${id} has a survey with required variables. ` +
            `Call aap_check_workflow_launch_requirements with id=${id} to see what variables are needed, ` +
            `then call aap_launch_workflow again with the extra_vars parameter populated.`
        );
      }

      const launchReq: Record<string, unknown> = {};
      if (extraVars) launchReq.extra_vars = extraVars;
      if (input.inventory) launchReq.inventory = Number(input.inventory);
      if (input.limit) launchReq.limit = String(input.limit);

      const result = await c.post<LaunchResponse>(`/api/v2/workflow_job_templates/${id}/launch/`, launchReq);
      return `Workflow launched successfully. Workflow job ID: ${result.job}. Use aap_get_workflow_job with id=${result.job} to monitor status.`;
    }
  );

  registry.registerTool(
    {
      name: 'aap_list_workflow_jobs',
      description: '[READ-ONLY] List workflow job runs with optional filtering by status or search term.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: pending, waiting, running, successful, failed, error, canceled',
          },
          search: {
            type: 'string',
            description: 'Search workflow jobs by name',
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

      const result = await c.get<Page<WorkflowJob>>('/api/v2/workflow_jobs/', params);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_get_workflow_job',
      description: '[READ-ONLY] Get details for a specific workflow job run by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Workflow job ID',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      const result = await c.get<WorkflowJob>(`/api/v2/workflow_jobs/${id}/`);
      return JSON.stringify(result, null, 2);
    }
  );

  registry.registerTool(
    {
      name: 'aap_cancel_workflow_job',
      description: '[DESTRUCTIVE] Cancel a running or pending workflow job.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Workflow job ID to cancel',
          },
        },
        required: ['id'],
      },
    },
    async (input) => {
      const id = Number(input.id);
      if (!id) throw new Error('id is required');

      await c.post(`/api/v2/workflow_jobs/${id}/cancel/`);
      return `Workflow job ${id} cancel request sent successfully.`;
    }
  );
}
