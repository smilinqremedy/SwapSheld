'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Upload,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Truck,
  RotateCcw
} from 'lucide-react';
import { EscrowOrder, DisputeReason, User } from '@/types';

interface DisputeModalProps {
  order: EscrowOrder;
  currentUser: User;
  onClose: () => void;
  onDisputeFiled: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  order,
  currentUser,
  onClose,
  onDisputeFiled
}) => {
  const [reason, setReason] = useState<DisputeReason>('BATTERY_MISMATCH');
  const [description, setDescription] = useState<string>('');
  const [proofUrls, setProofUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filedWaybill, setFiledWaybill] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the hardware defect in detail.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/escrow/${order.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raised_by: currentUser.id,
          dispute_reason: reason,
          detailed_description: description,
          proof_media_urls: proofUrls
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to file dispute');
      }

      setFiledWaybill(data.data.dispute.return_waybill_tracking);
      setTimeout(() => {
        onDisputeFiled();
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error filing dispute';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Escrow Dispute Escalation</h3>
              <p className="text-xs text-slate-400">Order #{order.id.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {filedWaybill ? (
          <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">
              Escrow Timer Frozen &amp; Dispute Logged!
            </h4>
            <p className="text-xs text-slate-300">
              Prepaid return-waybill generated. Drop off the gadget at our Ikeja Computer Village hub or request courier pickup.
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Prepaid Return Waybill Tracking Code
              </span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono tracking-wider">
                {filedWaybill}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Termii SMS notification has been dispatched to both parties.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Warning banner */}
            <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>
                Filing a dispute <strong>immediately pauses and freezes</strong> the 48-hour testing countdown. Funds will not be released to the seller until resolution.
              </span>
            </div>

            {/* Defect Reason */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                Primary Discrepancy Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DisputeReason)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="BATTERY_MISMATCH">
                  Battery Health / Cycle Count Mismatch (vs 3uTools report)
                </option>
                <option value="AFTERMARKET_SCREEN_UNDISCLOSED">
                  Undisclosed Aftermarket Display (True Tone missing or poor gamut)
                </option>
                <option value="ICLOUD_LOCKED">
                  iCloud Activation Lock or Active MDM Remote Supervision
                </option>
                <option value="PHYSICAL_DAMAGE">
                  Unreported Physical Body Damage (Cracked chassis/deep dings)
                </option>
                <option value="NON_DELIVERY">
                  Device Not Delivered / Package Tampered in Transit
                </option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                Detailed Hardware Defect Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is faulty. e.g. Battery health is reported as 78% on 3uTools instead of 94% on listing, and Face ID fails to scan."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Upload Diagnostic Proof */}
            <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
              <Upload className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-slate-300 font-semibold">
                Upload Diagnostic Screenshot / Video Evidence
              </p>
              <p className="text-[10px] text-slate-500">
                Attach 3uTools / CoconutBattery screenshots or video demonstrating defect
              </p>
              <span className="inline-block px-2.5 py-1 bg-slate-800 rounded text-[10px] text-slate-300">
                1 file attached (battery_cycles_proof.png)
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/40"
              >
                {loading ? 'Freezing Escrow...' : 'Freeze Escrow & Issue Waybill'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
