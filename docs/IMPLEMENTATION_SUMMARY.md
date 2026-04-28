# AAP MCP Authentication Restructure - Implementation Summary

## Overview

The aap-mcp server has been restructured to implement a portable, credential-management system. All hard-coded defaults, especially the hard-coded AAP domain (`https://aap.example.com`), have been removed to make the server truly portable and configurable across different environments and deployments.

## Files Created

### 1. `src/paths.ts` (86 lines)
- Manages configuration and data directories
- Dynamically resolves app root using `import.meta.url` (compatible with symlinks)
- Creates directories on startup with error handling
- Supports environment variable overrides:
  - `AAP_CONFIG_DIR` (default: `~/.config/aap-mcp`)
  - `AAP_DATA_DIR` (default: `~/.data/aap-mcp`)
- Auto-migrates old `.env.aap` files from repo root to config directory
- Validates directory writability on startup

### 2. `src/credentials.ts` (160+ lines)
- Implements priority-based credential loading:
  - **AAP_BASE_URL**: Environment var → Keychain (macOS) → Error
  - **AAP_TOKEN**: Environment var → Keychain (macOS) → .env file → Error
  - **AAP_USERNAME**: Environment var → Keychain (macOS) → .env file → Default ("admin")
- Dynamic keytar import for optional Keychain support (gracefully handles non-macOS)
- Parses .env files with proper error handling
- Exports `initializeCredentials()` function that orchestrates loading

### 3. `scripts/setup-keychain.js` (240+ lines)
- Interactive CLI for credential configuration
- **Authentication method selection:**
  - Option 1: API Token (recommended)
  - Option 2: Username and Password
- **Hidden password input** with character masking and backspace support
- Platform-aware: Offers Keychain option on macOS, .env-only on other platforms
- Validates URLs before accepting
- Creates config directory if needed
- Sets proper file permissions (0o600) for .env files
- **Storage method selection:**
  - macOS Keychain (macOS only)
  - .env file
  - Environment Variables (no file storage)
  - Keychain + .env file (both on macOS)
- Provides clear guidance on environment variable customizations

### 4. `CREDENTIALS.md`
- Comprehensive documentation of credential system
- Usage instructions for all four setup methods
- Environment variable reference
- Troubleshooting guide
- Security considerations

### 5. `.gitignore`
- Protects sensitive configuration and data directories
- Excludes .env files, .config, and .data directories
- Standard Node.js ignore patterns

## Files Modified

### `package.json`
- Added `dotenv` and `keytar` dependencies
- Added `setup-keychain` npm script: `npm run setup-keychain`

### `src/index.ts`
- Removed hard-coded default URL (`https://aap.example.com`)
- Removed `getEnv()` helper function (no longer needed)
- Added import of `./paths.js` (initializes directories on module load)
- Added import and use of `initializeCredentials()` from credentials module
- Refactored `main()` to be async and load credentials before creating client

## Authentication Methods

The setup script now supports two authentication approaches:

1. **API Token (Recommended)**
   - Single credential (AAP_TOKEN)
   - Easier to revoke and rotate
   - Better for automated deployments
   - Supports fine-grained permissions in AAP

2. **Username & Password**
   - Traditional authentication method
   - Useful for systems that don't use tokens
   - Both credentials stored securely (Keychain or .env file)
   - Password input is hidden during interactive setup

## Key Architectural Patterns

### Priority-Based Credential Loading
Implements a priority-based credential loading chain for both API token and username/password authentication:

**For AAP_BASE_URL:**
1. Environment variables first (highest priority)
2. macOS Keychain (if available)
3. Fail with clear error message

**For Authentication (Token OR Username+Password):**
1. Environment variables first (highest priority)
2. macOS Keychain (if available)
3. .env file
4. Use defaults or fail with clear error message

Users can choose their preferred authentication method during setup:
- **API Token** (recommended): Single credential, easier to revoke
- **Username & Password**: Traditional auth method, useful for non-token-based systems

### Dynamic Module Loading
Keytar is loaded dynamically to avoid hard dependency:
```typescript
const module = await import("keytar" as string);
```
This allows the server to run on non-macOS systems without keytar errors.

### Directory Management
- Automatic directory creation with validation
- Environment variable overrides for all paths
- Migration of legacy configuration files
- Proper error messages if directories are not writable

## Backward Compatibility

- Old `.env.aap` files in repository root are automatically migrated to `~/.config/aap-mcp/.env.aap`
- Users can still use environment variables (highest priority, compatible with CI/CD)
- No breaking changes to the API or tool interfaces

## Migration Path for Users

### For Development
```bash
npm run setup-keychain
# or set environment variables:
export AAP_BASE_URL="https://your-aap.example.com"
export AAP_TOKEN="your-token"
npm start
```

### For CI/CD
```bash
export AAP_BASE_URL="https://your-aap.example.com"
export AAP_TOKEN="your-token"
npm start
```

### For macOS Deployment
```bash
npm run setup-keychain
npm start
```

## Build Status

✅ TypeScript compilation: **PASS**
✅ All dependencies installed: **PASS**
✅ Build artifacts generated: **PASS**

## Testing Recommendations

1. **Interactive Setup - Authentication Methods**:
   ```bash
   npm run setup-keychain
   # Test option 1: API Token
   # Test option 2: Username and Password
   # Verify password input is hidden
   ```

2. **Interactive Setup - Storage Methods**:
   ```bash
   npm run setup-keychain
   # Test all storage options:
   # - macOS Keychain (on macOS)
   # - .env file
   # - Environment Variables
   # - Keychain + .env (on macOS)
   ```

3. **Credential Loading - API Token**:
   ```bash
   export AAP_TOKEN="test-token"
   export AAP_BASE_URL="https://test.example.com"
   npm start  # should load from env vars
   
   unset AAP_TOKEN
   npm start  # should load from Keychain or .env file
   ```

4. **Credential Loading - Username & Password**:
   ```bash
   export AAP_USERNAME="testuser"
   export AAP_PASSWORD="testpass"
   export AAP_BASE_URL="https://test.example.com"
   npm start  # should load username/password from env vars
   ```

5. **Error Handling**:
   ```bash
   # Test missing base URL
   unset AAP_BASE_URL
   npm start  # should fail with clear error message
   
   # Test missing authentication (neither token nor username/password)
   unset AAP_TOKEN
   unset AAP_USERNAME
   unset AAP_PASSWORD
   npm start  # should fail with clear error message
   ```

6. **Directory Creation**:
   ```bash
   rm -rf ~/.config/aap-mcp ~/.data/aap-mcp
   npm start  # should create directories
   ```

## Environment Variables Reference

### Required Credentials
- `AAP_BASE_URL` - API base URL (e.g., https://aap.example.com)
- **Authentication (choose one):**
  - `AAP_TOKEN` - API authentication token (recommended)
  - `AAP_USERNAME` and `AAP_PASSWORD` - Username and password authentication

### Optional
- None (all credential fields are either required or have sensible defaults)

### Configuration Overrides
- `AAP_CONFIG_DIR` - Config directory path
- `AAP_DATA_DIR` - Data directory path
- `AAP_ENV_FILE` - Override .env file location

### Keychain Customization (macOS)
- `AAP_KEYCHAIN_SERVICE` - Keychain service name (default: aap-mcp)
- `AAP_KEYCHAIN_TOKEN_ACCOUNT` - Account name for API token (default: token)
- `AAP_KEYCHAIN_BASE_URL_ACCOUNT` - Account name for base URL (default: base_url)
- `AAP_KEYCHAIN_USERNAME_ACCOUNT` - Account name for username (default: username)
- `AAP_KEYCHAIN_PASSWORD_ACCOUNT` - Account name for password (default: password)

## Next Steps

1. Run `npm install` (already done if you followed the setup)
2. Run `npm run setup-keychain` to configure credentials
3. Run `npm start` to start the server
4. Update documentation/README to reference new credential system
5. Test with different AAP instances to verify portability
