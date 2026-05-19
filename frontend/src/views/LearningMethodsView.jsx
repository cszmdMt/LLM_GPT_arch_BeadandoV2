import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  MessageSquare, 
  Layers, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  Send, 
  Bot, 
  User, 
  RefreshCw,
  HelpCircle,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import axios from 'axios';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const BACKEND_URL = 'http://localhost:8000';

// Mermaid Component
const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter',
      mindmap: {
        useMaxWidth: false, // Allow it to be larger than container for zooming
      }
    });
  }, []);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid flex justify-center items-center min-h-full" ref={ref}>
      {chart}
    </div>
  );
};

// Flashcard Component
const Flashcard = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full h-80 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div 
        className="relative w-full h-full transition-all duration-500"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front - Question */}
        <div 
          className="absolute inset-0 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl bg-gradient-to-br from-indigo-900/20 to-transparent"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <HelpCircle className="w-12 h-12 text-indigo-400 mb-6 opacity-40" />
          <h3 className="text-xl font-bold text-white leading-snug">{card.question}</h3>
          <p className="text-xs font-bold text-indigo-400 mt-6 uppercase tracking-widest">Kattints a válaszért</p>
        </div>
        
        {/* Back - Answer */}
        <div 
          className="absolute inset-0 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-purple-500/20 shadow-2xl bg-gradient-to-br from-purple-900/20 to-transparent"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="prose prose-invert prose-sm">
            <p className="text-lg text-gray-200 leading-relaxed font-medium">{card.answer}</p>
          </div>
          <p className="text-xs font-bold text-purple-400 mt-6 uppercase tracking-widest">Kattints a kérdéshez</p>
        </div>
      </motion.div>
    </div>
  );
};

const LearningMethodsView = ({ uploadStatus }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Socratic Chat State
  const [socraticInput, setSocraticInput] = useState('');
  const [socraticMessages, setSocraticMessages] = useState([]);

  const methods = [
    {
      id: 'mindmap',
      title: 'Dinamikus Gondolattérkép',
      desc: 'Vizuális áttekintés a tananyag szerkezetéről és a fogalmak közötti kapcsolatokról.',
      icon: <Network className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      action: async () => {
        setLoading(true);
        try {
          const res = await axios.post(`${BACKEND_URL}/generate-mindmap`);
          setData(res.data.code);
        } catch (e) { console.error(e); }
        setLoading(false);
      }
    },
    {
      id: 'socratic',
      title: 'Szókratészi Súgó',
      desc: 'Interaktív rávezető asszisztens, amely segít a saját logikáddal eljutni a megoldásig.',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'from-emerald-500 to-teal-500',
      action: () => {
        setData([]);
        setSocraticMessages([{ role: 'bot', content: 'Szia! Melyik témakörrel kapcsolatban akadtál el? Ne várd a kész választ, de segítek rájönni!' }]);
      }
    },
    {
      id: 'flashcards',
      title: 'Intelligens Tanulókártyák',
      desc: 'Gyors, ismétlésen alapuló memorizálás interaktív, forgatható kártyákkal.',
      icon: <Layers className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      action: async () => {
        setLoading(true);
        try {
          const res = await axios.post(`${BACKEND_URL}/generate-flashcards`);
          setData(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
      }
    }
  ];

  const handleSelect = (method) => {
    setSelectedMethod(method);
    method.action();
  };

  const handleSocraticSubmit = async (e) => {
    e.preventDefault();
    if (!socraticInput.trim() || loading) return;

    const userMsg = { role: 'user', content: socraticInput };
    setSocraticMessages(prev => [...prev, userMsg]);
    setSocraticInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/socratic-hint`, { question: userMsg.content });
      setSocraticMessages(prev => [...prev, { role: 'bot', content: res.data.hint }]);
    } catch (e) {
      console.error(e);
      setSocraticMessages(prev => [...prev, { role: 'bot', content: 'Sajnos hiba történt a generálás során.' }]);
    }
    setLoading(false);
  };

  if (uploadStatus !== 'success') {
    return (
      <div className="mt-32 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-[2rem] max-w-2xl border border-white/10 mx-auto">
        <div className="p-4 bg-emerald-500/10 rounded-full mb-6">
          <Sparkles className="w-12 h-12 text-emerald-500 opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Módszertanok aktiválása</h2>
        <p className="text-gray-400">A tanulást segítő módszerek eléréséhez kérlek tölts fel egy PDF dokumentumot a Vezérlőpulton.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-24 mb-12 px-4">
      <AnimatePresence mode="wait">
        {!selectedMethod ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {methods.map((m) => (
              <motion.div 
                key={m.id}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-panel p-8 rounded-[2rem] border border-white/10 flex flex-col gap-6 shadow-2xl relative overflow-hidden group cursor-pointer"
                onClick={() => handleSelect(m)}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${m.color} opacity-5 blur-[60px] group-hover:opacity-10 transition-opacity`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  {m.icon}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{m.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{m.desc}</p>
                </div>

                <button className="mt-auto flex items-center gap-2 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Kiválasztás <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8 h-[calc(100vh-180px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between glass-panel px-8 py-4 rounded-2xl border border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedMethod(null); setData(null); }}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="h-8 w-[1px] bg-white/10" />
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {selectedMethod.icon} {selectedMethod.title}
                </h2>
              </div>
              {loading && <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />}
            </div>

            {/* Content Area */}
            <div className="flex-1 glass-panel rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl">
              {loading && !data && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
                  <p className="text-gray-300 font-medium">Generálás folyamatban...</p>
                </div>
              )}

              <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                {/* MINDMAP VIEW */}
                {selectedMethod.id === 'mindmap' && data && (
                  <div className="relative h-full w-full bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                    <TransformWrapper
                      initialScale={1}
                      minScale={0.5}
                      maxScale={4}
                      centerOnInit={true}
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                            <button onClick={() => zoomIn()} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 transition-all"><ZoomIn className="w-5 h-5" /></button>
                            <button onClick={() => zoomOut()} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 transition-all"><ZoomOut className="w-5 h-5" /></button>
                            <button onClick={() => resetTransform()} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 transition-all"><Maximize className="w-5 h-5" /></button>
                          </div>
                          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                            <div className="p-20 flex items-center justify-center min-w-[1000px] min-h-[800px]">
                              <Mermaid chart={data} />
                            </div>
                          </TransformComponent>
                        </>
                      )}
                    </TransformWrapper>
                  </div>
                )}

                {/* SOCRATIC VIEW */}
                {selectedMethod.id === 'socratic' && (
                  <div className="flex flex-col h-full max-w-4xl mx-auto">
                    <div className="flex-1 space-y-6 mb-6">
                      {socraticMessages.map((msg, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                            {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                          </div>
                          <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-50' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <form onSubmit={handleSocraticSubmit} className="mt-auto relative flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10">
                      <input 
                        type="text" 
                        value={socraticInput}
                        onChange={(e) => setSocraticInput(e.target.value)}
                        placeholder="Miben segíthetek rávezetni?" 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white p-4"
                        disabled={loading}
                      />
                      <button 
                        type="submit"
                        disabled={loading || !socraticInput.trim()}
                        className="p-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white rounded-xl transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* FLASHCARDS VIEW */}
                {selectedMethod.id === 'flashcards' && data && (
                  <div className="max-w-xl mx-auto py-12">
                     <div className="grid grid-cols-1 gap-8">
                        {data.map((card, i) => (
                          <Flashcard key={i} card={card} />
                        ))}
                     </div>
                     <div className="mt-12 flex justify-center">
                        <button 
                          onClick={selectedMethod.action}
                          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                        >
                          <RefreshCw className="w-4 h-4" /> Kártyák frissítése
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningMethodsView;
