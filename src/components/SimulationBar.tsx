'use client';

import React, { useState } from 'react';
import {
  Wrench,
  FastForward,
  Play,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  RefreshCw,
  Clock
} from 'lucide-react';
import { TermiiDispatchLog } from '@/lib/termii';

interface SimulationBarProps {
  onRefreshAll: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({ onRefreshAll }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
  const [smsLogs, setSmsLogs] = useState<TermiiDispatchLog[]>([]);

  const handleSimulateWebhook = async () => {
    setLoadingAction('webhook');
    try {
      const res = await fetch('/api/webhooks/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': 'test-simulated-signature-bypass'
        },
        body: JSON.stringify({
          event: 'charge.success',
          data: {
            reference: 'PSK_REF_SWAP_990142',
            amount: 30000000,
            status: 'success'
          }
        })
      });
      const data = await res.json();
      setBannerFeedback(data.message || 'Webhook processed successfully.');
      onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFastForwardTimer = async () => {
    setLoadingAction('fast-forward');
    try {
      const res = await fetch('/api/demo/fast-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: 'ord_active_48h',
          hours_ago: 50
        })
      });
      const data = await res.json();
      setBannerFeedback('48-Hour timer fast-forwarded to EXPIRED. Ready for Cron auto-release!');
      onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTriggerAutoReleaseCron = async () => {
    setLoadingAction('cron');
    try {
      const res = await fetch('/api/cron/escrow-release', { method: 'POST' });
      const data = await res.json();
      if (data.result?.completedOrders?.length > 0) {
        setBannerFeedback(
          `Auto-Release Cron ran: Order #${data.result.completedOrders[0].slice(0, 8)} passed 48h window. Paystack transfer paid out to seller!`
        );
      } else {
        setBannerFeedback(
          `Auto-Release Cron ran: ${data.result?.processedCount || 0} expired orders evaluated without disputes.`
        );
      }
      onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewSmsLogs = async () => {
    try {
      const res = await fetch('/api/demo/fast-forward');
      const data = await res.json();
      setSmsLogs(data.sms_logs || []);
      setShowSmsModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-2xl hover:bg-slate-800 transition-all cursor-pointer"
      >
        <Wrench className="w-4 h-4" />
        Fintech Sandbox Controls
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              SwapShield Fintech Sandbox Bar:
            </span>
            {bannerFeedback && (
              <span className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded max-w-md truncate">
                {bannerFeedback}
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Simulate Paystack Webhook */}
            <button
              onClick={handleSimulateWebhook}
              disabled={loadingAction !== null}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              Simulate Paystack charge.success
            </button>

            {/* 2. Fast-Forward 48h Timer */}
            <button
              onClick={handleFastForwardTimer}
              disabled={loadingAction !== null}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              Fast-Forward 48h Timer to 0s
            </button>

            {/* 3. Run Hourly Cron Auto-Release Worker */}
            <button
              onClick={handleTriggerAutoReleaseCron}
              disabled={loadingAction !== null}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Run Auto-Release Cron Worker
            </button>

            {/* 4. Termii SMS Inbox */}
            <button
              onClick={handleViewSmsLogs}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Termii SMS Logs
            </button>

            {/* 5. Hub Technician Workbench */}
            <a
              href="/admin/hub-workbench"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Hub Workbench
            </a>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Termii SMS Audit Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Termii SMS &amp; WhatsApp Notifications Log (+234 Nigeria)
                </h3>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Live notifications triggered across delivery confirmation, 48-hour checklists, disputes, and Paystack seller payouts:
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {smsLogs.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-slate-500">
                  No notifications recorded yet. Click &quot;Device Received&quot; in the Escrow Vault to trigger the automated 48-Hour checklist SMS!
                </div>
              ) : (
                smsLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-mono text-emerald-400">{log.recipient}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString('en-NG')}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">{log.message}</p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowSmsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
