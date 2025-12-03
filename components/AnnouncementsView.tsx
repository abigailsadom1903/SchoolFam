
import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Calendar, User, Plus, Filter, X } from 'lucide-react';
import { Announcement, UserRole } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  userRole: UserRole;
  onAddAnnouncement?: (announcement: Announcement) => void;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements, userRole, onAddAnnouncement }) => {
  const [filter, setFilter] = useState<'all' | 'school' | 'class'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canPost = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // Admins default to school, Teachers default to class (if they prefer, or keep default)
  // Logic: If admin, default to school. If teacher, default to class.
  const [type, setType] = useState<Announcement['type']>(isAdmin ? 'school' : 'class');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');

  const filteredList = announcements.filter(a => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddAnnouncement) return;

    const newAnnouncement: Announcement = {
      id: 'ann_' + Date.now(),
      title,
      content,
      type: priority === 'high' && type !== 'emergency' ? 'emergency' : type, // Simple logic override for high priority
      priority,
      author: userRole === UserRole.SUPER_ADMIN ? 'Administration' : 'Staff', // Mock author
      date: 'Just Now'
    };

    onAddAnnouncement(newAnnouncement);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setType(isAdmin ? 'school' : 'class'); // Reset to default
    setPriority('normal');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="text-primary" /> Announcements
          </h2>
          <p className="text-gray-500 mt-1">Updates, news, and alerts from the school.</p>
        </div>
        <div className="flex gap-3">
           {canPost && (
             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
             >
               <Plus size={16} /> Post Update
             </button>
           )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        {(['all', 'school', 'class'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredList.map((announcement) => {
          const isUrgent = announcement.type === 'emergency';
          
          return (
            <div 
              key={announcement.id} 
              className={`rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.01] ${
                isUrgent 
                  ? 'bg-rose-50 border-rose-200 shadow-lg shadow-rose-100/50 ring-2 ring-rose-100' 
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform ${
                  isUrgent 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-300' 
                    : announcement.type === 'school' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-emerald-500 text-white'
                }`}>
                  {isUrgent ? <AlertTriangle size={28} /> : 
                   announcement.type === 'school' ? <Megaphone size={28} /> : <User size={28} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                     <h3 className={`text-lg font-bold ${
                       isUrgent ? 'text-rose-800' : 'text-gray-800'
                     }`}>
                       {announcement.title}
                     </h3>
                     <div className="flex items-center gap-3 text-xs font-medium opacity-70">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                          <User size={12}/> {announcement.author}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                          <Calendar size={12}/> {announcement.date}
                        </span>
                     </div>
                  </div>
                  <p className={`leading-relaxed ${
                    isUrgent ? 'text-rose-900 font-medium' : 'text-gray-600'
                  }`}>
                    {announcement.content}
                  </p>
                  {isUrgent && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full animate-bounce">
                      <AlertTriangle size={14} />
                      Urgent Priority
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Post Announcement</h3>
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
                  placeholder="e.g. School Picnic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Audience</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as Announcement['type'])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {!isAdmin && <option value="class">My Class Only</option>}
                    <option value="school">Entire School</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as 'normal' | 'high')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content</label>
                <textarea 
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Announcement details..."
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsView;
