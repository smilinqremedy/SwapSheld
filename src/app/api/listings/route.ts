import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GadgetCategory } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as GadgetCategory | undefined;
    const brand = searchParams.get('brand') || undefined;
    const isSwapEligibleParam = searchParams.get('is_swap_eligible');
    const search = searchParams.get('search') || undefined;

    const is_swap_eligible = isSwapEligibleParam !== null ? isSwapEligibleParam === 'true' : undefined;

    const listings = db.getListings({
      category: category || undefined,
      brand,
      is_swap_eligible,
      search
    });

    return NextResponse.json({ success: true, count: listings.length, data: listings });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to fetch listings';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Required fields check
    const required = [
      'seller_id',
      'category',
      'brand',
      'model',
      'storage_capacity',
      'color',
      'battery_health_percentage',
      'screen_status',
      'face_id_or_biometrics',
      'icloud_or_mdm_status',
      'physical_condition',
      'cash_price'
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Auto-generate serial hash if raw provided
    const imeiHash = body.imei_or_serial_hash ||
      `hash_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const newListing = db.createListing({
      seller_id: body.seller_id,
      category: body.category,
      brand: body.brand,
      model: body.model,
      storage_capacity: body.storage_capacity,
      ram: body.ram,
      color: body.color,
      imei_or_serial_hash: imeiHash,
      battery_health_percentage: Number(body.battery_health_percentage),
      battery_cycle_count: body.battery_cycle_count ? Number(body.battery_cycle_count) : undefined,
      screen_status: body.screen_status,
      face_id_or_biometrics: body.face_id_or_biometrics,
      icloud_or_mdm_status: body.icloud_or_mdm_status,
      physical_condition: body.physical_condition,
      cash_price: Number(body.cash_price),
      is_swap_eligible: Boolean(body.is_swap_eligible ?? true),
      accepted_swap_models: body.accepted_swap_models || [],
      media_urls: body.media_urls || [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
      ],
      diagnostic_report_notes: body.diagnostic_report_notes || 'Diagnostic report provided by seller.',
      diagnostic_score: body.diagnostic_score || 95,
      status: 'ACTIVE'
    });

    return NextResponse.json({ success: true, data: newListing }, { status: 201 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to create listing';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
