
import React, { useState, useMemo, useRef } from 'react';
import { 
  Camera, 
  Heart, 
  MessageCircle, 
  X, 
  Plus, 
  Calendar, 
  Image as ImageIcon,
  Share2,
  Download,
  MoreHorizontal,
  Upload,
  Send,
  User as UserIcon,
  Users,
  Check
} from 'lucide-react';
import { Activity, UserRole, User, Child } from '../types';

interface MomentsGalleryProps {
  activities: Activity[];
  userRole: UserRole;
  currentUser: User;
  students?: Child[]; // List of students for tagging
  onAddActivity?: (activity: Activity) => void;
}

interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
}

const MomentsGallery: React.FC<MomentsGalleryProps> = ({ activities, userRole, currentUser, students, onAddActivity }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<{ url: string; activity: Activity } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<Activity['type']>('play');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Tagging State (Multi-select)
  const [taggedStudentIds, setTaggedStudentIds] = useState<string[]>(['all']);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interaction State
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({
     // Mock initial comments for demo
     'a1': [
       { id: 'c1', userName: 'Grandma Mary', text: 'Such a lovely smile!', timestamp: '10:30 AM' },
       { id: 'c2', userName: 'Sarah Anderson', text: 'Looks like so much fun!', timestamp: '10:45 AM' }
     ]
  });
  const [commentInput, setCommentInput] = useState('');

  // Permission Check
  const canAddMoments = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isSchoolWide = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Filter students for tagging: Teacher sees class, Admin sees all
  const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className)
    ? students?.filter(s => s.class === currentUser.className)
    : students;

  // Extract all images
  const allMoments = useMemo(() => {
    const moments: { url: string; activity: Activity }[] = [];
    activities.forEach(act => {
      if (act.imageUrls && act.imageUrls.length > 0) {
        act.imageUrls.forEach(url => {
          moments.push({ url, activity: act });
        });
      }
    });
    return moments;
  }, [activities]);

  const filteredMoments = activeFilter === 'all' 
    ? allMoments 
    : allMoments.filter(m => m.activity.type === activeFilter);

  const filters = [
    { id: 'all', label: 'All Moments' },
    { id: 'learning', label: 'Learning' },
    { id: 'play', label: 'Playtime' },
    { id: 'food', label: 'Food' },
    { id: 'event', label: 'Events' },
  ];

  // --- Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStudentTag = (studentId: string) => {
    if (studentId === 'all') {
      setTaggedStudentIds(['all']);
    } else {
      setTaggedStudentIds(prev => {
        let newSelection = prev.filter(id => id !== 'all');
        
        if (newSelection.includes(studentId)) {
          newSelection = newSelection.filter(id => id !== studentId);
        } else {
          newSelection.push(studentId);
        }
        return newSelection;
      });
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddActivity) return;

    // Validate tags
    const finalTags = taggedStudentIds.length === 0 ? ['all'] : taggedStudentIds;

    const newActivity: Activity = {
      id: 'act_' + Date.now(),
      studentIds: finalTags,
      type: newType,
      title: newTitle,
      description: newDesc,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      teacherName: currentUser.name,
      likes: 0,
      imageUrls: [newImageUrl || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000']
    };

    onAddActivity(newActivity);
    setIsUploadModalOpen(false);
    
    // Reset
    setNewTitle('');
    setNewDesc('');
    setNewImageUrl('');
    setNewType('play');
    setTaggedStudentIds(['all']);
  };

  const getLikeCount = (id: string, initial: number) => likes[id] !== undefined ? likes[id] : initial;
  const isLiked = (id: string) => !!userLiked[id];

  const toggleLike = (id: string, initial: number) => {
    const current = getLikeCount(id, initial);
    const liked = isLiked(id);
    
    setLikes(prev => ({ ...prev, [id]: liked ? current - 1 : current + 1 }));
    setUserLiked(prev => ({ ...prev, [id]: !liked }));
  };

  const handlePostComment = (activityId: string) => {
    if (!commentInput.trim()) return;
    
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      text: commentInput,
      timestamp: 'Just now'
    };

    setComments(prev => ({
      ...prev,
      [activityId]: [...(prev[activityId] || []), newComment]
    }));
    setCommentInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="text-primary" /> Classroom Moments
          </h2>
          <p className="text-gray-500 mt-1">
            Capturing the magic of childhood, one photo at a time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeFilter === filter.id 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {canAddMoments && (
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 hover:scale-105"
          >
            <Plus size={20} /> Add Memory
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMoments.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>No photos found for this category yet.</p>
          </div>
        ) : (
          filteredMoments.map((moment, idx) => (
            <div 
              key={`${moment.activity.id}-${idx}`}
              onClick={() => setSelectedImage(moment)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <img 
                src={moment.url} 
                alt={moment.activity.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase mb-1">
                        {moment.activity.type}
                      </span>
                      <h3 className="text-white font-bold text-sm line-clamp-1">{moment.activity.title}</h3>
                      <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {moment.activity.timestamp}
                      </p>
                    </div>
                    <div className="flex gap-2 text-white items-center text-xs font-bold">
                       <Heart size={14} fill="currentColor" /> {getLikeCount(moment.activity.id, moment.activity.likes)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-6xl h-full flex flex-col md:flex-row p-4 gap-4">
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center relative bg-black/50 rounded-2xl overflow-hidden">
               <img 
                 src={selectedImage.url} 
                 className="max-w-full max-h-full object-contain shadow-2xl"
                 alt="Full view"
               />
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-96 bg-white rounded-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
              <div className="flex items-start justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Camera size={20} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Uploaded By</p>
                      <p className="font-bold text-gray-800">{selectedImage.activity.teacherName}</p>
                   </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20}/></button>
              </div>

              <div className="mb-4 shrink-0">
                 <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedImage.activity.title}</h3>
                 <p className="text-gray-600 leading-relaxed text-sm">{selectedImage.activity.description}</p>
              </div>

              <div className="flex gap-2 mb-6 shrink-0">
                 <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase">
                   {selectedImage.activity.type}
                 </span>
                 <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold flex items-center gap-1">
                   <Calendar size={12} /> {selectedImage.activity.timestamp}
                 </span>
              </div>
              
              {/* Comments Area */}
              <div className="flex-1 overflow-y-auto min-h-[100px] mb-4 pr-2 space-y-4 border-t border-gray-100 pt-4 custom-scrollbar">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Comments</h4>
                {(comments[selectedImage.activity.id] || []).length === 0 ? (
                   <div className="text-center py-6 text-gray-400 italic text-sm">
                     No comments yet. Be the first to share the love!
                   </div>
                ) : (
                   (comments[selectedImage.activity.id] || []).map(c => (
                      <div key={c.id} className="flex gap-3 items-start">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                           {c.userAvatar ? <img src={c.userAvatar} className="w-full h-full object-cover"/> : c.userName.charAt(0)}
                         </div>
                         <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 flex-1">
                            <div className="flex justify-between items-start mb-1">
                               <p className="text-xs font-bold text-gray-800">{c.userName}</p>
                               <span className="text-[10px] text-gray-400">{c.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-snug">{c.text}</p>
                         </div>
                      </div>
                   ))
                )}
              </div>

              <div className="mt-auto space-y-3 shrink-0">
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      onKeyDown={e => e.key === 'Enter' && handlePostComment(selectedImage.activity.id)}
                    />
                    <button 
                      onClick={() => handlePostComment(selectedImage.activity.id)}
                      className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      <Send size={18} />
                    </button>
                 </div>

                 <div className="flex gap-3">
                   <button 
                     onClick={() => toggleLike(selectedImage.activity.id, selectedImage.activity.likes)}
                     className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                       isLiked(selectedImage.activity.id) 
                         ? 'bg-rose-50 text-rose-500 border border-rose-100' 
                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     <Heart size={18} fill={isLiked(selectedImage.activity.id) ? "currentColor" : "none"} /> 
                     {isLiked(selectedImage.activity.id) ? 'Liked' : 'Like'} ({getLikeCount(selectedImage.activity.id, selectedImage.activity.likes)})
                   </button>
                   <button className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                     <Share2 size={18} /> Share
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Staff) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Add New Memory</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Science Experiment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as Activity['type'])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="play">Playtime</option>
                    <option value="learning">Learning</option>
                    <option value="event">Event</option>
                    <option value="food">Food</option>
                  </select>
                </div>
                {accessibleStudents && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tag Student(s)</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-left focus:ring-2 focus:ring-primary focus:outline-none flex items-center justify-between text-sm"
                      >
                        <span className="truncate">
                          {taggedStudentIds.includes('all') 
                            ? (isSchoolWide ? 'Entire School' : 'Entire Class')
                            : taggedStudentIds.length === 0 
                              ? 'Select Students' 
                              : `${taggedStudentIds.length} Student${taggedStudentIds.length > 1 ? 's' : ''} Tagged`}
                        </span>
                        <div className="absolute left-3 top-3.5 text-gray-400">
                          <Users size={18} />
                        </div>
                      </button>

                      {isTagDropdownOpen && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          <div 
                            onClick={() => toggleStudentTag('all')}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50"
                          >
                            <span className="text-sm font-bold text-gray-700">{isSchoolWide ? 'Entire School' : 'Entire Class'}</span>
                            {taggedStudentIds.includes('all') && <Check size={16} className="text-primary" />}
                          </div>
                          {accessibleStudents.map(s => (
                            <div 
                              key={s.id}
                              onClick={() => toggleStudentTag(s.id)}
                              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <img src={s.avatarUrl} className="w-6 h-6 rounded-full" />
                                <span className="text-sm text-gray-700">{s.name}</span>
                              </div>
                              {taggedStudentIds.includes(s.id) && <Check size={16} className="text-primary" />}
                            </div>
                          ))}
                        </div>
                      )}
                      {isTagDropdownOpen && (
                        <div className="fixed inset-0 z-0" onClick={() => setIsTagDropdownOpen(false)}></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Photo</label>
                
                {/* Image Preview */}
                {newImageUrl && (
                   <div className="relative mb-3 h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImageUrl('')} 
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                   </div>
                )}

                <div className="flex gap-2">
                   <div className="flex-1 relative">
                     <input 
                       type="text" 
                       value={newImageUrl}
                       onChange={e => setNewImageUrl(e.target.value)}
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                       placeholder="Paste URL..."
                     />
                     <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                   </div>
                   <button 
                     type="button" 
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-xl font-bold flex items-center gap-2 transition-colors"
                   >
                     <Upload size={20} />
                     <span className="hidden sm:inline">Upload</span>
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*"
                     onChange={handleFileSelect}
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Caption</label>
                <textarea 
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="What's happening in this photo?"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  Upload Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MomentsGallery;
