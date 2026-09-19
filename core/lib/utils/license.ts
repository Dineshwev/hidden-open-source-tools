export const UNKNOWN_LICENSE_LABEL = 'See repository for license';

export function normalizeLicense(value: string | null | undefined): string | null {
  const normalized = value?.trim() || null;
  return !normalized || normalized.toUpperCase() === 'NOASSERTION' ? null : normalized;
}

export function formatLicense(value: string | null | undefined): string {
  return normalizeLicense(value) || UNKNOWN_LICENSE_LABEL;
}
