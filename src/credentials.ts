import * as fs from 'fs';
import { PATHS } from './paths.js';
import {
  KEYCHAIN_CONFIG,
  CREDENTIAL_DEFAULTS,
  ERROR_MESSAGES,
  validateURL,
  normalizeURL,
  isValidToken,
  isValidUsername,
  logger,
} from './utils/index.js';

interface Keytar {
  getPassword(service: string, account: string): Promise<string | null>;
}

let keytar: Keytar | null = null;
let envFileInitialized = false;
let cachedEnvFile: Record<string, string> = {};

async function loadKeytar(): Promise<Keytar | null> {
  if (keytar) return keytar;
  if (process.platform !== 'darwin') return null;
  try {
    const module = await import('keytar' as string);
    keytar = (module.default || module) as Keytar;
    return keytar;
  } catch {
    return null;
  }
}

function initializeEnvFile(): void {
  if (envFileInitialized) return;
  envFileInitialized = true;

  const envPath = process.env.AAP_ENV_FILE || PATHS.envFile;
  if (!fs.existsSync(envPath)) {
    return;
  }

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const parsed: Record<string, string> = {};
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          parsed[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    cachedEnvFile = parsed;
  } catch (e) {
    logger.warn(
      `Failed to parse .env file: ${e instanceof Error ? e.message : String(e)}`,
      'startup'
    );
  }
}

function parseEnvFile(): Record<string, string> {
  if (!envFileInitialized) {
    initializeEnvFile();
  }
  return cachedEnvFile;
}

interface CredentialChainConfig {
  envVar: string;
  keychainAccount: string;
  errorMessage: string;
  validator?: (value: string) => boolean;
  transform?: (value: string) => string;
  defaultValue?: string;
}

const CREDENTIAL_CONFIGS: Record<string, CredentialChainConfig> = {
  baseURL: {
    envVar: 'AAP_BASE_URL',
    keychainAccount: KEYCHAIN_CONFIG.accounts.baseUrl,
    errorMessage: ERROR_MESSAGES.baseUrlRequired,
    validator: (url) => {
      const result = validateURL(url);
      if (!result.valid) {
        throw new Error(result.error);
      }
      return true;
    },
    transform: normalizeURL,
  },
  token: {
    envVar: 'AAP_TOKEN',
    keychainAccount: KEYCHAIN_CONFIG.accounts.token,
    errorMessage: ERROR_MESSAGES.tokenRequired,
    validator: isValidToken,
  },
  username: {
    envVar: 'AAP_USERNAME',
    keychainAccount: KEYCHAIN_CONFIG.accounts.username,
    errorMessage: 'Username configuration failed',
    validator: isValidUsername,
    defaultValue: CREDENTIAL_DEFAULTS.username,
  },
};

async function loadFromChain(config: CredentialChainConfig): Promise<string> {
  const { envVar, keychainAccount, errorMessage, validator, transform, defaultValue } = config;

  // Environment variable takes priority
  if (process.env[envVar]) {
    const value = process.env[envVar]!;
    if (validator && !validator(value)) {
      throw new Error(`${envVar} validation failed`);
    }
    return transform ? transform(value) : value;
  }

  // Try Keychain on macOS
  const kt = await loadKeytar();
  if (kt) {
    try {
      const value = await kt.getPassword(KEYCHAIN_CONFIG.service, keychainAccount);
      if (value) {
        if (validator && !validator(value)) {
          throw new Error(`${keychainAccount} validation failed`);
        }
        return transform ? transform(value) : value;
      }
    } catch {
      // Keychain lookup failed, continue to .env file
    }
  }

  // Try .env file
  const envVars = parseEnvFile();
  if (envVars[envVar]) {
    const value = envVars[envVar];
    if (validator && !validator(value)) {
      throw new Error(`${envVar} validation failed in .env file`);
    }
    return transform ? transform(value) : value;
  }

  // Use default or error
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(errorMessage);
}

export async function loadBaseUrl(): Promise<string> {
  return loadFromChain(CREDENTIAL_CONFIGS.baseURL);
}

export async function loadToken(): Promise<string> {
  return loadFromChain(CREDENTIAL_CONFIGS.token);
}

export async function loadUsername(): Promise<string> {
  return loadFromChain(CREDENTIAL_CONFIGS.username);
}

export async function initializeCredentials() {
  try {
    initializeEnvFile();
    const baseURL = await loadBaseUrl();
    const token = await loadToken();
    const username = await loadUsername();

    return { baseURL, token, username };
  } catch (error) {
    logger.error(
      `Failed to load credentials: ${error instanceof Error ? error.message : String(error)}`,
      'startup'
    );
    process.exit(1);
  }
}
