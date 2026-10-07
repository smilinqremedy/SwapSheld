import { NextRequest, NextResponse } from 'next/server';
import { resolveAccountNumber, createTransferRecipient, listBanks } from '@/lib/paystack';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountNumber, bankCode, userId } = body;

    if (!accountNumber || typeof accountNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Account number is required' },
        { status: 400 }
      );
    }

    const cleanedAccount = accountNumber.replace(/\D/g, '');
    if (cleanedAccount.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'NUBAN account number must be exactly 10 numeric digits' },
        { status: 422 }
      );
    }

    if (!bankCode || typeof bankCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Bank selection is required' },
        { status: 400 }
      );
    }

    // 1. Resolve Account Name with Paystack
    let resolved: { account_number: string; account_name: string };
    try {
      resolved = await resolveAccountNumber(cleanedAccount, bankCode);
    } catch (resolveErr: unknown) {
      const msg = resolveErr instanceof Error ? resolveErr.message : 'Could not resolve bank account details. Verify NUBAN and bank';
      return NextResponse.json(
        { success: false, error: msg },
        { status: 422 }
      );
    }

    // 2. Fetch Bank Name
    const banks = await listBanks();
    const matchedBank = banks.find((b) => b.code === bankCode);
    const bankName = matchedBank?.name || 'Commercial Bank of Nigeria';

    // 3. Create Transfer Recipient Code for Automated Escrow Payouts
    const recipient = await createTransferRecipient(
      resolved.account_name,
      cleanedAccount,
      bankCode
    );

    // 4. Update Database User Record if userId is provided
    if (userId) {
      db.updateUser(userId, {
        bank_account_number: cleanedAccount,
        bank_code: bankCode,
        bank_name: bankName,
        recipient_code: recipient.recipient_code,
        paystack_recipient_code: recipient.recipient_code
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          accountName: resolved.account_name,
          accountNumber: cleanedAccount,
          bankCode,
          bankName,
          recipientCode: recipient.recipient_code
        }
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error verifying bank account';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
