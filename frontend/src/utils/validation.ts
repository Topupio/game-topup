export function isValidEmail(value: string): boolean {
  // Simple but practical email pattern for client-side checks
  return /.+@.+\..+/.test(value.trim());
}

export function hasMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
