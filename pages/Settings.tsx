import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Palette } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure application preferences and appearance.</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette size={18} className="text-primary-500" />
                      Appearance
                  </h3>
              </div>
              <div className="p-6">
                  <div className="flex items-center justify-between">
                      <div className="space-y-1">
                          <p className="font-medium text-slate-900 dark:text-white">Theme Mode</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                              {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                          </p>
                      </div>
                      
                      <button 
                        onClick={toggleTheme}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                            theme === 'dark' 
                                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600' 
                                : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="font-medium text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;