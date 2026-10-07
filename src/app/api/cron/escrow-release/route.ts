import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    // Optional bearer token check for production cron protection
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const result = await db.runAutoReleaseCronWorker();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Auto-release worker executed. ${result.processedCount} expired orders evaluated.`,
      result
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Cron worker error';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
