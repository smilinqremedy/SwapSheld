import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = db.getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Escrow order not found' }, { status: 404 });
    }

    const timeline = db.getTimelineEvents(order.id);

    // Calculate countdown remaining seconds if in DELIVERED_TESTING_PERIOD
    let remainingSeconds = 0;
    let isExpired = false;

    if (order.escrow_status === 'DELIVERED_TESTING_PERIOD' && order.inspection_window_expires_at) {
      const diffMs = new Date(order.inspection_window_expires_at).getTime() - Date.now();
      remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
      isExpired = remainingSeconds === 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        order,
        timeline,
        countdown: {
          remaining_seconds: remainingSeconds,
          is_expired: isExpired,
          expires_at: order.inspection_window_expires_at
        }
      }
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error fetching escrow order';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
