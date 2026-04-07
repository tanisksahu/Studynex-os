import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const { loginWithGoogle } = useAppContext();

  return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface-container/30 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] mx-auto mb-8">
           <span className="material-symbols-outlined text-white text-5xl">school</span>
        </div>

        <h1 className="text-4xl font-black text-white font-headline tracking-tighter uppercase mb-2">Studynex OS</h1>
        <p className="text-on-surface-variant font-bold text-xs uppercase tracking-[0.3em] mb-10">The Autonomous Academic Engine</p>

        <div className="space-y-6">
           <p className="text-sm text-[#c7c4d8] leading-relaxed">
             Initialize your scholar identity to synchronize materials, track strategic goals, and activate AI study recommendations.
           </p>

           <button 
             onClick={loginWithGoogle}
             className="w-full bg-white text-[#3c4043] font-black py-4 rounded-2xl flex items-center justify-center gap-4 transition-all hover:bg-[#f8f9fa] shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
           >
              <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" className="w-6 h-6" />
              Sign in with Google
           </button>

           <p className="text-[0.6rem] text-on-surface-variant font-medium uppercase tracking-widest mt-8">
             Secured by Firebase Cloud Infrastructure
           </p>
        </div>
      </motion.div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
    </div>
  );
};

export default Login;
