import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  containerVariants,
  itemVariants,
  tabVariants,
  pageVariants
} from '../utils/animationVariants';

const Settings = () => {
  const { settings, updateSettings, profile, dataLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [isTogglingAI, setIsTogglingAI] = useState(false);

  const handleWipeData = () => {
     if(window.confirm("Are you sure? This will reset your profile XP and settings. This action cannot be undone.")) {
       localStorage.clear();
       toast.success('Profile reset. Reloading...', { icon: '🔄', style: { background: '#1a1f3a', color: '#fff', border: '1px solid rgba(255,92,92,0.3)' }});
       setTimeout(() => window.location.reload(), 1500);
     }
  };

  const handleToggleSetting = async (key, value) => {
    if (key === 'aiInjection') setIsTogglingAI(true);
    try {
      await updateSettings({ ...settings, [key]: value });
      toast.success(`Setting updated! ✨`, { style: { background: '#1a1f3a', color: '#fff', border: '1px solid rgba(79,70,229,0.3)' }});
    } catch (error) {
      toast.error('Failed to update setting', { style: { background: '#1a1f3a', color: '#ff5c5c' }});
    } finally {
      if (key === 'aiInjection') setIsTogglingAI(false);
    }
  };

  return (
    <motion.main 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="p-10 text-on-surface"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-end mb-6"
        >
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
           >
             <h2 className="font-headline text-4xl font-black uppercase tracking-widest flex items-center mb-2">
               <motion.span 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="material-symbols-outlined mr-4 text-primary text-4xl"
               >
                 tune
               </motion.span>
               System Settings
             </h2>
             <p className="text-on-surface-variant text-sm font-medium pl-14">Configure interface, intelligence nodes, and data states.</p>
           </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[60vh]">
          
          {/* Settings Sidebar Tabs (3 Cols) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-3"
          >
             <motion.div 
               className="bg-surface-container-low/50 p-4 rounded-3xl border border-primary/10 shadow-lg sticky top-8 flex flex-col gap-2 backdrop-blur-sm"
             >
                {[
                  { id: 'general', icon: 'palette', label: 'UI & Theme' },
                  { id: 'profile', icon: 'account_circle', label: 'Account' },
                  { id: 'study', icon: 'trending_up', label: 'Study Focus' },
                  { id: 'ai', icon: 'psychology', label: 'Intelligence' },
                  { id: 'notifications', icon: 'notifications', label: 'Alerts' },
                  { id: 'data', icon: 'privacy_tip', label: 'Data & Privacy' },
                  { id: 'advanced', icon: 'developer_board', label: 'Advanced' }
                ].map((tab, index) => (
                  <motion.button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-widest ${activeTab === tab.id ? 'bg-gradient-to-r from-primary/30 to-primary/10 text-primary border border-primary/40 shadow-[0_0_20px_rgba(195,192,255,0.2)]' : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-white border border-transparent'}`}
                  >
                    <motion.span 
                      animate={activeTab === tab.id ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="material-symbols-outlined text-[20px]"
                    >
                      {tab.icon}
                    </motion.span>
                    {tab.label}
                  </motion.button>
                ))}
             </motion.div>
          </motion.div>

          {/* Settings Content Area (9 Cols) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-9 relative"
          >
             <motion.div 
               className="bg-gradient-to-br from-surface-container/60 to-surface-container/30 p-8 lg:p-12 rounded-3xl border border-primary/10 shadow-2xl shadow-primary/10 backdrop-blur-xl relative z-10 min-h-full"
             >
                
                <AnimatePresence mode="wait">
                  {activeTab === 'general' && (
                    <motion.div key="general" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-primary/20 pb-4 text-primary flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-primary to-transparent rounded-full"></span>
                        UI & Theme
                      </motion.h3>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="flex items-center justify-between p-6 bg-surface-container-highest/70 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all shadow-lg shadow-primary/5"
                      >
                        <div>
                          <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">dark_mode</span>
                            Theme Interface
                          </h4>
                          <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">System relies on Neon Dark Glassmorphism.</p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          onClick={() => toast.error('Light theme locked for prototype stability', { style: { background: '#222', color: '#ff5c5c' }})} 
                          className="w-14 h-8 bg-primary rounded-full relative shadow-[0_0_15px_rgba(195,192,255,0.4)] border border-primary/60"
                        >
                          <motion.div 
                            animate={{ right: '4px' }}
                            className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                          >
                             <span className="material-symbols-outlined text-primary text-[14px]">dark_mode</span>
                          </motion.div>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'profile' && (
                    <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-primary/20 pb-4 text-primary flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-primary to-transparent rounded-full"></span>
                        Account Configuration
                      </motion.h3>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 gap-4"
                      >
                         {[
                           { label: 'First Name', value: profile.firstName },
                           { label: 'Institution', value: profile.institution }
                         ].map((field, i) => (
                           <motion.div 
                             key={i}
                             variants={itemVariants}
                             className="col-span-2 sm:col-span-1"
                           >
                              <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">{field.label}</label>
                              <input 
                                type="text" 
                                disabled 
                                value={field.value} 
                                className="w-full bg-[#0b1326]/50 border border-outline-variant/30 text-white text-sm px-4 py-3 rounded-xl opacity-50 cursor-not-allowed" 
                              />
                           </motion.div>
                         ))}
                      </motion.div>
                      <p className="text-xs text-on-surface-variant italic">Profile modifications are handled exclusively in the Scholar Identity page.</p>
                    </motion.div>
                  )}

                  {activeTab === 'study' && (
                    <motion.div key="study" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-primary/20 pb-4 text-primary flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-secondary to-transparent rounded-full"></span>
                        <span className="material-symbols-outlined">trending_up</span> Study Preferences
                      </motion.h3>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 gap-4"
                      >
                         {[
                           { label: 'Target GPA', value: profile.targetGpa || '3.5', suffix: '/ 4.0' },
                           { label: 'Current Streak', value: profile.streak || 0, suffix: 'days' }
                         ].map((stat, i) => (
                           <motion.div 
                             key={i}
                             variants={itemVariants}
                             whileHover={{ scale: 1.02, y: -4 }}
                             className="col-span-2 sm:col-span-1 border border-secondary/20 rounded-2xl p-6 bg-surface-container-highest/70 hover:bg-surface-container-highest transition-all shadow-lg hover:shadow-secondary/20"
                           >
                              <h4 className="font-bold text-white mb-2 text-sm">{stat.label}</h4>
                              <div className="flex items-center gap-2">
                                 <span className="text-3xl font-black text-secondary">{stat.value}</span>
                                 <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">{stat.suffix}</span>
                              </div>
                           </motion.div>
                         ))}
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-secondary/10 border border-secondary/30 rounded-2xl"
                      >
                        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">💡 Tip:</p>
                        <p className="text-sm text-white mt-1">Edit your study goals and preferences in the Profile section.</p>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'ai' && (
                    <motion.div key="ai" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-primary/20 pb-4 text-primary flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-primary to-transparent rounded-full"></span>
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="material-symbols-outlined"
                        >
                          auto_awesome
                        </motion.span> 
                        Intelligence Engine
                      </motion.h3>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {[
                          { key: 'aiInjection', label: 'AI Context Injection', desc: 'Allow AI to passively scan your uploaded notes and generate spontaneous Mock Exams.' },
                          { key: 'autoSuggest', label: 'Auto-Suggest Planning', desc: 'Agent attempts to preemptively suggest tasks based on your schedule.' }
                        ].map((option, i) => (
                          <motion.div 
                            key={i}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex items-center justify-between p-4 bg-surface-container-highest/70 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all"
                          >
                            <div>
                              <h4 className="font-bold text-white mb-1">{option.label}</h4>
                              <p className="text-xs text-on-surface-variant max-w-sm">{option.desc}</p>
                            </div>
                            <motion.button 
                              onClick={() => handleToggleSetting(option.key, !settings[option.key])}
                              disabled={option.key === 'aiInjection' ? isTogglingAI : dataLoading}
                              whileHover={{ scale: 1.1 }}
                              className={`w-14 h-8 rounded-full relative transition-all shadow-lg ${settings[option.key] ? 'bg-primary shadow-primary/40 border border-primary/60' : 'bg-surface-container-lowest border border-outline-variant/40'} disabled:opacity-50`}
                            >
                              <motion.div 
                                animate={{ x: settings[option.key] ? 28 : 4 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="absolute top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                              >
                                {option.key === 'aiInjection' && isTogglingAI && (
                                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </motion.div>
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div key="advanced" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-primary/20 pb-4 text-primary flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-primary to-transparent rounded-full"></span>
                        <span className="material-symbols-outlined">developer_board</span> Advanced / Developer
                      </motion.h3>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 bg-surface-container-highest/70 rounded-2xl border border-outline-variant/20"
                      >
                        <div>
                          <h4 className="font-bold text-white mb-1">Hardware Acceleration UI</h4>
                          <p className="text-xs text-on-surface-variant max-w-sm">Attempt strictly WebGL renders for holographic animations.</p>
                        </div>
                        <motion.button 
                          disabled 
                          className="px-4 py-1 text-[0.65rem] border border-outline-variant/50 text-on-surface-variant bg-surface-container rounded-full font-bold tracking-widest uppercase cursor-not-allowed opacity-50"
                        >
                          Locked
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'data' && (
                    <motion.div key="data" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-error/30 pb-4 text-error flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-error to-transparent rounded-full"></span>
                        Data & Privacy
                      </motion.h3>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="flex items-center justify-between p-4 bg-surface-container-highest/70 rounded-2xl border border-secondary/20"
                        >
                          <div>
                            <h4 className="font-bold text-white mb-1">Export Academic Record</h4>
                            <p className="text-xs text-on-surface-variant max-w-sm">Download raw JSON of syllabus map and completion rates.</p>
                          </div>
                          <motion.button 
                            onClick={() => toast.success('JSON payload constructing...', { icon: '📥' })}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(78,222,163,0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 font-black uppercase tracking-widest text-[0.65rem] rounded-xl transition-all shadow-lg"
                          >
                             Export
                          </motion.button>
                        </motion.div>

                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="flex items-center justify-between p-4 bg-error/10 rounded-2xl border border-error/30 hover:border-error/50 transition-all"
                        >
                          <div>
                            <h4 className="font-bold text-error mb-1 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">warning</span>
                              Local Storage Wipe
                            </h4>
                            <p className="text-xs text-on-surface-variant max-w-sm">Permanently deletes current state and resets gamification XP.</p>
                          </div>
                          <motion.button 
                            onClick={handleWipeData}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255,92,92,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 bg-error hover:bg-error/80 text-[#0b1326] font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(255,92,92,0.3)]"
                          >
                             Wipe State
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'notifications' && (
                    <motion.div key="notifications" variants={tabVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-headline text-xl font-bold uppercase tracking-widest border-b border-primary/20 pb-4 text-primary flex items-center gap-2"
                      >
                        <span className="w-1 h-6 bg-gradient-to-b from-secondary to-transparent rounded-full"></span>
                        <span className="material-symbols-outlined">notifications</span>
                        Alert Preferences
                      </motion.h3>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {[
                          { key: 'reminders', label: 'Study Reminders', desc: 'Notifications for scheduled tasks and exam deadlines.' },
                          { key: 'notifications', label: 'Agent Feedback', desc: 'Toast notifications when automatic actions are executed.' }
                        ].map((notif, i) => (
                          <motion.div 
                            key={i}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex items-center justify-between p-4 bg-surface-container-highest/70 rounded-2xl border border-secondary/10 hover:border-secondary/30 transition-all"
                          >
                            <div>
                              <h4 className="font-bold text-white mb-1">{notif.label}</h4>
                              <p className="text-xs text-on-surface-variant max-w-sm">{notif.desc}</p>
                            </div>
                            <motion.button 
                              onClick={() => handleToggleSetting(notif.key, !settings[notif.key])}
                              disabled={dataLoading}
                              whileHover={{ scale: 1.1 }}
                              className={`w-14 h-8 rounded-full relative transition-all shadow-lg ${settings[notif.key] ? 'bg-secondary shadow-secondary/40 border border-secondary/60' : 'bg-surface-container-lowest border border-outline-variant/40'} disabled:opacity-50`}
                            >
                              <motion.div 
                                animate={{ x: settings[notif.key] ? 28 : 4 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="absolute top-1 w-6 h-6 bg-white rounded-full flex-shrink-0 shadow-lg"
                              ></motion.div>
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
             </motion.div>
             
             {/* Abstract BG blobs with animations */}
             {activeTab === 'ai' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute right-[-10%] top-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"
               ></motion.div>
             )}
             {activeTab === 'data' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute right-[-10%] top-1/4 w-64 h-64 bg-error/15 rounded-full blur-[80px] pointer-events-none"
               ></motion.div>
             )}
          </motion.div>

        </div>
      </motion.div>
    </motion.main>
  );
};

export default Settings;
