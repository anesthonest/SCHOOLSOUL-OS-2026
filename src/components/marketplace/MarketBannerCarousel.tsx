import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, ArrowRight } from 'lucide-react';
import type { MarketplaceBanner } from '../../types';
import { fetchMarketBanners } from '../../services/marketplaceApi';

interface Props {
  onSelectCategory?: (category: string) => void;
  onOpenCreateListing?: () => void;
}

export const MarketBannerCarousel: React.FC<Props> = ({
  onSelectCategory,
  onOpenCreateListing,
}) => {
  const [banners, setBanners] = useState<MarketplaceBanner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchMarketBanners().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setBanners(res.data);
      } else {
        setBanners([
          {
            id: 'banner-default-1',
            schoolId: 'school-001',
            title: 'Student Innovation & Vocational Showcase',
            subtitle: 'Support young student entrepreneurs, organic science apiary honey, handcrafted arts, and robotics prototypes!',
            badge: 'Annual Enterprise Fair',
            actionText: 'Explore Inventions',
            actionCategory: 'Innovation Product',
            bgColor: 'from-amber-600 to-amber-900',
            isActive: true,
          },
          {
            id: 'banner-default-2',
            schoolId: 'school-001',
            title: 'School Canteen Fast Pass',
            subtitle: 'Pre-order healthy hot lunches and break snacks. Skip long queues with verified QR pickup at the canteen counter.',
            badge: 'Break & Lunch Fast Track',
            actionText: 'Order Canteen Snacks',
            actionCategory: 'School Canteen & Snacks',
            bgColor: 'from-emerald-700 to-teal-950',
            isActive: true,
          },
        ]);
      }
    });
  }, []);

  if (banners.length === 0) return null;

  const currentBanner = banners[activeIndex] || banners[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white shadow-lg mb-8 border border-amber-500/20">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {currentBanner.badge}
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            {currentBanner.title}
          </h2>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {currentBanner.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentBanner.actionText && (
              <button
                type="button"
                onClick={() => {
                  if (currentBanner.actionCategory && onSelectCategory) {
                    onSelectCategory(currentBanner.actionCategory);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm shadow hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <span>{currentBanner.actionText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onOpenCreateListing && (
              <button
                type="button"
                onClick={onOpenCreateListing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-sm border border-white/20 transition-colors cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                <span>Sell Student Product</span>
              </button>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <div className="flex md:flex-col items-center gap-2 self-center md:self-auto">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? 'w-8 h-2.5 bg-amber-300'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
