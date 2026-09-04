import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  RefreshCw,
  Star,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileVideo,
} from 'lucide-react';
import {
  uploadMarketProductImage,
  uploadMarketProductVideo,
  createMarketListing,
  updateMarketListing,
} from '../../services/marketplaceApi';
import type {
  MarketplaceItem,
  MarketplaceProductImage,
  MarketplaceProductVideo,
  User,
} from '../../types';

interface MarketListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: MarketplaceItem) => void;
  initialItem?: MarketplaceItem | null;
  currentUser?: User | null;
  activeSchoolId?: string;
}

const CATEGORIES = [
  'Agricultural Produce',
  'Art & Crafts',
  'Books & Stationery',
  'Tech Projects',
  'School Merchandise',
  'Innovation Product',
];

export const MarketListingFormModal: React.FC<MarketListingFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialItem,
  currentUser,
  activeSchoolId,
}) => {
  const isEditing = Boolean(initialItem);

  // Form State
  const [title, setTitle] = useState(initialItem?.title || '');
  const [category, setCategory] = useState(initialItem?.category || 'Agricultural Produce');
  const [price, setPrice] = useState<number>(initialItem?.price || 10000);
  const [currency, setCurrency] = useState(initialItem?.currency || 'UGX');
  const [inventoryCount, setInventoryCount] = useState<number>(initialItem?.inventoryCount || 10);
  const [studentCreator, setStudentCreator] = useState(
    initialItem?.studentCreator || currentUser?.fullName || 'Enterprise Club Member'
  );
  const [grade, setGrade] = useState(initialItem?.grade || 'Senior 3 Practical Stream');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [isPublished, setIsPublished] = useState(initialItem?.isPublished ?? true);

  // Media State
  const [images, setImages] = useState<MarketplaceProductImage[]>(
    initialItem?.mediaImages ||
      (initialItem?.images?.map((url, idx) => ({
        id: `img-${idx}`,
        url,
        thumbnailUrl: url,
        isPrimary: idx === 0,
      })) ?? [])
  );
  const [video, setVideo] = useState<MarketplaceProductVideo | undefined>(initialItem?.video);

  // Upload & Form Status
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDeleteMediaId, setConfirmDeleteMediaId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const replaceImageInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialItem?.title || '');
      setCategory(initialItem?.category || 'Agricultural Produce');
      setPrice(initialItem?.price || 10000);
      setCurrency(initialItem?.currency || 'UGX');
      setInventoryCount(initialItem?.inventoryCount || 10);
      setStudentCreator(initialItem?.studentCreator || currentUser?.fullName || 'Enterprise Club Member');
      setGrade(initialItem?.grade || 'Senior 3 Practical Stream');
      setDescription(initialItem?.description || '');
      setIsPublished(initialItem?.isPublished ?? true);
      setImages(
        initialItem?.mediaImages ||
          (initialItem?.images?.map((url, idx) => ({
            id: `img-${idx}`,
            url,
            thumbnailUrl: url,
            isPrimary: idx === 0,
          })) ?? [])
      );
      setVideo(initialItem?.video);
      setErrorMessage(null);
      setConfirmDeleteMediaId(null);
      setReplacingImageId(null);
    }
  }, [isOpen, initialItem, currentUser?.fullName]);

  // ----------------------------------------------------
  // Image Upload Handling
  // ----------------------------------------------------
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setErrorMessage('Maximum 8 images allowed per product listing.');
      return;
    }

    setErrorMessage(null);
    setIsUploadingImage(true);

    try {
      const newImagesList: MarketplaceProductImage[] = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isFirst = newImagesList.length === 0;
        const res = await uploadMarketProductImage(
          file,
          isFirst,
          '',
          currentUser,
          activeSchoolId
        );

        if (res.success && res.data) {
          newImagesList.push(res.data);
        } else {
          setErrorMessage(res.error || `Failed to upload image: ${file.name}`);
        }
      }
      setImages(newImagesList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // ----------------------------------------------------
  // Image Replacement Handling
  // ----------------------------------------------------
  const triggerReplaceImage = (imageId: string) => {
    setReplacingImageId(imageId);
    replaceImageInputRef.current?.click();
  };

  const handleReplaceImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingImageId) return;

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const currentImage = images.find((i) => i.id === replacingImageId);
      const res = await uploadMarketProductImage(
        file,
        currentImage?.isPrimary || false,
        currentImage?.caption || '',
        currentUser,
        activeSchoolId
      );

      if (res.success && res.data) {
        setImages((prev) =>
          prev.map((img) => (img.id === replacingImageId ? res.data! : img))
        );
      } else {
        setErrorMessage(res.error || 'Failed to replace image. Original retained.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Image replacement failed');
    } finally {
      setIsUploadingImage(false);
      setReplacingImageId(null);
      if (replaceImageInputRef.current) replaceImageInputRef.current.value = '';
    }
  };

  // ----------------------------------------------------
  // Set Primary Image
  // ----------------------------------------------------
  const handleSetPrimaryImage = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  };

  // ----------------------------------------------------
  // Reorder Images (Move Up / Down)
  // ----------------------------------------------------
  const handleMoveImage = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setImages(copy);
  };

  // ----------------------------------------------------
  // Delete Image
  // ----------------------------------------------------
  const handleDeleteImage = (imageId: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imageId);
      // Ensure at least one primary remains if available
      if (filtered.length > 0 && !filtered.some((i) => i.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    setConfirmDeleteMediaId(null);
  };

  // ----------------------------------------------------
  // Video Upload Handling
  // ----------------------------------------------------
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsUploadingVideo(true);

    try {
      const res = await uploadMarketProductVideo(
        file,
        title || file.name,
        currentUser,
        activeSchoolId
      );

      if (res.success && res.data) {
        setVideo(res.data);
      } else {
        setErrorMessage(res.error || 'Failed to upload promotional video');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Video upload failed');
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDeleteVideo = () => {
    setVideo(undefined);
    setConfirmDeleteMediaId(null);
  };

  // ----------------------------------------------------
  // Submit Form
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }
    if (price <= 0) {
      setErrorMessage('Price must be greater than 0.');
      return;
    }
    if (inventoryCount < 0) {
      setErrorMessage('Inventory count cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const primaryImg = images.find((i) => i.isPrimary)?.url || images[0]?.url || '';

    const payload: Partial<MarketplaceItem> = {
      title: title.trim(),
      category,
      price: Number(price),
      currency,
      inventoryCount: Number(inventoryCount),
      studentCreator: studentCreator.trim(),
      grade: grade.trim(),
      description: description.trim(),
      primaryImage: primaryImg,
      images: images.map((i) => i.url),
      mediaImages: images,
      video: video || undefined,
      isPublished,
      status: Number(inventoryCount) === 0 ? 'Sold Out' : 'Active',
    };

    try {
      if (isEditing && initialItem) {
        const res = await updateMarketListing(
          initialItem.id,
          payload,
          currentUser,
          activeSchoolId
        );
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        } else {
          setErrorMessage(res.error || 'Failed to update product listing');
        }
      } else {
        const res = await createMarketListing(payload, currentUser, activeSchoolId);
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        } else {
          setErrorMessage(res.error || 'Failed to create product listing');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred saving listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isEditing ? 'Edit Existing Listing' : 'New School Market Listing'}
            </span>
            <h2 className="text-xl font-black text-white">
              {isEditing ? `Edit: ${initialItem?.title}` : 'Publish Student Product or Enterprise Item'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-300">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Organic Pure Honey (500g Glass Jar)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Price *</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="UGX">UGX (Uganda)</option>
                  <option value="KES">KES (Kenya)</option>
                  <option value="TZS">TZS (Tanzania)</option>
                  <option value="RWF">RWF (Rwanda)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Available Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={inventoryCount}
                onChange={(e) => setInventoryCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Creator / Club Name</label>
              <input
                type="text"
                value={studentCreator}
                onChange={(e) => setStudentCreator(e.target.value)}
                placeholder="e.g. Senior 3 Agri Club"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-300">Class / Stream or Club Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Senior 3 Science & Agriculture"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-300">Product Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how the product was created, materials, benefits, and school pickup instructions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* Product Images Section */}
          {/* ---------------------------------------------------- */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Product Images ({images.length} / 8)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Supported formats: JPG, PNG, WebP, GIF (Max 5MB each). Primary image is displayed on catalog cards.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageFileChange}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage || images.length >= 8}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Upload Photos
                </button>
              </div>
            </div>

            {/* Hidden Input for Single Image Replacement */}
            <input
              type="file"
              ref={replaceImageInputRef}
              onChange={handleReplaceImageFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            {/* Uploaded Images List */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative rounded-xl overflow-hidden bg-slate-900 border p-1.5 flex flex-col justify-between group ${
                      img.isPrimary ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-950 relative">
                      <img
                        src={img.thumbnailUrl || img.url}
                        alt="Product preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                          <Star className="w-2.5 h-2.5 fill-current" /> Primary
                        </span>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-between pt-2 px-1 text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'up')}
                          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, 'down')}
                          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move later"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.id)}
                            className="p-1 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 cursor-pointer"
                            title="Set as primary"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => triggerReplaceImage(img.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Replace this image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteMediaId(img.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation Overlay for this Image */}
                    {confirmDeleteMediaId === img.id && (
                      <div className="absolute inset-0 bg-black/90 p-2 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 z-10">
                        <span className="text-[10px] text-slate-300 font-medium">Remove image?</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteMediaId(null)}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 cursor-pointer transition gap-2"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-semibold">Click to select photos or drag and drop</span>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* Product Promotional Video Section */}
          {/* ---------------------------------------------------- */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <VideoIcon className="w-4 h-4 text-amber-400" />
                  Promotional Video Demonstration (Optional)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Supported formats: MP4, WebM (Max 30MB, max 90s duration).
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoFileChange}
                  accept="video/mp4,video/webm"
                  className="hidden"
                />
                {!video && (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingVideo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Upload Video Demo
                  </button>
                )}
              </div>
            </div>

            {video ? (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {video.posterUrl ? (
                      <img src={video.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                    ) : (
                      <FileVideo className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-white truncate max-w-xs">{video.title || video.fileName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {video.durationSeconds ? `${video.durationSeconds}s` : ''} •{' '}
                      {video.fileSizeBytes ? `${(video.fileSizeBytes / 1024 / 1024).toFixed(1)} MB` : 'Video Ready'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteMediaId('video-delete')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                {confirmDeleteMediaId === 'video-delete' && (
                  <div className="w-full p-2.5 rounded-xl bg-black/90 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                    <span>Permanently remove this promotional video?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteVideo}
                        className="px-2 py-1 rounded bg-rose-600 text-white font-bold cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteMediaId(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Publishing Controls & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800 cursor-pointer"
              />
              <span>Publish immediately to School Market catalog (Visible to school buyers)</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || isUploadingVideo}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Listing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isEditing ? 'Save Changes' : isPublished ? 'Publish Product' : 'Save as Draft'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
