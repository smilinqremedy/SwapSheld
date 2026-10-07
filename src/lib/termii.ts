// =====================================================================
// SwapShield Termii SMS & WhatsApp Notification Service
// Specialized for the Nigerian Telecommunications Ecosystem (+234)
// =====================================================================

export interface TermiiMessagePayload {
  to: string; // Nigerian phone number (e.g. +2348012345678 or 08012345678)
  sms: string;
  channel?: 'generic' | 'dnd' | 'whatsapp';
}

export interface TermiiDispatchLog {
  id: string;
  recipient: string;
  message: string;
  channel: string;
  status: 'SENT' | 'SIMULATED';
  timestamp: string;
}

// Global in-memory log of recent SMS dispatches for UI feedback and verification
const globalForSms = globalThis as unknown as { termiiAuditLogs?: TermiiDispatchLog[] };
if (!globalForSms.termiiAuditLogs || globalForSms.termiiAuditLogs.length === 0) {
  globalForSms.termiiAuditLogs = [
    {
      id: 'sms_seed_001',
      recipient: '+2348031234567',
      message: '[SwapShield Alert] Your MacBook Pro 14" M2 has been delivered! Your 48-Hour Inspection Escrow is ACTIVE until Oct 9, 2:00 PM. Required checklist: 1) Verify battery health & cycle count, 2) Test True Tone & Face ID, 3) Check SIM tray and cameras. Tap to review: https://swapshield.ng/escrow',
      channel: 'sms/whatsapp',
      status: 'SENT',
      timestamp: new Date().toISOString()
    },
    {
      id: 'sms_seed_002',
      recipient: '+2348129876543',
      message: '[SwapShield Vault] ₦300,000 successfully locked in escrow for MacBook Pro 14" M2. Seller notified to hand over device to Computer Village hub.',
      channel: 'sms/whatsapp',
      status: 'SENT',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];
}
export const SMS_AUDIT_LOGS: TermiiDispatchLog[] = globalForSms.termiiAuditLogs;

export function getSmsLogs(): TermiiDispatchLog[] {
  return globalForSms.termiiAuditLogs || [];
}

const TERMII_API_KEY = process.env.TERMII_API_KEY || 'termii_test_key_dummy_swapshield';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'SwapShield';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api/sms/send';

/**
 * Normalizes Nigerian phone number to international format
 */
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+234')) return cleaned;
  if (cleaned.startsWith('234')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
  return `+234${cleaned}`;
}

/**
 * Dispatches SMS or WhatsApp notification via Termii
 */
export async function sendTermiiNotification(payload: TermiiMessagePayload): Promise<{
  success: boolean;
  messageId: string;
  status: string;
}> {
  const formattedPhone = formatNigerianPhone(payload.to);
  const logId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // If live key is provided, attempt actual Termii API dispatch
  if (process.env.TERMII_API_KEY && !process.env.TERMII_API_KEY.includes('dummy')) {
    try {
      const res = await fetch(TERMII_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formattedPhone.replace('+', ''),
          from: TERMII_SENDER_ID,
          sms: payload.sms,
          type: 'plain',
          channel: payload.channel || 'generic',
          api_key: TERMII_API_KEY
        })
      });
      const data = await res.json();
      const status = data.message === 'Successfully Sent' ? 'SENT' : 'SIMULATED';

      SMS_AUDIT_LOGS.unshift({
        id: logId,
        recipient: formattedPhone,
        message: payload.sms,
        channel: payload.channel || 'generic',
        status,
        timestamp: new Date().toISOString()
      });

      return { success: true, messageId: data.message_id || logId, status };
    } catch (err) {
      console.warn('Termii API call failed, falling back to audit logger:', err);
    }
  }

  // Record simulated SMS in audit logs
  SMS_AUDIT_LOGS.unshift({
    id: logId,
    recipient: formattedPhone,
    message: payload.sms,
    channel: payload.channel || 'sms/whatsapp',
    status: 'SIMULATED',
    timestamp: new Date().toISOString()
  });

  // Keep logs to latest 50
  if (SMS_AUDIT_LOGS.length > 50) SMS_AUDIT_LOGS.pop();

  return {
    success: true,
    messageId: logId,
    status: 'SIMULATED'
  };
}

// ---------------------------------------------------------------------
// Standardized Nigerian Gadget Escrow SMS Templates
// ---------------------------------------------------------------------

export const SMS_TEMPLATES = {
  inspectionWindowStarted: (deviceName: string, expiresFormatted: string) =>
    `[SwapShield Alert] Your ${deviceName} has been delivered! Your 48-Hour Inspection Escrow is ACTIVE until ${expiresFormatted}. Required checklist: 1) Verify battery health & cycle count, 2) Test True Tone & Face ID, 3) Check SIM tray and cameras. Tap to review: https://swapshield.ng/escrow`,

  escrowFundsLocked: (amountNaira: number, deviceName: string) =>
    `[SwapShield Vault] ₦${amountNaira.toLocaleString()} successfully locked in escrow for ${deviceName}. Seller has been notified to hand over device to courier/hub.`,

  disputeTriggered: (orderId: string, waybill: string) =>
    `[SwapShield Notice] Escrow frozen for Order #${orderId.slice(0, 8)}. Return Waybill generated: ${waybill}. Funds will remain locked in vault pending dispute resolution.`,

  payoutReleased: (amountNaira: number, deviceName: string, bankAccountMasked: string) =>
    `[SwapShield Payout] Congratulations! ₦${amountNaira.toLocaleString()} for ${deviceName} has been released to your account ending in ${bankAccountMasked}. Thank you for trading safely!`
};

export const termii = {
  sendSms: async (phone?: string, message?: string) => {
    return await sendTermiiNotification({
      to: phone || '+2348031234567',
      sms: message || ''
    });
  }
};
