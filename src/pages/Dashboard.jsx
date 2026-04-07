import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { validateSubjectName } from '../utils/validation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AnimatedCounter from '../components/AnimatedCounter';
import {
  containerVariants,
  itemVariants,
  hoverLiftVariants,
  glowVariants,
  pageVariants
} from '../utils/animationVariants';

const Dashboard = () => {
  const { subjects, addSubject, dataLoading } = useAppContext();
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [focusedCardId, setFocusedCardId] = useState(null);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Validate input
    const validation = validateSubjectName(newSubjectName);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    try {
      setIsSubmitting(true);
      await addSubject(newSubjectName.trim());
      toast.success('Subject initialized! 🚀', { 
        icon: '✨',
        style: { borderRadius: '12px', background: '#1a1f3a', color: '#fff', border: '1px solid rgba(79,70,229,0.3)' }
      });
      setNewSubjectName('');
    } catch (error) {
      toast.error('Failed to create subject', { 
        style: { borderRadius: '12px', background: '#1a1f3a', color: '#ff5c5c' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="p-8 max-w-6xl mx-auto"
    >
      {/* Header with animated intro */}
      <motion.header 
        variants={itemVariants}
        className="mb-12 relative z-10"
      >
        <motion.h1 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-lg"
        >
          Welcome, Scholar
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
          className="text-on-surface-variant font-bold uppercase tracking-widest text-xs"
        >
          Your Academic Overview
        </motion.p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
      >
        {/* Quick Stats - Animated Counter */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-gradient-to-br from-surface-container/50 to-surface-container/20 p-8 rounded-[2rem] border border-primary/20 shadow-lg shadow-primary/10 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <p className="text-xs font-black uppercase text-primary tracking-widest mb-3 relative z-10">Total Subjects</p>
          <div className="text-4xl font-headline font-black text-white relative z-10">
            <AnimatedCounter to={subjects.length} duration={0.8} />
          </div>
          <div className="hidden md:block absolute top-2 right-2 text-primary/20">
            <span className="material-symbols-outlined text-6xl">school</span>
          </div>
        </motion.div>

        {/* Add New Subject Card */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-2 bg-gradient-to-br from-primary/15 to-primary/5 p-8 rounded-[2rem] border border-primary/30 relative overflow-hidden shadow-lg shadow-primary/10"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2 relative z-10"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Initialize New Subject
          </motion.h3>
          <form onSubmit={handleAddSubject} className="space-y-3 relative z-10">
            <div>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#4f46e5' }}
                type="text"
                value={newSubjectName}
                onChange={(e) => {
                  setNewSubjectName(e.target.value);
                  setValidationError('');
                }}
                placeholder="e.g. Quantum Mechanics"
                className="w-full bg-black/20 border-2 border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all focus:shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                disabled={isSubmitting || dataLoading}
              />
              {validationError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-error text-xs mt-2 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {validationError}
                </motion.p>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting || dataLoading || !newSubjectName.trim()}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(79,70,229,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="material-symbols-outlined text-[16px] inline-block"
                    >
                      autorenew
                    </motion.span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Initialize
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Active Subjects Section */}
      <motion.section 
        variants={itemVariants}
        className="relative"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Active Subjects</h2>
          {subjects.length > 0 && (
            <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {subjects.length} {subjects.length === 1 ? 'Stream' : 'Streams'}
            </span>
          )}
        </motion.div>

        {subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center border-2 border-dashed border-primary/20 rounded-[2.5rem] bg-primary/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <motion.span 
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="material-symbols-outlined text-6xl block mb-4 text-primary/40 mx-auto"
              >
                library_books
              </motion.span>
              <p className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">
                No subjects initialized. System awaiting input.
              </p>
              <p className="text-[0.7rem] text-on-surface-variant/60 mt-2">
                Create your first subject above to begin your academic journey
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((s, index) => (
              <motion.div
                key={s.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                
                <motion.div
                  className="relative bg-gradient-to-br from-surface-container/40 to-surface-container/10 p-8 rounded-[2.5rem] border border-white/5 group-hover:border-primary/40 transition-all overflow-hidden"
                >
                  {/* Animated background gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <motion.h4 
                      initial={{ color: '#ffffff' }}
                      whileHover={{ color: '#c3c0ff' }}
                      className="text-xl font-black text-white uppercase tracking-tight transition-colors"
                    >
                      {s.name}
                    </motion.h4>
                    
                    {/* Progress row */}
                    <div className="flex justify-between items-center text-[0.6rem] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                      <span>Progress</span>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="text-primary font-headline"
                      >
                        <AnimatedCounter to={s.progress || 0} duration={0.6} suffix="%" />
                      </motion.span>
                    </div>
                    
                    {/* Animated progress bar */}
                    <div className="mt-3 w-full bg-white/5 h-2.5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.8, ease: 'easeOut' }}
                        style={{ originX: 0 }}
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.6)]"
                      />
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-surface-container-highest/50 backdrop-blur-sm p-2 rounded-lg border border-white/5 text-center"
                      >
                        <span className="block text-[0.55rem] text-on-surface-variant font-bold uppercase">Units</span>
                        <span className="text-sm font-headline font-black text-primary">
                          {s.units || '0'}
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-surface-container-highest/50 backdrop-blur-sm p-2 rounded-lg border border-white/5 text-center"
                      >
                        <span className="block text-[0.55rem] text-on-surface-variant font-bold uppercase">Status</span>
                        <span className={`text-xs font-headline font-black ${
                          (s.progress || 0) >= 80 ? 'text-secondary' : (s.progress || 0) >= 50 ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          {(s.progress || 0) >= 80 ? '✓ Strong' : (s.progress || 0) >= 50 ? '◐ Active' : '○ Pending'}
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Navigation arrow on hover */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-4 right-4 text-primary/40 group-hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_outward</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-50"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[80px] pointer-events-none -z-50"></div>
    </motion.div>
  );
};

export default Dashboard;
