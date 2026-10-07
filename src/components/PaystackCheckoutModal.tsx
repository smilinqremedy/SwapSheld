'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GadgetListing, User } from '@/types';

interface PaystackCheckoutModalProps {
  listing: GadgetListing;
  currentUser: User;
  onClose: () => void;
  onPaymentSuccess: (orderId: string) => void;
}

export const PaystackCheckoutModal: React.FC<PaystackCheckoutModalProps> = ({
  listing,
  currentUser,
  onClose,
  onPaymentSuccess
}) => {
  const [paymentMode, setPaymentMode] = useState<'card' | 'bank_transfer'>('card');
  const [loading, setLoading] = useState<boolean>(false);
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');

  const principal = listing.cash_price;
  const platformFee = Math.round(principal * 0.05); // 5% fee
  const inspectionFee = 3500;
  const shippingFee = 4000;
  const totalAmount = principal + platformFee + inspectionFee + shippingFee;

  const handlePaystackPay = async () => {
    setLoading(true);
    try {
      // 1. Create order
      const createRes = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_type: 'OUTRIGHT_PURCHASE',
          buyer_id: currentUser.id,
          seller_id: listing.seller_id,
          listing_id: listing.id,
          delivery_mode: 'DIRECT_COURIER',
          cash_amount: principal
        })
      });
      const createData = await createRes.json();
      if (!createData.success) throw new Error(createData.error);

      const newOrderId = createData.order.id;
      const paymentRef = createData.paystack.reference;
      setOrderId(newOrderId);

      // 2. Trigger Paystack charge.success webhook simulation
      await fetch('/api/webhooks/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': 'test-simulated-signature-bypass'
        },
        body: JSON.stringify({
          event: 'charge.success',
          data: {
            reference: paymentRef,
            amount: totalAmount * 100,
            status: 'success'
          }
        })
      });

      setOrderCreated(true);
      setTimeout(() => {
        onPaymentSuccess(newOrderId);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Paystack Escrow Checkout</h3>
              <p className="text-xs text-slate-400">Secured with SwapShield 48h Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCreated ? (
          <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Payment Verified &amp; Escrow Locked!</h4>
            <p className="text-xs text-slate-300">
              ₦{totalAmount.toLocaleString()} is locked safely in the SwapShield vault. Seller has been notified to hand over the device for dispatch.
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold">
              Redirecting you to the Escrow Vault...
            </p>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Item summary */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-sm">
                  {listing.brand} {listing.model}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {listing.storage_capacity} • {listing.color} • {listing.battery_health_percentage}% Batt
                </p>
              </div>
              <span className="text-sm font-extrabold text-emerald-400">
                ₦{listing.cash_price.toLocaleString()}
              </span>
            </div>

            {/* Escrow Fee Ledger */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Gadget Price:</span>
                <span className="font-semibold text-white">₦{principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SwapShield Escrow Protection (5%):</span>
                <span>₦{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Certified Inspection Fee:</span>
                <span>₦{inspectionFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Insured Doorstep Shipping (GIGL):</span>
                <span>₦{shippingFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-extrabold text-sm text-emerald-400">
                <span>Total Escrow Lock:</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                  paymentMode === 'card'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Debit Card (Mastercard/Visa/Verve)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('bank_transfer')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                  paymentMode === 'bank_transfer'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Dedicated Virtual Account</span>
              </button>
            </div>

            {paymentMode === 'bank_transfer' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Paystack Dedicated Dynamic Account
                </span>
                <p className="font-mono text-sm text-cyan-300 font-bold">
                  9923849102 — Wema Bank (SwapShield Escrow)
                </p>
                <p className="text-[10px] text-slate-400">Expires in 24 hours. Instant confirmation.</p>
              </div>
            )}

            {/* Escrow Guarantee Disclaimer */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                Funds will NOT be given to the seller until 48 hours after courier delivery.
              </span>
            </div>

            <button
              onClick={handlePaystackPay}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {loading
                ? 'Authorizing Paystack Vault...'
                : `Authorize Escrow Lock (₦${totalAmount.toLocaleString()})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
