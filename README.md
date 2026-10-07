# 🛡️ SwapShield (Nigeria) — Peer-to-Peer Gadget Exchange & 48-Hour Escrow Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Paystack](https://img.shields.io/badge/Paystack-Fintech%20Rails-00c3f7?style=for-the-badge)](https://paystack.com/)
[![Termii](https://img.shields.io/badge/Termii-SMS%20%26%20WhatsApp-059669?style=for-the-badge)](https://termii.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

> **Nigeria's Premier Vetted Gadget Swap & 48-Hour Inspection Escrow Platform.**  
> Built for Nigerian tech freelancers, creators, students, and gadget dealers trading iPhones, MacBooks, and flagship tech without fear of scams, iCloud locks, or undisclosed hardware defects.

---

## 🌟 Core Value Proposition & Mechanics

```
  [Buyer / Proposer]                     [SwapShield Escrow]                     [Seller / Depot]
          │                                       │                                     │
          ├──── 1. Paystack Escrow Payment ──────►│                                     │
          │     (Cards / Dedicated Virtual Acct)  │ (Funds Locked)                      │
          │                                       ├──── 2. Courier Dispatch / Hub Drop ─►│
          │                                       │     (Ikeja Computer Village Depot)   │
          │◄─── 3. 48-Hour Inspection Window ─────┤                                     │
          │     (Battery, True Tone, 3uTools)     │                                     │
          │                                       │                                     │
          ├──── 4. Approve & Release Escrow ─────►├──── 5. Instant NUBAN Bank Payout ───►│
          │                                       │     (Paystack Transfer Recipient)   │
```

1. **Standardized Device Diagnostic Listings**:
   - Compulsory hardware diagnostic parameters: Battery Health %, Battery Cycle Count, Display Status (Original / OEM / Aftermarket / Cracked), Face ID / Touch ID, iCloud / MDM clean status, and Cosmetic Grade (Mint Grade A, Good Grade B, Fair Grade C).
   - Integration with 3uTools & CoconutBattery diagnostic test report proofs.
   - Hashed serial numbers (SHA-256) for privacy to prevent device cloning until deal initiates.

2. **Algorithmic Swap Valuation Engine (`/api/swap/calculate`)**:
   - Reference market benchmark catalog across iPhones, MacBooks, iPads, and Samsung devices in Nigerian Naira (NGN).
   - Dynamic condition penalties:
     - Battery health `< 80%`: `-12%` penalty (replacement battery deduction)
     - Replaced screen (aftermarket): `-18%` penalty (color gamut & True Tone loss)
     - Cosmetic Grade C: `-10%` penalty
     - Face ID / Biometrics faulty: `-15%` penalty
     - MDM / iCloud bypass: Trade blocked / flagged by anti-theft shield
   - Automated recommended cash delta: `target_device_fair_value - offered_device_fair_value`.

3. **48-Hour Inspection Escrow Vault (`/api/escrow/[id]`)**:
   - **Step 1: Payment**: Buyer deposits via Paystack (Debit Card or Dedicated Virtual Account). Funds lock in escrow (`FUNDS_LOCKED`). Listing status transitions to `IN_ESCROW`.
   - **Step 2: Courier Receipt**: Upon delivery confirmation, escrow transitions to `DELIVERED_TESTING_PERIOD` and starts a **48-Hour Live Testing Timer**.
   - **Step 3: Termii SMS Checklist**: Buyer receives an automated SMS prompt with the standardized checklist:
     - *Verify battery cycle count, run diagnostic test, test SIM slots on MTN/Airtel, and check True Tone.*
   - **Step 4: Auto-Release Cron Worker (`/api/cron/escrow-release`)**: Hourly worker identifies orders where the 48-hour window has expired without disputes, initiates Paystack payout to the seller's verified Nigerian bank account, and marks order `COMPLETED`.

4. **Certified Physical Inspection Hubs**:
   - Official partner drop-off depots in:
     - **Ikeja Computer Village**: 14 Otigba St, Ikeja, Lagos
     - **Yaba Tech Hub**: 312 Herbert Macaulay Way, Yaba, Lagos
     - **Victoria Island Hub**: 22 Adetokunbo Ademola St, VI, Lagos
     - **Abuja Wuse II Tech Depot**: Plot 414 Aminu Kano Crescent, Wuse II, Abuja
   - Dedicated **Technician Verification Workbench** (`/admin/hub-workbench`) equipped with barcode scanners, 7-point checklist, and security hologram verification.

5. **Dispute Escalation & Return Waybill Flow (`/api/escrow/[id]/dispute`)**:
   - If buyer reports a defect within 48 hours:
     - Inspection timer freezes instantly. Escrow status transitions to `DISPUTED`.
     - Buyer uploads diagnostic evidence (3uTools/CoconutBattery screenshots).
     - System generates an instant prepaid return waybill (e.g. `SWP-RET-90112`) for delivery back to the seller or the hub.

---

## 🚀 Key Feature Highlights

### 📱 Progressive Web App (PWA) & Mobile Scanner
- **Full PWA Support**: Installable on Android & iOS (`standalone` display, splash screen, offline service worker caching via `/sw.js`).
- **Interactive Camera Barcode & IMEI Scanner**:
  - Rear-camera environment mode powered by `html5-qrcode`.
  - Horizontal reticle calibrated for barcodes (`CODE_128`, `EAN_13`, `CODE_39`, `QR_CODE`).
  - Integrated torch / flashlight toggle for poorly lit depot environments.
  - Automatic prefix stripping (`IMEI:`, `SN:`, etc.).
  - Zero memory leaks: hardware camera stream unmounts cleanly.

### 🖼️ In-Browser WebP Image Compressor (`<250KB`)
- Off-screen HTML5 `<canvas>` utility (`src/lib/image-compressor.ts`) converting high-resolution smartphone gadget photos and diagnostic screenshots to WebP before cloud upload.
- Preserves proportional aspect ratio (default `maxWidth: 1600`, `quality: 0.75`).
- Displays live compression savings badges (e.g., `✓ Compressed from 6.2MB to 184KB (97% saved)`).

### 🔢 IMEI Luhn Checksum Validator & Segmentation
- Client-side Luhn formula verification (`src/lib/imei-validator.ts`) on 15-digit IMEIs before computing SHA-256 privacy hashes.
- Displays inline checksum warning badges: `Invalid IMEI Checksum (Luhn check failed)`.
- Standard segmented formatting: `AA-BBBBBB-CCCCCC-D` (e.g., `35-689211-048821-0`).

### 🏦 Automated Nigerian Bank Account & Paystack Recipient Verification
- **Live Bank Fetching**: Cached endpoint (`/api/banks`) serving 30+ active Nigerian commercial banks and fintechs (GTBank, Access, Zenith, Kuda, OPay, Moniepoint, PalmPay, Providus, Wema).
- **Auto-Resolution on 10 Digits**: Component (`BankVerificationCard.tsx`) resolves NUBAN account names via Paystack as soon as 10 digits are filled.
- **Automated Recipient Provisioning**: Generates Paystack transfer recipient (`RCP_...`) and binds it to the seller's account for automated escrow payouts.
- **Listing Wizard Guard**: Sellers cannot publish a gadget listing without verified payout bank details.

### 🔒 Enterprise Supabase Row-Level Security (RLS)
- 100% of tables protected by leak-proof RLS policies (`supabase/migrations/20261007010000_swapshield_production_rls_and_storage.sql`):
  - **`users`**: Public reads basic trust score; sensitive bank details viewable only by owner or admins.
  - **`gadget_listings`**: Active listings public; sellers can only update their own listings while `DRAFT`/`ACTIVE`.
  - **`escrow_orders`**: Strict participant isolation (buyer, seller, hub technician). Anonymous clients receive 0 records.
  - **`escrow_timeline_events`**: Append-only immutable audit trail.
- **High-Performance Composite Indexes**:
  - `idx_escrow_orders_cron_release` on `(escrow_status, inspection_window_expires_at)` executes in `<2ms` index seek.
  - Partial unique index on `imei_or_serial_hash` where `status != 'DELISTED'` prevents duplicate active listings.
- **Supabase Storage Buckets**:
  - `gadget-photos`: Public 5MB WebP/PNG/JPEG gallery bucket.
  - `dispute-evidence`: Private 10MB bucket restricted to order participants.
- Verified with automated 20/20 test runner: `npx tsx scripts/test-rls.ts`.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS 3.4, Lucide React Icons |
| **Database** | PostgreSQL 15 / Supabase with Row-Level Security (RLS) |
| **Payments & Payouts** | Paystack API (Dedicated Virtual Accounts, Cards, Transfers, Webhooks) |
| **SMS & WhatsApp** | Termii API (+234 Nigerian mobile network routes) |
| **PWA & Hardware** | Service Workers, Web App Manifest, `html5-qrcode` |
| **Image Pipeline** | HTML5 Canvas Client-Side WebP Compressor |

---

## 📂 Project Structure

```
swapshield/
├── public/
│   ├── icons/                     # PWA Icons (192x192, 512x512)
│   └── sw.js                      # Service Worker (Network-First Fallback)
├── scripts/
│   └── test-rls.ts                # Production RLS & Index Verification Suite
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── hub-workbench/     # Computer Village Depot Verification Bench
│   │   ├── api/
│   │   │   ├── admin/inspection/  # Hardware Verification & Release API
│   │   │   ├── banks/             # Nigerian Banks Listing (Cached)
│   │   │   │   └── resolve/       # NUBAN Resolution & Recipient Generator
│   │   │   ├── cron/              # Hourly 48-Hour Escrow Auto-Release Cron
│   │   │   ├── escrow/            # Escrow Lifecycle & Dispute Endpoints
│   │   │   ├── hubs/              # Inspection Hubs Directory
│   │   │   ├── listings/          # Gadget Listings CRUD
│   │   │   ├── swap/calculate/    # Algorithmic Valuation Engine
│   │   │   └── webhooks/paystack/ # HMAC-SHA512 Webhook Verification
│   │   ├── manifest.ts            # PWA Web App Manifest
│   │   ├── layout.tsx             # Root Layout with Viewport & PWA Registry
│   │   └── page.tsx               # Marketplace & Escrow Main Application
│   ├── components/
│   │   ├── BankVerificationCard.tsx   # Live NUBAN Resolver & Recipient Setup
│   │   ├── CameraBarcodeScanner.tsx   # Mobile Rear-Camera Barcode/IMEI Scanner
│   │   ├── DisputeModal.tsx           # Escrow Dispute Initiation Modal
│   │   ├── DisputesView.tsx           # Active Disputes Dashboard
│   │   ├── EscrowVault.tsx            # 48-Hour Inspection Timer & Release View
│   │   ├── HowItWorks.tsx             # Interactive Customer Guide
│   │   ├── InspectionHubsView.tsx     # Physical Hub Map & Directory
│   │   ├── ListingWizard.tsx          # 4-Step Listing & Diagnostic Proof Wizard
│   │   ├── Marketplace.tsx            # Vetted Gadget Catalog & Filters
│   │   ├── Navbar.tsx                 # Navigation Bar
│   │   ├── PaystackCheckoutModal.tsx  # Paystack Payment Gateway Integration
│   │   ├── PwaRegister.tsx            # Service Worker Registration Client Component
│   │   ├── QuickHelpFAQ.tsx           # FAQ Accordion
│   │   ├── SimulationBar.tsx          # Developer Sandbox Testing Controls
│   │   └── SwapCalculator.tsx         # Gadget Valuation Calculator
│   ├── lib/
│   │   ├── db.ts                      # Repository & In-Memory Fallback Store
│   │   ├── image-compressor.ts        # Client-Side WebP Canvas Compressor
│   │   ├── imei-validator.ts          # Luhn IMEI Algorithm & Formatter
│   │   ├── paystack.ts                # Paystack API Helpers (Charge, Transfer, NUBAN)
│   │   ├── termii.ts                  # Termii SMS Notification Client
│   │   └── valuation-engine.ts        # Algorithmic Depreciation Matrix
│   └── types/
│       └── index.ts                   # Core TypeScript Domain Interfaces
└── supabase/
    └── migrations/
        ├── 20261007000000_swapshield_initial_schema.sql
        └── 20261007010000_swapshield_production_rls_and_storage.sql
```

---

## 🚦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/smilinqremedy/SwapSheld.git
cd SwapSheld
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Create a `.env.local` file in the project root:
```env
# Server Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Paystack API Credentials (Get from dashboard.paystack.com)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Termii SMS API Credentials (Get from termii.com)
TERMII_API_KEY=your_termii_api_key
TERMII_SENDER_ID=SwapShield

# Supabase PostgreSQL Database (Optional for live DB)
DATABASE_URL=postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Testing & Verification Commands

### Run TypeScript Verification
```bash
npx tsc --noEmit
```

### Run Production RLS Security & Index Suite
```bash
npx tsx scripts/test-rls.ts
```

### Test Core API Endpoints
```bash
# Fetch Nigerian banks list with caching
curl -i http://localhost:3000/api/banks

# Test NUBAN account name resolution
curl -X POST http://localhost:3000/api/banks/resolve \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"0123456789","bankCode":"058"}'

# Browse active listings
curl http://localhost:3000/api/listings

# Fetch active 48h escrow order
curl http://localhost:3000/api/escrow/ord_active_48h
```

---

## 🧪 Developer Simulation Sandbox

Located at the bottom of the live application:
- **Fast-Forward 48-Hour Timer**: Instantly skip testing window to `00:00:00` to test payout triggers.
- **Simulate Paystack Payment**: Trigger a webhook payload to lock funds in escrow.
- **Simulate Hub Drop-Off**: Simulate waybill receipt at Ikeja Computer Village Depot.
- **Trigger Dispute**: Simulate hardware defect claim and prepaid return waybill generation.

---

## 📄 License
This project is proprietary software developed for SwapShield Nigeria. All rights reserved.
