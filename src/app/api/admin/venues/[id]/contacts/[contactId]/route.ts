import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PUT /api/admin/venues/[id]/contacts/[contactId] - Update venue contact
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; contactId: string }> },
) {
  try {
    const { id, contactId } = await context.params;
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${API_URL}/venues/${id}/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating venue contact:', error);
    return NextResponse.json({ error: 'Failed to update venue contact' }, { status: 500 });
  }
}

// DELETE /api/admin/venues/[id]/contacts/[contactId] - Delete venue contact
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; contactId: string }> },
) {
  try {
    const { id, contactId } = await context.params;
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_URL}/venues/${id}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting venue contact:', error);
    return NextResponse.json({ error: 'Failed to delete venue contact' }, { status: 500 });
  }
}
