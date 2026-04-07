import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PRIORITY_THEMES = {
  high: { cls: "bg-error/10 text-error border-error/20", glow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]", icon: 'priority_high' },
  medium: { cls: "bg-amber-400/10 text-amber-400 border-amber-400/20", glow: "shadow-[0_0_15px_rgba(252,211,77,0.1)]", icon: 'stat_1' },
  low: { cls: "bg-secondary/10 text-secondary border-secondary/20", glow: "shadow-[0_0_15px_rgba(78,222,163,0.1)]", icon: 'low_priority' }
};

const Planner = () => {
  const { tasks, addTask, toggleTask, deleteTask, subjects } = useAppContext();
  const [formData, setFormData] = useState({ title: '', subjectId: '', deadline: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subjectId) return toast.error('Please fill critical fields');
    addTask(formData);
    setFormData({ title: '', subjectId: '', deadline: '', priority: 'medium' });
  };

  const sortedTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      today: (tasks || []).filter(t => t.deadline === today && !t.completed),
      upcoming: (tasks || []).filter(t => t.deadline !== today && !t.completed),
      completed: (tasks || []).filter(t => t.completed)
    };
  }, [tasks]);

  const containerLoader = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemLoader = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <main className="p-6 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-10">
        
        <motion.header variants={itemLoader} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                  <span className="material-symbols-outlined text-primary text-3xl">event_upcoming</span>
               </div>
               <h2 className="text-4xl font-black uppercase tracking-tighter text-white font-headline">Operations Center</h2>
            </div>
            <p className="text-on-surface-variant font-medium text-sm pl-16">Design your academic strategy. Visualize your deadlines. Execute with speed.</p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
             <p className="text-[0.6rem] font-black uppercase tracking-widest text-on-surface-variant mb-1">UNFINISHED MISSIONS</p>
             <p className="text-2xl font-black text-white font-headline leading-none">{(tasks || []).filter(t => !t.completed).length}</p>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* New Mission Creator */}
          <motion.div variants={itemLoader} className="lg:col-span-4 self-start sticky top-6">
            <div className="bg-surface-container/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <h3 className="text-[0.7rem] font-black uppercase tracking-[0.4em] mb-8 text-primary flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                 Initiate Mission
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Mission Objective</label>
                  <input 
                    type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0b1326]/60 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary focus:bg-[#0b1326] outline-none transition-all placeholder:text-surface-variant/40"
                    placeholder="e.g. Finish Algorithm Lab 4"
                  />
                </div>

                <div>
                  <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Target Subject</label>
                  <select 
                    required value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full bg-[#0b1326]/60 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary focus:bg-[#0b1326] outline-none text-white appearance-none"
                  >
                    <option value="">Select Target...</option>
                    {(subjects || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Deadline Date</label>
                     <input 
                       type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                       className="w-full bg-[#0b1326]/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white uppercase text-center"
                     />
                  </div>
                  <div>
                     <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Urgency Rank</label>
                     <select 
                       value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                       className="w-full bg-[#0b1326]/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white text-center appearance-none cursor-pointer"
                     >
                       <option value="high">Critical</option>
                       <option value="medium">Standard</option>
                       <option value="low">Backlog</option>
                     </select>
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-indigo-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.25em] text-white transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.98] mt-6 group-hover:bg-indigo-400 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                   Schedule Deployment
                </button>
              </form>
              
              <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
            </div>
          </motion.div>

          {/* Operation Logs / Task Feed */}
          <div className="lg:col-span-8 space-y-12">
            {['today', 'upcoming', 'completed'].map(category => (
              <motion.section variants={itemLoader} key={category} className="relative">
                <div className="flex items-center gap-4 mb-6">
                   <div className={`w-2 h-2 rounded-full ${category === 'today' ? 'bg-primary shadow-[0_0_10px_rgba(79,70,229,1)]' : category === 'upcoming' ? 'bg-amber-400' : 'bg-secondary'}`}></div>
                   <h4 className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-on-surface-variant">
                     {category} Operations <span className="opacity-40 mx-2">—</span> <span className="text-white">{sortedTasks[category].length}</span>
                   </h4>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {sortedTasks[category].length === 0 ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 border border-dashed border-white/5 rounded-3xl text-center flex flex-col items-center">
                          <span className="material-symbols-outlined text-white/5 text-5xl mb-2">radar</span>
                          <p className="text-[0.65rem] font-medium text-white/20 uppercase tracking-[0.2em] italic">No active signatures detected in this sector.</p>
                       </motion.div>
                    ) : sortedTasks[category].map(task => {
                      const sub = subjects.find(s => s.id == task.subjectId);
                      const theme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.medium;
                      return (
                        <motion.div 
                          layout key={task.id} initial={{ opacity: 0, x: -20, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.95 }}
                          className={`bg-surface-container/20 group backdrop-blur-sm border border-white/5 p-5 rounded-3xl flex items-center gap-5 hover:border-white/20 transition-all ${task.completed ? 'opacity-50' : 'hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)]'}`}
                        >
                          <button 
                            onClick={() => toggleTask(task.id, task.completed)} 
                            className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-secondary border-secondary' : 'border-outline-variant/60 hover:border-primary shadow-inner'}`}
                          >
                            {task.completed && <span className="material-symbols-outlined text-[1.1rem] text-[#0b1326] font-black">check</span>}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                             <p className={`font-bold text-white text-base group-hover:text-primary transition-colors truncate ${task.completed ? 'line-through opacity-40' : ''}`}>{task.title}</p>
                             <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                               <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-white/80 transition-colors">
                                  <span className="material-symbols-outlined text-[12px] opacity-60">bookmark</span>
                                  <p className="text-[0.65rem] font-black uppercase tracking-widest">{sub?.name || 'General Mapping'}</p>
                               </div>
                               <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[0.55rem] font-black uppercase tracking-tighter ${theme.cls} ${theme.glow}`}>
                                   <span className="material-symbols-outlined text-[11px] leading-none">{theme.icon}</span>
                                   {task.priority}
                               </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-4">
                             <div className="hidden sm:flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                                <p className="text-[0.5rem] font-bold uppercase tracking-widest lining-nums">Mission Deadline</p>
                                <p className="text-xs font-black text-white font-headline mt-0.5">{task.deadline || 'NO DATE'}</p>
                             </div>
                             <button onClick={() => deleteTask(task.id)} className="w-10 h-10 bg-error/5 hover:bg-error/20 border border-error/10 text-error rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                               <span className="material-symbols-outlined text-lg">delete_sweep</span>
                             </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Planner;
