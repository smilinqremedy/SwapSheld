'use client';

import React from 'react';
import {
  ShieldCheck,
  Search,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  Lock,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const HowItWorks: React.FC<{ onGetStarted: () => void; onTryCalculator: () => void }> = ({
  onGetStarted,
  onTryCalculator
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Zero Guesswork • 100% Scam-Free
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How SwapShield Works in 3 Simple Steps
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Whether you want to buy an iPhone outright or swap your current MacBook for a newer model, here is how we protect your money and devices.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Step 1 */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 relative transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-lg flex items-center justify-center">
            1
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Find or Value Your Device</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse vetted listings with verified battery health &amp; original screen reports. Or use our <strong>Swap Calculator</strong> to see the exact fair cash top-up needed.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Algorithmic pricing based on real Nigerian market values.</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-4 relative transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold text-lg flex items-center justify-center">
            2
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Funds Lock in Paystack Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay securely via Debit Card or dedicated Virtual Bank Transfer. <strong>The seller DOES NOT get paid yet.</strong> Your money sits safely locked in our monitored escrow vault.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-cyan-300 flex items-center gap-2">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>Guaranteed zero seller ghosting or fake deliveries.</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 relative transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-lg flex items-center justify-center">
            3
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">48-Hour Testing Period</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When the gadget arrives, a <strong>live 48-Hour timer starts</strong>. Test battery, True Tone, Face ID, and SIM slots. If 100% satisfied, release funds. If any defect exists, click dispute to freeze funds!
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Free return waybill provided if the seller lied.</span>
          </div>
        </div>
      </div>

      {/* Comparison: SwapShield vs Ordinary Street / Classifieds Trading */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-white text-center mb-6">
          Why Nigerian Tech Enthusiasts Choose SwapShield
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Old way */}
          <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Buying on Classifieds &amp; Street Stalls (Risky)</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Pay upfront and risk seller blocking you immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>iCloud or MDM lock discovered only after you factory-reset at home.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Undisclosed cheap replacement LCD with no True Tone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Degraded 72% battery with a booster chip showing fake 100%.</span>
              </li>
            </ul>
          </div>

          {/* SwapShield Way */}
          <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Trading on SwapShield (100% Protected)</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Paystack Escrow vault keeps money safe until you inspect.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>48-Hour live countdown timer to test hardware stress and battery.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Mandatory 3uTools &amp; CoconutBattery diagnostic certification.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Computer Village &amp; Yaba Hub physical inspection benches.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Browse Verified Gadgets
          </button>
          <button
            onClick={onTryCalculator}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            Try Swap Calculator
          </button>
        </div>
      </div>
    </section>
  );
};
