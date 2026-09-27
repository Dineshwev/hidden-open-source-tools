const SUSPICIOUS_CONTENT_PATTERN = /cookie|privacy policy|terms|sign up|login/i;

export function filterDisplayEntries(
  values: string[] | null | undefined,
  context: string,
): string[] {
  return (values ?? []).filter((value) => {
    const isValid = value.trim().length > 0 &&
      value.length <= 60 &&
      !SUSPICIOUS_CONTENT_PATTERN.test(value);

    if (!isValid) {
      console.warn(`[content-sanity] Removed ${context} value: ${JSON.stringify(value)}`);
    }

    return isValid;
  });
}
