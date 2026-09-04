import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  DollarSign,
  ShieldCheck,
  Clock,
  Landmark,
  Building2,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import {
  getStudentFeeAccounts,
  processPayment,
  initiateMobileMoneyPrompt,
  confirmMobileMoneyPayment,
  getPaymentRecords,
  formatUGX,
} from '../services/financeApi';
import type { StudentFeeAccount, PaymentRecord, PaymentMethod, MobileMoneyRequest } from '../types';

export const PaymentProcessingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<StudentFeeAccount[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);

  // Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeAccount | null>(null);

  // Form
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [momoNumber, setMomoNumber] = useState('0772123456');
  const [bankName, setBankName] = useState('Stanbic Bank Uganda');
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');

  // Mobile Money STK Push Simulation State
  const [momoRequest, setMomoRequest] = useState<MobileMoneyRequest | null>(null);
  const [isPromptingMoMo, setIsPromptingMoMo] = useState(false);
  const [momoCountdown, setMomoCountdown] = useState(15);

  // Generated Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, pays] = await Promise.all([
        getStudentFeeAccounts(),
        getPaymentRecords(),
      ]);
      setAccounts(accs);
      setRecentPayments(pays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = accounts.filter(
    (a) =>
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStudent = (acc: StudentFeeAccount) => {
    setSelectedStudent(acc);
    setAmountPaid(acc.outstandingBalanceUGX > 0 ? acc.outstandingBalanceUGX : 100000);
  };

  // Submit Standard Cash / Bank Payment
  const handleProcessStandardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amountPaid || Number(amountPaid) <= 0) return;

    try {
      const { payment } = await processPayment({
        studentId: selectedStudent.studentId,
        amountPaidUGX: Number(amountPaid),
        paymentMethod,
        transactionReference: txRef,
        bankName: paymentMethod.includes('Bank') ? bankName : undefined,
        notes,
        cashierName: 'Akwero Sarah (Bursar)',
        cashierId: 'usr-bursar-1',
      });

      setActiveReceipt(payment);
      setSelectedStudent(null);
      setAmountPaid('');
      setTxRef('');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Mobile Money STK Push Simulation
  const handleInitiateMoMo = async () => {
    if (!selectedStudent || !amountPaid || Number(amountPaid) <= 0) return;

    try {
      const req = await initiateMobileMoneyPrompt({
        provider: paymentMethod === 'Airtel Money' ? 'Airtel Money' : 'MTN Mobile Money',
        phoneNumber: momoNumber,
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.studentName,
        amountUGX: Number(amountPaid),
        cashierName: 'Akwero Sarah (Bursar)',
        cashierId: 'usr-bursar-1',
      });

      setMomoRequest(req);
      setIsPromptingMoMo(true);
      setMomoCountdown(15);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Parent Approving Mobile Money USSD Prompt on phone
  const handleConfirmMoMoSimulated = async (isApproved: boolean) => {
    if (!momoRequest) return;

    try {
      const { request, payment } = await confirmMobileMoneyPayment(
        momoRequest.id,
        isApproved,
        'Akwero Sarah (Bursar)',
        'usr-bursar-1'
      );

      setIsPromptingMoMo(false);
      setMomoRequest(null);

      if (isApproved && payment) {
        setActiveReceipt(payment);
        setSelectedStudent(null);
        setAmountPaid('');
      } else {
        alert('Mobile Money payment was rejected or cancelled on phone.');
      }

      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const copySmsText = () => {
    if (!activeReceipt) return;
    const txt = `SCHOOLSOUL PAYMENT CONFIRMATION:\nReceipt: ${activeReceipt.receiptNumber}\nStudent: ${activeReceipt.studentName} (${activeReceipt.classGrade})\nAmount: ${formatUGX(activeReceipt.amountPaidUGX)}\nBalance Due: ${formatUGX(activeReceipt.newBalanceUGX)}\nCode: ${activeReceipt.verificationCode}\nThank you - VINEXSAH SCHOOLSOUL.`;
    navigator.clipboard.writeText(txt);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" /> Payment & Mobile Money Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fast payment entry with MTN & Airtel Mobile Money STK Push simulation, banking integration & tamper-resistant instant receipts.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start">
          MTN MoMo & Airtel Money Connected
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Search & Select Student */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> 1. Select Student Account
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name or admission #..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredStudents.map((acc) => {
              const isSel = selectedStudent?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  id={`student-select-${acc.id}`}
                  onClick={() => handleSelectStudent(acc)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-blue-950/60 border-blue-500/60 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="truncate">{acc.studentName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{acc.admissionNumber}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{acc.classGrade} ({acc.residenceType})</span>
                    <span className="font-extrabold text-rose-400">
                      Balance: {formatUGX(acc.outstandingBalanceUGX)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle & Right Col: Payment Processing Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> 2. Process Payment & Issue Receipt
          </h2>

          {selectedStudent ? (
            <form onSubmit={handleProcessStandardPayment} className="space-y-5">
              {/* Selected Student Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{selectedStudent.studentName}</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedStudent.admissionNumber} &bull; {selectedStudent.classGrade} &bull; Net Fee Billed: {formatUGX(selectedStudent.netBilledUGX)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Current Outstanding Balance</div>
                  <div className="text-base font-black text-rose-400">
                    {formatUGX(selectedStudent.outstandingBalanceUGX)}
                  </div>
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount Paid (UGX)
                  </label>
                  <input
                    type="number"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || '')}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-extrabold text-base focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Sub-fields depending on method */}
              {paymentMethod.includes('Mobile Money') && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Smartphone className="w-4 h-4" /> Mobile Money Instant Collection
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Registered Parent Phone Number (256 format)
                    </label>
                    <input
                      type="text"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleInitiateMoMo}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" /> Trigger STK Push Prompt on Phone
                  </button>
                </div>
              )}

              {paymentMethod.includes('Bank') && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Landmark className="w-4 h-4" /> Bank Deposit / Transfer Details
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank Voucher / Slip #</label>
                      <input
                        type="text"
                        value={txRef}
                        onChange={(e) => setTxRef(e.target.value)}
                        placeholder="e.g. SLIP-84920"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cashier Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid in full for Term I"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              {!paymentMethod.includes('Mobile Money') && (
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4" /> Issue Verified Receipt
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
              Select a student account on the left to start payment capture.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Money STK Push Modal Simulator */}
      {isPromptingMoMo && momoRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/50 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-pulse">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                Mobile Money USSD Push Sent!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Prompt delivered to <span className="font-mono text-emerald-400">{momoRequest.phoneNumber}</span> ({momoRequest.provider})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 text-left space-y-1">
              <div>Ref: <span className="text-blue-400 font-bold">{momoRequest.referenceNumber}</span></div>
              <div>Student: <span className="text-white font-bold">{momoRequest.studentName}</span></div>
              <div>Amount: <span className="text-emerald-400 font-bold">{formatUGX(momoRequest.amountUGX)}</span></div>
            </div>

            <div className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Waiting for parent PIN approval on mobile handset...
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleConfirmMoMoSimulated(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 text-xs font-bold"
              >
                Simulate Reject / Cancel
              </button>
              <button
                onClick={() => handleConfirmMoMoSimulated(true)}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Approve Payment (Simulated)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white text-slate-900 p-6 shadow-2xl my-8">
            {/* School Header */}
            <div className="text-center border-b border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-2">
                SS
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                SCHOOLSOUL ACADEMIC COMPLEX
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                P.O. Box 4022 Kampala, Uganda &bull; Tel: +256 414 123456
              </p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                Official Fee Payment Receipt
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="py-4 border-b border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-extrabold text-blue-600">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.date} ({activeReceipt.timestamp.slice(11, 16)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{activeReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission / LIN #:</span>
                <span className="font-mono font-bold text-slate-700">{activeReceipt.admissionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class Grade:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.classGrade} ({activeReceipt.term})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-800">{activeReceipt.transactionReference}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Amount Paid</div>
                <div className="text-xl font-black text-emerald-700">{formatUGX(activeReceipt.amountPaidUGX)}</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Balance Remaining</div>
                <div className="text-base font-bold text-rose-600">{formatUGX(activeReceipt.newBalanceUGX)}</div>
              </div>
            </div>

            {/* Verification Code Footer */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Verification Checksum</div>
                <div className="font-mono font-bold text-slate-800">{activeReceipt.verificationCode}</div>
              </div>
              <QrCode className="w-8 h-8 text-slate-800" />
            </div>

            <div className="mt-4 text-[10px] text-slate-500 text-center italic">
              Issued by {activeReceipt.cashierName} &bull; Powered by SchoolSoul V4
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={copySmsText}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedText ? 'Copied SMS Text!' : 'Copy SMS / WhatsApp'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
