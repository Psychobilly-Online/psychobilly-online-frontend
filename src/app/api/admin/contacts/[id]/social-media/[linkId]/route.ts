import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PATCH /api/admin/contacts/[id]/social-media/[linkId] - Update social media link
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { id, linkId } = await context.params;
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${API_URL}/contacts/${id}/social-media/${linkId}`, {
      method: 'PATCH',
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
    console.error('Error updating social media link:', error);
    return NextResponse.json(
      { error: 'Failed to update social media link' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/[id]/social-media/[linkId] - Delete social media link
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { id, linkId } = await context.params;
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_URL}/contacts/${id}/social-media/${linkId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social media link:', error);
    return NextResponse.json(
      { error: 'Failed to delete social media link' },
      { status: 500 }
    );
  }
}
