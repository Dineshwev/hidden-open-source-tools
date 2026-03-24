const rarityWeights = {
  COMMON: 60,
  RARE: 25,
  EPIC: 10,
  LEGENDARY: 5
};

export function pickWeightedFile(files) {
  const totalWeight = files.reduce((sum, file) => sum + (rarityWeights[file.rarity] || 1), 0);
  let cursor = Math.random() * totalWeight;

  for (const file of files) {
    cursor -= rarityWeights[file.rarity] || 1;

    if (cursor <= 0) {
      return file;
    }
  }

  return files[0];
}
