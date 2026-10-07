'use client';

import React from 'react';
import {
  Building,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BadgeCheck,
  Truck
} from 'lucide-react';
import { InspectionHub } from '@/types';

interface InspectionHubsViewProps {
  hubs: InspectionHub[];
}

export const InspectionHubsView: React.FC<InspectionHubsViewProps> = ({ hubs }) => {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Building className="w-3.5 h-3.5" />
          Physical Drop-Off &amp; Hardware Diagnostics Network
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          SwapShield Certified Inspection Hubs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Rather than shipping directly, drop off or test gadgets at our vetted partner hubs across Computer Village, Yaba, Victoria Island, and Abuja with on-site technician diagnostics.
        </p>
      </div>

      {/* Hub Service Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">3uTools Diagnostics Bench</h4>
            <p className="text-[11px] text-slate-400">LCD, Face ID &amp; cycle count testing</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">iCloud &amp; Police Check</h4>
            <p className="text-[11px] text-slate-400">Stolen device blacklist database scan</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Secure Neutral Handover</h4>
            <p className="text-[11px] text-slate-400">CCTV monitored drop-off &amp; pickup</p>
          </div>
        </div>
      </div>

      {/* Hub Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubs.map((hub) => (
          <div
            key={hub.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {hub.city}, {hub.state}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{hub.name}</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Hub
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{hub.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>
                  Station Agent: <strong className="text-white">{hub.agent_name}</strong> ({hub.agent_phone})
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{hub.operating_hours}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Available: Inspection &amp; Waybill Drop-Off</span>
              <button
                type="button"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                Select as Escrow Hub &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
