import React, { useState, useEffect } from 'react';
import { Script, ViewState, EditorPayload, PrompterPayload } from './types';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Prompter } from './views/Prompter';
import { getScripts, saveScript, deleteScript, getScriptById, getSettings, saveSettings } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Load initial data
    setScripts(getScripts());
    const settings = getSettings();
    setIsDarkMode(settings.isDarkMode);
    
    // Initialize theme
    if (settings.isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const refreshScripts = () => {
    setScripts(getScripts());
  };

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    const currentSettings = getSettings();
    saveSettings({ ...currentSettings, isDarkMode: newMode });
  };

  // Navigation Handlers
  const handleCreateScript = () => {
    setActiveScriptId(null);
    setView('EDITOR');
  };

  const handleEditScript = (id: string) => {
    setActiveScriptId(id);
    setView('EDITOR');
  };

  const handlePlayScript = (id: string) => {
    setActiveScriptId(id);
    setView('PROMPTER');
  };

  const handleDeleteScript = (id: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      deleteScript(id);
      refreshScripts();
    }
  };

  const handleSaveScript = (script: Script) => {
    saveScript(script);
    refreshScripts();
    setView('DASHBOARD');
  };

  // Render Logic
  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return (
          <Dashboard
            scripts={scripts}
            onCreate={handleCreateScript}
            onEdit={handleEditScript}
            onPlay={handlePlayScript}
            onDelete={handleDeleteScript}
            onToggleTheme={handleThemeToggle}
            isDarkMode={isDarkMode}
          />
        );
      case 'EDITOR':
        const scriptToEdit = activeScriptId ? getScriptById(activeScriptId) : undefined;
        return (
          <Editor
            initialScript={scriptToEdit}
            onSave={handleSaveScript}
            onCancel={() => setView('DASHBOARD')}
          />
        );
      case 'PROMPTER':
        const scriptToPlay = activeScriptId ? getScriptById(activeScriptId) : undefined;
        if (!scriptToPlay) return <div>Error: Script not found</div>;
        return (
          <Prompter
            script={scriptToPlay}
            onClose={() => setView('DASHBOARD')}
          />
        );
      default:
        return <div>View Not Found</div>;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-darker">
      {renderView()}
    </div>
  );
};

export default App;
