const DEFAULT_WAIT_SECONDS = 6;

type BannerSize = "468x60" | "160x300" | "320x50" | "160x600" | "300x250";

const BANNER_SIZE_ENV_MAP: Record<BannerSize, string> = {
  "468x60": "NEXT_PUBLIC_ADSTERRA_BANNER_468X60_KEY",
  "160x300": "NEXT_PUBLIC_ADSTERRA_BANNER_160X300_KEY",
  "320x50": "NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY",
  "160x600": "NEXT_PUBLIC_ADSTERRA_BANNER_160X600_KEY",
  "300x250": "NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY"
};

function parseCsv(rawValue?: string) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getFirstHttpUrl(rawValue?: string) {
  return parseCsv(rawValue).find((value) => isHttpUrl(value)) ?? "";
}

export function getAdsterraVerificationCode() {
  return process.env.NEXT_PUBLIC_ADSTERRA_VERIFICATION_CODE?.trim() || "0BWqbyw168nW";
}

export function getAdsterraBannerKey() {
  return process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY?.trim() || "";
}

export function getAdsterraBannerScriptUrl() {
  return process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SCRIPT_URL?.trim() || "";
}

export function getAdsterraBannerKeyForSize(width?: number, height?: number) {
  if (!width || !height) {
    return getAdsterraBannerKey();
  }

  const size = `${width}x${height}` as BannerSize;
  const envName = BANNER_SIZE_ENV_MAP[size];

  if (!envName) {
    return getAdsterraBannerKey();
  }

  return process.env[envName]?.trim() || getAdsterraBannerKey();
}

export function getAdsterraBannerScriptUrlForSize(width?: number, height?: number) {
  const bannerKey = getAdsterraBannerKeyForSize(width, height);

  if (!bannerKey) {
    return getAdsterraBannerScriptUrl();
  }

  return `https://www.highperformanceformat.com/${bannerKey}/invoke.js`;
}

export function getAdsterraSmartlinkUrls() {
  return parseCsv(process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS).filter(isHttpUrl);
}

export function getAdsterraSmartlinkUrl() {
  return getFirstHttpUrl(process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS);
}

export function getAdsterraPopunderScriptUrl() {
  return process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SCRIPT_URL?.trim() || "";
}

export function getAdsterraPopunderSnippet() {
  return process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SNIPPET?.trim() || "";
}

export function getAdsterraSocialBarScriptUrl() {
  return process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SCRIPT_URL?.trim() || "";
}

export function getAdsterraSocialBarSnippet() {
  return process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SNIPPET?.trim() || "";
}

export function getAdsterraNativeBannerScriptUrl() {
  return process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_BANNER_SCRIPT_URL?.trim() || "";
}

export function getAdsterraWaitSeconds() {
  const configured = Number(process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS ?? DEFAULT_WAIT_SECONDS);

  if (!Number.isFinite(configured)) {
    return DEFAULT_WAIT_SECONDS;
  }

  return Math.max(5, Math.min(30, Math.floor(configured)));
}
