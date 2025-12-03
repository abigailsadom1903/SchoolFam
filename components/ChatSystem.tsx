import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  MoreVertical, 
  Phone, 
  Video, 
  Check, 
  CheckCheck, 
  FileText,
  X,
  Users
} from 'lucide-react';
import { Message, User, UserRole, ChatChannel } from '../types';
import { MOCK_CHANNELS, MOCK_MESSAGES } from '../constants';

interface ChatSystemProps {
  currentUser: User;
  users?: User[]; // Optional list of all users to populate contacts
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, users }) => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock "Upload" State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  // Initialize Channels based on Role
  useEffect(() => {
    // Start with base mock channels
    let userChannels = [...MOCK_CHANNELS];
    
    if (currentUser.role === UserRole.TEACHER) {
      // Mock adding a few more parents for the teacher view demo
      userChannels = [
        ...MOCK_CHANNELS.filter(c => c.type === 'group'),
        { 
          ...MOCK_CHANNELS.find(c => c.type === 'direct')!, 
          id: 'ch_direct_u1_u2',
          name: 'Leo\'s Mom (Sarah)', 
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' 
        },
        { 
           id: 'ch_direct_u3_u2', 
           name: 'Noah\'s Dad (Mike)', 
           type: 'direct', 
           participants: ['u3', 'u2'], 
           unreadCount: 1, 
           avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
           lastMessage: 'Will he need a packed lunch?'
        }
      ];
    } else if (currentUser.role === UserRole.PARENT && users) {
      // DYNAMICALLY ADD ALL TEACHERS FOR PARENTS
      const allTeachers = users.filter(u => u.role === UserRole.TEACHER || u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);
      
      const teacherChannels: ChatChannel[] = allTeachers.map(teacher => {
        // Check if a mock channel already exists for this teacher
        const existing = userChannels.find(c => c.participants.includes(teacher.id) && c.type === 'direct');
        if (existing) return existing;

        return {
          id: `ch_direct_${currentUser.id}_${teacher.id}`,
          name: teacher.name,
          type: 'direct',
          participants: [currentUser.id, teacher.id],
          lastMessage: 'Start a conversation',
          unreadCount: 0,
          avatarUrl: teacher.avatarUrl
        };
      });

      // Filter out duplicates (if any mock channels overlapped) and combine
      const uniqueTeacherChannels = teacherChannels.filter(tc => !userChannels.some(uc => uc.id === tc.id));
      userChannels = [...userChannels, ...uniqueTeacherChannels];
    }
    
    setChannels(userChannels);
    
    // Auto-select first channel if none selected
    if (userChannels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(userChannels[0].id);
    }
  }, [currentUser, users, selectedChannelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannelId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim()) || !selectedChannelId) return;

    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      channelId: selectedChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTimestamp: new Date(),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setIsAttachMenuOpen(false);
  };

  const handleAttachFile = (type: 'image' | 'file') => {
    if (!selectedChannelId) return;
    
    // Mock Attachment Logic
    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      channelId: selectedChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content: type === 'image' ? 'Sent an image' : 'Sent a file',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTimestamp: new Date(),
      isRead: false,
      attachment: type === 'image' ? {
        type: 'image',
        url: 'https://picsum.photos/id/102/400/300'
      } : {
        type: 'file',
        url: '#',
        name: 'Homework_Assignment.pdf',
        size: '1.2 MB'
      }
    };

    setMessages([...messages, newMessage]);
    setIsAttachMenuOpen(false);
  };

  const currentChannel = channels.find(c => c.id === selectedChannelId);
  const channelMessages = messages.filter(m => m.channelId === selectedChannelId);

  // Filter channels by search
  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannelId(channel.id)}
              className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-gray-100 border-b border-gray-50 ${selectedChannelId === channel.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="relative">
                 <img src={channel.avatarUrl} alt={channel.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                 {channel.type === 'group' && (
                   <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                     <div className="bg-orange-400 rounded-full p-1">
                       <Users size={10} className="text-white" />
                     </div>
                   </div>
                 )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold truncate ${selectedChannelId === channel.id ? 'text-primary' : 'text-gray-800'}`}>{channel.name}</h3>
                  {channel.unreadCount ? (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{channel.unreadCount}</span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 truncate font-medium">
                  {channel.lastMessage || (channel.type === 'group' ? 'School Announcement' : 'Click to chat')}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChannelId && currentChannel ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={currentChannel.avatarUrl} className="w-10 h-10 rounded-full" alt={currentChannel.name} />
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {currentChannel.name} 
                    {currentChannel.type === 'group' && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">ANNOUNCEMENT</span>}
                  </h3>
                  <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><Phone size={20} /></button>
                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><Video size={20} /></button>
                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFBF7]">
              {channelMessages.length === 0 ? (
                 <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                    No messages yet. Say hi! 👋
                 </div>
              ) : (
                channelMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      {!isMe && <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full mr-2 mt-1 self-end" />}
                      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Sender Name in Groups */}
                        {currentChannel.type === 'group' && !isMe && (
                          <span className="text-[10px] text-gray-400 ml-1 mb-1">{msg.senderName}</span>
                        )}
                        
                        <div className={`relative rounded-2xl p-3 shadow-sm ${
                          isMe 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}>
                          
                          {/* Attachments */}
                          {msg.attachment && (
                            <div className="mb-2 rounded-lg overflow-hidden">
                              {msg.attachment.type === 'image' ? (
                                <img src={msg.attachment.url} alt="attachment" className="max-w-full h-auto max-h-64 object-cover hover:scale-105 transition-transform cursor-pointer" />
                              ) : (
                                <div className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-white/20' : 'bg-gray-100'}`}>
                                  <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FileText className="text-orange-500" size={20} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm truncate max-w-[150px]">{msg.attachment.name}</p>
                                    <p className="text-[10px] opacity-70">{msg.attachment.size}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-primaryLight' : 'text-gray-400'}`}>
                              <span className="text-[10px] font-medium">{msg.timestamp}</span>
                              {isMe && (
                                msg.isRead 
                                  ? <CheckCheck size={14} className="text-white" />
                                  : <Check size={14} className="opacity-70" />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-end gap-2">
                <div className="relative">
                   <button 
                    onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                    className="p-3 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                   >
                     {isAttachMenuOpen ? <X size={20} /> : <Paperclip size={20} />}
                   </button>
                   
                   {/* Attachment Menu */}
                   {isAttachMenuOpen && (
                     <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[150px] animate-in slide-in-from-bottom-2">
                       <button 
                        onClick={() => handleAttachFile('image')}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 text-left"
                       >
                         <ImageIcon size={16} className="text-blue-500" /> Photo
                       </button>
                       <button 
                        onClick={() => handleAttachFile('file')}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 text-left"
                       >
                         <FileText size={16} className="text-orange-500" /> Document
                       </button>
                     </div>
                   )}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                  <textarea 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="bg-primary text-white p-3 rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-400">Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;