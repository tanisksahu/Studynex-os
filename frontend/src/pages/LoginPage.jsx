import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(195,192,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195,192,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Card */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <span className="material-symbols-outlined text-on-primary-container text-xl">bolt</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-lg text-on-surface tracking-tight">Studynex</h1>
              <p className="text-[0.65rem] text-primary uppercase tracking-widest font-semibold">Academic Command Center</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Welcome back</h2>
            <p className="text-sm text-on-surface-variant">Sign in to access your academic dashboard and study system.</p>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/40 rounded-xl py-3 px-4 transition-all duration-200 group"
          >
            {/* Google Icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Continue with Google</span>
          </motion.button>

          {/* Footer note */}
          <p className="mt-6 text-center text-[0.65rem] text-on-surface-variant/60">
            By signing in you agree to our terms. Your data is stored securely.
          </p>
        </div>

        {/* Bottom badge */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-[0.6rem] text-on-surface-variant/50 uppercase tracking-widest">Powered by Firebase Auth</span>
        </div>
      </motion.div>
    </div>
  );
}
