import { NextResponse } from 'next/server';
import { prisma } from '@/lib/backend_lib/prisma.js';

type SeedFile = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  license: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
};

const seedFiles: SeedFile[] = [
  {
    title: 'Creator Landing UI Kit',
    slug: 'creator-landing-ui-kit',
    description: 'High-converting landing page kit for creator brands.',
    tags: ['ui', 'landing', 'kit'],
    license: 'CC BY 4.0',
    originalFileName: 'creator-landing-ui-kit.zip',
    mimeType: 'application/zip',
    fileSize: 1843200,
    rarity: 'COMMON'
  },
  {
    title: 'Advanced Dashboard Components',
    slug: 'advanced-dashboard-components',
    description: 'Reusable dashboard blocks with charts and KPI cards.',
    tags: ['dashboard', 'components', 'react'],
    license: 'MIT',
    originalFileName: 'advanced-dashboard-components.zip',
    mimeType: 'application/zip',
    fileSize: 2621440,
    rarity: 'RARE'
  },
  {
    title: '3D Hero Scene Bundle',
    slug: '3d-hero-scene-bundle',
    description: 'Animated 3D hero scene assets for modern portfolios.',
    tags: ['3d', 'hero', 'webgl'],
    license: 'CC BY 4.0',
    originalFileName: '3d-hero-scene-bundle.zip',
    mimeType: 'application/zip',
    fileSize: 3670016,
    rarity: 'EPIC'
  }
];

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: 'seed-admin@local.dev' },
      update: {},
      create: {
        username: 'seed_admin',
        email: 'seed-admin@local.dev',
        passwordHash: 'seed-local-only',
        role: 'ADMIN'
      }
    });

    const category = await prisma.category.upsert({
      where: { slug: 'seed-assets' },
      update: {},
      create: {
        name: 'Seed Assets',
        slug: 'seed-assets',
        description: 'Local development seed files for mystery unlock flow.'
      }
    });

    const created = [] as string[];

    for (const item of seedFiles) {
      const file = await prisma.file.upsert({
        where: { slug: item.slug },
        update: {
          status: 'APPROVED'
        },
        create: {
          uploaderId: user.id,
          categoryId: category.id,
          title: item.title,
          slug: item.slug,
          description: item.description,
          tags: item.tags,
          license: item.license,
          storagePath: `/assets/uploads/${item.originalFileName}`,
          originalFileName: item.originalFileName,
          mimeType: item.mimeType,
          checksum: `seed-${item.slug}`,
          fileSize: item.fileSize,
          status: 'APPROVED',
          rarity: item.rarity,
          isFeatured: true
        }
      });

      created.push(file.id);
    }

    return NextResponse.json(
      {
        data: {
          seededCount: created.length,
          category: category.slug
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to seed approved files' },
      { status: 500 }
    );
  }
}