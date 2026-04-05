import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/backend_lib/prisma.js';
import { getSupabaseClient, getSupabaseConfigDiagnostics, hasSupabaseConfig } from '@/lib/backend_lib/supabase.js';
import * as fileService from '@/lib/services/file.service.js';
import { errorResponse } from '@/lib/utils/authHelper';

export async function POST(req: Request) {
  try {
    const adminAccessKey = req.headers.get('x-admin-access-key');
    const configuredAdminAccessKey = process.env.ADMIN_PANEL_ACCESS_KEY;

    if (!configuredAdminAccessKey) {
      return NextResponse.json(
        { error: 'Admin panel is not configured. Set ADMIN_PANEL_ACCESS_KEY.' },
        { status: 503 }
      );
    }

    if (!adminAccessKey || adminAccessKey !== configuredAdminAccessKey) {
      return NextResponse.json({ error: 'Invalid admin access key.' }, { status: 401 });
    }

    if (!hasSupabaseConfig()) {
      const diagnostics = getSupabaseConfigDiagnostics();
      return NextResponse.json(
        {
          error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
          diagnostics
        },
        { status: 503 }
      );
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      const diagnostics = getSupabaseConfigDiagnostics();
      return NextResponse.json(
        {
          error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
          diagnostics
        },
        { status: 503 }
      );
    }

    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'No admin account found. Create at least one ADMIN user first.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const tags = formData.get('tags') as string;
    const license = formData.get('license') as string;
    const rarity = formData.get('rarity') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from('mystery-bucket')
      .upload(`uploads/${filename}`, buffer, {
        contentType: file.type
      });

    if (uploadError) {
      if (String(uploadError.message || '').toLowerCase().includes('invalid compact jws')) {
        return NextResponse.json(
          {
            error: 'Invalid SUPABASE_SERVICE_ROLE_KEY. Use your Supabase service role key (not anon/public key).',
            diagnostics: getSupabaseConfigDiagnostics()
          },
          { status: 503 }
        );
      }

      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('mystery-bucket')
      .getPublicUrl(`uploads/${filename}`);

    const uploadedRecord = await fileService.createServerlessUpload({
      userId: adminUser.id,
      body: { title, description, categoryId, tags, license, rarity },
      fileMeta: {
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
        storagePath: publicUrlData.publicUrl,
        checksum
      }
    });

    return NextResponse.json({ data: uploadedRecord }, { status: 201 });
  } catch (error: any) {
    if (String(error?.message || '').includes("Can't reach database server")) {
      return NextResponse.json(
        { error: 'Database is not reachable. Fix DATABASE_URL before uploading from admin panel.' },
        { status: 503 }
      );
    }

    if (String(error?.message || '').toLowerCase().includes('invalid compact jws')) {
      return NextResponse.json(
        {
          error: 'Invalid SUPABASE_SERVICE_ROLE_KEY. Use your Supabase service role key (not anon/public key).',
          diagnostics: getSupabaseConfigDiagnostics()
        },
        { status: 503 }
      );
    }

    return errorResponse(error);
  }
}