import { NextResponse } from 'next/server';
import { listBanks } from '@/lib/paystack';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    const banks = await listBanks();

    return NextResponse.json(
      {
        success: true,
        count: banks.length,
        data: banks
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
        }
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve Nigerian banks';
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}
