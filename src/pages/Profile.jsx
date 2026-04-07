import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { validateFile } from '../utils/validation';
import AnimatedCounter from '../components/AnimatedCounter';
import {
  containerVariants,
  itemVariants,
  tabVariants,
  pageVariants,
  hoverLiftVariants
} from '../utils/animationVariants';

const Profile = () => {
  const { profile, user, updateProfile, uploadProgress, dataLoading } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    institution: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        institution: profile.institution || ''
      });
    }
  }, [profile]);

  const totalStudyTime = Math.floor(profile?.studyTimeMinutes / 60 || 0);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfile(formData);
      toast.success('Profile updated successfully! 🎉', { 
        icon: '✨',
        style: { 
          borderRadius: '12px', 
          background: '#1a1f3a', 
          color: '#fff',
          border: '1px solid rgba(79,70,229,0.3)'
        }
      });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile', { 
        style: { 
          borderRadius: '12px', 
          background: '#1a1f3a', 
          color: '#ff5c5c',
          border: '1px solid rgba(255,92,92,0.3)'
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file, { maxSize: 5 * 1024 * 1024 }); // 5MB max
    if (!validation.valid) {
      setUploadError(validation.error);
      toast.error(validation.error, { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
      return;
    }

    setUploadError('');
    setIsUploadingAvatar(true);

    try {
      await updateProfile({ ...formData, avatar: file });
      toast.success('Avatar updated! 📸', { 
        style: { 
          background: '#222', 
          color: '#fff',
          borderRadius: '10px'
        }
      });
    } catch (error) {
      setUploadError(error.message);
      toast.error('Failed to upload avatar', { style: { background: '#222', color: '#fff' }});
    } finally {
      setIsUploadingAvatar(false);
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
        
        {/* Banner Section */}
        <motion.div variants={itemLoader} className="flex justify-between items-center bg-gradient-to-r from-surface-container-high to-surface-container p-10 rounded-3xl border border-outline-variant/20 shadow-2xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10 w-full">
            <div 
              className="relative group/avatar cursor-pointer shrink-0" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleImageUpload}
                 disabled={isUploadingAvatar}
              />
              <img 
                src={profile?.avatarUrl || "https://via.placeholder.com/128"} 
                alt="Avatar" 
                className="w-32 h-32 rounded-2xl border-4 border-primary/30 shadow-[0_0_30px_rgba(195,192,255,0.2)] object-cover bg-surface-container-highest transition-transform duration-500 group-hover/avatar:scale-105"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-white font-bold">{uploadProgress}%</p>
                  </div>
                </div>
              )}
              {!isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-sm">
                   <span className="material-symbols-outlined text-white font-black text-3xl">add_a_photo</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <h2 className="font-headline text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">
                   {profile?.firstName} {profile?.lastName}
                 </h2>
                 <button 
                   onClick={() => setIsEditing(!isEditing)} 
                   className="mt-4 md:mt-0 text-[0.65rem] font-bold uppercase tracking-widest text-primary hover:text-indigo-300 transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20"
                 >
                   <span className="material-symbols-outlined text-[14px]">tune</span> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                 </button>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[0.65rem] font-bold uppercase tracking-widest rounded flex items-center shadow-lg shadow-primary/5">
                  <span className="material-symbols-outlined text-[12px] mr-1">military_tech</span> Level {profile?.level || 1} Scholar
                </span>
                {profile?.tier && (
                  <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 text-[0.65rem] font-bold uppercase tracking-widest rounded flex items-center shadow-lg shadow-secondary/5">
                    <span className="material-symbols-outlined text-[12px] mr-1">workspace_premium</span> {profile.tier}
                  </span>
                )}
                {profile?.institution && (
                  <span className="px-3 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 text-[0.65rem] font-bold uppercase tracking-widest rounded flex items-center shadow-lg shadow-tertiary/5">
                    <span className="material-symbols-outlined text-[12px] mr-1">school</span> {profile.institution}
                  </span>
                )}
              </div>

              {/* Progress Bar mapped to level */}
              <div className="mt-6">
                <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-widest text-[#c7c4d8] mb-2">
                  <span>{profile.xp} XP</span>
                  <span>Next: {profile.level * 200} XP</span>
                </div>
                <div className="w-full bg-[#0b1326]/50 h-2 rounded-full overflow-hidden border border-outline-variant/10">
                  <div className="bg-gradient-to-r from-primary to-indigo-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(195,192,255,0.8)]" style={{ width: `${(profile.xp % 200) / 2}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-[-5%] top-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-1000"></div>
        </motion.div>

        {/* CSS GRID Layout: 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main User Settings Form (8 Cols) */}
          <div className="lg:col-span-8">
             <motion.section variants={itemLoader} className="bg-surface-container/30 p-8 rounded-3xl border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
               <h3 className="font-headline text-xl font-bold uppercase tracking-widest mb-8 flex items-center pb-4 border-b border-outline-variant/10">
                 <span className="material-symbols-outlined mr-3 text-primary">{isEditing ? 'edit_note' : 'security'}</span> 
                 {isEditing ? 'Edit Profile' : 'Identity & Details'}
               </h3>
               
               {isEditing ? (
                 <form onSubmit={handleSave} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">First Name</label>
                       <input
                         type="text"
                         value={formData.firstName}
                         onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                         className="w-full bg-[#0b1326]/60 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                         placeholder="Your first name"
                       />
                     </div>
                     <div>
                       <label className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Last Name</label>
                       <input
                         type="text"
                         value={formData.lastName}
                         onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                         className="w-full bg-[#0b1326]/60 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                         placeholder="Your last name"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Bio ({formData.bio.length}/500)</label>
                     <textarea
                       value={formData.bio}
                       onChange={(e) => setFormData({...formData, bio: e.target.value})}
                       maxLength="500"
                       rows="4"
                       className="w-full bg-[#0b1326]/60 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors resize-none"
                       placeholder="Tell us about yourself..."
                     />
                   </div>

                   <div>
                     <label className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Institution</label>
                     <input
                       type="text"
                       value={formData.institution}
                       onChange={(e) => setFormData({...formData, institution: e.target.value})}
                       className="w-full bg-[#0b1326]/60 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                       placeholder="Your school/college"
                     />
                   </div>

                   {uploadError && (
                     <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-xs">
                       {uploadError}
                     </div>
                   )}

                   <div className="flex gap-3 pt-4">
                     <button
                       type="submit"
                       disabled={dataLoading || isUploadingAvatar}
                       className="flex-1 bg-primary text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-indigo-400 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Save Changes
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         setIsEditing(false);
                         setUploadError('');
                       }}
                       className="flex-1 bg-white/5 text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-white/10 transition-all"
                     >
                       Cancel
                     </button>
                   </div>
                 </form>
               ) : (
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-[#0b1326]/60 rounded-2xl border border-white/5">
                      <div>
                         <p className="text-sm font-bold text-white">Profile Information</p>
                         <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Data Saved to Cloud</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full animate-pulse ${user ? 'bg-[#4edea3]' : 'bg-on-surface-variant'}`}></span>
                   </div>

                   {profile?.bio && (
                     <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                       <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Bio</p>
                       <p className="text-sm text-white leading-relaxed">{profile.bio}</p>
                     </div>
                   )}

                   {profile?.institution && (
                     <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                       <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Institution</p>
                       <p className="text-sm text-white">{profile.institution}</p>
                     </div>
                   )}
                 </div>
               )}
             </motion.section>
          </div>

          {/* Right Sidebar Area (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Gamification Stats */}
            <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-xl">
               <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6 flex items-center">
                 <span className="material-symbols-outlined mr-3 text-secondary">emoji_events</span> Statistics
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center text-center group cursor-default hover:bg-surface-container-high transition-colors">
                   <span className="material-symbols-outlined text-primary text-3xl mb-2 group-hover:scale-110 transition-transform">schedule</span>
                   <span className="text-2xl font-black font-headline text-white">{totalStudyTime}h</span>
                   <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Focus Time</span>
                 </div>
                 
                 <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center text-center group cursor-default hover:bg-surface-container-high transition-colors">
                   <span className="material-symbols-outlined text-error text-3xl mb-2 group-hover:scale-110 transition-transform">local_fire_department</span>
                   <span className="text-2xl font-black font-headline text-white">{profile?.streak || 0}</span>
                   <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Max Streak</span>
                 </div>
               </div>
            </motion.div>

            {/* Achievements/Badges */}
            <motion.div variants={itemLoader} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-xl">
               <h3 className="font-headline text-lg font-bold uppercase tracking-widest mb-6 flex items-center">
                 <span className="material-symbols-outlined mr-3 text-tertiary">workspace_premium</span> Badges (4/12)
               </h3>
               
               <ul className="space-y-3">
                 <li className="flex items-center gap-4 bg-tertiary/10 p-3 rounded-xl border border-tertiary/20">
                   <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(202,193,255,0.4)]">
                     <span className="material-symbols-outlined text-[#0b1326] font-black">rocket_launch</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-tertiary leading-tight">Early Adopter</h4>
                     <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Joined StudyNex Alpha</p>
                   </div>
                 </li>
                 <li className="flex items-center gap-4 bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                   <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(78,222,163,0.4)]">
                     <span className="material-symbols-outlined text-[#0b1326] font-black">electric_bolt</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-secondary leading-tight">Lightning Focus</h4>
                     <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">5 Hours non-stop</p>
                   </div>
                 </li>
                 <li className="flex items-center gap-4 bg-surface-container-highest p-3 rounded-xl border border-outline-variant/20 opacity-50 grayscale">
                   <div className="w-10 h-10 rounded-full bg-outline-variant flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-[#0b1326] font-black">lock</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-white leading-tight">Midterm Master</h4>
                     <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Require 90% Global Mastery</p>
                   </div>
                 </li>
               </ul>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default Profile;
