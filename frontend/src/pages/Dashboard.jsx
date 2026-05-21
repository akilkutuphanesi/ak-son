import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, LogOut, ChevronDown, Bell, Filter, X, Info, Send, MapPin, Loader2, GraduationCap, Settings, Save, ArrowLeft, Maximize2, ExternalLink, MessageSquare, Trash2, Image as ImageIcon, Paperclip, Camera, CheckCheck, Heart, Edit2, BookOpen, Zap, Coffee, Timer, Layers, Flame, Award, Eye, Trophy, Medal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import UserModal from '../components/UserModal';
import AvatarPickerModal from '../components/AvatarPickerModal';
import CameraModal from '../components/CameraModal';
import SettingsModal from '../components/SettingsModal';
import QuestionDetailModal from '../components/QuestionDetailModal';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
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
    const [leaderboardData, setLeaderboardData] = useState([]);

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

    // --- DÜZENLEME STATE'LERİ ---
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editQuestionTitle, setEditQuestionTitle] = useState("");
    const [editQuestionContent, setEditQuestionContent] = useState("");

    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editAnswerContent, setEditAnswerContent] = useState("");

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

    // --- FAVORİ VE KULLANICI PROFİLİ STATE'LERİ ---
    const [favoritedIds, setFavoritedIds] = useState(new Set());
    const [viewedUser, setViewedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [returnToUser, setReturnToUser] = useState(null);
    const [userModalState, setUserModalState] = useState({ activeTab: 'questions', scrollTop: 0 });

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
                await fetchMyFavorites(storedToken);
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

                // BACKEND'DEN GELEN VERIYI STATE'E AL
                if (data.display_name) {
                    setDisplayName(data.display_name);
                } else if (!localStorage.getItem('custom_display_name')) {
                    setDisplayName(data.email.split('@')[0]);
                } else {
                    setDisplayName(localStorage.getItem('custom_display_name'));
                }

                if (data.avatar_url) {
                    setSelectedAvatarUrl(data.avatar_url);
                } else if (localStorage.getItem('selected_avatar_url')) {
                    setSelectedAvatarUrl(localStorage.getItem('selected_avatar_url'));
                }
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

    const fetchLeaderboard = async (authToken = token) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/users/leaderboard`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (response.ok) {
                const data = await response.json();
                setLeaderboardData(data);
            }
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    // --- FAVORİ FONKSİYONLARI ---
    const fetchMyFavorites = async (authToken = token) => {
        try {
            const response = await fetch(`${API_BASE}/favorites/me`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const data = await response.json();
            if (Array.isArray(data)) {
                const ids = new Set(data.filter(f => f.question_id).map(f => f.question_id));
                setFavoritedIds(ids);
            }
        } catch (error) { console.error(error); }
    };

    const handleToggleFavorite = async (questionId, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`${API_BASE}/favorites/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ question_id: questionId })
            });
            if (response.ok) {
                setFavoritedIds(prev => {
                    const next = new Set(prev);
                    if (next.has(questionId)) { next.delete(questionId); }
                    else { next.add(questionId); }
                    return next;
                });
            }
        } catch (error) { console.error(error); }
    };

    // --- KULLANICI PROFİLİ MODAL ---
    const openUserProfile = async (userId, e) => {
        if (e) e.stopPropagation();
        if (!userId || userId === userProfile?.id) return;
        try {
            const res = await fetch(`${API_BASE}/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setViewedUser(data);
                setUserModalState({ activeTab: 'questions', scrollTop: 0 });
                setIsUserModalOpen(true);
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
            toast.error("Kameraya erişilemedi. İzinleri kontrol edin.");
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
        if (!newTitle.trim() || !newContent.trim()) { toast.error("Başlık ve içerik giriniz."); return; }
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
                toast.success("Sorunuz yayınlandı!");
            } else { toast.error("Hata oluştu."); }
        } catch (error) { toast.error("Sunucu bağlantı hatası!"); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteQuestion = async (questionId, e = null) => {
        if (e) e.stopPropagation();
        const result = await Swal.fire({
            title: 'Emin misin?',
            text: "Bu soruyu silmek istediğine emin misin?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal',
            background: '#161b2c',
            color: '#fff'
        });
        if (!result.isConfirmed) return;

        setIsDeletingQuestion(questionId);
        try {
            const response = await fetch(`${API_BASE}/questions/${questionId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                setQuestions(prev => prev.filter(q => q.id !== questionId));
                if (selectedQuestion?.id === questionId) setSelectedQuestion(null);
                toast.success("Soru başarıyla silindi.");
            } else { toast.error("Silinemedi."); }
        } catch (error) { toast.error("Hata oluştu."); }
        finally { setIsDeletingQuestion(null); }
    };

    const handleDeleteAnswer = async (answerId) => {
        const result = await Swal.fire({
            title: 'Emin misin?',
            text: "Bu cevabı silmek istediğine emin misin?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal',
            background: '#161b2c',
            color: '#fff'
        });
        if (!result.isConfirmed) return;

        setIsDeletingAnswer(answerId);
        try {
            const response = await fetch(`${API_BASE}/answers/${answerId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                if (selectedQuestion) {
                    setQuestionAnswers(prev => ({ ...prev, [selectedQuestion.id]: prev[selectedQuestion.id].filter(a => a.id !== answerId) }));
                }
                fetchMyAnswers(token);
                toast.success("Cevap silindi.");
            } else { toast.error("Cevap silinemedi."); }
        } catch (error) { toast.error("Hata oluştu."); }
        finally { setIsDeletingAnswer(null); }
    };

    const handleUpdateQuestion = async (questionId) => {
        if (!editQuestionTitle.trim() || !editQuestionContent.trim()) return;
        try {
            const response = await fetch(`${API_BASE}/questions/${questionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: editQuestionTitle, content: editQuestionContent })
            });
            if (response.ok) {
                setEditingQuestion(null);
                fetchQuestions(token);
                if (selectedQuestion?.id === questionId) {
                    setSelectedQuestion(prev => ({ ...prev, title: editQuestionTitle, content: editQuestionContent }));
                }
                toast.success("Soru güncellendi.");
            } else { toast.error("Soru güncellenemedi."); }
        } catch (error) { toast.error("Hata oluştu."); }
    };

    const handleUpdateAnswer = async (answerId, questionId) => {
        if (!editAnswerContent.trim()) return;
        try {
            const response = await fetch(`${API_BASE}/answers/${answerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: editAnswerContent })
            });
            if (response.ok) {
                setEditingAnswerId(null);
                fetchAnswersForQuestion(questionId);
                fetchMyAnswers(token);
                toast.success("Cevap güncellendi.");
            } else { toast.error("Cevap güncellenemedi."); }
        } catch (error) { toast.error("Hata oluştu."); }
    };

    const handleAcceptAnswer = async (answerId, questionId) => {
        try {
            const response = await fetch(`${API_BASE}/answers/${answerId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchAnswersForQuestion(questionId);
                toast.success("En iyi cevap seçildi!");
            } else {
                const errData = await response.json();
                toast.error(errData.detail || "Cevap seçilemedi.");
            }
        } catch (error) { toast.error("Hata oluştu."); }
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
                toast.success("Cevabınız gönderildi.");
            } else {
                const errData = await response.json();
                toast.error("Cevap gönderilemedi: " + (errData.detail || "Bilinmeyen hata"));
            }
        } catch (error) { toast.error("Sunucu hatası"); }
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
            toast.success("Tüm bildirimler temizlendi.");
        } catch (error) {
            console.error("Bildirimler silinirken hata:", error);
            toast.error("Bildirimler silinemedi.");
        }
    };

    const openQuestionModal = async (question) => {
        if (!question) return;
        setSelectedQuestion(question);
        fetchAnswersForQuestion(question.id);
        try {
            const res = await fetch(`${API_BASE}/questions/${question.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const updatedQuestion = await res.json();
                setSelectedQuestion(updatedQuestion);
                setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
                if (viewMode === 'favorites') {
                    setMyFavoriteQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
                }
            }
        } catch (e) { console.error(e); }
    };
    const closeQuestionModal = () => { setSelectedQuestion(null); setNewAnswer(""); setReturnToUser(null); };

    const handleBackToUserModal = () => {
        setSelectedQuestion(null);
        setNewAnswer("");
        if (returnToUser) {
            setViewedUser(returnToUser);
            setIsUserModalOpen(true);
            setReturnToUser(null);
        }
    };

    const handleNotificationClick = async (n) => {
        setIsNotificationsOpen(false);
        try { await fetch(`${API_BASE}/notifications/mark-as-read`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); setUnreadCount(0); fetchNotifications(token); } catch (e) { }
        if (n.question_id) {
            handleOpenQuestionFromModal(n.question_id);
        }
    };

    const handleOpenQuestionFromModal = async (questionId, activeTab = 'questions', scrollTop = 0) => {
        setUserModalState({ activeTab, scrollTop });
        setReturnToUser(viewedUser);
        setIsUserModalOpen(false);
        const localQuestion = questions.find(item => item.id === questionId);
        if (localQuestion) {
            openQuestionModal(localQuestion);
        } else {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE}/questions/${questionId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    const questionData = await response.json();
                    openQuestionModal(questionData);
                } else {
                    toast.error("Bu soru silinmiş veya ulaşılamıyor.");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoHome = () => { setViewMode('feed'); setSelectedDepartment('Tümü'); };
    const clearFilter = (e) => { e.stopPropagation(); setSelectedDepartment('Tümü'); };

    const saveProfileSettings = async () => {
        try {
            await fetch(`${API_BASE}/auth/me/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ display_name: displayName })
            });
            localStorage.setItem('custom_display_name', displayName);
            setIsSettingsOpen(false);
            toast.success("Profil güncellendi! ✅");
        } catch (e) { console.error(e); toast.error("Güncelleme hatası"); }
    };

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            toast.error("Yeni şifreler eşleşmiyor!");
            return;
        }
        if (passwordData.new.length < 6) {
            toast.error("Şifre en az 6 karakter olmalıdır!");
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
                toast.success("Şifre başarıyla değiştirildi! ✅");
                setIsPasswordSectionOpen(false);
                setPasswordData({ old: "", new: "", confirm: "" });
            } else {
                const err = await response.json();
                toast.error(err.detail || "Bir hata oluştu.");
            }
        } catch (error) {
            toast.error("Sunucu bağlantı hatası!");
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    // --- YENİ EKLENEN FONKSİYON: HESAP SİLME ---
    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Hesabını Silmek Üzeresin!',
            text: "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir!",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Evet, hesabımı sil',
            cancelButtonText: 'İptal',
            background: '#161b2c',
            color: '#fff'
        });
        if (!result.isConfirmed) return;

        setIsDeletingAccount(true);
        try {
            const response = await fetch(`${API_BASE}/auth/delete-account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Hesabınız başarıyla silindi. Hoşçakalın!");
                localStorage.clear();
                navigate('/register');
            } else {
                const err = await response.json();
                toast.error(err.detail || "Hesap silinirken bir hata oluştu.");
            }
        } catch (error) {
            toast.error("Sunucu bağlantı hatası!");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "?";

    const myQuestions = questions.filter(q => q.owner?.email === userProfile?.email);
    const myFavoriteQuestions = questions.filter(q => favoritedIds.has(q.id));
    let displayContent;
    if (viewMode === 'my_questions') { displayContent = myQuestions; }
    else if (viewMode === 'my_answers') { displayContent = myAnswers; }
    else if (viewMode === 'favorites') { displayContent = myFavoriteQuestions; }
    else if (viewMode === 'trending') {
        const now = new Date();
        displayContent = [...questions]
            .filter(q => {
                const qDate = new Date(q.created_at);
                const diffDays = Math.ceil(Math.abs(now - qDate) / (1000 * 60 * 60 * 24));
                return diffDays <= 7; // Son 7 gün içindeki sorular
            })
            .sort((a, b) => {
                const scoreA = (a.answer_count || 0) + (a.favorite_count || 0) * 2;
                const scoreB = (b.answer_count || 0) + (b.favorite_count || 0) * 2;
                return scoreB - scoreA;
            });
    }
    else { displayContent = selectedDepartment === "Tümü" ? questions : questions.filter(q => q.owner?.department === selectedDepartment); }

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans selection:bg-red-500/30 flex flex-col">
            <Toaster position="top-center" containerStyle={{ top: 80, zIndex: 99999 }} toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '1rem' } }} />
            <nav className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-20 flex justify-between items-center px-6">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={handleGoHome}>
                    <img src="/logo.png" className="w-11 h-11 md:w-12 md:h-12 brightness-0 invert object-contain group-hover:scale-105 transition-transform" alt="İSTE Logo" />
                    <h1 className="text-2xl font-black text-white tracking-tighter hidden sm:block">Akıl <span className="text-red-500">Kütüphanesi</span></h1>
                </div>

                <div className="flex items-center gap-4 relative">
                    <div className="hidden md:flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                        <MapPin size={14} className="text-blue-400" /><span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest">İSTE Kütüphane</span>
                    </div>
                    {/* ÇALIŞMA ODALARI HIZLI ERİŞİM */}
                    <Link to="/study-rooms"
                        className="hidden md:flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                        <BookOpen size={13} />
                        <span>Çalışma Odaları</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </Link>
                    {/* AKILLI AKIŞ */}
                    <Link to="/cards-demo"
                        className="hidden lg:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                        <Layers size={13} />
                        <span>Akıllı Akış</span>
                    </Link>
                    {/* TEMA TOGGLE */}
                    <ThemeToggle size="sm" />
                    <div className="relative">
                        <button onClick={toggleNotifications} className={`p-2.5 rounded-full border transition-all ${isNotificationsOpen ? 'bg-red-600/20 text-red-500 border-red-500' : 'bg-white/5 border-white/10'}`}>
                            <Bell size={20} />{unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0f1d] animate-bounce">{unreadCount}</span>}
                        </button>
                        {isNotificationsOpen && (
                            <div className="absolute top-16 right-0 w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">

                                {/* --- GÜNCELLENEN BİLDİRİM BAŞLIĞI --- */}
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
                        <div className="absolute top-16 right-0 w-[90vw] max-w-xs md:w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
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
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                    <span className="text-xs text-red-200 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm truncate max-w-[150px]">{userProfile?.department || "Bölüm Yok"}</span>
                                    <span className="text-xs text-orange-300 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full flex items-center gap-1" title={`Puan: ${userProfile?.reputation || 0}`}>
                                        <Award size={12} /> {userProfile?.badge || "Çaylak"}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/5"><button onClick={() => { setViewMode('my_questions'); setIsProfileOpen(false); }} className="p-4 text-center hover:bg-white/5 group"><span className="block text-xl font-black text-white group-hover:text-red-400">{myQuestions.length}</span><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sorularım</span></button><button onClick={() => { setViewMode('my_answers'); fetchMyAnswers(); setIsProfileOpen(false); }} className="p-4 text-center hover:bg-white/5 group"><span className="block text-xl font-black text-white group-hover:text-red-400">{myAnswers.length}</span><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cevaplarım</span></button></div>
                            <div className="p-2 space-y-1"><button onClick={() => { setViewMode('favorites'); fetchMyFavorites(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm group"><Heart size={16} className="text-red-400" /> Favorilerim <span className="ml-auto text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{myFavoriteQuestions.length}</span></button><button onClick={() => { setIsSettingsOpen(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-white/5 rounded-xl text-sm group"><Settings size={16} className="text-blue-400" /> Profil Ayarları</button><button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm group"><LogOut size={16} className="text-red-400" /> Çıkış Yap</button></div>
                        </div>
                    )}
                </div>
            </nav>


            {/* --- KULLANICI PROFİL MODALI --- */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                viewedUser={viewedUser}
                onQuestionClick={handleOpenQuestionFromModal}
                initialTab={userModalState.activeTab}
                initialScroll={userModalState.scrollTop}
            />

            {/* --- AVATAR SEÇİM MODALI --- */}
            <AvatarPickerModal
                isOpen={isAvatarPickerOpen}
                onClose={() => setIsAvatarPickerOpen(false)}
                avatarOptions={avatarOptions}
                selectedAvatarUrl={selectedAvatarUrl}
                onSelectAvatar={async (url) => {
                    setSelectedAvatarUrl(url);
                    localStorage.setItem('selected_avatar_url', url);
                    setIsAvatarPickerOpen(false);
                    setIsProfileOpen(false);
                    try {
                        await fetch(`${API_BASE}/auth/me/profile`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ avatar_url: url })
                        });
                    } catch (e) { console.error("Avatar kaydı hatası", e); }
                }}
                onRemoveAvatar={async () => {
                    setSelectedAvatarUrl(null);
                    localStorage.removeItem('selected_avatar_url');
                    setIsAvatarPickerOpen(false);
                    try {
                        await fetch(`${API_BASE}/auth/me/profile`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ avatar_url: null })
                        });
                    } catch (e) { console.error("Avatar silme hatası", e); }
                }}
            />

            {/* --- KAMERA MODALI --- */}
            <CameraModal
                isOpen={isCameraOpen}
                videoRef={videoRef}
                canvasRef={canvasRef}
                stopCamera={stopCamera}
                capturePhoto={capturePhoto}
            />

            {/* --- SORU DETAY MODALI --- */}
            <QuestionDetailModal
                selectedQuestion={selectedQuestion}
                closeQuestionModal={closeQuestionModal}
                userProfile={userProfile}
                displayName={displayName}
                selectedAvatarUrl={selectedAvatarUrl}
                getInitial={getInitial}
                openUserProfile={openUserProfile}
                editingQuestion={editingQuestion}
                setEditingQuestion={setEditingQuestion}
                editQuestionTitle={editQuestionTitle}
                setEditQuestionTitle={setEditQuestionTitle}
                editQuestionContent={editQuestionContent}
                setEditQuestionContent={setEditQuestionContent}
                handleUpdateQuestion={handleUpdateQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
                isDeletingQuestion={isDeletingQuestion}
                setFullScreenImage={setFullScreenImage}
                API_BASE={API_BASE}
                questionAnswers={questionAnswers}
                editingAnswerId={editingAnswerId}
                setEditingAnswerId={setEditingAnswerId}
                editAnswerContent={editAnswerContent}
                setEditAnswerContent={setEditAnswerContent}
                handleUpdateAnswer={handleUpdateAnswer}
                handleDeleteAnswer={handleDeleteAnswer}
                isDeletingAnswer={isDeletingAnswer}
                newAnswer={newAnswer}
                setNewAnswer={setNewAnswer}
                handleSendAnswer={handleSendAnswer}
                isAnswerSubmitting={isAnswerSubmitting}
                returnToUser={returnToUser}
                handleBackToUserModal={handleBackToUserModal}
                handleAcceptAnswer={handleAcceptAnswer}
            />

            {/* --- PROFİL AYARLARI MODALI --- */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                displayName={displayName}
                setDisplayName={setDisplayName}
                userProfile={userProfile}
                isPasswordSectionOpen={isPasswordSectionOpen}
                setIsPasswordSectionOpen={setIsPasswordSectionOpen}
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                handleChangePassword={handleChangePassword}
                isPasswordSubmitting={isPasswordSubmitting}
                handleDeleteAccount={handleDeleteAccount}
                isDeletingAccount={isDeletingAccount}
                saveProfileSettings={saveProfileSettings}
            />

            {/* --- ALT NAVİGASYON VE FİLTRE (MASAÜSTÜ) --- */}
            {viewMode === 'feed' && (
                <div className="hidden md:flex fixed bottom-6 left-4 z-40 flex-col items-start gap-4">
                    {isFilterOpen && (
                        <div className="bg-[#161b2c]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl w-[320px] max-h-96 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-300">
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
                    {viewMode === 'feed' && (
                        <>
                            <button onClick={() => setViewMode('trending')} className="group flex items-center gap-3 bg-white/5 border border-white/10 text-orange-400 px-6 py-4 rounded-full font-bold shadow-2xl hover:bg-orange-500/10 hover:border-orange-500/30 transition-all hover:scale-105 active:scale-95 backdrop-blur-xl">
                                <Flame size={20} className="animate-pulse" />
                                <span className="text-sm max-w-[100px] truncate">Popüler</span>
                            </button>
                            <button onClick={() => { setViewMode('leaderboard'); fetchLeaderboard(); }} className="group flex items-center gap-3 bg-white/5 border border-white/10 text-yellow-400 px-6 py-4 rounded-full font-bold shadow-2xl hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all hover:scale-105 active:scale-95 backdrop-blur-xl">
                                <Trophy size={20} />
                                <span className="text-sm max-w-[150px] truncate">Liderlik Tablosu</span>
                            </button>
                        </>
                    )}
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
                        <>
                            {/* ÇALIŞMA ODALARI WIDGET */}
                            <Link to="/study-rooms" className="block group">
                                <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-md border border-purple-500/20 hover:border-purple-500/40 rounded-2xl px-5 py-4 shadow-lg relative overflow-hidden transition-all hover:-translate-y-0.5">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                                <BookOpen size={17} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">Dijital Çalışma Odaları</p>
                                                <p className="text-slate-500 text-xs flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />3 aktif oda</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Timer size={10} className="text-purple-400" />28 kişi çalışıyor</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="hidden sm:flex gap-2">
                                                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">
                                                    <Zap size={9} /> Algoritma
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg">
                                                    <Coffee size={9} /> Calculus
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-purple-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                                                Katıl →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            {/* SORU OLUŞTUR KUTUSU */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl relative overflow-visible group mb-8 md:mb-10">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity rounded-t-2xl md:rounded-t-3xl"></div><div className="flex gap-3 md:gap-4">
                                    {selectedAvatarUrl ? (
                                        <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/10 object-cover shadow-lg flex-shrink-0 bg-[#0d1117]" />
                                    ) : (
                                        <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg text-sm md:text-base">{getInitial(displayName)}</div>
                                    )}
                                    <div className="flex-1 space-y-2 md:space-y-3">
                                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Aklına takılan sorunun başlığı..." className="w-full bg-transparent text-base md:text-lg text-white placeholder:text-slate-500 focus:outline-none font-bold" />
                                        <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Detayları buraya yazabilirsin..." className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs md:text-sm text-slate-300 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-red-500/50 resize-none h-16 md:h-24 transition-all"></textarea>
                                        {imagePreview && (
                                            <div className="relative inline-block mt-2">
                                                <img src={imagePreview} alt="Önizleme" className="h-16 md:h-20 w-auto rounded-xl border border-white/20 shadow-md" />
                                                <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 border border-[#0a0f1d] hover:scale-110 transition-transform"><X size={12} /></button>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap justify-between items-center gap-2 pt-1 md:pt-2">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                                <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2 md:px-2.5 py-1.5 md:py-2 rounded-lg hover:bg-white/5">
                                                    <Paperclip size={14} /> <span className="hidden sm:inline">Fotoğraf</span><span className="sm:hidden">Ekle</span>
                                                </button>
                                                <button onClick={startCamera} className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2 md:px-2.5 py-1.5 md:py-2 rounded-lg hover:bg-white/5">
                                                    <Camera size={14} /> Kamera
                                                </button>
                                            </div>
                                            <button onClick={handleCreateQuestion} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-red-900/40 disabled:opacity-50 active:scale-95 flex-shrink-0">
                                                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}{isSubmitting ? 'Yayınlanıyor...' : 'Yayınla'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* MOBİL İÇİN FİLTRE VE SEKMELER (Sadece Mobilde Görünür) */}
                            <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-2 mt-4 custom-scrollbar">
                                <div className="relative">
                                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-full font-bold shadow-lg shadow-red-900/20 whitespace-nowrap active:scale-95 transition-transform">
                                        {isFilterOpen ? <X size={14} /> : <Filter size={14} />}
                                        <span className="text-[11px]">{selectedDepartment === "Tümü" ? "Filtrele" : selectedDepartment}</span>
                                    </button>
                                    {isFilterOpen && (
                                        <div className="absolute top-full mt-2 left-0 z-50 bg-[#161b2c]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl w-[260px] max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                                            <nav className="space-y-1">
                                                {departments.map(dep => (
                                                    <button key={dep} onClick={() => { setSelectedDepartment(dep); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${selectedDepartment === dep ? "bg-red-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                                                        <div className={`w-1.5 h-1.5 flex-shrink-0 rounded-full ${selectedDepartment === dep ? 'bg-white' : 'bg-slate-600'}`}></div>{dep}
                                                    </button>
                                                ))}
                                            </nav>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setViewMode('trending')} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-orange-400 px-4 py-2.5 rounded-full font-bold shadow-lg whitespace-nowrap active:scale-95 transition-transform">
                                    <Flame size={14} />
                                    <span className="text-[11px]">Popüler</span>
                                </button>
                                <button onClick={() => { setViewMode('leaderboard'); fetchLeaderboard(); }} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-yellow-400 px-4 py-2.5 rounded-full font-bold shadow-lg whitespace-nowrap active:scale-95 transition-transform">
                                    <Trophy size={14} />
                                    <span className="text-[11px]">Liderler</span>
                                </button>
                            </div>
                        </>
                    )}

                    {viewMode === 'leaderboard' && (
                        <div className="space-y-6 pb-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                                    <Trophy size={24} className="text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Haftanın Bilgeleri</h2>
                                    <p className="text-sm text-slate-400">Platformda en çok yardımcı olan ve puan toplayan öğrenciler.</p>
                                </div>
                            </div>

                            {isLoading ? <Loader2 className="animate-spin mx-auto text-yellow-500 my-20" size={40} /> : leaderboardData.length > 0 ? (
                                <div className="space-y-4">
                                    {leaderboardData.map((user, index) => (
                                        <div key={user.id} className="bg-[#121723] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#151b29] transition-all relative overflow-hidden group">
                                            {/* Rank Indicator */}
                                            <div className="flex-shrink-0 w-10 flex justify-center">
                                                {index === 0 ? <Medal size={32} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" /> :
                                                    index === 1 ? <Medal size={28} className="text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]" /> :
                                                        index === 2 ? <Medal size={28} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" /> :
                                                            <span className="text-xl font-black text-slate-500 group-hover:text-slate-400">#{index + 1}</span>}
                                            </div>

                                            {/* Avatar */}
                                            <div
                                                className={`h-12 w-12 bg-[#1a1f2e] rounded-full flex items-center justify-center font-bold border border-white/10 text-lg text-slate-300 overflow-hidden relative flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-yellow-500/50 transition-all`}
                                                onClick={(e) => openUserProfile(user.id, e)}
                                            >
                                                {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(user.display_name || user.email || "?")}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-base cursor-pointer hover:text-yellow-400 transition-colors flex items-center gap-2" onClick={(e) => openUserProfile(user.id, e)}>
                                                    {user.display_name || user.email.split('@')[0]}
                                                    {userProfile?.email === user.email && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase tracking-widest font-black">Sen</span>}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{user.department || "Genel"}</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
                                                    <Award size={14} className="text-yellow-500" />
                                                    <span className="text-sm font-black text-yellow-500">{user.reputation || 0} <span className="text-[10px] text-yellow-500/70 font-medium">Puan</span></span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.badge || "Çaylak"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center"><Info size={32} className="mb-4 text-slate-700 opacity-50" /><h3 className="text-md font-bold text-white mb-1 italic text-slate-400">Henüz kimse puan kazanmadı.</h3><p className="text-xs text-slate-500">İlk soruyu sor veya cevapla, liderliği sen kap!</p></div>}
                        </div>
                    )}

                    {viewMode !== 'leaderboard' && (
                        <div className="space-y-6 pb-24">
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-6 ml-2">
                                {viewMode === 'trending' ? (
                                    <Flame size={16} className="text-orange-500 animate-pulse drop-shadow-[0_0_10px_orange]" />
                                ) : (
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                                )}
                                {viewMode === 'trending' ? "🔥 Haftanın Popülerleri" : (viewMode === 'my_questions' ? "Sorduğum Sorular" : (viewMode === 'my_answers' ? "Cevaplarım" : (viewMode === 'favorites' ? "❤️ Favorilerim" : (selectedDepartment === "Tümü" ? "Tüm Sorular" : selectedDepartment))))}
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
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`h-10 w-10 bg-[#1a1f2e] rounded-full flex items-center justify-center font-bold border border-white/10 text-sm text-slate-300 overflow-hidden relative flex-shrink-0 ${item.owner?.email !== userProfile?.email ? 'cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all' : ''}`}
                                                        onClick={(e) => item.owner?.email !== userProfile?.email && openUserProfile(item.owner_id, e)}
                                                        title={item.owner?.email !== userProfile?.email ? 'Profili Görüntüle' : ''}
                                                    >
                                                        {item.owner?.email === userProfile?.email ? (
                                                            selectedAvatarUrl ? <img src={selectedAvatarUrl} alt="Profil Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(displayName)
                                                        ) : (item.owner?.avatar_url ? <img src={item.owner.avatar_url} alt="Avatar" className="h-full w-full object-cover bg-white" /> : getInitial(item.owner?.display_name || item.owner?.email || "?"))}
                                                    </div>
                                                    <div className="min-w-0"><h3 className={`text-white font-bold text-sm leading-none flex items-center gap-2 flex-wrap ${item.owner?.email !== userProfile?.email ? 'cursor-pointer hover:text-red-400 transition-colors' : ''}`} onClick={(e) => item.owner?.email !== userProfile?.email && openUserProfile(item.owner_id, e)}>{item.owner?.email === userProfile?.email ? displayName : (item.owner ? (item.owner.display_name || item.owner.email.split('@')[0]) : "Anonim")}{item.owner?.email === userProfile?.email && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/10">Sen</span>}</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1"><GraduationCap size={10} /><span className="truncate max-w-[150px]">{item.owner?.department || "Genel"}</span></p></div>
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
                                                <div className="flex gap-2">
                                                    <button onClick={() => openQuestionModal(item)} className="text-xs font-bold hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                                        <MessageCircle size={14} className="text-blue-400" />
                                                        <span>{item.answer_count || 0}</span>
                                                    </button>
                                                    <button onClick={(e) => handleToggleFavorite(item.id, e)} className={`text-xs font-bold transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg ${favoritedIds.has(item.id) ? 'text-red-500 bg-red-500/10' : 'text-slate-500 bg-white/5 hover:text-red-400 hover:bg-red-500/10'}`} title="Favorilere Ekle">
                                                        <Heart size={14} fill={favoritedIds.has(item.id) ? 'currentColor' : 'none'} />
                                                        <span>{item.favorite_count !== undefined ? (item.favorite_count + (favoritedIds.has(item.id) && !item.is_favorited ? 1 : (!favoritedIds.has(item.id) && item.is_favorited ? -1 : 0))) : 0}</span>
                                                    </button>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 text-slate-500 text-xs font-bold" title="Görüntülenme">
                                                        <Eye size={14} className="text-blue-400/50" />
                                                        <span>{item.view_count || 0}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => openQuestionModal(item)} className="text-xs font-black px-5 py-2 rounded-xl border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all">İncele & Cevapla</button>
                                            </div>
                                        </div>
                                    )
                                ))
                            ) : <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center shadow-inner"><Info size={32} className="mb-4 text-slate-700 opacity-50" /><h3 className="text-md font-bold text-white mb-1 italic text-slate-400">Sonuç bulunamadı.</h3><p className="text-[10px] text-slate-500">Henüz soru veya cevap yok.</p></div>}
                        </div>
                    )}
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