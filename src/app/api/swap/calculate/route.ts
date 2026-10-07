import { NextRequest, NextResponse } from 'next/server';
import { calculateSwapValuation, evaluateDevice } from '@/lib/valuation-engine';
import { DeviceValuationInput } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: Single device valuation
    if (body.singleDevice) {
      const evaluation = evaluateDevice(body.singleDevice as DeviceValuationInput);
      return NextResponse.json({ success: true, data: evaluation });
    }

    // Mode 2: Swap pair calculation (Device A vs Device B)
    const { offeredDevice, targetDevice, userCashAdjustment } = body;

    if (!offeredDevice || !targetDevice) {
      return NextResponse.json(
        { success: false, error: 'Both offeredDevice and targetDevice are required.' },
        { status: 400 }
      );
    }

    const result = calculateSwapValuation(offeredDevice, targetDevice);

    // Apply optional manual negotiation adjustment
    const finalCashTopup = userCashAdjustment !== undefined
      ? Number(userCashAdjustment)
      : result.recommended_cash_delta;

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        final_negotiated_cash_topup: finalCashTopup,
        adjustment_applied: userCashAdjustment !== undefined
      }
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Calculation error';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
