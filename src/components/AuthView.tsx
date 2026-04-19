import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

interface AuthViewProps {
  onSuccess: (user: any) => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'signup') {
        const res = await api.signup(formData);
        onSuccess(res.user);
      } else {
        const res = await api.login({ email: formData.email, password: formData.password });
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans" dir="rtl">
      {/* Visual Side (Left in RTL, Right in LTR) */}
      <div className="md:w-1/2 relative overflow-hidden bg-[var(--panel)] hidden md:flex items-center justify-center p-12 order-2">
        <div className="absolute inset-0 opacity-20" 
          style={{ backgroundImage: `radial-gradient(circle at 20% 40%, var(--accent) 0%, transparent 40%), radial-gradient(circle at 80% 60%, #3b82f6 0%, transparent 40%)` }}
        />
        
        <div className="relative z-10 max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[var(--accent)] mb-6">
               <Sparkles size={48} />
            </div>
            <h1 className="text-5xl font-black mb-6 leading-tight">ابدأ رحلتك في عالم القصص المصورة</h1>
            <p className="text-xl text-[var(--text-dim)] leading-relaxed">
              مكانك المفضل لإنشاء، تنظيم، ومشاركة رواياتك المصورة بأسلوب المانهوا والمانغا. 
              حفظ سحابي، مزامنة فورية، وحرية إبداعية تامة.
            </p>
          </motion.div>

          <div className="mt-12 space-y-4">
             {[
               "مزامنة سحابية لمشاريعك",
               "مساحة عمل مخصصة لكل مستخدم",
               "تحكم كامل في الشخصيات والأحداث"
             ].map((feature, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.5 + (i * 0.1) }}
                 className="flex items-center gap-3 text-sm font-bold bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm"
               >
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                 {feature}
               </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 order-1">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center md:text-right">
             <div className="flex items-center justify-center md:justify-start gap-3 text-[var(--accent)] mb-4 font-bold text-2xl tracking-widest">
               <span>✦</span>
               <h1>HIKAYA</h1>
             </div>
             <h2 className="text-3xl font-bold mb-2">
               {mode === 'login' ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
             </h2>
             <p className="text-[var(--text-dim)] text-sm">
               {mode === 'login' ? 'سجل دخولك للمتابعة إلى مشاريعك' : 'انضم إلينا وابدأ في رسم قصتك الأولى'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <AnimatePresence mode="wait">
               {mode === 'signup' && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                 >
                   <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5 mr-1">الاسم الكامل</label>
                   <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#111] border border-[var(--border)] rounded-xl py-3 pr-10 pl-4 outline-none focus:border-[var(--accent)] transition-colors text-sm"
                        placeholder="أدخل اسمك..."
                      />
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5 mr-1">البريد الإلكتروني</label>
                <div className="relative">
                   <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                   <input 
                     type="email"
                     required
                     value={formData.email}
                     onChange={e => setFormData({ ...formData, email: e.target.value })}
                     className="w-full bg-[#111] border border-[var(--border)] rounded-xl py-3 pr-10 pl-4 outline-none focus:border-[var(--accent)] transition-colors text-sm"
                     placeholder="example@mail.com"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5 mr-1">كلمة المرور</label>
                <div className="relative">
                   <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                   <input 
                     type="password"
                     required
                     value={formData.password}
                     onChange={e => setFormData({ ...formData, password: e.target.value })}
                     className="w-full bg-[#111] border border-[var(--border)] rounded-xl py-3 pr-10 pl-4 outline-none focus:border-[var(--accent)] transition-colors text-sm"
                     placeholder="••••••••"
                   />
                </div>
             </div>

             {error && (
               <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                 <AlertCircle size={14} />
                 {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-[var(--accent)] hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                 <>
                   <span>{mode === 'login' ? 'دخول' : 'اشترك الآن'}</span>
                   <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                 </>
               )}
             </button>
          </form>

          <div className="mt-8 text-center text-sm">
             <span className="text-[var(--text-dim)]">
               {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
             </span>
             <button 
               onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
               className="mr-2 text-[var(--accent)] font-bold hover:underline"
             >
               {mode === 'login' ? 'إنشاء حساب جديد' : 'تسجل الدخول'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
