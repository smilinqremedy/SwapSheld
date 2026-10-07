'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Lock
} from 'lucide-react';
import { PaystackBank } from '@/lib/paystack';

export interface VerifiedRecipientData {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  recipientCode: string;
}

interface BankVerificationCardProps {
  userId: string;
  onVerified: (data: VerifiedRecipientData) => void;
  initialData?: VerifiedRecipientData | null;
}

export const BankVerificationCard: React.FC<BankVerificationCardProps> = ({
  userId,
  onVerified,
  initialData
}) => {
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(true);
  const [selectedBankCode, setSelectedBankCode] = useState<string>('058'); // Default to GTBank
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<VerifiedRecipientData | null>(initialData || null);

  // Bank selector search filter state
  const [bankSearchQuery, setBankSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Load banks list on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBanks = async () => {
      try {
        setLoadingBanks(true);
        const res = await fetch('/api/banks');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setBanks(json.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load banks:', err);
      } finally {
        if (isMounted) setLoadingBanks(false);
      }
    };
    fetchBanks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Trigger auto-resolution when exactly 10 digits are typed and a bank is selected
  useEffect(() => {
    const cleaned = accountNumber.replace(/\D/g, '');
    if (cleaned.length === 10 && selectedBankCode && !verifiedData) {
      resolveAccount(cleaned, selectedBankCode);
    } else if (cleaned.length < 10) {
      setErrorMsg(null);
    }
  }, [accountNumber, selectedBankCode, verifiedData]);

  const resolveAccount = async (acct: string, bCode: string) => {
    setIsResolving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/banks/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: acct,
          bankCode: bCode,
          userId
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not resolve bank account details. Verify NUBAN and bank');
      }

      const verifiedResult: VerifiedRecipientData = {
        accountName: json.data.accountName,
        accountNumber: json.data.accountNumber,
        bankCode: json.data.bankCode,
        bankName: json.data.bankName,
        recipientCode: json.data.recipientCode
      };

      setVerifiedData(verifiedResult);
      onVerified(verifiedResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not resolve bank account details. Verify NUBAN and bank';
      setErrorMsg(msg);
      setVerifiedData(null);
    } finally {
      setIsResolving(false);
    }
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Digits only, max 10
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(digitsOnly);
    if (verifiedData) {
      setVerifiedData(null);
    }
  };

  const handleResetVerification = () => {
    setVerifiedData(null);
    setAccountNumber('');
    setErrorMsg(null);
  };

  const selectedBank = banks.find((b) => b.code === selectedBankCode) || {
    name: 'Guaranty Trust Bank',
    code: '058',
    slug: 'guaranty-trust-bank'
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Automated Payout Setup
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Paystack Direct Rail
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Verified NUBAN for automated release when the buyer's 48-hour testing timer elapses.
            </p>
          </div>
        </div>
      </div>

      {/* Verified State View */}
      {verifiedData ? (
        <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Account Verified &amp; Bound
                </span>
                <p className="text-sm font-extrabold text-slate-100 tracking-wide mt-0.5">
                  {verifiedData.accountName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetVerification}
              className="text-xs text-slate-400 hover:text-slate-200 underline flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw className="w-3 h-3" /> Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-900/40">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Bank</span>
              <span className="text-slate-200 font-semibold">{verifiedData.bankName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">NUBAN Account</span>
              <span className="text-slate-200 font-mono font-semibold">{verifiedData.accountNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80 bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-800/40">
            <Lock className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            <span>Escrow payouts for completed sales will be credited automatically to this account.</span>
          </div>
        </div>
      ) : (
        /* Input & Resolution Form */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Searchable Bank Selector */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-300">Select Nigerian Bank</label>
              
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={loadingBanks}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-200 flex items-center justify-between hover:border-slate-700 transition cursor-pointer"
              >
                <span className="truncate">
                  {loadingBanks ? 'Loading banks...' : selectedBank.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </button>

              {/* Dropdown Menu with Search */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-64 overflow-hidden flex flex-col">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search bank name (e.g. GTB, Kuda, Zenith)..."
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="overflow-y-auto space-y-0.5 flex-1 pr-1 custom-scrollbar">
                    {filteredBanks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => {
                          setSelectedBankCode(bank.code);
                          setIsDropdownOpen(false);
                          setBankSearchQuery('');
                          if (accountNumber.length === 10) {
                            resolveAccount(accountNumber, bank.code);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                          selectedBankCode === bank.code
                            ? 'bg-emerald-600/20 text-emerald-400 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{bank.name}</span>
                        {['058', '044', '057', '50211', '999992', '50515'].includes(bank.code) && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono ml-2">
                            Popular
                          </span>
                        )}
                      </button>
                    ))}
                    {filteredBanks.length === 0 && (
                      <div className="p-3 text-center text-xs text-slate-500">
                        No banks match &ldquo;{bankSearchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 10-digit NUBAN Account Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">10-Digit NUBAN Account Number</label>
                <span className="text-[10px] font-mono text-slate-500">
                  {accountNumber.length}/10 digits
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChange={handleAccountChange}
                  maxLength={10}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 tracking-wider"
                />
                {isResolving && (
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px]">Resolving...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Resolution Failed</p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Reassurance Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Real-time name resolution via Paystack. Funds are locked in escrow and paid out directly to this verified name.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
