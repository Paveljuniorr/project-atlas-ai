/**
 * Escapes HTML characters in strings to prevent stored/reflected XSS.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes object values recursively.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
