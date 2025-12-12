import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const Dashboard: React.FC = () => {
  const { tablets } = useData();

  // Stats Logic
  const stats = useMemo(() => {
    const total = tablets.length;
    const active = tablets.filter(t => t.Status !== 'DISCONTINUED').length;
    const displays = tablets.filter(t => t.Type === 'PENDISPLAY').length;
    const penTablets = tablets.filter(t => t.Type === 'PENTABLET').length;
    
    // Brand Distribution
    const brandCounts: Record<string, number> = {};
    tablets.forEach(t => {
      brandCounts[t.Brand] = (brandCounts[t.Brand] || 0) + 1;
    });
    const brandData = Object.keys(brandCounts).map(key => ({ name: key, value: brandCounts[key] }));

    // Year Distribution
    const yearCounts: Record<string, number> = {};
    tablets.forEach(t => {
      if (t.LaunchYear) {
        yearCounts[t.LaunchYear] = (yearCounts[t.LaunchYear] || 0) + 1;
      }
    });
    const yearData = Object.keys(yearCounts)
      .sort()
      .map(key => ({ name: key, value: yearCounts[key] }));

    return { total, active, displays, penTablets, brandData, yearData };
  }, [tablets]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 mt-1">Overview of the tablet database ecosystem.</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Total Models</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Active Models</p>
          <p className="text-3xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Pen Displays</p>
          <p className="text-3xl font-bold text-primary-400">{stats.displays}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Pen Tablets</p>
          <p className="text-3xl font-bold text-purple-400">{stats.penTablets}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Brand Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Models by Brand</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.brandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Release Timeline */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Releases per Year</h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.yearData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.yearData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;