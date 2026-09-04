import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  QrCode,
  Package,
  ShieldCheck,
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  Building2,
  Smartphone,
  User as UserIcon,
  Video as VideoIcon,
  Tag,
  Star,
  Heart,
  Plus,
  Minus,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react';
import { MarketMediaGallery } from './MarketMediaGallery';
import {
  submitMarketOrder,
  fetchMarketReviews,
  submitMarketReview,
  toggleWishlistItem,
} from '../../services/marketplaceApi';
import {
  validatePaymentMethodAndPhone,
  getPaymentMethodDisplayName,
  type PesapalPaymentMethodType,
} from '../../utils/paymentRoutingUtils';
import type {
  MarketplaceItem,
  MarketplaceOrder,
  MarketplaceItemVariant,
  MarketplaceReview,
  User,
} from '../../types';

interface MarketProductDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  activeSchoolId?: string;
  onOrderPlaced?: (updatedItem: MarketplaceItem, newOrder: MarketplaceOrder) => void;
  onAddToCart?: (item: MarketplaceItem, selectedVariant?: MarketplaceItemVariant, quantity?: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (item: MarketplaceItem) => void;
  allCatalogItems?: MarketplaceItem[];
  onSelectRelatedItem?: (item: MarketplaceItem) => void;
}

export const MarketProductDetailModal: React.FC<MarketProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  currentUser,
  activeSchoolId,
  onOrderPlaced,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
  allCatalogItems = [],
  onSelectRelatedItem,
}) => {
  // Variants state
  const [selectedVariant, setSelectedVariant] = useState<MarketplaceItemVariant | undefined>(
    item?.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  // Reviews state
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Direct instant reserve state
  const [isInstantCheckoutOpen, setIsInstantCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOBILE_MONEY' | 'AIRTEL_MONEY' | 'CARD' | 'BURSAR_CASH_RECEIPT'>('MTN_MOBILE_MONEY');

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<MarketplaceOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      if (item.variants && item.variants.length > 0) {
        setSelectedVariant(item.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
      setQuantity(1);
      setOrderSuccessData(null);
      setIsInstantCheckoutOpen(false);
      setErrorMessage(null);

      // Load reviews
      fetchMarketReviews(item.id, currentUser, activeSchoolId).then((res) => {
        if (res.success && res.data) {
          setReviews(res.data);
        }
      });
    }
  }, [isOpen, item?.id, activeSchoolId, currentUser]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }
    if (paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') {
      if (!buyerPhone.trim()) {
        setErrorMessage('Please enter your mobile money phone number.');
        return;
      }
      const validation = validatePaymentMethodAndPhone(paymentMethod, buyerPhone, 'UG');
      if (!validation.isValid && validation.error) {
        setErrorMessage(validation.error);
        return;
      }
    }
    if (quantity <= 0 || quantity > item.inventoryCount) {
      setErrorMessage(`Please select a valid quantity (1 to ${item.inventoryCount}).`);
      return;
    }

    setIsSubmittingOrder(true);
    setErrorMessage(null);

    try {
      const res = await submitMarketOrder(
        {
          itemId: item.id,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim() || '+256700000000',
          buyerEmail: buyerEmail.trim() || undefined,
          quantity,
          paymentMethod: getPaymentMethodDisplayName(paymentMethod),
        },
        currentUser,
        activeSchoolId
      );

      if (res.success && res.data) {
        setOrderSuccessData(res.data);
        if (onOrderPlaced) {
          const updatedItem = {
            ...item,
            inventoryCount: Math.max(0, item.inventoryCount - quantity),
            status: item.inventoryCount - quantity === 0 ? ('Sold Out' as const) : item.status,
            orders: [res.data, ...(item.orders || [])],
          };
          onOrderPlaced(updatedItem, res.data);
        }
      } else {
        setErrorMessage(res.error || 'Failed to schedule product order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while scheduling order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await submitMarketReview(
        {
          itemId: item.id,
          rating: newRating,
          comment: newComment.trim(),
          userName: currentUser?.fullName || 'Student Buyer',
        },
        currentUser,
        activeSchoolId
      );

      if (res.success && res.data) {
        setReviews([res.data, ...reviews]);
        setNewComment('');
        setReviewSuccessMsg('Thank you! Your verified review has been posted.');
        setTimeout(() => setReviewSuccessMsg(null), 3000);
      }
    } catch {
      // safe fallback
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen || !item) return null;

  // Calculate unit price with variant modifier
  const unitPrice = item.price + (selectedVariant?.priceModifier || 0);
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = item.inventoryCount <= 0;

  // Related products
  const relatedItems = allCatalogItems
    .filter((c) => c.id !== item.id && c.category === item.category)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200/60">
              {item.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SKU: {item.qrCode || `SCH-${item.id.slice(-6).toUpperCase()}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                type="button"
                onClick={() => onToggleWishlist(item)}
                className={`p-2 rounded-xl border transition-colors ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600'
                }`}
                title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {orderSuccessData ? (
            /* Order Success View */
            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Order Reserved Successfully!</h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Your reservation for <span className="font-semibold">{orderSuccessData.quantity}x {item.title}</span> has been confirmed.
              </p>

              <div className="max-w-md mx-auto p-4 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-3 text-left text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{orderSuccessData.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Amount Due / Paid:</span>
                  <span className="font-bold text-amber-700">{orderSuccessData.totalPrice?.toLocaleString()} UGX</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Payment Option:</span>
                  <span className="font-medium text-slate-800">{orderSuccessData.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Pickup Token:</span>
                  <span className="font-mono font-bold px-2 py-1 bg-amber-100 text-amber-900 rounded text-xs">
                    {orderSuccessData.qrCollectionToken}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOrderSuccessData(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors shadow"
                >
                  Done
                </button>
              </div>
            </div>
          ) : isInstantCheckoutOpen ? (
            /* Direct Instant Checkout Form */
            <form onSubmit={handlePlaceOrder} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Instant Order & Reservation</h3>
                <button
                  type="button"
                  onClick={() => setIsInstantCheckoutOpen(false)}
                  className="text-xs text-amber-600 font-semibold hover:underline"
                >
                  Back to Overview
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+256 772 000000"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 bg-white border border-slate-300 rounded-xl flex items-center justify-center font-bold text-slate-700"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm px-3 text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(item.inventoryCount, quantity + 1))}
                      className="w-9 h-9 bg-white border border-slate-300 rounded-xl flex items-center justify-center font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  >
                    <option value="MTN_MOBILE_MONEY">MTN Mobile Money (*165#)</option>
                    <option value="AIRTEL_MONEY">Airtel Money (*185#)</option>
                    <option value="CARD">Visa / Mastercard (Pesapal 3.0)</option>
                    <option value="BURSAR_CASH_RECEIPT">School Bursar Cash Counter</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Amount:</span>
                  <span className="text-xl font-bold text-amber-700">{totalPrice.toLocaleString()} UGX</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow"
                >
                  {isSubmittingOrder ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          ) : (
            /* Main Product Overview */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Media Gallery */}
                <div>
                  <MarketMediaGallery
                    images={
                      item.mediaImages && item.mediaImages.length > 0
                        ? item.mediaImages
                        : item.images && item.images.length > 0
                        ? item.images
                        : item.primaryImage
                        ? [item.primaryImage]
                        : []
                    }
                    video={item.video}
                    title={item.title}
                  />
                </div>

                {/* Info & Variants */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                      {item.title}
                    </h1>

                    <div className="flex items-center gap-3 text-xs">
                      {item.averageRating ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{item.averageRating}</span>
                          <span className="text-slate-400 font-normal">
                            ({item.reviewCount || reviews.length} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">No ratings yet</span>
                      )}

                      <span className="text-slate-300">•</span>

                      <span
                        className={`font-semibold ${
                          isOutOfStock ? 'text-rose-600' : item.inventoryCount <= 5 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : `${item.inventoryCount} units available`}
                      </span>
                    </div>

                    {/* Price with variant */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-amber-800">
                          {unitPrice.toLocaleString()} <span className="text-xs font-semibold text-amber-900/60">UGX</span>
                        </span>
                        {selectedVariant && selectedVariant.priceModifier !== 0 && (
                          <p className="text-[11px] text-amber-700">
                            Includes variant adjustment ({selectedVariant.priceModifier > 0 ? '+' : ''}
                            {selectedVariant.priceModifier.toLocaleString()} UGX)
                          </p>
                        )}
                      </div>

                      <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
                        Official School Enterprise
                      </span>
                    </div>

                    {/* Variants selector if present */}
                    {item.variants && item.variants.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Select Variant / Option:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {item.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariant(v)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                selectedVariant?.id === v.id
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span>{v.name}</span>
                              {v.priceModifier !== 0 && (
                                <span className="ml-1.5 opacity-80 text-[10px]">
                                  ({v.priceModifier > 0 ? '+' : ''}{v.priceModifier.toLocaleString()} UGX)
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Creator Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">
                          {item.studentCreator || item.sellerName || 'School Enterprise Department'}
                        </p>
                        <p className="text-slate-500">
                          {item.grade || 'Verified Student & Vocational Project'}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                      <h4 className="font-bold text-slate-800">About this Product:</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>

                  {/* Action Buttons: Add to Cart & Instant Reserve */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-3">
                      {onAddToCart && (
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            onAddToCart(item, selectedVariant, quantity);
                            onClose();
                          }}
                          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => setIsInstantCheckoutOpen(true)}
                        className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Instant Reserve</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      Customer Reviews & Feedback ({reviews.length})
                    </h3>
                  </div>
                </div>

                {reviewSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Write a review form */}
                <form onSubmit={handleAddReview} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mb-4">
                  <h4 className="text-xs font-bold text-slate-800">Leave a Verified Review:</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this student item..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold flex items-center gap-0.5">
                                <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Related Products */}
              {relatedItems.length > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    More in {item.category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedItems.map((rel) => {
                      const relImg = rel.primaryImage || rel.images?.[0];
                      return (
                        <div
                          key={rel.id}
                          onClick={() => onSelectRelatedItem && onSelectRelatedItem(rel)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-400 transition-all cursor-pointer flex items-center gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                            {relImg ? (
                              <img src={relImg} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-amber-700">
                              {rel.title}
                            </h4>
                            <p className="text-xs font-bold text-amber-700 mt-0.5">
                              {rel.price.toLocaleString()} UGX
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
