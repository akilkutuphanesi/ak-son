import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, LogIn, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  // 1. Verileri tutacak State'ler
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 2. Backend "OAuth2PasswordRequestForm" kullandığı için
      // veriyi JSON değil, URLSearchParams (Form Data) olarak hazırlamalıyız.
      const formData = new URLSearchParams();
      formData.append('username', email); // DİKKAT: Backend 'username' alanını bekler (biz email yolluyoruz)
      formData.append('password', password);

      // 3. İsteği Gönder (Header 'application/x-www-form-urlencoded' olmalı)
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData, // JSON.stringify YOK! Direkt formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Giriş başarısız! Mail veya şifre hatalı.");
      }

      // 4. Token Geldi mi?
      if (data.access_token) {
        // Token'ı tarayıcıya kaydet
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_email', email);
        
        // Başarılı, yönlendir
        navigate('/dashboard');
      } else {
        throw new Error("Sunucudan token alınamadı.");
      }

    } catch (err) {
      console.error("Login Hatası:", err);
      setError(err.message === "Failed to fetch" ? "Sunucuya bağlanılamadı! Backend açık mı?" : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans p-4 bg-[#0a0f1d] selection:bg-red-500/30">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-10 mix-blend-overlay"
          alt="Library Background"
        />
      </div>
      
      {/* --- ANA SAYFAYA DÖN BUTONU --- */}
      <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white transition-all text-xs font-bold tracking-widest uppercase shadow-lg">
        <ArrowLeft size={16} />
        Ana Sayfa
      </Link>

      {/* --- ANA KART --- */}
      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-12 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* SOL PANEL */}
        <div className="md:col-span-5 bg-gradient-to-br from-red-700/90 to-red-950 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-6 text-left">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 mb-4 shadow-xl">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/tr/6/66/%C4%B0skenderun_Teknik_%C3%9Cniversitesi_logo.png" 
                    className="w-16 h-16 brightness-0 invert object-contain" 
                    alt="İSTE Logo"
                />
            </div>

            <div>
                <h1 className="text-6xl font-black tracking-tight leading-[0.9] mb-4">
                    Akıl <br />
                    <span className="text-red-200">Kütüphanesi</span>
                </h1>
                <div className="w-16 h-1.5 bg-red-400/40 rounded-full mb-4"></div>
                <p className="text-lg font-medium text-red-100/70 tracking-wide uppercase">
                    İskenderun Teknİk Ünİversİtesİ
                </p>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="md:col-span-7 bg-[#121826]/40 p-8 md:p-14 flex flex-col justify-center">
            
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                        Giriş Yap
                        <LogIn className="text-red-500" size={28} />
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Kütüphane ağına bağlanmak için bilgilerinizi girin.</p>
                </div>
            </div>

            {/* HATA MESAJI */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Mail Girişi */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kurumsal Mail</label>
                    <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Örn: isim.soyisim@iste.edu.tr" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                            required
                        />
                    </div>
                </div>

                {/* Şifre */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Şifre</label>
                        <a href="#" className="text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors">Şifremi Unuttum</a>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                            required
                        />
                    </div>
                </div>

                {/* Login Butonu */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(220,38,38,0.3)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Giriş Yapılıyor...</span>
                            </>
                        ) : (
                            <>
                                <span>Oturum Aç</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                    Henüz hesabınız yok mu? {' '}
                    <Link to="/register" className="text-white font-bold hover:text-red-500 transition-colors underline-offset-4 underline decoration-red-600/50">
                        Hemen Kaydol
                    </Link>
                </p>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase">
        İSTE &copy; 2026
      </div>
    </div>
  );
}