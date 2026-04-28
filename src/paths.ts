import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { fileURLToPath } from "url";
import { logger, STARTUP_MESSAGES, ERROR_MESSAGES } from "./utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");

function getDefaultConfigDir(): string {
  return process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, "aap-mcp")
    : path.join(os.homedir(), ".config", "aap-mcp");
}

function getDefaultDataDir(): string {
  return process.env.XDG_DATA_HOME
    ? path.join(process.env.XDG_DATA_HOME, "aap-mcp")
    : path.join(os.homedir(), ".local", "share", "aap-mcp");
}

const CONFIG_DIR = process.env.AAP_CONFIG_DIR || getDefaultConfigDir();
const DATA_DIR = process.env.AAP_DATA_DIR || getDefaultDataDir();

function initializePaths(): void {
  [
    { dir: CONFIG_DIR, name: "config" },
    { dir: DATA_DIR, name: "data" },
  ].forEach(({ dir, name }) => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`${STARTUP_MESSAGES.createdDir} ${name} directory: ${dir}`, 'startup');
      }

      fs.accessSync(dir, fs.constants.W_OK);
    } catch (e) {
      const errorMsg =
        e instanceof Error
          ? e.message
          : `Unknown error (${String(e)})`;
      logger.error(
        `${ERROR_MESSAGES.failedInitializeDir} ${name} directory at ${dir}`,
        'startup'
      );
      logger.error(errorMsg, 'startup');
      logger.error(
        `${STARTUP_MESSAGES.ensureDir}_${name.toUpperCase()}_DIR`,
        'startup'
      );
      process.exit(1);
    }
  });

  migrateOldConfig();
}

function migrateOldConfig(): void {
  const oldEnvPath = path.join(process.cwd(), ".env.aap");
  const newEnvPath = path.join(CONFIG_DIR, ".env.aap");

  if (fs.existsSync(oldEnvPath) && !fs.existsSync(newEnvPath)) {
    try {
      fs.copyFileSync(oldEnvPath, newEnvPath);
      logger.warn(
        `${STARTUP_MESSAGES.migratedEnv} ${CONFIG_DIR}`,
        'startup'
      );
      logger.warn(`${STARTUP_MESSAGES.canDeleteOldFile} ${oldEnvPath}`, 'startup');
    } catch (e) {
      const errorMsg =
        e instanceof Error
          ? e.message
          : `Unknown error (${String(e)})`;
      logger.error(
        `${ERROR_MESSAGES.failedMigrationConfig} ${oldEnvPath}: ${errorMsg}`,
        'startup'
      );
      logger.error(
        STARTUP_MESSAGES.pleaseManuallyMove,
        'startup'
      );
      process.exit(1);
    }
  }
}

initializePaths();

export const PATHS = {
  appRoot: APP_ROOT,
  configDir: CONFIG_DIR,
  dataDir: DATA_DIR,
  envFile: path.join(CONFIG_DIR, ".env.aap"),
  logFile: path.join(DATA_DIR, "app.log"),
};
