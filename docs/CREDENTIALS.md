# AAP MCP Credential Management

This MCP server uses a flexible, secure credential system with multiple storage options to make it portable and adaptable to different deployment scenarios.

## Credential Sources (Priority Order)

Credentials are loaded using a priority-based system that attempts sources in this order:

### For AAP Base URL:
1. **Environment Variable** (`AAP_BASE_URL`) - Highest priority
2. **macOS Keychain** - Secure platform-specific storage (macOS only)
3. **Error** - Required field, must be provided

### For Authentication (Token OR Username+Password):
Choose one authentication method:

**Option A: API Token**
1. **Environment Variable** (`AAP_TOKEN`) - Highest priority
2. **macOS Keychain** - Secure platform-specific storage (macOS only)
3. **.env File** - `~/.config/aap-mcp/.env.aap` (or `$AAP_ENV_FILE`)
4. **Error** - Required field, must be provided

**Option B: Username & Password**
1. **Username:**
   - Environment Variable (`AAP_USERNAME`) - Highest priority
   - macOS Keychain - Secure platform-specific storage (macOS only)
   - .env File - `~/.config/aap-mcp/.env.aap`
   - Error - Required field for password auth

2. **Password:**
   - Environment Variable (`AAP_PASSWORD`) - Highest priority
   - macOS Keychain - Secure platform-specific storage (macOS only)
   - .env File - `~/.config/aap-mcp/.env.aap`
   - Error - Required field for password auth

## Setup Methods

### Method 1: Interactive Setup (Recommended)

Run the interactive setup script to securely configure credentials:

```bash
npm run setup-keychain
```

This will:
1. Ask you to choose authentication method:
   - **Option 1:** API Token (recommended)
   - **Option 2:** Username and Password
2. Prompt for credentials with hidden password input
3. Prompt for AAP base URL
4. Offer storage options:
   - macOS Keychain (macOS only - secure, platform-specific)
   - .env file (portable, plaintext)
   - Environment Variables (no file storage)
   - Keychain + .env file (both methods on macOS)
5. Create necessary directories
6. Set proper file permissions (0o600 for .env files)

### Method 2: Environment Variables

#### Using API Token:
```bash
export AAP_BASE_URL="https://aap.example.com"
export AAP_TOKEN="your-api-token"

npm start
```

#### Using Username and Password:
```bash
export AAP_BASE_URL="https://aap.example.com"
export AAP_USERNAME="your-username"
export AAP_PASSWORD="your-password"

npm start
```

### Method 3: .env File

Create or edit `~/.config/aap-mcp/.env.aap`:

#### Using API Token:
```
AAP_BASE_URL=https://aap.example.com
AAP_TOKEN=your-api-token
```

#### Using Username and Password:
```
AAP_BASE_URL=https://aap.example.com
AAP_USERNAME=your-username
AAP_PASSWORD=your-password
```

File must have permissions `0o600` (readable only by owner).

### Method 4: macOS Keychain (macOS Only)

Store credentials securely in macOS Keychain using the interactive setup:

```bash
npm run setup-keychain
```

When prompted:
1. Choose your authentication method (API Token or Username/Password)
2. Enter credentials (password input is hidden)
3. Enter your AAP base URL
4. Select "macOS Keychain" or "Keychain + .env file" for storage

## Directory Structure

Credentials and configuration are stored in:

- **Config Directory**: `~/.config/aap-mcp/` (or `$AAP_CONFIG_DIR`)
  - Contains `.env.aap` file
- **Data Directory**: `~/.data/aap-mcp/` (or `$AAP_DATA_DIR`)
  - Contains logs and other runtime data

Old `.env.aap` files in the repository root are automatically migrated to the config directory on first run.

## Environment Variable Reference

### Credential Variables
- `AAP_BASE_URL` - AAP API base URL (e.g., https://aap.example.com) - **Required**
- **Authentication (choose one):**
  - `AAP_TOKEN` - AAP API authentication token (recommended)
  - `AAP_USERNAME` - AAP username (used with AAP_PASSWORD)
  - `AAP_PASSWORD` - AAP password (used with AAP_USERNAME)

### Configuration Variables
- `AAP_ENV_FILE` - Override path to .env file (default: `~/.config/aap-mcp/.env.aap`)
- `AAP_CONFIG_DIR` - Override config directory (default: `~/.config/aap-mcp`)
- `AAP_DATA_DIR` - Override data directory (default: `~/.data/aap-mcp`)

### Keychain Variables (macOS Only)
- `AAP_KEYCHAIN_SERVICE` - Keychain service name (default: `aap-mcp`)
- `AAP_KEYCHAIN_TOKEN_ACCOUNT` - Keychain account for API token (default: `token`)
- `AAP_KEYCHAIN_BASE_URL_ACCOUNT` - Keychain account for base URL (default: `base_url`)
- `AAP_KEYCHAIN_USERNAME_ACCOUNT` - Keychain account for username (default: `username`)
- `AAP_KEYCHAIN_PASSWORD_ACCOUNT` - Keychain account for password (default: `password`)

## Troubleshooting

### "AAP_BASE_URL is required"
Ensure one of these is set:
- Environment variable: `export AAP_BASE_URL=...`
- Keychain entry (macOS): Run `npm run setup-keychain`
- .env file: Create `~/.config/aap-mcp/.env.aap`

### "AAP_TOKEN is required" or "AAP_USERNAME and AAP_PASSWORD are required"
You need to provide authentication credentials. Choose one method:

**API Token (recommended):**
- Environment variable: `export AAP_TOKEN=...`
- Keychain entry (macOS): Run `npm run setup-keychain` and select API Token
- .env file: Add `AAP_TOKEN=...` to `~/.config/aap-mcp/.env.aap`

**Username & Password:**
- Environment variables: `export AAP_USERNAME=...` and `export AAP_PASSWORD=...`
- Keychain entry (macOS): Run `npm run setup-keychain` and select Username/Password
- .env file: Add `AAP_USERNAME=...` and `AAP_PASSWORD=...` to `~/.config/aap-mcp/.env.aap`

### Permission denied on config directory
Ensure the config directory is writable:
```bash
chmod 755 ~/.config/aap-mcp
```

Or override the directory location:
```bash
export AAP_CONFIG_DIR=/tmp/aap-config
npm start
```

## Security Considerations

1. **Never commit credentials** - `.env.aap` files should not be version controlled
2. **Use Keychain on macOS** - More secure than plaintext .env files
3. **File permissions** - .env files are created with `0o600` (owner-readable only)
4. **Environment variables** - Suitable for containerized deployments
5. **Token rotation** - Update tokens regularly and remove old ones from storage

## Migration from Old Setup

If you have an old `.env.aap` file in the repository root, it will be automatically migrated to `~/.config/aap-mcp/.env.aap` on first run. You can safely delete the old file afterward.
