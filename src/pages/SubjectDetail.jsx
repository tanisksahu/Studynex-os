import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { validateMaterialTitle, validateFile } from '../utils/validation';
import { motion } from 'framer-motion';

const SubjectDetail = () => {
  const { id } = useParams();
  const { subjects, getMaterials, addMaterial, deleteMaterial, loadSubjectMaterials, dataLoading } = useAppContext();
  const [subject, setSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Load subject and materials on mount
  useEffect(() => {
    const sub = subjects.find(s => s.id === id);
    if (sub) {
      setSubject(sub);
      // Load materials for this subject
      loadSubjectMaterials(id);
    }
  }, [id, subjects, loadSubjectMaterials]);

  // Update materials when they change
  useEffect(() => {
    const mats = getMaterials(id);
    setMaterials(mats);
  }, [id, getMaterials]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file silently
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        setFileError(validation.error);
        setFile(null);
      } else {
        setFileError('');
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');

    // Validate title
    const titleValidation = validateMaterialTitle(title);
    if (!titleValidation.valid) {
      setUploadError(titleValidation.error);
      return;
    }

    // Require at least a title
    if (!title.trim()) {
      setUploadError('Please enter a material title');
      return;
    }

    try {
      setIsUploading(true);
      await addMaterial(id, { title: title.trim() }, file);
      setTitle('');
      setFile(null);
      setFileError('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId, fileUrl) => {
    if (window.confirm('Delete this material? This cannot be undone.')) {
      await deleteMaterial(id, materialId, fileUrl);
    }
  };

  if (!subject) {
    return (
      <div className="p-10 text-white font-black uppercase text-center opacity-40">
        <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
        Modular Sector Unknown...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{subject.name}</h1>
          <p className="text-primary font-bold uppercase tracking-widest text-xs">Subject Material Repository</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container/50 p-6 rounded-[2.5rem] border border-white/5 h-fit"
        >
          <h3 className="text-sm font-black uppercase text-white tracking-widest mb-6">Archive New Asset</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-[0.6rem] font-black uppercase text-on-surface-variant tracking-widest mb-2 block">
                Asset Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setUploadError('');
                }}
                placeholder="Lecture Notes Week 1"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-[0.6rem] font-black uppercase text-on-surface-variant tracking-widest mb-2 block">
                File Payload (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[0.6rem] file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-indigo-400"
                disabled={isUploading}
              />
              {fileError && <p className="text-error text-xs mt-2">{fileError}</p>}
              {file && (
                <p className="text-on-surface-variant text-xs mt-2">
                  📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            {uploadError && <p className="text-error text-xs">{uploadError}</p>}

            <button
              type="submit"
              disabled={isUploading || dataLoading || !title.trim()}
              className="w-full bg-primary py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Synchronizing...' : 'Upload Asset'}
            </button>
          </form>
        </motion.div>

        {/* Materials List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <h3 className="text-sm font-black uppercase text-white tracking-widest mb-6">Stored Materials ({materials.length})</h3>

          {materials.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-[2.5rem] opacity-30">
              <span className="material-symbols-outlined text-4xl block mb-2">inbox</span>
              <p className="font-bold text-xs uppercase tracking-widest">Repository empty. Upload assets to initialize.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {materials.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-surface-container/20 p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary shrink-0">
                      <span className="material-symbols-outlined text-sm">description</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-black text-white uppercase tracking-tight text-sm truncate">
                        {m.title}
                      </h5>
                      <p className="text-[0.6rem] font-bold text-on-surface-variant uppercase">
                        {new Date(m.createdAt).toLocaleDateString()}
                        {m.fileSize && ` • ${(m.fileSize / 1024 / 1024).toFixed(2)}MB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {m.content && (
                      <a
                        href={m.content}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/5 p-3 rounded-xl hover:bg-primary hover:text-white transition-all"
                        title="Download"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteMaterial(m.id, m.content)}
                      className="bg-white/5 p-3 rounded-xl hover:bg-error hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Delete material"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubjectDetail;
