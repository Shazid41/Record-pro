
import React from 'react';
import { Student, SortField, SortOrder } from '../types';

interface StudentTableProps {
  students: Student[];
  onDelete: (id: string) => void;
  onEdit: (student: Student) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ 
  students, 
  onDelete, 
  onEdit, 
  sortField, 
  sortOrder, 
  onSort 
}) => {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-0 group-hover:opacity-30 transition-opacity text-gray-400">↑</span>;
    return (
      <span className="ml-1 text-indigo-600 font-bold">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const tableHeaderClasses = "px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group";

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th onClick={() => onSort('name')} className={tableHeaderClasses}>
                Student <SortIcon field="name" />
              </th>
              <th onClick={() => onSort('rollNumber')} className={tableHeaderClasses}>
                Roll No <SortIcon field="rollNumber" />
              </th>
              <th onClick={() => onSort('gpa')} className={tableHeaderClasses}>
                GPA <SortIcon field="gpa" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                Department
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {students.length === 0 ? (
              <EmptyState />
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      student.gpa >= 3.5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      student.gpa >= 2.5 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(student)}
                      className="text-indigo-600 hover:text-indigo-900 px-2 py-1 hover:bg-white rounded transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(student.id)}
                      className="text-gray-400 hover:text-rose-600 px-2 py-1 hover:bg-white rounded transition-all ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {students.length === 0 ? (
          <EmptyState />
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.rollNumber}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  student.gpa >= 3.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {student.gpa.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                <span>{student.department}</span>
                <div className="flex gap-4">
                  <button onClick={() => onEdit(student)} className="text-indigo-600 font-bold">Edit</button>
                  <button onClick={() => onDelete(student.id)} className="text-rose-500 font-bold">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="py-20 text-center text-gray-500">
    <div className="flex flex-col items-center">
      <div className="p-4 bg-gray-50 rounded-full mb-4">
        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <p className="text-xl font-bold text-gray-900">No records found</p>
      <p className="text-sm">Try adding a new student to get started.</p>
    </div>
  </div>
);

export default StudentTable;
