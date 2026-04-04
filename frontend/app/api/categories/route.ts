import { NextResponse } from 'next/server';
import * as categoryService from '@/lib/services/category.service.js';
import { errorResponse } from '@/lib/utils/authHelper';

export async function GET() {
  try {
    const data = await categoryService.getAllCategories();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
