# 🛡️ SwapShield (Nigeria) — Peer-to-Peer Gadget Exchange & 48-Hour Escrow Platform

> **Nigeria's Premier Vetted Gadget Swap & 48-Hour Inspection Escrow Hub**  
> Built for Nigerian tech freelancers, creators, students, and gadget dealers trading iPhones, MacBooks, and flagship tech without fear of scams, iCloud locks, or undisclosed hardware defects.

---

## 🚀 Live Browser Preview
The development server is actively running at:
```
http://localhost:3000
```
Open your browser to test and view the interactive SwapShield UI, the live 48-hour inspection countdown timer, the algorithmic swap calculator, and the fintech sandbox controls.

---

## 💎 Core Value Proposition & Mechanics

1. **Standardized Device Diagnostic Listings**:
   - Compulsory hardware diagnostic parameters: Battery Health %, Battery Cycle Count, Display Status (Original / OEM / Aftermarket / Cracked), Face ID / Touch ID, iCloud / MDM clean status, Cosmetic Grade (Mint A, Good B, Fair C).
   - Integration with 3uTools & CoconutBattery diagnostic test report proofs.
   - Hashed serial numbers (SHA-256) for privacy to prevent cloning until deal enters escrow.

2. **Algorithmic Swap Valuation Engine (`/api/swap/calculate`)**:
   - Reference market benchmark catalog across iPhones, MacBooks, iPads, and Samsung flagships in Nigerian Naira (NGN).
   - Strict condition penalties:
     - Battery health `< 80%`: `-12%` penalty (replacement battery deduction)
     - Replaced screen (aftermarket): `-18%` penalty (color gamut & True Tone loss)
     - Cosmetic Grade C: `-10%` penalty
     - Face ID / Biometrics faulty: `-15%` penalty
     - MDM / iCloud bypass: Trade blocked / flagged by anti-theft shield
   - Automated recommended cash delta: `target_device_fair_value - offered_device_fair_value`
   - Real-time negotiation slider allowing users to adjust custom cash offers.

3. **48-Hour Inspection Escrow Vault (`/api/escrow/[id]`)**:
   - **Step 1: Payment**: Buyer deposits via Paystack (Debit Card or Dedicated Virtual Account). Funds lock in escrow vault (`FUNDS_LOCKED`). Listing status transitions to `IN_ESCROW`.
   - **Step 2: Courier Receipt**: Upon delivery confirmation, escrow transitions to `DELIVERED_TESTING_PERIOD` and starts a **48-Hour Live Inspection Timer**.
   - **Step 3: Termii SMS Checklist**: Buyer receives an automated SMS prompt with the standardized checklist:
     - *Verify battery cycle count, run diagnostic test, test SIM slots on MTN/Airtel, and check True Tone.*
   - **Step 4: Auto-Release Cron Worker (`/api/cron/escrow-release`)**: Hourly worker identifies orders where the 48-hour window has expired without disputes, initiates Paystack payout to the seller's verified Nigerian bank account, and marks order `COMPLETED`.

4. **Certified Inspection Hubs**:
   - Physical partner verification points in:
     - **Ikeja Computer Village**: 14 Otigba St, Ikeja, Lagos
     - **Yaba Tech Hub**: 312 Herbert Macaulay Way, Yaba, Lagos
     - **Victoria Island Hub**: 22 Adetokunbo Ademola St, VI, Lagos
     - **Abuja Wuse II Tech Depot**: Plot 414 Aminu Kano Crescent, Wuse II, Abuja
   - Hubs feature hardware test benches for on-site diagnostic scanning and safe CCTV-monitored handovers.

5. **Dispute Escalation & Return Waybill Flow (`/api/escrow/[id]/dispute`)**:
   - If buyer reports a defect within 48 hours:
     - Inspection timer freezes instantly. Escrow status -> `DISPUTED`.
     - Buyer uploads diagnostic evidence (3uTools/CoconutBattery screenshots).
     - System generates an instant prepaid return waybill (e.g. `SWP-RET-90112`) for delivery back to the seller or the Computer Village verification hub.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide Icons, Framer Motion ready.
- **Backend & APIs**: Next.js 15 Route Handlers (`/api/...`).
- **Database Model**: PostgreSQL relational schema DDL with Row-Level Security (`supabase/migrations/20261007000000_swapshield_initial_schema.sql`).
- **Payment Gateway**: Paystack API integration (`src/lib/paystack.ts`) supporting Dedicated Virtual Accounts, webhook HMAC-SHA512 verification, and seller payout transfers.
- **SMS & WhatsApp Engine**: Termii API integration (`src/lib/termii.ts`) for Nigerian numbers (+234).

---

## 🗄️ Relational Database Schema (`supabase/migrations/`)

- `users`: BVN & NIN verified status, trust score, bank accounts, and Paystack recipient codes.
- `gadget_listings`: Complete diagnostic matrix, battery health %, cycle counts, screen status, biometric status, IMEI hashes.
- `swap_proposals`: Offered vs target devices with proposed cash top-up values.
- `escrow_orders`: Escrow state machine, Paystack references, inspection timer expiration, platform (5%) and inspection fees.
- `escrow_disputes`: Flagged reasons, proof URLs, return waybill tracking, resolution status.
- `inspection_hubs`: Partner locations in Lagos & Abuja.
- `escrow_timeline_events`: Immutable audit trail for every escrow state change.

---

## 🧪 Interactive Developer Sandbox Bar

Located at the bottom of the screen in the web app:
1. **Simulate Paystack `charge.success`**: Simulates webhook with signature verification to lock funds into escrow.
2. **Fast-Forward 48h Timer to 0s**: Immediately simulates expiry of the 48-hour hardware testing window.
3. **Run Auto-Release Cron Worker**: Executes `/api/cron/escrow-release` to verify automated seller payout when no disputes exist.
4. **Termii SMS Logs**: View real-time simulated and live SMS messages sent to Nigerian mobile numbers.
