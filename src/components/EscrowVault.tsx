'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Truck,
  Building,
  CheckSquare,
  Square,
  Lock,
  DollarSign,
  UserCheck,
  FileText,
  RotateCcw
} from 'lucide-react';
import { EscrowOrder, EscrowTimelineEvent, User } from '@/types';

interface EscrowVaultProps {
  orders: EscrowOrder[];
  currentUser: User;
  onRefreshOrders: () => void;
  onOpenDispute: (order: EscrowOrder) => void;
}

export const EscrowVault: React.FC<EscrowVaultProps> = ({
  orders,
  currentUser: _currentUser,
  onRefreshOrders,
  onOpenDispute
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [messageNotice, setMessageNotice] = useState<string | null>(null);

  // Hardware checklist check states
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    battery: true,
    trueTone: true,
    faceId: false,
    icloud: true,
    simSlot: false,
    chassis: true
  });

  // Active selected order
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Live 48-Hour Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!activeOrder?.inspection_window_expires_at) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: false });
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const target = new Date(activeOrder.inspection_window_expires_at!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeOrder?.inspection_window_expires_at]);

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Buyer confirms device received -> triggers 48h timer
  const handleConfirmReceived = async () => {
    if (!activeOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${activeOrder.id}/receive`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessageNotice('Receipt confirmed! 48-Hour testing timer started. Termii checklist SMS dispatched to buyer.');
        onRefreshOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Buyer approves early payout
  const handleReleaseFunds = async () => {
    if (!activeOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${activeOrder.id}/release`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessageNotice('Funds released! Paystack payout transferred directly to seller verified account.');
        onRefreshOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!activeOrder) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h3 className="text-lg font-bold text-white">No Escrow Orders Found</h3>
        <p className="text-xs mt-1">Start a gadget purchase or swap to see your escrow vault here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            48-Hour Inspection Escrow Vault
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Escrow Order #{activeOrder.id.slice(0, 12)}
          </h1>
        </div>

        {/* Order Selector if multiple */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Switch Order:</span>
            <select
              value={activeOrder.id}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id.slice(0, 8)} — {o.listing?.model || 'Device'} ({o.escrow_status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {messageNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{messageNotice}</span>
        </div>
      )}

      {/* Escrow State Progress Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Escrow Lifecycle Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              id: 'AWAITING_PAYMENT',
              label: '1. Deposit Payment',
              desc: 'Paystack Auth',
              icon: DollarSign,
              done: activeOrder.escrow_status !== 'AWAITING_PAYMENT'
            },
            {
              id: 'FUNDS_LOCKED',
              label: '2. Vault Locked',
              desc: 'Funds in Escrow',
              icon: Lock,
              done: [
                'FUNDS_LOCKED',
                'IN_TRANSIT_TO_BUYER',
                'DELIVERED_TESTING_PERIOD',
                'COMPLETED',
                'DISPUTED'
              ].includes(activeOrder.escrow_status)
            },
            {
              id: 'DELIVERED_TESTING_PERIOD',
              label: '3. 48h Inspection',
              desc: 'Hardware Testing',
              icon: Clock,
              done: ['DELIVERED_TESTING_PERIOD', 'COMPLETED', 'DISPUTED'].includes(
                activeOrder.escrow_status
              )
            },
            {
              id: 'COMPLETED',
              label: '4. Payout / Done',
              desc: 'Seller Bank Release',
              icon: CheckCircle2,
              done: activeOrder.escrow_status === 'COMPLETED'
            }
          ].map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = activeOrder.escrow_status === st.id;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : st.done
                    ? 'bg-slate-950/80 border-slate-800 text-emerald-400'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : st.done
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{st.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 48-HOUR LIVE COUNTDOWN TIMER HERO CARD */}
      {activeOrder.escrow_status === 'DELIVERED_TESTING_PERIOD' && (
        <div className="bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl timer-pulse-active space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-500/20 pb-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Live 48-Hour Inspection Timer
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Inspect Hardware Against Diagnostic Report
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                You have 48 hours from courier receipt to test all device components. If everything matches, click &quot;Approve &amp; Release&quot; or let the timer auto-release payout to the seller.
              </p>
            </div>

            {/* Countdown Digits Display */}
            <div className="flex items-center gap-2">
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center min-w-[70px]">
                <span className="text-3xl font-black text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Hours</span>
              </div>
              <span className="text-2xl font-bold text-slate-500">:</span>
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center min-w-[70px]">
                <span className="text-3xl font-black text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Mins</span>
              </div>
              <span className="text-2xl font-bold text-slate-500">:</span>
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center min-w-[70px]">
                <span className="text-3xl font-black text-rose-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Secs</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Release vs Dispute */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-300">
              Found undisclosed faults (bad battery, replaced screen, iCloud)?
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onOpenDispute(activeOrder)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Defect / Dispute Escrow
              </button>

              <button
                onClick={handleReleaseFunds}
                disabled={actionLoading}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading ? 'Processing...' : 'Approve & Release Funds Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IF AWAITING DELIVERY / FUNDS LOCKED */}
      {activeOrder.escrow_status === 'FUNDS_LOCKED' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ₦{activeOrder.total_escrow_amount.toLocaleString()} Locked in Escrow Vault
              </h3>
              <p className="text-xs text-slate-400">
                Courier is en route ({activeOrder.courier_partner || 'GIG Logistics'}). Waybill: {activeOrder.delivery_tracking_number}
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmReceived}
            disabled={actionLoading}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Truck className="w-4 h-4" />
            <span>Device Received (Start 48h Inspection Window)</span>
          </button>
        </div>
      )}

      {/* IF DISPUTED */}
      {activeOrder.escrow_status === 'DISPUTED' && (
        <div className="p-6 bg-rose-950/40 border border-rose-500/50 rounded-2xl flex items-center gap-4 text-rose-200">
          <AlertTriangle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Escrow Frozen Under Active Dispute
            </h3>
            <p className="text-xs text-rose-300">
              The 48-hour auto-release timer is completely FROZEN. Funds will remain secured in vault until device return is verified at our Computer Village hub or mutual resolution.
            </p>
          </div>
        </div>
      )}

      {/* Two Column Grid: Hardware Checklist & Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Verification Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              48-Hour Hardware Verification Checklist
            </h3>
            <span className="text-[11px] text-slate-400">Nigerian Market Standard</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Follow this standardized checklist sent via Termii SMS before clearing escrow release:
          </p>

          <div className="space-y-2.5">
            {[
              {
                id: 'battery',
                label: 'Battery Health & Cycle Count',
                desc: 'Check Settings > Battery and connect to 3uTools/CoconutBattery to verify cycles.'
              },
              {
                id: 'trueTone',
                label: 'True Tone & Screen Calibration',
                desc: 'Long-press brightness slider in Control Center to verify True Tone toggle exists.'
              },
              {
                id: 'faceId',
                label: 'Face ID / Touch ID Biometrics',
                desc: 'Enroll biometric profile and test unlock under normal and dim lighting.'
              },
              {
                id: 'icloud',
                label: 'iCloud Sign-Out & MDM Profile',
                desc: 'Ensure previous Apple ID is signed out and Settings > VPN & Device Mgmt is empty.'
              },
              {
                id: 'simSlot',
                label: 'SIM Slot & Network Bands',
                desc: 'Insert Nigerian SIM card (MTN/Airtel/Glo) to confirm call, SMS, and 4G/5G data.'
              },
              {
                id: 'chassis',
                label: 'Chassis & Charging Port',
                desc: 'Inspect charging port pins, speaker output, and test all microphone channels.'
              }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  checklist[item.id]
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {checklist[item.id] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${checklist[item.id] ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Financials & Vault Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Escrow Breakdown & Parties
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">
              Ref: {activeOrder.payment_reference.slice(0, 15)}...
            </span>
          </div>

          {/* Device & Parties */}
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Device Traded</span>
                <p className="font-bold text-white text-sm">
                  {activeOrder.listing?.brand} {activeOrder.listing?.model} ({activeOrder.listing?.storage_capacity})
                </p>
              </div>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px]">
                {activeOrder.order_type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Buyer (Tester)</span>
                <p className="font-bold text-white mt-1">{activeOrder.buyer?.full_name}</p>
                <p className="text-[10px] text-emerald-400">BVN &amp; NIN Verified</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Seller (Payout Recipient)</span>
                <p className="font-bold text-white mt-1">{activeOrder.seller?.full_name}</p>
                <p className="text-[10px] text-emerald-400">{activeOrder.seller?.bank_name}</p>
              </div>
            </div>
          </div>

          {/* Pricing Ledger */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Principal Escrow / Cash Top-up:</span>
              <span className="font-bold text-white">₦{activeOrder.total_escrow_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Platform Protection Fee (5%):</span>
              <span>₦{activeOrder.platform_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Hub Hardware Verification Fee:</span>
              <span>₦{activeOrder.inspection_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Insured Waybill Shipping:</span>
              <span>₦{activeOrder.shipping_fee.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-emerald-400">
              <span>Total Vault Funds:</span>
              <span>
                ₦
                {(
                  activeOrder.total_escrow_amount +
                  activeOrder.platform_fee +
                  activeOrder.inspection_fee +
                  activeOrder.shipping_fee
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Drop-Off Hub Info */}
          {activeOrder.hub && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
              <Building className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">{activeOrder.hub.name}</p>
                <p className="text-[11px] text-slate-400">{activeOrder.hub.address}</p>
                <p className="text-[10px] text-emerald-400 mt-1">
                  Hub Agent: {activeOrder.hub.agent_name} ({activeOrder.hub.agent_phone})
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
