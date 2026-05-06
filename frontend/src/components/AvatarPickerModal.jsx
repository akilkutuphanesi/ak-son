import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export default function AvatarPickerModal({ 
    isOpen, 
    onClose, 
    avatarOptions, 
    selectedAvatarUrl, 
    onSelectAvatar, 
    onRemoveAvatar 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#161b2c] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a2035]">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <ImageIcon size={20} className="text-red-500" /> Profil Fotoğrafı Seç
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-400 mb-6 text-center">Bölümünü en iyi yansıtan karakteri seç</p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 px-2">
                        {avatarOptions.map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelectAvatar(url)}
                                className={`relative rounded-full border-4 transition-all duration-300 hover:scale-110 aspect-square overflow-hidden bg-[#0d1117] flex items-center justify-center ${selectedAvatarUrl === url ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105' : 'border-transparent hover:border-white/20'}`}
                            >
                                <img
                                    src={url}
                                    alt={`Avatar ${idx}`}
                                    className="w-full h-full object-cover aspect-square rounded-full transition-transform duration-500 hover:scale-110"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#1a2035] flex justify-between items-center">
                    <button
                        onClick={onRemoveAvatar}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                    >
                        Fotoğrafı Kaldır
                    </button>
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all">İptal</button>
                </div>
            </div>
        </div>
    );
}
