import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';

/**
 * BFF API Route - Events List
 * GET /api/events - List events with filters
 * GET /api/events?dates=true - Get all event dates for calendar highlighting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is a request for event dates
    if (searchParams.has('dates')) {
      const response = await fetch(`${API_BASE_URL}/events/dates`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Cache for 1 hour - event dates change with new events
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Transform to match frontend expectations
      return NextResponse.json({ success: true, data: data.data });
    }

    // Build query params from request for regular event list
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Call backend API
    const data = await apiClient.events.list(params);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Events API error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: error.status || 500 },
    );
  }
}
