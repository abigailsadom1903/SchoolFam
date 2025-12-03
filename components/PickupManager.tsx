import React, { useState, useRef, useEffect } from 'react';
import { 
  Car, 
  UserCheck, 
  Users, 
  Clock, 
  MapPin, 
  Bus, 
  Home, 
  CheckCircle, 
  X, 
  Camera, 
  PenTool, 
  Search,
  Plus,
  Trash2,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { UserRole, Child, Guardian, PickupSession, PickupStatus, User } from '../types';

interface PickupManagerProps {
  userRole: UserRole;
  currentUser?: User; // Added currentUser prop
  students?: Child[]; // All students for Teacher/Admin
  currentChild?: Child; // Specific child for Parent
  pickupSessions: Record<string, PickupSession>;
  guardians: Record<string, Guardian[]>;
  estimatedPickupTime?: string;
  allPickupTimes?: Record<string, string>; // NEW: For teachers to see all times
  onUpdatePickupTime?: (time: string) => void;
  onUpdatePickupStatus: (session: PickupSession) => void;
  onAddGuardian?: (childId: string, guardian: Guardian) => void;
  onRemoveGuardian?: (childId: string, guardianId: string) => void;
}

const PickupManager: React.FC<PickupManagerProps> = ({ 
  userRole, 
  currentUser,
  students, 
  currentChild, 
  pickupSessions, 
  guardians,
  estimatedPickupTime,
  allPickupTimes,
  onUpdatePickupTime,
  onUpdatePickupStatus,
  onAddGuardian,
  onRemoveGuardian
}) => {
  // Staff State
  const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'picked_up'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Parent State (Add Guardian)
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianRelation, setNewGuardianRelation] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');

  // Parent State (Pickup Time)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [tempTime, setTempTime] = useState('');

  // Process Pickup State
  const [processStep, setProcessStep] = useState(1); // 1: Method, 2: Verification, 3: Signature
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedGuardianId, setSelectedGuardianId] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Permission Check
  const isStaff = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // --- Helper Functions ---

  const getStatusColor = (status: PickupStatus) => {
    switch (status) {
      case 'picked_up': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'bus': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'after_care': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'walk': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: PickupStatus) => {
    switch (status) {
      case 'picked_up': return 'Picked Up';
      case 'pending': return 'In Class';
      case 'bus': return 'School Bus';
      case 'after_care': return 'After Care';
      case 'walk': return 'Walking';
      default: return status;
    }
  };

  // Helper to convert 12h (3:30 PM) to 24h (15:30) for input
  const convertTo24Hour = (time12h: string) => {
    if (!time12h) return '15:30';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours}:${minutes}`;
  };

  // Helper to convert 24h (15:30) to 12h (3:30 PM) for display
  const convertTo12Hour = (time24h: string) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  // --- Staff Logic ---

  // Filter students: Teachers only see their class, Admins see all
  const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className)
    ? students?.filter(s => s.class === currentUser.className)
    : students;

  const filteredStudents = accessibleStudents?.filter(s => {
    const session = pickupSessions[s.id];
    const status = session?.status || 'pending';
    const matchesFilter = filter === 'all' 
      ? true 
      : filter === 'picked_up' 
        ? status !== 'pending' 
        : status === 'pending';
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStartProcess = (student: Child) => {
    setSelectedStudent(student);
    setProcessStep(1);
    setSelectedMethod('');
    setSelectedGuardianId('');
    setSignatureData(null);
  };

  const handleSelectGuardian = (gId: string) => {
    setSelectedGuardianId(gId);
    setProcessStep(3); // Skip straight to signature for simplicity in this flow
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === 'Guardian') {
      setProcessStep(2);
    } else {
      // For bus/walk/etc, maybe skip verification or keep signature?
      // Let's require signature for everything for safety or just confirm
      setProcessStep(3); 
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const completePickup = () => {
    if (!selectedStudent) return;
    
    const newSession: PickupSession = {
      studentId: selectedStudent.id,
      status: selectedMethod === 'School Bus' ? 'bus' : selectedMethod === 'After Care' ? 'after_care' : selectedMethod === 'Walk Home' ? 'walk' : 'picked_up',
      timestamp: new Date(),
      method: selectedMethod,
      guardianId: selectedGuardianId || undefined,
      verifiedBy: userRole === UserRole.SUPER_ADMIN ? 'Super Admin' : userRole === UserRole.ADMIN ? 'Admin' : 'Teacher',
      signatureUrl: canvasRef.current?.toDataURL() || undefined
    };

    onUpdatePickupStatus(newSession);
    setSelectedStudent(null);
  };

  // --- Parent Logic ---

  const handleAddGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild || !onAddGuardian) return;

    const newG: Guardian = {
      id: 'g_' + Date.now(),
      name: newGuardianName,
      relation: newGuardianRelation,
      phone: newGuardianPhone,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newGuardianName}` // Mock ID photo
    };

    onAddGuardian(currentChild.id, newG);
    setIsGuardianModalOpen(false);
    setNewGuardianName('');
    setNewGuardianRelation('');
    setNewGuardianPhone('');
  };

  const handleOpenTimeModal = () => {
    setTempTime(convertTo24Hour(estimatedPickupTime || '15:30'));
    setIsTimeModalOpen(true);
  };

  const handleSaveTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePickupTime) {
      onUpdatePickupTime(convertTo12Hour(tempTime));
    }
    setIsTimeModalOpen(false);
  };

  // --- Render ---

  if (isStaff) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <Car className="text-primary" /> Student Pickup
             </h2>
             <p className="text-gray-500 mt-1">
               {userRole === UserRole.TEACHER && currentUser?.className ? `Managing Class: ${currentUser.className}` : 'Manage dismissals and verify guardians.'}
             </p>
           </div>
           
           <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
             {(['all', 'pending', 'picked_up'] as const).map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                   filter === f ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                 }`}
               >
                 {f === 'picked_up' ? 'Dismissed' : f}
               </button>
             ))}
           </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student name..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
          />
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents?.map(student => {
             const session = pickupSessions[student.id] || { status: 'pending' };
             const isPending = session.status === 'pending';
             const estTime = allPickupTimes?.[student.id] || '3:30 PM';

             return (
               <div key={student.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                 <div className="relative">
                   <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full border-2 border-gray-100" />
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${isPending ? 'bg-orange-400' : 'bg-green-500'}`}>
                     {isPending ? <Clock size={12} className="text-white" /> : <CheckCircle size={12} className="text-white" />}
                   </div>
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-gray-800 truncate mb-2">{student.name}</h3>
                   
                   <div className="flex justify-between items-center mb-3">
                      <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${getStatusColor(session.status)}`}>
                        {getStatusLabel(session.status)}
                      </div>
                      
                      {/* Estimated Arrival Badge for Teachers */}
                      {isPending && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100" title="Estimated Parent Arrival">
                           <Clock size={10} />
                           <span>Est: {estTime}</span>
                        </div>
                      )}
                   </div>
                   
                   {isPending ? (
                     <button 
                       onClick={() => handleStartProcess(student)}
                       className="w-full bg-gray-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                     >
                       Process Pickup
                     </button>
                   ) : (
                     <div className="text-xs text-gray-500">
                       <p>{session.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       <p className="truncate">Via: {session.method}</p>
                     </div>
                   )}
                 </div>
               </div>
             );
          })}
          {filteredStudents?.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-400">
                No students found matching your criteria.
             </div>
          )}
        </div>

        {/* Process Pickup Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                   <img src={selectedStudent.avatarUrl} className="w-10 h-10 rounded-full" />
                   <div>
                     <h3 className="text-lg font-bold text-gray-800">{selectedStudent.name}</h3>
                     <p className="text-xs text-gray-500">Dismissal Process • Step {processStep}/3</p>
                   </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-200 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Step 1: Select Method */}
                {processStep === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleMethodSelect('Guardian')} className="p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-3xl flex flex-col items-center gap-3 transition-colors">
                      <Users size={40} className="text-blue-600" />
                      <span className="font-bold text-blue-900">Guardian Pickup</span>
                    </button>
                    <button onClick={() => handleMethodSelect('School Bus')} className="p-6 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-3xl flex flex-col items-center gap-3 transition-colors">
                      <Bus size={40} className="text-yellow-600" />
                      <span className="font-bold text-yellow-900">School Bus</span>
                    </button>
                    <button onClick={() => handleMethodSelect('After Care')} className="p-6 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-3xl flex flex-col items-center gap-3 transition-colors">
                      <Home size={40} className="text-purple-600" />
                      <span className="font-bold text-purple-900">After Care</span>
                    </button>
                    <button onClick={() => handleMethodSelect('Walk Home')} className="p-6 bg-green-50 hover:bg-green-100 border border-green-200 rounded-3xl flex flex-col items-center gap-3 transition-colors">
                      <MapPin size={40} className="text-green-600" />
                      <span className="font-bold text-green-900">Walk Home</span>
                    </button>
                  </div>
                )}

                {/* Step 2: Select Guardian (Only if method is Guardian) */}
                {processStep === 2 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <UserCheck size={20} className="text-primary"/> Select Authorized Guardian
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {guardians[selectedStudent.id]?.map(g => (
                        <div key={g.id} onClick={() => handleSelectGuardian(g.id)} className="border border-gray-200 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <img src={g.imageUrl} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                          <div>
                            <p className="font-bold text-gray-800">{g.name}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">{g.relation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Verify & Sign */}
                {processStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                       <ShieldCheck className="text-yellow-600 shrink-0" />
                       <div>
                         <p className="font-bold text-yellow-800 text-sm">Verification Required</p>
                         <p className="text-xs text-yellow-700 mt-1">Please verify the person's identity and collect a signature.</p>
                       </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 text-center">
                       <p className="text-xs font-bold text-gray-400 uppercase mb-2">Signature</p>
                       <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-auto max-w-md border border-gray-200 cursor-crosshair touch-none">
                         <canvas 
                           ref={canvasRef}
                           width={400}
                           height={150}
                           className="w-full h-full"
                           onMouseDown={startDrawing}
                           onMouseMove={draw}
                           onMouseUp={stopDrawing}
                           onMouseLeave={stopDrawing}
                           onTouchStart={startDrawing}
                           onTouchMove={draw}
                           onTouchEnd={stopDrawing}
                         />
                       </div>
                       <button onClick={clearSignature} className="text-xs text-red-500 font-bold mt-2 hover:underline">Clear Signature</button>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer Buttons */}
              {(processStep > 1) && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                  <button onClick={() => setProcessStep(prev => prev - 1)} className="text-gray-500 font-bold text-sm hover:text-gray-800 px-2">
                    ← Back
                  </button>
                  
                  {processStep === 3 && (
                    <button 
                      onClick={completePickup}
                      className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold text-base shadow-lg shadow-green-200 hover:bg-green-600 transition-colors"
                    >
                      Confirm & Release
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Parent View ---
  if (userRole === UserRole.PARENT && currentChild) {
    const session = pickupSessions[currentChild.id] || { status: 'pending' };
    const myGuardians = guardians[currentChild.id] || [];

    return (
      <div className="space-y-6">
        {/* Status Card */}
        <div className={`rounded-3xl p-6 md:p-8 text-center border-2 ${
           session.status === 'pending' ? 'bg-orange-50 border-orange-100 text-orange-900' :
           'bg-green-50 border-green-100 text-green-900'
        }`}>
           <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm ${
             session.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
           }`}>
             {session.status === 'pending' ? <Clock size={40}/> : <CheckCircle size={40}/>}
           </div>
           <h2 className="text-2xl font-bold mb-2">
             {session.status === 'pending' ? `${currentChild.name} is in class` : `${currentChild.name} has been picked up`}
           </h2>
           <p className="opacity-80 font-medium">
             {session.status === 'pending' 
               ? 'Ready for pickup at usual time.' 
               : `Via ${session.method} at ${session.timestamp?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}
           </p>
        </div>

        {/* Estimated Arrival Card (Only if Pending) */}
        {session.status === 'pending' && (
          <div className="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
             {/* Decorative Background Icon */}
             <Clock className="absolute -right-6 -bottom-6 text-blue-50 w-32 h-32" />
             
             <div className="relative z-10 w-full flex flex-col items-center">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 shadow-inner">
                   <Clock size={32} />
                </div>
                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">Estimated Arrival</h3>
                <p className="text-4xl md:text-5xl font-black text-gray-800 my-4 tracking-tight">{estimatedPickupTime || '3:30 PM'}</p>
                
                <button 
                  onClick={handleOpenTimeModal}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2"
                >
                  <PenTool size={16} /> Update Arrival Time
                </button>
                <p className="text-xs text-gray-400 mt-4 font-medium flex items-center gap-1">
                   <CheckCircle size={12} className="text-green-500" /> Helps teachers prepare {currentChild.name} on time.
                </p>
             </div>
          </div>
        )}

        {/* Guardians Management */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
               <ShieldCheck className="text-primary" /> Authorized Guardians
             </h3>
             <button 
               onClick={() => setIsGuardianModalOpen(true)}
               className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
             >
               <Plus size={16} /> Add New
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {myGuardians.map(g => (
               <div key={g.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                 <img src={g.imageUrl} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                 <div className="flex-1">
                   <p className="font-bold text-gray-800">{g.name}</p>
                   <p className="text-xs text-gray-500 uppercase font-bold">{g.relation}</p>
                   <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone size={10}/> {g.phone}</p>
                 </div>
                 {onRemoveGuardian && (
                    <button 
                      onClick={() => onRemoveGuardian(currentChild.id, g.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Edit Time Modal */}
        {isTimeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Set Arrival Time</h3>
                <button onClick={() => setIsTimeModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSaveTime} className="p-6 space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Expected Time</label>
                    <input 
                      required
                      type="time" 
                      value={tempTime}
                      onChange={e => setTempTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-2xl font-bold text-center focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
                    />
                 </div>
                 <button 
                   type="submit"
                   className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                 >
                   Confirm Time
                 </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Guardian Modal */}
        {isGuardianModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Add Guardian</h3>
                <button onClick={() => setIsGuardianModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleAddGuardianSubmit} className="p-6 space-y-4">
                <div className="flex flex-col items-center justify-center mb-4 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-bold text-primary">Upload ID Photo</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newGuardianName}
                    onChange={e => setNewGuardianName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Grandma Betty"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Relation</label>
                    <input 
                      required
                      type="text" 
                      value={newGuardianRelation}
                      onChange={e => setNewGuardianRelation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="e.g. Aunt"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input 
                      required
                      type="tel" 
                      value={newGuardianPhone}
                      onChange={e => setNewGuardianPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-2"
                >
                  Save Guardian
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div>Access Denied</div>;
};

export default PickupManager;