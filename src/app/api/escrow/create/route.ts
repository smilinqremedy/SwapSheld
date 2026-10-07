import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initializePaystackTransaction } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_type,
      buyer_id,
      seller_id,
      listing_id,
      swap_proposal_id,
      delivery_mode,
      hub_id,
      cash_amount
    } = body;

    if (!buyer_id || !seller_id || !listing_id || !order_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required order parameters.' },
        { status: 400 }
      );
    }

    const buyer = db.getUserById(buyer_id);
    if (!buyer) {
      return NextResponse.json({ success: false, error: 'Buyer not found' }, { status: 404 });
    }

    const principalAmount = Number(cash_amount || 0);
    const platformFee = Math.round(principalAmount * 0.05); // 5% fee
    const inspectionFee = 3500;
    const shippingFee = delivery_mode === 'HUB_VERIFICATION' ? 2500 : 4000;
    const totalToPay = principalAmount + platformFee + inspectionFee + shippingFee;

    const paymentRef = `PSK_${order_type === 'DEVICE_SWAP' ? 'SWAP' : 'BUY'}_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Initialize Paystack checkout
    const paystackRes = await initializePaystackTransaction({
      email: buyer.email,
      amountInNaira: totalToPay,
      reference: paymentRef,
      callbackUrl: `/checkout/callback?reference=${paymentRef}`,
      metadata: {
        buyer_id,
        seller_id,
        listing_id,
        order_type,
        hub_id
      }
    });

    // Create Escrow Order record
    const order = db.createOrder({
      order_type,
      buyer_id,
      seller_id,
      listing_id,
      swap_proposal_id: swap_proposal_id || undefined,
      delivery_mode: delivery_mode || 'DIRECT_COURIER',
      hub_id: hub_id || undefined,
      total_escrow_amount: principalAmount,
      platform_fee: platformFee,
      inspection_fee: inspectionFee,
      shipping_fee: shippingFee,
      payment_reference: paymentRef,
      paystack_access_code: paystackRes.data.access_code,
      escrow_status: 'AWAITING_PAYMENT'
    });

    return NextResponse.json({
      success: true,
      order,
      paystack: {
        authorization_url: paystackRes.data.authorization_url,
        access_code: paystackRes.data.access_code,
        reference: paymentRef,
        total_amount_naira: totalToPay
      }
    }, { status: 201 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to create escrow order';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
