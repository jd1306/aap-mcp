export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: `Invalid URL: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export function normalizeURL(url: string): string {
  return url.replace(/\/$/, '');
}

export function isValidToken(token: string): boolean {
  return token != null && token.trim().length > 0;
}

export function isValidUsername(username: string): boolean {
  return username != null && username.trim().length > 0;
}

export function validateNonEmpty(value: string, fieldName: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}

export function validatePositiveInteger(value: unknown, fieldName: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return num;
}

export function validateMaxValue(value: number, max: number, fieldName: string): number {
  if (value > max) {
    throw new Error(`${fieldName} must not exceed ${max}`);
  }
  return value;
}
