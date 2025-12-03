import React, { useState } from 'react';
import { Search, User as UserIcon, Filter, CheckCircle, Clock, AlertTriangle, FileText, Plus, X, Copy } from 'lucide-react';
import { Child, User, UserRole } from '../types';

interface StudentsListProps {
  students: Child[];
  currentUser: User;
  onAddStudent?: (studentData: Partial<Child> & { gender: 'boy' | 'girl' }) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, currentUser, onAddStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add Student State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newGender, setNewGender] = useState<'boy' | 'girl'>('boy');

  // Filter students based on role: Teachers only see their assigned class
  const accessibleStudents = currentUser.role === UserRole.TEACHER 
    ? students.filter(s => s.class === currentUser.className)
    : students;

  // Get unique classes for filter based on accessible students (plus hardcoded options for adding)
  const classes = Array.from(new Set(accessibleStudents.map(s => s.class))).sort();
  const allClassesOptions = ['Kindergarten A', 'Kindergarten B', 'Kindergarten C'];

  const filteredStudents = accessibleStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const canAdd = (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && onAddStudent;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddStudent) {
      onAddStudent({
        name: newName,
        age: parseInt(newAge),
        class: newClass,
        gender: newGender
      });
      setIsModalOpen(false);
      setNewName('');
      setNewAge('');
      setNewClass('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="text-primary" /> Student Directory
          </h2>
          <p className="text-gray-500 mt-1">
            {currentUser.role === UserRole.TEACHER 
              ? `My Class: ${currentUser.className}` 
              : `Total Enrolled: ${students.length}`}
          </p>
        </div>
        {canAdd && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:scale-105"
          >
            <Plus size={18} /> Add Student
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="relative min-w-[200px]">
           <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
           <select 
             value={filterClass}
             onChange={(e) => setFilterClass(e.target.value)}
             className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
           >
             <option value="all">All Classes</option>
             {classes.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                  <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-2xl bg-gray-100 object-cover" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      student.attendanceStatus === 'present' ? 'bg-green-500' : 
                      student.attendanceStatus === 'absent' ? 'bg-red-500' : 'bg-orange-400'
                  }`}>
                      {student.attendanceStatus === 'present' && <CheckCircle size={10} className="text-white" />}
                      {student.attendanceStatus === 'absent' && <AlertTriangle size={10} className="text-white" />}
                      {(student.attendanceStatus === 'late' || student.attendanceStatus === 'excused') && <Clock size={10} className="text-white" />}
                  </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-lg truncate">{student.name}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">{student.class}</p>
                
                <div className="flex flex-wrap gap-2">
                   <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg border border-gray-200">
                      Age: {student.age}
                   </span>
                   <span className={`text-[10px] px-2 py-0.5 rounded-lg border uppercase font-bold ${
                      student.attendanceStatus === 'present' ? 'bg-green-50 text-green-700 border-green-100' : 
                      student.attendanceStatus === 'absent' ? 'bg-red-50 text-red-700 border-red-100' : 
                      'bg-orange-50 text-orange-700 border-orange-100'
                   }`}>
                     {student.attendanceStatus}
                   </span>
                </div>
              </div>
            </div>

            {/* Access Code Section for Admins */}
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && (
              <div className="pt-4 border-t border-gray-50">
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">System Enrollment Code</p>
                 <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-2">
                    <code className="flex-1 text-sm font-mono font-bold text-gray-700 tracking-wider">
                      {student.accessCode || 'N/A'}
                    </code>
                    <button 
                      onClick={() => student.accessCode && navigator.clipboard.writeText(student.accessCode)}
                      className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-colors shadow-sm"
                      title="Copy Code"
                    >
                      <Copy size={14} />
                    </button>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <UserIcon size={32} className="opacity-20"/>
          </div>
          <p className="font-medium">No students found.</p>
          <p className="text-xs">
            {currentUser.role === UserRole.TEACHER 
              ? "You don't have any students assigned to your class yet." 
              : "Try adjusting your search or filter."}
          </p>
        </div>
      )}

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Register New Student</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Charlie Brown"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                  <input 
                    required
                    type="number" 
                    value={newAge}
                    onChange={e => setNewAge(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                  <select 
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as 'boy'|'girl')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Assignment</label>
                <select 
                  required
                  value={newClass}
                  onChange={e => setNewClass(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select Class</option>
                  {allClassesOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-xl flex items-start gap-2">
                 <Clock size={16} className="shrink-0 mt-0.5" />
                 <p>A unique <strong>Enrollment Code</strong> will be automatically generated for this student. Share it with the parent for signup.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg mt-2"
              >
                Create Student Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;