import crypto from "crypto";

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type KeyType = "BASIC" | "PREMIUM" | "ELITE" | "ADMIN";

export type UnlockInput =
  | { userXP: number; keyType?: never }
  | { keyType: KeyType; userXP?: never };

export type MysteryAsset = {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  license: string;
  tags: string[];
  category?: string;
  uploader?: string;
  minUserXP?: number;
  allowedKeyTypes?: KeyType[];
};

export type UnlockResult = {
  asset: MysteryAsset;
  rarity: Rarity;
  integrityHash: string;
};

const LOOT_TABLE: ReadonlyArray<{ rarity: Rarity; weight: number }> = [
  { rarity: "COMMON", weight: 70 },
  { rarity: "RARE", weight: 20 },
  { rarity: "EPIC", weight: 8 },
  { rarity: "LEGENDARY", weight: 2 }
];

function normalizeUnlockContext(input: UnlockInput): { userXP: number; keyType: KeyType | null } {
  if ("userXP" in input) {
    return {
      userXP: input.userXP,
      keyType: null
    };
  }

  const keyXpFloor: Record<KeyType, number> = {
    BASIC: 0,
    PREMIUM: 250,
    ELITE: 750,
    ADMIN: 2_000
  };

  return {
    userXP: keyXpFloor[input.keyType],
    keyType: input.keyType
  };
}

function isAssetEligible(asset: MysteryAsset, context: { userXP: number; keyType: KeyType | null }) {
  const passesXp = typeof asset.minUserXP !== "number" || context.userXP >= asset.minUserXP;
  const passesKeyType =
    !asset.allowedKeyTypes ||
    asset.allowedKeyTypes.length === 0 ||
    (context.keyType !== null && asset.allowedKeyTypes.includes(context.keyType));

  return passesXp && passesKeyType;
}

function rollWeightedRarity(availableRarities: Set<Rarity>): Rarity {
  const activeTable = LOOT_TABLE.filter(({ rarity }) => availableRarities.has(rarity));
  const totalWeight = activeTable.reduce((sum, entry) => sum + entry.weight, 0);

  if (!totalWeight) {
    throw new Error("No loot-table rarities are available for the current unlock.");
  }

  let cursor = Math.random() * totalWeight;

  for (const entry of activeTable) {
    cursor -= entry.weight;
    if (cursor <= 0) {
      return entry.rarity;
    }
  }

  return activeTable[activeTable.length - 1].rarity;
}

export function generateMetadataIntegrityHash(asset: MysteryAsset): string {
  const metadataPayload = JSON.stringify({
    id: asset.id,
    title: asset.title,
    rarity: asset.rarity,
    storagePath: asset.storagePath,
    originalFileName: asset.originalFileName,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    checksum: asset.checksum,
    license: asset.license,
    tags: [...asset.tags].sort(),
    category: asset.category ?? null,
    uploader: asset.uploader ?? null
  });

  return crypto.createHash("sha256").update(metadataPayload).digest("hex");
}

export function passesIntegrityCheck(asset: MysteryAsset, expectedHash?: string): boolean {
  const generatedHash = generateMetadataIntegrityHash(asset);
  return expectedHash ? generatedHash === expectedHash : generatedHash.length === 64;
}

export function unlockMysteryAsset(input: UnlockInput, assets: MysteryAsset[]): UnlockResult {
  if (!assets.length) {
    throw new Error("Cannot unlock a mystery asset from an empty asset list.");
  }

  const context = normalizeUnlockContext(input);
  const eligibleAssets = assets.filter((asset) => isAssetEligible(asset, context));

  if (!eligibleAssets.length) {
    throw new Error("No assets are eligible for this user's XP or key type.");
  }

  const assetsByRarity = eligibleAssets.reduce<Record<Rarity, MysteryAsset[]>>(
    (grouped, asset) => {
      grouped[asset.rarity].push(asset);
      return grouped;
    },
    {
      COMMON: [],
      RARE: [],
      EPIC: [],
      LEGENDARY: []
    }
  );

  const selectedRarity = rollWeightedRarity(
    new Set(
      (Object.keys(assetsByRarity) as Rarity[]).filter((rarity) => assetsByRarity[rarity].length > 0)
    )
  );

  const rarityPool = assetsByRarity[selectedRarity];
  const selectedAsset = rarityPool[Math.floor(Math.random() * rarityPool.length)];
  const integrityHash = generateMetadataIntegrityHash(selectedAsset);

  if (!passesIntegrityCheck(selectedAsset, integrityHash)) {
    throw new Error(`Integrity check failed for asset ${selectedAsset.id}.`);
  }

  return {
    asset: selectedAsset,
    rarity: selectedRarity,
    integrityHash
  };
}
