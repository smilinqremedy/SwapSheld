import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Mock database repository interface (wire directly to your Supabase/PostgreSQL client)
import { db } from "@/lib/db"; 
import { paystack } from "@/lib/paystack";
import { termii } from "@/lib/termii";

interface InspectionPayload {
  orderId: string;
  technicianId: string;
  hubLocation: "IKEJA_COMPUTER_VILLAGE" | "YABA_TECH_HUB" | "ABUJA_GARKI";
  scannedImeiOrSerial: string;
  tamperSealIntact: boolean;
  tamperSealNumber: string;
  checklist: {
    imeiMatched: boolean;
    batteryHealthMatched: boolean;
    screenAuthenticityConfirmed: boolean;
    faceIdOrBiometricsWorking: boolean;
    iCloudMdmClean: boolean;
    networkAndSimTested: boolean;
    housingConditionMatchesGrade: boolean;
  };
  physicalNotes: string;
  action: "APPROVE_RELEASE" | "REJECT_AND_FLAG_FRAUD";
}

export async function POST(req: NextRequest) {
  try {
    const body: InspectionPayload = await req.json();
    const { 
      orderId, 
      scannedImeiOrSerial, 
      tamperSealIntact, 
      checklist, 
      action, 
      hubLocation, 
      technicianId,
      physicalNotes 
    } = body;

    // 1. Fetch Order and Associated Listing
    const order = await db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const listing = await db.getListingById(order.listing_id);
    if (!listing) {
      return NextResponse.json({ error: "Listing record missing" }, { status: 404 });
    }

    // 2. Hardware Hash Verification (Privacy Hash Check)
    const normalizedInput = (scannedImeiOrSerial || "").trim().toUpperCase();
    const calculatedHash = crypto.createHash("sha256").update(normalizedInput).digest("hex");

    // Check against listing imei_or_serial_hash (or if raw serial was stored directly)
    const isImeiMatch = 
      calculatedHash.toLowerCase() === (listing.imei_or_serial_hash || "").toLowerCase() ||
      normalizedInput.toLowerCase() === (listing.imei_or_serial_hash || "").toLowerCase();

    if (!isImeiMatch && action === "APPROVE_RELEASE") {
      return NextResponse.json(
        { 
          error: "IMEI MISMATCH: Scanned hardware does not match device bound to this transaction.",
          calculatedHash 
        }, 
        { status: 422 }
      );
    }

    // 3. Reject / Fraud Flag Branch
    if (action === "REJECT_AND_FLAG_FRAUD") {
      await db.updateOrderStatus(orderId, "DISPUTED");
      await db.createTimelineEvent({
        order_id: orderId,
        actor: technicianId,
        event_type: "INSPECTION_FAILED",
        notes: `Failed at ${hubLocation}. Seal Intact: ${tamperSealIntact}. Notes: ${physicalNotes}`,
      });

      // Notify parties
      await termii.sendSms(
        order.buyer_phone,
        `[SwapShield] Inspection FAILED for order ${orderId.slice(0, 8)}. Device flagged by hub technician. Your escrow remains protected.`
      );

      return NextResponse.json({
        success: true,
        status: "DISPUTED",
        message: "Device flagged. Escrow frozen. Waybill flagged for administrative investigation.",
      });
    }

    // 4. Approval Checks: Every critical diagnostic point must pass
    const allChecksPassed = 
      tamperSealIntact &&
      isImeiMatch &&
      checklist.iCloudMdmClean &&
      checklist.batteryHealthMatched &&
      checklist.screenAuthenticityConfirmed;

    if (!allChecksPassed) {
      return NextResponse.json(
        { error: "Cannot approve release: One or more critical hardware health checks failed." },
        { status: 400 }
      );
    }

    // 5. Execute Payout Release via Paystack Transfer API
    let payoutRef: string | null = null;
    if (order.escrow_status === "DELIVERED_TESTING_PERIOD" || order.escrow_status === "FUNDS_LOCKED") {
      const payoutResult = await paystack.initiateTransfer({
        amountInKobo: Math.round(Number(order.total_escrow_amount) * 0.95 * 100), // Net 95% after 5% platform fee
        recipientCode: order.seller_paystack_recipient_code,
        reason: `SwapShield Escrow Release #${orderId.slice(0, 8)}`,
      });
      payoutRef = payoutResult.transfer_code;
    }

    // 6. Transition Order State to COMPLETED
    await db.updateOrderStatus(orderId, "COMPLETED", {
      payout_reference: payoutRef,
      completed_at: new Date().toISOString(),
    });

    await db.createTimelineEvent({
      order_id: orderId,
      actor: technicianId,
      event_type: "BENCH_INSPECTION_APPROVED",
      notes: `Verified at ${hubLocation}. Tamper Seal #${body.tamperSealNumber} verified. Funds released.`,
    });

    // 7. Dispatch Completion Notification
    await termii.sendSms(
      order.seller_phone,
      `[SwapShield] Great news! Hub bench testing completed successfully for Order #${orderId.slice(0, 8)}. Payout is on its way to your account.`
    );

    return NextResponse.json({
      success: true,
      status: "COMPLETED",
      payoutReference: payoutRef,
      message: "Inspection passed and escrow released to seller.",
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("Hub Inspection Error:", error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
