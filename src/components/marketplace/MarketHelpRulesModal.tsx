import React from 'react';
import { X, BookOpen, ShieldCheck, HelpCircle, CheckCircle, AlertCircle, ShoppingBag, QrCode, CreditCard, Scale } from 'lucide-react';

interface MarketHelpRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketHelpRulesModal: React.FC<MarketHelpRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-800 flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Marketplace Rules & Enterprise Guidelines</h2>
              <p className="text-xs text-slate-400">SchoolSoul Student Enterprise Policies & Best Practices</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs leading-relaxed text-slate-300">
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>1. Allowed & Verified Products</span>
            </div>
            <p>
              The SchoolSoul Marketplace is designed exclusively for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Student vocational crafts, artwork, tailoring, and handmade goods</li>
              <li>School biology apiary honey, greenhouse vegetables, and agricultural harvest</li>
              <li>Robotics, STEM science kits, code projects, and electronics prototypes</li>
              <li>School uniforms, branded merchandise, stationery, and approved books</li>
              <li>School Canteen meal pre-orders and fast snack passes</li>
            </ul>
            <p className="text-rose-400 text-[11px] font-semibold pt-1">
              Prohibited: Commercial off-campus items, sharp weapons, chemical substances, or unauthorized electronic contraband. All listings undergo automated and administrative moderation.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <QrCode className="w-4 h-4" />
              <span>2. Ordering & Verification QR Tokens</span>
            </div>
            <p>
              When a buyer places an order, a unique cryptographic <strong>QR Collection Token</strong> is generated.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Buyers present their phone screen or printed pickup slip at the Bursar Counter or Vocational Workshop.</li>
              <li>Staff scan or match the token to mark the order as collected.</li>
              <li>Stock is decremented automatically upon reservation to prevent double-booking.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <CreditCard className="w-4 h-4" />
              <span>3. Payments & Escrow Protection</span>
            </div>
            <p>
              Two secure payment rails are available:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong>Pesapal 3.0 Mobile Money & Cards:</strong> Instant online checkout via MTN Mobile Money, Airtel Money, or Visa/MasterCard. Funds are verified instantly and held in the school enterprise account.</li>
              <li><strong>Bursar Cash on Collection:</strong> Pay in person at the school accounts desk when collecting items.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>4. School Market Micro-Transaction Fee Schedule</span>
            </div>
            <p>
              To maintain the School Market high-security Pesapal payment infrastructure and order escrow, a small, transparent micro-transaction fee is applied strictly to School Market purchases:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">UGX 1,000 – 5,000</span>
                <strong className="text-amber-400 text-xs">UGX 50 Fee</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">UGX 5,001 – 10,000</span>
                <strong className="text-amber-400 text-xs">UGX 100 Fee</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">UGX 10,001+</span>
                <strong className="text-amber-400 text-xs">UGX 150 Fee</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Note: Orders under UGX 1,000 have UGX 0 fee. This fee applies ONLY to School Market transactions and never applies to tuition fees, subscriptions, salaries, or ledger transactions.
            </p>
          </div>

          {/* Section 5 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>5. Disputes & Help Desk</span>
            </div>
            <p>
              If a product is damaged, missing, or mismatched, use the <strong>Disputes & Help Desk</strong> button to file a formal claim. The School Administrator and Bursar desk mediate all dispute tickets within 24 hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer transition"
          >
            I Understand the Rules
          </button>
        </div>
      </div>
    </div>
  );
};
