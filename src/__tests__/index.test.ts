import { describe, it, expect } from 'vitest';
import { SimpleToolRegistry } from '../tools/types.js';
import { registerSystemTools } from '../tools/system.js';
import { registerJobTools } from '../tools/jobs.js';
import { registerTemplateTools } from '../tools/templates.js';
import { registerWorkflowTools } from '../tools/workflows.js';
import { registerInventoryTools } from '../tools/inventory.js';
import { registerProjectTools } from '../tools/projects.js';
import { registerInfraTools } from '../tools/infra.js';
import { Client } from '../client/index.js';

describe('Tool Registry', () => {
  const registry = new SimpleToolRegistry();
  const mockClient = new Client({
    baseURL: 'https://test.example.com',
    token: 'test-token',
  });

  it('should register all tool suites', () => {
    registerSystemTools(registry, mockClient);
    registerJobTools(registry, mockClient);
    registerTemplateTools(registry, mockClient);
    registerWorkflowTools(registry, mockClient);
    registerInventoryTools(registry, mockClient);
    registerProjectTools(registry, mockClient);
    registerInfraTools(registry, mockClient);

    const tools = registry.listTools();
    expect(tools.length).toBe(35); // Total tools
  });

  it('should have system tools', () => {
    const registry = new SimpleToolRegistry();
    registerSystemTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_ping')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_me')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_dashboard')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_metrics')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_platform_metrics')).toBe(true);
  });

  it('should have job tools', () => {
    const registry = new SimpleToolRegistry();
    registerJobTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_list_jobs')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_job')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_job_stdout')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_cancel_job')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_relaunch_job')).toBe(true);
  });

  it('should have template tools', () => {
    const registry = new SimpleToolRegistry();
    registerTemplateTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_list_job_templates')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_job_template')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_check_launch_requirements')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_launch_job')).toBe(true);
  });

  it('should have workflow tools', () => {
    const registry = new SimpleToolRegistry();
    registerWorkflowTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_list_workflow_templates')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_workflow_template')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_check_workflow_launch_requirements')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_launch_workflow')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_workflow_jobs')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_workflow_job')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_cancel_workflow_job')).toBe(true);
  });

  it('should have inventory tools', () => {
    const registry = new SimpleToolRegistry();
    registerInventoryTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_list_inventories')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_inventory')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_hosts')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_host')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_host_facts')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_groups')).toBe(true);
  });

  it('should have infrastructure tools', () => {
    const registry = new SimpleToolRegistry();
    registerInfraTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_list_credentials')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_organizations')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_instances')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_instance_groups')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_inventory_sources')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_list_inventory_updates')).toBe(true);
  });

  it('should have project tools', () => {
    const registry = new SimpleToolRegistry();
    registerProjectTools(registry, mockClient);
    const tools = registry.listTools();

    expect(tools.some((t) => t.name === 'aap_list_projects')).toBe(true);
    expect(tools.some((t) => t.name === 'aap_get_project')).toBe(true);
  });

  it('should retrieve handlers for tools', () => {
    const registry = new SimpleToolRegistry();
    registerSystemTools(registry, mockClient);

    const handler = registry.getHandler('aap_ping');
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');
  });

  it('should return undefined for non-existent tools', () => {
    const registry = new SimpleToolRegistry();
    const handler = registry.getHandler('non_existent_tool');
    expect(handler).toBeUndefined();
  });
});
