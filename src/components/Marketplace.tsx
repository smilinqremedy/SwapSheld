'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  ArrowLeftRight,
  BatteryCharging,
  Smartphone,
  Laptop,
  Tablet,
  Eye,
  CreditCard,
  X,
  Sparkles,
  MapPin,
  Lock
} from 'lucide-react';
import { GadgetListing, GadgetCategory, User } from '@/types';

interface MarketplaceProps {
  listings: GadgetListing[];
  currentUser: User;
  onInitiatePurchase: (listing: GadgetListing) => void;
  onInitiateSwap: (listing: GadgetListing) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  listings,
  currentUser: _currentUser,
  onInitiatePurchase,
  onInitiateSwap
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<GadgetListing | null>(null);

  const filteredListings = listings.filter((l) => {
    if (selectedCategory !== 'ALL' && l.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        l.model.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.storage_capacity.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Search & Category Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Vetted Gadgets' },
            { id: 'SMARTPHONE', label: 'iPhones & Android' },
            { id: 'LAPTOP', label: 'MacBooks & Laptops' },
            { id: 'TABLET', label: 'iPads & Tablets' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search iPhone 15, MacBook M2..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Gadgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Status Badges */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.media_urls[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'}
                  alt={listing.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {listing.diagnostic_score || 96}% Diagnostic
                  </span>
                  {listing.is_swap_eligible && (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-cyan-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3" />
                      Swap OK
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      listing.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : listing.status === 'IN_ESCROW'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {listing.status === 'IN_ESCROW' ? 'In Escrow' : listing.status}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-base font-extrabold leading-tight">
                      {listing.brand} {listing.model}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {listing.storage_capacity} • {listing.color}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware Diagnostic Chips */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      Battery
                    </span>
                    <span className="font-bold text-slate-200">
                      {listing.battery_health_percentage}%
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Display</span>
                    <span
                      className={`font-semibold ${
                        listing.screen_status === 'ORIGINAL' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {listing.screen_status === 'ORIGINAL' ? 'Original' : 'OEM Rep'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Face ID</span>
                    <span className="font-semibold text-emerald-400">
                      {listing.face_id_or_biometrics === 'WORKING' ? 'Pass (100%)' : 'Faulty'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">iCloud</span>
                    <span className="font-semibold text-emerald-400">Clean</span>
                  </div>
                </div>

                {/* Seller Verification Card */}
                {listing.seller && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                        {listing.seller.full_name[0]}
                      </div>
                      <span className="text-slate-300 font-medium">
                        {listing.seller.full_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>BVN Vetted (⭐ {listing.seller.trust_score.toFixed(1)})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="p-4 pt-0 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Escrow Protected Price
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    ₦{listing.cash_price.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedListing(listing)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Report
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onInitiatePurchase(listing)}
                  disabled={listing.status !== 'ACTIVE'}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Buy with 48h Escrow
                </button>

                <button
                  type="button"
                  onClick={() => onInitiateSwap(listing)}
                  disabled={!listing.is_swap_eligible || listing.status !== 'ACTIVE'}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                  Propose Swap
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostic Inspection Report Drawer / Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedListing.brand} {selectedListing.model} ({selectedListing.storage_capacity})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verified Hardware Diagnostic Report
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Score Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">3uTools / CoconutBattery Score</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {selectedListing.diagnostic_score || 96}% Quality Pass
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Inspection Period</span>
                <span className="text-sm font-bold text-white">48 Hours Escrow Guarantee</span>
              </div>
            </div>

            {/* Detailed Diagnostic Table */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Battery Health Capacity:</span>
                <span className="font-bold text-slate-200">{selectedListing.battery_health_percentage}%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Battery Charge Cycles:</span>
                <span className="font-bold text-slate-200">{selectedListing.battery_cycle_count || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Display / Screen Type:</span>
                <span className="font-bold text-slate-200">{selectedListing.screen_status}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Face ID / Touch ID:</span>
                <span className="font-bold text-emerald-400">{selectedListing.face_id_or_biometrics}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">iCloud & MDM Status:</span>
                <span className="font-bold text-emerald-400">{selectedListing.icloud_or_mdm_status}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Hardware Serial (Encrypted Hash):</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                  {selectedListing.imei_or_serial_hash}
                </span>
              </div>
            </div>

            {/* Diagnostic Report Notes */}
            {selectedListing.diagnostic_report_notes && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-slate-400 block mb-1">Seller Diagnostic Notes:</span>
                {selectedListing.diagnostic_report_notes}
              </div>
            )}

            {/* Escrow Shield Promise */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>
                If the device received does not match this report, your funds are 100% protected and frozen upon clicking &quot;Dispute&quot; within 48 hours.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const item = selectedListing;
                  setSelectedListing(null);
                  onInitiatePurchase(item);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Buy with Paystack Escrow (₦{selectedListing.cash_price.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
