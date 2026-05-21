import React from 'react';
import { 
    X, MessageSquare, Edit2, Save, Trash2, Loader2, 
    Maximize2, Send, ArrowLeft, CheckCircle2, Eye, Star
} from 'lucide-react';

export default function QuestionDetailModal({
    selectedQuestion,
    closeQuestionModal,
    userProfile,
    displayName,
    selectedAvatarUrl,
    getInitial,
    openUserProfile,
    editingQuestion,
    setEditingQuestion,
    editQuestionTitle,
    setEditQuestionTitle,
    editQuestionContent,
    setEditQuestionContent,
    handleUpdateQuestion,
    handleDeleteQuestion,
    isDeletingQuestion,
    setFullScreenImage,
    API_BASE,
    questionAnswers,
    editingAnswerId,
    setEditingAnswerId,
    editAnswerContent,
    setEditAnswerContent,
    handleUpdateAnswer,
    handleDeleteAnswer,
    isDeletingAnswer,
    newAnswer,
    setNewAnswer,
    handleSendAnswer,
    isAnswerSubmitting,
    returnToUser,
    handleBackToUserModal,
    handleAcceptAnswer
}) {
    if (!selectedQuestion) return null;

    // Cevapları sırala: En iyi cevap en üstte
    const sortedAnswers = questionAnswers[selectedQuestion.id] 
        ? [...questionAnswers[selectedQuestion.id]].sort((a, b) => {
            if (a.is_best_answer) return -1;
            if (b.is_best_answer) return 1;
            return new Date(a.created_at) - new Date(b.created_at);
        }) 
        : [];

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0d1117] w-full max-w-3xl max-h-[85vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0d1117] shrink-0">
                    <div className="flex items-center gap-3">
                        {returnToUser && (
                            <button onClick={handleBackToUserModal} className="bg-white/5 hover:bg-white/20 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 shadow-sm">
                                <ArrowLeft size={14} /> Geri
                            </button>
                        )}
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={16} className="text-red-500" /> Soru Detayı
                        </h3>
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full ml-2">
                            <Eye size={14} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-slate-300">{selectedQuestion.view_count || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {userProfile?.email === selectedQuestion.owner?.email && (
                            <>
                                {editingQuestion === selectedQuestion.id ? (
                                    <button onClick={() => handleUpdateQuestion(selectedQuestion.id)} className="bg-green-500/10 hover:bg-green-600 hover:text-white text-green-500 p-2 rounded-full transition-all">
                                        <Save size={20} />
                                    </button>
                                ) : (
                                    <button onClick={() => { setEditingQuestion(selectedQuestion.id); setEditQuestionTitle(selectedQuestion.title); setEditQuestionContent(selectedQuestion.content); }} className="bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-500 p-2 rounded-full transition-all">
                                        <Edit2 size={20} />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteQuestion(selectedQuestion.id)} className="bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 p-2 rounded-full transition-all">
                                    {isDeletingQuestion === selectedQuestion.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                </button>
                            </>
                        )}
                        <button onClick={closeQuestionModal} className="bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white p-2 rounded-full transition-all"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div 
                                className={`h-10 w-10 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg overflow-hidden ${selectedQuestion.owner?.email !== userProfile?.email ? 'cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all' : ''}`}
                                onClick={(e) => selectedQuestion.owner?.email !== userProfile?.email && openUserProfile(selectedQuestion.owner_id, e)}
                            >
                                {selectedQuestion.owner?.email === userProfile?.email ? (
                                    selectedAvatarUrl ? <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(displayName)
                                ) : (selectedQuestion.owner?.avatar_url ? <img src={selectedQuestion.owner.avatar_url} alt="Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(selectedQuestion.owner?.display_name || selectedQuestion.owner?.email || "?"))}
                            </div>
                            <div>
                                <h1 
                                    className={`text-white font-bold text-sm ${selectedQuestion.owner?.email !== userProfile?.email ? 'cursor-pointer hover:text-red-400 transition-colors' : ''}`}
                                    onClick={(e) => selectedQuestion.owner?.email !== userProfile?.email && openUserProfile(selectedQuestion.owner_id, e)}
                                >
                                    {selectedQuestion.owner?.email === userProfile?.email ? displayName : (selectedQuestion.owner ? (selectedQuestion.owner.display_name || selectedQuestion.owner.email.split('@')[0]) : "Anonim")}
                                </h1>
                                <span className="text-[10px] text-slate-400">{new Date(selectedQuestion.created_at).toLocaleString("tr-TR")}</span>
                            </div>
                        </div>
                        {editingQuestion === selectedQuestion.id ? (
                            <div className="space-y-4">
                                <input type="text" value={editQuestionTitle} onChange={e => setEditQuestionTitle(e.target.value)} className="w-full bg-[#161b2c] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:border-blue-500 focus:outline-none" />
                                <textarea value={editQuestionContent} onChange={e => setEditQuestionContent(e.target.value)} className="w-full bg-[#161b2c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm min-h-[150px] focus:border-blue-500 focus:outline-none custom-scrollbar" />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-white leading-tight">{selectedQuestion.title}</h2>
                                <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap bg-[#161b2c] p-6 rounded-2xl border border-white/10">{selectedQuestion.content}</div>
                            </>
                        )}
                        {selectedQuestion.image_url && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 flex justify-center bg-black/40 p-2 relative group/img cursor-pointer" onClick={() => setFullScreenImage(selectedQuestion.image_url.startsWith('http') ? selectedQuestion.image_url : `${API_BASE}${selectedQuestion.image_url}`)}>
                                <img src={selectedQuestion.image_url.startsWith('http') ? selectedQuestion.image_url : `${API_BASE}${selectedQuestion.image_url}`} alt="Soru görseli" className="w-full max-h-[300px] object-contain rounded-lg" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                    <Maximize2 className="text-white drop-shadow-lg" size={32} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4"><div className="h-px flex-1 bg-white/10"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{questionAnswers[selectedQuestion.id]?.length || 0} Cevap</span><div className="h-px flex-1 bg-white/10"></div></div>
                    <div className="space-y-4">
                        {sortedAnswers.length > 0 ? (
                            sortedAnswers.map(ans => (
                                <div key={ans.id} className="flex gap-4 group/answer">
                                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                        <div 
                                            className={`h-8 w-8 bg-[#1f2937] rounded-full flex items-center justify-center text-xs font-bold text-slate-300 border border-white/10 overflow-hidden relative ${ans.owner?.email !== userProfile?.email ? 'cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all' : ''}`}
                                            onClick={(e) => ans.owner?.email !== userProfile?.email && openUserProfile(ans.owner_id, e)}
                                        >
                                            {ans.owner?.email === userProfile?.email ? (
                                                selectedAvatarUrl ? <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(displayName)
                                            ) : (ans.owner?.avatar_url ? <img src={ans.owner.avatar_url} alt="Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(ans.owner?.display_name || ans.owner?.email || "?"))}
                                        </div>
                                        <div className="w-px flex-1 bg-white/5"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className={`bg-[#161b2c] border p-4 rounded-xl rounded-tl-none shadow-lg relative transition-all ${ans.is_best_answer ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/10'}`}>
                                            {ans.is_best_answer && (
                                                <div className="absolute -top-3 left-4 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border-2 border-[#161b2c]">
                                                    <Star size={10} className="fill-white" /> Çözüldü
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/answer:opacity-100 transition-all">
                                                {userProfile?.email === selectedQuestion.owner?.email && !ans.is_best_answer && (
                                                    <button onClick={() => handleAcceptAnswer && handleAcceptAnswer(ans.id, selectedQuestion.id)} className="text-green-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 mr-2 flex items-center gap-1 transition-all" title="Çözüm Olarak İşaretle">
                                                        <CheckCircle2 size={12} /> EN İYİ CEVAP SEÇ
                                                    </button>
                                                )}
                                                {userProfile?.email === ans.owner?.email && (
                                                    editingAnswerId === ans.id ? (
                                                        <button onClick={() => handleUpdateAnswer(ans.id, selectedQuestion.id)} className="text-green-500 p-1.5 rounded-lg hover:bg-green-500/10">
                                                            <Save size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => { setEditingAnswerId(ans.id); setEditAnswerContent(ans.content); }} className="text-blue-500 p-1.5 rounded-lg hover:bg-blue-500/10">
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )
                                                )}
                                                {(userProfile?.email === ans.owner?.email || userProfile?.email === selectedQuestion?.owner?.email) && (
                                                    <button onClick={() => handleDeleteAnswer(ans.id)} className="text-slate-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10">
                                                        {isDeletingAnswer === ans.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mb-2"><h4 className={`text-xs font-bold text-red-400 ${ans.owner?.email !== userProfile?.email ? 'cursor-pointer hover:underline' : ''}`} onClick={(e) => ans.owner?.email !== userProfile?.email && openUserProfile(ans.owner_id, e)}>{ans.owner?.email === userProfile?.email ? displayName : (ans.owner ? (ans.owner.display_name || ans.owner.email.split('@')[0]) : "Misafir")}</h4><span className="text-[10px] text-slate-600 pr-12">{new Date(ans.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span></div>
                                            {editingAnswerId === ans.id ? (
                                                <textarea value={editAnswerContent} onChange={e => setEditAnswerContent(e.target.value)} className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none min-h-[80px] custom-scrollbar mt-2" />
                                            ) : (
                                                <p className="text-sm text-slate-300 leading-relaxed">{ans.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-center py-8 opacity-50 text-xs">Henüz cevap yok.</div>}
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 bg-[#0d1117] shrink-0"><div className="flex gap-3"><input type="text" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Cevap yaz..." className="flex-1 bg-[#161b2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 shadow-inner" /><button onClick={() => handleSendAnswer(selectedQuestion.id)} disabled={isAnswerSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50">{isAnswerSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}</button></div></div>
            </div>
        </div>
    );
}
