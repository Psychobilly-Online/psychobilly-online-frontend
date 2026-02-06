import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

/**
 * BFF API Route - Cities List
 * GET /api/cities?country_id={id}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query params from request
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Call backend API
    const data = await apiClient.cities.list(params);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Cities API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cities' },
      { status: error.status || 500 }
    );
  }
}
