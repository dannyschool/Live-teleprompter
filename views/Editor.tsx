import React, { useState, useEffect } from 'react';
import { Script } from '../types';
import { enhanceScript } from '../services/geminiService';
import { Icons } from '../components/Icon';

interface EditorProps {
  initialScript?: Script;
  onSave: (script: Script) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ initialScript, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialScript) {
      setTitle(initialScript.title);
      setContent(initialScript.content);
    } else {
        setTitle('New Script');
    }
  }, [initialScript]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    const script: Script = {
      id: initialScript?.id || crypto.randomUUID(),
      title,
      content,
      createdAt: initialScript?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSave(script);
  };

  const handleAiEnhance = async (tone: 'engaging' | 'professional') => {
    if (!content.trim()) return;
    setIsProcessing(true);
    setAiError(null);
    try {
      const enhanced = await enhanceScript(content, tone);
      setContent(enhanced);
    } catch (err) {
      setAiError("Couldn't connect to AI. Check API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-darker">
      <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onCancel} className="text-gray-500 dark:text-gray-400 p-2 -ml-2">
          <Icons.ChevronLeft />
        </button>
        <h2 className="font-semibold text-lg dark:text-white">
            {initialScript ? 'Edit Script' : 'Create Script'}
        </h2>
        <button 
          onClick={handleSave}
          disabled={!title.trim()}
          className="text-primary font-medium px-2 disabled:opacity-50"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Script Title"
          className="text-xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:text-white"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
                onClick={() => handleAiEnhance('engaging')}
                disabled={isProcessing || !content}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-lg whitespace-nowrap transition-colors hover:bg-purple-200"
            >
                <Icons.Sparkles />
                {isProcessing ? 'Thinking...' : 'Make Engaging'}
            </button>
             <button 
                onClick={() => handleAiEnhance('professional')}
                disabled={isProcessing || !content}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg whitespace-nowrap transition-colors hover:bg-blue-200"
            >
                <Icons.Sparkles />
                {isProcessing ? 'Thinking...' : 'Make Professional'}
            </button>
        </div>

        {aiError && (
            <div className="text-red-500 text-xs p-2 bg-red-50 dark:bg-red-900/10 rounded">
                {aiError}
            </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your script here..."
          className="flex-1 w-full resize-none bg-gray-50 dark:bg-gray-800/50 dark:text-gray-200 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};
