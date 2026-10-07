import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DisputeReason } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { raised_by, dispute_reason, detailed_description, proof_media_urls } = body;

    if (!raised_by || !dispute_reason || !detailed_description) {
      return NextResponse.json(
        { success: false, error: 'raised_by, dispute_reason, and detailed_description are required.' },
        { status: 400 }
      );
    }

    const result = await db.fileEscrowDispute({
      orderId: id,
      raisedBy: raised_by,
      reason: dispute_reason as DisputeReason,
      description: detailed_description,
      proofMediaUrls: proof_media_urls || []
    });

    if (!result) {
      return NextResponse.json({ success: false, error: 'Escrow order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Escrow locked. 48-Hour timer frozen. Prepaid return waybill generated.',
      data: result
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error filing escrow dispute';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
