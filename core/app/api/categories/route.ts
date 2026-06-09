import { NextResponse } from 'next/server';
import * as categoryService from '@/lib/services/category.service.js';
import { errorResponse } from '@/lib/utils/authHelper';

export async function GET() {
  try {
    const data = await categoryService.getCategories();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
