import React from 'react';
import { X, Settings, Info, Loader2, Trash2, Save } from 'lucide-react';

export default function SettingsModal({
    isOpen,
    onClose,
    displayName,
    setDisplayName,
    userProfile,
    isPasswordSectionOpen,
    setIsPasswordSectionOpen,
    passwordData,
    setPasswordData,
    handleChangePassword,
    isPasswordSubmitting,
    handleDeleteAccount,
    isDeletingAccount,
    saveProfileSettings
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#161b2c] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a2035]">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Settings size={20} className="text-red-500" /> Profil Ayarları
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Görünen İsim</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Bölüm</label>
                        <div className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-4 text-slate-400 cursor-not-allowed flex items-center justify-between shadow-inner">
                            {userProfile?.department}<Info size={16} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                        >
                            {isPasswordSectionOpen ? "Vazgeç" : "Şifre Değiştirmek İstiyorum"}
                        </button>

                        {isPasswordSectionOpen && (
                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="password"
                                    placeholder="Mevcut Şifre"
                                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50 shadow-inner"
                                    value={passwordData.old}
                                    onChange={(e) => setPasswordData({ ...passwordData, old: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Yeni Şifre"
                                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50 shadow-inner"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Yeni Şifre (Tekrar)"
                                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50 shadow-inner"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={handleChangePassword}
                                    disabled={isPasswordSubmitting}
                                    className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {isPasswordSubmitting ? "İşleniyor..." : "Şifreyi Güncelle"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-4 border-t border-white/5">
                        <button 
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-400 transition-colors group"
                        >
                            {isDeletingAccount ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                            )}
                            Hesabımı Kalıcı Olarak Sil
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#1a2035] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5">İptal</button>
                    <button onClick={saveProfileSettings} className="px-6 py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                        <Save size={16} /> Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}
