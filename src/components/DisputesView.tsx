'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Truck,
  RotateCcw,
  ExternalLink,
  Clock,
  UserCheck
} from 'lucide-react';
import { EscrowDispute, EscrowOrder } from '@/types';

interface DisputesViewProps {
  orders: EscrowOrder[];
  onRefresh: () => void;
}

export const DisputesView: React.FC<DisputesViewProps> = ({ orders, onRefresh }) => {
  const disputedOrders = orders.filter((o) => o.escrow_status === 'DISPUTED');
  const [resolutionMessage, setResolutionMessage] = useState<string | null>(null);

  const handleResolve = async (orderId: string, action: 'REFUND_BUYER' | 'RELEASE_TO_SELLER') => {
    try {
      if (action === 'RELEASE_TO_SELLER') {
        const res = await fetch(`/api/escrow/${orderId}/release`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setResolutionMessage('Dispute resolved: Funds released to seller following technician re-inspection.');
          onRefresh();
        }
      } else {
        setResolutionMessage('Dispute resolved: 100% Escrow refund processed to buyer Paystack virtual account.');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          Escrow Dispute &amp; Defect Resolution Center
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frozen Escrows &amp; Waybill Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          When buyers flag undisclosed defects within the 48-hour testing window, funds freeze instantly and a prepaid return waybill is issued to ensure zero buyer risk.
        </p>
      </div>

      {resolutionMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{resolutionMessage}</span>
        </div>
      )}

      {disputedOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Unresolved Disputes</h3>
          <p className="text-xs">
            All gadget trades are safely passing their 48-hour diagnostic tests or have completed escrow release.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {disputedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Escrow Frozen
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Order #{order.id.slice(0, 10)} — {order.listing?.brand} {order.listing?.model}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Frozen Amount: ₦{order.total_escrow_amount.toLocaleString()} in Paystack Vault
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Prepaid Waybill</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {order.delivery_tracking_number || 'WAYBILL-RET-90112'}
                  </span>
                </div>
              </div>

              {/* Dispute Reason & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Flagged Discrepancy
                  </span>
                  <p className="text-sm font-bold text-rose-300">
                    Battery Capacity &amp; Cycle Count Mismatch
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Buyer connected device to 3uTools/CoconutBattery upon delivery; actual cycle count is 320 instead of the 88 stated in the listing.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Return Destination
                  </span>
                  <p className="text-sm font-bold text-white">
                    Computer Village Verification Hub (Ikeja)
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Device in transit via GIG Logistics to neutral hub technician bench for hardware calibration check.
                  </p>
                </div>
              </div>

              {/* Admin Resolution Simulation Controls */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Technician bench verdict actions:
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleResolve(order.id, 'REFUND_BUYER')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs cursor-pointer"
                  >
                    Refund 100% to Buyer
                  </button>

                  <button
                    onClick={() => handleResolve(order.id, 'RELEASE_TO_SELLER')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    Clear &amp; Release to Seller
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
