import React from 'react';
import { Script } from '../types';
import { Icons } from '../components/Icon';

interface DashboardProps {
  scripts: Script[];
  onEdit: (id: string) => void;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  scripts,
  onEdit,
  onPlay,
  onDelete,
  onCreate,
  onToggleTheme,
  isDarkMode,
}) => {
  return (
    <div className="h-full flex flex-col p-4 md:max-w-2xl md:mx-auto">
      <header className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          StreamPrompt
        </h1>
        <button onClick={onToggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {scripts.length === 0 ? (
          <div className="text-center mt-20 opacity-50">
            <p className="text-lg mb-4">No scripts yet.</p>
            <p className="text-sm">Tap the + button to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                      {script.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last edited: {new Date(script.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-10">
                  {script.content}
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDelete(script.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                    <button
                      onClick={() => onEdit(script.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Icons.Pencil />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onPlay(script.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-full font-medium shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
                  >
                    <Icons.Play />
                    <span>Prompter</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onCreate}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-secondary to-pink-600 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-10"
      >
        <Icons.Plus />
      </button>
    </div>
  );
};
