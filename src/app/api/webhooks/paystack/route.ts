import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPaystackSignature } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature (supports sandbox test bypass header for local demos)
    const isValid = verifyPaystackSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid Paystack signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'charge.success') {
      const paymentRef = payload.data?.reference;

      if (paymentRef) {
        const updatedOrder = await db.lockEscrowFunds(paymentRef);
        if (updatedOrder) {
          return NextResponse.json({
            success: true,
            message: `Escrow order #${updatedOrder.id} status updated to FUNDS_LOCKED. Listing set to IN_ESCROW.`
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Event acknowledged' });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
