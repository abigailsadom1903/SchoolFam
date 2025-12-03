
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Ruler, 
  Weight, 
  AlertCircle, 
  Plus, 
  X, 
  Trash2, 
  Droplet, 
  Heart, 
  AlertTriangle, 
  ClipboardList,
  FileText,
  Clock,
  MapPin,
  Camera,
  Video,
  CheckCircle,
  Eye,
  Download
} from 'lucide-react';
import { HealthRecord, UserRole, SimpleStudent, Child, Incident, User } from '../types';

interface HealthTrackerProps {
  records: HealthRecord[];
  incidents?: Incident[];
  userRole?: UserRole;
  currentUser?: User; // Added currentUser prop
  students?: SimpleStudent[]; 
  studentsFull?: Child[]; // Access full child details including medical info
  currentStudentId?: string; 
  onAddRecord?: (record: HealthRecord) => void;
  onDeleteRecord?: (id: string) => void;
  onAddIncident?: (incident: Incident) => void;
  onAcknowledgeIncident?: (id: string) => void;
}

const HealthTracker: React.FC<HealthTrackerProps> = ({ 
  records, 
  incidents = [],
  userRole, 
  currentUser,
  students, 
  studentsFull,
  currentStudentId, 
  onAddRecord, 
  onDeleteRecord,
  onAddIncident,
  onAcknowledgeIncident
}) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'vitals' | 'incidents'>('vitals');

  // Staff Check
  const isStaff = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Filter students: Teachers only see their class, Admins see all
  // Note: studentsFull is needed for class filtering.
  const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className && studentsFull)
    ? studentsFull.filter(s => s.class === currentUser.className)
    : studentsFull || students; // Fallback to all if not restricted or filtering data missing

  // Common: Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudentId || (accessibleStudents?.[0]?.id || ''));

  // Effect to sync prop changes and ensure selection is valid within accessible list
  useEffect(() => {
    if (currentStudentId) {
      setSelectedStudentId(currentStudentId);
    } else if (accessibleStudents && accessibleStudents.length > 0) {
      // If current selection is not in accessible list, reset to first accessible
      if (!selectedStudentId || !accessibleStudents.find(s => s.id === selectedStudentId)) {
         setSelectedStudentId(accessibleStudents[0].id);
      }
    }
  }, [currentStudentId, accessibleStudents, selectedStudentId]);

  // Derived Data
  const filteredRecords = records.filter(r => r.studentId === selectedStudentId);
  const latest = filteredRecords[filteredRecords.length - 1] || { height: 0, weight: 0 };
  const selectedStudentFull = studentsFull?.find(s => s.id === selectedStudentId);
  const filteredIncidents = incidents.filter(i => i.studentId === selectedStudentId);

  // Vitals Modal State
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  
  // Incident Modal State
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('Playground');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [incidentAction, setIncidentAction] = useState('');
  const [incidentMedia, setIncidentMedia] = useState<{ type: 'image' | 'video', url: string }[]>([]);

  // Detailed Incident View Modal (for Parents)
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);

  // --- Handlers ---

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRecord) return;
    onAddRecord({
      id: 'h_' + Date.now(),
      studentId: selectedStudentId,
      date: date,
      height: parseFloat(height),
      weight: parseFloat(weight)
    });
    setIsVitalsModalOpen(false);
    setHeight('');
    setWeight('');
    setDate('');
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddIncident) return;
    
    onAddIncident({
      id: 'inc_' + Date.now(),
      studentId: selectedStudentId,
      title: incidentTitle,
      description: incidentDesc,
      date: incidentDate,
      time: incidentTime || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      location: incidentLocation,
      severity: incidentSeverity,
      actionTaken: incidentAction,
      reportedBy: userRole === UserRole.PARENT ? 'Parent' : 'Staff',
      media: incidentMedia,
      acknowledgedByParent: false,
      status: 'submitted'
    } as any);

    setIsIncidentModalOpen(false);
    // Reset
    setIncidentTitle('');
    setIncidentDesc('');
    setIncidentAction('');
    setIncidentMedia([]);
  };

  const handleAddMediaMock = (type: 'image' | 'video') => {
    const mockUrl = type === 'image' 
      ? 'https://images.unsplash.com/photo-1589386417686-e47172a3dd8e?auto=format&fit=crop&q=80&w=400' 
      : '#'; // Video mock
    setIncidentMedia([...incidentMedia, { type, url: mockUrl }]);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Health & Wellness</h2>
           <p className="text-gray-500 text-sm mt-1">Track growth, medical alerts, and incident reports.</p>
           
           {/* Student Selector for Staff */}
           {isStaff && accessibleStudents && (
             <div className="mt-4 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm w-fit">
                <span className="text-xs text-gray-400 font-bold uppercase">Viewing:</span>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-primary outline-none cursor-pointer pr-2"
                >
                  {accessibleStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
             </div>
           )}
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('vitals')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'vitals' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Heart size={16} /> Vitals & Growth
          </button>
          <button 
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'incidents' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <AlertTriangle size={16} /> Incident Reports
          </button>
        </div>
      </div>

      {/* --- VITALS TAB --- */}
      {activeTab === 'vitals' && (
        <div className="space-y-6 animate-in fade-in">
           {/* Action Button */}
           {isStaff && (
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsVitalsModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus size={18} /> Update Vitals
                </button>
              </div>
            )}

            {/* Medical Alerts */}
            <div className={`p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-colors ${
              (selectedStudentFull?.allergies && selectedStudentFull.allergies !== 'None') || (selectedStudentFull?.medicalConditions && selectedStudentFull.medicalConditions !== 'None')
              ? 'bg-rose-50 border-rose-100' 
              : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${
                    (selectedStudentFull?.allergies && selectedStudentFull.allergies !== 'None') ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className={`font-bold text-lg ${(selectedStudentFull?.allergies && selectedStudentFull.allergies !== 'None') ? 'text-rose-800' : 'text-gray-800'}`}>Medical Alerts</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Allergies</p>
                  <p className={`font-bold text-lg ${(selectedStudentFull?.allergies && selectedStudentFull.allergies !== 'None') ? 'text-rose-600' : 'text-gray-800'}`}>
                    {selectedStudentFull?.allergies || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Conditions</p>
                  <p className="font-bold text-gray-800">{selectedStudentFull?.medicalConditions || 'None'}</p>
                </div>
              </div>
              {selectedStudentFull?.medicalNotes && (
                <div className="bg-white/60 p-3 rounded-xl border border-rose-100 mt-4">
                  <p className="text-xs font-bold text-rose-500 uppercase mb-1 flex items-center gap-1"><AlertCircle size={10}/> Important Notes</p>
                  <p className="text-sm text-rose-800 font-medium leading-relaxed">{selectedStudentFull.medicalNotes}</p>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Ruler size={20} />
                  <span className="font-bold text-xs uppercase tracking-wide">Height</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{latest.height || '--'} <span className="text-sm text-gray-400 font-normal">cm</span></p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Weight size={20} />
                  <span className="font-bold text-xs uppercase tracking-wide">Weight</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{latest.weight || '--'} <span className="text-sm text-gray-400 font-normal">kg</span></p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                  <Heart size={20} />
                  <span className="font-bold text-xs uppercase tracking-wide">BMI</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {(latest.height && latest.weight) ? (latest.weight / ((latest.height/100) ** 2)).toFixed(1) : '--'}
                </p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                  <Droplet size={20} />
                  <span className="font-bold text-xs uppercase tracking-wide">Blood Type</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{selectedStudentFull?.bloodType || '--'}</p>
              </div>
            </div>
            
            {/* Chart */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-6">Growth Chart</h3>
               <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredRecords} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} width={30} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{stroke: '#E5E7EB', strokeWidth: 2}} />
                    <Line yAxisId="left" type="monotone" dataKey="height" name="Height (cm)" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line yAxisId="right" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>
      )}

      {/* ... (Rest of component remains same) ... */}
      
      {/* --- INCIDENTS TAB --- */}
      {activeTab === 'incidents' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Action */}
          {isStaff && (
             <div className="flex justify-end">
               <button 
                 onClick={() => setIsIncidentModalOpen(true)}
                 className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30"
               >
                 <ClipboardList size={18} /> Report Incident
               </button>
             </div>
          )}

          {/* Incident List */}
          <div className="space-y-4">
             {filteredIncidents.length === 0 ? (
               <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 border-dashed">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="text-green-500" size={32} />
                 </div>
                 <h3 className="text-gray-800 font-bold mb-1">No Incidents Recorded</h3>
                 <p className="text-gray-400 text-sm">Great news! No incidents have been reported for this student.</p>
               </div>
             ) : (
               filteredIncidents.map(inc => (
                 <div key={inc.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                       {/* Date Box */}
                       <div className="shrink-0 flex md:flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 w-full md:w-24 h-fit gap-2 md:gap-0 border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase">{new Date(inc.date).toLocaleString('default', {month:'short'})}</span>
                          <span className="text-2xl font-bold text-gray-800">{new Date(inc.date).getDate()}</span>
                          <span className="text-xs text-gray-500">{new Date(inc.date).getFullYear()}</span>
                       </div>
                       
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-lg font-bold text-gray-800">{inc.title}</h3>
                             <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getSeverityColor(inc.severity)}`}>
                               {inc.severity} Severity
                             </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 mb-4">
                             <span className="flex items-center gap-1"><Clock size={14}/> {inc.time}</span>
                             <span className="flex items-center gap-1"><MapPin size={14}/> {inc.location}</span>
                             <span className="flex items-center gap-1"><FileText size={14}/> {inc.media?.length || 0} Attachments</span>
                          </div>

                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                            {inc.description}
                          </p>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                             <div className="flex items-center gap-2">
                               {inc.acknowledgedByParent ? (
                                 <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                   <CheckCircle size={12} /> Acknowledged by Parent
                                 </span>
                               ) : (
                                 <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                   <Clock size={12} /> Pending Acknowledgment
                                 </span>
                               )}
                             </div>
                             
                             <button 
                               onClick={() => setViewingIncident(inc)}
                               className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                             >
                               <Eye size={16} /> View Details
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      {/* ... (Modals remain same) ... */}
      {/* --- Vitals Modal --- */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Update Stats</h3>
              <button onClick={() => setIsVitalsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleVitalsSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date (YYYY-MM)</label>
                <input required type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. 2023-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
                  <input required type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
                  <input required type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-2">Save Record</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Create Incident Modal --- */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ClipboardList size={20} className="text-purple-600"/> Report Incident</h3>
              <button onClick={() => setIsIncidentModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleIncidentSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Incident Title</label>
                <input 
                  required
                  type="text" 
                  value={incidentTitle}
                  onChange={e => setIncidentTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Scraped Knee"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input 
                      required
                      type="date" 
                      value={incidentDate}
                      onChange={e => setIncidentDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                    <input 
                      type="time" 
                      value={incidentTime}
                      onChange={e => setIncidentTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location <span className="text-rose-500">*</span></label>
                   <select 
                      required
                      value={incidentLocation}
                      onChange={e => setIncidentLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
                   >
                     <option value="Classroom">Classroom</option>
                     <option value="Playground">Playground</option>
                     <option value="Cafeteria">Cafeteria</option>
                     <option value="Hallway">Hallway</option>
                     <option value="Gym">Gym</option>
                     <option value="Bus">School Bus</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity</label>
                   <select 
                      value={incidentSeverity}
                      onChange={e => setIncidentSeverity(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
                   >
                     <option value="low">Low (Minor)</option>
                     <option value="medium">Medium</option>
                     <option value="high">High (Urgent)</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  required
                  value={incidentDesc}
                  onChange={e => setIncidentDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  placeholder="Describe exactly what happened..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Action Taken</label>
                <input 
                  required
                  type="text" 
                  value={incidentAction}
                  onChange={e => setIncidentAction(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Applied ice pack, cleaned wound"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Attachments (Optional)</label>
                <div className="flex gap-4">
                   <button 
                    type="button"
                    onClick={() => handleAddMediaMock('image')}
                    className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                   >
                     <Camera size={24} className="mb-1" />
                     <span className="text-xs font-bold">Add Photo</span>
                   </button>
                   <button 
                    type="button"
                    onClick={() => handleAddMediaMock('video')}
                    className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                   >
                     <Video size={24} className="mb-1" />
                     <span className="text-xs font-bold">Add Video</span>
                   </button>
                </div>
                {incidentMedia.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {incidentMedia.map((m, i) => (
                      <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                        {m.type === 'image' ? (
                          <img src={m.url} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white"><Video size={16}/></div>
                        )}
                        <button 
                          type="button"
                          onClick={() => setIncidentMedia(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 bg-black/50 text-white p-0.5 rounded-full"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <button 
                  onClick={handleIncidentSubmit}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
               >
                 Submit Report
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Incident Details Modal --- */}
      {viewingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                 <div>
                   <h3 className="text-xl font-bold text-gray-800">{viewingIncident.title}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {new Date(viewingIncident.date).toDateString()} at {viewingIncident.time}</span>
                   </div>
                 </div>
                 <button onClick={() => setViewingIncident(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X size={20} className="text-gray-500" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {/* Status Banner */}
                 {viewingIncident.acknowledgedByParent ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
                       <CheckCircle className="text-green-500 shrink-0" size={20} />
                       <div>
                          <p className="text-xs font-bold text-green-700 uppercase">Read & Acknowledged</p>
                          <p className="text-xs text-green-600">You acknowledged this report on {new Date(viewingIncident.acknowledgedAt!).toLocaleDateString()}.</p>
                       </div>
                    </div>
                 ) : userRole === UserRole.PARENT && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                       <AlertCircle className="text-orange-500 shrink-0" size={20} />
                       <div>
                          <p className="text-xs font-bold text-orange-700 uppercase">Acknowledgment Required</p>
                          <p className="text-xs text-orange-600">Please review the details below.</p>
                       </div>
                    </div>
                 )}

                 {/* Details Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                       <p className="font-bold text-gray-800">{viewingIncident.location}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <p className="text-xs font-bold text-gray-400 uppercase mb-1">Severity</p>
                       <p className={`font-bold capitalize ${
                          viewingIncident.severity === 'high' ? 'text-red-600' : 
                          viewingIncident.severity === 'medium' ? 'text-orange-600' : 'text-blue-600'
                       }`}>{viewingIncident.severity}</p>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-100">
                      {viewingIncident.description}
                    </p>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Action Taken</h4>
                    <p className="text-gray-600 text-sm leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-100">
                      {viewingIncident.actionTaken}
                    </p>
                 </div>

                 {/* Media Gallery */}
                 {viewingIncident.media && viewingIncident.media.length > 0 && (
                    <div>
                       <h4 className="text-sm font-bold text-gray-800 mb-2">Attachments</h4>
                       <div className="grid grid-cols-2 gap-2">
                          {viewingIncident.media.map((m, i) => (
                             <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black group">
                                {m.type === 'image' ? (
                                   <img src={m.url} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-white">
                                      <Video size={32} />
                                   </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <button className="bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white">
                                      <Download size={20} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

              {/* Acknowledge Action */}
              {userRole === UserRole.PARENT && !viewingIncident.acknowledgedByParent && (
                 <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button 
                       onClick={() => {
                          if (onAcknowledgeIncident) onAcknowledgeIncident(viewingIncident.id);
                          setViewingIncident(prev => prev ? ({...prev, acknowledgedByParent: true, acknowledgedAt: new Date().toISOString()}) : null);
                       }}
                       className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                    >
                       <CheckCircle size={18} /> I have read and understood this report
                    </button>
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};

export default HealthTracker;
