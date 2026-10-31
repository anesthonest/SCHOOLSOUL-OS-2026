import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  WifiOff,
  Copy,
  Printer,
  X,
  ExternalLink,
  Lock,
  Clock,
  FileText,
} from 'lucide-react';

export type PaymentMethodType = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'PESAPAL' | 'BANK_PAYMENT';

export interface PaymentItemDetails {
  purpose: 'SUBSCRIPTION_RENEWAL' | 'PLAN_UPGRADE' | 'TRIAL_CONVERSION' | 'STUDENT_FEES';
  title: string;
  subtitle?: string;
  schoolId: string;
  schoolName: string;
  amount: number;
  currency: string;
  studentId?: string;
  studentName?: string;
  invoiceId?: string;
  billingCycle?: 'Monthly' | 'Annual' | 'Term' | 'Termly';
  studentCount?: number;
}

export interface UniversalPaymentSelectorProps {
  item: PaymentItemDetails;
  initialMethod?: PaymentMethodType;
  onSuccess: (receipt: {
    receiptNumber: string;
    paymentReference: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethodType;
    paidAt: string;
    signatureSha256: string;
  }) => void;
  onCancel: () => void;
}

export const UniversalPaymentSelector: React.FC<UniversalPaymentSelectorProps> = ({
  item,
  initialMethod = 'MTN_MOMO',
  onSuccess,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(initialMethod);
  const [phone, setPhone] = useState('');
  const [payerName, setPayerName] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Bank Payment Fields
  const [bankDepositRef, setBankDepositRef] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankDetailsData, setBankDetailsData] = useState<{
    hasConfiguredDetails: boolean;
    bankDetails: { bankName: string; accountName: string; accountNumber: string; branch?: string; swiftCode?: string } | null;
    genericInstructions: string;
  } | null>(null);

  // Flow State: 'IDLE' | 'INITIATING' | 'WAITING_USSD' | 'BANK_PENDING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'
  const [flowState, setFlowState] = useState<'IDLE' | 'INITIATING' | 'WAITING_USSD' | 'BANK_PENDING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<any | null>(null);
  const [pesapalRedirectUrl, setPesapalRedirectUrl] = useState<string | null>(null);
  const [pesapalTrackingId, setPesapalTrackingId] = useState<string | null>(null);

  // Polling ref
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to network changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch verified bank details or generic instructions
    fetch('/api/billing/bank/details')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setBankDetailsData(data);
        }
      })
      .catch((e) => console.warn('Could not fetch bank details:', e));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Detect operator from phone number
  const detectedOperator = React.useMemo(() => {
    const digits = phone.replace(/[^0-9]/g, '');
    let localDigits = digits;
    if (digits.startsWith('256')) {
      localDigits = digits.substring(3);
    } else if (digits.startsWith('0')) {
      localDigits = digits.substring(1);
    }

    if (localDigits.length >= 2) {
      const prefix = localDigits.substring(0, 2);
      if (['77', '78', '76', '39'].includes(prefix)) {
        return 'MTN';
      }
      if (['70', '75', '74'].includes(prefix)) {
        return 'AIRTEL';
      }
    }
    return null;
  }, [phone]);

  // When detected operator changes, adjust method if relevant
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const digits = val.replace(/[^0-9]/g, '');
    let localDigits = digits;
    if (digits.startsWith('256')) localDigits = digits.substring(3);
    else if (digits.startsWith('0')) localDigits = digits.substring(1);

    if (localDigits.length >= 2) {
      const prefix = localDigits.substring(0, 2);
      if (['77', '78', '76', '39'].includes(prefix) && selectedMethod === 'AIRTEL_MONEY') {
        setSelectedMethod('MTN_MOMO');
      } else if (['70', '75', '74'].includes(prefix) && selectedMethod === 'MTN_MOMO') {
        setSelectedMethod('AIRTEL_MONEY');
      }
    }
  };

  // Poll for transaction verification (MTN / Airtel)
  const startPollingVerification = (ref: string, method: 'MTN_MOMO' | 'AIRTEL_MONEY') => {
    const endpoint = method === 'MTN_MOMO' ? '/api/billing/mtn/verify' : '/api/billing/airtel/verify';
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds (every 2s)

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentRef: ref, schoolId: item.schoolId }),
        });
        const data = await res.json();

        if (data.status === 'SUCCESS' && data.verified) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setFlowState('SUCCESS');
          setVerifiedReceipt(data.receipt);
          onSuccess(data.receipt);
        } else if (data.status === 'FAILED' || data.status === 'REJECTED' || data.status === 'EXPIRED') {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setFlowState('FAILED');
          setErrorMessage(data.message || 'Payment request was declined or timed out.');
        } else {
          // Still pending
          if (attempts >= maxAttempts) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setFlowState('FAILED');
            setErrorMessage('Payment verification timed out. If funds were deducted, your balance will update automatically upon telco callback.');
          }
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  // Instant sandbox simulate for local test runs
  const handleSimulateApproval = async () => {
    if (!paymentRef) return;
    setFlowState('VERIFYING');
    setStatusMessage('Simulating approval in sandbox test environment...');

    const endpoint = selectedMethod === 'MTN_MOMO' ? '/api/billing/mtn/sandbox-test' : '/api/billing/airtel/sandbox-test';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRef, schoolId: item.schoolId }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setFlowState('SUCCESS');
        setVerifiedReceipt(data.receipt);
        onSuccess(data.receipt);
      } else {
        setFlowState('FAILED');
        setErrorMessage(data.message || 'Simulation failed');
      }
    } catch (err: any) {
      setFlowState('FAILED');
      setErrorMessage(err.message || 'Simulation network error');
    }
  };

  // Initiate Payment
  const handleInitiate = async () => {
    if (!isOnline) {
      setErrorMessage('Payment requires an internet connection. Mobile Money and Pesapal gateways cannot process offline transactions.');
      return;
    }

    setErrorMessage(null);
    setFlowState('INITIATING');

    try {
      if (selectedMethod === 'MTN_MOMO' || selectedMethod === 'AIRTEL_MONEY') {
        if (!phone || phone.trim().length < 9) {
          setFlowState('IDLE');
          setErrorMessage('Please enter a valid Ugandan mobile number (e.g. 0772 123 456 or 0752 123 456).');
          return;
        }

        const endpoint = selectedMethod === 'MTN_MOMO' ? '/api/billing/mtn/initiate' : '/api/billing/airtel/initiate';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: item.amount,
            currency: item.currency,
            phone: phone.trim(),
            schoolId: item.schoolId,
            schoolName: item.schoolName,
            purpose: item.purpose,
            invoiceId: item.invoiceId,
            studentId: item.studentId,
            studentName: item.studentName,
            payerName: payerName || item.schoolName,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setFlowState('FAILED');
          setErrorMessage(data.message || 'Payment initiation failed. Please check the phone number and try again.');
          return;
        }

        setPaymentRef(data.paymentRef);
        setFlowState('WAITING_USSD');
        setStatusMessage(
          data.promptInstructions ||
            (selectedMethod === 'MTN_MOMO'
              ? 'Payment prompt sent! Please enter your MTN MoMo PIN on your phone or dial *165# to approve.'
              : 'Payment prompt sent! Please enter your Airtel Money PIN on your phone or dial *185# to approve.')
        );

        // Start server verification polling
        startPollingVerification(data.paymentRef, selectedMethod);
      } else if (selectedMethod === 'PESAPAL') {
        const response = await fetch('/api/billing/pesapal/submit-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId: item.schoolId,
            schoolName: item.schoolName,
            billingCycle: item.billingCycle || 'Annual',
            planTier: 'Standard',
            currency: item.currency,
            countryCode: 'UG',
            customerEmail: phone.includes('@') ? phone : 'billing@schoolsoul.ug',
            customerPhone: !phone.includes('@') && phone ? phone : '+256772123456',
            customerName: payerName || item.schoolName,
            invoiceId: item.invoiceId,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setFlowState('FAILED');
          setErrorMessage(data.message || 'Failed to initialize Pesapal gateway order.');
          return;
        }

        setPesapalRedirectUrl(data.redirectUrl);
        setPesapalTrackingId(data.orderTrackingId);
        setFlowState('WAITING_USSD');
        setStatusMessage('Pesapal secure payment session created. Complete your payment in the browser window.');

        if (data.redirectUrl) {
          window.open(data.redirectUrl, '_blank');
        }
      } else if (selectedMethod === 'BANK_PAYMENT') {
        if (!bankDepositRef.trim()) {
          setFlowState('IDLE');
          setErrorMessage('Please enter your Bank Deposit Slip Reference Number or Bank Transaction ID.');
          return;
        }

        // 1. Initiate Bank Payment tracking
        const initRes = await fetch('/api/billing/bank/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: item.amount,
            currency: item.currency,
            depositorName: payerName || item.schoolName,
            depositorContact: phone,
            schoolId: item.schoolId,
            schoolName: item.schoolName,
            purpose: item.purpose,
            invoiceId: item.invoiceId,
            studentId: item.studentId,
            studentName: item.studentName,
          }),
        });

        const initData = await initRes.json();
        if (!initRes.ok || !initData.success) {
          setFlowState('FAILED');
          setErrorMessage(initData.error || 'Could not initiate bank transfer payment.');
          return;
        }

        // 2. Submit Deposit Proof
        const confirmRes = await fetch('/api/billing/bank/confirm-reference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentRef: initData.paymentRef,
            depositReference: bankDepositRef.trim(),
            depositorName: payerName || item.schoolName,
            bankBranch: bankBranch.trim(),
          }),
        });

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok || !confirmData.success) {
          setFlowState('FAILED');
          setErrorMessage(confirmData.error || 'Failed to submit deposit slip reference.');
          return;
        }

        setPaymentRef(initData.paymentRef);
        setFlowState('BANK_PENDING');
        setStatusMessage(confirmData.message);
      }
    } catch (err: any) {
      setFlowState('FAILED');
      setErrorMessage(err.message || 'Network error initiating payment.');
    }
  };

  // Formatted price
  const formattedAmount = `${item.currency} ${Number(item.amount).toLocaleString()}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl text-slate-100 antialiased space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Complete Payment</h2>
            <p className="text-xs text-slate-400">{item.title}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
          aria-label="Close payment modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Offline Warning Banner */}
      {!isOnline && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
          <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Payment requires an internet connection</span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Mobile Money and Pesapal gateways cannot process offline transactions. Please reconnect to Wi-Fi or cellular data to proceed.
            </p>
          </div>
        </div>
      )}

      {/* Item Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">School / Institution:</span>
          <span className="text-white font-semibold">{item.schoolName}</span>
        </div>
        {item.studentName && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Student Account:</span>
            <span className="text-blue-300 font-semibold">{item.studentName} ({item.studentId})</span>
          </div>
        )}
        {item.studentCount && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Licensed Quota:</span>
            <span className="text-slate-300 font-medium">{item.studentCount} Students</span>
          </div>
        )}
        {item.billingCycle && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Billing Cycle:</span>
            <span className="text-slate-300 font-medium">{item.billingCycle}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/70">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Total Due:</span>
          <span className="text-lg font-extrabold text-emerald-400">{formattedAmount}</span>
        </div>
      </div>

      {/* Payment Method Selector Buttons (4 FIRST-CLASS RAILS) */}
      {flowState === 'IDLE' && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Select Payment Method:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. MTN Mobile Money */}
            <button
              type="button"
              onClick={() => setSelectedMethod('MTN_MOMO')}
              className={`p-3 rounded-2xl border text-left transition-all min-h-[48px] flex flex-col justify-between cursor-pointer ${
                selectedMethod === 'MTN_MOMO'
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">UG *165#</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-white">[ MTN Mobile Money ]</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Instant push prompt</div>
              </div>
            </button>

            {/* 2. Airtel Money */}
            <button
              type="button"
              onClick={() => setSelectedMethod('AIRTEL_MONEY')}
              className={`p-3 rounded-2xl border text-left transition-all min-h-[48px] flex flex-col justify-between cursor-pointer ${
                selectedMethod === 'AIRTEL_MONEY'
                  ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10 ring-1 ring-rose-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                <span className="text-[10px] font-mono text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10">UG *185#</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-white">[ Airtel Money ]</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Instant push prompt</div>
              </div>
            </button>

            {/* 3. Pesapal */}
            <button
              type="button"
              onClick={() => setSelectedMethod('PESAPAL')}
              className={`p-3 rounded-2xl border text-left transition-all min-h-[48px] flex flex-col justify-between cursor-pointer ${
                selectedMethod === 'PESAPAL'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">API 3.0</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-white">[ Pesapal ]</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Card / MoMo / Bank</div>
              </div>
            </button>

            {/* 4. Bank Payment */}
            <button
              type="button"
              onClick={() => setSelectedMethod('BANK_PAYMENT')}
              className={`p-3 rounded-2xl border text-left transition-all min-h-[48px] flex flex-col justify-between cursor-pointer ${
                selectedMethod === 'BANK_PAYMENT'
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
                <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10">Manual</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-white">[ Bank Payment ]</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bank transfer / slip</div>
              </div>
            </button>
          </div>

          {/* Form Fields: Mobile Money / Pesapal */}
          {selectedMethod !== 'BANK_PAYMENT' && (
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {selectedMethod === 'PESAPAL' ? 'Billing Contact (Phone or Email):' : 'Subscriber Mobile Money Number:'}
                  </label>
                  {detectedOperator && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        detectedOperator === 'MTN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {detectedOperator} Network Detected
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={selectedMethod === 'PESAPAL' ? 'e.g. 0772 123 456 or finance@school.ac.ug' : 'e.g. 0772 123 456'}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors min-h-[48px]"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {selectedMethod === 'MTN_MOMO' && 'Integrated via MTN MoMo Open API. A USSD push prompt will appear on your phone asking for your PIN.'}
                  {selectedMethod === 'AIRTEL_MONEY' && 'Integrated via Airtel Money API. A USSD push prompt will appear on your phone asking for your PIN.'}
                  {selectedMethod === 'PESAPAL' && 'Integrated via Pesapal Payment Gateway. You will be redirected to the Pesapal encrypted payment gateway.'}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Payer / Guardian Full Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Namubiru"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors min-h-[48px]"
                />
              </div>
            </div>
          )}

          {/* Form Fields: Bank Payment */}
          {selectedMethod === 'BANK_PAYMENT' && (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-bold">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Bank Payment Instructions</span>
                </div>
                {bankDetailsData?.hasConfiguredDetails && bankDetailsData.bankDetails ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank:</span>
                      <span className="font-bold text-white">{bankDetailsData.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Name:</span>
                      <span className="font-semibold text-white">{bankDetailsData.bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Number:</span>
                      <span className="font-mono font-bold text-blue-400">{bankDetailsData.bankDetails.accountNumber}</span>
                    </div>
                    {bankDetailsData.bankDetails.branch && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Branch:</span>
                        <span>{bankDetailsData.bankDetails.branch}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {bankDetailsData?.genericInstructions ||
                      'Bank Payment: Manual bank transfer / payment confirmation. Please request official institutional bank details from the school administration/bursary or submit your bank deposit slip reference below.'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Bank Deposit Slip No. / Transaction ID: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEP-2026-98124 or FT26019948"
                  value={bankDepositRef}
                  onChange={(e) => setBankDepositRef(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Depositor Full Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. John Mukasa"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Bank Branch / Origin (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. Kampala Main Branch"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors min-h-[48px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WAITING FOR USSD PROMPT / VERIFYING STATE */}
      {(flowState === 'WAITING_USSD' || flowState === 'VERIFYING') && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center animate-pulse border border-emerald-500/20">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {flowState === 'VERIFYING' ? 'Verifying Digital Transaction...' : 'Awaiting Phone Confirmation'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{statusMessage}</p>
          </div>

          {paymentRef && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
              <span>Ref:</span>
              <span className="text-emerald-400 font-bold">{paymentRef}</span>
            </div>
          )}

          {/* Pesapal External Redirect Button if applicable */}
          {selectedMethod === 'PESAPAL' && pesapalRedirectUrl && (
            <div className="pt-2">
              <a
                href={pesapalRedirectUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg min-h-[48px]"
              >
                Open Pesapal Checkout <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Dev / Sandbox Test simulation helper */}
          {paymentRef && (selectedMethod === 'MTN_MOMO' || selectedMethod === 'AIRTEL_MONEY') && (
            <div className="pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleSimulateApproval}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Simulate Sandbox Approval (Test Mode)
              </button>
            </div>
          )}
        </div>
      )}

      {/* BANK PAYMENT PENDING VERIFICATION STATE */}
      {flowState === 'BANK_PENDING' && (
        <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bank Payment: Pending Verification</h3>
              <p className="text-xs text-blue-300/80">Deposit reference registered for reconciliation.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Tracking Reference:</span>
              <span className="font-mono text-blue-400 font-bold">{paymentRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deposit Slip No:</span>
              <span className="font-mono text-white font-semibold">{bankDepositRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Due:</span>
              <span className="font-extrabold text-white">{formattedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                PENDING VERIFICATION
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              An institutional administrator or bursar must review and approve this bank deposit against school statements before settlement is marked as complete.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Acknowledgment
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl min-h-[48px] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS STATE (VERIFIED & SETTLED) */}
      {flowState === 'SUCCESS' && verifiedReceipt && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment Verified & Settled</h3>
              <p className="text-xs text-emerald-300/80">Transaction officially stamped on authoritative ledger.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Official Receipt:</span>
              <span className="font-mono text-emerald-400 font-bold">{verifiedReceipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Reference:</span>
              <span className="font-mono text-slate-300">{verifiedReceipt.paymentReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Method:</span>
              <span className="text-slate-200 font-semibold">{verifiedReceipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Settled Amount:</span>
              <span className="font-extrabold text-white">
                {verifiedReceipt.currency} {Number(verifiedReceipt.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-slate-300">{new Date(verifiedReceipt.paidAt).toLocaleString()}</span>
            </div>
            {verifiedReceipt.signatureSha256 && (
              <div className="pt-2 border-t border-slate-800 text-[10px]">
                <span className="text-slate-500 block">Digital SHA-256 Audit Seal:</span>
                <span className="font-mono text-emerald-400 break-all">{verifiedReceipt.signatureSha256}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FAILED STATE */}
      {flowState === 'FAILED' && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Payment Could Not Be Completed</h3>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed">{errorMessage}</p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFlowState('IDLE')}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl min-h-[48px] cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-800 text-slate-300 text-xs font-semibold rounded-2xl min-h-[48px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Notice in IDLE */}
      {flowState === 'IDLE' && errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Footer in IDLE */}
      {flowState === 'IDLE' && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors min-h-[48px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInitiate}
            disabled={!isOnline}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer"
          >
            <span>
              {selectedMethod === 'MTN_MOMO'
                ? 'Proceed with MTN MoMo'
                : selectedMethod === 'AIRTEL_MONEY'
                ? 'Proceed with Airtel Money'
                : selectedMethod === 'PESAPAL'
                ? 'Proceed with Pesapal'
                : 'Submit Bank Transfer Proof'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Trust & Security Badge */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
        <Lock className="w-3 h-3 text-emerald-500" />
        <span>256-Bit Encrypted &bull; Server-Authoritative Settlement &bull; Zero Fake State</span>
      </div>
    </div>
  );
};
