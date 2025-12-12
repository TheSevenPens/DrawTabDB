import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileJson, CheckCircle, XCircle, FileWarning } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Tablet } from '../types';

const DragDropOverlay: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { setTablets } = useData();

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDragEnter = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we are leaving the window (relatedTarget is null)
    if (!e.relatedTarget) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Get the file
    const files = (e as React.DragEvent).dataTransfer ? (e as React.DragEvent).dataTransfer.files : (e as DragEvent).dataTransfer?.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            
            // Basic validation
            let newTablets: any[] = [];
            if (Array.isArray(json)) {
              newTablets = json;
            } else if (json.DrawingTablets && Array.isArray(json.DrawingTablets)) {
              newTablets = json.DrawingTablets;
            } else {
              throw new Error("Invalid JSON structure. Expected array or object with DrawingTablets property.");
            }

            if (newTablets.length === 0) {
               throw new Error("No tablet data found in file.");
            }

            // Check if items look like tablets (check for Brand property)
            if (!newTablets[0].Brand) {
              throw new Error("Data does not look like tablet data (missing Brand field).");
            }

            // Pass as Partial<Tablet>[] because setTablets now accepts that and handles ID generation
            setTablets(newTablets as Partial<Tablet>[]);
            setNotification({ type: 'success', message: `Successfully loaded ${newTablets.length} tablets.` });
          } catch (err: any) {
            setNotification({ type: 'error', message: err.message || "Failed to parse JSON file." });
          }
        };
        reader.readAsText(file);
      } else {
        setNotification({ type: 'error', message: "Please drop a JSON file." });
      }
    }
  }, [setTablets]);

  // Attach global listeners for window-wide drag and drop
  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  if (!isDragging && !notification) return null;

  return (
    <>
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-none">
          <div className="bg-slate-900 border-2 border-dashed border-primary-500 rounded-3xl p-12 text-center max-w-lg w-full shadow-2xl shadow-primary-500/20 animate-pulse">
            <div className="w-24 h-24 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Drop JSON File</h2>
            <p className="text-slate-400 text-lg">
              Release to update the tablet database.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm bg-slate-800/50 py-2 px-4 rounded-full inline-flex">
              <FileJson size={16} />
              <span>Supported: .json</span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-slide-up ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/30 text-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={24} /> : <FileWarning size={24} />}
          <div>
            <p className="font-bold">{notification.type === 'success' ? 'Database Updated' : 'Import Failed'}</p>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DragDropOverlay;