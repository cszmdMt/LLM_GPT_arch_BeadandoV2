import { motion } from 'framer-motion';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AnalysisView = ({ summary, isAnalyzing, uploadStatus }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-20 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              <Sparkles className="w-8 h-8 text-purple-400" /> Intelligens Dokumentum Elemzés
            </h1>
            <p className="text-gray-400 mt-2">Vezetői összefoglaló és kulcsfontosságú felismerések</p>
          </div>
          
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Aktív Dokumentum
            </div>
          )}
        </div>

        <div className="min-h-[400px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
                <div className="absolute inset-0 w-16 h-16 bg-purple-500/20 blur-xl animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-gray-200">Elemzés folyamatban...</p>
                <p className="text-sm text-gray-500 mt-2">A neurális hálózat feldolgozza a dokumentum tartalmát</p>
              </div>
            </div>
          ) : summary ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose prose-invert prose-purple max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:text-gray-300
                prose-strong:text-purple-300
                prose-blockquote:border-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
            >
              <ReactMarkdown>{summary}</ReactMarkdown>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 text-center space-y-4">
              <div className="p-6 rounded-full bg-white/5 border border-white/10">
                <AlertCircle className="w-12 h-12 opacity-20" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-400">Nincs elérhető elemzés</p>
                <p className="text-sm max-w-xs mx-auto mt-2">
                  Kérlek, tölts fel egy PDF-dokumentumot a vezérlőpulton az automatikus elemzés indításához.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisView;
