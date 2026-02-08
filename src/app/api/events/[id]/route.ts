import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

/**
 * BFF API Route - Single Event
 * GET /api/events/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const data = await apiClient.events.get(id);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Event API error:`, error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch event' },
      { status: error.status || 500 },
    );
  }
}
