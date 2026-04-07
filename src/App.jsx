import React, { Suspense, useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppContext } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import Login from './pages/Login';

// Lazy loaded page components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SubjectDetail = React.lazy(() => import('./pages/SubjectDetail'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

const FloatingAssistant = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Identity confirmed. System online for ${user?.user_metadata?.full_name?.split(' ')[0]}. How can I assist?` }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open, isTyping]);

  const handleSend = async (overrideText = null) => {
    const text = overrideText || inputVal;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputVal('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: 'Autonomous AI sub-routine is active. Deployment complete.' }]);
    }, 1000);
  };

  const quickActions = ["Plan my day", "Check upcoming tasks", "Show analytics"];

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             className="mb-4 w-[calc(100vw-3rem)] sm:w-96 max-w-md bg-[#0b1326]/95 border border-primary/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col"
             style={{ maxHeight: '60vh' }}
           >
             <div className="flex gap-2 items-center mb-4 border-b border-white/10 pb-3 shrink-0">
               <span className="material-symbols-outlined text-primary">smart_toy</span>
               <div>
                 <h4 className="font-bold text-sm text-white">Studynex AI Assistant</h4>
                 <p className="text-[0.55rem] text-primary uppercase font-black animate-pulse">Monitoring Global Threads</p>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto min-h-[200px] mb-4 space-y-3 pr-2 scrollbar-none flex flex-col">
                {messages.map((m, i) => (
                  <div key={i} className={`text-sm p-3 rounded-xl max-w-[85%] ${m.role === 'ai' ? 'bg-primary/10 text-white self-start border border-primary/20' : 'bg-primary text-white self-end'}`}>
                    <p>{m.text}</p>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-sm p-3 rounded-xl bg-primary/10 self-start border border-primary/20 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-75"></span>
                  </div>
                )}
                <div ref={endRef} />
             </div>

             <div className="flex gap-2 shrink-0">
               <input 
                 type="text" value={inputVal}
                 onChange={e => setInputVal(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Command the AI..." 
                 className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary" 
               />
               <button onClick={() => handleSend()} className="bg-primary text-white rounded-xl px-3 hover:bg-indigo-400">
                 <span className="material-symbols-outlined text-sm">send_spark</span>
               </button>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400 pointer-events-auto"
      >
        <span className="material-symbols-outlined text-3xl">{open ? 'close' : 'smart_toy'}</span>
      </motion.button>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAppContext();

  if (loading) return <PageLoader />;
  if (!user) return <Login />;

  return (
    <Router>
      <div className="flex min-h-screen text-on-surface relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen relative lg:pl-64 transition-all duration-300 w-full overflow-hidden">
          <TopAppBar />
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-4 pb-20 lg:pb-4 relative z-0">
             <Suspense fallback={<PageLoader />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/subject/:id" element={<SubjectDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
             </Suspense>
          </div>
          <FloatingAssistant />
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Toaster position="top-center" toastOptions={{ 
            duration: 3000, 
            className: 'font-headline font-bold text-sm tracking-wide !bg-surface-container-high !text-white !border !border-outline-variant/20 !shadow-2xl'
          }} 
        />
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
