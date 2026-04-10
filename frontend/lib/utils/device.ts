const MOBILE_USER_AGENT_PATTERN = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i;

export function isMobileUserAgent(userAgent?: string | null) {
  return Boolean(userAgent && MOBILE_USER_AGENT_PATTERN.test(userAgent));
}