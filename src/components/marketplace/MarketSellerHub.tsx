import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Building,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Wallet,
  Tag,
} from 'lucide-react';
import type { MarketplaceItem, MarketplaceOrder, User } from '../../types';
import { fetchSellerBalance, submitSellerPayoutRequest } from '../../services/marketplaceApi';

interface Props {
  currentUser?: User | null;
  activeSchoolId: string;
  myListings: MarketplaceItem[];
  onOpenCreateListing: () => void;
  onOpenEditListing: (item: MarketplaceItem) => void;
  onSelectProduct: (item: MarketplaceItem) => void;
}

export const MarketSellerHub: React.FC<Props> = ({
  currentUser,
  activeSchoolId,
  myListings,
  onOpenCreateListing,
  onOpenEditListing,
  onSelectProduct,
}) => {
  const [balanceData, setBalanceData] = useState<{
    grossSales: number;
    platformCommissionRate: string;
    commissionDeducted: number;
    totalWithdrawn: number;
    availableBalance: number;
    currency: string;
    payouts: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('50000');
  const [payoutMethod, setPayoutMethod] = useState('Cash Collection at Bursar Desk');
  const [accountDetails, setAccountDetails] = useState('');
  const [payoutStatusMessage, setPayoutStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const loadBalance = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSellerBalance(currentUser, activeSchoolId);
      if (res.success && res.data) {
        setBalanceData(res.data);
      }
    } catch (err) {
      console.error('Failed to load seller balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [activeSchoolId, currentUser?.id]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount < 10000) {
      setPayoutStatusMessage({ type: 'error', text: 'Minimum payout amount is 10,000 UGX.' });
      return;
    }

    if (balanceData && amount > balanceData.availableBalance) {
      setPayoutStatusMessage({ type: 'error', text: 'Payout amount cannot exceed available balance.' });
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutStatusMessage(null);

    try {
      const res = await submitSellerPayoutRequest(
        { amount, payoutMethod, accountDetails },
        currentUser,
        activeSchoolId
      );

      if (res.success) {
        setPayoutStatusMessage({
          type: 'success',
          text: 'Payout request registered! The School Bursar will prepare cash disbursement.',
        });
        loadBalance();
        setTimeout(() => {
          setIsPayoutModalOpen(false);
          setPayoutStatusMessage(null);
        }, 1800);
      } else {
        setPayoutStatusMessage({ type: 'error', text: res.error || 'Failed to submit payout request.' });
      }
    } catch (err: any) {
      setPayoutStatusMessage({ type: 'error', text: err.message || 'Submission failed.' });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>Student & Department Enterprise Hub</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Seller Dashboard & Revenue Earnings
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Track product sales, manage available inventory, and request payout disbursements verified by the School Bursar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenCreateListing}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>List New Product</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPayoutModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-colors flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Balance & Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Available Net Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {(balanceData?.availableBalance || 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">UGX</span>
          </p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Ready for Bursar disbursement</span>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Gross Product Sales</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {(balanceData?.grossSales || 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">UGX</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across all completed orders</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Vocational Fund (10%)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {(balanceData?.commissionDeducted || 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">UGX</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">School workshop & lab reinvestment</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Products Listed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{myListings.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {myListings.filter((i) => i.inventoryCount > 0).length} in stock
          </p>
        </div>
      </div>

      {/* Seller's Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Product Catalog</h3>
            <p className="text-xs text-slate-500">Products submitted by your account / club</p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateListing}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Package className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No products listed yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start selling student projects, crafts, biology honey, or canteen snacks by clicking "Add Item".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Inventory</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myListings.map((item) => {
                  const img = item.primaryImage || item.images?.[0];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {img ? (
                              <img src={img} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => onSelectProduct(item)}
                              className="font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1 text-left"
                            >
                              {item.title}
                            </button>
                            <p className="text-[11px] text-slate-400">
                              {item.studentCreator || 'Student Leader'} • {item.grade || 'General'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{item.price.toLocaleString()} UGX</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-semibold ${
                            item.inventoryCount === 0
                              ? 'text-rose-600'
                              : item.inventoryCount <= 5
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.inventoryCount} units
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Sold Out'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditListing(item)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                        >
                          Edit Media & Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Request Bursar Payout</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {payoutStatusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  payoutStatusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {payoutStatusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{payoutStatusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600">Available Balance:</span>
                <span className="font-bold text-slate-900">
                  {(balanceData?.availableBalance || 0).toLocaleString()} UGX
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payout Amount (UGX) *
                </label>
                <input
                  type="number"
                  min="10000"
                  max={balanceData?.availableBalance || 1000000}
                  step="5000"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum withdrawal: 10,000 UGX</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disbursement Method *
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Cash Collection at Bursar Desk">Cash Collection at Bursar Desk</option>
                  <option value="MTN / Airtel Mobile Money Transfer">MTN / Airtel Mobile Money Transfer</option>
                  <option value="School Tuition Fee Offset Credit">School Tuition Fee Offset Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Account / ID Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student ID: S4-042 or Phone: +256 772 000000"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout || (balanceData?.availableBalance || 0) < 10000}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow"
                >
                  {isSubmittingPayout ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
