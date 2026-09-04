import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import type { MarketplaceItem } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: any[];
  catalogItems: MarketplaceItem[];
  onAddToCart: (item: MarketplaceItem) => void;
  onRemoveFromWishlist: (itemId: string) => void;
  onOpenProductDetail: (item: MarketplaceItem) => void;
}

export const MarketWishlistDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  wishlistItems,
  catalogItems,
  onAddToCart,
  onRemoveFromWishlist,
  onOpenProductDetail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved Wishlist</h2>
              <p className="text-xs text-slate-500">{wishlistItems.length} saved product{wishlistItems.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 space-y-3 overflow-y-auto">
          {wishlistItems.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center text-slate-400 space-y-3 my-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-600">Your wishlist is empty</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Save student products, organic produce, crafts, and tech gadgets to easily order them later.
              </p>
            </div>
          ) : (
            wishlistItems.map((wish) => {
              const matchedCatalog = catalogItems.find((c) => c.id === wish.itemId || c.id === wish.id);
              const title = wish.itemTitle || matchedCatalog?.title || 'School Market Item';
              const price = wish.itemPrice || matchedCatalog?.price || 0;
              const img = wish.itemImage || matchedCatalog?.primaryImage || matchedCatalog?.images?.[0];

              return (
                <div
                  key={wish.id || wish.itemId}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3"
                >
                  <div
                    onClick={() => matchedCatalog && onOpenProductDetail(matchedCatalog)}
                    className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200 cursor-pointer"
                  >
                    {img ? (
                      <img src={img} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => matchedCatalog && onOpenProductDetail(matchedCatalog)}
                      className="text-xs font-semibold text-slate-900 truncate hover:text-amber-600 cursor-pointer"
                    >
                      {title}
                    </h4>
                    <p className="text-xs font-bold text-amber-700 mt-1">
                      {price.toLocaleString()} UGX
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {matchedCatalog && matchedCatalog.inventoryCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => onAddToCart(matchedCatalog)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Cart</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Out of Stock</span>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveFromWishlist(wish.itemId || wish.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors ml-auto"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Close & Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
