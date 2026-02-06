
import React, { useState, useEffect, useMemo } from 'react';
import { Student, SortField, SortOrder } from './types';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import Dashboard from './components/Dashboard';
import { getAcademicInsights, generateSampleStudents } from './services/gemini';

type View = 'dashboard' | 'records' | 'ai' | 'settings';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('student_records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('student_records', JSON.stringify(students));
  }, [students]);

  const handleAddOrUpdate = (studentData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...studentData, id: s.id } : s));
    } else {
      const newStudent: Student = {
        ...studentData,
        id: crypto.randomUUID()
      };
      setStudents(prev => [...prev, newStudent]);
    }
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this record permanently?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    return students
      .filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (a[sortField] < b[sortField]) return -1 * factor;
        if (a[sortField] > b[sortField]) return 1 * factor;
        return 0;
      });
  }, [students, searchTerm, sortField, sortOrder]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const insights = await getAcademicInsights(students);
    setAiInsights(insights);
    setIsAnalyzing(false);
    setCurrentView('ai'); // Switch to AI view if not already there
  };

  const handleAddSampleData = async () => {
    setIsAnalyzing(true); // Reuse loader
    const samples = await generateSampleStudents();
    const newStudents: Student[] = samples.map(s => ({
      id: crypto.randomUUID(),
      name: s.name || 'John Doe',
      rollNumber: s.rollNumber || `CS-${Math.floor(Math.random() * 1000)}`,
      gpa: s.gpa || 3.0,
      department: s.department || 'Computer Science',
      email: `${s.name?.toLowerCase().replace(/\s/g, '.')}@university.edu`,
      status: 'Enrolled',
      enrollmentDate: new Date().toISOString().split('T')[0]
    }));
    setStudents(prev => [...prev, ...newStudents]);
    setIsAnalyzing(false);
  };

  const NavItem = ({ view, icon, label }: { view: View, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
        currentView === view 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={`${currentView === view ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}>
        {icon}
      </span>
      <span className="font-bold tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-8 sticky top-0 h-screen shrink-0 z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">RecordPro</span>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem 
            view="dashboard" 
            label="Overview" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} 
          />
          <NavItem 
            view="records" 
            label="Students" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} 
          />
          <NavItem 
            view="ai" 
            label="AI Insights" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} 
          />
          <NavItem 
            view="settings" 
            label="Settings" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-5 rounded-3xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Status</p>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
              <span className="text-sm text-slate-700 font-bold">Systems Operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Adaptive */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 lg:px-10 px-6 min-h-[72px] flex items-center justify-between shadow-sm">
          <div className="lg:hidden flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
            </div>
            <span className="font-black text-slate-900 tracking-tighter text-lg">RecordPro</span>
          </div>

          <div className="flex-1 max-w-xl lg:mx-0 mx-4">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Search database..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsFormOpen(true)}
               className="bg-indigo-600 text-white p-2.5 rounded-2xl lg:px-6 lg:py-3 flex items-center gap-2.5 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
               <span className="hidden lg:inline font-black text-xs uppercase tracking-widest">New Student</span>
             </button>
          </div>
        </header>

        {/* View Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-10 pb-28 lg:pb-10 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            {currentView === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                <div className="mb-10">
                  <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tightest">Dashboard</h1>
                  <p className="text-slate-500 font-medium text-lg">Central command for academic intelligence.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                  <StatCard label="Enrollment" value={students.length} color="indigo" />
                  <StatCard label="GPA Average" value={students.length > 0 ? (students.reduce((a, b) => a + b.gpa, 0) / students.length).toFixed(2) : '0.00'} color="emerald" />
                  <StatCard label="Distinction" value={students.filter(s => s.gpa >= 3.8).length} color="amber" />
                  <StatCard label="Faculties" value={new Set(students.map(s => s.department)).size} color="rose" />
                </div>

                <Dashboard students={students} />
              </div>
            )}

            {currentView === 'records' && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tightest">Database</h1>
                    <p className="text-slate-500 font-medium">Full management of academic credentials.</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={handleAddSampleData} className="flex-1 sm:flex-none text-sm font-bold text-slate-600 px-5 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                      Import Sample
                    </button>
                    <button onClick={handleAiAnalysis} className="flex-1 sm:flex-none text-sm font-bold text-white px-5 py-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      AI Audit
                    </button>
                  </div>
                </div>
                <StudentTable
                  students={filteredAndSortedStudents}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>
            )}

            {currentView === 'ai' && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out max-w-4xl mx-auto">
                 <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-[0_25px_50px_-12px_rgba(79,70,229,0.3)] mb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10">
                      <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tightest leading-tight">
                        AI Academic <br className="hidden sm:block" /> Advisor
                      </h1>
                      <p className="text-indigo-100 text-lg lg:text-xl mb-10 max-w-xl opacity-90 leading-relaxed">
                        Deep analysis of student datasets using Gemini 3 Flash. Uncovering trends, identifying risk factors, and maximizing potential.
                      </p>
                      <button 
                        onClick={handleAiAnalysis}
                        disabled={isAnalyzing || students.length === 0}
                        className="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 shadow-2xl"
                      >
                        {isAnalyzing ? (
                          <div className="animate-spin h-5 w-5 border-2 border-indigo-900 border-t-transparent rounded-full" />
                        ) : (
                          'Analyze Records Now'
                        )}
                      </button>
                    </div>
                 </div>

                 {aiInsights ? (
                   <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 animate-in zoom-in duration-500">
                      <div className="prose prose-slate max-w-none">
                        {aiInsights.split('\n').map((line, i) => (
                          <p key={i} className="text-slate-600 text-lg leading-relaxed mb-4">{line}</p>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <div className="text-center py-24 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100">
                      <div className="text-indigo-100 mb-6 flex justify-center">
                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Idle</h3>
                      <p className="text-slate-500 font-medium">Ready to crunch numbers. Tap the audit button above.</p>
                   </div>
                 )}
              </div>
            )}

            {currentView === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out max-w-2xl">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tightest mb-8">System Settings</h1>
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 divide-y divide-slate-50 overflow-hidden">
                  <div className="p-8 lg:p-10">
                    <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Cloud Persistence</h3>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed">Your data is synced locally and prepared for Netlify edge functions. Clear all records to reset the environment.</p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={handleAddSampleData}
                        className="px-6 py-3.5 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-all text-sm"
                      >
                        Generate Mock Data
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm("Wipe all local records? This cannot be undone.")) {
                            setStudents([]);
                            localStorage.removeItem('student_records');
                          }
                        }}
                        className="px-6 py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all text-sm"
                      >
                        Reset Local Database
                      </button>
                    </div>
                  </div>
                  <div className="p-8 lg:p-10 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Deployment Info</h3>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Environment:</span>
                       <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Production</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium italic">Configured for zero-latency Netlify deployment via automated Git integration.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Nav - Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-200 px-8 py-5 flex justify-between items-center z-50 rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <MobileNavItem active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} />
          <MobileNavItem active={currentView === 'records'} onClick={() => setCurrentView('records')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} />
          <MobileNavItem active={currentView === 'ai'} onClick={() => setCurrentView('ai')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
          <MobileNavItem active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>} />
        </nav>
      </div>

      {isFormOpen && (
        <StudentForm
          onSubmit={handleAddOrUpdate}
          initialData={editingStudent}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`p-5 lg:p-7 rounded-[2rem] border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 duration-300 group`}>
      <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{value}</p>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider group-hover:scale-110 transition-transform ${colorMap[color] || colorMap.indigo}`}>
          Live
        </div>
      </div>
    </div>
  );
};

const MobileNavItem = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`p-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' : 'text-slate-400'}`}
  >
    {icon}
  </button>
);

export default App;
