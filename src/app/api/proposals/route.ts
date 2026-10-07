import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listing_id') || undefined;
    const proposals = db.getProposals(listingId);
    return NextResponse.json({ success: true, count: proposals.length, data: proposals });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error fetching proposals';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, proposer_id, offered_device_id, proposed_cash_topup, proposer_note } = body;

    if (!listing_id || !proposer_id || !offered_device_id) {
      return NextResponse.json(
        { success: false, error: 'listing_id, proposer_id, and offered_device_id are required' },
        { status: 400 }
      );
    }

    const proposal = db.createProposal({
      listing_id,
      proposer_id,
      offered_device_id,
      proposed_cash_topup: Number(proposed_cash_topup || 0),
      proposer_note
    });

    return NextResponse.json({ success: true, data: proposal }, { status: 201 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error creating proposal';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
