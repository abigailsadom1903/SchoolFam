import React, { useState } from 'react';
import { User, UserRole, ReferralCode } from '../types';
import { 
  School, 
  Plus, 
  Trash2, 
  Edit2, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  User as UserIcon,
  ShieldAlert,
  GraduationCap,
  Ticket,
  Copy,
  CheckCircle,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { PHOTOS } from '../constants'; // Import PHOTOS for realistic avatars

interface TeachersViewProps {
  currentUser: User;
  teachers: User[];
  referralCodes: ReferralCode[];
  onAddTeacher: (teacher: User) => void;
  onUpdateTeacher: (teacher: User) => void;
  onDeleteTeacher: (id: string) => void;
  onGenerateReferralCode: (role: UserRole) => void;
  onNavigate: (view: string) => void;
}

const TeachersView: React.FC<TeachersViewProps> = ({ 
  currentUser, 
  teachers,
  referralCodes,
  onAddTeacher, 
  onUpdateTeacher, 
  onDeleteTeacher,
  onGenerateReferralCode,
  onNavigate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [className, setClassName] = useState('');
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState('');

  // Mock Principal Data
  const principal: User = {
    id: 'principal',
    name: 'Mrs. Sarah Skinner',
    role: UserRole.ADMIN,
    email: 'principal@schoolfam.com',
    phone: '+60 19-999 8888',
    className: 'School Principal',
    bio: 'Dedicated to fostering a nurturing and excellent learning environment for all students.',
    avatarUrl: PHOTOS.women[7], // Using a specific woman photo for principal
    address: 'School Office'
  };

  // Permission Check
  const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN;

  const handleOpenModal = (teacher?: User) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setName(teacher.name);
      setEmail(teacher.email || '');
      setPhone(teacher.phone || '');
      setClassName(teacher.className || '');
      setBio(teacher.bio || '');
      setSubjects(teacher.subjects ? teacher.subjects.join(', ') : '');
    } else {
      setEditingTeacher(null);
      setName('');
      setEmail('');
      setPhone('');
      setClassName('');
      setBio('');
      setSubjects('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pick a random adult photo if creating new (mix of men/women)
    const randomAdultPhoto = Math.random() > 0.5 
       ? PHOTOS.men[Math.floor(Math.random() * PHOTOS.men.length)] 
       : PHOTOS.women[Math.floor(Math.random() * PHOTOS.women.length)];

    const teacherData: User = {
      id: editingTeacher ? editingTeacher.id : 't_' + Date.now(),
      name,
      role: UserRole.TEACHER,
      email,
      phone,
      className,
      bio,
      subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
      avatarUrl: editingTeacher?.avatarUrl || randomAdultPhoto,
      address: 'School Address' // Default for now
    };

    if (editingTeacher) {
      onUpdateTeacher(teacherData);
    } else {
      onAddTeacher(teacherData);
    }
    setIsModalOpen(false);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Active codes sort by newest
  const activeCodes = referralCodes
    .filter(c => c.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. Header / Root Node */}
      <div className="relative z-10 mb-8 w-full flex flex-col items-center">
         <div className="w-64 bg-gray-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center text-center relative border-4 border-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 text-primaryLight">
               <School size={32} />
            </div>
            <h3 className="text-xl font-bold">School Directory</h3>
            <p className="text-gray-400 text-xs mt-1">Organizational Chart</p>
            
            {/* Connector Down */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
         </div>
      </div>

      {/* 2. Principal Node */}
      <div className="relative z-10 mb-8 w-full flex flex-col items-center">
         <div className="w-72 bg-white p-6 rounded-3xl shadow-md border-2 border-primary/20 flex flex-col items-center text-center relative group hover:shadow-lg transition-shadow">
            <div className="absolute -top-3 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Principal
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden mb-3">
               <img src={principal.avatarUrl} alt={principal.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">{principal.name}</h4>
            <p className="text-xs text-primary font-bold uppercase mb-2">{principal.className}</p>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{principal.bio}</p>
            
            <div className="flex gap-3 justify-center w-full pt-3 border-t border-gray-50">
               <a href={`mailto:${principal.email}`} className="text-gray-400 hover:text-primary transition-colors"><Mail size={18} /></a>
               <a href={`tel:${principal.phone}`} className="text-gray-400 hover:text-primary transition-colors"><Phone size={18} /></a>
            </div>

            {/* Connector Down */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
         </div>
      </div>

      {/* 3. Teachers Grid */}
      <div className="relative w-full max-w-5xl">
         {/* Top Connector Horizontal Bar */}
         {teachers.length > 0 && (
            <div className="absolute -top-8 left-4 right-4 h-8 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-t-2xl"></div>
         )}
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {teachers.map((teacher, index) => (
               <div key={teacher.id} className="flex flex-col items-center relative">
                  {/* Connector from top */}
                  <div className="absolute -top-8 w-0.5 h-8 bg-gray-300"></div>
                  
                  <div className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all relative overflow-hidden">
                     {/* Edit Actions (Admin/Super Admin only) */}
                     {isAdmin && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleOpenModal(teacher)} className="p-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg"><Edit2 size={14}/></button>
                           <button onClick={() => onDeleteTeacher(teacher.id)} className="p-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                     )}

                     <div className="flex items-center gap-4 mb-3">
                        <img src={teacher.avatarUrl} alt={teacher.name} className="w-14 h-14 rounded-2xl bg-gray-100 object-cover" />
                        <div>
                           <h4 className="font-bold text-gray-800 text-sm">{teacher.name}</h4>
                           <p className="text-xs text-gray-500 font-medium">{teacher.className}</p>
                        </div>
                     </div>
                     
                     {teacher.subjects && teacher.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                           {teacher.subjects.map((sub, i) => (
                              <span key={i} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">{sub}</span>
                           ))}
                        </div>
                     )}

                     <p className="text-xs text-gray-500 leading-snug line-clamp-2 mb-4 bg-gray-50 p-2 rounded-xl italic">
                        "{teacher.bio || 'Passionate educator.'}"
                     </p>

                     <div className="flex gap-2">
                        {currentUser.role === UserRole.PARENT ? (
                           <button 
                              onClick={() => onNavigate('messages')}
                              className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                           >
                              <MessageCircle size={14} /> Chat
                           </button>
                        ) : (
                           <a href={`mailto:${teacher.email}`} className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                              <Mail size={14} /> Email
                           </a>
                        )}
                        <button className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                           <UserIcon size={14} /> Profile
                        </button>
                     </div>

                     {/* System Enrollment Code for Admins */}
                     {isAdmin && (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                           <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">System Enrollment Code</p>
                              {(!teacher.email) ? (
                                <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                                   <Ticket size={10} /> Pending Claim
                                </span>
                              ) : (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                   <ShieldCheck size={10} /> Verified
                                </span>
                              )}
                           </div>
                           <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-2 relative group/code">
                              <code className="flex-1 text-xs font-mono font-bold text-gray-700 tracking-wider truncate">
                                 {teacher.id.toUpperCase()}
                              </code>
                              <button 
                                 onClick={() => handleCopyCode(teacher.id.toUpperCase(), teacher.id)}
                                 className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                                    copiedCodeId === teacher.id 
                                       ? 'bg-green-100 text-green-700' 
                                       : 'hover:bg-white text-gray-400 hover:text-primary shadow-sm'
                                 }`}
                                 title="Copy Verification Code"
                              >
                                 {copiedCodeId === teacher.id ? <CheckCircle size={14}/> : <Copy size={14}/>}
                              </button>
                           </div>
                           <p className="text-[10px] text-gray-400 mt-1">
                              {!teacher.email ? 'Share this code with the teacher to sign up.' : 'Unique identifier for system verification.'}
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            ))}

            {/* Admin Cards: Invite & Add */}
            {isAdmin && (
               <>
                  {/* Invite via Code Card */}
                  <div className="flex flex-col items-center relative">
                     <div className="absolute -top-8 w-0.5 h-8 bg-gray-300"></div>
                     <button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="w-full h-full min-h-[200px] bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-3 text-purple-400 hover:bg-purple-100 hover:border-purple-300 transition-all group"
                     >
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform group-hover:shadow-md text-purple-500">
                           <Ticket size={24} />
                        </div>
                        <div className="text-center">
                           <span className="font-bold text-sm text-purple-600 block">Invite Teacher</span>
                           <span className="text-[10px] text-purple-400">Generate Generic Code</span>
                        </div>
                     </button>
                  </div>

                  {/* Manual Add Card */}
                  <div className="flex flex-col items-center relative">
                     <div className="absolute -top-8 w-0.5 h-8 bg-gray-300"></div>
                     <button 
                        onClick={() => handleOpenModal()}
                        className="w-full h-full min-h-[200px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-all group"
                     >
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform group-hover:shadow-md">
                           <UserPlus size={24} />
                        </div>
                        <div className="text-center">
                           <span className="font-bold text-sm block">Create Profile</span>
                           <span className="text-[10px]">Add Staff Placeholder</span>
                        </div>
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <Ticket className="text-purple-600"/> Invite Teacher
                  </h3>
                  <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="text-center">
                     <button 
                        onClick={() => onGenerateReferralCode(UserRole.TEACHER)}
                        className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30 flex flex-col items-center gap-1 group active:scale-95"
                     >
                        <div className="flex items-center gap-2 text-lg">
                           <Plus size={20} className="group-hover:rotate-90 transition-transform"/> Generate New Code
                        </div>
                        <span className="text-[10px] font-normal opacity-80">Creates a generic sign-up key</span>
                     </button>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-400 uppercase">Active Invite Codes</h4>
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">{activeCodes.length}</span>
                     </div>
                     
                     <div className="bg-gray-50 rounded-2xl border border-gray-100 max-h-[200px] overflow-y-auto p-2 space-y-2">
                        {activeCodes.length === 0 ? (
                           <div className="text-center py-8 text-gray-400 text-sm italic flex flex-col items-center gap-2">
                              <Ticket size={24} className="opacity-20"/>
                              No active codes.
                           </div>
                        ) : (
                           activeCodes.map(code => (
                              <div key={code.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm animate-in slide-in-from-left-2">
                                 <div>
                                    <p className="font-mono font-bold text-gray-800 tracking-wider text-lg">{code.code}</p>
                                    <p className="text-[10px] text-gray-400">Created: {new Date(code.createdAt).toLocaleDateString()}</p>
                                 </div>
                                 <button 
                                    onClick={() => handleCopyCode(code.code, code.id)}
                                    className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                                       copiedCodeId === code.id 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                 >
                                    {copiedCodeId === code.id ? <CheckCircle size={16}/> : <Copy size={16}/>}
                                    {copiedCodeId === code.id ? 'Copied' : 'Copy'}
                                 </button>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 flex gap-2 leading-relaxed border border-blue-100">
                     <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                     <p>
                        This creates a generic invite. For better security, create a specific profile first and share the <strong>System Enrollment Code</strong> from the staff card.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Edit/Add Modal (Manual) */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <GraduationCap className="text-primary"/> {editingTeacher ? 'Edit Teacher' : 'Create Staff Profile'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                     <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                     <input 
                        required
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="e.g. Mrs. Jennifer Davis"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class / Role</label>
                        <input 
                           type="text" 
                           value={className}
                           onChange={e => setClassName(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           placeholder="e.g. Grade 1A"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subjects</label>
                        <input 
                           type="text" 
                           value={subjects}
                           onChange={e => setSubjects(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           placeholder="Math, Art"
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Optional)</label>
                        <input 
                           type="email" 
                           value={email}
                           onChange={e => setEmail(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           placeholder="Leave empty for claim"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Optional)</label>
                        <input 
                           type="tel" 
                           value={phone}
                           onChange={e => setPhone(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           placeholder="+60 1X-XXX XXXX"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Note</label>
                     <textarea 
                        rows={3}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                     />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-2 border border-blue-100">
                     <ShieldAlert size={16} className="text-blue-500 mt-0.5 shrink-0" />
                     <p className="text-xs text-blue-800">
                        Creating this profile generates a <strong>System Enrollment Code</strong>. Share it with the staff member to let them claim this account.
                     </p>
                  </div>

                  <button 
                     type="submit"
                     className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-2"
                  >
                     {editingTeacher ? 'Save Changes' : 'Create Staff Profile'}
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default TeachersView;