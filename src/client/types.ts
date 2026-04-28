export interface Config {
  baseURL: string;
  token: string;
}

export interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  extra?: Record<string, string | number>;
}

export interface Page<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public body: string
  ) {
    super();
    if (statusCode === 401) {
      this.message = 'authentication failed — check AAP_TOKEN';
    } else {
      this.message = `AAP API error ${statusCode}: ${body}`;
    }
  }
}

// System
export interface PingInstance {
  node: string;
  node_type: string;
  uuid: string;
  heartbeat: string;
  capacity: number;
  version: string;
}

export interface PingInstGroup {
  name: string;
  capacity: number;
}

export interface PingResponse {
  active_node: string;
  ha_enabled: boolean;
  version: string;
  instances: PingInstance[];
  instance_groups: PingInstGroup[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
}

// Jobs
export interface SummaryField {
  id: number;
  name: string;
}

export interface JobSummary {
  job_template: SummaryField;
  inventory: SummaryField;
  project: SummaryField;
  created_by: SummaryField;
}

export interface Job {
  id: number;
  name: string;
  status: string;
  failed: boolean;
  started: string;
  finished: string;
  elapsed: number;
  job_type: string;
  launch_type: string;
  limit: string;
  extra_vars: string;
  execution_node: string;
  summary_fields: JobSummary;
}

// Templates
export interface JTSummary {
  inventory: SummaryField;
  project: SummaryField;
}

export interface JobTemplate {
  id: number;
  name: string;
  description: string;
  job_type: string;
  inventory: number;
  project: number;
  playbook: string;
  limit: string;
  extra_vars: string;
  job_tags: string;
  survey_enabled: boolean;
  summary_fields: JTSummary;
}

export interface SurveyQuestion {
  question_name: string;
  question_description: string;
  variable: string;
  type: string;
  required: boolean;
  default?: unknown;
  choices?: unknown;
  min?: number;
  max?: number;
}

export interface SurveySpec {
  name: string;
  description: string;
  spec: SurveyQuestion[];
}

export interface LaunchDefaults {
  extra_vars: string;
  inventory: SummaryField;
  limit: string;
}

export interface LaunchRequirements {
  passwords_needed_to_start: string[];
  variables_needed_to_start: string[];
  survey_enabled: boolean;
  ask_inventory_on_launch: boolean;
  ask_variables_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  survey_spec?: SurveySpec;
  defaults: LaunchDefaults;
}

export interface LaunchRequest {
  extra_vars?: string;
  inventory?: number;
  limit?: string;
  job_tags?: string;
  skip_tags?: string;
  job_type?: string;
}

export interface LaunchResponse {
  job?: number;
  workflow_job?: number;
}

// Workflows
export interface WorkflowJobTemplate {
  id: number;
  name: string;
  description: string;
  survey_enabled: boolean;
  inventory: number;
  limit: string;
  extra_vars: string;
}

export interface WorkflowJob {
  id: number;
  name: string;
  status: string;
  started: string;
  finished: string;
  elapsed: number;
  failed: boolean;
  extra_vars: string;
  limit: string;
}

// Inventory
export interface Inventory {
  id: number;
  name: string;
  description: string;
  kind: string;
  total_hosts: number;
  total_groups: number;
  hosts_with_active_failures: number;
  variables: string;
}

export interface Host {
  id: number;
  name: string;
  description: string;
  inventory: number;
  enabled: boolean;
  variables: string;
  has_active_failures: boolean;
  last_job?: number;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  inventory: number;
  variables: string;
}

export interface InventorySource {
  id: number;
  name: string;
  source: string;
  status: string;
  last_updated: string;
  inventory: number;
}

export interface InventoryUpdate {
  id: number;
  name: string;
  status: string;
  failed: boolean;
  started: string;
  finished: string;
  elapsed: number;
}

// Projects
export interface Project {
  id: number;
  name: string;
  description: string;
  scm_type: string;
  scm_url: string;
  scm_branch: string;
  status: string;
  last_updated: string;
}

// Infrastructure
export interface CredentialSummary {
  credential_type: SummaryField;
  organization: SummaryField;
}

export interface Credential {
  id: number;
  name: string;
  description: string;
  credential_type: number;
  summary_fields: CredentialSummary;
}

export interface Organization {
  id: number;
  name: string;
  description: string;
  max_hosts: number;
}

export interface Instance {
  id: number;
  hostname: string;
  node_type: string;
  version: string;
  capacity: number;
  consumed_capacity: number;
  percent_capacity_remaining: number;
  enabled: boolean;
  managed: boolean;
}

export interface InstanceGroup {
  id: number;
  name: string;
  capacity: number;
  is_container_group: boolean;
}
