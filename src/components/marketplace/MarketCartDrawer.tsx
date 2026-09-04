import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Tag,
  CreditCard,
  Building2,
  Smartphone,
  Info,
  Loader2,
  QrCode,
  ShieldCheck,
  Truck,
  MapPin,
  Key,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import type { MarketplaceCartItem, MarketplaceDiscount, User } from '../../types';
import {
  validateDiscountCode,
  checkoutShoppingCart,
  initPesapalMarketPayment,
  verifyPesapalMarketPayment,
} from '../../services/marketplaceApi';
import { calculateSchoolMarketFee } from '../../services/marketFeeEngine';
import {
  validatePaymentMethodAndPhone,
  getPaymentMethodDisplayName,
  type PesapalPaymentMethodType,
} from '../../utils/paymentRoutingUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: MarketplaceCartItem[];
  onUpdateQuantity: (itemId: string, newQty: number, variantId?: string) => void;
  onRemoveItem: (itemId: string, variantId?: string) => void;
  onClearCart: () => void;
  currentUser?: User | null;
  activeSchoolId: string;
}

export const MarketCartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  activeSchoolId,
}) => {
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<MarketplaceDiscount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // Delivery & Recipient Information
  const [fulfillmentType, setFulfillmentType] = useState<'SCHOOL_PICKUP' | 'SCHOOL_DELIVERY' | 'LOCAL_DELIVERY'>('SCHOOL_PICKUP');
  const [pickupLocation, setPickupLocation] = useState('School Bursar & Enterprise Desk');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [recipientName, setRecipientName] = useState(currentUser?.fullName || '');
  const [recipientPhone, setRecipientPhone] = useState((currentUser as any)?.phoneNumber || (currentUser as any)?.phone || '');
  const [recipientEmail, setRecipientEmail] = useState(currentUser?.email || '');

  // Payment Selection: MTN, Airtel, Card, Bursar
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOBILE_MONEY' | 'AIRTEL_MONEY' | 'CARD' | 'BURSAR_CASH_RECEIPT'>('MTN_MOBILE_MONEY');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);
  const [isVerifyingPesapal, setIsVerifyingPesapal] = useState(false);
  const [pesapalVerificationMsg, setPesapalVerificationMsg] = useState<string | null>(null);

  // Real-time phone validation & routing feedback
  const phoneValidation = useMemo(() => {
    if (paymentMethod === 'BURSAR_CASH_RECEIPT' || paymentMethod === 'CARD') {
      return { isValid: true, normalizedPhone: recipientPhone, warning: undefined, error: undefined };
    }
    return validatePaymentMethodAndPhone(paymentMethod, recipientPhone, 'UG');
  }, [paymentMethod, recipientPhone]);

  if (!isOpen) return null;

  // Subtotal calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const unitPrice = (item.item.price || 0) + (item.selectedVariant?.priceModifier || 0);
    return acc + unitPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedDiscount.value) / 100);
      if (appliedDiscount.maxDiscount && discountAmount > appliedDiscount.maxDiscount) {
        discountAmount = appliedDiscount.maxDiscount;
      }
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const deliveryFee = fulfillmentType === 'SCHOOL_DELIVERY' ? 1500 : fulfillmentType === 'LOCAL_DELIVERY' ? 3000 : 0;
  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const feeResult = calculateSchoolMarketFee(netSubtotal, 'UGX');
  const schoolMarketFee = feeResult.fee;
  const finalTotal = Math.max(0, netSubtotal + deliveryFee + schoolMarketFee);

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCodeInput.trim()) return;
    setIsValidatingDiscount(true);
    setDiscountError(null);

    try {
      const res = await validateDiscountCode(discountCodeInput.trim(), subtotal, activeSchoolId, currentUser);
      if (res.success && res.data) {
        setAppliedDiscount(res.data);
        setDiscountError(null);
      } else {
        setDiscountError(res.message || 'Invalid or expired coupon code');
        setAppliedDiscount(null);
      }
    } catch (err: any) {
      setDiscountError(err?.message || 'Error validating code');
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput('');
    setDiscountError(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Validate phone number when Mobile Money is chosen
    if (paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') {
      if (!recipientPhone.trim()) {
        alert('Please enter your mobile money phone number.');
        return;
      }
      if (!phoneValidation.isValid && phoneValidation.error) {
        alert(phoneValidation.error);
        return;
      }
    }

    setIsSubmittingOrder(true);

    try {
      const itemsPayload = cartItems.map((ci) => ({
        itemId: ci.item.id,
        quantity: ci.quantity,
        selectedVariant: ci.selectedVariant,
      }));

      const finalPhone = phoneValidation.normalizedPhone || recipientPhone.trim() || '+256700000000';
      const finalEmail = recipientEmail.trim() || currentUser?.email || 'buyer@schoolsoul.ug';

      const res = await checkoutShoppingCart(
        {
          buyerName: recipientName.trim() || currentUser?.fullName || 'School Community Member',
          buyerPhone: finalPhone,
          buyerEmail: finalEmail,
          items: itemsPayload,
          paymentMethod: getPaymentMethodDisplayName(paymentMethod),
          discountCode: appliedDiscount?.code,
          fulfillmentType,
          pickupLocation: fulfillmentType === 'SCHOOL_PICKUP' ? pickupLocation : undefined,
          deliveryLocation: fulfillmentType !== 'SCHOOL_PICKUP' ? (deliveryLocation || 'School Campus Delivery') : undefined,
          deliveryInstructions,
          recipientName: recipientName.trim() || currentUser?.fullName || 'School Community Member',
          recipientPhone: finalPhone,
        },
        currentUser,
        activeSchoolId
      );

      if (res.success && res.data) {
        const order = res.data;
        let pesapalSession: any = null;

        // If Pesapal payment method selected, initialize Pesapal 3.0 payment session
        if (paymentMethod !== 'BURSAR_CASH_RECEIPT') {
          try {
            const pRes = await initPesapalMarketPayment(order.id, currentUser, activeSchoolId);
            if (pRes.success && pRes.redirectUrl) {
              pesapalSession = pRes;
            }
          } catch (pErr) {
            console.warn('Pesapal session init notice:', pErr);
          }
        }

        setOrderCompleted({
          ...order,
          pesapalSession,
        });
        onClearCart();
      } else {
        alert(res.error || 'Failed to place order.');
      }
    } catch (err: any) {
      console.error('Order checkout error:', err);
      alert('An error occurred while checking out.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleVerifyPesapal = async () => {
    if (!orderCompleted?.pesapalOrderTrackingId && !orderCompleted?.pesapalSession?.orderTrackingId && !orderCompleted?.id) return;
    const trackingId = orderCompleted.pesapalOrderTrackingId || orderCompleted.pesapalSession?.orderTrackingId || orderCompleted.id;
    setIsVerifyingPesapal(true);
    setPesapalVerificationMsg(null);

    try {
      const res = await verifyPesapalMarketPayment(trackingId, currentUser, activeSchoolId);
      if (res.success && res.verified) {
        setPesapalVerificationMsg('Payment verified as PAID_VERIFIED! Your order is being prepared.');
        setOrderCompleted((prev: any) => ({
          ...prev,
          paymentStatus: 'PAID_VERIFIED',
          status: 'Approved & Scheduled',
        }));
      } else {
        setPesapalVerificationMsg(res.message || 'Payment is still processing or waiting for confirmation.');
      }
    } catch (err: any) {
      setPesapalVerificationMsg(err?.message || 'Failed to verify payment status.');
    } finally {
      setIsVerifyingPesapal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Shopping Cart & Fast Pass</h2>
              <p className="text-xs text-slate-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for checkout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {orderCompleted ? (
            /* Order Completion Screen */
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Order Successfully Placed
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3 font-mono">
                  #{orderCompleted.orderNumber || orderCompleted.id}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Keep your digital tokens ready for collection or delivery receipt.
                </p>
              </div>

              {/* Delivery PIN & QR Token Card */}
              <div className="p-4 bg-white rounded-xl border border-emerald-200 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-700">4-Digit Delivery PIN:</span>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono font-extrabold text-sm rounded-lg tracking-widest">
                    {orderCompleted.deliveryPin || '4821'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">QR Collection Token:</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-800 truncate max-w-[180px]">
                    {orderCompleted.qrCollectionToken || 'QR-PICKUP-CONFIRMED'}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Fulfillment Mode:</span>
                  <span className="font-bold text-slate-800">
                    {orderCompleted.fulfillmentType === 'SCHOOL_PICKUP'
                      ? '🏫 School Bursar Pickup'
                      : orderCompleted.fulfillmentType === 'SCHOOL_DELIVERY'
                      ? '🏃 Classroom / Dormitory Delivery'
                      : '🛵 Local Campus Delivery'}
                  </span>
                </div>

                {orderCompleted.deliveryLocation && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-semibold text-slate-800">{orderCompleted.deliveryLocation}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold text-emerald-800">
                    {(orderCompleted.totalPrice || finalTotal).toLocaleString()} {orderCompleted.currency || 'UGX'}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    orderCompleted.paymentStatus === 'PAID_VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {orderCompleted.paymentStatus === 'PAID_VERIFIED' ? 'PAID VERIFIED' : 'PENDING BURSER / MOMO'}
                  </span>
                </div>
              </div>

              {/* Pesapal Direct Payment Link if available */}
              {orderCompleted.pesapalSession?.redirectUrl && orderCompleted.paymentStatus !== 'PAID_VERIFIED' && (
                <div className="p-4 bg-emerald-950 text-white rounded-xl text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">Pesapal 3.0 Payment Gateway</span>
                    <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">Live Checkout</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Complete your payment instantly via MTN Mobile Money (*165#), Airtel Money (*185#), or Visa.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={orderCompleted.pesapalSession.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open Pesapal Payment Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={handleVerifyPesapal}
                      disabled={isVerifyingPesapal}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      {isVerifyingPesapal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check Status'}
                    </button>
                  </div>
                  {pesapalVerificationMsg && (
                    <p className="text-[11px] text-amber-300 mt-1">{pesapalVerificationMsg}</p>
                  )}
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2 text-left">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Escrow protection active: Funds are safely held in the school bursary account until you verify and receive your items.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOrderCompleted(null);
                  onClose();
                }}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
              >
                Back to Market
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Browse student inventions, organic school harvest, and hot canteen fast passes to add items to your cart.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Selected Products</h3>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {cartItems.map((cartItem, idx) => {
                    const item = cartItem.item;
                    const variant = cartItem.selectedVariant;
                    const unitPrice = (item.price || 0) + (variant?.priceModifier || 0);
                    const img = item.primaryImage || item.images?.[0];

                    return (
                      <div key={`${item.id}-${variant?.id || idx}`} className="p-3.5 flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {img ? (
                            <img src={img} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                          {variant && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium mt-0.5">
                              {variant.name}
                            </span>
                          )}
                          <p className="text-xs font-bold text-amber-700 mt-1">
                            {unitPrice.toLocaleString()} UGX
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, cartItem.quantity - 1, variant?.id)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-5 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, cartItem.quantity + 1, variant?.id)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id, variant?.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupon / Discount Code */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Promo Code / Student Enterprise Voucher</span>
                </div>

                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-100/80 rounded-lg border border-emerald-300 text-xs text-emerald-900 font-semibold">
                    <span>
                      Applied: <strong>{appliedDiscount.code}</strong> (
                      {appliedDiscount.type === 'PERCENTAGE'
                        ? `${appliedDiscount.value}% off`
                        : `${appliedDiscount.value.toLocaleString()} UGX off`}
                      )
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="text-rose-600 hover:underline cursor-pointer font-bold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyDiscount} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. STEM20, EXPO10"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingDiscount || !discountCodeInput.trim()}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      {isValidatingDiscount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </form>
                )}

                {discountError && <p className="text-[11px] text-rose-600 font-medium">{discountError}</p>}
              </div>

              {/* Delivery & Fulfillment Choice */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Truck className="w-4 h-4 text-amber-700" />
                    <span>Fulfillment & Delivery Options</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Fast School Runner Delivery</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('SCHOOL_PICKUP')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                      fulfillmentType === 'SCHOOL_PICKUP'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-[11px]">🏫 Bursar Pickup</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Free (0 UGX)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('SCHOOL_DELIVERY')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                      fulfillmentType === 'SCHOOL_DELIVERY'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-[11px]">🏃 Classroom / Dorm</p>
                    <p className="text-[10px] text-amber-700 font-bold mt-0.5">+1,500 UGX</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('LOCAL_DELIVERY')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                      fulfillmentType === 'LOCAL_DELIVERY'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-[11px]">🛵 Campus Runner</p>
                    <p className="text-[10px] text-amber-700 font-bold mt-0.5">+3,000 UGX</p>
                  </button>
                </div>

                {fulfillmentType === 'SCHOOL_PICKUP' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pickup Counter Point</label>
                    <select
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="School Bursar & Enterprise Desk">School Bursar & Enterprise Desk</option>
                      <option value="Vocational Workshop Counter">Vocational Club & Workshop Counter</option>
                      <option value="School Main Canteen Station">School Main Canteen Station</option>
                      <option value="Agricultural Science Farm Gate">Agricultural Science Farm Gate</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Delivery Destination (Classroom, Dorm, or Office)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior 4 East (Row 3), Lumumba Hall Rm 14, Staff Room 2"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Special Instructions for Delivery Runner
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Deliver during lunch break / Call upon arrival"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Recipient Details */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Phone Number</label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+256 700 000000"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateway (Pesapal 3.0 & Bursar) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">Choose Payment Method</label>
                  <span className="text-[10px] text-slate-500 font-medium">Pesapal 3.0 Certified</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* MTN Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MTN_MOBILE_MONEY')}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'MTN_MOBILE_MONEY'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-300">
                        MTN
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">MTN Mobile Money</p>
                        <p className="text-[10px] text-slate-500">*165# MoMo</p>
                      </div>
                    </div>
                    {paymentMethod === 'MTN_MOBILE_MONEY' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>

                  {/* Airtel Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('AIRTEL_MONEY')}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'AIRTEL_MONEY'
                        ? 'border-rose-500 bg-rose-50/80 text-rose-950 shadow-xs ring-1 ring-rose-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-rose-300">
                        AIR
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">Airtel Money</p>
                        <p className="text-[10px] text-slate-500">*185# Airtel</p>
                      </div>
                    </div>
                    {paymentMethod === 'AIRTEL_MONEY' && (
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>

                  {/* Credit / Debit Card via Pesapal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">Visa / Mastercard</p>
                        <p className="text-[10px] text-slate-500">Pesapal 3D-Secure</p>
                      </div>
                    </div>
                    {paymentMethod === 'CARD' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>

                  {/* School Bursar Cash Counter */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BURSAR_CASH_RECEIPT')}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'BURSAR_CASH_RECEIPT'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/15 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">School Bursar Cash</p>
                        <p className="text-[10px] text-slate-500">Verified Ledger Token</p>
                      </div>
                    </div>
                    {paymentMethod === 'BURSAR_CASH_RECEIPT' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                </div>

                {/* Method-Specific Input Fields (NO CARD NUMBER / CVV FIELDS FOR MOBILE MONEY) */}
                {paymentMethod === 'MTN_MOBILE_MONEY' && (
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-700" /> MTN Mobile Money Number
                      </span>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-mono text-[10px] rounded-full font-bold">
                        MTN MoMo (*165#)
                      </span>
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="e.g. 0772 123 456 or 0782 123 456"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                      {phoneValidation.isValid && phoneValidation.normalizedPhone && (
                        <p className="text-[10px] text-emerald-700 mt-1 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> E.164 Routed: {phoneValidation.normalizedPhone}
                        </p>
                      )}
                      {phoneValidation.warning && (
                        <p className="text-[11px] text-amber-800 bg-amber-100/90 p-1.5 rounded-md mt-1.5 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>{phoneValidation.warning}</span>
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      You will be directed to the official Pesapal 3.0 portal to authorize the payment on your MTN phone (*165#).
                    </p>
                  </div>
                )}

                {paymentMethod === 'AIRTEL_MONEY' && (
                  <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-rose-700" /> Airtel Money Number
                      </span>
                      <span className="px-2 py-0.5 bg-rose-200/80 text-rose-900 font-mono text-[10px] rounded-full font-bold">
                        Airtel Money (*185#)
                      </span>
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="e.g. 0700 123 456 or 0752 123 456"
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                      {phoneValidation.isValid && phoneValidation.normalizedPhone && (
                        <p className="text-[10px] text-emerald-700 mt-1 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> E.164 Routed: {phoneValidation.normalizedPhone}
                        </p>
                      )}
                      {phoneValidation.warning && (
                        <p className="text-[11px] text-amber-800 bg-amber-100/90 p-1.5 rounded-md mt-1.5 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>{phoneValidation.warning}</span>
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      You will be directed to the official Pesapal 3.0 portal to authorize the payment on your Airtel phone (*185#).
                    </p>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-blue-950 font-bold">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Pesapal 3.0 3D-Secure Card Checkout</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Card payments (Visa & Mastercard) are processed directly on Pesapal's PCI-DSS Level 1 certified gateway. SchoolSoul never prompts for or stores your card number, expiration date, or CVV.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-semibold text-slate-700">Billing / Receipt Email</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="e.g. parent@example.com"
                        className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'BURSAR_CASH_RECEIPT' && (
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold">
                      <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Pay in Person at School Bursary Counter</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Upon checkout, you will receive a 4-digit pickup PIN and QR token to present at the school enterprise desk for cash payment and instant order clearance.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {!orderCompleted && cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Products Subtotal</span>
                <span>{subtotal.toLocaleString()} UGX</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Campus Delivery Fee</span>
                  <span>+{deliveryFee.toLocaleString()} UGX</span>
                </div>
              )}
              {appliedDiscount && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount</span>
                  <span>-{discountAmount.toLocaleString()} UGX</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 items-center">
                <span className="flex items-center gap-1">
                  <span>School Market Service Fee</span>
                  <span className="text-[10px] text-slate-400 font-medium">({feeResult.bracketLabel.split('(')[0].trim()})</span>
                </span>
                <span className={schoolMarketFee > 0 ? 'text-amber-800 font-medium' : 'text-slate-500'}>
                  {schoolMarketFee > 0 ? `+${schoolMarketFee.toLocaleString()} UGX` : '0 UGX'}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-amber-800">{finalTotal.toLocaleString()} UGX</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmittingOrder}
              onClick={handleCheckout}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay {finalTotal.toLocaleString()} UGX</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

