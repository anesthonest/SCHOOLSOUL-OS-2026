import { getAuthHeaders as getBaseAuthHeaders } from './api';
import type {
  MarketplaceItem,
  MarketplaceOrder,
  MarketplaceProductImage,
  MarketplaceProductVideo,
  User,
  Student,
} from '../types';

export interface MarketListingsResponse {
  success: boolean;
  data: MarketplaceItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface MarketMediaUploadResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface MarketStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  mediaCount: number;
  videoCount: number;
  currency: string;
}

// Client-side image compression & thumbnail generation utility
export async function compressAndResizeImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<{ dataUrl: string; base64Data: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image binary'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas rendering context unavailable'));
        }

        // Clean background for transparency or JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64Data = dataUrl.split(',')[1];
        const sizeBytes = Math.round((base64Data.length * 3) / 4);

        resolve({
          dataUrl,
          base64Data,
          width,
          height,
          sizeBytes,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Client-side video metadata reader (duration & poster snapshot generator)
export async function extractVideoMetadata(
  file: File
): Promise<{ durationSeconds: number; posterUrl: string; base64Data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read video file'));
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const blobUrl = URL.createObjectURL(file);
      video.src = blobUrl;

      video.onloadedmetadata = () => {
        const durationSeconds = Math.round(video.duration || 0);

        // Seek to 1 second to capture poster
        video.currentTime = Math.min(1, Math.max(0.1, durationSeconds / 4));
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          let posterUrl = '';
          if (ctx && canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            posterUrl = canvas.toDataURL('image/jpeg', 0.8);
          }
          URL.revokeObjectURL(blobUrl);
          resolve({
            durationSeconds: Math.round(video.duration || 0),
            posterUrl,
            base64Data,
          });
        } catch {
          URL.revokeObjectURL(blobUrl);
          resolve({
            durationSeconds: Math.round(video.duration || 0),
            posterUrl: '',
            base64Data,
          });
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        // If snapshot fails, still allow metadata extraction
        resolve({
          durationSeconds: 0,
          posterUrl: '',
          base64Data,
        });
      };
    };
    reader.readAsDataURL(file);
  });
}

function getAuthHeaders(user?: User | null, schoolId?: string): Record<string, string> {
  const extra: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (schoolId) {
    extra['x-school-id'] = schoolId;
  }

  if (user) {
    extra['x-user-id'] = user.id;
    extra['x-user-role'] = user.role;
    extra['x-user-name'] = user.fullName || user.username;
  }

  return getBaseAuthHeaders(extra);
}

// ----------------------------------------------------------------------
// 1. Fetch Market Listings
// ----------------------------------------------------------------------
export async function fetchMarketListings(
  params?: {
    category?: string;
    search?: string;
    sellerId?: string;
    status?: string;
    isPublished?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    schoolId?: string;
  },
  user?: User | null
): Promise<MarketListingsResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.sellerId) query.set('sellerId', params.sellerId);
  if (params?.status) query.set('status', params.status);
  if (params?.isPublished !== undefined) query.set('isPublished', String(params.isPublished));
  if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  try {
    const res = await fetch(`/api/market/listings?${query.toString()}`, {
      headers: getAuthHeaders(user, params?.schoolId),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data: MarketListingsResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('API fetch failed, reading fallback from localStorage:', err);
    // Offline / LocalStorage Fallback
    const stored = localStorage.getItem('schoolsoul_marketplace_items');
    const localItems: MarketplaceItem[] = stored ? JSON.parse(stored) : [];
    return {
      success: true,
      data: localItems,
      meta: {
        total: localItems.length,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    };
  }
}

// ----------------------------------------------------------------------
// 2. Fetch Single Product Detail
// ----------------------------------------------------------------------
export async function fetchMarketListingById(
  id: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${id}`, {
      headers: getAuthHeaders(user, schoolId),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch listing (${res.status})`);
    }
    return await res.json();
  } catch (err: any) {
    // Offline fallback
    const stored = localStorage.getItem('schoolsoul_marketplace_items');
    if (stored) {
      const items: MarketplaceItem[] = JSON.parse(stored);
      const found = items.find((i) => i.id === id);
      if (found) return { success: true, data: found };
    }
    return { success: false, error: err.message || 'Product listing not found.' };
  }
}

// ----------------------------------------------------------------------
// 3. Upload Product Image (with client-side optimization & server validation)
// ----------------------------------------------------------------------
export async function uploadMarketProductImage(
  file: File,
  isPrimary = false,
  caption = '',
  user?: User | null,
  schoolId?: string
): Promise<MarketMediaUploadResponse<MarketplaceProductImage>> {
  try {
    // Client-side compression
    const { base64Data, dataUrl, width, height, sizeBytes } = await compressAndResizeImage(file);

    const payload = {
      fileName: file.name,
      mimeType: file.type || 'image/jpeg',
      base64Data,
      isPrimary,
      caption,
      width,
      height,
      fileSize: sizeBytes,
    };

    const res = await fetch('/api/market/upload/image', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to upload product image');
    }

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error occurred while processing and uploading image',
    };
  }
}

// ----------------------------------------------------------------------
// 4. Upload Product Promotional Video
// ----------------------------------------------------------------------
export async function uploadMarketProductVideo(
  file: File,
  title?: string,
  user?: User | null,
  schoolId?: string
): Promise<MarketMediaUploadResponse<MarketplaceProductVideo>> {
  try {
    // Validation check: 30MB limit
    if (file.size > 30 * 1024 * 1024) {
      throw new Error(`Video file (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum 30MB limit.`);
    }

    // Extract metadata & snapshot poster
    const { durationSeconds, posterUrl, base64Data } = await extractVideoMetadata(file);

    if (durationSeconds > 90) {
      throw new Error(`Video duration (${durationSeconds}s) exceeds maximum allowed limit of 90 seconds.`);
    }

    const payload = {
      fileName: file.name,
      mimeType: file.type || 'video/mp4',
      base64Data,
      durationSeconds,
      title: title || file.name,
      posterUrl,
      fileSize: file.size,
    };

    const res = await fetch('/api/market/upload/video', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to upload product video');
    }

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error occurred while processing and uploading video',
    };
  }
}

// ----------------------------------------------------------------------
// 5. Create Product Listing
// ----------------------------------------------------------------------
export async function createMarketListing(
  listingData: Partial<MarketplaceItem>,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch('/api/market/listings', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(listingData),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to create listing');
    }

    // Sync to local cache
    const stored = localStorage.getItem('schoolsoul_marketplace_items');
    const items: MarketplaceItem[] = stored ? JSON.parse(stored) : [];
    items.unshift(result.data);
    localStorage.setItem('schoolsoul_marketplace_items', JSON.stringify(items));

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save product listing' };
  }
}

// ----------------------------------------------------------------------
// 6. Update Product Listing & Reorder Media
// ----------------------------------------------------------------------
export async function updateMarketListing(
  id: string,
  updates: Partial<MarketplaceItem>,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(updates),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to update listing');
    }

    // Update local cache
    const stored = localStorage.getItem('schoolsoul_marketplace_items');
    if (stored) {
      const items: MarketplaceItem[] = JSON.parse(stored);
      const idx = items.findIndex((i) => i.id === id);
      if (idx !== -1) {
        items[idx] = result.data;
        localStorage.setItem('schoolsoul_marketplace_items', JSON.stringify(items));
      }
    }

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update product listing' };
  }
}

// ----------------------------------------------------------------------
// 7. Delete Product Listing
// ----------------------------------------------------------------------
export async function deleteMarketListing(
  id: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(user, schoolId),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to delete listing');
    }

    // Remove from local cache
    const stored = localStorage.getItem('schoolsoul_marketplace_items');
    if (stored) {
      const items: MarketplaceItem[] = JSON.parse(stored);
      const filtered = items.filter((i) => i.id !== id);
      localStorage.setItem('schoolsoul_marketplace_items', JSON.stringify(filtered));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete listing' };
  }
}

// ----------------------------------------------------------------------
// 8. Replace Specific Media Item (Image or Video)
// ----------------------------------------------------------------------
export async function replaceMarketMedia(
  listingId: string,
  mediaId: string,
  newMedia: MarketplaceProductImage | MarketplaceProductVideo,
  mediaType: 'image' | 'video' = 'image',
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${listingId}/media/${mediaId}/replace`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ newMedia, mediaType }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to replace media');
    }

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to replace product media' };
  }
}

// ----------------------------------------------------------------------
// 9. Delete Specific Media Item
// ----------------------------------------------------------------------
export async function deleteMarketMedia(
  listingId: string,
  mediaId: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${listingId}/media/${mediaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(user, schoolId),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to delete media');
    }

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete product media' };
  }
}

// ----------------------------------------------------------------------
// 10. Toggle Publish / Draft
// ----------------------------------------------------------------------
export async function togglePublishListing(
  listingId: string,
  isPublished: boolean,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${listingId}/publish`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ isPublished }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to toggle publish status');
    }

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update publication status' };
  }
}

// ----------------------------------------------------------------------
// 11. Place Order / Reservation
// ----------------------------------------------------------------------
export async function submitMarketOrder(
  orderData: {
    itemId: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail?: string;
    quantity: number;
    paymentMethod?: string;
  },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/market/orders', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(orderData),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to place order');
    }

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit order' };
  }
}

// ----------------------------------------------------------------------
// 12. Fetch Market Stats
// ----------------------------------------------------------------------
export async function fetchMarketStats(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketStats; error?: string }> {
  try {
    const res = await fetch('/api/market/stats', {
      headers: getAuthHeaders(user, schoolId),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch market stats');
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: true,
      data: {
        totalProducts: 3,
        activeProducts: 3,
        totalOrders: 0,
        totalRevenue: 0,
        mediaCount: 4,
        videoCount: 1,
        currency: 'UGX',
      },
    };
  }
}

// ----------------------------------------------------------------------
// 13. Fetch Categories with Item Counts
// ----------------------------------------------------------------------
export async function fetchMarketCategories(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: { name: string; count: number }[]; error?: string }> {
  try {
    const res = await fetch('/api/market/categories', {
      headers: getAuthHeaders(user, schoolId),
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err: any) {
    return {
      success: true,
      data: [
        { name: 'Art & Crafts', count: 4 },
        { name: 'Agricultural Produce', count: 6 },
        { name: 'Books & Stationery', count: 3 },
        { name: 'Tech Projects', count: 5 },
        { name: 'School Merchandise', count: 2 },
        { name: 'Innovation Product', count: 4 },
        { name: 'School Canteen & Snacks', count: 8 },
        { name: 'Uniforms & Apparel', count: 3 },
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 14. Wishlist API Methods
// ----------------------------------------------------------------------
export async function fetchWishlist(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch('/api/market/wishlist', {
      headers: getAuthHeaders(user, schoolId),
    });
    if (!res.ok) throw new Error('Failed to load wishlist');
    return await res.json();
  } catch (err: any) {
    // Fallback to local storage for offline resilience
    const local = localStorage.getItem('schoolsoul_market_wishlist');
    return { success: true, data: local ? JSON.parse(local) : [] };
  }
}

export async function toggleWishlistItem(
  itemId: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; isSaved?: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/market/wishlist/toggle', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ itemId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle wishlist' };
  }
}

// ----------------------------------------------------------------------
// 15. Shopping Cart & Server Validation
// ----------------------------------------------------------------------
export async function validateShoppingCart(
  cartPayload: { items: any[]; discountCode?: string },
  user?: User | null,
  schoolId?: string
): Promise<{
  success: boolean;
  data?: {
    items: any[];
    subtotal: number;
    discountAmount: number;
    appliedDiscount?: any;
    finalTotal: number;
    warnings: string[];
    currency: string;
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/market/cart/validate', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(cartPayload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to validate cart' };
  }
}

export async function checkoutShoppingCart(
  checkoutData: {
    buyerName: string;
    buyerPhone: string;
    buyerEmail?: string;
    items: any[];
    paymentMethod: string;
    discountCode?: string;
    fulfillmentType?: 'SCHOOL_PICKUP' | 'SCHOOL_DELIVERY' | 'LOCAL_DELIVERY';
    pickupLocation?: string;
    deliveryLocation?: string;
    deliveryInstructions?: string;
    recipientName?: string;
    recipientPhone?: string;
  },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/market/orders/checkout', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(checkoutData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to checkout cart' };
  }
}

export async function validateDiscountCode(
  discountCode: string,
  subtotal: number,
  schoolId?: string,
  user?: User | null
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await validateShoppingCart({ items: [{ id: 'mock', price: subtotal, quantity: 1 }], discountCode }, user, schoolId);
    if (res.success && res.data && res.data.appliedDiscount) {
      return { success: true, data: res.data.appliedDiscount };
    }
    return {
      success: false,
      message: res.error || (res.data?.warnings && res.data.warnings[0]) || 'Invalid or expired discount code',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to validate discount code' };
  }
}

export const createMarketplaceOrder = submitMarketOrder;

// ----------------------------------------------------------------------
// 16. Reviews & Ratings
// ----------------------------------------------------------------------
export async function fetchMarketReviews(
  itemId: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch(`/api/market/reviews/${itemId}`, {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return { success: true, data: [] };
  }
}

export async function submitMarketReview(
  reviewData: { itemId: string; rating: number; comment: string; userName?: string },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/market/reviews', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(reviewData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

// ----------------------------------------------------------------------
// 17. Disputes & Resolutions
// ----------------------------------------------------------------------
export async function fetchMarketDisputes(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch('/api/market/disputes', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return { success: true, data: [] };
  }
}

export async function submitMarketDispute(
  disputeData: { orderId: string; itemId?: string; reason: string; details: string },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/market/disputes', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(disputeData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit dispute' };
  }
}

export async function resolveMarketDispute(
  disputeId: string,
  resolutionNotes: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/disputes/${disputeId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ resolutionNotes, status: 'RESOLVED' }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to resolve dispute' };
  }
}

// ----------------------------------------------------------------------
// 18. Promotional Banners
// ----------------------------------------------------------------------
export async function fetchMarketBanners(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch('/api/market/banners', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: true,
      data: [
        {
          id: 'banner-default-1',
          title: 'Student Innovation & Vocational Showcase',
          subtitle: 'Support young student entrepreneurs, organic science apiary honey, and robotics creations!',
          badge: 'Annual Enterprise Fair',
          actionText: 'Explore Inventions',
          actionCategory: 'Innovation Product',
          bgColor: 'from-amber-600 to-amber-900',
          isActive: true,
        },
      ],
    };
  }
}

// ----------------------------------------------------------------------
// 19. Seller Hub & Payout Requests
// ----------------------------------------------------------------------
export async function fetchSellerBalance(
  user?: User | null,
  schoolId?: string
): Promise<{
  success: boolean;
  data?: {
    grossSales: number;
    platformCommissionRate: string;
    commissionDeducted: number;
    totalWithdrawn: number;
    availableBalance: number;
    currency: string;
    payouts: any[];
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/market/seller/balance', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: true,
      data: {
        grossSales: 125000,
        platformCommissionRate: '10%',
        commissionDeducted: 12500,
        totalWithdrawn: 0,
        availableBalance: 112500,
        currency: 'UGX',
        payouts: [],
      },
    };
  }
}

export async function submitSellerPayoutRequest(
  payoutData: { amount: number; payoutMethod: string; accountDetails?: string },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/market/seller/payout-request', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(payoutData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to request payout' };
  }
}

// ----------------------------------------------------------------------
// 20. Product Moderation
// ----------------------------------------------------------------------
export async function moderateMarketListing(
  listingId: string,
  moderationStatus: 'Approved' | 'Rejected' | 'Pending',
  moderationNotes?: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/listings/${listingId}/moderate`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ moderationStatus, moderationNotes }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to moderate product' };
  }
}

// ----------------------------------------------------------------------
// 21. Canteen Fast Stock
// ----------------------------------------------------------------------
export async function fetchCanteenItems(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem[]; error?: string }> {
  try {
    const res = await fetch('/api/market/canteen/items', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return { success: true, data: [] };
  }
}

export async function updateCanteenStock(
  itemId: string,
  inventoryCount: number,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceItem; error?: string }> {
  try {
    const res = await fetch(`/api/market/canteen/items/${itemId}/stock`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ inventoryCount }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update canteen inventory' };
  }
}

// ----------------------------------------------------------------------
// 22. Order Status, Cancel, Refund & Rules
// ----------------------------------------------------------------------
export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentStatus?: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ status, paymentStatus }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update order status' };
  }
}

export async function cancelMarketOrder(
  orderId: string,
  reason?: string,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ reason }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to cancel order' };
  }
}

export async function requestOrderRefund(
  orderId: string,
  reason?: string,
  approve?: boolean,
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/orders/${orderId}/refund`, {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ reason, approve }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to process refund' };
  }
}

export async function fetchMarketRules(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch('/api/market/help-rules', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: true,
      data: {
        title: 'SchoolSoul Enterprise Market Guidelines & Rules',
        rules: [
          {
            topic: 'Student Enterprise & Safety',
            details: 'All products are student-made, vocational club creations, or verified school canteen supplies. Offensive or hazardous materials are strictly prohibited and automatically screened.',
          },
          {
            topic: 'Collection & Fulfillment',
            details: 'Products can be collected at the School Bursar Counter or designated Vocational Workshop upon presenting your digital QR Token or Order Number.',
          },
          {
            topic: 'Payment & Escrow Protection',
            details: 'Payments are handled either via cash at the Bursar office or securely via Pesapal Instant Mobile Money (MTN / Airtel / Visa). Funds are held until items are verified upon pickup.',
          },
          {
            topic: 'Disputes & Refunds',
            details: 'If an item is defective or unavailable, open a dispute directly from your Orders tab or request a refund at the Bursar desk.',
          },
        ],
      },
    };
  }
}

// ----------------------------------------------------------------------
// 23. Pesapal 3.0 Instant Payment Gateway Integration
// ----------------------------------------------------------------------
export async function initPesapalMarketPayment(
  orderId: string,
  user?: User | null,
  schoolId?: string
): Promise<{
  success: boolean;
  redirectUrl?: string;
  orderTrackingId?: string;
  merchantReference?: string;
  data?: any;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/market/orders/pesapal-init', {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify({ orderId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to initialize Pesapal payment gateway' };
  }
}

export async function verifyPesapalMarketPayment(
  orderTrackingId: string,
  user?: User | null,
  schoolId?: string
): Promise<{
  success: boolean;
  verified?: boolean;
  paymentStatus?: string;
  order?: MarketplaceOrder;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/market/orders/pesapal-verify/${orderTrackingId}`, {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to verify Pesapal payment status' };
  }
}

// ----------------------------------------------------------------------
// 24. School Campus Delivery & Dispatch Management
// ----------------------------------------------------------------------
export async function assignOrderDelivery(
  orderId: string,
  runnerData: {
    deliveryPersonId?: string;
    deliveryPersonName: string;
    deliveryPersonPhone?: string;
    pickupPoint?: string;
    estimatedTime?: string;
    dispatchNotes?: string;
  },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/orders/${orderId}/assign-delivery`, {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(runnerData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign delivery runner' };
  }
}

export async function confirmOrderDelivery(
  orderId: string,
  payload: { deliveryPin?: string; qrToken?: string; notes?: string },
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder; message?: string; error?: string }> {
  try {
    const res = await fetch(`/api/market/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
      headers: getAuthHeaders(user, schoolId),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to confirm delivery' };
  }
}

export async function fetchDeliveryOrders(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: MarketplaceOrder[]; error?: string }> {
  try {
    const res = await fetch('/api/market/delivery/orders', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch delivery orders' };
  }
}

export async function fetchDeliveryRunners(
  user?: User | null,
  schoolId?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch('/api/market/delivery/runners', {
      headers: getAuthHeaders(user, schoolId),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch delivery runners' };
  }
}


