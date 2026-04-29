# AAP MCP Server

A Model Context Protocol (MCP) server for Ansible Automation Platform (AAP) 2.4. Provides tools for managing jobs, templates, workflows, inventory, and infrastructure through Claude or other MCP clients.

## Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm or yarn
- Access to an AAP instance

### Installation

```bash
git clone <repo-url>
cd aap-mcp
npm install
```

### Configuration

#### Option 1: Interactive Setup
```bash
npm run setup-keychain
```

This interactive setup guides you through:
- Choosing authentication method (API token or username/password)
- Entering credentials (with hidden password input)
- Selecting storage method (macOS Keychain, .env file, or environment variables)

```bash
Note: Interactive should be all you need to get started unless you care to follow one of the other paths
```

#### Option 2: Environment Variables (Recommended for CI/CD)
```bash
export AAP_BASE_URL="https://aap.example.com"
export AAP_TOKEN="your-api-token"
```

#### Option 3: .env File (For Development Only)
Create `~/.config/aap-mcp/.env.aap`:
```
AAP_BASE_URL=https://aap.example.com
AAP_TOKEN=your-api-token
AAP_USERNAME=admin
```

Then:
```bash
npm start
```

## Configuration

### Required Environment Variables
- `AAP_BASE_URL` - AAP instance URL (e.g., `https://aap.example.com`)
- **One of the following:**
  - `AAP_TOKEN` - API authentication token, OR
  - `AAP_USERNAME` and `AAP_PASSWORD` - Username and password authentication

### Optional Environment Variables
- `AAP_CONFIG_DIR` - Configuration directory (default: `~/.config/aap-mcp`)
- `AAP_DATA_DIR` - Data directory (default: `~/.data/aap-mcp`)

### Keychain Customization (macOS)
- `AAP_KEYCHAIN_SERVICE` - Service name (default: `aap-mcp`)
- `AAP_KEYCHAIN_TOKEN_ACCOUNT` - Token account name (default: `token`)
- `AAP_KEYCHAIN_BASE_URL_ACCOUNT` - URL account name (default: `base_url`)
- `AAP_KEYCHAIN_USERNAME_ACCOUNT` - Username account name (default: `username`)
- `AAP_KEYCHAIN_PASSWORD_ACCOUNT` - Password account name (default: `password`)

## Development

### Build
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

### Testing
```bash
npm test
npm run test:ui
```

### Linting
```bash
npm run lint
```

## Architecture

### Core Components

- **Client** (`src/client/`): HTTP client for AAP API communication
- **Tools** (`src/tools/`): MCP tool implementations organized by domain
  - `system.ts` - System health and metrics
  - `jobs.ts` - Job execution and monitoring
  - `templates.ts` - Job and workflow templates
  - `workflows.ts` - Workflow management
  - `inventory.ts` - Inventory and host management
  - `projects.ts` - Project management
  - `infra.ts` - Infrastructure tools
- **Credentials** (`src/credentials.ts`): Secure credential management with priority-based loading
- **Paths** (`src/paths.ts`): Configuration and data directory management

### Credential Loading Priority
1. Environment variables (highest priority)
2. macOS Keychain (if available)
3. `.env` file
4. Default or error (lowest priority)

## Tools Reference

### System Tools
- **get_system_info** - Retrieve AAP system information
- **get_platform_metrics** - Get platform capacity and job statistics

### Job Tools
- **list_jobs** - List automation jobs with filtering
- **get_job** - Get job details
- **run_job** - Launch a job template
- **get_job_output** - Retrieve job execution logs

### Template Tools
- **list_job_templates** - List available job templates
- **list_workflow_templates** - List workflow job templates

### Workflow Tools
- **list_workflow_jobs** - List workflow executions
- **get_workflow_job** - Get workflow execution details

### Inventory Tools
- **list_hosts** - List inventory hosts
- **list_groups** - List inventory groups

### Project Tools
- **list_projects** - List projects
- **get_project** - Get project details

### Infrastructure Tools
- **list_nodes** - List control and execution nodes
- **get_node_details** - Get node information

## Troubleshooting

### "AAP_BASE_URL is required"
Credentials not found. Run:
```bash
npm run setup-keychain
```
Or set environment variables:
```bash
export AAP_BASE_URL="https://aap.example.com"
export AAP_TOKEN="your-token"
```

### "Failed to initialize config directory"
Ensure the config directory path is writable, or specify a custom path:
```bash
export AAP_CONFIG_DIR="/path/to/config"
npm start
```

### "Connection check failed"
Verify AAP instance is accessible:
```bash
curl https://aap.example.com/api/v2/ping/
```

## License

See [LICENSE](LICENSE) file.

## Documentation

- [Credentials Setup](docs/CREDENTIALS.md) - Detailed credential management guide
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) - Architecture and design decisions
- [Structure Assessment](docs/STRUCTURE_ASSESSMENT.md) - Project structure analysis and recommendations

## Support

For issues and feature requests, please open a GitHub issue.
