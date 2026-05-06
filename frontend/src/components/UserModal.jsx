import React, { useState, useEffect } from 'react';
import { X, GraduationCap, MessageSquare, CheckCheck, Loader2, Calendar, Heart, Award } from 'lucide-react';

export default function UserModal({ isOpen, onClose, viewedUser, onQuestionClick, initialTab = 'questions', initialScroll = 0 }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'questions' or 'answers'
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollContainerRef = React.useRef(null);

    useEffect(() => {
        if (!isOpen || !viewedUser) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const API_BASE = import.meta.env.VITE_API_URL;
                const token = localStorage.getItem('token');
                
                const [qRes, aRes] = await Promise.all([
                    fetch(`${API_BASE}/users/${viewedUser.id}/questions`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/users/${viewedUser.id}/answers`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                
                if (qRes.ok) {
                    const qData = await qRes.json();
                    setQuestions(qData);
                }
                
                if (aRes.ok) {
                    const aData = await aRes.json();
                    setAnswers(aData);
                }
            } catch (error) {
                console.error("Kullanıcı verileri çekilirken hata:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData().then(() => {
            if (scrollContainerRef.current && initialScroll > 0) {
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop = initialScroll;
                    }
                }, 50);
            }
        });
        setActiveTab(initialTab);
    }, [isOpen, viewedUser, initialTab, initialScroll]);

    if (!isOpen || !viewedUser) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="relative bg-[#0d1117] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/20 hover:bg-red-500/20 p-2 rounded-full transition-all z-20 backdrop-blur-sm">
                    <X size={20} />
                </button>

                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-red-600/30 to-transparent pointer-events-none shrink-0"></div>

                <div className="px-8 pt-10 pb-6 flex flex-col items-center relative z-10 shrink-0">
                    <div className="relative group mb-4">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                        <div className="relative h-24 w-24 bg-[#161b2c] rounded-full flex items-center justify-center border-4 border-[#0d1117] shadow-2xl overflow-hidden">
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
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                            <GraduationCap size={14} className="text-red-400" />
                            <span className="text-[11px] font-bold text-red-200 uppercase tracking-widest">{viewedUser.department || "Bölüm Yok"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full backdrop-blur-md" title={`İtibar Puanı: ${viewedUser.reputation || 0}`}>
                            <Award size={14} className="text-orange-400" />
                            <span className="text-[11px] font-bold text-orange-300 uppercase tracking-widest">{viewedUser.badge || "Çaylak"} ({viewedUser.reputation || 0})</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 shrink-0 z-10">
                    <div className="flex bg-[#161b2c]/80 border border-white/5 rounded-2xl p-1.5 shadow-inner">
                        <button 
                            onClick={() => setActiveTab('questions')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'questions' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <MessageSquare size={16} />
                            Sorular ({questions.length || viewedUser.question_count || 0})
                        </button>
                        <button 
                            onClick={() => setActiveTab('answers')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'answers' ? 'bg-green-500/20 text-green-400 border border-green-500/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <CheckCheck size={16} />
                            Cevaplar ({answers.length || viewedUser.answer_count || 0})
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 mt-2 relative" ref={scrollContainerRef}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400 space-y-3">
                            <Loader2 className="animate-spin text-red-500" size={32} />
                            <span className="text-xs uppercase tracking-widest font-bold">Yükleniyor...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === 'questions' && (
                                questions.length > 0 ? (
                                    questions.map(q => (
                                        <div 
                                            key={q.id} 
                                            onClick={() => onQuestionClick && onQuestionClick(q.id, activeTab, scrollContainerRef.current?.scrollTop || 0)}
                                            className="bg-[#161b2c]/50 border border-white/5 p-5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-colors shadow-sm cursor-pointer group"
                                        >
                                            <h4 className="text-white font-bold text-lg mb-2 leading-tight group-hover:text-red-400 transition-colors">{q.title}</h4>
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">{q.content}</p>
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5 pt-3">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-blue-400"/> {q.answer_count || 0} Cevap</span>
                                                    <span className="flex items-center gap-1.5"><Heart size={14} className="text-red-400"/> {q.favorite_count || 0} Beğeni</span>
                                                </div>
                                                <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(q.created_at).toLocaleDateString("tr-TR")}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <MessageSquare size={32} className="text-blue-400" />
                                        </div>
                                        <span className="text-xs uppercase tracking-widest font-bold">Kullanıcının henüz sorusu yok.</span>
                                    </div>
                                )
                            )}

                            {activeTab === 'answers' && (
                                answers.length > 0 ? (
                                    answers.map(a => (
                                        <div 
                                            key={a.id} 
                                            onClick={() => onQuestionClick && a.question_id && onQuestionClick(a.question_id, activeTab, scrollContainerRef.current?.scrollTop || 0)}
                                            className="bg-[#161b2c]/50 border border-white/5 p-5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-colors shadow-sm cursor-pointer group"
                                        >
                                            <div className="bg-[#0a0f1d] rounded-xl p-3 mb-4 border border-white/5 flex flex-col gap-2 relative overflow-hidden group-hover:border-blue-500/30 transition-colors">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50"></div>
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare size={12} className="text-blue-400" />
                                                    <span className="text-[11px] text-slate-400">
                                                        <span className="text-blue-400 font-bold">
                                                            {a.question?.owner?.display_name || a.question?.owner?.email?.split('@')[0] || "Anonim"}
                                                        </span> adlı kullanıcının sorusunu yanıtladı:
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm line-clamp-1 italic pl-1 group-hover:text-white transition-colors font-medium">
                                                    "{a.question?.title || "Bilinmeyen Soru"}"
                                                </p>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed mb-4">{a.content}</p>
                                            <div className="flex items-center justify-end text-[11px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5 pt-3">
                                                <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(a.created_at).toLocaleDateString("tr-TR")}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CheckCheck size={32} className="text-green-400" />
                                        </div>
                                        <span className="text-xs uppercase tracking-widest font-bold">Kullanıcının henüz cevabı yok.</span>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-white/5 bg-[#0a0f1d] shrink-0">
                    <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-bold bg-white/5 hover:bg-red-600/90 text-white transition-all duration-300 tracking-widest uppercase border border-white/10 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                        Ekranı Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
