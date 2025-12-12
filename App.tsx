import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Catalog from './pages/Catalog';
import Warnings from './pages/Warnings';
import Changes from './pages/Changes';
import Compare from './pages/Compare';
import Settings from './pages/Settings';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DragDropOverlay from './components/DragDropOverlay';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <DragDropOverlay />
          <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-200">
            <Sidebar 
              isCollapsed={isSidebarCollapsed} 
              toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
              <div className="max-w-7xl mx-auto p-4 md:p-8 h-screen overflow-hidden flex flex-col">
                <Routes>
                  <Route path="/" element={<Catalog />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/warnings" element={<Warnings />} />
                  <Route path="/changes" element={<Changes />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;