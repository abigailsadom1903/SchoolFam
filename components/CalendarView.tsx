
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  X, 
  Calendar as CalendarIcon, 
  Check, 
  BookOpen, 
  Users, 
  Flag, 
  AlertTriangle,
  Download,
  Share2,
  MoreVertical,
  Filter,
  CheckCircle,
  Repeat
} from 'lucide-react';
import { SchoolEvent, UserRole, EventCategory, EventSubType, RecurrenceType } from '../types';

interface CalendarViewProps {
  events: SchoolEvent[];
  userRole: UserRole;
  onAddEvent?: (event: SchoolEvent) => void;
  onDeleteEvent?: (id: string) => void;
  onRSVP?: (id: string, status: 'going' | 'not_going') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, userRole, onAddEvent, onDeleteEvent, onRSVP }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'details' | 'schedule' | 'rsvp'>('details');
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('class');
  const [subType, setSubType] = useState<EventSubType>('activity');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [rsvpReq, setRsvpReq] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceType>('weekly');

  const canEdit = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Helper: Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days: daysInMonth, firstDay } = getDaysInMonth(currentDate);

  // Helper: Get Category Styles
  const getCategoryStyles = (cat: EventCategory, type?: EventSubType) => {
    if (type === 'test' || type === 'assignment') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (type === 'trip') return 'bg-orange-100 text-orange-700 border-orange-200';
    
    switch (cat) {
      case 'academic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'school': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'class': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Helper: Conflict Detection
  const checkConflict = () => {
    if (!startTime || !dateStr) return false;
    // Simple mock conflict logic: checks if any event exists on same day/time
    return events.some(e => {
      const eDate = new Date(e.date).toISOString().split('T')[0];
      return eDate === dateStr && e.startTime === startTime;
    });
  };

  const hasConflict = checkConflict();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvent) return;

    const newEvent: SchoolEvent = {
      id: 'evt_' + Date.now(),
      title,
      category,
      subType,
      date: new Date(dateStr),
      startTime,
      endTime,
      location,
      description,
      rsvpReq,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : 'none',
      rsvpStatus: 'pending' // Default for creator
    };

    onAddEvent(newEvent);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset Form
    setTitle('');
    setCategory('class');
    setSubType('activity');
    setDateStr(new Date().toISOString().split('T')[0]);
    setStartTime('');
    setEndTime('');
    setLocation('');
    setDescription('');
    setRsvpReq(false);
    setIsRecurring(false);
    setModalTab('details');
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    if (filterCategory === 'all') return true;
    return e.category === filterCategory;
  });

  const checkRecurrence = (event: SchoolEvent, targetDate: Date) => {
    if (!event.isRecurring || !event.recurrenceRule) return false;
    
    const eventStartDate = new Date(event.date);
    // Don't show before start date
    if (targetDate < new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate())) return false;

    if (event.recurrenceRule === 'daily') return true;
    if (event.recurrenceRule === 'weekly') {
      return targetDate.getDay() === eventStartDate.getDay();
    }
    if (event.recurrenceRule === 'monthly') {
      return targetDate.getDate() === eventStartDate.getDate();
    }
    return false;
  };

  const getEventsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return filteredEvents.filter(e => {
      const eDate = new Date(e.date);
      const isSameDay = eDate.getDate() === day && 
                        eDate.getMonth() === currentDate.getMonth() && 
                        eDate.getFullYear() === currentDate.getFullYear();
      
      return isSameDay || checkRecurrence(e, targetDate);
    });
  };

  const selectedDayEvents = selectedDate ? filteredEvents.filter(e => {
     const eDate = new Date(e.date);
     const isSameDay = eDate.getDate() === selectedDate.getDate() &&
                       eDate.getMonth() === selectedDate.getMonth() &&
                       eDate.getFullYear() === selectedDate.getFullYear();
     return isSameDay || checkRecurrence(e, selectedDate);
  }) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* Sidebar (Filters & Quick Actions) */}
      <div className="w-full lg:w-64 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6 shrink-0 h-fit lg:h-full overflow-y-auto">
         {canEdit && (
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
           >
             <Plus size={18} /> Create Event
           </button>
         )}

         <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
             <Filter size={12} /> Calendars
           </h3>
           <div className="space-y-2">
              <button 
                onClick={() => setFilterCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filterCategory === 'all' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Events
              </button>
              <button 
                onClick={() => setFilterCategory('academic')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${filterCategory === 'academic' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Academic
              </button>
              <button 
                onClick={() => setFilterCategory('class')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${filterCategory === 'class' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Class Activities
              </button>
              <button 
                onClick={() => setFilterCategory('school')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${filterCategory === 'school' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> School Wide
              </button>
           </div>
         </div>

         <div className="mt-auto">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
               <h4 className="font-bold text-gray-800 text-sm mb-2">Sync Calendar</h4>
               <p className="text-xs text-gray-500 mb-3">Export schedule to your personal calendar app.</p>
               <button onClick={() => alert("Downloading iCal file...")} className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                 <Download size={14} /> Export iCal
               </button>
            </div>
         </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
         {/* Calendar Header */}
         <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                 <CalendarIcon className="text-primary" /> {currentMonthName} {currentYear}
               </h2>
               <div className="flex bg-gray-100 rounded-xl p-1">
                 <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-800"><ChevronLeft size={18} /></button>
                 <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-800"><ChevronRight size={18} /></button>
               </div>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
               <button 
                 onClick={() => setViewMode('month')}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
               >
                 Month
               </button>
               <button 
                 onClick={() => setViewMode('week')}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
               >
                 Week
               </button>
            </div>
         </div>

         {/* Calendar Grid */}
         <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-7 mb-4">
              {days.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 md:gap-4 auto-rows-fr h-full">
               {/* Padding Days */}
               {[...Array(firstDay)].map((_, i) => (
                 <div key={`pad-${i}`} className="bg-gray-50/50 rounded-xl min-h-[80px] opacity-30"></div>
               ))}

               {/* Days */}
               {[...Array(daysInMonth)].map((_, i) => {
                 const day = i + 1;
                 const dayEvents = getEventsForDay(day);
                 const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
                 
                 return (
                   <div 
                     key={day}
                     onClick={() => setSelectedDate(new Date(currentYear, currentDate.getMonth(), day))}
                     className={`rounded-xl border p-2 min-h-[100px] flex flex-col transition-all cursor-pointer hover:shadow-md ${
                       isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'
                     }`}
                   >
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                        isSelected ? 'bg-primary text-white' : 'text-gray-700'
                      }`}>
                        {day}
                      </span>
                      
                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} className={`flex items-center gap-1 text-[10px] truncate px-1.5 py-0.5 rounded-md font-bold ${getCategoryStyles(ev.category, ev.subType)}`}>
                             {ev.isRecurring && <Repeat size={8} className="shrink-0" />}
                             {ev.startTime ? ev.startTime : '•'} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-gray-400 font-bold pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      {/* Side Panel (Agenda/Details) */}
      <div className="w-full lg:w-80 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 shrink-0 flex flex-col h-fit lg:h-full">
         <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">
               {selectedDate ? selectedDate.toLocaleDateString(undefined, {weekday: 'long', month:'long', day:'numeric'}) : 'Select a date'}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Daily Agenda</p>
         </div>

         <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedDayEvents.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                     <CalendarIcon size={20} />
                  </div>
                  <p className="text-sm">No events planned.</p>
                  {canEdit && (
                    <button 
                      onClick={() => {
                         if (selectedDate) setDateStr(selectedDate.toISOString().split('T')[0]);
                         setIsModalOpen(true);
                      }}
                      className="text-primary text-xs font-bold mt-2 hover:underline"
                    >
                      + Add Event
                    </button>
                  )}
               </div>
            ) : (
               selectedDayEvents.map(event => (
                  <div key={event.id} className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                     <div className="flex justify-between items-start mb-2">
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${getCategoryStyles(event.category, event.subType)}`}>
                           {event.subType}
                        </div>
                        {canEdit && onDeleteEvent && (
                           <button 
                             onClick={() => onDeleteEvent(event.id)}
                             className="text-gray-300 hover:text-red-500 transition-colors"
                           >
                             <Trash2 size={14} />
                           </button>
                        )}
                     </div>
                     
                     <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                       {event.title}
                       {event.isRecurring && <Repeat size={12} className="text-gray-400" />}
                     </h4>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                           <Clock size={12} />
                           <span>{event.startTime ? `${event.startTime} - ${event.endTime}` : 'All Day'}</span>
                        </div>
                        {event.location && (
                           <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin size={12} />
                              <span>{event.location}</span>
                           </div>
                        )}
                     </div>

                     {/* RSVP Section */}
                     {event.rsvpReq && (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                           {userRole === UserRole.PARENT ? (
                              <div className="flex gap-2">
                                 <button 
                                   onClick={() => onRSVP && onRSVP(event.id, 'going')}
                                   className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      event.rsvpStatus === 'going' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                   }`}
                                 >
                                   Going
                                 </button>
                                 <button 
                                   onClick={() => onRSVP && onRSVP(event.id, 'not_going')}
                                   className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      event.rsvpStatus === 'not_going' ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                   }`}
                                 >
                                   Not Going
                                 </button>
                              </div>
                           ) : (
                              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                                 <span>RSVP Required</span>
                                 <span className="text-primary font-bold">{event.attendees?.filter(a => a.status === 'going').length || 0} Attending</span>
                              </div>
                           )}
                        </div>
                     )}
                     
                     {/* Materials */}
                     {event.materials && event.materials.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                           {event.materials.map((m, idx) => (
                              <a key={idx} href={m.url} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors">
                                 <Download size={10} /> {m.name}
                              </a>
                           ))}
                        </div>
                     )}
                  </div>
               ))
            )}
         </div>
      </div>

      {/* Teacher: Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="text-lg font-bold text-gray-800">Create Calendar Event</h3>
                 <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} className="text-gray-500"/></button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 mx-6 mt-6 rounded-xl shrink-0">
                 {(['details', 'schedule', 'rsvp'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setModalTab(tab)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${modalTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                    >
                       {tab}
                    </button>
                 ))}
              </div>

              <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6">
                 {modalTab === 'details' && (
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title</label>
                          <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. Science Fair" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                             <select value={category} onChange={e => setCategory(e.target.value as EventCategory)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none appearance-none">
                                <option value="class">Class Activity</option>
                                <option value="academic">Academic</option>
                                <option value="school">School Wide</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                             <select value={subType} onChange={e => setSubType(e.target.value as EventSubType)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none appearance-none">
                                <option value="activity">Activity</option>
                                <option value="test">Test / Exam</option>
                                <option value="assignment">Assignment</option>
                                <option value="trip">Field Trip</option>
                                <option value="meeting">Meeting</option>
                                <option value="holiday">Holiday</option>
                                <option value="project">Project</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none" placeholder="Details about the event..." />
                       </div>
                    </div>
                 )}

                 {modalTab === 'schedule' && (
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                          <input required type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                             <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                             <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                          </div>
                       </div>
                       
                       {/* Conflict Warning */}
                       {hasConflict && (
                          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-3">
                             <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                             <div>
                                <p className="text-xs font-bold text-rose-700">Scheduling Conflict Detected</p>
                                <p className="text-[10px] text-rose-600">Another event exists at this time.</p>
                             </div>
                          </div>
                       )}

                       <div className="pt-2 border-t border-gray-100">
                          <label className="flex items-center gap-3 cursor-pointer">
                             <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isRecurring ? 'bg-primary' : 'bg-gray-200'}`} onClick={() => setIsRecurring(!isRecurring)}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isRecurring ? 'translate-x-4' : ''}`}></div>
                             </div>
                             <span className="text-sm font-bold text-gray-700">Repeat Event</span>
                          </label>
                          
                          {isRecurring && (
                             <div className="mt-3 pl-2 border-l-2 border-primary/20">
                                <select value={recurrenceRule} onChange={e => setRecurrenceRule(e.target.value as RecurrenceType)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none">
                                   <option value="daily">Daily</option>
                                   <option value="weekly">Weekly</option>
                                   <option value="biweekly">Bi-Weekly</option>
                                   <option value="monthly">Monthly</option>
                                </select>
                             </div>
                          )}
                       </div>
                    </div>
                 )}

                 {modalTab === 'rsvp' && (
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                          <div className="relative">
                             <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. Auditorium" />
                             <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                          </div>
                       </div>
                       <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${rsvpReq ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`} onClick={() => setRsvpReq(!rsvpReq)}>
                             {rsvpReq && <Check size={14} />}
                          </div>
                          <div onClick={() => setRsvpReq(!rsvpReq)} className="flex-1">
                             <p className="text-sm font-bold text-gray-800">Require RSVP</p>
                             <p className="text-xs text-gray-500">Parents will be asked to confirm attendance.</p>
                          </div>
                       </label>

                       {/* Mock Materials Upload */}
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Materials</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                             <Download size={24} className="mb-2" />
                             <p className="text-xs font-medium">Attach Files (PDF, Docs)</p>
                          </div>
                       </div>
                    </div>
                 )}
              </form>

              <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                 <button 
                   onClick={handleAddSubmit}
                   className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                 >
                   Create Event
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
