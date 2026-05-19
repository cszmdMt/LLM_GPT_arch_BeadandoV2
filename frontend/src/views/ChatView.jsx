import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Send, Sparkles, Loader2, Bot, User, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatView = ({ 
  files, 
  handleFileChange, 
  handleUpload, 
  isUploading, 
  uploadStatus, 
  messages, 
  input, 
  setInput, 
  handleChat, 
  isThinking, 
  messagesEndRef 
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl h-[calc(100vh-140px)] mt-24 mb-6 overflow-hidden">
      
      {/* Upload Section */}
      <div className="flex flex-col gap-6 w-full lg:w-[380px] h-full shrink-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-3xl flex flex-col h-full shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-300">
              <UploadCloud className="w-6 h-6" /> Adatforrás
            </h2>
            {files.length > 0 && (
              <span className="text-xs font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                {files.length} fájl
              </span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <label className="relative border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group bg-black/40 min-h-[160px]">
              <input type="file" multiple accept=".pdf" className="hidden" onChange={handleFileChange} />
              <div className="bg-blue-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 mb-3 border border-blue-500/20">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-400 group-hover:text-blue-300 transition-colors text-center">
                PDF dokumentumok tallózása
              </p>
            </label>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {files.length > 0 ? (
                files.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <FileText className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-300 truncate flex-1" title={file.name}>
                      {file.name}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                   <Bot className="w-12 h-12" />
                   <p className="text-xs italic text-center px-4">Tölts fel dokumentumot az elemzés megkezdéséhez</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isUploading ? 'Feldolgozás...' : 'Adatok Betöltése'}
              </button>

              <AnimatePresence>
                {uploadStatus === 'success' && (
                  <motion.div initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} exit={{ opacity: 0 }} className="text-green-400 text-xs font-bold flex items-center gap-2 justify-center mt-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="w-4 h-4" /> DOKUMENTUM AKTÍV
                  </motion.div>
                )}
                {uploadStatus === 'error' && (
                  <motion.div initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-bold flex items-center gap-2 justify-center mt-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    HIBA A FELTÖLTÉSNÉL
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-3xl flex-1 flex flex-col shadow-2xl border border-white/10 overflow-hidden h-full"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-6 opacity-40">
              <div className="p-6 bg-white/5 rounded-full border border-white/5 animate-pulse">
                <Bot className="w-20 h-20" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">CsizIskola Intelligens Asszisztens</p>
                <p className="text-sm">Kérdezz bármit a betöltött adatokról</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-purple-600 shadow-purple-600/20'}`}>
                  {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-blue-600/10 border border-blue-500/20 rounded-tr-none text-blue-50' : 'bg-white/5 border border-white/10 rounded-tl-none text-gray-200 shadow-xl'}`}>
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          <AnimatePresence>
            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-3 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10">
          <form onSubmit={handleChat} className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={uploadStatus === 'success' ? "Kérdésed a dokumentummal kapcsolatban..." : "Tölts fel egy dokumentumot a chateléshez"} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                disabled={isThinking || uploadStatus !== 'success'}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isThinking || uploadStatus !== 'success'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatView;
