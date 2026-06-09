jest.mock("@/lib/adsterra", () => ({
  getAdsterraSmartlinkUrls: jest.fn(),
  getAdsterraWaitSeconds: jest.fn()
}));

import { getMysteryAdOffers, getMysteryAdWaitSeconds } from "@/lib/utils/mysteryAdOffers";
import { getAdsterraSmartlinkUrls, getAdsterraWaitSeconds } from "@/lib/adsterra";

const mockedGetUrls = getAdsterraSmartlinkUrls as jest.MockedFunction<typeof getAdsterraSmartlinkUrls>;
const mockedGetWait = getAdsterraWaitSeconds as jest.MockedFunction<typeof getAdsterraWaitSeconds>;

describe("getMysteryAdWaitSeconds", () => {
  it("delegates to getAdsterraWaitSeconds", () => {
    mockedGetWait.mockReturnValue(10);
    expect(getMysteryAdWaitSeconds()).toBe(10);
    expect(mockedGetWait).toHaveBeenCalled();
  });
});

describe("getMysteryAdOffers", () => {
  it("returns offers mapped from smartlink URLs", async () => {
    mockedGetUrls.mockReturnValue([
      "https://example.com/1",
      "https://example.com/2"
    ]);

    const offers = await getMysteryAdOffers();
    expect(offers).toHaveLength(2);
    expect(offers[0]).toEqual({
      id: "smartlink-1",
      label: "Adsterra Smartlink 1",
      url: "https://example.com/1",
      provider: "adsterra-smartlink"
    });
    expect(offers[1].id).toBe("smartlink-2");
  });

  it("caps at 6 offers max", async () => {
    mockedGetUrls.mockReturnValue(
      Array.from({ length: 10 }, (_, i) => `https://example.com/${i}`)
    );

    const offers = await getMysteryAdOffers();
    expect(offers).toHaveLength(6);
  });

  it("returns empty array when no URLs configured", async () => {
    mockedGetUrls.mockReturnValue([]);
    const offers = await getMysteryAdOffers();
    expect(offers).toEqual([]);
  });
});
