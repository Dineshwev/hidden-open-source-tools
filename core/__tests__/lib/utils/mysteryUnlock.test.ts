import crypto from "crypto";
import {
  generateMetadataIntegrityHash,
  passesIntegrityCheck,
  unlockMysteryAsset,
  type MysteryAsset,
  type Rarity,
  type UnlockInput
} from "@/lib/utils/mysteryUnlock";

function makeMockAsset(overrides: Partial<MysteryAsset> = {}): MysteryAsset {
  return {
    id: "asset-1",
    title: "Test Asset",
    description: "A test asset",
    rarity: "COMMON",
    storagePath: "/assets/test.png",
    originalFileName: "test.png",
    mimeType: "image/png",
    fileSize: 1024,
    checksum: "abc123",
    license: "MIT",
    tags: ["test", "demo"],
    ...overrides
  };
}

describe("generateMetadataIntegrityHash", () => {
  it("returns a 64-character hex string (sha256)", () => {
    const asset = makeMockAsset();
    const hash = generateMetadataIntegrityHash(asset);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces deterministic output for identical assets", () => {
    const asset = makeMockAsset();
    const h1 = generateMetadataIntegrityHash(asset);
    const h2 = generateMetadataIntegrityHash(asset);
    expect(h1).toBe(h2);
  });

  it("changes when asset data changes", () => {
    const a = makeMockAsset({ title: "Alpha" });
    const b = makeMockAsset({ title: "Beta" });
    expect(generateMetadataIntegrityHash(a)).not.toBe(generateMetadataIntegrityHash(b));
  });

  it("sorts tags before hashing", () => {
    const a = makeMockAsset({ tags: ["b", "a"] });
    const b = makeMockAsset({ tags: ["a", "b"] });
    expect(generateMetadataIntegrityHash(a)).toBe(generateMetadataIntegrityHash(b));
  });

  it("treats missing optional fields as null", () => {
    const a = makeMockAsset({ category: undefined, uploader: undefined });
    const b = makeMockAsset({ category: undefined, uploader: undefined });
    expect(generateMetadataIntegrityHash(a)).toBe(generateMetadataIntegrityHash(b));
  });
});

describe("passesIntegrityCheck", () => {
  it("returns true when expectedHash matches the generated hash", () => {
    const asset = makeMockAsset();
    const hash = generateMetadataIntegrityHash(asset);
    expect(passesIntegrityCheck(asset, hash)).toBe(true);
  });

  it("returns false when expectedHash does not match", () => {
    const asset = makeMockAsset();
    expect(passesIntegrityCheck(asset, "0".repeat(64))).toBe(false);
  });

  it("returns true when no expectedHash is provided (length-only check)", () => {
    const asset = makeMockAsset();
    expect(passesIntegrityCheck(asset)).toBe(true);
  });
});

describe("unlockMysteryAsset", () => {
  const commonAsset = makeMockAsset({ id: "c1", rarity: "COMMON" });
  const rareAsset = makeMockAsset({ id: "r1", rarity: "RARE" });

  it("throws when the asset list is empty", () => {
    expect(() => unlockMysteryAsset({ userXP: 100 }, [])).toThrow(
      "Cannot unlock a mystery asset from an empty asset list."
    );
  });

  it("throws when no assets are eligible", () => {
    const restrictedAsset = makeMockAsset({
      id: "restricted",
      rarity: "COMMON",
      minUserXP: 9999
    });
    expect(() => unlockMysteryAsset({ userXP: 0 }, [restrictedAsset])).toThrow(
      "No assets are eligible"
    );
  });

  it("returns an UnlockResult with asset, rarity, and integrityHash", () => {
    const result = unlockMysteryAsset({ userXP: 100 }, [commonAsset]);
    expect(result).toHaveProperty("asset");
    expect(result).toHaveProperty("rarity");
    expect(result).toHaveProperty("integrityHash");
    expect(result.asset.id).toBe("c1");
    expect(result.integrityHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("respects minUserXP filtering", () => {
    const highXpAsset = makeMockAsset({ id: "h1", rarity: "COMMON", minUserXP: 500 });
    const lowXpAsset = makeMockAsset({ id: "l1", rarity: "COMMON", minUserXP: 10 });

    const result = unlockMysteryAsset({ userXP: 50 }, [highXpAsset, lowXpAsset]);
    expect(result.asset.id).toBe("l1");
  });

  it("respects allowedKeyTypes filtering", () => {
    const eliteOnly = makeMockAsset({
      id: "e1",
      rarity: "COMMON",
      allowedKeyTypes: ["ELITE"]
    });
    const basicAsset = makeMockAsset({ id: "b1", rarity: "COMMON" });

    const result = unlockMysteryAsset({ keyType: "BASIC" }, [eliteOnly, basicAsset]);
    expect(result.asset.id).toBe("b1");
  });

  it("maps keyType PREMIUM to userXP 250", () => {
    const needsXp = makeMockAsset({ id: "x1", rarity: "COMMON", minUserXP: 200 });
    const result = unlockMysteryAsset({ keyType: "PREMIUM" }, [needsXp]);
    expect(result.asset.id).toBe("x1");
  });

  it("maps keyType BASIC to userXP 0", () => {
    const needsXp = makeMockAsset({ id: "x1", rarity: "COMMON", minUserXP: 100 });
    expect(() => unlockMysteryAsset({ keyType: "BASIC" }, [needsXp])).toThrow(
      "No assets are eligible"
    );
  });

  it("always returns an asset whose integrity check passes", () => {
    const assets = [commonAsset, rareAsset];
    for (let i = 0; i < 20; i++) {
      const result = unlockMysteryAsset({ userXP: 9999 }, assets);
      expect(passesIntegrityCheck(result.asset, result.integrityHash)).toBe(true);
    }
  });
});
