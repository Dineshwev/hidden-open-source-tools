import { NextResponse } from 'next/server';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { getSupabaseClient, hasSupabaseConfig } from '@/lib/backend_lib/supabase.js';
import * as fileService from '@/lib/services/file.service.js';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { error: 'Upload storage is not configured on this server' },
        { status: 503 }
      );
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      return NextResponse.json(
        { error: 'Upload storage is not configured on this server' },
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

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Hash the file
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    // 2. Upload to Supabase Storage
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mystery-bucket')
      .upload(`uploads/${filename}`, buffer, {
         contentType: file.type,
      });
      
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // 3. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('mystery-bucket')
      .getPublicUrl(`uploads/${filename}`);

    const storagePath = publicUrlData.publicUrl;

    // 4. Pass the modified data into the local service
    const uploadedRecord = await fileService.createServerlessUpload({
      userId: user.userId,
      body: { title, description, categoryId, tags, license, rarity },
      fileMeta: {
         originalname: file.name,
         mimetype: file.type,
         size: file.size,
         storagePath,
         checksum
      }
    });

    return NextResponse.json({ data: uploadedRecord }, { status: 201 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
