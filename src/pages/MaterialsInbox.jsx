import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const EFFECT_COLORS = {
  pdf: "bg-error/20 text-error border-error/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  image: "bg-secondary/20 text-secondary border-secondary/30 shadow-[0_0_15px_rgba(78,222,163,0.1)]",
  link: "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(79,70,229,0.1)]",
  note: "bg-indigo-400/20 text-indigo-400 border-indigo-400/30 shadow-[0_0_15px_rgba(129,140,248,0.1)]",
};

const TYPE_ICONS = {
  pdf: 'picture_as_pdf',
  image: 'image',
  link: 'link',
  note: 'description'
};

const MaterialsInbox = () => {
  const { addMaterial, materials, deleteMaterial, rawSubjects } = useAppContext();
  const [formData, setFormData] = useState({ 
    title: '', type: 'note', content: '', subjectId: '', unit: '', topic: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subjectId || !formData.unit || !formData.topic) {
      return toast.error('Fill critical signatures.');
    }
    
    setIsSubmitting(true);
    await addMaterial(formData);
    setFormData({ title: '', type: 'note', content: '', subjectId: '', unit: '', topic: '' });
    setIsSubmitting(false);
  };

  const groupedMaterials = useMemo(() => {
    const groups = {};
    (materials || []).forEach(mat => {
      const sub = rawSubjects.find(s => s.id == mat.subjectId)?.name || 'Unmapped Data';
      if (!groups[sub]) groups[sub] = {};
      if (!groups[sub][mat.unit]) groups[sub][mat.unit] = {};
      if (!groups[sub][mat.unit][mat.topic]) groups[sub][mat.unit][mat.topic] = [];
      groups[sub][mat.unit][mat.topic].push(mat);
    });
    return groups;
  }, [materials, rawSubjects]);

  const containerLoader = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemLoader = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <main className="p-6 lg:p-10 text-on-surface">
      <motion.div variants={containerLoader} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-10">

        <motion.header variants={itemLoader} className="flex items-center gap-6 border-b border-white/5 pb-10">
           <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <span className="material-symbols-outlined text-indigo-400 text-3xl">inventory_2</span>
           </div>
           <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white font-headline">Knowledge Archive</h2>
              <p className="text-on-surface-variant font-medium text-sm">Centralized node for all academic assets. Organized by subject hierarchies.</p>
           </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Asset Intake Form */}
          <motion.div variants={itemLoader} className="lg:col-span-4 self-start sticky top-6">
            <div className="bg-surface-container/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group">
              <h3 className="text-[0.7rem] font-black uppercase tracking-[0.4em] mb-8 text-indigo-400 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                 Ingest Asset
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Mapping Node (Subject)</label>
                  <select 
                    value={formData.subjectId} 
                    onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full bg-[#0b1326]/60 border border-white/10 text-sm px-4 py-3.5 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select Target...</option>
                    {(rawSubjects || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Unit</label>
                    <input 
                      type="text" placeholder="Unit X"
                      value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-[#0b1326]/60 border border-white/10 text-sm px-4 py-3.5 rounded-2xl focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Topic</label>
                    <input 
                      type="text" placeholder="Concept..."
                      value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full bg-[#0b1326]/60 border border-white/10 text-sm px-4 py-3.5 rounded-2xl focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Asset Label</label>
                  <input 
                    type="text" placeholder="Descriptive Title"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0b1326]/60 border border-white/10 text-sm px-4 py-3.5 rounded-2xl focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Asset Hash (Type)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['note', 'pdf', 'image', 'link'].map(type => (
                      <button 
                        key={type} type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`py-2.5 text-[0.65rem] font-black uppercase rounded-xl border transition-all ${
                          formData.type === type ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-white/5 text-on-surface-variant hover:border-white/10 bg-[#0b1326]/40'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Data Stream / URL</label>
                  <input 
                    type="text" placeholder="https://external-resource..."
                    value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-[#0b1326]/60 border border-white/10 text-sm px-4 py-3.5 rounded-2xl focus:border-indigo-500 outline-none"
                  />
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs mt-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Archiving...' : 'Commit to Archive'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Grouped Library Display */}
          <motion.div variants={itemLoader} className="lg:col-span-8 space-y-10">
            <div className="bg-surface-container/20 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-inner min-h-[500px]">
              <h3 className="text-[0.7rem] font-black uppercase tracking-[0.5em] mb-10 text-on-surface-variant pb-6 border-b border-white/5">
                 Master Repository Index
              </h3>

              {Object.keys(groupedMaterials).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                  <span className="material-symbols-outlined text-8xl mb-6">database</span>
                  <p className="font-headline font-black text-xl uppercase tracking-widest">Repository Empty</p>
                  <p className="text-[0.65rem] font-bold mt-2 uppercase tracking-widest">Awaiting Knowledge Ingestion Streams</p>
                </div>
              ) : (
                Object.entries(groupedMaterials).map(([subName, units]) => (
                  <motion.div layout key={subName} className="mb-12 last:mb-0">
                    <h4 className="text-white font-black uppercase text-lg tracking-tighter mb-6 flex items-center gap-4 group">
                       <div className="w-1 h-8 bg-indigo-500 rounded-full transition-all group-hover:h-10"></div>
                       {subName}
                    </h4>
                    
                    <div className="pl-6 space-y-10 border-l border-white/5">
                      {Object.entries(units).map(([unitName, topics]) => (
                        <div key={unitName}>
                           <div className="flex items-center gap-3 mb-6">
                              <span className="material-symbols-outlined text-indigo-400/60 text-sm">layers</span>
                              <h5 className="text-[#c7c4d8] font-bold text-xs uppercase tracking-[0.25em]">{unitName}</h5>
                           </div>
                           
                           <div className="pl-6 space-y-8">
                             {Object.entries(topics).map(([topicName, mats]) => (
                               <div key={topicName}>
                                  <div className="flex items-center gap-2 mb-4">
                                     <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full"></div>
                                     <p className="text-[0.6rem] font-black text-indigo-500/80 uppercase tracking-widest">Topic Signature: {topicName}</p>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                      {mats.map(mat => (
                                        <motion.div 
                                          layout key={mat.id} 
                                          initial={{ scale: 0.9, opacity: 0 }} 
                                          animate={{ scale: 1, opacity: 1 }}
                                          className="bg-[#0b1326]/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex items-center gap-4 hover:border-indigo-500/40 transition-all group/asset relative overflow-hidden"
                                        >
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover/asset:rotate-6 ${EFFECT_COLORS[mat.type] || EFFECT_COLORS.note}`}>
                                            <span className="material-symbols-outlined text-xl">{TYPE_ICONS[mat.type] || 'description'}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white group-hover/asset:text-indigo-400 transition-colors truncate mb-0.5 uppercase tracking-tight">{mat.title}</p>
                                            <a 
                                              href={mat.content} target="_blank" rel="noopener noreferrer"
                                              className="text-[0.6rem] text-indigo-500/60 hover:text-indigo-400 font-bold tracking-widest flex items-center gap-1 transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                              ACCESS STREAM
                                            </a>
                                          </div>
                                          <button 
                                            onClick={() => deleteMaterial(mat.id)}
                                            className="opacity-0 group-hover/asset:opacity-100 w-10 h-10 bg-error/5 text-error rounded-2xl border border-error/10 flex items-center justify-center transition-all hover:bg-error/20"
                                          >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                          </button>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </main>
  );
};

export default MaterialsInbox;
