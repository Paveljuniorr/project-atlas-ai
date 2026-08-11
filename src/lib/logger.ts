const SENSITIVE_KEYS = [
  "password", "secret", "token", "key", "authorization",
  "cookie", "api_key", "service_role", "jwt"
];

function redactSensitiveData(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s));
    if (isSensitive) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      level: "INFO",
      timestamp: new Date().toISOString(),
      message,
      ...(context ? { context: redactSensitiveData(context) } : {})
    }));
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(JSON.stringify({
      level: "WARN",
      timestamp: new Date().toISOString(),
      message,
      ...(context ? { context: redactSensitiveData(context) } : {})
    }));
  },
  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || String(error),
      ...(context ? { context: redactSensitiveData(context) } : {})
    }));
  }
};
