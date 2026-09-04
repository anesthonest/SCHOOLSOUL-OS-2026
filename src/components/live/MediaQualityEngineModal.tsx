import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Video,
  CheckCircle,
  Download,
  RotateCw,
  Crop,
  Layers,
  Eye,
  X,
  Upload,
  Sun,
  Contrast,
  Zap,
} from 'lucide-react';
import type { MediaProcessingProfile, MediaItem } from '../../types';
import { liveLearningApi } from '../../services/liveLearningApi';

interface MediaQualityEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaSaved: (media: MediaItem) => void;
}

const PRESET_PROFILES: {
  id: MediaProcessingProfile;
  name: string;
  desc: string;
  exposure: number;
  contrast: number;
  saturation: number;
  sharpness: number;
}[] = [
  {
    id: 'NATURAL',
    name: 'Natural Faithful',
    desc: 'True-to-life color calibration and authentic skin-tones without artificial overprocessing',
    exposure: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 10,
  },
  {
    id: 'PROFESSIONAL',
    name: 'Academic Studio',
    desc: 'Crisp text sharpness, balanced studio lighting, and subtle shadow fill for classroom posters',
    exposure: 108,
    contrast: 108,
    saturation: 102,
    sharpness: 35,
  },
  {
    id: 'VIVID',
    name: 'Vivid Event',
    desc: 'Rich color pop for sports days, drama performances, and science exhibitions',
    exposure: 105,
    contrast: 115,
    saturation: 125,
    sharpness: 25,
  },
  {
    id: 'LOW_LIGHT_ENHANCED',
    name: 'Low-Light Boost',
    desc: 'Noise-reduced shadow elevation for poorly lit evening classrooms or assemblies',
    exposure: 125,
    contrast: 95,
    saturation: 105,
    sharpness: 40,
  },
  {
    id: 'SOFT',
    name: 'Soft Portrait',
    desc: 'Gentle tone curve ideal for student graduation and digital ID portrait photos',
    exposure: 104,
    contrast: 98,
    saturation: 96,
    sharpness: 5,
  },
];

export const MediaQualityEngineModal: React.FC<MediaQualityEngineModalProps> = ({
  isOpen,
  onClose,
  onMediaSaved,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<MediaProcessingProfile>('PROFESSIONAL');
  const [title, setTitle] = useState<string>('Classroom Experiment Capture');
  const [description, setDescription] = useState<string>('High quality science laboratory documentation');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200'
  );
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  // Slider adjustments
  const [exposure, setExposure] = useState<number>(108);
  const [contrast, setContrast] = useState<number>(108);
  const [saturation, setSaturation] = useState<number>(102);
  const [sharpness, setSharpness] = useState<number>(35);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [splitViewMode, setSplitViewMode] = useState<boolean>(true);

  // Apply preset values
  const handleSelectProfile = (p: typeof PRESET_PROFILES[0]) => {
    setSelectedProfile(p.id);
    setExposure(p.exposure);
    setContrast(p.contrast);
    setSaturation(p.saturation);
    setSharpness(p.sharpness);
  };

  const handleProcessAndSave = async () => {
    if (!title.trim() || !imageUrl) return;
    setIsProcessing(true);
    try {
      const res = await liveLearningApi.processMedia({
        title: title.trim(),
        description: description.trim(),
        mediaType,
        originalUrl: imageUrl,
        processingProfile: selectedProfile,
        settings: {
          aspectRatio: aspectRatio as any,
          autoExposure: true,
          contrastEnhance: contrast > 100,
          sharpness: sharpness / 100,
          noiseReduction: 85,
        },
      });

      onMediaSaved(res.media);
      onClose();
    } catch (err: any) {
      alert(`Processing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const filterStyle = `brightness(${exposure}%) contrast(${contrast}%) saturate(${saturation}%)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                SchoolSoul Media Quality & Calibration Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enhance school photos and lesson recordings without artificial distortions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1">
          {/* Left Preview Section */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              {splitViewMode ? (
                <div className="w-full h-full flex">
                  {/* Left half: Original */}
                  <div className="w-1/2 h-full relative overflow-hidden border-r border-white/30">
                    <img
                      src={imageUrl}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                      Original
                    </div>
                  </div>

                  {/* Right half: Enhanced */}
                  <div className="w-1/2 h-full relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                      style={{ filter: filterStyle }}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-purple-600/90 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                      Calibrated
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <img
                    src={imageUrl}
                    alt="Processed Preview"
                    className="w-full h-full object-cover"
                    style={{ filter: filterStyle }}
                  />
                </div>
              )}

              {/* Badges */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md border border-white/10">
                  {aspectRatio} Format
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600/90 text-white backdrop-blur-md">
                  Profile: {selectedProfile}
                </span>
              </div>
            </div>

            {/* Split View Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSplitViewMode(!splitViewMode)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{splitViewMode ? 'Show Full Processed View' : 'Show Split Comparison'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Aspect:</span>
                {['16:9', '4:3', '1:1'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                      aspectRatio === ratio
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Input URL for Custom Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Source Media URL / Sample
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageUrl(
                      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200'
                    )
                  }
                  className="px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
                >
                  Sample Lab
                </button>
              </div>
            </div>
          </div>

          {/* Right Tuning & Profiles Section */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  1. Select Enhancement Preset
                </label>
                <div className="space-y-1.5">
                  {PRESET_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProfile(p)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                        selectedProfile === p.id
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 text-purple-950 dark:text-purple-100 ring-1 ring-purple-600'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{p.name}</span>
                        {selectedProfile === p.id && (
                          <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {p.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  2. Manual Fine-Tuning
                </label>

                {/* Exposure Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5" /> Exposure
                    </span>
                    <span>{exposure}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={exposure}
                    onChange={(e) => setExposure(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                {/* Contrast Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Contrast className="w-3.5 h-3.5" /> Contrast
                    </span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                {/* Saturation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Saturation
                    </span>
                    <span>{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>

              {/* Title & Description Fields */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Media Title"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessAndSave}
                className="flex-2 py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'Processing Pipeline...' : 'Process & Save to Gallery'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
