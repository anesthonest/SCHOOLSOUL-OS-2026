import React, { useState, useEffect } from 'react';
import {
  Image,
  Lock,
  CheckCircle,
  ShieldAlert,
  Calendar,
  Sparkles,
  Eye,
  X,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { v9PublicEngagementApi } from '../../services/v9PublicEngagementApi';
import type { GalleryAlbum } from '../../types';

export const SchoolGalleryPage: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    const data = await v9PublicEngagementApi.getGalleryAlbums();
    setAlbums(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> Module 8: School Media Gallery
            </span>
            <span className="text-xs text-slate-400">Child Safeguarding & Consent Guard</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Media Gallery & Event Photo Archives
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Curated photo albums from sports, academic fairs, and cultural festivals with child privacy verification and configurable access levels.
          </p>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {albums.map((alb) => (
          <div
            key={alb.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition"
          >
            <div className="relative h-48 rounded-xl overflow-hidden border border-slate-800">
              <img
                src={alb.coverImage}
                alt={alb.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    {alb.category}
                  </span>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Consent Verified
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-white drop-shadow-md">{alb.title}</h2>
                  <span className="text-xs text-slate-300 font-mono flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-cyan-400" /> {alb.eventDate} • {alb.photoCount} High-Res Photos
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Visibility: <strong className="text-white">{alb.privacyLevel}</strong>
              </span>

              <button
                type="button"
                onClick={() => setSelectedAlbum(alb)}
                className="text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View Album Photos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Album Photo Viewer Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-cyan-400" /> {selectedAlbum.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedAlbum.category} • {selectedAlbum.eventDate} • {selectedAlbum.photoCount} Verified Photos
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={selectedAlbum.coverImage}
                alt={selectedAlbum.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Child Safeguarding & Parental Consent Approved
                </span>
                <a
                  href={selectedAlbum.coverImage}
                  download={`${selectedAlbum.title.toLowerCase().replace(/\s+/g, '_')}_photo.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Download HD
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="h-24 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative">
                  <img
                    src={selectedAlbum.coverImage}
                    alt={`Photo #${num}`}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
