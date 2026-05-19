import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, ChevronRight, Loader2, AlertTriangle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = 'http://localhost:8000';

const QuizView = ({ uploadStatus }) => {
  const [step, setStep] = useState('setup'); // setup, loading, quiz, result
  const [config, setConfig] = useState({ count: 5, difficulty: 2 });
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/quiz-results`);
      setHistory(res.data);
    } catch (error) {
      console.error("Hiba a korábbi eredmények betöltésekor", error);
    }
  };

  const startQuiz = async () => {
    setStep('loading');
    try {
      const res = await axios.post(`${BACKEND_URL}/generate-quiz`, config);
      setQuestions(res.data);
      setCurrentIndex(0);
      setScore(0);
      setWrongAnswers([]);
      setStep('quiz');
    } catch (error) {
      console.error("Hiba a kvíz generálásakor", error);
      setStep('setup');
      alert("Hiba történt a kvíz generálása során. Ellenőrizd, hogy feltöltöttél-e dokumentumot!");
    }
  };

  const handleAnswer = (selectedOption) => {
    if (feedback) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setWrongAnswers(prev => [...prev, {
        question: currentQuestion.question,
        user_answer: selectedOption,
        correct_answer: currentQuestion.correct_answer
      }]);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishQuiz(isCorrect);
      }
    }, 1500);
  };

  const finishQuiz = async (lastWasCorrect) => {
    setStep('result');
    
    // Calculate final score accurately
    const finalScore = lastWasCorrect ? score + 1 : score;
    const currentTopic = questions[0]?.topic || 'Vegyes témakör';
    
    try {
      await axios.post(`${BACKEND_URL}/quiz-results`, {
        topic: currentTopic,
        difficulty: config.difficulty,
        score: finalScore,
        total_questions: questions.length
      });
      fetchHistory();
    } catch (error) {
      console.error("Hiba az eredmény mentésekor", error);
    }
  };

  const getAnalysis = async () => {
    if (wrongAnswers.length === 0) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/quiz-analysis`, { wrong_answers: wrongAnswers });
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error("Hiba az elemzés során", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (step === 'result') {
        getAnalysis();
    }
  }, [step]);

  if (uploadStatus !== 'success' && step === 'setup') {
    return (
      <div className="mt-32 flex flex-col items-center justify-center text-center p-8 glass-panel rounded-3xl max-w-2xl border border-white/10 mx-auto">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6 opacity-50" />
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Nincs aktív dokumentum</h2>
        <p className="text-gray-400">A Tanulórendszer használatához előbb tölts fel egy PDF dokumentumot a Vezérlőpulton!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-24 mb-12 relative px-4">
      {/* Dynamic Background Glow */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-900/10 blur-[120px] pointer-events-none z-0" 
          />
        )}
        {feedback === 'incorrect' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-900/10 blur-[120px] pointer-events-none z-0" 
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {step === 'setup' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-600 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Interaktív Tanulórendszer</h1>
                <p className="text-gray-400">Teszteld a tudásod a dokumentum alapján</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-4 flex justify-between">
                  <span>Kérdések száma</span>
                  <span className="text-indigo-400 font-bold">{config.count} db</span>
                </label>
                <input 
                  type="range" min="3" max="15" value={config.count} 
                  onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-4">Nehézségi szint</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: 1, label: 'Bemelegítés', color: 'hover:border-green-500/50' },
                    { val: 2, label: 'Felkészültem', color: 'hover:border-indigo-500/50' },
                    { val: 3, label: 'Dolgozatszint', color: 'hover:border-red-500/50' }
                  ].map((level) => (
                    <button
                      key={level.val}
                      onClick={() => setConfig({...config, difficulty: level.val})}
                      className={`p-4 rounded-xl border transition-all ${
                        config.difficulty === level.val 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-white/5 border-white/10 text-gray-400 ' + level.color
                      }`}
                    >
                      <span className="text-sm font-medium">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={startQuiz}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Kvíz Indítása
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center h-[400px] glass-panel rounded-3xl border border-white/10">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mb-6" />
            <p className="text-xl font-medium text-gray-200 animate-pulse">Kérdések generálása a dokumentumból...</p>
          </div>
        )}

        {step === 'quiz' && questions.length > 0 && (
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                {questions[currentIndex].topic || 'Általános'}
              </span>
              <span className="text-sm font-medium text-gray-500">
                Kérdés: {currentIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="w-full bg-white/5 h-1.5 rounded-full mb-10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="bg-indigo-500 h-full"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-10 leading-snug">
              {questions[currentIndex].question}
            </h2>

            <div className="space-y-4">
              {questions[currentIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={!!feedback}
                  className={`w-full p-5 rounded-2xl text-left transition-all border flex items-center justify-between group ${
                    feedback === 'correct' && option === questions[currentIndex].correct_answer
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : feedback === 'incorrect' && option === questions[currentIndex].correct_answer
                      ? 'bg-green-500/10 border-green-500/30 text-green-400/70'
                      : feedback === 'incorrect' && option !== questions[currentIndex].correct_answer
                      ? 'bg-red-500/10 border-red-500/50 text-red-300 opacity-50'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-base font-medium">{option}</span>
                  {feedback === 'correct' && option === questions[currentIndex].correct_answer && <CheckCircle2 className="w-5 h-5" />}
                  {feedback === 'incorrect' && option !== questions[currentIndex].correct_answer && <XCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl text-center"
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]" />
              <h1 className="text-4xl font-extrabold text-white mb-2">Kvíz Befejezve!</h1>
              <p className="text-gray-400 mb-8">Nézzük meg, hogyan sikerült:</p>
              
              <div className="flex justify-center gap-12 mb-10">
                <div className="text-center">
                  <p className="text-5xl font-black text-indigo-400">{score}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Helyes válasz</p>
                </div>
                <div className="text-center border-l border-white/10 pl-12">
                  <p className="text-5xl font-black text-gray-300">{questions.length}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Összes kérdés</p>
                </div>
              </div>

              <button 
                onClick={() => setStep('setup')}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-all"
              >
                Vissza a kezdőlapra
              </button>
            </motion.div>

            {wrongAnswers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-400" /> AI Elemzés és Mentorálás
                </h2>

                <div className="min-h-[200px]">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                      <p className="text-gray-400 animate-pulse">Hibák elemzése és tanácsok generálása...</p>
                    </div>
                  ) : analysis ? (
                    <div className="prose prose-invert prose-indigo max-w-none">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-8">Az elemzés hamarosan elkészül...</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Historical Results Section */}
        {step === 'setup' && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Eddig elért eredmények</h2>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((res, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-indigo-300 transition-colors">
                      {res.topic}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        res.difficulty === 1 ? 'text-green-400 border-green-500/20 bg-green-500/5' :
                        res.difficulty === 2 ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' :
                        'text-red-400 border-red-500/20 bg-red-500/5'
                      }`}>
                        {res.difficulty === 1 ? 'Bemelegítés' : res.difficulty === 2 ? 'Felkészültem' : 'Dolgozatszint'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(res.created_at).toLocaleDateString('hu-HU')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-indigo-400">{res.score}</span>
                      <span className="text-gray-600 font-bold">/</span>
                      <span className="text-lg font-bold text-gray-400">{res.total_questions}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Pontszám</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
