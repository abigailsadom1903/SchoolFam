
import React, { useState, useRef } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search,
  Plus,
  PenTool,
  Upload,
  FileText,
  PieChart,
  Users,
  History,
  Filter,
  Download,
  X
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { UserRole, Child, AttendanceRecord, AbsenceRequest, User } from '../types';

interface AttendanceManagerProps {
  userRole: UserRole;
  currentUser?: User;
  students?: Child[];
  currentChild?: Child;
  attendanceRecords: AttendanceRecord[];
  absenceRequests: AbsenceRequest[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onRequestAbsence: (request: AbsenceRequest) => void;
  onUpdateAbsenceRequestStatus: (id: string, status: 'approved' | 'rejected') => void;
}

// --- Custom Tooltips ---

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 min-w-[140px] animate-in fade-in zoom-in-95 duration-200 z-50">
        <p className="font-bold text-gray-800 mb-3 text-sm border-b border-gray-100 pb-2">{label}</p>
        <div className="space-y-2">
          {[...payload].reverse().map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                <span className="text-gray-600 font-medium capitalize">{entry.name}</span>
              </div>
              <span className="font-extrabold text-gray-800 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-50">
        <div className="flex items-center gap-2 mb-1">
           <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: data.payload.color }}></div>
           <span className="font-bold text-gray-800 text-sm">{data.name}</span>
        </div>
        <p className="text-gray-500 text-xs font-medium pl-4.5">
          {data.value} Students
        </p>
      </div>
    );
  }
  return null;
};

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  userRole,
  currentUser,
  students,
  currentChild,
  attendanceRecords,
  absenceRequests,
  onUpdateAttendance,
  onRequestAbsence,
  onUpdateAbsenceRequestStatus
}) => {
  // Common State
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'requests' | 'dashboard' | 'master_list'>('register');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Teacher/Admin State: Bulk Register & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Parent State: Request Absence
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqStartDate, setReqStartDate] = useState('');
  const [reqEndDate, setReqEndDate] = useState('');
  const [reqReason, setReqReason] = useState('');
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-200';
      case 'absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} />;
      case 'absent': return <XCircle size={16} />;
      case 'late': return <Clock size={16} />;
      case 'excused': return <FileText size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  // --- Teacher/Admin Functions ---

  const handleBulkStatusUpdate = (studentIds: string[], status: AttendanceRecord['status']) => {
    if (!onUpdateAttendance) return;
    studentIds.forEach(id => {
      onUpdateAttendance({
        id: `at_${id}_${selectedDate}`,
        studentId: id,
        date: selectedDate,
        status: status,
        recordedBy: userRole === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Teacher',
        timestamp: new Date().toISOString()
      });
    });
  };

  // Filter visible students based on Role
  const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className)
    ? students?.filter(s => s.class === currentUser.className)
    : students;

  const filteredStudents = accessibleStudents?.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || s.class === filterClass;
    
    // For Status filter, we look at the record for the selected date OR the student's current status if today
    const record = attendanceRecords.find(r => r.studentId === s.id && r.date === selectedDate);
    const currentStatus = record ? record.status : (selectedDate === new Date().toISOString().split('T')[0] ? s.attendanceStatus : 'absent'); // Default to absent if no record for past dates
    
    const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Analytics Data Preparation
  const getLast7DaysStats = () => {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Mock random variation for demo purposes if records are sparse
      // In production, this would calculate strictly from attendanceRecords
      const totalStudents = accessibleStudents?.length || 45;
      const basePresent = Math.floor(totalStudents * 0.85); 
      const randomVar = Math.floor(Math.random() * 5);
      
      const presentCount = Math.min(basePresent + randomVar, totalStudents); 
      const lateCount = Math.floor(Math.random() * 4);
      const absentCount = Math.max(0, totalStudents - presentCount - lateCount);

      stats.push({
        name: dayName,
        Present: presentCount,
        Absent: absentCount,
        Late: lateCount
      });
    }
    return stats;
  };

  // --- Parent Functions ---

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild) return;
    
    onRequestAbsence({
      id: `req_${Date.now()}`,
      studentId: currentChild.id,
      studentName: currentChild.name,
      startDate: reqStartDate,
      endDate: reqEndDate,
      reason: reqReason,
      status: 'pending',
      requestedOn: new Date().toISOString().split('T')[0],
      attachmentUrl: attachmentName ? '#' : undefined // Mock URL
    });
    
    setIsRequestModalOpen(false);
    setReqStartDate('');
    setReqEndDate('');
    setReqReason('');
    setAttachmentName(null);
  };

  // Parent Stats
  const childRecords = attendanceRecords.filter(r => r.studentId === currentChild?.id);
  const presentCount = childRecords.filter(r => r.status === 'present').length;
  const totalCount = childRecords.length || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);
  
  const pieData = [
    { name: 'Present', value: presentCount, color: '#10B981' },
    { name: 'Absent', value: childRecords.filter(r => r.status === 'absent').length, color: '#EF4444' },
    { name: 'Late', value: childRecords.filter(r => r.status === 'late').length, color: '#F59E0B' },
    { name: 'Excused', value: childRecords.filter(r => r.status === 'excused').length, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  // --- Super Admin Stats ---
  const getSuperAdminStats = () => {
    const total = students?.length || 0;
    // Calculate based on current 'attendanceStatus' property of students for "Today"
    const present = students?.filter(s => s.attendanceStatus === 'present').length || 0;
    const absent = students?.filter(s => s.attendanceStatus === 'absent').length || 0;
    const late = students?.filter(s => s.attendanceStatus === 'late').length || 0;
    const excused = students?.filter(s => s.attendanceStatus === 'excused').length || 0;
    
    return { total, present, absent, late, excused };
  };

  const superAdminStats = getSuperAdminStats();
  const superAdminPieData = [
    { name: 'Present', value: superAdminStats.present, color: '#10B981' },
    { name: 'Absent', value: superAdminStats.absent, color: '#EF4444' },
    { name: 'Late', value: superAdminStats.late, color: '#F59E0B' },
    { name: 'Excused', value: superAdminStats.excused, color: '#3B82F6' },
  ];

  // --- Render ---

  // 1. SUPER ADMIN & ADMIN VIEW
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
    // Set default tab for admin if currently on 'register' (which is default for all)
    if (activeTab === 'register') setActiveTab('dashboard');

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <ClipboardCheck className="text-primary" /> School Attendance
             </h2>
             <p className="text-gray-500 mt-1">Overview and management for all classes.</p>
           </div>
           
           <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
             <button
               onClick={() => setActiveTab('dashboard')}
               className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                 activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
               }`}
             >
               <PieChart size={16} /> Dashboard
             </button>
             <button
               onClick={() => setActiveTab('master_list')}
               className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                 activeTab === 'master_list' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
               }`}
             >
               <Users size={16} /> All Students
             </button>
           </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
             {/* KPI Cards */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-xs font-bold text-gray-400 uppercase">Total Students</p>
                   <h3 className="text-3xl font-bold text-gray-800 mt-1">{superAdminStats.total}</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-xs font-bold text-green-500 uppercase">Present Today</p>
                   <h3 className="text-3xl font-bold text-green-600 mt-1">{superAdminStats.present}</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-xs font-bold text-red-500 uppercase">Absent</p>
                   <h3 className="text-3xl font-bold text-red-600 mt-1">{superAdminStats.absent}</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-xs font-bold text-blue-500 uppercase">Attendance Rate</p>
                   <h3 className="text-3xl font-bold text-blue-600 mt-1">
                     {Math.round((superAdminStats.present / (superAdminStats.total || 1)) * 100)}%
                   </h3>
                </div>
             </div>

             {/* Charts Row */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                   <h3 className="font-bold text-gray-800 mb-4">Today's Status Distribution</h3>
                   <div className="flex-1 min-h-[250px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={superAdminPieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {superAdminPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <Tooltip content={<CustomPieTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                         <span className="text-3xl font-bold text-gray-800">{superAdminStats.total}</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase">Students</span>
                      </div>
                   </div>
                </div>

                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                   <h3 className="font-bold text-gray-800 mb-4">Weekly School Attendance Trends</h3>
                   <div className="flex-1 min-h-[250px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={getLast7DaysStats()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#F3F4F6'}} content={<CustomBarTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                          <Bar dataKey="Present" stackId="a" fill="#10B981" radius={[0,0,4,4]} barSize={40} />
                          <Bar dataKey="Late" stackId="a" fill="#F59E0B" />
                          <Bar dataKey="Absent" stackId="a" fill="#EF4444" radius={[4,4,0,0]} />
                        </RechartsBarChart>
                     </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'master_list' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
             {/* List Header & Filters */}
             <div className="p-6 border-b border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-800">Master Student List</h3>
                   <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                     <button onClick={() => handleDateChange(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} className="text-gray-500"/></button>
                     <span className="font-bold text-gray-800 text-sm flex items-center justify-center gap-2">
                       <Calendar size={14} className="text-primary"/> {new Date(selectedDate).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}
                     </span>
                     <button onClick={() => handleDateChange(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={20} className="text-gray-500"/></button>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search student name..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                   </div>
                   <div className="relative min-w-[180px]">
                      <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
                      <select 
                        value={filterClass}
                        onChange={e => setFilterClass(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="all">All Classes</option>
                        {Array.from(new Set(students?.map(s => s.class))).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                   </div>
                   <div className="relative min-w-[150px]">
                      <select 
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                   </div>
                   <button 
                     onClick={() => alert("Exporting report...")}
                     className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                   >
                     <Download size={16} /> Export
                   </button>
                </div>
             </div>

             {/* Table */}
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50 border-b border-gray-100">
                   <tr>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Class</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Check-in Time</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Remarks</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {filteredStudents?.map(student => {
                      const record = attendanceRecords.find(r => r.studentId === student.id && r.date === selectedDate);
                      // Fallback to student.attendanceStatus if date is today and no specific record yet
                      const status = record ? record.status : (selectedDate === new Date().toISOString().split('T')[0] ? student.attendanceStatus : 'absent');
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <img src={student.avatarUrl} className="w-8 h-8 rounded-full bg-gray-100" />
                                 <span className="font-bold text-gray-800 text-sm">{student.name}</span>
                              </div>
                           </td>
                           <td className="p-4 text-sm text-gray-600 font-medium">
                              {student.class}
                           </td>
                           <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(status)}`}>
                                 {getStatusIcon(status)} {status}
                              </span>
                           </td>
                           <td className="p-4 text-sm text-gray-500">
                              {status === 'present' || status === 'late' ? '08:30 AM' : '--:--'}
                           </td>
                           <td className="p-4 text-sm text-gray-500">
                              {record?.remarks || '-'}
                           </td>
                        </tr>
                      );
                   })}
                 </tbody>
               </table>
               {filteredStudents?.length === 0 && (
                 <div className="p-8 text-center text-gray-400 italic">No students found matching your filters.</div>
               )}
             </div>
          </div>
        )}
      </div>
    );
  }

  // 2. TEACHER VIEW
  if (userRole === UserRole.TEACHER) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <ClipboardCheck className="text-primary" /> Attendance Manager
             </h2>
             <p className="text-gray-500 mt-1">
               {currentUser?.className ? `Managing ${currentUser.className}` : 'Track daily attendance and manage requests.'}
             </p>
           </div>
           
           <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
             {(['register', 'history', 'requests'] as const).map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                   activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                 }`}
               >
                 {tab === 'register' ? 'Daily Register' : tab === 'history' ? 'Analytics' : 'Absence Req.'}
               </button>
             ))}
           </div>
        </div>

        {activeTab === 'register' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             {/* Register Header */}
             <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
               <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                 <button onClick={() => handleDateChange(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} className="text-gray-500"/></button>
                 <span className="font-bold text-gray-800 min-w-[140px] text-center flex items-center justify-center gap-2">
                   <Calendar size={16} className="text-primary"/> {new Date(selectedDate).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}
                 </span>
                 <button onClick={() => handleDateChange(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={20} className="text-gray-500"/></button>
               </div>
               
               <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search student..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full"
                    />
                 </div>
                 <button 
                  onClick={() => handleBulkStatusUpdate(filteredStudents?.map(s => s.id) || [], 'present')}
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-200 transition-colors whitespace-nowrap"
                 >
                   Mark All Present
                 </button>
               </div>
             </div>

             {/* Register List */}
             <div className="divide-y divide-gray-100">
               {filteredStudents?.map(student => {
                 const record = attendanceRecords.find(r => r.studentId === student.id && r.date === selectedDate);
                 const status = record?.status;

                 return (
                   <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3 w-48 shrink-0">
                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full border border-gray-100" />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                          <p className="text-xs text-gray-400">#{student.id.slice(-4)}</p>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-wrap gap-2">
                        {(['present', 'late', 'absent', 'excused'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => handleBulkStatusUpdate([student.id], s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all flex items-center gap-1 ${
                              status === s ? getStatusColor(s) + ' ring-2 ring-offset-1 ring-gray-100' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {getStatusIcon(s)} {s}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button 
                          onClick={() => {
                            setEditingNoteId(editingNoteId === student.id ? null : student.id);
                            setNoteText(record?.remarks || '');
                          }}
                          className={`p-2 rounded-xl transition-colors ${record?.remarks ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-gray-100'}`}
                          title="Add Remark"
                        >
                          <PenTool size={16} />
                        </button>
                        <button className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Upload Proof">
                          <Upload size={16} />
                        </button>
                      </div>

                      {/* Expanded Note Area */}
                      {editingNoteId === student.id && (
                        <div className="w-full mt-2 basis-full bg-gray-50 p-3 rounded-xl flex gap-2 animate-in slide-in-from-top-1">
                          <input 
                            type="text" 
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Add a remark (e.g. Arrived at 9:15, Bus delay)"
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                          />
                          <button 
                            onClick={() => {
                              if (record) onUpdateAttendance({ ...record, remarks: noteText });
                              setEditingNoteId(null);
                            }}
                            className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      )}
                   </div>
                 );
               })}
               {filteredStudents?.length === 0 && (
                 <div className="p-8 text-center text-gray-400">
                   No students found. {currentUser?.className ? `(Showing ${currentUser.className})` : ''}
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-6">Weekly Attendance Trend</h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={getLast7DaysStats()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#F3F4F6'}} content={<CustomBarTooltip />} />
                      <Bar dataKey="Present" stackId="a" fill="#10B981" radius={[0,0,4,4]} barSize={32} />
                      <Bar dataKey="Late" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="Absent" stackId="a" fill="#EF4444" radius={[4,4,0,0]} />
                    </RechartsBarChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Low Attendance Alerts</h3>
                <div className="space-y-3">
                   {/* Mock Logic for 'At Risk' - Filtered by access */}
                   {accessibleStudents?.slice(0, 2).map(s => (
                     <div key={s.id} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl">
                       <div className="flex items-center gap-3">
                         <img src={s.avatarUrl} className="w-10 h-10 rounded-full" />
                         <div>
                           <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                           <p className="text-xs text-rose-600 font-bold">82% Attendance</p>
                         </div>
                       </div>
                       <button className="text-xs bg-white text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-bold hover:bg-rose-100">
                         Contact Parent
                       </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {absenceRequests.length === 0 ? (
               <div className="col-span-full p-8 text-center text-gray-400">No pending absence requests.</div>
             ) : (
               absenceRequests.map(req => (
                 <div key={req.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${req.status === 'pending' ? 'bg-orange-400' : req.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex justify-between items-start mb-3 pl-2">
                       <div>
                         <p className="text-xs text-gray-400 font-bold uppercase">{req.studentName}</p>
                         <h4 className="font-bold text-gray-800 text-lg">{req.reason}</h4>
                       </div>
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                         req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                         req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {req.status}
                       </span>
                    </div>
                    
                    <div className="pl-2 space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-primary" />
                        <span>{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>Requested on {new Date(req.requestedOn).toLocaleDateString()}</span>
                      </div>
                      {req.attachmentUrl && (
                        <div className="flex items-center gap-2 text-xs text-blue-500 font-bold mt-2">
                          <FileText size={12} />
                          <span>Attachment Provided</span>
                        </div>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 pl-2">
                         <button 
                          onClick={() => onUpdateAbsenceRequestStatus(req.id, 'approved')}
                          className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                         >
                           Approve
                         </button>
                         <button 
                          onClick={() => onUpdateAbsenceRequestStatus(req.id, 'rejected')}
                          className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                         >
                           Reject
                         </button>
                      </div>
                    )}
                 </div>
               ))
             )}
          </div>
        )}
      </div>
    );
  }

  // 3. PARENT VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col sm:flex-row items-center gap-6">
           <div className="relative w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                 <RechartsPieChart>
                    <Pie
                      data={pieData}
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                 </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-bold text-gray-800">{attendanceRate}%</span>
                 <span className="text-[10px] text-gray-400 uppercase font-bold">Present</span>
              </div>
           </div>

           <div className="flex-1 w-full">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>
                  <p className="text-gray-500 text-sm">Year to Date Overview</p>
               </div>
               <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
               >
                 <Plus size={16} /> Report Absence
               </button>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-green-50 p-3 rounded-2xl border border-green-100 text-center">
                   <p className="text-lg font-bold text-green-700">{presentCount}</p>
                   <p className="text-[10px] font-bold text-green-500 uppercase">Present</p>
                </div>
                <div className="bg-red-50 p-3 rounded-2xl border border-red-100 text-center">
                   <p className="text-lg font-bold text-red-700">{childRecords.filter(r => r.status === 'absent').length}</p>
                   <p className="text-[10px] font-bold text-red-500 uppercase">Absent</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-100 text-center">
                   <p className="text-lg font-bold text-yellow-700">{childRecords.filter(r => r.status === 'late').length}</p>
                   <p className="text-[10px] font-bold text-yellow-500 uppercase">Late</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* History */}
         <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
               <History size={18} className="text-gray-400" />
               <h3 className="font-bold text-gray-800">Recent History</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
               {childRecords.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">No records found.</div>
               ) : (
                 [...childRecords].reverse().map(record => (
                   <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`w-2 h-10 rounded-full ${
                            record.status === 'present' ? 'bg-green-500' : 
                            record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                         }`}></div>
                         <div>
                            <p className="font-bold text-gray-800">{new Date(record.date).toLocaleDateString(undefined, {weekday: 'long', month:'long', day:'numeric'})}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                               <Clock size={10} /> Recorded by {record.recordedBy} at {new Date(record.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(record.status)}`}>
                            {record.status}
                         </span>
                         {record.remarks && <p className="text-xs text-gray-500 mt-1 italic max-w-[150px] truncate">"{record.remarks}"</p>}
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Requests Status */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4">My Requests</h3>
            <div className="space-y-3">
               {absenceRequests.filter(r => r.studentId === currentChild?.id).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No absence requests submitted.</p>
               ) : (
                  absenceRequests.filter(r => r.studentId === currentChild?.id).map(req => (
                     <div key={req.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-xs font-bold text-gray-600">{new Date(req.startDate).toLocaleDateString()}</span>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              req.status === 'approved' ? 'bg-green-100 text-green-700' :
                              req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                           }`}>{req.status}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-1">{req.reason}</p>
                        {req.attachmentUrl && (
                           <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1">
                             <FileText size={10} /> 1 Attachment
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Report Absence</h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From Date</label>
                  <input 
                    required
                    type="date" 
                    value={reqStartDate}
                    onChange={e => setReqStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To Date</label>
                  <input 
                    required
                    type="date" 
                    value={reqEndDate}
                    onChange={e => setReqEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason</label>
                <textarea 
                  required
                  value={reqReason}
                  onChange={e => setReqReason(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="e.g. Doctor appointment, Family emergency..."
                />
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                 />
                 <Upload size={24} className="mb-2" />
                 <p className="text-xs font-medium">{attachmentName || "Attach Doctor's Note (Optional)"}</p>
                 <p className="text-[10px] text-gray-300 mt-1">Tap to browse files</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
