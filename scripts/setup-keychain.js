#!/usr/bin/env node

import keytar from "keytar";
import fs from "fs";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");

const SERVICE = process.env.AAP_KEYCHAIN_SERVICE ?? "aap-mcp";
const TOKEN_ACCOUNT = process.env.AAP_KEYCHAIN_TOKEN_ACCOUNT ?? "token";
const BASE_URL_ACCOUNT = process.env.AAP_KEYCHAIN_BASE_URL_ACCOUNT ?? "base_url";
const USERNAME_ACCOUNT = process.env.AAP_KEYCHAIN_USERNAME_ACCOUNT ?? "username";
const PASSWORD_ACCOUNT = process.env.AAP_KEYCHAIN_PASSWORD_ACCOUNT ?? "password";
const CONFIG_DIR = process.env.AAP_CONFIG_DIR || path.join(APP_ROOT, ".config");
const ENV_FILE = process.env.AAP_ENV_FILE || path.join(CONFIG_DIR, ".env.aap");
const IS_MAC = process.platform === "darwin";

async function setupKeychain(credentials, baseUrl) {
  try {
    if (credentials.token) {
      await keytar.setPassword(SERVICE, TOKEN_ACCOUNT, credentials.token);
      console.log("✓ API token saved to macOS Keychain successfully!");
      console.log(`  Service: ${SERVICE}`);
      console.log(`  Account: ${TOKEN_ACCOUNT}`);
    }

    if (credentials.username) {
      await keytar.setPassword(SERVICE, USERNAME_ACCOUNT, credentials.username);
      console.log("✓ Username saved to macOS Keychain successfully!");
      console.log(`  Service: ${SERVICE}`);
      console.log(`  Account: ${USERNAME_ACCOUNT}`);
    }

    if (credentials.password) {
      await keytar.setPassword(SERVICE, PASSWORD_ACCOUNT, credentials.password);
      console.log("✓ Password saved to macOS Keychain successfully!");
      console.log(`  Service: ${SERVICE}`);
      console.log(`  Account: ${PASSWORD_ACCOUNT}`);
    }

    if (baseUrl) {
      await keytar.setPassword(SERVICE, BASE_URL_ACCOUNT, baseUrl);
      console.log("✓ Base URL saved to macOS Keychain successfully!");
      console.log(`  Service: ${SERVICE}`);
      console.log(`  Account: ${BASE_URL_ACCOUNT}`);
    }
    return true;
  } catch (error) {
    console.error(`✗ Error saving to macOS Keychain: ${error.message}`);
    return false;
  }
}

async function setupEnvFile(credentials, baseUrl) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    let envContent = "";
    if (credentials.token) {
      envContent += `AAP_TOKEN=${credentials.token}\n`;
    }
    if (credentials.username) {
      envContent += `AAP_USERNAME=${credentials.username}\n`;
    }
    if (credentials.password) {
      envContent += `AAP_PASSWORD=${credentials.password}\n`;
    }
    if (baseUrl) {
      envContent += `AAP_BASE_URL=${baseUrl}\n`;
    }
    fs.writeFileSync(ENV_FILE, envContent, { mode: 0o600 });
    console.log("✓ Credentials saved to .env file successfully!");
    console.log(`  File: ${ENV_FILE}`);
    console.log(`  Permissions: 0600 (readable only by owner)`);
    return true;
  } catch (error) {
    console.error(`✗ Error saving to .env file: ${error.message}`);
    return false;
  }
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY,
  });
}

async function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function passwordQuestion(rl, prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(prompt);

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let password = "";

    stdin.on("data", (char) => {
      const code = char[0];

      // Handle backspace
      if (code === 127) {
        password = password.slice(0, -1);
        stdout.write("\b \b");
      }
      // Handle enter/return
      else if (code === 13 || code === 10) {
        if (stdin.isTTY) {
          stdin.setRawMode(false);
        }
        stdin.removeAllListeners("data");
        stdout.write("\n");
        resolve(password);
      }
      // Ignore control characters
      else if (code < 32) {
        // Do nothing
      }
      // Regular character
      else {
        password += String.fromCharCode(code);
        stdout.write("*");
      }
    });
  });
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== AAP MCP Credentials Setup ===\n");
  console.log(`Platform: ${process.platform}`);
  console.log(`Available storage: ${IS_MAC ? "macOS Keychain, .env file, Environment Variables" : ".env file, Environment Variables"}\n`);

  const rl = createInterface();

  try {
    // Choose authentication method
    console.log("Choose authentication method:");
    console.log("1. API Token (recommended)");
    console.log("2. Username and Password");

    const authChoice = await question(rl, "\nSelect option (1 or 2) [1]: ");
    const authMethod = authChoice === "2" ? "password" : "token";

    const credentials = {};

    if (authMethod === "token") {
      // API Token authentication
      const token = await passwordQuestion(rl, "Enter your AAP API token: ");
      if (!token) {
        console.error("\n✗ API token cannot be empty");
        process.exit(1);
      }
      credentials.token = token.trim();
    } else {
      // Username and Password authentication
      const username = await question(rl, "Enter your AAP username: ");
      if (!username) {
        console.error("\n✗ Username cannot be empty");
        process.exit(1);
      }
      const password = await passwordQuestion(rl, "Enter your AAP password: ");
      if (!password) {
        console.error("\n✗ Password cannot be empty");
        process.exit(1);
      }
      credentials.username = username;
      credentials.password = password.trim();
    }

    // Get base URL (always required)
    const baseUrlInput = await question(
      rl,
      "\nEnter your AAP base URL [https://aap.example.com]: "
    );
    const baseUrl = (baseUrlInput || "https://aap.example.com").trim();

    if (!isValidUrl(baseUrl)) {
      console.error("\n✗ Invalid URL format");
      process.exit(1);
    }

    // Choose storage method
    const methods = IS_MAC
      ? [
          "macOS Keychain (secure, platform-specific)",
          ".env file (portable, plaintext)",
          "Environment Variables (no file storage)",
          "Keychain + .env file (both)",
        ]
      : [
          ".env file (portable, plaintext)",
          "Environment Variables (no file storage)",
        ];

    console.log("\nHow would you like to store credentials?");
    methods.forEach((method, index) => {
      console.log(`${index + 1}. ${method}`);
    });

    const methodChoice = await question(rl, `\nSelect option (1-${methods.length}) [1]: `);
    const choice = methodChoice ? parseInt(methodChoice) : 1;

    if (choice < 1 || choice > methods.length) {
      console.error("\n✗ Invalid selection");
      process.exit(1);
    }

    const methodMap = IS_MAC
      ? { 1: "keychain", 2: "env", 3: "none", 4: "both" }
      : { 1: "env", 2: "none" };
    const method = methodMap[choice];

    rl.close();

    let success = true;

    if (method === "keychain" || method === "both") {
      console.log("\nSetting up macOS Keychain...");
      success = (await setupKeychain(credentials, baseUrl)) && success;
    }

    if (method === "env" || method === "both") {
      console.log("\nSetting up .env file...");
      success = (await setupEnvFile(credentials, baseUrl)) && success;
    }

    if (method === "none") {
      console.log("\nNo file storage selected.");
      console.log("Please set environment variables before running the server:");
      if (credentials.token) {
        console.log("  export AAP_TOKEN='your-token'");
      } else {
        console.log("  export AAP_USERNAME='your-username'");
        console.log("  export AAP_PASSWORD='your-password'");
      }
      console.log("  export AAP_BASE_URL='your-base-url'");
    }

    if (success || method === "none") {
      console.log("\n✓ Setup complete!");
      console.log("\nYou can now run the AAP MCP server:");
      console.log("  npm start");
      console.log("\nEnvironment variables (optional customization):");
      if (IS_MAC && (method === "keychain" || method === "both")) {
        console.log(`  AAP_KEYCHAIN_SERVICE (default: ${SERVICE})`);
        console.log(`  AAP_KEYCHAIN_TOKEN_ACCOUNT (default: ${TOKEN_ACCOUNT})`);
        console.log(`  AAP_KEYCHAIN_USERNAME_ACCOUNT (default: ${USERNAME_ACCOUNT})`);
        console.log(`  AAP_KEYCHAIN_PASSWORD_ACCOUNT (default: ${PASSWORD_ACCOUNT})`);
        console.log(`  AAP_KEYCHAIN_BASE_URL_ACCOUNT (default: ${BASE_URL_ACCOUNT})`);
      }
      if (method === "env" || method === "both") {
        console.log(`  AAP_ENV_FILE (default: ${ENV_FILE})`);
      }
      process.exit(0);
    } else {
      console.error("\n✗ Setup failed. Please check the errors above.");
      process.exit(1);
    }
  } catch (error) {
    rl.close();
    console.error(`\n✗ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`✗ Fatal error: ${e.message}`);
  process.exit(1);
});
