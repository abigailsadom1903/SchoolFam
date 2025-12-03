
import React, { useState } from 'react';
import { Heart, MessageSquare, Clock, Utensils, BookOpen, Gamepad2, Moon, Stethoscope, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Activity, UserRole } from '../types';

interface DailyFeedProps {
  activities: Activity[];
  userRole: UserRole;
  onAddActivity?: (activity: Activity) => void;
  onDeleteActivity?: (id: string) => void;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'food': return <Utensils size={18} className="text-green-600" />;
    case 'learning': return <BookOpen size={18} className="text-blue-600" />;
    case 'play': return <Gamepad2 size={18} className="text-purple-600" />;
    case 'nap': return <Moon size={18} className="text-indigo-400" />;
    case 'health': return <Stethoscope size={18} className="text-red-500" />;
    default: return <BookOpen size={18} />;
  }
};

const ActivityCard: React.FC<{ activity: Activity; userRole: UserRole; onDelete?: (id: string) => void }> = ({ activity, userRole, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(activity.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md group relative">
      {userRole === UserRole.TEACHER && onDelete && (
        <button 
          onClick={() => onDelete(activity.id)}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-gray-100 z-10"
        >
          <Trash2 size={16} />
        </button>
      )}
      
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-gray-50 border border-gray-100`}>
            {getActivityIcon(activity.type)}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{activity.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>{activity.timestamp}</span>
              <span>•</span>
              <span>{activity.teacherName}</span>
            </div>
          </div>
        </div>
        {/* Role badge or just type badge */}
        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
          userRole === UserRole.TEACHER ? 'mr-8' : '' 
        } bg-gray-100 text-gray-500`}>
          {activity.type}
        </span>
      </div>

      <div className="px-4 pb-3">
        <p className="text-gray-600 leading-relaxed">{activity.description}</p>
      </div>

      {activity.imageUrls && activity.imageUrls.length > 0 && (
        <div className={`grid ${activity.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 bg-gray-50`}>
          {activity.imageUrls.map((url, idx) => (
            <img 
              key={idx} 
              src={url} 
              alt={`Activity ${idx}`} 
              className="w-full h-64 object-cover hover:opacity-95 transition-opacity cursor-pointer"
            />
          ))}
        </div>
      )}

      <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <button 
          onClick={toggleLike}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          {likesCount} Likes
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <MessageSquare size={18} />
          Comment
        </button>
      </div>
    </div>
  );
};

const DailyFeed: React.FC<DailyFeedProps> = ({ activities, userRole, onAddActivity, onDeleteActivity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Activity['type']>('learning');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddActivity) return;

    const newActivity: Activity = {
      id: 'act_' + Date.now(),
      studentIds: ['all'], // Default to class-wide when posting from Feed
      teacherName: 'Mrs. Davis',
      title,
      type,
      description,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      likes: 0,
      imageUrls: imageUrl ? [imageUrl] : []
    };

    onAddActivity(newActivity);
    setIsModalOpen(false);
    
    // Reset
    setTitle('');
    setDescription('');
    setImageUrl('');
    setType('learning');
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-bold text-gray-800">Today's Timeline</h2>
        {userRole === UserRole.TEACHER && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> New Post
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
           <div className="text-center p-8 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
             <p>No activities recorded yet today.</p>
           </div>
        ) : (
          activities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              userRole={userRole}
              onDelete={onDeleteActivity}
            />
          ))
        )}
      </div>

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Post Activity</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Activity Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as Activity['type'])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                  >
                    <option value="learning">Learning</option>
                    <option value="play">Play</option>
                    <option value="food">Food</option>
                    <option value="nap">Nap</option>
                    <option value="health">Health</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="What did the class do today?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Photo URL (Optional)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="https://..."
                  />
                  <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  Post Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyFeed;
