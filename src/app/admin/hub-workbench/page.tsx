"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Cpu, 
  BatteryMedium, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Smartphone,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface OrderLookup {
  id: string;
  total_escrow_amount: number;
  escrow_status: string;
  seller_name: string;
  buyer_name: string;
  listing: {
    brand: string;
    model: string;
    storage_capacity: string;
    battery_health_percentage: number;
    screen_status: string;
    face_id_or_biometrics: string;
    expected_hash: string;
  };
}

export default function HubWorkbenchPage() {
  const [searchQuery, setSearchQuery] = useState("ord_active_48h");
  const [order, setOrder] = useState<OrderLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bench Form States
  const [scannedImei, setScannedImei] = useState("");
  const [tamperSealNumber, setTamperSealNumber] = useState("");
  const [tamperSealIntact, setTamperSealIntact] = useState(false);
  const [notes, setNotes] = useState("");

  const [checklist, setChecklist] = useState({
    imeiMatched: false,
    batteryHealthMatched: false,
    screenAuthenticityConfirmed: false,
    faceIdOrBiometricsWorking: false,
    iCloudMdmClean: false,
    networkAndSimTested: false,
    housingConditionMatchesGrade: false,
  });

  // Order Fetch (attempts live DB API first, with fallback to demo simulated record)
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/escrow/${searchQuery.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.order) {
          const ord = data.data.order;
          setOrder({
            id: ord.id,
            total_escrow_amount: ord.total_escrow_amount,
            escrow_status: ord.escrow_status,
            seller_name: ord.seller?.full_name || "Chioma Okonkwo",
            buyer_name: ord.buyer?.full_name || "Oluwaseun Adeleke",
            listing: {
              brand: ord.listing?.brand || "Apple",
              model: ord.listing?.model || "MacBook Pro 14\" M2 Pro",
              storage_capacity: ord.listing?.storage_capacity || "512GB Space Gray",
              battery_health_percentage: ord.listing?.battery_health_percentage || 94,
              screen_status: ord.listing?.screen_status || "ORIGINAL",
              face_id_or_biometrics: ord.listing?.face_id_or_biometrics || "WORKING",
              expected_hash: ord.listing?.imei_or_serial_hash || "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
            },
          });
          setLoading(false);
          return;
        }
      }

      // Simulated fallback record matching
      setTimeout(() => {
        setOrder({
          id: searchQuery.trim(),
          total_escrow_amount: 850000,
          escrow_status: "DELIVERED_TESTING_PERIOD",
          seller_name: "Chukwudi Okafor",
          buyer_name: "Amina Bello",
          listing: {
            brand: "Apple",
            model: "iPhone 15 Pro Max",
            storage_capacity: "256GB Natural Titanium",
            battery_health_percentage: 94,
            screen_status: "ORIGINAL",
            face_id_or_biometrics: "WORKING",
            expected_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
          },
        });
        setLoading(false);
      }, 400);
    } catch {
      setLoading(false);
      setActionMessage({ type: "error", text: "Failed to locate order" });
    }
  };

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExecute = async (action: "APPROVE_RELEASE" | "REJECT_AND_FLAG_FRAUD") => {
    if (!order) return;
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          technicianId: "TECH-LAGOS-042",
          hubLocation: "IKEJA_COMPUTER_VILLAGE",
          scannedImeiOrSerial: scannedImei,
          tamperSealIntact,
          tamperSealNumber,
          checklist,
          physicalNotes: notes,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setActionMessage({ type: "success", text: data.message });
      setOrder(null);
      setScannedImei("");
      setTamperSealNumber("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing bench action";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormApprovable =
    tamperSealIntact &&
    scannedImei.length >= 8 &&
    checklist.iCloudMdmClean &&
    checklist.batteryHealthMatched &&
    checklist.screenAuthenticityConfirmed;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to SwapShield Platform
              </Link>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5" /> Hub Physical Verification Bench
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Computer Village Depot #01</h1>
            <p className="text-slate-400 text-sm">Station: Ikeja Otigba Hub | Technician ID: TECH-LAGOS-042</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Paystack Escrow Rail Active</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleLookup} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Scan Waybill Barcode, Escrow ID (e.g., ord_active_48h), or Order UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Fetch Order"}
          </button>
        </form>

        {/* Global Alert Messages */}
        {actionMessage && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            actionMessage.type === "success" 
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300" 
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}>
            {actionMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{actionMessage.text}</span>
          </div>
        )}

        {/* Workbench Body */}
        {order ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Device Dossier & Identity */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">Order Locked</span>
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-mono">
                    {order.escrow_status}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{order.listing.brand} {order.listing.model}</h3>
                  <p className="text-xs text-slate-400">{order.listing.storage_capacity}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Escrow Value:</span>
                    <span className="font-mono font-semibold text-emerald-400">₦{order.total_escrow_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Seller:</span>
                    <span>{order.seller_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyer:</span>
                    <span>{order.buyer_name}</span>
                  </div>
                </div>
              </div>

              {/* Expected Listing Specs */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reported Specs (Self-Declaration)</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Battery Health</span>
                    <span className="font-bold text-slate-200">{order.listing.battery_health_percentage}%</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Screen Grade</span>
                    <span className="font-bold text-slate-200">{order.listing.screen_status}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Biometrics</span>
                    <span className="font-bold text-slate-200">{order.listing.face_id_or_biometrics}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Diagnostics</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">3uTools OK</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Bound Security Hash</span>
                  <p className="font-mono text-[10px] text-slate-400 break-all select-all mt-0.5">
                    {order.listing.expected_hash}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Diagnostic Testing Checklist */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" /> Physical Diagnostic Checklist
              </h2>

              {/* Hardware Barcode & Tamper Seal Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Scan Hardware IMEI / Serial</label>
                  <input
                    type="text"
                    placeholder="Enter or scan IMEI 1..."
                    value={scannedImei}
                    onChange={(e) => setScannedImei(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Security Hologram Seal #</label>
                  <input
                    type="text"
                    placeholder="Seal ID (e.g. SL-88192)"
                    value={tamperSealNumber}
                    onChange={(e) => setTamperSealNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="tamperSeal"
                    checked={tamperSealIntact}
                    onChange={(e) => setTamperSealIntact(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="tamperSeal" className="text-xs text-slate-300 cursor-pointer">
                    Hologram security seal is completely intact over screw brackets (No technician tampering detected)
                  </label>
                </div>
              </div>

              {/* Checkboxes Matrix */}
              <div className="space-y-3">
                {[
                  { id: "iCloudMdmClean", label: "iCloud / Google FRP / MDM Clean", desc: "No supervisory locks, activation bypasses, or managed profiles." },
                  { id: "batteryHealthMatched", label: "Battery Health Matches Declaration", desc: `Cycle count and capacity aligns within ±2% of reported ${order.listing.battery_health_percentage}%.` },
                  { id: "screenAuthenticityConfirmed", label: "Display & True Tone Authenticity", desc: "True Tone functions, original OLED refresh verified, no aftermarket digitizer." },
                  { id: "faceIdOrBiometricsWorking", label: "Biometrics Hardware Operational", desc: "Face ID / Touch ID records and unlocks without camera array errors." },
                  { id: "networkAndSimTested", label: "Baseband / SIM Tray / Port Test", desc: "Physical MTN/Airtel SIM reads signal and Lightning/Type-C ports draw power." },
                  { id: "housingConditionMatchesGrade", label: "Cosmetic Match to Listing", desc: "Housing scratches, scuffs, and frame alignment reflect selected grade." },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCheckboxChange(item.id as keyof typeof checklist)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition ${
                      checklist[item.id as keyof typeof checklist]
                        ? "bg-emerald-950/20 border-emerald-800/60"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.id as keyof typeof checklist]}
                      readOnly
                      className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{item.label}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Physical Notes Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Technician Bench Notes</label>
                <textarea
                  rows={2}
                  placeholder="Record minor cosmetic notes, test jig observations, or reasons for rejection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleExecute("REJECT_AND_FLAG_FRAUD")}
                  disabled={submitting}
                  className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 font-semibold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject &amp; Freeze Escrow
                </button>

                <button
                  type="button"
                  onClick={() => handleExecute("APPROVE_RELEASE")}
                  disabled={submitting || !isFormApprovable}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> Sign-off &amp; Release Escrow
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 rounded-2xl p-16 text-center text-slate-500 space-y-3">
            <Smartphone className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">Scan a shipment barcode or search an Order ID above to begin bench verification.</p>
          </div>
        )}

      </div>
    </div>
  );
}
