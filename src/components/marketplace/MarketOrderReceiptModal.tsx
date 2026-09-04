import React from 'react';
import { X, Printer, QrCode, CheckCircle, Package, Building, Calendar, Phone, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import type { MarketplaceOrder, MarketplaceItem } from '../../types';

interface MarketOrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: MarketplaceOrder | null;
  item?: MarketplaceItem | null;
}

export const MarketOrderReceiptModal: React.FC<MarketOrderReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  item,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const title = item?.title || (order.items && order.items[0]?.title) || 'School Market Item';
  const currency = item?.currency || 'UGX';
  const qrToken = order.qrCollectionToken || (item && item.qrCode) || order.orderNumber;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Top Bar (Screen Only) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold">Official Collection Receipt & QR Slip</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-6 md:p-8 space-y-6 bg-white" id="printable-order-slip">
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mb-1">
              <Building className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">SchoolSoul Enterprise Market</h1>
            <p className="text-xs text-slate-500">Official Student Enterprise & Bursar Collection Voucher</p>
            <p className="text-[11px] font-mono text-slate-400">Order: {order.orderNumber || order.id}</p>
          </div>

          {/* QR Code, Token & PIN Box */}
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-amber-600" /> Pickup & Delivery Tokens
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">QR Token</span>
                <div className="font-mono text-base font-black text-slate-900 tracking-wider bg-white p-2 rounded-xl border border-amber-200 inline-block shadow-xs">
                  {qrToken}
                </div>
              </div>
              {order.deliveryPin && (
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">4-Digit Delivery PIN</span>
                  <div className="font-mono text-base font-extrabold text-amber-900 tracking-widest bg-amber-200/80 px-4 py-2 rounded-xl border border-amber-400 inline-block shadow-xs">
                    {order.deliveryPin}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              Present this token to the Bursar Desk or provide your 4-digit PIN to the delivery runner.
            </p>
          </div>

          {/* Order Item Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchased Items</h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              {order.items && order.items.length > 0 ? (
                order.items.map((oi: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                    <span className="font-medium text-slate-900">
                      {oi.title} {oi.selectedVariant ? `(${oi.selectedVariant})` : ''} <strong className="text-slate-500">x{oi.quantity}</strong>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {((oi.price || 0) * (oi.quantity || 1)).toLocaleString()} {currency}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">
                    {title} <strong className="text-slate-500">x{order.quantity}</strong>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {order.totalPrice?.toLocaleString()} {currency}
                  </span>
                </div>
              )}

              {order.subtotalPrice && order.subtotalPrice > 0 ? (
                <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200 text-xs">
                  <span>Products Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">{order.subtotalPrice.toLocaleString()} {currency}</span>
                </div>
              ) : null}

              {order.deliveryFee && order.deliveryFee > 0 ? (
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Campus Delivery Fee:</span>
                  <span className="font-mono font-bold text-slate-800">+{order.deliveryFee.toLocaleString()} {currency}</span>
                </div>
              ) : null}

              {order.schoolMarketFee !== undefined && order.schoolMarketFee > 0 ? (
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>School Market Transaction Fee:</span>
                  <span className="font-mono font-bold text-amber-800">+{order.schoolMarketFee.toLocaleString()} {currency}</span>
                </div>
              ) : null}

              {order.discountAmount ? (
                <div className="flex justify-between items-center text-emerald-600 pt-1">
                  <span>Discount Applied ({order.discountCode}):</span>
                  <span className="font-mono font-bold">-{order.discountAmount.toLocaleString()} {currency}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-center pt-2 border-t border-slate-300 text-sm font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-emerald-700">
                  {order.totalPrice?.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer & Pickup Information */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <UserIcon className="w-3.5 h-3.5" /> Buyer
              </span>
              <p className="font-bold text-slate-900">{order.buyerName}</p>
              <p className="font-mono text-slate-600 text-[11px]">{order.buyerPhone}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Building className="w-3.5 h-3.5" /> Location
              </span>
              <p className="font-bold text-slate-900">{order.pickupLocation || 'Bursar Counter'}</p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {order.collectionDate || 'Any School Day'}
              </p>
            </div>
          </div>

          {/* Status & Method */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-100 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Payment Method</span>
              <strong className="text-slate-900 font-bold">{order.paymentMethod || 'Bursar Collection'}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {order.status || 'Approved & Scheduled'}
              </span>
            </div>
          </div>

          {/* Footer Security Stamp */}
          <div className="pt-3 border-t border-dashed border-slate-300 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SchoolSoul Verified Security & Escrow Protection
            </div>
            <p className="text-[10px] text-slate-400">
              Generated on {new Date(order.createdAt || Date.now()).toLocaleDateString()} • Powered by SchoolSoul OS Enterprise Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
