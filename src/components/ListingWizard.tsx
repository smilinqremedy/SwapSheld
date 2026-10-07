'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  BatteryCharging,
  Eye,
  Camera,
  Upload,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  GadgetCategory,
  ScreenStatus,
  BiometricStatus,
  ICloudStatus,
  PhysicalGrade,
  User,
  GadgetListing
} from '@/types';
import { evaluateDevice } from '@/lib/valuation-engine';

interface ListingWizardProps {
  currentUser: User;
  onListingCreated: (listing: GadgetListing) => void;
  onCancel: () => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({
  currentUser,
  onListingCreated,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<GadgetCategory>('SMARTPHONE');
  const [brand, setBrand] = useState<string>('Apple');
  const [model, setModel] = useState<string>('iPhone 15 Pro');
  const [storageCapacity, setStorageCapacity] = useState<string>('128GB');
  const [ram, setRam] = useState<string>('8GB');
  const [color, setColor] = useState<string>('Natural Titanium');
  const [imeiOrSerial, setImeiOrSerial] = useState<string>('356892110488219');

  // Diagnostics
  const [batteryHealth, setBatteryHealth] = useState<number>(92);
  const [batteryCycleCount, setBatteryCycleCount] = useState<number>(185);
  const [screenStatus, setScreenStatus] = useState<ScreenStatus>('ORIGINAL');
  const [faceIdBiometrics, setFaceIdBiometrics] = useState<BiometricStatus>('WORKING');
  const [icloudStatus, setIcloudStatus] = useState<ICloudStatus>('CLEAN_UNLOCKED');
  const [physicalCondition, setPhysicalCondition] = useState<PhysicalGrade>('MINT_GRADE_A');
  const [diagnosticReportNotes, setDiagnosticReportNotes] = useState<string>(
    '3uTools verified: 98% Score. All sensors passed, True Tone functional, Face ID verified.'
  );

  // Commercials
  const [cashPrice, setCashPrice] = useState<number>(1150000);
  const [isSwapEligible, setIsSwapEligible] = useState<boolean>(true);
  const [acceptedSwapModels, setAcceptedSwapModels] = useState<string>('iPhone 14 Pro Max, MacBook Air M2');
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
  ]);

  // Algorithmic evaluation of current device inputs
  const currentEval = evaluateDevice({
    category,
    brand,
    model,
    storage_capacity: storageCapacity,
    ram,
    battery_health_percentage: batteryHealth,
    battery_cycle_count: batteryCycleCount,
    screen_status: screenStatus,
    face_id_or_biometrics: faceIdBiometrics,
    icloud_or_mdm_status: icloudStatus,
    physical_condition: physicalCondition
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: currentUser.id,
          category,
          brand,
          model,
          storage_capacity: storageCapacity,
          ram,
          color,
          imei_or_serial_hash: imeiOrSerial,
          battery_health_percentage: batteryHealth,
          battery_cycle_count: batteryCycleCount,
          screen_status: screenStatus,
          face_id_or_biometrics: faceIdBiometrics,
          icloud_or_mdm_status: icloudStatus,
          physical_condition: physicalCondition,
          cash_price: Number(cashPrice),
          is_swap_eligible: isSwapEligible,
          accepted_swap_models: acceptedSwapModels.split(',').map((s) => s.trim()).filter(Boolean),
          media_urls: mediaUrls,
          diagnostic_report_notes: diagnosticReportNotes,
          diagnostic_score: Math.max(70, 100 - currentEval.total_penalty_percentage)
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit listing');
      }

      onListingCreated(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Standardized Hardware Diagnostic Wizard
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">List Your Gadget</h2>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                    : step > s
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: DEVICE IDENTITY & SPECS */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Step 1: Device Identity & Specifications
            </h3>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Category</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'SMARTPHONE', label: 'Smartphone', icon: Smartphone },
                  { id: 'LAPTOP', label: 'Laptop', icon: Laptop },
                  { id: 'TABLET', label: 'Tablet', icon: Tablet }
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as GadgetCategory)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        category === cat.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Google">Google Pixel</option>
                  <option value="Dell">Dell</option>
                  <option value="Lenovo">Lenovo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro, MacBook Pro 14 M2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Storage Capacity</label>
                <select
                  value={storageCapacity}
                  onChange={(e) => setStorageCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200"
                >
                  <option value="64GB">64GB</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Color Finish</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Space Gray, Natural Titanium"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* IMEI / Serial Hash */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Hardware Serial Number / IMEI (Hashed for Privacy)
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">Privacy Protected</span>
              </div>
              <input
                type="text"
                value={imeiOrSerial}
                onChange={(e) => setImeiOrSerial(e.target.value)}
                placeholder="Enter 15-digit IMEI or Apple Serial Number"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Serial will be cryptographically hashed (SHA-256) on public listings to prevent cloning. Only revealed to the buyer once funds are safely in escrow.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: RIGOROUS HARDWARE DIAGNOSTIC REPORT */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              Step 2: Mandatory Hardware Diagnostic Check
            </h3>

            {/* Battery Health & Cycles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    Battery Health (%)
                  </span>
                  <span className={`font-bold ${batteryHealth < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {batteryHealth}%
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={100}
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Settings &gt; Battery &gt; Battery Health (or CoconutBattery for Mac)
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Battery Cycle Count
                </label>
                <input
                  type="number"
                  value={batteryCycleCount}
                  onChange={(e) => setBatteryCycleCount(Number(e.target.value))}
                  placeholder="e.g. 142"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Screen Status */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Display Integrity</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'ORIGINAL', label: '100% Original', note: 'Never opened' },
                  { id: 'REPLACED_OEM', label: 'OEM Screen', note: 'Genuine swapped' },
                  { id: 'REPLACED_AFTERMARKET', label: 'Aftermarket LCD', note: '-18% value' },
                  { id: 'CRACKED', label: 'Cracked Glass', note: '-25% value' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScreenStatus(s.id as ScreenStatus)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      screenStatus === s.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p>{s.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{s.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Biometrics & iCloud Check */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Face ID / Biometric Security
                </label>
                <select
                  value={faceIdBiometrics}
                  onChange={(e) => setFaceIdBiometrics(e.target.value as BiometricStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200"
                >
                  <option value="WORKING">Fully Functional (Face ID / Touch ID Enrolls)</option>
                  <option value="FAULTY">Faulty / Disabled (-15% Penalty)</option>
                  <option value="NOT_APPLICABLE">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  iCloud / MDM Clean Status
                </label>
                <select
                  value={icloudStatus}
                  onChange={(e) => setIcloudStatus(e.target.value as ICloudStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200"
                >
                  <option value="CLEAN_UNLOCKED">Clean Unlocked (No MDM, iCloud logged out)</option>
                  <option value="BYPASSED_FLAGGED">Bypassed / MDM (SwapShield Flagged)</option>
                </select>
              </div>
            </div>

            {/* Cosmetic Condition */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Chassis Grade</label>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'MINT_GRADE_A', label: 'Grade A (Mint)', desc: 'No scratches, like new' },
                  { id: 'GOOD_GRADE_B', label: 'Grade B (Good)', desc: 'Light micro pocket scuffs' },
                  { id: 'FAIR_GRADE_C', label: 'Grade C (Fair)', desc: 'Visible dents/scratches' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPhysicalCondition(g.id as PhysicalGrade)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      physicalCondition === g.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p>{g.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 3uTools / COCONUTBATTERY PROOF SCREENSHOTS */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              Step 3: Upload Diagnostic Screenshots & Proof
            </h3>

            <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-950/60 transition-colors">
              <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">
                Upload 3uTools / CoconutBattery / iOS Diagnostic Report
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                High-resolution proof protects you from buyers making false claims during the 48-hour escrow window.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-slate-800 rounded-full text-[11px] text-slate-300">
                  ✓ 3uTools Test Score 98% attached
                </span>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-[11px] text-slate-300">
                  ✓ 360 Exterior Photo attached
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Diagnostic Verification Notes
              </label>
              <textarea
                rows={3}
                value={diagnosticReportNotes}
                onChange={(e) => setDiagnosticReportNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: FAIR PRICING & SWAP PREFERENCES */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Step 4: Algorithmic Pricing & Escrow Publication
            </h3>

            {/* Algorithmic Price Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Algorithmic Benchmark Valuation</span>
                  <p className="text-2xl font-extrabold text-emerald-400">
                    ₦{currentEval.fair_market_value.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Hardware Score</span>
                  <p className="text-xl font-bold text-white">
                    {Math.max(70, 100 - currentEval.total_penalty_percentage)}% Health
                  </p>
                </div>
              </div>

              {currentEval.penalties.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Deductions Applied:</p>
                  {currentEval.penalties.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-rose-400">
                      <span>{p.label}</span>
                      <span>-₦{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Your Asking Cash Price (₦ NGN)
                </label>
                <input
                  type="number"
                  value={cashPrice}
                  onChange={(e) => setCashPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Swap Eligibility
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="swapCheck"
                    checked={isSwapEligible}
                    onChange={(e) => setIsSwapEligible(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="swapCheck" className="text-xs text-slate-300 cursor-pointer">
                    Accept Device Swaps + Cash Delta
                  </label>
                </div>
              </div>
            </div>

            {isSwapEligible && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Accepted Models for Swap
                </label>
                <input
                  type="text"
                  value={acceptedSwapModels}
                  onChange={(e) => setAcceptedSwapModels(e.target.value)}
                  placeholder="e.g. iPhone 14 Pro Max, MacBook Air M2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200"
                />
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Step
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-400 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-slate-950 flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs font-extrabold text-slate-950 flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/30 cursor-pointer"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Verified Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
