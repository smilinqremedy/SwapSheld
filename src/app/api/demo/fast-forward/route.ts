import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSmsLogs } from '@/lib/termii';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, hours_ago } = body;

    const order = db.fastForwardInspectionTimer(order_id || 'ord_active_48h', hours_ago || 49);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Inspection window for order #${order.id} expired to 1 hour in the past for instant testing.`,
      order
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error fast-forwarding timer';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    sms_logs: getSmsLogs()
  });
}
