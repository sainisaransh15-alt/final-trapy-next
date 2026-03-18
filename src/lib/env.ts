export const requiredEnv = (value: string | undefined, name: string) => {
  if (!value) {
    // In production, log error but don't crash - allows debugging
    console.error(`Missing environment variable: ${name}`);
    // Return empty string to prevent crash, app will show appropriate error
    return '';
  }
  return value;
};

export const optionalEnv = (value: string | undefined) => value;
