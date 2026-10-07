'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ArrowLeftRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
  BatteryCharging,
  Cpu,
  MapPin,
  Smartphone,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  User,
  GadgetListing,
  EscrowOrder,
  InspectionHub,
  DeviceValuationInput
} from '@/types';
import { Navbar } from '@/components/Navbar';
import { Marketplace } from '@/components/Marketplace';
import { SwapCalculator } from '@/components/SwapCalculator';
import { ListingWizard } from '@/components/ListingWizard';
import { EscrowVault } from '@/components/EscrowVault';
import { InspectionHubsView } from '@/components/InspectionHubsView';
import { DisputesView } from '@/components/DisputesView';
import { SimulationBar } from '@/components/SimulationBar';
import { PaystackCheckoutModal } from '@/components/PaystackCheckoutModal';
import { DisputeModal } from '@/components/DisputeModal';
import { HowItWorks } from '@/components/HowItWorks';
import { QuickHelpFAQ } from '@/components/QuickHelpFAQ';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('marketplace');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<GadgetListing[]>([]);
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [hubs, setHubs] = useState<InspectionHub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [checkoutListing, setCheckoutListing] = useState<GadgetListing | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<EscrowOrder | null>(null);

  // Load all initial state
  const loadData = async () => {
    try {
      // 1. Listings
      const listRes = await fetch('/api/listings');
      const listData = await listRes.json();
      if (listData.success) setListings(listData.data);

      // 2. Hubs
      const hubRes = await fetch('/api/hubs');
      const hubData = await hubRes.json();
      if (hubData.success) setHubs(hubData.data);

      // 3. Mock users from first listing's seller or hardcoded
      const u1: User = {
        id: 'usr_001_seun',
        email: 'seun.adeleke@gmail.com',
        phone_number: '+2348031234567',
        full_name: 'Oluwaseun Adeleke',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bvn_verified: true,
        nin_verified: true,
        trust_score: 4.95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const u2: User = {
        id: 'usr_002_chioma',
        email: 'chioma.okonkwo@creatives.ng',
        phone_number: '+2348129876543',
        full_name: 'Chioma Okonkwo',
        avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
        bvn_verified: true,
        nin_verified: true,
        trust_score: 4.90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUsers([u1, u2]);
      if (!currentUser) setCurrentUser(u1);

      // 4. Fetch orders
      const ordRes = await fetch('/api/escrow/ord_active_48h');
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders([ordData.data.order]);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitiatePurchase = (listing: GadgetListing) => {
    setCheckoutListing(listing);
  };

  const handleInitiateSwap = (listing: GadgetListing) => {
    setActiveTab('calculator');
  };

  const handleListingCreated = (newListing: GadgetListing) => {
    setListings((prev) => [newListing, ...prev]);
    setActiveTab('marketplace');
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Initializing SwapShield Escrow Engine...</p>
        </div>
      </div>
    );
  }

  const activeEscrowCount = orders.filter(
    (o) => o.escrow_status === 'DELIVERED_TESTING_PERIOD' || o.escrow_status === 'FUNDS_LOCKED'
  ).length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col pb-24">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        activeEscrowOrdersCount={activeEscrowCount}
      />

      {/* Hero Section (Visible when on Marketplace tab) */}
      {activeTab === 'marketplace' && (
        <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#070b12] to-[#070b12] py-12 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Vetted Gadget Swap &amp; 48-Hour Inspection Escrow</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Trade iPhones &amp; MacBooks in Nigeria{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Without Fear of Scams.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Standardized hardware diagnostic listings, algorithmic swap valuations, and Paystack escrow protection with a <strong>strict 48-hour testing timer</strong> before funds reach the seller.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('calculator')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Calculate Gadget Swap Delta
              </button>

              <button
                onClick={() => setActiveTab('escrow')}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                Live 48h Escrow Vault ({activeEscrowCount} Active)
              </button>
            </div>

            {/* Nigerian Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 text-left">
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">48h Testing Window</h4>
                  <p className="text-[11px] text-slate-400">Test hardware before payout</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Paystack Escrow</h4>
                  <p className="text-[11px] text-slate-400">Funds locked until verified</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <BatteryCharging className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">3uTools Diagnostics</h4>
                  <p className="text-[11px] text-slate-400">Zero undisclosed repairs</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Computer Village Hubs</h4>
                  <p className="text-[11px] text-slate-400">Physical inspection depots</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area based on Tab */}
      <main className="flex-1">
        {activeTab === 'how-it-works' && (
          <HowItWorks
            onGetStarted={() => setActiveTab('marketplace')}
            onTryCalculator={() => setActiveTab('calculator')}
          />
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-12">
            <Marketplace
              listings={listings}
              currentUser={currentUser}
              onInitiatePurchase={handleInitiatePurchase}
              onInitiateSwap={handleInitiateSwap}
            />
            <HowItWorks
              onGetStarted={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onTryCalculator={() => setActiveTab('calculator')}
            />
            <QuickHelpFAQ />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-12">
            <SwapCalculator
              currentUser={currentUser}
              availableListings={listings}
              onInitiateEscrowSwap={({ offeredDevice, cashTopup }) => {
                setActiveTab('escrow');
              }}
            />
            <QuickHelpFAQ />
          </div>
        )}

        {activeTab === 'list-gadget' && (
          <ListingWizard
            currentUser={currentUser}
            onListingCreated={handleListingCreated}
            onCancel={() => setActiveTab('marketplace')}
          />
        )}

        {activeTab === 'escrow' && (
          <EscrowVault
            orders={orders}
            currentUser={currentUser}
            onRefreshOrders={loadData}
            onOpenDispute={(order) => setDisputeOrder(order)}
          />
        )}

        {activeTab === 'hubs' && <InspectionHubsView hubs={hubs} />}

        {activeTab === 'disputes' && (
          <DisputesView orders={orders} onRefresh={loadData} />
        )}
      </main>

      {/* Modals */}
      {checkoutListing && (
        <PaystackCheckoutModal
          listing={checkoutListing}
          currentUser={currentUser}
          onClose={() => setCheckoutListing(null)}
          onPaymentSuccess={(orderId) => {
            setCheckoutListing(null);
            loadData();
            setActiveTab('escrow');
          }}
        />
      )}

      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          currentUser={currentUser}
          onClose={() => setDisputeOrder(null)}
          onDisputeFiled={() => {
            setDisputeOrder(null);
            loadData();
            setActiveTab('disputes');
          }}
        />
      )}

      {/* Simulation Sandbox Bar for evaluating webhooks, fast-forwarding timers & SMS logs */}
      <SimulationBar onRefreshAll={loadData} />
    </div>
  );
}
