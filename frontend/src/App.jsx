import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import ChatView from './views/ChatView';
import AnalysisView from './views/AnalysisView';
import QuizView from './views/QuizView';
import LearningMethodsView from './views/LearningMethodsView';

const BACKEND_URL = 'http://localhost:8000';

function App() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('success');
      handleAnalyze();
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/analyze`);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Hiba az elemzés során", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content })
      });

      if (!response.ok) throw new Error("Hálózati hiba a chat során");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let botMessage = { role: 'bot', content: '' };
      setMessages(prev => [...prev, botMessage]);
      setIsThinking(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botMessage.content += parsed.text;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { ...botMessage };
                  return newMsgs;
                });
              }
            } catch (err) {
              console.error("SSE Parse Error", err);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "Sajnos hiba történt a válaszadás során." }]);
      setIsThinking(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center p-4 md:p-8 font-sans">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        </div>

        <Navbar />

        <Routes>
          <Route path="/" element={
            <ChatView 
              files={files}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
              isUploading={isUploading}
              uploadStatus={uploadStatus}
              messages={messages}
              input={input}
              setInput={setInput}
              handleChat={handleChat}
              isThinking={isThinking}
              messagesEndRef={messagesEndRef}
            />
          } />
          <Route path="/analysis" element={
            <AnalysisView 
              summary={summary}
              isAnalyzing={isAnalyzing}
              uploadStatus={uploadStatus}
            />
          } />
          <Route path="/quiz" element={
            <QuizView 
              uploadStatus={uploadStatus}
            />
          } />
          <Route path="/learning-methods" element={
            <LearningMethodsView 
              uploadStatus={uploadStatus}
            />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
