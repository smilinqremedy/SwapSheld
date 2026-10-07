import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = db.getListingById(id);

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error fetching listing';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
