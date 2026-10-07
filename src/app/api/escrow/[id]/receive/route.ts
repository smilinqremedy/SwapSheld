import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.confirmDeliveryStartInspection(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Escrow order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Device receipt confirmed. 48-hour testing countdown is active.',
      data: order
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error confirming delivery';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
