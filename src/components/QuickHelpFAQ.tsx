'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  tag: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'What happens to my money if the seller sends a phone with bad battery or replaced screen?',
    a: 'Your money is safe! On SwapShield, funds are locked in our Paystack vault and NEVER sent to the seller upon delivery. You have a 48-hour testing timer. If anything does not match the diagnostic report, you click "Report Defect / Dispute Escrow". The timer freezes immediately, we issue a prepaid return waybill to our Computer Village hub, and your escrow payment is 100% refunded to you.',
    tag: 'Buyer Protection'
  },
  {
    q: 'How does the Swap Calculator determine the cash top-up?',
    a: 'Our algorithmic engine checks benchmark market values for both devices in Nigerian Naira (NGN). It then automatically applies standard deductions: 12% cut if battery health is under 80%, 18% cut if the display is an aftermarket replacement, and 10% for cosmetic Grade C dings. The resulting cash difference is recommended as the fair top-up.',
    tag: 'Swap Engine'
  },
  {
    q: 'What is the 48-Hour Inspection Timer and when does it start?',
    a: 'The 48-hour timer starts the exact moment you receive the package from the courier or pick it up at a partner hub. You get a Termii SMS notification with a 6-point testing checklist (battery health, True Tone, Face ID, SIM slot test). If you are satisfied early, you can release funds manually, or it will auto-release to the seller once the 48 hours lapse.',
    tag: 'Escrow Vault'
  },
  {
    q: 'Can I drop off or collect my device at Computer Village instead of direct delivery?',
    a: 'Yes! SwapShield has certified physical hubs in Computer Village Ikeja (14 Otigba St), Yaba Tech District, Victoria Island, and Abuja Wuse II. A technician will run the 3uTools and True Tone test jig right in front of you on our bench.',
    tag: 'Inspection Hubs'
  },
  {
    q: 'How do sellers get paid once the inspection period passes?',
    a: 'Payouts are automated via Paystack Transfer Rail directly into the seller\'s verified Nigerian bank account (GTB, Zenith, Access, Kuda, etc.). Funds arrive within minutes of either buyer manual sign-off or the 48-hour auto-release timer expiring without dispute.',
    tag: 'Payouts'
  }
];

const GLOSSARY = [
  {
    term: 'True Tone',
    meaning: 'An Apple display calibration feature that automatically matches room lighting. If missing, it usually means the screen was replaced with a cheap non-OEM LCD.'
  },
  {
    term: '3uTools / CoconutBattery',
    meaning: 'Industry-standard diagnostic desktop software that reads the device’s internal motherboard chips to show genuine factory battery cycle counts and replaced hardware.'
  },
  {
    term: 'MDM & iCloud Clean',
    meaning: 'Confirms the device is free of remote company management locks (Mobile Device Management) or iCloud activation locks, meaning you can sign in and factory reset anytime safely.'
  },
  {
    term: 'Hashed IMEI / Serial',
    meaning: 'We cryptographically encrypt your gadget\'s serial number on public listings so bad actors cannot clone your IMEI, only revealing it to the buyer once funds are secured.'
  }
];

export const QuickHelpFAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          Customer Knowledge &amp; Support Hub
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Everything you need to know about trading devices safely on SwapShield.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {FAQS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'bg-slate-900 border-emerald-500/40 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    {item.tag}
                  </span>
                  <span className="text-sm font-bold text-white leading-snug">
                    {item.q}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gadget Jargon Demystified (Glossary) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3>Nigerian Tech Terms Demystified (What They Mean)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {GLOSSARY.map((g, i) => (
            <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400">{g.term}</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{g.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Help Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Need Live Help with an Escrow Deal?</h4>
            <p className="text-xs text-slate-400">
              Our Lagos &amp; Abuja escrow dispatchers are available Monday to Saturday (8am - 8pm).
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWhatsAppModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Chat on WhatsApp (+234)</span>
        </button>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Connect with SwapShield Support
            </h3>
            <p className="text-xs text-slate-300">
              Direct assistance with order verification, hub drop-off guidance, or courier tracking across Lagos &amp; Abuja.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
              WhatsApp: +234 (0) 803 123 4567
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close
              </button>
              <a
                href="https://wa.me/2348031234567?text=Hello%20SwapShield%2C%20I%20have%20a%20question%20about%20an%20escrow%20trade."
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
              >
                Open WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
