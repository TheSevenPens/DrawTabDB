import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, AlertTriangle, Download, PanelLeftClose, PanelLeftOpen, History, GitCompare, Settings } from 'lucide-react';
import { useData, prepareTabletForExport } from '../contexts/DataContext';
import { useTabletWarnings } from '../hooks/useTabletWarnings';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { tablets, flaggedIds } = useData();
  const { stats: warningStats } = useTabletWarnings(tablets);

  const navItems = [
    { to: '/', icon: <Database size={20} />, label: 'Catalog' },
    { to: '/compare', icon: <GitCompare size={20} />, label: 'Compare', count: flaggedIds.length },
    { to: '/warnings', icon: <AlertTriangle size={20} />, label: 'Warnings', count: warningStats.total },
    { to: '/changes', icon: <History size={20} />, label: 'Changes' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const handleExport = () => {
    const exportData = {
      DrawingTablets: [...tablets]
        .sort((a, b) => {
          // 1. Sort by ModelBrand
          const brandA = (a.ModelBrand || '').toLowerCase();
          const brandB = (b.ModelBrand || '').toLowerCase();
          if (brandA < brandB) return -1;
          if (brandA > brandB) return 1;

          // 2. Sort by ModelId
          const modelIdA = (a.ModelId || '').toLowerCase();
          const modelIdB = (b.ModelId || '').toLowerCase();
          if (modelIdA < modelIdB) return -1;
          if (modelIdA > modelIdB) return 1;

          // 3. Sort by id
          const idA = (a.id || '').toLowerCase();
          const idB = (b.id || '').toLowerCase();
          if (idA < idB) return -1;
          if (idA > idB) return 1;

          return 0;
        })
        .map(t => prepareTabletForExport(t))
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drawtabdb-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex flex-col z-20 hidden md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-slate-200 dark:border-slate-800 transition-all`}>
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
            DrawTabDB
          </h1>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-primary-50 dark:bg-primary-600/10 text-primary-600 dark:text-primary-400 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <span className={`${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white"}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "" })}
                  </span>
                  {isCollapsed && item.count && item.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-primary-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                      {item.count > 9 ? '9+' : item.count}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.count && item.count > 0 ? (
                      <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        {item.count}
                      </span>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        {tablets.length > 0 && (
          <button
            onClick={handleExport}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-center gap-2 px-4'} bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium group`}
            title="Download database as JSON"
          >
            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            {!isCollapsed && <span>Export JSON</span>}
          </button>
        )}

        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;