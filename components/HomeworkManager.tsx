

import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Paperclip,
  Image as ImageIcon,
  Download,
  Users
} from 'lucide-react';
import { Homework, UserRole, User, Child } from '../types';

interface HomeworkManagerProps {
  homework: Homework[];
  userRole: UserRole;
  currentUser?: User;
  students?: Child[]; // List of students for assignment
  onAddHomework: (hw: Homework) => void;
  onUpdateHomework: (hw: Homework) => void;
  onDeleteHomework: (id: string) => void;
}

const HomeworkManager: React.FC<HomeworkManagerProps> = ({ 
  homework, 
  userRole, 
  currentUser,
  students,
  onAddHomework, 
  onUpdateHomework, 
  onDeleteHomework 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Permission Check
  const canManageHomework = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Filter students for assignment: Teacher sees class, Admin sees all
  const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className)
    ? students?.filter(s => s.class === currentUser.className)
    : students;

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [assigneeId, setAssigneeId] = useState('all'); // 'all' or specific student ID

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedHomework = [...homework].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getSubjectColor = (subj: string) => {
    const s = subj.toLowerCase();
    if (s.includes('math')) return 'bg-blue-100 text-blue-700';
    if (s.includes('art')) return 'bg-purple-100 text-purple-700';
    if (s.includes('english') || s.includes('reading')) return 'bg-green-100 text-green-700';
    if (s.includes('science')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getDueStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500 bg-red-50' };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-500 bg-orange-50' };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'text-yellow-600 bg-yellow-50' };
    return { label: `Due in ${diffDays} days`, color: 'text-gray-500 bg-gray-50' };
  };

  const handleOpenModal = (hw?: Homework) => {
    if (hw) {
      setEditingId(hw.id);
      setTitle(hw.title);
      setSubject(hw.subject);
      setDescription(hw.description);
      setDueDate(hw.dueDate);
      setAttachments(hw.attachments || []);
      setAssigneeId(hw.studentId || 'all');
    } else {
      setEditingId(null);
      setTitle('');
      setSubject('General');
      setDescription('');
      setDueDate('');
      setAttachments([]);
      setAssigneeId('all');
    }
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a fake URL for the mock environment
      const url = URL.createObjectURL(file);
      setAttachments(prev => [...prev, { name: file.name, url }]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStudent = accessibleStudents?.find(s => s.id === assigneeId);

    const hwData: Homework = {
      id: editingId || 'hw_' + Date.now(),
      title,
      subject,
      description,
      dueDate,
      assignedDate: editingId ? (homework.find(h => h.id === editingId)?.assignedDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      attachments,
      studentId: assigneeId !== 'all' ? assigneeId : undefined,
      studentName: assigneeId !== 'all' ? selectedStudent?.name : undefined
    };

    if (editingId) {
      onUpdateHomework(hwData);
    } else {
      onAddHomework(hwData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-primary" /> Homework & Assignments
          </h2>
          <p className="text-gray-500 mt-1">Track tasks and due dates.</p>
        </div>
        
        {canManageHomework && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
          >
            <Plus size={20} /> Assign Homework
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedHomework.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-bold text-gray-800">All Caught Up!</h3>
            <p className="text-gray-500">No active homework assignments at the moment.</p>
          </div>
        ) : (
          sortedHomework.map(hw => {
            const status = getDueStatus(hw.dueDate);
            
            return (
              <div key={hw.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
                {/* Assigned To Badge */}
                {hw.studentName && (
                   <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 px-3 py-1 rounded-bl-xl text-[10px] font-bold border-b border-l border-blue-100 flex items-center gap-1">
                     <Users size={10} /> {hw.studentName}
                   </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${getSubjectColor(hw.subject)}`}>
                    {hw.subject}
                  </span>
                  {canManageHomework && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(hw)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteHomework(hw.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{hw.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                  {hw.description}
                </p>

                {/* Attachments Display */}
                {hw.attachments && hw.attachments.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {hw.attachments.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-100 transition-colors group/file"
                      >
                        <div className="p-1.5 bg-white rounded-lg text-blue-500 shadow-sm">
                          {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? <ImageIcon size={14} /> : <FileText size={14} />}
                        </div>
                        <span className="text-xs font-bold text-gray-600 truncate flex-1">{file.name}</span>
                        <Download size={14} className="text-gray-400 group-hover/file:text-blue-500" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${status.color}`}>
                      <Clock size={14} /> {status.label}
                   </div>
                   <div className="text-xs text-gray-400 font-medium">
                      Due: {new Date(hw.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Assignment' : 'New Assignment'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Workbook Page 42"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                  <select 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Math">Math</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                  <input 
                    required
                    type="date" 
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {canManageHomework && accessibleStudents && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign To</label>
                  <div className="relative">
                    <select
                      value={assigneeId}
                      onChange={e => setAssigneeId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                    >
                      <option value="all">Entire Class</option>
                      {accessibleStudents.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                    <Users size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
                <textarea 
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Details about the homework..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Attachments</label>
                
                {/* List of attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="p-1.5 bg-white rounded-lg text-blue-500 shadow-sm">
                            {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? <ImageIcon size={14} /> : <FileText size={14} />}
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <Paperclip size={16} />
                  <span className="text-xs font-bold">Attach File or Photo</span>
                </button>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  {editingId ? 'Save Changes' : 'Assign Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkManager;