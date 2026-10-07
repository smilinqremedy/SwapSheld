import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const hubs = db.getHubs();
    return NextResponse.json({ success: true, count: hubs.length, data: hubs });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error fetching hubs';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
