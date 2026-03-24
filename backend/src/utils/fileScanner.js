export async function simulateMalwareScan(file) {
  const blockedExtensions = [".exe", ".bat", ".cmd", ".scr"];
  const lowerName = file.originalname.toLowerCase();
  const suspicious = blockedExtensions.some((extension) => lowerName.endsWith(extension));

  return {
    safe: !suspicious,
    engine: "simulated-malware-scan"
  };
}
