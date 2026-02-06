
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const gpaRanges = [
    { name: '0-1.0', count: students.filter(s => s.gpa < 1).length },
    { name: '1-2.0', count: students.filter(s => s.gpa >= 1 && s.gpa < 2).length },
    { name: '2-3.0', count: students.filter(s => s.gpa >= 2 && s.gpa < 3).length },
    { name: '3-4.0', count: students.filter(s => s.gpa >= 3).length },
  ];

  const deptCounts = students.reduce((acc, s) => {
    acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ 
    name: name.split(' ')[0], // Shorten names for charts
    value 
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8">
      <div className="bg-white p-5 lg:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight">GPA Performance</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Distribution across grades</p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-xl">
             <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
        </div>
        <div className="h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gpaRanges} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={isMobile ? 30 : 50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 lg:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight">Academic Split</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Departmental allocation</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-xl">
             <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          </div>
        </div>
        <div className="h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 50 : 65}
                outerRadius={isMobile ? 75 : 95}
                fill="#8884d8"
                paddingAngle={8}
                dataKey="value"
                label={({ percent }) => isMobile ? '' : `${(percent * 100).toFixed(0)}%`}
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
