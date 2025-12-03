
import React, { useState, useRef } from 'react';
import { 
  MessageSquareWarning, 
  Search, 
  Plus, 
  Filter, 
  BookOpen, 
  Users, 
  Activity, 
  MessageCircle, 
  Home, 
  User as UserIcon, 
  Lightbulb,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Send,
  Paperclip,
  Star,
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import { 
  FeedbackTicket, 
  FeedbackCategory, 
  FeedbackPriority, 
  User, 
  UserRole, 
  FeedbackComment, 
  FeedbackStatus,
  Child 
} from '../types';

interface FeedbackSystemProps {
  currentUser: User;
  tickets: FeedbackTicket[];
  children?: Child[]; // For parent to select which child
  onAddTicket: (ticket: FeedbackTicket) => void;
  onUpdateStatus: (ticketId: string, status: FeedbackStatus, notes?: string, rating?: number) => void;
  onAddComment: (ticketId: string, comment: FeedbackComment) => void;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  currentUser,
  tickets,
  children = [],
  onAddTicket,
  onUpdateStatus,
  onAddComment
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'resolved' | 'all'>('open');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // --- Derived Data ---
  const myTickets = currentUser.role === UserRole.PARENT
    ? tickets.filter(t => t.parentId === currentUser.id)
    : tickets; // Teachers/Admins see all (or filtered by class in real app)

  const filteredTickets = myTickets.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return t.status === 'pending' || t.status === 'in_progress';
    if (activeTab === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // --- Category Config ---
  const categories: { id: FeedbackCategory; label: string; icon: any; color: string }[] = [
    { id: 'academic', label: 'Academic', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    { id: 'behavior', label: 'Behavior', icon: Users, color: 'bg-purple-100 text-purple-600' },
    { id: 'health_safety', label: 'Health & Safety', icon: Activity, color: 'bg-rose-100 text-rose-600' },
    { id: 'communication', label: 'Communication', icon: MessageCircle, color: 'bg-green-100 text-green-600' },
    { id: 'facilities', label: 'Facilities', icon: Home, color: 'bg-orange-100 text-orange-600' },
    { id: 'teacher', label: 'Teacher', icon: UserIcon, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
  ];

  const getPriorityColor = (p: FeedbackPriority) => {
    switch (p) {
      case 'emergency': return 'bg-rose-600 text-white animate-pulse';
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (s: FeedbackStatus) => {
    switch (s) {
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  // --- New Ticket Form State ---
  const [newCat, setNewCat] = useState<FeedbackCategory>('academic');
  const [newPriority, setNewPriority] = useState<FeedbackPriority>('low');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newChildId, setNewChildId] = useState(children[0]?.id || '');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: FeedbackTicket = {
      id: 'fb_' + Date.now(),
      parentId: currentUser.id,
      parentName: currentUser.name,
      childId: newChildId,
      category: newCat,
      priority: newPriority,
      status: 'pending',
      subject: newSubject,
      description: newDesc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      assignedTo: 'admin' // Default assignment
    };
    onAddTicket(ticket);
    setIsNewTicketModalOpen(false);
    // Reset
    setNewSubject('');
    setNewDesc('');
    setNewPriority('low');
  };

  // --- Comment Logic ---
  const [commentText, setCommentText] = useState('');
  
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    const comment: FeedbackComment = {
      id: 'cm_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: commentText,
      timestamp: new Date().toISOString()
    };
    onAddComment(selectedTicket.id, comment);
    setCommentText('');
  };

  const [rating, setRating] = useState(0);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      
      {/* Sidebar / List View */}
      <div className={`flex flex-col w-full md:w-96 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden ${selectedTicketId ? 'hidden md:flex' : ''}`}>
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <MessageSquareWarning className="text-primary" /> Feedback
             </h2>
             {currentUser.role === UserRole.PARENT && (
                <button 
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <Plus size={20} />
                </button>
             )}
           </div>
           
           <div className="flex bg-gray-200/50 p-1 rounded-xl mb-4">
              {(['open', 'resolved', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
           </div>

           <div className="relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="Search tickets..." 
               className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {filteredTickets.length === 0 ? (
             <div className="p-8 text-center text-gray-400">
               <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
               <p className="text-sm">No tickets found.</p>
             </div>
           ) : (
             filteredTickets.map(ticket => {
               const cat = categories.find(c => c.id === ticket.category);
               const Icon = cat?.icon || AlertTriangle;
               
               return (
                 <div 
                   key={ticket.id}
                   onClick={() => setSelectedTicketId(ticket.id)}
                   className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${selectedTicketId === ticket.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${cat?.color || 'bg-gray-100 text-gray-500'}`}>
                         {cat?.label}
                       </span>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getStatusColor(ticket.status)}`}>
                         {ticket.status.replace('_', ' ')}
                       </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Icon size={14} className="text-gray-400" />
                         <span className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                       </div>
                       {ticket.priority !== 'low' && (
                         <span className={`w-2 h-2 rounded-full ${ticket.priority === 'emergency' || ticket.priority === 'high' ? 'bg-rose-500' : 'bg-orange-400'}`}></span>
                       )}
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>

      {/* Detail View */}
      {selectedTicket ? (
        <div className={`flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden ${selectedTicketId ? 'flex' : 'hidden md:flex'}`}>
           {/* Header */}
           <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
              <div className="flex items-start gap-4">
                 <button onClick={() => setSelectedTicketId(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                   <ChevronLeft size={20} />
                 </button>
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getPriorityColor(selectedTicket.priority)}`}>
                         {selectedTicket.priority} Priority
                       </span>
                       <span className="text-xs text-gray-400">#{selectedTicket.id.slice(-6)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted by <span className="font-bold">{selectedTicket.parentName}</span> on {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                 </div>
              </div>

              {/* Actions for Admin/Teacher */}
              {currentUser.role !== UserRole.PARENT && selectedTicket.status !== 'resolved' && (
                <div className="flex gap-2">
                   <button 
                     onClick={() => onUpdateStatus(selectedTicket.id, 'in_progress')}
                     className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200"
                   >
                     Mark In Progress
                   </button>
                   <button 
                     onClick={() => onUpdateStatus(selectedTicket.id, 'resolved', 'Resolved by staff.')}
                     className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200"
                   >
                     Resolve
                   </button>
                </div>
              )}
           </div>

           {/* Content Area */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Original Description */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                 <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Description</h4>
                 <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Status Update / Resolution Info */}
              {selectedTicket.status === 'resolved' && (
                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-start gap-3">
                   <CheckCircle className="text-green-600 shrink-0" size={20} />
                   <div className="flex-1">
                      <h4 className="font-bold text-green-800 text-sm">Issue Resolved</h4>
                      <p className="text-xs text-green-700 mt-1">{selectedTicket.resolutionNotes || 'No notes provided.'}</p>
                      
                      {/* Rating (Parent View) */}
                      {currentUser.role === UserRole.PARENT && !selectedTicket.resolutionRating && (
                         <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs font-bold text-green-800 mb-2">Rate resolution satisfaction:</p>
                            <div className="flex gap-1">
                               {[1,2,3,4,5].map(r => (
                                 <button key={r} onClick={() => onUpdateStatus(selectedTicket.id, 'resolved', undefined, r)} className="hover:scale-110 transition-transform">
                                   <Star size={20} className="text-green-300 hover:text-green-600 hover:fill-green-600" />
                                 </button>
                               ))}
                            </div>
                         </div>
                      )}
                      {selectedTicket.resolutionRating && (
                         <div className="flex gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < selectedTicket.resolutionRating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                            ))}
                         </div>
                      )}
                   </div>
                </div>
              )}

              {/* Comments Stream */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                 <h4 className="text-xs font-bold text-gray-400 uppercase">Discussion History</h4>
                 {selectedTicket.comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No comments yet.</p>
                 ) : (
                    selectedTicket.comments.map(comment => (
                       <div key={comment.id} className={`flex gap-3 ${comment.authorId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                             comment.authorRole === UserRole.TEACHER ? 'bg-blue-100 text-blue-600' :
                             comment.authorRole === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' :
                             'bg-gray-100 text-gray-600'
                          }`}>
                            {comment.authorName.charAt(0)}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                             comment.authorId === currentUser.id 
                               ? 'bg-primary text-white rounded-tr-none' 
                               : 'bg-gray-100 text-gray-800 rounded-tl-none'
                          }`}>
                             <div className={`flex justify-between items-center mb-1 text-[10px] font-bold opacity-80 uppercase ${
                                comment.authorId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                             }`}>
                                <span>{comment.authorName}</span>
                                <span>{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <p>{comment.content}</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Input Area */}
           {selectedTicket.status !== 'closed' && (
             <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handlePostComment} className="flex gap-2">
                   <input 
                     type="text" 
                     value={commentText}
                     onChange={e => setCommentText(e.target.value)}
                     placeholder="Type a response..."
                     className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                   />
                   <button 
                     type="button" 
                     className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                   >
                     <Paperclip size={20} />
                   </button>
                   <button 
                     type="submit"
                     disabled={!commentText.trim()}
                     className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                   >
                     <Send size={20} />
                   </button>
                </form>
             </div>
           )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 bg-gray-50 rounded-3xl border border-gray-100 items-center justify-center flex-col text-gray-400">
           <MessageSquareWarning size={48} className="mb-4 opacity-20" />
           <p className="font-bold">Select a ticket to view details</p>
        </div>
      )}

      {/* New Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="text-lg font-bold text-gray-800">Submit New Feedback</h3>
                 <button onClick={() => setIsNewTicketModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} className="text-gray-500"/></button>
              </div>

              <form onSubmit={handleSubmitTicket} className="flex-1 overflow-y-auto p-6 space-y-4">
                 {/* Category Grid */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                       {categories.map(cat => (
                         <button
                           key={cat.id}
                           type="button"
                           onClick={() => setNewCat(cat.id)}
                           className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                             newCat === cat.id 
                               ? 'border-primary bg-primary/5 text-primary' 
                               : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                           }`}
                         >
                            <cat.icon size={20} />
                            <span className="text-[10px] font-bold">{cat.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                       <select 
                         value={newPriority}
                         onChange={e => setNewPriority(e.target.value as FeedbackPriority)}
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                       >
                          <option value="low">Low (General)</option>
                          <option value="medium">Medium (Concern)</option>
                          <option value="high">High (Urgent)</option>
                          <option value="emergency">Emergency</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Related Student</label>
                       <select 
                         value={newChildId}
                         onChange={e => setNewChildId(e.target.value)}
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                       >
                          <option value="">General / No Student</option>
                          {children.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Brief summary of the issue"
                      maxLength={50}
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                      placeholder="Please provide details..."
                    />
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-2"
                 >
                   Submit Ticket
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default FeedbackSystem;
