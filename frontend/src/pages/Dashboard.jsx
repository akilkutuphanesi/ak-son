import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, LogOut, ChevronDown, Bell, Filter, X, Info, Send, MapPin, Loader2, GraduationCap, Settings, Save, ArrowLeft, Maximize2, ExternalLink, MessageSquare, Trash2, Image as ImageIcon, Paperclip, Camera, CheckCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_URL;

    // --- STATE'LER ---
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [viewMode, setViewMode] = useState('feed');
    const [selectedDepartment, setSelectedDepartment] = useState("Tümü");
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [token, setToken] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [displayName, setDisplayName] = useState("");
    const [questions, setQuestions] = useState([]);
    const [myAnswers, setMyAnswers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");

    // --- RESİM VE KAMERA STATE'LERİ ---
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [questionAnswers, setQuestionAnswers] = useState({});
    const [newAnswer, setNewAnswer] = useState("");
    const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);

    const [isDeletingQuestion, setIsDeletingQuestion] = useState(null);
    const [isDeletingAnswer, setIsDeletingAnswer] = useState(null);

    // --- AVATAR SEÇİM STATE'LERİ VE GÖRSELLERİ ---
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(localStorage.getItem('selected_avatar_url') || null);

    // İSTE Bölümlerine Özel Üretilmiş Seçkin Hayvan Avatarları
    // --- %100 ÇALIŞAN GARANTİLİ AVATARLAR (Yerel AI PNG + DiceBear API) ---
    // --- %100 UYUMLU, 3D VE TEK TİP AVATARLAR (DiceBear Not-Avataaars & Notion Style) ---
    // --- %100 ÇALIŞAN, 3D GÖRÜNÜMLÜ VE TUTARLI AVATAR SETİ ---
const avatarOptions = [
    // Bilgisayar (Modern/Gözlüklü)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4", 
    // Denizcilik (Mavi/Koyu Tema)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=003566", 
    // İnşaat/Mimarlık (Toprak Tonları)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb&backgroundColor=ffc300", 
    // Gastronomi (Sıcak Tonlar)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=fbcfe8", 
    // Elektrik/Elektronik (Parlak/Enerjik)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=ffea00", 
    // Ekonomi/Lojistik (Ciddi/Gri)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=d1d8e0", 
    // Havacılık (Gökyüzü)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=82ccdd",
    // İSTE Genel (Kırmızı)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=e63946"
];
    const departments = ["Tümü", "Bilgisayar Mühendisliği", "Biyomedikal Mühendisliği", "Deniz Ulaştırma İşletme Mühendisliği", "Denizcilik İşletmeleri Yönetimi", "Ekonomi", "Elektrik-Elektronik Mühendisliği", "Endüstri Mühendisliği", "Gastronomi ve Mutfak Sanatları", "Gemi İnşaatı ve Gemi Makineleri Mühendisliği", "Havacılık Elektrik ve Elektroniği", "Havacılık ve Uzay Mühendisliği", "Havacılık Yönetimi", "İç Mimarlık", "İnşaat Mühendisliği", "Lojistik Yönetimi"];

    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ old: "", new: "", confirm: "" });
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);

    // --- YENİ EKLENEN STATE: HESAP SİLME ---
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedName = localStorage.getItem('custom_display_name');
        if (!storedToken) { navigate('/login'); return; }
        setToken(storedToken);
        if (storedName) setDisplayName(storedName);

        const initData = async () => {
            try {
                await fetchUserProfile(storedToken);
                await fetchQuestions(storedToken);
                await fetchNotifications(storedToken);
                await fetchMyAnswers(storedToken);
            } catch (e) { console.error(e); }
        };
        initData();
    }, []);

    useEffect(() => {
        const handleBackButton = (e) => {
            if (isCameraOpen) {
                e.preventDefault();
                stopCamera();
                window.history.pushState(null, null, window.location.pathname);
            }
        };

        if (isCameraOpen) {
            window.history.pushState(null, null, window.location.pathname);
            window.addEventListener('popstate', handleBackButton);
        }

        return () => window.removeEventListener('popstate', handleBackButton);
    }, [isCameraOpen]);

    const fetchUserProfile = async (authToken) => {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
                if (!localStorage.getItem('custom_display_name')) setDisplayName(data.email.split('@')[0]);
            }
        } catch (error) { console.error(error); }
    };

    const fetchQuestions = async (authToken) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/questions/`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (response.status === 401) { handleLogout(); return; }
            const data = await response.json();
            if (Array.isArray(data)) setQuestions(data);
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const fetchMyAnswers = async (authToken = token) => {
        try {
            const response = await fetch(`${API_BASE}/answers/me`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const data = await response.json();
            if (Array.isArray(data)) setMyAnswers(data);
        } catch (error) { console.error(error); }
    };

    const fetchNotifications = async (authToken = token) => {
        try {
            const response = await fetch(`${API_BASE}/notifications/`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const data = await response.json();
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (error) { console.error(error); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setNewImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Kamera hatası:", err);
            alert("Kameraya erişilemedi. İzinleri kontrol edin.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
                setNewImage(file);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
                stopCamera();
            }, 'image/jpeg');
        }
    };

    const handleCreateQuestion = async () => {
        if (!newTitle.trim() || !newContent.trim()) { alert("Başlık ve içerik giriniz."); return; }
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', newTitle);
            formData.append('content', newContent);
            if (newImage) {
                formData.append('image', newImage);
            }

            const response = await fetch(`${API_BASE}/questions/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setNewTitle(""); setNewContent(""); removeImage();
                fetchQuestions(token);
                setViewMode('feed');
            } else { alert("Hata oluştu."); }
        } catch (error) { alert("Sunucu bağlantı hatası!"); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteQuestion = async (questionId, e = null) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Bu soruyu silmek istediğine emin misin?")) return;
        setIsDeletingQuestion(questionId);
        try {
            const response = await fetch(`${API_BASE}/questions/${questionId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                setQuestions(prev => prev.filter(q => q.id !== questionId));
                if (selectedQuestion?.id === questionId) setSelectedQuestion(null);
            } else { alert("Silinemedi."); }
        } catch (error) { alert("Hata oluştu."); }
        finally { setIsDeletingQuestion(null); }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm("Bu cevabı silmek istediğine emin misin?")) return;
        setIsDeletingAnswer(answerId);
        try {
            const response = await fetch(`${API_BASE}/answers/${answerId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                if (selectedQuestion) {
                    setQuestionAnswers(prev => ({ ...prev, [selectedQuestion.id]: prev[selectedQuestion.id].filter(a => a.id !== answerId) }));
                }
                fetchMyAnswers(token);
            } else { alert("Cevap silinemedi."); }
        } catch (error) { alert("Hata oluştu."); }
        finally { setIsDeletingAnswer(null); }
    };

    const handleSendAnswer = async (questionId) => {
        if (!newAnswer.trim()) return;
        setIsAnswerSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/answers/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: newAnswer, question_id: questionId })
            });
            if (response.ok) {
                setNewAnswer("");
                fetchAnswersForQuestion(questionId);
                fetchMyAnswers(token);
            } else {
                const errData = await response.json();
                alert("Cevap gönderilemedi: " + (errData.detail || "Bilinmeyen hata"));
            }
        } catch (error) { alert("Sunucu hatası"); }
        finally { setIsAnswerSubmitting(false); }
    };

    const fetchAnswersForQuestion = async (questionId) => {
        try {
            const response = await fetch(`${API_BASE}/answers/question/${questionId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            setQuestionAnswers(prev => ({ ...prev, [questionId]: data }));
        } catch (error) { console.error(error); }
    };

    const toggleNotifications = async () => {
        const nextState = !isNotificationsOpen;
        setIsNotificationsOpen(nextState); setIsProfileOpen(false);
        if (nextState) {
            setUnreadCount(0);
            try { await fetch(`${API_BASE}/notifications/mark-as-read`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); } catch (e) { }
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        setNotifications([]);
        setUnreadCount(0);
        try {
            await fetch(`${API_BASE}/notifications/clear-all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Bildirimler silinirken hata:", error);
        }
    };

    const openQuestionModal = (question) => { if (!question) return; setSelectedQuestion(question); fetchAnswersForQuestion(question.id); };
    const closeQuestionModal = () => { setSelectedQuestion(null); setNewAnswer(""); };

    const handleNotificationClick = async (n) => {
        setIsNotificationsOpen(false);
        try { await fetch(`${API_BASE}/notifications/mark-as-read`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); setUnreadCount(0); fetchNotifications(token); } catch (e) { }
        if (n.question_id) {
            const localQuestion = questions.find(item => item.id === n.question_id);
            if (localQuestion) { openQuestionModal(localQuestion); }
            else {
                setIsLoading(true);
                try {
                    const response = await fetch(`${API_BASE}/questions/${n.question_id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (response.ok) { const questionData = await response.json(); openQuestionModal(questionData); }
                    else { alert("Bu soru silinmiş veya ulaşılamıyor."); }
                } catch (error) { console.error(error); } finally { setIsLoading(false); }
            }
        }
    };

    const handleGoHome = () => { setViewMode('feed'); setSelectedDepartment('Tümü'); };
    const clearFilter = (e) => { e.stopPropagation(); setSelectedDepartment('Tümü'); };
    const saveProfileSettings = () => { localStorage.setItem('custom_display_name', displayName); setIsSettingsOpen(false); alert("Profil güncellendi! ✅"); };

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            alert("Yeni şifreler eşleşmiyor!");
            return;
        }
        if (passwordData.new.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        setIsPasswordSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwordData.old,
                    new_password: passwordData.new
                })
            });

            if (response.ok) {
                alert("Şifre başarıyla değiştirildi! ✅");
                setIsPasswordSectionOpen(false);
                setPasswordData({ old: "", new: "", confirm: "" });
            } else {
                const err = await response.json();
                alert(err.detail || "Bir hata oluştu.");
            }
        } catch (error) {
            alert("Sunucu bağlantı hatası!");
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    // --- YENİ EKLENEN FONKSİYON: HESAP SİLME ---
    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir!");
        
        if (!isConfirmed) return;

        setIsDeletingAccount(true);
        try {
            const response = await fetch(`${API_BASE}/auth/delete-account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("Hesabınız başarıyla silindi. Hoşçakalın!");
                localStorage.clear(); 
                navigate('/register');
            } else {
                const err = await response.json();
                alert(err.detail || "Hesap silinirken bir hata oluştu.");
            }
        } catch (error) {
            alert("Sunucu bağlantı hatası!");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "?";

    const myQuestions = questions.filter(q => q.owner?.email === userProfile?.email);
    let displayContent;
    if (viewMode === 'my_questions') { displayContent = myQuestions; }
    else if (viewMode === 'my_answers') { displayContent = myAnswers; }
    else { displayContent = selectedDepartment === "Tümü" ? questions : questions.filter(q => q.owner?.department === selectedDepartment); }

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans selection:bg-red-500/30 flex flex-col">
            <nav className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-20 flex justify-between items-center px-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={handleGoHome}>
                    <img src="/logo.png" className="w-10 h-10 brightness-0 invert object-contain" alt="İSTE Logo" />
                    <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">Akıl <span className="text-red-600">Kütüphanesi</span></h1>
                </div>

                <div className="flex items-center gap-4 relative">
                    <div className="hidden md:flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                        <MapPin size={14} className="text-blue-400" /><span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest">İSTE Kütüphane</span>
                    </div>
                    <div className="relative">
                        <button onClick={toggleNotifications} className={`p-2.5 rounded-full border transition-all ${isNotificationsOpen ? 'bg-red-600/20 text-red-500 border-red-500' : 'bg-white/5 border-white/10'}`}>
                            <Bell size={20} />{unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0f1d] animate-bounce">{unreadCount}</span>}
                        </button>
                        {isNotificationsOpen && (
                            <div className="absolute top-16 right-0 w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                                <div className="p-4 border-b border-white/5 bg-[#1a2035] flex justify-between items-center">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Bildirimler</h3>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20"
                                        >
                                            <CheckCheck size={14} /> Tümünü Okundu İşaretle
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} onClick={() => handleNotificationClick(n)} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3">
                                            <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                                                <MessageSquare size={14} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors">{n.content}</p>
                                                <span className="text-[10px] text-slate-600 mt-1 block">{new Date(n.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    )) : <div className="py-12 text-center text-xs text-slate-500 italic">Henüz bildirim yok.</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }} className="flex items-center gap-2">
                        {selectedAvatarUrl ? (
                            <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-10 w-10 rounded-full border border-white/10 object-cover shadow-lg" />
                        ) : (
                            <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0a0f1d] shadow-lg">{getInitial(displayName)}</div>
                        )}
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-red-500' : ''}`} />
                    </button>
                    {isProfileOpen && (
                        <div className="absolute top-16 right-0 w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-900/50 to-red-600/50 p-6 flex flex-col items-center border-b border-white/5 relative">
                                <button
                                    onClick={() => setIsAvatarPickerOpen(true)}
                                    className="relative group h-16 w-16 mb-3 rounded-full"
                                    title="Avatar Seç"
                                >
                                    {selectedAvatarUrl ? (
                                        <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-16 w-16 rounded-full border border-white object-cover shadow-xl" />
                                    ) : (
                                        <div className="h-16 w-16 bg-white text-red-600 rounded-full flex items-center justify-center text-2xl font-black shadow-xl">
                                            {getInitial(displayName)}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ImageIcon size={20} className="text-white" />
                                    </div>
                                </button>
                                <h3 className="text-white font-bold text-lg">{displayName}</h3>
                                <span className="text-xs text-red-200 bg-black/20 px-3 py-1 rounded-full mt-1 backdrop-blur-sm truncate max-w-[200px]">{userProfile?.department || "Bölüm Yok"}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/5"><button onClick={() => { setViewMode('my_questions'); setIsProfileOpen(false); }} className="p-4 text-center hover:bg-white/5 group"><span className="block text-xl font-black text-white group-hover:text-red-400">{myQuestions.length}</span><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sorularım</span></button><button onClick={() => { setViewMode('my_answers'); fetchMyAnswers(); setIsProfileOpen(false); }} className="p-4 text-center hover:bg-white/5 group"><span className="block text-xl font-black text-white group-hover:text-red-400">{myAnswers.length}</span><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cevaplarım</span></button></div>
                            <div className="p-2 space-y-1"><button onClick={() => { setIsSettingsOpen(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-white/5 rounded-xl text-sm group"><Settings size={16} className="text-blue-400" /> Profil Ayarları</button><button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm group"><LogOut size={16} className="text-red-400" /> Çıkış Yap</button></div>
                        </div>
                    )}
                </div>
            </nav>

            {/* --- AVATAR SEÇİM MODALI --- */}
            {isAvatarPickerOpen && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsAvatarPickerOpen(false)}>
                    <div className="bg-[#161b2c] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a2035]">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <ImageIcon size={20} className="text-red-500" /> Profil Fotoğrafı Seç
                            </h3>
                            <button onClick={() => setIsAvatarPickerOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-slate-400 mb-6 text-center">Bölümünü en iyi yansıtan karakteri seç</p>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 px-2">
                                {avatarOptions.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedAvatarUrl(url);
                                            localStorage.setItem('selected_avatar_url', url);
                                            setIsAvatarPickerOpen(false);
                                            setIsProfileOpen(false);
                                        }}
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
                                onClick={() => {
                                    setSelectedAvatarUrl(null);
                                    localStorage.removeItem('selected_avatar_url');
                                    setIsAvatarPickerOpen(false);
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                            >
                                Fotoğrafı Kaldır
                            </button>
                            <button onClick={() => setIsAvatarPickerOpen(false)} className="px-6 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all">İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- KAMERA MODALI --- */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-[60vh] object-cover transform scale-x-[-1]"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/50 to-transparent flex justify-between items-center">
                            <button onClick={stopCamera} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all">
                                <X size={24} />
                            </button>
                            <button onClick={capturePhoto} className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-all group">
                                <div className="h-12 w-12 bg-white rounded-full group-hover:bg-red-500 transition-colors"></div>
                            </button>
                            <div className="w-12"></div>
                        </div>
                    </div>
                    <p className="text-slate-400 mt-4 text-sm animate-pulse">Fotoğrafı çekmek için butona bas</p>
                </div>
            )}

            {/* --- SORU DETAY MODALI --- */}
            {selectedQuestion && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0d1117] w-full max-w-3xl max-h-[85vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0d1117] shrink-0">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={16} className="text-red-500" /> Soru Detayı
                            </h3>
                            <div className="flex items-center gap-2">
                                {userProfile?.email === selectedQuestion.owner?.email && (
                                    <button onClick={() => handleDeleteQuestion(selectedQuestion.id)} className="bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 p-2 rounded-full transition-all">
                                        {isDeletingQuestion === selectedQuestion.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                    </button>
                                )}
                                <button onClick={closeQuestionModal} className="bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white p-2 rounded-full transition-all"><X size={20} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg overflow-hidden">
                                        {selectedQuestion.owner?.email === userProfile?.email && selectedAvatarUrl ? (
                                            <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-full w-full object-cover bg-white" />
                                        ) : (
                                            selectedQuestion.owner ? getInitial(selectedQuestion.owner.email) : "?"
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-white font-bold text-sm">{selectedQuestion.owner?.email === userProfile?.email ? displayName : (selectedQuestion.owner ? selectedQuestion.owner.email.split('@')[0] : "Anonim")}</h1>
                                        <span className="text-[10px] text-slate-500">{new Date(selectedQuestion.created_at).toLocaleString("tr-TR")}</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-white leading-tight">{selectedQuestion.title}</h2>
                                <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap bg-[#161b2c] p-6 rounded-2xl border border-white/5">{selectedQuestion.content}</div>
                                {selectedQuestion.image_url && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-white/10 flex justify-center bg-black/40 p-2 relative group/img cursor-pointer" onClick={() => setFullScreenImage(selectedQuestion.image_url.startsWith('http') ? selectedQuestion.image_url : `${API_BASE}${selectedQuestion.image_url}`)}>
                                        <img src={selectedQuestion.image_url.startsWith('http') ? selectedQuestion.image_url : `${API_BASE}${selectedQuestion.image_url}`} alt="Soru görseli" className="w-full max-h-[300px] object-contain rounded-lg" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                            <Maximize2 className="text-white drop-shadow-lg" size={32} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4"><div className="h-px flex-1 bg-white/10"></div><span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{questionAnswers[selectedQuestion.id]?.length || 0} Cevap</span><div className="h-px flex-1 bg-white/10"></div></div>
                            <div className="space-y-4">
                                {questionAnswers[selectedQuestion.id]?.length > 0 ? (
                                    questionAnswers[selectedQuestion.id].map(ans => (
                                        <div key={ans.id} className="flex gap-4 group/answer">
                                            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 bg-[#1f2937] rounded-full flex items-center justify-center text-xs font-bold text-slate-300 border border-white/10 overflow-hidden relative">
                                                    {ans.owner?.email === userProfile?.email && selectedAvatarUrl ? (
                                                        <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-full w-full object-cover bg-white" />
                                                    ) : (
                                                        ans.owner ? getInitial(ans.owner.email) : "?"
                                                    )}
                                                </div>
                                                <div className="w-px flex-1 bg-white/5"></div>
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="bg-[#161b2c] border border-white/5 p-4 rounded-xl rounded-tl-none hover:border-white/10 shadow-lg relative">
                                                    {(userProfile?.email === ans.owner?.email || userProfile?.email === selectedQuestion?.owner?.email) && (
                                                        <button onClick={() => handleDeleteAnswer(ans.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover/answer:opacity-100">
                                                            {isDeletingAnswer === ans.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                        </button>
                                                    )}
                                                    <div className="flex justify-between items-center mb-2"><h4 className="text-xs font-bold text-red-400">{ans.owner?.email === userProfile?.email ? displayName : (ans.owner ? ans.owner.email.split('@')[0] : "Misafir")}</h4><span className="text-[10px] text-slate-600 pr-6">{new Date(ans.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span></div>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{ans.content}</p>
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
            )}

            {/* --- PROFİL AYARLARI MODALI --- */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#161b2c] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a2035]">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Settings size={20} className="text-red-500" /> Profil Ayarları
                            </h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
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

                            {/* --- HESABI SİL BÖLÜMÜ --- */}
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
                            <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5">İptal</button>
                            <button onClick={saveProfileSettings} className="px-6 py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                                <Save size={16} /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ALT NAVİGASYON VE FİLTRE --- */}
            {viewMode === 'feed' && (
                <div className="fixed bottom-8 left-8 z-40 flex flex-col items-start gap-4">
                    {isFilterOpen && (
                        <div className="bg-[#161b2c]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl w-80 max-h-96 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Filter size={12} /> Bölüm Filtrele</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="hover:text-red-500"><X size={16} /></button>
                            </div>
                            <nav className="space-y-1">
                                {departments.map(dep => (
                                    <button key={dep} onClick={() => { setSelectedDepartment(dep); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${selectedDepartment === dep ? "bg-red-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                                        <div className={`w-1.5 h-1.5 flex-shrink-0 rounded-full ${selectedDepartment === dep ? 'bg-white' : 'bg-slate-600'}`}></div>{dep}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="group flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-full font-bold shadow-2xl hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-red-900/40 relative">
                        {isFilterOpen ? <X size={20} /> : <Filter size={20} />}
                        <span className="text-sm max-w-[100px] truncate">{selectedDepartment === "Tümü" ? "Filtrele" : selectedDepartment}</span>
                        {selectedDepartment !== "Tümü" && !isFilterOpen && <div onClick={clearFilter} className="absolute -top-2 -right-2 bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0f1d] hover:scale-110 shadow-sm"><X size={14} strokeWidth={3} /></div>}
                    </button>
                </div>
            )}

            <div className="flex-1 max-w-7xl mx-auto w-full relative">
                <main className="max-w-3xl mx-auto w-full p-6 md:p-10 space-y-8">
                    {(viewMode !== 'feed' || selectedDepartment !== "Tümü") && (
                        <button onClick={handleGoHome} className="group flex items-center gap-3 text-slate-400 hover:text-white mb-6 transition-all font-bold text-sm bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /><span>Ana Sayfaya Dön</span>
                        </button>
                    )}

                    {viewMode === 'feed' && selectedDepartment === "Tümü" && (
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex gap-4">
                                {selectedAvatarUrl ? (
                                    <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-12 w-12 rounded-full border border-white/10 object-cover shadow-lg flex-shrink-0 bg-[#0d1117]" />
                                ) : (
                                    <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">{getInitial(displayName)}</div>
                                )}
                                <div className="flex-1 space-y-3">
                                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Aklına takılan sorunun başlığı..." className="w-full bg-transparent text-lg text-white placeholder:text-slate-500 focus:outline-none font-bold" />
                                    <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Detayları buraya yazabilirsin..." className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-red-500/50 resize-none h-24 transition-all"></textarea>
                                    {imagePreview && (
                                        <div className="relative inline-block mt-2">
                                            <img src={imagePreview} alt="Önizleme" className="h-20 w-auto rounded-xl border border-white/20 shadow-md" />
                                            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 border border-[#0a0f1d] hover:scale-110 transition-transform"><X size={12} /></button>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex items-center gap-2">
                                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-white/5">
                                                <Paperclip size={16} /> Fotoğraf Ekle
                                            </button>
                                            <button onClick={startCamera} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-white/5">
                                                <Camera size={16} /> Kamera
                                            </button>
                                        </div>
                                        <button onClick={handleCreateQuestion} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-red-900/40 disabled:opacity-50 active:scale-95">
                                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}{isSubmitting ? 'Yayınlanıyor...' : 'Yayınla'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 pb-24">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-6 ml-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                            {viewMode === 'my_questions' ? "Sorduğum Sorular" : (viewMode === 'my_answers' ? "Cevaplarım" : (selectedDepartment === "Tümü" ? "Tüm Sorular" : selectedDepartment))}
                            <span className="text-slate-600 ml-1">({displayContent.length})</span>
                        </h2>
                        {isLoading ? <Loader2 className="animate-spin mx-auto text-red-500 my-20" size={40} /> : displayContent.length > 0 ? (
                            displayContent.map(item => (
                                viewMode === 'my_answers' ? (
                                    <div key={item.id} className="bg-[#121723] border border-white/5 rounded-3xl p-6 transition-all hover:border-white/10 hover:bg-[#151b29] group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20 font-bold uppercase tracking-wider">Cevapladığın Soru</span>
                                                <h4 className="text-white font-bold mt-2 text-lg hover:text-red-400 cursor-pointer transition-colors" onClick={() => openQuestionModal(item.question)}>{item.question?.title || `Soru ID: #${item.question_id}`}</h4>
                                            </div>
                                            <span className="text-[10px] text-slate-600 whitespace-nowrap ml-4">{new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 relative shadow-inner">
                                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#0d1117] border-l border-t border-white/5 transform rotate-45"></div>
                                            <p className="text-slate-300 italic text-sm">"{item.content}"</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                            <button onClick={() => openQuestionModal(item.question)} className="text-xs text-red-400 font-bold hover:text-white transition-colors flex items-center gap-1">Soruya Git <ExternalLink size={12} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={item.id} className="bg-[#121723] border border-white/5 rounded-3xl p-6 transition-all hover:border-white/10 hover:bg-[#151b29] hover:shadow-xl group relative">
                                        {userProfile?.email === item.owner?.email && (
                                            <button onClick={(e) => handleDeleteQuestion(item.id, e)} className="absolute top-4 right-4 p-2 rounded-full bg-[#1a1f2e] text-slate-500 hover:bg-red-500 hover:text-white border border-white/5 hover:border-red-500 transition-all z-20 shadow-lg" title="Soruyu Sil">
                                                {isDeletingQuestion === item.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-[#1a1f2e] rounded-full flex items-center justify-center font-bold border border-white/10 text-sm text-slate-300 overflow-hidden relative">
                                                    {item.owner?.email === userProfile?.email ? (
                                                        selectedAvatarUrl ? <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(displayName)
                                                    ) : (item.owner ? getInitial(item.owner.email) : "?")}
                                                </div>
                                                <div><h3 className="text-white font-bold text-sm leading-none flex items-center gap-2">{item.owner?.email === userProfile?.email ? displayName : (item.owner ? item.owner.email.split('@')[0] : "Anonim")}{item.owner?.email === userProfile?.email && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/10">Sen</span>}</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1"><GraduationCap size={10} />{item.owner?.department || "Genel"}</p></div>
                                            </div>
                                            <span className="text-[10px] text-slate-600 font-medium bg-white/5 px-2 py-1 rounded-lg mr-10">{new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-red-400 transition-colors cursor-pointer pr-10" onClick={() => openQuestionModal(item)}>{item.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6 italic border-l-2 border-white/5 pl-4 ml-1 cursor-pointer line-clamp-3" onClick={() => openQuestionModal(item)}>"{item.content}"</p>
                                        {item.image_url && (
                                            <div className="relative mb-6 rounded-xl overflow-hidden border border-white/10 bg-black/20 flex justify-center group/img cursor-pointer shadow-inner" onClick={(e) => { e.stopPropagation(); setFullScreenImage(item.image_url.startsWith('http') ? item.image_url : `${API_BASE}${item.image_url}`); }}>
                                                <img src={item.image_url.startsWith('http') ? item.image_url : `${API_BASE}${item.image_url}`} alt="Soru" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                    <Maximize2 className="text-white drop-shadow-lg" size={32} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-slate-500">
                                            <button onClick={() => openQuestionModal(item)} className="text-xs font-bold hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"><Maximize2 size={14} className="text-blue-400" /> İncele</button>
                                            <button onClick={() => openQuestionModal(item)} className="text-xs font-black px-5 py-2 rounded-xl border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"><MessageCircle size={14} /> Cevapla</button>
                                        </div>
                                    </div>
                                )
                            ))
                        ) : <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center shadow-inner"><Info size={32} className="mb-4 text-slate-700 opacity-50" /><h3 className="text-md font-bold text-white mb-1 italic text-slate-400">Sonuç bulunamadı.</h3><p className="text-[10px] text-slate-500">Henüz soru veya cevap yok.</p></div>}
                    </div>
                </main>
            </div>

            {/* --- LIGHTBOX (TAM EKRAN GÖRSEL) --- */}
            {fullScreenImage && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-auto custom-scrollbar" onClick={() => setFullScreenImage(null)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-red-500/20" onClick={() => setFullScreenImage(null)}>
                        <X size={24} />
                    </button>
                    <img src={fullScreenImage} alt="Tam Boyut Soru" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}