import React, { useState, useEffect } from 'react';
import {
  Coffee,
  ShoppingBag,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { MarketplaceItem, User } from '../../types';
import { fetchCanteenItems, updateCanteenStock } from '../../services/marketplaceApi';

interface Props {
  currentUser?: User | null;
  activeSchoolId: string;
  onAddToCart: (item: MarketplaceItem) => void;
  onOpenProductDetail: (item: MarketplaceItem) => void;
}

export const MarketCanteenFastStock: React.FC<Props> = ({
  currentUser,
  activeSchoolId,
  onAddToCart,
  onOpenProductDetail,
}) => {
  const [canteenItems, setCanteenItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isStaffOrBursar = ['administrator', 'super admin', 'admin', 'bursar', 'teacher', 'staff'].includes(
    (currentUser?.role || '').toLowerCase()
  );

  const loadCanteen = async () => {
    setIsLoading(true);
    try {
      const res = await fetchCanteenItems(currentUser, activeSchoolId);
      if (res.success && res.data && res.data.length > 0) {
        setCanteenItems(res.data);
      } else {
        // Fallback default canteen menu
        setCanteenItems([
          {
            id: 'canteen-rolex-1',
            schoolId: activeSchoolId,
            title: 'Freshly Rolled Egg Rolex (2 Eggs + Cabbage & Tomato)',
            category: 'School Canteen & Snacks',
            price: 3000,
            currency: 'UGX',
            inventoryCount: 45,
            studentCreator: 'School Canteen Kitchen',
            grade: 'Hot Meals Stream',
            description: 'Hot freshly made traditional egg rolex rolled with garden tomatoes, sweet onions, and shredded cabbage. (~5 min prep time)',
            status: 'Active',
            qrCode: 'SCH-CAN-001',
            isPublished: true,
            primaryImage: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800',
            images: ['https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800'],
            isCanteenItem: true,
            orders: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'canteen-samosa-2',
            schoolId: activeSchoolId,
            title: 'Crispy Beef & Veg Samosa Pair (2 Pcs)',
            category: 'School Canteen & Snacks',
            price: 2500,
            currency: 'UGX',
            inventoryCount: 60,
            studentCreator: 'School Canteen Kitchen',
            grade: 'Break Snack',
            description: 'Golden crispy pastry filled with spiced minced beef, garden peas, and coriander herbs. (~2 min prep time)',
            status: 'Active',
            qrCode: 'SCH-CAN-002',
            isPublished: true,
            primaryImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
            images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800'],
            isCanteenItem: true,
            orders: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'canteen-lunch-3',
            schoolId: activeSchoolId,
            title: 'Special Hot Lunch Meal Token (Rice, Beans, Beef & Greens)',
            category: 'School Canteen & Snacks',
            price: 6000,
            currency: 'UGX',
            inventoryCount: 80,
            studentCreator: 'School Catering Department',
            grade: 'Main Lunch Pass',
            description: 'Nutritious hot lunchtime full plate meal voucher. Skip long cash lines and collect directly at the Fast Pass counter.',
            status: 'Active',
            qrCode: 'SCH-CAN-003',
            isPublished: true,
            primaryImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
            images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'],
            isCanteenItem: true,
            orders: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'canteen-juice-4',
            schoolId: activeSchoolId,
            title: 'Chilled Passion & Mango Fresh Fruit Juice (350ml Bottle)',
            category: 'School Canteen & Snacks',
            price: 2000,
            currency: 'UGX',
            inventoryCount: 30,
            studentCreator: 'Agri Juice Bar',
            grade: 'Cold Beverage',
            description: '100% freshly pressed organic passion fruit and mango juice with no artificial preservatives.',
            status: 'Active',
            qrCode: 'SCH-CAN-004',
            isPublished: true,
            primaryImage: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800',
            images: ['https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800'],
            isCanteenItem: true,
            orders: [],
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load canteen items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCanteen();
  }, [activeSchoolId]);

  const handleUpdateStock = async (itemId: string, newCount: number) => {
    const safeCount = Math.max(0, newCount);
    setCanteenItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, inventoryCount: safeCount } : item))
    );
    await updateCanteenStock(itemId, safeCount, currentUser, activeSchoolId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Canteen Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-md border border-emerald-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Coffee className="w-3.5 h-3.5" />
            <span>School Canteen Fast Pass</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Daily Break & Lunch Quick Order Menu
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Pre-order hot snacks, nutritious lunch vouchers, and fresh juices. Collect instantly with your QR order token at the canteen fast counter.
          </p>
        </div>

        {isStaffOrBursar && (
          <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/20 text-xs text-emerald-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Staff Fast-Stock Control Enabled</span>
          </div>
        )}
      </div>

      {/* Grid of Canteen Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {canteenItems.map((item) => {
          const img = item.primaryImage || item.images?.[0];
          const isAvailable = item.inventoryCount > 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => onOpenProductDetail(item)}
                  className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer group"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Coffee className="w-10 h-10" />
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        isAvailable
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isAvailable ? `${item.inventoryCount} left` : 'Sold Out'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3
                    onClick={() => onOpenProductDetail(item)}
                    className="font-bold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer line-clamp-1"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-base font-bold text-emerald-800 pt-1">
                    {item.price.toLocaleString()} <span className="text-xs font-medium text-slate-500">UGX</span>
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onAddToCart(item)}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isAvailable ? 'Add to Cart / Order' : 'Sold Out'}</span>
                </button>

                {isStaffOrBursar && (
                  <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">Fast Stock:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStock(item.id, item.inventoryCount - 5)}
                        className="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Reduce stock by 5"
                      >
                        -5
                      </button>
                      <span className="font-bold text-slate-900 min-w-[20px] text-center">
                        {item.inventoryCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStock(item.id, item.inventoryCount + 10)}
                        className="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
