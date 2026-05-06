import React from 'react';
import { X, GraduationCap, MessageSquare, CheckCheck } from 'lucide-react';

export default function UserModal({ isOpen, onClose, viewedUser }) {
    if (!isOpen || !viewedUser) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="relative bg-[#0d1117] w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/20 hover:bg-red-500/20 p-2 rounded-full transition-all z-20 backdrop-blur-sm">
                    <X size={20} />
                </button>

                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-red-600/30 to-transparent pointer-events-none"></div>

                <div className="px-8 pt-12 pb-8 flex flex-col items-center relative z-10">
                    <div className="relative group mb-5">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                        <div className="relative h-28 w-28 bg-[#161b2c] rounded-full flex items-center justify-center border-4 border-[#0d1117] shadow-2xl overflow-hidden">
                            {viewedUser.avatar_url ? (
                                <img src={viewedUser.avatar_url} className="h-full w-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500" alt="avatar" />
                            ) : (
                                <span className="text-4xl font-black text-red-500 bg-gradient-to-br from-red-400 to-red-700 text-transparent bg-clip-text">
                                    {(viewedUser.display_name || viewedUser.email).charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <h3 className="text-white font-black text-2xl tracking-tight mb-2 text-center drop-shadow-md">
                        {viewedUser.display_name || viewedUser.email.split('@')[0]}
                    </h3>
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                        <GraduationCap size={14} className="text-red-400" />
                        <span className="text-[11px] font-bold text-red-200 uppercase tracking-widest">{viewedUser.department || "Bölüm Yok"}</span>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="bg-[#161b2c]/80 border border-white/5 rounded-3xl p-6 grid grid-cols-2 gap-4 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none"></div>
                        
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                <MessageSquare size={18} className="text-blue-400" />
                            </div>
                            <span className="text-3xl font-black text-white leading-none mb-1 group-hover:text-blue-400 transition-colors">{viewedUser.question_count || 0}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Soru</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                <CheckCheck size={18} className="text-green-400" />
                            </div>
                            <span className="text-3xl font-black text-white leading-none mb-1 group-hover:text-green-400 transition-colors">{viewedUser.answer_count || 0}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Cevap</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-[#0a0f1d] flex justify-center">
                    <button onClick={onClose} className="w-full py-4 rounded-2xl text-sm font-bold bg-white/5 hover:bg-red-600/90 text-white transition-all duration-300 tracking-widest uppercase border border-white/10 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                        Ekranı Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
