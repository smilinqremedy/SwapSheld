'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle,
  BatteryCharging,
  Smartphone,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  DeviceValuationInput,
  ScreenStatus,
  PhysicalGrade,
  BiometricStatus,
  ICloudStatus,
  SwapCalculationResult,
  User,
  GadgetListing
} from '@/types';
import { DEVICE_BENCHMARKS } from '@/lib/valuation-engine';

interface SwapCalculatorProps {
  currentUser: User;
  onInitiateEscrowSwap?: (proposalData: {
    targetListingId?: string;
    offeredDevice: DeviceValuationInput;
    cashTopup: number;
  }) => void;
  availableListings?: GadgetListing[];
}

export const SwapCalculator: React.FC<SwapCalculatorProps> = ({
  currentUser: _currentUser,
  onInitiateEscrowSwap,
  availableListings = []
}) => {
  // Device A (Offered by user)
  const [offeredDevice, setOfferedDevice] = useState<DeviceValuationInput>({
    category: 'SMARTPHONE',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storage_capacity: '128GB',
    battery_health_percentage: 84,
    battery_cycle_count: 310,
    screen_status: 'REPLACED_AFTERMARKET',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'GOOD_GRADE_B'
  });

  // Device B (Target device to get)
  const [targetDevice, setTargetDevice] = useState<DeviceValuationInput>({
    category: 'SMARTPHONE',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storage_capacity: '256GB',
    battery_health_percentage: 97,
    battery_cycle_count: 140,
    screen_status: 'ORIGINAL',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'MINT_GRADE_A'
  });

  const [calculationResult, setCalculationResult] = useState<SwapCalculationResult | null>(null);
  const [userAdjustment, setUserAdjustment] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Recalculate whenever inputs change
  useEffect(() => {
    let ignore = false;
    const compute = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/swap/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offeredDevice,
            targetDevice
          })
        });
        const data = await res.json();
        if (!ignore && data.success) {
          setCalculationResult(data.data);
          setUserAdjustment(data.data.recommended_cash_delta);
        }
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    compute();
    return () => {
      ignore = true;
    };
  }, [offeredDevice, targetDevice]);

  const handleDeviceChange = (
    which: 'offered' | 'target',
    field: keyof DeviceValuationInput,
    value: unknown
  ) => {
    if (which === 'offered') {
      setOfferedDevice((prev) => ({ ...prev, [field]: value }));
    } else {
      setTargetDevice((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePresetSelect = (which: 'offered' | 'target', benchmarkIdx: number) => {
    const item = DEVICE_BENCHMARKS[benchmarkIdx];
    if (!item) return;
    handleDeviceChange(which, 'brand', item.brand);
    handleDeviceChange(which, 'model', item.model);
    handleDeviceChange(which, 'storage_capacity', item.storage);
    handleDeviceChange(which, 'category', item.category);
  };

  const handleProceedSwap = () => {
    if (onInitiateEscrowSwap) {
      onInitiateEscrowSwap({
        offeredDevice,
        cashTopup: userAdjustment
      });
    } else {
      setSuccessNotice(
        `Swap proposal configured with ₦${Math.abs(userAdjustment).toLocaleString()} cash adjustment. Escrow order ready for Paystack lock!`
      );
      setTimeout(() => setSuccessNotice(null), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Algorithmic Gadget Swap Valuation Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Transparent Nigerian Tech Swap Calculator
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Compute accurate cash top-ups to trade Device A for Device B based on real Computer Village & online benchmarks with automated hardware condition deductions.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* 1-Click Popular Trade Templates for effortless testing */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          ⚡ 1-Click Popular Trade Scenarios (Test Instantly):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setOfferedDevice({
                category: 'SMARTPHONE',
                brand: 'Apple',
                model: 'iPhone 14 Pro',
                storage_capacity: '128GB',
                battery_health_percentage: 84,
                battery_cycle_count: 310,
                screen_status: 'REPLACED_AFTERMARKET',
                face_id_or_biometrics: 'WORKING',
                icloud_or_mdm_status: 'CLEAN_UNLOCKED',
                physical_condition: 'GOOD_GRADE_B'
              });
              setTargetDevice({
                category: 'SMARTPHONE',
                brand: 'Apple',
                model: 'iPhone 15 Pro Max',
                storage_capacity: '256GB',
                battery_health_percentage: 97,
                battery_cycle_count: 140,
                screen_status: 'ORIGINAL',
                face_id_or_biometrics: 'WORKING',
                icloud_or_mdm_status: 'CLEAN_UNLOCKED',
                physical_condition: 'MINT_GRADE_A'
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            📱 iPhone 14 Pro (84% Batt) ➔ iPhone 15 Pro Max (97%)
          </button>

          <button
            type="button"
            onClick={() => {
              setOfferedDevice({
                category: 'LAPTOP',
                brand: 'Apple',
                model: 'MacBook Air 13" M1',
                storage_capacity: '256GB',
                ram: '8GB',
                battery_health_percentage: 88,
                battery_cycle_count: 210,
                screen_status: 'ORIGINAL',
                face_id_or_biometrics: 'WORKING',
                icloud_or_mdm_status: 'CLEAN_UNLOCKED',
                physical_condition: 'GOOD_GRADE_B'
              });
              setTargetDevice({
                category: 'LAPTOP',
                brand: 'Apple',
                model: 'MacBook Pro 14" M2 Pro',
                storage_capacity: '512GB',
                ram: '16GB',
                battery_health_percentage: 94,
                battery_cycle_count: 88,
                screen_status: 'ORIGINAL',
                face_id_or_biometrics: 'WORKING',
                icloud_or_mdm_status: 'CLEAN_UNLOCKED',
                physical_condition: 'MINT_GRADE_A'
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            💻 MacBook Air M1 ➔ MacBook Pro 14&quot; M2 Pro
          </button>

          <button
            type="button"
            onClick={() => {
              setOfferedDevice({
                category: 'SMARTPHONE',
                brand: 'Apple',
                model: 'iPhone 13',
                storage_capacity: '128GB',
                battery_health_percentage: 78,
                battery_cycle_count: 520,
                screen_status: 'REPLACED_OEM',
                face_id_or_biometrics: 'WORKING',
                icloud_or_mdm_status: 'CLEAN_UNLOCKED',
                physical_condition: 'FAIR_GRADE_C'
              });
              setTargetDevice({
                category: 'SMARTPHONE',
                brand: 'Apple',
                model: 'iPhone 14 Pro',
                storage_capacity: '128GB',
                battery_health_percentage: 86,
                battery_cycle_count: 310,
                screen_status: 'ORIGINAL',
                face_id_or_biometrics: 'WORKING',
                icloud_or_mdm_status: 'CLEAN_UNLOCKED',
                physical_condition: 'GOOD_GRADE_B'
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            🔋 iPhone 13 (78% Batt) ➔ iPhone 14 Pro
          </button>
        </div>
      </div>

      {/* Main Grid: Device A vs Device B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device A (Offered) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                A
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your Offered Device</h3>
                <p className="text-xs text-slate-400">What you are trading away</p>
              </div>
            </div>
            {calculationResult && (
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Fair Market Value</span>
                <span className="text-lg font-extrabold text-cyan-400">
                  ₦{calculationResult.offered_device.fair_market_value.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Quick Benchmark Preset */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Device Preset (or customize)
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              value={DEVICE_BENCHMARKS.findIndex((b) => b.model === offeredDevice.model && b.storage === offeredDevice.storage_capacity)}
              onChange={(e) => handlePresetSelect('offered', Number(e.target.value))}
            >
              {DEVICE_BENCHMARKS.map((b, idx) => (
                <option key={idx} value={idx}>
                  {b.brand} {b.model} ({b.storage}) — Benchmark ~₦{b.baseMarketPriceNGN.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Battery Health Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                Battery Health Capacity
              </span>
              <span className={`font-bold ${offeredDevice.battery_health_percentage < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {offeredDevice.battery_health_percentage}%
                {offeredDevice.battery_health_percentage < 80 && ' (-12% penalty)'}
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={100}
              value={offeredDevice.battery_health_percentage}
              onChange={(e) => handleDeviceChange('offered', 'battery_health_percentage', Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            {offeredDevice.battery_health_percentage < 80 && (
              <p className="text-[11px] text-rose-400/90 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Battery degraded (&lt;80%). Automated 12% deduction applied for battery replacement.
              </p>
            )}
          </div>

          {/* Screen Status */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Display & Screen Status
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'ORIGINAL', label: 'Original Display', badge: '0% cut' },
                { id: 'REPLACED_OEM', label: 'OEM Replaced', badge: '-6% cut' },
                { id: 'REPLACED_AFTERMARKET', label: 'Aftermarket Screen', badge: '-18% cut' },
                { id: 'CRACKED', label: 'Cracked / Lines', badge: '-25% cut' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDeviceChange('offered', 'screen_status', item.id as ScreenStatus)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    offeredDevice.screen_status === item.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-[10px] mt-1 ${item.badge.includes('0%') ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Physical Condition Grade */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Cosmetic Chassis Condition
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'MINT_GRADE_A', label: 'Grade A Mint', desc: 'Flawless' },
                { id: 'GOOD_GRADE_B', label: 'Grade B Good', desc: '-4% scuffs' },
                { id: 'FAIR_GRADE_C', label: 'Grade C Fair', desc: '-10% dings' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleDeviceChange('offered', 'physical_condition', g.id as PhysicalGrade)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    offeredDevice.physical_condition === g.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="leading-tight">{g.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Biometrics & iCloud Status */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Face ID / Biometrics</label>
              <select
                value={offeredDevice.face_id_or_biometrics}
                onChange={(e) => handleDeviceChange('offered', 'face_id_or_biometrics', e.target.value as BiometricStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="WORKING">Working (100%)</option>
                <option value="FAULTY">Faulty (-15% cut)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">iCloud / MDM</label>
              <select
                value={offeredDevice.icloud_or_mdm_status}
                onChange={(e) => handleDeviceChange('offered', 'icloud_or_mdm_status', e.target.value as ICloudStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="CLEAN_UNLOCKED">Clean & Unlocked</option>
                <option value="BYPASSED_FLAGGED">Bypassed / Flagged</option>
              </select>
            </div>
          </div>

          {/* Applied Deductions Breakdown */}
          {calculationResult && calculationResult.offered_device.penalties.length > 0 && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                Active Condition Deductions
              </span>
              <div className="space-y-1">
                {calculationResult.offered_device.penalties.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">{p.label}:</span>
                    <span className="font-semibold text-rose-400">
                      -{p.percentage}% (-₦{p.amount.toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Device B (Target) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                B
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Target Device</h3>
                <p className="text-xs text-slate-400">What you want to receive</p>
              </div>
            </div>
            {calculationResult && (
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Fair Market Value</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  ₦{calculationResult.target_device.fair_market_value.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Select from Marketplace or Catalog */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Pick Target Device Benchmark
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              value={DEVICE_BENCHMARKS.findIndex((b) => b.model === targetDevice.model && b.storage === targetDevice.storage_capacity)}
              onChange={(e) => handlePresetSelect('target', Number(e.target.value))}
            >
              {DEVICE_BENCHMARKS.map((b, idx) => (
                <option key={idx} value={idx}>
                  {b.brand} {b.model} ({b.storage}) — Benchmark ~₦{b.baseMarketPriceNGN.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Target Battery Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                Target Battery Capacity
              </span>
              <span className="font-bold text-emerald-400">
                {targetDevice.battery_health_percentage}%
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={100}
              value={targetDevice.battery_health_percentage}
              onChange={(e) => handleDeviceChange('target', 'battery_health_percentage', Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Target Screen Status */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Target Display Status
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'ORIGINAL', label: 'Original Display', badge: 'Optimal' },
                { id: 'REPLACED_OEM', label: 'OEM Replaced', badge: '-6% cut' },
                { id: 'REPLACED_AFTERMARKET', label: 'Aftermarket Screen', badge: '-18% cut' },
                { id: 'CRACKED', label: 'Cracked', badge: '-25% cut' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDeviceChange('target', 'screen_status', item.id as ScreenStatus)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    targetDevice.screen_status === item.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{item.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Cosmetic Grade */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Target Cosmetic Condition
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'MINT_GRADE_A', label: 'Grade A Mint', desc: 'No flaws' },
                { id: 'GOOD_GRADE_B', label: 'Grade B Good', desc: '-4%' },
                { id: 'FAIR_GRADE_C', label: 'Grade C Fair', desc: '-10%' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleDeviceChange('target', 'physical_condition', g.id as PhysicalGrade)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    targetDevice.physical_condition === g.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="leading-tight">{g.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Listings Quick Pick */}
          {availableListings.length > 0 && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or match with a live SwapShield listing:
              </label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {availableListings.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setTargetDevice({
                        category: l.category,
                        brand: l.brand,
                        model: l.model,
                        storage_capacity: l.storage_capacity,
                        ram: l.ram,
                        battery_health_percentage: l.battery_health_percentage,
                        battery_cycle_count: l.battery_cycle_count,
                        screen_status: l.screen_status,
                        face_id_or_biometrics: l.face_id_or_biometrics,
                        icloud_or_mdm_status: l.icloud_or_mdm_status,
                        physical_condition: l.physical_condition
                      });
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-200">
                      {l.brand} {l.model} ({l.storage_capacity})
                    </span>
                    <span className="text-emerald-400 font-bold">₦{l.cash_price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Cash Delta & Escrow Lock Bar */}
      {calculationResult && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Algorithmic Swap Valuation Result
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {calculationResult.who_pays === 'PROPOSER_PAYS' && (
                  <>
                    You add <span className="text-emerald-400">₦{Math.abs(userAdjustment).toLocaleString()}</span> cash
                  </>
                )}
                {calculationResult.who_pays === 'TARGET_SELLER_PAYS' && (
                  <>
                    Target Seller adds <span className="text-cyan-400">₦{Math.abs(userAdjustment).toLocaleString()}</span> cash
                  </>
                )}
                {calculationResult.who_pays === 'STRAIGHT_SWAP' && (
                  <>Straight Even Swap (₦0 Cash Top-up)</>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {calculationResult.summary}
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-right min-w-[220px]">
              <span className="text-xs text-slate-400 block">Algorithmic Cash Delta</span>
              <span className="text-xl font-bold text-white">
                ₦{Math.abs(calculationResult.recommended_cash_delta).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-1">
                48-Hour Escrow Protected
              </span>
            </div>
          </div>

          {/* Negotiation Adjustment Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Negotiate Custom Cash Top-Up Offer
              </span>
              <span className="font-extrabold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                Offer: ₦{userAdjustment.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={Math.max(0, calculationResult.recommended_cash_delta - 200000)}
              max={calculationResult.recommended_cash_delta + 250000}
              step={5000}
              value={userAdjustment}
              onChange={(e) => setUserAdjustment(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Lower offer (₦{(calculationResult.recommended_cash_delta - 100000).toLocaleString()})</span>
              <span>Algorithmic Fair: ₦{calculationResult.recommended_cash_delta.toLocaleString()}</span>
              <span>Aggressive top-up (₦{(calculationResult.recommended_cash_delta + 100000).toLocaleString()})</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Funds remain locked in Paystack Escrow for 48 hours after courier delivery.
              </span>
            </div>

            <button
              onClick={handleProceedSwap}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Initiate 48-Hour Escrow Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
