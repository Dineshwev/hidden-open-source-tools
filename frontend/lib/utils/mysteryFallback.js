const fallbackCatalog = [
  {
    id: 'fallback-creator-landing-ui-kit',
    title: 'Creator Landing UI Kit',
    description: 'High-converting landing page kit for creator brands.',
    tags: ['ui', 'landing', 'kit'],
    license: 'CC BY 4.0',
    storagePath: '/assets/uploads/creator-landing-ui-kit.zip',
    originalFileName: 'creator-landing-ui-kit.zip',
    mimeType: 'application/zip',
    rarity: 'COMMON',
    downloadCount: 0,
    category: { name: 'Seed Assets', slug: 'seed-assets' },
    uploader: { username: 'seed_admin' }
  },
  {
    id: 'fallback-advanced-dashboard-components',
    title: 'Advanced Dashboard Components',
    description: 'Reusable dashboard blocks with charts and KPI cards.',
    tags: ['dashboard', 'components', 'react'],
    license: 'MIT',
    storagePath: '/assets/uploads/advanced-dashboard-components.zip',
    originalFileName: 'advanced-dashboard-components.zip',
    mimeType: 'application/zip',
    rarity: 'RARE',
    downloadCount: 0,
    category: { name: 'Seed Assets', slug: 'seed-assets' },
    uploader: { username: 'seed_admin' }
  },
  {
    id: 'fallback-3d-hero-scene-bundle',
    title: '3D Hero Scene Bundle',
    description: 'Animated 3D hero scene assets for modern portfolios.',
    tags: ['3d', 'hero', 'webgl'],
    license: 'CC BY 4.0',
    storagePath: '/assets/uploads/3d-hero-scene-bundle.zip',
    originalFileName: '3d-hero-scene-bundle.zip',
    mimeType: 'application/zip',
    rarity: 'EPIC',
    downloadCount: 0,
    category: { name: 'Seed Assets', slug: 'seed-assets' },
    uploader: { username: 'seed_admin' }
  }
];

function cloneFallbackItem(item) {
  return {
    ...item,
    category: { ...item.category },
    uploader: { ...item.uploader }
  };
}

export function getFallbackApprovedFiles() {
  return fallbackCatalog.map(cloneFallbackItem);
}

export function pickFallbackMysteryFile(seenIds = []) {
  const remaining = fallbackCatalog.filter((item) => !seenIds.includes(item.id));
  const pool = remaining.length ? remaining : fallbackCatalog;
  const selected = pool[Math.floor(Math.random() * pool.length)] || fallbackCatalog[0];
  return cloneFallbackItem(selected);
}
