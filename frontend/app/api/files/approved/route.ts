import { NextResponse } from 'next/server';
import * as fileService from '@/lib/services/file.service.js';
import { errorResponse } from '@/lib/utils/authHelper';

export async function GET() {
  try {
    const data = await fileService.getApprovedFiles();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
