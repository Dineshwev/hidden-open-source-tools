export type MysteryAdOffer = {
  id: string;
  label: string;
  url: string;
  provider: 'direct';
};

const MAX_OFFERS = 6;
const MIN_WAIT_SECONDS = 5;
const MAX_WAIT_SECONDS = 30;

function parseCsv(rawValue?: string) {
  if (!rawValue) return [];

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getMysteryAdWaitSeconds() {
  const configured = Number(process.env.MYSTERY_AD_WAIT_SECONDS);

  if (!Number.isFinite(configured)) {
    return 6;
  }

  return Math.max(MIN_WAIT_SECONDS, Math.min(MAX_WAIT_SECONDS, Math.floor(configured)));
}

export async function getMysteryAdOffers(): Promise<MysteryAdOffer[]> {
  const offers: MysteryAdOffer[] = [];

  const directUrls = parseCsv(process.env.MYSTERY_AD_DIRECT_URLS);
  directUrls.forEach((url, index) => {
    if (!isHttpUrl(url)) return;

    offers.push({
      id: `direct-${index + 1}`,
      label: `Sponsor Offer ${index + 1}`,
      url,
      provider: 'direct'
    });
  });

  return offers.slice(0, MAX_OFFERS);
}
