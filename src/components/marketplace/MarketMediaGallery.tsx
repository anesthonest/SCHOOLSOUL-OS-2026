import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { MarketplaceProductImage, MarketplaceProductVideo } from '../../types';

interface MarketMediaGalleryProps {
  images?: (string | MarketplaceProductImage)[];
  video?: MarketplaceProductVideo;
  title: string;
}

export const MarketMediaGallery: React.FC<MarketMediaGalleryProps> = ({
  images = [],
  video,
  title,
}) => {
  const normalizedImages: { id: string; url: string; thumbnailUrl?: string; caption?: string }[] =
    images.map((img, idx) => {
      if (typeof img === 'string') {
        return {
          id: `img-${idx}`,
          url: img,
          thumbnailUrl: img,
        };
      }
      return {
        id: img.id || `img-${idx}`,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl || img.url,
        caption: img.caption,
      };
    });

  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'video'>(
    normalizedImages.length > 0 ? 'images' : video ? 'video' : 'images'
  );
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = normalizedImages[selectedImageIdx] || normalizedImages[0];

  const handleNextImage = () => {
    if (normalizedImages.length === 0) return;
    setSelectedImageIdx((prev) => (prev + 1) % normalizedImages.length);
  };

  const handlePrevImage = () => {
    if (normalizedImages.length === 0) return;
    setSelectedImageIdx((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
  };

  const hasMedia = normalizedImages.length > 0 || Boolean(video);

  if (!hasMedia) {
    return (
      <div className="w-full aspect-[4/3] rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
        <ImageIcon className="w-10 h-10 opacity-30" />
        <span className="text-xs font-medium">No product media uploaded yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {/* Media Type Tabs (if both images and video exist) */}
      {normalizedImages.length > 0 && video && (
        <div className="flex items-center gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveMediaTab('images')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              activeMediaTab === 'images'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos ({normalizedImages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              activeMediaTab === 'video'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            Video Demo
          </button>
        </div>
      )}

      {/* Media Display Area */}
      {activeMediaTab === 'images' && activeImage && (
        <div className="space-y-2">
          {/* Main Hero Image */}
          <div className="relative group w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <img
              src={activeImage.url}
              alt={title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[380px] transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600';
              }}
            />

            {/* Lightbox / Zoom Trigger */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-lg"
              title="Expand High-Resolution Image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Navigation Arrows (if > 1 image) */}
            {normalizedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 opacity-80 hover:opacity-100 transition cursor-pointer shadow-lg"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 opacity-80 hover:opacity-100 transition cursor-pointer shadow-lg"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            {normalizedImages.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300">
                {selectedImageIdx + 1} / {normalizedImages.length}
              </div>
            )}

            {activeImage.caption && (
              <div className="absolute bottom-3 left-3 max-w-[70%] px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 truncate">
                {activeImage.caption}
              </div>
            )}
          </div>

          {/* Thumbnail Navigation Strip */}
          {normalizedImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin">
              {normalizedImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                    selectedImageIdx === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.thumbnailUrl || img.url}
                    alt={`${title} thumbnail ${idx + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video Display Area */}
      {activeMediaTab === 'video' && video && (
        <div className="w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-center items-center relative">
          <video
            src={video.url}
            poster={video.posterUrl}
            controls
            preload="metadata"
            playsInline
            className="w-full h-full max-h-[380px] object-contain rounded-2xl"
          >
            Your browser does not support HTML5 video playback.
          </video>
          {video.title && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
              {video.title} {video.durationSeconds ? `(${video.durationSeconds}s)` : ''}
            </div>
          )}
        </div>
      )}

      {/* High-Resolution Lightbox Modal */}
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 text-sm font-bold bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 cursor-pointer"
            >
              Close [ESC]
            </button>
            <img
              src={activeImage.url}
              alt={title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
            />
            {normalizedImages.length > 1 && (
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-mono">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white hover:bg-slate-800"
                >
                  Previous
                </button>
                <span>
                  {selectedImageIdx + 1} of {normalizedImages.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
