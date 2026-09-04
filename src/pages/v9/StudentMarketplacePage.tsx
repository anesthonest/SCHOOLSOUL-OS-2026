import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  QrCode,
  CheckCircle,
  Plus,
  Tag,
  Shield,
  DollarSign,
  Package,
  Calendar,
  Clock,
  Filter,
  Search,
  Video as VideoIcon,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  Building,
  TrendingUp,
  Heart,
  Coffee,
  ShieldAlert,
  Wallet,
  Check,
  ArrowLeft,
  Printer,
  HelpCircle,
  BookOpen,
  RotateCcw,
  User as UserIcon,
  ChevronRight,
  AlertTriangle,
  Key,
  Loader2,
  ExternalLink,
  Truck,
  X,
} from 'lucide-react';
import {
  fetchMarketListings,
  deleteMarketListing,
  togglePublishListing,
  fetchMarketStats,
  fetchMarketCategories,
  fetchWishlist,
  toggleWishlistItem,
  moderateMarketListing,
  updateOrderStatus,
  cancelMarketOrder,
  requestOrderRefund,
  initPesapalMarketPayment,
  verifyPesapalMarketPayment,
  assignOrderDelivery,
  confirmOrderDelivery,
  fetchDeliveryRunners,
  type MarketStats,
} from '../../services/marketplaceApi';
import { MarketListingFormModal } from '../../components/marketplace/MarketListingFormModal';
import { MarketProductDetailModal } from '../../components/marketplace/MarketProductDetailModal';
import { MarketBannerCarousel } from '../../components/marketplace/MarketBannerCarousel';
import { MarketCartDrawer } from '../../components/marketplace/MarketCartDrawer';
import { MarketWishlistDrawer } from '../../components/marketplace/MarketWishlistDrawer';
import { MarketSellerHub } from '../../components/marketplace/MarketSellerHub';
import { MarketCanteenFastStock } from '../../components/marketplace/MarketCanteenFastStock';
import { MarketDisputesModal } from '../../components/marketplace/MarketDisputesModal';
import { MarketOrderReceiptModal } from '../../components/marketplace/MarketOrderReceiptModal';
import { MarketHelpRulesModal } from '../../components/marketplace/MarketHelpRulesModal';
import type {
  MarketplaceItem,
  MarketplaceOrder,
  MarketplaceCartItem,
  MarketplaceItemVariant,
  User,
  RoleType,
} from '../../types';

interface StudentMarketplacePageProps {
  onNavigate?: (view: string) => void;
}

export const StudentMarketplacePage: React.FC<StudentMarketplacePageProps> = ({ onNavigate }) => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'canteen' | 'seller-hub' | 'my-listings' | 'moderation' | 'orders'
  >('catalog');

  // Listings & State
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MarketStats | null>(null);

  // Cart & Wishlist state
  const [cartItems, setCartItems] = useState<MarketplaceCartItem[]>(() => {
    try {
      const saved = localStorage.getItem('schoolsoul_market_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isDisputesOpen, setIsDisputesOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock' | 'rating'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Orders Tab filters & state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('ALL');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<{ order: MarketplaceOrder; item?: MarketplaceItem } | null>(null);
  const [cancelOrderDialog, setCancelOrderDialog] = useState<MarketplaceOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed mind / Schedule conflict');
  const [refundOrderDialog, setRefundOrderDialog] = useState<MarketplaceOrder | null>(null);
  const [refundReason, setRefundReason] = useState('Item damaged or mismatch upon inspection');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Delivery Dispatch & PIN Verification state
  const [dispatchOrderDialog, setDispatchOrderDialog] = useState<MarketplaceOrder | null>(null);
  const [runnerName, setRunnerName] = useState('Senior 5 Student Enterprise Runner');
  const [runnerPhone, setRunnerPhone] = useState('+256 772 400 120');
  const [runnerPickupPoint, setRunnerPickupPoint] = useState('School Bursar Counter');
  const [runnerEta, setRunnerEta] = useState('15 - 20 mins');
  const [runnerNotes, setRunnerNotes] = useState('Deliver directly to destination classroom');
  const [confirmPinOrderDialog, setConfirmPinOrderDialog] = useState<MarketplaceOrder | null>(null);
  const [enteredDeliveryPin, setEnteredDeliveryPin] = useState('');
  const [pinVerificationError, setPinVerificationError] = useState<string | null>(null);
  const [isVerifyingPaymentId, setIsVerifyingPaymentId] = useState<string | null>(null);

  // Modals
  const [selectedProductDetail, setSelectedProductDetail] = useState<MarketplaceItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<MarketplaceItem | null>(null);

  // Contextual Active User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSchoolId, setActiveSchoolId] = useState<string>('school-001');

  // Role helpers
  const userRole = (currentUser?.role || '').toLowerCase();
  const isStaffOrAdmin = ['administrator', 'super admin', 'admin', 'headteacher', 'bursar', 'dos', 'teacher'].includes(
    userRole
  );
  const isBursar = ['bursar', 'administrator', 'super admin', 'admin'].includes(userRole);
  const canSell = true; // All authenticated students and staff can publish school enterprise listings

  // Role Switcher Simulator
  const handleSwitchSimulatedRole = (newRole: RoleType) => {
    const updatedUser: User = {
      id: currentUser?.id || 'usr-sample',
      username: currentUser?.username || 'user',
      fullName: currentUser?.fullName || `${newRole} Demo User`,
      email: currentUser?.email || 'user@school.ac.ug',
      phone: currentUser?.phone || '+256 700 000000',
      employeeNumber: currentUser?.employeeNumber || 'EMP-001',
      role: newRole,
      schoolId: activeSchoolId,
      status: 'Active',
      failedLoginAttempts: 0,
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('schoolsoul_user', JSON.stringify(updatedUser));
  };

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolsoul_market_cart', JSON.stringify(cartItems));
    } catch {
      // safe fallback
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('schoolsoul_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        // Default student enterprise account
        setCurrentUser({
          id: 'usr-student-1',
          username: 'student_leader',
          fullName: 'Amina Kwame',
          role: 'Student',
          schoolId: 'school-001',
          status: 'ACTIVE',
        } as any);
      }

      const schoolId = localStorage.getItem('schoolsoul_active_school_id') || 'school-001';
      setActiveSchoolId(schoolId);
    } catch {
      // safe fallback
    }

    loadMarketData();
    loadWishlist();
  }, []);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const [listingsRes, statsRes, catRes] = await Promise.all([
        fetchMarketListings({ schoolId: activeSchoolId }, currentUser),
        fetchMarketStats(currentUser, activeSchoolId),
        fetchMarketCategories(currentUser, activeSchoolId),
      ]);

      if (listingsRes.success && listingsRes.data) {
        setItems(listingsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await fetchWishlist(currentUser, activeSchoolId);
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch {
      // safe fallback
    }
  };

  // Cart Management
  const handleAddToCart = (
    product: MarketplaceItem,
    selectedVariant?: MarketplaceItemVariant,
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (ci) => ci.item.id === product.id && ci.selectedVariant?.id === selectedVariant?.id
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const newQty = Math.min(product.inventoryCount, copy[existingIdx].quantity + quantity);
        copy[existingIdx] = { ...copy[existingIdx], quantity: newQty };
        return copy;
      }

      return [
        ...prev,
        {
          item: product,
          quantity: Math.min(product.inventoryCount, quantity),
          selectedVariant,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number, variantId?: string) => {
    setCartItems((prev) =>
      prev.map((ci) => {
        if (ci.item.id === itemId && ci.selectedVariant?.id === variantId) {
          return { ...ci, quantity: newQty };
        }
        return ci;
      })
    );
  };

  const handleRemoveFromCart = (itemId: string, variantId?: string) => {
    setCartItems((prev) =>
      prev.filter((ci) => !(ci.item.id === itemId && ci.selectedVariant?.id === variantId))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist Toggle
  const handleToggleWishlist = async (item: MarketplaceItem) => {
    const isSaved = wishlist.some((w) => w.itemId === item.id || w.id === item.id);
    if (isSaved) {
      setWishlist((prev) => prev.filter((w) => w.itemId !== item.id && w.id !== item.id));
    } else {
      setWishlist((prev) => [
        ...prev,
        {
          id: `w-${Date.now()}`,
          itemId: item.id,
          itemTitle: item.title,
          itemPrice: item.price,
          itemImage: item.primaryImage || item.images?.[0],
          schoolId: activeSchoolId,
        },
      ]);
    }

    await toggleWishlistItem(item.id, currentUser, activeSchoolId);
  };

  // Moderation Handlers
  const handleModerateItem = async (itemId: string, action: 'Approved' | 'Rejected') => {
    const res = await moderateMarketListing(itemId, action, undefined, currentUser, activeSchoolId);
    if (res.success && res.data) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? res.data! : i)));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: MarketplaceItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleListingSaved = (savedItem: MarketplaceItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === savedItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedItem;
        return copy;
      }
      return [savedItem, ...prev];
    });
    loadMarketData();
  };

  const handleTogglePublish = async (item: MarketplaceItem) => {
    const newPublishState = !item.isPublished;
    const res = await togglePublishListing(item.id, newPublishState, currentUser, activeSchoolId);
    if (res.success && res.data) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.data! : i)));
    }
  };

  const handleDeleteListing = async (id: string) => {
    const res = await deleteMarketListing(id, currentUser, activeSchoolId);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmDeleteItem(null);
      loadMarketData();
    }
  };

  // Filter & Sort Logic
  const filteredItems = items.filter((item) => {
    // Tab filter
    if (activeTab === 'catalog') {
      if (item.isPublished === false) return false;
      if (item.status === 'Unlisted' || item.status === 'Pending Moderation') return false;
    } else if (activeTab === 'my-listings') {
      if (item.sellerId !== currentUser?.id && userRole === 'student') {
        return false;
      }
    } else if (activeTab === 'moderation') {
      // In moderation queue
      return true;
    }

    // Category
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
      return false;
    }

    // In-Stock Only
    if (inStockOnly && item.inventoryCount <= 0) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCreator = item.studentCreator?.toLowerCase().includes(q);
      const matchCode = item.qrCode?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCreator && !matchCode) return false;
    }

    return true;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'stock') return b.inventoryCount - a.inventoryCount;
    if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Orders compilation
  const allOrders: { order: MarketplaceOrder; item: MarketplaceItem }[] = items.flatMap((item) =>
    (item.orders || []).map((order) => ({ order, item }))
  );

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-slate-100 min-h-screen">
      {/* ---------------------------------------------------- */}
      {/* Top Breadcrumb & Return Navigation Bar */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('dashboard') : window.history.back())}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SchoolSoul</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-500">Student Voice & Public</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400 font-semibold">School Market & Enterprise</span>
        </div>

        {/* Role Simulator Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium px-2 flex items-center gap-1">
            <UserIcon className="w-3 h-3 text-amber-400" /> Role:
          </span>
          {(['Student', 'Teacher', 'Bursar', 'Administrator', 'Parent'] as RoleType[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleSwitchSimulatedRole(r)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                userRole === r.toLowerCase()
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Header Bar with Action Hub */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> School Marketplace Ecosystem
            </span>
            <span className="text-xs text-slate-400 font-mono">Pesapal 3.0 Verified & Bursar Integrated</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            School Market & Student Enterprise Showcase
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Promoting student vocational enterprise, biology honey harvest, robotics prototypes, crafts, and fast canteen passes with verified QR collection tokens.
          </p>
        </div>

        {/* Global Action Hub Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Rules & Help Modal Button */}
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            title="Market Rules & Policies"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Wishlist Drawer Button */}
          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition cursor-pointer border border-slate-700"
            title="Saved Wishlist"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Drawer Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded-full text-[11px] font-black">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Disputes & Resolution */}
          <button
            type="button"
            onClick={() => setIsDisputesOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 relative transition cursor-pointer border border-slate-700"
            title="Disputes & Help Desk"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={loadMarketData}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
            title="Refresh Market Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Publish / Sell Listing Button */}
          {canSell && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Sell Product</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Promotional Banner Carousel */}
      {/* ---------------------------------------------------- */}
      <MarketBannerCarousel
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat === 'School Canteen & Snacks') {
            setActiveTab('canteen');
          } else {
            setActiveTab('catalog');
          }
        }}
        onOpenCreateListing={handleOpenCreateModal}
      />

      {/* ---------------------------------------------------- */}
      {/* Summary KPI Cards */}
      {/* ---------------------------------------------------- */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-amber-400" /> Active Products
            </span>
            <div className="text-xl font-black text-white font-mono">{stats.activeProducts}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Media Photos
            </span>
            <div className="text-xl font-black text-blue-400 font-mono">{stats.mediaCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <VideoIcon className="w-3.5 h-3.5 text-purple-400" /> Video Demonstrations
            </span>
            <div className="text-xl font-black text-purple-400 font-mono">{stats.videoCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Orders Processed
            </span>
            <div className="text-xl font-black text-emerald-400 font-mono">{stats.totalOrders}</div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* View Tabs Bar */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Market Catalog ({items.filter((i) => i.isPublished !== false).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('canteen')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'canteen'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Canteen Fast Pass Menu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seller-hub')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'seller-hub'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Seller Hub & Payouts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'my-listings'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>My Listings & Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Bursar Orders & QR Pickups ({allOrders.length})</span>
        </button>

        {isStaffOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Staff Moderation Queue</span>
          </button>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Sub-View: Canteen Fast Menu */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'canteen' && (
        <MarketCanteenFastStock
          currentUser={currentUser}
          activeSchoolId={activeSchoolId}
          onAddToCart={handleAddToCart}
          onOpenProductDetail={(item) => setSelectedProductDetail(item)}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* Sub-View: Seller Hub & Revenue Earnings */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'seller-hub' && (
        <MarketSellerHub
          currentUser={currentUser}
          activeSchoolId={activeSchoolId}
          myListings={items.filter((i) => i.sellerId === currentUser?.id || isStaffOrAdmin)}
          onOpenCreateListing={handleOpenCreateModal}
          onOpenEditListing={handleOpenEditModal}
          onSelectProduct={(item) => setSelectedProductDetail(item)}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* Search, Category Filters, & Controls (Catalog / My Listings / Moderation) */}
      {/* ---------------------------------------------------- */}
      {activeTab !== 'orders' && activeTab !== 'canteen' && activeTab !== 'seller-hub' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, student crafts, farm honey, STEM projects..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="stock">Highest Stock</option>
              </select>

              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  inStockOnly
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-3 h-3" />
                In Stock Only
              </button>
            </div>
          </div>

          {/* Interactive Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('All Categories')}
              className={`px-3 py-1.5 rounded-full font-semibold transition whitespace-nowrap ${
                selectedCategory === 'All Categories'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-full font-semibold transition whitespace-nowrap ${
                  selectedCategory === c.name
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Products Grid (Catalog, My Listings, & Moderation) */}
      {/* ---------------------------------------------------- */}
      {activeTab !== 'orders' && activeTab !== 'canteen' && activeTab !== 'seller-hub' && (
        <>
          {sortedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => {
                const primaryImg =
                  item.primaryImage ||
                  item.mediaImages?.find((img) => img.isPrimary)?.url ||
                  item.images?.[0] ||
                  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600';

                const hasVideo = Boolean(item.video && item.video.status === 'ready');
                const imageCount = item.mediaImages?.length || item.images?.length || 0;
                const isOutOfStock = item.inventoryCount <= 0;
                const isSaved = wishlist.some((w) => w.itemId === item.id || w.id === item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition group"
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img
                        src={primaryImg}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onClick={() => setSelectedProductDetail(item)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800 shadow">
                          {item.category}
                        </span>
                        {item.isPublished === false && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow">
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(item)}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-colors shadow ${
                          isSaved
                            ? 'bg-rose-600/90 text-white'
                            : 'bg-slate-950/70 text-slate-300 hover:text-rose-400'
                        }`}
                        title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      </button>

                      {/* Media Badges */}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
                        {imageCount > 1 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-white border border-slate-800 flex items-center gap-1 shadow">
                            <ImageIcon className="w-3 h-3 text-blue-400" /> {imageCount}
                          </span>
                        )}
                        {hasVideo && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-purple-300 border border-slate-800 flex items-center gap-1 shadow">
                            <VideoIcon className="w-3 h-3 text-purple-400" /> Video Demo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          {item.price.toLocaleString()} {item.currency || 'UGX'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-lg ${
                            isOutOfStock
                              ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                              : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${item.inventoryCount} in stock`}
                        </span>
                      </div>

                      <h2
                        onClick={() => setSelectedProductDetail(item)}
                        className="text-base font-bold text-white leading-snug hover:text-amber-400 transition cursor-pointer line-clamp-1"
                      >
                        {item.title}
                      </h2>

                      {/* Rating & Review summary */}
                      <div className="flex items-center gap-2 text-xs">
                        {item.averageRating ? (
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{item.averageRating}</span>
                            <span className="text-slate-500 font-normal">
                              ({item.reviewCount || 1})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Verified Project</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || 'No detailed description provided.'}
                      </p>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="truncate max-w-[60%]">
                          By: <strong className="text-slate-200">{item.studentCreator}</strong>
                        </span>
                        <span className="font-mono text-slate-500 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-amber-400" /> {item.qrCode}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      {activeTab === 'moderation' ? (
                        /* Staff Moderation Actions */
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleModerateItem(item.id, 'Approved')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModerateItem(item.id, 'Rejected')}
                            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : activeTab === 'my-listings' ? (
                        /* Seller Management Controls */
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit & Media
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                              item.isPublished !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                            title={item.isPublished !== false ? 'Unpublish to Draft' : 'Publish Product'}
                          >
                            {item.isPublished !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteItem(item)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold cursor-pointer transition"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Buyer Catalog Actions */
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(item)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 disabled:opacity-50 transition cursor-pointer border border-slate-700"
                            title="Quick Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedProductDetail(item)}
                            disabled={isOutOfStock}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                              !isOutOfStock
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Package className="w-4 h-4" />
                            {isOutOfStock ? 'Sold Out' : 'View & Reserve'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Marketplace Products Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items match your active search filters or category. Try clearing filters or publish a new student enterprise product.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publish Product Now
              </button>
            </div>
          )}
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* Orders Tab View (Bursar & Customer Reservations) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Pickup Token Registry
                </span>
                <span className="text-xs text-slate-400 font-mono">Bursar & Enterprise Desk</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Verified Orders & Pickup Scheduling</h2>
              <p className="text-xs text-slate-400">
                Manage collection slips, QR verification tokens, cancellations, refunds, and pickup status updates.
              </p>
            </div>

            {/* Filter & Search Bar for Orders */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order #, buyer, phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ALL">All Statuses ({allOrders.length})</option>
                <option value="Approved & Scheduled">Approved & Scheduled</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed / Collected</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refund Requested">Refund Requested</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Orders Listing */}
          {(() => {
            const filteredOrders = allOrders.filter(({ order, item }) => {
              if (orderFilterStatus !== 'ALL') {
                if (order.status?.toLowerCase() !== orderFilterStatus.toLowerCase()) return false;
              }
              if (orderSearchQuery.trim()) {
                const q = orderSearchQuery.toLowerCase();
                const matchBuyer = order.buyerName?.toLowerCase().includes(q);
                const matchPhone = order.buyerPhone?.toLowerCase().includes(q);
                const matchOrderNo = (order.orderNumber || order.id).toLowerCase().includes(q);
                const matchToken = order.qrCollectionToken?.toLowerCase().includes(q);
                const matchTitle = item.title.toLowerCase().includes(q);
                if (!matchBuyer && !matchPhone && !matchOrderNo && !matchToken && !matchTitle) return false;
              }
              return true;
            });

            if (filteredOrders.length === 0) {
              return (
                <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Matching Orders Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No orders match your active filter. Place orders from the catalog or adjust filter options.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderFilterStatus('ALL');
                      setOrderSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs inline-flex items-center gap-1.5 transition"
                  >
                    Reset Order Filters
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map(({ order, item }) => {
                  const isCancelled = order.status === 'Cancelled';
                  const isRefunded = order.status === 'Refunded';
                  const isCompleted = order.status === 'Completed' || order.status === 'Collected';

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {order.orderNumber || order.id}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isCancelled
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : isRefunded
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : isCompleted
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : order.status === 'Ready for Pickup'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {order.status || 'Approved & Scheduled'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-white">{item.title}</h3>
                            <p className="text-xs text-slate-400">
                              By {item.studentCreator || 'Vocational Enterprise Workshop'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-emerald-400 block">
                              {order.totalPrice?.toLocaleString()} {item.currency || 'UGX'}
                            </span>
                            <span className="text-[10px] text-slate-400">{order.quantity} units</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Buyer:</span>
                            <strong className="text-white">{order.buyerName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Contact:</span>
                            <span className="font-mono text-slate-300">{order.buyerPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Fulfillment:</span>
                            <span className="text-amber-300 font-semibold">
                              {order.fulfillmentType === 'SCHOOL_PICKUP'
                                ? '🏫 School Pickup'
                                : order.fulfillmentType === 'SCHOOL_DELIVERY'
                                ? '🏃 Classroom / Dorm Delivery'
                                : '🛵 Campus Runner'}
                            </span>
                          </div>
                          {order.deliveryLocation ? (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Delivery Loc:</span>
                              <span className="text-emerald-300">{order.deliveryLocation}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Pickup Counter:</span>
                              <span className="text-amber-300">{order.pickupLocation || 'Bursar Desk'}</span>
                            </div>
                          )}
                          {order.deliveryPin && (
                            <div className="flex justify-between items-center py-1 px-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <span className="text-amber-300 font-bold flex items-center gap-1">
                                <Key className="w-3 h-3" /> Delivery PIN:
                              </span>
                              <span className="font-mono font-black text-sm text-amber-400 tracking-widest">
                                {order.deliveryPin}
                              </span>
                            </div>
                          )}
                          {order.deliveryPersonName && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Runner:</span>
                              <span className="text-cyan-300 font-semibold">{order.deliveryPersonName}</span>
                            </div>
                          )}
                          {order.subtotalPrice && order.subtotalPrice > 0 ? (
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Products Subtotal:</span>
                              <span className="font-mono text-slate-300">{order.subtotalPrice.toLocaleString()} {order.currency || 'UGX'}</span>
                            </div>
                          ) : null}
                          {order.deliveryFee && order.deliveryFee > 0 ? (
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Delivery Fee:</span>
                              <span className="font-mono text-slate-300">+{order.deliveryFee.toLocaleString()} {order.currency || 'UGX'}</span>
                            </div>
                          ) : null}
                          {order.schoolMarketFee !== undefined && order.schoolMarketFee > 0 ? (
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>School Market Fee:</span>
                              <span className="font-mono text-amber-400 font-semibold">+{order.schoolMarketFee.toLocaleString()} {order.currency || 'UGX'}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between">
                            <span className="text-slate-400">Payment:</span>
                            <span className="text-slate-300 font-semibold">{order.paymentMethod || 'Bursar Counter'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Payment Status:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.paymentStatus === 'PAID_VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {order.paymentStatus || 'PENDING'}
                            </span>
                          </div>
                          {order.cancellationReason && (
                            <div className="flex justify-between text-rose-400 pt-1 border-t border-slate-800">
                              <span>Cancellation Reason:</span>
                              <span className="text-right">{order.cancellationReason}</span>
                            </div>
                          )}
                          {order.refundReason && (
                            <div className="flex justify-between text-purple-400 pt-1 border-t border-slate-800">
                              <span>Refund Note:</span>
                              <span className="text-right">{order.refundReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {/* QR Token display & Print Slip Modal trigger */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptOrder({ order, item })}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                              title="View and Print Official Collection Slip"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Slip & Token</span>
                            </button>

                            {/* Pesapal Verification / Pay link if pending */}
                            {order.paymentStatus !== 'PAID_VERIFIED' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  setIsVerifyingPaymentId(order.id);
                                  try {
                                    const trackingId = order.pesapalOrderTrackingId || order.id;
                                    const vRes = await verifyPesapalMarketPayment(trackingId, currentUser, activeSchoolId);
                                    if (vRes.success && vRes.verified) {
                                      setActionSuccessNotice(`Order #${order.orderNumber || order.id} verified as PAID via Pesapal!`);
                                      loadMarketData();
                                    } else {
                                      // If no pesapal session yet, create one
                                      const pRes = await initPesapalMarketPayment(order.id, currentUser, activeSchoolId);
                                      if (pRes.success && pRes.redirectUrl) {
                                        window.open(pRes.redirectUrl, '_blank');
                                      } else {
                                        alert(vRes.message || 'Payment status still pending.');
                                      }
                                    }
                                  } catch (err: any) {
                                    alert('Payment check error: ' + err.message);
                                  } finally {
                                    setIsVerifyingPaymentId(null);
                                  }
                                }}
                                disabled={isVerifyingPaymentId === order.id}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Verify or pay via Pesapal Mobile Money"
                              >
                                {isVerifyingPaymentId === order.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ExternalLink className="w-3.5 h-3.5" />
                                )}
                                <span>Pesapal Pay / Verify</span>
                              </button>
                            )}
                          </div>

                          {/* Action Hub for Bursar, Dispatch & Buyer */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Staff / Admin runner dispatch */}
                            {isStaffOrAdmin && !isCancelled && !isRefunded && !isCompleted && order.fulfillmentType !== 'SCHOOL_PICKUP' && order.status !== 'Out for Delivery' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDispatchOrderDialog(order);
                                  setRunnerPickupPoint(order.pickupLocation || 'School Main Dispensary / Store');
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1 cursor-pointer"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Assign Runner</span>
                              </button>
                            )}

                            {/* Runner or Staff delivery PIN completion */}
                            {!isCancelled && !isRefunded && !isCompleted && (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmPinOrderDialog(order);
                                  setEnteredDeliveryPin('');
                                  setPinVerificationError(null);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Confirm Delivery / PIN</span>
                              </button>
                            )}

                            {/* Bursar & Staff Quick Status Progression */}
                            {isStaffOrAdmin && !isCancelled && !isRefunded && !isCompleted && (
                              <>
                                {order.status !== 'Ready for Pickup' && order.status !== 'Out for Delivery' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const res = await updateOrderStatus(order.id, 'Ready for Pickup', undefined, currentUser, activeSchoolId);
                                      if (res.success) {
                                        setActionSuccessNotice(`Order #${order.orderNumber || order.id} marked Ready for Pickup.`);
                                        loadMarketData();
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-slate-700 transition"
                                  >
                                    Mark Ready
                                  </button>
                                )}
                              </>
                            )}

                            {/* Cancellation & Refund Options */}
                            {!isCancelled && !isRefunded && (
                              <button
                                type="button"
                                onClick={() => setCancelOrderDialog(order)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Cancel Order & Restore Stock"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            {!isCancelled && !isRefunded && (
                              <button
                                type="button"
                                onClick={() => setRefundOrderDialog(order)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition cursor-pointer"
                                title="Request Refund"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Product Detail Modal */}
      {/* ---------------------------------------------------- */}
      <MarketProductDetailModal
        item={selectedProductDetail}
        isOpen={Boolean(selectedProductDetail)}
        onClose={() => setSelectedProductDetail(null)}
        currentUser={currentUser}
        activeSchoolId={activeSchoolId}
        onAddToCart={handleAddToCart}
        isWishlisted={Boolean(
          selectedProductDetail &&
            wishlist.some((w) => w.itemId === selectedProductDetail.id || w.id === selectedProductDetail.id)
        )}
        onToggleWishlist={handleToggleWishlist}
        allCatalogItems={items}
        onSelectRelatedItem={(rel) => setSelectedProductDetail(rel)}
        onOrderPlaced={(updatedItem) => {
          setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
          loadMarketData();
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* Shopping Cart Drawer */}
      {/* ---------------------------------------------------- */}
      <MarketCartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          loadMarketData();
        }}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        activeSchoolId={activeSchoolId}
      />

      {/* ---------------------------------------------------- */}
      {/* Wishlist Drawer */}
      {/* ---------------------------------------------------- */}
      <MarketWishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        catalogItems={items}
        onAddToCart={(item) => handleAddToCart(item)}
        onRemoveFromWishlist={(itemId) => {
          const matched = items.find((i) => i.id === itemId);
          if (matched) handleToggleWishlist(matched);
        }}
        onOpenProductDetail={(item) => {
          setIsWishlistOpen(false);
          setSelectedProductDetail(item);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* Disputes Modal */}
      {/* ---------------------------------------------------- */}
      <MarketDisputesModal
        isOpen={isDisputesOpen}
        onClose={() => setIsDisputesOpen(false)}
        currentUser={currentUser}
        activeSchoolId={activeSchoolId}
      />

      {/* ---------------------------------------------------- */}
      {/* Market Help & Rules Modal */}
      {/* ---------------------------------------------------- */}
      <MarketHelpRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* ---------------------------------------------------- */}
      {/* Order Collection Receipt & QR Slip Modal */}
      {/* ---------------------------------------------------- */}
      <MarketOrderReceiptModal
        isOpen={Boolean(selectedReceiptOrder)}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder?.order || null}
        item={selectedReceiptOrder?.item || null}
      />

      {/* ---------------------------------------------------- */}
      {/* Cancel Order Dialog Modal */}
      {/* ---------------------------------------------------- */}
      {cancelOrderDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Cancel Order & Restore Inventory?</h3>
              <p className="text-xs text-slate-300">
                Cancelling order <strong>#{cancelOrderDialog.orderNumber || cancelOrderDialog.id}</strong> will restore reserved inventory stock immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">Reason for Cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Changed mind / Schedule conflict">Changed mind / Schedule conflict</option>
                <option value="Item not ready in time">Item not ready in time</option>
                <option value="Found alternative / Duplicate order">Found alternative / Duplicate order</option>
                <option value="Unable to collect at designated counter">Unable to collect at designated counter</option>
                <option value="Other / Mutual cancellation">Other / Mutual cancellation</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCancelOrderDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await cancelMarketOrder(cancelOrderDialog.id, cancelReason, currentUser, activeSchoolId);
                  if (res.success) {
                    setActionSuccessNotice(`Order #${cancelOrderDialog.orderNumber || cancelOrderDialog.id} cancelled. Stock inventory restored.`);
                    setCancelOrderDialog(null);
                    loadMarketData();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Refund Request Dialog Modal */}
      {/* ---------------------------------------------------- */}
      {refundOrderDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Request Order Refund</h3>
              <p className="text-xs text-slate-300">
                Submit a refund request for order <strong>#{refundOrderDialog.orderNumber || refundOrderDialog.id}</strong>. The Bursar Desk will review and process the return of funds.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">Reason for Refund:</label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explain the reason for the refund..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRefundOrderDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await requestOrderRefund(refundOrderDialog.id, refundReason, false, currentUser, activeSchoolId);
                  if (res.success) {
                    setActionSuccessNotice(`Refund request submitted for Order #${refundOrderDialog.orderNumber || refundOrderDialog.id}.`);
                    setRefundOrderDialog(null);
                    loadMarketData();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-lg"
              >
                Submit Refund Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Create / Edit Form Modal */}
      {/* ---------------------------------------------------- */}
      <MarketListingFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleListingSaved}
        initialItem={editingItem}
        currentUser={currentUser}
        activeSchoolId={activeSchoolId}
      />

      {/* ---------------------------------------------------- */}
      {/* Delete Confirmation Modal */}
      {/* ---------------------------------------------------- */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Product Listing?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently remove <strong>{confirmDeleteItem.title}</strong> and all associated media files? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDeleteItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteListing(confirmDeleteItem.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Dispatch Order Runner Modal */}
      {/* ---------------------------------------------------- */}
      {dispatchOrderDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Assign Campus Delivery Runner</h3>
                  <p className="text-[11px] text-slate-400">Order #{dispatchOrderDialog.orderNumber || dispatchOrderDialog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrderDialog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Destination Address</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-medium">
                  {dispatchOrderDialog.deliveryLocation || 'School Campus Delivery'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Delivery Runner Name</label>
                <input
                  type="text"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value)}
                  placeholder="Student Runner or Staff Courier"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Runner Phone</label>
                  <input
                    type="tel"
                    value={runnerPhone}
                    onChange={(e) => setRunnerPhone(e.target.value)}
                    placeholder="+256 700 000000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Est. Time of Arrival</label>
                  <input
                    type="text"
                    value={runnerEta}
                    onChange={(e) => setRunnerEta(e.target.value)}
                    placeholder="15 - 20 mins"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Inventory Collection Point</label>
                <input
                  type="text"
                  value={runnerPickupPoint}
                  onChange={(e) => setRunnerPickupPoint(e.target.value)}
                  placeholder="School Main Store / Bursar Counter"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Dispatch Instructions</label>
                <input
                  type="text"
                  value={runnerNotes}
                  onChange={(e) => setRunnerNotes(e.target.value)}
                  placeholder="Verify recipient identity and collect 4-digit PIN"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDispatchOrderDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!dispatchOrderDialog) return;
                  const res = await assignOrderDelivery(
                    dispatchOrderDialog.id,
                    {
                      deliveryPersonName: runnerName,
                      deliveryPersonPhone: runnerPhone,
                      pickupPoint: runnerPickupPoint,
                      estimatedTime: runnerEta,
                      dispatchNotes: runnerNotes,
                    },
                    currentUser,
                    activeSchoolId
                  );
                  if (res.success) {
                    setActionSuccessNotice(`Delivery runner assigned to Order #${dispatchOrderDialog.orderNumber || dispatchOrderDialog.id}. Status changed to Out for Delivery.`);
                    setDispatchOrderDialog(null);
                    loadMarketData();
                  } else {
                    alert(res.error || 'Failed to dispatch runner.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Confirm & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Confirm Delivery PIN Modal */}
      {/* ---------------------------------------------------- */}
      {confirmPinOrderDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm Delivery / Pickup</h3>
                  <p className="text-[11px] text-slate-400">Order #{confirmPinOrderDialog.orderNumber || confirmPinOrderDialog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmPinOrderDialog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Ask the recipient for their confidential <strong>4-Digit Delivery PIN</strong> or provide your PIN to complete this transaction and disburse funds.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-white">{confirmPinOrderDialog.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-emerald-300">{confirmPinOrderDialog.deliveryLocation || confirmPinOrderDialog.pickupLocation || 'Bursar Counter'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-mono text-emerald-400 font-bold">{confirmPinOrderDialog.totalPrice?.toLocaleString()} UGX</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">Enter 4-Digit PIN or QR Token:</label>
              <input
                type="text"
                maxLength={20}
                value={enteredDeliveryPin}
                onChange={(e) => {
                  setEnteredDeliveryPin(e.target.value);
                  setPinVerificationError(null);
                }}
                placeholder="e.g. 4821 or QR-TOKEN"
                className="w-full text-center tracking-widest font-mono text-lg font-bold p-3 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 focus:outline-none focus:border-emerald-400"
              />
              {pinVerificationError && (
                <p className="text-xs text-rose-400 font-medium">{pinVerificationError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmPinOrderDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirmPinOrderDialog) return;
                  const res = await confirmOrderDelivery(
                    confirmPinOrderDialog.id,
                    {
                      deliveryPin: enteredDeliveryPin.trim(),
                      qrToken: enteredDeliveryPin.trim(),
                      notes: 'Delivery completed via PIN confirmation',
                    },
                    currentUser,
                    activeSchoolId
                  );
                  if (res.success) {
                    setActionSuccessNotice(`Order #${confirmPinOrderDialog.orderNumber || confirmPinOrderDialog.id} marked Completed and delivered!`);
                    setConfirmPinOrderDialog(null);
                    loadMarketData();
                  } else {
                    setPinVerificationError(res.error || 'PIN verification failed. Please check the recipient PIN.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify & Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
