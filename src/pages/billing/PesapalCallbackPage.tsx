import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight, 
  Printer, 
  ExternalLink,
  Clock,
  Sparkles,
  Receipt,
  FileCheck
} from 'lucide-react';
import { PesapalClientService, type PesapalVerificationResult } from '../../services/pesapalClientService';
import { getSchoolCommercialSubscription, updateSchoolCommercialSubscription, getSchoolTrialLifecycle, TRIAL_LIFECYCLE_STORAGE_KEY } from '../../services/subscriptionCommercialService';
import { db } from '../../db/indexedDB';

export function PesapalCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [orderTrackingId, setOrderTrackingId] = useState('');
  const [orderMerchantReference, setOrderMerchantReference] = useState('');
  const [verificationResult, setVerificationResult] = useState<PesapalVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const trackingId = params.get('OrderTrackingId') || params.get('orderTrackingId') || '';
    const merchantRef = params.get('OrderMerchantReference') || params.get('orderMerchantReference') || '';

    setOrderTrackingId(trackingId);
    setOrderMerchantReference(merchantRef);

    if (trackingId) {
      performVerification(trackingId, merchantRef);
    } else {
      setLoading(false);
    }
  }, []);

  const performVerification = async (trackingId: string, merchantRef?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await PesapalClientService.verifyTransaction(trackingId, merchantRef);
      setVerificationResult(result);

      if (result.verified && result.transactionStatus === 'COMPLETED') {
        // Sync local client subscription
        const currentSub = await getSchoolCommercialSubscription();
        await updateSchoolCommercialSubscription({
          status: 'ACTIVE',
          paymentMethod: 'Card' as any,
          licenseKey: `SS-STD-2026-PESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          lastVerifiedAt: new Date().toISOString(),
        });

        // Update trial conversion status
        const trial = await getSchoolTrialLifecycle();
        trial.conversionStatus = 'CONVERTED_ANNUAL';
        trial.trialStatus = 'CONVERTED';
        localStorage.setItem(TRIAL_LIFECYCLE_STORAGE_KEY, JSON.stringify(trial));

        // Save receipt to local database
        if (result.receipt) {
          try {
            await db.paymentRecords.add({
              id: `pay-${Date.now()}`,
              schoolId: result.receipt.schoolId || 'sch-default',
              payerName: 'School Administrator',
              amountPaid: result.receipt.amount,
              paymentMethod: result.receipt.paymentMethod,
              referenceNumber: result.receipt.pesapalTrackingId,
              receiptNumber: result.receipt.receiptNumber,
              createdAt: result.receipt.settledAt,
              status: 'Completed',
              signatureSha256: result.receipt.signatureSha256,
            } as any);
          } catch {
            // DB logging optional
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify transaction with Pesapal');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTrackingId) {
      setError('Please enter a valid Pesapal Order Tracking ID');
      return;
    }
    performVerification(orderTrackingId, orderMerchantReference);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <div className="w-full max-w-xl">
        {/* SchoolSoul Official Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/schoolsoul-logo.svg" alt="SchoolSoul" className="w-10 h-10 shadow-lg rounded-xl" />
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
              SchoolSoul <span className="text-emerald-400 font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">PESAPAL 3.0</span>
            </h1>
            <p className="text-[11px] text-slate-400">Uganda & East Africa Production Payment Settlement</p>
          </div>
        </div>

        {/* Main Verification Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
          {/* Decorative Corner Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* 1. Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
                <ShieldCheck className="w-6 h-6 text-emerald-300 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Authoritative Settlement in Progress</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Connecting to Pesapal API 3.0 secure verification gateway to inspect transaction status and validate cryptographically...
                </p>
              </div>
              {orderTrackingId && (
                <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  Tracking ID: {orderTrackingId}
                </span>
              )}
            </div>
          )}

          {/* 2. Success / Verified Settlement */}
          {!loading && verificationResult?.verified && verificationResult.transactionStatus === 'COMPLETED' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Payment Verified & Subscription Active
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              {/* Verified Digital Receipt Box */}
              {verificationResult.receipt && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" /> Official e-Receipt:
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {verificationResult.receipt.receiptNumber}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Pesapal Tracking ID:</span>
                    <span className="font-mono text-slate-200">{verificationResult.receipt.pesapalTrackingId}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant Reference:</span>
                    <span className="font-mono text-slate-200">{verificationResult.receipt.merchantReference}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement Method:</span>
                    <span className="text-slate-200 font-semibold">{verificationResult.receipt.paymentMethod}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-bold text-white text-sm">
                      {verificationResult.receipt.currency} {verificationResult.receipt.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement Date:</span>
                    <span className="text-slate-300">
                      {new Date(verificationResult.receipt.settledAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>SHA-256 Digital Checksum:</span>
                      <span className="font-mono">{verificationResult.receipt.signatureSha256.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Tax Receipt
                </button>

                <a
                  href="/?tab=commercial"
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  Enter Commercial Center <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* 3. Pending Settlement State */}
          {!loading && verificationResult && verificationResult.transactionStatus === 'PENDING' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Awaiting Final Confirmation</h3>
                  <p className="text-xs text-amber-300">
                    {verificationResult.message || 'Waiting for payment provider network authorization.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
                <p>
                  If you paid via <strong>MTN Mobile Money</strong> or <strong>Airtel Money</strong>, check your mobile phone for the USSD prompt to enter your PIN.
                </p>
                <p className="text-slate-400">
                  Once completed, click <strong>"Check Status Again"</strong> below to confirm.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => performVerification(orderTrackingId, orderMerchantReference)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Check Status Again
                </button>
              </div>
            </div>
          )}

          {/* 4. Failed Transaction */}
          {!loading && verificationResult && verificationResult.transactionStatus === 'FAILED' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Transaction Unsuccessful</h3>
                  <p className="text-xs text-rose-300">
                    {verificationResult.message || 'The payment was declined or timed out.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <p>No funds were deducted from your account. You can retry with a different payment method or contact your issuing bank.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href="/?tab=commercial"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2"
                >
                  Return to Commercial Center
                </a>
              </div>
            </div>
          )}

          {/* 5. Manual Tracking Form if Opened Without Query Params */}
          {!loading && !verificationResult && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" /> Verify Pesapal Transaction
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your Pesapal Order Tracking ID below to independently verify settlement and retrieve your paid subscription receipt.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/50 rounded-xl text-xs text-rose-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleManualVerify} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Pesapal Order Tracking ID:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. b3e9196b-6fcf-49b8-b2a6-..."
                    value={orderTrackingId}
                    onChange={(e) => setOrderTrackingId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Merchant Reference (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. SS-UG-SCH001-INV2026-..."
                    value={orderMerchantReference}
                    onChange={(e) => setOrderMerchantReference(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" /> Verify Settlement
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>SchoolSoul is licensed & compliant with East African digital commerce regulations.</p>
          <p className="text-[11px]">Direct integration powered by Pesapal API 3.0 REST Gateway.</p>
        </div>
      </div>
    </div>
  );
}
