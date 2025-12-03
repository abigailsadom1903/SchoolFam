

import React, { useState } from 'react';
import { 
  School, 
  Users, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Archive, 
  CheckCircle,
  X,
  User as UserIcon,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { SchoolClass, User, UserRole, Child } from '../types';

interface ClassManagerProps {
  classes: SchoolClass[];
  teachers: User[];
  students: Child[]; // To calculate current capacity
  onAddClass: (newClass: SchoolClass) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onSwitchToTeachers: () => void;
  onUpdateTeacher: (teacher: User) => void; // New prop for updating teacher assignments
}

const ClassManager: React.FC<ClassManagerProps> = ({ 
  classes, 
  teachers, 
  students, 
  onAddClass, 
  onUpdateClass, 
  onDeleteClass,
  onSwitchToTeachers,
  onUpdateTeacher
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [teacherId, setTeacherId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');

  // Teacher Assignment State (Sub-Form)
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignSubject, setAssignSubject] = useState('');

  const openModal = (cls?: SchoolClass) => {
    if (cls) {
      setEditingClass(cls);
      setName(cls.name);
      setLevel(cls.level);
      setCapacity(cls.capacity.toString());
      setTeacherId(cls.teacherId || '');
      setDescription(cls.description);
      setStatus(cls.status);
    } else {
      setEditingClass(null);
      setName('');
      setLevel('');
      setCapacity('20');
      setTeacherId('');
      setDescription('');
      setStatus('active');
    }
    // Reset sub-form
    setAssignTeacherId('');
    setAssignSubject('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClassData: SchoolClass = {
      id: editingClass ? editingClass.id : 'cl_' + Date.now(),
      name,
      level,
      capacity: parseInt(capacity),
      teacherId: teacherId || undefined,
      description,
      status
    };

    // If setting a Lead Teacher, ensure their profile reflects this class
    if (teacherId) {
       const leadTeacher = teachers.find(t => t.id === teacherId);
       if (leadTeacher && leadTeacher.className !== name) {
          // Update teacher to be assigned to this class
          onUpdateTeacher({ ...leadTeacher, className: name });
       }
    }

    if (editingClass) {
      onUpdateClass(newClassData);
    } else {
      onAddClass(newClassData);
    }
    setIsModalOpen(false);
  };

  const handleAssignSubjectTeacher = () => {
     if (!assignTeacherId || !assignSubject) return;
     const teacher = teachers.find(t => t.id === assignTeacherId);
     if (teacher) {
        // Update teacher profile
        onUpdateTeacher({
           ...teacher,
           className: editingClass?.name || name, // Fallback to current name input
           subjects: [assignSubject] // Simple override or append? Let's override for "Assigned Subject" context
        });
        setAssignTeacherId('');
        setAssignSubject('');
     }
  };

  const handleUnassignTeacher = (tId: string) => {
     const teacher = teachers.find(t => t.id === tId);
     if (teacher) {
        onUpdateTeacher({
           ...teacher,
           className: undefined,
           subjects: []
        });
     }
  };

  // Helper to count students in a class (mock logic based on class string match)
  const getStudentCount = (className: string) => {
    return students.filter(s => s.class === className).length;
  };

  const activeClasses = classes.filter(c => c.status === 'active');
  const archivedClasses = classes.filter(c => c.status === 'archived');

  // Filter teachers for the "Add Subject Teacher" dropdown (exclude already assigned)
  const availableTeachers = teachers.filter(t => t.id !== teacherId && t.className !== (editingClass?.name || name));
  
  // Get currently assigned subject teachers (excluding lead)
  const subjectTeachers = teachers.filter(t => t.className === (editingClass?.name || name) && t.id !== teacherId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <School className="text-primary" /> Class Management
          </h2>
          <p className="text-gray-500 mt-1">Manage classes, capacities, and teacher assignments.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:scale-105"
        >
          <Plus size={18} /> Add New Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
             <School size={24} />
           </div>
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase">Total Classes</p>
             <h3 className="text-2xl font-bold text-gray-800">{activeClasses.length}</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
             <Users size={24} />
           </div>
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase">Total Capacity</p>
             <h3 className="text-2xl font-bold text-gray-800">
               {activeClasses.reduce((sum, c) => sum + c.capacity, 0)}
             </h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
             <GraduationCap size={24} />
           </div>
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase">Assigned Teachers</p>
             <h3 className="text-2xl font-bold text-gray-800">
               {teachers.filter(t => t.className).length}
             </h3>
           </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeClasses.map(cls => {
          const teacher = teachers.find(t => t.id === cls.teacherId);
          const otherTeachersCount = teachers.filter(t => t.className === cls.name && t.id !== cls.teacherId).length;
          const studentCount = getStudentCount(cls.name);
          const capacityPercent = Math.min((studentCount / cls.capacity) * 100, 100);
          
          return (
            <div key={cls.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
               <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                          {cls.level}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">{cls.name}</h3>
                     </div>
                     <div className="relative group/menu">
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                           <MoreVertical size={20} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 p-1 hidden group-hover/menu:block z-10 animate-in fade-in slide-in-from-top-2">
                           <button onClick={() => openModal(cls)} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                              <Edit2 size={14} /> Edit
                           </button>
                           <button onClick={() => onDeleteClass(cls.id)} className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                              <Archive size={14} /> Archive
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Teaching Team Summary */}
                  <div className="mb-4">
                     <p className="text-xs text-gray-400 font-bold uppercase mb-2">Teaching Team</p>
                     <div className="flex items-center -space-x-2 overflow-hidden mb-2">
                        {teacher ? (
                           <img src={teacher.avatarUrl} alt={teacher.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 object-cover" title={`Lead: ${teacher.name}`} />
                        ) : (
                           <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-gray-400">
                              <UserIcon size={14} />
                           </div>
                        )}
                        {teachers.filter(t => t.className === cls.name && t.id !== cls.teacherId).slice(0, 3).map(t => (
                           <img key={t.id} src={t.avatarUrl} alt={t.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 object-cover" title={t.name} />
                        ))}
                        {otherTeachersCount > 3 && (
                           <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                              +{otherTeachersCount - 3}
                           </div>
                        )}
                     </div>
                     <p className="text-xs text-gray-500 font-medium">
                        {teacher ? teacher.name : 'No Lead Assigned'} 
                        {otherTeachersCount > 0 && <span className="text-gray-400"> + {otherTeachersCount} others</span>}
                     </p>
                  </div>

                  <div className="h-px bg-gray-100 mb-4"></div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-6 flex-1">
                     {cls.description || 'No description provided.'}
                  </p>

                  {/* Capacity Bar */}
                  <div className="mt-auto">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-400">Capacity</span>
                        <span className="text-xs font-bold text-gray-800">{studentCount} / {cls.capacity} Students</span>
                     </div>
                     <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full ${
                              capacityPercent > 90 ? 'bg-red-500' : 
                              capacityPercent > 75 ? 'bg-orange-400' : 
                              'bg-green-500'
                           }`} 
                           style={{ width: `${capacityPercent}%` }}
                        ></div>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}

        {/* Empty State */}
        {activeClasses.length === 0 && (
           <div className="col-span-full py-16 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
              <School size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-500">No Active Classes</h3>
              <p className="text-gray-400 text-sm">Create a class to get started.</p>
           </div>
        )}
      </div>

      {archivedClasses.length > 0 && (
         <div className="pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 opacity-60">
               <Archive size={20} /> Archived Classes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
               {archivedClasses.map(cls => (
                  <div key={cls.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
                     <div>
                        <h4 className="font-bold text-gray-700">{cls.name}</h4>
                        <p className="text-xs text-gray-500">{cls.level}</p>
                     </div>
                     <button 
                        onClick={() => onUpdateClass({...cls, status: 'active'})}
                        className="text-xs font-bold text-blue-600 hover:underline"
                     >
                        Restore
                     </button>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                  <h3 className="text-lg font-bold text-gray-800">
                     {editingClass ? 'Edit Class Details' : 'Create New Class'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                     <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Name</label>
                     <input 
                        required
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="e.g. Grade 1A"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level / Grade</label>
                        <input 
                           required
                           type="text" 
                           value={level}
                           onChange={e => setLevel(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           placeholder="e.g. Grade 1"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                        <input 
                           required
                           type="number" 
                           value={capacity}
                           onChange={e => setCapacity(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                     <textarea 
                        rows={2}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                        placeholder="Brief description of the class..."
                     />
                  </div>

                  {editingClass && (
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                        <div className="flex gap-4">
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                 type="radio" 
                                 name="status" 
                                 value="active" 
                                 checked={status === 'active'} 
                                 onChange={() => setStatus('active')}
                                 className="text-primary focus:ring-primary"
                              />
                              <span className="text-sm">Active</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                 type="radio" 
                                 name="status" 
                                 value="archived" 
                                 checked={status === 'archived'} 
                                 onChange={() => setStatus('archived')}
                                 className="text-primary focus:ring-primary"
                              />
                              <span className="text-sm">Archived</span>
                           </label>
                        </div>
                     </div>
                  )}

                  <hr className="border-gray-100 my-4" />

                  {/* Teaching Staff Assignment Section */}
                  <div>
                     <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <GraduationCap className="text-primary" size={18} /> Teaching Staff Assignment
                     </h4>
                     
                     {/* Lead Teacher */}
                     <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lead Class Teacher</label>
                        <div className="flex gap-2">
                           <select 
                              value={teacherId}
                              onChange={e => setTeacherId(e.target.value)}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           >
                              <option value="">Select Lead Teacher</option>
                              {teachers.map(t => (
                                 <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                           </select>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                           Assigned teacher's profile will be updated to reflect this class.
                        </p>
                     </div>

                     {/* Subject Teachers List */}
                     {editingClass && (
                        <div className="mb-4">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject Teachers ({subjectTeachers.length})</label>
                           <div className="bg-gray-50 rounded-xl border border-gray-100 p-2 space-y-2 max-h-40 overflow-y-auto">
                              {subjectTeachers.length === 0 ? (
                                 <p className="text-xs text-gray-400 text-center py-2">No additional teachers assigned.</p>
                              ) : (
                                 subjectTeachers.map(t => (
                                    <div key={t.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                                       <div className="flex items-center gap-2">
                                          <img src={t.avatarUrl} className="w-6 h-6 rounded-full bg-gray-100" />
                                          <div>
                                             <p className="text-xs font-bold text-gray-800">{t.name}</p>
                                             <p className="text-[10px] text-gray-500">{t.subjects?.join(', ') || 'General'}</p>
                                          </div>
                                       </div>
                                       <button 
                                          type="button"
                                          onClick={() => handleUnassignTeacher(t.id)}
                                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                          title="Unassign"
                                       >
                                          <X size={14} />
                                       </button>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>
                     )}

                     {/* Add Subject Teacher Form */}
                     {editingClass && (
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                           <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Assign Additional Teacher</label>
                           <div className="flex flex-col gap-2">
                              <select 
                                 value={assignTeacherId}
                                 onChange={e => setAssignTeacherId(e.target.value)}
                                 className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                              >
                                 <option value="">Select Teacher</option>
                                 {availableTeachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                 ))}
                              </select>
                              <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    value={assignSubject}
                                    onChange={e => setAssignSubject(e.target.value)}
                                    placeholder="Subject (e.g. Music)"
                                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                                 />
                                 <button 
                                    type="button"
                                    onClick={handleAssignSubjectTeacher}
                                    disabled={!assignTeacherId || !assignSubject}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                                 >
                                    Assign
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}
                     
                     {!editingClass && (
                        <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-xl flex items-start gap-2 border border-yellow-100">
                           <BookOpen size={16} className="shrink-0 mt-0.5" />
                           <p>Please create the class first. You can then edit it to assign specific subject teachers.</p>
                        </div>
                     )}
                  </div>
               </form>

               <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button 
                     onClick={handleSubmit}
                     className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                  >
                     {editingClass ? 'Save Class & Assignments' : 'Create Class'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ClassManager;