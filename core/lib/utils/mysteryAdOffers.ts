import { getAdsterraSmartlinkUrls, getAdsterraWaitSeconds } from "@/lib/adsterra";

export type MysteryAdOffer = {
  id: string;
  label: string;
  url: string;
  provider: "adsterra-smartlink";
};

const MAX_OFFERS = 6;

export function getMysteryAdWaitSeconds() {
  return getAdsterraWaitSeconds();
}

export async function getMysteryAdOffers(): Promise<MysteryAdOffer[]> {
  const smartlinkUrls = getAdsterraSmartlinkUrls();

  return smartlinkUrls.slice(0, MAX_OFFERS).map((url, index) => ({
    id: `smartlink-${index + 1}`,
    label: `Adsterra Smartlink ${index + 1}`,
    url,
    provider: "adsterra-smartlink"
  }));
}
