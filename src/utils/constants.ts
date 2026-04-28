export const KEYCHAIN_CONFIG = {
  service: process.env.AAP_KEYCHAIN_SERVICE ?? 'aap-mcp',
  accounts: {
    token: process.env.AAP_KEYCHAIN_TOKEN_ACCOUNT ?? 'token',
    baseUrl: process.env.AAP_KEYCHAIN_BASE_URL_ACCOUNT ?? 'base_url',
    username: process.env.AAP_KEYCHAIN_USERNAME_ACCOUNT ?? 'username',
  },
};

export const CREDENTIAL_DEFAULTS = {
  username: 'admin',
};

export const ERROR_MESSAGES = {
  baseUrlRequired:
    'AAP_BASE_URL is required. Set via environment variable, macOS Keychain, or .env file. Run: npm run setup-keychain',
  tokenRequired:
    'AAP_TOKEN is required. Set via environment variable, macOS Keychain, or .env file. Run: npm run setup-keychain',
  failedToLoadCredentials: '[startup] ✗ Failed to load credentials:',
  failedToParseEnv: '[startup] ⚠ Failed to parse .env file:',
  failedInitializeDir: '[startup] ✗ Failed to initialize',
  failedMigrationConfig: '[startup] ✗ Failed to migrate config from',
};

export const STARTUP_MESSAGES = {
  createdDir: '[startup] ✓ Created',
  migratedEnv: '[startup] ⚠ Migrated .env.aap from repo root to',
  canDeleteOldFile: '[startup] ⚠ You can safely delete the old file at',
  connected: 'Connected to AAP at',
  serverStarted: 'AAP MCP server started',
  ensureDir: '[startup] Ensure the directory exists and is writable, or set AAP_',
  pleaseManuallyMove: '[startup] Please manually move the file or set AAP_ENV_FILE',
};

export const MCP_CONFIG = {
  name: 'aap-mcp',
  version: '1.0.0',
};

export const AAP_API_ENDPOINTS = {
  ping: '/api/v2/ping/',
};
